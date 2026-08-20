import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Rating } from '../src/components/Rating';

// Round-2 audit fixes: intrinsic svg sizing, gradient id uniqueness, NaN guard.

describe('Rating round-2 fixes', () => {
  it('gives default star svgs width/height derived from the rating size', () => {
    const { container } = render(<Rating max={5} defaultValue={2} />);
    const svg = container.querySelector('svg.rating-star');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '20'); // md default
    expect(svg).toHaveAttribute('height', '20');
  });

  it('scales the default star svg with the size prop', () => {
    const { container: sm } = render(<Rating max={5} defaultValue={2} size="sm" />);
    expect(sm.querySelector('svg.rating-star')).toHaveAttribute('width', '16');
    expect(sm.querySelector('svg.rating-star')).toHaveAttribute('height', '16');
  });

  it('gives the largest default star svg the full viewBox size', () => {
    const { container: lg } = render(<Rating max={5} defaultValue={2} size="lg" />);
    const svg = lg.querySelector('svg.rating-star');
    expect(svg).toHaveAttribute('width', '24'); // matches the 24x24 viewBox
    expect(svg).toHaveAttribute('height', '24');
  });

  it('gives the default heart and thumbs svgs width/height too', () => {
    const { container: heart } = render(<Rating max={5} defaultValue={2} variant="heart" />);
    expect(heart.querySelector('svg.rating-heart')).toHaveAttribute('width', '20');
    expect(heart.querySelector('svg.rating-heart')).toHaveAttribute('height', '20');

    const { container: thumbs } = render(<Rating max={5} defaultValue={2} variant="thumbs" />);
    expect(thumbs.querySelector('svg.rating-thumbs')).toHaveAttribute('width', '20');
    expect(thumbs.querySelector('svg.rating-thumbs')).toHaveAttribute('height', '20');
  });

  it('defines the half gradient once per instance so allowHalf emits no duplicate ids', () => {
    const { container } = render(<Rating max={5} defaultValue={2.5} allowHalf />);
    const gradientIds = Array.from(container.querySelectorAll('linearGradient')).map((g) => g.id);

    // No duplicated id values anywhere in the instance.
    expect(new Set(gradientIds).size).toBe(gradientIds.length);
    // Exactly one star half-gradient def for all url(#...) references.
    const starGradientIds = gradientIds.filter((id) => id.startsWith('half-gradient-'));
    expect(starGradientIds).toHaveLength(1);

    // 1 half main star + 2 half buttons x 5 items = 11 url(#...) references,
    // all resolving to the single def.
    const referenced = Array.from(container.querySelectorAll('path[fill^="url(#"]'));
    expect(referenced).toHaveLength(11);
    for (const path of referenced) {
      expect(path.getAttribute('fill')).toBe(`url(#${starGradientIds[0]})`);
    }
  });

  it('scopes gradient ids per instance so sibling Ratings never collide', () => {
    const { container } = render(
      <>
        <Rating max={5} defaultValue={2.5} allowHalf />
        <Rating max={5} defaultValue={2.5} allowHalf />
      </>
    );
    const gradientIds = Array.from(container.querySelectorAll('linearGradient')).map((g) => g.id);
    expect(gradientIds).toHaveLength(4); // star + heart def per instance
    expect(new Set(gradientIds).size).toBe(4);
  });

  it('renders 0 instead of NaN in the live region and value displays when value is NaN', () => {
    render(<Rating max={5} value={Number.NaN} showValue />);
    expect(screen.getByText(/Current rating:/)).toHaveTextContent('Current rating: 0 out of 5');
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });
});
