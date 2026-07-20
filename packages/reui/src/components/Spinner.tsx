/**
 * Spinner renderer component using headless useSpinner hook.
 * Provides comprehensive loading indicators with accessibility support.
 */

import React, { forwardRef } from 'react';
import { useSpinner } from '../hooks';
import type { UseSpinnerProps, SpinnerValue } from '../hooks';

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
  spinnerRef: React.RefObject<HTMLDivElement | null>;
  labelRef: React.RefObject<HTMLDivElement | null>;
  /** Utility functions */
  formatLabel: (active: boolean, customLabel?: string) => string;
  getDuration: (speed: UseSpinnerProps['speed'], customDuration?: number) => number;
  shouldAnimate: (active: boolean, disabled: boolean) => boolean;
  /** Computed values */
  size: NonNullable<UseSpinnerProps['size']>;
  speed: NonNullable<UseSpinnerProps['speed']>;
  variant: NonNullable<UseSpinnerProps['variant']>;
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
  variant: NonNullable<UseSpinnerProps['variant']>;
  /** Spinner size */
  size: NonNullable<UseSpinnerProps['size']>;
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
  /** Whether spinner is disabled */
  disabled: boolean;
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
    xs: ' ',
    sm: ' ',
    md: ' ',
    lg: ' ',
    xl: ' ',
    '2xl': ' ',
    '3xl': ' ',
    '4xl': ' '
  }[spinnerHook.config.size];

  // Speed classes
  const speedClasses = {
    slow: '',
    normal: '',
    fast: ''
  }[spinnerHook.config.speed];

  // Variant classes
  const variantClasses = {
    spin: '   ',
    pulse: '',
    bounce: '',
    dots: ' ',
    bars: ' ',
    ring: ''
  }[spinnerHook.config.variant];

  // Color classes
  const colorClasses = {
    primary: '',
    success: '',
    warning: '',
    error: '',
    info: '',
    gray: ''
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
              
              ${sizeClasses}
              ${variantClasses}
              ${colorClasses}
              ${animating ? animationClasses : ''}
              ${props.disabled ? '' : ''}
              ${props.className}
            `}
            style={props.style}
          />
        );

      case 'pulse':
        return (
          <div
            className={`
              
              ${sizeClasses}
              ${colorClasses}
              ${animating ? '' : ''}
              ${props.disabled ? '' : ''}
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
              ${animating ? '' : ''}
              ${props.disabled ? '' : ''}
              
              ${props.className}
            `}
            style={props.style}
          />
        );

      case 'dots':
        return (
          <div
            className={`
               
              ${props.disabled ? '' : ''}
              ${props.className}
            `}
            style={props.style}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`
                  ${{
                    xs: ' ',
                    sm: ' ',
                    md: ' ',
                    lg: ' ',
                    xl: ' ',
                    '2xl': ' ',
                    '3xl': ' ',
                    '4xl': ' '
                  }[size]}
                  ${colorClasses.replace('border-', 'bg-')}
                  
                  ${animating ? '' : ''}
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
               
              ${props.disabled ? '' : ''}
              ${props.className}
            `}
            style={props.style}
          >
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`
                  ${{
                    xs: ' ',
                    sm: ' ',
                    md: ' ',
                    lg: ' ',
                    xl: ' ',
                    '2xl': ' ',
                    '3xl': ' ',
                    '4xl': ' '
                  }[size]}
                  ${colorClasses.replace('border-', 'bg-')}
                  ${animating ? '' : ''}
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
              
              ${sizeClasses}
              ${props.disabled ? '' : ''}
              ${props.className}
            `}
            style={props.style}
          >
            {/* Background ring */}
            <div
              className={`
                 
                
                
                ${colorClasses.replace('border-', 'border-') + '-200'}
              `}
            />
            {/* Progress ring */}
            <div
              className={`
                 
                
                
                
                
                
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
      
      
      ${props.animating ? '' : ''}
      ${props.disabled ? '' : ''}
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
          disabled: props.disabled,
          label: props.label,
          showLabel: props.showLabel,
          className: '',
          style: {}
        })
      : defaultLabelRender({
          value: props.value,
          active: props.isActive,
          animating: props.isAnimating,
          disabled: props.disabled,
          label: props.label,
          showLabel: props.showLabel,
          className: '',
          style: {}
        });

    const baseSpinnerClasses = `
      
      
      
      
      
      ${props.disabled ? ' ' : ''}
      ${props.className}
    `;

    const spinnerContainer = (
      <div className={baseSpinnerClasses}>
        <div
          ref={props.spinnerRef}
          className={`
            
            ${dimension ? `w-${dimension} h-${dimension}` : sizeClasses}
            ${props.disabled ? ' ' : ''}
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
          <div className="          ">
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