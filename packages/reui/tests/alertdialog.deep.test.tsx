import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog } from '../src/components/AlertDialog';

// AlertDialog renders inline (display:flex/none) rather than via portal, and
// close() waits 150ms before signalling onOpenChange(false). Use waitFor for
// those deferred state changes.

describe('AlertDialog (deep)', () => {
  it('is hidden when closed and shows title/buttons when open', () => {
    const { rerender } = render(
      <AlertDialog open={false} title="Delete?" onOpenChange={() => {}} />
    );
    expect(screen.getByText('Delete?')).toBeInTheDocument(); // rendered but display:none
    expect(screen.getByText('Delete?').closest('[data-state]')?.getAttribute('data-state')).toBe('closed');

    rerender(<AlertDialog open title="Delete?" onOpenChange={() => {}} />);
    expect(screen.getByText('Delete?').closest('[data-state]')?.getAttribute('data-state')).toBe('open');
  });

  it('renders cancel button only when showCancel is true (default)', () => {
    render(<AlertDialog open title="T" showCancel={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('cancel button calls onCancel and closes after the animation grace', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open title="T" onCancel={onCancel} onOpenChange={onOpenChange} />
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('confirm fires onConfirm and then closes', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open title="T" onConfirm={onConfirm} onOpenChange={onOpenChange} />
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('does not close on overlay click (requires explicit action)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <AlertDialog open title="T" onOpenChange={onOpenChange} />
    );
    // The overlay is the outermost fixed container.
    const overlay = container.firstElementChild as HTMLElement;
    await user.click(overlay);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on Escape (document keydown listener)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<AlertDialog open title="T" onOpenChange={onOpenChange} />);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('does not close on Escape while a confirm is in progress', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    let resolveConfirm: () => void = () => {};
    render(
      <AlertDialog
        open
        title="T"
        onOpenChange={onOpenChange}
        onConfirm={() => new Promise<void>((resolve) => { resolveConfirm = resolve; })}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    // While confirming, Escape must not close.
    await user.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
    // Resolve the async confirm: now close proceeds.
    await act(async () => { resolveConfirm(); });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('keeps the dialog open when onConfirm rejects', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error('boom'));
    render(
      <AlertDialog open title="T" onConfirm={onConfirm} onOpenChange={onOpenChange} />
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeDisabled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('reflects the destructive variant on the content and confirm button', () => {
    render(<AlertDialog open title="T" variant="destructive" onOpenChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Confirm' }).getAttribute('data-variant')).toBe('destructive');
  });
});

