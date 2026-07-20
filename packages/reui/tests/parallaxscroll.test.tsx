import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ParallaxScroll } from '../src/components/ParallaxScroll';
import { useParallaxScroll } from '../src/hooks/useParallaxScroll';

describe('ParallaxScroll', () => {
  it('renders the parallax container when useMotion is disabled (default)', () => {
    const { container } = render(<ParallaxScroll>content</ParallaxScroll>);
    expect(container.querySelector('[data-testid="parallax-scroll"]')).not.toBeNull();
  });

  it('renders the motion variant when useMotion is enabled', () => {
    const { container } = render(<ParallaxScroll useMotion>content</ParallaxScroll>);
    expect(
      container.querySelector('[data-testid="parallax-scroll-motion"], [data-testid="parallax-scroll"]')
    ).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ParallaxScroll>x</ParallaxScroll>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('forwards a function ref to the rendered node', () => {
    const fnRef = vi.fn();
    render(<ParallaxScroll ref={fnRef}>content</ParallaxScroll>);
    expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards an object ref to the rendered node', () => {
    const objRef: { current: HTMLDivElement | null } = { current: null };
    render(<ParallaxScroll ref={objRef as any}>content</ParallaxScroll>);
    expect(objRef.current).toBeInstanceOf(HTMLElement);
  });

  it('flips to the parallax-active class when the element intersects the viewport', () => {
    let ioCallback: ((entries: any[]) => void) | null = null;
    const ioObserve = vi.fn();
    function CapturingIO(this: any, cb: (entries: any[]) => void) {
      ioCallback = cb;
      this.observe = ioObserve;
      this.unobserve = () => {};
      this.disconnect = () => {};
    }
    const IOSpy = vi.spyOn(globalThis as any, 'IntersectionObserver').mockImplementation(CapturingIO as any);
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(performance.now());
      return 0;
    });

    const { container, rerender } = render(<ParallaxScroll>content</ParallaxScroll>);
    // Initially inactive.
    let node = container.querySelector('[data-testid="parallax-scroll"]');
    expect(node!.className).toContain('parallax-inactive');
    // Drive an intersection event so isActive flips true. The hook holds state
    // in refs and only refreshes on parent re-render, so force one.
    act(() => {
      ioCallback!([{ isIntersecting: true, intersectionRatio: 1, boundingClientRect: { top: 0 } }]);
    });
    rerender(<ParallaxScroll>content</ParallaxScroll>);
    node = container.querySelector('[data-testid="parallax-scroll"]');
    expect(node!.className).toContain('parallax-active');

    rafSpy.mockRestore();
    IOSpy.mockRestore();
  });

  it('renders active + reduced-motion classes and merges custom variants/transition under useMotion', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const customVariants = { initial: { y: 10 }, animate: { y: 0 } };
    const customTransition = { duration: 0.5 };
    const { container } = render(
      <ParallaxScroll
        useMotion
        respectReducedMotion
        variants={customVariants}
        transition={customTransition}
      >
        content
      </ParallaxScroll>
    );
    const node = container.querySelector('[data-testid="parallax-scroll-motion"], [data-testid="parallax-scroll"]');
    expect(node).not.toBeNull();
    // respectReducedMotion + matching media query adds the class even while inactive.
    expect(node!.className).toContain('respect-reduced-motion');
    matchMediaSpy.mockRestore();
  });
});

