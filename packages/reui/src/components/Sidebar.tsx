/**
 * Sidebar renderer component using headless useSidebar hook.
 * Provides styled sidebar with comprehensive accessibility support and responsive behavior.
 */

import React, { forwardRef } from 'react';
import { useSidebar, type UseSidebarProps } from '../hooks';
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
}: SidebarProps, ref) => {
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
    sm: '',
    md: '',
    lg: '',
    xl: ''
  }[state.size];

  // Position classes
  const positionClasses = {
    left: '',
    right: ''
  }[state.position];

  // Variant classes
  const variantClasses = {
    permanent: ' transform ',
    persistent: ` ${state.isMobile ? 'transform -translate-x-full' : 'transform '}   `,
    temporary: ` transform -translate-x-full   `
  }[state.variant];

  // Collapse classes
  const collapseClasses = state.collapsed
    ? ''
    : sizeClasses;

  // Open state classes
  const openClasses = state.open
    ? ''
    : state.position === 'left'
      ? '-translate-x-full'
      : '';

  // Base sidebar classes
  const sidebarClasses = `
    ${variantClasses}
    ${positionClasses}
    ${openClasses}
    ${state.variant !== 'permanent' ? '   ' : ''}
    ${collapseClasses}
       
     
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Overlay classes
  const overlayClasses = `
        
    ${state.showOverlay ? ' pointer-events-auto' : ' pointer-events-none'}
      
  `;

  // Trigger button classes
  const triggerButtonClasses = `
      
     
     
     
     
       
  `;

  return (
    <>
      {/* Trigger Button */}
      {trigger && (
        <div className="sidebar-trigger">
          {React.isValidElement(trigger)
            ? React.cloneElement(
                trigger as React.ReactElement<Record<string, unknown>>,
                {
                  onClick: actions.toggleSidebar,
                  'aria-label': state.open ? 'Close sidebar' : 'Open sidebar',
                  'aria-expanded': state.open
                }
              )
            : (
              <button
                onClick={actions.toggleSidebar}
                className={triggerButtonClasses}
                aria-label={state.open ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={state.open}
                disabled={state.disabled}
              >
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
          <div className="sidebar-header    ">
            {header}
          </div>
        )}

        {/* Content */}
        <div className="sidebar-content   ">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sidebar-footer    ">
            {footer}
          </div>
        )}

        {/* Collapse Toggle (for persistent/permanent variants) */}
        {(state.variant === 'permanent' || state.variant === 'persistent') && !state.isMobile && (
          <button
            onClick={actions.toggleCollapse}
            className="     "
            aria-label={state.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!state.collapsed}
          >
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
         
     
    ${active
      ? '  '
      : '  '
    }
    ${disabled
      ? ' '
      : ''
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
        <span className="  ">
          {icon}
        </span>
      )}
      <span className=" ">
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
      className={`sidebar-group  ${className}`}
      style={style}
      data-testid="sidebar-group"
    >
      {label && (
        <div className="sidebar-group-label        ">
          {label}
        </div>
      )}
      <div className="sidebar-group-items ">
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
      className={`   ${className}`}
      style={style}
      role="separator"
      aria-orientation="horizontal"
      data-testid="sidebar-divider"
    />
  );
});

SidebarDivider.displayName = 'SidebarDivider';

export default Sidebar;