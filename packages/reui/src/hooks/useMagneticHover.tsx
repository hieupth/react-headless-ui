/**
 * MagneticHover hook for magnetic hover effects that follow mouse cursor.
 * Provides comprehensive magnetic hover animations with accessibility support.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseMagneticHoverProps {
  /** Magnetic strength in pixels (how far element follows cursor) */
  strength?: number;
  /** Whether to respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Whether to scale on hover */
  scale?: boolean;
  /** Scale factor on hover */
  scaleFactor?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether to disable magnetic effects */
  disabled?: boolean;
  /** Boundary to constrain movement ('parent', 'viewport', or none) */
  boundary?: 'parent' | 'viewport' | 'none';
  /** Callback when magnetic movement starts */
  onMagneticStart?: () => void;
  /** Callback when magnetic movement ends */
  onMagneticEnd?: () => void;
  /** Callback when position changes */
  onPositionChange?: (x: number, y: number) => void;
}

export interface MagneticHoverState {
  /** Whether element is currently hovered */
  isHovered: boolean;
  /** Current magnetic position */
  position: {
    x: number;
    y: number;
  };
  /** Current pointer position relative to element */
  pointerPosition: {
    x: number;
    y: number;
  };
  /** Whether magnetic effects should respect reduced motion */
  respectReducedMotion: boolean;
  /** Current scale (1 = no scale) */
  currentScale: number;
}

export interface MagneticHoverActions {
  /** Manually trigger magnetic hover */
  start: () => void;
  /** Manually end magnetic hover */
  end: () => void;
  /** Enable/disable magnetic effects */
  setEnabled: (enabled: boolean) => void;
  /** Reset to center position */
  reset: () => void;
}

export interface UseMagneticHoverReturns {
  /** Current magnetic hover state */
  state: MagneticHoverState;
  /** Magnetic hover actions */
  actions: MagneticHoverActions;
  /** Computed styles for magnetic hover element */
  style: React.CSSProperties;
  /** Ref for the magnetic hover element */
  ref: React.RefCallback<HTMLElement>;
  /** Event handlers for element */
  eventHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseMove: (event: React.MouseEvent) => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onPointerMove: (event: React.PointerEvent) => void;
  };
}

/**
 * Hook for managing magnetic hover effects.
 * Provides comprehensive magnetic hover animations with accessibility features.
 */
