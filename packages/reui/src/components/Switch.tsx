/**
 * Switch renderer component using headless useSwitch hook.
 * Provides styled toggle switch with accessibility support.
 */

import React, { forwardRef } from 'react';
import { useSwitch } from '../hooks';
import type { UseSwitchProps } from '../hooks';

export interface SwitchProps extends UseSwitchProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function */
  render?: (props: SwitchRenderProps) => React.ReactElement;
  /** Custom thumb render function */
  renderThumb?: (props: SwitchThumbRenderProps) => React.ReactNode;
  /** Custom label render function */
  renderLabel?: (props: SwitchLabelRenderProps) => React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Variant */
  variant?: 'default' | 'outline' | 'solid';
  /** Show label */
  showLabel?: boolean;
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Custom checked color */
  checkedColor?: string;
  /** Custom unchecked color */
  uncheckedColor?: string;
  /** Animated transitions */
  animated?: boolean;
}

export interface SwitchRenderProps {
  /** Computed class names */
  className: string;
  /** Switch state */
  checked: boolean;
  focused: boolean;
  pressed: boolean;
  hovered: boolean;
  disabled: boolean;
  readOnly: boolean;
  /** Event handlers */
  onClick: (event: React.MouseEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onFocus: (event: React.FocusEvent) => void;
  onBlur: (event: React.FocusEvent) => void;
  onMouseEnter: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  /** Actions */
  toggle: () => void;
  setChecked: (checked: boolean) => void;
  /** Semantic attributes */
  switchAttributes: Record<string, any>;
  /** Form attributes */
  formAttributes: Record<string, any>;
  /** Consumer DOM pass-through (aria-label, etc.) forwarded onto the button */
  ariaProps: React.AriaAttributes;
  /** References */
  switchRef: React.RefObject<HTMLButtonElement | null>;
  /** Size classes */
  sizeClasses: string;
  /** Variant classes */
  variantClasses: string;
  /** Animation classes */
  animationClasses: string;
}

export interface SwitchThumbRenderProps {
  /** Switch state */
  checked: boolean;
  disabled: boolean;
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

export interface SwitchLabelRenderProps {
  /** Switch state */
  checked: boolean;
  disabled: boolean;
  /** Label text */
  text?: string;
  /** CSS classes */
  className: string;
  /** Styles */
  style?: React.CSSProperties;
}

/**
 * Styled switch component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(({
  className,
  style,
  render,
  renderThumb,
  renderLabel,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  labelPosition = 'right',
  checkedColor,
  uncheckedColor,
  animated = true,
  ...switchProps
}: SwitchProps, ref) => {
  const switchHook = useSwitch({
    ...switchProps,
    className,
    style,
    // Merge external ref with internal ref
    switchRef: ref as React.RefObject<HTMLButtonElement>
  });

  // Consumer DOM pass-through (aria-label, aria-labelledby, aria-describedby,
  // title, id, …). The hook computes its own switchAttributes/formAttributes
  // but does not surface these, so a consumer <Switch aria-label="…" /> would
  // otherwise render an unlabeled button. Spread AFTER the hook attributes so
  // the consumer's accessible name wins.
  const ariaProps: React.AriaAttributes = {};
  for (const key of Object.keys(switchProps)) {
    if (key.startsWith('aria-') || key === 'title' || key === 'id') {
      (ariaProps as Record<string, unknown>)[key] = (switchProps as Record<string, unknown>)[key];
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-8'
  }[size];

  // Thumb size classes
  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-200',
    outline: 'border-2 border-gray-300 bg-transparent',
    solid: 'bg-gray-100'
  }[variant];

  // Animation classes
  const animationClasses = animated ? 'transition-all duration-200 ease-in-out' : '';

  // Default thumb render function
  const defaultThumbRender = (props: SwitchThumbRenderProps) => {
    const baseThumbClasses = `
      ${thumbSizeClasses}
      rounded-full
      bg-white
      shadow-sm
      border border-gray-200
      ${props.disabled ? 'opacity-50' : ''}
      ${animationClasses}
    `;

    // Transform thumb based on checked state
    const thumbTransform = {
      sm: props.checked ? 'translate-x-3' : 'translate-x-0.5',
      md: props.checked ? 'translate-x-5' : 'translate-x-0.5',
      lg: props.checked ? 'translate-x-6' : 'translate-x-1'
    }[size];

    return (
      <span
        className={`${baseThumbClasses} ${thumbTransform}`}
        style={{
          ...props.style,
          transform: thumbTransform
        }}
      />
    );
  };

  // Default label render function
  const defaultLabelRender = (props: SwitchLabelRenderProps) => {
    // reason: defaultLabelRender is only invoked from defaultRender when
    // `showLabel && label` (a non-empty string), so props.text is always
    // truthy here; this guard exists for direct/custom callers.
    /* c8 ignore next */
    if (!props.text) return null;

