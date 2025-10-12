/**
 * Bounce hook for bounce animations.
 * Provides comprehensive bounce animation support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseBounceProps {
  /** Whether the bounce animation is initially active */
  initialActive?: boolean;
  /** Duration of bounce animation in milliseconds */
  duration?: number;
  /** Number of times to repeat the bounce (0 = infinite) */
  repeat?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Bounce height multiplier (1.0 = normal height) */
  intensity?: number;
  /** Bounce direction */
  direction?: 'up' | 'down' | 'left' | 'right';
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

export interface BounceState {
  /** Whether bounce animation is currently active */
  isActive: boolean;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Whether animation has completed */
  isComplete: boolean;
  /** Current bounce position (0-1) */
  currentPosition: number;
  /** Current repeat count */
  repeatCount: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
}

export interface BounceActions {
  /** Start the bounce animation */
  start: () => void;
  /** Stop the bounce animation */
  stop: () => void;
  /** Pause the bounce animation */
  pause: () => void;
  /** Resume the bounce animation */
  resume: () => void;
  /** Reset the animation to initial state */
  reset: () => void;
  /** Toggle bounce animation state */
  toggle: () => void;
}

export interface UseBounceReturns {
  /** Current bounce animation state */
  state: BounceState;
  /** Bounce animation actions */
  actions: BounceActions;
  /** Computed styles for bounce animation */
  style: React.CSSProperties;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-live': 'polite' | 'off';
    'aria-busy': boolean;
  };
}

/**
 * Hook for managing bounce animations.
 * Provides comprehensive bounce animation support with accessibility features.
 */
export function useBounce(props: UseBounceProps = {}): UseBounceReturns {
  const {
    initialActive = false,
    duration = 800,
    repeat = 0, // 0 = infinite
    delay = 0,
    intensity = 1.0,
    direction = 'up',
    easing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
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
   * Calculate bounce transform based on direction and position
   */
  const calculateTransform = useCallback((position: number): string => {
    if (shouldRespectReducedMotion) {
      return 'translate(0, 0)';
    }

    // Bounce curve - simplified version of cubic-bezier
    const bounceCurve = (t: number): number => {
      if (t < 0.5) {
        return 2 * t * t;
      } else {
        return -1 + (4 - 2 * t) * t;
      }
    };

    const bounceProgress = bounceCurve(position);
    const translateAmount = bounceProgress * 20 * intensity; // 20px base height

    switch (direction) {
      case 'up':
        return `translateY(-${translateAmount}px)`;
      case 'down':
        return `translateY(${translateAmount}px)`;
      case 'left':
        return `translateX(-${translateAmount}px)`;
      case 'right':
        return `translateX(${translateAmount}px)`;
      default:
        return `translateY(-${translateAmount}px)`;
    }
  }, [direction, intensity, shouldRespectReducedMotion]);

  /**
   * Get current bounce state
   */
  const getState = useCallback((): BounceState => ({
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
   * Execute bounce animation
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

    // Update bounce position during animation
    const updateBounce = () => {
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
              animationFrameRef.current = requestAnimationFrame(updateBounce);
            }
          }, 100); // Small delay between bounces
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
          animationFrameRef.current = requestAnimationFrame(updateBounce);
        }
      }
    };

    // Start bounce animation
    animationFrameRef.current = requestAnimationFrame(updateBounce);
  }, [shouldRespectReducedMotion, duration, repeat, onAnimationStart, onAnimationComplete, onRepeat, notifyStateChange]);

  /**
   * Start bounce animation
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
   * Stop bounce animation
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
   * Pause bounce animation
   */
  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Resume bounce animation
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
        const updateBounce = () => {
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
                  animationFrameRef.current = requestAnimationFrame(updateBounce);
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
            animationFrameRef.current = requestAnimationFrame(updateBounce);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateBounce);
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
   * Toggle bounce animation state
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
        transform: 'translate(0, 0)',
        transition: 'none'
      }
    : {
        transform: calculateTransform(currentPositionRef.current),
        transition: isActiveRef.current && !isPausedRef.current
          ? `transform ${duration}ms ${easing}`
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