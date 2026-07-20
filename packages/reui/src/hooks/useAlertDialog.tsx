/**
 * Alert Dialog headless hook following Flutter AlertDialog patterns.
 * Provides alert dialog behavior with proper accessibility for confirmations and warnings.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export interface UseAlertDialogProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Whether alert dialog is open */
  open: boolean;
  /** Open change handler */
  onOpenChange: (open: boolean) => void;
  /** Alert dialog title */
  title: string;
  /** Alert dialog description */
  description?: string;
  /** Alert dialog variant */
  variant?: 'default' | 'destructive' | 'warning';
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Called when confirm button is clicked */
  onConfirm?: () => void | Promise<void>;
  /** Called when cancel button is clicked */
  onCancel?: () => void;
  /** Whether dialog is modal (prevents interaction with content behind) */
  modal?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Initial focus selector */
  initialFocus?: string | HTMLElement;
}

export interface UseAlertDialogState {
  /** Whether dialog is open */
  open: boolean;
  /** Whether dialog is closing */
  closing: boolean;
  /** Whether confirm action is in progress */
  confirming: boolean;
  /** Current variant */
  variant: 'default' | 'destructive' | 'warning';
}

export interface UseAlertDialogActions {
  /** Close the dialog */
  close: () => void;
  /** Confirm the action */
  confirm: () => Promise<void>;
  /** Cancel the action */
  cancel: () => void;
  /** Set confirming state */
  setConfirming: (confirming: boolean) => void;
}

export interface UseAlertDialogReturns {
  /** Component state */
  state: UseAlertDialogState;
  /** Component actions */
  actions: UseAlertDialogActions;
  /** Semantic attributes for the dialog container */
  semanticAttributes: Record<string, any>;
  /** Props for the dialog overlay */
  overlayProps: Record<string, any>;
  /** Props for the dialog content */
  contentProps: Record<string, any>;
  /** Props for the dialog title */
  titleProps: Record<string, any>;
  /** Props for the dialog description */
  descriptionProps: Record<string, any>;
  /** Props for the cancel button */
  cancelButtonProps: Record<string, any>;
  /** Props for the confirm button */
  confirmButtonProps: Record<string, any>;
  /** Ref for the dialog container */
  dialogRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the initial focus element */
  initialFocusRef: React.RefObject<HTMLElement | null>;
}

/**
 * Headless alert dialog hook providing modal confirmation behavior.
 * Supports destructive actions, warnings, and async confirmation handlers.
 */
export const useAlertDialog = (props: UseAlertDialogProps) => {
  const {
    open,
    onOpenChange,
    title,
    description,
    variant = 'default',
    showCancel = true,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    onConfirm,
    onCancel,
    modal = true,
    closeOnEscape = true,
    initialFocus,
    ...semanticProps
  } = props;

  // Internal state
  const [closing, setClosing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role: 'alertdialog',
    'aria-modal': modal,
    'aria-describedby': description ? 'alert-dialog-description' : undefined,
    'aria-labelledby': 'alert-dialog-title',
    ...semanticProps
  });

  // Store last active element for focus restoration
  useEffect(() => {
    if (open && !lastActiveElementRef.current) {
      lastActiveElementRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  // Handle initial focus
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusElement = () => {
        if (typeof initialFocus === 'string') {
          const element = dialogRef.current?.querySelector(initialFocus) as HTMLElement;
          if (element) {
            element.focus();
            return;
          }
        } else if (initialFocus instanceof HTMLElement) {
          initialFocus.focus();
          return;
        }

        // Default focus to confirm button or first focusable element
        const confirmButton = dialogRef.current?.querySelector('[data-alert-dialog-confirm]') as HTMLElement;
        if (confirmButton) {
          confirmButton.focus();
        } else {
          const firstFocusable = dialogRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          firstFocusable?.focus();
        }
      };

      // Delay focus to ensure DOM is ready
      setTimeout(focusElement, 50);
    }
  }, [open, initialFocus]);

  // Focus restoration
  useEffect(() => {
    if (!open && lastActiveElementRef.current) {
      setTimeout(() => {
        lastActiveElementRef.current?.focus();
        lastActiveElementRef.current = null;
      }, 0);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open && closeOnEscape && !confirming) {
        event.preventDefault();
        close();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEscape, confirming]);

  // Close dialog
  const close = useCallback(() => {
    if (confirming) return;

    setClosing(true);
    setTimeout(() => {
      onOpenChange(false);
      setClosing(false);
      onCancel?.();
    }, 150);
  }, [onOpenChange, onCancel, confirming]);

  // Handle confirm action
  const confirm = useCallback(async () => {
    if (confirming) return;

    setConfirming(true);

    try {
      await onConfirm?.();
      close();
    } catch (error) {
      // Keep dialog open on error
      console.error('Alert dialog confirm action failed:', error);
    } finally {
      setConfirming(false);
    }
  }, [onConfirm, close, confirming]);

  // Handle cancel action
  const cancel = useCallback(() => {
    if (confirming) return;
    close();
  }, [close, confirming]);

  // Overlay props
  const overlayProps = useMemo(() => ({
    'data-state': open ? 'open' : 'closed',
    'data-closing': closing,
    onClick: (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && modal) {
        // Don't close on overlay click for alert dialogs (requires explicit action)
        event.preventDefault();
      }
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        close();
      }
    }
  }), [open, closing, modal, closeOnEscape, close]);

  // Content props
  const contentProps = useMemo(() => ({
    ref: dialogRef,
    role: 'alertdialog',
    'aria-modal': modal,
    'aria-labelledby': 'alert-dialog-title',
    'aria-describedby': description ? 'alert-dialog-description' : undefined,
    'data-state': open ? 'open' : 'closed',
    'data-closing': closing,
    'data-variant': variant,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        close();
      }
    }
  }), [open, closing, modal, closeOnEscape, close, description, variant]);

  // Title props
  const titleProps = useMemo(() => ({
    id: 'alert-dialog-title',
    'data-variant': variant
  }), [variant]);

  // Description props
  const descriptionProps = useMemo(() => ({
    id: 'alert-dialog-description'
  }), []);

  // Cancel button props
  const cancelButtonProps = useMemo(() => ({
    'data-alert-dialog-cancel': true,
    onClick: cancel,
    disabled: confirming,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        cancel();
      }
    }
  }), [cancel, confirming]);

  // Confirm button props
  const confirmButtonProps = useMemo(() => ({
    'data-alert-dialog-confirm': true,
    'data-variant': variant,
    onClick: confirm,
    disabled: confirming,
    'data-loading': confirming,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        confirm();
      }
    }
  }), [confirm, confirming, variant]);

  // Composed state
  const state = useMemo(() => composeState<UseAlertDialogState>({
    open,
    closing,
    confirming,
    variant
  }), [open, closing, confirming, variant]);

  // Composed actions
  const actions = useMemo(() => ({
    close,
    confirm,
    cancel,
    setConfirming
  }), [close, confirm, cancel]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-label': semantic['aria-label'] || `${variant} alert dialog: ${title}`,
  }), [semantic, variant, title]);

  return useMemo(() => ({
    state,
    actions,
    semanticAttributes,
    overlayProps,
    contentProps,
    titleProps,
    descriptionProps,
    cancelButtonProps,
    confirmButtonProps,
    dialogRef,
    initialFocusRef
  }), [state, actions, semanticAttributes, overlayProps, contentProps, titleProps, descriptionProps, cancelButtonProps, confirmButtonProps, dialogRef, initialFocusRef]);
};