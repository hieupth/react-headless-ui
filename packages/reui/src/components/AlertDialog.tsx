/**
 * AlertDialog renderer component.
 * Renders modal dialogs for confirmations and destructive actions.
 */

import React, { forwardRef } from 'react';
import { useAlertDialog } from '../hooks';
import type {
  UseAlertDialogProps,
  UseAlertDialogState,
  UseAlertDialogActions,
} from '../hooks';

/**
 * Strips a `[key: string]: unknown` index signature from `T`, keeping only its
 * explicitly-declared (literal-keyed) members. The mixin prop interfaces that
 * `UseAlertDialogProps` extends each carry such an index signature; when
 * inherited, it causes every destructured named prop binding to widen to
 * `unknown`. This rebuilds the prop type from the named fields only so
 * bindings stay typed.
 */
type WithNamedKeysOnly<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

export interface AlertDialogProps extends
  Omit<WithNamedKeysOnly<UseAlertDialogProps>, 'title' | 'description'> {
  /** Dialog title */
  title: React.ReactNode;
  /** Dialog description */
  description?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Children render function for custom content */
  children?: (
    props: {
      state: UseAlertDialogState;
      actions: UseAlertDialogActions;
      overlayProps: Record<string, any>;
      contentProps: Record<string, any>;
      titleProps: Record<string, any>;
      descriptionProps: Record<string, any>;
      cancelButtonProps: Record<string, any>;
      confirmButtonProps: Record<string, any>;
    }
  ) => React.ReactNode;
  /** Whether to show as a sheet on mobile */
  asSheet?: boolean;
}

/**
 * AlertDialog component that renders modal confirmation dialogs.
 * Supports destructive actions, warnings, and async confirmation handlers.
 */
export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(({
  title,
  description,
  variant = 'default',
  showCancel = true,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  className = '',
  children,
  asSheet = false,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  modal = true,
  closeOnEscape = true,
  initialFocus,
  ...semanticProps
}, ref) => {
  const {
    state,
    actions,
    semanticAttributes,
    overlayProps,
    contentProps,
    titleProps,
    descriptionProps,
    cancelButtonProps,
    confirmButtonProps
  } = useAlertDialog({
    open,
    onOpenChange,
    title: typeof title === 'string' ? title : 'Alert',
    description: typeof description === 'string' ? description : undefined,
    variant,
    showCancel,
    cancelText,
    confirmText,
    onConfirm,
    onCancel,
    modal,
    closeOnEscape,
    initialFocus,
    ...semanticProps
  });

  // Base classes for overlay
  const overlayBaseClasses = [
    '  ',
    '  ',
    '',
    '',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    ' '
  ].filter(Boolean).join(' ');

  // Base classes for content
  const contentBaseClasses = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
    ''
  ].filter(Boolean).join(' ');

  // Variant-specific classes
  const variantClasses = {
    default: ' ',
    destructive: ' ',
    warning: ' '
  };

  // Button variant classes
  const cancelButtonClasses = [
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
    ''
  ].filter(Boolean).join(' ');

  const confirmButtonClasses = {
    default: [
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
      ''
    ].filter(Boolean).join(' '),
    destructive: [
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
      ''
    ].filter(Boolean).join(' '),
    warning: [
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
      ''
    ].filter(Boolean).join(' ')
  };

  // Icon for variants
  const getVariantIcon = () => {
    switch (variant) {
      case 'destructive':
        return (
          <div className="   ">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="   ">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="   ">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Use custom render function if provided
  if (children) {
    return (
      <div
        {...overlayProps}
        className={`${overlayBaseClasses} ${className}`}
        style={{ display: open ? 'flex' : 'none' }}
      >
        {children({
          state,
          actions,
          overlayProps,
          contentProps,
          titleProps,
          descriptionProps,
          cancelButtonProps,
          confirmButtonProps
        })}
      </div>
    );
  }

  // Default rendering
  return (
    <div
      {...overlayProps}
      className={`${overlayBaseClasses} ${className}`}
      style={{ display: open ? 'flex' : 'none' }}
    >
      <div
        {...contentProps}
        ref={ref}
        className={`${contentBaseClasses} ${variantClasses[variant]}`}
      >
        {/* Header */}
        <div className="    ">
          {getVariantIcon()}
          <div className=" ">
            <h3
              {...titleProps}
              className="   "
            >
              {title}
            </h3>
            {description && (
              <p
                {...descriptionProps}
                className="  "
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="        ">
          {showCancel && (
            <button
              {...cancelButtonProps}
              className={cancelButtonClasses}
            >
              {cancelText}
            </button>
          )}
          <button
            {...confirmButtonProps}
            className={`${confirmButtonClasses[variant]} ${
              state.confirming ? ' ' : ''
            }`}
          >
            {state.confirming ? (
              <div className="  ">
                <div className="      " />
                <span>{confirmText}</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

AlertDialog.displayName = 'AlertDialog';

// Named exports for convenience
export const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onClick?: () => void;
  }
>(({ onClick, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    onClick={onClick}
    className="                "
  />
));

AlertDialogTrigger.displayName = 'AlertDialogTrigger';