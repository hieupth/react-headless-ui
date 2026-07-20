/**
 * Empty State hook following Flutter patterns.
 * Provides composable behavior for empty state UI components.
 */

import { useState, useCallback, useMemo } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Props for useEmptyState hook
 */
export interface UseEmptyStateProps extends
  SemanticProps,
  FocusableProps {
  /** Whether the empty state should be visible */
  visible?: boolean;
  /** Type of empty state for context */
  variant?: 'no-data' | 'no-results' | 'no-connection' | 'error' | 'loading';
  /** Whether the empty state can be dismissed */
  dismissible?: boolean;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Primary action handler */
  onPrimaryAction?: () => void;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Dismiss handler */
  onDismiss?: () => void;
}

/**
 * Empty state component state
 */
export interface EmptyStateState {
  /** Whether empty state is visible */
  visible: boolean;
  /** Whether empty state is focused */
  focused: boolean;
  /** Empty state variant */
  variant: UseEmptyStateProps['variant'];
  /** Whether empty state is dismissible */
  dismissible: boolean;
  /** Whether actions are shown */
  showActions: boolean;
}

/**
 * Empty state handlers
 */
export interface EmptyStateHandlers {
  /** Handle primary action */
  handlePrimaryAction: () => void;
  /** Handle secondary action */
  handleSecondaryAction: () => void;
  /** Handle dismiss */
  handleDismiss: () => void;
  /** Handle focus */
  handleFocus: (event: React.FocusEvent) => void;
  /** Handle blur */
  handleBlur: (event: React.FocusEvent) => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Composable empty state hook using Flutter-style mixins
 * @param props - Empty state configuration
 * @returns Empty state, handlers, and attributes
 */
export function useEmptyState(props: UseEmptyStateProps = {}) {
  const {
    visible = true,
    variant = 'no-data',
    dismissible = false,
    showActions = true,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    onPrimaryAction,
    onSecondaryAction,
    onDismiss,
    role = 'status',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [focused, setFocused] = useState(defaultFocused);

  // Compose mixins for empty state behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  });

  // Compose empty state state
  const state = useMemo(() => ({
    visible,
    focused,
    variant,
    dismissible,
    showActions
  }), [visible, focused, variant, dismissible, showActions]);

  // Event handlers
  const handlePrimaryAction = useCallback(() => {
    onPrimaryAction?.();
  }, [onPrimaryAction]);

  const handleSecondaryAction = useCallback(() => {
    onSecondaryAction?.();
  }, [onSecondaryAction]);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (!focusable) return;
    setFocused(true);
    focusableMixin.handleFocus(event.nativeEvent);
  }, [focusable, focusableMixin.handleFocus]);

  const handleBlur = useCallback((event: React.FocusEvent) => {
    setFocused(false);
    focusableMixin.handleBlur(event.nativeEvent);
  }, [focusableMixin.handleBlur]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable) return;

    // Handle Escape key for dismissible empty states
    if (event.key === 'Escape' && dismissible) {
      event.preventDefault();
      handleDismiss();
      return;
    }

    // Handle Enter/Space for primary action
    if ((event.key === 'Enter' || event.key === ' ') && onPrimaryAction) {
      event.preventDefault();
      handlePrimaryAction();
      return;
    }

    // Delegate to focusable mixin for standard navigation
    focusableMixin.handleKeyDown(event);
  }, [focusable, dismissible, onPrimaryAction, handleDismiss, handlePrimaryAction, focusableMixin.handleKeyDown]);

  // Generate semantic attributes
  const semanticAttributes = useMemo<React.HTMLAttributes<HTMLElement>>(() => ({
    ...semantic,
    'aria-live': 'polite',
    'aria-atomic': true,
    'data-variant': variant,
    'data-dismissible': dismissible,
    'data-visible': visible,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown
  }), [semantic, variant, dismissible, visible, handleFocus, handleBlur, handleKeyDown]);

  return useMemo(() => ({
    state,
    handlers: {
      handlePrimaryAction,
      handleSecondaryAction,
      handleDismiss,
      handleFocus,
      handleBlur,
      handleKeyDown
    },
    attributes: semanticAttributes
  }), [
    state,
    handlePrimaryAction,
    handleSecondaryAction,
    handleDismiss,
    handleFocus,
    handleBlur,
    handleKeyDown,
    semanticAttributes
  ]);
}