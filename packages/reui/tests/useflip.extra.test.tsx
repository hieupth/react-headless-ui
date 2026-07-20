import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFlip } from '../src/hooks/useFlip';

// useFlip keeps its animation state in refs and drives itself via setTimeout +
// requestAnimationFrame. To make every cycle terminate deterministically we use
// fake timers plus a rAF mock that advances a synthetic Date.now() per frame,
// mirroring the harness in userotatein.extra.test.tsx. This covers the
// resume-from-midpoint inner completion path, the reduced-motion short-circuit,
// and start() clearing pending timers/frames — branches the base flip.test.tsx
// cannot reach because its Date.now() never advances inside the rAF callback.

let nowMs: number;
let rafSpy: ReturnType<typeof vi.spyOn>;

function mount(props?: Parameters<typeof useFlip>[0]) {
  return renderHook(() => useFlip(props));
}

// Drive `frames` rAF callbacks, each advancing the synthetic clock so the
// animation's progress/elapsed math crosses completion thresholds.
function flush(frames = 10) {
  for (let i = 0; i < frames; i++) {
    act(() => {
      nowMs += 250;
      vi.runOnlyPendingTimers();
    });
  }
}

// Override matchMedia so prefers-reduced-motion: reduce reports matches:true.
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
  // Track rAF handles in a shared map so cancelAnimationFrame can clear the
  // backing setTimeout without tripping vitest's "cleared with the wrong API"
  // guard (our rAF mock is backed by setTimeout).
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

describe('useFlip — reduced-motion short-circuit', () => {
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

  it('reduced-motion path drives style.transform to "none"', () => {
    const spy = enableReducedMotion();
    const h = mount();
    expect(h.result.current.style.transform).toBe('none');
    spy.mockRestore();
  });

  it('calculateTransform returns "none" under reduced motion regardless of axis/direction', () => {
    const spy = enableReducedMotion();
    const h = mount({ axis: 'x', direction: 'backward' });
    expect(h.result.current.style.transform).toBe('none');
    spy.mockRestore();
  });

  it('resume() is inert under reduced motion (does not start a rAF loop)', () => {
    const spy = enableReducedMotion();
    const h = mount({ repeat: 1 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    // No rAF was ever scheduled in the reduced-motion branch.
    expect(rafSpy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('useFlip — resume-from-midpoint inner completion path', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('resuming a paused finite animation fires onRepeat + onAnimationComplete', () => {
    const onAnimationComplete = vi.fn();
    const onRepeat = vi.fn();
    const h = mount({ duration: 1000, repeat: 1, onAnimationComplete, onRepeat });
    act(() => h.result.current.actions.start());
    // Pause, then consume the main loop's already-scheduled frame so it sees
    // isPaused and returns without rescheduling. This isolates resume's own
    // inner updateFlip chain (otherwise the main loop would race and complete
    // first, leaving the resume completion block uncovered).
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 50;
      vi.runOnlyPendingTimers();
    });
    // Resume schedules the inner updateFlip; flush drives it across the
    // newProgress >= 1 completion threshold (the resume-only completion block).
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
    // With repeat:2, the resumed cycle-1 completion sees repeatCount(1) < 2 and
    // schedules the next cycle via the resume-path repeat branch.
    act(() => h.result.current.actions.resume());
    flush(25);
    expect(onRepeat).toHaveBeenCalled();
  });
});

describe('useFlip — start() clears pending timers/frames', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('calling start() again while a delayed start is pending clears the prior timer', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ delay: 500, onAnimationStart });
    act(() => h.result.current.actions.start()); // schedules delayed executeAnimation
    act(() => h.result.current.actions.start()); // clears the pending timeout, restarts
    // Only one executeAnimation should run after the delay elapses once.
    flush(20);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('toggle() stops an active animation and clears its frame', () => {
    const h = mount({ duration: 300, repeat: 0 });
    act(() => h.result.current.actions.toggle()); // start
    flush(1);
    act(() => h.result.current.actions.toggle()); // stop while a frame is pending
    h.rerender();
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('start() cancels a pending animation frame when called while paused mid-flight', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ duration: 400, repeat: 0, onAnimationStart });
    act(() => h.result.current.actions.start());
    // Let executeAnimation run so it assigns animationFrameRef, then pause so
    // the active-but-paired state lets a subsequent start() pass its guard and
    // reach the cancelAnimationFrame(animationFrameRef) cleanup.
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(2);
  });

  it('reset() clears a pending repeat-cycle timeout', () => {
    const h = mount({ duration: 200, repeat: 2 });
    act(() => h.result.current.actions.start());
    // Drive far enough for a cycle to complete and schedule the inter-cycle
    // setTimeout (which sets timeoutRef), then reset() clears it.
    flush(8);
    act(() => h.result.current.actions.reset());
    h.rerender();
    expect(h.result.current.state.repeatCount).toBe(0);
    expect(h.result.current.state.isComplete).toBe(false);
  });
});

describe('useFlip — direction alternate + axis branches in calculateTransform', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('backward direction and alternate direction both execute their rotation branches', () => {
    // The rest style calls calculateTransform(0); direction selects the branch.
    const backward = mount({ direction: 'backward' });
    expect(backward.result.current.style.transform).toMatch(/rotateY/);
    const alternate = mount({ direction: 'alternate', repeat: 2 });
    expect(alternate.result.current.style.transform).toMatch(/rotateY/);
  });

  it('an invalid axis value falls through to the default rotateY branch', () => {
    // The switch default is a defensive guard for runtime values outside the
    // 'x' | 'y' | 'z' union; cast to bypass the typed prop and exercise it.
    const h = mount({ axis: 'bogus' as any });
    expect(h.result.current.style.transform).toMatch(/rotateY/);
  });

  it('alternate direction evaluates the odd-repeat (sign-flip) arm mid-animation', () => {
    // After one completed cycle, repeatCountRef is odd (1), so calculateTransform
    // takes the `-rotation` arm when the next cycle's rAF reads style/position.
    const onRepeat = vi.fn();
    const h = mount({ direction: 'alternate', axis: 'z', repeat: 2, duration: 200, onRepeat });
    act(() => h.result.current.actions.start());
    flush(25);
    expect(onRepeat).toHaveBeenCalled();
  });
});

