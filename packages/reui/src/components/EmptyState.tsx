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
    const baseClasses = '       ';
    const variantClasses = variant === 'primary'
      ? '   '
      : '   ';

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

    const baseClasses = '          ';
    const variantClasses = {
      'no-data': ' ',
      'no-results': ' ',
      'no-connection': ' ',
      'error': ' ',
      'loading': ' '
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
          <div className=" " role="img" aria-hidden={true}>
            {icon}
          </div>
        )}

        {/* Title */}
        {title && (
          <h3 className="   ">
            {title}
          </h3>
        )}

        {/* Description */}
        {description && (
          <p className="  ">
            {description}
          </p>
        )}

        {/* Custom content */}
        {children && (
          <div className="">
            {children}
          </div>
        )}

        {/* Action buttons */}
        {state.showActions && (primaryActionText || secondaryActionText) && (
          <div className="   ">
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
            className="       "
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