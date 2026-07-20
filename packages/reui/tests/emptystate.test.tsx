import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../src/components/EmptyState';
import { useEmptyState } from '../src/hooks';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No results" description="Try another search" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try another search')).toBeInTheDocument();
  });

  it('renders a primary action button when text is provided', () => {
    render(<EmptyState title="Empty" primaryActionText="Add item" />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('renders both primary and secondary action buttons', () => {
    render(
      <EmptyState primaryActionText="Add" secondaryActionText="Cancel" />
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders nothing when visible is false', () => {
    const { container } = render(<EmptyState title="Hidden" visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the icon when provided', () => {
    render(<EmptyState icon={<span data-testid="icon">★</span>} title="T" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<EmptyState title="T"><span data-testid="child">Body</span></EmptyState>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('fires onPrimaryAction when the primary button is clicked', async () => {
    const user = userEvent.setup();
    const onPrimaryAction = vi.fn();
    render(<EmptyState primaryActionText="Go" onPrimaryAction={onPrimaryAction} />);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it('fires onSecondaryAction when the secondary button is clicked', async () => {
    const user = userEvent.setup();
    const onSecondaryAction = vi.fn();
    render(<EmptyState secondaryActionText="Reset" onSecondaryAction={onSecondaryAction} />);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders a dismiss button when dismissible', () => {
    render(<EmptyState title="T" dismissible onDismiss={() => {}} />);
    expect(screen.getByRole('button', { name: /Dismiss empty state/i })).toBeInTheDocument();
  });

  it('fires onDismiss when dismiss is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<EmptyState title="T" dismissible onDismiss={onDismiss} />);
    await user.click(screen.getByRole('button', { name: /Dismiss empty state/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies variant-specific data-testid', () => {
    const { rerender } = render(<EmptyState variant="error" title="T" />);
    expect(screen.getByTestId('empty-state-error')).toBeInTheDocument();
    rerender(<EmptyState variant="loading" title="T" />);
    expect(screen.getByTestId('empty-state-loading')).toBeInTheDocument();
  });

  it('does not render actions when showActions is false', () => {
    render(<EmptyState primaryActionText="Add" showActions={false} />);
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
  });
});

describe('useEmptyState', () => {
  it('handlePrimaryAction / handleSecondaryAction / handleDismiss forward calls', () => {
    const onPrimaryAction = vi.fn();
    const onSecondaryAction = vi.fn();
    const onDismiss = vi.fn();
    let result: any;
    const Probe = () => {
      result = useEmptyState({ onPrimaryAction, onSecondaryAction, onDismiss });
      return null;
    };
    render(<Probe />);
    result.handlers.handlePrimaryAction();
    result.handlers.handleSecondaryAction();
    result.handlers.handleDismiss();
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('handleKeyDown triggers dismiss on Escape when dismissible', () => {
    const onDismiss = vi.fn();
    let result: any;
    const Probe = () => {
      result = useEmptyState({ dismissible: true, onDismiss });
      return null;
    };
    render(<Probe />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    // The handler must be attached; invoke directly to cover the branch.
    result.handlers.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('handleKeyDown triggers primary action on Enter', () => {
    const onPrimaryAction = vi.fn();
    let result: any;
    const Probe = () => {
      result = useEmptyState({ onPrimaryAction });
      return null;
    };
    render(<Probe />);
    result.handlers.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any);
    expect(onPrimaryAction).toHaveBeenCalled();
  });
});
