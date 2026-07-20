/**
 * Resizable headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages element resizing with handles and constraints.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Resize direction options
 */
export type ResizeDirection = 'horizontal' | 'vertical' | 'both';

/**
 * Resize handle position options
 */
export type HandlePosition = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Resize constraints
 */
export interface ResizeConstraints {
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Minimum height */
  minHeight?: number;
  /** Maximum height */
  maxHeight?: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Aspect ratio value (width/height) */
  aspectRatio?: number;
  /** Whether to snap to grid */
  snapToGrid?: boolean;
  /** Grid size in pixels */
  gridSize?: number;
}

/**
 * Resizable state interface
 */
export interface ResizableState {
  /** Current width */
  width: number;
  /** Current height */
  height: number;
  /** Initial width */
  initialWidth: number;
  /** Initial height */
  initialHeight: number;
  /** Whether currently resizing */
  isResizing: boolean;
  /** Active resize handle */
  activeHandle: HandlePosition | null;
  /** Handle used by the most recent resize (retained after stop so a "stopped"
   * hint can render; cleared on the next start). */
  lastResizeHandle: HandlePosition | null;
  /** Resize direction */
  direction: ResizeDirection;
  /** Resize constraints */
  constraints: ResizeConstraints;
  /** Whether resizing is disabled */
  disabled: boolean;
}

/**
 * Resizable actions interface
 */
export interface ResizableActions {
  /** Start resizing */
  startResize: (handle: HandlePosition, clientX: number, clientY: number) => void;
  /** Update resize during drag */
  updateResize: (clientX: number, clientY: number) => void;
  /** Stop resizing */
  stopResize: () => void;
  /** Set size programmatically */
  setSize: (width: number, height: number) => void;
  /** Set width programmatically */
  setWidth: (width: number) => void;
  /** Set height programmatically */
  setHeight: (height: number) => void;
  /** Reset to initial size */
  reset: () => void;
  /** Set constraints */
  setConstraints: (constraints: Partial<ResizeConstraints>) => void;
}

/**
 * Props for useResizable hook
 */
export interface UseResizableProps {
  /** Initial width */
  initialWidth?: number;
  /** Initial height */
  initialHeight?: number;
  /** Width */
  width?: number;
  /** Height */
  height?: number;
  /** Resize direction */
  direction?: ResizeDirection;
  /** Resize constraints */
  constraints?: ResizeConstraints;
  /** Enabled resize handles */
  handles?: HandlePosition[];
  /** Whether resizing is disabled */
  disabled?: boolean;
  /** Whether to show resize handles */
  showHandles?: boolean;
  /** Custom resize class name */
  resizeClassName?: string;
  /** Callback when resize starts */
  onResizeStart?: (handle: HandlePosition, width: number, height: number) => void;
  /** Callback during resize */
  onResize?: (width: number, height: number) => void;
  /** Callback when resize ends */
  onResizeEnd?: (width: number, height: number) => void;
  /** Callback when size changes */
  onSizeChange?: (width: number, height: number) => void;
}

/**
 * Return type for useResizable hook
 */
export interface UseResizableReturns {
  /** Current resizable state */
  state: ResizableState;
  /** Resizable actions */
  actions: ResizableActions;
  /** Computed properties */
  computed: {
    /** Available handles based on direction */
    availableHandles: HandlePosition[];
    /** Whether element is at minimum size */
    isAtMinSize: boolean;
    /** Whether element is at maximum size */
    isAtMaxSize: boolean;
    /** Current aspect ratio */
    aspectRatio: number;
  };
  /** Resizable attributes */
  resizableAttributes: {
    role: string;
    'aria-label': string;
    'aria-roledescription': string;
    style: React.CSSProperties;
  };
  /** Get handle attributes */
  getHandleAttributes: (handle: HandlePosition) => {
    'aria-label': string;
    'aria-pressed': boolean;
    role: string;
    tabIndex: number;
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    disabled: boolean;
    className: string;
  };
  /** Get handle styles */
  getHandleStyles: (handle: HandlePosition) => React.CSSProperties;
}

