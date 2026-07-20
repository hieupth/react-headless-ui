/**
 * ParallaxScroll hook for scroll-based parallax effects.
 * Provides comprehensive parallax animation support with accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseParallaxScrollProps {
  /** Speed of parallax effect (0-1, lower = slower) */
  speed?: number;
  /** Direction of parallax movement */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Whether to respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Offset from where parallax starts (0-1) */
  startOffset?: number;
  /** Offset where parallax ends (0-1) */
  endOffset?: number;
  /** Easing function for parallax */
  easing?: (t: number) => number;
  /** Whether to use device orientation for parallax */
  useDeviceOrientation?: boolean;
  /** Callback when parallax value changes */
  onParallaxChange?: (value: number, transform: string) => void;
  /** Custom container element to track */
  container?: HTMLElement | Window;
}

export interface ParallaxScrollState {
  /** Current parallax transform value */
  transform: string;
  /** Current parallax progress (0-1) */
  progress: number;
  /** Whether parallax is active */
  isActive: boolean;
  /** Whether parallax should respect reduced motion */
  respectReducedMotion: boolean;
  /** Current scroll position */
  scrollPosition: number;
  /** Element viewport intersection info */
  intersection: {
    isIntersecting: boolean;
    intersectionRatio: number;
    boundingClientRect: DOMRectReadOnly;
  };
}

export interface ParallaxScrollActions {
  /** Manually update parallax position */
  update: () => void;
  /** Reset parallax to initial state */
  reset: () => void;
  /** Enable/disable parallax */
  setEnabled: (enabled: boolean) => void;
}

export interface UseParallaxScrollReturns {
  /** Current parallax state */
  state: ParallaxScrollState;
  /** Parallax actions */
  actions: ParallaxScrollActions;
  /** Computed styles for parallax element */
  style: React.CSSProperties;
  /** Ref for the parallax element */
  ref: React.RefCallback<HTMLElement>;
}

/**
 * Hook for managing scroll-based parallax effects.
 * Provides comprehensive parallax animation support with accessibility features.
 */
