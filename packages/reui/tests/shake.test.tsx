import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Shake } from '../src/components/Shake';
import { useShake } from '../src/hooks/useShake';

// The motion hooks keep state in refs (not React state), so reading
// result.current.state after an action returns stale values until a re-render
// runs getState(). `actAndRerender` forces that re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

// matchMedia is polyfilled in tests/setup.ts (returns prefers-reduced-motion:
// false), so the "crashes on render" note in the previous stub is stale.

describe('Shake', () => {
  it('renders the motion container with children', () => {
    const { container } = render(<Shake>content</Shake>);
    expect(container.querySelector('[data-testid="shake"]')).not.toBeNull();
  });

  it('renders the CSS-fallback markup when useMotion is false', () => {
    const { container } = render(<Shake useMotion={false}>content</Shake>);
    expect(container.querySelector('[data-testid="shake"]')).not.toBeNull();
  });

  it('applies the active class when initialActive is true', () => {
    const { container } = render(<Shake initialActive>content</Shake>);
    expect(container.querySelector('.shake-active')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Shake>content</Shake>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});

describe('useShake', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initial state is inactive and not respecting reduced motion', () => {
    const hook = renderHook(() => useShake());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
    expect(hook.result.current.style.transform).toContain('translateX');
  });

  it('start() activates and fires onAnimationStart', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useShake({ onAnimationStart }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() with delay schedules the animation after the delay elapses', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useShake({ delay: 50, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(50));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => useShake());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() resets active state and position', () => {
    const hook = renderHook(() => useShake());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.currentPosition).toBe(0);
  });

  it('toggle() starts then stops', () => {
    const hook = renderHook(() => useShake());
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('reset() clears repeatCount and complete flag', () => {
    const hook = renderHook(() => useShake({ repeat: 1, duration: 100 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.repeatCount).toBe(0);
    expect(hook.result.current.state.isComplete).toBe(false);
  });

  it('fires onRepeat and onAnimationComplete when a finite repeat finishes', () => {
    const onComplete = vi.fn();
    const onRepeat = vi.fn();
    const hook = renderHook(() =>
      useShake({ repeat: 1, duration: 100, onAnimationComplete: onComplete, onRepeat })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    expect(onRepeat).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('horizontal direction produces a translateX transform', () => {
    const hook = renderHook(() => useShake({ direction: 'horizontal' }));
    expect(hook.result.current.style.transform).toMatch(/translateX/);
  });

  it('vertical direction produces a translateY transform', () => {
    const hook = renderHook(() => useShake({ direction: 'vertical' }));
    expect(hook.result.current.style.transform).toMatch(/translateY/);
  });

  it('both direction produces a translate(x, y) transform', () => {
    const hook = renderHook(() => useShake({ direction: 'both' }));
    expect(hook.result.current.style.transform).toMatch(/^translate\(/);
  });

  it('exposes aria-live/aria-busy attributes', () => {
    const hook = renderHook(() => useShake());
    expect(hook.result.current.attributes['aria-live']).toBe('off');
    expect(hook.result.current.attributes['aria-busy']).toBe(false);
  });

  it('does not restart when start() is called while already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useShake({ onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause() is a no-op when not active', () => {
    const hook = renderHook(() => useShake());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => useShake());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('fires onStateChange when state mutates', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => useShake({ onStateChange }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    expect(onStateChange).toHaveBeenCalled();
  });

  it('initialActive=true marks the animation active on mount', () => {
    const hook = renderHook(() => useShake({ initialActive: true }));
    hook.rerender();
    expect(hook.result.current.state.isActive).toBe(true);
  });

  it('resumes from the midpoint and completes after a pause', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      useShake({ duration: 1000, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(50));
    act(() => hook.result.current.actions.pause());
    act(() => hook.result.current.actions.resume());
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalled();
  });
});
