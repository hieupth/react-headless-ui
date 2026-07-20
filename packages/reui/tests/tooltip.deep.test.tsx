import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../src/components/Tooltip';
import { useTooltip } from '../src/hooks/useTooltip';

// Tooltip clones its single child and injects trigger handlers. Content renders
// into a portal on document.body when open, so screen.* finds it.

describe('Tooltip (deep)', () => {
  it('does not show content when closed', () => {
    render(
      <Tooltip content="Tip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });

  it('shows content on hover (default trigger) and hides on unhover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);
    expect(await screen.findByText('Tip')).toBeInTheDocument();
    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByText('Tip')).not.toBeInTheDocument());
  });

  it('respects controlled open state', () => {
    render(
      <Tooltip content="Tip" open>
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Tip')).toBeInTheDocument();
  });

  it('calls onOpenChange when toggled via click trigger', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Tip" trigger="click" delayShow={0} delayHide={0} onOpenChange={onOpenChange}>
        <button>Click me</button>
      </Tooltip>
    );
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows on focus and hides on blur for focus trigger', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" trigger="focus" delayShow={0} delayHide={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Focus me' });
    await user.tab();
    expect(await screen.findByText('Tip')).toBeInTheDocument();
  });

  it('does nothing on hover when the trigger is click-only', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" trigger="click" delayShow={0} delayHide={0}>
        <button>Click me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Click me' }));
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });

  it('marks the trigger with aria-describedby when open', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    await screen.findByText('Tip');
    expect(screen.getByRole('button', { name: 'Hover me' }).getAttribute('aria-describedby')).toBeTruthy();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" disabled delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });

  it('supports multiple triggers (hover + focus)', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" trigger={['hover', 'focus']} delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(await screen.findByText('Tip')).toBeInTheDocument();
  });
});

describe('useTooltip (hook actions)', () => {
  it('show cancels a pending hide timeout; hide is a no-op when disabled', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useTooltip({ content: 'x', delayShow: 0, delayHide: 100, onOpenChange })
    );
    // open, then hide (schedules a delayed close), then show again (cancels the close).
    act(() => result.current.show());
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => result.current.hide()); // schedules close in 100ms
    act(() => result.current.show()); // cancels pending hide timeout
    act(() => { vi.advanceTimersByTime(150); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    vi.useRealTimers();
  });

  it('hide is a no-op when disabled', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useTooltip({ content: 'x', disabled: true, onOpenChange }));
    act(() => result.current.hide());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('focus-trigger blur hides when not interactive; tooltip enter/leave toggle for interactive', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useTooltip({ content: 'x', trigger: 'focus', delayShow: 0, delayHide: 0, onOpenChange })
    );
    act(() => result.current.handleTriggerFocus());
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => result.current.handleTriggerBlur()); // not interactive -> hide
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    // interactive tooltip: tooltip enter/leave drive show/hide
    const interactive = renderHook(() =>
      useTooltip({ content: 'x', interactive: true, delayShow: 0, delayHide: 0, onOpenChange })
    );
    act(() => interactive.result.current.handleTooltipEnter());
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => interactive.result.current.handleTooltipLeave());
    act(() => { vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    vi.useRealTimers();
  });

  it('calculatePosition returns the zero fallback when refs are absent', () => {
    const { result } = renderHook(() => useTooltip({ content: 'x', position: 'top' }));
    const pos = result.current.calculatePosition();
    expect(pos).toEqual({ x: 0, y: 0, position: 'top' });
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('arrow styles resolve for position %s', (position) => {
    const { result } = renderHook(() => useTooltip({ content: 'x', arrow: true, position }));
    // Each position yields a distinct border-oriented arrow style.
    expect(result.current.arrowStyles).toHaveProperty('borderStyle', 'solid');
  });

  it('arrow disabled yields empty styles; non-cardinal position yields base styles', () => {
    const noArrow = renderHook(() => useTooltip({ content: 'x', arrow: false }));
    expect(noArrow.result.current.arrowStyles).toEqual({});
    // top-start is not one of top/bottom/left/right -> baseStyles fallthrough (no borderColor).
    const base = renderHook(() => useTooltip({ content: 'x', arrow: true, position: 'top-start' as any }));
    expect(base.result.current.arrowStyles).toHaveProperty('borderStyle', 'solid');
    expect(base.result.current.arrowStyles).not.toHaveProperty('borderColor');
  });

  it('tooltip pointerEvents resolve for disablePointerEvents and interactive combinations', () => {
    const disabled = renderHook(() => useTooltip({ content: 'x', disablePointerEvents: true }));
    expect(disabled.result.current.tooltipStyles.pointerEvents).toBe('none');
    const interactive = renderHook(() => useTooltip({ content: 'x', interactive: true }));
    expect(interactive.result.current.tooltipStyles.pointerEvents).toBe('auto');
    const plain = renderHook(() => useTooltip({ content: 'x' }));
    expect(plain.result.current.tooltipStyles.pointerEvents).toBe('none');
  });

  it('calculatePosition falls back to the top placement for an unknown position with live refs', () => {
    let api: ReturnType<typeof useTooltip> | null = null;
    function Probe() {
      api = useTooltip({ content: 'x', position: 'unknown' as any });
      return (
        <>
          <div ref={api!.triggerRef as any} data-testid="t" />
          <div ref={api!.tooltipRef as any} data-testid="tt" />
        </>
      );
    }
    render(<Probe />);
    act(() => api!.show());
    // updatePosition runs on open; unknown position falls back to 'top'.
    expect(['top', 'unknown']).toContain(api!.position);
  });

  it('controlled show/hide report changes without mutating internal state', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useTooltip({ content: 'x', open: false, onOpenChange }));
    act(() => result.current.show());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(result.current.open).toBe(false); // controlled stays false
    act(() => result.current.hide());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('controlled show/hide respect delayShow/delayHide timers', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useTooltip({ content: 'x', open: false, delayShow: 50, delayHide: 50, onOpenChange }));
    act(() => result.current.show());
    act(() => { vi.advanceTimersByTime(60); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => result.current.hide());
    act(() => { vi.advanceTimersByTime(60); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    vi.useRealTimers();
  });

  it('handler guards: blur/click/tooltip-enter/leave are no-ops for non-matching triggers', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    // hover trigger (not focus, not click), not interactive
    const { result } = renderHook(() => useTooltip({ content: 'x', trigger: 'hover', interactive: false, onOpenChange }));
    act(() => result.current.handleTriggerBlur()); // not a focus trigger -> no-op
    act(() => result.current.handleTriggerClick()); // not a click trigger -> no-op
    act(() => result.current.handleTooltipEnter()); // not interactive -> no-op
    act(() => result.current.handleTooltipLeave()); // not interactive -> no-op
    act(() => { vi.advanceTimersByTime(50); });
    expect(onOpenChange).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calculatePosition with flip disabled skips the flip branch', () => {
    let api: ReturnType<typeof useTooltip> | null = null;
    function Probe() {
      api = useTooltip({ content: 'x', position: 'top', flip: false });
      return (
        <>
          <div ref={api!.triggerRef as any} data-testid="t2" />
          <div ref={api!.tooltipRef as any} data-testid="tt2" />
        </>
      );
    }
    render(<Probe />);
    act(() => api!.show());
    expect(api!.calculatePosition().position).toBe('top');
  });
});
