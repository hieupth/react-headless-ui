/**
 * Accordion headless hook following Flutter ExpansionPanel patterns.
 * Provides collapsible content sections with keyboard navigation.
 */

import { useState, useCallback, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export interface AccordionItem {
  /** Unique identifier for the item */
  id: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Item content */
  content: React.ReactNode;
  /** Item trigger content */
  trigger: React.ReactNode;
}

export interface UseAccordionProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Accordion items */
  items: AccordionItem[];
  /** Initial open item IDs */
  defaultOpenItems?: string[];
  /** Controlled open item IDs */
  openItems?: string[];
  /** Allow multiple items to be open */
  collapsible?: boolean;
  /** Orientation of accordion */
  orientation?: 'vertical' | 'horizontal';
  /** Open change handler */
  onOpenChange?: (openItems: string[]) => void;
  /** Item toggle handler */
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  /** Whether accordion is disabled */
  disabled?: boolean;
}

export interface UseAccordionState {
  /** Currently open item IDs */
  openItems: string[];
  /** Current focus state */
  focused: boolean;
  /** Current focused item ID */
  focusedItemId?: string;
}

export interface UseAccordionActions {
  /** Toggle item open state */
  toggleItem: (itemId: string) => void;
  /** Open specific item */
  openItem: (itemId: string) => void;
  /** Close specific item */
  closeItem: (itemId: string) => void;
  /** Open all items */
  openAll: () => void;
  /** Close all items */
  closeAll: () => void;
  /** Handle keyboard navigation */
  handleKeyDown: (event: React.KeyboardEvent, itemId: string) => void;
  /** Focus next item */
  focusNextItem: (currentItemId: string) => void;
  /** Focus previous item */
  focusPreviousItem: (currentItemId: string) => void;
  /** Focus first item */
  focusFirstItem: () => void;
  /** Focus last item */
  focusLastItem: () => void;
}

export interface UseAccordionReturns extends UseAccordionState, UseAccordionActions {
  /** Get item state */
  getItemState: (itemId: string) => { isOpen: boolean; disabled: boolean };
  /** Get item trigger props */
  getItemTriggerProps: (itemId: string) => any;
  /** Get item content props */
  getItemContentProps: (itemId: string) => any;
  /** Semantic attributes for container */
  semanticAttributes: Record<string, any>;
}

/**
 * Headless accordion hook providing collapsible panel behavior.
 * Supports single and multiple item selection with keyboard navigation.
 */
