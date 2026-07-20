/**
 * Chip headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages chip selection, deletion, and interaction states.
 */

import { useState, useCallback, useMemo } from "react";
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Chip variant options
 */
export type ChipVariant = 'solid' | 'outline' | 'soft';

/**
 * Chip size options
 */
export type ChipSize = 'sm' | 'md' | 'lg';

/**
 * Chip color options
 */
export type ChipColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Chip state interface
 */
export interface ChipState {
  /** Whether chip is selected */
  selected: boolean;
  /** Whether chip is disabled */
  disabled: boolean;
  /** Whether chip is focused */
  focused: boolean;
  /** Whether chip is hovered */
  hovered: boolean;
  /** Whether chip is pressed */
  pressed: boolean;
  /** Chip variant */
  variant: ChipVariant;
  /** Chip size */
  size: ChipSize;
  /** Chip color */
  color: ChipColor;
  /** Whether chip can be selected */
  selectable: boolean;
  /** Whether chip can be deleted */
  deletable: boolean;
}

/**
 * Chip actions interface
 */
export interface ChipActions {
  /** Toggle selection */
  toggleSelection: () => void;
  /** Select chip */
  select: () => void;
  /** Deselect chip */
  deselect: () => void;
  /** Delete chip */
  delete: () => void;
  /** Focus chip */
  focus: () => void;
  /** Blur chip */
  blur: () => void;
  /** Set hover state */
  setHovered: (hovered: boolean) => void;
  /** Set pressed state */
  setPressed: (pressed: boolean) => void;
}

/**
 * Props for useChip hook
 */
export interface UseChipProps {
  /** Initial selected state */
  defaultSelected?: boolean;
  /** Controlled selected state */
  selected?: boolean;
  /** Whether chip is disabled */
  disabled?: boolean;
  /** Chip variant */
  variant?: ChipVariant;
  /** Chip size */
  size?: ChipSize;
  /** Chip color */
  color?: ChipColor;
  /** Whether chip can be selected */
  selectable?: boolean;
  /** Whether chip can be deleted */
  deletable?: boolean;
  /** Chip value */
  value?: any;
  /** Callback when selection changes */
  onSelectionChange?: (selected: boolean) => void;
  /** Callback when chip is deleted */
  onDelete?: () => void;
  /** Callback when chip is clicked */
  onClick?: () => void;
  /** Callback when chip is focused */
  onFocus?: () => void;
  /** Callback when chip is blurred */
  onBlur?: () => void;
}

/**
 * Return type for useChip hook
 */
export interface UseChipReturns {
  /** Current chip state */
  state: ChipState;
  /** Chip actions */
  actions: ChipActions;
  /** Computed properties */
  computed: {
    /** Whether chip should show selection indicator */
    showSelection: boolean;
    /** Whether chip should show delete button */
    showDelete: boolean;
    /** ARIA selected state */
    ariaSelected: boolean | undefined;
    /** ARIA disabled state */
    ariaDisabled: boolean;
  };
  /** Chip attributes */
  chipAttributes: {
    role: string;
    'aria-selected': boolean | undefined;
    'aria-disabled': boolean;
    'aria-pressed': boolean | undefined;
    tabIndex: number;
  };
  /** Get chip container attributes */
  getContainerAttributes: () => {
    'aria-label': string;
    role: string;
    onClick: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    tabIndex: number;
  };
  /** Get delete button attributes */
  getDeleteButtonAttributes: () => {
    'aria-label': string;
    onClick: (event: React.MouseEvent) => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    type: 'button';
    tabIndex: number;
    disabled: boolean;
  };
}

/**
 * Chip hook implementation
 * @param props - Chip configuration props
 * @returns Chip state, actions, computed properties, and attributes
 */
