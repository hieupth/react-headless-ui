/**
 * StaggerChildren hook for sequential animations.
 * Provides comprehensive stagger animation support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseStaggerChildrenProps {
  /** Whether stagger animation is initially active */
  initialActive?: boolean;
  /** Duration of each child animation in milliseconds */
  duration?: number;
  /** Delay between each child animation in milliseconds */
  staggerDelay?: number;
  /** Number of times to repeat the stagger (0 = infinite) */
  repeat?: number;
  /** Delay before first animation starts in milliseconds */
  delay?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether to respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Total number of children */
  childrenCount?: number;
  /** Direction of stagger animation */
  direction?: 'normal' | 'reverse' | 'center-out';
  /** Callback when animation starts */
  onAnimationStart?: () => void;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Callback when animation repeats */
  onRepeat?: (repeatCount: number) => void;
  /** Callback when state changes */
  onStateChange?: (isActive: boolean) => void;
}

export interface StaggerChildrenState {
  /** Whether stagger animation is currently active */
  isActive: boolean;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Whether animation has completed */
  isComplete: boolean;
  /** Current overall animation position (0-1) */
  currentPosition: number;
  /** Current repeat count */
  repeatCount: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
  /** Currently animating child index */
  currentChildIndex: number;
}

export interface StaggerChildrenActions {
  /** Start the stagger animation */
  start: () => void;
  /** Stop the stagger animation */
  stop: () => void;
  /** Pause the stagger animation */
  pause: () => void;
  /** Resume the stagger animation */
  resume: () => void;
  /** Reset the animation to initial state */
  reset: () => void;
  /** Toggle stagger animation state */
  toggle: () => void;
}

export interface StaggerChildrenChildState {
  /** Whether this child should be animated */
  isAnimating: boolean;
  /** Animation progress for this child (0-1) */
  progress: number;
  /** Animation delay for this child in milliseconds */
  delay: number;
  /** Whether this child animation is complete */
  isComplete: boolean;
}

export interface UseStaggerChildrenReturns {
  /** Current stagger animation state */
  state: StaggerChildrenState;
  /** Stagger animation actions */
  actions: StaggerChildrenActions;
  /** Get animation state for a specific child */
  getChildState: (index: number) => StaggerChildrenChildState;
  /** Computed styles for stagger container */
  style: React.CSSProperties;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-live': 'polite' | 'off';
    'aria-busy': boolean;
  };
}

/**
 * Hook for managing stagger animations for multiple children.
 * Provides comprehensive stagger animation support with accessibility features.
 */
