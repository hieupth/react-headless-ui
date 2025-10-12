/**
 * RevealOnScroll renderer component using headless useRevealOnScroll hook.
 * Provides scroll-triggered reveal animations with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useRevealOnScroll, type UseRevealOnScrollProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface RevealOnScrollProps extends UseRevealOnScrollProps {
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
 * RevealOnScroll component with scroll-triggered animations.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const RevealOnScroll = forwardRef<HTMLDivElement, RevealOnScrollProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...revealProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    ref: elementRef,
    attributes
  } = useRevealOnScroll(revealProps);

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
    'reveal-on-scroll',
    state.isVisible ? 'reveal-visible' : 'reveal-hidden',
    state.hasRevealed ? 'reveal-has-revealed' : 'reveal-not-revealed',
    state.respectReducedMotion ? 'respect-reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants based on direction
  const getDefaultVariants = () => {
    const { direction = 'up', initialOffset = 30, initialOpacity = 0 } = revealProps;

    const getHiddenState = () => {
      switch (direction) {
        case 'up':
          return { y: initialOffset, opacity: initialOpacity };
        case 'down':
          return { y: -initialOffset, opacity: initialOpacity };
        case 'left':
          return { x: initialOffset, opacity: initialOpacity };
        case 'right':
          return { x: -initialOffset, opacity: initialOpacity };
        case 'scale':
          return { scale: 0.8, opacity: initialOpacity };
        case 'fade':
        default:
          return { opacity: initialOpacity };
      }
    };

    return {
      hidden: getHiddenState(),
      visible: {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        transition: {
          duration: (revealProps.duration || 600) / 1000,
          delay: (revealProps.delay || 0) / 1000,
          ease: revealProps.easing || 'easeOut'
        }
      }
    };
  };

  const defaultVariants = getDefaultVariants();

  // Default transition config
  const defaultTransition = {
    duration: (revealProps.duration || 600) / 1000,
    delay: (revealProps.delay || 0) / 1000,
    ease: revealProps.easing || 'easeOut'
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
        initial="hidden"
        animate={state.isVisible ? "visible" : "hidden"}
        variants={motionVariants}
        transition={motionTransition}
        {...attributes}
        data-testid="reveal-on-scroll-motion"
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
      {...attributes}
      data-testid="reveal-on-scroll"
    >
      {children}
    </div>
  );
});

RevealOnScroll.displayName = 'RevealOnScroll';

export default RevealOnScroll;