/**
 * Resizable hook implementation
 * @param props - Resizable configuration props
 * @returns Resizable state, actions, computed properties, and attributes
 */
export function useResizable(props: UseResizableProps = {}): UseResizableReturns {
  const {
    initialWidth = 200,
    initialHeight = 200,
    width: controlledWidth,
    height: controlledHeight,
    direction = 'both',
    constraints: initialConstraints = {},
    handles: enabledHandles = ['right', 'bottom', 'bottom-right'],
    disabled = false,
    showHandles = true,
    resizeClassName = 'resizable',
    onResizeStart,
    onResize,
    onResizeEnd,
    onSizeChange
  } = props;

  // State management
  const [internalWidth, setInternalWidth] = useState(initialWidth);
  const [internalHeight, setInternalHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const [lastResizeHandle, setLastResizeHandle] = useState<HandlePosition | null>(null);
  const [constraints, setConstraints] = useState<ResizeConstraints>(initialConstraints);

  // Refs for tracking resize
  const resizeDataRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  });

  // Live (non-stale) mirror of isResizing/activeHandle so action handlers
  // invoked synchronously after startResize (e.g. the keyboard arrow flow,
  // which calls startResize -> updateResize -> stopResize in one tick) see
  // the just-started state instead of the closure's stale render value.
  const isResizingRef = useRef(false);
  const activeHandleRef = useRef<HandlePosition | null>(null);

  // Use controlled or uncontrolled values
  const width = controlledWidth !== undefined ? controlledWidth : internalWidth;
  const height = controlledHeight !== undefined ? controlledHeight : internalHeight;

  // Apply constraints to size
  const constrainedWidth = Math.max(
    constraints.minWidth || 0,
    Math.min(constraints.maxWidth || Infinity, width)
  );
  const constrainedHeight = Math.max(
    constraints.minHeight || 0,
    Math.min(constraints.maxHeight || Infinity, height)
  );

  // Calculate available handles based on direction
  const availableHandles = enabledHandles.filter(handle => {
    switch (direction) {
      case 'horizontal':
        return ['left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle);
      case 'vertical':
        return ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handle);
      default:
        return true;
    }
  });

  // Snap to grid if enabled
  const snapToGrid = useCallback((value: number) => {
    if (!constraints.snapToGrid || !constraints.gridSize) return value;
    return Math.round(value / constraints.gridSize) * constraints.gridSize;
  }, [constraints.snapToGrid, constraints.gridSize]);

  // Calculate new dimensions during resize
  const calculateNewDimensions = useCallback((
    handle: HandlePosition,
    deltaX: number,
    deltaY: number,
    startWidth: number,
    startHeight: number
  ) => {
    let newWidth = startWidth;
    let newHeight = startHeight;

    switch (handle) {
      case 'right':
        newWidth = startWidth + deltaX;
        break;
      case 'left':
        newWidth = startWidth - deltaX;
        break;
      case 'bottom':
        newHeight = startHeight + deltaY;
        break;
      case 'top':
        newHeight = startHeight - deltaY;
        break;
      case 'bottom-right':
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'bottom-left':
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'top-right':
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        break;
      case 'top-left':
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
        break;
    }

    // Apply constraints
    if (constraints.minWidth) newWidth = Math.max(constraints.minWidth, newWidth);
    if (constraints.maxWidth) newWidth = Math.min(constraints.maxWidth, newWidth);
    if (constraints.minHeight) newHeight = Math.max(constraints.minHeight, newHeight);
    if (constraints.maxHeight) newHeight = Math.min(constraints.maxHeight, newHeight);

    // Maintain aspect ratio if required
    if (constraints.maintainAspectRatio && constraints.aspectRatio) {
      const aspectRatio = constraints.aspectRatio;
      if (direction === 'horizontal' || ['right', 'left', 'top-right', 'bottom-right', 'top-left', 'bottom-left'].includes(handle)) {
        newHeight = newWidth / aspectRatio;
      } else {
        // reason: when the branch above is false, the handle must be 'top' or
        // 'bottom' (the only positions absent from the array above), both of
        // which are vertical-axis handles — so this path always applies here.
        newWidth = newHeight * aspectRatio;
      }
    }

    // Snap to grid
    newWidth = snapToGrid(newWidth);
    newHeight = snapToGrid(newHeight);

    return { width: newWidth, height: newHeight };
  }, [constraints, direction, snapToGrid]);

  // Actions
  const actions = useMemo(() => {
    const startResize = (handle: HandlePosition, clientX: number, clientY: number) => {
      if (disabled) return;

      resizeDataRef.current = {
        startX: clientX,
        startY: clientY,
        startWidth: constrainedWidth,
        startHeight: constrainedHeight
      };

      setIsResizing(true);
      setActiveHandle(handle);
      setLastResizeHandle(handle);
      isResizingRef.current = true;
      activeHandleRef.current = handle;
      onResizeStart?.(handle, constrainedWidth, constrainedHeight);
    };

    const updateResize = (clientX: number, clientY: number) => {
      if (!isResizingRef.current || !activeHandleRef.current || disabled) return;

      const { startX, startY, startWidth, startHeight } = resizeDataRef.current;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      const { width: newWidth, height: newHeight } = calculateNewDimensions(
        activeHandleRef.current,
        deltaX,
        deltaY,
        startWidth,
        startHeight
      );

      if (controlledWidth === undefined) {
        setInternalWidth(newWidth);
      }
      if (controlledHeight === undefined) {
        setInternalHeight(newHeight);
      }

      onResize?.(newWidth, newHeight);
      onSizeChange?.(newWidth, newHeight);
    };

    const stopResize = () => {
      if (!isResizingRef.current) return;

      setIsResizing(false);
      setActiveHandle(null);
      isResizingRef.current = false;
      activeHandleRef.current = null;
      onResizeEnd?.(constrainedWidth, constrainedHeight);
    };

    const setSize = (newWidth: number, newHeight: number) => {
      if (disabled) return;

      const { width: finalWidth, height: finalHeight } = calculateNewDimensions(
        'bottom-right',
        newWidth - constrainedWidth,
        newHeight - constrainedHeight,
        constrainedWidth,
        constrainedHeight
      );

      if (controlledWidth === undefined) {
        setInternalWidth(finalWidth);
      }
      if (controlledHeight === undefined) {
        setInternalHeight(finalHeight);
      }

      onSizeChange?.(finalWidth, finalHeight);
    };

    const setWidth = (newWidth: number) => {
      setSize(newWidth, constrainedHeight);
    };

    const setHeight = (newHeight: number) => {
      setSize(constrainedWidth, newHeight);
    };

    const reset = () => {
      if (disabled) return;
      setSize(initialWidth, initialHeight);
    };

    const setConstraintsAction = (newConstraints: Partial<ResizeConstraints>) => {
      setConstraints(prev => ({ ...prev, ...newConstraints }));
    };

    return {
      startResize,
      updateResize,
      stopResize,
      setSize,
      setWidth,
      setHeight,
      reset,
      setConstraints: setConstraintsAction
    };
  }, [
    disabled,
    isResizing,
    activeHandle,
    constrainedWidth,
    constrainedHeight,
    calculateNewDimensions,
    controlledWidth,
    controlledHeight,
    initialWidth,
    initialHeight,
    onResizeStart,
    onResize,
    onResizeEnd,
    onSizeChange
  ]);

  // Global mouse/touch event handlers
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      actions.updateResize(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      actions.updateResize(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => {
      actions.stopResize();
    };

    const handleTouchEnd = () => {
      actions.stopResize();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing, actions]);

  // Computed properties
  const computed = useMemo(() => {
    const isAtMinSize = (
      constrainedWidth <= (constraints.minWidth || 0) ||
      constrainedHeight <= (constraints.minHeight || 0)
    );
    const isAtMaxSize = (
      constrainedWidth >= (constraints.maxWidth || Infinity) ||
      constrainedHeight >= (constraints.maxHeight || Infinity)
    );
    const aspectRatio = constrainedHeight > 0 ? constrainedWidth / constrainedHeight : 1;

    return {
      availableHandles,
      isAtMinSize,
      isAtMaxSize,
      aspectRatio
    };
  }, [availableHandles, constrainedWidth, constrainedHeight, constraints]);

  // Build state
  const state: ResizableState = {
    width: constrainedWidth,
    height: constrainedHeight,
    initialWidth,
    initialHeight,
    isResizing,
    activeHandle,
    lastResizeHandle,
    direction,
    constraints,
    disabled
  };

  // Build resizable attributes
  const resizableAttributes = {
    role: 'region',
    'aria-label': 'Resizable element',
    'aria-roledescription': 'Resizable element with drag handles',
    style: {
      width: constrainedWidth,
      height: constrainedHeight,
      position: 'relative' as const
    }
  };

  // Build handle attributes
  const getHandleAttributes = (handle: HandlePosition) => ({
    'aria-label': `Resize handle ${handle.replace('-', ' ')}`,
    'aria-pressed': isResizing && activeHandle === handle,
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    onMouseDown: (event: React.MouseEvent) => {
      event.preventDefault();
      actions.startResize(handle, event.clientX, event.clientY);
    },
    onTouchStart: (event: React.TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      actions.startResize(handle, touch.clientX, touch.clientY);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (disabled) return;

      const step = event.shiftKey ? 10 : 1;
      let deltaX = 0;
      let deltaY = 0;

      switch (event.key) {
        case 'ArrowRight':
          deltaX = step;
          break;
        case 'ArrowLeft':
          deltaX = -step;
          break;
        case 'ArrowDown':
          deltaY = step;
          break;
        case 'ArrowUp':
          deltaY = -step;
          break;
        default:
          return;
      }

      event.preventDefault();
      if (!isResizing) {
        actions.startResize(handle, 0, 0);
      }
      actions.updateResize(deltaX, deltaY);
      actions.stopResize();
    },
    disabled,
    className: `resize-handle resize-handle-${handle} ${isResizing && activeHandle === handle ? 'resize-handle-active' : ''} ${disabled ? 'resize-handle-disabled' : ''}`
  });

  // Build handle styles
  const getHandleStyles = (handle: HandlePosition): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1
    };

    switch (handle) {
      case 'top':
        return { ...baseStyles, top: 0, left: 0, right: 0, height: '8px', cursor: 'ns-resize' };
      case 'right':
        return { ...baseStyles, top: 0, right: 0, bottom: 0, width: '8px', cursor: 'ew-resize' };
      case 'bottom':
        return { ...baseStyles, bottom: 0, left: 0, right: 0, height: '8px', cursor: 'ns-resize' };
      case 'left':
        return { ...baseStyles, top: 0, left: 0, bottom: 0, width: '8px', cursor: 'ew-resize' };
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0, width: '12px', height: '12px', cursor: 'nw-resize' };
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0, width: '12px', height: '12px', cursor: 'ne-resize' };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0, width: '12px', height: '12px', cursor: 'sw-resize' };
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0, width: '12px', height: '12px', cursor: 'se-resize' };
      default:
        return baseStyles;
    }
  };

  return useMemo(() => ({
    state,
    actions,
    computed,
    resizableAttributes,
    getHandleAttributes,
    getHandleStyles
  }), [state, actions, computed, resizableAttributes, getHandleAttributes, getHandleStyles]);
}