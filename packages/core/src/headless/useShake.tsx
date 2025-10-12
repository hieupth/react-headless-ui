/**
 * Shake hook for shake animations.
 * Provides comprehensive shake animation support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseShakeProps {
  /** Whether the shake animation is initially active */
  initialActive?: boolean;
  /** Duration of shake animation in milliseconds */
  duration?: number;
  /** Number of times to repeat the shake (0 = infinite) */
  repeat?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Shake intensity multiplier (1.0 = normal intensity) */
  intensity?: number;
  /** Shake direction */
  direction?: 'horizontal' | 'vertical' | 'both';
  /** Number of shake cycles within duration */
  cycles?: number;
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

export interface ShakeState {
  /** Whether shake animation is currently active */
  isActive: boolean;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Whether animation has completed */
  isComplete: boolean;
  /** Current shake position (0-1) */
  currentPosition: number;
  /** Current repeat count */
  repeatCount: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
}

export interface ShakeActions {
  /** Start the shake animation */
  start: () => void;
  /** Stop the shake animation */
  stop: () => void;
  /** Pause the shake animation */
  pause: () => void;
  /** Resume the shake animation */
  resume: () => void;
  /** Reset the animation to initial state */
  reset: () => void;
  /** Toggle shake animation state */
  toggle: () => void;
}

export interface UseShakeReturns {
  /** Current shake animation state */
  state: ShakeState;
  /** Shake animation actions */
  actions: ShakeActions;
  /** Computed styles for shake animation */
  style: React.CSSProperties;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-live': 'polite' | 'off';
    'aria-busy': boolean;
  };
}

/**
 * Hook for managing shake animations.
 * Provides comprehensive shake animation support with accessibility features.
 */
export function useShake(props: UseShakeProps = {}): UseShakeReturns {
  const {
    initialActive = false,
    duration = 500,
    repeat = 0, // 0 = infinite
    delay = 0,
    intensity = 1.0,
    direction = 'horizontal',
    cycles = 4,
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
   * Calculate shake transform based on direction and position
   */
  const calculateTransform = useCallback((position: number): string => {
    if (shouldRespectReducedMotion) {
      return 'translate(0, 0)';
    }

    // Create shake pattern with multiple cycles
    const cycleProgress = (position * cycles) % 1;
    const shakeValue = Math.sin(cycleProgress * Math.PI * 2) * (1 - cycleProgress);
    const translateAmount = shakeValue * 10 * intensity; // 10px base intensity

    switch (direction) {
      case 'horizontal':
        return `translateX(${translateAmount}px)`;
      case 'vertical':
        return `translateY(${translateAmount}px)`;
      case 'both':
        return `translate(${translateAmount}px, ${translateAmount}px)`;
      default:
        return `translateX(${translateAmount}px)`;
    }
  }, [direction, intensity, cycles, shouldRespectReducedMotion]);

  /**
   * Get current shake state
   */
  const getState = useCallback((): ShakeState => ({
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
   * Execute shake animation
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

    // Update shake position during animation
    const updateShake = () => {
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
              animationFrameRef.current = requestAnimationFrame(updateShake);
            }
          }, 50); // Small delay between shakes
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
          animationFrameRef.current = requestAnimationFrame(updateShake);
        }
      }
    };

    // Start shake animation
    animationFrameRef.current = requestAnimationFrame(updateShake);
  }, [shouldRespectReducedMotion, duration, repeat, onAnimationStart, onAnimationComplete, onRepeat, notifyStateChange]);

  /**
   * Start shake animation
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
   * Stop shake animation
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
   * Pause shake animation
   */
  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Resume shake animation
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
        const updateShake = () => {
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
                  animationFrameRef.current = requestAnimationFrame(updateShake);
                }
              }, 50);
            } else {
              isCompleteRef.current = true;
              isActiveRef.current = false;

              if (onAnimationComplete) {
                onAnimationComplete();
              }
              notifyStateChange();
            }
          } else {
            animationFrameRef.current = requestAnimationFrame(updateShake);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateShake);
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
   * Toggle shake animation state
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