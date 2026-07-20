import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../src/components/Skeleton';

// Skeleton.test.tsx already covers variants/sizes/animated/shimmer/lines and
// the hook. These extra tests cover the renderer's style-generation branches
// (the per-variant border radii, the multi-line progressive widths, and the
// defensive default case) that the existing suite only touches indirectly.

describe('Skeleton renderer (extra branches)', () => {
  it('applies a className alongside the generated classes', () => {
    const { container } = render(<Skeleton className="my-skel" />);
    expect(container.querySelector('.skeleton.my-skel')).not.toBeNull();
  });

  it('uses a 50% border radius for the circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.borderRadius).toBe('50%');
  });

  it('uses the small border radius for text and rectangular variants', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.borderRadius).toBeTruthy();
    expect(el.style.borderRadius).not.toBe('50%');
  });

  it('uses the large border radius for the rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.borderRadius).toBeTruthy();
    expect(el.style.borderRadius).not.toBe('50%');
  });

  it('honours custom width and height on the rendered element', () => {
    const { container } = render(<Skeleton width="123px" height="45px" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('123px');
    expect(el.style.height).toBe('45px');
  });

  it('renders each text line with progressive widths and the wrapper column layout', () => {
    const { container } = render(<Skeleton variant="text" lines={3} width="320px" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('skeleton-lines');
    expect(wrapper.style.flexDirection).toBe('column');
    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines.length).toBe(3);
    // First line is full-width, last line is 70%.
    expect((lines[0] as HTMLElement).style.width).toBe('100%');
    expect((lines[2] as HTMLElement).style.width).toBe('70%');
  });

  it('a single text line does not take the multi-line branch', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    expect(container.querySelector('.skeleton-lines')).toBeNull();
    expect(container.querySelector('.skeleton-line')).toBeNull();
    expect(container.querySelector('.skeleton-text')).not.toBeNull();
  });

  it('emits the shimmer pseudo-element styles when shimmer is enabled', () => {
    const { container } = render(<Skeleton shimmer />);
    const el = container.firstChild as HTMLElement;
    // shimmerStyles are merged into the inline style object as a nested
    // '&::after' / '@keyframes' entry.
    expect((el.style as any)['&::after']).toBeDefined();
    expect((el.style as any)['@keyframes shimmer']).toBeDefined();
  });

  it('omits shimmer styles when shimmer is disabled', () => {
    const { container } = render(<Skeleton shimmer={false} />);
    const el = container.firstChild as HTMLElement;
    expect((el.style as any)['&::after']).toBeUndefined();
  });

  it('falls back to base styles for an unknown variant (defensive default case)', () => {
    // The switch in getVariantStyles has a `default` branch that returns only
    // baseStyles. Exercise it by forcing an out-of-domain variant value.
    const { container } = render(<Skeleton variant={'unknown' as any} />);
    const el = container.firstChild as HTMLElement;
    // baseStyles sets backgroundColor/display/position/overflow but no
    // width/height/borderRadius beyond the defaults.
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.position).toBe('relative');
  });
});
