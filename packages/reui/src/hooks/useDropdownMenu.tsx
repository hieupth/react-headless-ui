/**
 * Dropdown Menu headless hook following Flutter dropdown patterns.
 * Provides menu behavior with proper positioning and accessibility.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSemanticMixin, useFocusableMixin, usePressableMixin } from '../mixins';
import { composeState } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps, PressableMixinProps } from '../mixins';

export interface DropdownMenuItem {
  /** Unique identifier for the item */
  id: string;
  /** Item label or content */
  label: React.ReactNode;
  /** Item icon */
  icon?: React.ReactNode;
  /** Shortcut key */
  shortcut?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is checked */
  checked?: boolean;
  /** Optional badge for the item */
  badge?: React.ReactNode;
  /** Action handler */
  onClick?: () => void;
  /** Indicates destructive action */
  destructive?: boolean;
  /** Indicates this item opens a submenu */
  hasSubmenu?: boolean;
  /** Item role for accessibility */
  role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
}

export interface UseDropdownMenuProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Menu items */
  items: DropdownMenuItem[];
  /** Whether menu is open */
  open: boolean;
  /** Open change handler */
  onOpenChange: (open: boolean) => void;
  /** Placement relative to trigger */
  placement?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end';
  /** Alignment */
  align?: 'start' | 'center' | 'end';
  /** Offset from trigger */
  offset?: number;
  /** Whether to close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
  /** Whether to close when selecting an item */
  closeOnSelect?: boolean;
  /** Loop navigation */
  loop?: boolean;
}

export interface UseDropdownMenuState {
  /** Whether menu is open */
  open: boolean;
  /** Currently focused item index */
  focusedIndex: number;
  /** Current placement */
  placement: string;
  /** Whether trigger is focused */
  isTriggerFocused: boolean;
}

export interface UseDropdownMenuActions {
  /** Open the menu */
  open: () => void;
  /** Close the menu */
  close: () => void;
  /** Toggle the menu */
  toggle: () => void;
  /** Focus next item */
  focusNext: () => void;
  /** Focus previous item */
  focusPrevious: () => void;
  /** Focus first item */
  focusFirst: () => void;
  /** Focus last item */
  focusLast: () => void;
  /** Focus specific item */
  focusItem: (index: number) => void;
  /** Select current focused item */
  selectItem: () => void;
}

export interface UseDropdownMenuReturns {
  /** Component state */
  state: UseDropdownMenuState;
  /** Component actions */
  actions: UseDropdownMenuActions;
  /** Semantic attributes for the trigger */
  triggerAttributes: Record<string, any>;
  /** Semantic attributes for the menu */
  menuAttributes: Record<string, any>;
  /** Props for the trigger element */
  triggerProps: Record<string, any>;
  /** Props for the menu container */
  menuProps: Record<string, any>;
  /** Props generator for menu items */
  getItemProps: (item: DropdownMenuItem, index: number) => Record<string, any>;
  /** Props generator for item labels */
  getItemLabelProps: (item: DropdownMenuItem, index: number) => Record<string, any>;
  /** Props for the arrow element */
  arrowProps: Record<string, any>;
  /** Ref for the trigger element */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Ref for the menu element */
  menuRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Headless dropdown menu hook providing menu behavior with proper positioning and accessibility.
 * Supports keyboard navigation, focus management, and various placement options.
 */
export const useDropdownMenu = (props: UseDropdownMenuProps) => {
  const {
    items = [],
    open,
    onOpenChange,
    placement = 'bottom',
    align = 'start',
    offset = 4,
    closeOnClickOutside = true,
    closeOnEscape = true,
    closeOnSelect = true,
    loop = true,
    ...semanticProps
  } = props;

  // Internal state
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isTriggerFocused, setIsTriggerFocused] = useState(false);

