/**
 * List renderer component using headless useList hook.
 * Provides styled list display with optional timeline visualization.
 */

import React, { forwardRef } from 'react';
import { useList, type UseListProps, type ListItem } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface ListProps extends Omit<UseListProps, 'listRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom renderer for list items */
  renderItem?: (props: {
    item: ListItem;
    index: number;
    selected: boolean;
    active: boolean;
    state: any;
  }) => React.ReactNode;
  /** Custom renderer for empty state */
  renderEmpty?: () => React.ReactNode;
  /** Custom renderer for loading state */
  renderLoading?: () => React.ReactNode;
  /** Custom renderer for pagination */
  renderPagination?: (props: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => React.ReactNode;
  /** Custom renderer for search input */
  renderSearch?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => React.ReactNode;
  /** Whether to show borders */
  showBorders?: boolean;
  /** Whether to show dividers between items */
  showDividers?: boolean;
  /** Whether to show item numbers */
  showNumbers?: boolean;
  /** Item size */
  itemSize?: 'sm' | 'md' | 'lg';
  /** List orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Custom empty message */
  emptyMessage?: string;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom search placeholder */
  searchPlaceholder?: string;
  /** Element tag */
  as?: React.ElementType;
  /** Timeline line color */
  timelineColor?: string;
  /** Timeline dot size */
  timelineDotSize?: number;
  /** Animation duration */
  animationDuration?: number;
  /** Compact mode */
  compact?: boolean;
}

/**
 * List component with optional timeline visualization.
 * Provides flexible list rendering with selection, search, sorting, and pagination.
 */
