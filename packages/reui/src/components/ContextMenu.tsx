/**
 * Context Menu renderer component.
 * Provides visual representation for context menu components.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useContextMenu, type ContextMenuItem } from '../hooks';
import type { UseContextMenuProps } from '../hooks';

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
  }: ContextMenuProps, ref) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const {
      state,
      handlers,
      attributes
    } = useContextMenu(props);

    const { items, variant, alignment, direction, position } = state;

    // Size classes
    const sizeClasses = {
      default: ' ',
      compact: ' ',
      minimal: ' '
    };

    // Alignment classes
    const alignmentClasses = {
      start: direction === 'rtl' ? '' : '',
      center: ' transform -translate-x-1/2',
      end: direction === 'rtl' ? '' : ''
    };

    const menuClasses = `
          
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
            className="  "
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
        className: isFocused ? '' : ''
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
        {...attributes}
        style={{
          ...attributes.style,
          ...style
        }}
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
         
      
    ${item.disabled ? ' ' : ' '}
    ${focused ? '' : ''}
    ${item.destructive ? ' ' : ''}
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
      <div className="   ">
        {/* Icon */}
        {item.icon && (
          <span className=" ">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span className=" ">
          {item.label}
        </span>

        {/* Description */}
        {item.description && (
          <span className="  ">
            {item.description}
          </span>
        )}

        {/* Shortcut */}
        {item.shortcut && (
          <span className="  ">
            {item.shortcut}
          </span>
        )}

        {/* Checkbox/Radio indicator */}
        {item.type === 'checkbox' && (
          <span className=" ">
            {item.checked ? '✓' : ''}
          </span>
        )}

        {item.type === 'radio' && (
          <span className=" ">
            {item.checked ? '●' : ''}
          </span>
        )}

        {/* Submenu indicator */}
        {item.type === 'submenu' && (
          <span className=" ">
            ▶
          </span>
        )}
      </div>
    </div>
  );
};

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;