/**
 * Sortable headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages drag-and-drop reordering functionality.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Sortable item interface
 */
export interface SortableItem {
  /** Unique identifier */
  id: string | number;
  /** Item value */
  value: string | number;
  /** Item label */
  label: string;
  /** Item index */
  index: number;
  /** Whether item is draggable */
  draggable?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Custom data */
  data?: Record<string, any>;
}

/**
 * Sortable state interface
 */
export interface SortableState {
  /** Current items */
  items: SortableItem[];
  /** Whether sortable is disabled */
  disabled: boolean;
  /** Currently dragging item */
  draggingItem: SortableItem | null;
  /** Drag over item index */
  dragOverIndex: number | null;
  /** Drop zone active */
  dropZoneActive: boolean;
  /** Sort direction */
  direction: 'vertical' | 'horizontal';
  /** Whether animation is enabled */
  animated: boolean;
  /** Whether to show handles */
  showHandles: boolean;
  /** Current sort order */
  sortOrder: 'asc' | 'desc';
  /** Whether sortable is locked */
  locked: boolean;
}

/**
 * Sortable actions interface
 */
export interface SortableActions {
  /** Start dragging item */
  startDrag: (item: SortableItem, event: DragEvent) => void;
  /** End dragging */
  endDrag: () => void;
  /** Handle drag over */
  handleDragOver: (index: number, event: DragEvent) => void;
  /** Handle drop */
  handleDrop: (targetIndex: number, event: DragEvent) => void;
  /** Move item */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** Reorder items */
  reorderItems: (newItems: SortableItem[]) => void;
  /** Add item */
  addItem: (item: SortableItem, index?: number) => void;
  /** Remove item */
  removeItem: (id: string | number) => void;
  /** Update item */
  updateItem: (id: string | number, updates: Partial<SortableItem>) => void;
  /** Set direction */
  setDirection: (direction: 'vertical' | 'horizontal') => void;
  /** Set items */
  setItems: (items: SortableItem[]) => void;
  /** Lock sortable */
  lock: () => void;
  /** Unlock sortable */
  unlock: () => void;
  /** Get sortable element */
  getSortableElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    role: string;
    'aria-orientation'?: 'vertical' | 'horizontal';
    'aria-disabled'?: boolean;
    'aria-busy'?: boolean;
  };
}

/**
 * Props for useSortable hook
 */
export interface UseSortableProps {
  /** Initial items */
  defaultItems?: SortableItem[];
  /** Controlled items */
  items?: SortableItem[];
  /** Sort direction */
  direction?: 'vertical' | 'horizontal';
  /** Whether sortable is disabled */
  disabled?: boolean;
  /** Whether animation is enabled */
  animated?: boolean;
  /** Whether to show drag handles */
  showHandles?: boolean;
  /** Whether to lock sorting */
  locked?: boolean;
  /** Drag threshold in pixels */
  dragThreshold?: number;
  /** Whether to auto-scroll */
  autoScroll?: boolean;
  /** Auto-scroll speed */
  autoScrollSpeed?: number;
  /** Item reorder handler */
  onReorder?: (items: SortableItem[], oldIndex: number, newIndex: number) => void;
  /** Drag start handler */
  onDragStart?: (item: SortableItem) => void;
  /** Drag end handler */
  onDragEnd?: (item: SortableItem) => void;
  /** Drop handler */
  onDrop?: (draggedItem: SortableItem, targetItem: SortableItem) => void;
  /** Items change handler */
  onItemsChange?: (items: SortableItem[]) => void;
  /** Sortable element ref */
  sortableRef?: React.RefObject<HTMLElement | null>;
  /** Custom drag image */
  dragImage?: string | HTMLElement;
  /** Whether to allow cross-origin drops */
  allowCrossOrigin?: boolean;
  /** Data transfer types */
  dataTransferTypes?: string[];
}

/**
 * Return type for useSortable hook
 */
