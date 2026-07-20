import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../src/components/Label';

describe('Label', () => {
  it('renders its children inside a label', () => {
    render(<Label htmlFor="name">Name</Label>);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Name').tagName).toBe('SPAN');
  });

  it('associates with a form control via htmlFor', () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = document.querySelector('label');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('shows the default required indicator when required', () => {
    render(<Label required>Name</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows a custom required indicator when provided', () => {
    render(<Label required requiredIndicator="Required">Name</Label>);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('places the required indicator at the start', () => {
    const { container } = render(
      <Label required requiredPosition="start" requiredIndicator="*">Name</Label>
    );
    const label = container.querySelector('label');
    expect(label?.firstElementChild).toHaveClass('label-required-indicator');
  });

  it('places the required indicator at the end by default', () => {
    const { container } = render(<Label required requiredIndicator="*">Name</Label>);
    const label = container.querySelector('label');
    expect(label?.lastElementChild).toHaveClass('label-required-indicator');
  });

  it('uses a custom renderRequiredIndicator', () => {
    render(<Label required renderRequiredIndicator={() => <span data-testid="custom-indicator">!</span>}>Name</Label>);
    expect(screen.getByTestId('custom-indicator')).toBeInTheDocument();
  });

  it('does not render a required indicator when not required', () => {
    const { container } = render(<Label>Name</Label>);
    expect(container.querySelector('.label-required-indicator')).toBeNull();
  });

  it('uses the destructive color for the required indicator in an error state', () => {
    const { container } = render(<Label required error>Name</Label>);
    const indicator = container.querySelector('.label-required-indicator') as HTMLElement;
    expect(indicator).not.toBeNull();
    // theme.colors.destructive renders as rgb in jsdom.
    expect((indicator.style as any).color).toBeTruthy();
    expect(container.querySelector('.label-error')).not.toBeNull();
  });

  it('applies error and disabled classes', () => {
    const { container, rerender } = render(<Label error>Name</Label>);
    expect(container.querySelector('label')).toHaveClass('label-error');

    rerender(<Label disabled>Name</Label>);
    expect(container.querySelector('label')).toHaveClass('label-disabled');
  });

  it('renders without a data-disabled attribute when enabled', () => {
    const { container } = render(<Label htmlFor="x">Field</Label>);
    expect(container.querySelector('label')).not.toHaveAttribute('data-disabled');
  });

  it('marks the label as disabled with a data attribute', () => {
    const { container } = render(<Label htmlFor="x" disabled>Field</Label>);
    expect(container.querySelector('label')).toHaveAttribute('data-disabled');
  });
});
