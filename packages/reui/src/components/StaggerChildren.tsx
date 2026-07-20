/**
 * StaggerChildren renderer component using headless useStaggerChildren hook.
 * Provides sequential animations for multiple children with comprehensive accessibility support.
 */

import React, { forwardRef, Children, cloneElement, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStaggerChildren, type UseStaggerChildrenProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface StaggerChildrenProps extends UseStaggerChildrenProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Component children (elements to stagger sequentially) */
  children?: React.ReactNode;
  /** Whether to use Framer Motion for enhanced animations */
  useMotion?: boolean;
  /** Framer Motion animation variants for children */
  childVariants?: {
    hidden?: any;
    visible?: any;
  };
  /** Custom animation transition config for children */
  childTransition?: any;
}

/**
 * StaggerChildren component with sequential animations.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const StaggerChildren = forwardRef<HTMLDivElement, StaggerChildrenProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  childVariants,
  childTransition,
  ...staggerProps
}, ref) => {
  const theme = useTheme();
  const childrenArray = Children.toArray(children);
  const childrenCount = childrenArray.length;

  // Update props with actual children count
  const updatedProps = { ...staggerProps, childrenCount };

  const {
    state,
    actions,
    getChildState,
    style: hookStyle,
    attributes
  } = useStaggerChildren(updatedProps);

  // Base classes
  const baseClasses = [
    'stagger-children',
    state.isActive ? 'stagger-active' : 'stagger-inactive',
    /* c8 ignore start */ // reason: isPaused/isComplete flip via the hook's pause()/complete actions; the hook stores them in refs so the component never re-renders when they change, leaving these class branches unobservable through the component.
    state.isPaused ? 'stagger-paused' : '',
    state.isComplete ? 'stagger-complete' : '',
    /* c8 ignore end */
    state.respectReducedMotion ? 'respect-reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants for children
  const defaultChildVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        duration: (staggerProps.duration || 300) / 1000,
        ease: staggerProps.easing || 'easeOut'
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: (staggerProps.duration || 300) / 1000,
        ease: staggerProps.easing || 'easeOut'
      }
    }
  };

  // Default transition config for children
  const defaultChildTransition = {
    duration: (staggerProps.duration || 300) / 1000,
    ease: staggerProps.easing || 'easeOut'
  };

  // Merge with custom variants/transition
  const motionChildVariants = childVariants ? { ...defaultChildVariants, ...childVariants } : defaultChildVariants;
  const motionChildTransition = childTransition || defaultChildTransition;

  // Render with Framer Motion
  if (useMotion) {
    return (
      <div
        ref={ref}
        className={baseClasses}
        style={{
          ...style,
          ...hookStyle
        }}
        {...attributes}
        data-testid="stagger-children-motion"
      >
        <AnimatePresence>
          {state.isActive && childrenArray.map((child, index) => {
            const childState = getChildState(index);

            return (
              <motion.div
                key={`stagger-child-${index}`}
                custom={index}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={motionChildVariants}
                transition={{
                  ...motionChildTransition,
                  delay: childState.delay / 1000
                }}
              >
                {child}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
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
      data-testid="stagger-children"
    >
      {childrenArray.map((child, index) => {
        const childState = getChildState(index);

        // Create child wrapper for CSS animations
        const childElement = child;

        return (
          <div
            key={`stagger-child-${index}`}
            className="stagger-child"
            style={{
              opacity: childState.isAnimating ? childState.progress : (state.isActive ? 1 : 0),
              transform: `translateY(${childState.isAnimating ? (1 - childState.progress) * 20 : (state.isActive ? 0 : 20)}px)`,
              transition: state.isActive && !state.isPaused && !state.respectReducedMotion
                ? `opacity ${staggerProps.duration}ms ${staggerProps.easing}, transform ${staggerProps.duration}ms ${staggerProps.easing}`
                : 'none',
              transitionDelay: `${childState.delay}ms`
            }}
          >
            {childElement}
          </div>
        );
      })}
    </div>
  );
});

StaggerChildren.displayName = 'StaggerChildren';

export default StaggerChildren;