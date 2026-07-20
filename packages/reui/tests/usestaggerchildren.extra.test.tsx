import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useStaggerChildren } from '../src/hooks/useStaggerChildren';

// Covers branches the base staggerchildren.test.tsx does not reach: the
// reduced-motion short-circuit in executeAnimation and getChildDelay, the
// repeat-cycle setTimeout rescheduling, and the start/stop/reset timer-clear
// true arms (which need a pending timeout/frame at action time).

let nowMs: number;

function mount(props?: Parameters<typeof useStaggerChildren>[0]) {
  return renderHook(() => useStaggerChildren(props));
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
}

function teardown() {
  vi.mocked(Date.now).mockRestore();
  vi.useRealTimers();
}

describe('useStaggerChildren — reduced-motion short-circuit', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('start() under reduced motion jumps to complete and fires onAnimationComplete', () => {
    const spy = enableReducedMotion();
    const onAnimationComplete = vi.fn();
    const onAnimationStart = vi.fn();
    const h = mount({ childrenCount: 2, repeat: 2, onAnimationComplete, onAnimationStart });
    act(() => h.result.current.actions.start());
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
    expect(h.result.current.state.isActive).toBe(false);
    expect(h.result.current.state.currentPosition).toBe(1);
    expect(onAnimationComplete).toHaveBeenCalledTimes(1);
    expect(onAnimationStart).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('start() under reduced motion without onAnimationComplete does not throw', () => {
    const spy = enableReducedMotion();
    const h = mount({ childrenCount: 2 });
    act(() => h.result.current.actions.start());
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
    spy.mockRestore();
  });

  it('getChildDelay returns 0 under reduced motion', () => {
    const spy = enableReducedMotion();
    const h = mount({ childrenCount: 3, staggerDelay: 50, direction: 'reverse' });
    actAndRerender(h, () => h.result.current.actions.start());
    // Reduced motion => every child delay collapses to 0 regardless of direction.
    expect(h.result.current.getChildState(0).delay).toBe(0);
    spy.mockRestore();
  });
});

describe('useStaggerChildren — repeat-cycle rescheduling', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('an infinite repeat reschedules executeAnimation after all children finish', () => {
    // repeat=0 keeps cycling: after the last child completes, the inner
    // setTimeout (lines 271-273) reschedules executeAnimation while still active.
    const onAnimationStart = vi.fn();
    const h = mount({ childrenCount: 1, repeat: 0, duration: 50, staggerDelay: 10, onAnimationStart });
    actAndRerender(h, () => h.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
    // Drive past the child completion + the 100ms inter-cycle delay so the
    // rescheduled executeAnimation fires onAnimationStart a second time.
    act(() => {
      nowMs += 300;
      vi.advanceTimersByTime(300);
    });
    expect(onAnimationStart.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

describe('useStaggerChildren — start/stop/reset clear pending timers', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('start() clears a pending delayed-start timeout when restarted', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ childrenCount: 2, delay: 200, onAnimationStart });
    act(() => h.result.current.actions.start()); // schedules delayed executeAnimation
    act(() => h.result.current.actions.start()); // clears the prior timeout (true arm)
    act(() => vi.advanceTimersByTime(250));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('stop() clears a pending delayed-start timeout', () => {
    const h = mount({ childrenCount: 2, delay: 200 });
    act(() => h.result.current.actions.start()); // timeout pending
    act(() => h.result.current.actions.stop()); // clears timeoutRef (true arm)
    h.rerender();
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('reset() clears a pending delayed-start timeout', () => {
    const h = mount({ childrenCount: 2, delay: 200 });
    act(() => h.result.current.actions.start()); // timeout pending
    act(() => h.result.current.actions.reset()); // clears timeoutRef (true arm)
    h.rerender();
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('stop() cancels a running animation frame', () => {
    // start() schedules a rAF for updateProgress; stop() cancels it.
    const h = mount({ childrenCount: 2, duration: 100 });
    actAndRerender(h, () => h.result.current.actions.start());
    act(() => h.result.current.actions.stop()); // cancelAnimationFrame true arm
    h.rerender();
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('start() cancels a pending animation frame when called while paused', () => {
    // Line 318 `if (animationFrameRef.current)` true arm: start() while the
    // updateProgress rAF is pending cancels it.
    const onAnimationStart = vi.fn();
    const h = mount({ childrenCount: 2, duration: 200, onAnimationStart });
    actAndRerender(h, () => h.result.current.actions.start());
    actAndRerender(h, () => h.result.current.actions.pause()); // active+paused
    // A second start() passes its guard (active+paused) and cancels the frame.
    act(() => h.result.current.actions.start());
    expect(onAnimationStart.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

describe('useStaggerChildren — inter-cycle and resume guard arms', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('the inter-cycle reschedule does not fire when stopped mid-gap', () => {
    // Line 271 `if (isActiveRef.current && !isPausedRef.current)` false arm:
    // after all children of an infinite repeat finish, stopping before the
    // 100ms inter-cycle delay fires makes its guard take the false arm.
    const onAnimationStart = vi.fn();
    const h = mount({ childrenCount: 1, repeat: 0, duration: 50, staggerDelay: 10, onAnimationStart });
    actAndRerender(h, () => h.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
    // Drive just past the single child's completion (duration 50) so the
    // inter-cycle setTimeout (100ms) is queued but has not yet fired.
    act(() => {
      nowMs += 60;
      vi.advanceTimersByTime(60);
    });
    // Stop before the 100ms inter-cycle delay elapses, then advance past it.
    act(() => h.result.current.actions.stop());
    act(() => {
      nowMs += 200;
      vi.advanceTimersByTime(200);
    });
    // The inter-cycle callback fired but did not reschedule (isActive false),
    // so onAnimationStart was not called a second time.
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('resume() with progress already >= 1 skips the continue block', () => {
    // Line 377 `if (progress < 1)` false arm: resume when elapsed >= totalDuration.
    const h = mount({ childrenCount: 1, duration: 50, staggerDelay: 10, repeat: 1 });
    actAndRerender(h, () => h.result.current.actions.start());
    // Advance the synthetic clock far past totalDuration WITHOUT driving the
    // child timeouts, so resume's progress check sees elapsed >> total.
    act(() => {
      nowMs += 5000;
    });
    actAndRerender(h, () => h.result.current.actions.pause());
    actAndRerender(h, () => h.result.current.actions.resume());
    expect(h.result.current.state.isPaused).toBe(false);
  });
});

// Local actAndRerender: stagger holds state in refs, so reading
// result.current.state after an action returns stale values until a re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}
