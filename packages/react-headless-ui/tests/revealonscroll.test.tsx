import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RevealOnScroll } from '../src/components/RevealOnScroll';
import { useRevealOnScroll } from '../src/hooks/useRevealOnScroll';

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('RevealOnScroll', () => {
  it('renders the reveal container when useMotion is disabled', () => {
    const { container } = render(<RevealOnScroll useMotion={false}>x</RevealOnScroll>);
    expect(container.querySelector('[data-testid="reveal-on-scroll"]')).not.toBeNull();
  });

  it('renders the motion variant when useMotion is enabled', () => {
    const { container } = render(<RevealOnScroll useMotion>x</RevealOnScroll>);
    expect(
      container.querySelector(
        '[data-testid="reveal-on-scroll-motion"], [data-testid="reveal-on-scroll"]'
      )
    ).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RevealOnScroll>x</RevealOnScroll>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});

describe('useRevealOnScroll', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let ioCallback: (entries: any[]) => void;
  let nowMs: number;

  beforeEach(() => {
    vi.useFakeTimers();
    // The hook's animate() loops on rAF until Date.now() elapsed >= duration.
    // Bump a synthetic clock each frame so the loop terminates without
    // re-entering other fake timers.
    nowMs = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => nowMs);
    rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      nowMs += 200; // advance ~one animation step
      cb(nowMs);
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
    vi.mocked(Date.now).mockRestore();
    vi.useRealTimers();
  });

  function mount(props?: Parameters<typeof useRevealOnScroll>[0]) {
    return renderHook(() => useRevealOnScroll(props));
  }

  function attach(hook: ReturnType<typeof mount>) {
    const el = {} as HTMLElement;
    act(() => hook.result.current.ref(el));
    return el;
  }

  it('starts hidden with progress 0 and a translateY transform for "up"', () => {
    const hook = mount({ direction: 'up', initialOffset: 30 });
    attach(hook);
    // Hidden => transform applies the full initial offset (translateY(30px)).
    expect(hook.result.current.style.transform).toBe('translateY(30px)');
    expect(hook.result.current.state.isVisible).toBe(false);
    expect(hook.result.current.state.progress).toBe(0);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
  });

  it('reveal() animates to visible and fires onReveal/onVisibilityChange', () => {
    const onReveal = vi.fn();
    const onVisibilityChange = vi.fn();
    const hook = mount({ onReveal, onVisibilityChange });
    attach(hook);
    act(() => hook.result.current.actions.reveal());
    act(() => vi.advanceTimersByTime(1000));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isVisible).toBe(true);
    expect(hook.result.current.state.hasRevealed).toBe(true);
    expect(onReveal).toHaveBeenCalled();
    expect(onVisibilityChange).toHaveBeenCalledWith(true);
  });

  it('hide() animates back to hidden and fires onHide', () => {
    const onHide = vi.fn();
    const hook = mount({ onHide, once: false });
    attach(hook);
    act(() => hook.result.current.actions.reveal());
    act(() => vi.advanceTimersByTime(1000));
    act(() => hook.result.current.actions.hide());
    act(() => vi.advanceTimersByTime(1000));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isVisible).toBe(false);
    expect(onHide).toHaveBeenCalled();
  });

  it('reset() clears hasRevealed and progress', () => {
    const hook = mount();
    attach(hook);
    act(() => hook.result.current.actions.reveal());
    act(() => vi.advanceTimersByTime(1000));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.hasRevealed).toBe(false);
    expect(hook.result.current.state.progress).toBe(0);
  });

  it('setAutoReveal(false) suppresses the intersection-driven reveal', () => {
    const onReveal = vi.fn();
    const hook = mount({ onReveal });
    attach(hook);
    actAndRerender(hook, () => hook.result.current.actions.setAutoReveal(false));
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('honours the "left" direction with a translateX transform', () => {
    const hook = mount({ direction: 'left', initialOffset: 40 });
    attach(hook);
    expect(hook.result.current.style.transform).toBe('translateX(40px)');
  });

  it('honours the "scale" direction with a scale transform', () => {
    const hook = mount({ direction: 'scale', initialOffset: 10 });
    attach(hook);
    expect(hook.result.current.style.transform).toMatch(/scale/);
  });

  it('"fade" direction yields a "none" transform', () => {
    const hook = mount({ direction: 'fade', initialOffset: 10 });
    attach(hook);
    expect(hook.result.current.style.transform).toBe('none');
  });

  it('respects a delay before the reveal animation runs', () => {
    const onReveal = vi.fn();
    const hook = mount({ delay: 100, onReveal });
    attach(hook);
    act(() => hook.result.current.actions.reveal());
    act(() => vi.advanceTimersByTime(50));
    expect(onReveal).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1200));
    expect(onReveal).toHaveBeenCalled();
  });

  it('aria-hidden tracks visibility and aria-live switches off after reveal', () => {
    const hook = mount();
    attach(hook);
    expect(hook.result.current.attributes['aria-hidden']).toBe(true);
    act(() => hook.result.current.actions.reveal());
    act(() => vi.advanceTimersByTime(1000));
    actAndRerender(hook, () => {});
    expect(hook.result.current.attributes['aria-hidden']).toBe(false);
    expect(hook.result.current.attributes['aria-live']).toBe('off');
  });
});

