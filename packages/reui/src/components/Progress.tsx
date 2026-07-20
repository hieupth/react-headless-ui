/**
 * Progress renderer component using headless useProgress hook.
 * Provides styled progress indicators with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useProgress } from '../hooks';
import type { UseProgressProps, ProgressValue } from '../hooks';

export interface ProgressProps extends UseProgressProps, React.AriaAttributes {
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

  // Consumer DOM pass-through (aria-label, aria-labelledby, …). The hook only
  // reads its camelCase `ariaLabel` alias and does not forward the standard
  // kebab-case `aria-label` a consumer writes, so <Progress aria-label="…" />
  // would otherwise render an unnamed progressbar. Spread AFTER the hook
  // attributes so the consumer's accessible name wins.
  const ariaProps: React.AriaAttributes = {};
  for (const key of Object.keys(progressProps)) {
    if (key.startsWith('aria-') || key === 'title') {
      (ariaProps as Record<string, unknown>)[key] = (progressProps as Record<string, unknown>)[key];
    }
  }

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
      {...ariaProps}
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

/**
 * Simple Progress - minimal styling progress bar
 */
export const SimpleProgress = forwardRef<HTMLDivElement, ProgressProps>(({
  className,
  size = 'md',
  color = 'primary',
  ...progressProps
}, ref) => {
  const progressHook = useProgress({
    ...progressProps,
    progressRef: ref as React.RefObject<HTMLDivElement>
  });

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  }[size];

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500'
  }[color];

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-gray-100 ${sizeClasses} rounded-full ${className || ''}`}
      {...progressHook.progressAttributes}
    >
      <div
        className={`absolute top-0 left-0 h-full ${colorClasses} transition-all duration-200 ease-out`}
        style={{ width: `${progressHook.state.percentage}%` }}
      />
    </div>
  );
});

SimpleProgress.displayName = 'SimpleProgress';

/**
 * Circular Progress - circular progress indicator
 */
export const CircularProgress = forwardRef<HTMLDivElement, ProgressProps>(({
  className,
  size = 'md',
  color = 'primary',
  showPercentage = true,
  style,
  ...progressProps
}, ref) => {
  const progressHook = useProgress({
    ...progressProps,
    progressRef: ref as React.RefObject<HTMLDivElement>
  });

  const sizeDimensions = {
    sm: { width: 24, height: 24, strokeWidth: 3 },
    md: { width: 40, height: 40, strokeWidth: 4 },
    lg: { width: 64, height: 64, strokeWidth: 6 },
    xl: { width: 80, height: 80, strokeWidth: 8 }
  }[size];

  const colorClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-cyan-600'
  }[color];

  const { width, height, strokeWidth } = sizeDimensions;
  const center = width / 2;
  const radius = center - strokeWidth / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressHook.state.percentage / 100) * circumference;

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className || ''}`}
      style={{ width, height, ...style }}
      {...progressHook.progressAttributes}
    >
      <svg
        className={`transform -rotate-90 ${colorClasses}`}
        width={width}
        height={height}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {Math.round(progressHook.state.percentage)}%
        </div>
      )}
    </div>
  );
});

CircularProgress.displayName = 'CircularProgress';

/**
 * Loading Progress - progress with loading animation
 */
export const LoadingProgress = forwardRef<HTMLDivElement, ProgressProps>(({
  className,
  size = 'md',
  color = 'primary',
  ...progressProps
}, ref) => {
  const progressHook = useProgress({
    ...progressProps,
    progressRef: ref as React.RefObject<HTMLDivElement>
  });

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8'
  }[size];

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
      className={`relative overflow-hidden bg-gray-200 ${sizeClasses} rounded-full ${className || ''}`}
      {...progressHook.progressAttributes}
    >
      <div
        className={`absolute top-0 left-0 h-full ${colorClasses} transition-all duration-500 ease-out relative`}
        style={{ width: `${progressHook.state.percentage}%` }}
      >
        <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
      </div>
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
        style={{
          width: '100%',
          animation: 'shimmer 2s infinite'
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
});

LoadingProgress.displayName = 'LoadingProgress';

export default Progress;