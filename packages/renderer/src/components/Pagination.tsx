/**
 * Pagination renderer component using headless usePagination hook.
 * Provides styled pagination controls with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { usePagination, type UsePaginationProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface PaginationProps extends Omit<UsePaginationProps, 'showFirstLast' | 'showPrevNext'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Whether to show page numbers */
  showPageNumbers?: boolean;
  /** Whether to show ellipsis */
  showEllipsis?: boolean;
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean;
  /** Whether to show previous/next buttons */
  showPrevNext?: boolean;
}

/**
 * Pagination component with page navigation controls.
 * Follows Flutter pagination patterns with proper accessibility.
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(({
  className = '',
  style,
  size = 'md',
  variant = 'default',
  color = 'primary',
  showPageNumbers = true,
  showEllipsis = true,
  showFirstLast = true,
  showPrevNext = true,
  disabled = false,
  ...paginationProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    handlers,
    pages,
    attributes
  } = usePagination({
    ...paginationProps,
    showFirstLast,
    showPrevNext,
    disabled,
    paginationRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300 shadow-sm',
    outline: 'bg-transparent border border-gray-300',
    ghost: 'bg-transparent'
  }[variant];

  // Color classes for active/current page
  const colorClasses = {
    primary: 'bg-blue-600 text-white border-blue-600',
    secondary: 'bg-gray-600 text-white border-gray-600',
    success: 'bg-green-600 text-white border-green-600',
    warning: 'bg-yellow-600 text-white border-yellow-600',
    error: 'bg-red-600 text-white border-red-600'
  }[color];

  // Button base classes
  const buttonBaseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed';

  // Page number button classes
  const pageButtonClasses = `${buttonBaseClasses} ${sizeClasses} px-3 py-2 mx-0.5 ${variantClasses}`;

  // Navigation button classes
  const navButtonClasses = `${buttonBaseClasses} ${sizeClasses} p-2 mx-0.5 ${variantClasses}`;

  return (
    <nav
      ref={ref}
      className={`flex items-center justify-center space-x-1 ${variantClasses} rounded-lg ${className || ''}`}
      style={style}
      {...attributes}
      aria-label="Pagination navigation"
    >
      {/* First page button */}
      {showFirstLast && state.totalPages > 1 && (
        <button
          onClick={handlers.handleFirst}
          disabled={!state.hasPrevious}
          className={navButtonClasses}
          aria-label="Go to first page"
          aria-disabled={!state.hasPrevious}
        >
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
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Previous page button */}
      {state.hasPrevious && (
        <button
          onClick={handlers.handlePrevious}
          disabled={!state.hasPrevious}
          className={navButtonClasses}
          aria-label="Go to previous page"
          aria-disabled={!state.hasPrevious}
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Page numbers */}
      {showPageNumbers && pages.map((pageNum, index) => {
        if (pageNum === '...' && showEllipsis) {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`px-2 py-1 ${sizeClasses} text-gray-500`}
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isActive = pageNum === state.page;
        const pageClasses = `${pageButtonClasses} ${
          isActive
            ? `${colorClasses[color]}`
            : 'text-gray-700 hover:bg-gray-100'
        }`;

        return (
          <button
            key={`page-${pageNum}`}
            onClick={() => handlers.handlePageChange(pageNum as number)}
            className={pageClasses}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Go to page ${pageNum}`}
            disabled={state.disabled}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next page button */}
      {state.hasNext && (
        <button
          onClick={handlers.handleNext}
          disabled={!state.hasNext}
          className={navButtonClasses}
          aria-label="Go to next page"
          aria-disabled={!state.hasNext}
        >
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Last page button */}
      {showFirstLast && state.totalPages > 1 && (
        <button
          onClick={handlers.handleLast}
          disabled={!state.hasNext}
          className={navButtonClasses}
          aria-label="Go to last page"
          aria-disabled={!state.hasNext}
        >
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
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </nav>
  );
});

Pagination.displayName = 'Pagination';

/**
 * Compact Pagination - simpler version with previous/next only
 */
export const CompactPagination = forwardRef<HTMLDivElement, PaginationProps>(({
  className = '',
  style,
  size = 'md',
  variant = 'default',
  color = 'primary',
  ...paginationProps
}, ref) => {
  const {
    state,
    handlers,
    attributes
  } = usePagination({
      ...paginationProps,
      showFirstLast: false,
      paginationRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300 shadow-sm',
    outline: 'bg-transparent border border-gray-300',
    ghost: 'bg-transparent'
  }[variant];

  // Button base classes
  const buttonBaseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <nav
      ref={ref}
      className={`flex items-center justify-between ${variantClasses} rounded-lg px-4 ${sizeClasses} ${className || ''}`}
      style={style}
      {...attributes}
      aria-label="Compact pagination navigation"
    >
      {/* Previous */}
      <button
        onClick={handlers.handlePrevious}
        disabled={!state.hasPrevious}
        className={`${buttonBaseClasses} px-3 py-1 ${state.hasPrevious ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400'}`}
        aria-label="Go to previous page"
        aria-disabled={!state.hasPrevious}
      >
        Previous
      </button>

      {/* Page info */}
      <span className="text-center">
        Page <span className="font-medium">{state.page}</span> of{' '}
        <span className="font-medium">{state.totalPages}</span>
      </span>

      {/* Next */}
      <button
        onClick={handlers.handleNext}
        disabled={!state.hasNext}
        className={`${buttonBaseClasses} px-3 py-1 ${state.hasNext ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400'}`}
        aria-label="Go to next page"
        aria-disabled={!state.hasNext}
      >
        Next
      </button>
    </nav>
  );
});

CompactPagination.displayName = 'CompactPagination';

/**
 * Jump Pagination - with input field for jumping to specific pages
 */
export const JumpPagination = forwardRef<HTMLDivElement, PaginationProps>(({
  className = '',
  style,
  size = 'md',
  variant = 'default',
  color = 'primary',
  ...paginationProps
}, ref) => {
  const [jumpValue, setJumpValue] = React.useState('');
  const {
    state,
    handlers,
    pages,
    attributes
  } = usePagination({
      ...paginationProps,
      paginationRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  // Handle jump to page
  const handleJump = React.useCallback(() => {
    const page = parseInt(jumpValue);
    if (page >= 1 && page <= state.totalPages) {
      handlers.handlePageChange(page);
      setJumpValue('');
    }
  }, [jumpValue, state.totalPages, handlers]);

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300 shadow-sm',
    outline: 'bg-transparent border border-gray-300',
    ghost: 'bg-transparent'
  }[variant];

  // Color classes for active/current page
  const colorClasses = {
    primary: 'bg-blue-600 text-white border-blue-600',
    secondary: 'bg-gray-600 text-white border-gray-600',
    success: 'bg-green-600 text-white border-green-600',
    warning: 'bg-yellow-600 text-white border-yellow-600',
    error: 'bg-red-600 text-white border-red-600'
  }[color];

  // Button base classes
  const buttonBaseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed';

  // Page number button classes
  const pageButtonClasses = `${buttonBaseClasses} ${sizeClasses} px-3 py-2 mx-0.5 ${variantClasses}`;

  return (
    <nav
      ref={ref}
      className={`flex items-center justify-center space-x-4 ${variantClasses} rounded-lg ${className || ''}`}
      style={style}
      {...attributes}
      aria-label="Jump pagination navigation"
    >
      {/* Standard pagination */}
      <div className="flex items-center space-x-1">
        {/* Page numbers */}
        {pages.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={`px-2 py-1 ${sizeClasses} text-gray-500`}
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = pageNum === state.page;
          const pageClasses = `${pageButtonClasses} ${
            isActive
              ? `${colorClasses[color]}`
              : 'text-gray-700 hover:bg-gray-100'
          }`;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => handlers.handlePageChange(pageNum as number)}
              className={pageClasses}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Go to page ${pageNum}`}
              disabled={state.disabled}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Jump input */}
      <div className="flex items-center space-x-2">
        <span className={`text-gray-600 ${sizeClasses}`}>Go to page:</span>
        <input
          type="number"
          min={1}
          max={state.totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJump()}
          className={`w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${sizeClasses}`}
          placeholder="1"
          aria-label="Jump to page number"
        />
        <button
          onClick={handleJump}
          disabled={!jumpValue || (parseInt(jumpValue) < 1 || parseInt(jumpValue) > state.totalPages)}
          className={`${buttonBaseClasses} px-3 py-1 bg-${color}-600 text-white hover:bg-${color}-700 ${sizeClasses}`}
          aria-label="Jump to page"
        >
          Go
        </button>
      </div>
    </nav>
  );
});

JumpPagination.displayName = 'JumpPagination';

export default Pagination;