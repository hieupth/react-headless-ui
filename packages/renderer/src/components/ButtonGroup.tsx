/**
 * ButtonGroup renderer component.
 * Renders a group of buttons with consistent styling and behavior.
 */

import React, { forwardRef } from 'react';
import { useButtonGroup } from '@react-ui/core/headless';
import type { UseButtonGroupProps } from '@react-ui/core/headless';

export interface ButtonGroupProps extends
  Omit<UseButtonGroupProps, 'totalItems'> {
  /** List of buttons to render */
  buttons: Array<{
    /** Button label or content */
    label: React.ReactNode;
    /** Button value */
    value?: any;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Additional button props */
    buttonProps?: Record<string, any>;
    /** Click handler for this specific button */
    onClick?: (event: React.MouseEvent) => void;
  }>;
  /** Additional CSS classes */
  className?: string;
  /** Children render function for custom button rendering */
  children?: (
    button: any,
    buttonProps: Record<string, any>,
    index: number,
    isSelected: boolean
  ) => React.ReactNode;
  /** Whether to render as a div (true) or span (false) */
  as?: boolean;
}

/**
 * ButtonGroup component that renders a group of related buttons.
 * Supports both exclusive (radio-like) and inclusive (checkbox-like) selection.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({
  buttons = [],
  orientation = 'horizontal',
  attached = false,
  exclusive = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  className = '',
  children,
  as = true,
  selectedIndex,
  defaultSelectedIndex,
  onSelectionChange,
  ...semanticProps
}, ref) => {
  const {
    state,
    actions,
    semanticAttributes,
    groupProps,
    getButtonProps
  } = useButtonGroup({
    totalItems: buttons.length,
    orientation,
    attached,
    exclusive,
    disabled,
    size,
    variant,
    selectedIndex,
    defaultSelectedIndex,
    onSelectionChange,
    ...semanticProps
  });

  // Base classes for the button group container
  const baseClasses = [
    'inline-flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    attached
      ? orientation === 'vertical'
        ? 'divide-y divide-gray-200'
        : 'divide-x divide-gray-200'
      : orientation === 'vertical'
        ? 'space-y-1'
        : 'space-x-1',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  // Button size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Button variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray-500'
  };

  // Button base classes
  const buttonBaseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'border',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'transition-colors',
    'duration-200',
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  ].filter(Boolean).join(' ');

  // Render individual button
  const renderButton = (button: any, index: number) => {
    const isSelected = actions.isSelected(index);
    const buttonProps = getButtonProps(index, {
      ...button.buttonProps,
      disabled: disabled || button.disabled,
      onClick: button.onClick
    });

    // Calculate button classes
    const buttonClasses = [
      buttonBaseClasses,
      sizeClasses[size],
      variantClasses[variant],
      attached ? '' : 'rounded-md',
      attached && orientation === 'horizontal' ? (
        index === 0 ? 'rounded-l-md rounded-r-none' :
        index === buttons.length - 1 ? 'rounded-r-md rounded-l-none' : 'rounded-none'
      ) : '',
      attached && orientation === 'vertical' ? (
        index === 0 ? 'rounded-t-md rounded-b-none' :
        index === buttons.length - 1 ? 'rounded-b-md rounded-t-none' : 'rounded-none'
      ) : '',
      isSelected ? [
        variant === 'primary' ? 'bg-blue-700 border-blue-700' : '',
        variant === 'secondary' ? 'bg-gray-700 border-gray-700' : '',
        variant === 'outline' ? 'bg-blue-50 border-blue-500 text-blue-700' : '',
        variant === 'ghost' ? 'bg-gray-200 text-gray-900' : ''
      ].filter(Boolean).join(' ') : ''
    ].filter(Boolean).join(' ');

    // Use custom render function if provided
    if (children) {
      return (
        <span key={index} {...buttonProps}>
          {children(button, buttonProps, index, isSelected)}
        </span>
      );
    }

    // Default button rendering
    return (
      <button
        key={index}
        {...buttonProps}
        className={`${buttonClasses} ${buttonProps.className || ''}`}
      >
        {button.label}
      </button>
    );
  };

  // Container component
  const Container = as ? 'div' : 'span';

  return (
    <Container
      ref={ref}
      {...groupProps}
      className={baseClasses}
      data-selected-index={state.selectedIndex}
      data-button-count={state.buttonCount}
    >
      {buttons.map(renderButton)}
    </Container>
  );
});

ButtonGroup.displayName = 'ButtonGroup';