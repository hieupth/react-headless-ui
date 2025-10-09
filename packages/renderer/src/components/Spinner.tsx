/**
 * Spinner renderer component using headless useSpinner hook.
 * Provides comprehensive loading indicators with accessibility support.
 */

import React, { forwardRef } from 'react';
import { useSpinner } from '@react-ui-forge/core';
import type { UseSpinnerProps, SpinnerValue } from '@react-ui-forge/core';

export interface SpinnerProps extends UseSpinnerProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function */
  render?: (props: SpinnerRenderProps) => React.ReactElement;
  /** Custom spinner element render function */
  renderSpinner?: (props: SpinnerElementRenderProps) => React.ReactNode;
  /** Custom label render function */
  renderLabel?: (props: SpinnerLabelRenderProps) => React.ReactNode;
  /** Color variant */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  /** Custom width/height */
  dimension?: number;
  /** Custom border radius */
  borderRadius?: number;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Custom tooltip text */
  tooltipText?: string;
}

export interface SpinnerRenderProps {
  /** Computed class names */
  className: string;
  /** Spinner state */
  value: SpinnerValue;
  isAnimating: boolean;
  isActive: boolean;
  focused: boolean;
  hovered: boolean;
  disabled: boolean;
  /** Event handlers */
  onFocus: (event: React.FocusEvent) => void;
  onBlur: (event: React.FocusEvent) => void;
  onMouseEnter: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  /** Actions */
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
  setSpeed: (speed: UseSpinnerProps['speed']) => void;
  setVariant: (variant: UseSpinnerProps['variant']) => void;
  setSize: (size: UseSpinnerProps['size']) => void;
  /** Semantic attributes */
  spinnerAttributes: Record<string, any>;
  formAttributes: Record<string, any>;
  /** References */
  spinnerRef: React.RefObject<HTMLDivElement>;
  labelRef: React.RefObject<HTMLDivElement>;
  /** Utility functions */
  formatLabel: (active: boolean, customLabel?: string) => string;
  getDuration: (speed: UseSpinnerProps['speed'], customDuration?: number) => number;
  shouldAnimate: (active: boolean, disabled: boolean) => boolean;
  /** Computed values */
  size: UseSpinnerProps['size'];
  speed: UseSpinnerProps['speed'];
  variant: UseSpinnerProps['variant'];
  label: string;
  showLabel: boolean;
  duration: number;
  /** Size classes */
  sizeClasses: string;
  /** Speed classes */
  speedClasses: string;
  /** Variant classes */
  variantClasses: string;
  /** Color classes */
  colorClasses: string;
  /** Animation classes */
  animationClasses: string;
}

