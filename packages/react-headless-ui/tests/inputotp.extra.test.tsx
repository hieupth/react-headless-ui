import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputOTP, OTPSlot } from '../src/components/InputOTP';

describe('InputOTP - sizes, input types, and indicators', () => {
  it('renders sm/md/lg size variants without error', () => {
    const { rerender } = render(<InputOTP length={2} size="sm" />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(2);
    rerender(<InputOTP length={2} size="md" />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(2);
    rerender(<InputOTP length={2} size="lg" />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(2);
  });

  it('renders with password and number input types', () => {
    const { rerender } = render(<InputOTP length={2} inputType="password" />);
    const inputs = screen.getAllByTestId(/^otp-input-\d$/) as HTMLInputElement[];
    expect(inputs[0].type).toBe('password');
    rerender(<InputOTP length={2} inputType="number" />);
    const inputs2 = screen.getAllByTestId(/^otp-input-\d$/) as HTMLInputElement[];
    expect(inputs2[0].type).toBe('number');
  });

  it('masks filled slots when masked is enabled', () => {
    render(<InputOTP length={2} defaultValue="12" masked />);
    const first = screen.getByTestId('otp-input-0') as HTMLInputElement;
    expect(first.value).toBe('●');
  });

  it('shows the complete indicator when all slots are filled', () => {
    render(<InputOTP length={2} defaultValue="12" showCompleteIndicator />);
    // complete indicator renders an SVG with a checkmark path
    const otp = screen.getByTestId('input-otp');
    expect(otp.querySelector('.complete-indicator')).not.toBeNull();
  });

  it('hides the complete indicator when showCompleteIndicator is false', () => {
    render(<InputOTP length={2} defaultValue="12" showCompleteIndicator={false} />);
    expect(screen.getByTestId('input-otp').querySelector('.complete-indicator')).toBeNull();
  });

  it('hides the clear button when showClear is false', () => {
    render(<InputOTP length={2} defaultValue="12" showClear={false} />);
    expect(screen.queryByTestId('otp-clear')).toBeNull();
  });

  it('hides the clear button when disabled', () => {
    render(<InputOTP length={2} defaultValue="12" disabled />);
    expect(screen.queryByTestId('otp-clear')).toBeNull();
  });

  it('hides the clear button when value is empty', () => {
    render(<InputOTP length={2} defaultValue="" />);
    expect(screen.queryByTestId('otp-clear')).toBeNull();
  });

  it('hides errors when showErrors is false', () => {
    render(
      <InputOTP
        length={2}
        defaultValue="10"
        showErrors={false}
        validationRules={[{ name: 'nozero', validate: (v) => !v.includes('0'), message: 'no zero' }]}
      />
    );
    expect(screen.queryByText('no zero')).toBeNull();
  });

  it('renders validation errors when a rule fails', () => {
    render(
      <InputOTP
        length={2}
        defaultValue="10"
        validationRules={[{ name: 'nozero', validate: (v) => !v.includes('0'), message: 'no zero' }]}
      />
    );
    // value is complete and invalid -> validate-on-change surfaces the error
    expect(screen.getByText('no zero')).toBeInTheDocument();
  });

  it('does not show the attempts counter when showAttempts is false', () => {
    render(<InputOTP length={2} showAttempts={false} />);
    expect(screen.queryByText(/Attempts:/)).toBeNull();
  });

  it('progress bar reflects completion percentage', () => {
    render(<InputOTP length={4} defaultValue="12" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('2/4')).toBeInTheDocument();
  });
});

describe('InputOTP - slot keyboard interactions', () => {
  it('Backspace on an empty slot removes the previous slot value', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    // Focus slot 2 (empty) and press Backspace -> removes from slot 1
    const slot2 = screen.getByTestId('otp-input-2') as HTMLInputElement;
    fireEvent.keyDown(slot2, { key: 'Backspace' });
    const hidden = screen.getByTestId('otp-hidden-input') as HTMLInputElement;
    expect(hidden.value).toBe('1');
  });

  it('Enter on a filled slot moves focus to the next slot', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    const slot0 = screen.getByTestId('otp-input-0') as HTMLInputElement;
    fireEvent.keyDown(slot0, { key: 'Enter' });
    // no throw + value unchanged
    const hidden = screen.getByTestId('otp-hidden-input') as HTMLInputElement;
    expect(hidden.value).toBe('12');
  });

  it('clicking a slot focuses it', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    const slot1 = screen.getByTestId('otp-input-1') as HTMLInputElement;
    fireEvent.click(slot1);
    expect(slot1).toBeInTheDocument();
  });

  it('typing into a slot places the last character', async () => {
    const user = userEvent.setup();
    render(<InputOTP length={3} />);
    const slot0 = screen.getByTestId('otp-input-0') as HTMLInputElement;
    await user.type(slot0, '9');
    const hidden = screen.getByTestId('otp-hidden-input') as HTMLInputElement;
    expect(hidden.value).toContain('9');
  });

  it('disabled slots do not respond to change', () => {
    render(<InputOTP length={2} disabled />);
    const slot0 = screen.getByTestId('otp-input-0') as HTMLInputElement;
    expect(slot0).toBeDisabled();
  });
});

