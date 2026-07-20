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
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position as keyof typeof positions] || 'top-right';
  };

  // Variant classes
  const getVariantClasses = (variant: string) => {
    const variants = {
      default: 'bg-gray-800 text-white',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
      info: 'bg-blue-600 text-white'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  // Base container classes
  const containerClasses = `
    toast-container
    fixed z-50
    flex flex-col
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
          p-4 rounded-lg shadow-lg border border-gray-700
          min-w-[300px] max-w-md
          pointer-events-auto
          transition-all duration-300 ease-out
          ${index > 0 ? 'mt-2' : ''}
          ${state.isPaused ? 'opacity-100' : 'opacity-100'}
        `}
        onMouseEnter={() => actions.pause()}
        onMouseLeave={() => actions.resume()}
        data-testid={`toast-${toast.id}`}
      >
        {/* Toast content */}
        <div className="flex items-start justify-between">
          {/* Message */}
          <div className="flex-1 pr-2">
            {toast.title && (
              <h4 className="font-semibold text-sm mb-1">
                {toast.title}
              </h4>
            )}
            <p className="text-sm leading-relaxed">
              {toast.message}
            </p>

            {/* Action button */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          {toast.dismissible && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 ml-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded"
              aria-label="Dismiss notification"
            >
              {closeButtonContent || (
                <svg
                  className="w-4 h-4"
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
          <div className="mt-3">
            <div className="bg-white/20 rounded-full h-1">
              <div
                className="bg-white rounded-full h-1 transition-all duration-100"
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