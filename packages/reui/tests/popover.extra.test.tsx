import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from '../src/components/Popover';

// Cover the position-class branches, slots (arrow, close button + custom
// content), and styling passthrough props that the core/deep suites skip.
describe('Popover (extra)', () => {
  const positions = [
    'top',
    'bottom',
    'left',
    'right',
    'top-start',
    'top-end',
    'bottom-start',
    'bottom-end'
  ] as const;

  it.each(positions)('renders an arrow and content positioned %s', (position) => {
    render(
      <Popover defaultOpen position={position} trigger={<span>t</span>}>
        <span>body</span>
      </Popover>
    );
    expect(screen.getByTestId('popover-arrow')).toBeInTheDocument();
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
  });

  it('hides the arrow when showArrow is false', () => {
    render(
      <Popover defaultOpen showArrow={false} trigger={<span>t</span>}>
        <span>no-arrow</span>
      </Popover>
    );
    expect(screen.queryByTestId('popover-arrow')).not.toBeInTheDocument();
  });

  it('renders the default close icon when showCloseButton is set without custom content', () => {
    render(
      <Popover defaultOpen showCloseButton trigger={<span>t</span>}>
        <span>x</span>
      </Popover>
    );
    const btn = screen.getByTestId('popover-close-button');
    expect(btn).toHaveAttribute('aria-label', 'Close popover');
    // default renderer yields an <svg>
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom close button content when provided', () => {
    render(
      <Popover defaultOpen showCloseButton closeButtonContent={<span>dismiss</span>} trigger={<span>t</span>}>
        <span>x</span>
      </Popover>
    );
    expect(screen.getByText('dismiss')).toBeInTheDocument();
  });

  it('applies className/style, triggerClassName, contentClassName and maxWidth', () => {
    render(
      <Popover
        defaultOpen
        className="my-root"
        style={{ color: 'rgb(255, 0, 0)' }}
        triggerClassName="my-trigger"
        contentClassName="my-content"
        maxWidth={500}
        trigger={<span>t</span>}
      >
        <span>x</span>
      </Popover>
    );
    const root = screen.getByTestId('popover');
    expect(root).toHaveClass('my-root');
    expect(root.style.color).toBe('rgb(255, 0, 0)');
    const trigger = screen.getByTestId('popover-trigger');
    expect(trigger).toHaveClass('my-trigger');
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('my-content');
    expect(content.style.maxWidth).toBe('500px');
  });

  it('does not render content when closed (open=false)', () => {
    render(
      <Popover open={false} trigger={<span>t</span>}>
        <span>hidden-body</span>
      </Popover>
    );
    expect(screen.queryByText('hidden-body')).not.toBeInTheDocument();
    expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
  });

  it('reflects disabled state via trigger attributes and aria', () => {
    render(
      <Popover disabled trigger={<span>t</span>}>
        <span>x</span>
      </Popover>
    );
    const trigger = screen.getByTestId('popover-trigger');
    // Headless-only: disabled is exposed via tabindex=-1, not visual classes.
    expect(trigger).toHaveAttribute('tabindex', '-1');
  });

  it('fires onClose when the popover closes via Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Popover defaultOpen onClose={onClose} trigger={<span>t</span>}>
        <span>x</span>
      </Popover>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
