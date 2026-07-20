/**
 * Sortable renderer component using headless useSortable hook.
 * Provides styled drag-and-drop reordering functionality.
 */

import React, { forwardRef } from 'react';
import { useSortable, type UseSortableProps, type SortableItem } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface SortableProps extends Omit<UseSortableProps, 'sortableRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom renderer for items */
  renderItem?: (props: {
    item: SortableItem;
    index: number;
    isDragging: boolean;
    isDragOver: boolean;
    dragProps: {
      draggable: boolean;
      onDragStart: (e: React.DragEvent) => void;
      onDragEnd: (e: React.DragEvent) => void;
      onDragOver: (e: React.DragEvent) => void;
      onDrop: (e: React.DragEvent) => void;
    };
  }) => React.ReactNode;
  /** Custom drag handle */
  dragHandle?: React.ReactNode;
  /** Show drop indicator */
  showDropIndicator?: boolean;
  /** Drop indicator position */
  dropIndicatorPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Element tag */
  as?: React.ElementType;
}

/**
 * Sortable component with drag-and-drop reordering behavior.
 * Provides flexible list reordering with visual feedback and animations.
 */
export const Sortable = forwardRef<HTMLElement, SortableProps>(({
  className = '',
  style,
  renderItem,
  dragHandle,
  showDropIndicator = true,
  dropIndicatorPosition = 'bottom',
  as: Component = 'div',
  ...sortableProps
}: SortableProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    classes,
    focusable,
    pressable,
    semantic
  } = useSortable({
    ...sortableProps,
    sortableRef: ref as React.RefObject<HTMLElement>
  });

  // Event handlers
  const handleDragStart = (item: SortableItem, event: React.DragEvent) => {
    actions.startDrag(item, event.nativeEvent);
  };

  const handleDragEnd = (event: React.DragEvent) => {
    actions.endDrag();
  };

  const handleDragOver = (index: number, event: React.DragEvent) => {
    actions.handleDragOver(index, event.nativeEvent);
  };

  const handleDrop = (index: number, event: React.DragEvent) => {
    actions.handleDrop(index, event.nativeEvent);
  };

  // Build CSS classes
  const elementClasses = `
    sortable
    sortable-${state.direction}
    ${classes.base}
    ${classes.dragging}
    ${classes.dropZone}
    ${classes.disabled}
    ${classes.locked}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build base styles
  const baseStyles: React.CSSProperties = {
    display: state.direction === 'horizontal' ? 'flex' : 'block',
    flexDirection: state.direction === 'horizontal' ? 'row' : 'column',
    gap: theme.spacing?.sm || '8px',
    padding: theme.spacing?.md || '16px',
    backgroundColor: theme.colors?.background || '#ffffff',
    borderRadius: theme.borderRadius?.md || '6px',
    border: `1px solid ${theme.colors?.border || '#e5e7eb'}`,
    position: 'relative',
    ...style
  };

  // Item styles
  const getItemStyles = (item: SortableItem, index: number): React.CSSProperties => {
    const isDragging = state.draggingItem?.id === item.id;
    const isDragOver = state.dragOverIndex === index;

    return {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing?.md || '16px',
      backgroundColor: isDragging ? (theme.colors?.primary + '10') : (theme.colors?.background || '#ffffff'),
      border: `1px solid ${isDragging ? (theme.colors?.primary + '50') : (theme.colors?.border || '#e5e7eb')}`,
      borderRadius: theme.borderRadius?.sm || '4px',
      cursor: item.disabled ? 'not-allowed' : 'grab',
      opacity: isDragging ? 0.5 : 1,
      transition: state.animated ? 'all 200ms ease-in-out' : 'none',
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      boxShadow: isDragging ? (theme.colors?.primary + '20' + ' 0 4px 12px') : 'none',
      position: 'relative',
      zIndex: isDragging ? 1000 : 1
    };
  };

  // Drag handle styles
  const getDragHandleStyles = (): React.CSSProperties => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      marginRight: theme.spacing?.md || '16px',
      color: theme.colors?.muted || '#6b7280',
      cursor: 'grab',
      flexShrink: 0
    };
  };

  // Drop indicator styles
  const getDropIndicatorStyles = (): React.CSSProperties => {
    const isVertical = state.direction === 'vertical';
    const size = '2px';
    const color = theme.colors?.primary || '#2563eb';

    const baseIndicatorStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: color,
      borderRadius: '1px',
      zIndex: 2
    };

    if (isVertical) {
      return {
        ...baseIndicatorStyles,
        left: '0',
        right: '0',
        height: size
      };
    } else {
      return {
        ...baseIndicatorStyles,
        top: '0',
        bottom: '0',
        width: size
      };
    }
  };

  // Render custom item
  if (renderItem) {
    return (
      <Component
        ref={ref}
        className={elementClasses}
        style={baseStyles}
        {...attributes}
        {...focusable.attributes}
        {...pressable.attributes}
        {...semantic.attributes}
        data-testid="sortable"
        data-direction={state.direction}
        data-disabled={state.disabled}
        data-locked={state.locked}
      >
        {state.items.map((item, index) => (
          <div key={item.id}>
            {renderItem({
              item,
              index,
              isDragging: state.draggingItem?.id === item.id,
              isDragOver: state.dragOverIndex === index,
              dragProps: {
                draggable: !item.disabled && !state.disabled && !state.locked,
                onDragStart: (e) => handleDragStart(item, e),
                onDragEnd: handleDragEnd,
                onDragOver: (e) => handleDragOver(index, e),
                onDrop: (e) => handleDrop(index, e)
              }
            })}
          </div>
        ))}
      </Component>
    );
  }

  // Render default content
  return (
    <Component
      ref={ref}
      className={elementClasses}
      style={baseStyles}
      {...attributes}
      {...focusable.attributes}
      {...pressable.attributes}
      {...semantic.attributes}
      data-testid="sortable"
      data-direction={state.direction}
      data-disabled={state.disabled}
      data-locked={state.locked}
    >
      {state.items.map((item, index) => (
        <div
          key={item.id}
          style={getItemStyles(item, index)}
          draggable={!item.disabled && !state.disabled && !state.locked}
          onDragStart={(e) => handleDragStart(item, e)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(index, e)}
          onDrop={(e) => handleDrop(index, e)}
          data-testid="sortable-item"
          data-item-id={item.id}
          data-index={index}
          data-dragging={state.draggingItem?.id === item.id}
          data-drag-over={state.dragOverIndex === index}
          data-disabled={item.disabled}
        >
          {state.showHandles && (
            <div style={getDragHandleStyles()} data-testid="sortable-drag-handle">
              {dragHandle || (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </div>
          )}
          <div style={{ flex: 1 }}>
            {item.label}
          </div>
        </div>
      ))}
      {showDropIndicator && state.dropZoneActive && (
        <div style={getDropIndicatorStyles()} data-testid="sortable-drop-indicator" />
      )}
    </Component>
  );
});

Sortable.displayName = 'Sortable';

export default Sortable;