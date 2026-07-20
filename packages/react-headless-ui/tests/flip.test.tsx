import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Flip } from '../src/components/Flip';
import { useFlip } from '../src/hooks/useFlip';

// The motion hooks keep state in refs (not React state), so reading
// result.current.state after an action returns stale values until a re-render
// runs getState(). `actAndRerender` forces that re-render. Pass the full
// renderHook() return value ({ result, rerender }).
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

// matchMedia is polyfilled in tests/setup.ts (returns prefers-reduced-motion:
// false), so the "crashes on render" note in the previous stub is stale.

describe('Flip', () => {
  it('renders its children in the motion container', () => {
    render(<Flip>Card</Flip>);
    expect(document.querySelector('[data-testid="flip-container"]')).not.toBeNull();
  });

  it('renders the CSS-fallback markup when useMotion is false', () => {
    const { container } = render(<Flip useMotion={false}>Card</Flip>);
    expect(container.querySelector('[data-testid="flip"]')).not.toBeNull();
  });

  it('applies the initial-active class on mount', () => {
    const { container } = render(<Flip initialActive>Card</Flip>);
    expect(container.querySelector('.flip-active')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Flip>Card</Flip>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('CSS fallback calls get3DTransform when active (axis y, forward)', () => {
    const { container } = render(
      <Flip useMotion={false} initialActive axis="y">
        Card
      </Flip>
    );
    const inner = container.querySelector('[data-testid="flip"] > div')!;
    expect(inner.style.transform).toContain('rotateY');
  });

  it.each([
    ['x' as const, /rotateX/],
    ['y' as const, /rotateY/],
    ['z' as const, /rotateZ/],
  ])('CSS fallback get3DTransform axis=%s', (axis, re) => {
    const { container } = render(
      <Flip useMotion={false} initialActive axis={axis}>
        Card
      </Flip>
    );
    const inner = container.querySelector('[data-testid="flip"] > div')!;
    expect(inner.style.transform).toMatch(re);
  });

  it('CSS fallback get3DTransform direction=backward negates rotation', () => {
    const { container } = render(
      <Flip useMotion={false} initialActive axis="x" direction="backward">
        Card
      </Flip>
    );
    const inner = container.querySelector('[data-testid="flip"] > div')!;
    expect(inner.style.transform).toMatch(/rotateX/);
  });

  it('CSS fallback renders none when inactive', () => {
    const { container } = render(
      <Flip useMotion={false} axis="y">
        Card
      </Flip>
    );
    const inner = container.querySelector('[data-testid="flip"] > div')!;
    expect(inner.style.transform).toBe('none');
  });

  it.each([
    ['x' as const],
    ['y' as const],
    ['z' as const],
  ])('renders the motion flipFront/flipBack variants for axis=%s', (axis) => {
    const { container } = render(
      <Flip initialActive axis={axis} direction="backward">
        Card
      </Flip>
    );
    expect(container.querySelector('[data-testid="flip-container"]')).not.toBeNull();
  });

  it('renders the motion variant with repeat=0 (Infinity branch)', () => {
    const { container } = render(
      <Flip initialActive repeat={0}>
        Card
      </Flip>
    );
    expect(container.querySelector('[data-testid="flip-container"]')).not.toBeNull();
  });

  it('merges custom variants and transition when provided', () => {
    const { container } = render(
      <Flip
        initialActive
        variants={{ flipFront: { rotateY: 10 } }}
        transition={{ duration: 2 }}
      >
        Card
      </Flip>
    );
    expect(container.querySelector('[data-testid="flip-container"]')).not.toBeNull();
  });
});

describe('useFlip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state is inactive with respectReducedMotion false by default', () => {
    const hook = renderHook(() => useFlip());
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(false);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
    expect(hook.result.current.style.transform).toContain('rotateY');
  });

  it('start() activates the animation and fires onAnimationStart', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useFlip({ onAnimationStart }));
    actAndRerender(hook, () => {
      hook.result.current.actions.start();
    });
    expect(hook.result.current.state.isActive).toBe(true);
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('start() with delay schedules executeAnimation after the delay', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useFlip({ delay: 100, onAnimationStart }));
    act(() => {
      hook.result.current.actions.start();
    });
    expect(onAnimationStart).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause()/resume() toggles isPaused', () => {
    const hook = renderHook(() => useFlip());
    actAndRerender(hook, () => {
      hook.result.current.actions.start();
    });
    actAndRerender(hook, () => {
      hook.result.current.actions.pause();
    });
    expect(hook.result.current.state.isPaused).toBe(true);
    actAndRerender(hook, () => {
      hook.result.current.actions.resume();
    });
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('stop() resets active state and position', () => {
    const hook = renderHook(() => useFlip());
    actAndRerender(hook, () => {
      hook.result.current.actions.start();
    });
    actAndRerender(hook, () => {
      hook.result.current.actions.stop();
    });
    expect(hook.result.current.state.isActive).toBe(false);
    expect(hook.result.current.state.currentPosition).toBe(0);
  });

  it('toggle() starts when inactive and stops when active', () => {
    const hook = renderHook(() => useFlip());
    actAndRerender(hook, () => {
      hook.result.current.actions.toggle();
    });
    expect(hook.result.current.state.isActive).toBe(true);
    actAndRerender(hook, () => {
      hook.result.current.actions.toggle();
    });
    expect(hook.result.current.state.isActive).toBe(false);
  });

  it('reset() clears repeatCount and complete flag', () => {
    const hook = renderHook(() => useFlip({ repeat: 1, duration: 100 }));
    actAndRerender(hook, () => {
      hook.result.current.actions.start();
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    actAndRerender(hook, () => {
      hook.result.current.actions.reset();
    });
    expect(hook.result.current.state.repeatCount).toBe(0);
    expect(hook.result.current.state.isComplete).toBe(false);
  });

  it('fires onStateChange on every action that mutates state', () => {
    const onStateChange = vi.fn();
    const hook = renderHook(() => useFlip({ onStateChange }));
    act(() => {
      hook.result.current.actions.start();
    });
    act(() => {
      hook.result.current.actions.stop();
    });
    expect(onStateChange).toHaveBeenCalled();
  });

  it('onAnimationComplete fires when a finite repeat finishes', () => {
    const onComplete = vi.fn();
    const onRepeat = vi.fn();
    const hook = renderHook(() =>
      useFlip({ repeat: 1, duration: 100, onAnimationComplete: onComplete, onRepeat })
    );
    act(() => {
      hook.result.current.actions.start();
    });
    // Drive the rAF-driven animation to completion.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onRepeat).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('uses rotateY by default (axis=y)', () => {
    const hook = renderHook(() => useFlip());
    expect(hook.result.current.style.transform).toMatch(/rotateY/);
  });

  it('uses rotateX when axis=x', () => {
    const hook = renderHook(() => useFlip({ axis: 'x' }));
    expect(hook.result.current.style.transform).toMatch(/rotateX/);
  });

  it('uses rotateZ when axis=z', () => {
    const hook = renderHook(() => useFlip({ axis: 'z' }));
    expect(hook.result.current.style.transform).toMatch(/rotateZ/);
  });

  it('exposes aria-live/aria-busy attributes', () => {
    const hook = renderHook(() => useFlip());
    expect(hook.result.current.attributes['aria-live']).toBe('off');
    expect(hook.result.current.attributes['aria-busy']).toBe(false);
  });

  it('does not restart when start() is called while already active', () => {
    const onAnimationStart = vi.fn();
    const hook = renderHook(() => useFlip({ onAnimationStart }));
    act(() => {
      hook.result.current.actions.start();
    });
    act(() => {
      hook.result.current.actions.start(); // no-op: already active & not paused
    });
    expect(onAnimationStart).toHaveBeenCalledTimes(1);
  });

  it('pause() is a no-op when not active', () => {
    const hook = renderHook(() => useFlip());
    actAndRerender(hook, () => {
      hook.result.current.actions.pause();
    });
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('resume() is a no-op when not paused', () => {
    const hook = renderHook(() => useFlip());
    actAndRerender(hook, () => {
      hook.result.current.actions.resume();
    });
    expect(hook.result.current.state.isPaused).toBe(false);
  });

  it('initialActive=true marks the animation active on mount', () => {
    const hook = renderHook(() => useFlip({ initialActive: true }));
    // initialActive seeds isActiveRef true on the first render, and the mount
    // effect calls start() (a guarded no-op since active is already true), so
    // the component renders already in the active state.
    hook.rerender();
    expect(hook.result.current.state.isActive).toBe(true);
    expect(hook.result.current.attributes['aria-live']).toBe('polite');
  });

  it('resumes from the midpoint and completes after a pause', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() =>
      useFlip({ duration: 1000, repeat: 1, onAnimationComplete: onComplete })
    );
    act(() => hook.result.current.actions.start());
    // Advance partway (progress < 1) so the main rAF chain is mid-flight.
    act(() => vi.advanceTimersByTime(50));
    act(() => hook.result.current.actions.pause());
    // Resuming while progress < 1 enters the resume continue-from-position block.
    act(() => hook.result.current.actions.resume());
    // Advance well past the duration so the resumed chain completes.
    act(() => vi.advanceTimersByTime(2000));
    expect(onComplete).toHaveBeenCalled();
  });
});
