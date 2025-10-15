/**
 * Pulse headless hook for React UI Forge components.
 * Provides pulse animation behavior following Flutter patterns.
 * Manages pulse states, timing, and accessibility considerations.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Pulse animation state interface
 */
export interface PulseState {
  /** Whether pulse animation is currently active */
  isActive: boolean;
  /** Current animation iteration count */
  iteration: number;
  /** Whether animation is paused */
  isPaused: boolean;
  /** Animation completion status */
  isComplete: boolean;
}

/**
 * Pulse actions interface
 */
export interface PulseActions {
  /** Start pulse animation */
  start: () => void;
  /** Stop pulse animation */
  stop: () => void;
  /** Pause pulse animation */
  pause: () => void;
  /** Resume pulse animation */
  resume: () => void;
  /** Reset animation to initial state */
  reset: () => void;
  /** Set pulse state manually */
  setActive: (active: boolean) => void;
}

/**
 * Props for usePulse hook
 */
export interface UsePulseProps {
  /** Initial active state */
  initialActive?: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Number of times to repeat (infinite if 0) */
  repeat?: number;
  /** Delay between pulses in milliseconds */
  delay?: number;
  /** Pulse intensity (0-1) */
  intensity?: number;
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
 * Return type for usePulse hook
 */
export interface UsePulseReturns {
  /** Current pulse state */
  state: PulseState;
  /** Pulse actions */
  actions: PulseActions;
  /** Computed properties */
  computed: {
    /** Current pulse scale value */
    scale: number;
    /** Current pulse opacity value */
    opacity: number;
    /** CSS transform value */
    cssTransform: string;
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
 * Pulse hook implementation
 * @param props - Pulse configuration props
 * @returns Pulse state, actions, computed properties, style, and attributes
 */
export function usePulse(props: UsePulseProps = {}): UsePulseReturns {
  const {
    initialActive = false,
    duration = 1000,
    repeat = 0, // 0 = infinite
    delay = 0,
    intensity = 0.2,
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
  const lastPulseRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Calculate effective duration (0 if reduced motion)
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

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
      lastPulseRef.current = startTimeRef.current;

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
  }, [effectiveDuration, delay, repeat, intensity, onAnimationStart, onAnimationComplete, onRepeat, onStateChange, isPaused, iteration]);

  // Actions
  const actions = useMemo(() => ({
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
  }), [animate, isActive, isPaused, isComplete, initialActive, onStateChange]);

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
  const state: PulseState = {
    isActive,
    iteration,
    isPaused,
    isComplete
  };

  // Computed properties
  const computed = useMemo(() => {
    let scale = 1;
    let opacity = 1;

    if (isActive && effectiveDuration > 0) {
      const currentTime = performance.now();
      const elapsed = (currentTime - lastPulseRef.current) % effectiveDuration;
      const progress = elapsed / effectiveDuration;

      // Pulse animation logic
      const pulseProgress = Math.sin(progress * Math.PI * 2);
      scale = 1 + (pulseProgress * intensity);
      opacity = 1 - (Math.abs(pulseProgress) * intensity);
    }

    const cssTransform = `scale(${scale})`;
    const cssTransition = effectiveDuration > 0
      ? `transform ${effectiveDuration / 2}ms ease-in-out, opacity ${effectiveDuration / 2}ms ease-in-out`
      : 'none';

    return {
      scale,
      opacity,
      cssTransform,
      cssTransition,
      shouldRender: true // Pulse components always render
    };
  }, [isActive, effectiveDuration, intensity, iteration]);

  // Build style object
  const style: React.CSSProperties = {
    transform: computed.cssTransform,
    opacity: computed.opacity,
    transition: computed.cssTransition,
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