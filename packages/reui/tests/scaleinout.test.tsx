import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ScaleInOut } from '../src/components/ScaleInOut';
import { useScaleInOut } from '../src/hooks/useScaleInOut';

// Motion hooks keep state in refs (not React state); reading
// result.current.state after an action returns stale values until a re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('ScaleInOut', () => {
  it('renders the motion container when useMotion is enabled', () => {
    const { container } = render(<ScaleInOut>x</ScaleInOut>);
    expect(container.querySelector('[data-testid="scale-in-out"]')).not.toBeNull();
  });

  it('renders a plain div when useMotion is disabled', () => {
    const { container } = render(<ScaleInOut useMotion={false}>x</ScaleInOut>);
    expect(container.querySelector('[data-testid="scale-in-out"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ScaleInOut>x</ScaleInOut>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});

describe('useScaleInOut', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts inactive with default final scale and role=status', () => {
    const hook = renderHook(() => useScaleInOut());
    const { state, computed, attributes } = hook.result.current;
    expect(state.isActive).toBe(false);
    expect(computed.scale).toBe(1); // finalScale default
    expect(computed.opacity).toBe(1);
    expect(attributes.role).toBe('status');
    expect(attributes['aria-live']).toBe('off');
  });

  it('start() activates and fires onAnimationStart + onStateChange', () => {
    const onAnimationStart = vi.fn();
    const onStateChange = vi.fn();
    const hook = renderHook(() => useScaleInOut({ onAnimationStart, onStateChange }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith(true);
  });

  it('start() is a no-op when already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useScaleInOut({ onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => useScaleInOut());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() sets inactive + complete and fires onStateChange(false)', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => useScaleInOut({ onStateChange }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });

  it('reset() restores the initial state', () => {
    const hook = renderHook(() => useScaleInOut());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isPaused).toBe(false);
    expect(hook.result.current.state.iteration).toBe(0);
    expect(hook.result.current.state.isComplete).toBe(false);
  });

  it('setActive(true) starts and setActive(false) stops', () => {
    const hook = renderHook(() => useScaleInOut());
    actAndRerender(hook, () => hook.result.current.actions.setActive(true));
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('fires onAnimationComplete when a finite repeat finishes', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      useScaleInOut({ repeat: 1, duration: 100, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    expect(onComplete).toHaveBeenCalledWith(1);
  });

  it('initialActive=true runs the animation on mount', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useScaleInOut({ initialActive: true, onAnimationStart }));
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('applies the chosen transform-origin', () => {
    const hook = renderHook(() => useScaleInOut({ origin: 'top-left' }));
    expect(hook.result.current.computed.cssTransformOrigin).toBe('top left');
  });

  it('applies all transform-origin variants', () => {
    const cases: Array<[any, string]> = [
      ['center', 'center'],
      ['top-left', 'top left'],
      ['top-right', 'top right'],
      ['bottom-left', 'bottom left'],
      ['bottom-right', 'bottom right'],
    ];
    for (const [origin, expected] of cases) {
      const hook = renderHook(() => useScaleInOut({ origin }));
      expect(hook.result.current.computed.cssTransformOrigin).toBe(expected);
      hook.unmount();
    }
  });

  it('respects custom initialScale/finalScale in the computed transform', () => {
    const hook = renderHook(() => useScaleInOut({ initialScale: 0.5, finalScale: 1.5 }));
    // Inactive => scale defaults to finalScale
    expect(hook.result.current.computed.cssTransform).toBe('scale(1.5)');
  });

  it('exposes a cssTransition string while active', () => {
    const hook = renderHook(() => useScaleInOut({ duration: 300 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.computed.cssTransition).toMatch(/transform.*opacity/);
  });

  it('aria-live switches to polite while animating', () => {
    const hook = renderHook(() => useScaleInOut());
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.attributes['aria-live']).toBe('polite');
  });

  it('resumes from a paused midpoint and completes after a finite repeat', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      useScaleInOut({ duration: 1000, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(50));
    actAndRerender(hook, () => hook.result.current.actions.pause());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalled();
  });

  it('setActive with the current value is a no-op', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useScaleInOut({ onAnimationStart }));
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(onAnimationStart).not.toHaveBeenCalled();
    expect(hook.result.current.state.isActive).toBe(false);
  });
});
