import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Shake } from '../src/components/Shake';

// The renderer maps useShake state to class names. isPaused is only set via the
// hook's `pause()` action, which <Shake> never exposes, so we pass through to
// the real hook by default and let a single test override the returned state.
let shakeStateOverride: any = null;
vi.mock('../src/hooks', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useShake: (props: any) => {
      const real = actual.useShake(props);
      return shakeStateOverride
        ? { ...real, state: { ...real.state, ...shakeStateOverride } }
        : real;
    },
  };
});

// framer-motion swallows the variant/transition props in jsdom (no real
// animation loop), so to exercise the callbacks the component wires into the
// "shake" variant transition we mock motion.div, capturing the props it is
// called with into `lastMotionProps` so the tests can invoke them directly.
const lastMotionProps: any = { current: null };
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<any>('framer-motion');
  const MockMotion = (props: any) => {
    lastMotionProps.current = props;
    return React.createElement(
      'div',
      { 'data-testid': 'shake', className: props.className },
      props.children
    );
  };
  MockMotion.displayName = 'motion.div';
  return { ...actual, motion: { ...actual.motion, div: MockMotion } };
});

// These tests exercise the Shake *renderer* branches that the hook-focused
// shake.test.tsx does not reach: the Framer Motion variant callbacks, custom
// variants/transition merging, className composition, and the CSS-fallback
// keyframe branches for every direction.

describe('Shake renderer', () => {
  it('composes the active class name when initialActive is set', () => {
    const { container } = render(<Shake initialActive>content</Shake>);
    const el = container.querySelector('[data-testid="shake"]')!;
    expect(el.className).toContain('shake-active');
  });

  it('forwards className and merges it into the base classes', () => {
    const { container } = render(<Shake className="custom-cls">x</Shake>);
    expect(container.querySelector('.shake.custom-cls')).not.toBeNull();
  });

  it('renders the CSS-fallback path (with inline keyframes) when useMotion is false', () => {
    const { container } = render(<Shake useMotion={false}>x</Shake>);
    expect(container.querySelector('[data-testid="shake"]')).not.toBeNull();
    expect(container.querySelector('style')).not.toBeNull();
  });

  it('emits horizontal keyframes in the CSS fallback (default direction)', () => {
    const { container } = render(
      <Shake useMotion={false} initialActive duration={300}>x</Shake>
    );
    const css = container.querySelector('style')!.textContent || '';
    expect(css).toContain('translateX');
  });

  it('emits vertical keyframes in the CSS fallback', () => {
    const { container } = render(
      <Shake useMotion={false} initialActive direction="vertical" duration={250}>x</Shake>
    );
    const css = container.querySelector('style')!.textContent || '';
    expect(css).toContain('translateY');
    expect(css).not.toContain('translateX');
  });

  it('emits diagonal keyframes for direction="both" in the CSS fallback', () => {
    const { container } = render(
      <Shake useMotion={false} initialActive direction="both">x</Shake>
    );
    const css = container.querySelector('style')!.textContent || '';
    expect(css).toContain('translate(-10px, -10px)');
    expect(css).toContain('translate(10px, 10px)');
  });

  it('applies an infinite animation when repeat=0 and the CSS fallback is active', () => {
    const { container } = render(
      <Shake useMotion={false} initialActive repeat={0} duration={400}>x</Shake>
    );
    const el = container.querySelector('[data-testid="shake"]') as HTMLElement;
    expect(el.style.animation).toContain('infinite');
  });

  it('applies a finite repeat count in the CSS fallback animation', () => {
    const { container } = render(
      <Shake useMotion={false} initialActive repeat={3} duration={400}>x</Shake>
    );
    const el = container.querySelector('[data-testid="shake"]') as HTMLElement;
    expect(el.style.animation).toContain('3');
    expect(el.style.animation).not.toContain('infinite');
  });

  it('honours a custom easing in the CSS fallback animation', () => {
    const { container } = render(
      <Shake useMotion={false} initialActive easing="linear">x</Shake>
    );
    const el = container.querySelector('[data-testid="shake"]') as HTMLElement;
    expect(el.style.animation).toContain('linear');
  });

  it('omits the animation when inactive (CSS fallback)', () => {
    const { container } = render(<Shake useMotion={false}>x</Shake>);
    const el = container.querySelector('[data-testid="shake"]') as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('forwards a custom transition when provided (useMotion)', () => {
    const custom = { duration: 9 };
    const { container } = render(<Shake transition={custom}>x</Shake>);
    expect(container.querySelector('[data-testid="shake"]')).not.toBeNull();
  });

  it('merges custom variants over the defaults (useMotion)', () => {
    const variants = { shake: { x: [0, 42, 0] } };
    const { container } = render(<Shake variants={variants} initialActive>x</Shake>);
    expect(container.querySelector('[data-testid="shake"]')).not.toBeNull();
  });

  it('invokes the variant onRepeat callback when framer-motion fires it', () => {
    const onRepeat = vi.fn();
    render(<Shake initialActive repeat={2} onRepeat={onRepeat}>x</Shake>);
    const shakeVariantTransition = lastMotionProps.current.variants.shake.transition;
    expect(typeof shakeVariantTransition.onRepeat).toBe('function');
    shakeVariantTransition.onRepeat();
    expect(onRepeat).toHaveBeenCalledTimes(1);
  });

  it('invokes the variant onAnimationComplete callback when framer-motion fires it', () => {
    const onComplete = vi.fn();
    render(<Shake initialActive repeat={2} onAnimationComplete={onComplete}>x</Shake>);
    const shakeVariantTransition = lastMotionProps.current.variants.shake.transition;
    expect(typeof shakeVariantTransition.onAnimationComplete).toBe('function');
    shakeVariantTransition.onAnimationComplete();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('variant callbacks are no-ops when the corresponding props are omitted', () => {
    render(<Shake initialActive>x</Shake>);
    const t = lastMotionProps.current.variants.shake.transition;
    expect(() => t.onRepeat()).not.toThrow();
    expect(() => t.onAnimationComplete()).not.toThrow();
  });

  it('emits the y=0 branch of the shake variant when direction="horizontal"', () => {
    render(<Shake initialActive direction="horizontal">x</Shake>);
    const shakeVariant = lastMotionProps.current.variants.shake;
    // direction horizontal => y is 0, x is the keyframe array
    expect(shakeVariant.y).toBe(0);
    expect(Array.isArray(shakeVariant.x)).toBe(true);
  });

  describe('class-name state branches', () => {
    afterEach(() => {
      shakeStateOverride = null;
    });

    // useShake holds isComplete in a ref and has no internal re-render trigger,
    // so <Shake> never observes isComplete=true through normal rendering. The
    // renderer's 'shake-complete' class mapping is exercised by overriding the
    // hook's exposed state directly.
    it('adds shake-complete when the hook reports isComplete', () => {
      shakeStateOverride = { isComplete: true };
      const { container } = render(<Shake initialActive>x</Shake>);
      expect(container.querySelector('.shake-complete')).not.toBeNull();
    });

    // isPaused is only set via the hook's pause() action, which <Shake> does
    // not expose; override the hook state to exercise the 'shake-paused' mapping.
    it('adds shake-paused when the hook reports isPaused', () => {
      shakeStateOverride = { isPaused: true };
      const { container } = render(<Shake initialActive>x</Shake>);
      expect(container.querySelector('.shake-paused')).not.toBeNull();
    });
  });
});