export function useStaggerChildren(props: UseStaggerChildrenProps = {}): UseStaggerChildrenReturns {
  const {
    initialActive = false,
    duration = 300,
    staggerDelay = 100,
    repeat = 0, // 0 = infinite
    delay = 0,
    easing = 'ease-out',
    respectReducedMotion = true,
    childrenCount = 0,
    direction = 'normal',
    onAnimationStart,
    onAnimationComplete,
    onRepeat,
    onStateChange
  } = props;

  // Refs for animation management
  const timeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const repeatCountRef = useRef<number>(0);
  const childTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Component state
  const isActiveRef = useRef<boolean>(initialActive);
  const isPausedRef = useRef<boolean>(false);
  const isCompleteRef = useRef<boolean>(false);
  const currentPositionRef = useRef<number>(0);
  const currentChildIndexRef = useRef<number>(0);

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Calculate child delay based on direction
   */
  const getChildDelay = useCallback((index: number): number => {
    if (shouldRespectReducedMotion) {
      return 0; // No stagger when reduced motion is preferred
    }

    switch (direction) {
      case 'reverse':
        return (childrenCount - 1 - index) * staggerDelay;
      case 'center-out':
        const centerIndex = Math.floor(childrenCount / 2);
        const distanceFromCenter = Math.abs(index - centerIndex);
        return distanceFromCenter * staggerDelay;
      case 'normal':
      default:
        return index * staggerDelay;
    }
  }, [childrenCount, staggerDelay, direction, shouldRespectReducedMotion]);

  /**
   * Get current stagger state
   */
  const getState = useCallback((): StaggerChildrenState => ({
    isActive: isActiveRef.current,
    isPaused: isPausedRef.current,
    isComplete: isCompleteRef.current,
    currentPosition: currentPositionRef.current,
    repeatCount: repeatCountRef.current,
    respectReducedMotion: shouldRespectReducedMotion,
    currentChildIndex: currentChildIndexRef.current
  }), [shouldRespectReducedMotion]);

  /**
   * Get animation state for specific child
   */
  const getChildState = useCallback((index: number): StaggerChildrenChildState => {
    if (!isActiveRef.current || isPausedRef.current || shouldRespectReducedMotion) {
      return {
        isAnimating: false,
        progress: 0,
        delay: 0,
        isComplete: false
      };
    }

    const childDelay = getChildDelay(index);
    const elapsed = Date.now() - startTimeRef.current;
    const adjustedElapsed = elapsed - childDelay;

    if (adjustedElapsed <= 0) {
      return {
        isAnimating: false,
        progress: 0,
        delay: childDelay,
        isComplete: false
      };
    }

    const progress = Math.min(adjustedElapsed / duration, 1);

    return {
      isAnimating: progress < 1,
      progress,
      delay: childDelay,
      isComplete: progress >= 1
    };
  }, [getChildDelay, duration, shouldRespectReducedMotion]);

  /**
   * Notify state change
   */
  const notifyStateChange = useCallback(() => {
    if (onStateChange) {
      onStateChange(isActiveRef.current);
    }
  }, [onStateChange]);

  /**
   * Execute stagger animation
   */
  const executeAnimation = useCallback(() => {
    if (shouldRespectReducedMotion) {
      // Skip animation, jump to final state
      currentPositionRef.current = 1;
      isCompleteRef.current = true;
      isActiveRef.current = false;

      if (onAnimationComplete) {
        onAnimationComplete();
      }
      notifyStateChange();
      return;
    }

    // Start animation
    startTimeRef.current = Date.now();
    isActiveRef.current = true;
    isCompleteRef.current = false;
    currentPositionRef.current = 0;

    if (onAnimationStart) {
      onAnimationStart();
    }
    notifyStateChange();

    // Clear any existing child timeouts
    childTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    childTimeoutsRef.current = [];

    // Animate each child with stagger
    const totalDuration = duration + (childrenCount - 1) * staggerDelay;
    let childrenCompleted = 0;

    for (let i = 0; i < childrenCount; i++) {
      const childDelay = getChildDelay(i);

      const timeout = setTimeout(() => {
        currentChildIndexRef.current = i;

        // Child animation complete
        childrenCompleted++;

        if (childrenCompleted === childrenCount) {
          // All children completed
          repeatCountRef.current++;

          if (onRepeat) {
            onRepeat(repeatCountRef.current);
          }

          // Check if should repeat
          if (repeat === 0 || repeatCountRef.current < repeat) {
            // Start next cycle
            setTimeout(() => {
              if (isActiveRef.current && !isPausedRef.current) {
                executeAnimation();
              }
            }, 100); // Small delay between cycles
          } else {
            // Animation fully complete
            isCompleteRef.current = true;
            isActiveRef.current = false;
            currentPositionRef.current = 1;

            if (onAnimationComplete) {
              onAnimationComplete();
            }
            notifyStateChange();
          }
        }
      }, childDelay + duration);

      childTimeoutsRef.current.push(timeout);
    }

    // Update overall progress
    const updateProgress = () => {
      if (!isActiveRef.current || isPausedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);
      currentPositionRef.current = progress;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  }, [shouldRespectReducedMotion, duration, staggerDelay, childrenCount, repeat, direction, onAnimationStart, onAnimationComplete, onRepeat, notifyStateChange, getChildDelay]);

  /**
   * Start stagger animation
   */
  const start = useCallback(() => {
    if (isActiveRef.current && !isPausedRef.current) return;

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    childTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        executeAnimation();
      }, delay);
    } else {
      executeAnimation();
    }
  }, [delay, executeAnimation]);

  /**
   * Stop stagger animation
   */
  const stop = useCallback(() => {
    isActiveRef.current = false;
    isPausedRef.current = false;
    currentPositionRef.current = 0;
    currentChildIndexRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    childTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    childTimeoutsRef.current = [];

    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Pause stagger animation
   */
  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Resume stagger animation
   */
  const resume = useCallback(() => {
    if (!isActiveRef.current || !isPausedRef.current) return;

    isPausedRef.current = false;

    // Resume animation from current position
    if (!shouldRespectReducedMotion && isActiveRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const totalDuration = duration + (childrenCount - 1) * staggerDelay;
      const progress = Math.min(elapsed / totalDuration, 1);

      if (progress < 1) {
        // Continue animation from where it left off
        executeAnimation();
      }
    }

    notifyStateChange();
  }, [shouldRespectReducedMotion, duration, staggerDelay, childrenCount, executeAnimation, notifyStateChange]);

  /**
   * Reset animation to initial state
   */
  const reset = useCallback(() => {
    stop();
    currentPositionRef.current = 0;
    currentChildIndexRef.current = 0;
    repeatCountRef.current = 0;
    isCompleteRef.current = false;

    childTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    childTimeoutsRef.current = [];

    notifyStateChange();
  }, [stop, notifyStateChange]);

  /**
   * Toggle stagger animation state
   */
  const toggle = useCallback(() => {
    if (isActiveRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // Initialize animation
  useEffect(() => {
    if (initialActive) {
      start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      childTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [initialActive, start]);

  // Generate computed styles
  const style: React.CSSProperties = {};

  // Generate ARIA attributes
  const attributes = {
    'aria-live': isActiveRef.current ? 'polite' : 'off' as const,
    'aria-busy': isActiveRef.current && !isCompleteRef.current
  };

  return {
    state: getState(),
    actions: {
      start,
      stop,
      pause,
      resume,
      reset,
      toggle
    },
    getChildState,
    style,
    attributes
  };
}