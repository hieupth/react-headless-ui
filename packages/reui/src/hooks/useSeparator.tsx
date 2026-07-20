import { useMemo } from 'react';
import { useSemanticMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps } from '../mixins';

export interface UseSeparatorProps extends SemanticMixinProps {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical';
  /** Whether separator is decorative (no semantic meaning) */
  decorative?: boolean;
  /** Text or content to display in separator */
  children?: React.ReactNode;
}

export interface UseSeparatorState {
  /** Current orientation */
  orientation: 'horizontal' | 'vertical';
  /** Whether separator is decorative */
  decorative: boolean;
  /** Whether separator has content */
  hasContent: boolean;
}

export interface UseSeparatorActions {
  // No actions for separator component
}

export interface UseSeparatorReturns {
  /** Component state */
  state: UseSeparatorState;
  /** Component actions */
  actions: UseSeparatorActions;
  /** Composed props to pass to separator element */
  props: Record<string, any>;
}

/**
 * Headless hook for separator component functionality.
 * Provides visual separation between content sections.
 *
 * @param props - Component configuration props
 * @returns Separator state, actions, and props
 */
export const useSeparator = (props: UseSeparatorProps): UseSeparatorReturns => {
  const {
    orientation = 'horizontal',
    decorative = true,
    children,
    ...semanticProps
  } = props;

  // Determine if separator has content
  const hasContent = Boolean(children);

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    role: decorative ? 'none' : 'separator',
    'aria-orientation': decorative ? undefined : orientation,
    'aria-hidden': decorative,
    ...semanticProps,
  });

  // Determine HTML element based on orientation and content
  const element = useMemo(() => {
    if (hasContent) {
      return 'div';
    }
    return orientation === 'horizontal' ? 'hr' : 'div';
  }, [orientation, hasContent]);

  // Compose state
  const state = composeState<UseSeparatorState>({
    orientation,
    decorative,
    hasContent,
    ...semantic.state,
  });

  // Compose actions (none for separator)
  const actions = composeHandlers<UseSeparatorActions>({
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic attributes
    'data-orientation': orientation,
    'data-decorative': decorative,
    'data-has-content': hasContent,

    // Semantic props — useSemanticMixin returns a flat attribute record.
    ...semantic,

    // Override role for decorative separators
    role: decorative ? 'none' : semantic.role,
  });

  return useMemo(() => ({
    state,
    actions,
    props: {
      ...composedProps,
      as: element, // For Radix-style asChild pattern
    },
  }), [state, actions, composedProps, element]);
};