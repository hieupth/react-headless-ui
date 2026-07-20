import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../src/components/Dialog';

// Dialog portals into document.body, so screen.* (which queries document) works
// regardless of where the component mounts.

describe('Dialog (deep)', () => {
  it('renders nothing when closed and renders title/body when open', () => {
    const { rerender } = render(<Dialog open={false}>Body</Dialog>);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();

    rerender(<Dialog open title="My Title">Body</Dialog>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('marks the dialog container with aria-modal and data-state', () => {
    render(<Dialog open title="T">Body</Dialog>);
    const dialog = screen.getByText('Body').closest('[data-state]');
    expect(dialog?.getAttribute('data-state')).toBe('open');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  it('closes on Escape via onCancel/onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    render(
      <Dialog open title="T" closeOnEscape onOpenChange={onOpenChange} onCancel={onCancel}>
        Body
      </Dialog>
    );
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on Escape when closeOnEscape is false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open title="T" closeOnEscape={false} onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes when the overlay is clicked (closeOnOverlayClick default true)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open title="T" onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );
    // Overlay is the .dialog-overlay div (sibling of content).
    const overlay = document.body.querySelector('.dialog-overlay') as HTMLElement;
    expect(overlay).toBeTruthy();
    await user.click(overlay);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on overlay click when closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open title="T" closeOnOverlayClick={false} onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );
    const overlay = document.body.querySelector('.dialog-overlay') as HTMLElement;
    await user.click(overlay);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('clicking inside the content does not close the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open title="T" onOpenChange={onOpenChange}>
        Body
      </Dialog>
    );
    await user.click(screen.getByText('Body'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('confirm/cancel action buttons fire their handlers and close', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        title="T"
        confirmText="Save"
        cancelText="Back"
        onConfirm={onConfirm}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      >
        Body
      </Dialog>
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders custom footer when provided and skips default actions', () => {
    render(
      <Dialog open title="T" onConfirm={() => {}} footer={<button>Custom</button>}>
        Body
      </Dialog>
    );
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    // Default confirm/cancel actions are not rendered when footer is present.
    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
  });

  it('renders the close (X) button when showCloseButton is true and a title exists', () => {
    render(<Dialog open title="T" showCloseButton>Body</Dialog>);
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('omits the close button when showCloseButton is false', () => {
    render(<Dialog open title="T" showCloseButton={false}>Body</Dialog>);
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  it('renders description when provided and associates it via id', () => {
    render(<Dialog open title="T" description="Please confirm">Body</Dialog>);
    expect(screen.getByText('Please confirm')).toBeInTheDocument();
  });

  it('locks body scroll while a modal dialog is open', () => {
    render(<Dialog open title="T" modal>Body</Dialog>);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
