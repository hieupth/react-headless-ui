/**
 * Accordion Menu headless hook following Flutter expansion patterns.
 * Provides menu behavior with accordion-style expandable sections.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useSemanticMixin, useFocusableMixin } from '../mixins';
import { composeState } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps } from '../mixins';

export interface AccordionMenuItem {
  /** Unique identifier for the item */
  id: string;
  /** Item label or content */
  label: React.ReactNode;
  /** Item icon */
  icon?: React.ReactNode;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Optional badge for the item */
  badge?: React.ReactNode;
  /** Action handler */
  onClick?: () => void;
  /** Child items for submenu */
  children?: AccordionMenuItem[];
}

export interface UseAccordionMenuProps extends
  SemanticMixinProps,
  FocusableMixinProps {
  /** Menu items */
  items: AccordionMenuItem[];
  /** Whether only one section can be open at a time */
  exclusive?: boolean;
  /** Initially opened item IDs */
  defaultOpenItems?: string[];
  /** Controlled open item IDs */
  openItems?: string[];
  /** Called when open items change */
  onOpenChange?: (openItems: string[]) => void;
  /** Whether items can be nested */
  allowNested?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Maximum nesting depth */
  maxDepth?: number;
}

export interface UseAccordionMenuState {
  /** Currently open item IDs */
  openItems: Set<string>;
  /** Total number of items */
  totalItems: number;
  /** Currently focused item ID */
  focusedItemId: string | null;
  /** Current nesting depth */
  currentDepth: number;
}

export interface UseAccordionMenuActions {
  /** Toggle item expansion */
  toggleItem: (itemId: string) => void;
  /** Open item */
  openItem: (itemId: string) => void;
  /** Close item */
  closeItem: (itemId: string) => void;
  /** Open all items */
  openAll: () => void;
  /** Close all items */
  closeAll: () => void;
  /** Focus item */
  focusItem: (itemId: string) => void;
  /** Check if item is open */
  isItemOpen: (itemId: string) => boolean;
  /** Check if item has children */
  hasChildren: (itemId: string) => boolean;
  /** Get children of item */
  getItemChildren: (itemId: string) => AccordionMenuItem[];
  /** Get depth of item */
  getItemDepth: (itemId: string) => number;
}

export interface UseAccordionMenuReturns {
  /** Component state */
  state: UseAccordionMenuState;
  /** Component actions */
  actions: UseAccordionMenuActions;
  /** Semantic attributes for the menu container */
  semanticAttributes: Record<string, any>;
  /** Props for the menu container */
  menuProps: Record<string, any>;
  /** Props generator for menu items */
  getItemProps: (item: AccordionMenuItem, depth?: number) => Record<string, any>;
  /** Props generator for item headers (clickable area) */
  getItemHeaderProps: (item: AccordionMenuItem, depth?: number) => Record<string, any>;
  /** Props generator for item content */
  getItemContentProps: (item: AccordionMenuItem, depth?: number) => Record<string, any>;
  /** Ref for the menu container */
  menuRef: React.RefObject<HTMLDivElement>;
}

/**
 * Headless accordion menu hook providing menu behavior with expandable sections.
 * Supports nested menus, exclusive mode, and keyboard navigation.
 */
