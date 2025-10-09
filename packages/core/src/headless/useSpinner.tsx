/**
 * useSpinner hook for React UI Forge.
 * Provides comprehensive loading state management with accessibility support.
 *
 * Features:
 * - Loading state management with multiple modes
 * - Keyboard navigation support
 * - Accessibility attributes
 * - Animation control
 * - Size and speed variants
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseSpinnerProps {
  /** Whether spinner is currently active/visible */
  active?: boolean;
  /** Default active state */
  defaultActive?: boolean;
  /** Change handler for active state */
  onActiveChange?: (active: boolean) => void;
  /** Whether spinner is disabled */
  disabled?: boolean;
  /** Spinner size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Spinner variant/animation type */
  variant?: 'pulse' | 'spin' | 'bounce' | 'dots' | 'bars' | 'ring';
  /** Custom label for accessibility */
  label?: string;
  /** Whether to show label */
  showLabel?: boolean;
  /** Custom duration for animation in milliseconds */
  duration?: number;
  /** Ref to the spinner element */
  spinnerRef?: React.RefObject<HTMLDivElement>;
  /** Additional CSS classes */
  className?: string;
  /** Theme configuration */
  theme?: {
    color?: string;
    backgroundColor?: string;
    trackColor?: string;
  };
}

export interface SpinnerValue {
  /** Current loading state */
  active: boolean;
  /** Whether spinner is currently animating */
  animating: boolean;
  /** Current animation frame (for advanced effects) */
  frame: number;
  /** Progress percentage for advanced variants */
  progress: number;
  /** Time elapsed in milliseconds */
  elapsed: number;
}

export interface SpinnerReturns {
  /** Current spinner state */
  state: SpinnerValue;
  /** Configuration options */
  config: Required<Omit<UseSpinnerProps, 'spinnerRef' | 'onActiveChange'>>;
  /** Event handlers */
  handlers: {
    /** Focus handler */
    onFocus: (event: React.FocusEvent) => void;
    /** Blur handler */
    onBlur: (event: React.FocusEvent) => void;
    /** Key down handler */
    onKeyDown: (event: React.KeyboardEvent) => void;
    /** Mouse enter handler */
    onMouseEnter: (event: React.MouseEvent) => void;
    /** Mouse leave handler */
    onMouseLeave: (event: React.MouseEvent) => void;
  };
  /** Actions */
  actions: {
    /** Start spinning */
    start: () => void;
    /** Stop spinning */
    stop: () => void;
    /** Toggle spinner state */
    toggle: () => void;
    /** Reset spinner to initial state */
    reset: () => void;
    /** Set custom speed */
    setSpeed: (speed: UseSpinnerProps['speed']) => void;
    /** Set variant */
    setVariant: (variant: UseSpinnerProps['variant']) => void;
    /** Set size */
    setSize: (size: UseSpinnerProps['size']) => void;
  };
  /** Utility functions */
  utils: {
    /** Format label text */
    formatLabel: (active: boolean, customLabel?: string) => string;
    /** Get animation duration */
    getDuration: (speed: UseSpinnerProps['speed'], customDuration?: number) => number;
    /** Check if animation should be active */
    shouldAnimate: (active: boolean, disabled: boolean) => boolean;
    /** Get current timestamp */
    getTimestamp: () => number;
  };
  /** Accessibility helpers */
  ariaAttributes: {
    'aria-label': string;
    'aria-busy': boolean;
    'aria-live': 'polite' | 'off';
    'role': 'progressbar' | 'img';
    'aria-valuemin'?: number;
    'aria-valuemax'?: number;
    'aria-valuenow'?: number;
    'aria-describedby'?: string;
  };
  /** Form attributes */
  formAttributes: Record<string, any>;
  /** Ref to the spinner element */
  spinnerRef: React.RefObject<HTMLDivElement>;
  /** Ref to the label element */
  labelRef: React.RefObject<HTMLDivElement>;
}

/**
 * Enhanced useState hook with better type safety and validation
 */
const useSpinnerState = <T>(initialValue: T, validator?: (value: T) => boolean) => {
  const [state, setState] = useState(initialValue);

  const setValidatedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      return validator && !validator(newValue) ? prevState : newValue;
    });
  }, [validator]);

  return [state, setValidatedState] as const;
};

/**
 * Hook for managing focus state with keyboard navigation
 */
const useFocusState = (disabled: boolean = false) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (!disabled) {
      setFocused(true);
    }
  }, [disabled]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    if (!disabled) {
      setFocused(false);
    }
  }, [disabled]);

  return {
    focused,
    setFocused,
    onFocus: handleFocus,
    onBlur: handleBlur
  };
};

/**
 * Hook for managing hover state
 */
const useHoverState = (disabled: boolean = false) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (!disabled) {
      setHovered(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    if (!disabled) {
      setHovered(false);
    }
  }, [disabled]);

  return {
    hovered,
    setHovered,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  };
};

/**
 * Hook for managing animation state and timing
 */