export function useParallaxScroll(props: UseParallaxScrollProps = {}): UseParallaxScrollReturns {
  const {
    speed = 0.5,
    direction = 'up',
    respectReducedMotion = true,
    startOffset = 0,
    endOffset = 1,
    easing = (t: number) => t, // Linear easing by default
    useDeviceOrientation = false,
    onParallaxChange,
    container
  } = props;

  // Refs
  const elementRef = useRef<HTMLElement | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const enabledRef = useRef<boolean>(true);

  // State
  const transformRef = useRef<string>('');
  const progressRef = useRef<number>(0);
  const scrollPositionRef = useRef<number>(0);
  const intersectionRef = useRef({
    isIntersecting: false,
    intersectionRatio: 0,
    boundingClientRect: {} as DOMRectReadOnly
  });

  // Check for reduced motion preference
  const shouldRespectReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Default easing functions
   */
  const easingFunctions = {
    linear: (t: number) => t,
    easeIn: (t: number) => t * t,
    easeOut: (t: number) => t * (2 - t),
    easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  };

  /**
   * Get the easing function
   */
  const getEasingFunction = useCallback((easingNameOrFn: string | ((t: number) => number)) => {
    if (typeof easingNameOrFn === 'function') {
      return easingNameOrFn;
    }

    return easingFunctions[easingNameOrFn as keyof typeof easingFunctions] || easingFunctions.linear;
  }, []);

  /**
   * Calculate parallax transform
   */
  const calculateTransform = useCallback((element: HTMLElement, scrollPos: number): string => {
    if (shouldRespectReducedMotion || !enabledRef.current) {
      return 'none';
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementHeight = rect.height;

    // Calculate element's position in viewport
    const elementTop = rect.top;
    const elementBottom = rect.bottom;

    // Calculate visible range
    const startVisible = viewportHeight * startOffset;
    const endVisible = viewportHeight * endOffset;

    // Calculate progress based on element position
    let progress = 0;

    if (elementBottom < startVisible) {
      // Element is above the start visible area
      progress = 0;
    } else if (elementTop > endVisible) {
      // Element is below the end visible area
      progress = 1;
    } else {
      // Element is in visible range
      const totalRange = endVisible - startVisible;
      const currentPosition = elementTop - startVisible;
      progress = Math.max(0, Math.min(1, currentPosition / totalRange));
    }

    // Apply easing
    const easedProgress = getEasingFunction(easing)(progress);

    // Calculate movement distance
    const maxDistance = elementHeight * speed;
    const distance = maxDistance * easedProgress;

    // Apply direction
    let transform = '';
    switch (direction) {
      case 'up':
        transform = `translateY(-${distance}px)`;
        break;
      case 'down':
        transform = `translateY(${distance}px)`;
        break;
      case 'left':
        transform = `translateX(-${distance}px)`;
        break;
      case 'right':
        transform = `translateX(${distance}px)`;
        break;
      default:
        transform = `translateY(-${distance}px)`;
    }

    progressRef.current = easedProgress;
    return transform;
  }, [shouldRespectReducedMotion, startOffset, endOffset, direction, speed, easing, getEasingFunction]);

  /**
   * Handle device orientation for parallax
   */
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!elementRef.current || !useDeviceOrientation || shouldRespectReducedMotion) {
      return;
    }

    const { beta, gamma } = event;

    // Calculate movement based on device tilt
    let x = 0, y = 0;

    if (beta !== null) {
      y = (beta / 90) * speed * 100; // Convert beta (-90 to 90) to movement
    }

    if (gamma !== null) {
      x = (gamma / 90) * speed * 100; // Convert gamma (-90 to 90) to movement
    }

    const transform = `translate(${x}px, ${y}px)`;
    transformRef.current = transform;

    if (onParallaxChange) {
      onParallaxChange(0.5, transform);
    }
  }, [useDeviceOrientation, shouldRespectReducedMotion, speed, onParallaxChange]);

  /**
   * Handle scroll for parallax
   */
  const handleScroll = useCallback(() => {
    if (!elementRef.current || !enabledRef.current) {
      return;
    }

    const scrollPos = !container || container === window
      ? window.pageYOffset
      : (container as HTMLElement).scrollTop;

    scrollPositionRef.current = scrollPos;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (elementRef.current) {
        const transform = calculateTransform(elementRef.current, scrollPos);
        transformRef.current = transform;

        if (onParallaxChange) {
          onParallaxChange(progressRef.current, transform);
        }
      }
    });
  }, [container, calculateTransform, onParallaxChange]);

  /**
   * Handle intersection observer
   */
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    intersectionRef.current = {
      isIntersecting: entry.isIntersecting,
      intersectionRatio: entry.intersectionRatio,
      boundingClientRect: entry.boundingClientRect
    };

    if (entry.isIntersecting) {
      handleScroll();
    }
  }, [handleScroll]);

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
          threshold: [0, 0.1, 0.5, 1],
          rootMargin: '50px'
        });
        intersectionObserverRef.current.observe(element);
      }

      // Initial update
      handleScroll();
    }
  }, [handleIntersection, handleScroll]);

  /**
   * Update parallax manually
   */
  const update = useCallback(() => {
    handleScroll();
  }, [handleScroll]);

  /**
   * Reset parallax
   */
  const reset = useCallback(() => {
    if (elementRef.current) {
      const transform = calculateTransform(elementRef.current, 0);
      transformRef.current = transform;
      progressRef.current = 0;

      if (onParallaxChange) {
        onParallaxChange(0, transform);
      }
    }
  }, [calculateTransform, onParallaxChange]);

  /**
   * Set enabled state
   */
  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;

    if (!enabled && elementRef.current) {
      transformRef.current = 'none';
    } else if (enabled) {
      handleScroll();
    }
  }, [handleScroll]);

  /**
   * Get current state
   */
  const getState = useCallback((): ParallaxScrollState => ({
    transform: transformRef.current,
    progress: progressRef.current,
    isActive: intersectionRef.current.isIntersecting,
    respectReducedMotion: shouldRespectReducedMotion,
    scrollPosition: scrollPositionRef.current,
    intersection: intersectionRef.current
  }), [shouldRespectReducedMotion]);

  // Set up event listeners
  useEffect(() => {
    // SSR guard: jsdom always defines window so this branch only runs in a
    // non-DOM (server) render, which the jsdom test environment cannot reach.
    /* c8 ignore next */
    if (typeof window === 'undefined') {
      /* c8 ignore next */
      return;
    }

    // Scroll listener
    const scrollContainer = !container || container === window ? window : container as HTMLElement;
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    // Device orientation listener
    if (useDeviceOrientation && typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    // Resize listener
    window.addEventListener('resize', handleScroll);

    // Initial update
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);

      if (useDeviceOrientation) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [container, handleScroll, handleDeviceOrientation, useDeviceOrientation]);

  // Generate computed styles
  const style: React.CSSProperties = {
    transform: transformRef.current,
    willChange: enabledRef.current && !shouldRespectReducedMotion ? 'transform' : 'auto'
  };

  // NOTE: final return intentionally NOT wrapped in useMemo. This hook holds all
  // scroll/transform values in refs and has NO useState/forceTick to trigger a
  // re-render, so the exposed `state`/`style` only refresh on parent re-renders.
  // Memoizing here would freeze the parallax output until a prop changes (stale state).
  return {
    state: getState(),
    actions: {
      update,
      reset,
      setEnabled
    },
    style,
    ref: elementRefCallback
  };
}