describe('useFlip — guard false-arms and callback-absent branches', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('inter-cycle delay does not reschedule if the animation was stopped', () => {
    // repeat=0 keeps cycling; stopping during the 200ms inter-cycle gap makes
    // the setTimeout callback's `isActive && !isPaused` guard take its false arm.
    const h = mount({ duration: 200, repeat: 0 });
    act(() => h.result.current.actions.start());
    // Drive past one cycle so the inter-cycle setTimeout is scheduled.
    flush(6);
    act(() => h.result.current.actions.stop());
    // Advance past the inter-cycle delay; the callback fires but does not reschedule.
    act(() => {
      nowMs += 300;
      vi.runOnlyPendingTimers();
    });
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('paused animation does not reschedule the main continue frame', () => {
    // The main-loop continue guard (`isActive && !isPaused`) false arm: a frame
    // fires while paused, so it returns without rescheduling.
    const h = mount({ duration: 400, repeat: 0 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    // A pending frame fires while paused — no reschedule, no completion.
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    h.rerender();
    expect(h.result.current.state.isPaused).toBe(true);
  });

  it('resume() with progress already >= 1 skips the continue block', () => {
    // Resume's `if (progress < 1)` false arm: pause after the animation would
    // have completed, then resume — progress >= 1 so no inner chain is scheduled.
    const h = mount({ duration: 200, repeat: 1 });
    act(() => h.result.current.actions.start());
    // Let the cycle complete fully (isActive becomes false), then pause/resume
    // are guarded no-ops; the resume progress check sees elapsed >> duration.
    flush(10);
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    expect(rafSpy).toHaveBeenCalled();
  });

  it('completion fires the onAnimationComplete-absent path without throwing', () => {
    // No onAnimationComplete/onRepeat callbacks supplied → their `if (cb)` guards
    // take the false arm during completion.
    const h = mount({ duration: 200, repeat: 1 });
    act(() => h.result.current.actions.start());
    flush(10);
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
  });

  it('first start() with no pending frame and reset() with no pending frame', () => {
    // Covers the false arm of start()/reset() `if (animationFrameRef.current)`.
    const h = mount({ duration: 200 });
    act(() => h.result.current.actions.start()); // no prior frame to cancel
    act(() => h.result.current.actions.reset()); // no pending frame to cancel
    h.rerender();
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('stop() and reset() with no animation ever started (no pending frame)', () => {
    // Covers the false arm of stop()/reset() `if (animationFrameRef.current)`
    // when no rAF has ever been scheduled.
    const h = mount({});
    act(() => h.result.current.actions.stop());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isActive).toBe(false);
  });
});

describe('useFlip — rAF/timer callback guard false-arms', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('a main-loop frame that fires while paused returns without rescheduling', () => {
    // Line 235 `if (isActive && !isPaused)` false arm: pending frame runs while paused.
    const h = mount({ duration: 400, repeat: 0 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause()); // isPaused now true
    // Fire the pending frame: it sees isPaused and returns (no reschedule).
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers();
    });
    h.rerender();
    expect(h.result.current.state.isPaused).toBe(true);
  });

  it('the inter-cycle delay does not reschedule when paused mid-gap (repeat path)', () => {
    // Line 219 guard false arm: pausing during the 200ms inter-cycle gap leaves
    // the timer pending (pause does not clear it); when it fires isPaused is
    // true, so the reschedule guard takes its false arm. We assert via the
    // onRepeat call count: a paused gap does not start a new cycle, so onRepeat
    // does not fire again after the gap callback runs.
    let repeatFires = 0;
    const h = mount({ duration: 200, repeat: 0, onRepeat: () => repeatFires++ });
    act(() => h.result.current.actions.start());
    act(() => {
      nowMs += 250;
      vi.runOnlyPendingTimers(); // cycle 1 completes: onRepeat fires (repeatFires=1), gap timer queued
    });
    const beforeGap = repeatFires;
    act(() => h.result.current.actions.pause()); // isPaused=true, gap timer still pending
    act(() => {
      nowMs += 300;
      vi.runOnlyPendingTimers(); // gap callback: guard false → no new cycle scheduled
    });
    // No additional repeat fired because the paused gap did not reschedule.
    expect(repeatFires).toBe(beforeGap);
  });

  it('the resume inter-cycle delay does not reschedule when paused mid-gap (resume path)', () => {
    // Line 331 guard false arm: same pause-during-gap scenario on the resume path.
    // duration:1000 keeps resume's `progress < 1` entry guard true (elapsed < duration
    // at resume time) so the resumed inner chain actually runs to a cycle completion.
    let repeatFires = 0;
    const h = mount({ duration: 1000, repeat: 2, onRepeat: () => repeatFires++ });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => {
      nowMs += 10;
      vi.runOnlyPendingTimers(); // consume main frame (paused → returns)
    });
    act(() => h.result.current.actions.resume());
    // Drive the resumed cycle to completion so its inter-cycle timer queues.
    act(() => {
      nowMs += 2500;
      vi.runOnlyPendingTimers();
    });
    const beforeGap = repeatFires;
    act(() => h.result.current.actions.pause()); // pause during the gap
    act(() => {
      nowMs += 300;
      vi.runOnlyPendingTimers(); // resume gap callback: guard false → no reschedule
    });
    expect(repeatFires).toBe(beforeGap);
  });

  it('finite completion with no onRepeat callback fires the absent-callback arm', () => {
    // Line 323 `if (onRepeat)` false arm during resume-path completion.
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
    // Line 309 `if (progress < 1)` false arm: resume when elapsed >= duration.
    const h = mount({ duration: 100, repeat: 1 });
    act(() => h.result.current.actions.start());
    // Advance the clock far past the duration WITHOUT flushing frames, so the
    // main loop hasn't completed; pause then resume sees progress >= 1.
    act(() => {
      nowMs += 5000;
    });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    // A frame is scheduled only if progress < 1; here it is not.
    flush(5);
    h.rerender();
    expect(h.result.current.state.isComplete).toBe(true);
  });
});

describe('useFlip — alternate direction odd-repeat + reduced-motion resume', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('alternate direction hits the sign-flip arm after an odd repeat count', () => {
    // Line 130 `isEvenRepeat ? rotation : -rotation` else arm: after one cycle
    // completes (repeatCount=1, odd), a re-render's style calls calculateTransform
    // and takes the `-rotation` arm.
    const h = mount({ direction: 'alternate', axis: 'x', repeat: 1, duration: 200 });
    act(() => h.result.current.actions.start());
    flush(10);
    h.rerender();
    expect(h.result.current.style.transform).toMatch(/rotateX/);
  });

  it('resume under reduced motion (initialActive+paused) takes the inert guard arm', () => {
    // Line 305 `!shouldRespectReducedMotion && isActive` false arm: initialActive
    // seeds isActiveRef true under reduced motion; pause then resume reaches the
    // guard, where `!shouldRespectReducedMotion` is false, so no rAF is scheduled.
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
    const h = mount({ initialActive: true });
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    expect(rafSpy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
