/**
 * Semantic accessibility mixin following WAI-ARIA standards.
 * Enforces accessibility compliance for all components.
 */

import { useMemo } from 'react';
import type { SemanticContract, AriaRole } from '../contracts';

export interface SemanticMixinProps {
  /** Semantic role for accessibility */
  role?: AriaRole;
  /** Screen reader label */
  label?: string;
  /** Element ID for label association */
  labelledBy?: string;
  /** Element ID for description association */
  describedBy?: string;
  /** Whether element is expanded */
  expanded?: boolean;
  /** Whether element is selected */
  selected?: boolean;
  /** Whether element is disabled */
  disabled?: boolean;
  /** Whether element is required */
  required?: boolean;
  /** Whether element has popup */
  hasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /** Live region announcement */
  live?: 'off' | 'polite' | 'assertive';
  /** Custom ARIA properties */
  aria?: Record<string, string | boolean>;
}

/**
 * Composable mixin providing semantic accessibility behavior.
 * Generates proper ARIA attributes following WCAG guidelines.
 */
export const useSemanticMixin = (props: SemanticMixinProps = {}): SemanticContract => {
  const {
    role = 'generic',
    label,
    labelledBy,
    describedBy,
    expanded,
    selected,
    disabled = false,
    required = false,
    hasPopup,
    live,
    aria = {}
  } = props;

  return useMemo(() => {
    const attributes: any = {};

    // Set role if not generic
    if (role !== 'generic') {
      attributes.role = role;
    }

    // Add label if provided
    if (label) {
      attributes['aria-label'] = label;
    }

    // Add label association if provided
    if (labelledBy) {
      attributes['aria-labelledby'] = labelledBy;
    }

    // Add description association if provided
    if (describedBy) {
      attributes['aria-describedby'] = describedBy;
    }

    // Add boolean states
    if (expanded !== undefined) {
      attributes['aria-expanded'] = expanded;
    }

    if (selected !== undefined) {
      attributes['aria-selected'] = selected;
    }

    if (disabled) {
      attributes['aria-disabled'] = disabled;
    }

    if (required) {
      attributes['aria-required'] = required;
    }

    if (hasPopup !== undefined) {
      attributes['aria-haspopup'] = hasPopup;
    }

    if (live !== undefined) {
      attributes['aria-live'] = live;
    }

    // Add custom ARIA properties
    Object.entries(aria).forEach(([key, value]) => {
      if (key.startsWith('aria-')) {
        attributes[key] = value;
      }
    });

    return attributes as SemanticContract;
  }, [role, label, labelledBy, describedBy, expanded, selected, disabled, required, hasPopup, live, aria]);
};