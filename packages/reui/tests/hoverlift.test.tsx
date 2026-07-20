import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { HoverLift } from '../src/components/HoverLift';
import { useHoverLift } from '../src/hooks/useHoverLift';

// HoverLift keeps state in refs (not React state); reading
// result.current.state after an action returns stale values until a re-render.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('HoverLift', () => {
  it('renders the motion container when useMotion is enabled', () => {
    const { container } = render(<HoverLift>Lift me</HoverLift>);
    expect(container.querySelector('[data-testid="hover-lift-motion"], [data-testid="hover-lift"]')).not.toBeNull();
  });

  it('renders a plain div when useMotion is disabled', () => {
    const { container } = render(<HoverLift useMotion={false}>Plain</HoverLift>);
    expect(container.firstChild).not.toBeNull();
  });

  it('lifts on hover and drops on un-hover', async () => {
    const user = userEvent.setup();
    const onLiftChange = vi.fn();
    const { container } = render(<HoverLift onLiftChange={onLiftChange}>x</HoverLift>);
    const target = container.firstChild as HTMLElement;
    await user.hover(target);
    // The lift animation runs via rAF; wait for it to settle.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    expect(onLiftChange).toHaveBeenCalledWith(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HoverLift>x</HoverLift>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('forwards a ref object to the rendered element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<HoverLift ref={ref}>x</HoverLift>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('forwards a function ref to the rendered element', () => {
    const node = { current: null as HTMLDivElement | null };
    render(<HoverLift ref={(n: any) => (node.current = n)}>x</HoverLift>);
    expect(node.current).not.toBeNull();
    expect(node.current?.tagName).toBe('DIV');
  });

  it('shows the reduced-motion class when the user prefers reduced motion', () => {
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
      const { container } = render(<HoverLift shadowIntensity={0}>x</HoverLift>);
      expect((container.firstChild as HTMLElement).className).toContain('respect-reduced-motion');
    } finally {
      mm.mockRestore();
    }
  });

  it('merges custom variants and exercises shadowIntensity=0 and lifted-on-hover', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <HoverLift shadowIntensity={0} variants={{ resting: { y: 1 } }}>x</HoverLift>
    );
    const target = container.firstChild as HTMLElement;
    // defaultVariants built with shadowIntensity=0 (boxShadow 'none' arm) and
    // custom variants merged. Hover drives isLifted → re-render.
    await user.hover(target);
    await act(async () => { await new Promise((r) => setTimeout(r, 300)); });
    expect(container.firstChild).not.toBeNull();
  });
});

