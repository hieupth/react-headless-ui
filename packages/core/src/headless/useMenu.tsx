/**
 * Menu headless hook following Flutter patterns.
 * Provides menu behavior with keyboard navigation and selection.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export interface MenuItem {
  /** Menu item key */
  key: string;
  /** Menu item label */
  label: string;
  /** Menu item value */
  value?: any;
  /** Whether menu item is disabled */
  disabled?: boolean;
  /** Whether menu item is selected */
  selected?: boolean;
  /** Menu item icon */
  icon?: React.ReactNode;
  /** Menu item shortcut */
  shortcut?: string;
  /** Menu item action */
  action?: () => void;
  /** Menu item submenu */
  submenu?: MenuItem[];
}

export interface UseMenuProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Menu items */
  items: MenuItem[];
  /** Whether menu is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Selected item keys */
  selectedKeys?: string[];
  /** Default selected keys */
  defaultSelectedKeys?: string[];
  /** Selection change handler */
  onSelectionChange?: (keys: string[]) => void;
  /** Allow multiple selection */
  multiSelect?: boolean;
  /** Menu trigger variant */
  trigger?: 'click' | 'hover' | 'context';
  /** Close on selection */
  closeOnSelection?: boolean;
  /** Close on outside click */
  closeOnOutsideClick?: boolean;
}

export interface UseMenuState {
  /** Current open state */
  open: boolean;
  /** Current focus state */
  focused: boolean;
  /** Current press state */
  pressed: boolean;
  /** Current highlighted item index */
  highlightedIndex: number;
  /** Current selected keys */
  selectedKeys: Set<string>;
}

export interface UseMenuActions {
  /** Open menu */
  openMenu: () => void;
  /** Close menu */
  closeMenu: () => void;
  /** Toggle menu */
  toggleMenu: () => void;
  /** Highlight item */
  highlightItem: (index: number) => void;
  /** Select item */
  selectItem: (key: string) => void;
  /** Handle keyboard navigation */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle trigger click */
  handleTriggerClick: () => void;
  /** Handle trigger hover */
  handleTriggerEnter: () => void;
  /** Handle trigger leave */
  handleTriggerLeave: () => void;
  /** Get flattened menu items */
  getFlattenedItems: () => MenuItem[];
  /** Get item at index */
  getItemAt: (index: number) => MenuItem | undefined;
}

export interface UseMenuReturns extends UseMenuState, UseMenuActions {
  /** Semantic attributes for menu trigger */
  triggerAttributes: Record<string, any>;
  /** Semantic attributes for menu */
  menuAttributes: Record<string, any>;
  /** Reference to trigger element */
  triggerRef: React.RefObject<HTMLElement>;
  /** Reference to menu element */
  menuRef: React.RefObject<HTMLUListElement>;
  /** Computed selected keys array */
  selectedKeysArray: string[];
}

/**
 * Flatten menu items (handle nested submenus)
 */
const flattenMenuItems = (items: MenuItem[]): MenuItem[] => {
  const flattened: MenuItem[] = [];

  const flatten = (items: MenuItem[], level = 0) => {
    items.forEach(item => {
      flattened.push({ ...item, level });
      if (item.submenu) {
        flatten(item.submenu, level + 1);
      }
    });
  };

  flatten(items);
  return flattened;
};

/**
 * Headless menu hook providing menu behavior.
 * Includes keyboard navigation, selection, and accessibility.
 */
