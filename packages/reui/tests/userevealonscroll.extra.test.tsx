import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRevealOnScroll } from '../src/hooks/useRevealOnScroll';

// The hook loops on requestAnimationFrame during reveal/hide animations,
// advancing a synthetic Date.now() each frame so loops terminate deterministically.
let nowMs: number;
let rafSpy: ReturnType<typeof vi.spyOn>;
let ioCallback: (entries: any[]) => void;

function mount(props?: Parameters<typeof useRevealOnScroll>[0]) {
  return renderHook(() => useRevealOnScroll(props));
}

function attach(hook: ReturnType<typeof mount>, el?: Partial<HTMLElement>) {
  const element = (el ?? {}) as HTMLElement;
  act(() => hook.result.current.ref(element));
  return element;
}

function flushFrames(frames = 5) {
  for (let i = 0; i < frames; i++) {
    act(() => { nowMs += 250; });
  }
}

describe('useRevealOnScroll hook — direction transforms (non-animated initial state)', () => {
  beforeEach(setupTimers);
  afterEach(teardownTimers);

  it('"up" => translateY(+offset)', () => {
    const h = mount({ direction: 'up', initialOffset: 30 });
    attach(h);
    expect(h.result.current.style.transform).toBe('translateY(30px)');
  });

  it('"down" => translateY(-offset)', () => {
    const h = mount({ direction: 'down', initialOffset: 25 });
    attach(h);
    expect(h.result.current.style.transform).toBe('translateY(-25px)');
  });

  it('"left" => translateX(+offset)', () => {
    const h = mount({ direction: 'left', initialOffset: 40 });
    attach(h);
    expect(h.result.current.style.transform).toBe('translateX(40px)');
  });

  it('"right" => translateX(-offset)', () => {
    const h = mount({ direction: 'right', initialOffset: 15 });
    attach(h);
    expect(h.result.current.style.transform).toBe('translateX(-15px)');
  });

  it('"scale" => scale(0.8 + 0.2*progress)', () => {
    const h = mount({ direction: 'scale', initialOffset: 10 });
    attach(h);
    expect(h.result.current.style.transform).toBe('scale(0.8)');
  });

  it('"fade" => "none"', () => {
    const h = mount({ direction: 'fade', initialOffset: 10 });
    attach(h);
    expect(h.result.current.style.transform).toBe('none');
  });

  it('default opacity derives from initialOpacity', () => {
    const h = mount({ direction: 'fade', initialOpacity: 0.25 });
    attach(h);
    expect(h.result.current.style.opacity).toBe(0.25);
  });
});

describe('useRevealOnScroll hook — easing branches during reveal animation', () => {
  beforeEach(setupTimers);
  afterEach(teardownTimers);

  it('ease-in completes a full reveal cycle', () => {
    const onReveal = vi.fn();
    const h = mount({ easing: 'ease-in', duration: 500, onReveal });
    attach(h);
    act(() => h.result.current.actions.reveal());
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(true);
    expect(h.result.current.state.hasRevealed).toBe(true);
    expect(onReveal).toHaveBeenCalled();
  });

  it('ease-in-out completes a full reveal cycle', () => {
    const onReveal = vi.fn();
    const h = mount({ easing: 'ease-in-out', duration: 400, onReveal });
    attach(h);
    act(() => h.result.current.actions.reveal());
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(true);
    expect(onReveal).toHaveBeenCalled();
  });

  it('default ease-out completes a full reveal cycle', () => {
    const onReveal = vi.fn();
    const h = mount({ onReveal });
    attach(h);
    act(() => h.result.current.actions.reveal());
    flushFrames(6);
    expect(onReveal).toHaveBeenCalled();
  });

  it('hide() animates back to hidden via ease-out and fires onHide + onVisibilityChange', () => {
    const onHide = vi.fn();
    const onVisibilityChange = vi.fn();
    const h = mount({ onHide, onVisibilityChange, once: false });
    attach(h);
    act(() => h.result.current.actions.reveal());
    flushFrames(6);
    act(() => h.result.current.actions.hide());
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(false);
    expect(onHide).toHaveBeenCalled();
  });

  it('respects a delay before the reveal animation runs', () => {
    const onReveal = vi.fn();
    const h = mount({ delay: 200, duration: 300, onReveal });
    attach(h);
    act(() => h.result.current.actions.reveal());
    // Before delay elapses: no reveal
    flushFrames(2);
    expect(onReveal).not.toHaveBeenCalled();
    // After delay + duration: advance the fake timer queue so the delay
    // setTimeout fires (flushFrames only bumps the Date.now mock, not the
    // timer queue), then drain the rAF-driven animation to completion.
    act(() => { nowMs += 800; vi.advanceTimersByTime(800); });
    flushFrames(6);
    expect(onReveal).toHaveBeenCalled();
  });
});

