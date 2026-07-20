import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSlideIn } from '../src/hooks/useSlideIn';

// Covers branches the base slidein.test.tsx does not reach: the reduced-motion
// short-circuit (effectiveDuration === 0 jump-to-end), each easing-function arm,
// the getSlideValues default case, and the no-op/cleanup guard false-arms.

function enableReducedMotion() {
  return vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
    matches: q.includes('reduce'),
    media: q,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe('useSlideIn — reduced-motion short-circuit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('slideIn() under reduced motion jumps straight to the end state', () => {
    const spy = enableReducedMotion();
    const onStart = vi.fn();
    const onComplete = vi.fn();
    const onTransformChange = vi.fn();
    const h = renderHook(() =>
      useSlideIn({ onAnimationStart: onStart, onAnimationComplete: onComplete, onTransformChange })
    );
    act(() => h.result.current.actions.slideIn());
    expect(h.result.current.state.isVisible).toBe(true);
    expect(h.result.current.state.isAnimating).toBe(false);
    expect(h.result.current.state.isComplete).toBe(true);
    expect(onStart).toHaveBeenCalledWith('up', 'in');
    expect(onComplete).toHaveBeenCalledWith(true);
    expect(onTransformChange).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('reduced motion drives cssTransition to "none"', () => {
    const spy = enableReducedMotion();
    const h = renderHook(() => useSlideIn({}));
    expect(h.result.current.computed.cssTransition).toBe('none');
    spy.mockRestore();
  });
});

describe('useSlideIn — easing function arms', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each(['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const)(
    'easing=%s is applied during the animation step',
    (easing) => {
      const onTransformChange = vi.fn();
      const h = renderHook(() => useSlideIn({ easing, onTransformChange }));
      act(() => h.result.current.actions.slideIn());
      act(() => vi.advanceTimersByTime(150));
      expect(onTransformChange).toHaveBeenCalled();
    }
  );
});

describe('useSlideIn — getSlideValues default case', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('an invalid direction falls through to the default (up) mapping', () => {
    // slideIn/toggle pass the direction to animate→getSlideValues; a bogus
    // direction exercises the switch default arm.
    const onStart = vi.fn();
    const h = renderHook(() =>
      useSlideIn({ direction: 'bogus' as any, onAnimationStart: onStart })
    );
    act(() => h.result.current.actions.slideIn());
    expect(onStart).toHaveBeenCalledWith('bogus', 'in');
    act(() => vi.advanceTimersByTime(500));
    expect(h.result.current.state.isVisible).toBe(true);
  });
});

describe('useSlideIn — guard false-arms and reset', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('slideOut() while not visible is a no-op', () => {
    // Line 252 `if (isVisible)` false arm.
    const onStart = vi.fn();
    const h = renderHook(() => useSlideIn({ onAnimationStart: onStart }));
    act(() => h.result.current.actions.slideOut());
    expect(onStart).not.toHaveBeenCalled();
  });

  it('setVisible with the current value is a no-op (both directions)', () => {
    // Line 275 `if (visible !== isVisible)` false arm: setVisible matches the
    // current visibility in both the hidden and visible states.
    const onStart = vi.fn();
    const h = renderHook(() => useSlideIn({ onAnimationStart: onStart }));
    // hidden → setVisible(false) is a no-op.
    act(() => h.result.current.actions.setVisible(false));
    expect(onStart).not.toHaveBeenCalled();
    // Drive to visible, then setVisible(true) is a no-op.
    act(() => h.result.current.actions.setVisible(true));
    act(() => vi.advanceTimersByTime(500));
    onStart.mockClear();
    act(() => h.result.current.actions.setVisible(true));
    expect(onStart).not.toHaveBeenCalled();
  });

  it('setVisible(false) while visible animates out (the "out" type arm)', () => {
    // Line 275 `visible ? 'in' : 'out'` — the 'out' arm requires setVisible to
    // actually animate with visible=false.
    const onStart = vi.fn();
    const h = renderHook(() => useSlideIn({ initialVisible: true, onAnimationStart: onStart }));
    // initialVisible triggers a mount animation; settle it first.
    act(() => vi.advanceTimersByTime(500));
    onStart.mockClear();
    act(() => h.result.current.actions.setVisible(false));
    expect(onStart).toHaveBeenCalledWith('up', 'out');
  });

  it('stop()/reset() with no running animation do not throw', () => {
    // Line 280 `if (animationRef.current)` false arm in stop, and reset's guard.
    const h = renderHook(() => useSlideIn({}));
    act(() => h.result.current.actions.stop());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isAnimating).toBe(false);
  });

  it('reset() cancels a running animation (true arm of the guard)', () => {
    const h = renderHook(() => useSlideIn({}));
    act(() => h.result.current.actions.slideIn());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isAnimating).toBe(false);
  });
});