export const useMenu = (props: UseMenuProps): UseMenuReturns => {
  const {
    items,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    onSelectionChange,
    multiSelect = false,
    trigger = 'click',
    closeOnSelection = true,
    closeOnOutsideClick = true,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'first',
    pressable = true,
    role = 'menu',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState(new Set(defaultSelectedKeys));

  // References
  const triggerRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLUListElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable,
    focusStrategy
  });

  // Press behavior for menu trigger
  const pressableMixin = usePressableMixin({
    pressable
  });

  // Determine if open is controlled or uncontrolled
  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : internalOpen;

  // Determine if selection is controlled
  const isControlledSelected = controlledSelectedKeys !== undefined;
  const selectedKeys = isControlledSelected ? new Set(controlledSelectedKeys) : internalSelectedKeys;

  // Get flattened menu items
  const getFlattenedItems = useCallback(() => {
    return flattenMenuItems(items);
  }, [items]);

  // Get item at index
  const getItemAt = useCallback((index: number) => {
    const flattened = getFlattenedItems();
    return flattened[index];
  }, [getFlattenedItems]);

  // Open menu
  const openMenu = useCallback(() => {
    if (isControlledOpen) {
      onOpenChange?.(true);
    } else {
      setInternalOpen(true);
    }

    // Set initial highlight based on strategy
    if (focusStrategy === 'first') {
      const flattened = getFlattenedItems();
      const firstEnabledIndex = flattened.findIndex(item => !item.disabled);
      if (firstEnabledIndex !== -1) {
        setHighlightedIndex(firstEnabledIndex);
      }
    }
  }, [isControlledOpen, onOpenChange, focusStrategy, getFlattenedItems]);

  // Close menu
  const closeMenu = useCallback(() => {
    if (isControlledOpen) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
    setHighlightedIndex(-1);
  }, [isControlledOpen, onOpenChange]);

  // Toggle menu
  const toggleMenu = useCallback(() => {
    if (open) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [open, openMenu, closeMenu]);

  // Highlight item
  const highlightItem = useCallback((index: number) => {
    const flattened = getFlattenedItems();
    const item = flattened[index];

    if (item && !item.disabled) {
      setHighlightedIndex(index);
    }
  }, [getFlattenedItems]);

  // Select item
  const selectItem = useCallback((key: string) => {
    const flattened = getFlattenedItems();
    const item = flattened.find(item => item.key === key);

    if (!item || item.disabled) return;

    let newSelectedKeys: Set<string>;

    if (multiSelect) {
      newSelectedKeys = new Set(selectedKeys);
      if (newSelectedKeys.has(key)) {
        newSelectedKeys.delete(key);
      } else {
        newSelectedKeys.add(key);
      }
    } else {
      newSelectedKeys = new Set([key]);
    }

    // Update selection
    if (!isControlledSelected) {
      setInternalSelectedKeys(newSelectedKeys);
    }
    onSelectionChange?.(Array.from(newSelectedKeys));

    // Execute item action
    item.action?.();

    // Close menu on selection
    if (closeOnSelection) {
      closeMenu();
    }
  }, [selectedKeys, multiSelect, isControlledSelected, onSelectionChange, closeOnSelection, closeMenu, getFlattenedItems]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!open) return;

    const flattened = getFlattenedItems();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        let nextIndex = highlightedIndex;
        do {
          nextIndex = (nextIndex + 1) % flattened.length;
        } while (flattened[nextIndex].disabled && nextIndex !== highlightedIndex);
        highlightItem(nextIndex);
        break;

      case 'ArrowUp':
        event.preventDefault();
        let prevIndex = highlightedIndex;
        do {
          prevIndex = prevIndex <= 0 ? flattened.length - 1 : prevIndex - 1;
        } while (flattened[prevIndex].disabled && prevIndex !== highlightedIndex);
        highlightItem(prevIndex);
        break;

      case 'Home':
        event.preventDefault();
        const firstEnabledIndex = flattened.findIndex(item => !item.disabled);
        if (firstEnabledIndex !== -1) {
          highlightItem(firstEnabledIndex);
        }
        break;

      case 'End':
        event.preventDefault();
        const lastEnabledIndex = flattened.findLastIndex(item => !item.disabled);
        if (lastEnabledIndex !== -1) {
          highlightItem(lastEnabledIndex);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (highlightedIndex >= 0) {
          const item = flattened[highlightedIndex];
          if (item && !item.disabled) {
            selectItem(item.key);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
        break;
    }
  }, [open, highlightedIndex, getFlattenedItems, highlightItem, selectItem, closeMenu]);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (trigger === 'click') {
      toggleMenu();
    }
  }, [trigger, toggleMenu]);

  // Handle trigger hover
  const handleTriggerEnter = useCallback(() => {
    if (trigger === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      openMenu();
    }
  }, [trigger, openMenu]);

  // Handle trigger leave
  const handleTriggerLeave = useCallback(() => {
    if (trigger === 'hover') {
      hoverTimeoutRef.current = setTimeout(() => {
        closeMenu();
      }, 300);
    }
  }, [trigger, closeMenu]);

  // Handle outside click
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeOnOutsideClick, closeMenu]);

  // Sync external selected keys with internal state
  useEffect(() => {
    if (isControlledSelected) {
      setInternalSelectedKeys(new Set(controlledSelectedKeys));
    }
  }, [isControlledSelected, controlledSelectedKeys]);

  // Reset highlighted index when menu closes
  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1);
    }
  }, [open]);

  // Semantic attributes for trigger
  const triggerAttributes = useSemanticMixin({
    'aria-haspopup': 'true',
    'aria-expanded': open,
    'aria-controls': open ? `${role}-listbox` : undefined,
    'data-state': open ? 'open' : 'closed',
    'data-trigger': trigger,
    ...semanticProps
  });

  // Semantic attributes for menu
  const menuAttributes = useSemanticMixin({
    id: `${role}-listbox`,
    role,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-orientation': 'vertical',
    'data-state': open ? 'open' : 'closed',
    'data-multiselect': multiSelect,
    tabIndex: -1
  });

  // Computed state
  const state = useMemo(() => composeState<UseMenuState>({
    open,
    focused: focusableMixin.focused,
    pressed: pressableMixin.pressed,
    highlightedIndex,
    selectedKeys
  }), [open, focusableMixin.focused, pressableMixin.pressed, highlightedIndex, selectedKeys]);

  // Computed selected keys array
  const selectedKeysArray = useMemo(() => Array.from(selectedKeys), [selectedKeys]);

  return {
    // State
    ...state,

    // Actions
    openMenu,
    closeMenu,
    toggleMenu,
    highlightItem,
    selectItem,
    handleKeyDown,
    handleTriggerClick,
    handleTriggerEnter,
    handleTriggerLeave,
    getFlattenedItems,
    getItemAt,

    // Computed properties
    triggerAttributes,
    menuAttributes,
    triggerRef,
    menuRef,
    selectedKeysArray
  };
};