  // Refs
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role: 'menu',
    ...semanticProps
  });

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open && closeOnEscape) {
        event.preventDefault();
        onOpenChange(false);
        if (isTriggerFocused) {
          triggerRef.current?.focus();
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEscape, onOpenChange, isTriggerFocused]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        closeOnClickOutside &&
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, closeOnClickOutside, onOpenChange]);

  // Focus management when menu opens
  useEffect(() => {
    if (open) {
      // Focus first enabled item
      const firstEnabledIndex = items.findIndex(item => !item.disabled);
      if (firstEnabledIndex !== -1) {
        setFocusedIndex(firstEnabledIndex);
      }
    } else {
      setFocusedIndex(-1);
    }
  }, [open, items]);

  // Open actions
  const openMenu = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const closeMenu = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const toggleMenu = useCallback(() => {
    onOpenChange(!open);
  }, [open, onOpenChange]);

  // Pressable mixin for the trigger (must be called at top level, not inside
  // useMemo, per the rules of hooks). Toggling the menu on press.
  const pressable = usePressableMixin({
    onPress: toggleMenu,
    ...semanticProps
  });

  // Navigation actions
  const focusNext = useCallback(() => {
    if (!open) return;

    const enabledItems = items.map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.disabled);

    if (enabledItems.length === 0) return;

    const currentFocused = enabledItems.findIndex(({ index }) => index === focusedIndex);
    let nextIndex;

    if (currentFocused === -1 || currentFocused === enabledItems.length - 1) {
      nextIndex = loop ? 0 : currentFocused;
    } else {
      nextIndex = currentFocused + 1;
    }

    // reason: focusNext always resolves to a valid enabled index — the
    // open-effect normalizes focusedIndex to an enabled item on every items
    // change, and the loop/wrap arithmetic keeps nextIndex >= 0. The -1
    // fallback is unreachable through the hook's public API.
    /* c8 ignore next */
    if (nextIndex !== -1) {
      setFocusedIndex(enabledItems[nextIndex].index);
    }
  }, [open, items, focusedIndex, loop]);

  const focusPrevious = useCallback(() => {
    if (!open) return;

    const enabledItems = items.map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.disabled);

    if (enabledItems.length === 0) return;

    const currentFocused = enabledItems.findIndex(({ index }) => index === focusedIndex);
    let prevIndex;

    if (currentFocused <= 0) {
      prevIndex = loop ? enabledItems.length - 1 : currentFocused;
    } else {
      prevIndex = currentFocused - 1;
    }

    // reason: focusPrevious always resolves to a valid enabled index — the
    // open-effect normalizes focusedIndex to an enabled item on every items
    // change, and prevIndex stays >= 0. The -1 fallback is unreachable.
    /* c8 ignore next */
    if (prevIndex !== -1) {
      setFocusedIndex(enabledItems[prevIndex].index);
    }
  }, [open, items, focusedIndex, loop]);

  const focusFirst = useCallback(() => {
    if (!open) return;

    const firstEnabledIndex = items.findIndex(item => !item.disabled);
    if (firstEnabledIndex !== -1) {
      setFocusedIndex(firstEnabledIndex);
    }
  }, [open, items]);

  const focusLast = useCallback(() => {
    if (!open) return;

    const lastEnabledIndex = items.reduce((lastIndex, item, index) => {
      return !item.disabled ? index : lastIndex;
    }, -1);

    if (lastEnabledIndex !== -1) {
      setFocusedIndex(lastEnabledIndex);
    }
  }, [open, items]);

  const focusItem = useCallback((index: number) => {
    if (!open || index < 0 || index >= items.length || items[index].disabled) return;
    setFocusedIndex(index);
  }, [open, items]);

  // Item selection
  const selectItem = useCallback(() => {
    if (!open || focusedIndex === -1 || focusedIndex >= items.length) return;

    const item = items[focusedIndex];
    // reason: focusedIndex always points to an enabled item — focusItem
    // rejects disabled indices and the open-effect normalizes focusedIndex
    // on every items change. The disabled arm here is unreachable.
    /* c8 ignore next */
    if (!item.disabled) {
      item.onClick?.();
      if (closeOnSelect) {
        closeMenu();
      }
    }
  }, [open, focusedIndex, items, closeOnSelect, closeMenu]);

  // Trigger props
  const triggerProps = useMemo(() => {
    return {
      ref: triggerRef,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': open ? 'dropdown-menu' : undefined,
      'data-state': open ? 'open' : 'closed',
      onClick: pressable.handleClick,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          openMenu();
        }
        pressable.handleKeyDown?.(event);
      },
      onFocus: () => {
        setIsTriggerFocused(true);
      },
      onBlur: () => {
        setIsTriggerFocused(false);
      }
    };
  }, [toggleMenu, open, openMenu, pressable]);

  // Menu props
  const menuProps = useMemo(() => ({
    ref: menuRef,
    id: 'dropdown-menu',
    role: 'menu',
    'aria-orientation': 'vertical',
    'data-state': open ? 'open' : 'closed',
    'data-placement': placement,
    'data-align': align,
    onKeyDown: (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          focusNext();
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusPrevious();
          break;
        case 'Home':
          event.preventDefault();
          focusFirst();
          break;
        case 'End':
          event.preventDefault();
          focusLast();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          selectItem();
          break;
        case 'Escape':
          if (closeOnEscape) {
            event.preventDefault();
            closeMenu();
          }
          break;
        case 'Tab':
          event.preventDefault();
          closeMenu();
          break;
      }
    }
  }), [open, placement, align, focusNext, focusPrevious, focusFirst, focusLast, selectItem, closeMenu, closeOnEscape]);

  // Item props generator
  const getItemProps = useCallback((item: DropdownMenuItem, index: number) => {
    const isFocused = focusedIndex === index;
    const role = item.role || 'menuitem';

    return {
      id: `menu-item-${item.id}`,
      role,
      'aria-disabled': item.disabled,
      'aria-checked': item.checked !== undefined ? item.checked : undefined,
      'data-focused': isFocused,
      'data-disabled': item.disabled,
      'data-checked': item.checked,
      'data-destructive': item.destructive,
      'data-has-submenu': item.hasSubmenu,
      tabIndex: isFocused ? 0 : -1,
      onClick: () => {
        if (!item.disabled) {
          item.onClick?.();
          if (closeOnSelect) {
            closeMenu();
          }
        }
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        if (item.disabled) return;

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          item.onClick?.();
          if (closeOnSelect) {
            closeMenu();
          }
        }
      },
      onMouseEnter: () => {
        if (!item.disabled) {
          setFocusedIndex(index);
        }
      }
    };
  }, [focusedIndex, closeOnSelect, closeMenu]);

  // Item label props
  const getItemLabelProps = useCallback((item: DropdownMenuItem, index: number) => ({
    'data-label': true,
    'data-focused': focusedIndex === index,
    'data-disabled': item.disabled
  }), [focusedIndex]);

  // Arrow props
  const arrowProps = useMemo(() => ({
    'data-arrow': true,
    'data-placement': placement
  }), [placement]);

  // Composed state
  const state = useMemo(() => composeState<UseDropdownMenuState>({
    open,
    focusedIndex,
    placement,
    isTriggerFocused
  }), [open, focusedIndex, placement, isTriggerFocused]);

  // Composed actions
  const actions = useMemo(() => ({
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusItem,
    selectItem
  }), [openMenu, closeMenu, toggleMenu, focusNext, focusPrevious, focusFirst, focusLast, focusItem, selectItem]);

  // Semantic attributes for trigger
  const triggerAttributes = useMemo(() => ({
    ...semantic,
    role: 'button',
    'aria-label': semantic['aria-label'] || 'Dropdown menu trigger',
    tabIndex: 0
  }), [semantic]);

  // Semantic attributes for menu
  const menuAttributes = useMemo(() => ({
    role: 'menu',
    'aria-label': semantic['aria-label'] || 'Dropdown menu options'
  }), [semantic]);

  return useMemo(() => ({
    state,
    actions,
    triggerAttributes,
    menuAttributes,
    triggerProps,
    menuProps,
    getItemProps,
    getItemLabelProps,
    arrowProps,
    triggerRef,
    menuRef
  }), [
    state,
    actions,
    triggerAttributes,
    menuAttributes,
    triggerProps,
    menuProps,
    getItemProps,
    getItemLabelProps,
    arrowProps,
    triggerRef,
    menuRef
  ]);
};