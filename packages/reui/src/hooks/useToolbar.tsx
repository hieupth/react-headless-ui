/**
 * Toolbar headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages toolbar actions and state.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Toolbar item interface
 */
export interface ToolbarItem {
  /** Unique identifier */
  id: string | number;
  /** Item label */
  label: string;
  /** Item type */
  type: 'button' | 'separator' | 'spacer' | 'group';
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is active */
  active?: boolean;
  /** Item icon */
  icon?: React.ReactNode;
  /** Action handler */
  action?: () => void;
  /** Item position */
  position?: 'start' | 'center' | 'end';
  /** Item size */
  size?: 'sm' | 'md' | 'lg';
  /** Item variant */
  variant?: 'default' | 'primary' | 'secondary';
  /** Custom data */
  data?: Record<string, any>;
}

/**
 * Toolbar state interface
 */
export interface ToolbarState {
  /** Toolbar items */
  items: ToolbarItem[];
  /** Whether toolbar is disabled */
  disabled: boolean;
  /** Whether toolbar is focused */
  focused: boolean;
  /** Currently active item */
  activeItem: string | number | null;
  /** Toolbar orientation */
  orientation: 'horizontal' | 'vertical';
  /** Toolbar size */
  size: 'sm' | 'md' | 'lg';
  /** Whether toolbar is collapsed */
  collapsed: boolean;
  /** Current navigation index */
  navigationIndex: number;
  /** Whether to show labels */
  showLabels: boolean;
  /** Whether toolbar is sticky */
  sticky: boolean;
}

/**
 * Toolbar actions interface
 */
export interface ToolbarActions {
  /** Activate item */
  activateItem: (id: string | number) => void;
  /** Focus item */
  focusItem: (id: string | number) => void;
  /** Blur item */
  blurItem: (id: string | number) => void;
  /** Add item */
  addItem: (item: ToolbarItem) => void;
  /** Remove item */
  removeItem: (id: string | number) => void;
  /** Update item */
  updateItem: (id: string | number, updates: Partial<ToolbarItem>) => void;
  /** Move item */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** Toggle collapsed state */
  toggleCollapsed: () => void;
  /** Set collapsed state */
  setCollapsed: (collapsed: boolean) => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrevious: () => void;
  /** Set items */
  setItems: (items: ToolbarItem[]) => void;
  /** Focus toolbar */
  focus: () => void;
  /** Blur toolbar */
  blur: () => void;
  /** Get toolbar element */
  getToolbarElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    role: string;
    'aria-label'?: string;
    'aria-orientation'?: 'horizontal' | 'vertical';
    'aria-disabled'?: boolean;
  };
}

/**
 * Props for useToolbar hook
 */
export interface UseToolbarProps {
  /** Initial toolbar items */
  defaultItems?: ToolbarItem[];
  /** Controlled toolbar items */
  items?: ToolbarItem[];
  /** Toolbar orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Toolbar size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether toolbar is disabled */
  disabled?: boolean;
  /** Whether toolbar is initially collapsed */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether toolbar is sticky */
  sticky?: boolean;
  /** Item activation handler */
  onItemActivate?: (item: ToolbarItem) => void;
  /** Collapse handler */
  onCollapse?: (collapsed: boolean) => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Toolbar element ref */
  toolbarRef?: React.RefObject<HTMLElement | null>;
  /** Whether to wrap navigation */
  wrapNavigation?: boolean;
  /** Toolbar label */
  label?: string;
}

/**
 * Return type for useToolbar hook
 */
