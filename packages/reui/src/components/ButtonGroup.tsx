/**
 * ButtonGroup renderer component.
 * Renders a group of buttons with consistent styling and behavior.
 */

import React, { forwardRef } from 'react';
import { useButtonGroup } from '../hooks';
import type { UseButtonGroupProps } from '../hooks';

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
    '',
    orientation === 'vertical' ? '' : '',
    attached
      ? orientation === 'vertical'
        ? ' '
        : ' '
      : orientation === 'vertical'
        ? ''
        : '',
    disabled ? ' ' : '',
    className
  ].filter(Boolean).join(' ');

  // Button size classes
  const sizeClasses = {
    sm: '  ',
    md: '  ',
    lg: '  '
  };

  // Button variant classes
  const variantClasses = {
    primary: '    ',
    secondary: '    ',
    outline: '    ',
    ghost: '    '
  };

  // Button base classes
  const buttonBaseClasses = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    disabled ? ' ' : ''
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
      attached ? '' : '',
      attached && orientation === 'horizontal' ? (
        index === 0 ? ' ' :
        index === buttons.length - 1 ? ' ' : ''
      ) : '',
      attached && orientation === 'vertical' ? (
        index === 0 ? ' ' :
        index === buttons.length - 1 ? ' ' : ''
      ) : '',
      isSelected ? [
        variant === 'primary' ? ' ' : '',
        variant === 'secondary' ? ' ' : '',
        variant === 'outline' ? '  ' : '',
        variant === 'ghost' ? ' ' : ''
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
      {...groupProps}
      ref={ref}
      className={baseClasses}
      data-selected-index={state.selectedIndex}
      data-button-count={state.buttonCount}
    >
      {buttons.map(renderButton)}
    </Container>
  );
});

ButtonGroup.displayName = 'ButtonGroup';