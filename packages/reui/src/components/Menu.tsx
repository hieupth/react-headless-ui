/**
 * Menu renderer component using headless useMenu hook.
 * Provides styled menu with keyboard navigation and selection.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useMenu } from '../hooks';
import type { UseMenuProps } from '../hooks';
import type { MenuItem } from '../hooks/useMenu';

/**
 * Props of the element passed as the Menu trigger. Used to type the trigger's
 * existing event handlers when cloning it with menu-managed props.
 */
type TriggerProps = {
  onClick?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  ref?: React.Ref<HTMLElement>;
};

export interface MenuProps extends UseMenuProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Menu trigger element */
  children: React.ReactElement;
  /** Custom render function */
  render?: (props: MenuRenderProps) => React.ReactElement;
  /** Custom menu render function */
  renderMenu?: (props: MenuRenderProps) => React.ReactNode;
  /** Custom item render function */
  renderItem?: (item: MenuItem, props: MenuItemRenderProps) => React.ReactNode;
}

export interface MenuRenderProps {
  /** Computed class names */
  className: string;
  /** Menu state */
  open: boolean;
  focused: boolean;
  pressed: boolean;
  highlightedIndex: number;
  selectedKeys: Set<string>;
  /** Event handlers */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleTriggerClick: () => void;
  handleTriggerEnter: () => void;
  handleTriggerLeave: () => void;
  /** Semantic attributes */
  triggerAttributes: Record<string, any>;
  menuAttributes: Record<string, any>;
  /** References */
  triggerRef: React.RefObject<HTMLElement | null>;
  menuRef: React.RefObject<HTMLUListElement | null>;
  /** Flattened menu items */
  items: MenuItem[];
  /** Children */
  children: React.ReactElement;
}

export interface MenuItemRenderProps {
  /** Menu item */
  item: MenuItem;
  /** Item index */
  index: number;
  /** Whether item is highlighted */
  highlighted: boolean;
  /** Whether item is selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Mouse enter handler */
  onMouseEnter: () => void;
}

/**
 * Clean (non-indexed) view of MenuProps for destructuring. MenuProps inherits
 * index signatures from the semantic/focusable/pressable mixins, which widen
 * every destructured field to `unknown`. This restores concrete field types.
 */
type MenuResolvedProps = UseMenuProps & {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactElement;
  render?: (props: MenuRenderProps) => React.ReactElement;
  renderMenu?: (props: MenuRenderProps) => React.ReactNode;
  renderItem?: (item: MenuItem, props: MenuItemRenderProps) => React.ReactNode;
};

