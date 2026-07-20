import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Offcanvas } from '../src/components/Offcanvas';

// Offcanvas renders inline (portaled only when open + usePortal). Close is
// deferred by the animation duration (default 300ms), so waitFor the assertions.

describe('Offcanvas (deep)', () => {
  it('renders closed by default with data-open false', () => {
    render(<Offcanvas title="Panel">Body</Offcanvas>);
    const panel = screen.getByTestId('offcanvas');
    expect(panel.getAttribute('data-open')).toBe('false');
  });

  it('opens with defaultOpen (uncontrolled)', () => {
    render(<Offcanvas title="Panel" defaultOpen>Body</Offcanvas>);
    expect(screen.getByTestId('offcanvas').getAttribute('data-open')).toBe('true');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('reflects controlled open state', () => {
    const { rerender } = render(<Offcanvas title="Panel" open={false}>Body</Offcanvas>);
    expect(screen.getByTestId('offcanvas').getAttribute('data-open')).toBe('false');
    rerender(<Offcanvas title="Panel" open>Body</Offcanvas>);
    expect(screen.getByTestId('offcanvas').getAttribute('data-open')).toBe('true');
  });

  it('closes via the close button and calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Offcanvas title="Panel" defaultOpen animationDuration={20} onClose={onClose}>Body</Offcanvas>);
    await user.click(screen.getByTestId('offcanvas-close-button'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('closes on backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Offcanvas title="Panel" defaultOpen animationDuration={20} onClose={onClose}>Body</Offcanvas>);
    const backdrop = screen.getByTestId('offcanvas-backdrop');
    await user.click(backdrop);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('does not close on Escape when persistent', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Panel" defaultOpen persistent animationDuration={20} onClose={onClose}>
        Body
      </Offcanvas>
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Offcanvas title="Panel" defaultOpen animationDuration={20} onClose={onClose}>Body</Offcanvas>);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('does not close on Escape when closeOnEscape is false', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Panel" defaultOpen closeOnEscape={false} animationDuration={20} onClose={onClose}>
        Body
      </Offcanvas>
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('does nothing when disabled and open is attempted', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Panel" defaultOpen disabled animationDuration={20} onClose={onClose}>
        Body
      </Offcanvas>
    );
    await user.click(screen.getByTestId('offcanvas-close-button'));
    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('reflects position and size on the panel', () => {
    render(<Offcanvas title="Panel" defaultOpen position="left" size="lg">Body</Offcanvas>);
    const panel = screen.getByTestId('offcanvas');
    expect(panel.getAttribute('data-position')).toBe('left');
    expect(panel.getAttribute('data-size')).toBe('lg');
  });

  it('does not render a backdrop when showBackdrop is false', () => {
    render(<Offcanvas title="Panel" defaultOpen showBackdrop={false}>Body</Offcanvas>);
    expect(screen.queryByTestId('offcanvas-backdrop')).not.toBeInTheDocument();
  });
});
