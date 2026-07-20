/**
 * Item headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages generic item state for lists, menus, and dropdowns.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Item state interface
 */
export interface ItemState {
  /** Whether item is currently selected */
  selected: boolean;
  /** Whether item is currently hovered */
  hovered: boolean;
  /** Whether item is currently pressed */
  pressed: boolean;
  /** Whether item is disabled */
  disabled: boolean;
  /** Whether item is focused */
  focused: boolean;
  /** Current item value */
  value: string | number;
  /** Item label/text */
  label: string;
  /** Item description */
  description?: string;
  /** Whether item has sub-items */
  hasSubItems: boolean;
  /** Current indentation level */
  level: number;
  /** Whether item is highlighted */
  highlighted: boolean;
  /** Whether item is active (current page) */
  active: boolean;
  /** Whether item is interactive */
  interactive: boolean;
}

/**
 * Item actions interface
 */
export interface ItemActions {
  /** Select item */
  select: () => void;
  /** Deselect item */
  deselect: () => void;
  /** Toggle selection */
  toggle: () => void;
  /** Focus item */
  focus: () => void;
  /** Blur item */
  blur: () => void;
  /** Hover item */
  hover: () => void;
  /** Unhover item */
  unhover: () => void;
  /** Press item */
  press: () => void;
  /** Release item */
  release: () => void;
  /** Set value */
  setValue: (value: string | number) => void;
  /** Set label */
  setLabel: (label: string) => void;
  /** Set description */
  setDescription: (description?: string) => void;
  /** Set disabled state */
  setDisabled: (disabled: boolean) => void;
  /** Get item element */
  getElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    'aria-selected'?: boolean;
    'aria-current'?: string;
    'aria-level'?: number;
    'aria-setsize'?: number;
    'aria-posinset'?: number;
    'aria-expanded'?: boolean;
    'role'?: string;
    'tabIndex'?: number;
  };
}

/**
 * Props for useItem hook
 */
export interface UseItemProps {
  /** Whether item is initially selected */
  defaultSelected?: boolean;
  /** Controlled selected state */
  selected?: boolean;
  /** Initial item value */
  defaultValue?: string | number;
  /** Controlled value */
  value?: string | number;
  /** Initial item label */
  defaultLabel?: string;
  /** Initial item description */
  defaultDescription?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is interactive */
  interactive?: boolean;
  /** Item level/depth */
  level?: number;
  /** Whether item has sub-items */
  hasSubItems?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Hover handler */
  onHover?: (hovered: boolean) => void;
  /** Press handler */
  onPress?: (pressed: boolean) => void;
  /** Select handler */
  onSelect?: () => void;
  /** Deselect handler */
  onDeselect?: () => void;
  /** Change handler */
  onChange?: (selected: boolean, value: string | number) => void;
  /** Item element ref */
  itemRef?: React.RefObject<HTMLElement | null>;
  /** Whether to use checkable behavior */
  checkable?: boolean;
  /** Whether to highlight on hover */
  highlightOnHover?: boolean;
  /** Whether to show active state */
  showActive?: boolean;
  /** Custom selection behavior */
  selectionMode?: 'single' | 'multiple' | 'none';
  /** List size for accessibility */
  listSize?: number;
  /** Item position in list */
  position?: number;
}

/**
 * Return type for useItem hook
 */
