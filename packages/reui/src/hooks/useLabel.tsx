import { useCallback, useMemo } from 'react';
import { useSemanticMixin, useFocusableMixin, usePressableMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps, PressableMixinProps } from '../mixins';

export interface UseLabelProps extends
  SemanticMixinProps,
  FocusableMixinProps,
  PressableMixinProps {
  /** HTML for attribute to associate with form control */
  htmlFor?: string;
  /** Whether label shows required indicator */
  required?: boolean;
  /** Whether label shows disabled state */
  disabled?: boolean;
  /** Whether label shows error state */
  error?: boolean;
  /** Custom required indicator text or element */
  requiredIndicator?: React.ReactNode;
  /** Position of required indicator */
  requiredPosition?: 'start' | 'end';
}

export interface UseLabelState {
  /** Current disabled state */
  disabled: boolean;
  /** Current required state */
  required: boolean;
  /** Current error state */
  error: boolean;
  /** Required indicator position */
  requiredPosition: 'start' | 'end';
}

export interface UseLabelActions {
  /** Focus associated form control */
  focusControl: () => void;
  /** Handle label click */
  handleClick: () => void;
}

export interface UseLabelReturns {
  /** Component state */
  state: UseLabelState;
  /** Component actions */
  actions: UseLabelActions;
  /** Composed props to pass to label element */
  props: Record<string, any>;
  /** Indicator shown for required fields */
  requiredIndicator: React.ReactNode;
}

/**
 * Headless hook for label component functionality.
 * Provides accessible form labels with proper focus management.
 *
 * @param props - Component configuration props
 * @returns Label state, actions, and props
 */
export const useLabel = (props: UseLabelProps): UseLabelReturns => {
  const {
    htmlFor,
    required = false,
    disabled = false,
    error = false,
    requiredIndicator = '*',
    requiredPosition = 'end',
    ...mixinsProps
  } = props;

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    role: 'label',
    ...mixinsProps,
  });

  // Focus associated form control
  const focusControl = useCallback(() => {
    if (!htmlFor || disabled) return;

    const formControl = document.getElementById(htmlFor);
    if (formControl) {
      formControl.focus();
    }
  }, [htmlFor, disabled]);

  // Handle label click
  const handleClick = useCallback(() => {
    if (disabled) return;
    focusControl();
  }, [disabled, focusControl]);

  // Compose state
  const state = composeState<UseLabelState>({
    disabled,
    required,
    error,
    requiredPosition,
    ...semantic.state,
  });

  // Compose actions
  const actions = composeHandlers<UseLabelActions>({
    focusControl,
    handleClick,
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic attributes
    htmlFor,
    disabled,

    // Accessibility attributes
    'aria-required': required || undefined,
    'aria-disabled': disabled || undefined,
    'aria-invalid': error || undefined,

    // Event handlers
    onClick: handleClick,

    // Mixin props
    ...semantic.props,

    // Style classes based on state
    'data-required': required || undefined,
    'data-disabled': disabled || undefined,
    'data-error': error || undefined,
    'data-required-position': requiredPosition,
  });

  return useMemo(() => ({
    state,
    actions,
    props: composedProps,
    // Additional data for rendering
    requiredIndicator,
  }), [state, actions, composedProps, requiredIndicator]);
};