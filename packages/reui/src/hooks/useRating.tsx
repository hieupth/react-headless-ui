/**
 * Rating headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages star ratings with hover states and selection.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Rating value type
 */
export type RatingValue = number;

/**
 * Rating size options
 */
export type RatingSize = 'sm' | 'md' | 'lg';

/**
 * Rating variant options
 */
export type RatingVariant = 'star' | 'heart' | 'thumbs' | 'custom';

/**
 * Rating state interface
 */
export interface RatingState {
  /** Current rating value */
  value: RatingValue;
  /** Hover value (during hover interaction) */
  hoverValue: RatingValue | null;
  /** Focused value (during keyboard navigation) */
  focusedValue: RatingValue | null;
  /** Whether rating is readonly */
  readonly: boolean;
  /** Whether rating is disabled */
  disabled: boolean;
  /** Maximum rating value */
  max: number;
  /** Rating size */
  size: RatingSize;
  /** Rating variant */
  variant: RatingVariant;
  /** Whether to allow half ratings */
  allowHalf: boolean;
}

/**
 * Rating actions interface
 */
export interface RatingActions {
  /** Set rating value */
  setValue: (value: RatingValue) => void;
  /** Set hover value */
  setHoverValue: (value: RatingValue | null) => void;
  /** Clear rating */
  clear: () => void;
  /** Focus rating */
  focus: () => void;
  /** Blur rating */
  blur: () => void;
  /** Increment rating */
  increment: () => void;
  /** Decrement rating */
  decrement: () => void;
}

/**
 * Props for useRating hook
 */
export interface UseRatingProps {
  /** Initial rating value */
  defaultValue?: RatingValue;
  /** Controlled rating value */
  value?: RatingValue;
  /** Maximum rating value */
  max?: number;
  /** Rating size */
  size?: RatingSize;
  /** Rating variant */
  variant?: RatingVariant;
  /** Whether rating is readonly */
  readonly?: boolean;
  /** Whether rating is disabled */
  disabled?: boolean;
  /** Whether to allow half ratings */
  allowHalf?: boolean;
  /** Whether to allow clearing */
  allowClear?: boolean;
  /** Step value for rating changes */
  step?: number;
  /** Custom icon render function */
  renderIcon?: (props: {
    value: number;
    filled: boolean;
    half: boolean;
    hover: boolean;
    focused: boolean;
  }) => React.ReactNode;
  /** Callback when rating changes */
  onChange?: (value: RatingValue) => void;
  /** Callback when rating is hovered */
  onHoverChange?: (value: RatingValue | null) => void;
  /** Callback when rating is focused */
  onFocus?: (value: RatingValue | null) => void;
  /** Callback when rating is cleared */
  onClear?: () => void;
}

/**
 * Return type for useRating hook
 */
export interface UseRatingReturns {
  /** Current rating state */
  state: RatingState;
  /** Rating actions */
  actions: RatingActions;
  /** Computed properties */
  computed: {
    /** Display value (hover value or actual value) */
    displayValue: RatingValue;
    /** Percentage fill for visual representation */
    fillPercentage: number;
    /** Array of rating items */
    items: Array<{
      value: number;
      filled: boolean;
      half: boolean;
      hover: boolean;
      focused: boolean;
    }>;
    /** Whether rating can be incremented */
    canIncrement: boolean;
    /** Whether rating can be decremented */
    canDecrement: boolean;
    /** Whether rating is empty */
    isEmpty: boolean;
    /** Whether rating is full */
    isFull: boolean;
  };
  /** Rating attributes */
  ratingAttributes: {
    role: string;
    'aria-label': string;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-valuenow': number | undefined;
    'aria-readonly': boolean;
    'aria-disabled': boolean;
    tabIndex: number;
  };
  /** Get item attributes */
  getItemAttributes: (value: number) => {
    'aria-label': string;
    'aria-selected': boolean;
    'aria-setsize': number;
    'aria-posinset': number;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    tabIndex: number;
    disabled: boolean;
  };
  /** Get half item attributes */
  getHalfItemAttributes: (value: number, position: 'first' | 'second') => {
    'aria-label': string;
    'aria-selected': boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    tabIndex: number;
    disabled: boolean;
  };
}

/**
 * Rating hook implementation
 * @param props - Rating configuration props
 * @returns Rating state, actions, computed properties, and attributes
 */
