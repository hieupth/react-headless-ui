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
    'fixed inset-0 z-50',
    'flex items-center justify-center',
    'p-4',
    'bg-black/50',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'transition-all duration-200'
  ].filter(Boolean).join(' ');

  // Base classes for content
  const contentBaseClasses = [
    'relative',
    'bg-white',
    'rounded-lg',
    'shadow-lg',
    'max-w-md',
    'w-full',
    'max-h-[90vh]',
    'overflow-auto',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
    'duration-200'
  ].filter(Boolean).join(' ');

  // Variant-specific classes
  const variantClasses = {
    default: 'border border-gray-200',
    destructive: 'border border-red-200',
    warning: 'border border-yellow-200'
  };

  // Button variant classes
  const cancelButtonClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'px-4',
    'py-2',
    'text-sm',
    'font-medium',
    'rounded-md',
    'border',
    'bg-white',
    'text-gray-700',
    'border-gray-300',
    'hover:bg-gray-50',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'transition-colors',
    'duration-200'
  ].filter(Boolean).join(' ');

  const confirmButtonClasses = {
    default: [
      'inline-flex',
      'items-center',
      'justify-center',
      'px-4',
      'py-2',
      'text-sm',
      'font-medium',
      'rounded-md',
      'bg-blue-600',
      'text-white',
      'border',
      'border-blue-600',
      'hover:bg-blue-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'transition-colors',
      'duration-200'
    ].filter(Boolean).join(' '),
    destructive: [
      'inline-flex',
      'items-center',
      'justify-center',
      'px-4',
      'py-2',
      'text-sm',
      'font-medium',
      'rounded-md',
      'bg-red-600',
      'text-white',
      'border',
      'border-red-600',
      'hover:bg-red-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-red-500',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'transition-colors',
      'duration-200'
    ].filter(Boolean).join(' '),
    warning: [
      'inline-flex',
      'items-center',
      'justify-center',
      'px-4',
      'py-2',
      'text-sm',
      'font-medium',
      'rounded-md',
      'bg-yellow-600',
      'text-white',
      'border',
      'border-yellow-600',
      'hover:bg-yellow-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-yellow-500',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'transition-colors',
      'duration-200'
    ].filter(Boolean).join(' ')
  };

  // Icon for variants
  const getVariantIcon = () => {
    switch (variant) {
      case 'destructive':
        return (
          <div className="flex-shrink-0 w-6 h-6 text-red-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex-shrink-0 w-6 h-6 text-yellow-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-6 h-6 text-blue-600">
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
        <div className="flex items-start space-x-3 p-6 pb-4">
          {getVariantIcon()}
          <div className="flex-1 min-w-0">
            <h3
              {...titleProps}
              className="text-lg font-medium text-gray-900 leading-6"
            >
              {title}
            </h3>
            {description && (
              <p
                {...descriptionProps}
                className="mt-2 text-sm text-gray-500"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
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
              state.confirming ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {state.confirming ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  />
));

AlertDialogTrigger.displayName = 'AlertDialogTrigger';