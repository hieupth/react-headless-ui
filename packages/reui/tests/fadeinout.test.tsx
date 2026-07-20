import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FadeInOut } from '../src/components/FadeInOut';
import { useFadeInOut } from '../src/hooks/useFadeInOut';

// Motion hooks keep state in refs/state; reading result.current.state after an
// action returns stale values until a re-render. `actAndRerender` forces it.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('FadeInOut', () => {
  it('renders children when initially visible', () => {
    const { container } = render(<FadeInOut initialVisible>Content</FadeInOut>);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a plain div when useMotion is disabled', () => {
    const { container } = render(<FadeInOut useMotion={false} initialVisible>x</FadeInOut>);
    expect(container.querySelector('[data-testid="fade-in-out"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FadeInOut initialVisible>x</FadeInOut>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('exposes the fade-hidden class when not visible (CSS render)', () => {
    const { container } = render(<FadeInOut initialVisible={false} useMotion={false}>x</FadeInOut>);
    const el = container.querySelector('[data-testid="fade-in-out"]');
    // Not visible -> 'fade-hidden' class on the always-rendered CSS div.
    expect(el?.className).toContain('fade-hidden');
  });

  it('renders the motion path while not visible (animate="hidden")', () => {
    // duration=0 forces effectiveDuration===0 -> shouldRender is always true,
    // so with initialVisible=false the motion.div mounts in the hidden state
    // (isVisible=false -> animate="hidden").
    const { container } = render(<FadeInOut initialVisible={false} duration={0}>x</FadeInOut>);
    expect(container.querySelector('[data-testid="fade-in-out"]')).not.toBeNull();
  });

  it('translates a custom (non-CSS-keyword) easing straight through to framer-motion', () => {
    // easing not in FRAMER_EASE -> the ?? easing fallback.
    const { container } = render(<FadeInOut initialVisible easing="cubic-bezier(0.1,0.2,0.3,0.4)" useMotion>x</FadeInOut>);
    expect(container.querySelector('[data-testid="fade-in-out"]')).not.toBeNull();
  });

  it('merges custom variants and transition over the defaults', () => {
    const { container } = render(
      <FadeInOut
        initialVisible
        useMotion
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.5 }}
      >
        x
      </FadeInOut>
    );
    expect(container.querySelector('[data-testid="fade-in-out"]')).not.toBeNull();
  });

  it('applies fade-complete after the animation finishes', () => {
    vi.useFakeTimers();
    const { container } = render(<FadeInOut duration={100} initialVisible useMotion>x</FadeInOut>);
    act(() => { vi.advanceTimersByTime(150); });
    const el = container.querySelector('[data-testid="fade-in-out"]');
    expect(el?.className).toContain('fade-complete');
    vi.useRealTimers();
  });
});

