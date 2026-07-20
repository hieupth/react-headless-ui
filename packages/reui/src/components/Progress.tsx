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
    sm: '',
    md: '',
    lg: '',
    xl: ''
  }[size];

  // Variant classes
  const variantClasses = {
    default: '',
    solid: '',
    outline: '  ',
    gradient: '  '
  }[variant];

  // Color classes
  const colorClasses = {
    primary: '',
    success: '',
    warning: '',
    error: '',
    info: ''
  }[color];

  return (
    <div
      ref={ref}
      className={`  ${sizeClasses} ${variantClasses}  ${className || ''}`}
      style={style}
      {...progressHook.progressAttributes}
      {...ariaProps}
    >
      <div
        className={`    ${colorClasses}   `}
        style={{ width: `${progressHook.state.percentage}%` }}
      />
      {showPercentage && (
        <div className="      ">
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
    sm: '',
    md: '',
    lg: '',
    xl: ''
  }[size];

  const colorClasses = {
    primary: '',
    success: '',
    warning: '',
    error: '',
    info: ''
  }[color];

  return (
    <div
      ref={ref}
      className={`   ${sizeClasses}  ${className || ''}`}
      {...progressHook.progressAttributes}
    >
      <div
        className={`    ${colorClasses}   `}
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
    primary: '',
    success: '',
    warning: '',
    error: '',
    info: ''
  }[color];

  const { width, height, strokeWidth } = sizeDimensions;
  const center = width / 2;
  const radius = center - strokeWidth / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressHook.state.percentage / 100) * circumference;

  return (
    <div
      ref={ref}
      className={`    ${className || ''}`}
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
          className=""
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
          className="  "
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="      ">
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
    sm: '',
    md: '',
    lg: '',
    xl: ''
  }[size];

  const colorClasses = {
    primary: '',
    success: '',
    warning: '',
    error: '',
    info: ''
  }[color];

  return (
    <div
      ref={ref}
      className={`   ${sizeClasses}  ${className || ''}`}
      {...progressHook.progressAttributes}
    >
      <div
        className={`    ${colorClasses}    `}
        style={{ width: `${progressHook.state.percentage}%` }}
      >
        <div className="    " />
      </div>
      <div
        className="         "
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