import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SlideIn } from '../src/components/SlideIn';
import { useSlideIn } from '../src/hooks/useSlideIn';

// Motion hooks keep state in refs/state; reading result.current.state after an
// action returns stale values until a re-render. `actAndRerender` forces it.
function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('SlideIn', () => {
  it('renders children when initially visible', () => {
    render(
      <SlideIn initialVisible>
        <span>Sliding content</span>
      </SlideIn>
    );
    expect(screen.getByText('Sliding content')).toBeInTheDocument();
  });

  it('renders the css-transition wrapper when useMotion is disabled', () => {
    const { container } = render(
      <SlideIn initialVisible useMotion={false}>
        <span>CSS slide</span>
      </SlideIn>
    );
    expect(container.querySelector('[data-testid="slide-in"]')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SlideIn initialVisible>
        <span>x</span>
      </SlideIn>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it.each(['down', 'left', 'right'] as const)(
    'renders the motion wrapper for the %s direction',
    (direction) => {
      const { container } = render(
        <SlideIn initialVisible direction={direction}>
          <span>{direction}</span>
        </SlideIn>
      );
      expect(container.querySelector('[data-testid="slide-in"]')).not.toBeNull();
    }
  );

  it('falls back to the up variant mapping for an unknown direction', () => {
    const { container } = render(
      // direction is typed but we bypass it to hit the switch default arm.
      <SlideIn initialVisible direction={'bogus' as any}>
        <span>x</span>
      </SlideIn>
    );
    expect(container.querySelector('[data-testid="slide-in"]')).not.toBeNull();
  });

  it('honours a custom variants and transition override', () => {
    const { container } = render(
      <SlideIn
        initialVisible
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.2 }}
      >
        <span>x</span>
      </SlideIn>
    );
    expect(container.querySelector('[data-testid="slide-in"]')).not.toBeNull();
  });

  it('computes the hidden base classes when not visible (css path)', () => {
    // No initialVisible: isVisible is false, so the slide-hidden arm runs.
    const { container } = render(
      <SlideIn useMotion={false}>
        <span>hidden</span>
      </SlideIn>
    );
    const node = container.querySelector('[data-testid="slide-in"]');
    expect(node).not.toBeNull();
    expect(node?.className).toContain('slide-hidden');
  });

  it('marks the slide-complete class once the mount animation settles', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <SlideIn initialVisible>
          <span>done</span>
        </SlideIn>
      );
      // Advance past the default duration so the hook sets isComplete=true and
      // the component re-renders with the slide-complete class.
      act(() => { vi.advanceTimersByTime(500); });
      expect(container.querySelector('[data-testid="slide-in"]')?.className).toContain('slide-complete');
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders the motion wrapper in the hidden animate state under reduced motion', () => {
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
      // Reduced motion => effectiveDuration 0 => shouldRender true even though
      // isVisible starts false, so motion.div renders with animate="hidden".
      const { container } = render(
        <SlideIn>
          <span>reduced</span>
        </SlideIn>
      );
      expect(container.querySelector('[data-testid="slide-in"]')).not.toBeNull();
    } finally {
      matchMediaSpy.mockRestore();
    }
  });
});

