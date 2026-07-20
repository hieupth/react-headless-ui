/**
 * Field hook following Flutter patterns.
 * Provides composable behavior for form field components.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Props for useField hook
 */
export interface UseFieldProps extends
  SemanticProps,
  Omit<FocusableProps, 'onFocus' | 'onBlur' | 'defaultFocused' | 'focusable' | 'focusStrategy'> {
  /** Initial focus state */
  defaultFocused?: boolean;
  /** Whether element can receive focus */
  focusable?: boolean;
  /** Focus management strategy */
  focusStrategy?: 'auto' | 'manual' | 'programmatic' | 'first';
  /** Field value */
  value?: string;
  /** Default value when uncontrolled */
  defaultValue?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is invalid */
  invalid?: boolean;
  /** Field placeholder */
  placeholder?: string;
  /** Field type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Validation pattern */
  pattern?: string;
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Minimum value (for number type) */
  min?: number | string;
  /** Maximum value (for number type) */
  max?: number | string;
  /** Step value (for number type) */
  step?: number | string;
  /** Auto complete behavior */
  autoComplete?: string;
  /** Read only state */
  readOnly?: boolean;
  /** Field description */
  description?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Field label */
  label?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void;
  /** Input handler */
  onInput?: (value: string) => void;
  /** Validation handler */
  onValidate?: (value: string, isValid: boolean) => void;
}

/**
 * Field component state
 */
export interface FieldState {
  /** Field value */
  value: string;
  /** Whether field is focused */
  focused: boolean;
  /** Whether field is disabled */
  disabled: boolean;
  /** Whether field is required */
  required: boolean;
  /** Whether field is invalid */
  invalid: boolean;
  /** Whether field is filled */
  filled: boolean;
  /** Error message */
  error?: string;
}

/**
 * Field handlers
 */
export interface FieldHandlers {
  /** Handle value change */
  handleChange: (value: string) => void;
  /** Handle focus */
  handleFocus: (event: React.FocusEvent) => void;
  /** Handle blur */
  handleBlur: (event: React.FocusEvent) => void;
  /** Handle input */
  handleInput: (event: React.FormEvent<HTMLInputElement>) => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle validation */
  handleValidate: () => boolean;
  /** Handle clear */
  handleClear: () => void;
}

/**
 * Composable field hook using Flutter-style mixins
 * @param props - Field configuration
 * @returns Field state, handlers, and attributes
 */
export function useField(props: UseFieldProps = {}) {
  const {
    value: controlledValue,
    defaultValue = '',
    disabled = false,
    required = false,
    invalid = false,
    placeholder,
    type = 'text',
    pattern,
    minLength,
    maxLength,
    min,
    max,
    step,
    autoComplete,
    readOnly = false,
    description,
    error,
    helperText,
    label,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    onChange,
    onFocus,
    onBlur,
    onInput,
    onValidate,
    role = 'textbox',
    ...semanticProps
  } = props;

  // State management
  const [focused, setFocused] = useState(defaultFocused);
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Compose mixins for field behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled && !readOnly,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label,
    describedBy: description || helperText || error,
    ...semanticProps
  });

  // Validation function
  const validateValue = useCallback((inputValue: string) => {
    if (required && !inputValue.trim()) {
      return false;
    }

    if (pattern && !new RegExp(pattern).test(inputValue)) {
      return false;
    }

    if (minLength !== undefined && inputValue.length < minLength) {
      return false;
    }

    if (maxLength !== undefined && inputValue.length > maxLength) {
      return false;
    }

    if (type === 'email' && inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      return false;
    }

    if (type === 'url' && inputValue) {
      try {
        new URL(inputValue);
      } catch {
        return false;
      }
    }

    if (type === 'number' && inputValue) {
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue)) return false;
      if (min !== undefined && numValue < parseFloat(min.toString())) return false;
      if (max !== undefined && numValue > parseFloat(max.toString())) return false;
    }

    return true;
  }, [required, pattern, minLength, maxLength, type, min, max]);

  // Compose field state
  const state = useMemo(() => ({
    value,
    focused: focusableMixin.focused,
    disabled,
    required,
    invalid: Boolean(invalid || (error && error.length > 0)),
    filled: value.length > 0,
    error
  }), [value, focusableMixin.focused, disabled, required, invalid, error]);

  // Event handlers
  const handleChange = useCallback((newValue: string) => {
    if (disabled || readOnly) return;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  }, [disabled, readOnly, isControlled, onChange]);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (disabled || readOnly) return;

    setFocused(true);
    focusableMixin.handleFocus(event.nativeEvent);
    onFocus?.(event);
  }, [disabled, readOnly, focusableMixin.handleFocus, onFocus]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    setFocused(false);
    focusableMixin.handleBlur(event.nativeEvent);
    onBlur?.(event);

    // Validate on blur
    const isValid = validateValue(value);
    onValidate?.(value, isValid);
  }, [focusableMixin.handleBlur, onBlur, validateValue, value, onValidate]);

  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const inputValue = (event.target as HTMLInputElement).value;
    handleChange(inputValue);
    onInput?.(inputValue);
  }, [handleChange, onInput]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled || readOnly) return;

    // Handle Escape to clear field
    if (event.key === 'Escape' && !required) {
      event.preventDefault();
      handleChange('');
      return;
    }

    // Delegate to focusable mixin for standard navigation
    focusableMixin.handleKeyDown(event);
  }, [focusable, disabled, readOnly, required, handleChange, focusableMixin.handleKeyDown]);

  const handleValidate = useCallback(() => {
    const isValid = validateValue(value);
    onValidate?.(value, isValid);
    return isValid;
  }, [validateValue, value, onValidate]);

  const handleClear = useCallback(() => {
    if (disabled || readOnly || required) return;
    handleChange('');
  }, [disabled, readOnly, required, handleChange]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-required': required,
    'aria-invalid': state.invalid,
    'aria-disabled': disabled,
    'aria-readonly': readOnly,
    'data-filled': state.filled,
    'data-invalid': state.invalid,
    'data-disabled': disabled,
    'data-focused': state.focused,
    'data-required': required,
    placeholder,
    disabled,
    readOnly,
    required,
    value,
    type,
    pattern,
    minLength,
    maxLength,
    min,
    max,
    step,
    autoComplete,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onInput: handleInput,
    onKeyDown: handleKeyDown
  }), [semantic, required, state.invalid, state.filled, disabled, readOnly, placeholder, value, type, pattern, minLength, maxLength, min, max, step, autoComplete, handleFocus, handleBlur, handleInput, handleKeyDown]);

  // Memoize handlers as a stable intermediate object so the outer return
  // can reference it without re-creating it on every render.
  const handlers = useMemo(() => ({
    handleChange,
    handleFocus,
    handleBlur,
    handleInput,
    handleKeyDown,
    handleValidate,
    handleClear
  }), [handleChange, handleFocus, handleBlur, handleInput, handleKeyDown, handleValidate, handleClear]);

  return useMemo(() => ({
    state,
    handlers,
    attributes: semanticAttributes
  }), [state, handlers, semanticAttributes]);
}