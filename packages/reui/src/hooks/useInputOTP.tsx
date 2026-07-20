/**
 * InputOTP headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages one-time password input with validation and formatting.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * OTP input slot interface
 */
export interface OTPIputSlot {
  /** Slot index */
  index: number;
  /** Current value */
  value: string;
  /** Whether slot is focused */
  focused: boolean;
  /** Whether slot is filled */
  filled: boolean;
  /** Whether slot has error */
  hasError: boolean;
}

/**
 * OTP validation rule interface
 */
export interface OTPValidationRule {
  /** Rule name */
  name: string;
  /** Validation function */
  validate: (value: string) => boolean;
  /** Error message */
  message: string;
}

/**
 * OTP state interface
 */
export interface OTPState {
  /** Current OTP value */
  value: string;
  /** Input slots */
  slots: OTPIputSlot[];
  /** Whether OTP is disabled */
  disabled: boolean;
  /** Whether OTP is complete */
  isComplete: boolean;
  /** Whether OTP has errors */
  hasErrors: boolean;
  /** Current focused slot index */
  focusedSlotIndex: number | null;
  /** Validation errors */
  errors: string[];
  /** Number of input attempts */
  attempts: number;
  /** Whether to mask input */
  masked: boolean;
}

/**
 * OTP actions interface
 */
export interface OTPActions {
  /** Set OTP value */
  setValue: (value: string) => void;
  /** Clear OTP value */
  clear: () => void;
  /** Focus specific slot */
  focusSlot: (index: number) => void;
  /** Input character into slot */
  inputChar: (index: number, char: string) => void;
  /** Remove character from slot */
  removeChar: (index: number) => void;
  /** Paste OTP value */
  pasteOTP: (value: string) => void;
  /** Validate OTP value */
  validate: () => boolean;
  /** Get OTP as array */
  getAsArray: () => string[];
  /** Focus next slot */
  focusNextSlot: () => void;
  /** Focus previous slot */
  focusPreviousSlot: () => void;
  /** Complete OTP */
  complete: () => void;
  /** Increment attempts */
  incrementAttempts: () => void;
  /** Toggle masking */
  toggleMask: () => void;
}

/**
 * Props for useInputOTP hook
 */
export interface UseInputOTPProps {
  /** Number of OTP digits */
  length?: number;
  /** Whether OTP is disabled */
  disabled?: boolean;
  /** Whether to mask input */
  masked?: boolean;
  /** Whether to auto-focus first slot */
  autoFocus?: boolean;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Validation rules */
  validationRules?: OTPValidationRule[];
  /** Maximum number of attempts */
  maxAttempts?: number;
  /** Initial OTP value */
  defaultValue?: string;
  /** Placeholder character for empty slots */
  placeholder?: string;
  /** Allowed input pattern */
  pattern?: RegExp;
  /** Callback when value changes */
  onValueChange?: (value: string, slots: OTPIputSlot[]) => void;
  /** Callback when OTP is complete */
  onComplete?: (value: string) => void;
  /** Callback when validation fails */
  onValidationError?: (errors: string[]) => void;
  /** Callback when max attempts reached */
  onMaxAttemptsReached?: () => void;
  /** Ref to the OTP container element */
  otpRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for useInputOTP hook
 */
export interface UseInputOTPReturns {
  /** Current OTP state */
  state: OTPState;
  /** OTP actions */
  actions: OTPActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label': string;
    'role': string;
    'tabIndex': number;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * InputOTP hook implementation
 * @param props - OTP configuration props
 * @returns OTP state, actions, and attributes
 */
export function useInputOTP(props: UseInputOTPProps): UseInputOTPReturns {
  const {
    length = 6,
    disabled = false,
    masked = false,
    autoFocus = false,
    validateOnChange = true,
    validationRules = [],
    maxAttempts = 3,
    defaultValue = '',
    placeholder = '○',
    pattern = /^[0-9]$/,
    onValueChange,
    onComplete,
    onValidationError,
    onMaxAttemptsReached,
    otpRef
  } = props;

  // State management
  const [value, setValueState] = useState<string>(defaultValue || '');
  const [focusedSlotIndex, setFocusedSlotIndex] = useState<number | null>(autoFocus ? 0 : null);
  const [attempts, setAttempts] = useState(0);
  const [isMasked, setIsMasked] = useState(masked);
  const [errors, setErrors] = useState<string[]>([]);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const otpElementRef = otpRef || internalRef;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Create slots from current value
  const createSlots = useCallback((otpValue: string): OTPIputSlot[] => {
    const slots: OTPIputSlot[] = [];
    const chars = otpValue.split('');

    for (let i = 0; i < length; i++) {
      const slotValue = chars[i] || '';
      const filled = slotValue !== '';
      const hasError = filled && !pattern.test(slotValue);

      slots.push({
        index: i,
        value: slotValue,
        focused: i === focusedSlotIndex,
        filled,
        hasError
      });
    }

    return slots;
  }, [length, focusedSlotIndex, pattern]);

  // Calculate derived state
  const slots = createSlots(value);
  const isComplete = value.length === length && !slots.some(slot => slot.hasError);
  const hasErrors = slots.some(slot => slot.hasError) || errors.length > 0;

  // Validation function
  const validate = useCallback((): boolean => {
    if (validationRules.length === 0) return true;

    const validationErrors: string[] = [];

    for (const rule of validationRules) {
      if (!rule.validate(value)) {
        validationErrors.push(rule.message);
      }
    }

    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      onValidationError?.(validationErrors);
      return false;
    }

    return true;
  }, [value, validationRules, onValidationError]);

