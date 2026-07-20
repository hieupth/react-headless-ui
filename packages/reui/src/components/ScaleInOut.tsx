/**
 * ScaleInOut renderer component using headless useScaleInOut hook.
 * Provides scale animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useScaleInOut, type UseScaleInOutProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface ScaleInOutProps extends UseScaleInOutProps {
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
    scaleIn?: any;
    scaleOut?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * ScaleInOut component with scale animation.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const ScaleInOut = forwardRef<HTMLDivElement, ScaleInOutProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...scaleInOutProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    style: hookStyle,
    attributes
  } = useScaleInOut(scaleInOutProps);

  // Base classes
  const baseClasses = [
    '',
    state.isActive ? '' : '',
    state.isPaused ? '' : '',
    state.isComplete ? '' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    scaleIn: {
      scale: scaleInOutProps.initialScale || 0.8,
      opacity: 0,
      transition: {
        duration: (scaleInOutProps.duration || 300) / 1000,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    scaleOut: {
      scale: scaleInOutProps.finalScale || 1,
      opacity: 1,
      transition: {
        duration: (scaleInOutProps.duration || 300) / 1000,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (scaleInOutProps.duration || 300) / 1000,
    ease: [0.4, 0, 0.2, 1],
    delay: (scaleInOutProps.delay || 0) / 1000
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Get transform origin for CSS
  const getTransformOrigin = () => {
    switch (scaleInOutProps.origin) {
      case 'top-left':
        return 'top left';
      case 'top-right':
        return 'top right';
      case 'bottom-left':
        return 'bottom left';
      case 'bottom-right':
        return 'bottom right';
      case 'center':
      default:
        return 'center';
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
          transformOrigin: getTransformOrigin(),
          // Override transform/opacity for Framer Motion
          transform: undefined,
          opacity: undefined
        }}
        initial="scaleIn"
        animate={state.isActive ? "scaleOut" : "scaleIn"}
        variants={motionVariants}
        transition={motionTransition}
        {...attributes}
        data-testid="scale-in-out"
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
        ...style,
        transformOrigin: getTransformOrigin()
      }}
      {...attributes}
      data-testid="scale-in-out"
    >
      {children}
    </div>
  );
});

ScaleInOut.displayName = 'ScaleInOut';

export default ScaleInOut;