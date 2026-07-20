import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../src/components/Skeleton';
import { useSkeleton } from '../src/hooks';

describe('Skeleton', () => {
  it('renders a placeholder element', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the default text variant and size classes', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.skeleton-text')).not.toBeNull();
    expect(container.querySelector('.skeleton-md')).not.toBeNull();
  });

  it('renders text variant with multiple lines', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.querySelectorAll('.skeleton-line').length).toBe(3);
  });

  it('renders the circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    expect(container.querySelector('.skeleton-circular')).not.toBeNull();
  });

  it('renders the rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    expect(container.querySelector('.skeleton-rectangular')).not.toBeNull();
  });

  it('renders the rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />);
    expect(container.querySelector('.skeleton-rounded')).not.toBeNull();
  });

  it('applies all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { container } = render(<Skeleton size={size} />);
      expect(container.querySelector(`.skeleton-${size}`)).not.toBeNull();
    }
  });

  it('applies animated and shimmer classes by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.skeleton-animated')).not.toBeNull();
    expect(container.querySelector('.skeleton-shimmer')).not.toBeNull();
  });

  it('omits animated/shimmer classes when disabled', () => {
    const { container } = render(<Skeleton animated={false} shimmer={false} />);
    expect(container.querySelector('.skeleton-animated')).toBeNull();
    expect(container.querySelector('.skeleton-shimmer')).toBeNull();
  });

  it('honours custom width and height', () => {
    let result: any;
    const Probe = () => {
      result = useSkeleton({ width: '200px', height: '50px' });
      return null;
    };
    render(<Probe />);
    expect(result.state.dimensions.width).toBe('200px');
    expect(result.state.dimensions.height).toBe('50px');
  });
});

describe('useSkeleton', () => {
  it('computes default dimensions per variant and size', () => {
    let text: any;
    let circular: any;
    const ProbeText = () => { text = useSkeleton({ variant: 'text', size: 'lg' }); return null; };
    const ProbeCirc = () => { circular = useSkeleton({ variant: 'circular', size: 'sm' }); return null; };
    render(<><ProbeText /><ProbeCirc /></>);
    expect(text.state.dimensions).toEqual({ width: '100%', height: '1.25rem' });
    expect(circular.state.dimensions).toEqual({ width: '2rem', height: '2rem' });
  });

  it('exposes data attributes in composed props', () => {
    let result: any;
    const Probe = () => { result = useSkeleton({ variant: 'rounded', size: 'xl', lines: 2 }); return null; };
    render(<Probe />);
    expect(result.props['data-variant']).toBe('rounded');
    expect(result.props['data-size']).toBe('xl');
    expect(result.props['data-lines']).toBe(2);
  });
});
