/**
 * Menubar headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages menubar state with menu items and submenus.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Menu item interface
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Menu item label text */
  label: string;
  /** Whether menu item is disabled */
  disabled?: boolean;
  /** Menu item icon */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string;
  /** Menu item action handler */
  action?: () => void;
  /** Submenu items */
  children?: MenuItem[];
  /** Whether menu item is a separator */
  separator?: boolean;
  /** Additional menu item data */
  data?: any;
}

/**
 * Menu orientation options
 */
export type MenuOrientation = 'horizontal' | 'vertical';

/**
 * Menu variant options
 */
export type MenuVariant = 'menubar' | 'context-menu' | 'dropdown';

/**
 * Menubar state interface
 */
export interface MenubarState {
  /** Currently focused menu item ID */
  focusedItemId: string | null;
  /** Currently open submenu ID */
  openSubmenuId: string | null;
  /** Whether menubar is disabled */
  disabled: boolean;
  /** Current orientation */
  orientation: MenuOrientation;
  /** Current variant */
  variant: MenuVariant;
  /** Menu structure */
  items: MenuItem[];
  /** Current active menu path */
  activePath: string[];
  /** Whether menubar is open */
  isOpen: boolean;
}

/**
 * Menubar actions interface
 */
export interface MenubarActions {
  /** Focus a menu item */
  focusItem: (itemId: string) => void;
  /** Activate a menu item */
  activateItem: (itemId: string) => void;
  /** Open submenu */
  openSubmenu: (itemId: string) => void;
  /** Close submenu */
  closeSubmenu: () => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
  /** Navigate to first item */
  navigateFirst: () => void;
  /** Navigate to last item */
  navigateLast: () => void;
  /** Navigate into submenu */
  navigateInto: () => void;
  /** Navigate out of submenu */
  navigateOut: () => void;
  /** Open menubar */
  openMenubar: () => void;
  /** Close menubar */
  closeMenubar: () => void;
  /** Toggle menubar */
  toggleMenubar: () => void;
  /** Get menu item by ID */
  getItem: (itemId: string) => MenuItem | undefined;
  /** Get parent item */
  getParentItem: (itemId: string) => MenuItem | undefined;
  /** Get submenu items */
  getSubmenuItems: (itemId: string) => MenuItem[];
  /** Check if item has submenu */
  hasSubmenu: (itemId: string) => boolean;
  /** Check if item is active */
  isItemActive: (itemId: string) => boolean;
  /** Get current level */
  getCurrentLevel: () => number;
}

/**
 * Props for useMenubar hook
 */
export interface UseMenubarProps {
  /** Menu items structure */
  items: MenuItem[];
  /** Orientation of the menubar */
  orientation?: MenuOrientation;
  /** Variant of the menu */
  variant?: MenuVariant;
  /** Whether menubar is disabled */
  disabled?: boolean;
  /** Initially focused item ID */
  defaultFocusedItemId?: string;
  /** Whether menubar is initially open */
  defaultOpen?: boolean;
  /** Callback when item is activated */
  onItemActivate?: (item: MenuItem) => void;
  /** Callback when submenu opens */
  onSubmenuOpen?: (itemId: string) => void;
  /** Callback when submenu closes */
  onSubmenuClose?: () => void;
  /** Callback when menubar opens */
  onMenubarOpen?: () => void;
  /** Callback when menubar closes */
  onMenubarClose?: () => void;
  /** Ref to the menubar element */
  menubarRef?: React.RefObject<HTMLElement>;
}

/**
 * Return type for useMenubar hook
 */
