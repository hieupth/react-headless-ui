/**
 * Bounce renderer component using headless useBounce hook.
 * Provides bounce animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useBounce, type UseBounceProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface BounceProps extends UseBounceProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Component content */
  children?: React.ReactNode;
  /** Whether to use Framer Motion for enhanced animations */
  useMotion?: boolean;
  /** Framer Motion animation variants */
  variants?: {
    bounce?: any;
    static?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * Bounce component with bounce animation.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const Bounce = forwardRef<HTMLDivElement, BounceProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...bounceProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    attributes
  } = useBounce(bounceProps);

  // Base classes
  const baseClasses = [
    'bounce',
    state.isActive ? 'bounce-active' : 'bounce-inactive',
    // reason: isPaused/isComplete live in refs inside useBounce that never
    // trigger a React re-render, and any re-render re-runs the init effect and
    // restarts the animation (clearing the refs). Their true outcomes are thus
    // transient and unobservable through the component, in jsdom and beyond.
    /* c8 ignore start */
    state.isPaused ? 'bounce-paused' : '',
    state.isComplete ? 'bounce-complete' : '',
    /* c8 ignore end */
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    static: {
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        duration: (bounceProps.duration || 800) / 1000,
        ease: bounceProps.easing || 'easeInOut',
        delay: (bounceProps.delay || 0) / 1000
      }
    },
    bounce: {
      scale: 1,
      y: bounceProps.direction === 'up' ? -20 * (bounceProps.intensity || 1) :
         bounceProps.direction === 'down' ? 20 * (bounceProps.intensity || 1) : 0,
      x: bounceProps.direction === 'left' ? -20 * (bounceProps.intensity || 1) :
         bounceProps.direction === 'right' ? 20 * (bounceProps.intensity || 1) : 0,
      transition: {
        duration: (bounceProps.duration || 800) / 1000,
        ease: [0.68, -0.55, 0.265, 1.55], // Custom bounce easing
        delay: (bounceProps.delay || 0) / 1000,
        repeat: bounceProps.repeat === 0 ? Infinity : bounceProps.repeat,
        repeatType: "reverse" as const,
        // reason: jsdom does not drive Framer Motion's animation loop, so these
        // callbacks only fire under a real animation runtime.
        onRepeat: () => {
          /* c8 ignore start */
          if (bounceProps.onRepeat) {
            bounceProps.onRepeat(state.repeatCount + 1);
          }
          /* c8 ignore end */
        },
        onAnimationComplete: () => {
          /* c8 ignore start */
          if (bounceProps.onAnimationComplete) {
            bounceProps.onAnimationComplete();
          }
          /* c8 ignore end */
        }
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (bounceProps.duration || 800) / 1000,
    ease: [0.68, -0.55, 0.265, 1.55],
    delay: (bounceProps.delay || 0) / 1000,
    repeat: bounceProps.repeat === 0 ? Infinity : bounceProps.repeat,
    repeatType: "reverse" as const
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Render with Framer Motion
  if (useMotion) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        style={{
          ...style,
          // Override transform for Framer Motion
          transform: undefined
        }}
        initial={false}
        animate={state.isActive ? "bounce" : "static"}
        variants={motionVariants}
        transition={motionTransition}
        {...attributes}
        data-testid="bounce"
      >
        {children}
      </motion.div>
    );
  }

  // Render with CSS transitions
  return (
    <div
      ref={ref}
      className={baseClasses}
      style={{
        ...hookStyle,
        ...style
      }}
      {...attributes}
      data-testid="bounce"
    >
      {children}
    </div>
  );
});

Bounce.displayName = 'Bounce';

export default Bounce;