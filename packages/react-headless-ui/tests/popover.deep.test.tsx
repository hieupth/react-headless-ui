import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from '../src/components/Popover';
import { usePopover } from '../src/hooks';
import type { UsePopoverProps } from '../src/hooks';

// Direct hook harness: the Popover component's `trigger` prop (ReactNode)
// collides with the hook's `trigger` mode prop, so hover/focus modes are only
// reachable through the hook itself.
function setupHook(props: UsePopoverProps) {
  const api = { state: null as any, actions: null as any };
  function Harness() {
    const result = usePopover(props);
    api.state = result.state;
    api.actions = result.actions;
    return (
      <div>
        <button data-testid="h-trigger" />
      </div>
    );
  }
  render(<Harness />);
  return api;
}

describe('Popover (deep)', () => {
  it('keeps content hidden until the trigger is clicked', () => {
    render(
      <Popover trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('opens with defaultOpen (uncontrolled)', () => {
    render(
      <Popover defaultOpen trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('reflects controlled open state', () => {
    const { rerender } = render(
      <Popover open={false} trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    rerender(
      <Popover open trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('toggles on trigger click and fires onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Popover trigger={<span>Open</span>} onOpenChange={onOpenChange}>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Popover content')).toBeInTheDocument();
    await user.click(screen.getByText('Open'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>Outside</button>
        <Popover defaultOpen trigger={<span>Open</span>}>
          <span>Popover content</span>
        </Popover>
      </div>
    );
    expect(screen.getByText('Popover content')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('does not close on outside click when closeOnClickOutside is false', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>Outside</button>
        <Popover defaultOpen closeOnClickOutside={false} trigger={<span>Open</span>}>
          <span>Popover content</span>
        </Popover>
      </div>
    );
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('opens via the hook hover trigger on mouse enter and closes on leave', async () => {
    const api = setupHook({ trigger: 'hover', openDelay: 0, closeDelay: 0 });
    expect(api.state.open).toBe(false);
    act(() => api.actions.handleTriggerMouseEnter());
    await waitFor(() => expect(api.state.open).toBe(true));
    act(() => api.actions.handleTriggerMouseLeave());
    await waitFor(() => expect(api.state.open).toBe(false));
  });

  it('opens on focus and closes on blur for the hook focus trigger', async () => {
    const api = setupHook({ trigger: 'focus', closeOnTriggerBlur: true });
    act(() => api.actions.handleTriggerFocus());
    expect(api.state.open).toBe(true);
    act(() => api.actions.handleTriggerBlur());
    expect(api.state.open).toBe(false);
  });

  it('setPosition updates the hook state position', () => {
    const api = setupHook({ trigger: 'click' });
    act(() => api.actions.setPosition('top'));
    expect(api.state.position).toBe('top');
  });

  it('renders the close button and closes when showCloseButton is true', async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen showCloseButton trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByTestId('popover-close-button'));
    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Popover disabled trigger={<span>Open</span>}>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });
});