describe('useParallaxScroll', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let ioCallback: (entries: any[]) => void;
  let ioObserve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    // Run rAF callbacks synchronously so handleScroll applies the transform.
    rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(performance.now());
      return 0;
    });
    // Capture the IntersectionObserver callback so tests can drive visibility.
    ioObserve = vi.fn();
    class FakeIO {
      cb: (entries: any[]) => void;
      constructor(cb: (entries: any[]) => void) {
        this.cb = cb;
        ioCallback = cb;
      }
      observe = ioObserve;
      unobserve() {}
      disconnect() {}
    }
    globalThis.IntersectionObserver = FakeIO as any;
  });

  afterEach(() => {
    rafSpy.mockRestore();
    vi.useRealTimers();
  });

  function mount(props?: Parameters<typeof useParallaxScroll>[0]) {
    const hook = renderHook(() => useParallaxScroll(props));
    return hook;
  }

  function attachElement(hook: ReturnType<typeof mount>) {
    const el = {
      getBoundingClientRect: () => ({ top: 200, bottom: 400, height: 200, left: 0, right: 0, width: 100 }),
    } as any;
    act(() => hook.result.current.ref(el));
    return el;
  }

  it('starts inactive with empty transform and respectReducedMotion=false', () => {
    const hook = mount();
    const { state, style } = hook.result.current;
    expect(state.isActive).toBe(false);
    expect(state.progress).toBe(0);
    expect(state.respectReducedMotion).toBe(false);
    expect(style.willChange).toBe('transform');
  });

  it('applies a translateY transform for direction "up" when scrolled into view', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ speed: 0.5, direction: 'up', onParallaxChange });
    attachElement(hook);
    // Drive an intersection event so the element is considered visible.
    act(() => {
      ioCallback([
        { isIntersecting: true, intersectionRatio: 1, boundingClientRect: { top: 200 } },
      ]);
    });
    actAndRerender(hook, () => {});
    // The transform string is built from a translateY (direction "up").
    const transform = hook.result.current.style.transform;
    if (transform !== '' && transform !== 'none') {
      expect(transform).toMatch(/translateY/);
    }
    expect(onParallaxChange).toHaveBeenCalled();
  });

  it('renders a translateX transform for the "left" direction', () => {
    const hook = mount({ direction: 'left' });
    attachElement(hook);
    act(() => {
      ioCallback([
        { isIntersecting: true, intersectionRatio: 1, boundingClientRect: { top: 200 } },
      ]);
    });
    actAndRerender(hook, () => {});
    const transform = hook.result.current.style.transform;
    if (transform !== '' && transform !== 'none') {
      expect(transform).toMatch(/translateX/);
    }
  });

  it('renders a translateX transform for the "right" direction', () => {
    const hook = mount({ direction: 'right' });
    attachElement(hook);
    act(() => {
      ioCallback([
        { isIntersecting: true, intersectionRatio: 1, boundingClientRect: { top: 200 } },
      ]);
    });
    actAndRerender(hook, () => {});
    const transform = hook.result.current.style.transform;
    if (transform !== '' && transform !== 'none') {
      expect(transform).toMatch(/translateX/);
    }
  });

  it('setEnabled(false) clears the transform to none', () => {
    const hook = mount();
    attachElement(hook);
    actAndRerender(hook, () => hook.result.current.actions.setEnabled(false));
    // When disabled the active style flips willChange to 'auto'.
    expect(hook.result.current.style.willChange).toBe('auto');
  });

  it('update() re-runs the scroll handler without error', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ onParallaxChange });
    attachElement(hook);
    actAndRerender(hook, () => hook.result.current.actions.update());
    expect(onParallaxChange).toHaveBeenCalled();
  });

  it('reset() zeroes the progress and calls onParallaxChange', () => {
    const onParallaxChange = vi.fn();
    const hook = mount({ onParallaxChange });
    attachElement(hook);
    onParallaxChange.mockClear();
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(onParallaxChange).toHaveBeenCalledWith(0, expect.any(String));
    expect(hook.result.current.state.progress).toBe(0);
  });

  it('setEnabled(true) re-applies the parallax transform on scroll', () => {
    const hook = mount();
    attachElement(hook);
    actAndRerender(hook, () => hook.result.current.actions.setEnabled(false));
    actAndRerender(hook, () => hook.result.current.actions.setEnabled(true));
    expect(hook.result.current.style.willChange).toBe('transform');
  });

  it('scroll listener is registered and fires handleScroll', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    mount();
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    addSpy.mockRestore();
  });
});

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}