    const baseLabelClasses = `
      text-sm
      font-medium
      ${props.disabled ? 'text-gray-400' : 'text-gray-700'}
      ${props.checked ? 'text-blue-600' : ''}
    `;

    return (
      <span
        className={baseLabelClasses}
        style={props.style}
      >
        {props.text}
      </span>
    );
  };

  // Default render function
  const defaultRender = (props: SwitchRenderProps) => {
    // Compute track background color
    const trackBgColor = props.checked
      ? checkedColor || 'bg-blue-600'
      : uncheckedColor || variantClasses;

    // hovered is driven by mouseenter/mouseleave via useSwitch handlers.
    const hoverClass = props.hovered && !props.disabled ? 'brightness-110' : '';

    const baseSwitchClasses = `
      relative
      inline-flex
      items-center
      ${sizeClasses}
      ${trackBgColor}
      rounded-full
      ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${props.focused ? 'ring-2 ring-blue-500 ring-opacity-50 ring-offset-2' : ''}
      ${hoverClass}
      ${animationClasses}
      ${props.className}
    `;

    // Render thumb
    const thumbElement = renderThumb
      ? renderThumb({
          checked: props.checked,
          disabled: props.disabled,
          className: '',
          style: {}
        })
      : defaultThumbRender({
          checked: props.checked,
          disabled: props.disabled,
          className: '',
          style: {}
        });

    // Render label if needed
    let labelElement = null;
    if (showLabel && label) {
      labelElement = renderLabel
        ? renderLabel({
            checked: props.checked,
            disabled: props.disabled,
            text: label,
            className: '',
            style: {}
          })
        : defaultLabelRender({
            checked: props.checked,
            disabled: props.disabled,
            text: label,
            className: '',
            style: {}
          });
    }

    // Layout based on label position
    const switchContent = (
      <button
        ref={props.switchRef}
        type="button"
        className={baseSwitchClasses}
        style={style}
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        {...props.switchAttributes}
        {...props.formAttributes}
        {...props.ariaProps}
      >
        {thumbElement}
      </button>
    );

    if (labelElement) {
      const containerClasses = `inline-flex items-center gap-2 ${
        labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
      }`;

      return (
        <div className={containerClasses}>
          {switchContent}
          {labelElement}
        </div>
      );
    }

    return switchContent;
  };

  // Render props
  const renderProps: SwitchRenderProps = {
    className: switchHook.className,
    checked: switchHook.state.checked,
    focused: switchHook.state.focused,
    pressed: switchHook.state.pressed,
    hovered: switchHook.state.hovered,
    disabled: switchHook.state.disabled,
    readOnly: switchHook.state.readOnly,
    onClick: switchHook.handlers.onClick,
    onKeyDown: switchHook.handlers.onKeyDown,
    onFocus: switchHook.handlers.onFocus,
    onBlur: switchHook.handlers.onBlur,
    onMouseEnter: switchHook.handlers.onMouseEnter,
    onMouseLeave: switchHook.handlers.onMouseLeave,
    toggle: switchHook.actions.toggle,
    setChecked: switchHook.actions.setChecked,
    switchAttributes: switchHook.switchAttributes,
    formAttributes: switchHook.formAttributes,
    ariaProps,
    switchRef: switchHook.switchRef,
    sizeClasses,
    variantClasses,
    animationClasses
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Switch.displayName = 'Switch';

/**
 * Simple switch wrapper for common use cases.
 */
export interface SimpleSwitchProps {
  /** Whether switch is checked */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether switch is disabled */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SimpleSwitch = forwardRef<HTMLButtonElement, SimpleSwitchProps>(({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  size = 'md',
  className,
  style
}, ref) => (
  <Switch
    checked={checked}
    defaultChecked={defaultChecked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    label={label}
    showLabel={!!label}
    size={size}
    className={className}
    style={style}
    ref={ref}
  />
));

SimpleSwitch.displayName = 'SimpleSwitch';

/**
 * Labeled switch with integrated label.
 */
export const LabeledSwitch = forwardRef<HTMLButtonElement, Omit<SwitchProps, 'showLabel'>>(({
  label,
  labelPosition = 'right',
  ...props
}, ref) => (
  <Switch
    {...props}
    label={label}
    showLabel={!!label}
    labelPosition={labelPosition}
    ref={ref}
  />
));

LabeledSwitch.displayName = 'LabeledSwitch';