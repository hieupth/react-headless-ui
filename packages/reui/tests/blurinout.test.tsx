import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { BlurInOut } from '../src/components/BlurInOut';
import { useBlurInOut } from '../src/hooks/useBlurInOut';

// The motion hooks keep state in refs (not React state), so reading
// result.current.state after an action returns stale values until a re-render
// runs getState(). `actAndRerender` forces that re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('BlurInOut', () => {
  it('renders its children inside the motion container', () => {
    const { container } = render(
      <BlurInOut initialActive>
        <span>Blurred content</span>
      </BlurInOut>
    );
    expect(container.querySelector('[data-testid="blur-in-out-motion"]')).not.toBeNull();
  });

  it('falls back to a plain div when useMotion is disabled', () => {
    const { container } = render(
      <BlurInOut useMotion={false}>
        <span>Plain content</span>
      </BlurInOut>
    );
    expect(container.querySelector('[data-testid="blur-in-out"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BlurInOut>x</BlurInOut>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('applies active + reduced-motion classes for those state flags', () => {
    // respectReducedMotion is gated on matchMedia('prefers-reduced-motion').
    // Spy so the hook reports respectReducedMotion=true, exercising that arm.
    const mm = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const { container } = render(
      <BlurInOut initialActive>
        <span>x</span>
      </BlurInOut>
    );
    const el = container.querySelector('[data-testid="blur-in-out-motion"]') as HTMLElement;
    expect(el.className).toContain('blur-active');
    expect(el.className).toContain('respect-reduced-motion');
    mm.mockRestore();
  });

  it('builds defaultVariants/defaultTransition with repeat=0 (Infinity) and custom props', () => {    // Passing explicit animation props exercises the prop-provided arms of the
    // `prop || default` cond-exprs and the repeat===0 (Infinity) arm, plus a
    // custom variants merge.
    const { container } = render(
      <BlurInOut
        initialBlur={4}
        finalBlur={12}
        duration={500}
        easing="linear"
        delay={100}
        repeat={0}
        variants={{ blurIn: { filter: 'blur(2px)' } }}
        transition={{ duration: 0.2 }}
      >
        <span>x</span>
      </BlurInOut>
    );
    expect(container.querySelector('[data-testid="blur-in-out-motion"]')).not.toBeNull();
  });
});

describe('useBlurInOut', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initial state is inactive with a blur filter style', () => {
    const hook = renderHook(() => useBlurInOut());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
    expect(hook.result.current.style.filter).toMatch(/blur/);
  });

  it('start() activates and fires onAnimationStart', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useBlurInOut({ onAnimationStart }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() with delay schedules the animation after the delay elapses', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useBlurInOut({ delay: 60, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => useBlurInOut());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() resets active state and position', () => {
    const hook = renderHook(() => useBlurInOut());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.currentPosition).toBe(0);
  });

  it('toggle() starts then stops', () => {
    const hook = renderHook(() => useBlurInOut());
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('reset() clears repeatCount and complete flag', () => {
    const hook = renderHook(() => useBlurInOut({ repeat: 1, duration: 100 }));
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
      useBlurInOut({ repeat: 1, duration: 100, onAnimationComplete: onComplete, onRepeat })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    expect(onRepeat).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('respects custom initialBlur/finalBlur in the computed filter', () => {
    const hook = renderHook(() => useBlurInOut({ initialBlur: 2, finalBlur: 10 }));
    // position 0 => blur = initialBlur = 2
    expect(hook.result.current.style.filter).toBe('blur(2px)');
  });

  it('exposes aria-live/aria-busy attributes', () => {
    const hook = renderHook(() => useBlurInOut());
    expect(hook.result.current.attributes['aria-live']).toBe('off');
    expect(hook.result.current.attributes['aria-busy']).toBe(false);
  });

  it('does not restart when start() is called while already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useBlurInOut({ onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause() is a no-op when not active', () => {
    const hook = renderHook(() => useBlurInOut());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => useBlurInOut());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('fires onStateChange when state mutates', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => useBlurInOut({ onStateChange }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    expect(onStateChange).toHaveBeenCalled();
  });

  it('initialActive=true marks the animation active on mount', () => {
    const hook = renderHook(() => useBlurInOut({ initialActive: true }));
    hook.rerender();
    expect(hook.result.current.state.isActive).toBe(true);
  });

  it('resumes from the midpoint and completes after a pause', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      useBlurInOut({ duration: 1000, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(50));
    act(() => hook.result.current.actions.pause());
    act(() => hook.result.current.actions.resume());
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalled();
  });
});
