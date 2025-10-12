/**
 * ScaleInOut headless hook for React UI Forge components.
 * Provides scale animation behavior following Flutter patterns.
 * Manages scale states, timing, and accessibility considerations.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Scale animation state interface
 */
export interface ScaleInOutState {
  /** Whether scale animation is currently active */
  isActive: boolean;
  /** Current animation iteration count */
  iteration: number;
  /** Whether animation is paused */
  isPaused: boolean;
  /** Animation completion status */
  isComplete: boolean;
}

/**
 * Scale actions interface
 */
export interface ScaleInOutActions {
  /** Start scale animation */
  start: () => void;
  /** Stop scale animation */
  stop: () => void;
  /** Pause scale animation */
  pause: () => void;
  /** Resume scale animation */
  resume: () => void;
  /** Reset animation to initial state */
  reset: () => void;
  /** Set scale state manually */
  setActive: (active: boolean) => void;
}

/**
 * Props for useScaleInOut hook
 */
export interface UseScaleInOutProps {
  /** Initial active state */
  initialActive?: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Number of times to repeat (infinite if 0) */
  repeat?: number;
  /** Delay between animations in milliseconds */
  delay?: number;
  /** Initial scale value */
  initialScale?: number;
  /** Final scale value */
  finalScale?: number;
  /** Scale origin point */
  origin?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
  /** Callback when animation starts */
  onAnimationStart?: () => void;
  /** Callback when animation completes */
  onAnimationComplete?: (iterations: number) => void;
  /** Callback when animation repeats */
  onRepeat?: (iteration: number) => void;
  /** Callback when state changes */
  onStateChange?: (isActive: boolean) => void;
}

/**
 * Return type for useScaleInOut hook
 */
export interface UseScaleInOutReturns {
  /** Current scale state */
  state: ScaleInOutState;
  /** Scale actions */
  actions: ScaleInOutActions;
  /** Computed properties */
  computed: {
    /** Current scale value */
    scale: number;
    /** Current opacity value */
    opacity: number;
    /** CSS transform value */
    cssTransform: string;
    /** CSS transform-origin value */
    cssTransformOrigin: string;
    /** CSS transition property */
    cssTransition: string;
    /** Whether animation should render */
    shouldRender: boolean;
  };
  /** Component style object */
  style: React.CSSProperties;
  /** Component attributes */
  attributes: {
    'aria-live': 'polite' | 'off';
    role: string;
  };
}

/**
 * ScaleInOut hook implementation
 * @param props - ScaleInOut configuration props
 * @returns ScaleInOut state, actions, computed properties, style, and attributes
 */
