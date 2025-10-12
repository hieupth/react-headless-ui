/**
 * FadeInOut headless hook for React UI Forge components.
 * Provides fade in/out animation behavior following Flutter patterns.
 * Manages animation states, timing, and accessibility considerations.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Fade animation direction options
 */
export type FadeDirection = 'in' | 'out' | 'in-out' | 'out-in';

/**
 * Fade animation trigger options
 */
export type FadeTrigger = 'immediate' | 'on-mount' | 'on-hover' | 'on-click' | 'manual';

/**
 * Fade animation state interface
 */
export interface FadeInOutState {
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Whether element is currently visible */
  isVisible: boolean;
  /** Current opacity value (0-1) */
  opacity: number;
  /** Current animation direction */
  direction: FadeDirection;
  /** Animation completion status */
  isComplete: boolean;
}

/**
 * FadeInOut actions interface
 */
export interface FadeInOutActions {
  /** Start fade in animation */
  fadeIn: () => void;
  /** Start fade out animation */
  fadeOut: () => void;
  /** Toggle fade direction */
  toggle: () => void;
  /** Reset animation to initial state */
  reset: () => void;
  /** Set animation state manually */
  setVisible: (visible: boolean) => void;
  /** Stop current animation */
  stop: () => void;
}

/**
 * Props for useFadeInOut hook
 */
export interface UseFadeInOutProps {
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Fade direction type */
  direction?: FadeDirection;
  /** Animation trigger type */
  trigger?: FadeTrigger;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Easing function name */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Initial opacity value */
  initialOpacity?: number;
  /** Final opacity value */
  finalOpacity?: number;
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
  /** Callback when animation starts */
  onAnimationStart?: (direction: FadeDirection) => void;
  /** Callback when animation completes */
  onAnimationComplete?: (visible: boolean) => void;
  /** Callback when opacity changes */
  onOpacityChange?: (opacity: number) => void;
}

/**
 * Return type for useFadeInOut hook
 */
export interface UseFadeInOutReturns {
  /** Current fade state */
  state: FadeInOutState;
  /** Fade actions */
  actions: FadeInOutActions;
  /** Computed properties */
  computed: {
    /** CSS opacity value */
    cssOpacity: number;
    /** CSS transition property */
    cssTransition: string;
    /** Whether component should be rendered */
    shouldRender: boolean;
    /** ARIA live region state */
    ariaLive: 'polite' | 'off';
  };
  /** Component style object */
  style: React.CSSProperties;
  /** Component attributes */
  attributes: {
    'aria-hidden': boolean;
    'aria-live': 'polite' | 'off';
    role: string;
  };
}

/**
 * FadeInOut hook implementation
 * @param props - FadeInOut configuration props
 * @returns FadeInOut state, actions, computed properties, style, and attributes
 */
