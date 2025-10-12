/**
 * Shake renderer component using headless useShake hook.
 * Provides shake animation with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useShake, type UseShakeProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface ShakeProps extends UseShakeProps {
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
    shake?: any;
    static?: any;
  };
  /** Custom animation transition config */
  transition?: any;
}

/**
 * Shake component with shake animation.
 * Supports both CSS transitions and Framer Motion animations.
 */
export const Shake = forwardRef<HTMLDivElement, ShakeProps>(({
  className = '',
  style,
  children,
  useMotion = true,
  variants,
  transition,
  ...shakeProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    style: hookStyle,
    attributes
  } = useShake(shakeProps);

  // Base classes
  const baseClasses = [
    'shake',
    state.isActive ? 'shake-active' : 'shake-inactive',
    state.isPaused ? 'shake-paused' : '',
    state.isComplete ? 'shake-complete' : '',
    className
  ].filter(Boolean).join(' ');

  // Default Framer Motion variants
  const defaultVariants = {
    static: {
      x: 0,
      y: 0,
      transition: {
        duration: (shakeProps.duration || 500) / 1000,
        ease: shakeProps.easing || 'easeInOut',
        delay: (shakeProps.delay || 0) / 1000
      }
    },
    shake: {
      x: shakeProps.direction === 'vertical' ? 0 : [
        -10 * (shakeProps.intensity || 1),
        10 * (shakeProps.intensity || 1),
        -8 * (shakeProps.intensity || 1),
        8 * (shakeProps.intensity || 1),
        -5 * (shakeProps.intensity || 1),
        5 * (shakeProps.intensity || 1),
        0
      ],
      y: shakeProps.direction === 'horizontal' ? 0 : [
        -10 * (shakeProps.intensity || 1),
        10 * (shakeProps.intensity || 1),
        -8 * (shakeProps.intensity || 1),
        8 * (shakeProps.intensity || 1),
        -5 * (shakeProps.intensity || 1),
        5 * (shakeProps.intensity || 1),
        0
      ],
      transition: {
        duration: (shakeProps.duration || 500) / 1000,
        ease: shakeProps.easing || 'easeInOut',
        delay: (shakeProps.delay || 0) / 1000,
        repeat: shakeProps.repeat === 0 ? Infinity : shakeProps.repeat,
        repeatType: "loop" as const,
        onRepeat: () => {
          if (shakeProps.onRepeat) {
            shakeProps.onRepeat(state.repeatCount + 1);
          }
        },
        onAnimationComplete: () => {
          if (shakeProps.onAnimationComplete) {
            shakeProps.onAnimationComplete();
          }
        }
      }
    }
  };

  // Default transition config
  const defaultTransition = {
    duration: (shakeProps.duration || 500) / 1000,
    ease: shakeProps.easing || 'easeInOut',
    delay: (shakeProps.delay || 0) / 1000,
    repeat: shakeProps.repeat === 0 ? Infinity : shakeProps.repeat,
    repeatType: "loop" as const
  };

  // Merge with custom variants/transition
  const motionVariants = variants ? { ...defaultVariants, ...variants } : defaultVariants;
  const motionTransition = transition || defaultTransition;

  // Get shake values for CSS
  const getShakeTransform = () => {
    const intensity = shakeProps.intensity || 1;
    const baseAmount = 10 * intensity;

    // Create shake keyframes string
    const keyframes = Array.from({ length: 7 }, (_, i) => {
      const value = i === 0 || i === 6 ? 0 :
                   i % 2 === 1 ? baseAmount * (1 - i * 0.15) :
                   -baseAmount * (1 - i * 0.15);

      if (shakeProps.direction === 'vertical') {
        return `translateY(${value}px)`;
      } else if (shakeProps.direction === 'both') {
        return `translate(${value}px, ${value}px)`;
      } else {
        return `translateX(${value}px)`;
      }
    }).join(', ');

    return keyframes;
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
        animate={state.isActive ? "shake" : "static"}
        variants={motionVariants}
        transition={motionTransition}
        {...attributes}
        data-testid="shake"
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
        ...(state.isActive && !state.isPaused && !state.respectReducedMotion ? {
          animation: `shake ${shakeProps.duration || 500}ms ${shakeProps.easing || 'ease-in-out'} ${(shakeProps.repeat || 0) === 0 ? 'infinite' : shakeProps.repeat}`
        } : {})
      }}
      {...attributes}
      data-testid="shake"
    >
      {children}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% {
            ${shakeProps.direction === 'vertical' ? 'transform: translateY(-10px);' :
              shakeProps.direction === 'both' ? 'transform: translate(-10px, -10px);' :
              'transform: translateX(-10px);'}
          }
          20%, 40%, 60%, 80% {
            ${shakeProps.direction === 'vertical' ? 'transform: translateY(10px);' :
              shakeProps.direction === 'both' ? 'transform: translate(10px, 10px);' :
              'transform: translateX(10px);'}
          }
        }
      `}</style>
    </div>
  );
});

Shake.displayName = 'Shake';

export default Shake;