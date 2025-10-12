/**
 * Radio Group headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages radio button group with single selection behavior.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Radio group orientation options
 */
export type RadioGroupOrientation = 'horizontal' | 'vertical';

/**
 * Radio group state interface
 */
export interface RadioGroupState {
  /** Currently selected value */
  value: string | undefined;
  /** Whether radio group is disabled */
  disabled: boolean;
  /** Current orientation */
  orientation: RadioGroupOrientation;
  /** Array of radio option values */
  options: string[];
  /** Currently focused option */
  focusedOption: string | undefined;
}

/**
 * Radio group actions interface
 */
export interface RadioGroupActions {
  /** Select a radio option */
  selectOption: (value: string) => void;
  /** Focus on a specific option */
  focusOption: (value: string) => void;
  /** Navigate to next option */
  navigateNext: () => void;
  /** Navigate to previous option */
  navigatePrevious: () => void;
  /** Get option index by value */
  getOptionIndex: (value: string) => number;
  /** Check if option is selected */
  isOptionSelected: (value: string) => boolean;
  /** Check if option is focused */
  isOptionFocused: (value: string) => boolean;
}

/**
 * Props for useRadioGroup hook
 */
export interface UseRadioGroupProps {
  /** Initial selected value */
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Whether radio group is disabled */
  disabled?: boolean;
  /** Layout orientation */
  orientation?: RadioGroupOrientation;
  /** Array of option values */
  options: string[];
  /** Value change handler */
  onValueChange?: (value: string) => void;
  /** Callback when option is selected */
  onOptionSelect?: (value: string) => void;
  /** Whether to wrap navigation (circular) */
  wrapNavigation?: boolean;
  /** Ref to the radio group element */
  radioGroupRef?: React.RefObject<HTMLElement>;
}

/**
 * Return type for useRadioGroup hook
 */
export interface UseRadioGroupReturns {
  /** Current radio group state */
  state: RadioGroupState;
  /** Radio group actions */
  actions: RadioGroupActions;
  /** Radio group attributes */
  attributes: {
    'role': string;
    'aria-orientation': string;
    'aria-disabled': string | undefined;
  };
  /** Get attributes for a specific radio option */
  getOptionAttributes: (value: string) => {
    'role': string;
    'aria-checked': boolean;
    'aria-disabled': boolean;
    'tabIndex': number;
    'data-value': string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Radio group hook implementation
 * @param props - Radio group configuration props
 * @returns Radio group state, actions, and attributes
 */
export function useRadioGroup(props: UseRadioGroupProps): UseRadioGroupReturns {
  const {
    defaultValue,
    value: controlledValue,
    disabled = false,
    orientation = 'vertical',
    options,
    onValueChange,
    onOptionSelect,
    wrapNavigation = true,
    radioGroupRef
  } = props;

  // State management
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const [focusedOption, setFocusedOption] = useState<string | undefined>();

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const radioGroupElementRef = radioGroupRef || internalRef;

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Update internal value when controlled value changes
  useEffect(() => {
    if (isControlled && controlledValue !== internalValue) {
      setInternalValue(controlledValue);
    }
  }, [isControlled, controlledValue, internalValue]);

  // Select option handler
  const selectOption = useCallback((value: string) => {
    if (disabled || !options.includes(value)) return;

    if (!isControlled) {
      setInternalValue(value);
    }
    onValueChange?.(value);
    onOptionSelect?.(value);
  }, [disabled, options, isControlled, onValueChange, onOptionSelect]);

  // Focus option handler
  const focusOption = useCallback((value: string) => {
    if (disabled || !options.includes(value)) return;
    setFocusedOption(value);
  }, [disabled, options]);

  // Get option index
  const getOptionIndex = useCallback((value: string) => {
    return options.indexOf(value);
  }, [options]);

  // Check if option is selected
  const isOptionSelected = useCallback((value: string) => {
    return currentValue === value;
  }, [currentValue]);

  // Check if option is focused
  const isOptionFocused = useCallback((value: string) => {
    return focusedOption === value;
  }, [focusedOption]);

  // Navigate to next option
  const navigateNext = useCallback(() => {
    if (disabled || options.length === 0) return;

    const currentIndex = focusedOption ? getOptionIndex(focusedOption) : -1;
    let nextIndex = currentIndex + 1;

    // Handle wrapping
    if (nextIndex >= options.length) {
      nextIndex = wrapNavigation ? 0 : options.length - 1;
    }

    // Skip to next valid option (all options are valid in radio group)
    if (nextIndex >= 0 && nextIndex < options.length) {
      focusOption(options[nextIndex]);
    }
  }, [disabled, options, focusedOption, getOptionIndex, wrapNavigation, focusOption]);

  // Navigate to previous option
  const navigatePrevious = useCallback(() => {
    if (disabled || options.length === 0) return;

    const currentIndex = focusedOption ? getOptionIndex(focusedOption) : options.length;
    let prevIndex = currentIndex - 1;

    // Handle wrapping
    if (prevIndex < 0) {
      prevIndex = wrapNavigation ? options.length - 1 : 0;
    }

    // Skip to previous valid option (all options are valid in radio group)
    if (prevIndex >= 0 && prevIndex < options.length) {
      focusOption(options[prevIndex]);
    }
  }, [disabled, options, focusedOption, getOptionIndex, wrapNavigation, focusOption]);

  // Get attributes for a specific option
  const getOptionAttributes = useCallback((value: string) => {
    const isSelected = isOptionSelected(value);
    const isFocused = isOptionFocused(value);
    const optionIndex = getOptionIndex(value);

    return {
      'role': 'radio',
      'aria-checked': isSelected,
      'aria-disabled': disabled,
      'tabIndex': isFocused ? 0 : -1,
      'data-value': value,
      'data-index': optionIndex
    };
  }, [isOptionSelected, isOptionFocused, getOptionIndex, disabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          if (orientation === 'horizontal' && event.key === 'ArrowDown') return;
          if (orientation === 'vertical' && event.key === 'ArrowRight') return;
          event.preventDefault();
          navigateNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (orientation === 'horizontal' && event.key === 'ArrowUp') return;
          if (orientation === 'vertical' && event.key === 'ArrowLeft') return;
          event.preventDefault();
          navigatePrevious();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          if (focusedOption) {
            selectOption(focusedOption);
          }
          break;
        case 'Home':
          event.preventDefault();
          if (options.length > 0) {
            focusOption(options[0]);
          }
          break;
        case 'End':
          event.preventDefault();
          if (options.length > 0) {
            focusOption(options[options.length - 1]);
          }
          break;
      }
    };

    const element = radioGroupElementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [disabled, orientation, focusedOption, options, navigateNext, navigatePrevious, focusOption, selectOption, radioGroupElementRef]);

  // Build state
  const state: RadioGroupState = {
    value: currentValue,
    disabled,
    orientation,
    options,
    focusedOption
  };

  // Build actions
  const actions: RadioGroupActions = {
    selectOption,
    focusOption,
    navigateNext,
    navigatePrevious,
    getOptionIndex,
    isOptionSelected,
    isOptionFocused
  };

  // Build attributes
  const attributes = {
    'role': 'radiogroup',
    'aria-orientation': orientation,
    'aria-disabled': disabled ? 'true' : undefined
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: radioGroupElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: radioGroupElementRef
  });

  const semantic = useSemanticMixin({
    role: 'radiogroup',
    ariaLabel: 'Radio group',
    ref: radioGroupElementRef
  });

  return {
    state,
    actions,
    attributes,
    getOptionAttributes,
    focusable,
    pressable,
    semantic
  };
}