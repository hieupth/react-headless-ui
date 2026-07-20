/**
 * NavigationMenu renderer component using headless useNavigationMenu hook.
 * Provides styled navigation menu with comprehensive accessibility support and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useNavigationMenu, type UseNavigationMenuProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface NavigationMenuProps extends Omit<UseNavigationMenuProps, 'navigationMenuRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom menu item renderer */
  renderItem?: (item: any, level: number, isFocused: boolean, isActive: boolean) => React.ReactNode;
  /** Custom submenu renderer */
  renderSubmenu?: (items: any[], level: number) => React.ReactNode;
  /** Height of the navigation menu container */
  height?: number | string;
  /** Whether to show separators between items */
  showSeparators?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Whether to show descriptions */
  showDescriptions?: boolean;
}

/**
 * NavigationMenu component with complex navigation patterns.
 * Supports horizontal/vertical layouts, mega menus, dropdowns, and proper accessibility.
 */
export const NavigationMenu = forwardRef<HTMLDivElement, NavigationMenuProps>(({
  className = '',
  style,
  renderItem,
  renderSubmenu,
  height,
  showSeparators = false,
  showIcons = true,
  showBadges = true,
  showDescriptions = false,
  ...navigationMenuProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useNavigationMenu({
    ...navigationMenuProps,
    navigationMenuRef: ref as React.RefObject<HTMLDivElement>
  });

  // Variant classes
  const variantClasses = {
    horizontal: '  ',
    vertical: '  ',
    mega: ' ',
    dropdown: ' '
  };

  // Base navigation menu classes
  const navigationMenuClasses = `
    navigation-menu
    ${variantClasses[state.variant]}
        
    ${state.disabled ? ' ' : ''}
    ${state.position === 'top' || state.position === 'bottom' ? '' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default menu item renderer
  const defaultRenderItem = (item: any, level: number, isFocused: boolean, isActive: boolean) => {
    if (item.type === 'separator') {
      return (
        <div
          className={`
            ${showSeparators ? '  ' : ''}
            ${level === 0 ? ' ' : ' '}
          `}
          role="separator"
        />
      );
    }

    if (item.type === 'header') {
      return (
        <div
          className={`
              
            ${level === 0 ? ' ' : ' '}
          `}
          role="heading"
          aria-level={level + 1}
        >
          {item.label}
        </div>
      );
    }

    return (
      <div
        className={`
          navigation-menu-item
            
          ${level === 0 ? ' ' : ' '}
          ${item.disabled ? ' ' : '  '}
          ${isFocused ? ' ' : ''}
          ${isActive ? ' ' : ''}
          ${item.variant === 'primary' ? ' ' : ''}
          ${item.variant === 'secondary' ? '' : ''}
           
          
        `}
        onClick={() => {
          if (!item.disabled) {
            actions.activateItem(item.id);
          }
        }}
        onMouseEnter={() => {
          if (!item.disabled) {
            actions.hoverItem(item.id);
            if (item.children && item.children.length > 0) {
              actions.openDropdown(item.id);
            }
          }
        }}
        onMouseLeave={() => {
          if (!item.disabled) {
            actions.leaveItem();
          }
        }}
        role="menuitem"
        aria-disabled={item.disabled}
        aria-haspopup={item.children && item.children.length > 0 ? 'menu' : undefined}
        aria-expanded={item.children && item.children.length > 0 && state.openDropdownId === item.id}
        tabIndex={isFocused ? 0 : -1}
        data-testid={`navigation-menu-item-${item.id}`}
      >
        {/* Item Icon */}
        {showIcons && item.icon && (
          <span className="">
            {item.icon}
          </span>
        )}

        {/* Item Content */}
        <div className=" ">
          <div className="  ">
            {/* Item Label */}
            <span className=" ">
              {item.label}
            </span>

            {/* Badge */}
            {showBadges && item.badge && (
              <span className="           ">
                {item.badge}
              </span>
            )}
          </div>

          {/* Description */}
          {showDescriptions && item.description && (
            <p className="   ">
              {item.description}
            </p>
          )}
        </div>

        {/* Submenu Arrow */}
        {item.children && item.children.length > 0 && (
          <span className=" ">
            <svg
              className=" "
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

  // Default submenu renderer. Always uses defaultRenderItem: a dropdown only
  // opens via the default item's hover/click handlers, so when a consumer
  // supplies `renderItem` (replacing that surface) no submenu can open and this
  // path is never reached with renderItem set. `renderSubmenu` (checked at the
  // call sites) is the supported way to customise submenu contents.
  const defaultRenderSubmenu = (items: any[], level: number) => {
    const submenuClasses = `
      navigation-submenu
        
          
      
      
      ${level === 0 ? '' : ''}
      ${state.variant === 'mega' ? '    ' : ''}
    `;

    if (state.variant === 'mega') {
      return (
        <div className={submenuClasses} role="menu">
          {items.map((item) => defaultRenderItem(item, level, false, false))}
        </div>
      );
    }

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
      const isSubmenuOpen = state.openDropdownId === item.id;

      return (
        <div key={item.id} className="navigation-menu-item-wrapper ">
          {/* Menu Item */}
          {renderItem
            ? renderItem(item, level, isFocused, isActive)
            : defaultRenderItem(item, level, isFocused, isActive)
          }

          {/* Submenu */}
          {hasSubmenu && isSubmenuOpen && (
            <div className="navigation-menu-submenu">
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

  // Mobile menu trigger
  const renderMobileTrigger = () => {
    if (!state.isMobile) return null;

    return (
      <button
        className="mobile-menu-trigger       "
        onClick={actions.toggleMobileMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={state.isMobileMenuOpen}
      >
        <svg
          className=" "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {state.isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
    );
  };

  return (
    <div
      ref={ref}
      className={navigationMenuClasses}
      style={{
        ...style,
        height: height || 'auto'
      }}
      {...attributes}
      data-testid="navigation-menu"
    >
      {/* Mobile Menu Trigger */}
      {renderMobileTrigger()}

      {/* Desktop Menu */}
      {!state.isMobile && (
        <div className="navigation-menu-desktop">
          {/* Search for Mega Menu */}
          {state.variant === 'mega' && navigationMenuProps.enableSearch && (
            <div className="search-container   ">
              <input
                type="text"
                placeholder="Search menu..."
                className="        "
                value={state.searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                aria-label="Search navigation menu"
              />
            </div>
          )}

          {/* Main Menu Items */}
          <div className="navigation-menu-main">
            {renderItems(
              actions.filterItems(state.items, state.searchQuery),
              0
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {state.isMobile && state.isMobileMenuOpen && (
        <div className="navigation-menu-mobile           ">
          {/* Mobile Search */}
          {navigationMenuProps.enableSearch && (
            <div className="search-container   ">
              <input
                type="text"
                placeholder="Search menu..."
                className="        "
                value={state.searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                aria-label="Search navigation menu"
              />
            </div>
          )}

          {/* Mobile Menu Items */}
          <div className=" ">
            {renderItems(
              actions.filterItems(state.items, state.searchQuery),
              0
            )}
          </div>
        </div>
      )}

      {/* Open Dropdown */}
      {state.openDropdownId && !state.isMobile && (
        <div className="navigation-menu-open-dropdown">
          {(() => {
            // `openDropdownId` is only ever set by the hook after verifying the
            // item has children (openDropdown/activateItem guards), so getItem
            // is guaranteed to return a defined item whose children array is
            // populated here; the non-null assertions document that invariant
            // (no runtime guard/branch is needed).
            const item = actions.getItem(state.openDropdownId)!;
            return renderSubmenu
              ? renderSubmenu(item.children!, 0)
              : defaultRenderSubmenu(item.children!, 0);
          })()}
        </div>
      )}

      {/* Empty State */}
      {state.items.length === 0 && (
        <div className="     ">
          <svg
            className="  "
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
          <p className="">No navigation items</p>
        </div>
      )}

      {/* No Search Results */}
      {state.searchQuery && actions.filterItems(state.items, state.searchQuery).length === 0 && (
        <div className="     ">
          <svg
            className="  "
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="">No results found for "{state.searchQuery}"</p>
        </div>
      )}
    </div>
  );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu;