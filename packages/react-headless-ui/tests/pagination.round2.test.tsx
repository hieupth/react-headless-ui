import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination, CompactPagination } from '../src/components/Pagination';

// Round-2 audit fixes: default chevron svgs had no intrinsic size (0x0 in the
// showcase) and page-number buttons collapsed to ~7px. Defaults now ship
// explicit svg width/height (scaled by the size prop) and a minimal hit area
// on the page-number buttons.

const chevronLabels = [
  'Go to first page',
  'Go to previous page',
  'Go to next page',
  'Go to last page'
];

describe('Pagination round-2 fixes', () => {
  it('gives the default chevron svgs width/height derived from the size', () => {
    render(<Pagination totalPages={10} defaultPage={3} siblingCount={1} />);
    for (const label of chevronLabels) {
      const svg = screen.getByRole('button', { name: label }).querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('width', '20'); // md default
      expect(svg).toHaveAttribute('height', '20');
    }
  });

  it('scales the default chevrons with the size prop', () => {
    render(<Pagination totalPages={10} defaultPage={3} siblingCount={1} size="sm" />);
    const svg = screen.getByRole('button', { name: 'Go to first page' }).querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('gives the largest default chevrons the full viewBox size', () => {
    render(<Pagination totalPages={10} defaultPage={3} siblingCount={1} size="lg" />);
    const svg = screen.getByRole('button', { name: 'Go to first page' }).querySelector('svg');
    expect(svg).toHaveAttribute('width', '24'); // matches the 24x24 viewBox
    expect(svg).toHaveAttribute('height', '24');
  });

  it('gives page-number buttons a minimal hit area', () => {
    render(<Pagination totalPages={10} defaultPage={3} siblingCount={1} />);
    for (const name of ['Go to page 1', 'Go to page 3', 'Go to page 10']) {
      expect(screen.getByRole('button', { name })).toHaveStyle({
        minWidth: '24px',
        minHeight: '24px'
      });
    }
  });
});

describe('Pagination degenerate totalPages (round-2 NaN guard)', () => {
  it('clamps a NaN totalPages instead of emitting data-total-pages="NaN"', () => {
    const { container } = render(<Pagination totalPages={NaN} defaultPage={1} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('data-total-pages')).toBe('1');
    expect(container.innerHTML).not.toContain('NaN');
  });

  it('clamps a zero totalPages to a single page', () => {
    const { container } = render(<Pagination totalPages={0} defaultPage={1} />);
    expect(container.querySelector('nav')?.getAttribute('data-total-pages')).toBe('1');
  });

  it('CompactPagination renders "Page 1 of 1" for a NaN totalPages', () => {
    const { container } = render(<CompactPagination totalPages={NaN} defaultPage={1} />);
    expect(container.textContent?.replace(/\s+/g, ' ').trim()).toBe('PreviousPage 1 of 1Next');
  });
});
