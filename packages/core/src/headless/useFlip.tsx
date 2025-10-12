/**
 * Flip hook for flip animations.
 * Provides comprehensive 3D flip animation support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseFlipProps {
  /** Whether the flip animation is initially active */
  initialActive?: boolean;
  /** Duration of flip animation in milliseconds */
  duration?: number;
  /** Number of times to repeat the flip (0 = infinite) */
  repeat?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Flip axis */
  axis?: 'x' | 'y' | 'z';
  /** Flip direction */
  direction?: 'forward' | 'backward' | 'alternate';
  /** Animation easing function */
  easing?: string;
  /** Whether to respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Callback when animation starts */
  onAnimationStart?: () => void;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Callback when animation repeats */
  onRepeat?: (repeatCount: number) => void;
  /** Callback when state changes */
  onStateChange?: (isActive: boolean) => void;
}

export interface FlipState {
  /** Whether flip animation is currently active */
  isActive: boolean;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Whether animation has completed */
  isComplete: boolean;
  /** Current flip position (0-1) */
  currentPosition: number;
  /** Current repeat count */
  repeatCount: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
}

export interface FlipActions {
  /** Start the flip animation */
  start: () => void;
  /** Stop the flip animation */
  stop: () => void;
  /** Pause the flip animation */
  pause: () => void;
  /** Resume the flip animation */
  resume: () => void;
  /** Reset the animation to initial state */
  reset: () => void;
  /** Toggle flip animation state */
  toggle: () => void;
}

export interface UseFlipReturns {
  /** Current flip animation state */
  state: FlipState;
  /** Flip animation actions */
  actions: FlipActions;
  /** Computed styles for flip animation */
  style: React.CSSProperties;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-live': 'polite' | 'off';
    'aria-busy': boolean;
  };
}

/**
 * Hook for managing flip animations.
 * Provides comprehensive 3D flip animation support with accessibility features.
 */