export const useAccordion = (props: UseAccordionProps): UseAccordionReturns => {
  const {
    items,
    defaultOpenItems = [],
    openItems: controlledOpenItems,
    collapsible = false,
    orientation = 'vertical',
    onOpenChange,
    onItemToggle,
    defaultFocused = false,
    disabled = false,
    role = 'region',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [internalOpenItems, setInternalOpenItems] = useState<string[]>(defaultOpenItems);
  const [focusedItemId, setFocusedItemId] = useState<string>();

  // Use controlled value if provided, otherwise use internal state
  const openItems = controlledOpenItems !== undefined ? controlledOpenItems : internalOpenItems;

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: !disabled,
    focusStrategy: 'auto'
  });

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    disabled,
    ...semanticProps
  });

  // Update open items
  const updateOpenItems = useCallback((newOpenItems: string[]) => {
    if (controlledOpenItems === undefined) {
      setInternalOpenItems(newOpenItems);
    }
    onOpenChange?.(newOpenItems);
  }, [controlledOpenItems, onOpenChange]);

  // Focus navigation helpers (declared before use to fix forward reference)
  const focusNextItem = useCallback((currentItemId: string) => {
    const currentIndex = items.findIndex(item => item.id === currentItemId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < items.length) {
      const nextItem = items[nextIndex];
      if (!nextItem.disabled) {
        setFocusedItemId(nextItem.id);
      } else {
        focusNextItem(nextItem.id);
      }
    }
  }, [items]);

  const focusPreviousItem = useCallback((currentItemId: string) => {
    const currentIndex = items.findIndex(item => item.id === currentItemId);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      const prevItem = items[prevIndex];
      if (!prevItem.disabled) {
        setFocusedItemId(prevItem.id);
      } else {
        focusPreviousItem(prevItem.id);
      }
    }
  }, [items]);

  const focusFirstItem = useCallback(() => {
    const firstItem = items.find(item => !item.disabled);
    if (firstItem) {
      setFocusedItemId(firstItem.id);
    }
  }, [items]);

  const focusLastItem = useCallback(() => {
    const lastItem = [...items].reverse().find(item => !item.disabled);
    if (lastItem) {
      setFocusedItemId(lastItem.id);
    }
  }, [items]);

  // Toggle item open state
  const toggleItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.disabled) return;

    const isOpen = openItems.includes(itemId);
    let newOpenItems: string[];

    if (collapsible) {
      // Allow multiple items to be open
      if (isOpen) {
        newOpenItems = openItems.filter(id => id !== itemId);
      } else {
        newOpenItems = [...openItems, itemId];
      }
    } else {
      // Only one item can be open at a time
      if (isOpen) {
        newOpenItems = [];
      } else {
        newOpenItems = [itemId];
      }
    }

    updateOpenItems(newOpenItems);
    onItemToggle?.(itemId, !isOpen);
  }, [items, openItems, collapsible, updateOpenItems, onItemToggle]);

  // Open specific item
  const openItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.disabled) return;

    if (collapsible) {
      const newOpenItems = openItems.includes(itemId) ? openItems : [...openItems, itemId];
      updateOpenItems(newOpenItems);
    } else {
      updateOpenItems([itemId]);
    }
    onItemToggle?.(itemId, true);
  }, [items, openItems, collapsible, updateOpenItems, onItemToggle]);

  // Close specific item
  const closeItem = useCallback((itemId: string) => {
    const newOpenItems = openItems.filter(id => id !== itemId);
    updateOpenItems(newOpenItems);
    onItemToggle?.(itemId, false);
  }, [openItems, updateOpenItems, onItemToggle]);

  // Open all items
  const openAll = useCallback(() => {
    if (!collapsible) return;

    const enabledItemIds = items.filter(item => !item.disabled).map(item => item.id);
    updateOpenItems(enabledItemIds);
    enabledItemIds.forEach(itemId => onItemToggle?.(itemId, true));
  }, [collapsible, items, updateOpenItems, onItemToggle]);

  // Close all items
  const closeAll = useCallback(() => {
    updateOpenItems([]);
    openItems.forEach(itemId => onItemToggle?.(itemId, false));
  }, [openItems, updateOpenItems, onItemToggle]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleItem(itemId);
        break;
      case orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight':
        event.preventDefault();
        focusNextItem(itemId);
        break;
      case orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft':
        event.preventDefault();
        focusPreviousItem(itemId);
        break;
      case 'Home':
        event.preventDefault();
        focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        focusLastItem();
        break;
    }
  }, [items, orientation, toggleItem, focusNextItem, focusPreviousItem, focusFirstItem, focusLastItem]);

  
  // Get item state
  const getItemState = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return {
      isOpen: openItems.includes(itemId),
      disabled: item?.disabled || false
    };
  }, [items, openItems]);

  // Get item trigger props
  const getItemTriggerProps = useCallback((itemId: string) => {
    const { isOpen, disabled } = getItemState(itemId);
    const item = items.find(i => i.id === itemId);

    return {
      id: `${itemId}-trigger`,
      'aria-controls': `${itemId}-content`,
      'aria-expanded': isOpen,
      'aria-disabled': disabled,
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, itemId),
      onClick: () => toggleItem(itemId),
      disabled,
      'data-state': isOpen ? 'open' : 'closed',
      'data-disabled': disabled,
      'data-orientation': orientation
    };
  }, [getItemState, items, handleKeyDown, toggleItem, orientation]);

  // Get item content props
  const getItemContentProps = useCallback((itemId: string) => {
    const { isOpen } = getItemState(itemId);

    return {
      id: `${itemId}-content`,
      role: 'region',
      'aria-labelledby': `${itemId}-trigger`,
      hidden: !isOpen,
      'data-state': isOpen ? 'open' : 'closed',
      'data-orientation': orientation
    };
  }, [getItemState, orientation]);

  // Computed state
  const state = useMemo(() => composeState<UseAccordionState>({
    openItems,
    focused: focusableMixin.focused,
    focusedItemId
  }), [openItems, focusableMixin.focused, focusedItemId]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'data-orientation': orientation,
    'data-collapsible': collapsible
  }), [semantic, orientation, collapsible]);

  return {
    // State
    ...state,

    // Actions
    toggleItem,
    openItem,
    closeItem,
    openAll,
    closeAll,
    handleKeyDown,
    focusNextItem,
    focusPreviousItem,
    focusFirstItem,
    focusLastItem,

    // Item helpers
    getItemState,
    getItemTriggerProps,
    getItemContentProps,

    // Computed properties
    semanticAttributes
  };
};