export interface UseSortableReturns {
  /** Current sortable state */
  state: SortableState;
  /** Sortable actions */
  actions: SortableActions;
  /** Accessibility attributes */
  attributes: {
    role: string;
    'aria-orientation'?: 'vertical' | 'horizontal';
    'aria-disabled'?: boolean;
    'aria-busy'?: boolean;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    dragging: string;
    dropZone: string;
    disabled: string;
    locked: string;
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
 * Default data transfer types
 */
const DEFAULT_DATA_TRANSFER_TYPES = ['text/plain', 'application/json'];

/**
 * Sortable hook implementation
 * @param props - Sortable configuration props
 * @returns Sortable state, actions, and attributes
 */
export function useSortable(props: UseSortableProps): UseSortableReturns {
  const {
    defaultItems = [],
    items: controlledItems,
    direction = 'vertical',
    disabled = false,
    animated = true,
    showHandles = false,
    locked = false,
    dragThreshold = 5,
    autoScroll = true,
    autoScrollSpeed = 5,
    onReorder,
    onDragStart,
    onDragEnd,
    onDrop,
    onItemsChange,
    sortableRef,
    dragImage,
    allowCrossOrigin = false,
    dataTransferTypes = DEFAULT_DATA_TRANSFER_TYPES
  } = props;

  // State management
  const [internalItems, setInternalItems] = useState<SortableItem[]>(defaultItems);
  const [draggingItem, setDraggingItem] = useState<SortableItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = sortableRef || internalRef;
  const draggedElementRef = useRef<HTMLElement | null>(null);

  // Determine if component is controlled
  const isItemsControlled = controlledItems !== undefined;
  const currentItems = isItemsControlled ? controlledItems : internalItems;

  /**
   * Set items
   */
  const setItemsAction = useCallback((newItems: SortableItem[]) => {
    if (!isItemsControlled) {
      setInternalItems(newItems);
    }
    onItemsChange?.(newItems);
  }, [isItemsControlled, onItemsChange]);

  /**
   * Start dragging item
   */
  const startDragAction = useCallback((item: SortableItem, event: DragEvent) => {
    if (disabled || locked || item.disabled) return;

    setDraggingItem(item);
    setDragStartPos({ x: event.clientX, y: event.clientY });

    // Set drag image
    if (dragImage && typeof dragImage === 'string') {
      const img = new Image();
      img.src = dragImage;
      event.dataTransfer?.setDragImage(img, 0, 0);
    } else if (dragImage instanceof HTMLElement) {
      event.dataTransfer?.setDragImage(dragImage, 0, 0);
    }

    // Set data transfer
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.setData('text/plain', item.label);
    }

    // Store dragged element reference
    draggedElementRef.current = event.target as HTMLElement;

    onDragStart?.(item);
  }, [disabled, locked, dragImage, onDragStart]);

  /**
   * End dragging
   */
  const endDragAction = useCallback(() => {
    setDraggingItem(null);
    setDragOverIndex(null);
    setDropZoneActive(false);
    setDragStartPos(null);
    draggedElementRef.current = null;

    if (draggingItem) {
      onDragEnd?.(draggingItem);
    }
  }, [draggingItem, onDragEnd]);

  /**
   * Handle drag over
   */
  const handleDragOverAction = useCallback((index: number, event: DragEvent) => {
    if (!draggingItem || disabled || locked) return;

    event.preventDefault();
    event.dataTransfer!.effectAllowed = 'move';

    setDragOverIndex(index);
    setDropZoneActive(true);
  }, [draggingItem, disabled, locked]);

  /**
   * Handle drop
   */
  const handleDropAction = useCallback((targetIndex: number, event: DragEvent) => {
    if (!draggingItem || disabled || locked) return;

    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';

    const draggedIndex = currentItems.findIndex(item => item.id === draggingItem.id);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      endDragAction();
      return;
    }

    // Move item
    const newItems = [...currentItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update indices
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      index
    }));

    setItemsAction(updatedItems);
    onReorder?.(updatedItems, draggedIndex, targetIndex);

    const targetItem = updatedItems[targetIndex];
    onDrop?.(draggingItem, targetItem);