  // Validate on mount when defaultValue is already complete so that an invalid
  // initial value surfaces its error text without requiring a change event.
  useEffect(() => {
    if (validateOnChange && value.length === length) {
      validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set value
  const setValueAction = useCallback((newValue: string) => {
    if (disabled) return;

    // Filter input according to pattern
    const filteredValue = newValue.split('').filter(char => pattern.test(char)).join('').slice(0, length);
    setValueState(filteredValue);

    const newSlots = createSlots(filteredValue);
    onValueChange?.(filteredValue, newSlots);

    // Validate if required
    if (validateOnChange && filteredValue.length === length) {
      validate();
    }

    // Auto-focus next slot if current slot is filled
    if (filteredValue.length > 0 && filteredValue.length <= length) {
      // reason: filteredValue is sliced to `length` above, so nextIndex
      // (length-1 max) is always < length — the inner guard was dead.
      const nextIndex = filteredValue.length - 1;
      setFocusedSlotIndex(nextIndex);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 0);
    }

    // Complete if all slots are filled and valid
    if (filteredValue.length === length && !newSlots.some(slot => slot.hasError)) {
      onComplete?.(filteredValue);
    }
  }, [disabled, length, pattern, createSlots, onValueChange, validateOnChange, validate, onComplete]);

  // Clear OTP
  const clear = useCallback(() => {
    if (disabled) return;
    setValueAction('');
    setFocusedSlotIndex(0);
    setErrors([]);
    inputRefs.current[0]?.focus();
  }, [disabled, setValueAction]);

  // Focus specific slot
  const focusSlot = useCallback((index: number) => {
    if (disabled || index < 0 || index >= length) return;
    setFocusedSlotIndex(index);
    inputRefs.current[index]?.focus();
  }, [disabled, length]);

  // Input character into slot
  const inputChar = useCallback((index: number, char: string) => {
    if (disabled || index < 0 || index >= length) return;

    if (!pattern.test(char)) return;

    const chars = value.split('');
    chars[index] = char;
    const newValue = chars.join('');
    setValueAction(newValue);
  }, [disabled, length, pattern, value, setValueAction]);

  // Remove character from slot
  const removeChar = useCallback((index: number) => {
    if (disabled || index < 0 || index >= length) return;

    const chars = value.split('');
    if (chars[index]) {
      chars.splice(index, 1);
      const newValue = chars.join('');
      setValueAction(newValue);

      // Focus previous slot if available
      if (index > 0) {
        focusSlot(index - 1);
      }
    }
  }, [disabled, length, value, setValueAction, focusSlot]);

  // Paste OTP value
  const pasteOTP = useCallback((pastedValue: string) => {
    if (disabled) return;

    const filteredValue = pastedValue.split('').filter(char => pattern.test(char)).join('').slice(0, length);
    setValueAction(filteredValue);
  }, [disabled, length, pattern, setValueAction]);

  // Get OTP as array
  const getAsArray = useCallback((): string[] => {
    return value.split('');
  }, [value]);

  // Focus next slot
  const focusNextSlot = useCallback(() => {
    if (focusedSlotIndex === null || focusedSlotIndex >= length - 1) return;
    focusSlot(focusedSlotIndex + 1);
  }, [focusedSlotIndex, length, focusSlot]);

  // Focus previous slot
  const focusPreviousSlot = useCallback(() => {
    if (focusedSlotIndex === null || focusedSlotIndex <= 0) return;
    focusSlot(focusedSlotIndex - 1);
  }, [focusedSlotIndex, focusSlot]);

  // Complete OTP
  const complete = useCallback(() => {
    if (disabled) return;

    // Fill remaining slots with first valid character or clear
    const chars = value.split('');
    while (chars.length < length) {
      chars.push('0'); // Default to '0' for auto-complete
    }

    const newValue = chars.join('');
    setValueAction(newValue);
  }, [disabled, length, value, setValueAction]);

  // Increment attempts
  const incrementAttempts = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (maxAttempts && newAttempts >= maxAttempts) {
      onMaxAttemptsReached?.();
    }
  }, [attempts, maxAttempts, onMaxAttemptsReached]);

