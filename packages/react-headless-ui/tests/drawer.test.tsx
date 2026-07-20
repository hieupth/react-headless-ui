import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '../src/components/Drawer';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Drawer>Contents</Drawer>);
    expect(container.firstChild).toBeNull();
  });

  it('renders its content when open and calls onOpenChange when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="Cart" showCloseButton onOpenChange={onOpenChange}>
        Items
      </Drawer>
    );
    expect(screen.getByText('Items')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close drawer/i }));
    expect(onOpenChange).toHaveBeenCalled();
  });
});
