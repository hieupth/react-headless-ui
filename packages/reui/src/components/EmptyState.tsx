/**
 * Empty State renderer component.
 * Provides visual representation for empty state UI components with accessibility.
 */

import React, { forwardRef } from 'react';
import { useEmptyState } from '../hooks';
import type { UseEmptyStateProps } from '../hooks';

/**
 * Empty State component props
 */
export interface EmptyStateProps extends UseEmptyStateProps {
  /** Empty state title */
  title?: string;
  /** Empty state description */
  description?: string;
  /** Icon or illustration to display */
  icon?: React.ReactNode;
  /** Primary action button text */
  primaryActionText?: string;
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Custom content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Empty State Action Button component
 */
interface EmptyStateActionProps {
  /** Button text */
  children: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Additional CSS classes */
  className?: string;
}

const EmptyStateAction = forwardRef<HTMLButtonElement, EmptyStateActionProps>(
  ({ children, onClick, variant = 'primary', className = '', ...props }, ref) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

EmptyStateAction.displayName = 'EmptyStateAction';

/**
 * Empty State component
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    title,
    description,
    icon,
    primaryActionText,
    secondaryActionText,
    children,
    className = '',
    style,
    ...props
  }: EmptyStateProps, ref) => {
    const {
      state,
      handlers,
      attributes
    } = useEmptyState(props);

    // Don't render if not visible
    if (!state.visible) {
      return null;
    }

    const baseClasses = 'flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50';
    const variantClasses = {
      'no-data': 'border-gray-300 bg-gray-50',
      'no-results': 'border-yellow-300 bg-yellow-50',
      'no-connection': 'border-red-300 bg-red-50',
      'error': 'border-red-300 bg-red-50',
      'loading': 'border-blue-300 bg-blue-50'
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[state.variant]} ${className}`}
        style={style}
        {...attributes}
        data-testid={`empty-state-${state.variant}`}
      >
        {/* Icon/Illustration */}
        {icon && (
          <div className="mb-4 text-4xl" role="img" aria-hidden={true}>
            {icon}
          </div>
        )}

        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-6 max-w-md">
            {description}
          </p>
        )}

        {/* Custom content */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}

        {/* Action buttons */}
        {state.showActions && (primaryActionText || secondaryActionText) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {primaryActionText && (
              <EmptyStateAction onClick={handlers.handlePrimaryAction} variant="primary">
                {primaryActionText}
              </EmptyStateAction>
            )}
            {secondaryActionText && (
              <EmptyStateAction onClick={handlers.handleSecondaryAction} variant="secondary">
                {secondaryActionText}
              </EmptyStateAction>
            )}
          </div>
        )}

        {/* Dismiss button */}
        {state.dismissible && (
          <button
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            onClick={handlers.handleDismiss}
            aria-label="Dismiss empty state"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;