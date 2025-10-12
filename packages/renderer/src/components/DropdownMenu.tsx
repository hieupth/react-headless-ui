/**
 * Dropdown Menu renderer component.
 * Renders a dropdown menu with proper positioning and accessibility.
 */

import React, { forwardRef, useMemo } from 'react';
import { useDropdownMenu } from '@react-ui-forge/core';
import type { UseDropdownMenuProps, DropdownMenuItem } from '@react-ui-forge/core';

export interface DropdownMenuProps extends
  Omit<UseDropdownMenuProps, 'items'> {
  /** Menu items */
  items: DropdownMenuItem[];
  /** Additional CSS classes */
  className?: string;
  /** Children render function for custom item rendering */
  children?: (
    item: DropdownMenuItem,
    itemProps: Record<string, any>,
    labelProps: Record<string, any>,
    index: number
  ) => React.ReactNode;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show shortcuts */
  showShortcuts?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Menu variant */
  variant?: 'default' | 'dense' | 'loose';
}

/**
 * DropdownMenu component that renders a dropdown menu with trigger.
 * Supports keyboard navigation, icons, shortcuts, and various item types.
 */
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(({
  items = [],
  open,
  onOpenChange,
  placement = 'bottom',
  align = 'start',
  offset = 4,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSelect = true,
  loop = true,
  className = '',
  children,
  showIcons = true,
  showShortcuts = true,
  showBadges = true,
  size = 'md',
  variant = 'default',
  ...semanticProps
}, ref) => {
  const {
    state,
    actions,
    triggerAttributes,
    menuAttributes,
    triggerProps,
    menuProps,
    getItemProps,
    getItemLabelProps,
    arrowProps,
    triggerRef,
    menuRef
  } = useDropdownMenu({
    items,
    open,
    onOpenChange,
    placement,
    align,
    offset,
    closeOnClickOutside,
    closeOnEscape,
    closeOnSelect,
    loop,
    ...semanticProps
  });

  // Size classes
  const sizeClasses = useMemo(() => ({
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }), []);

  // Variant classes
  const variantClasses = useMemo(() => ({
    default: 'py-1',
    dense: 'py-0.5',
    loose: 'py-2'
  }), []);

  // Render individual menu item
  const renderItem = (item: DropdownMenuItem, index: number) => {
    const itemProps = getItemProps(item, index);
    const labelProps = getItemLabelProps(item, index);

    // Use custom render function if provided
    if (children) {
      return (
        <div key={item.id} {...itemProps}>
          {children(item, itemProps, labelProps, index)}
        </div>
      );
    }

    // Default rendering
    return (
      <div
        key={item.id}
        {...itemProps}
        className={`
          relative flex items-center px-3 py-2 text-left cursor-pointer
          transition-colors duration-150 outline-none
          ${sizeClasses[size]}
          ${item.disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100 focus:bg-gray-100'
          }
          ${item.checked ? 'bg-blue-50' : ''}
          ${item.destructive ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-gray-700'}
        `}
      >
        {/* Checkbox/Radio indicator */}
        {item.checked !== undefined && (
          <span className="mr-3 flex-shrink-0 w-4 h-4">
            {item.role === 'menuitemradio' ? (
              // Radio button
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="6" />
              </svg>
            ) : (
              // Checkbox
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </span>
        )}

        {/* Icon */}
        {showIcons && item.icon && !item.checked && (
          <span className="mr-3 flex-shrink-0 w-5 h-5 text-gray-400">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span {...labelProps} className="flex-1 min-w-0 truncate">
          {item.label}
        </span>

        {/* Right side content */}
        <div className="flex items-center space-x-2 ml-2">
          {/* Shortcut */}
          {showShortcuts && item.shortcut && (
            <span className="text-xs text-gray-400 font-mono">
              {item.shortcut}
            </span>
          )}

          {/* Badge */}
          {showBadges && item.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {item.badge}
            </span>
          )}

          {/* Submenu indicator */}
          {item.hasSubmenu && (
            <span className="flex-shrink-0 w-4 h-4 text-gray-400">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
    );
  };

  // Menu content classes
  const menuClasses = [
    'absolute z-50 min-w-48 py-1 bg-white border border-gray-200 rounded-md shadow-lg',
    'focus:outline-none',
    variantClasses[variant],
    sizeClasses[size]
  ].filter(Boolean).join(' ');

  // Trigger classes
  const triggerClasses = [
    'inline-flex items-center justify-center px-3 py-2 text-sm font-medium',
    'text-gray-700 bg-white border border-gray-300 rounded-md',
    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'transition-colors duration-150',
    state.open ? 'bg-gray-50' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`relative inline-block ${className}`} {...triggerAttributes}>
      {/* Trigger */}
      <button
        {...triggerProps}
        className={triggerClasses}
        aria-label={triggerAttributes['aria-label'] || 'Dropdown menu'}
      >
        Menu
        <svg
          className={`ml-2 w-4 h-4 transition-transform duration-200 ${
            state.open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Menu */}
      {state.open && (
        <div
          ref={menuRef}
          {...menuProps}
          className={menuClasses}
          {...menuAttributes}
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';

// Helper components for specific dropdown patterns

/**
 * DropdownMenuTrigger - Custom trigger component for dropdown menus.
 */
export const DropdownMenuTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <button
      className={`inline-flex items-center ${className}`}
      onClick={onClick}
      aria-haspopup="menu"
    >
      {children}
    </button>
  );
};

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

/**
 * DropdownMenuItem - A single menu item component.
 */
export const DropdownMenuItem: React.FC<{
  item: DropdownMenuItem;
  className?: string;
  onClick?: () => void;
}> = ({ item, className = '', onClick }) => {
  return (
    <div
      className={`relative flex items-center px-3 py-2 text-left cursor-pointer transition-colors duration-150 outline-none ${className}`}
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
      data-disabled={item.disabled}
      data-checked={item.checked}
      data-destructive={item.destructive}
    >
      {item.label}
    </div>
  );
};

DropdownMenuItem.displayName = 'DropdownMenuItem';

/**
 * DropdownMenuSeparator - Separator between menu items.
 */
export const DropdownMenuSeparator: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div
      className={`my-1 h-px bg-gray-200 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
};

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

/**
 * DropdownMenuLabel - Non-interactive label for grouping menu items.
 */
export const DropdownMenuLabel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`px-3 py-2 text-sm font-medium text-gray-500 ${className}`}
      role="none"
    >
      {children}
    </div>
  );
};

DropdownMenuLabel.displayName = 'DropdownMenuLabel';