import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { RevealOnScroll } from '../src/components/RevealOnScroll';

// Extra coverage for the renderer: every direction variant in
// getDefaultVariants(), the ref-combination branches, custom variants/transition
// merging, and class composition for visible/has-revealed/reduced-motion states.

describe('RevealOnScroll renderer (extra)', () => {
  it('renders an empty tree without crashing with defaults', () => {
    const { container } = render(<RevealOnScroll />);
    expect(container.firstChild).not.toBeNull();
  });

  it.each([
    ['up', 'reveal-on-scroll'],
    ['down', 'reveal-on-scroll'],
    ['left', 'reveal-on-scroll'],
    ['right', 'reveal-on-scroll'],
    ['scale', 'reveal-on-scroll'],
    ['fade', 'reveal-on-scroll'],
  ] as const)('renders the motion path for direction=%s without throwing', (direction) => {
    const { container } = render(
      <RevealOnScroll direction={direction} initialOffset={20} initialOpacity={0} duration={400} delay={50} easing="linear">
        content
      </RevealOnScroll>
    );
    expect(container.querySelector('[data-testid="reveal-on-scroll-motion"]')).not.toBeNull();
  });

  it('renders the CSS-fallback path for every direction', () => {
    const { container, rerender } = render(<RevealOnScroll useMotion={false} direction="up">x</RevealOnScroll>);
    expect(container.querySelector('[data-testid="reveal-on-scroll"]')).not.toBeNull();
    for (const dir of ['down', 'left', 'right', 'scale', 'fade'] as const) {
      rerender(<RevealOnScroll useMotion={false} direction={dir}>x</RevealOnScroll>);
      expect(container.querySelector('[data-testid="reveal-on-scroll"]')).not.toBeNull();
    }
  });

  it('forwards a function ref to the DOM node (motion + css paths)', () => {
    const refFn = vi.fn();
    const { unmount } = render(<RevealOnScroll ref={refFn} useMotion={false}>x</RevealOnScroll>);
    expect(refFn).toHaveBeenCalledWith(expect.objectContaining({ tagName: 'DIV' }));
    unmount();
    // function-ref branch: ref(null) on unmount.
    expect(refFn).toHaveBeenCalledWith(null);

    const refFn2 = vi.fn();
    render(<RevealOnScroll ref={refFn2} useMotion>x</RevealOnScroll>);
    expect(refFn2).toHaveBeenCalledWith(expect.objectContaining({ tagName: 'DIV' }));
  });

  it('supports an object ref (current is assigned)', () => {
    const objRef = { current: null } as any;
    render(<RevealOnScroll ref={objRef} useMotion={false}>x</RevealOnScroll>);
    expect(objRef.current).not.toBeNull();
    expect(objRef.current?.tagName).toBe('DIV');

    const objRef2 = { current: null } as any;
    render(<RevealOnScroll ref={objRef2} useMotion>x</RevealOnScroll>);
    expect(objRef2.current).not.toBeNull();
  });

  it('merges custom variants/transition and still renders children', () => {
    const { container } = render(
      <RevealOnScroll
        variants={{ hidden: { opacity: 0.1 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.2 }}
      >
        child
      </RevealOnScroll>
    );
    expect(container.textContent).toContain('child');
  });

  it('composes className + style on the motion node', () => {
    const { container } = render(
      <RevealOnScroll className="extra-class" style={{ color: 'red' }}>
        c
      </RevealOnScroll>
    );
    const node = container.querySelector('[data-testid="reveal-on-scroll-motion"]') as HTMLElement;
    expect(node.className).toContain('extra-class');
    expect(node.className).toContain('reveal-on-scroll');
  });

  it('applies className + style on the CSS-fallback node', () => {
    const { container } = render(
      <RevealOnScroll useMotion={false} className="css-extra" style={{ color: 'blue' }}>
        c
      </RevealOnScroll>
    );
    const node = container.querySelector('[data-testid="reveal-on-scroll"]') as HTMLElement;
    expect(node.className).toContain('css-extra');
    expect(node.style.color).toBe('blue');
  });

  it('uses default duration/delay/easing when those props are absent', () => {
    // Covers the `|| 600`, `|| 0`, `|| 'easeOut'` fallback expressions.
    const { container } = render(<RevealOnScroll>x</RevealOnScroll>);
    expect(container.firstChild).not.toBeNull();
  });

  describe('reduced-motion reveal path', () => {
    const original = window.matchMedia;
    afterEach(() => { window.matchMedia = original; });

    // With prefers-reduced-motion: reduce honoured, the hook jumps straight to
    // visible (no rAF animation) and sets state.respectReducedMotion=true.
    // This drives the true branches of the isVisible/hasRevealed/respectReducedMotion
    // class ternaries (lines 64-66) and the motion `animate="visible"` branch (line 132).
    const enableReducedMotion = () => {
      window.matchMedia = ((query: string) => ({
        ...original(query),
        matches: /prefers-reduced-motion/.test(query),
      })) as typeof window.matchMedia;
    };

    it('renders the visible/revealed/reduced-motion classes on the motion node', () => {
      enableReducedMotion();
      const { container } = render(<RevealOnScroll>x</RevealOnScroll>);
      const node = container.querySelector('[data-testid="reveal-on-scroll-motion"]') as HTMLElement;
      expect(node.className).toContain('reveal-visible');
      expect(node.className).toContain('reveal-has-revealed');
      expect(node.className).toContain('respect-reduced-motion');
    });

    it('renders the visible/revealed/reduced-motion classes on the CSS-fallback node', () => {
      enableReducedMotion();
      const { container } = render(<RevealOnScroll useMotion={false}>x</RevealOnScroll>);
      const node = container.querySelector('[data-testid="reveal-on-scroll"]') as HTMLElement;
      expect(node.className).toContain('reveal-visible');
      expect(node.className).toContain('reveal-has-revealed');
      expect(node.className).toContain('respect-reduced-motion');
    });
  });
});
