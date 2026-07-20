/**
 * RotateIn hook for rotation animations.
 * Provides comprehensive rotation animation support with accessibility.
 */

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

export interface UseRotateInProps {
  /** Whether the rotation animation is initially active */
  initialActive?: boolean;
  /** Duration of rotation animation in milliseconds */
  duration?: number;
  /** Number of times to repeat the rotation (0 = infinite) */
  repeat?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Initial rotation angle in degrees */
  initialAngle?: number;
  /** Final rotation angle in degrees */
  finalAngle?: number;
  /** Rotation direction */
  direction?: 'clockwise' | 'counter-clockwise';
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

export interface RotateInState {
  /** Whether rotation animation is currently active */
  isActive: boolean;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Whether animation has completed */
  isComplete: boolean;
  /** Current rotation angle */
  currentAngle: number;
  /** Current repeat count */
  repeatCount: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
}

export interface RotateInActions {
  /** Start the rotation animation */
  start: () => void;
  /** Stop the rotation animation */
  stop: () => void;
  /** Pause the rotation animation */
  pause: () => void;
  /** Resume the rotation animation */
  resume: () => void;
  /** Reset the animation to initial state */
  reset: () => void;
  /** Toggle rotation animation state */
  toggle: () => void;
}

export interface UseRotateInReturns {
  /** Current rotation animation state */
  state: RotateInState;
  /** Rotation animation actions */
  actions: RotateInActions;
  /** Computed styles for rotation animation */
  style: React.CSSProperties;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-live': 'polite' | 'off';
    'aria-busy': boolean;
  };
}

/**
 * Hook for managing rotation animations.
 * Provides comprehensive rotation animation support with accessibility features.
 */