export function useScaleInOut(props: UseScaleInOutProps = {}): UseScaleInOutReturns {
  const {
    initialActive = false,
    duration = 300,
    repeat = 0, // 0 = infinite
    delay = 0,
    initialScale = 0.8,
    finalScale = 1,
    origin = 'center',
    respectReducedMotion = true,
    onAnimationStart,
    onAnimationComplete,
    onRepeat,
    onStateChange
  } = props;

  // State management
  const [isActive, setIsActive] = useState(initialActive);
  const [isPaused, setIsPaused] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Refs for animation management
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastScaleRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Calculate effective duration (0 if reduced motion)
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  // Get transform origin CSS value
  const getTransformOrigin = useCallback(() => {
    switch (origin) {
      case 'top-left':
        return 'top left';
      case 'top-right':
        return 'top right';
      case 'bottom-left':
        return 'bottom left';
      case 'bottom-right':
        return 'bottom right';
      case 'center':
      default:
        return 'center';
    }
  }, [origin]);

  // Animation function
  const animate = useCallback(() => {
    if (effectiveDuration === 0) {
      setIsActive(false);
      setIsComplete(true);
      onAnimationComplete?.(0);
      return;
    }

    setIsActive(true);
    setIsComplete(false);
    onAnimationStart?.();
    onStateChange?.(true);

    const startAnimation = () => {
      startTimeRef.current = performance.now();
      lastScaleRef.current = startTimeRef.current;

      const animationStep = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;

        if (elapsed < delay) {
          // Still in initial delay
          animationRef.current = requestAnimationFrame(animationStep);
          return;
        }

        const adjustedElapsed = elapsed - delay;
        const currentIteration = Math.floor(adjustedElapsed / effectiveDuration);
        const progress = (adjustedElapsed % effectiveDuration) / effectiveDuration;

        // Check if we should stop
        if (repeat > 0 && currentIteration >= repeat) {
          setIsActive(false);
          setIsComplete(true);
          onAnimationComplete?.(Math.min(currentIteration, repeat));
          onStateChange?.(false);
          return;
        }

        // Handle repeat callback
        if (currentIteration > iteration && currentIteration <= repeat) {
          setIteration(currentIteration);
          onRepeat?.(currentIteration);
        }

        // Continue animation
        if (!isPaused) {
          animationRef.current = requestAnimationFrame(animationStep);
        } else {
          // Animation is paused
          return;
        }
      };

      animationRef.current = requestAnimationFrame(animationStep);
    };

    startAnimation();
  }, [effectiveDuration, delay, repeat, initialScale, finalScale, onAnimationStart, onAnimationComplete, onRepeat, onStateChange, isPaused, iteration]);

  // Actions
  const actions = {
    start: () => {
      if (!isActive) {
        animate();
      }
    },

    stop: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsActive(false);
      setIsComplete(true);
      onStateChange?.(false);
    },

    pause: () => {
      setIsPaused(true);
    },

    resume: () => {
      if (isPaused) {
        setIsPaused(false);
        if (isActive && !isComplete) {
          animate();
        }
      }
    },

    reset: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsActive(initialActive);
      setIsPaused(false);
      setIteration(0);
      setIsComplete(false);
    },

    setActive: (active: boolean) => {
      if (active !== isActive) {
        if (active) {
          animate();
        } else {
          actions.stop();
        }
      }
    }
  };

  // Handle initial animation
  useEffect(() => {
    if (initialActive) {
      animate();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Build state
  const state: ScaleInOutState = {
    isActive,
    iteration,
    isPaused,
    isComplete
  };

  // Computed properties
  const computed = {
    get scale() {
      if (!isActive || effectiveDuration === 0) {
        return finalScale;
      }

      const currentTime = performance.now();
      const elapsed = (currentTime - lastScaleRef.current) % effectiveDuration;
      const progress = Math.min(elapsed / effectiveDuration, 1);

      // Easing function (ease-out cubic)
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      return initialScale + (finalScale - initialScale) * easedProgress;
    },

    get opacity() {
      if (!isActive || effectiveDuration === 0) {
        return 1;
      }

      const currentTime = performance.now();
      const elapsed = (currentTime - lastScaleRef.current) % effectiveDuration;
      const progress = Math.min(elapsed / effectiveDuration, 1);

      // Fade in with scale
      return Math.min(progress * 1.5, 1);
    },

    get cssTransform() {
      return `scale(${this.scale})`;
    },

    get cssTransformOrigin() {
      return getTransformOrigin();
    },

    get cssTransition() {
      return effectiveDuration > 0
        ? `transform ${effectiveDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${effectiveDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        : 'none';
    },

    get shouldRender() {
      return true; // ScaleInOut components always render
    }
  };

  // Build style object
  const style: React.CSSProperties = {
    transform: computed.cssTransform,
    opacity: computed.opacity,
    transition: computed.cssTransition,
    transformOrigin: computed.cssTransformOrigin,
    willChange: isActive ? 'transform, opacity' : 'auto'
  };

  // Build attributes
  const attributes = {
    'aria-live': isActive ? 'polite' : 'off',
    role: 'status' as const
  };

  return {
    state,
    actions,
    computed,
    style,
    attributes
  };
}