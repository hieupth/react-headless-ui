import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useScaleInOut } from '../src/hooks/useScaleInOut';

// useScaleInOut loops via requestAnimationFrame. We mock rAF and bump a
// synthetic performance.now() per frame so finite-repeat animations terminate.
let nowMs: number;
let rafSpy: ReturnType<typeof vi.spyOn>;
let cafSpy: ReturnType<typeof vi.spyOn>;

function mount(props?: Parameters<typeof useScaleInOut>[0]) {
  return renderHook(() => useScaleInOut(props));
}
function flush(frames = 10) {
  for (let i = 0; i < frames; i++) {
    act(() => {
      nowMs += 100;
      // Fire the single pending deferred rAF callback for this frame.
      vi.runOnlyPendingTimers();
    });
  }
}

describe('useScaleInOut hook — initial state & computed defaults', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('exposes default inactive state and computed scale/opacity/transform', () => {
    const h = mount();
    expect(h.result.current.state.isActive).toBe(false);
    expect(h.result.current.state.isPaused).toBe(false);
    expect(h.result.current.state.iteration).toBe(0);
    expect(h.result.current.state.isComplete).toBe(false);
    // Inactive => scale returns finalScale, opacity 1
    expect(h.result.current.computed.scale).toBe(1);
    expect(h.result.current.computed.opacity).toBe(1);
    expect(h.result.current.computed.cssTransform).toBe('scale(1)');
    expect(h.result.current.computed.shouldRender).toBe(true);
    expect(h.result.current.computed.cssTransition).toContain('transform');
    expect(h.result.current.attributes['aria-live']).toBe('off');
    expect(h.result.current.attributes.role).toBe('status');
    expect(h.result.current.style.willChange).toBe('auto');
  });

  it('origin variants produce correct transform-origin css', () => {
    const cases: Array<[any, string]> = [
      ['top-left', 'top left'],
      ['top-right', 'top right'],
      ['bottom-left', 'bottom left'],
      ['bottom-right', 'bottom right'],
      ['center', 'center'],
    ];
    cases.forEach(([origin, expected]) => {
      const h = mount({ origin });
      expect(h.result.current.computed.cssTransformOrigin).toBe(expected);
      expect(h.result.current.style.transformOrigin).toBe(expected);
    });
  });

  it('initialActive=true auto-starts on mount', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ initialActive: true, onAnimationStart });
    expect(h.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalled();
    expect(h.result.current.style.willChange).toBe('transform, opacity');
    expect(h.result.current.attributes['aria-live']).toBe('polite');
  });
});

