/**
 * Pulse renderer component using headless usePulse hook.
 * Provides pulse animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { usePulse, type UsePulseProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface PulseProps extends UsePulseProps {
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
    pulse?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * Pulse component with pulsing animation.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const Pulse = forwardRef<HTMLDivElement, PulseProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...pulseProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    style: hookStyle,
    attributes
  } = usePulse(pulseProps);

  // Base classes
  const baseClasses = [
    'pulse',
    state.isActive ? 'pulse-active' : 'pulse-inactive',
    state.isPaused ? 'pulse-paused' : '',
    state.isComplete ? 'pulse-complete' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    pulse: {
      scale: [1, 1 + (pulseProps.intensity || 0.2), 1],
      opacity: [1, 1 - (pulseProps.intensity || 0.2), 1],
      transition: {
        duration: (pulseProps.duration || 1000) / 1000,
        ease: "easeInOut",
        repeat: pulseProps.repeat === 0 ? Infinity : pulseProps.repeat,
        repeatDelay: (pulseProps.delay || 0) / 1000
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (pulseProps.duration || 1000) / 1000,
    ease: "easeInOut",
    repeat: pulseProps.repeat === 0 ? Infinity : pulseProps.repeat,
    repeatDelay: (pulseProps.delay || 0) / 1000
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
          // Override transform/opacity for Framer Motion
          transform: undefined,
          opacity: undefined
        }}
        animate={state.isActive ? "pulse" : "initial"}
        variants={motionVariants}
        transition={motionTransition}
        {...attributes}
        data-testid="pulse"
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
      data-testid="pulse"
    >
      {children}
    </div>
  );
});

Pulse.displayName = 'Pulse';

export default Pulse;