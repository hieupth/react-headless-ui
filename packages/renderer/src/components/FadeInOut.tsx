/**
 * FadeInOut renderer component using headless useFadeInOut hook.
 * Provides fade in/out animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFadeInOut, type UseFadeInOutProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface FadeInOutProps extends UseFadeInOutProps {
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
    hidden?: any;
    visible?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * FadeInOut component with fade in/out animations.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const FadeInOut = forwardRef<HTMLDivElement, FadeInOutProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...fadeInOutProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    style: hookStyle,
    attributes
  } = useFadeInOut(fadeInOutProps);

  // Base classes
  const baseClasses = [
    'fade-in-out',
    state.isAnimating ? 'fade-animating' : '',
    state.isVisible ? 'fade-visible' : 'fade-hidden',
    state.isComplete ? 'fade-complete' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: (fadeInOutProps.duration || 300) / 1000,
        ease: fadeInInOutProps.easing || 'easeInOut',
        delay: (fadeInInOutProps.delay || 0) / 1000
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: (fadeInOutProps.duration || 300) / 1000,
        ease: fadeInInOutProps.easing || 'easeInOut',
        delay: (fadeInInOutProps.delay || 0) / 1000
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (fadeInOutProps.duration || 300) / 1000,
    ease: fadeInInOutProps.easing || 'easeInOut',
    delay: (fadeInInOutProps.delay || 0) / 1000
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Render with Framer Motion
  if (useMotion) {
    return (
      <AnimatePresence>
        {computed.shouldRender && (
          <motion.div
            ref={ref}
            className={baseClasses}
            style={{
              ...hookStyle,
              ...style,
              // Override opacity for Framer Motion
              opacity: undefined
            }}
            initial="hidden"
            animate={state.isVisible ? "visible" : "hidden"}
            exit="hidden"
            variants={motionVariants}
            transition={motionTransition}
            {...attributes}
            data-testid="fade-in-out"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
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
      data-testid="fade-in-out"
    >
      {children}
    </div>
  );
});

FadeInOut.displayName = 'FadeInOut';

export default FadeInOut;