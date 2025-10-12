/**
 * SlideIn renderer component using headless useSlideIn hook.
 * Provides slide in/out animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlideIn, type UseSlideInProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface SlideInProps extends UseSlideInProps {
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
 * SlideIn component with slide in/out animations.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...slideInProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    style: hookStyle,
    attributes
  } = useSlideIn(slideInProps);

  // Base classes
  const baseClasses = [
    'slide-in',
    state.isAnimating ? 'slide-animating' : '',
    state.isVisible ? 'slide-visible' : 'slide-hidden',
    state.isComplete ? 'slide-complete' : '',
    `slide-${state.direction}`,
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const getVariants = (direction: string) => {
    const distance = slideInProps.distance || 20;
    const duration = (slideInProps.duration || 300) / 1000;
    const delay = (slideInProps.delay || 0) / 1000;
    const easing = slideInProps.easing || 'easeInOut';

    switch (direction) {
      case 'up':
        return {
          hidden: { y: distance, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
      case 'down':
        return {
          hidden: { y: -distance, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
      case 'left':
        return {
          hidden: { x: distance, opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      case 'right':
        return {
          hidden: { x: -distance, opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      default:
        return {
          hidden: { y: distance, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (slideInProps.duration || 300) / 1000,
    ease: slideInProps.easing || 'easeInOut',
    delay: (slideInProps.delay || 0) / 1000
  };

  // Get variants for current direction
  const motionVariants = variants ? { ...getVariants(state.direction), ...variants } : getVariants(state.direction);
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
              ...style,
              // Override transform for Framer Motion
              transform: undefined
            }}
            initial="hidden"
            animate={state.isVisible ? "visible" : "hidden"}
            exit="hidden"
            variants={motionVariants}
            transition={motionTransition}
            {...attributes}
            data-testid="slide-in"
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
      data-testid="slide-in"
    >
      {children}
    </div>
  );
});

SlideIn.displayName = 'SlideIn';

export default SlideIn;