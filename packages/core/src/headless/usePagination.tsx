/**
 * Pagination hook following Flutter patterns.
 * Provides composable behavior for pagination components.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Props for usePagination hook
 */
export interface UsePaginationProps extends
  SemanticProps,
  FocusableProps {
  /** Current page number */
  page?: number;
  /** Default page number when uncontrolled */
  defaultPage?: number;
  /** Total number of pages */
  totalPages: number;
  /** Number of items per page */
  itemsPerPage?: number;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
  /** Show previous/next buttons */
  showPrevNext?: boolean;
  /** Number of page buttons to show on each side */
  siblingCount?: number;
  /** Whether pagination is disabled */
  disabled?: boolean;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Custom page change handler */
  onChange?: (page: number) => void;
}

/**
 * Pagination component state
 */
export interface PaginationState {
  /** Current page number */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Items per page */
  itemsPerPage: number;
  /** Whether component is disabled */
  disabled: boolean;
  /** Whether component is focused */
  focused: boolean;
  /** Whether has previous page */
  hasPrevious: boolean;
  /** Whether has next page */
  hasNext: boolean;
}

/**
 * Pagination component handlers
 */
export interface PaginationHandlers {
  /** Handle page change */
  handlePageChange: (page: number) => void;
  /** Handle previous page */
  handlePrevious: () => void;
  /** Handle next page */
  handleNext: () => void;
  /** Handle first page */
  handleFirst: () => void;
  /** Handle last page */
  handleLast: () => void;
  /** Handle focus */
  handleFocus: (event: React.FocusEvent) => void;
  /** Handle blur */
  handleBlur: (event: React.FocusEvent) => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Composable pagination hook using Flutter-style mixins
 * @param props - Pagination configuration
 * @returns Pagination state, handlers, and attributes
 */
export function usePagination(props: UsePaginationProps) {
  const {
    page: controlledPage,
    defaultPage = 1,
    totalPages,
    itemsPerPage = 10,
    showFirstLast = true,
    showPrevNext = true,
    siblingCount = 1,
    disabled = false,
    onPageChange,
    onChange,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    role = 'navigation',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [focused, setFocused] = useState(defaultFocused);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledPage !== undefined;
  const page = isControlled ? controlledPage : defaultPage;

  // Calculate page numbers to show
  const pages = useMemo(() => {
    const range: (number | string)[] = [];
    const delta = siblingCount;

    // Always show first page
    if (showFirstLast && totalPages > 1) {
      range.push(1);
    }

    // Calculate start and end of current range
    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);

    // Adjust range to include first page if needed
    if (start > 1 && showFirstLast) {
      if (start > 3) {
        range.push('...');
      } else if (start === 3) {
        range.push(2);
      }
    }

    // Add pages in current range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Adjust range to include last page if needed
    if (end < totalPages && showFirstLast) {
      if (end < totalPages - 2) {
        range.push('...');
      } else if (end === totalPages - 2) {
        range.push(totalPages - 1);
      }
      range.push(totalPages);
    }

    return range;
  }, [page, totalPages, showFirstLast, siblingCount]);

  // Compose pagination state
  const state = useMemo(() => ({
    page,
    totalPages,
    itemsPerPage,
    disabled,
    focused,
    hasPrevious: page > 1,
    hasNext: page < totalPages
  }), [page, totalPages, itemsPerPage, disabled, focused]);

  // Event handlers
  const handlePageChange = useCallback((newPage: number) => {
    if (disabled || newPage === page || newPage < 1 || newPage > totalPages) {
      return;
    }

    onPageChange?.(newPage);
    onChange?.(newPage);
  }, [disabled, page, totalPages, onPageChange, onChange]);

  const handlePrevious = useCallback(() => {
    handlePageChange(page - 1);
  }, [handlePageChange, page]);

  const handleNext = useCallback(() => {
    handlePageChange(page + 1);
  }, [handlePageChange, page]);

  const handleFirst = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const handleLast = useCallback(() => {
    handlePageChange(totalPages);
  }, [handlePageChange, totalPages]);

  // Compose mixins for pagination behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  });

  // Event handlers that depend on mixins (defined after mixins)
  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (!focusable || disabled) return;

    setFocused(true);
    focusableMixin.handleFocus?.(event);
  }, [focusable, disabled, focusableMixin]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    setFocused(false);
    focusableMixin.handleBlur?.(event);
  }, [focusableMixin]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled) return;

    // Handle arrow key navigation
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrevious();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
      return;
    }

    // Handle Home key
    if (event.key === 'Home') {
      event.preventDefault();
      handleFirst();
      return;
    }

    // Handle End key
    if (event.key === 'End') {
      event.preventDefault();
      handleLast();
      return;
    }

    // Handle number keys
    if (event.key >= '1' && event.key <= '9') {
      const pageNumber = parseInt(event.key);
      if (pageNumber <= totalPages) {
        event.preventDefault();
        handlePageChange(pageNumber);
      }
      return;
    }

    // Delegate to focusable mixin for standard navigation
    focusableMixin.handleKeyDown?.(event);
  }, [focusable, disabled, handlePrevious, handleNext, handleFirst, handleLast, handlePageChange, totalPages, focusableMixin]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-disabled': disabled,
    'aria-current': state.page,
    'data-disabled': disabled,
    'data-focused': focused,
    'data-page': state.page,
    'data-total-pages': state.totalPages,
    'data-items-per-page': state.itemsPerPage,
    'data-has-previous': state.hasPrevious,
    'data-has-next': state.hasNext,
    tabIndex: focusable && !disabled ? 0 : -1,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown
  }), [semantic, disabled, state, focused, handleFocus, handleBlur, handleKeyDown]);

  return {
    state,
    handlers: {
      handlePageChange,
      handlePrevious,
      handleNext,
      handleFirst,
      handleLast,
      handleFocus,
      handleBlur,
      handleKeyDown
    },
    attributes: semanticAttributes,
    pages
  };
}

// Export types for external use
export type { UsePaginationProps, PaginationState, PaginationHandlers };