  // Toggle masking
  const toggleMask = useCallback(() => {
    setIsMasked(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || focusedSlotIndex === null) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          focusPreviousSlot();
          break;
        case 'ArrowRight':
          event.preventDefault();
          focusNextSlot();
          break;
        case 'Backspace':
          event.preventDefault();
          if (value.length > 0) {
            removeChar(Math.min(focusedSlotIndex, value.length - 1));
          }
          break;
        case 'Delete':
          event.preventDefault();
          if (focusedSlotIndex < value.length) {
            removeChar(focusedSlotIndex);
          }
          break;
        case 'Home':
          event.preventDefault();
          focusSlot(0);
          break;
        case 'End':
          event.preventDefault();
          focusSlot(value.length - 1);
          break;
      }
    };

    const element = otpElementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [disabled, focusedSlotIndex, value, focusPreviousSlot, focusNextSlot, removeChar, focusSlot]);

  // Build state
  const state: OTPState = useMemo(() => ({
    value,
    slots,
    disabled,
    isComplete,
    hasErrors,
    focusedSlotIndex,
    errors,
    attempts,
    masked: isMasked
  }), [value, slots, disabled, isComplete, hasErrors, focusedSlotIndex, errors, attempts, isMasked]);

  // Build actions
  const actions: OTPActions = useMemo(() => ({
    setValue: setValueAction,
    clear,
    focusSlot,
    inputChar,
    removeChar,
    pasteOTP,
    validate,
    getAsArray,
    focusNextSlot,
    focusPreviousSlot,
    complete,
    incrementAttempts,
    toggleMask
  }), [setValueAction, clear, focusSlot, inputChar, removeChar, pasteOTP, validate, getAsArray, focusNextSlot, focusPreviousSlot, complete, incrementAttempts, toggleMask]);

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: otpElementRef
  });

  const pressable = usePressableMixin({
      disabled,
      ref: otpElementRef
  });

  const semantic = useSemanticMixin({
    role: 'group',
    ariaLabel: 'One-time password input',
    ref: otpElementRef
  });

  // Build attributes
  const attributes = useMemo(() => ({
    'aria-label': semantic.ariaLabel,
    'role': semantic.role,
    'tabIndex': disabled ? -1 : 0,
    'aria-invalid': hasErrors,
    ...(errors.length > 0 && { 'aria-describedby': 'otp-errors' })
  }), [semantic.ariaLabel, semantic.role, disabled, hasErrors, errors]);

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}