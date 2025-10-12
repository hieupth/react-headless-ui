/**
 * RevealOnScroll hook for scroll-triggered reveal animations.
 * Provides comprehensive scroll reveal support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseRevealOnScrollProps {
  /** Whether reveal is initially disabled */
  initialDisabled?: boolean;
  /** Duration of reveal animation in milliseconds */
  duration?: number;
  /** Animation delay in milliseconds */
  delay?: number;
  /** Threshold for intersection (0-1) */
  threshold?: number | number[];
  /** Root margin for intersection detection */
  rootMargin?: string;
  /** Whether to respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Whether to only reveal once */
  once?: boolean;
  /** Animation easing function */
  easing?: string;
  /** Direction of reveal animation */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  /** Initial opacity (0-1) */
  initialOpacity?: number;
  /** Initial transform offset */
  initialOffset?: number;
  /** Callback when element becomes visible */
  onReveal?: () => void;
  /** Callback when element becomes hidden */
  onHide?: () => void;
  /** Callback when visibility changes */
  onVisibilityChange?: (isVisible: boolean) => void;
}

export interface RevealOnScrollState {
  /** Whether element is currently visible */
  isVisible: boolean;
  /** Whether element has been revealed at least once */
  hasRevealed: boolean;
  /** Current animation progress (0-1) */
  progress: number;
  /** Whether animation should respect reduced motion */
  respectReducedMotion: boolean;
  /** Intersection ratio (0-1) */
  intersectionRatio: number;
  /** Whether element is intersecting */
  isIntersecting: boolean;
}

export interface RevealOnScrollActions {
  /** Manually trigger reveal */
  reveal: () => void;
  /** Manually trigger hide */
  hide: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Enable/disable auto reveal */
  setAutoReveal: (enabled: boolean) => void;
}

export interface UseRevealOnScrollReturns {
  /** Current reveal state */
  state: RevealOnScrollState;
  /** Reveal actions */
  actions: RevealOnScrollActions;
  /** Computed styles for reveal element */
  style: React.CSSProperties;
  /** Ref for the reveal element */
  ref: React.RefCallback<HTMLElement>;
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-hidden': boolean;
    'aria-live': 'polite' | 'off';
  };
}

/**
 * Hook for managing scroll-triggered reveal animations.
 * Provides comprehensive reveal animation support with accessibility features.
 */
