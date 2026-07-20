import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination, CompactPagination, JumpPagination } from '../src/components/Pagination';

describe('Pagination', () => {
  it('renders a navigation region', () => {
    render(<Pagination totalPages={5} defaultPage={1} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('fires onPageChange when the next button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: /Go to next page/i }));
    expect(onPageChange).toHaveBeenCalled();
  });

  it('skips ellipsis placeholders when showEllipsis is false', () => {
    // Enough pages + siblingCount to force a '...' placeholder in the hook's
    // page range; with showEllipsis=false the renderer drops it entirely.
    const { container } = render(
      <Pagination totalPages={10} defaultPage={5} showEllipsis={false} />
    );
    expect(screen.queryByText('...')).not.toBeInTheDocument();
    // sanity: numbered page buttons still render
    expect(screen.getByRole('button', { name: 'Go to page 5' })).toBeInTheDocument();
    expect(container.querySelector('nav')).not.toBeNull();
  });

  it('renders ellipsis spans when showEllipsis is true', () => {
    render(<Pagination totalPages={10} defaultPage={5} showEllipsis />);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('fires onPageChange from first/last/prev/page buttons across the range', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    // totalPages=5, page=3, siblingCount=1 => pages [1,2,3,4,5] (no dupes,
    // no ellipsis), so every accessible name resolves to a single button.
    render(
      <Pagination
        totalPages={5}
        defaultPage={3}
        siblingCount={1}
        showFirstLast
        showPrevNext
        onPageChange={onPageChange}
      />
    );
    // Order keeps each queried button present at click time: prev/last are
    // gated on hasPrevious/hasNext, so click prev (still at page 3) and a
    // page number first, then first/last.
    await user.click(screen.getByRole('button', { name: /Go to previous page/i }));
    await user.click(screen.getByRole('button', { name: 'Go to page 5' }));
    await user.click(screen.getByRole('button', { name: /Go to first page/i }));
    await user.click(screen.getByRole('button', { name: /Go to last page/i }));
    expect(onPageChange).toHaveBeenCalledTimes(4);
  });

  it('omits first/last buttons when totalPages is 1', () => {
    render(<Pagination totalPages={1} defaultPage={1} />);
    expect(screen.queryByRole('button', { name: /Go to first page/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Go to last page/i })).not.toBeInTheDocument();
  });

  it('forwards className/style and respects size/variant/color props', () => {
    const { container } = render(
      <Pagination
        totalPages={5}
        defaultPage={3}
        siblingCount={1}
        className="extra"
        style={{ gap: 8 }}
        size="sm"
        variant="outline"
        color="secondary"
      />
    );
    const nav = container.querySelector('nav')!;
    expect(nav.className).toContain('extra');
    expect((nav as HTMLElement).style.gap).toBe('8px');
    // active page button (aria-current="page") picks up the secondary color class
    const active = container.querySelector('[aria-current="page"]')!;
    expect(active.className).toContain('bg-gray-600');
  });
});

describe('CompactPagination', () => {
  it('renders the compact nav with page info', () => {
    render(<CompactPagination totalPages={5} defaultPage={2} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Compact pagination navigation');
    expect(nav).toHaveTextContent('Page 2 of 5');
  });

  it('fires handlers on previous/next clicks', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<CompactPagination totalPages={5} defaultPage={2} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: /previous page/i }));
    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it('applies className/style and size/variant defaults', () => {
    const { container } = render(
      <CompactPagination totalPages={5} defaultPage={1} className="cp" style={{ padding: 4 }} />
    );
    const nav = container.querySelector('nav')!;
    expect(nav.className).toContain('cp');
    expect((nav as HTMLElement).style.padding).toBe('4px');
  });

  it('uses the muted style when there is no previous page', () => {
    render(<CompactPagination totalPages={5} defaultPage={1} />);
    const prev = screen.getByRole('button', { name: /previous page/i });
    expect(prev.className).toContain('text-gray-400');
  });

  it('uses the muted style when there is no next page', () => {
    render(<CompactPagination totalPages={5} defaultPage={5} />);
    const next = screen.getByRole('button', { name: /next page/i });
    expect(next.className).toContain('text-gray-400');
  });
});

describe('JumpPagination', () => {
  it('renders the jump nav with page buttons and the jump input', () => {
    render(<JumpPagination totalPages={5} defaultPage={1} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Jump pagination navigation');
    // page buttons render (the range can echo page 1 when showFirstLast is the
    // hook default, so assert at least one exists rather than a unique name)
    expect(screen.getAllByRole('button', { name: /Go to page/ }).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Jump to page number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jump to page' })).toBeInTheDocument();
  });

  it('enables and fires the Go button for a valid page', () => {
    const onPageChange = vi.fn();
    render(<JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />);
    const go = screen.getByRole('button', { name: 'Jump to page' });
    const input = screen.getByLabelText('Jump to page number');
    expect(go).toBeDisabled();
    fireEvent.change(input, { target: { value: '3' } });
    expect(go).toBeEnabled();
    fireEvent.click(go);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('jumps on Enter and resets the input', () => {
    const onPageChange = vi.fn();
    render(<JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />);
    const input = screen.getByLabelText('Jump to page number');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('keeps the Go button disabled for out-of-range and empty values', () => {
    render(<JumpPagination totalPages={5} defaultPage={1} />);
    const go = screen.getByRole('button', { name: 'Jump to page' });
    const input = screen.getByLabelText('Jump to page number');
    expect(go).toBeDisabled(); // empty
    fireEvent.change(input, { target: { value: '99' } });
    expect(go).toBeDisabled(); // > totalPages
  });

  it('fires onPageChange when a numbered page button is clicked', () => {
    const onPageChange = vi.fn();
    render(<JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />);
    // Click a page that is unconditionally in the rendered range.
    const btn = screen.getAllByRole('button', { name: 'Go to page 5' })[0];
    fireEvent.click(btn);
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('does not jump when Enter is pressed with an out-of-range value', () => {
    const onPageChange = vi.fn();
    render(<JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />);
    const input = screen.getByLabelText('Jump to page number');
    // Exercises the false branch of handleJump's range guard (page > totalPages).
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('renders an ellipsis span when the page range needs one', () => {
    render(<JumpPagination totalPages={10} defaultPage={5} />);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('applies className/style and color/variant to the active page button', () => {
    const { container } = render(
      <JumpPagination
        totalPages={5}
        defaultPage={3}
        siblingCount={1}
        className="jp"
        style={{ margin: 2 }}
        variant="ghost"
        color="error"
      />
    );
    const nav = container.querySelector('nav')!;
    expect(nav.className).toContain('jp');
    expect((nav as HTMLElement).style.margin).toBe('2px');
    // active page button (aria-current="page") picks up the error color class
    const active = container.querySelector('[aria-current="page"]')!;
    expect(active.className).toContain('bg-red-600');
  });
});
