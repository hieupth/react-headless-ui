import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../src/components/Dialog';

describe('Dialog renderer branches', () => {
  it('renders title, description, body and footer slot', () => {
    render(
      <Dialog open title="T" description="D" footer={<button>F</button>}>
        Body
      </Dialog>
    );
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('renders the default close button and it is present in the header', () => {
    render(<Dialog open title="T">Body</Dialog>);
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('hides the close button when showCloseButton=false', () => {
    render(<Dialog open title="T" showCloseButton={false}>Body</Dialog>);
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('renders default cancel/confirm actions and fires onConfirm/onCancel', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Dialog
        open
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmText="Yes"
        cancelText="No"
      >
        Body
      </Dialog>
    );
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders only the confirm action when onCancel is absent', () => {
    const onConfirm = vi.fn();
    render(<Dialog open onConfirm={onConfirm}>Body</Dialog>);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('uses custom render prop', () => {
    render(
      <Dialog
        open
        render={({ open, confirm }) => (
          <div>
            <span data-testid="custom-open">{String(open)}</span>
            <button onClick={confirm}>go</button>
          </div>
        )}
      >
        Body
      </Dialog>
    );
    expect(screen.getByTestId('custom-open').textContent).toBe('true');
  });

  it('uses custom renderOverlay and renderContent', () => {
    render(
      <Dialog
        open
        title="T"
        renderOverlay={() => <div data-testid="my-overlay" />}
        renderContent={({ children }) => (
          <div data-testid="my-content">{children}</div>
        )}
      >
        Body
      </Dialog>
    );
    expect(screen.getByTestId('my-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('my-content')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('footer takes precedence over default actions even when onConfirm/onCancel set', () => {
    const onConfirm = vi.fn();
    render(
      <Dialog open onConfirm={onConfirm} footer={<span>foot</span>}>
        Body
      </Dialog>
    );
    expect(screen.getByText('foot')).toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('closed default render returns null', () => {
    const { container } = render(<Dialog>Body</Dialog>);
    expect(container.firstChild).toBeNull();
  });

  it('renders without title (no header) and without description', () => {
    render(<Dialog open>Body</Dialog>);
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.queryByText('Close dialog')).not.toBeInTheDocument();
  });
});
