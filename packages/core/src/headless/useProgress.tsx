/**
 * Progress headless hook using Flutter-inspired patterns.
 * Provides behavior for progress indicators with determinate and indeterminate modes.
 * Composes behavior mixins for comprehensive functionality.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ComponentContract } from '../contracts/ComponentContract';
import type { SemanticContract } from '../contracts/SemanticContract';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import { useSemanticMixin } from '../mixins/SemanticMixin';

/**
 * Progress value type - can be determinate (number) or indeterminate (null)
 */
export type ProgressValue = number | null;

/**
 * Progress mode variants
 */
export type ProgressMode = 'determinate' | 'indeterminate';

/**
 * Progress orientation
 */
export type ProgressOrientation = 'horizontal' | 'vertical';

/**
 * Hook configuration properties following Flutter component patterns
 */
export interface UseProgressProps {
  /** Current progress value (0-100 for determinate, null for indeterminate) */
  value?: ProgressValue;
  /** Default progress value */
  defaultValue?: ProgressValue;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Progress mode */
  mode?: ProgressMode;
  /** Orientation of the progress bar */
  orientation?: ProgressOrientation;
  /** Whether progress is animated */
  animated?: boolean;
  /** Whether progress shows percentage label */
  showLabel?: boolean;
  /** Whether progress is reversed (right-to-left or bottom-to-top) */
  reversed?: boolean;
  /** Custom step size for animations */
  step?: number;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Accessibility label */
  ariaLabel?: string;
  /** Accessibility value text */
  ariaValueText?: string;
  /** Whether progress is disabled */
  disabled?: boolean;
  /** Callback when value changes */
  onValueChange?: (value: ProgressValue) => void;
  /** External ref for the progress element */
  progressRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Progress hook return value with comprehensive API
 */
export interface ProgressReturns {
  /** Current progress state */
  state: {
    /** Current progress value */
    value: ProgressValue;
    /** Current progress mode */
    mode: ProgressMode;
    /** Current progress percentage (0-100) */
    percentage: number;
    /** Whether progress is complete */
    isComplete: boolean;
    /** Whether progress is indeterminate */
    isIndeterminate: boolean;
    /** Whether progress is animated */
    animated: boolean;
    /** Whether progress is disabled */
    disabled: boolean;
    /** Whether progress has focus */
    focused: boolean;
    /** Whether progress is hovered */
    hovered: boolean;
  };

  /** Progress configuration */
  config: {
    /** Minimum value */
    min: number;
    /** Maximum value */
    max: number;
    /** Current orientation */
    orientation: ProgressOrientation;
    /** Whether progress is reversed */
    reversed: boolean;
    /** Whether to show label */
    showLabel: boolean;
    /** Animation step size */
    step: number;
    /** Animation duration */
    animationDuration: number;
  };

  /** Event handlers */
  handlers: {
    /** Focus handler */
    onFocus: (event: React.FocusEvent) => void;
    /** Blur handler */
    onBlur: (event: React.FocusEvent) => void;
    /** Mouse enter handler */
    onMouseEnter: (event: React.MouseEvent) => void;
    /** Mouse leave handler */
    onMouseLeave: (event: React.MouseEvent) => void;
    /** Key down handler */
    onKeyDown: (event: React.KeyboardEvent) => void;
  };

  /** Actions for controlling progress */
  actions: {
    /** Set progress value */
    setValue: (value: ProgressValue) => void;
    /** Reset to default value */
    reset: () => void;
    /** Start indeterminate progress */
    startIndeterminate: () => void;
    /** Stop indeterminate progress */
    stopIndeterminate: () => void;
    /** Increment progress by step */
    increment: (step?: number) => void;
    /** Decrement progress by step */
    decrement: (step?: number) => void;
    /** Set progress to minimum */
    setToMin: () => void;
    /** Set progress to maximum */
    setToMax: () => void;
  };

