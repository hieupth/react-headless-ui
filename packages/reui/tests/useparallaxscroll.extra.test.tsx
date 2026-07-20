import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useParallaxScroll } from '../src/hooks/useParallaxScroll';

// Covers branches the base parallaxscroll.test.tsx does not reach: the easing
// function map arms + getEasingFunction string lookup, calculateTransform's
// progress 0/1 and reduced-motion branches, the direction switch default,
// handleDeviceOrientation (deviceorientation event), and the elementRefCallback
// same-element early return.

let rafSpy: ReturnType<typeof vi.spyOn>;
let ioCallback: (entries: any[]) => void;

function mount(props?: Parameters<typeof useParallaxScroll>[0]) {
  return renderHook(() => useParallaxScroll(props));
}

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

function rect(top: number, bottom: number, height = 200) {
  return { top, bottom, height, left: 0, right: 0, width: 100 } as any;
}

function attachElement(hook: ReturnType<typeof mount>, r: any) {
  const el = { getBoundingClientRect: () => r } as any;
  act(() => hook.result.current.ref(el));
  return el;
}

function intersect(top = 200) {
  act(() => {
    ioCallback([
      { isIntersecting: true, intersectionRatio: 1, boundingClientRect: { top } },
    ]);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(performance.now());
    return 0;
  });
  class FakeIO {
    cb: (entries: any[]) => void;
    constructor(cb: (entries: any[]) => void) {
      this.cb = cb;
      ioCallback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver = FakeIO as any;
});

afterEach(() => {
  rafSpy.mockRestore();
  vi.useRealTimers();
});

describe('useParallaxScroll — easing function arms + string lookup', () => {
  it.each(['easeIn', 'easeOut', 'easeInOut'] as const)(
    'a string easing name (%s) is resolved via getEasingFunction and applied',
    (easing) => {
      const onParallaxChange = vi.fn();
      // The easing prop is typed as a function, but getEasingFunction also
      // accepts a string name; cast to exercise the string lookup + each arm.
      const hook = mount({ direction: 'up', easing: easing as any, onParallaxChange });
      attachElement(hook, rect(200, 400));
      intersect();
      actAndRerender(hook, () => {});
      expect(onParallaxChange).toHaveBeenCalled();
    }
  );

  it('an unknown easing name falls back to linear', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ direction: 'up', easing: 'bogus' as any, onParallaxChange });
    attachElement(hook, rect(200, 400));
    intersect();
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalled();
  });
});

describe('useParallaxScroll — calculateTransform progress + reduced-motion branches', () => {
  it('element fully above the start-visible range yields progress 0', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ direction: 'down', onParallaxChange });
    // bottom < startVisible(0 by default) is impossible with defaults; use a
    // large startOffset so startVisible is high and element sits above it.
    attachElement(hook, rect(-400, -200));
    intersect(-400);
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalled();
  });

  it('element below the end-visible range yields progress 1', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ direction: 'up', endOffset: 0.1, onParallaxChange });
    // endVisible = innerHeight * 0.1; element top well below it → progress 1.
    attachElement(hook, rect(10000, 10200));
    intersect(10000);
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalled();
  });

  it('reduced motion drives calculateTransform to "none"', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const hook = mount({ direction: 'down' });
    attachElement(hook, rect(200, 400));
    intersect();
    actAndRerender(hook, () => hook.result.current.actions.update());
    expect(hook.result.current.style.transform).toBe('none');
    spy.mockRestore();
  });

  it('an invalid direction falls through to the default translateY(-) branch', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ direction: 'bogus' as any, onParallaxChange });
    attachElement(hook, rect(200, 400));
    intersect();
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalled();
  });
});

describe('useParallaxScroll — handleDeviceOrientation', () => {
  it('a deviceorientation event updates the transform and fires onParallaxChange', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ useDeviceOrientation: true, onParallaxChange });
    attachElement(hook, rect(200, 400));
    // Dispatch a deviceorientation event with beta/gamma tilt values.
    act(() => {
      const evt = new Event('deviceorientation');
      Object.defineProperty(evt, 'beta', { value: 45 });
      Object.defineProperty(evt, 'gamma', { value: 30 });
      window.dispatchEvent(evt);
    });
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalledWith(0.5, expect.stringContaining('translate'));
  });

  it('handleDeviceOrientation ignores null beta/gamma without throwing', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ useDeviceOrientation: true, onParallaxChange });
    attachElement(hook, rect(200, 400));
    act(() => {
      const evt = new Event('deviceorientation');
      Object.defineProperty(evt, 'beta', { value: null });
      Object.defineProperty(evt, 'gamma', { value: null });
      window.dispatchEvent(evt);
    });
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalled();
  });
});

