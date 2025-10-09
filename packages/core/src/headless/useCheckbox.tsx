/**
 * Checkbox headless hook following Flutter Checkbox patterns.
 * Provides tri-state checkbox behavior with proper accessibility.
 */

import { useState, useCallback, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export type CheckboxValue = boolean | 'indeterminate';

export interface UseCheckboxProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Initial checked state */
  defaultChecked?: boolean;
  /** Controlled checked state */
  checked?: CheckboxValue;
  /** Initial indeterminate state */
  defaultIndeterminate?: boolean;
  /** Controlled indeterminate state */
  indeterminate?: boolean;
  /** Whether checkbox is required */
  required?: boolean;
  /** Checkbox value for form submission */
  value?: string;
  /** Checkbox name for form submission */
  name?: string;
  /** Check change handler */
  onCheckedChange?: (checked: CheckboxValue) => void;
  /** Indeterminate change handler */
  onIndeterminateChange?: (indeterminate: boolean) => void;
}

export interface UseCheckboxState {
  /** Current checked state */
  checked: CheckboxValue;
  /** Current indeterminate state */
  indeterminate: boolean;
  /** Current focus state */
  focused: boolean;
  /** Current disabled state */
  disabled: boolean;
  /** Whether checkbox is required */
  required: boolean;
}

export interface UseCheckboxActions {
  /** Handle click/toggle */
  toggle: () => void;
  /** Handle focus event */
  onFocus: (event: FocusEvent) => void;
  /** Handle blur event */
  onBlur: (event: FocusEvent) => void;
  /** Handle key events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle key up events */
  handleKeyUp: (event: React.KeyboardEvent) => void;
  /** Set checked state programmatically */
  setChecked: (checked: CheckboxValue) => void;
  /** Set indeterminate state programmatically */
  setIndeterminate: (indeterminate: boolean) => void;
  /** Focus checkbox programmatically */
  focus: () => void;
  /** Blur checkbox programmatically */
  blur: () => void;
}

export interface UseCheckboxReturns extends UseCheckboxState, UseCheckboxActions {
  /** Semantic attributes for accessibility */
  semanticAttributes: Record<string, any>;
  /** Computed class names */
  className: string;
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Reference to DOM element */
  ref: React.RefObject<HTMLInputElement>;
  /** Input value for forms */
  inputValue: string;
}

/**
 * Headless checkbox hook providing tri-state checkbox behavior.
 * Supports checked, unchecked, and indeterminate states.
 */
export const useCheckbox = (props: UseCheckboxProps = {}): UseCheckboxReturns => {
  const {
    defaultChecked = false,
    checked: controlledChecked,
    defaultIndeterminate = false,
    indeterminate: controlledIndeterminate,
    required = false,
    value = 'on',
    name,
    onCheckedChange,
    onIndeterminateChange,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    disabled = false,
    role = 'checkbox',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [internalChecked, setInternalChecked] = useState<CheckboxValue>(defaultChecked);
  const [internalIndeterminate, setInternalIndeterminate] = useState(defaultIndeterminate);

  // Use controlled values if provided, otherwise use internal state
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const indeterminate = controlledIndeterminate !== undefined ? controlledIndeterminate : internalIndeterminate;

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable,
    focusStrategy
  });

  // Press behavior
  const pressableMixin = usePressableMixin({
    pressable: !disabled,
    disabled,
    preventDefault: true
  });

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    required,
    disabled,
    ...semanticProps
  });

  // Toggle checkbox state
  const toggle = useCallback(() => {
    if (disabled) return;

    let newChecked: CheckboxValue;
    if (indeterminate) {
      // Indeterminate -> checked
      newChecked = true;
    } else if (checked) {
      // Checked -> unchecked
      newChecked = false;
    } else {
      // Unchecked -> checked
      newChecked = true;
    }

    // Clear indeterminate when toggling
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    if (controlledIndeterminate === undefined) {
      setInternalIndeterminate(false);
    }

    onCheckedChange?.(newChecked);
    if (indeterminate && controlledIndeterminate === undefined) {
      onIndeterminateChange?.(false);
    }
  }, [disabled, indeterminate, checked, controlledChecked, controlledIndeterminate, onCheckedChange, onIndeterminateChange]);

  // Handle focus events
  const handleFocus = useCallback((event: FocusEvent) => {
    focusableMixin.handleFocus(event);
  }, [focusableMixin]);

  // Handle blur events
  const handleBlur = useCallback((event: FocusEvent) => {
    focusableMixin.handleBlur(event);
  }, [focusableMixin]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    focusableMixin.handleKeyDown(event);

    // Handle Space key to toggle
    if (event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  }, [disabled, focusableMixin.handleKeyDown, toggle]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyUp(event);
  }, [focusableMixin.handleKeyUp]);

  // Programmatic actions
  const setChecked = useCallback((newChecked: CheckboxValue) => {
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  }, [controlledChecked, onCheckedChange]);

  const setIndeterminate = useCallback((newIndeterminate: boolean) => {
    if (controlledIndeterminate === undefined) {
      setInternalIndeterminate(newIndeterminate);
    }
    onIndeterminateChange?.(newIndeterminate);
  }, [controlledIndeterminate, onIndeterminateChange]);

  const focus = useCallback(() => {
    focusableMixin.focus();
  }, [focusableMixin]);

  const blur = useCallback(() => {
    focusableMixin.blur();
  }, [focusableMixin.blur]);

  // Sync indeterminate state with DOM
  useMemo(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // Computed state
  const state = useMemo(() => composeState<UseCheckboxState>({
    checked,
    indeterminate,
    focused: focusableMixin.focused,
    disabled: pressableMixin.disabled,
    required
  }), [checked, indeterminate, focusableMixin.focused, pressableMixin.disabled, required]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    type: 'checkbox',
    value,
    name,
    required,
    disabled,
    checked: checked === true,
    'aria-checked': checked === true ? 'true' : checked === false ? 'false' : 'mixed',
    'aria-required': required,
    'data-indeterminate': indeterminate,
    'data-checked': checked === true,
    'data-unchecked': checked === false
  }), [semantic, value, name, required, disabled, checked, indeterminate]);

  // Class names
  const className = useMemo(() => {
    const classes = ['checkbox'];

    if (checked === true) classes.push('checkbox-checked');
    if (checked === false) classes.push('checkbox-unchecked');
    if (indeterminate) classes.push('checkbox-indeterminate');
    if (state.focused) classes.push('checkbox-focused');
    if (state.disabled) classes.push('checkbox-disabled');
    if (required) classes.push('checkbox-required');

    return classes.join(' ');
  }, [checked, indeterminate, state.focused, state.disabled, required]);

  // Input value for forms
  const inputValue = useMemo(() => {
    return value;
  }, [value]);

  return {
    // State
    ...state,

    // Actions
    toggle,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleKeyUp,
    setChecked,
    setIndeterminate,
    focus,
    blur,

    // Computed properties
    semanticAttributes,
    className,
    tabIndex: focusableMixin.tabIndex,
    ref: inputRef,
    inputValue
  };
};