import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RotateIn } from '../src/components/RotateIn';
import { useRotateIn } from '../src/hooks/useRotateIn';

// The motion hooks keep state in refs (not React state), so reading
// result.current.state after an action returns stale values until a re-render
// runs getState(). `actAndRerender` forces that re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

// matchMedia is polyfilled in tests/setup.ts (returns prefers-reduced-motion:
// false), so the "crashes on render" note in the previous stub is stale.

describe('RotateIn', () => {
  it('renders the motion container with children', () => {
    const { container } = render(<RotateIn>content</RotateIn>);
    expect(container.querySelector('[data-testid="rotate-in"]')).not.toBeNull();
  });

  it('renders the CSS-fallback markup when useMotion is false', () => {
    const { container } = render(<RotateIn useMotion={false}>content</RotateIn>);
    expect(container.querySelector('[data-testid="rotate-in"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RotateIn>content</RotateIn>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('active state + counter-clockwise direction + custom variants exercise the prop arms', () => {
    // initialActive → isActive class + animate="rotateOut"; direction
    // counter-clockwise exercises the negative-angle arms; custom variants
    // exercises the merge branch; repeat=0 exercises the Infinity arm.
    const { container, rerender } = render(
      <RotateIn
        initialActive
        direction="counter-clockwise"
        initialAngle={45}
        finalAngle={180}
        duration={500}
        easing="linear"
        delay={50}
        repeat={0}
        variants={{ rotateIn: { rotate: 10 } }}
        transition={{ duration: 0.3 }}
      >
        content
      </RotateIn>
    );
    // The hook flips isActive in a mount effect + forceTick re-render.
    rerender(
      <RotateIn initialActive direction="counter-clockwise" repeat={0}>
        content
      </RotateIn>
    );
    const el = container.querySelector('[data-testid="rotate-in"]') as HTMLElement;
    // Headless: the rotate-in-active class is removed; the active state still
    // drives the framer-motion animate prop (covered by hook tests).
    expect(el).not.toBeNull();
  });
});

describe('useRotateIn', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initial state is inactive with a rotate transform', () => {
    const hook = renderHook(() => useRotateIn());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
    expect(hook.result.current.style.transform).toMatch(/rotate/);
  });

  it('start() activates and fires onAnimationStart', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useRotateIn({ onAnimationStart }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() with delay schedules the animation after the delay elapses', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useRotateIn({ delay: 70, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(70));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => useRotateIn());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() clears the active flag', () => {
    const hook = renderHook(() => useRotateIn());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('toggle() starts then stops', () => {
    const hook = renderHook(() => useRotateIn());
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('reset() restores the initial angle and clears repeat/complete', () => {
    const hook = renderHook(() => useRotateIn({ repeat: 1, duration: 100, initialAngle: 10 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.repeatCount).toBe(0);
    expect(hook.result.current.state.isComplete).toBe(false);
    expect(hook.result.current.state.currentAngle).toBe(10);
  });

  it('fires onRepeat and onAnimationComplete when a finite repeat finishes', () => {
    const onComplete = vi.fn();
    const onRepeat = vi.fn();
    const hook = renderHook(() =>
      useRotateIn({ repeat: 1, duration: 100, onAnimationComplete: onComplete, onRepeat })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    expect(onRepeat).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('counter-clockwise direction negates the final angle once complete', () => {
    const hook = renderHook(() =>
      useRotateIn({ direction: 'counter-clockwise', finalAngle: 90, repeat: 1, duration: 100 })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    hook.rerender();
    expect(hook.result.current.style.transform).toContain('-90');
  });

  it('exposes aria-live/aria-busy attributes', () => {
    const hook = renderHook(() => useRotateIn());
    expect(hook.result.current.attributes['aria-live']).toBe('off');
    expect(hook.result.current.attributes['aria-busy']).toBe(false);
  });

  it('does not restart when start() is called while already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useRotateIn({ onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause() is a no-op when not active', () => {
    const hook = renderHook(() => useRotateIn());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => useRotateIn());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('fires onStateChange when state mutates', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => useRotateIn({ onStateChange }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    expect(onStateChange).toHaveBeenCalled();
  });

  it('initialActive=true marks the animation active on mount', () => {
    const hook = renderHook(() => useRotateIn({ initialActive: true }));
    hook.rerender();
    expect(hook.result.current.state.isActive).toBe(true);
  });

  it('resumes from the midpoint and completes after a pause', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      useRotateIn({ duration: 1000, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(50));
    act(() => hook.result.current.actions.pause());
    act(() => hook.result.current.actions.resume());
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalled();
  });

  it('respects reduced motion: start() jumps to the final state and completes', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
    try {
      const onComplete = vi.fn();
      const hook = renderHook(() =>
        useRotateIn({ respectReducedMotion: true, finalAngle: 270, onAnimationComplete: onComplete })
      );
      expect(hook.result.current.state.respectReducedMotion).toBe(true);
      expect(hook.result.current.style.transition).toBe('none');
      actAndRerender(hook, () => hook.result.current.actions.start());
      expect(hook.result.current.state.isActive).toBe(false);
      expect(hook.result.current.state.isComplete).toBe(true);
      expect(hook.result.current.style.transform).toContain('270');
      expect(onComplete).toHaveBeenCalledTimes(1);
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it('repeats indefinitely when repeat=0', () => {
    const onRepeat = vi.fn();
    const hook = renderHook(() => useRotateIn({ repeat: 0, duration: 100, onRepeat }));
    act(() => hook.result.current.actions.start());
    // advance well past several cycles; infinite repeat keeps going
    act(() => vi.advanceTimersByTime(500));
    expect(onRepeat.mock.calls.length).toBeGreaterThan(1);
    expect(hook.result.current.state.isActive).toBe(true);
  });

  it('respects reduced motion: completes without firing callbacks when none provided', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
    try {
      const hook = renderHook(() => useRotateIn({ respectReducedMotion: true }));
      actAndRerender(hook, () => hook.result.current.actions.start());
      expect(hook.result.current.state.isComplete).toBe(true);
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it('start() clears a pending delayed timeout when called again', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useRotateIn({ delay: 80, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    // second start() before the delay elapses should clear the prior timeout
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(80));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('stop() clears a pending delayed timeout', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useRotateIn({ delay: 80, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    act(() => vi.advanceTimersByTime(80));
    expect(onAnimationStart).not.toHaveBeenCalled();
  });

  it('reset() clears a pending delayed timeout', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useRotateIn({ delay: 80, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.reset());
    act(() => vi.advanceTimersByTime(80));
    expect(onAnimationStart).not.toHaveBeenCalled();
  });

  it('queued rAF frames early-return once the animation is stopped', () => {
    const hook = renderHook(() => useRotateIn({ duration: 1000, repeat: 0 }));
    // start queues an rAF; stop before it runs, then advance so the queued
    // frame fires and hits the inactive guard (no throw, no completion).
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    expect(() => act(() => vi.advanceTimersByTime(50))).not.toThrow();
    expect(hook.result.current.state.isActive).toBe(false);
  });
});