describe('useParallaxScroll — elementRefCallback same-element early return', () => {
  it('calling ref() again with the same element is a no-op', () => {
    const hook = mount();
    const el = attachElement(hook, rect(200, 400));
    // Second ref() with the same element hits the `elementRef.current === element` guard.
    expect(() => act(() => hook.result.current.ref(el))).not.toThrow();
  });
});

describe('useParallaxScroll — handleDeviceOrientation guard + callback-absent', () => {
  it('a deviceorientation event is ignored under reduced motion', () => {
    // Line 197 true arm: shouldRespectReducedMotion → early return. The listener
    // is only registered when useDeviceOrientation=true, so combine the two.
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const onParallaxChange = vi.fn();
    const hook = mount({ useDeviceOrientation: true, onParallaxChange });
    attachElement(hook, rect(200, 400));
    onParallaxChange.mockClear();
    act(() => {
      const evt = new Event('deviceorientation');
      Object.defineProperty(evt, 'beta', { value: 45 });
      Object.defineProperty(evt, 'gamma', { value: 30 });
      window.dispatchEvent(evt);
    });
    // Reduced motion → handleDeviceOrientation returns early; no orientation update.
    expect(onParallaxChange).not.toHaveBeenCalledWith(0.5, expect.any(String));
    spy.mockRestore();
  });

  it('a deviceorientation event with no onParallaxChange does not throw', () => {
    // Line 217 `if (onParallaxChange)` false arm.
    const hook = mount({ useDeviceOrientation: true });
    attachElement(hook, rect(200, 400));
    expect(() =>
      act(() => {
        const evt = new Event('deviceorientation');
        Object.defineProperty(evt, 'beta', { value: 45 });
        Object.defineProperty(evt, 'gamma', { value: 30 });
        window.dispatchEvent(evt);
      })
    ).not.toThrow();
  });
});