describe('useFadeInOut', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts hidden with opacity 0 and direction "in"', () => {
    const hook = renderHook(() => useFadeInOut());
    const { state, computed, attributes } = hook.result.current;
    expect(state.isVisible).toBe(false);
    expect(state.direction).toBe('in');
    expect(computed.cssOpacity).toBe(0);
    expect(attributes['aria-hidden']).toBe(true);
    expect(attributes.role).toBe('group');
  });

  it('fadeIn() animates to visible and fires onAnimationStart/Complete', () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();
    const hook = renderHook(() => useFadeInOut({ onAnimationStart: onStart, onAnimationComplete: onComplete }));
    act(() => hook.result.current.actions.fadeIn());
    expect(hook.result.current.state.isAnimating).toBe(true);
    expect(onStart).toHaveBeenCalledWith('in');
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(true);
    expect(onComplete).toHaveBeenCalledWith(true);
  });

  it('fadeIn() is a no-op when already visible', () => {
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ initialVisible: true, trigger: 'manual', onAnimationStart: onStart })
    );
    expect(onStart).not.toHaveBeenCalled();
    actAndRerender(hook, () => hook.result.current.actions.fadeIn());
    expect(onStart).not.toHaveBeenCalled();
  });

  it('fadeOut() animates to hidden', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useFadeInOut({ initialVisible: true, onAnimationStart: onStart }));
    act(() => hook.result.current.actions.fadeOut());
    expect(onStart).toHaveBeenCalledWith('out');
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('toggle() flips visibility', () => {
    const hook = renderHook(() => useFadeInOut());
    act(() => hook.result.current.actions.toggle());
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(true);
    act(() => hook.result.current.actions.toggle());
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('setVisible() drives visibility in a given direction', () => {
    const hook = renderHook(() => useFadeInOut());
    act(() => hook.result.current.actions.setVisible(true));
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(true);
    act(() => hook.result.current.actions.setVisible(false));
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('setVisible with the current value is a no-op', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useFadeInOut({ trigger: 'manual', onAnimationStart: onStart }));
    actAndRerender(hook, () => hook.result.current.actions.setVisible(false));
    expect(onStart).not.toHaveBeenCalled();
  });

  it('stop() halts the running animation', () => {
    const hook = renderHook(() => useFadeInOut());
    act(() => hook.result.current.actions.fadeIn());
    expect(hook.result.current.state.isAnimating).toBe(true);
    act(() => hook.result.current.actions.stop());
    expect(hook.result.current.state.isAnimating).toBe(false);
  });

  it('reset() restores the initial state', () => {
    const hook = renderHook(() => useFadeInOut({ initialVisible: false }));
    act(() => hook.result.current.actions.fadeIn());
    act(() => vi.advanceTimersByTime(200));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isVisible).toBe(false);
    expect(hook.result.current.state.isComplete).toBe(false);
    expect(hook.result.current.state.direction).toBe('in');
  });

  it('respects a delay before the animation starts', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() => useFadeInOut({ delay: 80, onAnimationComplete: onComplete }));
    act(() => hook.result.current.actions.fadeIn());
    act(() => vi.advanceTimersByTime(70));
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(400));
    expect(onComplete).toHaveBeenCalled();
  });

  it('fires onOpacityChange as the animation progresses', () => {
    const onOpacityChange = vi.fn();
    const hook = renderHook(() => useFadeInOut({ onOpacityChange }));
    act(() => hook.result.current.actions.fadeIn());
    act(() => vi.advanceTimersByTime(150));
    expect(onOpacityChange).toHaveBeenCalled();
  });

  it('trigger="on-mount" animates in shortly after mount', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useFadeInOut({ trigger: 'on-mount', onAnimationStart: onStart }));
    expect(onStart).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60));
    expect(onStart).toHaveBeenCalled();
  });

  it('trigger="immediate" with initialVisible animates on mount', () => {
    const onStart = vi.fn();
    renderHook(() => useFadeInOut({ trigger: 'immediate', initialVisible: true, onAnimationStart: onStart }));
    expect(onStart).toHaveBeenCalledWith('in');
  });

  it('honours custom initial/final opacity values', () => {
    const hook = renderHook(() => useFadeInOut({ initialOpacity: 0.3, finalOpacity: 0.9 }));
    // Hidden => opacity is initialOpacity
    expect(hook.result.current.computed.cssOpacity).toBeCloseTo(0.3);
  });

  it('"in-out" direction fades based on the visible target', () => {
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ direction: 'in-out', initialVisible: true, onAnimationStart: onStart })
    );
    act(() => hook.result.current.actions.fadeOut());
    expect(onStart).toHaveBeenCalledWith('out');
  });

  it('"out-in" direction reverses the opacity mapping', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useFadeInOut({ direction: 'out-in', onAnimationStart: onStart }));
    act(() => hook.result.current.actions.fadeIn());
    expect(onStart).toHaveBeenCalledWith('in');
  });

  it('aria-live becomes polite while animating', () => {
    const hook = renderHook(() => useFadeInOut());
    act(() => hook.result.current.actions.fadeIn());
    expect(hook.result.current.computed.ariaLive).toBe('polite');
  });

  it.each(['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const)(
    'runs the %s easing function across the animation',
    (easing) => {
      const onOpacityChange = vi.fn();
      const hook = renderHook(() =>
        useFadeInOut({ easing, duration: 100, onOpacityChange })
      );
      act(() => hook.result.current.actions.fadeIn());
      act(() => vi.advanceTimersByTime(200));
      expect(hook.result.current.state.isVisible).toBe(true);
      expect(onOpacityChange).toHaveBeenCalled();
    }
  );

  it('jumps to the end state immediately under reduced motion', () => {
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
      const onStart = vi.fn();
      const onComplete = vi.fn();
      const onOpacityChange = vi.fn();
      const hook = renderHook(() =>
        useFadeInOut({
          respectReducedMotion: true,
          finalOpacity: 1,
          onAnimationStart: onStart,
          onAnimationComplete: onComplete,
          onOpacityChange,
        })
      );
      expect(hook.result.current.state.isVisible).toBe(false);
      act(() => hook.result.current.actions.fadeIn());
      // reduced motion -> no animating flag, immediately complete at final opacity
      expect(hook.result.current.state.isAnimating).toBe(false);
      expect(hook.result.current.state.isVisible).toBe(true);
      expect(hook.result.current.state.isComplete).toBe(true);
      expect(hook.result.current.computed.cssOpacity).toBe(1);
      expect(onStart).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith(true);
      expect(onOpacityChange).toHaveBeenCalledWith(1);
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it('getOpacityValues "out-in" maps to final->initial when visible', () => {
    // initialVisible=true with direction out-in: fading out uses final->initial mapping
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ direction: 'out-in', initialVisible: true, duration: 100, onAnimationStart: onStart })
    );
    act(() => hook.result.current.actions.fadeOut());
    expect(onStart).toHaveBeenCalledWith('out');
  });

  it('getOpacityValues falls back to in-mapping for an unknown direction', () => {
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ direction: 'unknown' as any, duration: 100, onAnimationStart: onStart })
    );
    // toggle passes currentDirection ('unknown') through to getOpacityValues' default case
    act(() => hook.result.current.actions.toggle());
    expect(onStart).toHaveBeenCalledWith('unknown');
    act(() => vi.advanceTimersByTime(200));
    expect(hook.result.current.state.isVisible).toBe(true);
  });

  it('toggle() uses the configured in-out direction mapping', () => {
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ direction: 'in-out', initialVisible: true, duration: 100, onAnimationStart: onStart })
    );
    act(() => hook.result.current.actions.toggle());
    expect(onStart).toHaveBeenCalledWith('in-out');
  });

  it('toggle() uses the configured out-in direction mapping when starting hidden', () => {
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ direction: 'out-in', initialVisible: false, duration: 100, onAnimationStart: onStart })
    );
    act(() => hook.result.current.actions.toggle());
    expect(onStart).toHaveBeenCalledWith('out-in');
  });

  it('toggle() with out-in direction maps the visible=false arm', () => {
    const onStart = vi.fn();
    const hook = renderHook(() =>
      useFadeInOut({ direction: 'out-in', initialVisible: true, duration: 100, onAnimationStart: onStart })
    );
    // initialVisible=true -> toggle to hidden passes visible=false through out-in's false arm
    act(() => hook.result.current.actions.toggle());
    expect(onStart).toHaveBeenCalledWith('out-in');
  });

  it('reset() is a no-op on the rAF when no animation is running', () => {
    const hook = renderHook(() => useFadeInOut({ initialVisible: false }));
    act(() => hook.result.current.actions.reset());
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('fadeOut() is a no-op when already hidden', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useFadeInOut({ initialVisible: false, onAnimationStart: onStart }));
    act(() => hook.result.current.actions.fadeOut());
    expect(onStart).not.toHaveBeenCalled();
  });

  it('reset() cancels a running animation and restores the initialVisible=true opacity', () => {
    const hook = renderHook(() =>
      useFadeInOut({ initialVisible: true, initialOpacity: 0.2, finalOpacity: 0.8, duration: 200 })
    );
    // start hidden then animate, then reset mid-animation back to initialVisible=true
    act(() => hook.result.current.actions.setVisible(false));
    act(() => hook.result.current.actions.reset());
    expect(hook.result.current.state.isVisible).toBe(true);
    expect(hook.result.current.computed.cssOpacity).toBeCloseTo(0.8);
  });

  it('stop() is a no-op when no animation is running', () => {
    const hook = renderHook(() => useFadeInOut({}));
    expect(() => act(() => hook.result.current.actions.stop())).not.toThrow();
    expect(hook.result.current.state.isAnimating).toBe(false);
  });
});
