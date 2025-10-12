/**
 * Progress renderer component using headless useProgress hook.
 * Provides styled progress indicators with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useProgress } from '@react-ui-forge/core';
import type { UseProgressProps, ProgressValue } from '@react-ui-forge/core';

export interface ProgressProps extends UseProgressProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Variant */
  variant?: 'default' | 'solid' | 'outline' | 'gradient';
  /** Color variant */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Show percentage value */
  showPercentage?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(({
  className,
  style,
  size = 'md',
  variant = 'default',
  color = 'primary',
  showPercentage = false,
  ...progressProps
}, ref) => {
  const progressHook = useProgress({
    ...progressProps,
    progressRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8'
  }[size];

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-200',
    solid: 'bg-gray-100',
    outline: 'border-2 border-gray-300 bg-transparent',
    gradient: 'bg-gradient-to-r from-gray-100 to-gray-200'
  }[variant];

  // Color classes
  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-cyan-600'
  }[color];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${sizeClasses} ${variantClasses} rounded-md ${className || ''}`}
      style={style}
      {...progressHook.progressAttributes}
    >
      <div
        className={`absolute top-0 left-0 h-full ${colorClasses} transition-all duration-300 ease-in-out`}
        style={{ width: `${progressHook.state.percentage}%` }}
      />
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {Math.round(progressHook.state.percentage)}%
        </div>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

export default Progress;