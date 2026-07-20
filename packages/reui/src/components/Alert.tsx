/**
 * Alert renderer component using headless useAlert hook.
 * Provides styled alert with different variants and accessibility.
 */

import React, { forwardRef } from 'react';
import { useAlert } from '../hooks';
import { Button } from './Button';
import type { UseAlertProps } from '../hooks';

export interface AlertProps extends UseAlertProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Alert children content */
  children?: React.ReactNode;
  /** Custom render function */
  render?: (props: AlertRenderProps) => React.ReactElement;
  /** Custom icon render function */
  renderIcon?: (variant: string) => React.ReactNode;
}

export interface AlertRenderProps {
  /** Computed class names */
  className: string;
  /** Alert state */
  open: boolean;
  focused: boolean;
  pressed: boolean;
  dismissing: boolean;
  /** Computed variant */
  variant: string;
  /** Computed severity */
  severity: string;
  /** Event handlers */
  dismiss: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** Reference to DOM element */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Styled alert component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(({
  className,
  style,
  title,
  description,
  dismissible,
  children,
  render,
  renderIcon,
  ...alertProps
}: AlertProps, ref) => {
  const alert = useAlert({
    ...alertProps,
    // `dismissible` is destructured above so it must be forwarded explicitly,
    // otherwise the hook never sees it and Escape/auto-dismiss stay inert.
    dismissible
  });

  // Default icon render function
  const defaultIconRender = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return (
          <svg className=" " fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className=" " fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className=" " fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className=" " fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Default render function
  const defaultRender = (props: AlertRenderProps) => {
    if (!props.open) {
      return null;
    }

    const variantClasses = {
      default: '  ',
      destructive: '  ',
      warning: '  ',
      success: '  '
    };

    const baseClasses = '       ';
    const dismissClasses = props.dismissing ? ' ' : ' ';

    return (
      <div
        ref={props.ref as React.RefObject<HTMLDivElement>}
        className={`${baseClasses} ${variantClasses[props.variant as keyof typeof variantClasses]} ${dismissClasses} ${className || ''}`}
        style={style}
        {...props.semanticAttributes}
      >
        {/* Icon */}
        <div className=" ">
          {renderIcon ? renderIcon(props.variant) : defaultIconRender(props.variant)}
        </div>

        {/* Content */}
        <div className=" ">
          {title && (
            <h4 className=" " id={`${props.semanticAttributes.id || 'alert'}-title`}>
              {title}
            </h4>
          )}

          {description && (
            <p className="" id={`${props.semanticAttributes.id || 'alert'}-description`}>
              {description}
            </p>
          )}

          {children && (
            <div className=" ">
              {children}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <div className="">
            <Button
              size="sm"
              variant="ghost"
              onPress={props.dismiss}
              aria-label="Dismiss alert"
              className=" "
            >
              <svg className=" " fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render props
  const renderProps: AlertRenderProps = {
    className: className || '',
    open: alert.open,
    focused: alert.focused,
    pressed: alert.pressed,
    dismissing: alert.dismissing,
    variant: alert.computedVariant,
    severity: alert.computedSeverity,
    dismiss: alert.dismiss,
    handleKeyDown: alert.handleKeyDown,
    semanticAttributes: alert.semanticAttributes,
    ref: alert.alertRef,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Alert.displayName = 'Alert';