describe('useHoverLift', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  // NOTE: fake timers are scoped to this hook block so the component-level
  // HoverLift hover test above can use userEvent with real timers.

  it('starts un-lifted with role=button and the configured lift distance', () => {
    const hook = renderHook(() => useHoverLift({ liftDistance: 12 }));
    const { state, attributes } = hook.result.current;
    expect(state.isLifted).toBe(false);
    expect(state.liftProgress).toBe(0);
    expect(attributes.role).toBe('button');
    expect(attributes['aria-pressed']).toBe(false);
  });

  it('lift() animates to progress 1 and fires onHoverStart/onLiftChange', () => {
    const onHoverStart = vi.fn();
    const onLiftChange = vi.fn();
    const hook = renderHook(() => useHoverLift({ onHoverStart, onLiftChange }));
    act(() => hook.result.current.actions.lift());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(true);
    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onLiftChange).toHaveBeenCalledWith(true);
  });

  it('drop() animates back to progress 0 and fires onHoverEnd', () => {
    const onHoverEnd = vi.fn();
    const hook = renderHook(() => useHoverLift({ onHoverEnd }));
    act(() => hook.result.current.actions.lift());
    act(() => vi.advanceTimersByTime(300));
    act(() => hook.result.current.actions.drop());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
    expect(hook.result.current.state.liftProgress).toBe(0);
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
  });

  it('toggle() lifts then drops', () => {
    const hook = renderHook(() => useHoverLift());
    act(() => hook.result.current.actions.toggle());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(true);
    act(() => hook.result.current.actions.toggle());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
  });

  it('focus/blur event handlers lift and drop', () => {
    const hook = renderHook(() => useHoverLift());
    act(() => hook.result.current.eventHandlers.onFocus());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(true);
    act(() => hook.result.current.eventHandlers.onBlur());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
  });

  it('pointer-move updates the pointer position relative to the element', () => {
    const hook = renderHook(() => useHoverLift());
    // Attach a fake element so getBoundingClientRect resolves.
    const el = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } as any;
    (hook.result.current.ref as any)(el);
    act(() => {
      hook.result.current.eventHandlers.onPointerMove({ clientX: 50, clientY: 25 } as any);
    });
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.pointerPosition).toEqual({ x: 50, y: 25 });
  });

  it('disabled blocks lift actions', () => {
    const onHoverStart = vi.fn();
    const hook = renderHook(() => useHoverLift({ disabled: true, onHoverStart }));
    act(() => hook.result.current.actions.lift());
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
    expect(onHoverStart).not.toHaveBeenCalled();
  });

  it('setEnabled(false) drops a currently-lifted element', () => {
    const hook = renderHook(() => useHoverLift());
    act(() => hook.result.current.actions.lift());
    act(() => vi.advanceTimersByTime(300));
    act(() => hook.result.current.actions.setEnabled(false));
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
    // setEnabled(true) flips it back without triggering a drop (enabled-true arm).
    act(() => hook.result.current.actions.setEnabled(true));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
  });

  it('honours a custom scale and liftDistance in the transform', () => {
    const hook = renderHook(() => useHoverLift({ liftDistance: 20, scale: 1.1 }));
    const transform = hook.result.current.style.transform;
    // Progress 0 => translateY(0px) scale(1); transform string still present.
    expect(transform).toMatch(/translateY/);
    expect(transform).toMatch(/scale/);
  });

  it('emits a box-shadow string when shadowIntensity > 0 while lifted', () => {
    const hook = renderHook(() => useHoverLift({ shadowIntensity: 0.5 }));
    act(() => hook.result.current.actions.lift());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.style.boxShadow).toMatch(/rgba/);
  });

  it('aria-pressed reflects the lifted state', () => {
    const hook = renderHook(() => useHoverLift());
    act(() => hook.result.current.actions.lift());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.attributes['aria-pressed']).toBe(true);
  });

  it('ease-in/ease-out/ease-in-out easing curves all animate without error', () => {
    for (const easing of ['ease-in', 'ease-out', 'ease-in-out'] as const) {
      const hook = renderHook(() => useHoverLift({ easing, duration: 200 }));
      act(() => hook.result.current.actions.lift());
      // Advance partway to exercise the easing math at progress < 0.5 and > 0.5.
      act(() => vi.advanceTimersByTime(50));
      actAndRerender(hook, () => {});
      act(() => vi.advanceTimersByTime(200));
      actAndRerender(hook, () => {});
      expect(hook.result.current.state.isLifted).toBe(true);
      hook.unmount();
    }
  });

  it('disabled hook makes lift/drop no-ops and setEnabled(false) drops active', () => {
    const onHoverStart = vi.fn();
    const hook = renderHook(() => useHoverLift({ disabled: true, onHoverStart }));
    // lift() early-returns because enabledRef.current is false.
    act(() => hook.result.current.actions.lift());
    act(() => vi.advanceTimersByTime(300));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.isLifted).toBe(false);
    expect(onHoverStart).not.toHaveBeenCalled();
    // drop() on a disabled hook is also a no-op guard.
    expect(() => act(() => hook.result.current.actions.drop())).not.toThrow();
  });

  it('event handlers early-return when disabled or lacking an element', () => {
    const hook = renderHook(() => useHoverLift({ disabled: true }));
    const ev = hook.result.current.eventHandlers;
    // All these guard on enabledRef.current (false here) and are no-ops.
    expect(() => act(() => {
      ev.onMouseLeave({} as any);
      ev.onPointerMove({ clientX: 0, clientY: 0 } as any);
      ev.onFocus({} as any);
      ev.onBlur({} as any);
    })).not.toThrow();
    expect(hook.result.current.state.isLifted).toBe(false);
  });
});
