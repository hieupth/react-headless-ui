/**
 * Dropdown Menu renderer component.
 * Renders a dropdown menu with proper positioning and accessibility.
 */

import React, { forwardRef, useMemo } from 'react';
import { useDropdownMenu } from '../hooks';
import type { UseDropdownMenuProps, DropdownMenuItem as DropdownMenuItemData } from '../hooks';

export interface DropdownMenuProps extends UseDropdownMenuProps {
  /** Menu items */
  items: DropdownMenuItemData[];
  /** Additional CSS classes */
  className?: string;
  /** Children render function for custom item rendering */
  children?: (
    item: DropdownMenuItemData,
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
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>((props, ref) => {
  // DropdownMenuProps extends UseDropdownMenuProps (which carries the mixin
  // index signatures). forwardRef internally applies PropsWithoutRef, whose
  // mapped-type expansion collapses the named keys to the index-signature type
  // (`unknown`) whenever the source has a `[key: string]: unknown` signature.
  // That is a TypeScript inference quirk, not a real type relationship:
  // DropdownMenuProps is structurally a *subtype* of UseDropdownMenuProps, so
  // re-asserting the value to that supertype here is a sound upcast (no `any`,
  // no runtime cost) and restores the correctly-typed named keys.
  const hookProps = props as UseDropdownMenuProps;
  const ownProps = props as DropdownMenuProps;
  const {
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
    ...semanticProps
  } = hookProps;
  const {
    className = '',
    children,
    showIcons = true,
    showShortcuts = true,
    showBadges = true,
    size = 'md',
    variant = 'default'
  } = ownProps;

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

  // The hook returns concrete object literals for triggerProps/menuProps
  // (e.g. `aria-haspopup: string`, an in-spread `ref`). React's intrinsic
  // element types require literal unions / a top-level `ref`, so pull `ref`
  // out of each bag and cast the remaining attributes to the corresponding
  // React intrinsic type. The hook only ever produces valid attributes for
  // these elements, so the assertion is sound (and avoids `any`).
  const { ref: _triggerRef, ...triggerRest } = triggerProps;
  const { ref: _menuRef, ...menuRest } = menuProps;

  // Size classes
  const sizeClasses = useMemo(() => ({
    sm: '',
    md: '',
    lg: ''
  }), []);

  // Variant classes
  const variantClasses = useMemo(() => ({
    default: '',
    dense: '',
    loose: ''
  }), []);

  // Render individual menu item
  const renderItem = (item: DropdownMenuItemData, index: number) => {
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
                
            
          ${sizeClasses[size]}
          ${item.disabled
            ? ' '
            : ' '
          }
          ${item.checked ? '' : ''}
          ${item.destructive ? '  ' : ''}
        `}
      >
        {/* Checkbox/Radio indicator */}
        {item.checked !== undefined && (
          <span className="   ">
            {item.role === 'menuitemradio' ? (
              // Radio button
              <svg
                className=" "
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <circle cx="10" cy="10" r="6" />
              </svg>
            ) : (
              // Checkbox
              <svg
                className=" "
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
          <span className="    ">
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span {...labelProps} className="  ">
          {item.label}
        </span>

        {/* Right side content */}
        <div className="   ">
          {/* Shortcut */}
          {showShortcuts && item.shortcut && (
            <span className="  ">
              {item.shortcut}
            </span>
          )}

          {/* Badge */}
          {showBadges && item.badge && (
            <span className="        ">
              {item.badge}
            </span>
          )}

          {/* Submenu indicator */}
          {item.hasSubmenu && (
            <span className="   ">
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
    '        ',
    '',
    variantClasses[variant],
    sizeClasses[size]
  ].filter(Boolean).join(' ');

  // Trigger classes
  const triggerClasses = [
    '      ',
    '    ',
    '    ',
    ' ',
    state.open ? '' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={`  ${className}`} {...triggerAttributes}>
      {/* Trigger */}
      <button
        {...(triggerRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={triggerRef as React.RefObject<HTMLButtonElement | null>}
        className={triggerClasses}
        aria-label={triggerAttributes['aria-label']}
      >
        Menu
        <svg
          className={`     ${
            state.open ? '' : ''
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
          {...(menuRest as React.HTMLAttributes<HTMLDivElement>)}
          ref={menuRef}
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
      className={`  ${className}`}
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
  item: DropdownMenuItemData;
  className?: string;
  onClick?: () => void;
}> = ({ item, className = '', onClick }) => {
  return (
    <div
      className={`          ${className}`}
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
      className={`   ${className}`}
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
      className={`     ${className}`}
      role="none"
    >
      {children}
    </div>
  );
};

DropdownMenuLabel.displayName = 'DropdownMenuLabel';