export function useRevealOnScroll(props: UseRevealOnScrollProps = {}): UseRevealOnScrollReturns {
  const {
    initialDisabled = false,
    duration = 600,
    delay = 0,
    threshold = 0.1,
    rootMargin = '0px',
    respectReducedMotion = true,
    once = true,
    easing = 'ease-out',
    direction = 'up',
    initialOpacity = 0,
    initialOffset = 30,
    onReveal,
    onHide,
    onVisibilityChange
  } = props;

  // Refs
  const elementRef = useRef<HTMLElement | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const autoRevealRef = useRef<boolean>(!initialDisabled);

  // State
  const isVisibleRef = useRef<boolean>(false);
  const hasRevealedRef = useRef<boolean>(false);
  const progressRef = useRef<number>(0);
  const intersectionRatioRef = useRef<number>(0);
  const isIntersectingRef = useRef<boolean>(false);

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Calculate transform based on direction
   */
  const getTransform = useCallback((progress: number): string => {
    if (shouldRespectReducedMotion) {
      return 'none';
    }

    const offset = initialOffset * (1 - progress);

    switch (direction) {
      case 'up':
        return `translateY(${offset}px)`;
      case 'down':
        return `translateY(-${offset}px)`;
      case 'left':
        return `translateX(${offset}px)`;
      case 'right':
        return `translateX(-${offset}px)`;
      case 'scale':
        const scale = 0.8 + (0.2 * progress);
        return `scale(${scale})`;
      case 'fade':
      default:
        return 'none';
    }
  }, [direction, initialOffset, shouldRespectReducedMotion]);

  /**
   * Calculate opacity based on progress
   */
  const getOpacity = useCallback((progress: number): number => {
    if (shouldRespectReducedMotion) {
      return 1;
    }

    return initialOpacity + ((1 - initialOpacity) * progress);
  }, [initialOpacity, shouldRespectReducedMotion]);

  /**
   * Apply reveal animation
   */
  const applyReveal = useCallback((visible: boolean, animated: boolean = true) => {
    if (!elementRef.current) return;

    const targetProgress = visible ? 1 : 0;
    const currentProgress = progressRef.current;

    if (animated && !shouldRespectReducedMotion) {
      // Animate to target progress
      const animationDuration = duration;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const animationProgress = Math.min(elapsed / animationDuration, 1);

        // Apply easing
        let easedProgress = animationProgress;
        switch (easing) {
          case 'ease-in':
            easedProgress = animationProgress * animationProgress;
            break;
          case 'ease-out':
            easedProgress = animationProgress * (2 - animationProgress);
            break;
          case 'ease-in-out':
            easedProgress = animationProgress < 0.5
              ? 2 * animationProgress * animationProgress
              : -1 + (4 - 2 * animationProgress) * animationProgress;
            break;
        }

        progressRef.current = currentProgress + (targetProgress - currentProgress) * easedProgress;

        if (progressRef.current >= 1 && visible) {
          progressRef.current = 1;
          isVisibleRef.current = true;
          hasRevealedRef.current = true;

          if (onReveal) {
            onReveal();
          }
        } else if (progressRef.current <= 0 && !visible) {
          progressRef.current = 0;
          isVisibleRef.current = false;

          if (onHide) {
            onHide();
          }
        }

        if (onVisibilityChange) {
          onVisibilityChange(isVisibleRef.current);
        }

        if (animationProgress < 1) {
          requestAnimationFrame(animate);
        }
      };

      // Start animation after delay
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, delay);
      } else {
        requestAnimationFrame(animate);
      }
    } else {
      // Jump to target progress immediately
      progressRef.current = targetProgress;
      isVisibleRef.current = visible;

      if (visible) {
        hasRevealedRef.current = true;
        if (onReveal) {
          onReveal();
        }
      } else {
        if (onHide) {
          onHide();
        }
      }

      if (onVisibilityChange) {
        onVisibilityChange(isVisibleRef.current);
      }
    }
  }, [duration, delay, easing, shouldRespectReducedMotion, onReveal, onHide, onVisibilityChange]);

  /**
   * Handle intersection observer
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    intersectionRatioRef.current = entry.intersectionRatio;
    isIntersectingRef.current = entry.isIntersecting;

    if (!autoRevealRef.current) {
      return;
    }

    if (entry.isIntersecting) {
      // Element is visible
      if (!isVisibleRef.current || (!once && !hasRevealedRef.current)) {
        applyReveal(true);
      }
    } else {
      // Element is not visible
      if (!once && isVisibleRef.current) {
        applyReveal(false);
      }
    }
  }, [autoRevealRef, once, isVisibleRef.current, hasRevealedRef.current, applyReveal]);

  /**
   * Element ref callback
   */
  const elementRefCallback = useCallback((element: HTMLElement | null) => {
    if (elementRef.current === element) {
      return;
    }

    // Clean up previous element
    if (elementRef.current) {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.unobserve(elementRef.current);
      }
    }

    elementRef.current = element;

    if (element) {
      // Set up intersection observer
      if (typeof IntersectionObserver !== 'undefined') {
        intersectionObserverRef.current = new IntersectionObserver(handleIntersection, {
          threshold,
          rootMargin
        });
        intersectionObserverRef.current.observe(element);
      }

      // Set initial state
      if (!shouldRespectReducedMotion) {
        applyReveal(false, false); // Start hidden without animation
      } else {
        applyReveal(true, false); // Start visible if reduced motion
      }
    }
  }, [handleIntersection, threshold, rootMargin, shouldRespectReducedMotion, applyReveal]);

  /**
   * Manually trigger reveal
   */
  const reveal = useCallback(() => {
    applyReveal(true);
  }, [applyReveal]);

  /**
   * Manually trigger hide
   */
  const hide = useCallback(() => {
    applyReveal(false);
  }, [applyReveal]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    hasRevealedRef.current = false;
    isVisibleRef.current = false;
    progressRef.current = 0;

    if (elementRef.current) {
      applyReveal(false, false);
    }
  }, [applyReveal]);

  /**
   * Set auto reveal enabled/disabled
   */
  const setAutoReveal = useCallback((enabled: boolean) => {
    autoRevealRef.current = enabled;
  }, []);

  /**
   * Get current state
   */
  const getState = useCallback((): RevealOnScrollState => ({
    isVisible: isVisibleRef.current,
    hasRevealed: hasRevealedRef.current,
    progress: progressRef.current,
    respectReducedMotion: shouldRespectReducedMotion,
    intersectionRatio: intersectionRatioRef.current,
    isIntersecting: isIntersectingRef.current
  }), [shouldRespectReducedMotion]);

  // Clean up
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, []);

  // Generate computed styles
  const style: React.CSSProperties = {
    opacity: getOpacity(progressRef.current),
    transform: getTransform(progressRef.current),
    transition: shouldRespectReducedMotion
      ? 'none'
      : `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
    transitionDelay: `${delay}ms`
  };

  // Generate ARIA attributes
  const attributes = {
    'aria-hidden': !isVisibleRef.current,
    'aria-live': hasRevealedRef.current ? 'off' : 'polite' as const
  };

  return {
    state: getState(),
    actions: {
      reveal,
      hide,
      reset,
      setAutoReveal
    },
    style,
    ref: elementRefCallback,
    attributes
  };
}