/**
 * Styled menu component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Menu = forwardRef<HTMLElement, MenuProps>((props, ref) => {
  const {
    className,
    style,
    children,
    render,
    renderMenu,
    renderItem,
    ...menuProps
  } = props as MenuResolvedProps;
  const menu = useMenu(menuProps);

  // Default menu item render function
  const defaultItemRender = (item: MenuItem, props: MenuItemRenderProps) => {
    const baseClasses = 'flex items-center px-3 py-2 text-sm cursor-default transition-colors';
    const disabledClasses = item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100';
    const highlightedClasses = props.highlighted ? 'bg-blue-50 text-blue-700' : 'text-gray-700';
    const selectedClasses = props.selected ? 'bg-blue-100 text-blue-800 font-medium' : '';

    return (
      <li
        key={item.key}
        role="menuitem"
        className={`${baseClasses} ${disabledClasses} ${highlightedClasses} ${selectedClasses}`}
        {...(!item.disabled ? { onClick: props.onClick } : {})}
        {...(!item.disabled ? { onMouseEnter: props.onMouseEnter } : {})}
        tabIndex={-1}
        aria-disabled={item.disabled}
        aria-selected={props.selected}
      >
        {/* Icon */}
        {item.icon && (
          <span className="mr-3 flex-shrink-0 w-4 h-4">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span className="flex-1 truncate">{item.label}</span>

        {/* Shortcut */}
        {item.shortcut && (
          <span className="ml-3 text-xs text-gray-500 font-mono">
            {item.shortcut}
          </span>
        )}

        {/* Selection indicator */}
        {props.selected && (
          <span className="ml-3 flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </li>
    );
  };

  // Default menu render function
  const defaultMenuRender = (props: MenuRenderProps) => {
    // Clone trigger element with menu props
    const triggerChild = props.children as React.ReactElement<TriggerProps>;
    const triggerProps = triggerChild.props;
    const triggerElement = React.cloneElement(triggerChild, {
      ref: props.triggerRef,
      ...props.triggerAttributes,
      onClick: (e: React.MouseEvent) => {
        triggerProps.onClick?.(e);
        props.handleTriggerClick?.();
      },
      onMouseEnter: (e: React.MouseEvent) => {
        triggerProps.onMouseEnter?.(e);
        props.handleTriggerEnter?.();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        triggerProps.onMouseLeave?.(e);
        props.handleTriggerLeave?.();
      }
    });

    // Menu content
    const menuContent = props.open && (
      <div className="fixed z-50">
        <ul
          ref={props.menuRef}
          className={`py-1 min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg ${className || ''}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            ...style
          }}
          {...props.menuAttributes}
          onKeyDown={props.handleKeyDown}
        >
          {props.items.map((item, index) => {
            const isSelected = props.selectedKeys.has(item.key);
            const isHighlighted = index === props.highlightedIndex;

            const itemProps: MenuItemRenderProps = {
              item,
              index,
              highlighted: isHighlighted,
              selected: isSelected,
              onClick: () => menu.selectItem(item.key),
              onMouseEnter: () => menu.highlightItem(index)
            };

            return renderItem ? renderItem(item, itemProps) : defaultItemRender(item, itemProps);
          })}
        </ul>
      </div>
    );

    return (
      <>
        {triggerElement}
        {/* Portal for menu */}
        {menuContent && createPortal(menuContent, document.body)}
      </>
    );
  };

  // Render props
  const renderProps: MenuRenderProps = {
    className: className || '',
    open: menu.open,
    focused: menu.focused,
    pressed: menu.pressed,
    highlightedIndex: menu.highlightedIndex,
    selectedKeys: menu.selectedKeys,
    handleKeyDown: menu.handleKeyDown,
    handleTriggerClick: menu.handleTriggerClick,
    handleTriggerEnter: menu.handleTriggerEnter,
    handleTriggerLeave: menu.handleTriggerLeave,
    triggerAttributes: menu.triggerAttributes,
    menuAttributes: menu.menuAttributes,
    triggerRef: menu.triggerRef,
    menuRef: menu.menuRef,
    items: menu.getFlattenedItems(),
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultMenuRender(renderProps);
});

Menu.displayName = 'Menu';

/**
 * Menu separator component.
 */
export interface MenuSeparatorProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const MenuSeparator = forwardRef<HTMLLIElement, MenuSeparatorProps>(({
  className,
  style
}, ref) => (
  <li
    ref={ref}
    role="separator"
    className={`border-t border-gray-200 my-1 ${className || ''}`}
    style={style}
  />
));

MenuSeparator.displayName = 'MenuSeparator';

/**
 * Menu group component for grouping related items.
 */
export interface MenuGroupProps {
  /** Group title */
  title?: string;
  /** Group items */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(({
  title,
  children,
  className,
  style
}, ref) => (
  <div
    ref={ref}
    className={className || ''}
    style={style}
  >
    {title && (
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </div>
    )}
    <div>{children}</div>
  </div>
));

MenuGroup.displayName = 'MenuGroup';

/**
 * Simple dropdown menu wrapper.
 */
export interface DropdownMenuProps {
  /** Menu items */
  items: MenuItem[];
  /** Menu trigger */
  children: React.ReactElement;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const DropdownMenu = forwardRef<HTMLElement, DropdownMenuProps>(({
  items,
  children,
  className,
  style
}, ref) => (
  <Menu
    items={items}
    trigger="click"
    closeOnSelection={true}
    closeOnOutsideClick={true}
    className={className}
    style={style}
    ref={ref}
  >
    {children}
  </Menu>
));

DropdownMenu.displayName = 'DropdownMenu';

/**
 * Context menu wrapper.
 */
export const ContextMenu = forwardRef<HTMLElement, DropdownMenuProps>(({
  items,
  children,
  className,
  style
}, ref) => {
  const contextMenu = useMenu({
    items,
    trigger: 'context',
    closeOnSelection: true,
    closeOnOutsideClick: true
  });

  const triggerChild = children as React.ReactElement<TriggerProps>;
  return React.cloneElement(triggerChild, {
    ref: contextMenu.triggerRef,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      triggerChild.props.onContextMenu?.(e);
      contextMenu.toggleMenu();
    },
    ...contextMenu.triggerAttributes
  });
});

ContextMenu.displayName = 'ContextMenu';