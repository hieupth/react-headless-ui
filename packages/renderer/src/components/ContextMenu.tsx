/**
 * Context Menu renderer component.
 * Provides visual representation for context menu components.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useContextMenu, type ContextMenuItem } from '@react-ui-forge/core';
import type { UseContextMenuProps } from '@react-ui-forge/core';

/**
 * Context Menu component props
 */
export interface ContextMenuProps extends UseContextMenuProps {
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Custom item renderer */
  itemRenderer?: (item: ContextMenuItem, index: number, props: any) => React.ReactNode;
  /** Custom separator renderer */
  separatorRenderer?: (index: number) => React.ReactNode;
}

/**
 * Context Menu Trigger component props
 */
export interface ContextMenuTriggerProps {
  /** Children to render as trigger */
  children: React.ReactNode;
  /** Context menu instance */
  menu: {
    state: any;
    handlers: any;
  };
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Whether to prevent default context menu */
  preventDefault?: boolean;
}

/**
 * Context Menu Item component props
 */
export interface ContextMenuItemProps {
  /** Item data */
  item: ContextMenuItem;
  /** Item index */
  index: number;
  /** Whether item is focused */
  focused: boolean;
  /** Click handler */
  onClick: () => void;
  /** Focus handler */
  onFocus: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Context Menu component
 */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({
    className = '',
    style,
    itemRenderer,
    separatorRenderer,
    ...props
  }, ref) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const {
      state,
      handlers,
      attributes
    } = useContextMenu(props);

    const { items, variant, alignment, direction, position } = state;

    // Size classes
    const sizeClasses = {
      default: 'py-1 min-w-[160px]',
      compact: 'py-0.5 min-w-[140px]',
      minimal: 'py-0 min-w-[120px]'
    };

    // Alignment classes
    const alignmentClasses = {
      start: direction === 'rtl' ? 'right-0' : 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: direction === 'rtl' ? 'left-0' : 'right-0'
    };

    const menuClasses = `
      bg-white border border-gray-200 rounded-lg shadow-lg
      ${sizeClasses[variant]}
      ${alignmentClasses[alignment]}
      ${className}
    `;

    // Focus menu when opened
    useEffect(() => {
      if (state.open && menuRef.current) {
        menuRef.current.focus();
      }
    }, [state.open]);

    // Render menu item
    const renderMenuItem = (item: ContextMenuItem, index: number, itemIndex: number) => {
      if (item.type === 'separator') {
        if (separatorRenderer) {
          return separatorRenderer(index);
        }
        return (
          <div
            key={item.id || `separator-${index}`}
            className="my-1 border-t border-gray-200"
            role="separator"
            aria-orientation="horizontal"
          />
        );
      }

      const isFocused = state.focusedIndex === itemIndex;
      const itemProps = {
        item,
        index: itemIndex,
        focused: isFocused,
        onClick: () => handlers.handleItemClick(item, itemIndex),
        onFocus: () => handlers.handleItemFocus(itemIndex),
        className: isFocused ? 'bg-gray-100' : ''
      };

      if (itemRenderer) {
        return (
          <React.Fragment key={item.id || `item-${index}`}>
            {itemRenderer(item, itemIndex, itemProps)}
          </React.Fragment>
        );
      }

      return <ContextMenuItemComponent key={item.id || `item-${index}`} {...itemProps} />;
    };

    // Get item index for navigation (skip separators)
    const getItemIndex = (items: ContextMenuItem[], currentIndex: number): number => {
      let itemIndex = -1;
      for (let i = 0; i <= currentIndex; i++) {
        if (items[i].type !== 'separator') {
          itemIndex++;
        }
      }
      return itemIndex;
    };

    const content = (
      <div
        ref={menuRef}
        className={menuClasses}
        style={{
          ...style,
          ...attributes.style
        }}
        {...attributes}
        data-testid="context-menu"
      >
        {items.map((item, index) => {
          const itemIndex = getItemIndex(items, index);
          return renderMenuItem(item, index, itemIndex);
        })}
      </div>
    );

    // Use portal if enabled
    if (props.portal && state.open) {
      return createPortal(content, document.body);
    }

    return state.open ? content : null;
  }
);

/**
 * Context Menu Trigger component
 */
export const ContextMenuTrigger: React.FC<ContextMenuTriggerProps> = ({
  children,
  menu,
  className = '',
  style,
  preventDefault = true
}) => {
  const handleContextMenu = (event: React.MouseEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }
    menu.handlers.handleContextMenu(event);
  };

  return (
    <div
      className={className}
      style={style}
      onContextMenu={handleContextMenu}
      data-context-menu-trigger
    >
      {children}
    </div>
  );
};

/**
 * Context Menu Item component
 */
const ContextMenuItemComponent: React.FC<ContextMenuItemProps> = ({
  item,
  index,
  focused,
  onClick,
  onFocus,
  className = '',
  style
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  // Focus item when focused prop changes
  useEffect(() => {
    if (focused && itemRef.current) {
      itemRef.current.focus();
    }
  }, [focused]);

  const handleClick = () => {
    if (!item.disabled) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (item.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  // Base classes
  const baseClasses = `
    px-3 py-2 text-sm cursor-pointer transition-colors duration-200
    flex items-center justify-between
    ${item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
    ${focused ? 'bg-gray-100' : ''}
    ${item.destructive ? 'text-red-600 hover:bg-red-50' : ''}
    ${className}
  `;

  return (
    <div
      ref={itemRef}
      className={baseClasses}
      style={style}
      role="menuitem"
      aria-disabled={item.disabled}
      aria-checked={item.checked}
      tabIndex={focused ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      data-testid={`context-menu-item-${item.id}`}
    >
      <div className="flex items-center flex-1 min-w-0">
        {/* Icon */}
        {item.icon && (
          <span className="mr-3 flex-shrink-0">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span className="flex-1 truncate">
          {item.label}
        </span>

        {/* Description */}
        {item.description && (
          <span className="ml-2 text-xs text-gray-500">
            {item.description}
          </span>
        )}

        {/* Shortcut */}
        {item.shortcut && (
          <span className="ml-2 text-xs text-gray-500">
            {item.shortcut}
          </span>
        )}

        {/* Checkbox/Radio indicator */}
        {item.type === 'checkbox' && (
          <span className="ml-2 flex-shrink-0">
            {item.checked ? '✓' : ''}
          </span>
        )}

        {item.type === 'radio' && (
          <span className="ml-2 flex-shrink-0">
            {item.checked ? '●' : ''}
          </span>
        )}

        {/* Submenu indicator */}
        {item.type === 'submenu' && (
          <span className="ml-2 flex-shrink-0">
            ▶
          </span>
        )}
      </div>
    </div>
  );
};

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;