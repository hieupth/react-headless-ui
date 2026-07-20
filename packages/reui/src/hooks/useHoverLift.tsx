/**
 * HoverLift hook for hover-based lift animations.
 * Provides comprehensive hover lift effects with accessibility support.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseHoverLiftProps {
  /** Lift distance in pixels */
  liftDistance?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether to respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Scale factor on hover (1 = no scale) */
  scale?: number;
  /** Shadow intensity on hover (0-1) */
  shadowIntensity?: number;
  /** Whether to disable hover effects */
  disabled?: boolean;
  /** Callback when hover starts */
  onHoverStart?: () => void;
  /** Callback when hover ends */
  onHoverEnd?: () => void;
  /** Callback when lift state changes */
  onLiftChange?: (isLifted: boolean) => void;
}

export interface HoverLiftState {
  /** Whether element is currently hovered/lifted */
  isLifted: boolean;
  /** Current lift progress (0-1) */
  liftProgress: number;
  /** Whether lift animation should respect reduced motion */
  respectReducedMotion: boolean;
  /** Current pointer position relative to element */
  pointerPosition: {
    x: number;
    y: number;
  };
}

export interface HoverLiftActions {
  /** Manually trigger lift */
  lift: () => void;
  /** Manually drop */
  drop: () => void;
  /** Toggle lift state */
  toggle: () => void;
  /** Enable/disable hover effects */
  setEnabled: (enabled: boolean) => void;
}

export interface UseHoverLiftReturns {
  /** Current hover lift state */
  state: HoverLiftState;
  /** Hover lift actions */
  actions: HoverLiftActions;
  /** Computed styles for hover lift element */
  style: React.CSSProperties;
  /** Ref for the hover lift element */
  ref: React.RefCallback<HTMLElement>;
  /** Event handlers for element */
  eventHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onPointerMove: (event: React.PointerEvent) => void;
  };
  /** ARIA attributes for accessibility */
  attributes: {
    'aria-pressed': boolean;
    'role': string;
  };
}

/**
 * Hook for managing hover-based lift animations.
 * Provides comprehensive hover lift effects with accessibility features.
 */
