import React from 'react';
import { useSkeleton, type UseSkeletonProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface SkeletonProps extends UseSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton component provides loading placeholder with various shapes and animations.
 * Helps improve perceived performance during content loading.
 *
 * @param props - Component configuration props
 * @returns Styled skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  ...skeletonProps
}) => {
  const { state, props } = useSkeleton(skeletonProps);
  const theme = useTheme();

  // Build CSS classes for skeleton
  const skeletonClasses = [
    'skeleton',
    `skeleton-${state.variant}`,
    `skeleton-${state.size}`,
    state.animated && 'skeleton-animated',
    state.shimmer && 'skeleton-shimmer',
    className
  ].filter(Boolean).join(' ');

  // Generate skeleton styles based on variant
  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: theme.colors.muted,
      display: 'inline-block',
      position: 'relative' as const,
      overflow: 'hidden',
    };

    switch (state.variant) {
      case 'text':
        return {
          ...baseStyles,
          width: state.dimensions.width,
          height: state.dimensions.height,
          borderRadius: theme.borderRadius.sm,
          marginTop: state.lines > 1 ? theme.spacing.xs : '0',
        };

      case 'circular':
        return {
          ...baseStyles,
          width: state.dimensions.width,
          height: state.dimensions.height,
          borderRadius: '50%',
        };

      case 'rectangular':
        return {
          ...baseStyles,
          width: state.dimensions.width,
          height: state.dimensions.height,
          borderRadius: theme.borderRadius.sm,
        };

      case 'rounded':
        return {
          ...baseStyles,
          width: state.dimensions.width,
          height: state.dimensions.height,
          borderRadius: theme.borderRadius.lg,
        };

      default:
        return baseStyles;
    }
  };

  // Generate shimmer animation styles
  const shimmerStyles = state.shimmer ? {
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(
        90deg,
        transparent,
        ${theme.colors.background},
        transparent
      )`,
      animation: 'shimmer 2s infinite',
    },
    '@keyframes shimmer': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  } : {};

  // For text variant with multiple lines
  if (state.variant === 'text' && state.lines > 1) {
    return (
      <div
        className={`${skeletonClasses} skeleton-lines`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xs,
          width: state.dimensions.width,
        }}
        {...props}
      >
        {Array.from({ length: state.lines }, (_, index) => (
          <div
            key={index}
            className="skeleton-line"
            style={{
              ...getVariantStyles(),
              // Make lines progressively shorter for more natural look
              width: index === state.lines - 1
                ? '70%'
                : index === 0
                  ? '100%'
                  : `${85 + Math.random() * 10}%`,
              height: state.dimensions.height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={skeletonClasses}
      style={{
        ...getVariantStyles(),
        ...shimmerStyles,
      }}
      {...props}
    />
  );
};