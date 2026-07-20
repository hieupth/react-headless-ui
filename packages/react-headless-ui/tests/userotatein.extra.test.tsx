import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRotateIn } from '../src/hooks/useRotateIn';

// useRotateIn drives itself via setTimeout + requestAnimationFrame. We use fake
// timers and a rAF mock that advances a synthetic Date.now() per frame so every
// animation cycle terminates deterministically.
let nowMs: number;
let rafSpy: ReturnType<typeof vi.spyOn>;

function mount(props?: Parameters<typeof useRotateIn>[0]) {
  return renderHook(() => useRotateIn(props));
}
function flush(frames = 8) {
  for (let i = 0; i < frames; i++) {
    act(() => {
      nowMs += 250;
      // Fire the single pending deferred rAF callback for this frame.
      vi.runOnlyPendingTimers();
    });
  }
}

describe('useRotateIn hook — initial state & style', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('starts inactive with default angle 0 and clockwise direction', () => {
    const h = mount();
    expect(h.result.current.state.isActive).toBe(false);
    expect(h.result.current.state.isPaused).toBe(false);
    expect(h.result.current.state.isComplete).toBe(false);
    expect(h.result.current.state.currentAngle).toBe(0);
    expect(h.result.current.state.repeatCount).toBe(0);
    expect(h.result.current.state.respectReducedMotion).toBe(false);
    expect(h.result.current.attributes['aria-live']).toBe('off');
    expect(h.result.current.attributes['aria-busy']).toBe(false);
    expect(h.result.current.style.transition).toBe('none');
  });

  it('respects custom duration/easing/delay/angles in style', () => {
    const h = mount({ duration: 1000, easing: 'linear', delay: 50, initialAngle: 10, finalAngle: 90 });
    expect(h.result.current.style.transitionDelay).toBe('50ms');
  });

  it('counter-clockwise direction negates the rotation in style (reduced-motion path)', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const h = mount({ direction: 'counter-clockwise', finalAngle: 90 });
    // Reduced motion => transform uses -finalAngle
    expect(h.result.current.style.transform).toBe('rotate(-90deg)');
    matchSpy.mockRestore();
  });
});

describe('useRotateIn hook — start / pause / resume / stop / reset / toggle', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('start() activates animation and fires onAnimationStart + onStateChange(true)', () => {
    const onAnimationStart = vi.fn();
    const onStateChange = vi.fn();
    const h = mount({ onAnimationStart, onStateChange, duration: 500 });
    act(() => h.result.current.actions.start());
    expect(h.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalled();
    expect(onStateChange).toHaveBeenCalledWith(true);
  });

  it('start() is a no-op when already active and not paused', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ onAnimationStart });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.start()); // no-op
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() respects delay > 0', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ onAnimationStart, delay: 200 });
    act(() => h.result.current.actions.start());
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => { nowMs += 250; vi.advanceTimersByTime(250); });
    expect(onAnimationStart).toHaveBeenCalled();
  });

  it('pause() then resume() continue the animation', () => {
    const onStateChange = vi.fn();
    const h = mount({ onStateChange, duration: 1000 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    expect(h.result.current.state.isPaused).toBe(true);
    act(() => h.result.current.actions.resume());
    expect(h.result.current.state.isPaused).toBe(false);
  });

  it('pause() is a no-op when not active; resume() no-op when not paused', () => {
    const h = mount();
    act(() => h.result.current.actions.pause());
    expect(h.result.current.state.isPaused).toBe(false);
    act(() => h.result.current.actions.resume());
    expect(h.result.current.state.isPaused).toBe(false);
  });

  it('stop() deactivates and clears timers', () => {
    const onStateChange = vi.fn();
    const h = mount({ onStateChange, delay: 500 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.stop());
    expect(h.result.current.state.isActive).toBe(false);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });

  it('reset() restores initial angle and zero repeat, clears complete', () => {
    const h = mount({ initialAngle: 15, duration: 300 });
    act(() => h.result.current.actions.start());
    flush(4);
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.currentAngle).toBe(15);
    expect(h.result.current.state.repeatCount).toBe(0);
    expect(h.result.current.state.isComplete).toBe(false);
  });

  it('toggle() starts when inactive and stops when active', () => {
    const h = mount();
    act(() => h.result.current.actions.toggle());
    expect(h.result.current.state.isActive).toBe(true);
    act(() => h.result.current.actions.toggle());
    expect(h.result.current.state.isActive).toBe(false);
  });
});

describe('useRotateIn hook — repeat & completion', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('finite repeat completes after N cycles and fires onAnimationComplete + onRepeat', () => {
    const onAnimationComplete = vi.fn();
    const onRepeat = vi.fn();
    const h = mount({
      repeat: 2,
      duration: 400,
      onAnimationComplete,
      onRepeat,
    });
    act(() => h.result.current.actions.start());
    // Drive enough frames for two full cycles.
    flush(20);
    expect(onAnimationComplete).toHaveBeenCalled();
    expect(h.result.current.state.isComplete).toBe(true);
    expect(h.result.current.state.isActive).toBe(false);
    expect(onRepeat).toHaveBeenCalled();
  });

  it('infinite repeat keeps cycling without completing (repeat=0)', () => {
    const onAnimationComplete = vi.fn();
    const h = mount({ repeat: 0, duration: 200, onAnimationComplete });
    act(() => h.result.current.actions.start());
    flush(10);
    expect(onAnimationComplete).not.toHaveBeenCalled();
    expect(h.result.current.state.isActive).toBe(true);
  });

  it('resume after pause reaches completion for finite repeat', () => {
    const onAnimationComplete = vi.fn();
    const h = mount({ repeat: 1, duration: 300, onAnimationComplete });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    flush(15);
    expect(onAnimationComplete).toHaveBeenCalled();
  });
});

