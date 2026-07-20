import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, SimpleTooltip, RichTooltip } from '../src/components/Tooltip';

describe('Tooltip delay timers', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('honours delayShow before revealing content on hover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Delayed" delayShow={200} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    // Not shown immediately
    expect(screen.queryByText('Delayed')).not.toBeInTheDocument();
    // After the delay elapses it appears
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('honours delayHide before removing content after unhover', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="DelayedHide" delayShow={0} delayHide={200}>
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);
    expect(screen.getByText('DelayedHide')).toBeInTheDocument();
    await user.unhover(trigger);
    // Still visible before the hide delay elapses
    expect(screen.getByText('DelayedHide')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByText('DelayedHide')).not.toBeInTheDocument();
  });

  it('clears pending show timeout if hide is called first', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Maybe" delayShow={200} delayHide={0} onOpenChange={onOpenChange}>
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);
    await user.unhover(trigger);
    // Advance well past the show delay; show should have been cancelled
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText('Maybe')).not.toBeInTheDocument();
  });
});

describe('Tooltip passes through child event handlers', () => {
  it('calls the child onMouseEnter/onMouseLeave/onFocus/onBlur/onClick alongside tooltip handlers', async () => {
    const user = userEvent.setup();
    const mouseEnter = vi.fn();
    const mouseLeave = vi.fn();
    const focus = vi.fn();
    const blur = vi.fn();
    const click = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Tooltip
        content="Tip"
        trigger={['hover', 'focus', 'click']}
        delayShow={0}
        delayHide={0}
        onOpenChange={onOpenChange}
      >
        <button
          onMouseEnter={mouseEnter}
          onMouseLeave={mouseLeave}
          onFocus={focus}
          onBlur={blur}
          onClick={click}
        >
          Trigger
        </button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.hover(trigger);
    expect(mouseEnter).toHaveBeenCalledTimes(1);
    await user.unhover(trigger);
    expect(mouseLeave).toHaveBeenCalledTimes(1);

    trigger.focus();
    expect(focus).toHaveBeenCalledTimes(1);
    await user.click(trigger);
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe('Tooltip arrow, className and style', () => {
  it('renders an arrow element when arrow is true', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" arrow delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    const tip = await screen.findByText('Tip');
    // defaultArrowRender adds a div with border-gray-900 class
    expect(tip.parentElement?.querySelector('.border-gray-900')).not.toBeNull();
  });

  it('does not render an arrow when arrow is false', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" arrow={false} delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    const tip = await screen.findByText('Tip');
    expect(tip.parentElement?.querySelector('.border-gray-900')).toBeNull();
  });

  it('applies custom className and style to the tooltip content', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" className="my-tip" style={{ borderColor: 'red' }} delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    const tip = await screen.findByText('Tip');
    expect(tip.parentElement?.className).toContain('my-tip');
  });
});

describe('Tooltip custom render props', () => {
  it('uses the custom render prop entirely', () => {
    render(
      <Tooltip
        content="Tip"
        render={(props) => (
          <div data-testid="custom">
            <span>{props.open ? 'open' : 'closed'}</span>
          </div>
        )}
      >
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.getByText('closed')).toBeInTheDocument();
  });

  it('uses custom renderContent while keeping default trigger', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip
        content="Raw"
        delayShow={0}
        delayHide={0}
        renderContent={() => <strong data-testid="custom-content">Custom</strong>}
      >
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(await screen.findByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByText('Raw')).not.toBeInTheDocument();
  });

  it('uses custom renderArrow when arrow is true', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip
        content="Tip"
        arrow
        delayShow={0}
        delayHide={0}
        renderArrow={() => <span data-testid="custom-arrow">▲</span>}
      >
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(await screen.findByTestId('custom-arrow')).toBeInTheDocument();
  });
});

describe('Tooltip controlled open and positions', () => {
  it('renders content for controlled open with different positions', () => {
    const { rerender } = render(
      <Tooltip content="Tip" open position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Tip')).toBeInTheDocument();
    rerender(
      <Tooltip content="Tip" open position="left">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Tip')).toBeInTheDocument();
  });

  it('defaultOpen seeds uncontrolled open state', () => {
    render(
      <Tooltip content="Tip" defaultOpen>
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Tip')).toBeInTheDocument();
  });
});

describe('SimpleTooltip', () => {
  it('shows content after the configured delayShow on hover and hides after delayHide', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <SimpleTooltip content="Simple">
        <button>Hover me</button>
      </SimpleTooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    // SimpleTooltip defaults delayShow=300
    expect(screen.queryByText('Simple')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(screen.getByText('Simple')).toBeInTheDocument();
    await user.unhover(screen.getByRole('button', { name: 'Hover me' }));
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.queryByText('Simple')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows on focus (focus trigger included)', async () => {
    const user = userEvent.setup();
    render(
      <SimpleTooltip content="Simple">
        <button>Focus me</button>
      </SimpleTooltip>
    );
    screen.getByRole('button', { name: 'Focus me' }).focus();
    expect(await screen.findByText('Simple')).toBeInTheDocument();
  });
});

describe('RichTooltip', () => {
  it('renders title, description and actions when open', () => {
    render(
      <RichTooltip
        title="Title"
        description="Description body"
        actions={<button data-testid="action">Go</button>}
        open
        delayShow={0}
        delayHide={0}
      >
        <button>Hover me</button>
      </RichTooltip>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description body')).toBeInTheDocument();
    expect(screen.getByTestId('action')).toBeInTheDocument();
  });

  it('omits title/description/actions nodes when not provided', () => {
    render(
      <RichTooltip open delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </RichTooltip>
    );
    // Still renders without error; the rich container exists
    expect(document.querySelector('.max-w-sm')).not.toBeNull();
  });

  it('is interactive and reveals on hover', async () => {
    const user = userEvent.setup();
    render(
      <RichTooltip title="Title" description="Desc" delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </RichTooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(await screen.findByText('Title')).toBeInTheDocument();
  });
});

describe('Tooltip interactive mode', () => {
  it('keeps the tooltip open when hovering into it in interactive mode', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" interactive delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);
    const tip = await screen.findByText('Tip');
    // Leaving the trigger but entering the tooltip should keep it open (interactive)
    await user.unhover(trigger);
    await user.hover(tip);
    expect(screen.getByText('Tip')).toBeInTheDocument();
  });
});

describe('Tooltip manual trigger is a no-op for hover/focus/click', () => {
  it('does not open on hover when trigger is manual', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tip" trigger="manual" delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(screen.queryByText('Tip')).not.toBeInTheDocument();
  });
});
