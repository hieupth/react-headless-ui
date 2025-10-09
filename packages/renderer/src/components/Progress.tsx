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
  /** Custom render function */
  render?: (props: ProgressRenderProps) => React.ReactElement;
  /** Custom track render function */
  renderTrack?: (props: ProgressTrackRenderProps) => React.ReactNode;
  /** Custom fill render function */
  renderFill?: (props: ProgressFillRenderProps) => React.ReactNode;
  /** Custom label render function */
  renderLabel?: (props: ProgressLabelRenderProps) => React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Variant */
  variant?: 'default' | 'solid' | 'outline' | 'gradient';
  /** Color variant */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Shape variant */
  shape?: 'rounded' | 'pill' | 'square';
  /** Show percentage value */
  showPercentage?: boolean;
  /** Custom width/height */
  dimension?: number;
  /** Custom border radius */
  borderRadius?: number;
}

export interface ProgressRenderProps {
  /** Computed class names */
  className: string;
  /** Progress state */
  value: ProgressValue;
  percentage: number;
  mode: 'determinate' | 'indeterminate';
  isComplete: boolean;
  isIndeterminate: boolean;
  focused: boolean;
  hovered: boolean;
  disabled: boolean;
  animated: boolean;
  /** Event handlers */
  onFocus: (event: React.FocusEvent) => void;
  onBlur: (event: React.FocusEvent) => void;
  onMouseEnter: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  /** Actions */
  setValue: (value: ProgressValue) => void;
  reset: () => void;
  increment: (step?: number) => void;
  decrement: (step?: number) => void;
  setToMin: () => void;
  setToMax: () => void;
  startIndeterminate: () => void;
  stopIndeterminate: () => void;
  /** Semantic attributes */
  progressAttributes: Record<string, any>;
  formAttributes: Record<string, any>;
  /** References */
  progressRef: React.RefObject<HTMLDivElement>;
  /** Utility functions */
  formatValue: (value: ProgressValue) => string;
  /** Computed values */
  orientation: 'horizontal' | 'vertical';
  reversed: boolean;
  showLabel: boolean;
  /** Size classes */
  sizeClasses: string;
  /** Variant classes */
  variantClasses: string;
  /** Color classes */
  colorClasses: string;
  /** Animation classes */
  animationClasses: string;
}