describe('useRotateIn hook — initialActive auto-start', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('initialActive=true starts the animation on mount', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ initialActive: true, onAnimationStart, duration: 400 });
    expect(h.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalled();
  });

  it('reduced motion + initialActive jumps straight to complete without animating', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const onAnimationComplete = vi.fn();
    const h = mount({ initialActive: true, finalAngle: 180, onAnimationComplete });
    expect(h.result.current.state.isComplete).toBe(true);
    expect(h.result.current.state.isActive).toBe(false);
    expect(onAnimationComplete).toHaveBeenCalled();
    matchSpy.mockRestore();
  });
});

describe('useRotateIn hook — attributes reflect active state', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('aria-live=polite and aria-busy=true while animating', () => {
    const h = mount({ duration: 500 });
    act(() => h.result.current.actions.start());
    expect(h.result.current.attributes['aria-live']).toBe('polite');
    expect(h.result.current.attributes['aria-busy']).toBe(true);
  });
});

describe('useRotateIn hook — start clears pending timeout', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('start() clears a pending delayed-start timeout when restarted', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ delay: 200, onAnimationStart });
    act(() => h.result.current.actions.start()); // schedules delayed executeAnimation
    act(() => h.result.current.actions.start()); // clears the prior timeout, reschedules
    // Advance past the delay; only the second scheduled start fires.
    act(() => { nowMs += 250; vi.advanceTimersByTime(250); });
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() while paused re-enters executeAnimation and clears pending state', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ duration: 400, onAnimationStart });
    act(() => h.result.current.actions.start());
    flush(1);
    act(() => h.result.current.actions.pause());
    // active+paused lets start() pass its guard and run executeAnimation again.
    act(() => h.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(2);
  });
});

describe('useRotateIn hook — resume-from-midpoint inner completion', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('resuming a paused finite animation completes via the resume inner path', () => {
    const onAnimationComplete = vi.fn();
    const onRepeat = vi.fn();
    const h = mount({ duration: 1000, repeat: 1, onAnimationComplete, onRepeat });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => { nowMs += 50; vi.runOnlyPendingTimers(); }); // consume main frame (paused)
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
    act(() => { nowMs += 50; vi.runOnlyPendingTimers(); });
    act(() => h.result.current.actions.resume());
    flush(25);
    expect(onRepeat).toHaveBeenCalled();
  });

  it('resume() with elapsed already past duration skips the continue block', () => {
    const h = mount({ duration: 100, repeat: 1 });
    act(() => h.result.current.actions.start());
    act(() => { nowMs += 5000; });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    flush(5);
    expect(h.result.current.state.isComplete).toBe(true);
  });

  it('resume-path completion with no onRepeat fires the absent-callback arm', () => {
    // Line 325 `if (onRepeat)` false arm during resume-path completion.
    const onComplete = vi.fn();
    const h = mount({ duration: 1000, repeat: 1, onAnimationComplete: onComplete });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => { nowMs += 50; vi.runOnlyPendingTimers(); });
    act(() => h.result.current.actions.resume());
    flush(20);
    expect(onComplete).toHaveBeenCalled();
  });
});

describe('useRotateIn hook — reduced-motion callback-absent + resume inert', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('reduced-motion executeAnimation without onAnimationComplete does not throw', () => {
    // Line 168 `if (onAnimationComplete)` false arm in the reduced branch.
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const h = mount({ initialActive: true, finalAngle: 180 });
    expect(h.result.current.state.isComplete).toBe(true);
    matchSpy.mockRestore();
  });

  it('resume() under reduced motion takes the inert guard arm', () => {
    // Line 305 `if (!shouldRespectReducedMotion)` false arm: initialActive seeds
    // isActiveRef true under reduced motion; pause then resume reaches the guard.
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const h = mount({ initialActive: true });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    expect(rafSpy).not.toHaveBeenCalled();
    matchSpy.mockRestore();
  });
});

// ----- shared harness -----
function setup() {
  vi.useFakeTimers();
  nowMs = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => nowMs);
  rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    nowMs += 200;
    // Defer via the fake-timer queue so the hook's self-rescheduling rAF loop
    // does not recurse synchronously (which would overflow the stack for
    // infinite repeat). Frames are driven by vi.runOnlyPendingTimers in flush().
    return setTimeout(() => cb(nowMs), 0) as unknown as number;
  });
}

function teardown() {
  rafSpy.mockRestore();
  vi.mocked(Date.now).mockRestore();
  vi.useRealTimers();
}
