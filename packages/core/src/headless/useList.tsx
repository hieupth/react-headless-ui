/**
 * List headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages list state, selection, and timeline visualization.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * List item interface
 */
export interface ListItem {
  /** Unique identifier */
  id: string | number;
  /** Item value */
  value: string | number;
  /** Item label/title */
  label: string;
  /** Item description */
  description?: string;
  /** Item metadata */
  metadata?: Record<string, any>;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item is selectable */
  selectable?: boolean;
  /** Item level/hierarchy */
  level?: number;
  /** Item timestamp for timeline */
  timestamp?: Date | string | number;
  /** Item type/category */
  type?: string;
  /** Item icon */
  icon?: React.ReactNode;
  /** Item color/theme */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * List state interface
 */
export interface ListState {
  /** List items */
  items: ListItem[];
  /** Currently selected items */
  selectedItems: Set<string | number>;
  /** Currently active/focused item */
  activeItem: string | number | null;
  /** Whether list is disabled */
  disabled: boolean;
  /** Whether list is loading */
  loading: boolean;
  /** Whether list is searchable */
  searchable: boolean;
  /** Current search query */
  searchQuery: string;
  /** Filtered items based on search */
  filteredItems: ListItem[];
  /** Whether list is sorted */
  sorted: boolean;
  /** Sort field */
  sortField: keyof ListItem | null;
  /** Sort direction */
  sortDirection: 'asc' | 'desc';
  /** Whether to show timeline */
  showTimeline: boolean;
  /** Timeline position */
  timelinePosition: 'left' | 'right' | 'center';
  /** Whether to show timestamps */
  showTimestamps: boolean;
  /** Current page for pagination */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Items per page */
  itemsPerPage: number;
  /** Whether to show pagination */
  showPagination: boolean;
}

/**
 * List actions interface
 */
export interface ListActions {
  /** Select item */
  selectItem: (id: string | number) => void;
  /** Deselect item */
  deselectItem: (id: string | number) => void;
  /** Toggle item selection */
  toggleItem: (id: string | number) => void;
  /** Select all items */
  selectAll: () => void;
  /** Deselect all items */
  deselectAll: () => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Set active item */
  setActiveItem: (id: string | number | null) => void;
  /** Add item */
  addItem: (item: ListItem) => void;
  /** Remove item */
  removeItem: (id: string | number) => void;
  /** Update item */
  updateItem: (id: string | number, updates: Partial<ListItem>) => void;
  /** Move item */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Clear search */
  clearSearch: () => void;
  /** Set sorting */
  setSorting: (field: keyof ListItem, direction: 'asc' | 'desc') => void;
  /** Clear sorting */
  clearSorting: () => void;
  /** Go to page */
  goToPage: (page: number) => void;
  /** Next page */
  nextPage: () => void;
  /** Previous page */
  previousPage: () => void;
  /** Set items per page */
  setItemsPerPage: (count: number) => void;
  /** Refresh list */
  refresh: () => void;
  /** Get list element */
  getListElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    role: string;
    'aria-label'?: string;
    'aria-multiselectable'?: boolean;
    'aria-orientation'?: 'vertical' | 'horizontal';
    'aria-busy'?: boolean;
  };
}

/**
 * Props for useList hook
 */
export interface UseListProps {
  /** Initial list items */
  defaultItems?: ListItem[];
  /** Controlled list items */
  items?: ListItem[];
  /** Whether multiple selection is allowed */
  multiSelect?: boolean;
  /** Initial selected items */
  defaultSelectedItems?: (string | number)[];
  /** Controlled selected items */
  selectedItems?: (string | number)[];
  /** Whether list is disabled */
  disabled?: boolean;
  /** Whether list is loading */
  loading?: boolean;
  /** Whether list is searchable */
  searchable?: boolean;
  /** Search fields to search in */
  searchFields?: (keyof ListItem)[];
  /** Whether to sort items */
  sortable?: boolean;
  /** Default sort field */
  defaultSortField?: keyof ListItem;
  /** Default sort direction */
  defaultSortDirection?: 'asc' | 'desc';
  /** Whether to show timeline */
  showTimeline?: boolean;
  /** Timeline position */
  timelinePosition?: 'left' | 'right' | 'center';
  /** Whether to show timestamps */
  showTimestamps?: boolean;
  /** Pagination settings */
  pagination?: {
    enabled?: boolean;
    itemsPerPage?: number;
    defaultPage?: number;
  };
  /** Item selection handler */
  onSelectionChange?: (selectedItems: (string | number)[]) => void;
  /** Item click handler */
  onItemClick?: (item: ListItem) => void;
  /** Active item change handler */
  onActiveItemChange?: (itemId: string | number | null) => void;
  /** Search handler */
  onSearch?: (query: string, results: ListItem[]) => void;
  /** Sort handler */
  onSort?: (field: keyof ListItem, direction: 'asc' | 'desc') => void;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** List element ref */
  listRef?: React.RefObject<HTMLElement>;
  /** Custom filter function */
  filterFunction?: (item: ListItem, query: string) => boolean;
  /** Custom sort function */
  sortFunction?: (a: ListItem, b: ListItem, field: keyof ListItem, direction: 'asc' | 'desc') => number;
  /** Whether to auto-focus first item */
  autoFocus?: boolean;
  /** Whether to wrap navigation */
  wrapNavigation?: boolean;
}

