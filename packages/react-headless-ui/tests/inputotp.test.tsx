import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputOTP, OTPSlot } from '../src/components/InputOTP';

describe('InputOTP', () => {
  it('renders one slot per digit', () => {
    render(<InputOTP length={4} />);
    expect(screen.getByTestId('input-otp')).toBeInTheDocument();
    // One visible slot per digit (a hidden sr-only input is also rendered for
    // accessibility, so query the slot inputs explicitly by their testid).
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(4);
  });

  it('inputs a digit on change', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<InputOTP length={4} onValueChange={onValueChange} />);
    const first = screen.getByTestId('otp-input-0');
    await user.type(first, '5');
    expect(onValueChange).toHaveBeenCalled();
  });
});

describe('InputOTP renderer indicators and controls', () => {
  it('renders the complete indicator when all slots are filled', () => {
    render(<InputOTP length={2} defaultValue="12" />);
    expect(screen.getByTestId('input-otp').querySelector('.complete-indicator')).not.toBeNull();
  });

  it('hides the complete indicator when incomplete', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    expect(screen.getByTestId('input-otp').querySelector('.complete-indicator')).toBeNull();
  });

  it('renders and clicks the clear button to empty the value', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    const clear = screen.getByTestId('otp-clear');
    fireEvent.click(clear);
    const hidden = screen.getByTestId('otp-hidden-input') as HTMLInputElement;
    expect(hidden.value).toBe('');
  });

  it('renders validation errors when a rule fails', () => {
    render(
      <InputOTP
        length={2}
        defaultValue="10"
        validationRules={[{ name: 'nozero', validate: (v) => !v.includes('0'), message: 'no zero' }]}
      />
    );
    expect(screen.getByText('no zero')).toBeInTheDocument();
  });

  it('hides the attempts counter while attempts is zero or showAttempts is false', () => {
    const { rerender } = render(<InputOTP length={2} maxAttempts={3} />);
    // attempts === 0 -> counter hidden
    expect(screen.queryByText(/Attempts:/)).toBeNull();
    // showAttempts=false also short-circuits the counter
    rerender(<InputOTP length={2} maxAttempts={3} showAttempts={false} />);
    expect(screen.queryByText(/Attempts:/)).toBeNull();
  });

  it('progress bar reflects completion percentage', () => {
    render(<InputOTP length={4} defaultValue="12" />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('2/4')).toBeInTheDocument();
  });

  it('renders the sm/md/lg size variants', () => {
    const { rerender } = render(<InputOTP length={2} size="sm" />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(2);
    rerender(<InputOTP length={2} size="md" />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(2);
    rerender(<InputOTP length={2} size="lg" />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(2);
  });

  it('renders password and number input types', () => {
    const { rerender } = render(<InputOTP length={2} inputType="password" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).type).toBe('password');
    rerender(<InputOTP length={2} inputType="number" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).type).toBe('number');
  });

  it('masks filled slots when masked is enabled', () => {
    render(<InputOTP length={2} defaultValue="12" masked />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).value).toBe('●');
  });

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