  /** Utility functions */
  utils: {
    /** Convert value to percentage */
    valueToPercentage: (value: number) => number;
    /** Convert percentage to value */
    percentageToValue: (percentage: number) => number;
    /** Check if value is within bounds */
    isValueValid: (value: number) => boolean;
    /** Clamp value to min/max bounds */
    clampValue: (value: number) => number;
    /** Format value for display */
    formatValue: (value: ProgressValue) => string;
  };

  /** References */
  progressRef: React.RefObject<HTMLDivElement>;

  /** Computed attributes for rendering */
  progressAttributes: Record<string, any>;

  /** Form attributes for accessibility */
  formAttributes: Record<string, any>;
}

/**
 * Headless progress hook using Flutter-inspired composition patterns.
 * Composes behavior mixins to provide comprehensive progress functionality.
 *
 * @param props - Progress configuration properties
 * @returns Complete progress API with state, handlers, actions, and utilities
 */
export const useProgress = (props: UseProgressProps = {}): ProgressReturns => {
  // Destructure props with defaults
  const {
    value: controlledValue,
    defaultValue = 0,
    min = 0,
    max = 100,
    mode: propMode,
    orientation = 'horizontal',
    animated = true,
    showLabel = false,
    reversed = false,
    step = 1,
    animationDuration = 300,
    ariaLabel,
    ariaValueText,
    disabled = false,
    onValueChange,
    progressRef: externalRef
  } = props;

  // Internal state management
  const [internalValue, setInternalValue] = useState<ProgressValue>(defaultValue);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [animationValue, setAnimationValue] = useState(0);

  // Refs
  const internalRef = useRef<HTMLDivElement>(null);
  const progressRef = externalRef || internalRef;
  const animationRef = useRef<number>();

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Determine mode based on value
  const mode = propMode || (currentValue === null ? 'indeterminate' : 'determinate');

  // Focusable mixin for keyboard accessibility
  const focusable = useFocusableMixin({
    disabled,
    onFocus: (event) => {
      setFocused(true);
      props.onFocus?.(event);
    },
    onBlur: (event) => {
      setFocused(false);
      props.onBlur?.(event);
    }
  });

  // Semantic mixin for accessibility
  const semantic = useSemanticMixin({
    role: 'progressbar',
    ariaLabel,
    ariaValueText: ariaValueText || (currentValue !== null ? `${Math.round((currentValue - min) / (max - min) * 100)}%` : undefined),
    disabled
  });

  // Calculate percentage
  const percentage = currentValue !== null
    ? Math.max(0, Math.min(100, ((currentValue - min) / (max - min)) * 100))
    : 0;

  // Check if progress is complete
  const isComplete = currentValue !== null && currentValue >= max;

  // Check if progress is indeterminate
  const isIndeterminate = mode === 'indeterminate';

  // Animation for indeterminate progress
  useEffect(() => {
    if (isIndeterminate && animated && !disabled) {
      const animate = () => {
        setAnimationValue(prev => (prev >= 100 ? 0 : prev + 2));
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAnimationValue(0);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isIndeterminate, animated, disabled]);

  // Value validation and clamping
  const clampValue = useCallback((value: number): number => {
    return Math.max(min, Math.min(max, value));
  }, [min, max]);

  const isValueValid = useCallback((value: number): boolean => {
    return value >= min && value <= max;
  }, [min, max]);

  // Utility functions
  const valueToPercentage = useCallback((value: number): number => {
    return ((value - min) / (max - min)) * 100;
  }, [min, max]);

  const percentageToValue = useCallback((percentage: number): number => {
    return min + (percentage / 100) * (max - min);
  }, [min, max]);

  const formatValue = useCallback((value: ProgressValue): string => {
    if (value === null) return 'Indeterminate';
    return `${Math.round(value)}`;
  }, []);

  // Actions
  const setValue = useCallback((newValue: ProgressValue) => {
    if (disabled) return;

    if (newValue === null) {
      // Switch to indeterminate mode
      if (!isControlled) {
        setInternalValue(null);
      }
      onValueChange?.(null);
    } else {
      // Clamp value for determinate mode
      const clampedValue = clampValue(newValue);
      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onValueChange?.(clampedValue);
    }
  }, [disabled, isControlled, clampValue, onValueChange]);

  const reset = useCallback(() => {
    setValue(defaultValue);
  }, [setValue, defaultValue]);

  const startIndeterminate = useCallback(() => {
    setValue(null);
  }, [setValue]);

  const stopIndeterminate = useCallback(() => {
    setValue(defaultValue);
  }, [setValue, defaultValue]);

  const increment = useCallback((incrementStep?: number) => {
    if (disabled || isIndeterminate) return;

    const currentVal = currentValue as number;
    const newStep = incrementStep !== undefined ? incrementStep : step;
    setValue(currentVal + newStep);
  }, [disabled, isIndeterminate, currentValue, step, setValue]);

  const decrement = useCallback((decrementStep?: number) => {
    if (disabled || isIndeterminate) return;

    const currentVal = currentValue as number;
    const newStep = decrementStep !== undefined ? decrementStep : step;
    setValue(currentVal - newStep);
  }, [disabled, isIndeterminate, currentValue, step, setValue]);

  const setToMin = useCallback(() => {
    if (disabled || isIndeterminate) return;
    setValue(min);
  }, [disabled, isIndeterminate, min, setValue]);

  const setToMax = useCallback(() => {
    if (disabled || isIndeterminate) return;
    setValue(max);
  }, [disabled, isIndeterminate, max, setValue]);

  // Event handlers
  const handlers = {
    onFocus: (event: React.FocusEvent) => {
      focusable.onFocus(event);
    },
    onBlur: (event: React.FocusEvent) => {
      focusable.onBlur(event);
    },
    onMouseEnter: (event: React.MouseEvent) => {
      setHovered(true);
    },
    onMouseLeave: (event: React.MouseEvent) => {
      setHovered(false);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          increment();
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          decrement();
          break;
        case 'Home':
          event.preventDefault();
          setToMin();
          break;
        case 'End':
          event.preventDefault();
          setToMax();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          if (isIndeterminate) {
            stopIndeterminate();
          } else {
            startIndeterminate();
          }
          break;
      }
    }
  };

  // Computed attributes
  const progressAttributes = {
    ...semantic.semanticAttributes,
    'aria-valuenow': isIndeterminate ? undefined : currentValue,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'data-mode': mode,
    'data-orientation': orientation,
    'data-reversed': reversed,
    'data-animated': animated,
    'data-complete': isComplete,
    tabIndex: disabled ? undefined : 0,
    style: {
      // Custom properties for CSS styling
      '--progress-value': isIndeterminate ? animationValue : percentage,
      '--progress-min': min,
      '--progress-max': max,
      '--progress-step': step,
      '--progress-duration': `${animationDuration}ms`
    } as React.CSSProperties
  };

  // Form attributes
  const formAttributes = {
    'data-value': currentValue,
    'data-percentage': percentage,
    'data-mode': mode,
    'data-complete': isComplete,
    'data-disabled': disabled
  };

  return {
    state: {
      value: currentValue,
      mode,
      percentage,
      isComplete,
      isIndeterminate,
      animated,
      disabled,
      focused,
      hovered
    },
    config: {
      min,
      max,
      orientation,
      reversed,
      showLabel,
      step,
      animationDuration
    },
    handlers,
    actions: {
      setValue,
      reset,
      startIndeterminate,
      stopIndeterminate,
      increment,
      decrement,
      setToMin,
      setToMax
    },
    utils: {
      valueToPercentage,
      percentageToValue,
      isValueValid,
      clampValue,
      formatValue
    },
    progressRef,
    progressAttributes,
    formAttributes
  };
};