describe('useScaleInOut hook — actions start/stop/pause/resume/reset/setActive', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('start() activates and fires onAnimationStart + onStateChange(true)', () => {
    const onAnimationStart = vi.fn();
    const onStateChange = vi.fn();
    const h = mount({ onAnimationStart, onStateChange, duration: 500 });
    act(() => h.result.current.actions.start());
    expect(h.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalled();
    expect(onStateChange).toHaveBeenCalledWith(true);
  });

  it('start() is a no-op when already active', () => {
    const onAnimationStart = vi.fn();
    const h = mount({ onAnimationStart });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('stop() deactivates, marks complete, fires onStateChange(false)', () => {
    const onStateChange = vi.fn();
    const h = mount({ onStateChange });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.stop());
    expect(h.result.current.state.isActive).toBe(false);
    expect(h.result.current.state.isComplete).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });

  it('pause() sets paused; resume() restarts the animate loop', () => {
    const h = mount({ duration: 400 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    expect(h.result.current.state.isPaused).toBe(true);
    act(() => h.result.current.actions.resume());
    expect(h.result.current.state.isPaused).toBe(false);
  });

  it('resume() is a no-op when not paused', () => {
    const h = mount();
    act(() => h.result.current.actions.resume());
    expect(h.result.current.state.isPaused).toBe(false);
  });

  it('resume() while paused-but-complete clears paused without restarting', () => {
    const h = mount({ duration: 100, repeat: 1 });
    act(() => h.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500)); // let it complete
    expect(h.result.current.state.isComplete).toBe(true);
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.resume());
    expect(h.result.current.state.isPaused).toBe(false);
    // isComplete stayed true -> the inner (isActive && !isComplete) branch was false.
    expect(h.result.current.state.isComplete).toBe(true);
  });

  it('reset() restores initialActive, clears paused/iteration/complete', () => {
    const h = mount({ initialActive: false, duration: 200 });
    act(() => h.result.current.actions.start());
    act(() => h.result.current.actions.pause());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isActive).toBe(false);
    expect(h.result.current.state.isPaused).toBe(false);
    expect(h.result.current.state.iteration).toBe(0);
    expect(h.result.current.state.isComplete).toBe(false);
  });

  it('stop()/reset() when no animation is pending do not throw', () => {
    const h = mount({ duration: 200 });
    expect(() => act(() => h.result.current.actions.stop())).not.toThrow();
    expect(h.result.current.state.isActive).toBe(false);
    expect(h.result.current.state.isComplete).toBe(true);
    expect(() => act(() => h.result.current.actions.reset())).not.toThrow();
    expect(h.result.current.state.iteration).toBe(0);
  });

  it('setActive(true) starts; setActive(false) stops; same value is no-op', () => {
    const onAnimationStart = vi.fn();
    const onStateChange = vi.fn();
    const h = mount({ onAnimationStart, onStateChange });
    act(() => h.result.current.actions.setActive(true));
    expect(h.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalled();
    // setActive(true) again while active -> no-op
    act(() => h.result.current.actions.setActive(true));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
    act(() => h.result.current.actions.setActive(false));
    expect(h.result.current.state.isActive).toBe(false);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });
});

describe('useScaleInOut hook — repeat & completion via rAF loop', () => {
  beforeEach(setup);
  afterEach(teardown);

  it('finite repeat completes and fires onAnimationComplete', () => {
    const onAnimationComplete = vi.fn();
    const onRepeat = vi.fn();
    const h = mount({
      repeat: 2,
      duration: 300,
      delay: 0,
      onAnimationComplete,
      onRepeat,
    });
    act(() => h.result.current.actions.start());
    // Drive frames well past 2 iterations (each iteration = 300ms / 100ms-per-frame).
    flush(40);
    expect(onAnimationComplete).toHaveBeenCalled();
    expect(h.result.current.state.isComplete).toBe(true);
    expect(h.result.current.state.isActive).toBe(false);
  });

  it('infinite repeat (repeat=0) keeps animating without completing', () => {
    const onAnimationComplete = vi.fn();
    const h = mount({ repeat: 0, duration: 200, onAnimationComplete });
    act(() => h.result.current.actions.start());
    flush(15);
    expect(onAnimationComplete).not.toHaveBeenCalled();
    expect(h.result.current.state.isActive).toBe(true);
  });

  it('respects delay > 0 before starting the animation step', () => {
    const h = mount({ delay: 500, duration: 300 });
    act(() => h.result.current.actions.start());
    // Before delay elapses the iteration is still 0 and active.
    flush(2);
    expect(h.result.current.state.isActive).toBe(true);
  });
});

describe('useScaleInOut hook — reduced motion', () => {
  it('reduced motion: start jumps straight to complete, effectiveDuration=0', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const onAnimationComplete = vi.fn();
    const h = mount({ onAnimationComplete, duration: 400 });
    act(() => h.result.current.actions.start());
    expect(h.result.current.state.isComplete).toBe(true);
    expect(h.result.current.state.isActive).toBe(false);
    expect(onAnimationComplete).toHaveBeenCalledWith(0);
    expect(h.result.current.computed.cssTransition).toBe('none');
    matchSpy.mockRestore();
  });

  it('respectReducedMotion=false ignores the media query', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const h = mount({ respectReducedMotion: false, duration: 400 });
    act(() => h.result.current.actions.start());
    expect(h.result.current.state.isActive).toBe(true);
    expect(h.result.current.computed.cssTransition).toContain('transform');
    matchSpy.mockRestore();
  });
});

// ----- shared harness -----
function setup() {
  vi.useFakeTimers();
  nowMs = 1000;
  vi.spyOn(performance, 'now').mockImplementation(() => nowMs);
  rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    nowMs += 100;
    // Defer via the fake-timer queue so the hook's self-rescheduling rAF loop
    // does not recurse synchronously (which would overflow the stack for
    // infinite repeat). Frames are driven by vi.advanceTimersByTime in flush().
    return setTimeout(() => cb(nowMs), 0) as unknown as number;
  });
  cafSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id: number) => {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  });
}

function teardown() {
  rafSpy.mockRestore();
  cafSpy.mockRestore();
  vi.mocked(performance.now).mockRestore();
  vi.useRealTimers();
}
