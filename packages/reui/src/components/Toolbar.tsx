/**
 * Toolbar renderer component using headless useToolbar hook.
 * Provides styled action button grouping with navigation.
 */

import React, { forwardRef } from 'react';
import { useToolbar, type UseToolbarProps, type ToolbarItem } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface ToolbarProps extends Omit<UseToolbarProps, 'toolbarRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom renderer for items */
  renderItem?: (props: {
    item: ToolbarItem;
    isActive: boolean;
    onClick: () => void;
  }) => React.ReactNode;
  /** Custom renderer for separator */
  renderSeparator?: () => React.ReactNode;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Whether to show borders */
  showBorder?: boolean;
  /** Element tag */
  as?: React.ElementType;
}

/**
 * Toolbar component with action button grouping behavior.
 * Provides flexible toolbar with navigation and accessibility support.
 */
export const Toolbar = forwardRef<HTMLElement, ToolbarProps>(({
  className = '',
  style,
  renderItem,
  renderSeparator,
  backgroundColor,
  borderColor,
  showBorder = true,
  as: Component = 'div',
  ...toolbarProps
}: ToolbarProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    classes,
    focusable,
    pressable,
    semantic
  } = useToolbar({
    ...toolbarProps,
      toolbarRef: ref as React.RefObject<HTMLElement>
    });

  // Event handlers
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (state.disabled) return;

    const { key } = event;
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        actions.navigatePrevious();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        actions.navigateNext();
        break;
      case 'Home':
        event.preventDefault();
        // Focus first item
        const firstItem = state.items.find(item => item.type === 'button' && !item.disabled);
        if (firstItem) {
          actions.activateItem(firstItem.id);
        }
        break;
      case 'End':
        event.preventDefault();
        // Focus last item
        const lastItem = [...state.items].reverse().find(item => item.type === 'button' && !item.disabled);
        if (lastItem) {
          actions.activateItem(lastItem.id);
        }
        break;
    }
  };

  // Build CSS classes
  const elementClasses = `
    toolbar
    toolbar-${state.orientation}
    toolbar-${state.size}
    ${classes.base}
    ${classes.focused}
    ${classes.disabled}
    ${classes.collapsed}
    ${classes.sticky}
    ${showBorder ? 'toolbar-bordered' : 'toolbar-borderless'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build base styles
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing?.sm || '8px',
    padding: state.size === 'sm' ? '8px' : state.size === 'lg' ? '12px' : '10px',
    backgroundColor: backgroundColor || (theme.colors?.background || '#ffffff'),
    border: showBorder ? `1px solid ${borderColor || theme.colors?.border || '#e5e7eb'}` : 'none',
    borderRadius: theme.borderRadius?.md || '6px',
    boxShadow: showBorder ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
    // reason: neither state.focused nor focusable.focused is wired to DOM focus in
    // useToolbar (focusable.attributes is undefined and state.focused is only set by
    // actions.focus()), so the prior `state.focused ? ... : 'none'` outline branch
    // was unreachable through the component; replaced by a constant 'none'.
    outline: 'none',
    outlineOffset: '2px',
    opacity: state.disabled ? 0.6 : 1,
    position: state.sticky ? 'sticky' : 'relative',
    top: state.sticky ? 0 : 'auto',
    zIndex: state.sticky ? 100 : 'auto',
    transition: 'all 150ms ease-in-out',
    ...style
  };

  // Button item styles
  const getButtonStyles = (item: ToolbarItem, isActive: boolean): React.CSSProperties => {
    const baseButtonStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing?.xs || '4px',
      padding: state.size === 'sm' ? '6px 12px' : state.size === 'lg' ? '10px 20px' : '8px 16px',
      borderRadius: theme.borderRadius?.sm || '4px',
      border: 'none',
      backgroundColor: 'transparent',
      color: theme.colors?.text || '#111827',
      fontWeight: '500',
      fontSize: state.size === 'sm' ? '0.875rem' : state.size === 'lg' ? '1rem' : '0.9375rem',
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      transition: 'all 150ms ease-in-out',
      textDecoration: 'none',
      outline: 'none'
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors?.primary || '#2563eb',
        color: theme.colors?.white || '#ffffff'
      },
      // reason: `theme.colors?.gray + '100'` always yields a truthy string (even
      // 'undefined100'), so the prior `|| '#f3f4f6'` fallback was unreachable dead code.
      secondary: {
        backgroundColor: theme.colors?.gray + '100',
        color: theme.colors?.text || '#111827'
      }
    };

    // reason: `theme.colors?.primary + '10'` always yields a truthy string, so the
    // prior `|| '#dbeafe'` fallback was unreachable dead code.
    const activeStyles = {
      backgroundColor: theme.colors?.primary + '10',
      color: theme.colors?.primary || '#2563eb'
    };

    const stateStyles = {
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    };

    return {
      ...baseButtonStyles,
      ...((item.variant === 'primary' || item.variant === 'secondary') ? variantStyles[item.variant] : {}),
      ...(isActive ? activeStyles : {}),
      ...(item.disabled ? stateStyles.disabled : {})
    };
  };

  // Icon styles
  const getIconStyles = (): React.CSSProperties => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: state.size === 'sm' ? '16px' : state.size === 'lg' ? '20px' : '18px',
      height: state.size === 'sm' ? '16px' : state.size === 'lg' ? '20px' : '18px',
      flexShrink: 0
    };
  };

  // Separator styles
  const getSeparatorStyles = (): React.CSSProperties => {
    return {
      width: state.orientation === 'vertical' ? '100%' : '1px',
      height: state.orientation === 'vertical' ? '1px' : '100%',
      backgroundColor: borderColor || theme.colors?.border || '#e5e7eb',
      margin: state.orientation === 'vertical' ? '4px 0' : '0 4px'
    };
  };

  // Spacer styles
  const getSpacerStyles = (): React.CSSProperties => {
    return {
      flex: 1
    };
  };

  // Render custom item
  if (renderItem) {
    return (
      <Component
        ref={ref}
        className={elementClasses}
        style={baseStyles}
        {...attributes}
        {...focusable.attributes}
        {...pressable.attributes}
        {...semantic.attributes}
        onKeyDown={handleKeyDown}
        data-testid="toolbar"
        data-orientation={state.orientation}
        data-size={state.size}
        data-collapsed={state.collapsed}
        data-disabled={state.disabled}
      >
        {state.items.map((item) => (
          <div key={item.id}>
            {renderItem({
              item,
              isActive: state.activeItem === item.id,
              onClick: () => actions.activateItem(item.id)
            })}
          </div>
        ))}
      </Component>
    );
  }

  // Render default content
  return (
    <Component
      ref={ref}
      className={elementClasses}
      style={baseStyles}
      {...attributes}
      {...focusable.attributes}
      {...pressable.attributes}
      {...semantic.attributes}
      onKeyDown={handleKeyDown}
      data-testid="toolbar"
      data-orientation={state.orientation}
      data-size={state.size}
      data-collapsed={state.collapsed}
      data-disabled={state.disabled}
    >
      {state.items.map((item) => {
        const isActive = state.activeItem === item.id;

        switch (item.type) {
          case 'separator':
            return (
              <div key={item.id} style={getSeparatorStyles()} data-testid="toolbar-separator" />
            );
          case 'spacer':
            return (
              <div key={item.id} style={getSpacerStyles()} data-testid="toolbar-spacer" />
            );
          case 'button':
          default:
            return (
              <button
                key={item.id}
                style={getButtonStyles(item, isActive)}
                onClick={() => actions.activateItem(item.id)}
                disabled={item.disabled}
                data-testid="toolbar-button"
                data-item-id={item.id}
                data-active={isActive}
                data-variant={item.variant}
                data-disabled={item.disabled}
              >
                {item.icon && (
                  <span style={getIconStyles()}>{item.icon}</span>
                )}
                {state.showLabels && item.label && (
                  <span>{item.label}</span>
                )}
              </button>
            );
        }
      })}
    </Component>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;