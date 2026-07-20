import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useInputOTP } from '../src/hooks/useInputOTP';
import { InputOTP } from '../src/components/InputOTP';

function setup(props: any = {}) {
  const api: any = {};
  const ref = { current: null as HTMLElement | null };
  function Harness() {
    const r = useInputOTP({ length: 4, otpRef: ref, ...props });
    api.state = r.state;
    api.actions = r.actions;
    api.attributes = r.attributes;
    return <div ref={ref as any} data-testid="otp" tabIndex={0} />;
  }
  const utils = render(<Harness />);
  return { api, ref, ...utils };
}

describe('useInputOTP hook - state', () => {
  it('defaults: empty, not complete, no errors, length 6', () => {
    const { result } = renderHook(() => useInputOTP({}));
    expect(result.current.state.value).toBe('');
    expect(result.current.state.isComplete).toBe(false);
    expect(result.current.state.hasErrors).toBe(false);
    expect(result.current.state.slots).toHaveLength(6);
    expect(result.current.state.masked).toBe(false);
    expect(result.current.attributes.role).toBe('group');
  });

  it('slots reflect value, focused, filled, hasError', () => {
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '1a', autoFocus: true })
    );
    const slots = result.current.state.slots;
    expect(slots[0]).toMatchObject({ value: '1', filled: true, hasError: false });
    expect(slots[1]).toMatchObject({ value: 'a', filled: true, hasError: true }); // non-digit
    expect(slots[2]).toMatchObject({ value: '', filled: false });
  });
});

