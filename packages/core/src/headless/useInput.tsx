/**
 * Input headless hook following Flutter TextField patterns.
 * Provides comprehensive text input behavior with validation and accessibility.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useFocusableMixin, useSemanticMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { FocusableMixinProps, SemanticMixinProps } from '../mixins';

export interface UseInputProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Initial value */
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is required */
  required?: boolean;
  /** Whether input is read-only */
  readOnly?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Minimum character count */
  minLength?: number;
  /** Input pattern for validation */
  pattern?: string;
  /** Minimum numeric value */
  min?: number | string;
  /** Maximum numeric value */
  max?: number | string;
  /** Numeric step value */
  step?: number | string;
  /** Auto-complete behavior */
  autoComplete?: 'on' | 'off' | string;
  /** Auto-capitalization behavior */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Auto-correction behavior */
  autoCorrect?: 'on' | 'off';
  /** Spell check */
  spellCheck?: boolean;
  /** Input mode for mobile keyboards */
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  /** Value change handler */
  onChange?: (value: string) => void;
  /** Input handler */
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: FocusEvent) => void;
  /** Blur handler */
  onBlur?: (event: FocusEvent) => void;
  /** Validation handler */
  onValidate?: (value: string, validity: ValidityState) => boolean | void;
  /** Custom validation rules */
  validation?: ValidationRule[];
}

export interface ValidationRule {
  /** Validation function */
  validate: (value: string) => boolean | string;
  /** Error message for failed validation */
  message: string;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
}

export interface UseInputState {
  /** Current input value */
  value: string;
  /** Current focus state */
  focused: boolean;
  /** Current disabled state */
  disabled: boolean;
  /** Current read-only state */
  readOnly: boolean;
  /** Current validity state */
  valid: boolean;
  /** Current error message */
  error?: string;
  /** Character count */
  characterCount: number;
  /** Whether input has been touched (blurred) */
  touched: boolean;
  /** Whether input is dirty (value changed) */
  dirty: boolean;
}

export interface UseInputActions {
  /** Handle value change */
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handle input event */
  handleInput: (event: React.FormEvent<HTMLInputElement>) => void;
  /** Handle focus event */
  handleFocus: (event: FocusEvent) => void;
  /** Handle blur event */
  handleBlur: (event: FocusEvent) => void;
  /** Handle key events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle key up events */
  handleKeyUp: (event: React.KeyboardEvent) => void;
  /** Set value programmatically */
  setValue: (value: string) => void;
  /** Clear input value */
  clear: () => void;
  /** Focus input programmatically */
  focus: () => void;
  /** Blur input programmatically */
  blur: () => void;
  /** Validate current value */
  validate: () => boolean;
  /** Reset input to initial state */
  reset: () => void;
}

export interface UseInputReturns extends UseInputState, UseInputActions {
  /** Semantic attributes for accessibility */
  semanticAttributes: Record<string, any>;
  /** Computed class names */
  className: string;
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Reference to DOM element */
  ref: React.RefObject<HTMLInputElement>;
  /** Validation message */
  validationMessage: string;
  /** Native validity state */
  validity: ValidityState;
}

/**
 * Headless input hook providing comprehensive text input behavior.
 * Includes validation, accessibility, and state management.
 */
