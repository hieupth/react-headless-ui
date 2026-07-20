/**
 * Flutter-inspired MegaMenu headless hook.
 * Provides comprehensive mega menu behavior with dropdown panels, keyboard navigation,
 * and accessibility support following Flutter patterns.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type {
  FocusableMixinProps,
  FocusableState,
  FocusableActions,
  PressableMixinProps,
  PressableState,
  PressableActions,
  SemanticMixinProps
} from '../mixins';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Properties for MegaMenu items
 */
export interface MegaMenuItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label for the item */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional description */
  description?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Panel content for mega menu dropdown */
  panel?: React.ReactNode;
  /** Child items for nested navigation */
  children?: MegaMenuItem[];
  /** Optional href for navigation */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Configuration for mega menu behavior
 */
export interface MegaMenuConfig {
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether to allow multiple panels open */
  allowMultipleOpen?: boolean;
  /** Delay before opening panel on hover (ms) */
  openDelay?: number;
  /** Delay before closing panel on hover leave (ms) */
  closeDelay?: number;
  /** Whether to use hover activation */
  hoverActivation?: boolean;
  /** Whether to animate panel transitions */
  animatePanels?: boolean;
}

/**
 * Props for useMegaMenu hook
 */
export interface UseMegaMenuProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Initial active item ID */
  initialActiveId?: string;
  /** Whether mega menu is disabled */
  disabled?: boolean;
  /** Menu items configuration */
  items: MegaMenuItem[];
  /** Mega menu behavior configuration */
  config?: MegaMenuConfig;
  /** Callback when active item changes */
  onActiveChange?: (activeId: string | null) => void;
  /** Callback when panel opens */
  onPanelOpen?: (itemId: string) => void;
  /** Callback when panel closes */
  onPanelClose?: (itemId: string) => void;
  /** Callback when item is selected */
  onItemSelect?: (item: MegaMenuItem) => void;
}

/**
 * State returned by useMegaMenu hook
 */
export interface MegaMenuState {
  /** Currently active item ID */
  activeItemId: string | null;
  /** Set of currently open panel IDs */
  openPanelIds: Set<string>;
  /** Focusable state */
  focusable: FocusableState;
  /** Pressable state */
  pressable: PressableState;
  /** Whether mega menu is disabled */
  disabled: boolean;
  /** Currently focused item index */
  focusedItemIndex: number;
  /** Items array */
  items: MegaMenuItem[];
}

/**
 * Actions returned by useMegaMenu hook
 */
export interface MegaMenuActions {
  /** Focus actions */
  focusable: FocusableActions;
  /** Press actions */
  pressable: PressableActions;
  /** Set active item by ID */
  setActiveItem: (itemId: string | null) => void;
  /** Open panel for item */
  openPanel: (itemId: string) => void;
  /** Close panel for item */
  closePanel: (itemId: string) => void;
  /** Toggle panel for item */
  togglePanel: (itemId: string) => void;
  /** Close all panels */
  closeAllPanels: () => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
  /** Navigate to first item */
  navigateFirst: () => void;
  /** Navigate to last item */
  navigateLast: () => void;
  /** Select current item */
  selectCurrentItem: () => void;
  /** Handle keyboard navigation */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle item click */
  handleItemClick: (item: MegaMenuItem) => void;
  /** Handle item hover */
  handleItemHover: (item: MegaMenuItem) => void;
  /** Handle outside click */
  handleOutsideClick: () => void;
}

/**
 * Return type for useMegaMenu hook
 */
export interface UseMegaMenuReturns {
  /** Current state */
  state: MegaMenuState;
  /** Available actions */
  actions: MegaMenuActions;
  /** Combined style for trigger elements */
  style: React.CSSProperties;
  /** Ref to root element */
  ref: React.RefCallback<HTMLElement>;
  /** Event handlers */
  eventHandlers: {
    onKeyDown: (event: React.KeyboardEvent) => void;
    onClick: (event: React.MouseEvent) => void;
    onMouseEnter: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
    onBlur: (event: React.FocusEvent) => void;
  };
}

/**
 * Flatten items for keyboard navigation
 */