export interface UseItemReturns {
  /** Current item state */
  state: ItemState;
  /** Item actions */
  actions: ItemActions;
  /** Accessibility attributes */
  attributes: {
    'role'?: string;
    'aria-selected'?: boolean;
    'aria-current'?: string;
    'aria-level'?: number;
    'aria-setsize'?: number;
    'aria-posinset'?: number;
    'aria-expanded'?: boolean;
    'aria-disabled'?: boolean;
    'tabIndex'?: number;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    selected: string;
    hovered: string;
    pressed: string;
    disabled: string;
    focused: string;
    active: string;
    highlighted: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Item hook implementation
 * @param props - Item configuration props
 * @returns Item state, actions, and attributes
 */
export function useItem(props: UseItemProps): UseItemReturns {
  const {
    defaultSelected = false,
    selected: controlledSelected,
    defaultValue = '',
    value: controlledValue,
    defaultLabel = '',
    defaultDescription,
    disabled = false,
    interactive = true,
    level = 1,
    hasSubItems = false,
    onClick,
    onFocus,
    onBlur,
    onHover,
    onPress,
    onSelect,
    onDeselect,
    onChange,
    itemRef,
    checkable = false,
    highlightOnHover = true,
    showActive = false,
    selectionMode = 'single',
    listSize,
    position,
  } = props;

  // State management
  const [internalSelected, setInternalSelected] = useState<boolean>(defaultSelected);
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue);
  const [label, setLabelState] = useState<string>(defaultLabel);
  const [description, setDescriptionState] = useState<string | undefined>(defaultDescription);
  const [hovered, setHovered] = useState<boolean>(false);
  const [pressed, setPressed] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = itemRef || internalRef;

  // Determine if component is controlled
  const isSelectedControlled = controlledSelected !== undefined;
  const isValueControlled = controlledValue !== undefined;
  const currentSelected = isSelectedControlled ? controlledSelected : internalSelected;
  const currentValue = isValueControlled ? controlledValue : internalValue;

  /**
   * Select item
   */
  const selectAction = useCallback(() => {
    if (!interactive || disabled) return;

    if (!isSelectedControlled) {
      setInternalSelected(true);
    }

    onSelect?.();
    onChange?.(true, currentValue);
    onClick?.();
  }, [interactive, disabled, isSelectedControlled, currentValue, onSelect, onChange, onClick]);

  /**
   * Deselect item
   */
  const deselectAction = useCallback(() => {
    if (!interactive || disabled) return;

    if (!isSelectedControlled) {
      setInternalSelected(false);
    }

    onDeselect?.();
    onChange?.(false, currentValue);
  }, [interactive, disabled, isSelectedControlled, currentValue, onDeselect, onChange]);

  /**
   * Toggle selection
   */
  const toggleAction = useCallback(() => {
    if (currentSelected) {
      deselectAction();
    } else {
      selectAction();
    }
  }, [currentSelected, selectAction, deselectAction]);

  /**
   * Focus item
   */
  const focusAction = useCallback(() => {
    if (!interactive || disabled) return;
    setFocused(true);
    elementRef.current?.focus();
  }, [interactive, disabled]);

  /**
   * Blur item
   */
  const blurAction = useCallback(() => {
    setFocused(false);
    elementRef.current?.blur();
  }, []);

  /**
   * Hover item
   */
  const hoverAction = useCallback(() => {
    if (!interactive || disabled) return;
    setHovered(true);
    onHover?.(true);
  }, [interactive, disabled, onHover]);

  /**
   * Unhover item
   */
  const unhoverAction = useCallback(() => {
    if (!interactive || disabled) return;
    setHovered(false);
    onHover?.(false);
  }, [interactive, disabled, onHover]);

  /**
   * Press item
   */
  const pressAction = useCallback(() => {
    if (!interactive || disabled) return;
    setPressed(true);
    onPress?.(true);
  }, [interactive, disabled, onPress]);

  /**
   * Release item
   */
  const releaseAction = useCallback(() => {
    setPressed(false);
    onPress?.(false);
  }, [onPress]);

  /**
   * Set value
   */
  const setValueAction = useCallback((newValue: string | number) => {
    if (!isValueControlled) {
      setInternalValue(newValue);
    }
  }, [isValueControlled]);

  /**
   * Set label
   */
  const setLabelAction = useCallback((newLabel: string) => {
    setLabelState(newLabel);
  }, []);

  /**
   * Set description
   */
  const setDescriptionAction = useCallback((newDescription?: string) => {
    setDescriptionState(newDescription);
  }, []);

  /**
   * Set disabled state
   */
  const setDisabledAction = useCallback((newDisabled: boolean) => {
    // Disabled state is managed externally via props
  }, []);

  /**
   * Get item element
   */
  const getElementAction = useCallback(() => {
    return elementRef.current;
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    const props: any = {};

    if (disabled) {
      props['aria-disabled'] = true;
    }

    if (selectionMode !== 'none' && checkable) {
      props['aria-selected'] = currentSelected;
    }

    if (showActive && currentSelected) {
      props['aria-current'] = 'page';
    }

    if (level > 1) {
      props['aria-level'] = level;
    }

    if (listSize && position !== undefined) {
      props['aria-setsize'] = listSize;
      props['aria-posinset'] = position + 1;
    }

    if (hasSubItems) {
      props['aria-expanded'] = hovered; // Or use state from parent
    }

    if (interactive && !disabled) {
      props['tabIndex'] = 0;
    }

    return props;
  }, [disabled, selectionMode, checkable, currentSelected, showActive, level, listSize, position, hasSubItems, hovered]);

  // Build state
  const state: ItemState = useMemo(() => ({
    selected: currentSelected,
    hovered,
    pressed,
    disabled,
    focused,
    value: currentValue,
    label,
    description,
    hasSubItems,
    level,
    highlighted: highlightOnHover && hovered,
    active: showActive && currentSelected,
    interactive
  }), [currentSelected, hovered, pressed, disabled, focused, currentValue, label, description, hasSubItems, level, highlightOnHover, showActive, interactive]);

  // Build actions
  const actions: ItemActions = useMemo(() => ({
    select: selectAction,
    deselect: deselectAction,
    toggle: toggleAction,
    focus: focusAction,
    blur: blurAction,
    hover: hoverAction,
    unhover: unhoverAction,
    press: pressAction,
    release: releaseAction,
    setValue: setValueAction,
    setLabel: setLabelAction,
    setDescription: setDescriptionAction,
    setDisabled: setDisabledAction,
    getElement: getElementAction,
    getAccessibilityProps: getAccessibilityPropsAction
  }), [selectAction, deselectAction, toggleAction, focusAction, blurAction, hoverAction, unhoverAction, pressAction, releaseAction, setValueAction, setLabelAction, setDescriptionAction, setDisabledAction, getElementAction, getAccessibilityPropsAction]);

  // Build accessibility attributes
  const accessibilityProps = useMemo(() => getAccessibilityPropsAction(), [getAccessibilityPropsAction]);

  // Build CSS classes
  const classes = useMemo(() => ({
    base: 'item',
    selected: currentSelected ? 'item-selected' : '',
    hovered: hovered ? 'item-hovered' : '',
    pressed: pressed ? 'item-pressed' : '',
    disabled: disabled ? 'item-disabled' : '',
    focused: focused ? 'item-focused' : '',
    active: state.active ? 'item-active' : '',
    highlighted: state.highlighted ? 'item-highlighted' : ''
  }), [currentSelected, hovered, pressed, disabled, focused, state.active, state.highlighted]);

  // Mixins
  const focusable = useFocusableMixin({
    disabled: !interactive || disabled,
    ref: elementRef
  });

  const pressable = usePressableMixin({
    disabled: !interactive || disabled,
    ref: elementRef
  });

  const semantic = useSemanticMixin({
    role: 'option',
    ref: elementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes: {
      ...accessibilityProps
    },
    classes,
    focusable,
    pressable,
    semantic
  }), [state, actions, accessibilityProps, classes, focusable, pressable, semantic]);
}