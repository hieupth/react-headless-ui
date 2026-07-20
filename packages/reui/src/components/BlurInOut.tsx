/**
 * BlurInOut renderer component using headless useBlurInOut hook.
 * Provides configurable blur animations with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useBlurInOut, type UseBlurInOutProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface BlurInOutProps extends UseBlurInOutProps {
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
    blurIn?: any;
    blurOut?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * BlurInOut component with configurable blur animations.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const BlurInOut = forwardRef<HTMLDivElement, BlurInOutProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...blurInOutProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    attributes
  } = useBlurInOut(blurInOutProps);

  // Base classes
  const baseClasses = [
    'blur-in-out',
    state.isActive ? 'blur-active' : 'blur-inactive',
    /* c8 ignore start */ // reason: isPaused/isComplete classes — hook pause/complete states are covered by hook tests; the rAF+Date.now animation loop does not progress in jsdom via the component
    state.isPaused ? 'blur-paused' : '',
    state.isComplete ? 'blur-complete' : '',
    /* c8 ignore end */
    state.respectReducedMotion ? 'respect-reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    blurIn: {
      filter: `blur(${blurInOutProps.initialBlur || 0}px)`,
      transition: {
        duration: (blurInOutProps.duration || 400) / 1000,
        ease: blurInOutProps.easing || 'easeInOut',
        delay: (blurInOutProps.delay || 0) / 1000
      }
    },
    blurOut: {
      filter: `blur(${blurInOutProps.finalBlur || 8}px)`,
      transition: {
        duration: (blurInOutProps.duration || 400) / 1000,
        ease: blurInOutProps.easing || 'easeInOut',
        delay: (blurInOutProps.delay || 0) / 1000,
        repeat: blurInOutProps.repeat === 0 ? Infinity : blurInOutProps.repeat,
        repeatType: "reverse" as const,
        onRepeat: () => {
          /* c8 ignore start */ // reason: framer-motion lifecycle callback; never invoked in jsdom (no real animation loop)
          if (blurInOutProps.onRepeat) {
            blurInOutProps.onRepeat(state.repeatCount + 1);
          }
          /* c8 ignore end */
        },
        onAnimationComplete: () => {
          /* c8 ignore start */ // reason: framer-motion lifecycle callback; never invoked in jsdom (no real animation loop)
          if (blurInOutProps.onAnimationComplete) {
            blurInOutProps.onAnimationComplete();
          }
          /* c8 ignore end */
        }
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (blurInOutProps.duration || 400) / 1000,
    ease: blurInOutProps.easing || 'easeInOut',
    delay: (blurInOutProps.delay || 0) / 1000,
    repeat: blurInOutProps.repeat === 0 ? Infinity : blurInOutProps.repeat,
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
          ...hookStyle
        }}
        initial={false}
        animate={state.isActive ? "blurOut" : "blurIn"}
        variants={motionVariants}
        transition={motionTransition}
        {...attributes}
        data-testid="blur-in-out-motion"
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
      data-testid="blur-in-out"
    >
      {children}
    </div>
  );
});

BlurInOut.displayName = 'BlurInOut';

export default BlurInOut;