export function useFadeInOut(props: UseFadeInOutProps = {}): UseFadeInOutReturns {
  const {
    initialVisible = false,
    duration = 300,
    direction: initialDirection = 'in',
    trigger = 'immediate',
    delay = 0,
    easing = 'ease-in-out',
    initialOpacity = 0,
    finalOpacity = 1,
    respectReducedMotion = true,
    onAnimationStart,
    onAnimationComplete,
    onOpacityChange
  } = props;

  // State management
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentOpacity, setCurrentOpacity] = useState(
    initialVisible ? finalOpacity : initialOpacity
  );
  const [currentDirection, setCurrentDirection] = useState(initialDirection);
  const [isComplete, setIsComplete] = useState(false);

  // Refs for animation management
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Calculate effective duration (0 if reduced motion)
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  // Easing functions
  const easingFunctions = {
    'linear': (t: number) => t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };

  // Get opacity values based on direction
  const getOpacityValues = useCallback((dir: FadeDirection, visible: boolean) => {
    switch (dir) {
      case 'in':
        return { from: initialOpacity, to: finalOpacity };
      case 'out':
        return { from: finalOpacity, to: initialOpacity };
      case 'in-out':
        return visible ? { from: initialOpacity, to: finalOpacity } : { from: finalOpacity, to: initialOpacity };
      case 'out-in':
        return visible ? { from: finalOpacity, to: initialOpacity } : { from: initialOpacity, to: finalOpacity };
      default:
        return { from: initialOpacity, to: finalOpacity };
    }
  }, [initialOpacity, finalOpacity]);

  // Animation function
  const animate = useCallback((targetVisible: boolean, dir: FadeDirection) => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const { from, to } = getOpacityValues(dir, targetVisible);

    // If reduced motion or no duration, jump to end state
    if (effectiveDuration === 0) {
      setCurrentOpacity(to);
      setIsVisible(targetVisible);
      setIsAnimating(false);
      setIsComplete(true);
      onAnimationStart?.(dir);
      onAnimationComplete?.(targetVisible);
      onOpacityChange?.(to);
      return;
    }

    setIsAnimating(true);
    setIsComplete(false);
    setCurrentDirection(dir);
    onAnimationStart?.(dir);

    const startAnimation = () => {
      startTimeRef.current = performance.now();

      const animationStep = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;

        if (elapsed < delay) {
          // Still in delay period
          animationRef.current = requestAnimationFrame(animationStep);
          return;
        }

        const adjustedElapsed = elapsed - delay;
        const progress = Math.min(adjustedElapsed / effectiveDuration, 1);

        // Apply easing function
        const easedProgress = easingFunctions[easing](progress);

        // Calculate current opacity
        const newOpacity = from + (to - from) * easedProgress;
        setCurrentOpacity(newOpacity);
        onOpacityChange?.(newOpacity);

        if (progress < 1) {
          // Continue animation
          animationRef.current = requestAnimationFrame(animationStep);
        } else {
          // Animation complete
          setCurrentOpacity(to);
          setIsVisible(targetVisible);
          setIsAnimating(false);
          setIsComplete(true);
          onAnimationComplete?.(targetVisible);
        }
      };

      animationRef.current = requestAnimationFrame(animationStep);
    };

    startAnimation();
  }, [effectiveDuration, delay, easing, getOpacityValues, onAnimationStart, onAnimationComplete, onOpacityChange]);

  // Actions
  const actions = useMemo(() => ({
    fadeIn: () => {
      if (!isVisible) {
        animate(true, 'in');
      }
    },

    fadeOut: () => {
      if (isVisible) {
        animate(false, 'out');
      }
    },

    toggle: () => {
      animate(!isVisible, currentDirection);
    },

    reset: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsVisible(initialVisible);
      setCurrentOpacity(initialVisible ? finalOpacity : initialOpacity);
      setIsAnimating(false);
      setIsComplete(false);
      setCurrentDirection(initialDirection);
    },

    setVisible: (visible: boolean) => {
      if (visible !== isVisible) {
        animate(visible, currentDirection);
      }
    },

    stop: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        setIsAnimating(false);
      }
    }
  }), [animate, isVisible, currentDirection, initialVisible, finalOpacity, initialOpacity, initialDirection]);

  // Handle trigger effects
  useEffect(() => {
    switch (trigger) {
      case 'immediate':
        if (initialVisible) {
          animate(true, initialDirection);
        }
        break;
      case 'on-mount':
        // Small delay to ensure component is mounted
        const timer = setTimeout(() => {
          animate(true, initialDirection);
        }, 50);
        return () => clearTimeout(timer);
    }
  }, [trigger, initialVisible, initialDirection, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Build state
  const state: FadeInOutState = {
    isAnimating,
    isVisible,
    opacity: currentOpacity,
    direction: currentDirection,
    isComplete
  };

  // Computed properties
  const computed = useMemo(() => {
    const cssTransition = effectiveDuration > 0
      ? `opacity ${effectiveDuration}ms ${easing} ${delay}ms`
      : 'none';

    return {
      cssOpacity: currentOpacity,
      cssTransition,
      shouldRender: effectiveDuration === 0 || currentOpacity > 0 || isAnimating,
      ariaLive: isAnimating ? 'polite' : 'off'
    };
  }, [currentOpacity, effectiveDuration, easing, delay, isAnimating]);

  // Build style object
  const style: React.CSSProperties = {
    opacity: currentOpacity,
    transition: computed.cssTransition,
    willChange: isAnimating ? 'opacity' : 'auto'
  };

  // Build attributes
  const attributes = {
    'aria-hidden': !isVisible,
    'aria-live': computed.ariaLive,
    role: 'group' as const
  };

  return {
    state,
    actions,
    computed,
    style,
    attributes
  };
}