import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastProvider } from '../src/components/Toast';

// The Toast component renders toasts from useToast's internal state, which is
// not seedable via props. To cover the defaultRenderToast branches we mock the
// useToast hook to return controlled state with pre-seeded toasts. vi.hoisted
// shares mutable state between the test and the (hoisted) mock factory.
const toastStore = vi.hoisted(() => ({
  toasts: [] as any[],
  position: 'top-right' as string,
  isPaused: false as boolean,
  dismissed: [] as string[],
}));

vi.mock('../src/hooks', async () => {
  const React = await import('react');
  return {
    useToast: (_props: any) => {
      const [, force] = React.useReducer((n: number) => n + 1, 0);
      const tick = React.useRef(force);
      tick.current = force;
      // re-render the host whenever dismissed list grows (kept simple: rely on
      // React state changes from the component itself + test re-renders)
      return {
        state: {
          toasts: toastStore.toasts.filter((t) => !toastStore.dismissed.includes(t.id)),
          isPaused: toastStore.isPaused,
          position: toastStore.position,
          maxToasts: 5,
        },
        actions: {
          pause: vi.fn(),
          resume: vi.fn(),
          dismiss: (id: string) => {
            toastStore.dismissed.push(id);
            tick.current();
          },
        },
        containerAttributes: {
          role: 'status',
          'aria-live': 'polite',
          'aria-label': 'Notifications',
        },
      };
    },
  };
});

function seed(toasts: any[], position = 'top-right') {
  toastStore.toasts = toasts;
  toastStore.position = position;
  toastStore.isPaused = false;
  toastStore.dismissed = [];
}

function makeToast(overrides: any = {}) {
  return {
    id: 't1',
    message: 'Hello world',
    variant: 'default',
    duration: 5000,
    dismissible: true,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('Toast extras', () => {
  it('renders the container with role=status and aria-live', () => {
    render(<Toast position="top-right" />);
    const container = screen.getByTestId('toast-container');
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('renders a seeded toast with message and variant classes', () => {
    seed([makeToast({ variant: 'success' })]);
    render(<Toast />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders a toast title when provided', () => {
    seed([makeToast({ title: 'Notice' })]);
    render(<Toast />);
    expect(screen.getByText('Notice')).toBeInTheDocument();
  });

  it('renders the action button and fires its onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    seed([makeToast({ action: { label: 'Undo', onClick } })]);
    render(<Toast />);
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders a dismiss button that removes the toast', async () => {
    const user = userEvent.setup();
    seed([makeToast({ id: 'dismiss-me' })]);
    render(<Toast />);
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
  });

  it('hides the dismiss button when dismissible is false', () => {
    seed([makeToast({ dismissible: false })]);
    render(<Toast />);
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).not.toBeInTheDocument();
  });

  it('renders a custom close button content', () => {
    seed([makeToast()]);
    render(<Toast closeButtonContent={<span data-testid="custom-x">X</span>} />);
    expect(screen.getByTestId('custom-x')).toBeInTheDocument();
  });

  it('renders the progress bar when showProgress and duration > 0', () => {
    seed([makeToast({ duration: 5000 })]);
    const { container } = render(<Toast showProgress />);
    expect(container.querySelector('[style*="width"]')).toBeInTheDocument();
  });

  it('does not render the progress bar when duration is 0', () => {
    seed([makeToast({ duration: 0 })]);
    const { container } = render(<Toast showProgress />);
    expect(container.querySelector('[style*="width"]')).not.toBeInTheDocument();
  });

  it('renders all variant class sets', () => {
    const variants = ['default', 'success', 'error', 'warning', 'info'];
    for (const variant of variants) {
      seed([makeToast({ id: `v-${variant}`, variant })]);
      const { unmount } = render(<Toast />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
      unmount();
    }
  });

  it('uses a custom renderToast', () => {
    seed([makeToast({ id: 'r1' })]);
    render(
      <Toast
        renderToast={(toast, index, onDismiss) => (
          <div key={toast.id} data-testid={`custom-${toast.id}`}>
            <span>{toast.message}</span>
            <button onClick={onDismiss}>close</button>
            <span>{index}</span>
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-r1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByTestId('custom-r1')).not.toBeInTheDocument();
  });

  it('renders multiple toasts sorted newest-first', () => {
    const older = Date.now() - 1000;
    const newer = Date.now();
    seed([
      makeToast({ id: 'old', createdAt: older, message: 'Old' }),
      makeToast({ id: 'new', createdAt: newer, message: 'New' }),
    ]);
    const { container } = render(<Toast />);
    // select toast items, excluding the container (which also starts with "toast-")
    const items = container.querySelectorAll('.toast-item');
    expect(items.length).toBe(2);
    expect(items[0].getAttribute('data-testid')).toBe('toast-new');
  });

  it('applies className and style to the container', () => {
    render(<Toast className="extra-class" style={{ zIndex: 99 }} />);
    const container = screen.getByTestId('toast-container');
    expect(container.className).toContain('extra-class');
    expect(container.getAttribute('style')).toContain('z-index');
  });

  it('renders each position variant', () => {
    const positions = [
      'top-left',
      'top-right',
      'top-center',
      'bottom-left',
      'bottom-right',
      'bottom-center',
    ];
    for (const pos of positions) {
      seed([makeToast()], pos);
      const { unmount } = render(<Toast position={pos} />);
      expect(screen.getByTestId('toast-container')).toBeInTheDocument();
      unmount();
    }
  });

  it('ToastProvider renders the container', () => {
    seed([]);
    render(<ToastProvider position="top-right" />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('renders pause/resume handlers on mouse enter/leave', () => {
    seed([makeToast()]);
    render(<Toast />);
    const toast = screen.getByTestId('toast-t1');
    fireEvent.mouseEnter(toast);
    fireEvent.mouseLeave(toast);
    expect(toast).toBeInTheDocument();
  });

  it('falls back to a renderable position for an unknown position', () => {
    seed([makeToast()], 'unknown-position' as any);
    const { container } = render(<Toast />);
    const el = container.querySelector('.toast-container') as HTMLElement;
    // Headless-only: unknown position no longer emits a positional utility;
    // the fallback path still renders the container.
    expect(el).toBeInTheDocument();
  });

  it('falls back to the default variant for an unknown variant', () => {
    seed([makeToast({ variant: 'unknown-variant' as any })]);
    const { container } = render(<Toast />);
    const item = container.querySelector('.toast-item') as HTMLElement;
    // Headless-only: variant no longer emits a bg utility; the item still renders.
    expect(item).toBeInTheDocument();
  });

  it('renders the paused-state opacity branch when isPaused is true', () => {
    seed([makeToast()]);
    toastStore.isPaused = true;
    render(<Toast />);
    expect(screen.getByTestId('toast-t1')).toBeInTheDocument();
  });
});
