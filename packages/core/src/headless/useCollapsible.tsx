import { useState, useCallback, useRef } from 'react';
import { useSemanticMixin, useFocusableMixin, usePressableMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps, PressableMixinProps } from '../mixins';

export interface UseCollapsibleProps extends
  SemanticMixinProps,
  FocusableMixinProps,
  PressableMixinProps {
  /** Whether collapsible is open by default */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether collapsible is disabled */
  disabled?: boolean;
  /** Whether to animate transitions */
  animated?: boolean;
}

export interface UseCollapsibleState {
  /** Current open state */
  open: boolean;
  /** Whether collapsible is disabled */
  disabled: boolean;
  /** Whether transitions are animated */
  animated: boolean;
}

export interface UseCollapsibleActions {
  /** Toggle open state */
  toggle: () => void;
  /** Open collapsible */
  open: () => void;
  /** Close collapsible */
  close: () => void;
}

export interface UseCollapsibleReturns {
  /** Component state */
  state: UseCollapsibleState;
  /** Component actions */
  actions: UseCollapsibleActions;
  /** Composed props for trigger element */
  triggerProps: Record<string, any>;
  /** Composed props for content element */
  contentProps: Record<string, any>;
}

/**
 * Headless hook for collapsible component functionality.
 * Provides show/hide behavior with proper accessibility and animations.
 *
 * @param props - Component configuration props
 * @returns Collapsible state, actions, and props
 */
export const useCollapsible = (props: UseCollapsibleProps): UseCollapsibleReturns => {
  const {
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    disabled = false,
    animated = true,
    ...mixinsProps
  } = props;

  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Content ref for height calculations
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle semantic behavior
  const semantic = useSemanticMixin({
    ...mixinsProps,
  });

  // Toggle open state
  const toggle = useCallback(() => {
    if (disabled) return;

    const newOpen = !open;

    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    }
  }, [disabled, open, isControlled, onOpenChange]);

  const openCollapsible = useCallback(() => {
    if (disabled || open) return;

    if (isControlled) {
      onOpenChange?.(true);
    } else {
      setInternalOpen(true);
      onOpenChange?.(true);
    }
  }, [disabled, open, isControlled, onOpenChange]);

  const closeCollapsible = useCallback(() => {
    if (disabled || !open) return;

    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
      onOpenChange?.(false);
    }
  }, [disabled, open, isControlled, onOpenChange]);

  // Compose state
  const state = composeState<UseCollapsibleState>({
    open,
    disabled,
    animated,
    ...semantic.state,
  });

  // Compose actions
  const actions = composeHandlers<UseCollapsibleActions>({
    toggle,
    open: openCollapsible,
    close: closeCollapsible,
    ...semantic.actions,
  });

  // Trigger props
  const triggerProps = composeHandlers({
    // Basic attributes
    'aria-expanded': open,
    'aria-controls': contentRef.current?.id,
    'aria-disabled': disabled,
    'data-state': open ? 'open' : 'closed',

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

      semantic.props.onKeyDown?.(event);
    },

    // Mixin props
    ...semantic.props,
  });

  // Content props
  const contentProps = composeHandlers({
    // Basic attributes
    'aria-hidden': !open,
    'data-state': open ? 'open' : 'closed',
    'data-disabled': disabled,
    'data-animated': animated,

    // Style for animation
    style: {
      overflow: 'hidden',
      transition: animated ? 'height 0.2s ease-in-out' : 'none',
      height: open ? 'auto' : '0px',
    },

    // Mixin props
    ...semantic.props,
  });

  return {
    state,
    actions,
    triggerProps,
    contentProps,
  };
};