export const useAccordionMenu = (props: UseAccordionMenuProps) => {
  const {
    items = [],
    exclusive = false,
    defaultOpenItems = [],
    openItems: controlledOpenItems,
    onOpenChange,
    allowNested = true,
    animationDuration = 200,
    maxDepth = 3,
    ...semanticProps
  } = props;

  // Internal state
  const [internalOpenItems, setInternalOpenItems] = useState<Set<string>>(
    new Set(defaultOpenItems)
  );
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledOpenItems !== undefined;
  const openItemsSet = isControlled
    ? new Set(controlledOpenItems || [])
    : internalOpenItems;

  // Semantic attributes
  const semantic = useSemanticMixin({
    role: 'menu',
    ...semanticProps
  });

  // Flatten items for easier management
  const flattenItems = useCallback((
    items: AccordionMenuItem[],
    depth = 0,
    parentId?: string
  ): Array<AccordionMenuItem & { depth: number; parentId?: string }> => {
    const result: Array<AccordionMenuItem & { depth: number; parentId?: string }> = [];

    for (const item of items) {
      result.push({ ...item, depth, parentId });

      if (item.children && allowNested && depth < maxDepth - 1) {
        result.push(...flattenItems(item.children, depth + 1, item.id));
      }
    }

    return result;
  }, [allowNested, maxDepth]);

  const flatItems = useMemo(() => flattenItems(items), [items, flattenItems]);

  // Handle open items change
  const handleOpenItemsChange = useCallback((newOpenItems: Set<string>) => {
    if (!isControlled) {
      setInternalOpenItems(newOpenItems);
    }
    onOpenChange?.(Array.from(newOpenItems));
  }, [isControlled, onOpenChange]);

  // Toggle item expansion
  const toggleItem = useCallback((itemId: string) => {
    const newOpenItems = new Set(openItemsSet);

    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);

      // In exclusive mode, only one item can be open
      if (exclusive) {
        newOpenItems.clear();
      }
    } else {
      if (exclusive) {
        newOpenItems.clear();
      }
      newOpenItems.add(itemId);
    }

    handleOpenItemsChange(newOpenItems);
  }, [openItemsSet, exclusive, handleOpenItemsChange]);

  // Open specific item
  const openItem = useCallback((itemId: string) => {
    const newOpenItems = new Set(openItemsSet);

    if (exclusive) {
      newOpenItems.clear();
    }
    newOpenItems.add(itemId);

    handleOpenItemsChange(newOpenItems);
  }, [openItemsSet, exclusive, handleOpenItemsChange]);

  // Close specific item
  const closeItem = useCallback((itemId: string) => {
    const newOpenItems = new Set(openItemsSet);
    newOpenItems.delete(itemId);
    handleOpenItemsChange(newOpenItems);
  }, [openItemsSet, handleOpenItemsChange]);

  // Open all items
  const openAll = useCallback(() => {
    if (exclusive) return;

    const allItemIds = flatItems.map(item => item.id);
    handleOpenItemsChange(new Set(allItemIds));
  }, [exclusive, flatItems, handleOpenItemsChange]);

  // Close all items
  const closeAll = useCallback(() => {
    handleOpenItemsChange(new Set());
  }, [handleOpenItemsChange]);

  // Focus item
  const focusItem = useCallback((itemId: string) => {
    setFocusedItemId(itemId);
  }, []);

  // Check if item is open
  const isItemOpen = useCallback((itemId: string) => {
    return openItemsSet.has(itemId);
  }, [openItemsSet]);

  // Check if item has children
  const hasChildren = useCallback((itemId: string) => {
    const item = flatItems.find(flatItem => flatItem.id === itemId);
    return Boolean(item?.children && item.children.length > 0);
  }, [flatItems]);

  // Get children of item
  const getItemChildren = useCallback((itemId: string) => {
    const item = flatItems.find(flatItem => flatItem.id === itemId);
    return item?.children || [];
  }, [flatItems]);

  // Get depth of item
  const getItemDepth = useCallback((itemId: string) => {
    const item = flatItems.find(flatItem => flatItem.id === itemId);
    return item?.depth || 0;
  }, [flatItems]);

  // Menu props
  const menuProps = useMemo(() => ({
    ref: menuRef,
    role: 'menu',
    'aria-orientation': 'vertical',
    onKeyDown: (event: React.KeyboardEvent) => {
      const focusedItem = focusedItemId ? flatItems.find(item => item.id === focusedItemId) : null;
      const currentIndex = focusedItem ? flatItems.indexOf(focusedItem) : -1;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < flatItems.length - 1) {
            focusItem(flatItems[currentIndex + 1].id);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            focusItem(flatItems[currentIndex - 1].id);
          }
          break;
        case 'Home':
          event.preventDefault();
          if (flatItems.length > 0) {
            focusItem(flatItems[0].id);
          }
          break;
        case 'End':
          event.preventDefault();
          if (flatItems.length > 0) {
            focusItem(flatItems[flatItems.length - 1].id);
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedItem && !focusedItem.disabled) {
            if (hasChildren(focusedItem.id)) {
              toggleItem(focusedItem.id);
            } else {
              focusedItem.onClick?.();
            }
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (focusedItem && hasChildren(focusedItem.id) && !isItemOpen(focusedItem.id)) {
            openItem(focusedItem.id);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (focusedItem && hasChildren(focusedItem.id) && isItemOpen(focusedItem.id)) {
            closeItem(focusedItem.id);
          }
          break;
      }
    }
  }), [flatItems, focusedItemId, hasChildren, isItemOpen, toggleItem, openItem, closeItem]);

  // Item props generator
  const getItemProps = useCallback((item: AccordionMenuItem, depth = 0) => {
    const isOpen = isItemOpen(item.id);
    const hasChildItems = hasChildren(item.id);
    const isFocused = focusedItemId === item.id;

    return {
      id: item.id,
      role: 'menuitem',
      'aria-expanded': hasChildItems ? isOpen : undefined,
      'aria-haspopup': hasChildItems ? 'menu' : undefined,
      'aria-disabled': item.disabled,
      'data-open': isOpen,
      'data-disabled': item.disabled,
      'data-focused': isFocused,
      'data-depth': depth,
      'data-has-children': hasChildItems,
      tabIndex: isFocused ? 0 : -1
    };
  }, [isItemOpen, hasChildren, focusedItemId]);

  // Item header props generator
  const getItemHeaderProps = useCallback((item: AccordionMenuItem, depth = 0) => {
    const hasChildItems = hasChildren(item.id);
    const isOpen = isItemOpen(item.id);

    return {
      role: 'button',
      'aria-expanded': hasChildItems ? isOpen : undefined,
      'aria-controls': hasChildItems ? `accordion-content-${item.id}` : undefined,
      'data-header': true,
      'data-depth': depth,
      'data-has-children': hasChildItems,
      disabled: item.disabled,
      onClick: () => {
        if (!item.disabled) {
          if (hasChildItems) {
            toggleItem(item.id);
          } else {
            item.onClick?.();
          }
        }
      },
      onKeyDown: (event: React.KeyboardEvent) => {
        if (!item.disabled) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (hasChildItems) {
              toggleItem(item.id);
            } else {
              item.onClick?.();
            }
          }
        }
      }
    };
  }, [hasChildren, isItemOpen, toggleItem]);

  // Item content props generator
  const getItemContentProps = useCallback((item: AccordionMenuItem, depth = 0) => {
    const isOpen = isItemOpen(item.id);

    return {
      id: `accordion-content-${item.id}`,
      role: 'region',
      'aria-labelledby': `accordion-header-${item.id}`,
      'data-content': true,
      'data-depth': depth,
      'data-open': isOpen,
      hidden: !isOpen,
      style: {
        display: isOpen ? 'block' : 'none',
        transition: `all ${animationDuration}ms ease-in-out`
      }
    };
  }, [isItemOpen, animationDuration]);

  // Composed state
  const state = useMemo(() => composeState<UseAccordionMenuState>({
    openItems: openItemsSet,
    totalItems: flatItems.length,
    focusedItemId,
    currentDepth: focusedItemId ? getItemDepth(focusedItemId) : 0
  }), [openItemsSet, flatItems.length, focusedItemId, getItemDepth]);

  // Composed actions
  const actions = useMemo(() => ({
    toggleItem,
    openItem,
    closeItem,
    openAll,
    closeAll,
    focusItem,
    isItemOpen,
    hasChildren,
    getItemChildren,
    getItemDepth
  }), [toggleItem, openItem, closeItem, openAll, closeAll, focusItem, isItemOpen, hasChildren, getItemChildren, getItemDepth]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    role: 'menu',
    'aria-label': semantic['aria-label'] || `Accordion menu with ${items.length} items`,
  }), [semantic, items.length]);

  return {
    state,
    actions,
    semanticAttributes,
    menuProps,
    getItemProps,
    getItemHeaderProps,
    getItemContentProps,
    menuRef
  };
};