/**
 * Sidebar renderer component using headless useSidebar hook.
 * Provides styled sidebar with comprehensive accessibility support and responsive behavior.
 */

import React, { forwardRef } from 'react';
import { useSidebar, type UseSidebarProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface SidebarProps extends Omit<UseSidebarProps, 'sidebarRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Sidebar content */
  children: React.ReactNode;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Overlay content */
  overlay?: React.ReactNode;
  /** Custom trigger button */
  trigger?: React.ReactNode;
}

/**
 * Sidebar component with responsive behavior and multiple variants.
 * Supports permanent, persistent, and temporary variants with proper accessibility.
 */
export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({
  className = '',
  style,
  children,
  header,
  footer,
  overlay,
  trigger,
  ...sidebarProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useSidebar({
    ...sidebarProps,
    sidebarRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'w-16',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96'
  }[state.size];

  // Position classes
  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  }[state.position];

  // Variant classes
  const variantClasses = {
    permanent: 'relative transform translate-x-0',
    persistent: `fixed ${state.isMobile ? 'transform -translate-x-full' : 'transform translate-x-0'} transition-transform duration-300 ease-in-out`,
    temporary: `fixed transform -translate-x-full transition-transform duration-300 ease-in-out`
  }[state.variant];

  // Collapse classes
  const collapseClasses = state.collapsed
    ? 'w-16'
    : sizeClasses;

  // Open state classes
  const openClasses = state.open
    ? 'translate-x-0'
    : state.position === 'left'
      ? '-translate-x-full'
      : 'translate-x-full';

  // Base sidebar classes
  const sidebarClasses = `
    ${variantClasses}
    ${positionClasses}
    ${openClasses}
    ${state.variant !== 'permanent' ? 'fixed top-0 h-full z-50' : 'h-full'}
    ${collapseClasses}
    bg-white border border-gray-200 shadow-lg
    flex flex-col
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Overlay classes
  const overlayClasses = `
    fixed inset-0 bg-black bg-opacity-50 z-40
    ${state.showOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
    transition-opacity duration-300 ease-in-out
  `;

  // Trigger button classes
  const triggerButtonClasses = `
    inline-flex items-center justify-center
    p-2 rounded-md
    bg-gray-100 hover:bg-gray-200
    text-gray-600 hover:text-gray-900
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  return (
    <>
      {/* Trigger Button */}
      {trigger && (
        <div className="sidebar-trigger">
          {React.isValidElement(trigger)
            ? React.cloneElement(trigger, {
                onClick: actions.toggleSidebar,
                'aria-label': state.open ? 'Close sidebar' : 'Open sidebar',
                'aria-expanded': state.open
              })
            : (
              <button
                onClick={actions.toggleSidebar}
                className={triggerButtonClasses}
                aria-label={state.open ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={state.open}
                disabled={state.disabled}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={state.open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            )
          }
        </div>
      )}

      {/* Overlay */}
      {state.showOverlay && (
        <div
          className={overlayClasses}
          onClick={actions.handleOverlayClick}
          aria-hidden={true}
        >
          {overlay}
        </div>
      )}

      {/* Sidebar */}
      <aside
        ref={ref}
        className={sidebarClasses}
        style={style}
        {...attributes}
        data-testid="sidebar"
      >
        {/* Header */}
        {header && (
          <div className="sidebar-header flex-shrink-0 p-4 border-b border-gray-200">
            {header}
          </div>
        )}

        {/* Content */}
        <div className="sidebar-content flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sidebar-footer flex-shrink-0 p-4 border-t border-gray-200">
            {footer}
          </div>
        )}

        {/* Collapse Toggle (for persistent/permanent variants) */}
        {(state.variant === 'permanent' || state.variant === 'persistent') && !state.isMobile && (
          <button
            onClick={actions.toggleCollapse}
            className="absolute top-4 right-2 p-1 rounded hover:bg-gray-100"
            aria-label={state.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!state.collapsed}
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={state.collapsed
                  ? "M9 5l7 7-7 7"
                  : "M15 19l-7-7 7-7"
                }
              />
            </svg>
          </button>
        )}
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

/**
 * SidebarItem - Individual item component for sidebar navigation
 */
export interface SidebarItemProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Item content */
  children: React.ReactNode;
  /** Whether item is active */
  active?: boolean;
  /** Item icon */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether item is disabled */
  disabled?: boolean;
}

export const SidebarItem = forwardRef<HTMLDivElement, SidebarItemProps>(({
  className = '',
  style,
  children,
  active = false,
  icon,
  onClick,
  disabled = false
}, ref) => {
  const itemClasses = `
    flex items-center gap-3 px-3 py-2 rounded-md
    transition-colors duration-200
    ${active
      ? 'bg-blue-100 text-blue-700 font-medium'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }
    ${disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer'
    }
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={itemClasses}
      style={style}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
      aria-disabled={disabled}
      data-testid="sidebar-item"
    >
      {icon && (
        <span className="flex-shrink-0 w-5 h-5">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">
        {children}
      </span>
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

/**
 * SidebarGroup - Group of sidebar items with optional label
 */
export interface SidebarGroupProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Group label */
  label?: React.ReactNode;
  /** Group items */
  children: React.ReactNode;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(({
  className = '',
  style,
  label,
  children
}, ref) => {
  return (
    <div
      ref={ref}
      className={`sidebar-group mb-4 ${className}`}
      style={style}
      data-testid="sidebar-group"
    >
      {label && (
        <div className="sidebar-group-label px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </div>
      )}
      <div className="sidebar-group-items space-y-1">
        {children}
      </div>
    </div>
  );
});

SidebarGroup.displayName = 'SidebarGroup';

/**
 * SidebarDivider - Visual separator for sidebar content
 */
export interface SidebarDividerProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SidebarDivider = forwardRef<HTMLDivElement, SidebarDividerProps>(({
  className = '',
  style
}, ref) => {
  return (
    <div
      ref={ref}
      className={`my-4 border-t border-gray-200 ${className}`}
      style={style}
      role="separator"
      aria-orientation="horizontal"
      data-testid="sidebar-divider"
    />
  );
});

SidebarDivider.displayName = 'SidebarDivider';

export default Sidebar;