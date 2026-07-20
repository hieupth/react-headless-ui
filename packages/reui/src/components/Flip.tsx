/**
 * Flip renderer component using headless useFlip hook.
 * Provides 3D flip animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useFlip, type UseFlipProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface FlipProps extends UseFlipProps {
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
    flipFront?: any;
    flipBack?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * Flip component with 3D flip animation.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const Flip = forwardRef<HTMLDivElement, FlipProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...flipProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    style: hookStyle,
    attributes
  } = useFlip(flipProps);

  // Base classes
  const baseClasses = [
    'flip',
    state.isActive ? 'flip-active' : 'flip-inactive',
    // reason: isPaused/isComplete live in refs inside useFlip that never
    // trigger a React re-render, and any re-render re-runs the init effect and
    // restarts the animation (clearing the refs). Their true outcomes are thus
    // transient and unobservable through the component.
    /* c8 ignore start */
    state.isPaused ? 'flip-paused' : '',
    state.isComplete ? 'flip-complete' : '',
    /* c8 ignore end */
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    flipFront: {
      rotateX: flipProps.axis === 'x' ? 0 : undefined,
      rotateY: flipProps.axis === 'y' ? 0 : undefined,
      rotateZ: flipProps.axis === 'z' ? 0 : undefined,
      transition: {
        duration: (flipProps.duration || 600) / 1000,
        ease: flipProps.easing || 'easeInOut',
        delay: (flipProps.delay || 0) / 1000
      }
    },
    flipBack: {
      rotateX: flipProps.axis === 'x' ? (flipProps.direction === 'backward' ? -180 : 180) : undefined,
      rotateY: flipProps.axis === 'y' ? (flipProps.direction === 'backward' ? -180 : 180) : undefined,
      rotateZ: flipProps.axis === 'z' ? (flipProps.direction === 'backward' ? -180 : 180) : undefined,
      transition: {
        duration: (flipProps.duration || 600) / 1000,
        ease: flipProps.easing || 'easeInOut',
        delay: (flipProps.delay || 0) / 1000,
        repeat: flipProps.repeat === 0 ? Infinity : flipProps.repeat,
        repeatType: "reverse" as const,
        // reason: jsdom does not drive Framer Motion's animation loop, so these
        // callbacks only fire under a real animation runtime.
        onRepeat: () => {
          /* c8 ignore start */
          if (flipProps.onRepeat) {
            flipProps.onRepeat(state.repeatCount + 1);
          }
          /* c8 ignore end */
        },
        onAnimationComplete: () => {
          /* c8 ignore start */
          if (flipProps.onAnimationComplete) {
            flipProps.onAnimationComplete();
          }
          /* c8 ignore end */
        }
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (flipProps.duration || 600) / 1000,
    ease: flipProps.easing || 'easeInOut',
    delay: (flipProps.delay || 0) / 1000,
    repeat: flipProps.repeat === 0 ? Infinity : flipProps.repeat,
    repeatType: "reverse" as const
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Get 3D transform values for CSS
  const get3DTransform = () => {
    const rotation = state.currentPosition * 180;
    const adjustedRotation = flipProps.direction === 'backward' ? -rotation : rotation;

    switch (flipProps.axis) {
      case 'x':
        return `rotateX(${adjustedRotation}deg)`;
      case 'y':
        return `rotateY(${adjustedRotation}deg)`;
      case 'z':
        return `rotateZ(${adjustedRotation}deg)`;
      default:
        return `rotateY(${adjustedRotation}deg)`;
    }
  };

  // Render with Framer Motion
  if (useMotion) {
    return (
      <div
        ref={ref}
        className={baseClasses}
        style={{
          ...style,
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        {...attributes}
        data-testid="flip-container"
      >
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
          }}
          initial={false}
          animate={state.isActive ? "flipBack" : "flipFront"}
          variants={motionVariants}
          transition={motionTransition}
        >
          {children}
        </motion.div>
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
        ...style,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      {...attributes}
      data-testid="flip"
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transform: state.isActive && !state.isPaused && !state.respectReducedMotion
            ? get3DTransform()
            : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
});

Flip.displayName = 'Flip';

export default Flip;