export function useChip(props: UseChipProps = {}): UseChipReturns {
  const {
    defaultSelected = false,
    selected: controlledSelected,
    disabled = false,
    variant = 'solid',
    size = 'md',
    color = 'primary',
    selectable = false,
    deletable = false,
    value,
    onSelectionChange,
    onDelete,
    onClick,
    onFocus,
    onBlur
  } = props;

  // State management
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Use controlled or uncontrolled selected state
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  // Actions
  const actions = useMemo(() => {
    const toggleSelection = () => {
      if (!selectable || disabled) return;
      const newSelected = !selected;

      if (controlledSelected === undefined) {
        setInternalSelected(newSelected);
      }

      onSelectionChange?.(newSelected);
    };

    const select = () => {
      if (!selectable || disabled || selected) return;

      if (controlledSelected === undefined) {
        setInternalSelected(true);
      }

      onSelectionChange?.(true);
    };

    const deselect = () => {
      if (!selectable || disabled || !selected) return;

      if (controlledSelected === undefined) {
        setInternalSelected(false);
      }

      onSelectionChange?.(false);
    };

    const deleteChip = () => {
      if (disabled || !deletable) return;
      onDelete?.();
    };

    const focusChip = () => {
      if (disabled) return;
      setFocused(true);
      onFocus?.();
    };

    const blurChip = () => {
      if (disabled) return;
      setFocused(false);
      onBlur?.();
    };

    return {
      toggleSelection,
      select,
      deselect,
      delete: deleteChip,
      focus: focusChip,
      blur: blurChip,
      setHovered,
      setPressed
    };
  }, [
    selectable,
    disabled,
    deletable,
    selected,
    controlledSelected,
    onSelectionChange,
    onDelete,
    onFocus,
    onBlur
  ]);

  // Computed properties
  const computed = useMemo(() => {
    const showSelection = selectable && selected;
    const showDelete = deletable && !disabled;
    const ariaSelected = selectable ? selected : undefined;
    const ariaDisabled = disabled;

    return {
      showSelection,
      showDelete,
      ariaSelected,
      ariaDisabled
    };
  }, [selectable, selected, deletable, disabled]);

  // Build state (memoized so the outer return can be referentially stable).
  const state: ChipState = useMemo(() => ({
    selected,
    disabled,
    focused,
    hovered,
    pressed,
    variant,
    size,
    color,
    selectable,
    deletable
  }), [selected, disabled, focused, hovered, pressed, variant, size, color, selectable, deletable]);

  // Build chip attributes (memoized so the outer return can be referentially stable).
  const chipAttributes = useMemo(() => ({
    role: selectable ? 'option' : 'button',
    'aria-selected': computed.ariaSelected,
    'aria-disabled': computed.ariaDisabled,
    'aria-pressed': selectable ? selected : undefined,
    tabIndex: disabled ? -1 : 0
  }), [selectable, computed.ariaSelected, computed.ariaDisabled, selected, disabled]);

  // Build container attributes (memoized so the outer return can be referentially stable).
  const getContainerAttributes = useCallback(() => ({
    'aria-label': `${selectable ? (selected ? 'Selected chip' : 'Unselected chip') : 'Chip'}${value ? `: ${value}` : ''}`,
    role: chipAttributes.role,
    onClick: () => {
      if (disabled) return;
      onClick?.();
      if (selectable) {
        actions.toggleSelection();
      }
    },
    onMouseDown: () => actions.setPressed(true),
    onMouseUp: () => actions.setPressed(false),
    onMouseEnter: () => actions.setHovered(true),
    onMouseLeave: () => actions.setHovered(false),
    onFocus: () => actions.focus(),
    onBlur: () => actions.blur(),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          onClick?.();
          if (selectable) {
            actions.toggleSelection();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (deletable) {
            event.preventDefault();
            actions.delete();
          }
          break;
        case 'Escape':
          event.preventDefault();
          actions.blur();
          break;
      }
    },
    tabIndex: disabled ? -1 : 0
  }), [selectable, selected, value, chipAttributes.role, disabled, onClick, actions, deletable]);

  // Build delete button attributes (memoized so the outer return can be referentially stable).
  const getDeleteButtonAttributes = useCallback(() => ({
    'aria-label': 'Delete chip',
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      actions.delete();
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        actions.delete();
      }
    },
    type: 'button' as const,
    tabIndex: -1, // Delete button is not focusable, handled by container
    disabled
  }), [actions, disabled]);

  return useMemo(() => ({
    state,
    actions,
    computed,
    chipAttributes,
    getContainerAttributes,
    getDeleteButtonAttributes
  }), [state, actions, computed, chipAttributes, getContainerAttributes, getDeleteButtonAttributes]);
}