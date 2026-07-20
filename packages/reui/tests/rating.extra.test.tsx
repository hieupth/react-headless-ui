import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Rating } from '../src/components/Rating';

// Covers variant renderers (heart/thumbs + custom), half-rating rendering,
// color/size/spaced styling, showValue (with and without label), readonly /
// disabled styling, keyboard handling, and hover callbacks.
describe('Rating (extra)', () => {
  it('renders the heart variant icons', () => {
    render(<Rating max={3} defaultValue={2} variant="heart" />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    // each item renders a rating-heart svg
    expect(document.querySelector('.rating-heart')).toBeInTheDocument();
  });

  it('renders the thumbs variant icons', () => {
    render(<Rating max={2} defaultValue={1} variant="thumbs" />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(document.querySelector('.rating-thumbs')).toBeInTheDocument();
  });

  it('uses custom renderStar when provided', () => {
    render(
      <Rating
        max={2}
        defaultValue={1}
        renderStar={({ filled }) => <span data-filled={filled}>S</span>}
      />
    );
    const items = screen.getAllByRole('button');
    expect(items[0].querySelector('[data-filled="true"]')).toBeInTheDocument();
    expect(items[1].querySelector('[data-filled="false"]')).toBeInTheDocument();
  });

  it('uses custom renderHeart / renderThumbs when provided', () => {
    const { rerender } = render(
      <Rating
        max={1}
        defaultValue={1}
        variant="heart"
        renderHeart={() => <span>H</span>}
      />
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    rerender(
      <Rating
        max={1}
        defaultValue={1}
        variant="thumbs"
        renderThumbs={() => <span>T</span>}
      />
    );
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders half-rating buttons when allowHalf is true', () => {
    render(<Rating max={2} defaultValue={1.5} allowHalf />);
    // 2 items, each with 2 half buttons = 6 buttons total
    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(screen.getByTestId('rating-half-1-first')).toBeInTheDocument();
    expect(screen.getByTestId('rating-half-2-second')).toBeInTheDocument();
  });

  it('selects a half value via the half buttons', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating max={3} allowHalf onChange={onChange} />);
    await user.click(screen.getByTestId('rating-half-2-first'));
    expect(onChange).toHaveBeenLastCalledWith(1.5);
  });

  it('applies color, size, spaced and className to the rating container', () => {
    render(
      <Rating
        max={2}
        defaultValue={1}
        color="warning"
        size="lg"
        spaced
        className="my-rating"
      />
    );
    const el = screen.getByTestId('rating');
    expect(el).toHaveClass('rating-warning');
    expect(el).toHaveClass('rating-lg');
    expect(el).toHaveClass('rating-spaced');
    expect(el).toHaveClass('my-rating');
  });

  it('renders sm size class', () => {
    render(<Rating max={2} defaultValue={1} size="sm" />);
    expect(screen.getByTestId('rating')).toHaveClass('rating-sm');
  });

  it('renders showValue with a label', () => {
    render(<Rating max={5} defaultValue={3} showValue label="Rate me" />);
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('renders showValue without a label', () => {
    render(<Rating max={5} defaultValue={4} showValue />);
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('renders the empty / full sr-only messages', () => {
    render(<Rating max={5} defaultValue={0} />);
    expect(screen.getByText(/No rating/)).toBeInTheDocument();
    const { unmount } = render(<Rating max={5} defaultValue={5} />);
    expect(screen.getByText(/Maximum rating/)).toBeInTheDocument();
    unmount();
  });

  it('marks items readonly / disabled', () => {
    const { rerender } = render(<Rating max={2} defaultValue={1} readonly />);
    expect(screen.getByTestId('rating')).toHaveClass('rating-readonly');
    expect(screen.getAllByRole('button')[0]).toHaveClass('rating-item-readonly');
    rerender(<Rating max={2} defaultValue={1} disabled />);
    expect(screen.getByTestId('rating')).toHaveClass('rating-disabled');
    expect(screen.getAllByRole('button')[0]).toHaveClass('rating-item-disabled');
  });

  it('fires onHoverChange on item mouse enter/leave', async () => {
    const user = userEvent.setup();
    const onHoverChange = vi.fn();
    render(<Rating max={3} onHoverChange={onHoverChange} />);
    const items = screen.getAllByRole('button');
    await user.hover(items[1]);
    expect(onHoverChange).toHaveBeenLastCalledWith(2);
    await user.unhover(items[1]);
    expect(onHoverChange).toHaveBeenLastCalledWith(null);
  });

  it('increments/decrements via keyboard arrows', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating max={5} defaultValue={2} onChange={onChange} />);
    const item = screen.getAllByRole('button')[0];
    item.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.keyboard('{ArrowLeft}');
    // decrement steps down by 1 from the current value (3 -> 2), matching
    // useRating's documented `value - step` semantics.
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('jumps to 0 with Home and to max with End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating max={5} defaultValue={3} onChange={onChange} />);
    const item = screen.getAllByRole('button')[0];
    item.focus();
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('selects the focused item via Enter / Space', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating max={5} onChange={onChange} />);
    const items = screen.getAllByRole('button');
    items[2].focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('clears when allowClear is on and the same item is re-selected', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Rating max={3} defaultValue={2} allowClear onClear={onClear} />);
    const items = screen.getAllByRole('button');
    await user.click(items[1]); // re-select value 2 -> clear
    expect(onClear).toHaveBeenCalled();
  });

  it('heart variant surfaces half/hover/focused class arms', async () => {
    const { container } = render(
      <Rating max={3} defaultValue={1.5} allowHalf variant="heart" />
    );
    // A 0.5 fractional value produces a half heart (class + gradient defs).
    expect(container.querySelector('.rating-heart-half')).not.toBeNull();
    // Drive hover + focus directly via fireEvent to surface those class arms.
    const items = screen.getAllByRole('button');
    fireEvent.mouseEnter(items[0]);
    expect(container.querySelector('.rating-heart-hover')).not.toBeNull();
    fireEvent.mouseLeave(items[0]);
    fireEvent.focus(items[0]);
    expect(container.querySelector('.rating-heart-focused')).not.toBeNull();
  });

  it('thumbs variant surfaces hover/focused class arms', async () => {
    const { container } = render(<Rating max={2} defaultValue={1} variant="thumbs" />);
    const items = screen.getAllByRole('button');
    fireEvent.mouseEnter(items[0]);
    expect(container.querySelector('.rating-thumbs-hover')).not.toBeNull();
    fireEvent.mouseLeave(items[0]);
    fireEvent.focus(items[0]);
    expect(container.querySelector('.rating-thumbs-focused')).not.toBeNull();
  });

  it('unknown variant falls back to the star renderer (with custom renderStar)', () => {
    render(
      <Rating
        max={2}
        defaultValue={1}
        variant={'mystery' as any}
        renderStar={({ filled }) => <span data-testid="star" data-filled={String(filled)}>S</span>}
      />
    );
    expect(screen.getAllByTestId('star').length).toBeGreaterThan(0);
  });

  it('unknown variant without a custom renderStar uses the default star renderer', () => {
    const { container } = render(<Rating max={2} defaultValue={1} variant={'mystery' as any} />);
    // defaultRenderStar emits an svg with class rating-star.
    expect(container.querySelector('.rating-star')).not.toBeNull();
  });
});
