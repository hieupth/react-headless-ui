/**
 * MagneticHover renderer component using headless useMagneticHover hook.
 * Provides magnetic hover effects that follow mouse cursor with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useMagneticHover, type UseMagneticHoverProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface MagneticHoverProps extends UseMagneticHoverProps {
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
    resting?: any;
    magnetic?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * MagneticHover component with magnetic hover effects.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const MagneticHover = forwardRef<HTMLDivElement, MagneticHoverProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...magneticHoverProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    ref: elementRef,
    eventHandlers
  } = useMagneticHover(magneticHoverProps);

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    elementRef(node);
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Base classes
  const baseClasses = [
    'magnetic-hover',
    state.isHovered ? 'magnetic-active' : 'magnetic-inactive',
    state.respectReducedMotion ? 'respect-reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const { strength = 20, scale = true, scaleFactor = 1.05 } = magneticHoverProps;

  const defaultVariants = {
    resting: {
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: (magneticHoverProps.duration || 300) / 1000,
        ease: magneticHoverProps.easing || 'easeOut',
        type: 'tween'
      }
    },
    magnetic: {
      x: strength / 2, // Half strength as preview
      y: strength / 2,
      scale: scale ? scaleFactor : 1,
      transition: {
        duration: (magneticHoverProps.duration || 300) / 1000,
        ease: magneticHoverProps.easing || 'easeOut',
        type: 'tween'
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (magneticHoverProps.duration || 300) / 1000,
    ease: magneticHoverProps.easing || 'easeOut',
    type: 'tween' as const
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Render with Framer Motion
  if (useMotion) {
    return (
      <motion.div
        ref={combinedRef}
        className={baseClasses}
        style={{
          ...style,
          ...hookStyle
        }}
        initial="resting"
        animate={state.isHovered ? "magnetic" : "resting"}
        variants={motionVariants}
        transition={motionTransition}
        whileHover="magnetic"
        {...eventHandlers}
        data-testid="magnetic-hover-motion"
      >
        {children}
      </motion.div>
    );
  }

  // Render with CSS transitions
  return (
    <div
      ref={combinedRef}
      className={baseClasses}
      style={{
        ...hookStyle,
        ...style
      }}
      {...eventHandlers}
      data-testid="magnetic-hover"
    >
      {children}
    </div>
  );
});

MagneticHover.displayName = 'MagneticHover';

export default MagneticHover;