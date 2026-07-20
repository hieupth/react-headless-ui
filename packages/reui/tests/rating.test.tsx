import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Rating } from '../src/components/Rating';

describe('Rating', () => {
  it('renders the configured number of rating items', () => {
    render(<Rating max={5} defaultValue={2} />);
    expect(screen.getByTestId('rating')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('fires onChange when a rating item is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating max={5} onChange={onChange} />);
    const items = screen.getAllByRole('button');
    await user.click(items[3]);
    expect(onChange).toHaveBeenLastCalledWith(4);
  });
});
