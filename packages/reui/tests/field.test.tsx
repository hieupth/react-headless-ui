import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field } from '../src/components/Field';

describe('Field', () => {
  it('renders a labelled text input', () => {
    render(<Field label="Email" placeholder="you@example.com" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders at size=%s', (size) => {
    const { container } = render(<Field size={size} placeholder="p" />);
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it.each(['outline', 'filled', 'underline'] as const)('renders variant=%s', (variant) => {
    const { container } = render(<Field variant={variant} placeholder="p" />);
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('renders horizontal orientation with a required label', () => {
    render(<Field label="Name" required orientation="horizontal" placeholder="p" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders an inside label when unfilled and unfocused', () => {
    render(<Field label="Inside" labelPosition="inside" placeholder="p" />);
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('renders prefix/suffix adornments', () => {
    render(
      <Field
        prefix={<span data-testid="prefix">P</span>}
        suffix={<span data-testid="suffix">S</span>}
        placeholder="p"
      />
    );
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
  });

  it('renders start/end adornments', () => {
    render(
      <Field
        startAdornment={<span data-testid="start">$</span>}
        endAdornment={<span data-testid="end">%</span>}
        placeholder="p"
      />
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders the clear button when clearable and filled', async () => {
    const user = userEvent.setup();
    render(<Field clearable placeholder="p" defaultValue="text" />);
    const input = screen.getByPlaceholderText('p');
    await user.click(input);
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });

  it('reflects invalid/error/disabled/filled state classes', () => {
    const { container: c1 } = render(<Field invalid error="bad" placeholder="p" />);
    expect(c1.querySelector('input')).toBeInTheDocument();
    const { container: c2 } = render(<Field disabled placeholder="p" defaultValue="x" />);
    expect(c2.querySelector('input')).toBeDisabled();
  });

  it('renders a disabled field with a label', () => {
    render(<Field label="Disabled" disabled placeholder="p" />);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('renders helper text, error, and description', () => {
    render(<Field helperText="Helpful" error="Something went wrong" description="A description" placeholder="p" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('renders helper text when there is no error', () => {
    render(<Field helperText="Just helpful" placeholder="p" />);
    expect(screen.getByText('Just helpful')).toBeInTheDocument();
  });

  it('renders character count and validation requirements', () => {
    render(<Field showCount maxLength={10} minLength={2} defaultValue="abc" placeholder="p" />);
    expect(screen.getByText('3/10')).toBeInTheDocument();
    expect(screen.getByText(/Minimum 2 characters/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum 10 characters/)).toBeInTheDocument();
  });

  it('flags the character count orange near the limit', () => {
    render(<Field showCount maxLength={10} defaultValue="abcdefghij" placeholder="p" />);
    expect(screen.getByText('10/10')).toBeInTheDocument();
  });

  it('renders only maxLength requirements when minLength absent', () => {
    render(<Field maxLength={5} placeholder="p" />);
    expect(screen.getByText(/Maximum 5 characters/)).toBeInTheDocument();
  });
});
