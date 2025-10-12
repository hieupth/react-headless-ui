/**
 * ParallaxScroll renderer component using headless useParallaxScroll hook.
 * Provides scroll-based parallax effects with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useParallaxScroll, type UseParallaxScrollProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface ParallaxScrollProps extends UseParallaxScrollProps {
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
    initial?: any;
    animate?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * ParallaxScroll component with scroll-based parallax effects.
 * Supports both CSS transforms and Framer Motion animations.
 */
export const ParallaxScroll = forwardRef<HTMLDivElement, ParallaxScrollProps>(({
  className = '',
  style,
  children,
  useMotion = false,
  variants,
  transition,
  ...parallaxProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    ref: elementRef
  } = useParallaxScroll(parallaxProps);

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
    'parallax-scroll',
    state.isActive ? 'parallax-active' : 'parallax-inactive',
    state.respectReducedMotion ? 'respect-reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    initial: {
      y: 0,
      x: 0
    },
    animate: {
      y: 0,
      x: 0,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.1
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    type: "tween" as const,
    ease: "easeOut",
    duration: 0.1
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
        initial="initial"
        animate="animate"
        variants={motionVariants}
        transition={motionTransition}
        data-testid="parallax-scroll-motion"
      >
        {children}
      </motion.div>
    );
  }

  // Render with CSS transforms
  return (
    <div
      ref={combinedRef}
      className={baseClasses}
      style={{
        ...hookStyle,
        ...style
      }}
      data-testid="parallax-scroll"
    >
      {children}
    </div>
  );
});

ParallaxScroll.displayName = 'ParallaxScroll';

export default ParallaxScroll;