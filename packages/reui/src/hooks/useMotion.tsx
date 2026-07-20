/**
 * Motion hook for managing animation states and configurations.
 * Provides headless animation functionality following Flutter patterns.
 *
 * @param props - Motion component properties
 * @returns Motion state and handlers
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MotionProps {
  /** Whether animation should respect user's motion preferences */
  respectReducedMotion?: boolean;
  /** Animation duration in seconds */
  duration?: number;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation easing function */
  easing?: string;
  /** Whether animation should loop */
  loop?: boolean;
  /** Animation trigger */
  trigger?: 'mount' | 'hover' | 'focus' | 'click' | 'manual';
  /** Whether animation is currently active */
  isActive?: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback when animation starts */
  onStart?: () => void;
}

export interface MotionState {
  /** Whether animation should run */
  shouldAnimate: boolean;
  /** Current animation variant */
  variant: 'hidden' | 'visible' | 'enter' | 'exit';
  /** Animation control object */
  controls: any;
  /** Whether component is mounted */
  isMounted: boolean;
}

export interface MotionHandlers {
  /** Start animation */
  startAnimation: () => void;
  /** Stop animation */
  stopAnimation: () => void;
  /** Toggle animation state */
  toggleAnimation: () => void;
  /** Set animation variant */
  setVariant: (variant: 'hidden' | 'visible' | 'enter' | 'exit') => void;
}

/**
 * Creates motion state and handlers for animated components.
 * Follows Flutter mixin patterns with composition over inheritance.
 */
export const useMotion = (props: MotionProps = {}): MotionState & MotionHandlers => {
  const {
    respectReducedMotion = true,
    duration = 0.3,
    delay = 0,
    easing = 'easeInOut',
    loop = false,
    trigger = 'mount',
    isActive: externalIsActive = false,
    onComplete,
    onStart,
  } = props;

  const [isMounted, setIsMounted] = useState(false);
  const [variant, setVariant] = useState<'hidden' | 'visible' | 'enter' | 'exit'>('hidden');
  const [isActive, setIsActive] = useState(false);
  const controlsRef = useRef<any>(null);

  // Check if user prefers reduced motion
  const prefersReducedMotion = respectReducedMotion &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shouldAnimate = !prefersReducedMotion;

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle trigger-based activation
  useEffect(() => {
    if (trigger === 'mount' && isMounted) {
      setIsActive(true);
    } else if (trigger === 'manual') {
      setIsActive(externalIsActive);
    }
  }, [trigger, isMounted, externalIsActive]);

  // Handle variant changes
  useEffect(() => {
    if (isActive && shouldAnimate) {
      setVariant('visible');
      onStart?.();
    } else if (!isActive) {
      setVariant('hidden');
    }
  }, [isActive, shouldAnimate, onStart]);

  // Create animation controls
  const controls = useMemo(() => ({
    animate: shouldAnimate ? variant : false,
    initial: 'hidden',
    exit: 'exit',
    transition: {
      duration,
      delay,
      ease: easing,
      repeat: loop ? Infinity : 0,
    },
    onAnimationComplete: onComplete,
  }), [shouldAnimate, variant, duration, delay, easing, loop, onComplete]);

  const startAnimation = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsActive(false);
  }, []);

  const toggleAnimation = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const setAnimationVariant = useCallback((newVariant: 'hidden' | 'visible' | 'enter' | 'exit') => {
    setVariant(newVariant);
  }, []);

  return useMemo(() => ({
    shouldAnimate,
    variant,
    controls,
    isMounted,
    startAnimation,
    stopAnimation,
    toggleAnimation,
    setVariant: setAnimationVariant,
  }), [shouldAnimate, variant, controls, isMounted, startAnimation, stopAnimation, toggleAnimation, setAnimationVariant]);
};

/**
 * Preset animation variants for common motion patterns.
 */
export const motionVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  rotate: {
    hidden: { opacity: 0, rotate: -180 },
    visible: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 180 },
  },
  bounce: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    },
    exit: { opacity: 0, scale: 0.3 },
  },
  shake: {
    hidden: { opacity: 0, x: 0 },
    visible: {
      opacity: 1,
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
      }
    },
    exit: { opacity: 0, x: 0 },
  },
  pulse: {
    hidden: { opacity: 0, scale: 1 },
    visible: {
      opacity: 1,
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    exit: { opacity: 0, scale: 1 },
  },
  flip: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
};