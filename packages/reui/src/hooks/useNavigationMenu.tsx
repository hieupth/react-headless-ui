/**
 * NavigationMenu headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages complex navigation with dropdowns, mega menus, and nested items.
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Navigation menu item interface
 */
export interface NavigationMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Menu item label or title */
  label: string;
  /** Menu item description */
  description?: string;
  /** Menu item icon */
  icon?: React.ReactNode;
  /** Menu item href for navigation */
  href?: string;
  /** Whether menu item is disabled */
  disabled?: boolean;
  /** Whether menu item is active */
  active?: boolean;
  /** Menu item badge */
  badge?: string | number;
  /** Submenu items */
  children?: NavigationMenuItem[];
  /** Menu item action */
  action?: () => void;
  /** Menu item variant */
  variant?: 'default' | 'primary' | 'secondary';
  /** Menu item type */
  type?: 'item' | 'separator' | 'header' | 'back';
  /** Additional menu item data */
  data?: any;
}

/**
 * Navigation menu position options
 */
export type NavigationMenuPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Navigation menu variant options
 */
export type NavigationMenuVariant = 'horizontal' | 'vertical' | 'mega' | 'dropdown';

/**
 * Navigation menu state interface
 */
export interface NavigationMenuState {
  /** Currently active menu ID */
  activeMenuId: string | null;
  /** Currently focused menu item ID */
  focusedItemId: string | null;
  /** Currently open dropdown ID */
  openDropdownId: string | null;
  /** Whether navigation menu is disabled */
  disabled: boolean;
  /** Current position */
  position: NavigationMenuPosition;
  /** Current variant */
  variant: NavigationMenuVariant;
  /** Menu structure */
  items: NavigationMenuItem[];
  /** Current hover path */
  hoverPath: string[];
  /** Mobile menu state */
  isMobileMenuOpen: boolean;
  /** Search query for mega menu */
  searchQuery: string;
  /** Whether the viewport is mobile-sized */
  isMobile: boolean;
}

/**
 * Navigation menu actions interface
 */
export interface NavigationMenuActions {
  /** Focus a menu item */
  focusItem: (itemId: string) => void;
  /** Activate a menu item */
  activateItem: (itemId: string) => void;
  /** Hover over a menu item */
  hoverItem: (itemId: string) => void;
  /** Leave menu item */
  leaveItem: () => void;
  /** Open dropdown */
  openDropdown: (itemId: string) => void;
  /** Close dropdown */
  closeDropdown: () => void;
  /** Toggle mobile menu */
  toggleMobileMenu: () => void;
  /** Open mobile menu */
  openMobileMenu: () => void;
  /** Close mobile menu */
  closeMobileMenu: () => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
  /** Get menu item by ID */
  getItem: (itemId: string) => NavigationMenuItem | undefined;
  /** Get parent item */
  getParentItem: (itemId: string) => NavigationMenuItem | null;
  /** Get submenu items */
  getSubmenuItems: (itemId: string) => NavigationMenuItem[];
  /** Check if item has submenu */
  hasSubmenu: (itemId: string) => boolean;
  /** Check if item is active */
  isItemActive: (itemId: string) => boolean;
  /** Get items at current level */
  getItemsAtLevel: (path: string[]) => NavigationMenuItem[];
  /** Filter items by search */
  filterItems: (items: NavigationMenuItem[], query: string) => NavigationMenuItem[];
}

/**
 * Props for useNavigationMenu hook
 */
