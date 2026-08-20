import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { InputOTP } from '../src/components/InputOTP';

// Round-3 visual audit: the .otp-slots group shipped no layout of its own and
// the lib ships no CSS, so the fixed-width slot inputs wrapped one-per-line
// into a vertical column in every demo. The default slot-group container is
// now an inline flex row, so the default render is a horizontal code row
// without consumer CSS (overridable by styling over the inline default).
describe('InputOTP slot-group layout (round-3)', () => {
  it('lays the default slot group out as a horizontal flex row', () => {
    const { container } = render(<InputOTP />);
    const slots = container.querySelector('.otp-slots') as HTMLElement;
    expect(slots).toBeInTheDocument();
    expect(slots.style.display).toBe('flex');
    expect(slots.style.flexDirection).toBe('row');
    expect(slots.style.gap).toBe('8px');
  });

  it('renders every slot wrapper as a direct child of the row container', () => {
    const { container } = render(<InputOTP length={4} />);
    const slots = container.querySelector('.otp-slots') as HTMLElement;
    const wrappers = slots.querySelectorAll(':scope > .otp-slot-wrapper');
    expect(wrappers.length).toBe(4);
  });
});
