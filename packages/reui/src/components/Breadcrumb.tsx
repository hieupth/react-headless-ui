import React from 'react';
import { useBreadcrumb, type UseBreadcrumbProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface BreadcrumbProps extends UseBreadcrumbProps {
  /** Additional CSS classes */
  className?: string;
  /** Custom renderer for breadcrumb items */
  renderItem?: (item: any, index: number, isActive: boolean) => React.ReactNode;
  /** Custom renderer for separator */
  renderSeparator?: () => React.ReactNode;
}

/**
 * Breadcrumb component displays navigation hierarchy with collapsible items.
 * Provides keyboard navigation and accessibility support.
 *
 * @param props - Component configuration props
 * @returns Styled breadcrumb navigation component
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  className,
  renderItem,
  renderSeparator,
  ...breadcrumbProps
}) => {
  const { state, actions, props, separator } = useBreadcrumb(breadcrumbProps);
  const theme = useTheme();

  // Build CSS classes for breadcrumb container
  const containerClasses = [
    'breadcrumb-container',
    state.disabled && 'breadcrumb-disabled',
    className
  ].filter(Boolean).join(' ');

  /**
   * Default renderer for breadcrumb items
   */
  const defaultRenderItem = (item: any, index: number, isActive: boolean) => {
    const itemClasses = [
      'breadcrumb-item',
      isActive && 'breadcrumb-item-active',
      item.disabled && 'breadcrumb-item-disabled',
    ].filter(Boolean).join(' ');

    const Tag = item.href && !item.disabled ? 'a' : 'span';

    return (
      <Tag
        key={item.id}
        href={item.href}
        className={itemClasses}
        onClick={() => !item.disabled && actions.navigate(index)}
        style={{
          color: isActive
            ? theme.colors.primary
            : item.disabled
              ? theme.colors.muted
              : theme.colors.foreground,
          textDecoration: 'none',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          padding: theme.spacing.xs,
          borderRadius: theme.borderRadius.sm,
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme.spacing.xs,
        }}
        {...(isActive && { 'aria-current': 'page' })}
        {...(item.disabled && { 'aria-disabled': true })}
      >
        {item.icon}
        <span>{item.label}</span>
      </Tag>
    );
  };

  /**
   * Default renderer for separator
   */
  const defaultRenderSeparator = () => (
    <span
      className="breadcrumb-separator"
      style={{
        color: theme.colors.muted,
        margin: `0 ${theme.spacing.sm}`,
        display: 'inline-flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      {separator}
    </span>
  );

  const renderFunction = renderItem || defaultRenderItem;
  const renderSeparatorFunction = renderSeparator || defaultRenderSeparator;

  return (
    <nav
      className={containerClasses}
      {...props}
      style={{
        ...props.style,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.xs,
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        fontSize: theme.fontSizes.sm,
      }}
    >
      {/* Render visible items */}
      {state.visibleItems.map((item, index) => {
        const actualIndex = state.items.findIndex(i => i.id === item.id);
        const isActive = Boolean(item.current);

        return (
          <React.Fragment key={item.id}>
            {renderFunction(item, actualIndex, isActive)}

            {/* Add separator except for last item */}
            {index < state.visibleItems.length - 1 && renderSeparatorFunction()}
          </React.Fragment>
        );
      })}

      {/* Render collapsed items indicator */}
      {state.isCollapsed && (
        <>
          {renderSeparatorFunction()}
          <span
            className="breadcrumb-ellipsis"
            style={{
              color: theme.colors.muted,
              padding: theme.spacing.xs,
              display: 'inline-flex',
              alignItems: 'center',
            }}
            title={state.hiddenItems.map(item => item.label).join(' > ')}
          >
            ...
          </span>
          {renderSeparatorFunction()}
        </>
      )}

      {/* Render last hidden items if collapsed */}
      {state.isCollapsed && state.hiddenItems.length > 0 && (
        <>
          {state.hiddenItems.slice(-2).map((item, index) => {
            const actualIndex = state.items.findIndex(i => i.id === item.id);
            const isLast = index === state.hiddenItems.slice(-2).length - 1;

            return (
              <React.Fragment key={item.id}>
                {renderFunction(item, actualIndex, Boolean(item.current))}
                {!isLast && renderSeparatorFunction()}
              </React.Fragment>
            );
          })}
        </>
      )}
    </nav>
  );
};