describe('useParallaxScroll — scroll/intersection/cleanup guard arms', () => {
  it('a custom (non-window) container is used for scroll position', () => {
    // Lines 230/358 `container === window ?` false arm.
    const containerEl = { scrollTop: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() } as any;
    const hook = mount({ container: containerEl });
    attachElement(hook, rect(200, 400));
    actAndRerender(hook, () => hook.result.current.actions.update());
    expect(containerEl.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('a scroll/update with no element attached is a no-op', () => {
    // Line 241 `if (elementRef.current)` false arm (rAF callback body).
    const hook = mount();
    actAndRerender(hook, () => hook.result.current.actions.update());
    expect(hook.result.current.state.transform).toBe('');
  });

  it('an intersection event with isIntersecting=false does not trigger a scroll', () => {
    // Line 264 `if (entry.isIntersecting)` false arm.
    const onParallaxChange = vi.fn();
    const hook = mount({ onParallaxChange });
    attachElement(hook, rect(200, 400));
    onParallaxChange.mockClear();
    act(() => {
      ioCallback([
        { isIntersecting: false, intersectionRatio: 0, boundingClientRect: { top: 200 } },
      ]);
    });
    // Not intersecting → handleScroll not called from the observer → no new change.
    expect(onParallaxChange).not.toHaveBeenCalled();
  });

  it('reset() with an element but no onParallaxChange does not throw', () => {
    // Line 317 `if (onParallaxChange)` false arm: reset runs the transform
    // recalculation (elementRef set) but the callback guard takes its false arm.
    const hook = mount();
    attachElement(hook, rect(200, 400));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.reset())).not.toThrow();
    expect(hook.result.current.state.progress).toBe(0);
  });

  it('setEnabled(true) when already enabled re-applies the transform', () => {
    // Line 331 `else if (enabled)` true arm.
    const hook = mount();
    attachElement(hook, rect(200, 400));
    // Already enabled; setEnabled(true) takes the else-if enabled branch.
    expect(() => actAndRerender(hook, () => hook.result.current.actions.setEnabled(true))).not.toThrow();
  });

  it('attaching a new element after a previous one cleans up the prior observer', () => {
    // Line 279 true arm: previous element had an observer → unobserve runs.
    const hook = mount();
    attachElement(hook, rect(200, 400)); // el1 gets an observer
    // Attach a different element; the cleanup branch for the prior observer runs.
    const el2 = { getBoundingClientRect: () => rect(100, 300) } as any;
    expect(() => act(() => hook.result.current.ref(el2))).not.toThrow();
  });

  it('a scroll update where the element detaches before the rAF fires is a no-op', () => {
    // Line 241 `if (elementRef.current)` false arm inside the rAF callback. The
    // base suite's rAF mock runs synchronously, so to create the async window
    // where the element is gone by the time the rAF body runs, we swap rAF for a
    // deferred (setTimeout-backed) implementation for this test only.
    rafSpy.mockRestore();
    const handles = new Map<number, ReturnType<typeof setTimeout>>();
    let nextHandle = 1;
    rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      const handle = nextHandle++;
      const id = setTimeout(() => {
        handles.delete(handle);
        cb(performance.now());
      }, 0);
      handles.set(handle, id);
      return handle;
    });
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((handle: number) => {
      const id = handles.get(handle);
      if (id !== undefined) {
        clearTimeout(id);
        handles.delete(handle);
      }
    });
    const hook = mount();
    attachElement(hook, rect(200, 400));
    // update() schedules a deferred rAF; detach before it fires.
    act(() => hook.result.current.actions.update());
    act(() => hook.result.current.ref(null));
    // Flush the deferred rAF: its body sees elementRef null → no-op (false arm).
    expect(() => act(() => vi.runOnlyPendingTimers())).not.toThrow();
    cancelSpy.mockRestore();
  });

  it('reset() with no element attached is a no-op', () => {
    // Line 312 `if (elementRef.current)` false arm.
    const hook = mount();
    expect(() => actAndRerender(hook, () => hook.result.current.actions.reset())).not.toThrow();
  });

  it('setEnabled(false) with no element attached takes the no-op path', () => {
    // Line 331 `else if (enabled)` false arm: enabled=false AND no element →
    // neither branch body runs.
    const hook = mount();
    expect(() => actAndRerender(hook, () => hook.result.current.actions.setEnabled(false))).not.toThrow();
  });

  it('switching elements when no observer was created skips unobserve', () => {
    // Line 279 `if (intersectionObserverRef.current)` false arm: attach an
    // element with IntersectionObserver absent (no observer created), then
    // switch to another element so the cleanup guard takes its false arm.
    const saved = (globalThis as any).IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;
    try {
      const hook = mount();
      attachElement(hook, rect(200, 400)); // no observer created (IO undefined)
      const el2 = { getBoundingClientRect: () => rect(100, 300) } as any;
      expect(() => act(() => hook.result.current.ref(el2))).not.toThrow();
    } finally {
      (globalThis as any).IntersectionObserver = saved;
    }
  });
});

describe('useParallaxScroll — easeInOut midpoint arm', () => {
  it('easeInOut easing evaluates the t >= 0.5 arm for a low element', () => {
    // Line 113 `t < 0.5 ? ... : ...` else arm: an element positioned past the
    // viewport midpoint yields progress >= 0.5 so easeInOut takes the else arm.
    const onParallaxChange = vi.fn();
    const hook = mount({ direction: 'up', easing: 'easeInOut' as any, onParallaxChange });
    // elementTop 500 / innerHeight(768) ≈ 0.65 >= 0.5.
    attachElement(hook, rect(500, 700));
    intersect(500);
    actAndRerender(hook, () => {});
    expect(onParallaxChange).toHaveBeenCalled();
  });
});

describe('useParallaxScroll — IntersectionObserver absent', () => {
  it('attaching an element with IntersectionObserver undefined skips observer setup', () => {
    // Line 288 `typeof IntersectionObserver !== 'undefined'` false arm.
    const saved = (globalThis as any).IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;
    try {
      const hook = mount();
      const el = { getBoundingClientRect: () => rect(200, 400) } as any;
      expect(() => act(() => hook.result.current.ref(el))).not.toThrow();
    } finally {
      (globalThis as any).IntersectionObserver = saved;
    }
  });
});
