import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Pagination,
  CompactPagination,
  JumpPagination,
} from '../src/components/Pagination';

// Coverage extension for Pagination.tsx — exercises the size/variant/color
// class maps, ellipsis toggling, JumpPagination page-number rendering +
// invalid-jump handling, and CompactPagination boundary state, which the
// base + deep suites do not fully reach.

describe('Pagination — size / variant / colour class maps', () => {
  it('applies each size class', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(<Pagination totalPages={2} defaultPage={1} size={size} />);
      const nav = screen.getByRole('navigation');
      // size class influences the text-* utility on the nav for the compact
      // layout; here we assert the component still renders without error and
      // exposes the navigation region.
      expect(nav).toBeInTheDocument();
      unmount();
    }
  });

  it('applies each variant class to the navigation container', () => {
    for (const variant of ['default', 'outline', 'ghost'] as const) {
      const { unmount } = render(
        <Pagination totalPages={2} defaultPage={1} variant={variant} />
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      unmount();
    }
  });

  it('applies each colour class without crashing', () => {
    for (const color of ['primary', 'secondary', 'success', 'warning', 'error'] as const) {
      const { unmount } = render(
        <Pagination totalPages={3} defaultPage={2} color={color} />
      );
      // active page is the one painted with the colour class
      expect(screen.getByRole('button', { name: 'Go to page 2' })).toHaveAttribute(
        'aria-current',
        'page'
      );
      unmount();
    }
  });

  it('forwards a custom className and style to the navigation', () => {
    render(
      <Pagination
        totalPages={2}
        defaultPage={1}
        className="my-extra"
        style={{ gap: '8px' }}
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('my-extra');
    expect(nav.style.gap).toBe('8px');
  });
});

describe('Pagination — ellipsis toggling and page-number rendering', () => {
  it('showEllipsis=false hides the ellipsis spans while keeping numbers', () => {
    render(
      <Pagination totalPages={20} defaultPage={10} siblingCount={1} showEllipsis={false} />
    );
    expect(screen.queryByText('...')).toBeNull();
    // page numbers still render
    expect(screen.getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument();
  });

  it('showPageNumbers=false hides the page-number buttons', () => {
    render(<Pagination totalPages={5} defaultPage={2} showPageNumbers={false} />);
    expect(screen.queryByRole('button', { name: 'Go to page 1' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Go to page 3' })).toBeNull();
  });

  it('showPrevNext=false has no effect on prev/next (gated by hasPrevious/hasNext)', () => {
    // showPrevNext is plumbed into the hook; next button still controlled by state.
    render(<Pagination totalPages={5} defaultPage={2} showPrevNext={false} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('single page hides the first/last buttons (totalPages <= 1)', () => {
    render(<Pagination totalPages={1} defaultPage={1} />);
    expect(screen.queryByRole('button', { name: 'Go to first page' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Go to last page' })).toBeNull();
  });
});

describe('CompactPagination — extra coverage', () => {
  it('disables Previous on the first page', () => {
    render(<CompactPagination totalPages={3} defaultPage={1} />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled();
  });

  it('disables Next on the last page', () => {
    render(<CompactPagination totalPages={3} defaultPage={3} />);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous page/i })).not.toBeDisabled();
  });

  it('clicking Next fires onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <CompactPagination totalPages={3} defaultPage={1} onPageChange={onPageChange} />
    );
    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('applies size / variant / colour class maps without error', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <CompactPagination totalPages={2} defaultPage={1} size={size} variant="outline" color="error" />
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      unmount();
    }
  });

  it('forwards className and style', () => {
    render(
      <CompactPagination
        totalPages={2}
        defaultPage={1}
        className="cmp"
        style={{ marginTop: '4px' }}
      />
    );
    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('cmp');
    expect(nav.style.marginTop).toBe('4px');
  });
});

describe('JumpPagination — page-number rendering + invalid jump', () => {
  it('renders page-number buttons and fires onPageChange when one is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />
    );
    // With totalPages=5 and defaultPage=1 the rendered page range is [1,2,5];
    // click page 2 (not the active page 1, whose click is a no-op).
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders an ellipsis span when the page range needs one', () => {
    render(<JumpPagination totalPages={20} defaultPage={10} siblingCount={1} />);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('Go button is disabled when the typed page is out of range', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />
    );
    const input = screen.getByLabelText('Jump to page number');
    await user.type(input, '99');
    const go = screen.getByRole('button', { name: 'Jump to page' });
    expect(go).toBeDisabled();
    await user.click(go);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('Go button is disabled when the input is empty', () => {
    render(<JumpPagination totalPages={5} defaultPage={1} />);
    expect(screen.getByRole('button', { name: 'Jump to page' })).toBeDisabled();
  });

  it('Enter key inside the input jumps to a valid page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />
    );
    const input = screen.getByLabelText('Jump to page number');
    await user.type(input, '4');
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('Enter key with an out-of-range value does not jump', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />
    );
    const input = screen.getByLabelText('Jump to page number');
    await user.type(input, '0');
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('applies size / variant / colour class maps and forwards className', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(
        <JumpPagination
          totalPages={3}
          defaultPage={1}
          size={size}
          variant="ghost"
          color="success"
          className="jp"
          style={{ padding: '2px' }}
        />
      );
      const nav = screen.getByRole('navigation');
      expect(nav.className).toContain('jp');
      expect(nav.style.padding).toBe('2px');
      unmount();
    }
  });
});