export function useFlip(props: UseFlipProps = {}): UseFlipReturns {
  const {
    initialActive = false,
    duration = 600,
    repeat = 0, // 0 = infinite
    delay = 0,
    axis = 'y',
    direction = 'forward',
    easing = 'ease-in-out',
    respectReducedMotion = true,
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

  // Component state
  const isActiveRef = useRef<boolean>(initialActive);
  const isPausedRef = useRef<boolean>(false);
  const isCompleteRef = useRef<boolean>(false);
  const currentPositionRef = useRef<number>(0);

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Calculate flip transform based on axis, direction, and position
   */
  const calculateTransform = useCallback((position: number): string => {
    if (shouldRespectReducedMotion) {
      return 'none';
    }

    // Calculate rotation based on direction
    let rotation = position * 180; // 180 degrees for full flip

    if (direction === 'backward') {
      rotation = -rotation;
    } else if (direction === 'alternate') {
      // Alternate direction on each repeat
      const isEvenRepeat = repeatCountRef.current % 2 === 0;
      rotation = isEvenRepeat ? rotation : -rotation;
    }

    switch (axis) {
      case 'x':
        return `rotateX(${rotation}deg)`;
      case 'y':
        return `rotateY(${rotation}deg)`;
      case 'z':
        return `rotateZ(${rotation}deg)`;
      default:
        return `rotateY(${rotation}deg)`;
    }
  }, [axis, direction, shouldRespectReducedMotion]);

  /**
   * Get current flip state
   */
  const getState = useCallback((): FlipState => ({
    isActive: isActiveRef.current,
    isPaused: isPausedRef.current,
    isComplete: isCompleteRef.current,
    currentPosition: currentPositionRef.current,
    repeatCount: repeatCountRef.current,
    respectReducedMotion: shouldRespectReducedMotion
  }), [shouldRespectReducedMotion]);

  /**
   * Notify state change
   */
  const notifyStateChange = useCallback(() => {
    if (onStateChange) {
      onStateChange(isActiveRef.current);
    }
  }, [onStateChange]);

  /**
   * Execute flip animation
   */
  const executeAnimation = useCallback(() => {
    if (shouldRespectReducedMotion) {
      // Skip animation, just complete
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

    if (onAnimationStart) {
      onAnimationStart();
    }
    notifyStateChange();

    // Animation duration
    const animationDuration = duration;

    // Update flip position during animation
    const updateFlip = () => {
      if (!isActiveRef.current || isPausedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Update current position
      currentPositionRef.current = progress;

      if (progress >= 1) {
        // Animation cycle complete
        repeatCountRef.current++;

        if (onRepeat) {
          onRepeat(repeatCountRef.current);
        }

        // Check if should repeat
        if (repeat === 0 || repeatCountRef.current < repeat) {
          // Start next cycle
          startTimeRef.current = Date.now();
          currentPositionRef.current = 0;
          timeoutRef.current = setTimeout(() => {
            if (isActiveRef.current && !isPausedRef.current) {
              animationFrameRef.current = requestAnimationFrame(updateFlip);
            }
          }, 200); // Small delay between flips
        } else {
          // Animation fully complete
          isCompleteRef.current = true;
          isActiveRef.current = false;

          if (onAnimationComplete) {
            onAnimationComplete();
          }
          notifyStateChange();
        }
      } else {
        // Continue animation
        if (isActiveRef.current && !isPausedRef.current) {
          animationFrameRef.current = requestAnimationFrame(updateFlip);
        }
      }
    };

    // Start flip animation
    animationFrameRef.current = requestAnimationFrame(updateFlip);
  }, [shouldRespectReducedMotion, duration, repeat, onAnimationStart, onAnimationComplete, onRepeat, notifyStateChange]);

  /**
   * Start flip animation
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

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        executeAnimation();
      }, delay);
    } else {
      executeAnimation();
    }
  }, [delay, executeAnimation]);

  /**
   * Stop flip animation
   */
  const stop = useCallback(() => {
    isActiveRef.current = false;
    isPausedRef.current = false;
    currentPositionRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Pause flip animation
   */
  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Resume flip animation
   */
  const resume = useCallback(() => {
    if (!isActiveRef.current || !isPausedRef.current) return;

    isPausedRef.current = false;

    // Resume animation from current position
    if (!shouldRespectReducedMotion && isActiveRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        // Continue animation from where it left off
        const updateFlip = () => {
          if (!isActiveRef.current || isPausedRef.current) return;

          const newElapsed = Date.now() - startTimeRef.current;
          const newProgress = Math.min(newElapsed / duration, 1);

          currentPositionRef.current = newProgress;

          if (newProgress >= 1) {
            // Handle completion/repeat
            repeatCountRef.current++;

            if (onRepeat) {
              onRepeat(repeatCountRef.current);
            }

            if (repeat === 0 || repeatCountRef.current < repeat) {
              startTimeRef.current = Date.now();
              currentPositionRef.current = 0;
              timeoutRef.current = setTimeout(() => {
                if (isActiveRef.current && !isPausedRef.current) {
                  animationFrameRef.current = requestAnimationFrame(updateFlip);
                }
              }, 200);
            } else {
              isCompleteRef.current = true;
              isActiveRef.current = false;

              if (onAnimationComplete) {
                onAnimationComplete();
              }
              notifyStateChange();
            }
          } else {
            animationFrameRef.current = requestAnimationFrame(updateFlip);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateFlip);
      }
    }

    notifyStateChange();
  }, [shouldRespectReducedMotion, duration, repeat, onRepeat, onAnimationComplete, notifyStateChange]);

  /**
   * Reset animation to initial state
   */
  const reset = useCallback(() => {
    stop();
    currentPositionRef.current = 0;
    repeatCountRef.current = 0;
    isCompleteRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    notifyStateChange();
  }, [stop, notifyStateChange]);

  /**
   * Toggle flip animation state
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
    };
  }, [initialActive, start]);

  // Generate computed styles
  const style: React.CSSProperties = shouldRespectReducedMotion
    ? {
        transform: 'none',
        transition: 'none'
      }
    : {
        transform: calculateTransform(currentPositionRef.current),
        transition: isActiveRef.current && !isPausedRef.current
          ? `transform ${duration}ms ${easing}`
          : 'none',
        transitionDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      };

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
    style,
    attributes
  };
}