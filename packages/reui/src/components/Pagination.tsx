/**
 * Pagination renderer component using headless usePagination hook.
 * Provides styled pagination controls with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { usePagination, type UsePaginationProps } from '../hooks';

// `UsePaginationProps` inherits `[key: string]: unknown` index signatures from
// the Semantic/Focusable mixins. Extending `Omit<UsePaginationProps, ...>`
// preserves that index signature, which (under `forwardRef`'s prop inference)
// collapses every inherited field to `unknown`. `Pick` selects only the named
// fields, stripping the index signature, so the destructured locals below keep
// their real types while still forwarding the semantic/focusable pass-through
// props to the hook.
export interface PaginationProps extends Pick<UsePaginationProps,
  | 'page' | 'defaultPage' | 'totalPages' | 'itemsPerPage' | 'siblingCount'
  | 'disabled' | 'onPageChange' | 'onChange'
  | 'showFirstLast' | 'showPrevNext'
  | 'role' | 'label' | 'labelledBy' | 'describedBy'
  | 'expanded' | 'selected' | 'required' | 'hasPopup' | 'live'
  | 'defaultFocused' | 'focusable' | 'focusStrategy'
  | 'onFocus' | 'onBlur' | 'keyboard'
> {
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
  // Destructure the scalar hook fields into typed locals and forward the
  // remaining semantic/focusable pass-through keys via `semanticProps`.
  // PaginationProps uses `Pick<UsePaginationProps, ...>` (see its definition)
  // to drop the `[key: string]: unknown` index signature the mixins declare,
  // which would otherwise collapse these fields to `unknown` under forwardRef.
  page,
  defaultPage,
  totalPages,
  itemsPerPage,
  siblingCount,
  onPageChange,
  onChange,
  ...semanticProps
}, ref) => {
  const {
    state,
    handlers,
    pages,
    attributes
  } = usePagination({
    ...semanticProps,
    page,
    defaultPage,
    totalPages,
    itemsPerPage,
    siblingCount,
    onPageChange,
    onChange,
    showFirstLast,
    showPrevNext,
    disabled
  });

  // Size classes
  const sizeClasses = {
    sm: '',
    md: '',
    lg: ''
  }[size];

  // Variant classes
  const variantClasses = {
    default: '   ',
    outline: '  ',
    ghost: ''
  }[variant];

  // Color classes for active/current page
  const colorClasses = {
    primary: '  ',
    secondary: '  ',
    success: '  ',
    warning: '  ',
    error: '  '
  }[color];

  // Button base classes
  const buttonBaseClasses = '          ';

  // Page number button classes
  const pageButtonClasses = `${buttonBaseClasses} ${sizeClasses}    ${variantClasses}`;

  // Navigation button classes
  const navButtonClasses = `${buttonBaseClasses} ${sizeClasses}   ${variantClasses}`;

  return (
    <nav
      ref={ref}
      className={`    ${variantClasses}  ${className || ''}`}
      style={style}
      {...attributes}
      // The hook emits `aria-current` as the numeric page number, which is
      // invalid ARIA (must be a token like 'page'). The current-page marker
      // belongs on the individual page buttons (set below as aria-current="page"),
      // so drop the invalid nav-level value here.
      aria-current={undefined}
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
            className=" "
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
            className=" "
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
        if (pageNum === '...') {
          // When ellipsis is disabled, skip the placeholder entirely instead
          // of letting it fall through and render as a numbered page button.
          if (!showEllipsis) return null;
          return (
            <span
              key={`ellipsis-${index}`}
              className={`  ${sizeClasses} `}
              aria-hidden={true}
            >
              ...
            </span>
          );
        }

        const isActive = pageNum === state.page;
        const pageClasses = `${pageButtonClasses} ${
          isActive
            ? colorClasses
            : ' '
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
            className=" "
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
            className=" "
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
      showFirstLast: false
  });

  // Size classes
  const sizeClasses = {
    sm: '',
    md: '',
    lg: ''
  }[size];

  // Variant classes
  const variantClasses = {
    default: '   ',
    outline: '  ',
    ghost: ''
  }[variant];

  // Button base classes
  const buttonBaseClasses = '          ';

  return (
    <nav
      ref={ref}
      className={`   ${variantClasses}   ${sizeClasses} ${className || ''}`}
      style={style}
      {...attributes}
      aria-current={undefined}
      aria-label="Compact pagination navigation"
    >
      {/* Previous */}
      <button
        onClick={handlers.handlePrevious}
        disabled={!state.hasPrevious}
        className={`${buttonBaseClasses}   ${state.hasPrevious ? ' ' : ''}`}
        aria-label="Go to previous page"
        aria-disabled={!state.hasPrevious}
      >
        Previous
      </button>

      {/* Page info */}
      <span className="">
        Page <span className="">{state.page}</span> of{' '}
        <span className="">{state.totalPages}</span>
      </span>

      {/* Next */}
      <button
        onClick={handlers.handleNext}
        disabled={!state.hasNext}
        className={`${buttonBaseClasses}   ${state.hasNext ? ' ' : ''}`}
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
      ...paginationProps
  });

  // Size classes
  const sizeClasses = {
    sm: '',
    md: '',
    lg: ''
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
    default: '   ',
    outline: '  ',
    ghost: ''
  }[variant];

  // Color classes for active/current page
  const colorClasses = {
    primary: '  ',
    secondary: '  ',
    success: '  ',
    warning: '  ',
    error: '  '
  }[color];

  // Button base classes
  const buttonBaseClasses = '          ';

  // Page number button classes
  const pageButtonClasses = `${buttonBaseClasses} ${sizeClasses}    ${variantClasses}`;

  return (
    <nav
      ref={ref}
      className={`    ${variantClasses}  ${className || ''}`}
      style={style}
      {...attributes}
      aria-current={undefined}
      aria-label="Jump pagination navigation"
    >
      {/* Standard pagination */}
      <div className="  ">
        {/* Page numbers */}
        {pages.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={`  ${sizeClasses} `}
                aria-hidden={true}
              >
                ...
              </span>
            );
          }

          const isActive = pageNum === state.page;
          const pageClasses = `${pageButtonClasses} ${
            isActive
              ? colorClasses
              : ' '
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
      <div className="  ">
        <span className={` ${sizeClasses}`}>Go to page:</span>
        <input
          type="number"
          min={1}
          max={state.totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJump()}
          className={`         ${sizeClasses}`}
          placeholder="1"
          aria-label="Jump to page number"
        />
        <button
          onClick={handleJump}
          disabled={!jumpValue || (parseInt(jumpValue) < 1 || parseInt(jumpValue) > state.totalPages)}
          className={`${buttonBaseClasses}   bg-${color}-600  ${color}-700 ${sizeClasses}`}
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