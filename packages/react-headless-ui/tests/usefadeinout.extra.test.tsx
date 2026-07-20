import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useFadeInOut } from '../src/hooks/useFadeInOut';

// Covers branches the base fadeinout.test.tsx does not reach: the reduced-motion
// short-circuit (effectiveDuration === 0 jump-to-end), each easing-function arm,
// the getOpacityValues default case, and the no-op guard false-arms.

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

describe('useFadeInOut — reduced-motion short-circuit', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fadeIn() under reduced motion jumps straight to the end state', () => {
    const spy = enableReducedMotion();
    const onStart = vi.fn();
    const onComplete = vi.fn();
    const onOpacityChange = vi.fn();
    const h = renderHook(() =>
      useFadeInOut({ onAnimationStart: onStart, onAnimationComplete: onComplete, onOpacityChange })
    );
    act(() => h.result.current.actions.fadeIn());
    // Reduced motion => effectiveDuration 0 => animate() jumps to the end state.
    expect(h.result.current.state.isVisible).toBe(true);
    expect(h.result.current.state.isAnimating).toBe(false);
    expect(h.result.current.state.isComplete).toBe(true);
    expect(onStart).toHaveBeenCalledWith('in');
    expect(onComplete).toHaveBeenCalledWith(true);
    expect(onOpacityChange).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('reduced motion drives cssTransition to "none"', () => {
    const spy = enableReducedMotion();
    const h = renderHook(() => useFadeInOut({}));
    expect(h.result.current.computed.cssTransition).toBe('none');
    spy.mockRestore();
  });
});

describe('useFadeInOut — easing function arms', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // Each easing arm is exercised by driving a fadeIn animation partway so the
  // easingFunctions[easing](progress) line evaluates each branch.
  it.each(['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const)(
    'easing=%s is applied during the animation step',
    (easing) => {
      const onOpacityChange = vi.fn();
      const h = renderHook(() => useFadeInOut({ easing, onOpacityChange }));
      act(() => h.result.current.actions.fadeIn());
      act(() => vi.advanceTimersByTime(150));
      expect(onOpacityChange).toHaveBeenCalled();
    }
  );
});

describe('useFadeInOut — getOpacityValues default case', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('an invalid direction falls through to the default (in) mapping', () => {
    // setVisible/toggle pass currentDirection to animate→getOpacityValues, so a
    // bogus direction exercises the switch default arm (fadeIn/fadeOut hardcode
    // 'in'/'out' and bypass it).
    const onStart = vi.fn();
    const h = renderHook(() =>
      useFadeInOut({ direction: 'bogus' as any, onAnimationStart: onStart })
    );
    act(() => h.result.current.actions.setVisible(true));
    expect(onStart).toHaveBeenCalledWith('bogus');
    act(() => vi.advanceTimersByTime(500));
    expect(h.result.current.state.isVisible).toBe(true);
  });

  it('"in-out" direction covers the visible=true arm of its opacity ternary', () => {
    // in-out visible=true → from initialOpacity to finalOpacity.
    const onStart = vi.fn();
    const h = renderHook(() =>
      useFadeInOut({ direction: 'in-out', onAnimationStart: onStart })
    );
    act(() => h.result.current.actions.setVisible(true)); // targetVisible=true
    expect(onStart).toHaveBeenCalledWith('in-out');
    act(() => vi.advanceTimersByTime(500));
    expect(h.result.current.state.isVisible).toBe(true);
  });

  it('"in-out" direction covers the visible=false arm of its opacity ternary', () => {
    // in-out visible=false → from finalOpacity to initialOpacity.
    const onStart = vi.fn();
    const h = renderHook(() =>
      useFadeInOut({ direction: 'in-out', initialVisible: true, onAnimationStart: onStart })
    );
    act(() => h.result.current.actions.setVisible(false)); // targetVisible=false
    expect(onStart).toHaveBeenCalledWith('in-out');
    act(() => vi.advanceTimersByTime(500));
    expect(h.result.current.state.isVisible).toBe(false);
  });

  it('"out-in" direction covers the visible=false arm of its opacity ternary', () => {
    // out-in visible=false → from initialOpacity to finalOpacity.
    const onStart = vi.fn();
    const h = renderHook(() =>
      useFadeInOut({ direction: 'out-in', initialVisible: true, onAnimationStart: onStart })
    );
    act(() => h.result.current.actions.setVisible(false)); // targetVisible=false
    expect(onStart).toHaveBeenCalledWith('out-in');
    act(() => vi.advanceTimersByTime(500));
    expect(h.result.current.state.isVisible).toBe(false);
  });

  it('fadeOut() while not visible is a no-op', () => {
    // Line 256 `if (isVisible)` false arm.
    const onStart = vi.fn();
    const h = renderHook(() => useFadeInOut({ onAnimationStart: onStart }));
    act(() => h.result.current.actions.fadeOut());
    expect(onStart).not.toHaveBeenCalled();
  });

  it('reset() restores opacity for both initialVisible states', () => {
    // Line 270 opacity ternary: cover the initialVisible=true arm (finalOpacity).
    const h1 = renderHook(() => useFadeInOut({ initialVisible: true }));
    act(() => h1.result.current.actions.fadeOut());
    act(() => vi.advanceTimersByTime(200));
    act(() => h1.result.current.actions.reset());
    expect(h1.result.current.computed.cssOpacity).toBe(1); // finalOpacity default
    // And the initialVisible=false arm (initialOpacity) — already covered by the
    // base suite's reset test, but assert here for locality.
    const h2 = renderHook(() => useFadeInOut({ initialVisible: false }));
    act(() => h2.result.current.actions.reset());
    expect(h2.result.current.computed.cssOpacity).toBe(0);
  });
});

describe('useFadeInOut — reset and stop with no animation pending', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reset()/stop() with no running animation do not throw', () => {
    // Covers the false arm of reset/stop `if (animationRef.current)`.
    const h = renderHook(() => useFadeInOut({}));
    act(() => h.result.current.actions.stop());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isAnimating).toBe(false);
  });

  it('reset() cancels a running animation (true arm)', () => {
    const h = renderHook(() => useFadeInOut({}));
    act(() => h.result.current.actions.fadeIn());
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.isAnimating).toBe(false);
  });
});