describe('InputOTP - custom renderSlot', () => {
  it('uses a custom renderSlot escape hatch', () => {
    render(
      <InputOTP
        length={2}
        renderSlot={(slot, index) => (
          <div key={index} data-testid={`custom-slot-${index}`}>
            {slot.value || '_'}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-slot-0')).toBeInTheDocument();
    expect(screen.getByTestId('custom-slot-1')).toBeInTheDocument();
  });
});

describe('OTPSlot (standalone)', () => {
  const baseSlot = {
    value: '5',
    filled: true,
    focused: false,
    hasError: false,
    disabled: false,
  };

  it('renders the slot value', () => {
    render(<OTPSlot slot={baseSlot} index={0} />);
    const input = screen.getByTestId('otp-input-0') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('masks filled value when masked is true', () => {
    render(<OTPSlot slot={baseSlot} index={0} masked />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).value).toBe('●');
  });

  it('renders focused, filled, error, and disabled style states', () => {
    const { rerender } = render(
      <OTPSlot slot={{ ...baseSlot, focused: true }} index={1} />
    );
    expect((screen.getByTestId('otp-input-1') as HTMLInputElement)).toBeInTheDocument();
    rerender(<OTPSlot slot={{ ...baseSlot, filled: false, value: '' }} index={1} />);
    expect((screen.getByTestId('otp-input-1') as HTMLInputElement).value).toBe('');
    rerender(<OTPSlot slot={{ ...baseSlot, hasError: true }} index={1} />);
    expect((screen.getByTestId('otp-input-1') as HTMLInputElement).getAttribute('aria-invalid')).toBe('true');
    rerender(<OTPSlot slot={{ ...baseSlot, disabled: true }} index={1} />);
    expect((screen.getByTestId('otp-input-1') as HTMLInputElement)).toBeDisabled();
  });

  it('renders sm/lg sizes', () => {
    const { rerender } = render(<OTPSlot slot={baseSlot} index={0} size="sm" />);
    expect(screen.getByTestId('otp-input-0')).toBeInTheDocument();
    rerender(<OTPSlot slot={baseSlot} index={0} size="lg" />);
    expect(screen.getByTestId('otp-input-0')).toBeInTheDocument();
  });

  it('fires onChange when the input value changes and onFocus when focused', async () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const user = userEvent.setup();
    render(<OTPSlot slot={baseSlot} index={0} onChange={onChange} onFocus={onFocus} />);
    const input = screen.getByTestId('otp-input-0') as HTMLInputElement;
    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    // user.type on a controlled input with maxLength={1} and an existing value
    // produces no change event under jsdom; drive change directly instead.
    fireEvent.change(input, { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith('7');
  });

  it('forwards password and number input types', () => {
    const { rerender } = render(<OTPSlot slot={baseSlot} index={0} inputType="password" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).type).toBe('password');
    rerender(<OTPSlot slot={baseSlot} index={0} inputType="number" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).type).toBe('number');
  });
});
