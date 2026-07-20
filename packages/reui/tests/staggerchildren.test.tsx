import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StaggerChildren } from '../src/components/StaggerChildren';
import { useStaggerChildren } from '../src/hooks/useStaggerChildren';

// The motion hooks keep state in refs (not React state), so reading
// result.current.state after an action returns stale values until a re-render
// runs getState(). `actAndRerender` forces that re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('StaggerChildren', () => {
  it('renders the stagger wrapper with children', () => {
    const { container } = render(
      <StaggerChildren initialActive>
        <div>First</div>
        <div>Second</div>
      </StaggerChildren>
    );
    expect(container.querySelector('[data-testid="stagger-children-motion"]')).not.toBeNull();
  });

  it('renders children via CSS transition mode', () => {
    const { container } = render(
      <StaggerChildren useMotion={false}>
        <div>Item</div>
      </StaggerChildren>
    );
    expect(container.querySelector('[data-testid="stagger-children"]')).not.toBeNull();
  });

  it('renders CSS-mode children as visible while active', () => {
    const { container } = render(
      <StaggerChildren useMotion={false} initialActive duration={200} easing="ease-in">
        <div>Item</div>
      </StaggerChildren>
    );
    const root = container.querySelector('[data-testid="stagger-children"]') as HTMLElement;
    expect(root.className).toContain('stagger-active');
    const child = container.querySelector('.stagger-child') as HTMLElement;
    // active + not animating yet => opacity 1, translateY 0
    expect(child.style.opacity).toBe('1');
    expect(child.style.transition).toContain('opacity 200ms ease-in');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StaggerChildren>
        <div>a</div>
      </StaggerChildren>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('merges custom childVariants and childTransition', () => {
    const { container } = render(
      <StaggerChildren
        initialActive
        childVariants={{ hidden: { opacity: 0 } }}
        childTransition={{ duration: 2 }}
      >
        <div>a</div>
      </StaggerChildren>
    );
    expect(container.querySelector('[data-testid="stagger-children-motion"]')).not.toBeNull();
  });

  it('renders the respect-reduced-motion class when matchMedia matches reduce', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    });
    try {
      const { container } = render(
        <StaggerChildren initialActive respectReducedMotion>
          <div>a</div>
        </StaggerChildren>
      );
      const root = container.querySelector('[data-testid="stagger-children-motion"]')!;
      expect(root.className).toContain('respect-reduced-motion');
    } finally {
      spy.mockRestore();
    }
  });
});