/**
 * Return type for useList hook
 */
export interface UseListReturns {
  /** Current list state */
  state: ListState;
  /** List actions */
  actions: ListActions;
  /** Accessibility attributes */
  attributes: {
    role: string;
    'aria-label'?: string;
    'aria-multiselectable'?: boolean;
    'aria-orientation'?: 'vertical' | 'horizontal';
    'aria-busy'?: boolean;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    loading: string;
    disabled: string;
    searchable: string;
    timeline: string;
    paginated: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Default search fields
 */
const DEFAULT_SEARCH_FIELDS: (keyof ListItem)[] = ['label', 'description'];

/**
 * List hook implementation
 * @param props - List configuration props
 * @returns List state, actions, and attributes
 */
export function useList(props: UseListProps): UseListReturns {
  const {
    defaultItems = [],
    items: controlledItems,
    multiSelect = false,
    defaultSelectedItems = [],
    selectedItems: controlledSelectedItems,
    disabled = false,
    loading = false,
    searchable = false,
    searchFields = DEFAULT_SEARCH_FIELDS,
    sortable = false,
    defaultSortField = 'label',
    defaultSortDirection = 'asc',
    showTimeline = false,
    timelinePosition = 'left',
    showTimestamps = true,
    pagination = {},
    onSelectionChange,
    onItemClick,
    onActiveItemChange,
    onSearch,
    onSort,
    onPageChange,
    listRef,
    filterFunction,
    sortFunction,
    autoFocus = false,
    wrapNavigation = true
  } = props;

  const {
    enabled: paginationEnabled = false,
    itemsPerPage: defaultItemsPerPage = 10,
    defaultPage = 1
  } = pagination;

  // State management
  const [internalItems, setInternalItems] = useState<ListItem[]>(defaultItems);
  const [internalSelectedItems, setInternalSelectedItems] = useState<Set<string | number>>(
    new Set(defaultSelectedItems)
  );
  const [activeItem, setActiveItemState] = useState<string | number | null>(null);
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [sortField, setSortFieldState] = useState<keyof ListItem | null>(
    sortable ? defaultSortField : null
  );
  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>(
    sortable ? defaultSortDirection : 'asc'
  );
  const [currentPage, setCurrentPage] = useState<number>(defaultPage);
  const [itemsPerPage, setItemsPerPageState] = useState<number>(defaultItemsPerPage);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = listRef || internalRef;

  // Determine if component is controlled
  const isItemsControlled = controlledItems !== undefined;
  const isSelectedItemsControlled = controlledSelectedItems !== undefined;
  const currentItems = isItemsControlled ? controlledItems : internalItems;
  const currentSelectedItems = isSelectedItemsControlled
    ? new Set(controlledSelectedItems)
    : internalSelectedItems;

  /**
   * Filter items based on search query
   */
  const filterItems = useCallback((items: ListItem[], query: string): ListItem[] => {
    if (!query || !searchable) return items;

    const normalizedQuery = query.toLowerCase().trim();

    return items.filter(item => {
      if (filterFunction) {
        return filterFunction(item, normalizedQuery);
      }

      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(normalizedQuery);
        }
        if (typeof value === 'number') {
          return value.toString().includes(normalizedQuery);
        }
        return false;
      });
    });
  }, [searchable, searchFields, filterFunction]);

  /**
   * Sort items
   */
  const sortItems = useCallback((items: ListItem[], field: keyof ListItem, direction: 'asc' | 'desc'): ListItem[] => {
    if (!sortable || !field) return items;

    return [...items].sort((a, b) => {
      if (sortFunction) {
        return sortFunction(a, b, field, direction);
      }

      const aValue = a[field];
      const bValue = b[field];

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue || '').localeCompare(String(bValue || ''));
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  }, [sortable, sortFunction]);

  /**
   * Get paginated items
   */
  const getPaginatedItems = useCallback((items: ListItem[]): ListItem[] => {
    if (!paginationEnabled || items.length <= itemsPerPage) return items;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [paginationEnabled, currentPage, itemsPerPage]);

  // Computed state
  const filteredItems = filterItems(currentItems, searchQuery);
  const sortedItems = sortField && sortDirection ? sortItems(filteredItems, sortField, sortDirection) : filteredItems;
  const paginatedItems = getPaginatedItems(sortedItems);
  const totalPages = paginationEnabled ? Math.ceil(sortedItems.length / itemsPerPage) : 1;

  /**
   * Select item
   */
  const selectItemAction = useCallback((id: string | number) => {
    if (disabled) return;

    const item = currentItems.find(i => i.id === id);
    if (!item || item.disabled) return;

    let newSelection: Set<string | number>;

    if (multiSelect) {
      newSelection = new Set(currentSelectedItems);
      newSelection.add(id);
    } else {
      newSelection = new Set([id]);
    }

    if (!isSelectedItemsControlled) {
      setInternalSelectedItems(newSelection);
    }

    onSelectionChange?.(Array.from(newSelection));
    onItemClick?.(item);
  }, [disabled, currentItems, currentSelectedItems, multiSelect, isSelectedItemsControlled, onSelectionChange, onItemClick]);

  /**
   * Deselect item
   */
  const deselectItemAction = useCallback((id: string | number) => {
    if (disabled || !multiSelect) return;

    const newSelection = new Set(currentSelectedItems);
    newSelection.delete(id);

    if (!isSelectedItemsControlled) {
      setInternalSelectedItems(newSelection);
    }

    onSelectionChange?.(Array.from(newSelection));
  }, [disabled, multiSelect, currentSelectedItems, isSelectedItemsControlled, onSelectionChange]);

  /**
   * Toggle item selection
   */
  const toggleItemAction = useCallback((id: string | number) => {
    if (currentSelectedItems.has(id)) {
      deselectItemAction(id);
    } else {
      selectItemAction(id);
    }
  }, [currentSelectedItems, selectItemAction, deselectItemAction]);

  /**
   * Select all items
   */
  const selectAllAction = useCallback(() => {
    if (disabled || !multiSelect) return;

    const selectableItemIds = paginatedItems
      .filter(item => !item.disabled && item.selectable !== false)
      .map(item => item.id);

    const newSelection = new Set(selectableItemIds);

    if (!isSelectedItemsControlled) {
      setInternalSelectedItems(newSelection);
    }

    onSelectionChange?.(Array.from(newSelection));
  }, [disabled, multiSelect, paginatedItems, isSelectedItemsControlled, onSelectionChange]);

  /**
   * Deselect all items
   */
  const deselectAllAction = useCallback(() => {
    if (disabled) return;

    if (!isSelectedItemsControlled) {
      setInternalSelectedItems(new Set());
    }

    onSelectionChange?.([]);
  }, [disabled, isSelectedItemsControlled, onSelectionChange]);

  /**
   * Clear selection
   */
  const clearSelectionAction = useCallback(() => {
    deselectAllAction();
  }, [deselectAllAction]);

  /**
   * Set active item
   */
  const setActiveItemAction = useCallback((id: string | number | null) => {
    setActiveItemState(id);
    onActiveItemChange?.(id);
  }, [onActiveItemChange]);

  /**
   * Add item
   */
  const addItemAction = useCallback((item: ListItem) => {
    if (isItemsControlled) return;

    setInternalItems(prev => [...prev, item]);
  }, [isItemsControlled]);

  /**
   * Remove item
   */
  const removeItemAction = useCallback((id: string | number) => {
    if (isItemsControlled) return;

    setInternalItems(prev => prev.filter(item => item.id !== id));

    // Also remove from selection
    if (!isSelectedItemsControlled && currentSelectedItems.has(id)) {
      setInternalSelectedItems(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
    }
  }, [isItemsControlled, isSelectedItemsControlled, currentSelectedItems]);

  /**
   * Update item
   */
  const updateItemAction = useCallback((id: string | number, updates: Partial<ListItem>) => {
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
   * Set search query
   */
  const setSearchQueryAction = useCallback((query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1); // Reset to first page on search
    onSearch?.(query, filteredItems);
  }, [onSearch, filteredItems]);

  /**
   * Clear search
   */
  const clearSearchAction = useCallback(() => {
    setSearchQueryAction('');
  }, [setSearchQueryAction]);

  /**
   * Set sorting
   */
  const setSortingAction = useCallback((field: keyof ListItem, direction: 'asc' | 'desc') => {
    setSortFieldState(field);
    setSortDirectionState(direction);
    setCurrentPage(1); // Reset to first page on sort
    onSort?.(field, direction);
  }, [onSort]);

  /**
   * Clear sorting
   */
  const clearSortingAction = useCallback(() => {
    setSortFieldState(null);
    setSortDirectionState('asc');
    setCurrentPage(1);
  }, []);

  /**
   * Go to page
   */
  const goToPageAction = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    onPageChange?.(validPage);
  }, [totalPages, onPageChange]);

  /**
   * Next page
   */
  const nextPageAction = useCallback(() => {
    if (currentPage < totalPages) {
      goToPageAction(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPageAction]);

  /**
   * Previous page
   */
  const previousPageAction = useCallback(() => {
    if (currentPage > 1) {
      goToPageAction(currentPage - 1);
    }
  }, [currentPage, goToPageAction]);

  /**
   * Set items per page
   */
  const setItemsPerPageAction = useCallback((count: number) => {
    setItemsPerPageState(count);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Refresh list
   */
  const refreshAction = useCallback(() => {
    // Trigger re-render by updating items
    if (!isItemsControlled) {
      setInternalItems(prev => [...prev]);
    }
  }, [isItemsControlled]);

  /**
   * Get list element
   */
  const getListElementAction = useCallback(() => {
    return elementRef.current;
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    const props: any = {
      role: 'listbox',
      'aria-multiselectable': multiSelect,
      'aria-orientation': 'vertical' as const
    };

    if (loading) {
      props['aria-busy'] = true;
    }

    return props;
  }, [multiSelect, loading]);

  // Auto-focus first item when enabled
  useEffect(() => {
    if (autoFocus && paginatedItems.length > 0 && !disabled) {
      const firstItem = paginatedItems.find(item => !item.disabled);
      if (firstItem) {
        setActiveItemAction(firstItem.id);
      }
    }
  }, [autoFocus, paginatedItems, disabled, setActiveItemAction]);

  // Build state
  const state: ListState = {
    items: currentItems,
    selectedItems: currentSelectedItems,
    activeItem,
    disabled,
    loading,
    searchable,
    searchQuery,
    filteredItems,
    sorted: sortable && sortField !== null,
    sortField,
    sortDirection,
    showTimeline,
    timelinePosition,
    showTimestamps,
    currentPage,
    totalPages,
    itemsPerPage,
    showPagination: paginationEnabled
  };

  // Build actions
  const actions: ListActions = {
    selectItem: selectItemAction,
    deselectItem: deselectItemAction,
    toggleItem: toggleItemAction,
    selectAll: selectAllAction,
    deselectAll: deselectAllAction,
    clearSelection: clearSelectionAction,
    setActiveItem: setActiveItemAction,
    addItem: addItemAction,
    removeItem: removeItemAction,
    updateItem: updateItemAction,
    moveItem: moveItemAction,
    setSearchQuery: setSearchQueryAction,
    clearSearch: clearSearchAction,
    setSorting: setSortingAction,
    clearSorting: clearSortingAction,
    goToPage: goToPageAction,
    nextPage: nextPageAction,
    previousPage: previousPageAction,
    setItemsPerPage: setItemsPerPageAction,
    refresh: refreshAction,
    getListElement: getListElementAction,
    getAccessibilityProps: getAccessibilityPropsAction
  };

  // Build accessibility attributes
  const accessibilityProps = getAccessibilityPropsAction();

  // Build CSS classes
  const classes = {
    base: 'list',
    loading: loading ? 'list-loading' : '',
    disabled: disabled ? 'list-disabled' : '',
    searchable: searchable ? 'list-searchable' : '',
    timeline: showTimeline ? 'list-timeline' : '',
    paginated: paginationEnabled ? 'list-paginated' : ''
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
    role: 'listbox',
    ref: elementRef
  });

  return {
    state,
    actions,
    attributes: accessibilityProps,
    classes,
    focusable,
    pressable,
    semantic
  };
}