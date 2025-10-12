/**
 * Drawer hook following Flutter patterns.
 * Provides composable behavior for drawer/side panel components.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Props for useDrawer hook
 */
export interface UseDrawerProps extends
  SemanticProps,
  FocusableProps {
  /** Whether drawer is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open handler */
  onOpenChange?: (open: boolean) => void;
  /** Drawer side */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Drawer size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether drawer is modal */
  modal?: boolean;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
  /** Whether to use portal */
  portal?: boolean;
  /** Z-index for drawer */
  zIndex?: number;
  /** Drawer variant */
  variant?: 'default' | 'persistent' | 'temporary';
  /** Drawer title */
  title?: string;
  /** Drawer subtitle */
  subtitle?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether drawer is dismissible */
  dismissible?: boolean;
  /** Focus trap behavior */
  trapFocus?: boolean;
  /** Restore focus on close */
  restoreFocus?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom key bindings */
  keyBindings?: Record<string, () => void>;
  /** Open handler */
  onOpen?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Before open handler (can prevent open) */
  onBeforeOpen?: () => boolean | Promise<boolean>;
  /** Before close handler (can prevent close) */
  onBeforeClose?: () => boolean | Promise<boolean>;
  /** After open handler */
  onAfterOpen?: () => void;
  /** After close handler */
  onAfterClose?: () => void;
}

/**
 * Drawer component state
 */
export interface DrawerState {
  /** Whether drawer is open */
  open: boolean;
  /** Drawer side */
  side: string;
  /** Drawer size */
  size: string;
  /** Drawer variant */
  variant: string;
  /** Whether component is disabled */
  disabled: boolean;
  /** Whether component is focused */
  focused: boolean;
  /** Whether component is closing */
  closing: boolean;
  /** Whether component is opening */
  opening: boolean;
}

/**
 * Drawer handlers
 */
export interface DrawerHandlers {
  /** Handle open drawer */
  handleOpen: () => Promise<void>;
  /** Handle close drawer */
  handleClose: () => Promise<void>;
  /** Handle toggle drawer */
  handleToggle: () => void;
  /** Handle overlay click */
  handleOverlayClick: () => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle before open */
  handleBeforeOpen: () => boolean | Promise<boolean>;
  /** Handle before close */
  handleBeforeClose: () => boolean | Promise<boolean>;
}

/**
 * Composable drawer hook using Flutter-style mixins
 * @param props - Drawer configuration
 * @returns Drawer state, handlers, and attributes
 */
