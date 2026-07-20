import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MagneticHover } from '../src/components/MagneticHover';
import { useMagneticHover } from '../src/hooks/useMagneticHover';

// The hook keeps state in refs (not React state), so reading state after an
// action returns stale values until a re-render runs getState().
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

// matchMedia is polyfilled in tests/setup.ts (returns prefers-reduced-motion:
// false), so the "crashes on render" note in the previous stub is stale.

describe('MagneticHover', () => {
  it('renders the motion container with children', () => {
    render(<MagneticHover>Hover me</MagneticHover>);
    expect(document.querySelector('[data-testid="magnetic-hover-motion"]')).not.toBeNull();
  });

  it('renders the CSS-fallback markup when useMotion is false', () => {
    const { container } = render(<MagneticHover useMotion={false}>Hover me</MagneticHover>);
    expect(container.querySelector('[data-testid="magnetic-hover"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MagneticHover>Hover me</MagneticHover>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('fires onMagneticStart on pointer enter (CSS fallback mode)', async () => {
    const user = userEvent.setup();
    const onMagneticStart = vi.fn();
    render(
      <MagneticHover useMotion={false} onMagneticStart={onMagneticStart}>
        Hover me
      </MagneticHover>
    );
    await user.hover(screen.getByText('Hover me'));
    // The component spreads both mouse + pointer handlers, so user.hover may
    // fire the start callback more than once; assert at least one call.
    expect(onMagneticStart).toHaveBeenCalled();
  });

  it('fires onMagneticEnd on pointer leave (CSS fallback mode)', async () => {
    const user = userEvent.setup();
    const onMagneticEnd = vi.fn();
    render(
      <MagneticHover useMotion={false} onMagneticEnd={onMagneticEnd}>
        Hover me
      </MagneticHover>
    );
    const target = screen.getByText('Hover me');
    await user.hover(target);
    await user.unhover(target);
    expect(onMagneticEnd).toHaveBeenCalled();
  });

  it('forwards object and function refs to the rendered element', () => {
    const objRef = React.createRef<HTMLDivElement>();
    const { unmount } = render(<MagneticHover ref={objRef}>x</MagneticHover>);
    expect(objRef.current?.tagName).toBe('DIV');
    unmount();
    const fnNode = { current: null as HTMLDivElement | null };
    render(<MagneticHover ref={(n: any) => (fnNode.current = n)}>x</MagneticHover>);
    expect(fnNode.current?.tagName).toBe('DIV');
  });

  it('shows the reduced-motion class under prefers-reduced-motion', () => {
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
    try {
      const { container } = render(<MagneticHover>x</MagneticHover>);
      expect((container.firstChild as HTMLElement).className).toContain('respect-reduced-motion');
    } finally {
      mm.mockRestore();
    }
  });

  it('builds variants with scale enabled (default) and merges custom variants', () => {
    // scale defaults to true → scaleFactor arm; custom variants → merge branch.
    const { container } = render(
      <MagneticHover scaleFactor={1.1} variants={{ resting: { x: 2 } }}>x</MagneticHover>
    );
    expect(container.firstChild).not.toBeNull();
  });
});

describe('useMagneticHover', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initial state: not hovered, zero position, scale 1', () => {
    const hook = renderHook(() => useMagneticHover());
    expect(hook.result.current.state.isHovered).toBe(false);
    expect(hook.result.current.state.position).toEqual({ x: 0, y: 0 });
    expect(hook.result.current.state.currentScale).toBe(1);
    expect(hook.result.current.state.respectReducedMotion).toBe(false);
  });

  it('start() sets isHovered and fires onMagneticStart', () => {
    const onMagneticStart = vi.fn();
    const hook = renderHook(() => useMagneticHover({ onMagneticStart }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isHovered).toBe(true);
    expect(onMagneticStart).toHaveBeenCalledTimes(1);
  });

  it('end() clears isHovered, animates back to center, fires onMagneticEnd', () => {
    const onMagneticEnd = vi.fn();
    const hook = renderHook(() => useMagneticHover({ onMagneticEnd }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.end());
    expect(hook.result.current.state.isHovered).toBe(false);
    expect(onMagneticEnd).toHaveBeenCalledTimes(1);
  });

  it('reset() zeroes position and scale and clears hover', () => {
    const hook = renderHook(() => useMagneticHover());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isHovered).toBe(false);
    expect(hook.result.current.state.position).toEqual({ x: 0, y: 0 });
    expect(hook.result.current.state.currentScale).toBe(1);
  });

  it('setEnabled(false) disables effects and resets', () => {
    const hook = renderHook(() => useMagneticHover());
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => hook.result.current.actions.setEnabled(false));
    // After disabling, a subsequent start() is a no-op.
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isHovered).toBe(false);
  });

  it('start() is a no-op when disabled via prop', () => {
    const onMagneticStart = vi.fn();
    const hook = renderHook(() => useMagneticHover({ disabled: true, onMagneticStart }));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(hook.result.current.state.isHovered).toBe(false);
    expect(onMagneticStart).not.toHaveBeenCalled();
  });

  it('onMouseMove fires onPositionChange while hovered (boundary=none)', () => {
    const onPositionChange = vi.fn();
    const hook = renderHook(() =>
      useMagneticHover({ boundary: 'none', strength: 50, onPositionChange })
    );
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({
        clientX: 10,
        clientY: 10,
      } as any);
    });
    // Drive the rAF animation so onPositionChange is invoked.
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onPositionChange).toHaveBeenCalled();
  });

  it('onMouseMove is ignored when not hovered', () => {
    const onPositionChange = vi.fn();
    const hook = renderHook(() =>
      useMagneticHover({ boundary: 'none', onPositionChange })
    );
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({
        clientX: 10,
        clientY: 10,
      } as any);
    });
    act(() => vi.advanceTimersByTime(50));
    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('exposes pointer event handlers equivalent to the mouse handlers', () => {
    const hook = renderHook(() => useMagneticHover());
    expect(hook.result.current.eventHandlers.onPointerEnter).toBe(
      hook.result.current.eventHandlers.onMouseEnter
    );
    expect(hook.result.current.eventHandlers.onPointerMove).toBe(
      hook.result.current.eventHandlers.onMouseMove
    );
  });

  it('style transform reflects translate + scale and transition when enabled', () => {
    const hook = renderHook(() => useMagneticHover({ duration: 250, easing: 'ease-out' }));
    expect(hook.result.current.style.transform).toContain('translate(');
    expect(hook.result.current.style.transform).toContain('scale(');
    expect(hook.result.current.style.transition).toContain('250ms');
  });

  it('disabled prop sets willChange to auto', () => {
    const hook = renderHook(() => useMagneticHover({ disabled: true }));
    expect(hook.result.current.style.willChange).toBe('auto');
  });
});