const useAnimationState = (
  active: boolean,
  speed: UseSpinnerProps['speed'] = 'normal',
  customDuration?: number
) => {
  const [frame, setFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>();
  const animationRef = useRef<number>();
  const previousActiveRef = useRef(active);

  const getDuration = useCallback((speedValue: UseSpinnerProps['speed'], customValue?: number) => {
    if (customValue) return customValue;

    switch (speedValue) {
      case 'slow': return 2000;
      case 'fast': return 800;
      case 'normal': return 1200;
      default: return 1200;
    }
  }, []);

  useEffect(() => {
    const duration = getDuration(speed, customDuration);

    if (active && !previousActiveRef.current) {
      // Spinner just started
      startTimeRef.current = Date.now();
      setElapsed(0);
      setFrame(0);

      const animate = () => {
        if (startTimeRef.current) {
          const currentElapsed = Date.now() - startTimeRef.current;
          setElapsed(currentElapsed);
          setFrame(Math.floor((currentElapsed % duration) / 100)); // Update frame every 100ms
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else if (!active && previousActiveRef.current) {
      // Spinner just stopped
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setElapsed(0);
      setFrame(0);
    }

    previousActiveRef.current = active;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, speed, customDuration, getDuration]);

  return {
    frame,
    elapsed,
    getDuration
  };
};

/**
 * Main spinner hook with comprehensive loading state management
 */
export const useSpinner = (props: UseSpinnerProps = {}): SpinnerReturns => {
  const {
    active: controlledActive,
    defaultActive = false,
    onActiveChange,
    disabled = false,
    size = 'md',
    speed = 'normal',
    variant = 'spin',
    label = 'Loading',
    showLabel = true,
    duration: customDuration,
    spinnerRef: externalRef,
    className = '',
    theme = {}
  } = props;

  // Internal refs
  const internalRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Resolve refs
  const spinnerRef = externalRef || internalRef;

  // State management
  const [active, setActive] = useSpinnerState(defaultActive, (value) => typeof value === 'boolean');
  const [progress, setProgress] = useState(0);

  // Focus and hover states
  const { focused, onFocus, onBlur } = useFocusState(disabled);
  const { hovered, onMouseEnter, onMouseLeave } = useHoverState(disabled);

  // Animation state
  const { frame, elapsed, getDuration } = useAnimationState(active, speed, customDuration);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledActive !== undefined;
  const currentActive = isControlled ? controlledActive : active;

  // Calculate progress for advanced variants
  useEffect(() => {
    if (currentActive && variant !== 'spin' && variant !== 'pulse') {
      const duration = getDuration(speed, customDuration);
      const newProgress = Math.min((elapsed % duration) / duration * 100, 100);
      setProgress(newProgress);
    } else {
      setProgress(currentActive ? 100 : 0);
    }
  }, [currentActive, elapsed, variant, speed, customDuration, getDuration]);

  // Actions
  const actions = {
    start: useCallback(() => {
      if (!isControlled) {
        setActive(true);
      }
      onActiveChange?.(true);
    }, [isControlled, setActive, onActiveChange]),

    stop: useCallback(() => {
      if (!isControlled) {
        setActive(false);
      }
      onActiveChange?.(false);
    }, [isControlled, setActive, onActiveChange]),

    toggle: useCallback(() => {
      const newActive = !currentActive;
      if (!isControlled) {
        setActive(newActive);
      }
      onActiveChange?.(newActive);
    }, [isControlled, currentActive, setActive, onActiveChange]),

    reset: useCallback(() => {
      if (!isControlled) {
        setActive(defaultActive);
      }
      setProgress(0);
      onActiveChange?.(defaultActive);
    }, [isControlled, defaultActive, setActive, onActiveChange]),

    setSpeed: useCallback((newSpeed: UseSpinnerProps['speed']) => {
      // Speed change would be handled by parent component
      // This is for API completeness
    }, []),

    setVariant: useCallback((newVariant: UseSpinnerProps['variant']) => {
      // Variant change would be handled by parent component
      // This is for API completeness
    }, []),

    setSize: useCallback((newSize: UseSpinnerProps['size']) => {
      // Size change would be handled by parent component
      // This is for API completeness
    }, [])
  };

  // Utility functions
  const utils = {
    formatLabel: useCallback((isActive: boolean, customLabel?: string) => {
      if (customLabel) return customLabel;
      return isActive ? label : 'Idle';
    }, [label]),

    getDuration,

    shouldAnimate: useCallback((isActive: boolean, isDisabled: boolean) => {
      return isActive && !isDisabled;
    }, []),

    getTimestamp: useCallback(() => Date.now(), [])
  };

  // Accessibility attributes
  const ariaAttributes = {
    'aria-label': utils.formatLabel(currentActive, label),
    'aria-busy': currentActive,
    'aria-live': currentActive ? 'polite' : 'off' as const,
    'role': variant === 'ring' ? 'progressbar' as const : 'img' as const,
    ...(variant === 'ring' && currentActive ? {
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': Math.round(progress)
    } : {})
  };

  // Form attributes
  const formAttributes = {
    'data-active': currentActive,
    'data-disabled': disabled,
    'data-size': size,
    'data-speed': speed,
    'data-variant': variant,
    'data-frame': frame,
    'data-progress': Math.round(progress)
  };

  // Keyboard handler
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        actions.toggle();
        break;
      case 'Escape':
        event.preventDefault();
        actions.stop();
        break;
      default:
        break;
    }
  }, [disabled, actions]);

  // Update current active state for external changes
  useEffect(() => {
    if (isControlled) {
      setActive(controlledActive);
    }
  }, [controlledActive, isControlled, setActive]);

  return {
    state: {
      active: currentActive,
      animating: utils.shouldAnimate(currentActive, disabled),
      frame,
      progress,
      elapsed
    },
    config: {
      active: controlledActive || defaultActive,
      defaultActive,
      disabled,
      size,
      speed,
      variant,
      label,
      showLabel,
      duration: customDuration || getDuration(speed),
      className,
      theme: {
        color: theme.color || 'current',
        backgroundColor: theme.backgroundColor || 'transparent',
        trackColor: theme.trackColor || 'gray'
      }
    },
    handlers: {
      onFocus,
      onBlur,
      onKeyDown,
      onMouseEnter,
      onMouseLeave
    },
    actions,
    utils,
    ariaAttributes,
    formAttributes,
    spinnerRef,
    labelRef
  };
};