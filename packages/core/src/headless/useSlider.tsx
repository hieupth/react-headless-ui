/**
 * Slider headless hook for React UI Forge.
 * Provides range slider behavior with accessibility support.
 *
 * Features:
 * - Single value and range (dual thumb) support
 * - Min/max value constraints
 * - Step increment control
 * - Keyboard navigation (arrow keys, Home, End, PageUp, PageDown)
 * - Mouse/touch drag support
 * - Vertical/horizontal orientation
 * - Form integration
 * - ARIA compliance
 * - Controlled/uncontrolled modes
 * - Disabled state
 * - Focus management
 *
 * Architecture Principles:
 * - Composition over inheritance (Widget-style)
 * - Behavior mixins (Flutter mixin pattern)
 * - Semantic-first (Flutter Semantics)
 * - No inline event handlers
 * - Immutable state updates
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFocusableMixin, FocusableMixinProps } from '../mixins';
import { usePressableMixin, PressableMixinProps } from '../mixins';
import { useSemanticMixin, SemanticMixinProps } from '../mixins';
import { composeState, composeHandlers, composeClasses, composeStyles } from '../utils';

/**
 * Slider value types
 */
export type SliderValue = number | [number, number];

/**
 * Slider component properties
 */
export interface UseSliderProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Current slider value(s) */
  value?: SliderValue;
  /** Default value for uncontrolled mode */
  defaultValue?: SliderValue;
  /** Change handler */
  onValueChange?: (value: SliderValue) => void;
  /** Change commit handler (when interaction ends) */
  onValueCommit?: (value: SliderValue) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Whether slider is disabled */
  disabled?: boolean;
  /** Whether slider is read-only */
  readOnly?: boolean;
  /** Whether slider is a range (dual thumb) */
  isRange?: boolean;
  /** Slider orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Ref to the slider element */
  sliderRef?: React.RefObject<HTMLDivElement>;
  /** Refs to thumb elements */
  thumbRefs?: [React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>?];
}

/**
 * Slider component state
 */
export interface SliderState {
  /** Current value(s) */
  value: SliderValue;
  /** Whether slider is focused */
  focused: boolean;
  /** Whether slider is pressed */
  pressed: boolean;
  /** Whether slider is hovered */
  hovered: boolean;
  /** Whether slider is disabled */
  disabled: boolean;
  /** Whether slider is read-only */
  readOnly: boolean;
  /** Which thumb is active (for range sliders) */
  activeThumb: number | null;
  /** Whether slider is being dragged */
  dragging: boolean;
}

/**
 * Slider component actions
 */
export interface SliderActions {
  /** Set slider value(s) */
  setValue: (value: SliderValue) => void;
  /** Increment value */
  increment: (step?: number) => void;
  /** Decrement value */
  decrement: (step?: number) => void;
  /** Set to minimum value */
  setToMin: () => void;
  /** Set to maximum value */
  setToMax: () => void;
  /** Focus slider */
  focus: () => void;
  /** Blur slider */
  blur: () => void;
}

/**
 * Slider component return value
 */
export interface SliderReturns {
  /** Slider state */
  state: SliderState;
  /** Slider actions */
  actions: SliderActions;
  /** Event handlers */
  handlers: {
    /** Key down handler */
    onKeyDown: (event: React.KeyboardEvent) => void;
    /** Focus handler */
    onFocus: (event: React.FocusEvent) => void;
    /** Blur handler */
    onBlur: (event: React.FocusEvent) => void;
    /** Mouse down handler */
    onMouseDown: (event: React.MouseEvent) => void;
    /** Touch start handler */
    onTouchStart: (event: React.TouchEvent) => void;
    /** Mouse enter handler */
    onMouseEnter: (event: React.MouseEvent) => void;
    /** Mouse leave handler */
    onMouseLeave: (event: React.MouseEvent) => void;
  };
  /** Semantic attributes for accessibility */
  sliderAttributes: {
    role: string;
    'aria-disabled': boolean;
    'aria-readonly': boolean;
    'aria-orientation': string;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-valuenow': number | undefined;
    'aria-valuetext': string | undefined;
  };
  /** Thumb attributes for each thumb */
  getThumbAttributes: (index: number) => {
    role: string;
    tabIndex: number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-valuenow': number;
    'aria-valuetext': string;
    'aria-label': string | undefined;
    'aria-orientation': string;
  };
  /** Form attributes */
  formAttributes: {
    name?: string;
    value?: string;
    type: string;
  };
  /** CSS class names */
  className: string;
  /** Ref to slider element */
  sliderRef: React.RefObject<HTMLDivElement>;
  /** Refs to thumb elements */
  thumbRefs: [React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>];
  /** Calculate value from position */
  getValueFromPosition: (clientX: number, clientY: number) => SliderValue;
  /** Calculate position from value */
  getPositionFromValue: (value: number) => number;
}

