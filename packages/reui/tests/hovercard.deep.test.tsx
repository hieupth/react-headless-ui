import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard } from '../src/components/HoverCard';
import { useHoverCard } from '../src/hooks/useHoverCard';

describe('HoverCard (deep)', () => {
  it('hides content until the trigger is hovered', () => {
    render(
      <HoverCard trigger={<span>Hover me</span>}>Card content</HoverCard>
    );
    expect(screen.queryByText('Card content')).not.toBeInTheDocument();
  });

  it('shows content on hover after the hover delay', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0}>
        Card content
      </HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Card content')).toBeInTheDocument();
  });

  it('hides content after the leave delay on unhover', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
        Card content
      </HoverCard>
    );
    const trigger = screen.getByTestId('hover-card-trigger');
    await user.hover(trigger);
    await screen.findByText('Card content');
    await user.unhover(trigger);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('respects controlled open state', () => {
    render(
      <HoverCard trigger={<span>Hover me</span>} open>
        Card content
      </HoverCard>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('calls onOpenChange when opened', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
        Card content
      </HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
  });

  it('signals close on Escape via onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard trigger={<span>Hover me</span>} open hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
        Card content
      </HoverCard>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('closes on outside click when controlled open', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <div>
        <button>Elsewhere</button>
        <HoverCard trigger={<span>Hover me</span>} open hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
          Card content
        </HoverCard>
      </div>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('exposes over-trigger/over-card state through the rendered trigger', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0}>
        Card content
      </HoverCard>
    );
    const trigger = screen.getByTestId('hover-card-trigger');
    await user.hover(trigger);
    // While over the trigger the card is visible (isOverTrigger path holds it open).
    expect(await screen.findByText('Card content')).toBeInTheDocument();
  });

  it('renders the arrow when showArrow is true', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0} showArrow>
        Card content
      </HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByTestId('hover-card-arrow')).toBeInTheDocument();
  });

  it('marks the trigger with aria-haspopup and aria-expanded', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0}>
        Card content
      </HoverCard>
    );
    const trigger = screen.getByTestId('hover-card-trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    await user.hover(trigger);
    await screen.findByText('Card content');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('exercises every placement switch case via rerender', () => {
    const placements = [
      'top', 'bottom', 'left', 'right',
      'top-start', 'top-end', 'bottom-start', 'bottom-end',
    ] as const;
    const { rerender } = render(
      <HoverCard trigger={<span>t</span>} open placement={placements[0]}>
        c
      </HoverCard>
    );
    for (const placement of placements) {
      rerender(
        <HoverCard trigger={<span>t</span>} open placement={placement}>
          c
        </HoverCard>
      );
    }
    // also exercise the unknown-placement default branches
    rerender(
      <HoverCard trigger={<span>t</span>} open placement={'unknown' as any}>
        c
      </HoverCard>
    );
    expect(screen.getByTestId('hover-card')).toBeInTheDocument();
  });

  it('omits the select-none class when preventTextSelection is false', () => {
    render(
      <HoverCard trigger={<span>Hover me</span>} preventTextSelection={false}>
        Card content
      </HoverCard>
    );
    expect(screen.getByTestId('hover-card-trigger').className).not.toContain('select-none');
  });

  it('opens the card on trigger focus and closes on blur', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
        Card content
      </HoverCard>
    );
    const trigger = screen.getByTestId('hover-card-trigger');
    // The trigger is a span with tabIndex; focus it to drive triggerProps.onFocus.
    await user.tab();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    // Clicking the trigger hits triggerProps.onClick (preventDefault only).
    await user.click(trigger);
    // Blur the trigger to drive triggerProps.onBlur -> handleClose.
    await user.tab();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('closes on Escape pressed while the card has focus (cardProps.onKeyDown)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <HoverCard trigger={<span>Hover me</span>} open hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
        <button>Inside</button>
      </HoverCard>
    );
    const card = screen.getByTestId('hover-card');
    const inside = screen.getByRole('button', { name: 'Inside' });
    inside.focus();
    expect(card).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('keeps the card open while the pointer rests on it (card mouse enter/leave)', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>} hoverDelay={0} leaveDelay={0} onOpenChange={onOpenChange}>
        Card content
      </HoverCard>
    );
    const trigger = screen.getByTestId('hover-card-trigger');
    await user.hover(trigger);
    const content = await screen.findByTestId('hover-card-content');
    // Enter the card (isOverCard true), leave the trigger (isOverTrigger false; card keeps it open),
    // then leave the card while no longer over the trigger -> handleClose fires.
    fireEvent.mouseEnter(content);
    fireEvent.mouseLeave(trigger);
    expect(content).toBeInTheDocument();
    fireEvent.mouseLeave(content);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

describe('useHoverCard (hook actions)', () => {
  it('open/close/toggle drive onOpenChange in uncontrolled and controlled modes', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useHoverCard({ hoverDelay: 0, leaveDelay: 0, onOpenChange }));
    // toggle from closed -> openImmediate
    act(() => result.current.actions.toggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    // toggle from open -> closeImmediate
    act(() => result.current.actions.toggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    // direct open / close
    act(() => result.current.actions.open());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => result.current.actions.close());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('controlled mode keeps state authoritative and still reports changes', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useHoverCard({ open: false, hoverDelay: 0, leaveDelay: 0, onOpenChange }));
    act(() => result.current.actions.open());
    expect(result.current.state.open).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('exercises the controlled open/close timeout branches via hover handlers', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useHoverCard({ open: false, hoverDelay: 0, leaveDelay: 0, onOpenChange }));
    // handleTriggerMouseEnter -> handleOpen (controlled branch of the internal-state guard)
    act(() => result.current.triggerProps.onMouseEnter({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    // handleTriggerMouseLeave while not over the card -> handleClose (controlled branch)
    act(() => result.current.triggerProps.onMouseLeave({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    vi.useRealTimers();
  });

  it('trigger focus is a no-op when already open; blur defers close while over the card', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useHoverCard({ open: true, hoverDelay: 0, leaveDelay: 0, onOpenChange }));
    // open=true -> onFocus does not call openImmediate again
    act(() => result.current.triggerProps.onFocus({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).not.toHaveBeenCalled();
    // Move over the card (isOverCard true); blurring the trigger then keeps it open.
    act(() => result.current.cardProps.onMouseEnter({} as any));
    act(() => result.current.triggerProps.onBlur({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).not.toHaveBeenCalled();
    // Hover the trigger (isOverTrigger true), then leave the card while over the trigger
    // -> the !isOverTrigger guard is false, so no close is scheduled.
    act(() => result.current.triggerProps.onMouseEnter({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => result.current.cardProps.onMouseLeave({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).not.toHaveBeenCalled();
    // Moving off the trigger (and not over the card) schedules a close.
    act(() => result.current.triggerProps.onMouseLeave({} as any));
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    vi.useRealTimers();
  });

  it('card keydown ignores non-Escape keys', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useHoverCard({ open: true, hoverDelay: 0, leaveDelay: 0, onOpenChange }));
    const preventDefault = vi.fn();
    act(() => result.current.cardProps.onKeyDown({ key: 'Tab', preventDefault } as any));
    expect(preventDefault).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