export function useRotateIn(props: UseRotateInProps = {}): UseRotateInReturns {
  const {
    initialActive = false,
    duration = 600,
    repeat = 0, // 0 = infinite
    delay = 0,
    initialAngle = 0,
    finalAngle = 360,
    direction = 'clockwise',
    easing = 'ease-in-out',
    respectReducedMotion = true,
    onAnimationStart,
    onAnimationComplete,
    onRepeat,
    onStateChange
  } = props;

  // Refs for animation management
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const repeatCountRef = useRef<number>(0);

  // Component state
  // isActiveRef starts false even when initialActive is set: the mount effect
  // calls start() to actually begin the animation (which sets this true). Pre-
  // setting it true made start()'s "already active" guard no-op, so
  // initialActive never animated and never fired onAnimationStart/Complete.
  const isActiveRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isCompleteRef = useRef<boolean>(false);
  const currentAngleRef = useRef<number>(initialAngle);

  // Re-render trigger so exposed state/style/attributes reflect ref mutations.
  // `tick` is included in the final useMemo deps so the memo recomputes when refs mutate.
  const [tick, forceTick] = useState(0);

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Calculate rotation angle based on direction
   */
  const calculateRotation = useCallback((baseAngle: number): number => {
    if (direction === 'counter-clockwise') {
      return -baseAngle;
    }
    return baseAngle;
  }, [direction]);

  /**
   * Get current rotation state
   */
  const getState = useCallback((): RotateInState => ({
    isActive: isActiveRef.current,
    isPaused: isPausedRef.current,
    isComplete: isCompleteRef.current,
    currentAngle: currentAngleRef.current,
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
   * Execute animation cycle
   */
  const executeAnimation = useCallback(() => {
    if (shouldRespectReducedMotion) {
      // Skip animation, jump to final state
      currentAngleRef.current = calculateRotation(finalAngle);
      isCompleteRef.current = true;
      isActiveRef.current = false;
      forceTick(t => t + 1);

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
    forceTick(t => t + 1);

    if (onAnimationStart) {
      onAnimationStart();
    }
    notifyStateChange();

    // Animation duration
    const animationDuration = duration;

    // Update rotation during animation
    const updateRotation = () => {
      if (!isActiveRef.current || isPausedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Calculate current angle based on progress
      const angleRange = finalAngle - initialAngle;
      currentAngleRef.current = calculateRotation(initialAngle + (angleRange * progress));

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
          currentAngleRef.current = calculateRotation(initialAngle);
          forceTick(t => t + 1);
          timeoutRef.current = setTimeout(updateRotation, 0);
        } else {
          // Animation fully complete
          isCompleteRef.current = true;
          isActiveRef.current = false;
          forceTick(t => t + 1);

          if (onAnimationComplete) {
            onAnimationComplete();
          }
          notifyStateChange();
        }
      } else {
        // Continue animation. The active+!paused invariant was already checked
        // at the top of updateRotation and nothing mutates those refs between
        // there and here, so the redundant guard was removed (it was always true).
        requestAnimationFrame(updateRotation);
      }
    };

    // Start animation loop
    requestAnimationFrame(updateRotation);
  }, [
    shouldRespectReducedMotion,
    calculateRotation,
    finalAngle,
    duration,
    repeat,
    initialAngle,
    onAnimationStart,
    onAnimationComplete,
    onRepeat,
    notifyStateChange
  ]);

  /**
   * Start rotation animation
   */
  const start = useCallback(() => {
    if (isActiveRef.current && !isPausedRef.current) return;

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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
   * Stop rotation animation
   */
  const stop = useCallback(() => {
    isActiveRef.current = false;
    isPausedRef.current = false;
    forceTick(t => t + 1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Pause rotation animation
   */
  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current) return;

    isPausedRef.current = true;
    forceTick(t => t + 1);
    notifyStateChange();
  }, [notifyStateChange]);

  /**
   * Resume rotation animation
   */
  const resume = useCallback(() => {
    if (!isActiveRef.current || !isPausedRef.current) return;

    isPausedRef.current = false;
    forceTick(t => t + 1);

    // Resume animation from current position.
    // reason: reaching this line requires isActiveRef=true (the resume guard at
    // the top returns early otherwise), and isActive is only ever set true inside
    // executeAnimation's NON-reduced branch — so under reduced motion this block
    // is unreachable. The `!shouldRespectReducedMotion` false arm is dead.
    /* c8 ignore next */
    if (!shouldRespectReducedMotion) {
      requestAnimationFrame(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1 && isActiveRef.current) {
          // Continue animation from where it left off
          const updateRotation = () => {
            if (!isActiveRef.current || isPausedRef.current) return;

            const newElapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min(newElapsed / duration, 1);

            const angleRange = finalAngle - initialAngle;
            currentAngleRef.current = calculateRotation(initialAngle + (angleRange * newProgress));

            if (newProgress >= 1) {
              // Handle completion/repeat
              repeatCountRef.current++;

              if (onRepeat) {
                onRepeat(repeatCountRef.current);
              }

              if (repeat === 0 || repeatCountRef.current < repeat) {
                startTimeRef.current = Date.now();
                currentAngleRef.current = calculateRotation(initialAngle);
                requestAnimationFrame(updateRotation);
              } else {
                isCompleteRef.current = true;
                isActiveRef.current = false;

                if (onAnimationComplete) {
                  onAnimationComplete();
                }
                notifyStateChange();
              }
            } else {
              requestAnimationFrame(updateRotation);
            }
          };

          requestAnimationFrame(updateRotation);
        }
      });
    }

    notifyStateChange();
  }, [shouldRespectReducedMotion, duration, finalAngle, initialAngle, repeat, calculateRotation, onRepeat, onAnimationComplete, notifyStateChange]);

  /**
   * Reset animation to initial state
   */
  const reset = useCallback(() => {
    stop();
    currentAngleRef.current = initialAngle;
    repeatCountRef.current = 0;
    isCompleteRef.current = false;
    forceTick(t => t + 1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    notifyStateChange();
  }, [stop, initialAngle, notifyStateChange]);

  /**
   * Toggle rotation animation state
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
    };
  }, [initialActive, start]);

  // Generate computed styles
  const style: React.CSSProperties = shouldRespectReducedMotion
    ? {
        transform: `rotate(${calculateRotation(finalAngle)}deg)`,
        transition: 'none'
      }
    : {
        transform: `rotate(${currentAngleRef.current}deg)`,
        transition: isActiveRef.current && !isPausedRef.current
          ? `transform ${duration}ms ${easing}`
          : 'none',
        transitionDelay: `${delay}ms`
      };

  // Generate ARIA attributes
  const attributes = {
    'aria-live': (isActiveRef.current ? 'polite' : 'off') as 'polite' | 'off',
    'aria-busy': isActiveRef.current && !isCompleteRef.current
  };

  return useMemo(() => ({
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
  }), [tick, getState, start, stop, pause, resume, reset, toggle, style, attributes]);
}