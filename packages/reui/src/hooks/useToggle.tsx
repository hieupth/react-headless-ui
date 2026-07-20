import { useState, useCallback, useMemo } from 'react';
import { useSemanticMixin, useFocusableMixin, usePressableMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps, PressableMixinProps } from '../mixins';

export interface UseToggleProps extends
  SemanticMixinProps,
  FocusableMixinProps,
  PressableMixinProps {
  /** Default pressed state */
  defaultPressed?: boolean;
  /** Controlled pressed state */
  pressed?: boolean;
  /** Called when pressed state changes */
  onPressedChange?: (pressed: boolean) => void;
  /** Whether toggle is disabled */
  disabled?: boolean;
}

export interface UseToggleState {
  /** Current pressed state */
  pressed: boolean;
  /** Current disabled state */
  disabled: boolean;
}

export interface UseToggleActions {
  /** Toggle pressed state */
  toggle: () => void;
  /** Set pressed state to true */
  press: () => void;
  /** Set pressed state to false */
  release: () => void;
}

export interface UseToggleReturns {
  /** Component state */
  state: UseToggleState;
  /** Component actions */
  actions: UseToggleActions;
  /** Composed props to pass to toggle element */
  props: Record<string, any>;
}

/**
 * Headless hook for toggle component functionality.
 * Provides two-state button behavior with accessibility support.
 *
 * @param props - Component configuration props
 * @returns Toggle state, actions, and props
 */
export const useToggle = (props: UseToggleProps): UseToggleReturns => {
  const {
    defaultPressed = false,
    pressed: controlledPressed,
    onPressedChange,
    disabled = false,
    ...mixinsProps
  } = props;

  // Internal state for uncontrolled mode
  const [internalPressed, setInternalPressed] = useState(defaultPressed);

  // Determine if controlled or uncontrolled
  const isControlled = controlledPressed !== undefined;
  const pressed = isControlled ? controlledPressed : internalPressed;

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    role: 'button',
    ...mixinsProps,
  });

  // Toggle pressed state
  const toggle = useCallback(() => {
    if (disabled) return;

    const newPressed = !pressed;

    if (isControlled) {
      onPressedChange?.(newPressed);
    } else {
      setInternalPressed(newPressed);
      onPressedChange?.(newPressed);
    }
  }, [disabled, pressed, isControlled, onPressedChange]);

  const press = useCallback(() => {
    if (disabled || pressed) return;

    if (isControlled) {
      onPressedChange?.(true);
    } else {
      setInternalPressed(true);
      onPressedChange?.(true);
    }
  }, [disabled, pressed, isControlled, onPressedChange]);

  const release = useCallback(() => {
    if (disabled || !pressed) return;

    if (isControlled) {
      onPressedChange?.(false);
    } else {
      setInternalPressed(false);
      onPressedChange?.(false);
    }
  }, [disabled, pressed, isControlled, onPressedChange]);

  // Compose state
  const state = composeState<UseToggleState>({
    pressed,
    disabled,
    ...semantic.state,
  });

  // Compose actions
  const actions = composeHandlers<UseToggleActions>({
    toggle,
    press,
    release,
    ...semantic.actions,
  });

  // Compose props
  const composedProps = composeHandlers({
    // Basic attributes
    'aria-pressed': pressed,
    'aria-disabled': disabled,
    'data-state': pressed ? 'on' : 'off',
    'data-disabled': disabled,

    // Event handlers
    onClick: toggle,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          toggle();
          break;
      }

      // semantic is a flat attributes record from useSemanticMixin; guard for safety.
      const semanticKeyDown = (semantic as any).onKeyDown;
      semanticKeyDown?.(event);
    },

    // Mixin attributes (flat record) are merged in directly.
    ...semantic,
  });

  return useMemo(() => ({
    state,
    actions,
    props: composedProps,
  }), [state, actions, composedProps]);
};