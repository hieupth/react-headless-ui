import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from '../src/components/Toast';

// NOTE: Toast manages its own toasts list internally via useToast. The
// container always renders even when empty. An interaction test would require
// access to the hook's addToast action, which is not exposed as a prop, so we
// smoke-test the container render only.

describe('Toast', () => {
  it('renders the toast container region', () => {
    render(<Toast position="top-right" />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});
