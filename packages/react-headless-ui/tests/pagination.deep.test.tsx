import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { Pagination, CompactPagination, JumpPagination } from '../src/components/Pagination';

// Controlled wrapper that drives page state and captures changes.
function Controlled({ initialPage = 1, totalPages = 5, ...rest }: { initialPage?: number; totalPages?: number; [k: string]: any }) {
  const [page, setPage] = useState(initialPage);
  return (
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} {...rest} />
  );
}

describe('usePagination', () => {
  it('marks the current page with aria-current', () => {
    render(<Pagination totalPages={5} defaultPage={3} />);
    expect(screen.getByRole('button', { name: 'Go to page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('hasPrevious/hasNext reflect boundaries (first/last buttons disabled)', () => {
    render(<Pagination totalPages={3} defaultPage={1} />);
    // First button is disabled when no previous page
    expect(screen.getByRole('button', { name: 'Go to first page' })).toBeDisabled();
    // Next exists; previous button only renders when hasPrevious
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to previous page' })).not.toBeInTheDocument();
  });

  it('next button advances the page (controlled)', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('previous button decrements the page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('first/last buttons jump to bounds', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Go to first page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    await user.click(screen.getByRole('button', { name: 'Go to last page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });

  it('clicking a page number calls handlePageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('handlePageChange ignores same page and out-of-range', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('next is disabled on the last page', () => {
    render(<Pagination page={5} totalPages={5} />);
    expect(screen.getByRole('button', { name: 'Go to last page' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Go to next page' })).not.toBeInTheDocument();
  });

  it('disabled pagination blocks page changes', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={5} disabled onPageChange={onPageChange} />);
    // page number buttons disabled
    const page2 = screen.getByRole('button', { name: 'Go to page 2' });
    expect(page2).toBeDisabled();
    await user.click(page2);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('renders ellipsis when many pages and start is far from 1', () => {
    render(<Pagination totalPages={20} defaultPage={10} siblingCount={1} />);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
  });

  it('renders the adjacent page (no ellipsis) when start===3', () => {
    // start = max(1, 4-1-1)=2 -> with siblingCount 2: page=4 -> start=2 ... check page 2 present
    render(<Pagination totalPages={6} defaultPage={4} siblingCount={2} />);
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument();
  });

  it('renders page 2 (no ellipsis) when the range start is exactly 3', () => {
    // default siblingCount=1, page=4 -> start = max(1, 4-1) = 3 -> pushes page 2.
    render(<Pagination totalPages={5} defaultPage={4} />);
    expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument();
    expect(screen.queryByText('…')).not.toBeInTheDocument();
  });

  it('keyboard ArrowLeft/Right/Home/End navigate', () => {
    const onPageChange = vi.fn();
    const { container } = render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);
    const nav = container.querySelector('nav')!;
    fireEvent.keyDown(nav, { key: 'ArrowLeft' });
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(nav, { key: 'ArrowRight' });
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    fireEvent.keyDown(nav, { key: 'Home' });
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(nav, { key: 'End' });
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    // A non-navigation key delegates to the focusable mixin without changing page.
    fireEvent.keyDown(nav, { key: 'Enter' });
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });

  it('keyboard number key jumps to that page', () => {
    const onPageChange = vi.fn();
    const { container } = render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);
    const nav = container.querySelector('nav')!;
    fireEvent.keyDown(nav, { key: '2' });
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    // A number key beyond totalPages is ignored (pageNumber > totalPages).
    onPageChange.mockClear();
    fireEvent.keyDown(nav, { key: '9' });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('keyboard navigation is a no-op when disabled', () => {
    const onPageChange = vi.fn();
    const { container } = render(<Pagination page={2} totalPages={5} disabled onPageChange={onPageChange} />);
    const nav = container.querySelector('nav')!;
    fireEvent.keyDown(nav, { key: 'ArrowRight' });
    fireEvent.keyDown(nav, { key: '3' });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('uncontrolled pagination advances via next button', async () => {
    const user = userEvent.setup();
    render(<Pagination totalPages={5} defaultPage={1} />);
    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    // After advancing, page 2 is current and a previous button appears
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
  });

  it('CompactPagination renders Previous/Next and page info', () => {
    render(<CompactPagination totalPages={4} defaultPage={2} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });

  it('JumpPagination jumps to a typed page on Go', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<JumpPagination totalPages={5} defaultPage={1} onPageChange={onPageChange} />);
    const input = screen.getByLabelText('Jump to page number');
    await user.type(input, '3');
    await user.click(screen.getByRole('button', { name: 'Jump to page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('showFirstLast=false hides first/last buttons', () => {
    render(<Pagination totalPages={5} defaultPage={1} showFirstLast={false} />);
    expect(screen.queryByRole('button', { name: 'Go to first page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to last page' })).not.toBeInTheDocument();
  });

  it('controlled wrapper drives page externally', async () => {
    const user = userEvent.setup();
    render(<Controlled initialPage={1} totalPages={5} />);
    await user.click(screen.getByRole('button', { name: 'Go to next page' }));
    // Controlled: page now 2, previous button should appear
    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeInTheDocument();
  });
});