export interface UseNavigationMenuProps {
  /** Menu items structure */
  items: NavigationMenuItem[];
  /** Position of the navigation menu */
  position?: NavigationMenuPosition;
  /** Variant of the navigation menu */
  variant?: NavigationMenuVariant;
  /** Whether navigation menu is disabled */
  disabled?: boolean;
  /** Breakpoint for mobile behavior */
  mobileBreakpoint?: number;
  /** Initially active menu ID */
  defaultActiveItemId?: string;
  /** Whether to enable search in mega menu */
  enableSearch?: boolean;
  /** Whether to auto-close dropdowns on blur */
  autoCloseDropdowns?: boolean;
  /** Callback when item is activated */
  onItemActivate?: (item: NavigationMenuItem) => void;
  /** Callback when dropdown opens */
  onDropdownOpen?: (itemId: string) => void;
  /** Callback when dropdown closes */
  onDropdownClose?: () => void;
  /** Callback when mobile menu opens */
  onMobileMenuOpen?: () => void;
  /** Callback when mobile menu closes */
  onMobileMenuClose?: () => void;
  /** Ref to the navigation menu element */
  navigationMenuRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Return type for useNavigationMenu hook
 */
export interface UseNavigationMenuReturns {
  /** Current navigation menu state */
  state: NavigationMenuState;
  /** Navigation menu actions */
  actions: NavigationMenuActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label': string;
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
 * Navigation menu hook implementation
 * @param props - Navigation menu configuration props
 * @returns Navigation menu state, actions, and attributes
 */
export function useNavigationMenu(props: UseNavigationMenuProps): UseNavigationMenuReturns {
  const {
    items,
    position = 'top',
    variant = 'horizontal',
    disabled = false,
    mobileBreakpoint = 768,
    defaultActiveItemId,
    enableSearch = false,
    autoCloseDropdowns = true,
    onItemActivate,
    onDropdownOpen,
    onDropdownClose,
    onMobileMenuOpen,
    onMobileMenuClose,
    navigationMenuRef
  } = props;

  // State management
  const [activeMenuId, setActiveMenuId] = useState<string | null>(defaultActiveItemId || null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [hoverPath, setHoverPath] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const navigationMenuElementRef = navigationMenuRef || internalRef;

  // Check mobile status
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < mobileBreakpoint;
      setIsMobile(mobile);

      // Close mobile menu when switching to desktop
      if (!mobile && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint, isMobileMenuOpen]);

  // Helper function to find item by ID recursively
  function findItemById(items: NavigationMenuItem[], id: string): NavigationMenuItem | undefined {
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
  function findParentItem(items: NavigationMenuItem[], itemId: string, parent: NavigationMenuItem | null = null): NavigationMenuItem | null {
    for (const item of items) {
      if (item.id === itemId) return parent;
      if (item.children) {
        const found = findParentItem(item.children, itemId, item);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper function to get items at current level
  function getItemsAtLevel(path: string[]): NavigationMenuItem[] {
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

  // Helper function to filter items by search query
  function filterItems(items: NavigationMenuItem[], query: string): NavigationMenuItem[] {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(item => {
      // Search in label and description
      const matchesSearch = item.label.toLowerCase().includes(lowerQuery) ||
                          (item.description && item.description.toLowerCase().includes(lowerQuery));

      // Recursively search in children
      const hasMatchingChildren = item.children && item.children.length > 0 &&
        filterItems(item.children, query).length > 0;

      return matchesSearch || hasMatchingChildren;
    }).map(item => ({
      ...item,
      children: item.children ? filterItems(item.children, query) : undefined
    }));
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
      // Set active menu
      setActiveMenuId(itemId);

      // Close current dropdown if opening new one
      if (openDropdownId && openDropdownId !== itemId) {
        setOpenDropdownId(null);
        onDropdownClose?.();
      }

      // If item has children, open dropdown
      if (item.children && item.children.length > 0) {
        setOpenDropdownId(itemId);
        setHoverPath([...hoverPath, itemId]);
        onDropdownOpen?.(itemId);
      } else {
        // Execute item action or navigation
        if (item.action) {
          item.action();
        }
        onItemActivate?.(item);

        // Close dropdown if enabled
        if (autoCloseDropdowns) {
          setOpenDropdownId(null);
          setHoverPath([]);
        }
      }

      setFocusedItemId(itemId);
    }
  }, [disabled, items, openDropdownId, hoverPath, onItemActivate, onDropdownOpen, onDropdownClose, autoCloseDropdowns]);

  // Hover actions
  const hoverItem = useCallback((itemId: string) => {
    if (disabled) return;

    const item = findItemById(items, itemId);
    if (item && !item.disabled) {
      setHoverPath([...hoverPath, itemId]);
    }
  }, [disabled, items, hoverPath]);

  const leaveItem = useCallback(() => {
    if (disabled) return;

    // Clear hover path when mouse leaves
    setHoverPath([]);
  }, [disabled]);

  // Dropdown actions
  const openDropdown = useCallback((itemId: string) => {
    if (disabled) return;

    const item = findItemById(items, itemId);
    if (item && item.children && item.children.length > 0) {
      setOpenDropdownId(itemId);
      setHoverPath([...hoverPath, itemId]);
      onDropdownOpen?.(itemId);
    }
  }, [disabled, items, hoverPath, onDropdownOpen]);

  const closeDropdown = useCallback(() => {
    if (disabled) return;

    setOpenDropdownId(null);
    setHoverPath([]);
    onDropdownClose?.();
  }, [disabled, onDropdownClose]);

  // Mobile menu actions
  const toggleMobileMenu = useCallback(() => {
    if (disabled) return;

    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [disabled, isMobileMenuOpen]);

  const openMobileMenu = useCallback(() => {
    if (disabled) return;

    setIsMobileMenuOpen(true);
    onMobileMenuOpen?.();
  }, [disabled, onMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    if (disabled) return;

    setIsMobileMenuOpen(false);
    setActiveMenuId(null);
    setOpenDropdownId(null);
    setHoverPath([]);
    onMobileMenuClose?.();
  }, [disabled, onMobileMenuClose]);

  // Search actions
  const setSearchQueryAction = useCallback((query: string) => {
    if (disabled) return;

    setSearchQuery(query);
  }, [disabled]);

  // Navigation actions
  const navigateNext = useCallback(() => {
    if (disabled) return;

    const currentItems = filterItems(getItemsAtLevel(hoverPath), searchQuery);
    if (currentItems.length === 0) return;

    const currentIndex = currentItems.findIndex(item => item.id === focusedItemId);
    let nextIndex = currentIndex < currentItems.length - 1 ? currentIndex + 1 : 0;

    let nextItem: NavigationMenuItem | null = currentItems[nextIndex];
    // Skip disabled items and separators
    while (nextItem && (nextItem.disabled || nextItem.type === 'separator')) {
      nextIndex = nextIndex < currentItems.length - 1 ? nextIndex + 1 : 0;
      // nextIndex is always 0..length-1 (clamped above), so it always indexes a valid item.
      nextItem = currentItems[nextIndex];
    }

    // nextItem is always a valid enabled item here (the skip loop above exits
    // only on an enabled non-separator, and the empty-items case returned early).
    focusItem(nextItem!.id);
  }, [disabled, focusedItemId, hoverPath, searchQuery, focusItem]);

  const navigatePrevious = useCallback(() => {
    if (disabled) return;

    const currentItems = filterItems(getItemsAtLevel(hoverPath), searchQuery);
    if (currentItems.length === 0) return;

    const currentIndex = currentItems.findIndex(item => item.id === focusedItemId);
    let prevIndex = currentIndex > 0 ? currentIndex - 1 : currentItems.length - 1;

    let prevItem: NavigationMenuItem | null = currentItems[prevIndex];
    // Skip disabled items and separators
    while (prevItem && (prevItem.disabled || prevItem.type === 'separator')) {
      prevIndex = prevIndex > 0 ? prevIndex - 1 : currentItems.length - 1;
      // prevIndex is always >= 0 (clamped above), so it always indexes a valid item.
      prevItem = currentItems[prevIndex];
    }

    // prevItem is always a valid enabled item here (the skip loop above exits
    // only on an enabled non-separator, and the empty-items case returned early).
    focusItem(prevItem!.id);
  }, [disabled, focusedItemId, hoverPath, searchQuery, focusItem]);

  // Query functions
  const getItem = useCallback((itemId: string): NavigationMenuItem | undefined => {
    return findItemById(items, itemId);
  }, [items]);

  const getParentItem = useCallback((itemId: string): NavigationMenuItem | null => {
    return findParentItem(items, itemId);
  }, [items]);

  const getSubmenuItems = useCallback((itemId: string): NavigationMenuItem[] => {
    const item = findItemById(items, itemId);
    return item?.children || [];
  }, [items]);

  const hasSubmenu = useCallback((itemId: string): boolean => {
    const item = findItemById(items, itemId);
    return !!(item?.children && item.children.length > 0);
  }, [items]);

  const isItemActive = useCallback((itemId: string): boolean => {
    return activeMenuId === itemId;
  }, [activeMenuId]);

  const getItemsAtLevelAction = useCallback((path: string[]): NavigationMenuItem[] => {
    return getItemsAtLevel(path);
  }, [getItemsAtLevel]);

  const filterItemsAction = useCallback((items: NavigationMenuItem[], query: string): NavigationMenuItem[] => {
    return filterItems(items, query);
  }, [filterItems]);

  // Build state
  const state: NavigationMenuState = {
    activeMenuId,
    focusedItemId,
    openDropdownId,
    disabled,
    position,
    variant,
    items,
    hoverPath,
    isMobileMenuOpen,
    searchQuery,
    isMobile
  };

  // Build actions
  const actions: NavigationMenuActions = {
    focusItem,
    activateItem,
    hoverItem,
    leaveItem,
    openDropdown,
    closeDropdown,
    toggleMobileMenu,
    openMobileMenu,
    closeMobileMenu,
    setSearchQuery: setSearchQueryAction,
    navigateNext,
    navigatePrevious,
    getItem,
    getParentItem,
    getSubmenuItems,
    hasSubmenu,
    isItemActive,
    getItemsAtLevel: getItemsAtLevelAction,
    filterItems: filterItemsAction
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: navigationMenuElementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: navigationMenuElementRef
  });

  const semantic = useSemanticMixin({
    role: 'navigation',
    ariaLabel: 'Main navigation',
    ref: navigationMenuElementRef
  });

  // Build attributes
  const attributes = {
    'aria-label': semantic.ariaLabel,
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
          navigateNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigatePrevious();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (focusedItemId && hasSubmenu(focusedItemId)) {
            openDropdown(focusedItemId);
          } else {
            navigateNext();
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          navigatePrevious();
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
          if (openDropdownId) {
            closeDropdown();
          } else if (isMobileMenuOpen) {
            closeMobileMenu();
          }
          break;
      }
    };

    const element = navigationMenuElementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [disabled, focusedItemId, openDropdownId, isMobileMenuOpen, navigateNext, navigatePrevious, activateItem, openDropdown, closeDropdown, closeMobileMenu, hasSubmenu]);

  return useMemo(() => ({
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  }), [state, actions, attributes, focusable, pressable, semantic]);
}