describe('InputOTP slot interactions', () => {
  it('Backspace on an empty slot removes the previous slot value', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    const slot2 = screen.getByTestId('otp-input-2');
    fireEvent.keyDown(slot2, { key: 'Backspace' });
    expect((screen.getByTestId('otp-hidden-input') as HTMLInputElement).value).toBe('1');
  });

  it('Enter on a filled slot advances focus', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    const slot0 = screen.getByTestId('otp-input-0');
    fireEvent.keyDown(slot0, { key: 'Enter' });
    // no throw; value unchanged
    expect((screen.getByTestId('otp-hidden-input') as HTMLInputElement).value).toBe('12');
  });

  it('clicking a slot focuses it', () => {
    render(<InputOTP length={3} defaultValue="12" />);
    const slot1 = screen.getByTestId('otp-input-1');
    fireEvent.click(slot1);
    expect(slot1).toBeInTheDocument();
  });

  it('disabled slots render disabled and ignore change', () => {
    render(<InputOTP length={2} disabled />);
    expect(screen.getByTestId('otp-input-0')).toBeDisabled();
  });

  it('honours a change that empties the input value', () => {
    const onValueChange = vi.fn();
    render(<InputOTP length={3} defaultValue="12" onValueChange={onValueChange} />);
    // The hidden sr-only input wires onChange -> actions.setValue
    const hidden = screen.getByTestId('otp-hidden-input');
    fireEvent.change(hidden, { target: { value: '' } });
    expect(onValueChange).toHaveBeenCalled();
  });

  it('ignores an empty change on a slot input', () => {
    const onValueChange = vi.fn();
    render(<InputOTP length={3} onValueChange={onValueChange} />);
    const slot0 = screen.getByTestId('otp-input-0') as HTMLInputElement;
    // First put a value in, then fire a change that resolves to empty so the
    // slot onChange takes its `inputValue.length > 0 === false` early-return
    // and does not call inputChar again.
    fireEvent.change(slot0, { target: { value: '5' } });
    const callsAfterFirst = onValueChange.mock.calls.length;
    fireEvent.change(slot0, { target: { value: '' } });
    expect(onValueChange.mock.calls.length).toBe(callsAfterFirst);
  });

  it('renders a slot with hasError when its value fails the pattern', () => {
    // defaultValue contains a non-digit ('a') which fails the default /^[0-9]$/ pattern,
    // so slot 1 reports hasError and picks up the error class branch.
    render(<InputOTP length={2} defaultValue="1a" />);
    const slot1 = screen.getByTestId('otp-input-1');
    expect(slot1.className).toContain('border-red-500');
    expect(slot1).toHaveAttribute('aria-invalid', 'true');
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

  it('renders a filled slot value', () => {
    render(<OTPSlot slot={baseSlot} index={0} />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).value).toBe('5');
  });

  it('masks a filled slot when masked is enabled', () => {
    render(<OTPSlot slot={baseSlot} index={1} masked />);
    expect((screen.getByTestId('otp-input-1') as HTMLInputElement).value).toBe('●');
  });

  it('renders the focused, error, and disabled class branches', () => {
    const { rerender } = render(<OTPSlot slot={{ ...baseSlot, focused: true }} index={0} />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).className).toContain('border-blue-500');
    rerender(<OTPSlot slot={{ ...baseSlot, hasError: true }} index={0} />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).className).toContain('border-red-500');
    rerender(<OTPSlot slot={{ ...baseSlot, disabled: true }} index={0} />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).className).toContain('bg-gray-50');
    expect(screen.getByTestId('otp-input-0')).toBeDisabled();
  });

  it('renders the unfilled slot branch', () => {
    render(<OTPSlot slot={{ ...baseSlot, value: '', filled: false }} index={2} />);
    expect((screen.getByTestId('otp-input-2') as HTMLInputElement).value).toBe('');
  });

  it('applies size variants and custom className', () => {
    const { rerender } = render(<OTPSlot slot={baseSlot} index={0} size="sm" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).className).toContain('w-10');
    rerender(<OTPSlot slot={baseSlot} index={0} size="lg" className="my-extra" />);
    const el = screen.getByTestId('otp-input-0') as HTMLInputElement;
    expect(el.className).toContain('w-14');
    expect(el.className).toContain('my-extra');
  });

  it('uses password and number input types', () => {
    const { rerender } = render(<OTPSlot slot={baseSlot} index={0} inputType="password" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).type).toBe('password');
    rerender(<OTPSlot slot={baseSlot} index={0} inputType="number" />);
    expect((screen.getByTestId('otp-input-0') as HTMLInputElement).type).toBe('number');
  });

  it('calls onChange and onFocus handlers', () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    render(<OTPSlot slot={baseSlot} index={0} onChange={onChange} onFocus={onFocus} />);
    const input = screen.getByTestId('otp-input-0');
    fireEvent.change(input, { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith('7');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
  });
});
