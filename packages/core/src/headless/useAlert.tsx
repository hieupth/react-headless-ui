/**
 * Alert headless hook following Flutter patterns.
 * Provides alert behavior with different severity levels and dismissibility.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export type AlertVariant = 'default' | 'destructive' | 'warning' | 'success';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

export interface UseAlertProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Whether alert is visible */
  open: boolean;
  /** Alert variant/semantic style */
  variant?: AlertVariant;
  /** Alert severity level for accessibility */
  severity?: AlertSeverity;
  /** Alert title */
  title?: string;
  /** Alert description/message */
  description?: string;
  /** Whether alert can be dismissed */
  dismissible?: boolean;
  /** Auto-dismiss timeout in milliseconds */
  autoDismiss?: number;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Dismiss handler */
  onDismiss?: () => void;
}

export interface UseAlertState {
  /** Current open state */
  open: boolean;
  /** Current focus state */
  focused: boolean;
  /** Current press state */
  pressed: boolean;
  /** Current dismiss state */
  dismissing: boolean;
}

export interface UseAlertActions {
  /** Dismiss alert */
  dismiss: () => void;
  /** Show alert */
  show: () => void;
  /** Handle key events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

export interface UseAlertReturns extends UseAlertState, UseAlertActions {
  /** Semantic attributes for alert container */
  semanticAttributes: Record<string, any>;
  /** Reference to alert container */
  alertRef: React.RefObject<HTMLDivElement>;
  /** Computed variant for styling */
  computedVariant: AlertVariant;
  /** Computed severity for accessibility */
  computedSeverity: AlertSeverity;
}

/**
 * Headless alert hook providing alert behavior.
 * Includes auto-dismiss, keyboard navigation, and accessibility.
 */
export const useAlert = (props: UseAlertProps): UseAlertReturns => {
  const {
    open,
    variant = 'default',
    severity,
    title,
    description,
    dismissible = false,
    autoDismiss,
    onOpenChange,
    onDismiss,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    disabled = false,
    role = 'alert',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [focused, setFocused] = useState(defaultFocused);
  const [dismissing, setDismissing] = useState(false);

  // References
  const alertRef = React.useRef<HTMLDivElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused: open && defaultFocused,
    focusable: open && focusable && !disabled,
    focusStrategy
  });

  // Press behavior for dismissible alerts
  const pressableMixin = usePressableMixin({
    pressable: open && dismissible && !disabled
  });

  // Compute variant and severity based on props
  const computedVariant = useMemo(() => {
    if (variant !== 'default') return variant;

    // Auto-detect variant from severity if not specified
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'default';
    }
  }, [variant, severity]);

  const computedSeverity = useMemo(() => {
    if (severity) return severity;

    // Auto-detect severity from variant if not specified
    switch (variant) {
      case 'destructive': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  }, [variant, severity]);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label: label || title,
    labelledBy,
    describedBy: describedBy || (description ? `${role}-description` : undefined),
    'aria-live': computedSeverity === 'error' ? 'assertive' : 'polite',
    'aria-atomic': 'true',
    'data-state': open ? 'open' : 'closed',
    'data-variant': computedVariant,
    'data-severity': computedSeverity,
    'data-dismissible': dismissible,
    disabled,
    ...semanticProps
  });

  // Auto-dismiss functionality
  useEffect(() => {
    if (open && autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        dismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [open, autoDismiss]);

  // Focus management when alert opens
  useEffect(() => {
    if (open && focusable && !disabled && alertRef.current) {
      if (focusStrategy === 'first') {
        const focusableElements = alertRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }
  }, [open, focusable, disabled, focusStrategy]);

  // Alert actions
  const dismiss = useCallback(() => {
    if (disabled || dismissing) return;

    setDismissing(true);

    // Call dismiss handler
    onDismiss?.();

    // Close alert after dismiss animation
    setTimeout(() => {
      onOpenChange?.(false);
      setDismissing(false);
    }, 150); // Brief animation delay
  }, [disabled, dismissing, onDismiss, onOpenChange]);

  const show = useCallback(() => {
    if (disabled) return;
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyDown(event);

    // Handle dismiss key
    if (dismissible && (event.key === 'Escape' || event.key === 'Enter')) {
      event.preventDefault();
      dismiss();
    }
  }, [focusableMixin, dismissible, dismiss]);

  // Update focused state
  useEffect(() => {
    setFocused(focusableMixin.focused);
  }, [focusableMixin.focused]);

  // Computed state
  const state = useMemo(() => composeState<UseAlertState>({
    open,
    focused: focusableMixin.focused,
    pressed: pressableMixin.pressed,
    dismissing
  }), [open, focusableMixin.focused, pressableMixin.pressed, dismissing]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    onKeyDown: handleKeyDown
  }), [semantic, handleKeyDown]);

  return {
    // State
    ...state,

    // Actions
    dismiss,
    show,
    handleKeyDown,

    // Computed properties
    semanticAttributes,
    alertRef,
    computedVariant,
    computedSeverity
  };
};