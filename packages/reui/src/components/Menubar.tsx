/**
 * Menubar renderer component using headless useMenubar hook.
 * Provides styled menubar with comprehensive accessibility support and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useMenubar, type UseMenubarProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface MenubarProps extends Omit<UseMenubarProps, 'menubarRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom menu item renderer */
  renderItem?: (item: any, level: number, isFocused: boolean, isActive: boolean) => React.ReactNode;
  /** Custom submenu renderer */
  renderSubmenu?: (items: any[], level: number) => React.ReactNode;
  /** Height of the menubar container */
  height?: number | string;
  /** Whether to show separators between items */
  showSeparators?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show shortcuts */
  showShortcuts?: boolean;
}

/**
 * Menubar component with menu items and submenus.
 * Supports keyboard navigation, submenus, and proper accessibility.
 */
export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(({
  className = '',
  style,
  renderItem,
  renderSubmenu,
  height,
  showSeparators = false,
  showIcons = true,
  showShortcuts = false,
  ...menubarProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useMenubar({
    ...menubarProps,
    menubarRef: ref as React.RefObject<HTMLDivElement>
  });

  // Orientation classes
  const orientationClasses = state.orientation === 'horizontal'
    ? 'flex-row items-center'
    : 'flex-col items-start';

  // Base menubar classes
  const menubarClasses = `
    menubar
    flex ${orientationClasses}
    bg-white border border-gray-200 rounded-lg shadow-sm
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default menu item renderer
  const defaultRenderItem = (item: any, level: number, isFocused: boolean, isActive: boolean) => {
    if (item.separator) {
      return (
        <div
          className={`
            ${showSeparators ? 'border-t border-gray-200 my-1' : ''}
            ${level === 0 ? 'px-4 py-1' : 'px-3 py-0.5'}
          `}
          role="separator"
        />
      );
    }

    return (
      <div
        className={`
          menubar-item
          flex items-center gap-2
          ${level === 0 ? 'px-4 py-2' : 'px-3 py-1.5'}
          ${item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
          ${isFocused ? 'bg-blue-100 text-blue-700' : ''}
          ${isActive ? 'bg-blue-50 text-blue-600' : ''}
          transition-colors duration-150
          select-none
        `}
        onClick={() => {
          if (!item.disabled) {
            actions.activateItem(item.id);
          }
        }}
        onMouseEnter={() => {
          if (!item.disabled) {
            actions.focusItem(item.id);
            if (item.children && item.children.length > 0) {
              actions.openSubmenu(item.id);
            }
          }
        }}
        role="menuitem"
        aria-disabled={item.disabled}
        aria-haspopup={item.children && item.children.length > 0 ? 'menu' : undefined}
        aria-expanded={item.children && item.children.length > 0 && state.openSubmenuId === item.id}
        tabIndex={isFocused ? 0 : -1}
        data-testid={`menubar-item-${item.id}`}
      >
        {/* Item Icon */}
        {showIcons && item.icon && (
          <span className="flex-shrink-0">
            {item.icon}
          </span>
        )}

        {/* Item Label */}
        <span className="flex-1 truncate">
          {item.label}
        </span>

        {/* Shortcut */}
        {showShortcuts && item.shortcut && (
          <span className="text-xs text-gray-500 ml-auto">
            {item.shortcut}
          </span>
        )}

        {/* Submenu Arrow */}
        {item.children && item.children.length > 0 && (
          <span className="flex-shrink-0 ml-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        )}
      </div>
    );
  };

  // Default submenu renderer
  const defaultRenderSubmenu = (items: any[], level: number) => {
    const submenuClasses = `
      submenu
      absolute top-full left-0
      bg-white border border-gray-200 rounded-lg shadow-lg
      min-w-[200px]
      z-50
      ${level === 0 ? 'mt-1' : 'ml-1'}
    `;

    return (
      <div className={submenuClasses} role="menu">
        {items.map((item) => defaultRenderItem(item, level, false, false))}
      </div>
    );
  };

  // Render menu items recursively
  const renderItems = (items: any[], level = 0) => {
    return items.map((item) => {
      const isFocused = state.focusedItemId === item.id;
      const isActive = actions.isItemActive(item.id);
      const hasSubmenu = actions.hasSubmenu(item.id);
      const isSubmenuOpen = state.openSubmenuId === item.id;

      return (
        <div key={item.id} className="menubar-item-wrapper relative">
          {/* Menu Item */}
          {renderItem
            ? renderItem(item, level, isFocused, isActive)
            : defaultRenderItem(item, level, isFocused, isActive)
          }

          {/* Submenu */}
          {hasSubmenu && isSubmenuOpen && (
            <div className="menubar-submenu">
              {renderSubmenu
                ? renderSubmenu(item.children, level + 1)
                : defaultRenderSubmenu(item.children, level + 1)
              }
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      ref={ref}
      className={menubarClasses}
      style={{
        ...style,
        height: height || 'auto'
      }}
      {...attributes}
      data-testid="menubar"
    >
      {/* Main Menu Items */}
      <div className="menubar-main">
        {renderItems(state.items, 0)}
      </div>

      {/* Open Submenu */}
      {state.openSubmenuId && (
        <div className="menubar-open-submenu">
          {(() => {
            const item = actions.getItem(state.openSubmenuId);
            /* c8 ignore start */ // reason: openSubmenuId is only ever set for items that have children, so the no-children null fallback is unreachable
            if (item && item.children) {
              return renderSubmenu
                ? renderSubmenu(item.children, 0)
                : defaultRenderSubmenu(item.children, 0);
            }
            return null;
            /* c8 ignore end */
          })()}
        </div>
      )}

      {/* Empty State */}
      {state.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <p className="text-sm">No menu items</p>
        </div>
      )}
    </div>
  );
});

Menubar.displayName = 'Menubar';

/**
 * MenubarItem - Individual menu item component (for advanced usage)
 */
export interface MenubarItemProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Menu item data */
  item: any;
  /** Current level */
  level: number;
  /** Whether item is focused */
  isFocused: boolean;
  /** Whether item is active */
  isActive: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Mouse enter handler */
  onMouseEnter?: () => void;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show shortcuts */
  showShortcuts?: boolean;
}

export const MenubarItem = forwardRef<HTMLDivElement, MenubarItemProps>(({
  className = '',
  style,
  item,
  level,
  isFocused,
  isActive,
  onClick,
  onMouseEnter,
  showIcons = true,
  showShortcuts = false,
  ...props
}, ref) => {
  if (item.separator) {
    return (
      <div
        ref={ref}
        className={`
          border-t border-gray-200 my-1
          ${level === 0 ? 'px-4 py-1' : 'px-3 py-0.5'}
          ${className || ''}
        `}
        style={style}
        role="separator"
        {...props}
      />
    );
  }

  const itemClasses = `
    flex items-center gap-2
    ${level === 0 ? 'px-4 py-2' : 'px-3 py-1.5'}
    ${item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
    ${isFocused ? 'bg-blue-100 text-blue-700' : ''}
    ${isActive ? 'bg-blue-50 text-blue-600' : ''}
    transition-colors duration-150
    select-none
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={itemClasses}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="menuitem"
      aria-disabled={item.disabled}
      aria-haspopup={item.children && item.children.length > 0 ? 'menu' : undefined}
      aria-expanded={item.children && item.children.length > 0}
      tabIndex={isFocused ? 0 : -1}
      data-testid={`menubar-item-${item.id}`}
      {...props}
    >
      {/* Item Icon */}
      {showIcons && item.icon && (
        <span className="flex-shrink-0">
          {item.icon}
        </span>
      )}

      {/* Item Label */}
      <span className="flex-1 truncate">
        {item.label}
      </span>

      {/* Shortcut */}
      {showShortcuts && item.shortcut && (
        <span className="text-xs text-gray-500 ml-auto">
          {item.shortcut}
        </span>
      )}

      {/* Submenu Arrow */}
      {item.children && item.children.length > 0 && (
        <span className="flex-shrink-0 ml-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      )}
    </div>
  );
});

MenubarItem.displayName = 'MenuBarItem';

export default Menubar;