export interface SpinnerElementRenderProps {
  /** Current animation frame */
  frame: number;
  /** Progress percentage for advanced variants */
  progress: number;
  /** Whether spinner is animating */
  animating: boolean;
  /** Spinner variant */
  variant: UseSpinnerProps['variant'];
  /** Spinner size */
  size: UseSpinnerProps['size'];
  /** Progress state */
  disabled: boolean;
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

export interface SpinnerLabelRenderProps {
  /** Spinner state */
  value: SpinnerValue;
  /** Whether spinner is active */
  active: boolean;
  /** Whether spinner is animating */
  animating: boolean;
  /** Custom label text */
  label: string;
  /** Whether to show label */
  showLabel: boolean;
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

/**
 * Styled spinner component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(({
  className,
  style,
  render,
  renderSpinner,
  renderLabel,
  color = 'primary',
  dimension,
  borderRadius,
  showTooltip = false,
  tooltipText,
  ...spinnerProps
}, ref) => {
  const spinnerHook = useSpinner({
    ...spinnerProps,
    // Merge external ref with internal ref
    spinnerRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
    '4xl': 'w-32 h-32'
  }[spinnerHook.config.size];

  // Speed classes
  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast'
  }[spinnerHook.config.speed];

  // Variant classes
  const variantClasses = {
    spin: 'border-4 border-t-transparent border-b-transparent border-l-transparent',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    dots: 'flex space-x-1',
    bars: 'flex space-x-1',
    ring: 'relative'
  }[spinnerHook.config.variant];

  // Color classes
  const colorClasses = {
    primary: 'border-blue-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    error: 'border-red-600',
    info: 'border-cyan-600',
    gray: 'border-gray-600'
  }[color];

  // Animation classes
  const animationClasses = spinnerHook.state.animating
    ? speedClasses
    : '';

  // Default spinner element render function
  const defaultSpinnerRender = (props: SpinnerElementRenderProps) => {
    const { variant, size, animating, frame, progress } = props;

    switch (variant) {
      case 'spin':
        return (
          <div
            className={`
              rounded-full
              ${sizeClasses}
              ${variantClasses}
              ${colorClasses}
              ${animating ? animationClasses : ''}
              ${props.disabled ? 'opacity-50' : ''}
              ${props.className}
            `}
            style={props.style}
          />
        );

      case 'pulse':
        return (
          <div
            className={`
              rounded-full
              ${sizeClasses}
              ${colorClasses}
              ${animating ? 'animate-pulse' : ''}
              ${props.disabled ? 'opacity-50' : ''}
              ${props.className}
            `}
            style={props.style}
          />
        );

      case 'bounce':
        return (
          <div
            className={`
              ${sizeClasses}
              ${colorClasses}
              ${animating ? 'animate-bounce' : ''}
              ${props.disabled ? 'opacity-50' : ''}
              rounded-full
              ${props.className}
            `}
            style={props.style}
          />
        );

      case 'dots':
        return (
          <div
            className={`
              flex items-center
              ${props.disabled ? 'opacity-50' : ''}
              ${props.className}
            `}
            style={props.style}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`
                  ${{
                    xs: 'w-1 h-1',
                    sm: 'w-1.5 h-1.5',
                    md: 'w-2 h-2',
                    lg: 'w-3 h-3',
                    xl: 'w-4 h-4',
                    '2xl': 'w-5 h-5',
                    '3xl': 'w-6 h-6',
                    '4xl': 'w-8 h-8'
                  }[size]}
                  ${colorClasses.replace('border-', 'bg-')}
                  rounded-full
                  ${animating ? 'animate-pulse' : ''}
                  ${index === 0 ? 'delay-0' : index === 1 ? 'delay-75' : 'delay-150'}
                `}
                style={{
                  animationDelay: `${index * 150}ms`,
                  ...props.style
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div
            className={`
              flex items-center
              ${props.disabled ? 'opacity-50' : ''}
              ${props.className}
            `}
            style={props.style}
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`
                  ${{
                    xs: 'w-0.5 h-3',
                    sm: 'w-1 h-4',
                    md: 'w-1 h-6',
                    lg: 'w-1.5 h-8',
                    xl: 'w-2 h-10',
                    '2xl': 'w-2.5 h-12',
                    '3xl': 'w-3 h-14',
                    '4xl': 'w-4 h-16'
                  }[size]}
                  ${colorClasses.replace('border-', 'bg-')}
                  ${animating ? 'animate-pulse' : ''}
                  ${index === 0 ? 'delay-0' : `delay-${index * 100}`}
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  ...props.style
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <div
            className={`
              relative
              ${sizeClasses}
              ${props.disabled ? 'opacity-50' : ''}
              ${props.className}
            `}
            style={props.style}
          >
            {/* Background ring */}
            <div
              className={`
                absolute inset-0
                rounded-full
                border-4
                ${colorClasses.replace('border-', 'border-') + '-200'}
              `}
            />
            {/* Progress ring */}
            <div
              className={`
                absolute inset-0
                rounded-full
                border-4
                border-t-transparent
                border-b-transparent
                border-l-transparent
                ${colorClasses}
                ${animating ? animationClasses : ''}
              `}
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
                transition: animating ? 'transform 0.1s ease-out' : 'none'
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Default label render function
  const defaultLabelRender = (props: SpinnerLabelRenderProps) => {
    if (!props.showLabel) {
      return null;
    }

    const labelText = props.animating ? props.label : 'Idle';

    const baseLabelClasses = `
      text-sm
      font-medium
      ${props.animating ? 'text-gray-600' : 'text-gray-400'}
      ${props.disabled ? 'opacity-50' : ''}
      ${props.className}
    `;

    return (
      <div
        ref={spinnerHook.labelRef}
        className={baseLabelClasses}
        style={props.style}
      >
        {labelText}
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: SpinnerRenderProps) => {
    // Render spinner element
    const spinnerElement = renderSpinner
      ? renderSpinner({
          frame: props.value.frame,
          progress: props.value.progress,
          animating: props.isAnimating,
          variant: props.variant,
          size: props.size,
          disabled: props.disabled,
          className: '',
          style: {}
        })
      : defaultSpinnerRender({
          frame: props.value.frame,
          progress: props.value.progress,
          animating: props.isAnimating,
          variant: props.variant,
          size: props.size,
          disabled: props.disabled,
          className: '',
          style: {}
        });

    // Render label
    const labelElement = renderLabel
      ? renderLabel({
          value: props.value,
          active: props.isActive,
          animating: props.isAnimating,
          label: props.label,
          showLabel: props.showLabel,
          className: '',
          style: {}
        })
      : defaultLabelRender({
          value: props.value,
          active: props.isActive,
          animating: props.isAnimating,
          label: props.label,
          showLabel: props.showLabel,
          className: '',
          style: {}
        });

    const baseSpinnerClasses = `
      inline-flex
      flex-col
      items-center
      justify-center
      space-y-2
      ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'}
      ${props.className}
    `;

    const spinnerContainer = (
      <div className={baseSpinnerClasses}>
        <div
          ref={props.spinnerRef}
          className={`
            relative
            ${dimension ? `w-${dimension} h-${dimension}` : sizeClasses}
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default'}
            ${props.focused ? 'ring-2 ring-blue-500 ring-opacity-50 ring-offset-2' : ''}
          `}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          onKeyDown={props.onKeyDown}
          {...props.spinnerAttributes}
          style={{
            ...(borderRadius ? { borderRadius: `${borderRadius}px` } : {}),
            ...style
          }}
        >
          {spinnerElement}
        </div>
        {labelElement}
        {showTooltip && tooltipText && (
          <div className="absolute top-full mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap">
            {tooltipText}
          </div>
        )}
      </div>
    );

    return spinnerContainer;
  };

  // Render props
  const renderProps: SpinnerRenderProps = {
    className: className || '',
    value: spinnerHook.state,
    isAnimating: spinnerHook.state.animating,
    isActive: spinnerHook.state.active,
    focused: spinnerHook.state.focused,
    hovered: spinnerHook.state.hovered,
    disabled: spinnerHook.config.disabled,
    onFocus: spinnerHook.handlers.onFocus,
    onBlur: spinnerHook.handlers.onBlur,
    onMouseEnter: spinnerHook.handlers.onMouseEnter,
    onMouseLeave: spinnerHook.handlers.onMouseLeave,
    onKeyDown: spinnerHook.handlers.onKeyDown,
    start: spinnerHook.actions.start,
    stop: spinnerHook.actions.stop,
    toggle: spinnerHook.actions.toggle,
    reset: spinnerHook.actions.reset,
    setSpeed: spinnerHook.actions.setSpeed,
    setVariant: spinnerHook.actions.setVariant,
    setSize: spinnerHook.actions.setSize,
    spinnerAttributes: spinnerHook.ariaAttributes,
    formAttributes: spinnerHook.formAttributes,
    spinnerRef: spinnerHook.spinnerRef,
    labelRef: spinnerHook.labelRef,
    formatLabel: spinnerHook.utils.formatLabel,
    getDuration: spinnerHook.utils.getDuration,
    shouldAnimate: spinnerHook.utils.shouldAnimate,
    size: spinnerHook.config.size,
    speed: spinnerHook.config.speed,
    variant: spinnerHook.config.variant,
    label: spinnerHook.config.label,
    showLabel: spinnerHook.config.showLabel,
    duration: spinnerHook.config.duration,
    sizeClasses,
    speedClasses,
    variantClasses,
    colorClasses,
    animationClasses
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Spinner.displayName = 'Spinner';

/**
 * Simple spinner wrapper for common use cases.
 */
export interface SimpleSpinnerProps {
  /** Whether spinner is active */
  active?: boolean;
  /** Default active state */
  defaultActive?: boolean;
  /** Change handler */
  onActiveChange?: (active: boolean) => void;
  /** Whether spinner is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: UseSpinnerProps['size'];
  /** Color variant */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SimpleSpinner = forwardRef<HTMLDivElement, SimpleSpinnerProps>(({
  active,
  defaultActive,
  onActiveChange,
  disabled = false,
  size = 'md',
  color = 'primary',
  className,
  style
}, ref) => (
  <Spinner
    active={active}
    defaultActive={defaultActive}
    onActiveChange={onActiveChange}
    disabled={disabled}
    size={size}
    color={color}
    variant="spin"
    showLabel={false}
    className={className}
    style={style}
    ref={ref}
  />
));

SimpleSpinner.displayName = 'SimpleSpinner';

/**
 * Dots spinner variant.
 */
export const DotsSpinner = forwardRef<HTMLDivElement, SimpleSpinnerProps>(({
  active,
  defaultActive,
  onActiveChange,
  disabled = false,
  size = 'md',
  color = 'primary',
  className,
  style
}, ref) => (
  <Spinner
    active={active}
    defaultActive={defaultActive}
    onActiveChange={onActiveChange}
    disabled={disabled}
    size={size}
    color={color}
    variant="dots"
    showLabel={false}
    className={className}
    style={style}
    ref={ref}
  />
));

DotsSpinner.displayName = 'DotsSpinner';

/**
 * Bars spinner variant.
 */
export const BarsSpinner = forwardRef<HTMLDivElement, SimpleSpinnerProps>(({
  active,
  defaultActive,
  onActiveChange,
  disabled = false,
  size = 'md',
  color = 'primary',
  className,
  style
}, ref) => (
  <Spinner
    active={active}
    defaultActive={defaultActive}
    onActiveChange={onActiveChange}
    disabled={disabled}
    size={size}
    color={color}
    variant="bars"
    showLabel={false}
    className={className}
    style={style}
    ref={ref}
  />
));

BarsSpinner.displayName = 'BarsSpinner';