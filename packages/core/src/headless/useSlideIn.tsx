/**
 * SlideIn headless hook for React UI Forge components.
 * Provides slide in/out animation behavior following Flutter patterns.
 * Manages slide states, directions, and accessibility considerations.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Slide direction options
 */
export type SlideDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Slide animation state interface
 */
export interface SlideInState {
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Whether element is currently visible */
  isVisible: boolean;
  /** Current slide direction */
  direction: SlideDirection;
  /** Current transform values */
  transform: {
    x: number;
    y: number;
  };
  /** Animation completion status */
  isComplete: boolean;
}

/**
 * SlideIn actions interface
 */
export interface SlideInActions {
  /** Start slide in animation */
  slideIn: (direction?: SlideDirection) => void;
  /** Start slide out animation */
  slideOut: (direction?: SlideDirection) => void;
  /** Toggle slide direction */
  toggle: () => void;
  /** Reset animation to initial state */
  reset: () => void;
  /** Set animation state manually */
  setVisible: (visible: boolean, direction?: SlideDirection) => void;
  /** Stop current animation */
  stop: () => void;
}

/**
 * Props for useSlideIn hook
 */
export interface UseSlideInProps {
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Slide direction */
  direction?: SlideDirection;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Easing function name */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Slide distance in pixels */
  distance?: number;
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
  /** Callback when animation starts */
  onAnimationStart?: (direction: SlideDirection, type: 'in' | 'out') => void;
  /** Callback when animation completes */
  onAnimationComplete?: (visible: boolean) => void;
  /** Callback when transform changes */
  onTransformChange?: (transform: { x: number; y: number }) => void;
}

/**
 * Return type for useSlideIn hook
 */
export interface UseSlideInReturns {
  /** Current slide state */
  state: SlideInState;
  /** Slide actions */
  actions: SlideInActions;
  /** Computed properties */
  computed: {
    /** CSS transform value */
    cssTransform: string;
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
 * SlideIn hook implementation
 * @param props - SlideIn configuration props
 * @returns SlideIn state, actions, computed properties, style, and attributes
 */
export function useSlideIn(props: UseSlideInProps = {}): UseSlideInReturns {
  const {
    initialVisible = false,
    duration = 300,
    direction: initialDirection = 'up',
    delay = 0,
    easing = 'ease-in-out',
    distance = 20,
    respectReducedMotion = true,
    onAnimationStart,
    onAnimationComplete,
    onTransformChange
  } = props;

  // State management
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentDirection, setCurrentDirection] = useState(initialDirection);
  const [currentTransform, setCurrentTransform] = useState({ x: 0, y: 0 });
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

  // Get slide direction values
  const getSlideValues = useCallback((dir: SlideDirection, type: 'in' | 'out') => {
    const multiplier = type === 'in' ? 1 : -1;

    switch (dir) {
      case 'up':
        return { from: { x: 0, y: multiplier * distance }, to: { x: 0, y: 0 } };
      case 'down':
        return { from: { x: 0, y: multiplier * -distance }, to: { x: 0, y: 0 } };
      case 'left':
        return { from: { x: multiplier * distance, y: 0 }, to: { x: 0, y: 0 } };
      case 'right':
        return { from: { x: multiplier * -distance, y: 0 }, to: { x: 0, y: 0 } };
      default:
        return { from: { x: 0, y: multiplier * distance }, to: { x: 0, y: 0 } };
    }
  }, [distance]);

  // Animation function
  const animate = useCallback((targetVisible: boolean, dir: SlideDirection, type: 'in' | 'out') => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const { from, to } = getSlideValues(dir, type);

    // If reduced motion or no duration, jump to end state
    if (effectiveDuration === 0) {
      setCurrentTransform(to);
      setIsVisible(targetVisible);
      setIsAnimating(false);
      setIsComplete(true);
      onAnimationStart?.(dir, type);
      onAnimationComplete?.(targetVisible);
      onTransformChange?.(to);
      return;
    }

    setIsAnimating(true);
    setIsComplete(false);
    setCurrentDirection(dir);
    onAnimationStart?.(dir, type);

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

        // Calculate current transform
        const newTransform = {
          x: from.x + (to.x - from.x) * easedProgress,
          y: from.y + (to.y - from.y) * easedProgress
        };

        setCurrentTransform(newTransform);
        onTransformChange?.(newTransform);

        if (progress < 1) {
          // Continue animation
          animationRef.current = requestAnimationFrame(animationStep);
        } else {
          // Animation complete
          setCurrentTransform(to);
          setIsVisible(targetVisible);
          setIsAnimating(false);
          setIsComplete(true);
          onAnimationComplete?.(targetVisible);
        }
      };

      animationRef.current = requestAnimationFrame(animationStep);
    };

    startAnimation();
  }, [effectiveDuration, delay, easing, getSlideValues, onAnimationStart, onAnimationComplete, onTransformChange]);

  // Actions
  const actions = useMemo(() => ({
    slideIn: (dir = currentDirection) => {
      if (!isVisible) {
        animate(true, dir, 'in');
      }
    },

    slideOut: (dir = currentDirection) => {
      if (isVisible) {
        animate(false, dir, 'out');
      }
    },

    toggle: () => {
      const type = isVisible ? 'out' : 'in';
      animate(!isVisible, currentDirection, type);
    },

    reset: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsVisible(initialVisible);
      setCurrentTransform({ x: 0, y: 0 });
      setIsAnimating(false);
      setIsComplete(false);
      setCurrentDirection(initialDirection);
    },

    setVisible: (visible: boolean, dir = currentDirection) => {
      if (visible !== isVisible) {
        animate(visible, dir, visible ? 'in' : 'out');
      }
    },

    stop: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        setIsAnimating(false);
      }
    }
  }), [animate, isVisible, currentDirection, initialVisible]);

  // Handle mount animation
  useEffect(() => {
    if (initialVisible) {
      animate(true, initialDirection, 'in');
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
  const state: SlideInState = {
    isAnimating,
    isVisible,
    direction: currentDirection,
    transform: currentTransform,
    isComplete
  };

  // Computed properties
  const computed = useMemo(() => {
    const cssTransform = `translate3d(${currentTransform.x}px, ${currentTransform.y}px, 0)`;
    const cssTransition = effectiveDuration > 0
      ? `transform ${effectiveDuration}ms ${easing} ${delay}ms`
      : 'none';

    return {
      cssTransform,
      cssTransition,
      shouldRender: effectiveDuration === 0 || isVisible || isAnimating,
      ariaLive: isAnimating ? 'polite' : 'off'
    };
  }, [currentTransform, effectiveDuration, easing, delay, isAnimating, isVisible]);

  // Build style object
  const style: React.CSSProperties = {
    transform: computed.cssTransform,
    transition: computed.cssTransition,
    willChange: isAnimating ? 'transform' : 'auto'
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