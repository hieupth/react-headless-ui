import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { usePulse } from '../src/hooks';
import type { UsePulseProps } from '../src/hooks';

// The hook keeps animation state in refs/closures; reading result.current
// after an action returns stale values until a re-render runs. actAndRerender
// forces that re-render so assertions observe the latest state.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('usePulse hook — extended branches', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('computed cssTransition is "none" when duration resolves to 0 via reduced motion', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      usePulse({ respectReducedMotion: true, onAnimationComplete: onComplete })
    );
    // With reduced motion, start() short-circuits: isActive=false, isComplete=true.
    act(() => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(true);
    expect(hook.result.current.computed.cssTransition).toBe('none');
    expect(hook.result.current.computed.scale).toBe(1);
    expect(onComplete).toHaveBeenCalledWith(0);
    matchMediaSpy.mockRestore();
  });

  it('respectReducedMotion=false ignores the media query and animates', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const hook = renderHook(() =>
      usePulse({ respectReducedMotion: false, duration: 1000, repeat: 1 })
    );
    act(() => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(hook.result.current.computed.cssTransition).not.toBe('none');
    matchMediaSpy.mockRestore();
  });

  it('style.willChange reports "transform, opacity" while active, "auto" while idle', () => {
    const hook = renderHook(() => usePulse({ duration: 800 }));
    expect(hook.result.current.style.willChange).toBe('auto');
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.style.willChange).toBe('transform, opacity');
  });

  it('cssTransition encodes effectiveDuration/2 for each property', () => {
    const hook = renderHook(() => usePulse({ duration: 1000 }));
    const transition = hook.result.current.computed.cssTransition as string;
    expect(transition).toContain('500ms');
    expect(transition).toContain('transform');
    expect(transition).toContain('opacity');
    expect(transition).toContain('ease-in-out');
  });

  it('fires onRepeat when a finite animation crosses an iteration boundary', () => {
    const onRepeat = vi.fn();
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      usePulse({ duration: 100, repeat: 2, delay: 0, onRepeat, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    // Advance well past two iterations; the rAF steps invoke onRepeat.
    act(() => vi.advanceTimersByTime(500));
    expect(onComplete).toHaveBeenCalled();
    // onRepeat should have fired for iteration 1 (and possibly 2).
    expect(onRepeat.mock.calls.length).toBeGreaterThan(0);
    expect(onRepeat.mock.calls[0][0]).toBeGreaterThanOrEqual(1);
  });

  it('infinite repeat (repeat=0) keeps the animation alive across many frames', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      usePulse({ duration: 100, repeat: 0, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    // Never completes for infinite repeat.
    expect(hook.result.current.state.isActive).toBe(true);
    expect(hook.result.current.state.isComplete).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
    // Cleanup: explicitly stop to clear the rAF.
    act(() => hook.result.current.actions.stop());
  });

  it('delay phase holds iteration at 0 before duration begins counting', () => {
    const hook = renderHook(() => usePulse({ delay: 200, duration: 100, repeat: 1 }));
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(50));
    // Still within delay, iteration unchanged.
    expect(hook.result.current.state.iteration).toBe(0);
    expect(hook.result.current.state.isActive).toBe(true);
    act(() => hook.result.current.actions.stop());
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => usePulse({ duration: 1000 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    const pausedBefore = hook.result.current.state.isPaused;
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(pausedBefore);
    act(() => hook.result.current.actions.stop());
  });

  it('pause() then advancing time keeps animation paused without error', () => {
    const hook = renderHook(() => usePulse({ duration: 1000, repeat: 0 }));
    act(() => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    act(() => vi.advanceTimersByTime(2000));
    expect(hook.result.current.state.isPaused).toBe(true);
    act(() => hook.result.current.actions.stop());
  });

  it('reset() clears pending rAF and restores iteration to 0', () => {
    const hook = renderHook(() => usePulse({ duration: 100, repeat: 3, initialActive: true }));
    act(() => vi.advanceTimersByTime(50));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.iteration).toBe(0);
    expect(hook.result.current.state.isPaused).toBe(false);
    expect(hook.result.current.state.isActive).toBe(true); // initialActive=true
  });

  it('computed opacity stays within [1-intensity, 1] range while active', () => {
    const hook = renderHook(() => usePulse({ intensity: 0.4, duration: 500 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    const opacity = hook.result.current.computed.opacity;
    expect(opacity).toBeGreaterThanOrEqual(0.6);
    expect(opacity).toBeLessThanOrEqual(1);
    act(() => hook.result.current.actions.stop());
  });

  it('setActive(false) while active stops and marks complete', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() =>
      usePulse({ duration: 1000, repeat: 0, onStateChange })
    );
    actAndRerender(hook, () => hook.result.current.actions.setActive(true));
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });

  it('resume() while active-but-not-complete restarts the animate loop', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() =>
      usePulse({ duration: 1000, repeat: 5, onStateChange })
    );
    // Start, then pause while active. resume() should call animate() again.
    act(() => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
    // Still active and not complete after resume.
    expect(hook.result.current.state.isActive).toBe(true);
    expect(hook.result.current.state.isComplete).toBe(false);
    act(() => hook.result.current.actions.stop());
  });

  it('resume() while paused-but-complete clears paused without restarting', () => {
    const hook = renderHook(() => usePulse({ duration: 100, repeat: 1 }));
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500)); // let it complete
    expect(hook.result.current.state.isComplete).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.pause());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
    // isComplete stayed true -> the inner (isActive && !isComplete) branch was false.
    expect(hook.result.current.state.isComplete).toBe(true);
  });

  it('cleanup cancels any pending animation frame on unmount', () => {
    const hook = renderHook(() => usePulse({ duration: 1000, repeat: 0 }));
    act(() => hook.result.current.actions.start());
    // Unmounting must not throw; the cleanup effect cancels rAF.
    expect(() => hook.unmount()).not.toThrow();
  });

  it('start() is a no-op when already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => usePulse({ duration: 1000, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    onAnimationStart.mockClear();
    // Calling start again while active must not re-trigger animate().
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => hook.result.current.actions.stop());
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => usePulse({ duration: 1000 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    const pausedBefore = hook.result.current.state.isPaused;
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(pausedBefore);
    act(() => hook.result.current.actions.stop());
  });

  it('setActive with the current value is a no-op', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => usePulse({ duration: 1000, onStateChange }));
    // setActive(false) when already inactive -> no transition, no callback.
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(hook.result.current.state.isActive).toBe(false);
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('reset() when no animation is pending does not throw', () => {
    const hook = renderHook(() => usePulse({ duration: 1000 }));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.reset())).not.toThrow();
    expect(hook.result.current.state.iteration).toBe(0);
  });

  it('stop() when no animation is pending does not throw', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => usePulse({ duration: 1000, onStateChange }));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.stop())).not.toThrow();
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(true);
  });
});
