/**
 * Button renderer component using headless useButton hook.
 * Provides styled button with all variants and states.
 */

import React, { forwardRef } from 'react';
import { useButton } from '@react-ui-forge/core';
import type { UseButtonProps } from '@react-ui-forge/core';

export interface ButtonProps extends UseButtonProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Button children content */
  children: React.ReactNode;
  /** Leading icon */
  leadingIcon?: React.ReactNode;
  /** Trailing icon */
  trailingIcon?: React.ReactNode;
  /** Loading indicator component */
  loadingIndicator?: React.ReactNode;
  /** Custom render function */
  render?: (props: ButtonRenderProps) => React.ReactElement;
}

export interface ButtonRenderProps {
  /** Computed class names */
  className: string;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** Event handlers */
  handleClick: (event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Button state */
  pressed: boolean;
  focused: boolean;
  disabled: boolean;
  loading: boolean;
  /** Reference to DOM element */
  ref: React.RefObject<HTMLElement>;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Styled button component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  style,
  children,
  leadingIcon,
  trailingIcon,
  loadingIndicator,
  render,
  ...buttonProps
}, ref) => {
  const button = useButton({
    ...buttonProps,
    // Merge external ref with internal ref
    focusRef: ref as React.RefObject<HTMLElement>
  });

  // Default render function
  const defaultRender = (props: ButtonRenderProps) => {
    return (
      <button
        ref={props.ref as React.RefObject<HTMLButtonElement>}
        className={props.className}
        style={style}
        {...props.semanticAttributes}
        disabled={props.disabled}
      >
        {props.loading && loadingIndicator && (
          <span className="button-loading-indicator">
            {loadingIndicator}
          </span>
        )}

        {!props.loading && leadingIcon && (
          <span className="button-leading-icon">
            {leadingIcon}
          </span>
        )}

        <span className="button-content">
          {props.children}
        </span>

        {!props.loading && trailingIcon && (
          <span className="button-trailing-icon">
            {trailingIcon}
          </span>
        )}
      </button>
    );
  };

  // Render props
  const renderProps: ButtonRenderProps = {
    className: `${button.className}${className ? ` ${className}` : ''}`,
    semanticAttributes: button.semanticAttributes,
    handleClick: button.handleClick,
    handleKeyDown: button.handleKeyDown,
    pressed: button.pressed,
    focused: button.focused,
    disabled: button.disabled,
    loading: button.loading,
    ref: button.ref,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Button.displayName = 'Button';