describe('useStaggerChildren', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initial state is inactive with an empty style object', () => {
    const hook = renderHook(() => useStaggerChildren());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
    expect(hook.result.current.style).toEqual({});
  });

  it('start() activates and fires onAnimationStart', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 2, onAnimationStart })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() with delay schedules the animation after the delay elapses', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 2, delay: 90, onAnimationStart })
    );
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(90));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 2 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() resets active state, position and child index', () => {
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 2 }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.stop());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.currentPosition).toBe(0);
    expect(hook.result.current.state.currentChildIndex).toBe(0);
  });

  it('toggle() starts then stops', () => {
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 2 }));
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('reset() clears repeatCount and complete flag', () => {
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 2, repeat: 1, duration: 50, staggerDelay: 10 })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.repeatCount).toBe(0);
    expect(hook.result.current.state.isComplete).toBe(false);
  });

  it('fires onRepeat and onAnimationComplete when all children finish (finite repeat)', () => {
    const onComplete = vi.fn();
    const onRepeat = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({
        childrenCount: 2,
        repeat: 1,
        duration: 50,
        staggerDelay: 10,
        onAnimationComplete: onComplete,
        onRepeat,
      })
    );
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(500));
    expect(onRepeat).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('getChildState reports isAnimating=false before the child delay elapses', () => {
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 3, duration: 100, staggerDelay: 50 })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    // index 2 should not be animating immediately (delay = 2 * 50 = 100ms)
    const child = hook.result.current.getChildState(2);
    expect(child.isAnimating).toBe(false);
    expect(child.delay).toBe(100);
  });

  it('getChildState reports progress after the child delay elapses', () => {
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 3, duration: 100, staggerDelay: 50 })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(120));
    const child = hook.result.current.getChildState(0);
    expect(child.progress).toBeGreaterThan(0);
  });

  it('getChildState returns idle when not active', () => {
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 3 }));
    const child = hook.result.current.getChildState(0);
    expect(child.isAnimating).toBe(false);
    expect(child.progress).toBe(0);
  });

  it('direction=reverse assigns the largest delay to the first child', () => {
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 3, staggerDelay: 50, direction: 'reverse' })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    const first = hook.result.current.getChildState(0);
    // reverse: index 0 => (3-1-0)*50 = 100
    expect(first.delay).toBe(100);
  });

  it('direction=center-out assigns smallest delay to the middle child', () => {
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 3, staggerDelay: 50, direction: 'center-out' })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    const middle = hook.result.current.getChildState(1);
    expect(middle.delay).toBe(0);
  });

  it('exposes aria-live/aria-busy attributes', () => {
    const hook = renderHook(() => useStaggerChildren());
    expect(hook.result.current.attributes['aria-live']).toBe('off');
    expect(hook.result.current.attributes['aria-busy']).toBe(false);
  });

  it('does not restart when start() is called while already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 2, onAnimationStart }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.start());
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause() is a no-op when not active', () => {
    const hook = renderHook(() => useStaggerChildren());
    actAndRerender(hook, () => hook.result.current.actions.pause());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => useStaggerChildren());
    actAndRerender(hook, () => hook.result.current.actions.resume());
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('fires onStateChange when state mutates', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 2, onStateChange }));
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    expect(onStateChange).toHaveBeenCalled();
  });

  it('initialActive=true marks the animation active on mount', () => {
    const hook = renderHook(() => useStaggerChildren({ childrenCount: 2, initialActive: true }));
    hook.rerender();
    expect(hook.result.current.state.isActive).toBe(true);
  });

  it('respects reduced motion: start() jumps to complete and fires onAnimationComplete', () => {
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
        useStaggerChildren({ respectReducedMotion: true, childrenCount: 2, onAnimationComplete: onComplete })
      );
      expect(hook.result.current.state.respectReducedMotion).toBe(true);
      actAndRerender(hook, () => hook.result.current.actions.start());
      expect(hook.result.current.state.isActive).toBe(false);
      expect(hook.result.current.state.isComplete).toBe(true);
      expect(hook.result.current.state.currentPosition).toBe(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      // getChildState returns idle under reduced motion
      expect(hook.result.current.getChildState(0).isAnimating).toBe(false);
    } finally {
      matchMediaSpy.mockRestore();
    }
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
      const hook = renderHook(() =>
        useStaggerChildren({ respectReducedMotion: true, childrenCount: 2 })
      );
      actAndRerender(hook, () => hook.result.current.actions.start());
      expect(hook.result.current.state.isComplete).toBe(true);
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it('stops the repeat cycle when stopped before the next cycle begins', () => {
    const onRepeat = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 1, repeat: 0, duration: 30, staggerDelay: 0, onRepeat })
    );
    act(() => hook.result.current.actions.start());
    // advance past the first cycle so onRepeat fires and a between-cycle timeout
    // is scheduled, then stop before that timeout re-runs executeAnimation.
    act(() => vi.advanceTimersByTime(40));
    const callsAfterFirstCycle = onRepeat.mock.calls.length;
    expect(callsAfterFirstCycle).toBeGreaterThanOrEqual(1);
    act(() => hook.result.current.actions.stop());
    act(() => vi.advanceTimersByTime(500));
    // no further repeats fire after stop
    expect(onRepeat.mock.calls.length).toBe(callsAfterFirstCycle);
  });

  it('repeats indefinitely (repeat=0) by re-running the cycle', () => {
    const onRepeat = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 1, repeat: 0, duration: 30, staggerDelay: 0, onRepeat })
    );
    act(() => hook.result.current.actions.start());
    // advance past the first cycle plus the 100ms between-cycle gap so the
    // recursive re-run fires onRepeat more than once.
    act(() => vi.advanceTimersByTime(500));
    expect(onRepeat.mock.calls.length).toBeGreaterThan(1);
  });

  it('start() clears pending delay timeout and animation frame when restarted', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 2, delay: 80, duration: 200, onAnimationStart })
    );
    act(() => hook.result.current.actions.start());
    // restart before delay elapses: clears the pending timeout + any rAF
    act(() => hook.result.current.actions.start());
    act(() => vi.advanceTimersByTime(80));
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() cancels a queued animation frame when restarted from a paused state', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 2, duration: 200, onAnimationStart })
    );
    act(() => hook.result.current.actions.start());
    // animation is running and a rAF is queued; pause lets start()'s guard pass
    act(() => hook.result.current.actions.pause());
    expect(() => act(() => hook.result.current.actions.start())).not.toThrow();
  });

  it('stop() clears a pending delayed timeout', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() =>
      useStaggerChildren({ childrenCount: 2, delay: 80, onAnimationStart })
    );
    act(() => hook.result.current.actions.start());
    act(() => hook.result.current.actions.stop());
    act(() => vi.advanceTimersByTime(80));
    expect(onAnimationStart).not.toHaveBeenCalled();
  });
});
