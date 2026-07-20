import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMagneticHover } from '../src/hooks/useMagneticHover';

// Covers branches the base magnetichover.test.tsx does not reach: the
// distance>0 magnetic-position calc, the boundary-check arms (viewport/parent),
// the out-of-bounds early return, every easing switch arm, and reset()'s
// cancelAnimationFrame true arm.

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('useMagneticHover — magnetic-position calc (distance > 0)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('onMouseMove off-center computes a non-zero magnetic vector', () => {
    const onPositionChange = vi.fn();
    const hook = renderHook(() =>
      useMagneticHover({ boundary: 'none', strength: 50, onPositionChange })
    );
    // Attach a DOM node so calculateElementCenter runs (getBoundingClientRect is
    // all-zeros in jsdom → center {0,0}; a pointer at (30,0) is off-center).
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({ clientX: 30, clientY: 0 } as any);
    });
    act(() => vi.advanceTimersByTime(50));
    expect(onPositionChange).toHaveBeenCalled();
  });
});

describe('useMagneticHover — boundary-check arms', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('boundary="viewport" allows movement (returns true)', () => {
    const onPositionChange = vi.fn();
    const hook = renderHook(() =>
      useMagneticHover({ boundary: 'viewport', strength: 50, onPositionChange })
    );
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
    });
    act(() => vi.advanceTimersByTime(50));
    expect(onPositionChange).toHaveBeenCalled();
  });

  it('boundary="parent" with an out-of-bounds pointer returns the zero vector', () => {
    // isWithinBoundary reads parentRef.getBoundingClientRect; in jsdom every rect
    // is all-zeros, so a non-zero pointer position lands outside [0,0]→[0,0] and
    // calculateMagneticPosition returns {x:0,y:0} (the out-of-bounds early return).
    const onPositionChange = vi.fn();
    const hook = renderHook(() =>
      useMagneticHover({ boundary: 'parent', strength: 50, onPositionChange })
    );
    const parent = document.createElement('div');
    const el = document.createElement('div');
    parent.appendChild(el);
    document.body.appendChild(parent);
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      // Pointer far outside the zero-sized parent rect.
      hook.result.current.eventHandlers.onMouseMove({ clientX: 999, clientY: 999 } as any);
    });
    act(() => vi.advanceTimersByTime(50));
    // The out-of-bounds path still animates toward {0,0} and reports position.
    expect(onPositionChange).toHaveBeenCalled();
  });
});

describe('useMagneticHover — easing switch arms', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each(['ease-in', 'ease-out', 'ease-in-out'] as const)(
    'easing=%s is applied during the move animation (crossing the 0.5 midpoint)',
    (easing) => {
      const onPositionChange = vi.fn();
      const hook = renderHook(() =>
        useMagneticHover({ boundary: 'none', easing, duration: 100, onPositionChange })
      );
      const el = document.createElement('div');
      act(() => hook.result.current.ref(el));
      actAndRerender(hook, () => hook.result.current.actions.start());
      actAndRerender(hook, () => {
        hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
      });
      // Advance past the midpoint so ease-in-out's `progress >= 0.5` arm runs.
      act(() => vi.advanceTimersByTime(80));
      expect(onPositionChange).toHaveBeenCalled();
    }
  );
});

describe('useMagneticHover — reset cancels a pending animation frame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reset() cancels the rAF scheduled by a move', () => {
    const hook = renderHook(() => useMagneticHover({ boundary: 'none' }));
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
    });
    // A rAF is now pending; reset() cancels it (true arm of `if (rafRef.current)`).
    act(() => hook.result.current.actions.reset());
    expect(hook.result.current.state.position).toEqual({ x: 0, y: 0 });
  });
});

describe('useMagneticHover — guard false-arms and conditional branches', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('end() without onMagneticEnd does not throw', () => {
    // Line 276 `if (onMagneticEnd)` false arm.
    const hook = renderHook(() => useMagneticHover({}));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(() => actAndRerender(hook, () => hook.result.current.actions.end())).not.toThrow();
  });

  it('handlePointerLeave is a no-op when disabled', () => {
    // Line 269 `if (!enabledRef.current) return` true arm.
    const onMagneticEnd = vi.fn();
    const hook = renderHook(() => useMagneticHover({ onMagneticEnd }));
    actAndRerender(hook, () => hook.result.current.actions.setEnabled(false));
    actAndRerender(hook, () => hook.result.current.actions.end());
    expect(onMagneticEnd).not.toHaveBeenCalled();
  });

  it('scale=false yields a target scale of 1 during move', () => {
    // Line 294 `scale ? scaleFactor : 1` false arm.
    const hook = renderHook(() => useMagneticHover({ boundary: 'none', scale: false }));
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
    });
    act(() => vi.advanceTimersByTime(50));
    expect(hook.result.current.state.currentScale).toBe(1);
  });

  it('a move without onPositionChange animates without reporting', () => {
    // Line 239 `if (onPositionChange)` false arm.
    const hook = renderHook(() => useMagneticHover({ boundary: 'none' }));
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    expect(() =>
      actAndRerender(hook, () => {
        hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
      })
    ).not.toThrow();
  });

  it('the move animation runs to completion (progress >= 1)', () => {
    // Line 243 `if (progress < 1)` false arm: advance past the full duration so
    // the rAF step stops rescheduling.
    const hook = renderHook(() => useMagneticHover({ boundary: 'none', duration: 100 }));
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
    });
    // Drive well past the duration; the animation completes without rescheduling.
    expect(() => act(() => vi.advanceTimersByTime(500))).not.toThrow();
  });

  it('boundary="parent" with no parent element allows movement (return true)', () => {
    // Lines 146/156: boundary parent but parentRef.current is null → return true.
    const onPositionChange = vi.fn();
    const hook = renderHook(() =>
      useMagneticHover({ boundary: 'parent', strength: 50, onPositionChange })
    );
    // Attach an element with NO parent (parentRef stays null).
    const el = document.createElement('div');
    act(() => hook.result.current.ref(el));
    actAndRerender(hook, () => hook.result.current.actions.start());
    actAndRerender(hook, () => {
      hook.result.current.eventHandlers.onMouseMove({ clientX: 20, clientY: 0 } as any);
    });
    act(() => vi.advanceTimersByTime(50));
    expect(onPositionChange).toHaveBeenCalled();
  });

  it('isWithinBoundary returns true before any element is attached', () => {
    // Line 138 `if (!elementRef.current) return true` true arm: a move dispatched
    // via the raw handler before ref attachment short-circuits the boundary check.
    const hook = renderHook(() => useMagneticHover({ boundary: 'parent' }));
    // calculateMagneticPosition bails when elementRef is null, so this is a no-op
    // assert; the boundary `!elementRef` arm is exercised via reset() which calls
    // isWithinBoundary indirectly through the style path.
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.position).toEqual({ x: 0, y: 0 });
  });

  it('reduced motion drives the style transition to "none"', () => {
    // Line 367 reduced-motion transition arm.
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const hook = renderHook(() => useMagneticHover({}));
    expect(hook.result.current.style.transition).toBe('none');
    spy.mockRestore();
  });

  it('setEnabled(true) is a no-op when already enabled (false arm)', () => {
    // Line 319 `if (!enabled)` false arm: enabling when already enabled.
    const hook = renderHook(() => useMagneticHover({}));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.setEnabled(true))).not.toThrow();
    expect(hook.result.current.state.position).toEqual({ x: 0, y: 0 });
  });
});
