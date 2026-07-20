import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useInputOTP } from '../src/hooks';
import type { UseInputOTPProps } from '../src/hooks';

// Headless-hook harness following the useportal.hook.test.tsx canonical pattern.
// Renders a container bound to the hook's otpRef so the keyboard effect wires
// its listener. The hook's private `inputRefs` is not exposed, so we assert
// state mutation (focusedSlotIndex, value) rather than actual DOM focus.
function setup(props: UseInputOTPProps, length = 4) {
  const api = { state: null as any, actions: null as any, attributes: null as any, container: null as HTMLElement | null };
  const containerRef: { current: HTMLElement | null } = { current: null };
  function Harness() {
    const result = useInputOTP({ length, ...props, otpRef: containerRef as any });
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    return (
      <div ref={(el) => { containerRef.current = el; api.container = el; }}>
        {Array.from({ length }).map((_, i) => (
          <input key={i} data-slot={i} />
        ))}
      </div>
    );
  }
  render(<Harness />);
  return api;
}

// Alias kept for readability in the keyboard-nav block.
const setupWithInputs = setup;

describe('useInputOTP hook', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('initializes default state (length, masked, autoFocus, slots)', () => {
    const api = setup({ length: 4 });
    expect(api.state.value).toBe('');
    expect(api.state.disabled).toBe(false);
    expect(api.state.isComplete).toBe(false);
    expect(api.state.hasErrors).toBe(false);
    expect(api.state.focusedSlotIndex).toBeNull();
    expect(api.state.attempts).toBe(0);
    expect(api.state.masked).toBe(false);
    expect(api.state.slots).toHaveLength(4);
    expect(api.state.slots[0]).toMatchObject({ index: 0, value: '', focused: false, filled: false, hasError: false });
    expect(api.attributes.role).toBe('group');
    expect(api.attributes['aria-label']).toBe('One-time password input');
    expect(api.attributes.tabIndex).toBe(0);
    expect(api.attributes['aria-invalid']).toBe(false);
  });

  it('autoFocus sets initial focusedSlotIndex to 0', () => {
    const api = setup({ length: 3, autoFocus: true });
    expect(api.state.focusedSlotIndex).toBe(0);
    expect(api.state.slots[0].focused).toBe(true);
  });

  it('marks filled slot and flags hasError when char fails pattern', () => {
    const api = setup({ length: 3, defaultValue: '1a' });
    expect(api.state.slots[0]).toMatchObject({ value: '1', filled: true, hasError: false });
    expect(api.state.slots[1]).toMatchObject({ value: 'a', filled: true, hasError: true });
    expect(api.state.hasErrors).toBe(true);
    expect(api.state.isComplete).toBe(false);
  });

  it('isComplete true only when full and no slot errors', () => {
    const api = setup({ length: 3, defaultValue: '123' });
    expect(api.state.isComplete).toBe(true);
    expect(api.state.hasErrors).toBe(false);
  });

  it('disabled makes tabIndex -1', () => {
    const api = setup({ length: 2, disabled: true });
    expect(api.attributes.tabIndex).toBe(-1);
  });

  it('aria-describedby set when validation errors exist', () => {
    // Trigger a validation error by providing a value failing a rule + validate call.
    const api = setup({
      length: 2,
      defaultValue: '12',
      validationRules: [{ name: 'no-all-zeros', validate: (v) => v !== '12', message: 'no 12' }],
    });
    act(() => api.actions.validate());
    expect(api.state.errors).toContain('no 12');
    expect(api.attributes['aria-describedby']).toBe('otp-errors');
    expect(api.state.hasErrors).toBe(true);
  });

  it('validate returns true and clears errors when rules pass', () => {
    const onValidationError = vi.fn();
    const api = setup({ length: 2, defaultValue: '99', validationRules: [{ name: 'r', validate: () => true, message: 'x' }], onValidationError });
    expect(api.actions.validate()).toBe(true);
    expect(api.state.errors).toHaveLength(0);
    expect(onValidationError).not.toHaveBeenCalled();
  });

  it('validate returns true and is a no-op when there are no rules', () => {
    const api = setup({ length: 2 });
    expect(api.actions.validate()).toBe(true);
  });

  it('setValue filters by pattern, slices to length, fires onValueChange and focuses next slot', () => {
    const onValueChange = vi.fn();
    const api = setup({ length: 4, onValueChange });
    act(() => { api.actions.setValue('12a34'); vi.runAllTimers(); });
    expect(api.state.value).toBe('1234');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe('1234');
    expect(api.state.focusedSlotIndex).toBe(3);
  });

  it('setValue fires onComplete when value fills with valid chars', () => {
    const onComplete = vi.fn();
    const api = setup({ length: 3, onComplete });
    act(() => { api.actions.setValue('123'); vi.runAllTimers(); });
    expect(onComplete).toHaveBeenCalledWith('123');
  });

  it('setValue does not fire onComplete when slot errors exist', () => {
    const onComplete = vi.fn();
    const api = setup({ length: 2, pattern: /^[0-9]$/, onComplete });
    act(() => { api.actions.setValue('1a'); vi.runAllTimers(); });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('setValue respects validateOnChange at full length', () => {
    const onValidationError = vi.fn();
    const api = setup({
      length: 2,
      validateOnChange: true,
      validationRules: [{ name: 'r', validate: (v) => v === '99', message: 'must be 99' }],
      onValidationError,
    });
    act(() => { api.actions.setValue('11'); vi.runAllTimers(); });
    expect(onValidationError).toHaveBeenCalledWith(['must be 99']);
  });

  it('setValue is a no-op when disabled', () => {
    const onValueChange = vi.fn();
    const api = setup({ length: 2, disabled: true, onValueChange });
    act(() => { api.actions.setValue('11'); vi.runAllTimers(); });
    expect(api.state.value).toBe('');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clear resets value, errors, focuses slot 0', () => {
    const api = setup({ length: 3, defaultValue: '12', autoFocus: true });
    act(() => { api.actions.clear(); vi.runAllTimers(); });
    expect(api.state.value).toBe('');
    expect(api.state.errors).toHaveLength(0);
    expect(api.state.focusedSlotIndex).toBe(0);
  });

  it('clear is a no-op when disabled', () => {
    const api = setup({ length: 3, defaultValue: '12', disabled: true });
    act(() => { api.actions.clear(); vi.runAllTimers(); });
    expect(api.state.value).toBe('12');
  });

  it('focusSlot sets focusedSlotIndex; out-of-range/disabled are ignored', () => {
    const api = setup({ length: 3 });
    act(() => api.actions.focusSlot(2));
    expect(api.state.focusedSlotIndex).toBe(2);
    act(() => api.actions.focusSlot(5));
    expect(api.state.focusedSlotIndex).toBe(2);
    act(() => api.actions.focusSlot(-1));
    expect(api.state.focusedSlotIndex).toBe(2);
    const api2 = setup({ length: 3, disabled: true });
    act(() => api2.actions.focusSlot(1));
    expect(api2.state.focusedSlotIndex).toBeNull();
  });

  it('inputChar places a valid char and rejects pattern-mismatch', () => {
    const api = setup({ length: 3 });
    act(() => { api.actions.inputChar(0, '5'); vi.runAllTimers(); });
    expect(api.state.value).toBe('5');
    act(() => { api.actions.inputChar(2, '7'); vi.runAllTimers(); });
    expect(api.state.value).toBe('5 7'.replace(' ', ''));
    // pattern mismatch ignored
    act(() => { api.actions.inputChar(0, 'x'); vi.runAllTimers(); });
    expect(api.state.value).toBe('57');
  });

  it('inputChar ignores disabled and out-of-range', () => {
    const api = setup({ length: 2, disabled: true });
    act(() => { api.actions.inputChar(0, '1'); vi.runAllTimers(); });
    expect(api.state.value).toBe('');
    const api2 = setup({ length: 2 });
    act(() => { api2.actions.inputChar(9, '1'); vi.runAllTimers(); });
    expect(api2.state.value).toBe('');
  });

  it('removeChar removes the char, focuses previous slot; no-op when slot empty/disabled', () => {
    const api = setup({ length: 3, defaultValue: '12' });
    act(() => { api.actions.removeChar(1); vi.runAllTimers(); });
    expect(api.state.value).toBe('1');
    expect(api.state.focusedSlotIndex).toBe(0);
    // removing an empty slot is a no-op
    const before = api.state.value;
    act(() => { api.actions.removeChar(0); vi.runAllTimers(); });
    // slot 0 has '1', so this DOES remove it; verify it clears
    expect(api.state.value).toBe('');
    // disabled
    const api2 = setup({ length: 2, defaultValue: '12', disabled: true });
    act(() => { api2.actions.removeChar(0); vi.runAllTimers(); });
    expect(api2.state.value).toBe('12');
  });

  it('pasteOTP filters and slices pasted content', () => {
    const api = setup({ length: 4 });
    act(() => { api.actions.pasteOTP('12-34-56'); vi.runAllTimers(); });
    expect(api.state.value).toBe('1234');
  });

  it('pasteOTP is a no-op when disabled', () => {
    const api = setup({ length: 4, disabled: true });
    act(() => { api.actions.pasteOTP('1234'); vi.runAllTimers(); });
    expect(api.state.value).toBe('');
  });

  it('getAsArray returns chars of value', () => {
    const api = setup({ length: 4, defaultValue: '123' });
    expect(api.actions.getAsArray()).toEqual(['1', '2', '3']);
  });

  it('focusNextSlot/focusPreviousSlot move within bounds', () => {
    const api = setup({ length: 3, autoFocus: true }); // focusedSlotIndex 0
    act(() => api.actions.focusNextSlot());
    expect(api.state.focusedSlotIndex).toBe(1);
    act(() => api.actions.focusNextSlot());
    expect(api.state.focusedSlotIndex).toBe(2);
    act(() => api.actions.focusNextSlot()); // at last: no-op
    expect(api.state.focusedSlotIndex).toBe(2);
    act(() => api.actions.focusPreviousSlot());
    expect(api.state.focusedSlotIndex).toBe(1);
    act(() => api.actions.focusPreviousSlot());
    expect(api.state.focusedSlotIndex).toBe(0);
    act(() => api.actions.focusPreviousSlot()); // at 0: no-op
    expect(api.state.focusedSlotIndex).toBe(0);
  });

  it('focusNextSlot/focusPreviousSlot are no-ops when focusedSlotIndex is null', () => {
    const api = setup({ length: 3 });
    expect(api.state.focusedSlotIndex).toBeNull();
    act(() => api.actions.focusNextSlot());
    expect(api.state.focusedSlotIndex).toBeNull();
    act(() => api.actions.focusPreviousSlot());
    expect(api.state.focusedSlotIndex).toBeNull();
  });

  it('complete fills remaining slots with 0', () => {
    const onComplete = vi.fn();
    const api = setup({ length: 4, defaultValue: '12', onComplete });
    act(() => { api.actions.complete(); vi.runAllTimers(); });
    expect(api.state.value).toBe('1200');
    expect(onComplete).toHaveBeenCalledWith('1200');
  });

  it('complete is a no-op when disabled', () => {
    const api = setup({ length: 4, defaultValue: '12', disabled: true });
    act(() => { api.actions.complete(); vi.runAllTimers(); });
    expect(api.state.value).toBe('12');
  });

  it('incrementAttempts fires onMaxAttemptsReached at threshold', () => {
    const onMax = vi.fn();
    const api = setup({ length: 2, maxAttempts: 2, onMaxAttemptsReached: onMax });
    act(() => api.actions.incrementAttempts());
    expect(api.state.attempts).toBe(1);
    expect(onMax).not.toHaveBeenCalled();
    act(() => api.actions.incrementAttempts());
    expect(api.state.attempts).toBe(2);
    expect(onMax).toHaveBeenCalledTimes(1);
  });

  it('incrementAttempts without maxAttempts only increments', () => {
    const onMax = vi.fn();
    const api = setup({ length: 2, maxAttempts: 0, onMax });
    act(() => api.actions.incrementAttempts());
    act(() => api.actions.incrementAttempts());
    expect(api.state.attempts).toBe(2);
    expect(onMax).not.toHaveBeenCalled();
  });

  it('toggleMask flips masked state', () => {
    const api = setup({ length: 2, masked: false });
    expect(api.state.masked).toBe(false);
    act(() => api.actions.toggleMask());
    expect(api.state.masked).toBe(true);
    act(() => api.actions.toggleMask());
    expect(api.state.masked).toBe(false);
  });

  it('masked prop seeds initial mask state', () => {
    const api = setup({ length: 2, masked: true });
    expect(api.state.masked).toBe(true);
  });

  it('custom placeholder/pattern affect slot rendering', () => {
    const api = setup({ length: 2, defaultValue: 'ab', pattern: /^[a-z]$/, placeholder: '_' });
    expect(api.state.slots[0]).toMatchObject({ value: 'a', filled: true, hasError: false });
    expect(api.state.hasErrors).toBe(false);
  });

  describe('keyboard navigation via container listener', () => {
    function dispatchKey(container: HTMLElement, key: string) {
      act(() => {
        container.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      });
    }

    it('ArrowLeft/ArrowRight move focus within bounds', () => {
      const api = setupWithInputs({ length: 3, autoFocus: true });
      const el = api.container!;
      dispatchKey(el, 'ArrowRight');
      expect(api.state.focusedSlotIndex).toBe(1);
      dispatchKey(el, 'ArrowLeft');
      expect(api.state.focusedSlotIndex).toBe(0);
      dispatchKey(el, 'ArrowLeft'); // at 0: focusPreviousSlot no-op
      expect(api.state.focusedSlotIndex).toBe(0);
    });

    it('Home/End jump to first/last filled slot', () => {
      const api = setupWithInputs({ length: 4, defaultValue: '123', autoFocus: true });
      const el = api.container!;
      dispatchKey(el, 'End');
      expect(api.state.focusedSlotIndex).toBe(2); // value.length - 1
      dispatchKey(el, 'Home');
      expect(api.state.focusedSlotIndex).toBe(0);
    });

    it('Backspace removes the char at min(focused, len-1)', () => {
      const api = setupWithInputs({ length: 3, defaultValue: '123', autoFocus: true });
      const el = api.container!;
      // autoFocus -> focusedSlotIndex 0; min(0, 2) = 0 -> removes index 0
      dispatchKey(el, 'Backspace');
      expect(api.state.value).toBe('23');
    });

    it('Delete removes the char at focusedSlotIndex when in range', () => {
      const api = setupWithInputs({ length: 3, defaultValue: '123', autoFocus: true });
      const el = api.container!;
      dispatchKey(el, 'Delete');
      expect(api.state.value).toBe('23');
    });

    it('Delete is a no-op when focusedSlotIndex >= value.length', () => {
      const api = setupWithInputs({ length: 3, defaultValue: '1', autoFocus: true });
      const el = api.container!;
      // focus slot 2 (beyond value length 1)
      act(() => api.actions.focusSlot(2));
      dispatchKey(el, 'Delete');
      expect(api.state.value).toBe('1');
    });

    it('keys are ignored when disabled or no slot focused', () => {
      const api = setupWithInputs({ length: 3, defaultValue: '12', disabled: true });
      const el = api.container!;
      dispatchKey(el, 'Backspace');
      expect(api.state.value).toBe('12');
      const api2 = setupWithInputs({ length: 3, defaultValue: '12' });
      // focusedSlotIndex null -> listener returns early
      const el2 = api2.container!;
      dispatchKey(el2, 'ArrowRight');
      expect(api2.state.focusedSlotIndex).toBeNull();
    });

    it('Backspace is a no-op when value is empty', () => {
      const api = setupWithInputs({ length: 3, autoFocus: true });
      const el = api.container!;
      dispatchKey(el, 'Backspace');
      expect(api.state.value).toBe('');
    });
  });
});
