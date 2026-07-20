/**
 * RotateIn renderer component using headless useRotateIn hook.
 * Provides rotation animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useRotateIn, type UseRotateInProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface RotateInProps extends UseRotateInProps {
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
    rotateIn?: any;
    rotateOut?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * RotateIn component with rotation animation.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const RotateIn = forwardRef<HTMLDivElement, RotateInProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...rotateInProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    attributes
  } = useRotateIn(rotateInProps);

  // Base classes
  const baseClasses = [
    'rotate-in',
    state.isActive ? 'rotate-in-active' : 'rotate-in-inactive',
    /* c8 ignore start */ // reason: isPaused/isComplete classes — hook pause/complete states are covered by hook tests; the rAF+Date.now animation loop does not progress in jsdom via the component
    state.isPaused ? 'rotate-in-paused' : '',
    state.isComplete ? 'rotate-in-complete' : '',
    /* c8 ignore end */
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    rotateIn: {
      rotate: rotateInProps.direction === 'counter-clockwise'
        ? -(rotateInProps.initialAngle || 0)
        : (rotateInProps.initialAngle || 0),
      opacity: 0,
      transition: {
        duration: (rotateInProps.duration || 600) / 1000,
        ease: rotateInProps.easing || 'easeInOut',
        delay: (rotateInProps.delay || 0) / 1000
      }
    },
    rotateOut: {
      rotate: rotateInProps.direction === 'counter-clockwise'
        ? -(rotateInProps.finalAngle || 360)
        : (rotateInProps.finalAngle || 360),
      opacity: 1,
      transition: {
        duration: (rotateInProps.duration || 600) / 1000,
        ease: rotateInProps.easing || 'easeInOut'
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (rotateInProps.duration || 600) / 1000,
    ease: rotateInProps.easing || 'easeInOut',
    delay: (rotateInProps.delay || 0) / 1000
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Calculate animation repeat for Framer Motion
  const getRepeatCount = () => {
    const repeat = rotateInProps.repeat || 0;
    return repeat === 0 ? Infinity : repeat;
  };

  // Calculate rotation direction for Framer Motion
  const getRotationAngle = (angle: number) => {
    return rotateInProps.direction === 'counter-clockwise' ? -angle : angle;
  };

  // Render with Framer Motion
  if (useMotion) {
    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        style={{
          ...style,
          // Override transform/opacity for Framer Motion
          transform: undefined,
          opacity: undefined
        }}
        initial={false}
        animate={state.isActive ? "rotateOut" : "rotateIn"}
        variants={{
          rotateIn: {
            rotate: getRotationAngle(rotateInProps.initialAngle || 0),
            opacity: 0,
            transition: motionTransition
          },
          rotateOut: {
            rotate: getRotationAngle(rotateInProps.finalAngle || 360),
            opacity: 1,
            transition: {
              ...motionTransition,
              repeat: getRepeatCount(),
              repeatType: "loop",
              onRepeat: () => {
                /* c8 ignore start */ // reason: framer-motion lifecycle callback; never invoked in jsdom (no real animation loop)
                if (rotateInProps.onRepeat) {
                  rotateInProps.onRepeat(state.repeatCount + 1);
                }
                /* c8 ignore end */
              },
              onAnimationComplete: () => {
                /* c8 ignore start */ // reason: framer-motion lifecycle callback; never invoked in jsdom (no real animation loop)
                if (rotateInProps.onAnimationComplete) {
                  rotateInProps.onAnimationComplete();
                }
                /* c8 ignore end */
              }
            }
          }
        }}
        {...attributes}
        data-testid="rotate-in"
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
      data-testid="rotate-in"
    >
      {children}
    </div>
  );
});

RotateIn.displayName = 'RotateIn';

export default RotateIn;