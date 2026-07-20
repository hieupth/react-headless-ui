import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ScaleInOut } from '../src/components/ScaleInOut';

// The base suite thoroughly covers the useScaleInOut hook. These extra tests
// drive the renderer's own branches: the getTransformOrigin switch (all five
// cases), the useMotion vs CSS-fallback render paths, custom variants/transition
// merging, the active/paused/complete class composition, and the initialActive
// render so the `animate="scaleOut"` branch executes.

describe('ScaleInOut renderer (extra branches)', () => {
  it('renders the motion container with the active class when initialActive', () => {
    const { container } = render(<ScaleInOut initialActive>content</ScaleInOut>);
    const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.className).toContain('scale-in-out-active');
  });

  it('renders the inactive class by default', () => {
    const { container } = render(<ScaleInOut>content</ScaleInOut>);
    const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el.className).toContain('scale-in-out-inactive');
  });

  it('renders the paused and complete classes when those states are set', () => {
    const { container, rerender } = render(
      <ScaleInOut initialActive paused>content</ScaleInOut>
    );
    let el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el.className).toContain('scale-in-out-paused');
    rerender(
      <ScaleInOut initialActive complete>content</ScaleInOut>
    );
    el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el.className).toContain('scale-in-out-complete');
  });

  it('forwards custom className onto the rendered node', () => {
    const { container } = render(<ScaleInOut className="my-scale">x</ScaleInOut>);
    const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el.className).toContain('my-scale');
  });

  it('applies the chosen transform-origin for every origin variant (motion mode)', () => {
    const cases: Array<[any, string]> = [
      ['center', 'center'],
      ['top-left', 'top left'],
      ['top-right', 'top right'],
      ['bottom-left', 'bottom left'],
      ['bottom-right', 'bottom right'],
    ];
    for (const [origin, expected] of cases) {
      const { container, unmount } = render(<ScaleInOut origin={origin}>x</ScaleInOut>);
      const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
      expect(el.style.transformOrigin).toBe(expected);
      unmount();
    }
  });

  it('applies the chosen transform-origin in CSS-fallback mode too', () => {
    const { container } = render(
      <ScaleInOut useMotion={false} origin="bottom-right">x</ScaleInOut>
    );
    const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el.style.transformOrigin).toBe('bottom right');
  });

  it('merges custom variants and transition in motion mode without error', () => {
    const { container } = render(
      <ScaleInOut
        initialActive
        duration={500}
        delay={100}
        initialScale={0.5}
        finalScale={1.2}
        variants={{ scaleIn: { scale: 0.1 } }}
        transition={{ duration: 0.2 }}
      >
        merged
      </ScaleInOut>
    );
    const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el).not.toBeNull();
    // transformOrigin is still applied alongside the motion props
    expect(el.style.transformOrigin).toBe('center');
  });

  it('uses default duration/delay when not provided (default branch)', () => {
    const { container } = render(<ScaleInOut>x</ScaleInOut>);
    // Renders without throwing; the default transition uses 300ms duration / 0 delay.
    expect(container.querySelector('[data-testid="scale-in-out"]')).not.toBeNull();
  });

  it('honours a custom inline style on the rendered node', () => {
    const { container } = render(
      <ScaleInOut style={{ color: 'rgb(255, 0, 0)' }}>x</ScaleInOut>
    );
    const el = container.querySelector('[data-testid="scale-in-out"]') as HTMLElement;
    expect(el.style.color).toBe('rgb(255, 0, 0)');
  });
});
