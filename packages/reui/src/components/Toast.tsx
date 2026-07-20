/**
 * Toast renderer component using headless useToast hook.
 * Provides styled toast notifications with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useToast, type UseToastProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface ToastProps extends UseToastProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom toast item renderer */
  renderToast?: (toast: any, index: number, onDismiss: () => void) => React.ReactNode;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Custom close button content */
  closeButtonContent?: React.ReactNode;
}

/**
 * Toast component with notification system.
 * Supports multiple variants, auto-dismiss, and stacking.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(({
  className = '',
  style,
  renderToast,
  showProgress: showProgressProp = false,
  closeButtonContent,
  ...toastProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    containerAttributes
  } = useToast({
    ...toastProps,
    showProgress: showProgressProp
  });

  // Position classes
  const getPositionClasses = (position: string) => {
    const positions = {
      '': ' ',
      '': ' ',
      '': '  transform -translate-x-1/2',
      '': ' ',
      '': ' ',
      '': '  transform -translate-x-1/2'
    };
    return positions[position as keyof typeof positions] || '';
  };

  // Variant classes
  const getVariantClasses = (variant: string) => {
    const variants = {
      default: ' ',
      success: ' ',
      error: ' ',
      warning: ' ',
      info: ' '
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  // Base container classes
  const containerClasses = `
    toast-container
     
     
    pointer-events-none
    ${getPositionClasses(state.position)}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default toast renderer
  const defaultRenderToast = (toast: any, index: number, onDismiss: () => void) => {
    const variantClasses = getVariantClasses(toast.variant);
    const elapsed = Date.now() - toast.createdAt;
    const progress = toast.duration > 0 ? Math.min(100, (elapsed / toast.duration) * 100) : 0;

    return (
      <div
        key={toast.id}
        className={`
          toast-item
          ${variantClasses}
              
           
          pointer-events-auto
            
          ${index > 0 ? '' : ''}
          ${state.isPaused ? '' : ''}
        `}
        onMouseEnter={() => actions.pause()}
        onMouseLeave={() => actions.resume()}
        data-testid={`toast-${toast.id}`}
      >
        {/* Toast content */}
        <div className="  ">
          {/* Message */}
          <div className=" ">
            {toast.title && (
              <h4 className="  ">
                {toast.title}
              </h4>
            )}
            <p className=" ">
              {toast.message}
            </p>

            {/* Action button */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="          "
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          {toast.dismissible && (
            <button
              onClick={onDismiss}
              className="         "
              aria-label="Dismiss notification"
            >
              {closeButtonContent || (
                <svg
                  className=" "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {showProgressProp && toast.duration > 0 && (
          <div className="">
            <div className="  ">
              <div
                className="    "
                style={{
                  width: `${100 - progress}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sort toasts by creation time (newest first)
  const sortedToasts = [...state.toasts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div
      ref={ref}
      className={containerClasses}
      style={style}
      {...containerAttributes}
      data-testid="toast-container"
    >
      {sortedToasts.map((toast, index) => {
        const onDismiss = () => actions.dismiss(toast.id);

        return renderToast
          ? renderToast(toast, index, onDismiss)
          : defaultRenderToast(toast, index, onDismiss);
      })}
    </div>
  );
});

Toast.displayName = 'Toast';

/**
 * ToastProvider - Context provider for toast functionality
 */
export const ToastProvider = forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  return <Toast {...props} ref={ref} />;
});

ToastProvider.displayName = 'ToastProvider';

export default Toast;