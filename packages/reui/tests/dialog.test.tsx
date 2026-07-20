import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../src/components/Dialog';

describe('Dialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Dialog>Body</Dialog>);
    expect(container.firstChild).toBeNull();
  });

  it('renders its title and body when open, and hides them when closed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog open title="Confirm" onOpenChange={onOpenChange}>
        Are you sure?
      </Dialog>
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    rerender(
      <Dialog open={false} title="Confirm" onOpenChange={onOpenChange}>
        Are you sure?
      </Dialog>
    );
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });
});