function flattenItems(items: MegaMenuItem[]): MegaMenuItem[] {
  const flattened: MegaMenuItem[] = [];

  function traverse(items: MegaMenuItem[]) {
    for (const item of items) {
      flattened.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  }

  traverse(items);
  return flattened;
}

/**
 * Find item by ID in nested structure
 */
function findItemById(items: MegaMenuItem[], id: string): MegaMenuItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Flutter-inspired MegaMenu hook implementation.
 * Composes mixins to provide mega menu behavior with comprehensive keyboard navigation
 * and accessibility support.
 */
export function useMegaMenu(props: UseMegaMenuProps): UseMegaMenuReturns {
  const {
    initialActiveId = null,
    disabled = false,
    items = [],
    config = {},
    onActiveChange,
    onPanelOpen,
    onPanelClose,
    onItemSelect,
    ...mixinProps
  } = props;

  // Merge with default config
  const menuConfig = {
    closeOnEscape: true,
    closeOnOutsideClick: true,
    allowMultipleOpen: false,
    openDelay: 150,
    closeDelay: 300,
    hoverActivation: false,
    animatePanels: true,
    ...config
  };

  // Internal state
  const [activeItemId, setActiveItemId] = useState<string | null>(initialActiveId);
  const [openPanelIds, setOpenPanelIds] = useState<Set<string>>(new Set());
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);

  // Refs for timeouts and DOM
  const rootRef = useRef<HTMLElement | null>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compose mixins
  // useFocusableMixin returns a FLAT object; alias state/actions to it and
  // expose a ref-callback that wires the node into the mixin's focusRef.
  const _focusable = useFocusableMixin({
    disabled,
    ...mixinProps
  });
  const focusableState = _focusable;
  const focusableActions = _focusable;
  const focusableStyle: Record<string, any> = {};
  const focusableRef = (node: any) => {
    _focusable.focusRef.current = node;
  };

  // usePressableMixin returns a FLAT object (pressed, disabled, press, ...),
  // not a { state, actions, style } shape — alias accordingly.
  const _pressable = usePressableMixin({
    disabled,
    onPress: () => selectCurrentItem(),
    ...mixinProps
  });
  const pressableState = _pressable;
  const pressableActions = _pressable;
  const pressableStyle: Record<string, any> = {};

  const {
    style: semanticStyle
  } = useSemanticMixin({
    role: 'menubar',
    ...mixinProps
  });

  // Flatten items for navigation
  const flattenedItems = flattenItems(items);

  // Clear pending timeouts
  const clearPendingTimeouts = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Set active item
  const setActiveItem = useCallback((itemId: string | null) => {
    if (disabled) return;

    setActiveItemId(itemId);

    // Update focused index
    if (itemId) {
      const index = flattenedItems.findIndex(item => item.id === itemId);
      setFocusedItemIndex(index >= 0 ? index : -1);
    } else {
      setFocusedItemIndex(-1);
    }

    onActiveChange?.(itemId);
  }, [disabled, flattenedItems, onActiveChange]);

  // Open panel for item
  const openPanel = useCallback((itemId: string) => {
    if (disabled) return;

    clearPendingTimeouts();

    const item = findItemById(items, itemId);
    if (!item || !item.panel) return;

    setOpenPanelIds(prev => {
      const newSet = new Set(prev);
      if (!menuConfig.allowMultipleOpen) {
        newSet.clear();
      }
      newSet.add(itemId);
      return newSet;
    });

    onPanelOpen?.(itemId);
  }, [disabled, items, menuConfig.allowMultipleOpen, onPanelOpen, clearPendingTimeouts]);

  // Close panel for item
  const closePanel = useCallback((itemId: string) => {
    if (disabled) return;

    clearPendingTimeouts();

    setOpenPanelIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });

    onPanelClose?.(itemId);
  }, [disabled, onPanelClose, clearPendingTimeouts]);

  // Toggle panel for item
  const togglePanel = useCallback((itemId: string) => {
    if (openPanelIds.has(itemId)) {
      closePanel(itemId);
    } else {
      openPanel(itemId);
    }
  }, [openPanelIds, openPanel, closePanel]);

  // Close all panels
  const closeAllPanels = useCallback(() => {
    if (disabled) return;

    clearPendingTimeouts();
    setOpenPanelIds(new Set());
  }, [disabled, clearPendingTimeouts]);

  // Navigation actions
  const navigateNext = useCallback(() => {
    if (disabled || flattenedItems.length === 0) return;

    const nextIndex = focusedItemIndex < flattenedItems.length - 1 ? focusedItemIndex + 1 : 0;
    const nextItem = flattenedItems[nextIndex];
    setActiveItem(nextItem.id);
  }, [disabled, flattenedItems, focusedItemIndex, setActiveItem]);

  const navigatePrevious = useCallback(() => {
    if (disabled || flattenedItems.length === 0) return;

    const prevIndex = focusedItemIndex > 0 ? focusedItemIndex - 1 : flattenedItems.length - 1;
    const prevItem = flattenedItems[prevIndex];
    setActiveItem(prevItem.id);
  }, [disabled, flattenedItems, focusedItemIndex, setActiveItem]);

  const navigateFirst = useCallback(() => {
    if (disabled || flattenedItems.length === 0) return;

    const firstItem = flattenedItems[0];
    setActiveItem(firstItem.id);
  }, [disabled, flattenedItems, setActiveItem]);

  const navigateLast = useCallback(() => {
    if (disabled || flattenedItems.length === 0) return;

    const lastItem = flattenedItems[flattenedItems.length - 1];
    setActiveItem(lastItem.id);
  }, [disabled, flattenedItems, setActiveItem]);

  // Select current item
  const selectCurrentItem = useCallback(() => {
    if (disabled || !activeItemId) return;

    const item = findItemById(items, activeItemId);
    if (item && !item.disabled) {
      if (item.panel) {
        togglePanel(activeItemId);
      }

      if (item.onClick) {
        item.onClick();
      }

      onItemSelect?.(item);
    }
  }, [disabled, activeItemId, items, togglePanel, onItemSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        navigateNext();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        navigatePrevious();
        break;
      case 'Home':
        event.preventDefault();
        navigateFirst();
        break;
      case 'End':
        event.preventDefault();
        navigateLast();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectCurrentItem();
        break;
      case 'Escape':
        if (menuConfig.closeOnEscape) {
          event.preventDefault();
          closeAllPanels();
          setActiveItem(null);
        }
        break;
    }
  }, [disabled, navigateNext, navigatePrevious, navigateFirst, navigateLast, selectCurrentItem, menuConfig.closeOnEscape, closeAllPanels, setActiveItem]);

  // Handle item click
  const handleItemClick = useCallback((item: MegaMenuItem) => {
    if (disabled || item.disabled) return;

    setActiveItem(item.id);

    if (item.panel) {
      togglePanel(item.id);
    }

    if (item.onClick) {
      item.onClick();
    }

    onItemSelect?.(item);
  }, [disabled, setActiveItem, togglePanel, onItemSelect]);

  // Handle item hover
  const handleItemHover = useCallback((item: MegaMenuItem) => {
    if (disabled || !menuConfig.hoverActivation || item.disabled) return;

    clearPendingTimeouts();

    openTimeoutRef.current = setTimeout(() => {
      setActiveItem(item.id);
      if (item.panel) {
        openPanel(item.id);
      }
    }, menuConfig.openDelay);
  }, [disabled, menuConfig.hoverActivation, menuConfig.openDelay, clearPendingTimeouts, setActiveItem, openPanel]);

  // Handle outside click
  const handleOutsideClick = useCallback(() => {
    if (menuConfig.closeOnOutsideClick) {
      closeAllPanels();
      setActiveItem(null);
    }
  }, [menuConfig.closeOnOutsideClick, closeAllPanels, setActiveItem]);

  // Handle mouse leave for hover delay
  const handleMouseLeave = useCallback(() => {
    if (menuConfig.hoverActivation) {
      clearPendingTimeouts();

      closeTimeoutRef.current = setTimeout(() => {
        closeAllPanels();
      }, menuConfig.closeDelay);
    }
  }, [menuConfig.hoverActivation, menuConfig.closeDelay, clearPendingTimeouts, closeAllPanels]);

  // Setup outside click listener
  useEffect(() => {
    if (!menuConfig.closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        handleOutsideClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuConfig.closeOnOutsideClick, handleOutsideClick]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearPendingTimeouts();
    };
  }, [clearPendingTimeouts]);

  // Combined ref
  const ref = useCallback((node: HTMLElement) => {
    rootRef.current = node;
    focusableRef(node);
  }, [focusableRef]);

  // Combined styles
  const style = useMemo(() => ({
    ...focusableStyle,
    ...pressableStyle,
    ...semanticStyle
  }), [focusableStyle, pressableStyle, semanticStyle]);

  // State object
  const state: MegaMenuState = useMemo(() => ({
    activeItemId,
    openPanelIds,
    focusable: focusableState,
    pressable: pressableState,
    disabled,
    focusedItemIndex,
    items
  }), [activeItemId, openPanelIds, focusableState, pressableState, disabled, focusedItemIndex, items]);

  // Actions object
  const actions: MegaMenuActions = useMemo(() => ({
    focusable: focusableActions,
    pressable: pressableActions,
    setActiveItem,
    openPanel,
    closePanel,
    togglePanel,
    closeAllPanels,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    selectCurrentItem,
    handleKeyDown,
    handleItemClick,
    handleItemHover,
    handleOutsideClick
  }), [focusableActions, pressableActions, setActiveItem, openPanel, closePanel, togglePanel, closeAllPanels, navigateNext, navigatePrevious, navigateFirst, navigateLast, selectCurrentItem, handleKeyDown, handleItemClick, handleItemHover, handleOutsideClick]);

  // Event handlers
  const eventHandlers = useMemo(() => ({
    onKeyDown: handleKeyDown,
    onClick: pressableActions.press,
    onMouseEnter: (event: React.MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      const itemId = target.dataset.itemId;
      if (itemId) {
        const item = findItemById(items, itemId);
        if (item) {
          handleItemHover(item);
        }
      }
    },
    onMouseLeave: handleMouseLeave,
    onBlur: handleOutsideClick
  }), [handleKeyDown, pressableActions.press, items, handleItemHover, handleMouseLeave, handleOutsideClick]);

  return useMemo(() => ({
    state,
    actions,
    style,
    ref,
    eventHandlers
  }), [state, actions, style, ref, eventHandlers]);
}