export function useRating(props: UseRatingProps = {}): UseRatingReturns {
  const {
    defaultValue = 0,
    value: controlledValue,
    max = 5,
    size = 'md',
    variant = 'star',
    readonly = false,
    disabled = false,
    allowHalf = false,
    allowClear = false,
    step = 1,
    renderIcon,
    onChange,
    onHoverChange,
    onFocus,
    onClear
  } = props;

  // State management
  const [internalValue, setInternalValue] = useState<RatingValue>(defaultValue);
  const [hoverValue, setHoverValueState] = useState<RatingValue | null>(null);
  const [focusedValue, setFocusedValue] = useState<RatingValue | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  // Clamp value to valid range
  const clampedValue = Math.max(0, Math.min(value, max));

  // Actions
  const actions = useMemo(() => {
    const setValue = (newValue: RatingValue) => {
      if (readonly || disabled) return;

      const clampedNewValue = Math.max(0, Math.min(newValue, max));

      if (controlledValue === undefined) {
        setInternalValue(clampedNewValue);
      }

      onChange?.(clampedNewValue);
    };

    const setHoverValue = (newHoverValue: RatingValue | null) => {
      if (readonly || disabled) return;
      setHoverValueState(newHoverValue);
      onHoverChange?.(newHoverValue);
    };

    const clear = () => {
      if (readonly || disabled || !allowClear) return;
      setValue(0);
      onClear?.();
    };

    const focus = () => {
      containerRef.current?.focus();
    };

    const blur = () => {
      containerRef.current?.blur();
    };

    const increment = () => {
      if (readonly || disabled) return;
      const newValue = Math.min(value + step, max);
      setValue(newValue);
    };

    const decrement = () => {
      if (readonly || disabled) return;
      const newValue = Math.max(value - step, 0);
      setValue(newValue);
    };

    return {
      setValue,
      setHoverValue,
      clear,
      focus,
      blur,
      increment,
      decrement
    };
  }, [value, step, max, readonly, disabled, allowClear, controlledValue, onChange, onHoverChange, onClear]);

  // Computed properties
  const computed = useMemo(() => {
    const displayValue = hoverValue !== null ? hoverValue : clampedValue;
    const fillPercentage = (displayValue / max) * 100;

    // Generate rating items
    const items: Array<{
      value: number;
      filled: boolean;
      half: boolean;
      hover: boolean;
      focused: boolean;
    }> = [];

    for (let i = 1; i <= max; i++) {
      const itemValue = i;
      const filled = displayValue >= itemValue;
      const half = allowHalf && displayValue >= itemValue - 0.5 && displayValue < itemValue;
      const hover = hoverValue !== null && hoverValue >= itemValue;
      const focused = focusedValue === itemValue;

      items.push({
        value: itemValue,
        filled: filled || half,
        half,
        hover,
        focused
      });
    }

    const canIncrement = !readonly && !disabled && clampedValue < max;
    const canDecrement = !readonly && !disabled && clampedValue > 0;
    const isEmpty = clampedValue === 0;
    const isFull = clampedValue === max;

    return {
      displayValue,
      fillPercentage,
      items,
      canIncrement,
      canDecrement,
      isEmpty,
      isFull
    };
  }, [max, clampedValue, hoverValue, focusedValue, allowHalf, readonly, disabled]);

  // Build state
  const state: RatingState = {
    value: clampedValue,
    hoverValue,
    focusedValue,
    readonly,
    disabled,
    max,
    size,
    variant,
    allowHalf
  };

  // Build rating attributes
  const ratingAttributes = {
    role: 'slider',
    'aria-label': 'Rating',
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': clampedValue > 0 ? clampedValue : undefined,
    'aria-readonly': readonly,
    'aria-disabled': disabled,
    tabIndex: readonly || disabled ? -1 : 0
  };

  // Build item attributes
  const getItemAttributes = (itemValue: number) => ({
    'aria-label': `Rate ${itemValue} out of ${max}`,
    'aria-selected': clampedValue >= itemValue,
    'aria-setsize': max,
    'aria-posinset': itemValue,
    onClick: () => {
      if (allowClear && value === itemValue) {
        actions.clear();
      } else {
        actions.setValue(itemValue);
      }
    },
    onMouseEnter: () => actions.setHoverValue(itemValue),
    onMouseLeave: () => actions.setHoverValue(null),
    onFocus: () => setFocusedValue(itemValue),
    onBlur: () => setFocusedValue(null),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (disabled || readonly) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          actions.increment();
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          actions.decrement();
          break;
        case 'Home':
          event.preventDefault();
          actions.setValue(0);
          break;
        case 'End':
          event.preventDefault();
          actions.setValue(max);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (allowClear && value === itemValue) {
            actions.clear();
          } else {
            actions.setValue(itemValue);
          }
          break;
      }
    },
    tabIndex: readonly || disabled ? -1 : 0,
    disabled: readonly || disabled
  });

  // Build half item attributes
  const getHalfItemAttributes = (itemValue: number, position: 'first' | 'second') => {
    const halfValue = position === 'first' ? itemValue - 0.5 : itemValue;

    return {
      'aria-label': `Rate ${halfValue} out of ${max}`,
      'aria-selected': clampedValue >= halfValue,
      onClick: () => actions.setValue(halfValue),
      onMouseEnter: () => actions.setHoverValue(halfValue),
      onMouseLeave: () => actions.setHoverValue(null),
      onFocus: () => setFocusedValue(halfValue),
      onBlur: () => setFocusedValue(null),
      tabIndex: readonly || disabled ? -1 : 0,
      disabled: readonly || disabled
    };
  };

  // Reset hover value when value changes externally
  useEffect(() => {
    setHoverValueState(null);
  }, [controlledValue]);

  return useMemo(() => ({
    state,
    actions,
    computed,
    ratingAttributes,
    getItemAttributes,
    getHalfItemAttributes
  }), [state, actions, computed, ratingAttributes, getItemAttributes, getHalfItemAttributes]);
}