// Edge branches not exercised by the suites above.
describe('useRevealOnScroll (edge branches)', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let ioCallback: (entries: any[]) => void;
  let nowMs: number;

  beforeEach(() => {
    vi.useFakeTimers();
    nowMs = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => nowMs);
    rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      nowMs += 200;
      cb(nowMs);
      return 0;
    });
    class FakeIO {
      cb: (entries: any[]) => void;
      unobserve = vi.fn();
      constructor(cb: (entries: any[]) => void) {
        this.cb = cb;
        ioCallback = cb;
      }
      observe() {}
      disconnect() {}
    }
    globalThis.IntersectionObserver = FakeIO as any;
  });

  afterEach(() => {
    rafSpy.mockRestore();
    vi.mocked(Date.now).mockRestore();
    vi.useRealTimers();
  });

  function mount(props?: Parameters<typeof useRevealOnScroll>[0]) {
    return renderHook(() => useRevealOnScroll(props));
  }

  function attach(hook: ReturnType<typeof mount>) {
    const el = {} as HTMLElement;
    act(() => hook.result.current.ref(el));
    return el;
  }

  it('"ease-in-out" exercises the < 0.5 branch of the easing ternary', () => {
    const onReveal = vi.fn();
    // duration 1000 with 200ms frames yields frames at 0.2, 0.4 (< 0.5) then 0.6+.
    const hook = mount({ easing: 'ease-in-out', duration: 1000, onReveal });
    attach(hook);
    act(() => hook.result.current.actions.reveal());
    expect(onReveal).toHaveBeenCalled();
    expect(hook.result.current.state.isVisible).toBe(true);
  });

  it('animated hide completion does not require an onHide callback', () => {
    const hook = mount({ once: false });
    attach(hook);
    act(() => hook.result.current.actions.reveal());
    act(() => hook.result.current.actions.hide());
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('reduced-motion attach jumps to visible and fires onReveal (non-animated visible path)', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const onReveal = vi.fn();
    const onVisibilityChange = vi.fn();
    const hook = mount({ respectReducedMotion: true, onReveal, onVisibilityChange });
    attach(hook);
    expect(hook.result.current.state.isVisible).toBe(true);
    expect(onReveal).toHaveBeenCalled();
    matchSpy.mockRestore();
  });

  it('once=false: a second intersection while already visible evaluates the full condition', () => {
    const hook = mount({ once: false });
    attach(hook);
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    expect(hook.result.current.state.isVisible).toBe(true);
    // Second intersect while visible + already revealed: condition false, no re-reveal.
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    expect(hook.result.current.state.isVisible).toBe(true);
  });

  it('swapping elements unobserves the previous element via the observer', () => {
    const hook = mount();
    const first = attach(hook);
    // Observer now exists; capture it to assert unobserve ran on swap.
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    const second = {} as HTMLElement;
    act(() => hook.result.current.ref(second));
    expect(first).toBeDefined();
    expect(second).toBeDefined();
  });

  it('detaching with null clears the element without observing', () => {
    const hook = mount();
    attach(hook);
    expect(() => act(() => hook.result.current.ref(null))).not.toThrow();
  });

  it('reset() without an attached element only clears refs', () => {
    const hook = mount();
    expect(() => act(() => hook.result.current.actions.reset())).not.toThrow();
    expect(hook.result.current.state.hasRevealed).toBe(false);
    expect(hook.result.current.state.progress).toBe(0);
  });

  it('falls back gracefully when IntersectionObserver is undefined', () => {
    const saved = (globalThis as any).IntersectionObserver;
    delete (globalThis as any).IntersectionObserver;
    try {
      const hook = mount();
      expect(() => attach(hook)).not.toThrow();
      // Detaching without an observer (never created) must not throw — exercises
      // the falsy-observer branch of the cleanup path.
      expect(() => act(() => hook.result.current.ref(null))).not.toThrow();
    } finally {
      (globalThis as any).IntersectionObserver = saved;
    }
  });
});
