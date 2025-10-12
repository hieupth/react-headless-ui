/**
 * AccordionMenu renderer component.
 * Renders a menu with accordion-style expandable sections.
 */

import React, { forwardRef } from 'react';
import { useAccordionMenu } from '@react-ui-forge/core';
import type { UseAccordionMenuProps, AccordionMenuItem } from '@react-ui-forge/core';

export interface AccordionMenuProps extends
  Omit<UseAccordionMenuProps, 'items'> {
  /** Menu items */
  items: AccordionMenuItem[];
  /** Additional CSS classes */
  className?: string;
  /** Children render function for custom item rendering */
  children?: (
    item: AccordionMenuItem,
    itemProps: Record<string, any>,
    headerProps: Record<string, any>,
    contentProps: Record<string, any>,
    depth: number,
    isOpen: boolean
  ) => React.ReactNode;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show badges */
  showBadges?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AccordionMenu component that renders a menu with expandable sections.
 * Supports nested menus, exclusive mode, and keyboard navigation.
 */
export const AccordionMenu = forwardRef<HTMLDivElement, AccordionMenuProps>(({
  items = [],
  exclusive = false,
  defaultOpenItems = [],
  openItems,
  onOpenChange,
  allowNested = true,
  animationDuration = 200,
  maxDepth = 3,
  className = '',
  children,
  showIcons = true,
  showBadges = true,
  size = 'md',
  ...semanticProps
}, ref) => {
  const {
    state,
    actions,
    semanticAttributes,
    menuProps,
    getItemProps,
    getItemHeaderProps,
    getItemContentProps
  } = useAccordionMenu({
    items,
    exclusive,
    defaultOpenItems,
    openItems,
    onOpenChange,
    allowNested,
    animationDuration,
    maxDepth,
    ...semanticProps
  });

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Depth-based padding classes
  const getDepthPadding = (depth: number) => {
    const paddingMap = {
      0: '',
      1: 'ml-4',
      2: 'ml-8',
      3: 'ml-12'
    };
    return paddingMap[depth] || '';
  };

  // Render individual menu item
  const renderItem = (item: AccordionMenuItem, depth: number = 0) => {
    const itemProps = getItemProps(item, depth);
    const headerProps = getItemHeaderProps(item, depth);
    const contentProps = getItemContentProps(item, depth);
    const isOpen = actions.isItemOpen(item.id);
    const hasChildren = actions.hasChildren(item.id);

    // Use custom render function if provided
    if (children) {
      return (
        <div key={item.id} {...itemProps} className={getDepthPadding(depth)}>
          {children(item, itemProps, headerProps, contentProps, depth, isOpen)}
        </div>
      );
    }

    // Default rendering
    return (
      <div key={item.id} {...itemProps} className={`${getDepthPadding(depth)} ${sizeClasses[size]}`}>
        {/* Item Header */}
        <div
          {...headerProps}
          className={`
            flex items-center justify-between w-full px-3 py-2 text-left
            rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
            transition-colors duration-150 cursor-pointer
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isOpen ? 'bg-gray-50' : ''}
          `}
        >
          <div className="flex items-center min-w-0 flex-1">
            {/* Icon */}
            {showIcons && item.icon && (
              <span className="mr-3 flex-shrink-0 w-5 h-5 text-gray-400">
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span className="font-medium text-gray-700 truncate">
              {item.label}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Badge */}
            {showBadges && item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {item.badge}
              </span>
            )}

            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <span
                className={`
                  flex-shrink-0 w-4 h-4 text-gray-400 transition-transform duration-200
                  ${isOpen ? 'rotate-90' : ''}
                `}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Item Content (for items with children) */}
        {hasChildren && (
          <div
            {...contentProps}
            className={`
              overflow-hidden
              ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
              transition-all duration-${animationDuration}
            `}
          >
            <div className="py-1">
              {actions.getItemChildren(item.id).map((child) => renderItem(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Base classes for menu container
  const baseClasses = [
    'w-full',
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'shadow-sm',
    'overflow-hidden'
  ].filter(Boolean).join(' ');

  return (
    <nav
      {...menuProps}
      ref={ref}
      className={`${baseClasses} ${className}`}
      {...semanticAttributes}
    >
      <div className="py-1">
        {items.map((item) => renderItem(item))}
      </div>
    </nav>
  );
});

AccordionMenu.displayName = 'AccordionMenu';

// Helper component for rendering accordion menu items with specific structure
export const AccordionMenuItem: React.FC<{
  item: AccordionMenuItem;
  depth?: number;
  className?: string;
  children?: React.ReactNode;
}> = ({ item, depth = 0, className = '', children }) => {
  return (
    <div className={`accordion-menu-item ${className}`} data-depth={depth}>
      <div className="accordion-menu-header">
        {children}
      </div>
      {item.children && (
        <div className="accordion-menu-content">
          {item.children.map((child) => (
            <AccordionMenuItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

AccordionMenuItem.displayName = 'AccordionMenuItem';