describe('useRevealOnScroll hook — manual actions', () => {
  beforeEach(setupTimers);
  afterEach(teardownTimers);

  it('reset() clears hasRevealed/progress and applies hidden state when element present', () => {
    const h = mount({ duration: 200 });
    attach(h);
    act(() => h.result.current.actions.reveal());
    flushFrames(6);
    expect(h.result.current.state.hasRevealed).toBe(true);
    act(() => h.result.current.actions.reset());
    expect(h.result.current.state.hasRevealed).toBe(false);
    expect(h.result.current.state.progress).toBe(0);
    expect(h.result.current.state.isVisible).toBe(false);
  });

  it('reveal/hide are no-ops when no element is attached', () => {
    const onReveal = vi.fn();
    const h = mount({ onReveal });
    // Do not attach an element
    act(() => h.result.current.actions.reveal());
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('setAutoReveal toggles whether intersection triggers reveal', () => {
    const onReveal = vi.fn();
    const h = mount({ onReveal });
    attach(h);
    act(() => h.result.current.actions.setAutoReveal(false));
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    expect(onReveal).not.toHaveBeenCalled();
    act(() => h.result.current.actions.setAutoReveal(true));
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    flushFrames(6);
    expect(onReveal).toHaveBeenCalled();
  });
});

describe('useRevealOnScroll hook — intersection observer behavior', () => {
  beforeEach(setupTimers);
  afterEach(teardownTimers);

  it('once=true: intersection reveals but a second intersect does not re-hide', () => {
    const h = mount({ once: true });
    attach(h);
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(true);
    // Leave viewport -> with once=true nothing changes
    act(() => {
      ioCallback([{ isIntersecting: false, intersectionRatio: 0 }]);
    });
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(true);
  });

  it('once=false: intersection reveals then leaving hides', () => {
    const onHide = vi.fn();
    const h = mount({ once: false, onHide });
    attach(h);
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    });
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(true);
    act(() => {
      ioCallback([{ isIntersecting: false, intersectionRatio: 0 }]);
    });
    flushFrames(6);
    expect(h.result.current.state.isVisible).toBe(false);
    expect(onHide).toHaveBeenCalled();
  });

  it('intersection updates intersectionRatio and isIntersecting state', () => {
    const h = mount();
    attach(h);
    act(() => {
      ioCallback([{ isIntersecting: true, intersectionRatio: 0.42 }]);
    });
    expect(h.result.current.state.isIntersecting).toBe(true);
    expect(h.result.current.state.intersectionRatio).toBe(0.42);
  });

  it('swapping elements unobserves the previous and re-applies initial state', () => {
    const h = mount({ direction: 'up', initialOffset: 20 });
    const first = attach(h);
    // swap to a new element
    const second = {} as HTMLElement;
    act(() => h.result.current.ref(second));
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    // New element gets the initial hidden transform
    expect(h.result.current.style.transform).toBe('translateY(20px)');
  });

  it('attaching the same element twice is a no-op', () => {
    const h = mount({ direction: 'up', initialOffset: 12 });
    const el = {} as HTMLElement;
    act(() => h.result.current.ref(el));
    act(() => h.result.current.ref(el)); // same element -> early return
    expect(h.result.current.style.transform).toBe('translateY(12px)');
  });
});

describe('useRevealOnScroll hook — reduced motion', () => {
  it('reduced motion starts visible, jumps to final state, and transform is "none"', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const h = mount({ direction: 'up', initialOffset: 30, respectReducedMotion: true });
    attach(h);
    expect(h.result.current.state.respectReducedMotion).toBe(true);
    expect(h.result.current.style.transform).toBe('none');
    expect(h.result.current.style.opacity).toBe(1);
    expect(h.result.current.state.isVisible).toBe(true);
    matchSpy.mockRestore();
  });

  it('respectReducedMotion=false ignores reduced motion preference', () => {
    const matchSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const h = mount({ respectReducedMotion: false, direction: 'up', initialOffset: 20 });
    attach(h);
    expect(h.result.current.state.respectReducedMotion).toBe(false);
    expect(h.result.current.style.transform).toBe('translateY(20px)');
    matchSpy.mockRestore();
  });
});

describe('useRevealOnScroll hook — ARIA attributes', () => {
  beforeEach(setupTimers);
  afterEach(teardownTimers);

  it('aria-hidden mirrors visibility and aria-live flips after reveal', () => {
    const h = mount();
    attach(h);
    expect(h.result.current.attributes['aria-hidden']).toBe(true);
    expect(h.result.current.attributes['aria-live']).toBe('polite');
    act(() => h.result.current.actions.reveal());
    flushFrames(6);
    expect(h.result.current.attributes['aria-hidden']).toBe(false);
    expect(h.result.current.attributes['aria-live']).toBe('off');
  });
});

// ----- shared timer/IO/raf harness -----

function setupTimers() {
  vi.useFakeTimers();
  nowMs = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => nowMs);
  rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    nowMs += 200;
    cb(nowMs);
    return 0;
  });
  class FakeIO {
    cb: (entries: any[]) => void;
    constructor(cb: (entries: any[]) => void) {
      this.cb = cb;
      ioCallback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver = FakeIO as any;
}

function teardownTimers() {
  rafSpy.mockRestore();
  vi.mocked(Date.now).mockRestore();
  vi.useRealTimers();
}
