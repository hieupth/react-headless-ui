/**
 * Semantic accessibility mixin following WAI-ARIA standards.
 * Returns a flat record of DOM attributes (role + aria-* + pass-through).
 */

import { useMemo, useRef } from 'react';
import type { AriaRole } from '../contracts';

/**
 * DOM pass-through attributes the mixin forwards untouched. Constrained
 * (instead of a loose `[key: string]: unknown`) so that component Props which
 * extend this mixin keep their named keys' types intact through `Omit`/
 * `PropsWithoutRef`/`forwardRef`.
 */
export interface SemanticMixinDomProps extends React.AriaAttributes {
  id?: string;
  tabIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Legacy camelCase aria aliases. Several hooks pass these (and read them
   * back off the returned attributes) as a value round-trip; the mixin
   * forwards them untouched under the same camelCase key. Accepted here so
   * those hooks type-check without the loose string index that would widen
   * named keys. Prefer the kebab-case `aria-*` keys for new code.
   */
  ariaLabel?: string;
  ariaOrientation?: 'horizontal' | 'vertical' | undefined;
  ariaMultiSelectable?: boolean;
  ariaHidden?: boolean;
  ariaModal?: boolean;
  /** Arbitrary data-* attributes are forwarded as-is. */
  [key: `data-${string}`]: unknown;
}

export interface SemanticMixinProps extends SemanticMixinDomProps {
  /** Semantic role for accessibility */
  role?: AriaRole;
  /** Screen reader label (mapped to aria-label) */
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
  /**
   * Inert passthrough: callers pass a uniform `{ disabled, ref, ... }` bag to
   * all three mixins; this mixin ignores `ref`. Accepted so the common bag
   * type-checks without widening named keys.
   */
  ref?: React.Ref<HTMLElement>;
}

/**
 * Composable mixin providing semantic accessibility behavior.
 * Normalizes the known semantic fields into ARIA attributes and forwards
 * any additional attributes (aria-*, data-*, etc.) untouched.
 */
export const useSemanticMixin = (props: SemanticMixinProps = {}): Record<string, any> => {
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
    ...rest
  } = props;

  // The pass-through `rest` bag is a fresh object every render (a product of
  // destructuring), which would otherwise change identity each render and
  // defeat memoization. Adopt a new identity only when its contents actually
  // change, so the memoized attributes stay referentially stable across renders
  // with equal props while still recomputing when a forwarded attribute
  // (e.g. aria-controls toggling with `open`) genuinely changes.
  const restRef = useRef<SemanticMixinDomProps>(rest);
  if (restRef.current !== rest) {
    const prev = restRef.current as Record<string, unknown>;
    const next = rest as Record<string, unknown>;
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    const same =
      prevKeys.length === nextKeys.length &&
      prevKeys.every((k) => prev[k] === next[k]);
    if (!same) restRef.current = rest;
  }
  const stableRest = restRef.current;

  return useMemo(() => {
    const attributes: Record<string, any> = { ...stableRest };

    if (role && role !== 'generic') {
      attributes.role = role;
    }
    if (label) {
      attributes['aria-label'] = label;
    }
    if (labelledBy) {
      attributes['aria-labelledby'] = labelledBy;
    }
    if (describedBy) {
      attributes['aria-describedby'] = describedBy;
    }
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

    return attributes;
  }, [role, label, labelledBy, describedBy, expanded, selected, disabled, required, hasPopup, live, stableRest]);
};
