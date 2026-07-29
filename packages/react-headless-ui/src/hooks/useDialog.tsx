"use client";
/**
 * Dialog headless hook following Flutter AlertDialog patterns.
 * Provides modal dialog behavior with focus trap and accessibility.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, SemanticMixinProps } from '../mixins';

export interface UseDialogProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Whether dialog is open */
  open: boolean;
  /** Open change handler. Optional — a controlled dialog may render without one. */
  onOpenChange?: (open: boolean) => void;
  /** Initial focus selector */
  initialFocus?: string | HTMLElement;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
  /** Modal behavior (trap focus) */
  modal?: boolean;
  /** Dialog title */
  title?: string;
  /** Dialog description */
  description?: string;
  /** Confirm action handler */
  onConfirm?: () => void;
  /** Cancel action handler */
  onCancel?: () => void;
}

export interface UseDialogState {
  /** Current open state */
  open: boolean;
  /** Current focus state */
  focused: boolean;
  /** Whether focus is trapped */
  focusTrapped: boolean;
  /** Current overlay interaction */
  overlayActive: boolean;
}

export interface UseDialogActions {
  /** Open dialog */
  openDialog: () => void;
  /** Close dialog */
  closeDialog: () => void;
  /** Confirm dialog */
  confirm: () => void;
  /** Cancel dialog */
  cancel: () => void;
  /** Handle overlay click */
  handleOverlayClick: (event: React.MouseEvent) => void;
  /** Handle keyboard events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Focus dialog programmatically */
  focus: () => void;
  /** Get initial focus element */
  getInitialFocusElement: () => HTMLElement | null;
}

export interface UseDialogReturns extends UseDialogState, UseDialogActions {
  /** Semantic attributes for dialog container */
  semanticAttributes: Record<string, unknown>;
  /** Semantic attributes for overlay */
  overlayAttributes: Record<string, unknown>;
  /** Semantic attributes for title */
  titleAttributes: Record<string, unknown>;
  /** Semantic attributes for description */
  descriptionAttributes: Record<string, unknown>;
  /** Reference to dialog container */
  dialogRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to overlay */
  overlayRef: React.RefObject<HTMLDivElement | null>;
  /** Focus trap return function */
  releaseFocusTrap: () => void;
}

/**
 * Headless dialog hook providing modal dialog behavior.
 * Includes focus trap, keyboard navigation, and accessibility.
 */
export const useDialog = (props: UseDialogProps): UseDialogReturns => {
  const {
    open,
    onOpenChange,
    initialFocus,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    modal = true,
    title,
    description,
    onConfirm,
    onCancel,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    disabled = false,
    role = 'dialog',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [focusTrapped, setFocusTrapped] = useState(false);

  // References
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusTrapReturnRef = useRef<(() => void) | undefined>(undefined);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused: open && defaultFocused,
    focusable: open && focusable && !disabled,
    focusStrategy
  });

  // Press behavior for overlay
  const pressableMixin = usePressableMixin({
    pressable: open && closeOnOverlayClick,
    disabled
  });

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label: label || title,
    labelledBy,
    describedBy: describedBy || (description ? `${role}-description` : undefined),
    'aria-modal': modal,
    'aria-hidden': !open,
    disabled,
    ...semanticProps
  });

  // Resolve the element to focus when the dialog opens. Declared before
  // setupFocusTrap (which calls it) so it can be listed in that callback's deps.
  const getInitialFocusElement = useCallback(() => {
    if (!open) return null;

    if (initialFocus) {
      if (typeof initialFocus === 'string') {
        return document.querySelector(initialFocus) as HTMLElement;
      }
      return initialFocus;
    }

    return null;
  }, [open, initialFocus]);

  // Focus trap implementation
  const setupFocusTrap = useCallback(() => {
    if (!modal || !dialogRef.current) return () => {};

    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial element
    const initialFocusElement = getInitialFocusElement();
    if (initialFocusElement) {
      initialFocusElement.focus();
    } else {
      // reason: firstElement is always defined here — the empty-focusable guard
      // above (length === 0) already returned, so the else-if condition was dead.
      firstElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: Move to previous element
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: Move to next element
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    setFocusTrapped(true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      setFocusTrapped(false);
    };
    // reason: getInitialFocusElement is listed so the trap re-runs (and re-reads
    // the freshest initialFocus) when it changes, not the stale closure captured
    // at first run.
  }, [modal, open, getInitialFocusElement]);

  // Dialog actions
  // reason: declared before the keyboard/overlay handlers below, which call
  // closeDialog/cancel and list them as useCallback deps — `const` is not
  // initialized before its declaration line, so the handlers must come after.
  const openDialog = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const closeDialog = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const confirm = useCallback(() => {
    onConfirm?.();
    closeDialog();
  }, [onConfirm, closeDialog]);

  const cancel = useCallback(() => {
    onCancel?.();
    closeDialog();
  }, [onCancel, closeDialog]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      pressableMixin.handleClick(event);
      if (closeOnOverlayClick) {
        closeDialog();
      }
    }
  }, [pressableMixin, closeOnOverlayClick, closeDialog]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyDown(event);

    if (closeOnEscape && event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  }, [focusableMixin, closeOnEscape, cancel]);

  const focus = useCallback(() => {
    focusableMixin.focus();
  }, [focusableMixin]);

  // Setup focus trap when dialog opens
  useEffect(() => {
    if (open) {
      const release = setupFocusTrap();
      focusTrapReturnRef.current = release;
      return () => release?.();
    } else {
      focusTrapReturnRef.current?.();
    }
  }, [open, setupFocusTrap]);

  // Handle body scroll lock
  useEffect(() => {
    if (modal && open) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Calculate scroll bar width
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;

      return () => {
        // Restore body scroll
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [modal, open]);

  // Computed state
  const state = useMemo(() => composeState<UseDialogState>({
    open,
    focused: focusableMixin.focused,
    focusTrapped,
    overlayActive: pressableMixin.pressed
  }), [open, focusableMixin.focused, focusTrapped, pressableMixin.pressed]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-modal': modal,
    'data-state': open ? 'open' : 'closed',
    'data-modal': modal,
    onKeyDown: handleKeyDown
  }), [semantic, open, modal, handleKeyDown]);

  const overlayAttributes = useMemo(() => ({
    'aria-hidden': 'true',
    'data-state': open ? 'open' : 'closed',
    onClick: handleOverlayClick
  }), [open, handleOverlayClick]);

  const titleAttributes = useMemo(() => ({
    id: `${role}-title`,
    'data-purpose': 'dialog-title'
  }), [role]);

  const descriptionAttributes = useMemo(() => ({
    id: `${role}-description`,
    'data-purpose': 'dialog-description'
  }), [role]);

  const releaseFocusTrap = useCallback(() => {
    focusTrapReturnRef.current?.();
  }, []);

  return useMemo(() => ({
    // State
    ...state,

    // Actions
    openDialog,
    closeDialog,
    confirm,
    cancel,
    handleOverlayClick,
    handleKeyDown,
    focus,
    getInitialFocusElement,

    // Computed properties
    semanticAttributes,
    overlayAttributes,
    titleAttributes,
    descriptionAttributes,
    dialogRef,
    overlayRef,
    releaseFocusTrap
  }), [
    state,
    openDialog,
    closeDialog,
    confirm,
    cancel,
    handleOverlayClick,
    handleKeyDown,
    focus,
    getInitialFocusElement,
    semanticAttributes,
    overlayAttributes,
    titleAttributes,
    descriptionAttributes,
    dialogRef,
    overlayRef,
    releaseFocusTrap
  ]);
};