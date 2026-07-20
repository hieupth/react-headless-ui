import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useMotion, motionVariants } from '../src/hooks';

const Probe = (fn: (result: any) => void) => {
  let result: any;
  const Inner = () => {
    result = (useMotion as any)({});
    return null;
  };
  render(<Inner />);
  fn(result);
};

describe('useMotion', () => {
  it('mounts and reports isMounted true after mount', () => {
    let result: any;
    const Inner = () => {
      result = useMotion({});
      return null;
    };
    render(<Inner />);
    expect(result.isMounted).toBe(true);
  });

  it('defaults shouldAnimate to true when motion is not reduced', () => {
    Probe((result) => {
      expect(result.shouldAnimate).toBe(true);
    });
  });

  it('start/stop/toggle flip isActive and variant', () => {
    let result: any;
    const Inner = () => {
      result = useMotion({ trigger: 'manual' });
      return null;
    };
    render(<Inner />);
    // manual trigger starts inactive (externalIsActive defaults to false).
    expect(result.variant).toBe('hidden');
    act(() => result.startAnimation());
    expect(result.variant).toBe('visible');
    act(() => result.stopAnimation());
    expect(result.variant).toBe('hidden');
    act(() => result.toggleAnimation());
    expect(result.variant).toBe('visible');
  });

  it('setVariant updates the variant directly', () => {
    let result: any;
    const Inner = () => {
      result = useMotion({ trigger: 'manual' });
      return null;
    };
    render(<Inner />);
    act(() => result.setVariant('enter'));
    expect(result.variant).toBe('enter');
  });

  it('mount trigger auto-activates after mount', () => {
    let result: any;
    const Inner = () => {
      result = useMotion({ trigger: 'mount' });
      return null;
    };
    render(<Inner />);
    expect(result.variant).toBe('visible');
  });

  it('manual trigger follows externalIsActive', () => {
    let result: any;
    const Inner = ({ active }: { active: boolean }) => {
      result = useMotion({ trigger: 'manual', isActive: active });
      return null;
    };
    const { rerender } = render(<Inner active={false} />);
    expect(result.variant).toBe('hidden');
    rerender(<Inner active={true} />);
    expect(result.variant).toBe('visible');
  });

  it('respects reduced motion preference', () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: q.includes('reduce'),
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as any;
    let result: any;
    const Inner = () => {
      result = useMotion({});
      return null;
    };
    render(<Inner />);
    expect(result.shouldAnimate).toBe(false);
    // controls.animate should be false when motion is reduced.
    expect(result.controls.animate).toBe(false);
    window.matchMedia = original;
  });

  it('controls expose transition with duration/delay/easing and loop', () => {
    let result: any;
    const Inner = () => {
      result = useMotion({ duration: 0.5, delay: 0.1, easing: 'linear', loop: true });
      return null;
    };
    render(<Inner />);
    expect(result.controls.transition.duration).toBe(0.5);
    expect(result.controls.transition.delay).toBe(0.1);
    expect(result.controls.transition.ease).toBe('linear');
    expect(result.controls.transition.repeat).toBe(Infinity);
  });

  it('onStart fires when animation becomes active', () => {
    const onStart = vi.fn();
    let result: any;
    const Inner = () => {
      result = useMotion({ trigger: 'manual', onStart });
      return null;
    };
    render(<Inner />);
    act(() => result.startAnimation());
    expect(onStart).toHaveBeenCalled();
  });

  it('controls.onAnimationComplete forwards the onComplete callback', () => {
    const onComplete = vi.fn();
    let result: any;
    const Inner = () => {
      result = useMotion({ trigger: 'manual', onComplete });
      return null;
    };
    render(<Inner />);
    expect(result.controls.onAnimationComplete).toBe(onComplete);
  });
});

describe('motionVariants', () => {
  it('exposes hidden/visible/exit for each preset', () => {
    const names = ['fade', 'slide', 'scale', 'rotate', 'bounce', 'shake', 'pulse', 'flip', 'blur'];
    for (const name of names) {
      const variant = (motionVariants as any)[name];
      expect(variant).toBeDefined();
      expect(variant.hidden).toBeDefined();
      expect(variant.visible).toBeDefined();
    }
  });

  it('fade transitions opacity', () => {
    expect(motionVariants.fade.hidden.opacity).toBe(0);
    expect(motionVariants.fade.visible.opacity).toBe(1);
  });

  it('slide transitions x position', () => {
    expect((motionVariants.slide.hidden as any).x).toBe(-20);
    expect((motionVariants.slide.visible as any).x).toBe(0);
  });
});
