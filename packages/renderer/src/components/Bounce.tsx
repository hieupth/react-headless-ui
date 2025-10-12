/**
 * Bounce renderer component using headless useBounce hook.
 * Provides bounce animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useBounce, type UseBounceProps } from '@react-ui-forge/core';
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
    computed,
    style: hookStyle,
    attributes
  } = useBounce(bounceProps);

  // Base classes
  const baseClasses = [
    'bounce',
    state.isActive ? 'bounce-active' : 'bounce-inactive',
    state.isPaused ? 'bounce-paused' : '',
    state.isComplete ? 'bounce-complete' : '',
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
        onRepeat: () => {
          if (bounceProps.onRepeat) {
            bounceProps.onRepeat(state.repeatCount + 1);
          }
        },
        onAnimationComplete: () => {
          if (bounceProps.onAnimationComplete) {
            bounceProps.onAnimationComplete();
          }
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

  // Get transform values for CSS
  const getTransformValues = () => {
    const intensity = bounceProps.intensity || 1;
    const baseAmount = 20 * intensity;

    switch (bounceProps.direction) {
      case 'up':
        return { translateY: baseAmount };
      case 'down':
        return { translateY: -baseAmount };
      case 'left':
        return { translateX: baseAmount };
      case 'right':
        return { translateX: -baseAmount };
      default:
        return { translateY: baseAmount };
    }
  };

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