export const useInput = (props: UseInputProps = {}): UseInputReturns => {
  const {
    type = 'text',
    defaultValue = '',
    value: controlledValue,
    placeholder,
    required = false,
    readOnly = false,
    maxLength,
    minLength,
    pattern,
    min,
    max,
    step,
    autoComplete,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    inputMode,
    onChange,
    onInput,
    onFocus,
    onBlur,
    onValidate,
    validation = [],
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    disabled = false,
    role = 'textbox',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string>();

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled && !readOnly,
    focusStrategy,
    onFocus
  });

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    required,
    disabled: disabled || readOnly,
    ...semanticProps
  });

  // Validation logic
  const validateValue = useCallback((currentValue: string) => {
    const input = inputRef.current;
    if (!input) return true;

    // Native validation
    const nativeValid = input.checkValidity();
    if (!nativeValid) {
      setError(input.validationMessage);
      return false;
    }

    // Custom validation rules
    for (const rule of validation) {
      const result = rule.validate(currentValue);
      if (result === false || typeof result === 'string') {
        setError(typeof result === 'string' ? result : rule.message);
        onValidate?.(currentValue, input.validity);
        return false;
      }
    }

    // Clear error if valid
    setError(undefined);
    onValidate?.(currentValue, input.validity);
    return true;
  }, [validation, onValidate]);

  // Handle value changes
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    if (!readOnly) {
      setDirty(true);

      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);

      // Validate on change if configured
      const validateOnChange = validation.some(rule => rule.validateOnChange !== false);
      if (validateOnChange) {
        validateValue(newValue);
      }
    }
  }, [readOnly, controlledValue, onChange, validateValue]);

  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    onInput?.(event);
  }, [onInput]);

  // Handle focus events
  const handleFocus = useCallback((event: FocusEvent) => {
    focusableMixin.handleFocus(event);
  }, [focusableMixin]);

  // Handle blur events
  const handleBlur = useCallback((event: FocusEvent) => {
    setTouched(true);
    focusableMixin.handleBlur(event);
    onBlur?.(event);

    // Always validate on blur
    validateValue(value);
  }, [focusableMixin, onBlur, validateValue, value]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyDown(event);
  }, [focusableMixin.handleKeyDown]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyUp(event);
  }, [focusableMixin.handleKeyUp]);

  // Programmatic actions
  const setValue = useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
      setDirty(true);
    }
    onChange?.(newValue);
  }, [controlledValue, onChange]);

  const clear = useCallback(() => {
    setValue('');
  }, [setValue]);

  const focus = useCallback(() => {
    focusableMixin.focus();
  }, [focusableMixin]);

  const blur = useCallback(() => {
    focusableMixin.blur();
  }, [focusableMixin.blur]);

  const validate = useCallback(() => {
    return validateValue(value);
  }, [validateValue, value]);

  const reset = useCallback(() => {
    setInternalValue(defaultValue);
    setTouched(false);
    setDirty(false);
    setError(undefined);
  }, [defaultValue]);

  // Computed state
  const state = useMemo(() => composeState<UseInputState>({
    value,
    focused: focusableMixin.focused,
    disabled: disabled || readOnly,
    readOnly,
    valid: !error,
    error,
    characterCount: value.length,
    touched,
    dirty
  }), [value, focusableMixin.focused, disabled, readOnly, error, touched, dirty]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    type,
    value,
    placeholder,
    required,
    readOnly,
    maxLength,
    minLength,
    pattern,
    min,
    max,
    step,
    autoComplete,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    inputMode,
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-readonly': readOnly,
    'data-touched': touched,
    'data-dirty': dirty,
    'data-valid': !error,
    'data-error': !!error
  }), [semantic, type, value, placeholder, required, readOnly, maxLength, minLength, pattern, min, max, step, autoComplete, autoCapitalize, autoCorrect, spellCheck, inputMode, error, touched, dirty]);

  // Class names
  const className = useMemo(() => {
    const classes = ['input', `input-${type}`];

    if (state.focused) classes.push('input-focused');
    if (state.disabled) classes.push('input-disabled');
    if (state.readOnly) classes.push('input-readonly');
    if (!state.valid) classes.push('input-invalid');
    if (state.touched) classes.push('input-touched');
    if (state.dirty) classes.push('input-dirty');
    if (required) classes.push('input-required');

    return classes.join(' ');
  }, [type, state.focused, state.disabled, state.readOnly, state.valid, state.touched, state.dirty, required]);

  // Native validity state
  const validity = useMemo(() => inputRef.current?.validity || ({
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: true,
    valueMissing: false
  } as ValidityState), [value]);

  const validationMessage = error || inputRef.current?.validationMessage || '';

  return {
    // State
    ...state,

    // Actions
    handleChange,
    handleInput,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleKeyUp,
    setValue,
    clear,
    focus,
    blur,
    validate,
    reset,

    // Computed properties
    semanticAttributes,
    className,
    tabIndex: focusableMixin.tabIndex,
    ref: inputRef,
    validationMessage,
    validity
  };
};