export function useDrawer(props: UseDrawerProps = {}) {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    side = 'right',
    size = 'md',
    modal = true,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    portal = true,
    zIndex = 1000,
    variant = 'default',
    title,
    subtitle,
    showCloseButton = true,
    dismissible = true,
    trapFocus = true,
    restoreFocus = true,
    animationDuration = 300,
    keyBindings = {},
    onOpen,
    onClose,
    onBeforeOpen,
    onBeforeClose,
    onAfterOpen,
    onAfterClose,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    role = 'dialog',
    label,
    labelledBy,
    describedBy,
    disabled = false,
    ...semanticProps
  } = props;

  // State management
  const [open, setOpen] = useState(defaultOpen);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const focusTriggerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Determine if component is controlled
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;

  // Compose mixins for drawer behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label: label || title,
    labelledBy,
    describedBy,
    ...semanticProps
  });

  // Compose drawer state
  const state = useMemo(() => ({
    open: isOpen,
    side,
    size,
    variant,
    disabled,
    focused: focusableMixin.focused,
    closing,
    opening
  }), [isOpen, side, size, variant, disabled, focusableMixin.focused, closing, opening]);

  // Event handlers
  const handleOpen = useCallback(async () => {
    if (disabled || isOpen) return;

    // Check before open handler
    if (onBeforeOpen) {
      const canOpen = await onBeforeOpen();
      if (!canOpen) return;
    }

    // Store current focus for restoration
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set opening state
    setOpening(true);

    // Update open state
    if (!isControlled) {
      setOpen(true);
    }

    onOpenChange?.(true);
    onOpen?.();

    // Focus management
    if (trapFocus) {
      setTimeout(() => {
        const drawer = document.querySelector('[role="dialog"]');
        if (drawer) {
          (drawer as HTMLElement).focus();
        }
      }, 50);
    }

    // Clear opening state after animation
    setTimeout(() => {
      setOpening(false);
      onAfterOpen?.();
    }, animationDuration);
  }, [disabled, isOpen, onBeforeOpen, isControlled, onOpenChange, onOpen, trapFocus, animationDuration, onAfterOpen]);

  const handleClose = useCallback(async () => {
    if (disabled || !isOpen || !dismissible) return;

    // Check before close handler
    if (onBeforeClose) {
      const canClose = await onBeforeClose();
      if (!canClose) return;
    }

    // Set closing state
    setClosing(true);

    // Update open state
    if (!isControlled) {
      setOpen(false);
    }

    onOpenChange?.(false);
    onClose?.();

    // Restore focus
    if (restoreFocus && previousFocusRef.current) {
      setTimeout(() => {
        previousFocusRef.current?.focus();
      }, 50);
    }

    // Clear closing state after animation
    setTimeout(() => {
      setClosing(false);
      onAfterClose?.();
    }, animationDuration);
  }, [disabled, isOpen, dismissible, onBeforeClose, isControlled, onOpenChange, onClose, restoreFocus, animationDuration, onAfterClose]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleClose, handleOpen]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOutsideClick) {
      handleClose();
    }
  }, [closeOnOutsideClick, handleClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled || !isOpen) return;

    // Handle custom key bindings
    if (keyBindings[event.key]) {
      event.preventDefault();
      keyBindings[event.key]();
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        if (closeOnEscape && dismissible) {
          handleClose();
        }
        break;

      case 'Tab':
        if (!trapFocus) {
          return;
        }

        // Basic focus trap implementation
        const drawer = event.currentTarget;
        const focusableElements = drawer?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusableElements.length === 0) break;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
        break;

      default:
        // Delegate to focusable mixin for standard navigation
        focusableMixin.handleKeyDown(event);
        break;
    }
  }, [focusable, disabled, isOpen, keyBindings, closeOnEscape, dismissible, handleClose, trapFocus, focusableMixin.handleKeyDown]);

  const handleBeforeOpen = useCallback(async () => {
    if (onBeforeOpen) {
      return await onBeforeOpen();
    }
    return true;
  }, [onBeforeOpen]);

  const handleBeforeClose = useCallback(async () => {
    if (onBeforeClose) {
      return await onBeforeClose();
    }
    return true;
  }, [onBeforeClose]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick || modal) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[role="dialog"]') && !target.closest('[data-drawer-trigger]')) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnOutsideClick, modal, handleClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, dismissible, handleClose]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-modal': modal,
    'aria-hidden': !isOpen,
    'aria-label': label || title,
    'aria-labelledby': label ? undefined : labelledBy,
    'aria-describedby': describedBy,
    'data-open': isOpen,
    'data-side': side,
    'data-size': size,
    'data-variant': variant,
    'data-portal': portal,
    'data-z-index': zIndex,
    'data-closing': closing,
    'data-opening': opening,
    'data-dismissible': dismissible,
    tabIndex: isOpen ? -1 : 0,
    onKeyDown: handleKeyDown,
    role: role
  }), [semantic, modal, isOpen, label, title, labelledBy, describedBy, side, size, variant, portal, zIndex, closing, opening, dismissible, handleKeyDown, role]);

  // Generate overlay attributes
  const overlayAttributes = useMemo(() => ({
    'aria-hidden': 'true' as const,
    'data-open': isOpen,
    'data-portal': portal,
    'data-z-index': zIndex - 1,
    onClick: handleOverlayClick,
    onKeyDown: handleKeyDown,
    style: {
      position: portal ? 'fixed' : 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: zIndex - 1,
      backgroundColor: modal ? 'rgba(0, 0, 0, 0.5)' : 'transparent'
    }
  }), [isOpen, portal, zIndex, handleOverlayClick, handleKeyDown, modal]);

  return {
    state,
    handlers: {
      handleOpen,
      handleClose,
      handleToggle,
      handleOverlayClick,
      handleKeyDown,
      handleBeforeOpen,
      handleBeforeClose
    },
    attributes: semanticAttributes,
    overlayAttributes
  };
}

// Export types for external use
export type {
  UseDrawerProps,
  DrawerState,
  DrawerHandlers
};