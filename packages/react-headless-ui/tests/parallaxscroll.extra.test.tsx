import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ParallaxScroll } from '../src/components/ParallaxScroll';

// Coverage extension for ParallaxScroll.tsx — the component's combinedRef
// merges the hook's element ref with a forwarded ref. The base suite renders
// without a ref, so neither the function-ref branch nor the object-ref
// branch of combinedRef is exercised. These tests drive both branches plus
// the useMotion + custom variants/transition render path.

describe('ParallaxScroll — forwarded ref handling', () => {
  it('invokes a function ref with the parallax node', () => {
    const fnRef = vi.fn();
    render(<ParallaxScroll ref={fnRef}>content</ParallaxScroll>);
    expect(fnRef).toHaveBeenCalledTimes(1);
    expect(fnRef.mock.calls[0][0]).not.toBeNull();
    expect((fnRef.mock.calls[0][0] as HTMLElement).getAttribute('data-testid')).toBe(
      'parallax-scroll'
    );
  });

  it('assigns the node to a ref object', () => {
    const objRef: React.MutableRefObject<HTMLDivElement | null> = { current: null };
    render(<ParallaxScroll ref={objRef as any}>content</ParallaxScroll>);
    expect(objRef.current).not.toBeNull();
    expect(objRef.current!.getAttribute('data-testid')).toBe('parallax-scroll');
  });

  it('invokes a function ref with the motion node when useMotion is on', () => {
    const fnRef = vi.fn();
    render(
      <ParallaxScroll ref={fnRef} useMotion>
        content
      </ParallaxScroll>
    );
    expect(fnRef).toHaveBeenCalledTimes(1);
    expect((fnRef.mock.calls[0][0] as HTMLElement).getAttribute('data-testid')).toBe(
      'parallax-scroll-motion'
    );
  });
});

describe('ParallaxScroll — className / style / variants', () => {
  it('forwards custom className and style onto the node', () => {
    const { container } = render(
      <ParallaxScroll className="my-px" style={{ opacity: 0.5 }}>
        content
      </ParallaxScroll>
    );
    const node = container.querySelector('[data-testid="parallax-scroll"]') as HTMLElement;
    expect(node.className).toContain('my-px');
    expect(node.style.opacity).toBe('0.5');
  });

  it('renders the motion variant with custom variants/transition props', () => {
    const { container } = render(
      <ParallaxScroll
        useMotion
        variants={{ initial: { y: 10 }, animate: { y: 0 } }}
        transition={{ duration: 0.5 }}
      >
        content
      </ParallaxScroll>
    );
    // motion.div renders the testid; the custom props merge without error.
    const node = container.querySelector(
      '[data-testid="parallax-scroll-motion"], [data-testid="parallax-scroll"]'
    );
    expect(node).not.toBeNull();
  });
});