export function useHoverLift(props: UseHoverLiftProps = {}): UseHoverLiftReturns {
  const {
    liftDistance = 8,
    duration = 200,
    easing = 'ease-out',
    respectReducedMotion = true,
    scale = 1.02,
    shadowIntensity = 0.2,
    disabled = false,
    onHoverStart,
    onHoverEnd,
    onLiftChange
  } = props;

  // Refs
  const elementRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const enabledRef = useRef<boolean>(!disabled);

  // State
  const isLiftedRef = useRef<boolean>(false);
  const liftProgressRef = useRef<number>(0);
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Calculate transform based on lift progress
   */
  const getTransform = useCallback((progress: number): string => {
    if (shouldRespectReducedMotion || !enabledRef.current) {
      return 'none';
    }

    const translateY = -liftDistance * progress;
    const scaleValue = 1 + (scale - 1) * progress;

    return `translateY(${translateY}px) scale(${scaleValue})`;
  }, [liftDistance, scale, shouldRespectReducedMotion]);

  /**
   * Calculate box shadow based on lift progress
   */
  const getBoxShadow = useCallback((progress: number): string => {
    if (shouldRespectReducedMotion || !enabledRef.current || shadowIntensity <= 0) {
      return 'none';
    }

    const shadowBlur = 20 * progress * shadowIntensity;
    const shadowSpread = 4 * progress * shadowIntensity;
    const shadowOpacity = 0.15 * progress * shadowIntensity;

    return `0 ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, ${shadowOpacity})`;
  }, [shadowIntensity, shouldRespectReducedMotion]);

  /**
   * Animate lift progress
   */
  const animateLift = useCallback((targetProgress: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startProgress = liftProgressRef.current;
    const startTime = Date.now();
    const animationDuration = duration;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Apply easing
      let easedProgress = progress;
      switch (easing) {
        case 'ease-in':
          easedProgress = progress * progress;
          break;
        case 'ease-out':
          easedProgress = progress * (2 - progress);
          break;
        case 'ease-in-out':
          easedProgress = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
          break;
      }

      liftProgressRef.current = startProgress + (targetProgress - startProgress) * easedProgress;

      if (progress >= 1) {
        liftProgressRef.current = targetProgress;
        isLiftedRef.current = targetProgress > 0.5;

        if (isLiftedRef.current) {
          if (onHoverStart) {
            onHoverStart();
          }
        } else {
          if (onHoverEnd) {
            onHoverEnd();
          }
        }

        if (onLiftChange) {
          onLiftChange(isLiftedRef.current);
        }
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [duration, easing, onHoverStart, onHoverEnd, onLiftChange]);

  /**
   * Handle pointer enter
   */
  const handlePointerEnter = useCallback(() => {
    if (!enabledRef.current) return;
    animateLift(1);
  }, [animateLift]);

  /**
   * Handle pointer leave
   */
  const handlePointerLeave = useCallback(() => {
    if (!enabledRef.current) return;
    animateLift(0);
  }, [animateLift]);

  /**
   * Handle pointer move
   */
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!elementRef.current || !enabledRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    pointerPositionRef.current = { x, y };
  }, []);

  /**
   * Handle focus
   */
  const handleFocus = useCallback(() => {
    if (!enabledRef.current) return;
    animateLift(1);
  }, [animateLift]);

  /**
   * Handle blur
   */
  const handleBlur = useCallback(() => {
    if (!enabledRef.current) return;
    animateLift(0);
  }, [animateLift]);

  /**
   * Manually trigger lift
   */
  const lift = useCallback(() => {
    handlePointerEnter();
  }, [handlePointerEnter]);

  /**
   * Manually trigger drop
   */
  const drop = useCallback(() => {
    handlePointerLeave();
  }, [handlePointerLeave]);

  /**
   * Toggle lift state
   */
  const toggle = useCallback(() => {
    if (isLiftedRef.current) {
      drop();
    } else {
      lift();
    }
  }, [lift, drop]);

  /**
   * Set enabled/disabled
   */
  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    if (!enabled) {
      // Drop directly via animateLift so the exit animation still runs even
      // though enabledRef was just flipped to false (drop()/handlePointerLeave
      // early-return when disabled, which would skip the drop animation).
      animateLift(0);
    }
  }, [animateLift]);

  /**
   * Element ref callback
   */
  const elementRefCallback = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  /**
   * Get current state
   */
  const getState = useCallback((): HoverLiftState => ({
    isLifted: isLiftedRef.current,
    liftProgress: liftProgressRef.current,
    respectReducedMotion: shouldRespectReducedMotion,
    pointerPosition: pointerPositionRef.current
  }), [shouldRespectReducedMotion]);

  // Generate computed styles
  const style: React.CSSProperties = {
    transform: getTransform(liftProgressRef.current),
    boxShadow: getBoxShadow(liftProgressRef.current),
    transition: shouldRespectReducedMotion
      ? 'none'
      : `transform ${duration}ms ${easing}, box-shadow ${duration}ms ${easing}`,
    willChange: enabledRef.current && !shouldRespectReducedMotion ? 'transform, box-shadow' : 'auto'
  };

  // Generate event handlers
  const eventHandlers = {
    onMouseEnter: handlePointerEnter,
    onMouseLeave: handlePointerLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerMove: handlePointerMove
  };

  // Generate ARIA attributes
  const attributes = {
    'aria-pressed': isLiftedRef.current,
    'role': 'button'
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      /* c8 ignore start */ // reason: timeoutRef is declared but never assigned anywhere in the hook, so this cleanup branch is dead defensive code
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      /* c8 ignore end */
    };
  }, []);

  return {
    state: getState(),
    actions: {
      lift,
      drop,
      toggle,
      setEnabled
    },
    style,
    ref: elementRefCallback,
    eventHandlers,
    attributes
  };
}