/**
 * Button renderer component using headless useButton hook.
 * Provides styled button with all variants and states.
 */

import React, { forwardRef, useEffect } from 'react';
import { useButton } from '../hooks';
import type { UseButtonProps } from '../hooks';

export interface ButtonProps extends UseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof UseButtonProps | 'children'> {
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
  ref: React.RefObject<HTMLElement | null>;
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
    ...buttonProps
  });

  // Forward the consumer's ref to the DOM button. The hook's internal focusRef
  // (button.ref) attaches to the <button> for focus/blur actions; this effect
  // mirrors that node to the forwarded ref so consumers can access it.
  useEffect(() => {
    const node = button.ref.current as HTMLButtonElement | null;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  }, [ref, button.ref]);

  // Filter out known button props to get remaining HTML attributes
  const {
    onPress,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    variant,
    size,
    color,
    ...htmlAttributes
  } = buttonProps;

  // Default render function
  const defaultRender = (props: ButtonRenderProps) => {
    return (
      <button
        ref={props.ref as React.RefObject<HTMLButtonElement>}
        className={props.className}
        style={style}
        {...props.semanticAttributes}
        {...htmlAttributes}
        disabled={props.disabled}
        aria-pressed={props.pressed ? 'true' : 'false'}
        tabIndex={props.disabled ? -1 : 0}
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