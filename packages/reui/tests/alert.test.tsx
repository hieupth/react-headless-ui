import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../src/components/Alert';
import { useAlert } from '../src/hooks';

describe('Alert', () => {
  it('renders an alert with role and title when open', () => {
    render(<Alert open title="Heads up" description="Something happened" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<Alert open={false} title="Hidden" />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert open title="Dismissible" dismissible onDismiss={onDismiss} onOpenChange={() => {}} />
    );
    await user.click(screen.getByRole('button', { name: /Dismiss alert/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders each variant without error', () => {
    const variants = ['default', 'destructive', 'warning', 'success'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Alert open variant={variant} title="X" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders children content when provided', () => {
    render(<Alert open title="T"><span data-testid="child">Extra</span></Alert>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('does not render a dismiss button when not dismissible', () => {
    render(<Alert open title="T" />);
    expect(screen.queryByRole('button', { name: /Dismiss alert/i })).toBeNull();
  });

  it('auto-dismisses after the timeout', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Alert open autoDismiss={500} onDismiss={onDismiss} onOpenChange={onOpenChange} title="Auto" />
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  it('renders a custom icon via renderIcon', () => {
    render(<Alert open title="T" renderIcon={() => <span data-testid="custom-icon">★</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('dismisses on Escape when dismissible', () => {
    const onDismiss = vi.fn();
    render(<Alert open title="T" dismissible onDismiss={onDismiss} onOpenChange={() => {}} />);
    fireEvent.keyDown(screen.getByRole('alert'), { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('uses a custom render function', () => {
    render(
      <Alert
        open
        title="T"
        render={(props) => <div data-testid="custom-alert" role="alert">{props.variant}</div>}
      />
    );
    expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
  });
});

describe('useAlert', () => {
  it('derives variant from severity and vice versa', () => {
    let errorAlert: any;
    let warningAlert: any;
    const ProbeError = () => { errorAlert = useAlert({ open: true, severity: 'error' }); return null; };
    const ProbeWarning = () => { warningAlert = useAlert({ open: true, variant: 'warning' }); return null; };
    render(<><ProbeError /><ProbeWarning /></>);
    expect(errorAlert.computedVariant).toBe('destructive');
    expect(warningAlert.computedSeverity).toBe('warning');
  });

  it('show() calls onOpenChange with true', () => {
    const onOpenChange = vi.fn();
    let actions: any;
    const Probe = () => {
      const a = useAlert({ open: false, onOpenChange });
      actions = a;
      return null;
    };
    render(<Probe />);
    act(() => actions.show());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
