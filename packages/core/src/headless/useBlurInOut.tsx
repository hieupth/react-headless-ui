/**
 * BlurInOut hook for blur animations.
 * Provides comprehensive blur animation support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseBlurInOutProps {
  /** Whether the blur animation is initially active */
  initialActive?: boolean;
  /** Duration of blur animation in milliseconds */
  duration?: number;
  /** Number of times to repeat the blur (0 = infinite) */
  repeat?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Initial blur amount (0-1) */
  initialBlur?: number;
  /** Final blur amount (0-1) */
  finalBlur?: number;
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

export interface BlurInOutState {
  /** Whether blur animation is currently active */
  isActive: boolean;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Whether animation has completed */
  isComplete: boolean;
  /** Current blur position (0-1) */
  currentPosition: number;
  /** Current repeat count */
  repeatCount: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
}

export interface BlurInOutActions {
  /** Start the blur animation */
  start: () => void;
  /** Stop the blur animation */
  stop: () => void;
  /** Pause the blur animation */
  pause: () => void;
  /** Resume the blur animation */
  resume: () => void;
  /** Reset the animation to initial state */
  reset: () => void;
  /** Toggle blur animation state */
  toggle: () => void;
}

export interface UseBlurInOutReturns {
  /** Current blur animation state */
  state: BlurInOutState;
  /** Blur animation actions */
  actions: BlurInOutActions;
  /** Computed styles for blur animation */
  style: React.CSSProperties;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-live': 'polite' | 'off';
    'aria-busy': boolean;
  };
}

/**
 * Hook for managing blur animations.
 * Provides comprehensive blur animation support with accessibility features.
 */
export function useBlurInOut(props: UseBlurInOutProps = {}): UseBlurInOutReturns {
  const {
    initialActive = false,
    duration = 400,
    repeat = 0, // 0 = infinite
    delay = 0,
    initialBlur = 0,
    finalBlur = 8,
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
   * Calculate blur value based on position
   */
  const calculateBlur = useCallback((position: number): number => {
    if (shouldRespectReducedMotion) {
      return 0; // No blur when reduced motion is preferred
    }

    const blurRange = finalBlur - initialBlur;
    return initialBlur + (blurRange * position);
  }, [initialBlur, finalBlur, shouldRespectReducedMotion]);

  /**
   * Get current blur state
   */
  const getState = useCallback((): BlurInOutState => ({
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
   * Execute blur animation
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

    if (onAnimationStart) {
      onAnimationStart();
    }
    notifyStateChange();

    // Animation duration
    const animationDuration = duration;

    // Update blur during animation
    const updateBlur = () => {
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
              animationFrameRef.current = requestAnimationFrame(updateBlur);
            }
          }, 100); // Small delay between blur cycles
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
          animationFrameRef.current = requestAnimationFrame(updateBlur);
        }
      }
    };

    // Start blur animation
    animationFrameRef.current = requestAnimationFrame(updateBlur);
  }, [shouldRespectReducedMotion, initialBlur, finalBlur, duration, repeat, onAnimationStart, onAnimationComplete, onRepeat, notifyStateChange]);

  /**
   * Start blur animation
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
   * Stop blur animation
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
   * Pause blur animation
   */
  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Resume blur animation
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
        const updateBlur = () => {
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
                  animationFrameRef.current = requestAnimationFrame(updateBlur);
                }
              }, 100);
            } else {
              isCompleteRef.current = true;
              isActiveRef.current = false;

              if (onAnimationComplete) {
                onAnimationComplete();
              }
              notifyStateChange();
            }
          } else {
            animationFrameRef.current = requestAnimationFrame(updateBlur);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateBlur);
      }
    }

    notifyStateChange();
  }, [shouldRespectReducedMotion, duration, repeat, initialBlur, finalBlur, onRepeat, onAnimationComplete, notifyStateChange]);

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
   * Toggle blur animation state
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
  const currentBlur = calculateBlur(currentPositionRef.current);
  const style: React.CSSProperties = {
    filter: shouldRespectReducedMotion
      ? 'none'
      : `blur(${currentBlur}px)`,
    transition: isActiveRef.current && !isPausedRef.current
      ? `filter ${duration}ms ${easing}`
      : 'none',
    transitionDelay: `${delay}ms`
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