export interface ProgressTrackRenderProps {
  /** Progress state */
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

export interface ProgressFillRenderProps {
  /** Fill percentage (0-100) */
  percentage: number;
  /** Whether progress is indeterminate */
  isIndeterminate: boolean;
  /** Animation value for indeterminate progress */
  animationValue?: number;
  /** Progress state */
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
  reversed: boolean;
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

export interface ProgressLabelRenderProps {
  /** Progress value */
  value: ProgressValue;
  /** Progress percentage */
  percentage: number;
  /** Whether progress is complete */
  isComplete: boolean;
  /** Whether progress is indeterminate */
  isIndeterminate: boolean;
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

/**
 * Styled progress component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(({\n  className,\n  style,\n  render,\n  renderTrack,\n  renderFill,\n  renderLabel,\n  size = 'md',\n  variant = 'default',\n  color = 'primary',\n  shape = 'rounded',\n  showPercentage = false,\n  dimension,\n  borderRadius,\n  ...progressProps\n}, ref) => {\n  const progressHook = useProgress({\n    ...progressProps,\n    // Merge external ref with internal ref\n    progressRef: ref as React.RefObject<HTMLDivElement>\n  });\n\n  // Size classes\n  const sizeClasses = {\n    sm: 'h-2',\n    md: 'h-4',\n    lg: 'h-6',\n    xl: 'h-8'\n  }[size];\n\n  // Variant classes\n  const variantClasses = {\n    default: 'bg-gray-200',\n    solid: 'bg-gray-100',\n    outline: 'border-2 border-gray-300 bg-transparent',\n    gradient: 'bg-gradient-to-r from-gray-100 to-gray-200'\n  }[variant];\n\n  // Color classes\n  const colorClasses = {\n    primary: 'bg-blue-600',\n    success: 'bg-green-600',\n    warning: 'bg-yellow-600',\n    error: 'bg-red-600',\n    info: 'bg-cyan-600'\n  }[color];\n\n  // Shape classes\n  const shapeClasses = {\n    rounded: 'rounded-md',\n    pill: 'rounded-full',\n    square: 'rounded-none'\n  }[shape];\n\n  // Animation classes\n  const animationClasses = progressHook.state.animated \n    ? 'transition-all duration-300 ease-in-out' \n    : '';\n\n  // Default track render function\n  const defaultTrackRender = (props: ProgressTrackRenderProps) => {\n    const isHorizontal = props.orientation === 'horizontal';\n    \n    const baseTrackClasses = `\n      relative\n      overflow-hidden\n      ${dimension ? (isHorizontal ? `h-${dimension}` : `w-${dimension}`) : sizeClasses}\n      ${isHorizontal ? 'w-full' : 'h-full'}\n      ${variantClasses}\n      ${shapeClasses}\n      ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}\n      ${progressHook.state.focused ? 'ring-2 ring-blue-500 ring-opacity-50 ring-offset-2' : ''}\n      ${props.className}\n    `;\n\n    return (\n      <div\n        className={baseTrackClasses}\n        style={{\n          ...(borderRadius ? { borderRadius: `${borderRadius}px` } : {}),\n          ...props.style\n        }}\n      />\n    );\n  };\n\n  // Default fill render function\n  const defaultFillRender = (props: ProgressFillRenderProps) => {\n    const isHorizontal = props.orientation === 'horizontal';\n    \n    // Calculate position based on orientation and reversed state\n    const getPosition = () => {\n      if (props.isIndeterminate) {\n        // Animated sliding effect for indeterminate progress\n        return props.animationValue;\n      }\n      \n      if (props.reversed) {\n        return 100 - props.percentage;\n      }\n      \n      return props.percentage;\n    };\n\n    const baseFillClasses = `\n      absolute\n      top-0\n      left-0\n      ${colorClasses}\n      ${shapeClasses}\n      ${props.disabled ? 'opacity-50' : ''}\n      ${animationClasses}\n      ${props.className}\n    `;\n\n    // Special styling for indeterminate progress\n    const fillStyle = {\n      [isHorizontal ? 'width' : 'height']: props.isIndeterminate ? '30%' : `${props.percentage}%`,\n      [isHorizontal ? 'height' : 'width']: '100%',\n      [isHorizontal ? 'left' : 'top']: `${getPosition()}%`,\n      [isHorizontal ? 'top' : 'left']: '0',\n      ...(props.isIndeterminate ? {\n        animation: 'slide 1.5s ease-in-out infinite'\n      } : {}),\n      ...props.style\n    };\n\n    return (\n      <div\n        className={baseFillClasses}\n        style={fillStyle}\n      />\n    );\n  };\n\n  // Default label render function\n  const defaultLabelRender = (props: ProgressLabelRenderProps) => {\n    if (!progressHook.config.showLabel && !showPercentage) {\n      return null;\n    }\n\n    const labelText = props.isIndeterminate \n      ? 'Loading...' \n      : (showPercentage ? `${Math.round(props.percentage)}%` : progressHook.utils.formatValue(props.value));\n\n    const baseLabelClasses = `\n      text-sm\n      font-medium\n      ${props.isComplete ? 'text-green-600' : 'text-gray-600'}\n      ${props.disabled ? 'opacity-50' : ''}\n      ${props.className}\n    `;\n\n    return (\n      <div \n        className={baseLabelClasses}\n        style={props.style}\n      >\n        {labelText}\n      </div>\n    );\n  };\n\n  // Default render function\n  const defaultRender = (props: ProgressRenderProps) => {\n    const isHorizontal = props.orientation === 'horizontal';\n    \n    // Render track\n    const trackElement = renderTrack\n      ? renderTrack({\n          disabled: props.disabled,\n          orientation: props.orientation,\n          className: '',\n          style: {}\n        })\n      : defaultTrackRender({\n          disabled: props.disabled,\n          orientation: props.orientation,\n          className: '',\n          style: {}\n        });\n\n    // Render fill\n    const fillElement = renderFill\n      ? renderFill({\n          percentage: props.percentage,\n          isIndeterminate: props.isIndeterminate,\n          animationValue: progressHook.state.animated ? 50 : undefined,\n          disabled: props.disabled,\n          orientation: props.orientation,\n          reversed: props.reversed,\n          className: '',\n          style: {}\n        })\n      : defaultFillRender({\n          percentage: props.percentage,\n          isIndeterminate: props.isIndeterminate,\n          animationValue: progressHook.state.animated ? 50 : undefined,\n          disabled: props.disabled,\n          orientation: props.orientation,\n          reversed: props.reversed,\n          className: '',\n          style: {}\n        });\n\n    // Render label\n    const labelElement = renderLabel\n      ? renderLabel({\n          value: props.value,\n          percentage: props.percentage,\n          isComplete: props.isComplete,\n          isIndeterminate: props.isIndeterminate,\n          className: '',\n          style: {}\n        })\n      : defaultLabelRender({\n          value: props.value,\n          percentage: props.percentage,\n          isComplete: props.isComplete,\n          isIndeterminate: props.isIndeterminate,\n          className: '',\n          style: {}\n        });\n\n    const baseProgressClasses = `\n      flex\n      ${isHorizontal ? 'flex-col space-y-2' : 'flex-row space-x-2 items-center'}\n      ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}\n      ${props.className}\n    `;\n\n    return (\n      <div className={baseProgressClasses}>\n        <div\n          ref={props.progressRef}\n          className={`\n            relative\n            ${dimension ? (isHorizontal ? `h-${dimension}` : `w-${dimension}`) : sizeClasses}\n            ${isHorizontal ? 'w-full' : 'h-full'}\n            ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'}\n          `}\n          onFocus={props.onFocus}\n          onBlur={props.onBlur}\n          onMouseEnter={props.onMouseEnter}\n          onMouseLeave={props.onMouseLeave}\n          onKeyDown={props.onKeyDown}\n          {...props.progressAttributes}\n          style={{\n            ...(borderRadius ? { borderRadius: `${borderRadius}px` } : {}),\n            ...style\n          }}\n        >\n          {trackElement}\n          {fillElement}\n        </div>\n        {labelElement}\n      </div>\n    );\n  };\n\n  // Render props\n  const renderProps: ProgressRenderProps = {\n    className: className || '',\n    value: progressHook.state.value,\n    percentage: progressHook.state.percentage,\n    mode: progressHook.state.mode,\n    isComplete: progressHook.state.isComplete,\n    isIndeterminate: progressHook.state.isIndeterminate,\n    focused: progressHook.state.focused,\n    hovered: progressHook.state.hovered,\n    disabled: progressHook.state.disabled,\n    animated: progressHook.state.animated,\n    onFocus: progressHook.handlers.onFocus,\n    onBlur: progressHook.handlers.onBlur,\n    onMouseEnter: progressHook.handlers.onMouseEnter,\n    onMouseLeave: progressHook.handlers.onMouseLeave,\n    onKeyDown: progressHook.handlers.onKeyDown,\n    setValue: progressHook.actions.setValue,\n    reset: progressHook.actions.reset,\n    increment: progressHook.actions.increment,\n    decrement: progressHook.actions.decrement,\n    setToMin: progressHook.actions.setToMin,\n    setToMax: progressHook.actions.setToMax,\n    startIndeterminate: progressHook.actions.startIndeterminate,\n    stopIndeterminate: progressHook.actions.stopIndeterminate,\n    progressAttributes: progressHook.progressAttributes,\n    formAttributes: progressHook.formAttributes,\n    progressRef: progressHook.progressRef,\n    formatValue: progressHook.utils.formatValue,\n    orientation: progressHook.config.orientation,\n    reversed: progressHook.config.reversed,\n    showLabel: progressHook.config.showLabel,\n    sizeClasses,\n    variantClasses,\n    colorClasses,\n    animationClasses\n  };\n\n  // Use custom render if provided, otherwise use default render\n  if (render) {\n    return render(renderProps);\n  }\n\n  return defaultRender(renderProps);\n});\n\nProgress.displayName = 'Progress';\n\n/**\n * Simple progress wrapper for common use cases.\n */\nexport interface SimpleProgressProps {\n  /** Current progress value (0-100) */\n  value?: number;\n  /** Default progress value */\n  defaultValue?: number;\n  /** Change handler */\n  onValueChange?: (value: number) => void;\n  /** Minimum value */\n  min?: number;\n  /** Maximum value */\n  max?: number;\n  /** Whether progress is disabled */\n  disabled?: boolean;\n  /** Size variant */\n  size?: 'sm' | 'md' | 'lg' | 'xl';\n  /** Color variant */\n  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';\n  /** Show percentage */\n  showPercentage?: boolean;\n  /** Additional CSS class names */\n  className?: string;\n  /** Custom style object */\n  style?: React.CSSProperties;\n}\n\nexport const SimpleProgress = forwardRef<HTMLDivElement, SimpleProgressProps>(({\n  value,\n  defaultValue,\n  onValueChange,\n  min = 0,\n  max = 100,\n  disabled = false,\n  size = 'md',\n  color = 'primary',\n  showPercentage = false,\n  className,\n  style\n}, ref) => (\n  <Progress\n    value={value}\n    defaultValue={defaultValue}\n    onValueChange={onValueChange}\n    min={min}\n    max={max}\n    disabled={disabled}\n    size={size}\n    color={color}\n    showPercentage={showPercentage}\n    className={className}\n    style={style}\n    ref={ref}\n    orientation=\"horizontal\"\n    animated={true}\n  />\n));\n\nSimpleProgress.displayName = 'SimpleProgress';\n\n/**\n * Circular progress component for loading indicators.\n */\nexport interface CircularProgressProps {\n  /** Current progress value (0-100) */\n  value?: number;\n  /** Default progress value */\n  defaultValue?: number;\n  /** Change handler */\n  onValueChange?: (value: number) => void;\n  /** Minimum value */\n  min?: number;\n  /** Maximum value */\n  max?: number;\n  /** Whether progress is disabled */\n  disabled?: boolean;\n  /** Size variant */\n  size?: 'sm' | 'md' | 'lg' | 'xl';\n  /** Color variant */\n  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';\n  /** Show percentage */\n  showPercentage?: boolean;\n  /** Additional CSS class names */\n  className?: string;\n  /** Custom style object */\n  style?: React.CSSProperties;\n}\n\nexport const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(({\n  value,\n  defaultValue,\n  onValueChange,\n  min = 0,\n  max = 100,\n  disabled = false,\n  size = 'md',\n  color = 'primary',\n  showPercentage = false,\n  className,\n  style\n}, ref) => (\n  <Progress\n    value={value}\n    defaultValue={defaultValue}\n    onValueChange={onValueChange}\n    min={min}\n    max={max}\n    disabled={disabled}\n    size={size}\n    color={color}\n    showPercentage={showPercentage}\n    className={className}\n    style={style}\n    ref={ref}\n    orientation=\"vertical\"\n    animated={true}\n    shape=\"rounded\"\n  />\n));\n\nCircularProgress.displayName = 'CircularProgress';\n\n/**\n * Indeterminate progress component for loading states.\n */\nexport interface LoadingProgressProps {\n  /** Whether progress is disabled */\n  disabled?: boolean;\n  /** Size variant */\n  size?: 'sm' | 'md' | 'lg' | 'xl';\n  /** Color variant */\n  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';\n  /** Show loading text */\n  showLabel?: boolean;\n  /** Additional CSS class names */\n  className?: string;\n  /** Custom style object */\n  style?: React.CSSProperties;\n}\n\nexport const LoadingProgress = forwardRef<HTMLDivElement, LoadingProgressProps>(({\n  disabled = false,\n  size = 'md',\n  color = 'primary',\n  showLabel = true,\n  className,\n  style\n}, ref) => (\n  <Progress\n    value={null}\n  min={0}\n    max={100}\n    disabled={disabled}\n    size={size}\n    color={color}\n    showLabel={showLabel}\n    className={className}\n    style={style}\n    ref={ref}\n    orientation=\"horizontal\"\n    animated={true}\n    mode=\"indeterminate\"\n  />\n));\n\nLoadingProgress.displayName = 'LoadingProgress';