export interface UseMenubarReturns {
  /** Current menubar state */
  state: MenubarState;
  /** Menubar actions */
  actions: MenubarActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label': string;
    'aria-orientation': 'horizontal' | 'vertical';
    'role': string;
    'tabIndex': number;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Menubar hook implementation
 * @param props - Menubar configuration props
 * @returns Menubar state, actions, and attributes
 */
export function useMenubar(props: UseMenubarProps): UseMenubarReturns {
  const {
    items,
    orientation = 'horizontal',
    variant = 'menubar',
    disabled = false,
    defaultFocusedItemId,
    defaultOpen = false,
    onItemActivate,
    onSubmenuOpen,
    onSubmenuClose,
    onMenubarOpen,
    onMenubarClose,
    menubarRef
  } = props;

  // State management
  const [focusedItemId, setFocusedItemId] = useState<string | null>(defaultFocusedItemId || null);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string[]>([]);

  // Determine if menubar is open
  const isOpen = variant === 'menubar' ? true : defaultOpen;

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const menubarElementRef = menubarRef || internalRef;

  // Helper function to find item by ID recursively
  function findItemById(items: MenuItem[], id: string): MenuItem | undefined {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Helper function to find parent item
  function findParentItem(items: MenuItem[], itemId: string, parent: MenuItem | null = null): MenuItem | undefined {
    for (const item of items) {
      if (item.id === itemId) return parent;
      if (item.children) {
        const found = findParentItem(item.children, itemId, item);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Helper function to get items at current level
  function getItemsAtLevel(path: string[]): MenuItem[] {
    if (path.length === 0) return items;

    let currentItems = items;
    for (const itemId of path) {
      const item = findItemById(currentItems, itemId);
      if (item && item.children) {
        currentItems = item.children;
      } else {
        return [];
      }
    }
    return currentItems;
  }

  // Helper function to get next item in current level
  function getNextItem(currentItems: MenuItem[], currentId: string): MenuItem | null {
    const index = currentItems.findIndex(item => item.id === currentId);
    if (index === -1) return null;

    for (let i = index + 1; i < currentItems.length; i++) {
      const item = currentItems[i];
      if (!item.disabled && !item.separator) {
        return item;
      }
    }
    return null;
  }

  // Helper function to get previous item in current level
  function getPreviousItem(currentItems: MenuItem[], currentId: string): MenuItem | null {
    const index = currentItems.findIndex(item => item.id === currentId);
    if (index === -1) return null;

    for (let i = index - 1; i >= 0; i--) {
      const item = currentItems[i];
      if (!item.disabled && !item.separator) {
        return item;
      }
    }
    return null;
  }

  // Focus actions
  const focusItem = useCallback((itemId: string) => {
    if (disabled) return;

    const item = findItemById(items, itemId);
    if (item && !item.disabled) {
      setFocusedItemId(itemId);
    }
  }, [disabled, items]);

  const activateItem = useCallback((itemId: string) => {
    if (disabled) return;

    const item = findItemById(items, itemId);
    if (item && !item.disabled) {
      // Close current submenu if opening new one
      if (openSubmenuId && openSubmenuId !== itemId) {
        setOpenSubmenuId(null);
        onSubmenuClose?.();
      }

      // If item has children, open submenu
      if (item.children && item.children.length > 0) {
        setOpenSubmenuId(itemId);
        setActivePath([...activePath, itemId]);
        onSubmenuOpen?.(itemId);
      } else {
        // Execute item action
        if (item.action) {
          item.action();
        }
        onItemActivate?.(item);

        // Close menubar if not menubar variant
        if (variant !== 'menubar') {
          setOpenSubmenuId(null);
          setActivePath([]);
        }
      }

      setFocusedItemId(itemId);
    }
  }, [disabled, items, openSubmenuId, activePath, onItemActivate, onSubmenuOpen, onSubmenuClose, variant]);

  // Submenu actions
  const openSubmenu = useCallback((itemId: string) => {
    if (disabled) return;

    const item = findItemById(items, itemId);
    if (item && item.children && item.children.length > 0) {
      setOpenSubmenuId(itemId);
      setActivePath([...activePath, itemId]);
      onSubmenuOpen?.(itemId);
    }
  }, [disabled, items, activePath, onSubmenuOpen]);

  const closeSubmenu = useCallback(() => {
    if (disabled) return;

    setOpenSubmenuId(null);
    setActivePath(activePath.slice(0, -1));
    onSubmenuClose?.();
  }, [disabled, activePath, onSubmenuClose]);

  // Navigation actions
  const navigateNext = useCallback(() => {
    if (disabled) return;

    const currentItems = getItemsAtLevel(activePath);
    if (currentItems.length === 0) return;

    const nextItem = getNextItem(currentItems, focusedItemId || '');
    if (nextItem) {
      focusItem(nextItem.id);
    }
  }, [disabled, activePath, focusedItemId, focusItem]);

  const navigatePrevious = useCallback(() => {
    if (disabled) return;

    const currentItems = getItemsAtLevel(activePath);
    if (currentItems.length === 0) return;

    const prevItem = getPreviousItem(currentItems, focusedItemId || '');
    if (prevItem) {
      focusItem(prevItem.id);
    }
  }, [disabled, activePath, focusedItemId, focusItem]);

  const navigateFirst = useCallback(() => {
    if (disabled) return;

    const currentItems = getItemsAtLevel(activePath);
    if (currentItems.length === 0) return;

    const firstItem = currentItems.find(item => !item.disabled && !item.separator);
    if (firstItem) {
      focusItem(firstItem.id);
    }
  }, [disabled, activePath, focusItem]);

  const navigateLast = useCallback(() => {
    if (disabled) return;

    const currentItems = getItemsAtLevel(activePath);
    if (currentItems.length === 0) return;

    for (let i = currentItems.length - 1; i >= 0; i--) {
      const item = currentItems[i];
      if (!item.disabled && !item.separator) {
        focusItem(item.id);
        break;
      }
    }
  }, [disabled, activePath, focusItem]);

  const navigateInto = useCallback(() => {
    if (disabled) return;

    if (focusedItemId && hasSubmenu(focusedItemId)) {
      openSubmenu(focusedItemId);
      navigateFirst();
    }
  }, [disabled, focusedItemId, openSubmenu, navigateFirst]);

  const navigateOut = useCallback(() => {
    if (disabled) return;

    if (activePath.length > 0) {
      const parentId = activePath[activePath.length - 1];
      setFocusedItemId(parentId);
      setActivePath(activePath.slice(0, -1));
      setOpenSubmenuId(null);
    }
  }, [disabled, activePath]);

  // Menubar control actions
  const openMenubar = useCallback(() => {
    if (disabled) return;
    onMenubarOpen?.();
  }, [disabled, onMenubarOpen]);

  const closeMenubar = useCallback(() => {
    if (disabled) return;

    setOpenSubmenuId(null);
    setActivePath([]);
    setFocusedItemId(null);
    onMenubarClose?.();
  }, [disabled, onMenubarClose]);

  const toggleMenubar = useCallback(() => {
    if (disabled) return;

    if (isOpen) {
      closeMenubar();
    } else {
      openMenubar();
    }
  }, [disabled, isOpen, openMenubar, closeMenubar]);

  // Query functions
  const getItem = useCallback((itemId: string): MenuItem | undefined => {
    return findItemById(items, itemId);
  }, [items]);

  const getParentItem = useCallback((itemId: string): MenuItem | undefined => {
    return findParentItem(items, itemId);
  }, [items]);

  const getSubmenuItems = useCallback((itemId: string): MenuItem[] => {
    const item = findItemById(items, itemId);
    return item?.children || [];
  }, [items]);

  const hasSubmenu = useCallback((itemId: string): boolean => {
    const item = findItemById(items, itemId);
    return !!(item?.children && item.children.length > 0);
  }, [items]);

  const isItemActive = useCallback((itemId: string): boolean => {
    return activePath.includes(itemId);
  }, [activePath]);

  const getCurrentLevel = useCallback((): number => {
    return activePath.length;
  }, [activePath]);

  // Build state
  const state: MenubarState = {
    focusedItemId,
    openSubmenuId,
    disabled,
    orientation,
    variant,
    items,
    activePath,
    isOpen
  };

  // Build actions
  const actions: MenubarActions = {
    focusItem,
    activateItem,
    openSubmenu,
    closeSubmenu,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast,
    navigateInto,
    navigateOut,
    openMenubar,
    closeMenubar,
    toggleMenubar,
    getItem,
    getParentItem,
    getSubmenuItems,
    hasSubmenu,
    isItemActive,
    getCurrentLevel
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: menubarElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: menubarElementRef
  });

  const semantic = useSemanticMixin({
    role: 'menubar',
    ariaLabel: 'Application menu',
    ariaOrientation: orientation,
    ref: menubarElementRef
  });

  // Build attributes
  const attributes = {
    'aria-label': semantic.ariaLabel,
    'aria-orientation': semantic.ariaOrientation,
    'role': semantic.role,
    'tabIndex': disabled ? -1 : 0
  };

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if (orientation === 'horizontal') {
            navigateNext();
          } else {
            navigateInto();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (orientation === 'horizontal') {
            navigatePrevious();
          } else {
            navigateOut();
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (orientation === 'horizontal') {
            navigateInto();
          } else {
            navigateNext();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (orientation === 'horizontal') {
            navigateOut();
          } else {
            navigatePrevious();
          }
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
          if (focusedItemId) {
            activateItem(focusedItemId);
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (openSubmenuId) {
            closeSubmenu();
          } else {
            closeMenubar();
          }
          break;
      }
    };

    const element = menubarElementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [disabled, orientation, focusedItemId, openSubmenuId, navigateNext, navigatePrevious, navigateFirst, navigateLast, navigateInto, navigateOut, activateItem, closeSubmenu, closeMenubar]);

  return {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  };
}