/**
 * Slider headless hook implementation
 *
 * @param props - Slider properties
 * @returns Slider behavior and attributes
 */
export const useSlider = (props: UseSliderProps): SliderReturns => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    readOnly = false,
    isRange = false,
    orientation = 'horizontal',
    sliderRef: externalRef,
    thumbRefs: externalThumbRefs,
    className,
    style,
    ...mixinProps
  } = props;

  // Internal state for uncontrolled mode
  const defaultRangeValue: [number, number] = [min, min + (max - min) / 2];
  const defaultSingleValue = min + (max - min) / 2;

  const [internalValue, setInternalValue] = useState<SliderValue>(
    defaultValue ?? (isRange ? defaultRangeValue : defaultSingleValue)
  );

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Interaction state
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  // Create internal refs
  const internalRef = useRef<HTMLDivElement>(null);
  const sliderRef = externalRef || internalRef;

  const internalThumbRef1 = useRef<HTMLDivElement>(null);
  const internalThumbRef2 = useRef<HTMLDivElement>(null);
  const thumbRefs: [React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>] =
    externalThumbRefs || [internalThumbRef1, internalThumbRef2];

  // Focusable mixin behavior
  const focusable = useFocusableMixin({
    disabled,
    className,
    style,
    ...mixinProps
  });

  // Pressable mixin behavior
  const pressable = usePressableMixin({
    disabled,
    className,
    style,
    ...mixinProps
  });

  // Semantic mixin behavior
  const semantic = useSemanticMixin({
    role: 'slider',
    disabled,
    className,
    style,
    ...mixinProps
  });

  /**
   * Clamp value to min/max bounds
   */
  const clampValue = useCallback((val: number): number => {
    return Math.max(min, Math.min(max, val));
  }, [min, max]);

  /**
   * Round value to nearest step
   */
  const roundToStep = useCallback((val: number): number => {
    const stepped = Math.round((val - min) / step) * step + min;
    return clampValue(stepped);
  }, [min, max, step, clampValue]);

  /**
   * Get current value(s) as numbers
   */
  const getValueAsNumbers = useCallback((): [number, number] => {
    if (isRange && Array.isArray(value)) {
      return [value[0], value[1]];
    }
    const singleValue = typeof value === 'number' ? value : min;
    return [singleValue, singleValue];
  }, [value, isRange, min]);

  /**
   * Set slider value(s)
   */
  const setValue = useCallback((newValue: SliderValue) => {
    if (disabled || readOnly) return;

    // Validate and clamp values
    let validatedValue: SliderValue;
    if (isRange && Array.isArray(newValue)) {
      validatedValue = [
        roundToStep(newValue[0]),
        roundToStep(newValue[1])
      ].sort((a, b) => a - b) as [number, number];
    } else {
      const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
      validatedValue = roundToStep(singleValue);
    }

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(validatedValue);
    }

    // Call change handler
    onValueChange?.(validatedValue);
  }, [disabled, readOnly, isRange, roundToStep, isControlled, onValueChange]);

  /**
   * Increment value
   */
  const increment = useCallback((customStep?: number) => {
    const [val1, val2] = getValueAsNumbers();
    const stepValue = customStep || step;

    if (activeThumb !== null && isRange) {
      const newValues = [...val1, val2] as [number, number];
      newValues[activeThumb] = roundToStep(newValues[activeThumb] + stepValue);
      setValue(newValues);
    } else if (!isRange) {
      setValue(val1 + stepValue);
    }
  }, [activeThumb, isRange, getValueAsNumbers, step, roundToStep, setValue]);

  /**
   * Decrement value
   */
  const decrement = useCallback((customStep?: number) => {
    const [val1, val2] = getValueAsNumbers();
    const stepValue = customStep || step;

    if (activeThumb !== null && isRange) {
      const newValues = [...val1, val2] as [number, number];
      newValues[activeThumb] = roundToStep(newValues[activeThumb] - stepValue);
      setValue(newValues);
    } else if (!isRange) {
      setValue(val1 - stepValue);
    }
  }, [activeThumb, isRange, getValueAsNumbers, step, roundToStep, setValue]);

  /**
   * Set to minimum value
   */
  const setToMin = useCallback(() => {
    if (isRange) {
      setValue([min, min]);
    } else {
      setValue(min);
    }
  }, [isRange, min, setValue]);

  /**
   * Set to maximum value
   */
  const setToMax = useCallback(() => {
    if (isRange) {
      setValue([max, max]);
    } else {
      setValue(max);
    }
  }, [isRange, max, setValue]);

  /**
   * Focus slider
   */
  const focus = useCallback(() => {
    if (activeThumb !== null && thumbRefs[activeThumb].current) {
      thumbRefs[activeThumb].current?.focus();
    } else {
      sliderRef.current?.focus();
    }
  }, [activeThumb, thumbRefs, sliderRef]);

  /**
   * Blur slider
   */
  const blur = useCallback(() => {
    if (activeThumb !== null && thumbRefs[activeThumb].current) {
      thumbRefs[activeThumb].current?.blur();
    } else {
      sliderRef.current?.blur();
    }
  }, [activeThumb, thumbRefs, sliderRef]);

  /**
   * Calculate value from mouse/touch position
   */
  const getValueFromPosition = useCallback((clientX: number, clientY: number): SliderValue => {
    if (!sliderRef.current) return value;

    const rect = sliderRef.current.getBoundingClientRect();
    let percentage: number;

    if (orientation === 'horizontal') {
      percentage = (clientX - rect.left) / rect.width;
    } else {
      percentage = (rect.bottom - clientY) / rect.height;
    }

    percentage = Math.max(0, Math.min(1, percentage));
    const rawValue = min + percentage * (max - min);
    const newValue = roundToStep(rawValue);

    if (isRange && activeThumb !== null) {
      const [val1, val2] = getValueAsNumbers();
      const newValues = [...val1, val2] as [number, number];
      newValues[activeThumb] = newValue;
      return newValues.sort((a, b) => a - b) as [number, number];
    }

    return newValue;
  }, [sliderRef, orientation, min, max, roundToStep, isRange, activeThumb, getValueAsNumbers, value]);

  /**
   * Calculate position (percentage) from value
   */
  const getPositionFromValue = useCallback((val: number): number => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  /**
   * Handle key down events
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled || readOnly) return;

    // Call pressable handler first
    pressable.handlers?.onKeyDown?.(event);

    // Determine which thumb is focused (for range sliders)
    if (isRange && thumbRefs[0].current?.contains(event.target as Node)) {
      setActiveThumb(0);
    } else if (isRange && thumbRefs[1].current?.contains(event.target as Node)) {
      setActiveThumb(1);
    }

    let handled = false;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        decrement();
        handled = true;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        increment();
        handled = true;
        break;
      case 'Home':
        event.preventDefault();
        setToMin();
        handled = true;
        break;
      case 'End':
        event.preventDefault();
        setToMax();
        handled = true;
        break;
      case 'PageDown':
        event.preventDefault();
        decrement(step * 10);
        handled = true;
        break;
      case 'PageUp':
        event.preventDefault();
        increment(step * 10);
        handled = true;
        break;
    }

    if (handled) {
      onValueCommit?.(value);
    }
  }, [disabled, readOnly, pressable.handlers, isRange, thumbRefs, decrement, increment, setToMin, setToMax, step, onValueCommit, value]);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback((event: React.FocusEvent) => {
    focusable.handlers?.onFocus?.(event);
    semantic.handlers?.onFocus?.(event);

    // Determine which thumb is focused
    if (isRange && thumbRefs[0].current?.contains(event.target as Node)) {
      setActiveThumb(0);
    } else if (isRange && thumbRefs[1].current?.contains(event.target as Node)) {
      setActiveThumb(1);
    } else if (!isRange) {
      setActiveThumb(0);
    }
  }, [focusable.handlers, semantic.handlers, isRange, thumbRefs]);

  /**
   * Handle blur events
   */
  const handleBlur = useCallback((event: React.FocusEvent) => {
    focusable.handlers?.onBlur?.(event);
    semantic.handlers?.onBlur?.(event);
    setActiveThumb(null);
  }, [focusable.handlers, semantic.handlers]);

  /**
   * Handle mouse down events
   */
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled || readOnly) return;

    event.preventDefault();
    setDragging(true);

    // Calculate value from click position
    const newValue = getValueFromPosition(event.clientX, event.clientY);
    setValue(newValue);

    // Determine which thumb should be active for range sliders
    if (isRange && Array.isArray(newValue)) {
      const [current1, current2] = getValueAsNumbers();
      const diff1 = Math.abs(newValue[0] - current1);
      const diff2 = Math.abs(newValue[1] - current2);
      setActiveThumb(diff1 < diff2 ? 0 : 1);
    } else {
      setActiveThumb(0);
    }

    focus();
  }, [disabled, readOnly, getValueFromPosition, getValueAsNumbers, isRange, setValue, focus]);

  /**
   * Handle touch start events
   */
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (disabled || readOnly) return;

    event.preventDefault();
    setDragging(true);

    const touch = event.touches[0];
    const newValue = getValueFromPosition(touch.clientX, touch.clientY);
    setValue(newValue);
  }, [disabled, readOnly, getValueFromPosition, setValue]);

  /**
   * Handle mouse enter events
   */
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    pressable.handlers?.onMouseEnter?.(event);
  }, [pressable.handlers]);

  /**
   * Handle mouse leave events
   */
  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    pressable.handlers?.onMouseLeave?.(event);
  }, [pressable.handlers]);

  // Global mouse/touch move and end handlers
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const newValue = getValueFromPosition(clientX, clientY);
      setValue(newValue);
    };

    const handleEnd = () => {
      setDragging(false);
      onValueCommit?.(value);
    };

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      handleMove(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, getValueFromPosition, setValue, onValueCommit, value]);

  // Compose state from mixins
  const composedState = composeState<SliderState>({
    value,
    focused: focusable.state.focused,
    pressed: pressable.state.pressed,
    hovered: pressable.state.hovered,
    disabled,
    readOnly,
    activeThumb,
    dragging
  });

  // Compose handlers from mixins
  const composedHandlers = composeHandlers({
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  });

  // Compose class names
  const composedClassName = composeClasses([
    focusable.className,
    pressable.className,
    semantic.className,
    className
  ]);

  // Compose styles
  const composedStyle = composeStyles([
    focusable.style,
    pressable.style,
    semantic.style,
    style
  ]);

  // Create actions object
  const actions: SliderActions = {
    setValue,
    increment,
    decrement,
    setToMin,
    setToMax,
    focus,
    blur
  };

  // Get current values for aria attributes
  const [val1, val2] = getValueAsNumbers();
  const ariaValueNow = isRange ? undefined : val1;
  const ariaValueText = isRange ? `${val1} to ${val2}` : val1.toString();

  // Create semantic attributes
  const sliderAttributes = {
    role: semantic.attributes.role || 'slider',
    'aria-disabled': disabled,
    'aria-readonly': readOnly,
    'aria-orientation': orientation,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': ariaValueNow,
    'aria-valuetext': ariaValueText
  };

  // Create thumb attributes function
  const getThumbAttributes = (index: number) => ({
    role: 'slider',
    tabIndex: disabled ? -1 : 0,
    'aria-valuemin': isRange && index === 1 ? val1 : min,
    'aria-valuemax': isRange && index === 0 ? val2 : max,
    'aria-valuenow': isRange ? (index === 0 ? val1 : val2) : val1,
    'aria-valuetext': isRange ? (index === 0 ? val1.toString() : val2.toString()) : val1.toString(),
    'aria-label': isRange ? (index === 0 ? 'Minimum value' : 'Maximum value') : undefined,
    'aria-orientation': orientation
  });

  // Create form attributes
  const formAttributes = {
    type: 'range',
    value: isRange ? `${val1},${val2}` : val1.toString()
  };

  return {
    state: composedState,
    actions,
    handlers: composedHandlers,
    sliderAttributes,
    getThumbAttributes,
    formAttributes,
    className: composedClassName,
    sliderRef,
    thumbRefs,
    getValueFromPosition,
    getPositionFromValue
  };
};