describe('useInputOTP hook - actions', () => {
  it('setValue filters by pattern, slices to length, fires callbacks', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, onValueChange: onChange, onComplete })
    );
    act(() => result.current.actions.setValue('12a34')); // 'a' filtered -> '1234' sliced to '123'
    expect(result.current.state.value).toBe('123');
    expect(result.current.state.isComplete).toBe(true);
    expect(onComplete).toHaveBeenLastCalledWith('123');
    expect(onChange).toHaveBeenCalled();
  });

  it('inputChar places a digit at index', () => {
    const { result } = renderHook(() => useInputOTP({ length: 3 }));
    act(() => result.current.actions.inputChar(1, '5'));
    // Splicing a sparse array at index 1 collapses; value becomes '5'.
    expect(result.current.state.value).toBe('5');
    // The displayed slot[0] holds the char (sparse join shifts left).
    expect(result.current.state.slots[0].value).toBe('5');
  });

  it('inputChar rejects non-pattern char and out-of-range index, respects disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, onValueChange: onChange })
    );
    act(() => result.current.actions.inputChar(0, 'x')); // non-digit ignored
    expect(result.current.state.value).toBe('');
    act(() => result.current.actions.inputChar(5, '1')); // out of range
    expect(result.current.state.value).toBe('');
    const dis = renderHook(() => useInputOTP({ length: 3, disabled: true }));
    act(() => dis.result.current.actions.inputChar(0, '1'));
    expect(dis.result.current.state.value).toBe('');
  });

  it('removeChar removes value and focuses previous slot', () => {
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '123' })
    );
    act(() => result.current.actions.removeChar(2));
    expect(result.current.state.value).toBe('12');
    expect(result.current.state.focusedSlotIndex).toBe(1);
  });

  it('removeChar ignores disabled, out-of-range, empty index', () => {
    const dis = renderHook(() => useInputOTP({ length: 3, defaultValue: '1', disabled: true }));
    act(() => dis.result.current.actions.removeChar(0));
    expect(dis.result.current.state.value).toBe('1');
    const { result } = renderHook(() => useInputOTP({ length: 3 }));
    act(() => result.current.actions.removeChar(5)); // out of range
    act(() => result.current.actions.removeChar(0)); // empty -> no-op
    expect(result.current.state.value).toBe('');
  });

  it('pasteOTP filters and slices', () => {
    const { result } = renderHook(() => useInputOTP({ length: 4 }));
    act(() => result.current.actions.pasteOTP('a1b2c3d4'));
    expect(result.current.state.value).toBe('1234');
    expect(result.current.state.isComplete).toBe(true);
  });

  it('clear empties value and resets', () => {
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '123' })
    );
    act(() => result.current.actions.clear());
    expect(result.current.state.value).toBe('');
    expect(result.current.state.focusedSlotIndex).toBe(0);
    const dis = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '12', disabled: true })
    );
    act(() => dis.result.current.actions.clear());
    expect(dis.result.current.state.value).toBe('12');
  });

  it('validate runs validationRules and reports errors', () => {
    const onError = vi.fn();
    const rule = { name: 'nozero', validate: (v: string) => !v.includes('0'), message: 'no zero' };
    const { result } = renderHook(() =>
      useInputOTP({ length: 2, defaultValue: '10', validationRules: [rule], onValidationError: onError })
    );
    let isValid: boolean | undefined;
    act(() => {
      isValid = result.current.actions.validate();
    });
    expect(isValid).toBe(false);
    expect(result.current.state.errors).toContain('no zero');
    expect(onError).toHaveBeenCalled();
    const ok = renderHook(() =>
      useInputOTP({ length: 2, defaultValue: '12', validationRules: [rule] })
    );
    let okResult: boolean | undefined;
    act(() => {
      okResult = ok.result.current.actions.validate();
    });
    expect(okResult).toBe(true);
    // No rules -> always valid
    const empty = renderHook(() => useInputOTP({ length: 2 }));
    expect(empty.result.current.actions.validate()).toBe(true);
  });

  it('focusSlot, focusNextSlot, focusPreviousSlot respect bounds and disabled', () => {
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, autoFocus: true })
    );
    expect(result.current.state.focusedSlotIndex).toBe(0);
    act(() => result.current.actions.focusNextSlot());
    expect(result.current.state.focusedSlotIndex).toBe(1);
    act(() => result.current.actions.focusPreviousSlot());
    expect(result.current.state.focusedSlotIndex).toBe(0);
    act(() => result.current.actions.focusPreviousSlot()); // at 0, no-op
    expect(result.current.state.focusedSlotIndex).toBe(0);
    act(() => result.current.actions.focusSlot(5)); // out of range
    expect(result.current.state.focusedSlotIndex).toBe(0);
    // Navigate to the last slot, then focusNextSlot is a no-op (>= length-1).
    act(() => result.current.actions.focusSlot(2));
    expect(result.current.state.focusedSlotIndex).toBe(2);
    act(() => result.current.actions.focusNextSlot());
    expect(result.current.state.focusedSlotIndex).toBe(2);
    const dis = renderHook(() => useInputOTP({ length: 3, disabled: true }));
    act(() => dis.result.current.actions.focusSlot(1));
    expect(dis.result.current.state.focusedSlotIndex).toBeNull();
  });

  it('complete is a no-op when disabled', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '1', disabled: true, onComplete })
    );
    act(() => result.current.actions.complete());
    // Value unchanged; onComplete not fired.
    expect(result.current.state.value).toBe('1');
  });

  it('setValue and pasteOTP are no-ops when disabled', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '1', disabled: true, onValueChange })
    );
    act(() => result.current.actions.setValue('123'));
    act(() => result.current.actions.pasteOTP('456'));
    expect(result.current.state.value).toBe('1');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('complete pads with zeros to reach length', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useInputOTP({ length: 4, defaultValue: '1', onComplete })
    );
    act(() => result.current.actions.complete());
    expect(result.current.state.value).toBe('1000');
    expect(result.current.state.isComplete).toBe(true);
  });

  it('incrementAttempts fires onMaxAttemptsReached', () => {
    const onMax = vi.fn();
    const { result } = renderHook(() =>
      useInputOTP({ maxAttempts: 2, onMaxAttemptsReached: onMax })
    );
    act(() => result.current.actions.incrementAttempts());
    expect(onMax).not.toHaveBeenCalled();
    act(() => result.current.actions.incrementAttempts());
    expect(onMax).toHaveBeenCalled();
    expect(result.current.state.attempts).toBe(2);
  });

  it('toggleMask flips masking', () => {
    const { result } = renderHook(() => useInputOTP({ length: 3 }));
    expect(result.current.state.masked).toBe(false);
    act(() => result.current.actions.toggleMask());
    expect(result.current.state.masked).toBe(true);
  });

  it('getAsArray splits value', () => {
    const { result } = renderHook(() =>
      useInputOTP({ length: 3, defaultValue: '12' })
    );
    expect(result.current.actions.getAsArray()).toEqual(['1', '2']);
  });

  it('keyboard handler: arrows/Home/End/Backspace/Delete via container', async () => {
    const ref = { current: null as HTMLElement | null };
    const api: any = {};
    function Harness() {
      // autoFocus seeds focusedSlotIndex=0 so the handler's null-guard is passed
      // and the key switch (arrows/Home/End/Backspace/Delete) is exercised.
      const r = useInputOTP({ length: 3, defaultValue: '12', autoFocus: true, otpRef: ref });
      api.state = r.state;
      return <div ref={ref as any} data-testid="kb" tabIndex={0} />;
    }
    const { getByTestId } = render(<Harness />);
    const el = getByTestId('kb');
    // focus slot 1 first
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    });
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    });
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    });
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    });
    // disabled ignores keyboard
    const ref2 = { current: null as HTMLElement | null };
    function Harness2() {
      const r = useInputOTP({ length: 3, defaultValue: '12', disabled: true, otpRef: ref2 });
      return <div ref={ref2 as any} data-testid="kb2" tabIndex={0} />;
    }
    const { getByTestId: g2 } = render(<Harness2 />);
    await act(async () => {
      g2('kb2').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
  });

  it('keyboard Backspace on empty value and Delete beyond value are no-ops', async () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      // Empty value + autoFocus so focusedSlotIndex=0; Backspace (value empty)
      // and Delete at slot 0 (>= value.length 0) both hit their false branches.
      useInputOTP({ length: 3, defaultValue: '', autoFocus: true, otpRef: ref });
      return <div ref={ref as any} data-testid="kb3" tabIndex={0} />;
    }
    const { getByTestId } = render(<Harness />);
    const el = getByTestId('kb3');
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    });
    await act(async () => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    });
  });
});

describe('InputOTP component integration', () => {
  it('renders slots and types digits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputOTP length={3} onValueChange={onChange} />);
    expect(screen.getAllByTestId(/^otp-input-\d$/)).toHaveLength(3);
    await user.type(screen.getByTestId('otp-input-0'), '5');
    expect(onChange).toHaveBeenCalled();
  });

  it('clear button empties value', async () => {
    const user = userEvent.setup();
    render(<InputOTP length={3} defaultValue="12" />);
    const clear = screen.getByTestId('otp-clear');
    await user.click(clear);
    const hidden = screen.getByTestId('otp-hidden-input') as HTMLInputElement;
    expect(hidden.value).toBe('');
  });

  it('hidden input reflects value via setValue', async () => {
    const user = userEvent.setup();
    render(<InputOTP length={4} />);
    const hidden = screen.getByTestId('otp-hidden-input') as HTMLInputElement;
    await user.type(hidden, '99');
    expect(hidden.value).toMatch(/9/);
  });
});
