import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertDialog, AlertDialogTrigger } from '../src/components/AlertDialog';

describe('AlertDialog', () => {
  it('renders title and confirm/cancel buttons when open', () => {
    render(
      <AlertDialog
        open
        title="Delete file?"
        description="This cannot be undone."
        onOpenChange={() => {}}
      />
    );
    expect(screen.getByText('Delete file?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <AlertDialog
        open
        title="Save changes?"
        onOpenChange={() => {}}
        onConfirm={onConfirm}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders the destructive variant icon and styling', () => {
    const { container } = render(
      <AlertDialog open title="Delete?" variant="destructive" onOpenChange={() => {}} />
    );
    // The destructive variant paints a red icon and a red button border.
    expect(container.querySelector('.text-red-600')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' }).className).toContain('bg-red-600');
  });

  it('renders the warning variant icon and styling', () => {
    const { container } = render(
      <AlertDialog open title="Are you sure?" variant="warning" onOpenChange={() => {}} />
    );
    expect(container.querySelector('.text-yellow-600')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' }).className).toContain('bg-yellow-600');
  });

  it('omits the cancel button when showCancel is false', () => {
    render(<AlertDialog open title="T" showCancel={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('renders nothing visible (display:none) when closed', () => {
    const { container } = render(
      <AlertDialog open={false} title="Hidden" onOpenChange={() => {}} />
    );
    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay.style.display).toBe('none');
  });

  it('renders a spinner label while confirming', async () => {
    let resolveConfirm: () => void = () => {};
    const onConfirm = () => new Promise<void>((r) => { resolveConfirm = r; });
    render(<AlertDialog open title="T" onOpenChange={() => {}} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    // While confirming, the confirm button shows a spinner + the confirm text.
    expect(screen.getByRole('button', { name: 'Confirm' }).className).toContain('opacity-50');
    expect(screen.getByRole('button', { name: 'Confirm' }).querySelector('.animate-spin')).toBeInTheDocument();
    act(() => { resolveConfirm(); });
  });

  it('uses a custom render-prop (children) to paint dialog content', () => {
    const { container } = render(
      <AlertDialog
        open
        title="Render prop"
        onOpenChange={() => {}}
      >
        {({ state, confirmButtonProps }) => (
          <div>
            <span data-testid="open-state">{String(state.open)}</span>
            <button {...confirmButtonProps} data-testid="rendered-confirm">Go</button>
          </div>
        )}
      </AlertDialog>
    );
    // Overlay still mounts and the render-prop output is rendered.
    expect(container.firstElementChild?.style.display).toBe('flex');
    expect(screen.getByTestId('open-state').textContent).toBe('true');
    expect(screen.getByTestId('rendered-confirm')).toBeInTheDocument();
  });

  it('renders an element description (non-string) inside the body', () => {
    render(
      <AlertDialog
        open
        title="T"
        description={<span data-testid="desc-node">node</span>}
        onOpenChange={() => {}}
      />
    );
    expect(screen.getByTestId('desc-node')).toBeInTheDocument();
  });

  it('passes a non-string title straight through to the body (falls back to "Alert" for aria)', () => {
    render(
      <AlertDialog
        open
        title={<span data-testid="title-node">TitleNode</span>}
        onOpenChange={() => {}}
      />
    );
    expect(screen.getByTestId('title-node')).toBeInTheDocument();
  });

  it('hides the render-prop overlay (display:none) when closed', () => {
    const { container } = render(
      <AlertDialog open={false} title="T" onOpenChange={() => {}}>
        {() => <span data-testid="rp">visible</span>}
      </AlertDialog>
    );
    expect((container.firstElementChild as HTMLElement).style.display).toBe('none');
  });

  it('renders AlertDialogTrigger as a styled button', () => {
    const { container } = render(<AlertDialogTrigger data-testid="trigger">Open</AlertDialogTrigger>);
    const btn = screen.getByTestId('trigger');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.className).toContain('rounded-md');
  });
});
