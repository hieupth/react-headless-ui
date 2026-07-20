import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Pulse } from '../src/components/Pulse';
import { usePulse } from '../src/hooks/usePulse';

// The motion hooks keep state in refs (not React state); reading
// result.current.state after an action returns stale values until a re-render
// runs. `actAndRerender` forces that re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('Pulse', () => {
  it('renders the pulse container when useMotion is enabled', () => {
    const { container } = render(<Pulse>x</Pulse>);
    expect(container.querySelector('[data-testid="pulse"]')).not.toBeNull();
  });

  it('renders a plain div when useMotion is disabled', () => {
    const { container } = render(<Pulse useMotion={false}>x</Pulse>);
    expect(container.querySelector('[data-testid="pulse"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Pulse>x</Pulse>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('applies custom variants and transition when provided', () => {
    const variants = { pulse: { scale: 2 } };
    const transition = { duration: 5 };
    const { container } = render(
      <Pulse variants={variants} transition={transition}>x</Pulse>
    );
    const el = container.querySelector('[data-testid="pulse"]')!;
    expect(el).not.toBeNull();
  });

  it('uses Infinity repeat when repeat=0 (infinite loop)', () => {
    // repeat === 0 maps to Infinity for the framer-motion config.
    const { container } = render(<Pulse repeat={0} intensity={0.3} duration={500} delay={10}>x</Pulse>);
    expect(container.querySelector('[data-testid="pulse"]')).not.toBeNull();
  });

  it('renders the active class and animate="pulse" when initialActive', () => {
    const { container } = render(<Pulse initialActive>x</Pulse>);
    const el = container.querySelector('[data-testid="pulse"]')!;
    expect(el.className).toContain('pulse-active');
  });

  it('renders pulse-complete class once a finite animation finishes', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <Pulse initialActive repeat={1} duration={100}>x</Pulse>
      );
      act(() => { vi.advanceTimersByTime(500); });
      const el = container.querySelector('[data-testid="pulse"]')!;
      expect(el.className).toContain('pulse-complete');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('usePulse', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts inactive with scale 1 and role=status', () => {
    const hook = renderHook(() => usePulse());
    const { state, computed, attributes } = hook.result.current;
    expect(state.isActive).toBe(false);
    expect(state.isComplete).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(computed.scale).toBe(1);
    expect(attributes.role).toBe('status');
    expect(attributes['aria-live']).toBe('off');
  });

  it('start() activates and fires onAnimationStart + onStateChange', () => {
    const onAnimationStart = vi.fn();
    const onStateChange = vi.fn();
    const hook = renderHook(() => usePulse({ onAnimationStart, onStateChange }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenCalledWith(true);
  });

  it('start() with delay keeps the iteration at 0 until the delay elapses', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      usePulse({ delay: 60, duration: 100, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    // Before the delay elapses, the finite animation has not completed.
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60));
    // Once past the delay the animation steps run and the repeat completes.
    act(() => vi.advanceTimersByTime(400));
    expect(onComplete).toHaveBeenCalled();
  });

  it('start() is a no-op when already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => usePulse({ onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => usePulse());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() sets inactive + complete and fires onStateChange(false)', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => usePulse({ onStateChange }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });

  it('reset() restores the initial state', () => {
    const hook = renderHook(() => usePulse({ initialActive: false }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isPaused).toBe(false);
    expect(hook.result.current.state.iteration).toBe(0);
    expect(hook.result.current.state.isComplete).toBe(false);
  });

  it('reset() restores an initialActive=true hook to active', () => {
    const hook = renderHook(() => usePulse({ initialActive: true }));
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isActive).toBe(true);
  });

  it('setActive(true) starts and setActive(false) stops', () => {
    const hook = renderHook(() => usePulse());
    actAndRerender(hook, () => hook.result.current.actions.setActive(true));
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('setActive with the current value is a no-op', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => usePulse({ onAnimationStart }));
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(onAnimationStart).not.toHaveBeenCalled();
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('fires onAnimationComplete when a finite repeat finishes', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      usePulse({ repeat: 1, duration: 100, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    expect(onComplete).toHaveBeenCalledWith(1);
  });

  it('initialActive=true runs the animation on mount', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => usePulse({ initialActive: true, onAnimationStart }));
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('honours a custom intensity in the computed scale while active', () => {
    const hook = renderHook(() => usePulse({ intensity: 0.5, duration: 1000 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    const scale = hook.result.current.computed.scale;
    // intensity 0.5 => scale oscillates within [0.5, 1.5]
    expect(scale).toBeGreaterThanOrEqual(0.5);
    expect(scale).toBeLessThanOrEqual(1.5);
  });

  it('exposes a cssTransition string while active', () => {
    const hook = renderHook(() => usePulse({ duration: 1000 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.computed.cssTransition).toMatch(/transform.*opacity/);
  });

  it('aria-live switches to polite while animating', () => {
    const hook = renderHook(() => usePulse());
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.attributes['aria-live']).toBe('polite');
  });

  it('resumes from a paused midpoint and completes after a finite repeat', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      usePulse({ duration: 1000, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(50));
    actAndRerender(hook, () => hook.result.current.actions.pause());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalled();
  });
});