describe('useSlideIn', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts hidden with direction "up" and a translate3d transform', () => {
    const hook = renderHook(() => useSlideIn());
    const { state, computed, attributes } = hook.result.current;
    expect(state.isVisible).toBe(false);
    expect(state.direction).toBe('up');
    expect(computed.cssTransform).toMatch(/translate3d/);
    expect(attributes['aria-hidden']).toBe(true);
    expect(attributes.role).toBe('group');
  });

  it('slideIn() animates to visible and fires onAnimationStart/Complete', () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();
    const hook = renderHook(() => useSlideIn({ onAnimationStart: onStart, onAnimationComplete: onComplete }));
    act(() => hook.result.current.actions.slideIn());
    expect(onStart).toHaveBeenCalledWith('up', 'in');
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(true);
    expect(onComplete).toHaveBeenCalledWith(true);
  });

  it('slideIn() is a no-op when already visible', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ initialVisible: true, onAnimationStart: onStart }));
    // initialVisible triggers a mount animation, so advance to settle it first.
    act(() => vi.advanceTimersByTime(500));
    onStart.mockClear();
    actAndRerender(hook, () => hook.result.current.actions.slideIn());
    expect(onStart).not.toHaveBeenCalled();
  });

  it('slideOut() animates to hidden', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ initialVisible: true, onAnimationStart: onStart }));
    act(() => vi.advanceTimersByTime(500));
    onStart.mockClear();
    act(() => hook.result.current.actions.slideOut());
    expect(onStart).toHaveBeenCalledWith('up', 'out');
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('toggle() flips visibility', () => {
    const hook = renderHook(() => useSlideIn());
    act(() => hook.result.current.actions.toggle());
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(true);
    act(() => hook.result.current.actions.toggle());
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('setVisible() drives visibility in a given direction', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ onAnimationStart: onStart }));
    act(() => hook.result.current.actions.setVisible(true, 'left'));
    expect(onStart).toHaveBeenCalledWith('left', 'in');
    act(() => vi.advanceTimersByTime(500));
    expect(hook.result.current.state.isVisible).toBe(true);
  });

  it('setVisible with the current value is a no-op', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ onAnimationStart: onStart }));
    actAndRerender(hook, () => hook.result.current.actions.setVisible(false));
    expect(onStart).not.toHaveBeenCalled();
  });

  it('stop() halts the running animation', () => {
    const hook = renderHook(() => useSlideIn());
    act(() => hook.result.current.actions.slideIn());
    expect(hook.result.current.state.isAnimating).toBe(true);
    act(() => hook.result.current.actions.stop());
    expect(hook.result.current.state.isAnimating).toBe(false);
  });

  it('reset() restores the initial state', () => {
    const hook = renderHook(() => useSlideIn({ initialVisible: false, direction: 'left' }));
    act(() => hook.result.current.actions.slideIn());
    act(() => vi.advanceTimersByTime(200));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isVisible).toBe(false);
    expect(hook.result.current.state.direction).toBe('left');
    expect(hook.result.current.state.isComplete).toBe(false);
  });

  it('respects a delay before the animation starts', () => {
    const onComplete = vi.fn();
    const hook = renderHook(() => useSlideIn({ delay: 80, onAnimationComplete: onComplete }));
    act(() => hook.result.current.actions.slideIn());
    act(() => vi.advanceTimersByTime(70));
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(400));
    expect(onComplete).toHaveBeenCalled();
  });

  it('fires onTransformChange as the animation progresses', () => {
    const onTransformChange = vi.fn();
    const hook = renderHook(() => useSlideIn({ onTransformChange }));
    act(() => hook.result.current.actions.slideIn());
    act(() => vi.advanceTimersByTime(150));
    expect(onTransformChange).toHaveBeenCalled();
  });

  it('honours the configured direction via onAnimationStart type for each axis', () => {
    const dirs: Array<any> = ['up', 'down', 'left', 'right'];
    for (const dir of dirs) {
      const onStart = vi.fn();
      const hook = renderHook(() => useSlideIn({ direction: dir, onAnimationStart: onStart }));
      act(() => hook.result.current.actions.slideIn());
      expect(onStart).toHaveBeenCalledWith(dir, 'in');
      hook.unmount();
    }
  });

  it('fires onTransformChange as the animation steps toward visible', () => {
    const onTransformChange = vi.fn();
    const hook = renderHook(() =>
      useSlideIn({ direction: 'up', distance: 50, onTransformChange })
    );
    act(() => hook.result.current.actions.slideIn());
    act(() => vi.advanceTimersByTime(150));
    expect(onTransformChange).toHaveBeenCalled();
    // The animation interpolates from {x:0,y:50} toward {x:0,y:0}; every frame
    // reports x === 0 for an "up" slide.
    for (const [transform] of onTransformChange.mock.calls) {
      expect(transform.x).toBe(0);
    }
  });

  it('slideIn() with an explicit direction overrides the configured one', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ direction: 'up', onAnimationStart: onStart }));
    act(() => hook.result.current.actions.slideIn('right'));
    expect(onStart).toHaveBeenCalledWith('right', 'in');
  });

  it('aria-live becomes polite while animating', () => {
    const hook = renderHook(() => useSlideIn());
    act(() => hook.result.current.actions.slideIn());
    expect(hook.result.current.computed.ariaLive).toBe('polite');
  });

  it('exposes a cssTransition string while active', () => {
    const hook = renderHook(() => useSlideIn({ duration: 300 }));
    expect(hook.result.current.computed.cssTransition).toMatch(/transform/);
  });

  it.each(['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const)(
    'runs the %s easing function across the animation',
    (easing) => {
      const onTransformChange = vi.fn();
      const hook = renderHook(() => useSlideIn({ easing, duration: 100, onTransformChange }));
      act(() => hook.result.current.actions.slideIn());
      act(() => vi.advanceTimersByTime(200));
      expect(hook.result.current.state.isVisible).toBe(true);
      expect(onTransformChange).toHaveBeenCalled();
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
      const onTransformChange = vi.fn();
      const hook = renderHook(() =>
        useSlideIn({ respectReducedMotion: true, onAnimationStart: onStart, onAnimationComplete: onComplete, onTransformChange })
      );
      expect(hook.result.current.computed.cssTransition).toBe('none');
      act(() => hook.result.current.actions.slideIn());
      expect(hook.result.current.state.isVisible).toBe(true);
      expect(hook.result.current.state.isComplete).toBe(true);
      expect(onStart).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledWith(true);
      expect(onTransformChange).toHaveBeenCalled();
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it('getSlideValues falls back to the up mapping for an unknown direction', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ direction: 'bogus' as any, onAnimationStart: onStart }));
    act(() => hook.result.current.actions.slideIn());
    expect(onStart).toHaveBeenCalledWith('bogus', 'in');
  });

  it('slideOut() is a no-op when already hidden', () => {
    const onStart = vi.fn();
    const hook = renderHook(() => useSlideIn({ initialVisible: false, onAnimationStart: onStart }));
    act(() => hook.result.current.actions.slideOut());
    expect(onStart).not.toHaveBeenCalled();
  });

  it('setVisible drives both in and out type arms', () => {
    // in arm: start hidden -> setVisible(true)
    const onStartIn = vi.fn();
    const hookIn = renderHook(() => useSlideIn({ initialVisible: false, onAnimationStart: onStartIn }));
    actAndRerender(hookIn, () => hookIn.result.current.actions.setVisible(true));
    expect(onStartIn).toHaveBeenLastCalledWith(expect.any(String), 'in');

    // out arm: start visible -> setVisible(false)
    const onStartOut = vi.fn();
    const hookOut = renderHook(() => useSlideIn({ initialVisible: true, onAnimationStart: onStartOut }));
    actAndRerender(hookOut, () => hookOut.result.current.actions.setVisible(false));
    expect(onStartOut).toHaveBeenLastCalledWith(expect.any(String), 'out');
  });

  it('reset() cancels a running animation', () => {
    const hook = renderHook(() => useSlideIn({ initialVisible: true, duration: 200 }));
    act(() => hook.result.current.actions.setVisible(false));
    act(() => hook.result.current.actions.reset());
    expect(hook.result.current.state.isVisible).toBe(true);
  });

  it('reset() is a no-op on the rAF when no animation is running', () => {
    const hook = renderHook(() => useSlideIn({ initialVisible: false }));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.isVisible).toBe(false);
  });

  it('stop() is a no-op when no animation is running', () => {
    const hook = renderHook(() => useSlideIn({}));
    expect(() => act(() => hook.result.current.actions.stop())).not.toThrow();
    expect(hook.result.current.state.isAnimating).toBe(false);
  });
});
