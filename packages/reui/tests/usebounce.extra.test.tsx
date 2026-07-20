import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBounce } from '../src/hooks/useBounce';

// useBounce mirrors useFlip's ref-driven setTimeout + requestAnimationFrame loop.
// This suite covers the branches the base bounce.test.tsx cannot reach because
// its Date.now() never advances inside the rAF callback: the resume-from-
// midpoint inner completion path, the reduced-motion short-circuit, start()
// clearing pending timers/frames, and the rAF/timer callback guard false-arms.

let nowMs: number;
let rafSpy: ReturnType<typeof vi.spyOn>;

function mount(props?: Parameters<typeof useBounce>[0]) {
  return renderHook(() => useBounce(props));
}

function flush(frames = 10) {
  for (let i = 0; i < frames; i++) {
    act(() => {
      nowMs += 250;
      vi.runOnlyPendingTimers();
    });
  }
}

function enableReducedMotion() {
  return vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

function setup() {
  vi.useFakeTimers();
  nowMs = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => nowMs);
  const handles = new Map<number, ReturnType<typeof setTimeout>>();
  let nextHandle = 1;
  rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    nowMs += 200;
    const handle = nextHandle++;
    const id = setTimeout(() => {
      handles.delete(handle);
      cb(nowMs);
    }, 0);
    handles.set(handle, id);
    return handle;
  });
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((handle: number) => {
    const id = handles.get(handle);
    if (id !== undefined) {
      clearTimeout(id);
      handles.delete(handle);
    }
  });
}

function teardown() {
  rafSpy.mockRestore();
  vi.mocked(Date.now).mockRestore();
  vi.useRealTimers();
}

describe('useBounce — reduced-motion short-circuit', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('executeAnimation jumps straight to complete and fires onAnimationComplete', () => {
    const spy = enableReducedMotion();
    const onAnimationComplete = vi.fn();
    const onAnimationStart = vi.fn();
    const h = mount({ onAnimationComplete, onAnimationStart, repeat: 2 });
    act(() => h.result.current.actions.start());
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
    expect(h.result.current.state.isActive).toBe(false);
    expect(onAnimationComplete).toHaveBeenCalledTimes(1);
    expect(onAnimationStart).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('reduced-motion executeAnimation without onAnimationComplete does not throw', () => {
    // Covers the false arm of `if (onAnimationComplete)` in the reduced branch.
    const spy = enableReducedMotion();
    const h = mount({ repeat: 2 });
    act(() => h.result.current.actions.start());
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
    spy.mockRestore();
  });

  it('reduced-motion path drives style.transform to "translate(0, 0)"', () => {
    const spy = enableReducedMotion();
    const h = mount();
    expect(h.result.current.style.transform).toBe('translate(0, 0)');
    spy.mockRestore();
  });

  it('resume() is inert under reduced motion (no rAF scheduled)', () => {
    const spy = enableReducedMotion();
    const h = mount({ initialActive: true });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    expect(rafSpy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('useBounce — resume-from-midpoint inner completion path', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('resuming a paused finite animation fires onRepeat + onAnimationComplete', () => {
    const onAnimationComplete = vi.fn();
    const onRepeat = vi.fn();
    const h = mount({ duration: 1000, repeat: 1, onAnimationComplete, onRepeat });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 50;
      vi.runOnlyPendingTimers();
    });
    act(() => h.result.current.actions.resume());
    flush(20);
    expect(onRepeat).toHaveBeenCalled();
    expect(onAnimationComplete).toHaveBeenCalled();
  });

  it('resuming with cycles remaining schedules the next cycle (repeat branch)', () => {
    const onRepeat = vi.fn();
    const h = mount({ duration: 1000, repeat: 2, onRepeat });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 50;
      vi.runOnlyPendingTimers();
    });
    act(() => h.result.current.actions.resume());
    flush(25);
    expect(onRepeat).toHaveBeenCalled();
  });
});

describe('useBounce — start() clears pending timers/frames', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('calling start() again while a delayed start is pending clears the prior timer', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ delay: 500, onAnimationStart });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.start());
    flush(20);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() cancels a pending animation frame when called while paused mid-flight', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ duration: 400, repeat: 0, onAnimationStart });
    act(() => h.result.current.actions.start());
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(2);
  });

  it('stop() and reset() with no animation ever started (no pending frame/timeout)', () => {
    const h = mount({});
    act(() => h.result.current.actions.stop());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('stop() and reset() clear a pending delayed-start timeout', () => {
    // start() with delay sets timeoutRef; stop()/reset() clear it (true arm).
    const h = mount({ delay: 500 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.stop());
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isActive).toBe(false);
  });
});

describe('useBounce — rAF/timer callback guard false-arms', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('a main-loop frame that fires while paused returns without rescheduling', () => {
    const h = mount({ duration: 400, repeat: 0 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    h.rerender();
    expect(h.result.current.state.isPaused).toBe(true);
  });

  it('the inter-cycle delay does not reschedule when paused mid-gap (repeat path)', () => {
    let repeatFires = 0;
    const h = mount({ duration: 200, repeat: 0, onRepeat: () => repeatFires++ });
    act(() => h.result.current.actions.start());
    act(() => {
      nowMs += 250;
      vi.runOnlyPendingTimers();
    });
    const beforeGap = repeatFires;
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 300;
      vi.runOnlyPendingTimers();
    });
    expect(repeatFires).toBe(beforeGap);
  });

  it('the resume inter-cycle delay does not reschedule when paused mid-gap (resume path)', () => {
    let repeatFires = 0;
    const h = mount({ duration: 1000, repeat: 2, onRepeat: () => repeatFires++ });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    act(() => h.result.current.actions.resume());
    act(() => {
      nowMs += 2500;
      vi.runOnlyPendingTimers();
    });
    const beforeGap = repeatFires;
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 300;
      vi.runOnlyPendingTimers();
    });
    expect(repeatFires).toBe(beforeGap);
  });

  it('finite completion with no onRepeat callback fires the absent-callback arm', () => {
    const onComplete = vi.fn();
    const h = mount({ duration: 1000, repeat: 1, onAnimationComplete: onComplete });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    act(() => h.result.current.actions.resume());
    flush(20);
    expect(onComplete).toHaveBeenCalled();
  });

  it('resume() with elapsed already past duration skips the continue block', () => {
    const h = mount({ duration: 100, repeat: 1 });
    act(() => h.result.current.actions.start());
    act(() => {
      nowMs += 5000;
    });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    flush(5);
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
  });
});

describe('useBounce — bounceCurve + direction branches', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('an invalid direction falls through to the default translateY branch', () => {
    const h = mount({ direction: 'bogus' as any });
    expect(h.result.current.style.transform).toMatch(/translateY/);
  });

  it('bounceCurve evaluates the t >= 0.5 arm mid-animation', () => {
    // After ~60% progress, bounceCurve(0.6) takes the else arm; a re-render
    // reads calculateTransform(currentPositionRef) which crosses t >= 0.5.
    const h = mount({ duration: 1000, direction: 'down' });
    act(() => h.result.current.actions.start());
    // Advance ~600ms of animation time so currentPosition ~0.6 (t >= 0.5).
    act(() => {
      nowMs += 650;
      vi.runOnlyPendingTimers();
    });
    h.rerender();
    expect(h.result.current.style.transform).toMatch(/translateY/);
  });
});