export function useMagneticHover(props: UseMagneticHoverProps = {}): UseMagneticHoverReturns {
  const {
    strength = 20,
    respectReducedMotion = true,
    scale = true,
    scaleFactor = 1.05,
    duration = 300,
    easing = 'ease-out',
    disabled = false,
    boundary = 'parent',
    onMagneticStart,
    onMagneticEnd,
    onPositionChange
  } = props;

  // Refs
  const elementRef = useRef<HTMLElement | null>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const enabledRef = useRef<boolean>(!disabled);

  // State
  const isHoveredRef = useRef<boolean>(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const pointerPositionRef = useRef({ x: 0, y: 0 });
  const currentScaleRef = useRef<number>(1);
  const elementCenterRef = useRef({ x: 0, y: 0 });

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Calculate element center point
   */
  const calculateElementCenter = useCallback(() => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    elementCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }, []);

  /**
   * Check if position is within boundary
   */
  const isWithinBoundary = useCallback((x: number, y: number): boolean => {
    if (boundary === 'none') return true;
    // elementRef is guaranteed non-null here: the sole caller
    // (calculateMagneticPosition) bails on `!elementRef.current` before invoking
    // this, so the redundant early-return guard was removed. Assert non-null for
    // the typechecker.
    const el = elementRef.current!;
    const rect = el.getBoundingClientRect();

    if (boundary === 'viewport') {
      return true; // Allow movement within viewport
    }

    if (boundary === 'parent' && parentRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      return (
        x >= parentRect.left &&
        x <= parentRect.right &&
        y >= parentRect.top &&
        y <= parentRect.bottom
      );
    }

    return true;
  }, [boundary]);

  /**
   * Calculate magnetic position based on pointer position
   */
  const calculateMagneticPosition = useCallback((pointerX: number, pointerY: number): { x: number; y: number } => {
    if (shouldRespectReducedMotion || !enabledRef.current || !elementRef.current) {
      return { x: 0, y: 0 };
    }

    const centerX = elementCenterRef.current.x;
    const centerY = elementCenterRef.current.y;

    // Calculate distance from center
    const deltaX = pointerX - centerX;
    const deltaY = pointerY - centerY;

    // Calculate distance and apply strength
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = strength;

    let magneticX = 0;
    let magneticY = 0;

    if (distance > 0) {
      // Normalize and apply strength
      const factor = Math.min(distance / maxDistance, 1);
      const magneticFactor = factor * strength;

      magneticX = (deltaX / distance) * magneticFactor;
      magneticY = (deltaY / distance) * magneticFactor;
    }

    // Apply boundary constraints
    const finalX = centerX + magneticX;
    const finalY = centerY + magneticY;

    if (!isWithinBoundary(finalX, finalY)) {
      return { x: 0, y: 0 };
    }

    return { x: magneticX, y: magneticY };
  }, [strength, shouldRespectReducedMotion, isWithinBoundary]);

  /**
   * Animate to target position
   */
  const animateToPosition = useCallback((targetX: number, targetY: number, targetScale: number) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startX = positionRef.current.x;
    const startY = positionRef.current.y;
    const startScale = currentScaleRef.current;
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

      positionRef.current.x = startX + (targetX - startX) * easedProgress;
      positionRef.current.y = startY + (targetY - startY) * easedProgress;
      currentScaleRef.current = startScale + (targetScale - startScale) * easedProgress;

      if (onPositionChange) {
        onPositionChange(positionRef.current.x, positionRef.current.y);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [duration, easing, onPositionChange]);

  /**
   * Handle pointer enter
   */
  const handlePointerEnter = useCallback(() => {
    if (!enabledRef.current) return;

    isHoveredRef.current = true;
    calculateElementCenter();

    if (onMagneticStart) {
      onMagneticStart();
    }
  }, [calculateElementCenter, onMagneticStart]);

  /**
   * Handle pointer leave
   */
  const handlePointerLeave = useCallback(() => {
    if (!enabledRef.current) return;

    isHoveredRef.current = false;

    // Animate back to center
    animateToPosition(0, 0, 1);

    if (onMagneticEnd) {
      onMagneticEnd();
    }
  }, [animateToPosition, onMagneticEnd]);

  /**
   * Handle pointer move
   */
  const handlePointerMove = useCallback((event: React.MouseEvent | React.PointerEvent) => {
    if (!isHoveredRef.current || !enabledRef.current) return;

    const pointerX = event.clientX;
    const pointerY = event.clientY;

    pointerPositionRef.current = { x: pointerX, y: pointerY };

    // Calculate magnetic position
    const magneticPos = calculateMagneticPosition(pointerX, pointerY);
    const targetScale = scale ? scaleFactor : 1;

    // Animate to magnetic position
    animateToPosition(magneticPos.x, magneticPos.y, targetScale);
  }, [calculateMagneticPosition, scale, scaleFactor, animateToPosition]);

  /**
   * Manually start magnetic hover
   */
  const start = useCallback(() => {
    handlePointerEnter();
  }, [handlePointerEnter]);

  /**
   * Manually end magnetic hover
   */
  const end = useCallback(() => {
    handlePointerLeave();
  }, [handlePointerLeave]);

  /**
   * Set enabled/disabled
   */
  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    if (!enabled) {
      reset();
    }
  }, []);

  /**
   * Reset to center position
   */
  const reset = useCallback(() => {
    isHoveredRef.current = false;
    positionRef.current = { x: 0, y: 0 };
    currentScaleRef.current = 1;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  /**
   * Element ref callback
   */
  const elementRefCallback = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;

    if (element) {
      // Find parent for boundary constraint
      if (boundary === 'parent') {
        parentRef.current = element.parentElement;
      }

      calculateElementCenter();
    }
  }, [calculateElementCenter, boundary]);

  /**
   * Get current state
   */
  const getState = useCallback((): MagneticHoverState => ({
    isHovered: isHoveredRef.current,
    position: positionRef.current,
    pointerPosition: pointerPositionRef.current,
    respectReducedMotion: shouldRespectReducedMotion,
    currentScale: currentScaleRef.current
  }), [shouldRespectReducedMotion]);

  // Generate computed styles
  const style: React.CSSProperties = {
    transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${currentScaleRef.current})`,
    transition: shouldRespectReducedMotion
      ? 'none'
      : `transform ${duration}ms ${easing}`,
    willChange: enabledRef.current && !shouldRespectReducedMotion ? 'transform' : 'auto'
  };

  // Generate event handlers
  const eventHandlers = {
    onMouseEnter: handlePointerEnter,
    onMouseLeave: handlePointerLeave,
    onMouseMove: handlePointerMove,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerMove: handlePointerMove
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // NOTE: This hook is intentionally NOT wrapped in useMemo. All of its state
  // (isHovered, position, scale, enabled) lives in refs that are mutated
  // imperatively by animation frames and pointer handlers — none of which
  // trigger a React re-render or appear in any dependency array. Memoizing the
  // returned `state`/`style` (which snapshot these refs) would freeze a stale
  // snapshot across renders, breaking tests that read state after an action and
  // making the returned style reflect a pre-animation position. Returning a
  // fresh object literal each render is the correct behavior here.
  return {
    state: getState(),
    actions: {
      start,
      end,
      setEnabled,
      reset
    },
    style,
    ref: elementRefCallback,
    eventHandlers
  };
}