export const List = forwardRef<HTMLElement, ListProps>(({
  className = '',
  style,
  renderItem,
  renderEmpty,
  renderLoading,
  renderPagination,
  renderSearch,
  showBorders = true,
  showDividers = false,
  showNumbers = false,
  itemSize = 'md',
  orientation = 'vertical',
  emptyMessage = 'No items found',
  loadingMessage = 'Loading...',
  searchPlaceholder = 'Search items...',
  as: Component = 'div',
  timelineColor,
  timelineDotSize = 8,
  animationDuration = 200,
  compact = false,
  ...listProps
}: ListProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    classes,
    focusable,
    pressable,
    semantic
  } = useList({
    ...listProps,
    listRef: ref as React.RefObject<HTMLElement>
  });

  // Event handlers
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (state.disabled) return;

    const { key } = event;
    const currentIndex = state.filteredItems.findIndex(item => item.id === state.activeItem);

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'vertical' ? key === 'ArrowDown' : key === 'ArrowRight') {
          const nextIndex = currentIndex < state.filteredItems.length - 1 ? currentIndex + 1 :
                           (listProps.wrapNavigation ? 0 : currentIndex);
          const nextItem = state.filteredItems[nextIndex];
          if (nextItem && !nextItem.disabled) {
            actions.setActiveItem(nextItem.id);
          }
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'vertical' ? key === 'ArrowUp' : key === 'ArrowLeft') {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 :
                          (listProps.wrapNavigation ? state.filteredItems.length - 1 : currentIndex);
          const prevItem = state.filteredItems[prevIndex];
          if (prevItem && !prevItem.disabled) {
            actions.setActiveItem(prevItem.id);
          }
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (state.activeItem !== null) {
          actions.toggleItem(state.activeItem);
        }
        break;
      case 'Home':
        event.preventDefault();
        const firstItem = state.filteredItems.find(item => !item.disabled);
        if (firstItem) {
          actions.setActiveItem(firstItem.id);
        }
        break;
      case 'End':
        event.preventDefault();
        const lastItem = [...state.filteredItems].reverse().find(item => !item.disabled);
        if (lastItem) {
          actions.setActiveItem(lastItem.id);
        }
        break;
      case 'a':
      case 'A':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          actions.selectAll();
        }
        break;
    }
  };

  const handleItemClick = (item: ListItem) => {
    if (item.disabled) return;
    actions.toggleItem(item.id);
    actions.setActiveItem(item.id);
  };

  // Get current page items
  const getCurrentPageItems = (): ListItem[] => {
    if (!state.showPagination) return state.filteredItems;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return state.filteredItems.slice(startIndex, endIndex);
  };

  const currentPageItems = getCurrentPageItems();

  // Format timestamp. The only caller (`{showTimestamps && item.timestamp && ...}`)
  // guarantees a truthy timestamp, so no falsy guard is needed here.
  const formatTimestamp = (timestamp: Date | string | number): string => {
    let date: Date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString();
  };

  // Build CSS classes
  const elementClasses = `
    list
    list-${orientation}
    list-${itemSize}
    ${compact ? 'list-compact' : 'list-normal'}
    ${classes.base}
    ${classes.loading}
    ${classes.disabled}
    ${classes.searchable}
    ${classes.timeline}
    ${classes.paginated}
    ${showBorders ? 'list-bordered' : 'list-borderless'}
    ${showDividers ? 'list-divided' : 'list-undivided'}
    ${showNumbers ? 'list-numbered' : 'list-unnumbered'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build base styles
  const baseStyles: React.CSSProperties = {
    display: orientation === 'horizontal' ? 'flex' : 'block',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: theme.spacing?.sm || '8px',
    padding: theme.spacing?.md || '16px',
    backgroundColor: theme.colors?.background || '#ffffff',
    borderRadius: theme.borderRadius?.md || '6px',
    transition: `all ${animationDuration}ms ease-in-out`,
    position: 'relative',
    ...style
  };

  // Apply state-specific styles
  const stateStyles: React.CSSProperties = {};

  if (state.disabled) {
    stateStyles.opacity = 0.6;
    stateStyles.pointerEvents = 'none';
  }

  if (showBorders) {
    stateStyles.border = `1px solid ${theme.colors?.border || '#e5e7eb'}`;
  }

  // Timeline styles
  const timelineStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: timelineColor || theme.colors?.gray + '30',
    [state.timelinePosition === 'left' ? 'left' : 'right']:
      `calc(${theme.spacing?.lg || '24px'} + ${timelineDotSize / 2 - 1}px)`,
    zIndex: 1
  };

  // Item styles
  const getItemStyles = (item: ListItem, index: number): React.CSSProperties => {
    const isSelected = state.selectedItems.has(item.id);
    const isActive = state.activeItem === item.id;
    const hasTimeline = state.showTimeline;

    const styles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      padding: itemSize === 'sm' ? '8px 12px' : itemSize === 'lg' ? '16px 20px' : '12px 16px',
      borderRadius: theme.borderRadius?.sm || '4px',
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      transition: `all ${animationDuration}ms ease-in-out`,
      position: 'relative',
      backgroundColor: isSelected ? (theme.colors?.primary + '10') : 'transparent',
      border: isSelected ? `1px solid ${theme.colors?.primary + '50'}` :
               showDividers ? `1px solid ${theme.colors?.gray + '20'}` : '1px solid transparent',
      ...(isActive && {
        outline: `2px solid ${theme.colors?.primary || '#2563eb'}`,
        outlineOffset: '1px'
      }),
      ...(item.disabled && {
        opacity: 0.5,
        cursor: 'not-allowed'
      })
    };

    // Add timeline space
    if (hasTimeline) {
      if (state.timelinePosition === 'left') {
        styles.paddingLeft = `calc(${theme.spacing?.lg || '24px'} + ${timelineDotSize}px + 12px)`;
      } else {
        styles.paddingRight = `calc(${theme.spacing?.lg || '24px'} + ${timelineDotSize}px + 12px)`;
      }
    }

    // Add number space
    if (showNumbers) {
      styles.paddingLeft = `calc(${styles.paddingLeft || '16px'} + 32px)`;
    }

    return styles;
  };

  // Timeline dot styles
  const getTimelineDotStyles = (item: ListItem): React.CSSProperties => {
    return {
      position: 'absolute',
      width: `${timelineDotSize}px`,
      height: `${timelineDotSize}px`,
      borderRadius: '50%',
      backgroundColor: item.color || theme.colors?.primary || '#2563eb',
      border: `2px solid ${theme.colors?.background || '#ffffff'}`,
      [state.timelinePosition === 'left' ? 'left' : 'right']:
        `calc(${theme.spacing?.lg || '24px'} - ${timelineDotSize / 2}px)`,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      ...(state.selectedItems.has(item.id) && {
        boxShadow: `0 0 0 4px ${theme.colors?.primary + '20'}`
      })
    };
  };

  // Number styles
  const getNumberStyles = (): React.CSSProperties => {
    return {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: theme.colors?.muted || '#6b7280',
      minWidth: '20px',
      textAlign: 'center'
    };
  };

  // Content styles
  const getContentStyles = (): React.CSSProperties => {
    return {
      flex: 1,
      minWidth: 0
    };
  };

  const getTitleStyles = (): React.CSSProperties => {
    return {
      fontWeight: '500',
      color: theme.colors?.text || '#111827',
      marginBottom: '4px',
      fontSize: itemSize === 'sm' ? '0.875rem' : itemSize === 'lg' ? '1rem' : '0.9375rem'
    };
  };

  const getDescriptionStyles = (): React.CSSProperties => {
    return {
      fontSize: '0.875rem',
      color: theme.colors?.muted || '#6b7280',
      lineHeight: '1.4'
    };
  };

  const getTimestampStyles = (): React.CSSProperties => {
    return {
      fontSize: '0.75rem',
      color: theme.colors?.gray + '50',
      marginTop: '4px'
    };
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
        onKeyDown={handleKeyDown}
        data-testid="list"
        data-orientation={orientation}
        data-item-size={itemSize}
        data-disabled={state.disabled}
        data-loading={state.loading}
        data-timeline={state.showTimeline}
        data-timeline-position={state.timelinePosition}
      >
        {renderLoading && state.loading && renderLoading()}

        {renderSearch && state.searchable && renderSearch({
          value: state.searchQuery,
          onChange: actions.setSearchQuery,
          placeholder: searchPlaceholder
        })}

        {!state.loading && currentPageItems.length === 0 && renderEmpty && renderEmpty()}

        {!state.loading && currentPageItems.map((item, index) => (
          <div key={item.id}>
            {renderItem({
              item,
              index,
              selected: state.selectedItems.has(item.id),
              active: state.activeItem === item.id,
              state
            })}
          </div>
        ))}

        {renderPagination && state.showPagination && renderPagination({
          currentPage: state.currentPage,
          totalPages: state.totalPages,
          itemsPerPage: state.itemsPerPage,
          totalItems: state.filteredItems.length,
          onPageChange: actions.goToPage
        })}
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
      onKeyDown={handleKeyDown}
      data-testid="list"
      data-orientation={orientation}
      data-item-size={itemSize}
      data-disabled={state.disabled}
      data-loading={state.loading}
      data-timeline={state.showTimeline}
      data-timeline-position={state.timelinePosition}
    >
      {/* Timeline line */}
      {state.showTimeline && !state.loading && currentPageItems.length > 0 && (
        <div style={timelineStyles} data-testid="list-timeline" />
      )}

      {/* Search input */}
      {renderSearch && state.searchable && renderSearch({
        value: state.searchQuery,
        onChange: actions.setSearchQuery,
        placeholder: searchPlaceholder
      })}

      {/* Loading state */}
      {renderLoading && state.loading && renderLoading()}

      {/* Empty state */}
      {!state.loading && currentPageItems.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: theme.spacing?.xl || '32px',
          color: theme.colors?.muted || '#6b7280'
        }} data-testid="list-empty">
          {renderEmpty ? renderEmpty() : emptyMessage}
        </div>
      )}

      {/* List items */}
      {!state.loading && currentPageItems.map((item, index) => (
        <div
          key={item.id}
          style={getItemStyles(item, index)}
          onClick={() => handleItemClick(item)}
          data-testid="list-item"
          data-item-id={item.id}
          data-selected={state.selectedItems.has(item.id)}
          data-active={state.activeItem === item.id}
          data-disabled={item.disabled}
          data-level={item.level}
        >
          {/* Timeline dot */}
          {state.showTimeline && (
            <div style={getTimelineDotStyles(item)} data-testid="list-timeline-dot" />
          )}

          {/* Item number */}
          {showNumbers && (
            <div style={getNumberStyles()} data-testid="list-item-number">
              {index + 1}
            </div>
          )}

          {/* Item content */}
          <div style={getContentStyles()}>
            <div style={getTitleStyles()}>
              {item.label}
            </div>

            {item.description && (
              <div style={getDescriptionStyles()}>
                {item.description}
              </div>
            )}

            {state.showTimestamps && item.timestamp && (
              <div style={getTimestampStyles()}>
                {formatTimestamp(item.timestamp)}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {renderPagination && state.showPagination && renderPagination({
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        itemsPerPage: state.itemsPerPage,
        totalItems: state.filteredItems.length,
        onPageChange: actions.goToPage
      })}
    </Component>
  );
});

List.displayName = 'List';

/**
 * List.Timeline component for timeline-specific styling
 */
export const ListTimeline = forwardRef<HTMLElement, Omit<ListProps, 'showTimeline'>>((props, ref) => (
  <List
    {...props}
    ref={ref}
    showTimeline={true}
    showTimestamps={true}
    showDividers={false}
  />
));

ListTimeline.displayName = 'ListTimeline';

/**
 * List.Compact component for compact display
 */
export const ListCompact = forwardRef<HTMLElement, Omit<ListProps, 'compact'>>((props, ref) => (
  <List
    {...props}
    ref={ref}
    compact={true}
    itemSize="sm"
    showDividers={true}
  />
));

ListCompact.displayName = 'ListCompact';

export default List;