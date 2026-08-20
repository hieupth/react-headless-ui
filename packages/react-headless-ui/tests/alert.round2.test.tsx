import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from '../src/components/Alert';

// Round-2 audit fixes: dismiss icon intrinsic size, configurable title heading.

describe('Alert round-2 fixes', () => {
  it('renders the title as an h4 by default', () => {
    render(<Alert open title="Heads up" />);
    expect(
      screen.getByRole('heading', { level: 4, name: 'Heads up' })
    ).toBeInTheDocument();
  });

  it('renders the title with the configured heading level', () => {
    render(<Alert open title="Heads up" titleAs="h3" />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Heads up' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 4 })).toBeNull();
  });

  it('gives the dismiss icon intrinsic width/height', () => {
    render(<Alert open title="Dismissible" dismissible onOpenChange={() => {}} />);
    const svg = screen
      .getByRole('button', { name: 'Dismiss alert' })
      .querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });
});