    endDragAction();
  }, [draggingItem, currentItems, disabled, locked, endDragAction, setItemsAction, onReorder, onDrop]);

  /**
   * Move item
   */
  const moveItemAction = useCallback((fromIndex: number, toIndex: number) => {
    if (disabled || locked) return;

    if (fromIndex === toIndex) return;

    const newItems = [...currentItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      index
    }));

    setItemsAction(updatedItems);
    onReorder?.(updatedItems, fromIndex, toIndex);
  }, [currentItems, disabled, locked, setItemsAction, onReorder]);

  /**
   * Reorder items
   */
  const reorderItemsAction = useCallback((newItems: SortableItem[]) => {
    if (disabled || locked) return;

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      index
    }));

    setItemsAction(updatedItems);
  }, [disabled, locked, setItemsAction]);

  /**
   * Add item
   */
  const addItemAction = useCallback((item: SortableItem, index?: number) => {
    if (disabled || locked) return;

    const newItems = [...currentItems];
    const insertIndex = index !== undefined ? index : newItems.length;
    const itemWithIndex = { ...item, index: insertIndex };

    newItems.splice(insertIndex, 0, itemWithIndex);

    // Update indices
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      index: idx
    }));

    setItemsAction(updatedItems);
  }, [currentItems, disabled, locked, setItemsAction]);

  /**
   * Remove item
   */
  const removeItemAction = useCallback((id: string | number) => {
    if (disabled || locked) return;

    const newItems = currentItems.filter(item => item.id !== id);

    // Update indices
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      index
    }));

    setItemsAction(updatedItems);
  }, [currentItems, disabled, locked, setItemsAction]);

  /**
   * Update item
   */
  const updateItemAction = useCallback((id: string | number, updates: Partial<SortableItem>) => {
    if (disabled || locked) return;

    const updatedItems = currentItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );

    setItemsAction(updatedItems);
  }, [currentItems, disabled, locked, setItemsAction]);

  /**
   * Set direction
   */
  const setDirectionAction = useCallback((newDirection: 'vertical' | 'horizontal') => {
    // Direction is managed externally via props
  }, []);

  /**
   * Lock sortable
   */
  const lockAction = useCallback(() => {
    // Lock state is managed externally via props
  }, []);

  /**
   * Unlock sortable
   */
  const unlockAction = useCallback(() => {
    // Lock state is managed externally via props
  }, []);

  /**
   * Get sortable element
   */
  const getSortableElementAction = useCallback(() => {
    return elementRef.current;
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    return {
      role: 'list',
      'aria-orientation': direction,
      'aria-disabled': disabled,
      'aria-busy': !!draggingItem
    };
  }, [direction, disabled, draggingItem]);

  // Global drag event handlers
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      endDragAction();
    };

    const handleGlobalDragOver = (event: DragEvent) => {
      if (!draggingItem || !autoScroll) return;

      const container = elementRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollThreshold = 50;

      if (direction === 'vertical') {
        if (event.clientY < rect.top + scrollThreshold) {
          container.scrollTop -= autoScrollSpeed;
        } else if (event.clientY > rect.bottom - scrollThreshold) {
          container.scrollTop += autoScrollSpeed;
        }
      } else {
        if (event.clientX < rect.left + scrollThreshold) {
          container.scrollLeft -= autoScrollSpeed;
        } else if (event.clientX > rect.right - scrollThreshold) {
          container.scrollLeft += autoScrollSpeed;
        }
      }
    };

    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('dragover', handleGlobalDragOver);

    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, [draggingItem, autoScroll, autoScrollSpeed, direction, endDragAction]);

  // Build state
  const state: SortableState = {
    items: currentItems,
    disabled,
    draggingItem,
    dragOverIndex,
    dropZoneActive,
    direction,
    animated,
    showHandles,
    sortOrder: 'asc',
    locked
  };

  // Build actions
  const actions: SortableActions = {
    startDrag: startDragAction,
    endDrag: endDragAction,
    handleDragOver: handleDragOverAction,
    handleDrop: handleDropAction,
    moveItem: moveItemAction,
    reorderItems: reorderItemsAction,
    addItem: addItemAction,
    removeItem: removeItemAction,
    updateItem: updateItemAction,
    setDirection: setDirectionAction,
    setItems: setItemsAction,
    lock: lockAction,
    unlock: unlockAction,
    getSortableElement: getSortableElementAction,
    getAccessibilityProps: getAccessibilityPropsAction
  };

  // Build accessibility attributes
  const accessibilityProps = getAccessibilityPropsAction();

  // Build CSS classes
  const classes = {
    base: 'sortable',
    dragging: draggingItem ? 'sortable-dragging' : '',
    dropZone: dropZoneActive ? 'sortable-drop-zone' : '',
    disabled: disabled ? 'sortable-disabled' : '',
    locked: locked ? 'sortable-locked' : '',
    [`sortable-${direction}`]: true,
    'sortable-animated': animated
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
    role: 'list',
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