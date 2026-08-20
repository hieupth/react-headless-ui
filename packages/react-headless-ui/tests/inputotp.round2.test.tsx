import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputOTP } from '../src/components/InputOTP';

// Round-2 NaN guard: the progress bar divided by the raw length prop, so
// length=0 (and the defaulted undefined length) rendered width:NaN% and a
// "NaN%" counter. The effective slot count is clamped at the boundary.
describe('InputOTP degenerate length (round-2)', () => {
  it('renders a finite progress bar when length=0', () => {
    const { container } = render(<InputOTP length={0} />);
    expect(container.innerHTML).not.toContain('NaN');
    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    const bar = container.querySelector('.progress-container div div') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });

  it('uses the default slot count when no length is given', () => {
    const { container } = render(<InputOTP />);
    expect(container.innerHTML).not.toContain('NaN');
    expect(screen.getByText('0/6')).toBeInTheDocument();
  });
});