export interface UseToolbarReturns {
  /** Current toolbar state */
  state: ToolbarState;
  /** Toolbar actions */
  actions: ToolbarActions;
  /** Accessibility attributes */
  attributes: {
    role: string;
    'aria-label'?: string;
    'aria-orientation'?: 'horizontal' | 'vertical';
    'aria-disabled'?: boolean;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    focused: string;
    disabled: string;
    collapsed: string;
    sticky: string;
    [key: string]: string | boolean;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Toolbar hook implementation
 * @param props - Toolbar configuration props
 * @returns Toolbar state, actions, and attributes
 */
export function useToolbar(props: UseToolbarProps): UseToolbarReturns {
  const {
    defaultItems = [],
    items: controlledItems,
    orientation = 'horizontal',
    size = 'md',
    disabled = false,
    defaultCollapsed = false,
    collapsed: controlledCollapsed,
    showLabels = true,
    sticky = false,
    onItemActivate,
    onCollapse,
    onFocus,
    onBlur,
    toolbarRef,
    wrapNavigation = true,
    label
  } = props;

  // State management
  const [internalItems, setInternalItems] = useState<ToolbarItem[]>(defaultItems);
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultCollapsed);
  const [focused, setFocused] = useState<boolean>(false);
  const [activeItem, setActiveItemState] = useState<string | number | null>(null);
  const [navigationIndex, setNavigationIndex] = useState<number>(-1);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = toolbarRef || internalRef;

  // Determine if component is controlled
  const isItemsControlled = controlledItems !== undefined;
  const isCollapsedControlled = controlledCollapsed !== undefined;
  const currentItems = isItemsControlled ? controlledItems : internalItems;
  const currentCollapsed = isCollapsedControlled ? controlledCollapsed : internalCollapsed;

  /**
   * Set items
   */
  const setItemsAction = useCallback((newItems: ToolbarItem[]) => {
    if (!isItemsControlled) {
      setInternalItems(newItems);
    }
  }, [isItemsControlled]);

  /**
   * Activate item
   */
  const activateItemAction = useCallback((id: string | number) => {
    if (disabled) return;

    const item = currentItems.find(item => item.id === id);
    if (!item || item.disabled || item.type === 'separator' || item.type === 'spacer') return;

    setActiveItemState(id);
    item.action?.();
    onItemActivate?.(item);
  }, [disabled, currentItems, onItemActivate]);

  /**
   * Focus item
   */
  const focusItemAction = useCallback((id: string | number) => {
    if (disabled) return;
    // Focus implementation would need to find the DOM element
  }, [disabled]);

  /**
   * Blur item
   */
  const blurItemAction = useCallback((id: string | number) => {
    if (disabled) return;
    // Blur implementation would need to find the DOM element
  }, [disabled]);

  /**
   * Add item
   */
  const addItemAction = useCallback((item: ToolbarItem) => {
    if (isItemsControlled) return;

    setInternalItems(prev => [...prev, item]);
  }, [isItemsControlled]);

  /**
   * Remove item
   */
  const removeItemAction = useCallback((id: string | number) => {
    if (isItemsControlled) return;

    setInternalItems(prev => prev.filter(item => item.id !== id));
  }, [isItemsControlled]);

  /**
   * Update item
   */
  const updateItemAction = useCallback((id: string | number, updates: Partial<ToolbarItem>) => {
    if (isItemsControlled) return;

    setInternalItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, [isItemsControlled]);

  /**
   * Move item
   */
  const moveItemAction = useCallback((fromIndex: number, toIndex: number) => {
    if (isItemsControlled) return;

    setInternalItems(prev => {
      const items = [...prev];
      const [item] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, item);
      return items;
    });
  }, [isItemsControlled]);

  /**
   * Toggle collapsed state
   */
  const toggleCollapsedAction = useCallback(() => {
    if (!isCollapsedControlled) {
      setInternalCollapsed(!currentCollapsed);
    }
    onCollapse?.(!currentCollapsed);
  }, [currentCollapsed, isCollapsedControlled, onCollapse]);

  /**
   * Set collapsed state
   */
  const setCollapsedAction = useCallback((collapsed: boolean) => {
    if (!isCollapsedControlled) {
      setInternalCollapsed(collapsed);
    }
    onCollapse?.(collapsed);
  }, [isCollapsedControlled, onCollapse]);

  /**
   * Navigate to next item
   */
  const navigateNextAction = useCallback(() => {
    if (disabled) return;

    const navigableItems = currentItems.filter(item =>
      item.type === 'button' && !item.disabled
    );

    if (!navigableItems.length) return;

    const currentIndex = navigableItems.findIndex(item => item.id === activeItem);
    const atEnd = currentIndex >= navigableItems.length - 1;
    const nextIndex = atEnd ? (wrapNavigation ? 0 : currentIndex) : currentIndex + 1;

    activateItemAction(navigableItems[nextIndex].id);
  }, [disabled, currentItems, activeItem, wrapNavigation, activateItemAction]);

  /**
   * Navigate to previous item
   */
  const navigatePreviousAction = useCallback(() => {
    if (disabled) return;

    const navigableItems = currentItems.filter(item =>
      item.type === 'button' && !item.disabled
    );

    if (!navigableItems.length) return;

    const currentIndex = navigableItems.findIndex(item => item.id === activeItem);
    const atStart = currentIndex <= 0;
    const prevIndex = atStart ? (wrapNavigation ? navigableItems.length - 1 : currentIndex) : currentIndex - 1;

    activateItemAction(navigableItems[prevIndex].id);
  }, [disabled, currentItems, activeItem, wrapNavigation, activateItemAction]);

  /**
   * Focus toolbar
   */
  const focusAction = useCallback(() => {
    if (!disabled) {
      setFocused(true);
      elementRef.current?.focus();
    }
    onFocus?.();
  }, [disabled, onFocus]);

  /**
   * Blur toolbar
   */
  const blurAction = useCallback(() => {
    setFocused(false);
    elementRef.current?.blur();
    onBlur?.();
  }, [onBlur]);

  /**
   * Get toolbar element
   */
  const getToolbarElementAction = useCallback(() => {
    return elementRef.current;
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    return {
      role: 'toolbar',
      'aria-label': label,
      'aria-orientation': orientation,
      'aria-disabled': disabled
    };
  }, [label, orientation, disabled]);

  // Build state
  const state: ToolbarState = {
    items: currentItems,
    disabled,
    focused,
    activeItem,
    orientation,
    size,
    collapsed: currentCollapsed,
    navigationIndex,
    showLabels,
    sticky
  };

  // Build actions
  const actions: ToolbarActions = {
    activateItem: activateItemAction,
    focusItem: focusItemAction,
    blurItem: blurItemAction,
    addItem: addItemAction,
    removeItem: removeItemAction,
    updateItem: updateItemAction,
    moveItem: moveItemAction,
    toggleCollapsed: toggleCollapsedAction,
    setCollapsed: setCollapsedAction,
    navigateNext: navigateNextAction,
    navigatePrevious: navigatePreviousAction,
    setItems: setItemsAction,
    focus: focusAction,
    blur: blurAction,
    getToolbarElement: getToolbarElementAction,
    getAccessibilityProps: getAccessibilityPropsAction
  };

  // Build accessibility attributes
  const accessibilityProps = getAccessibilityPropsAction();

  // Build CSS classes
  const classes = {
    base: 'toolbar',
    focused: focused ? 'toolbar-focused' : '',
    disabled: disabled ? 'toolbar-disabled' : '',
    collapsed: currentCollapsed ? 'toolbar-collapsed' : 'toolbar-expanded',
    sticky: sticky ? 'toolbar-sticky' : '',
    [`toolbar-${orientation}`]: true,
    [`toolbar-${size}`]: true
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled,
    ref: elementRef
  });

  const pressable = usePressableMixin({
    disabled,
    ref: elementRef
  });

  const semantic = useSemanticMixin({
    role: 'toolbar',
    ref: elementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes: accessibilityProps,
    classes,
    focusable,
    pressable,
    semantic
  }), [state, actions, accessibilityProps, classes, focusable, pressable, semantic]);
}