import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../src/components/Toggle';

describe('Toggle', () => {
  it('renders a toggle button', () => {
    render(<Toggle>Bold</Toggle>);
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
  });

  it('fires onPressedChange when clicked', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Italic</Toggle>);
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
  });
});
