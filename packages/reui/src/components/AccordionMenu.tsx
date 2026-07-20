/**
 * AccordionMenu renderer component.
 * Renders a menu with accordion-style expandable sections.
 */

import React, { forwardRef } from 'react';
import { useAccordionMenu } from '../hooks';
import type { UseAccordionMenuProps, AccordionMenuItem as AccordionMenuItemData } from '../hooks';
import type { SemanticMixinProps } from '../mixins';

export interface AccordionMenuProps extends
  Omit<UseAccordionMenuProps, 'items'> {
  /** Menu items */
  items: AccordionMenuItemData[];
  /** Additional CSS classes */
  className?: string;
  /** Children render function for custom item rendering */
  children?: (
    item: AccordionMenuItemData,
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
 * Clean (non-indexed) view of AccordionMenuProps for destructuring. The public
 * AccordionMenuProps inherits index signatures from the semantic/focusable
 * mixins, which widen every destructured field to `unknown`. This type restores
 * the concrete field types so the component body is correctly typed.
 */
type AccordionMenuResolvedProps = {
  items: AccordionMenuItemData[];
  exclusive?: boolean;
  defaultOpenItems?: string[];
  openItems?: string[];
  onOpenChange?: (openItems: string[]) => void;
  allowNested?: boolean;
  animationDuration?: number;
  maxDepth?: number;
  className?: string;
  children?: (
    item: AccordionMenuItemData,
    itemProps: Record<string, any>,
    headerProps: Record<string, any>,
    contentProps: Record<string, any>,
    depth: number,
    isOpen: boolean
  ) => React.ReactNode;
  showIcons?: boolean;
  showBadges?: boolean;
  size?: 'sm' | 'md' | 'lg';
} & SemanticMixinProps;

/**
 * AccordionMenu component that renders a menu with expandable sections.
 * Supports nested menus, exclusive mode, and keyboard navigation.
 */
export const AccordionMenu = forwardRef<HTMLDivElement, AccordionMenuProps>((props, ref) => {
  const {
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
  } = props as AccordionMenuResolvedProps;

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
  const sizeClasses: Record<string, string> = {
    sm: '',
    md: '',
    lg: ''
  };

  // Depth-based padding classes
  const getDepthPadding = (depth: number) => {
    const paddingMap: Record<number, string> = {
      0: '',
      1: 'ml-4',
      2: 'ml-8',
      3: 'ml-12'
    };
    return paddingMap[depth] || '';
  };

  // Render individual menu item
  const renderItem = (item: AccordionMenuItemData, depth: number = 0) => {
    const itemProps = getItemProps(item, depth) as React.HTMLAttributes<HTMLDivElement>;
    const headerProps = getItemHeaderProps(item, depth) as React.HTMLAttributes<HTMLDivElement>;
    const contentProps = getItemContentProps(item, depth) as React.HTMLAttributes<HTMLDivElement>;
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
                  
               
              
            ${item.disabled ? ' ' : ''}
            ${isOpen ? '' : ''}
          `}
        >
          <div className="   ">
            {/* Icon */}
            {showIcons && item.icon && (
              <span className="    ">
                {item.icon}
              </span>
            )}

            {/* Label */}
            <span className="  ">
              {item.label}
            </span>
          </div>

          <div className="  ">
            {/* Badge */}
            {showBadges && item.badge && (
              <span className="        ">
                {item.badge}
              </span>
            )}

            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <span
                className={`
                       
                  ${isOpen ? '' : ''}
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
              
              ${isOpen ? ' ' : ' '}
               duration-${animationDuration}
            `}
          >
            <div className="">
              {actions.getItemChildren(item.id).map((child) => renderItem(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Base classes for menu container
  const baseClasses = [
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ].filter(Boolean).join(' ');

  const navMenuProps = menuProps as React.HTMLAttributes<HTMLElement>;
  const navSemanticAttributes = semanticAttributes as React.HTMLAttributes<HTMLElement>;

  return (
    <nav
      {...navMenuProps}
      ref={ref}
      className={`${baseClasses} ${className}`}
      {...navSemanticAttributes}
    >
      <div className="">
        {items.map((item) => renderItem(item))}
      </div>
    </nav>
  );
});

AccordionMenu.displayName = 'AccordionMenu';

// Helper component for rendering accordion menu items with specific structure
export const AccordionMenuItem: React.FC<{
  item: AccordionMenuItemData;
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