/**
 * Item renderer component using headless useItem hook.
 * Provides styled generic item for lists, menus, and dropdowns.
 */

import React, { forwardRef } from 'react';
import { useItem, type UseItemProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface ItemProps extends Omit<UseItemProps, 'itemRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Item content */
  children?: React.ReactNode;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom icon position */
  iconPosition?: 'start' | 'end';
  /** Custom badge */
  badge?: React.ReactNode;
  /** Custom shortcut text */
  shortcut?: string;
  /** Whether to show description */
  showDescription?: boolean;
  /** Custom click handler */
  customOnClick?: (event: React.MouseEvent) => void;
  /** Custom key down handler */
  customOnKeyDown?: (event: React.KeyboardEvent) => void;
  /** Element tag */
  as?: keyof JSX.IntrinsicElements;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Variant style */
  variant?: 'default' | 'subtle' | 'ghost' | 'solid';
}

/**
 * Item component with generic styling for lists and menus.
 * Provides flexible item behavior with selection and interaction states.
 */
export const Item = forwardRef<HTMLElement, ItemProps>(({
  className = '',
  style,
  children,
  icon,
  iconPosition = 'start',
  badge,
  shortcut,
  showDescription = false,
  customOnClick,
  customOnKeyDown,
  as: Component = 'div',
  size = 'md',
  variant = 'default',
  ...itemProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    classes,
    focusable,
    pressable,
    semantic
  } = useItem({
    ...itemProps,
    itemRef: ref as React.RefObject<HTMLElement>
  });

  // Event handlers
  const handleClick = (event: React.MouseEvent) => {
    if (state.disabled || !state.interactive) return;

    // Handle selection based on selection mode
    if (itemProps.selectionMode === 'single') {
      actions.select();
    } else if (itemProps.selectionMode === 'multiple') {
      actions.toggle();
    }

    customOnClick?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (state.disabled || !state.interactive) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }

    customOnKeyDown?.(event);
  };

  const handleMouseEnter = () => {
    actions.hover();
  };

  const handleMouseLeave = () => {
    actions.unhover();
  };

  const handleMouseDown = () => {
    actions.press();
  };

  const handleMouseUp = () => {
    actions.release();
  };

  // Build CSS classes
  const elementClasses = `
    item
    item-${variant}
    item-${size}
    ${classes.base}
    ${classes.selected}
    ${classes.hovered}
    ${classes.pressed}
    ${classes.disabled}
    ${classes.focused}
    ${classes.active}
    ${classes.highlighted}
    ${state.interactive ? 'item-interactive' : 'item-static'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build base styles
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing?.sm || '8px',
    padding: (theme.spacing?.sm || '8px') + ' ' + (theme.spacing?.md || '16px'),
    borderRadius: theme.borderRadius?.md || '6px',
    cursor: state.interactive && !state.disabled ? 'pointer' : 'default',
    transition: 'all 0.15s ease-in-out',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    ...style
  };

  // Apply variant-specific styles
  const variantStyles: React.CSSProperties = {};

  switch (variant) {
    case 'subtle':
      variantStyles.backgroundColor = state.selected
        ? (theme.colors?.primary + '20' || '#e3f2fd')
        : (state.hovered ? theme.colors?.gray + '10' : 'transparent');
      break;
    case 'ghost':
      variantStyles.backgroundColor = state.hovered
        ? (theme.colors?.gray + '10' || '#f3f4f6')
        : 'transparent';
      break;
    case 'solid':
      variantStyles.backgroundColor = state.selected
        ? theme.colors?.primary || '#007bff'
        : (state.hovered ? theme.colors?.gray + '20' : theme.colors?.gray + '10' || '#f8f9fa');
      variantStyles.color = state.selected
        ? theme.colors?.white || '#ffffff'
        : theme.colors?.text || '#000000';
      break;
    default:
      if (state.selected) {
        variantStyles.backgroundColor = theme.colors?.primary + '10' || '#e3f2fd';
        variantStyles.color = theme.colors?.primary || '#007bff';
      }
      break;
  }

  // Apply state-specific styles
  const stateStyles: React.CSSProperties = {};

  if (state.disabled) {
    stateStyles.opacity = 0.5;
    stateStyles.cursor = 'not-allowed';
  }

  if (state.focused) {
    stateStyles.outline = `2px solid ${theme.colors?.primary || '#007bff'}`;
    stateStyles.outlineOffset = '2px';
  }

  if (state.pressed) {
    stateStyles.transform = 'scale(0.98)';
  }

  // Icon styles
  const iconStyles: React.CSSProperties = {
    flexShrink: 0,
    width: size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px',
    height: size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Badge styles
  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: theme.colors?.error || '#dc3545',
    color: theme.colors?.white || '#ffffff',
    marginLeft: 'auto'
  };

  // Shortcut styles
  const shortcutStyles: React.CSSProperties = {
    fontSize: '12px',
    color: theme.colors?.muted || '#6c757d',
    fontFamily: 'monospace',
    marginLeft: 'auto'
  };

  // Build content layout
  const contentStart = iconPosition === 'start' && icon ? (
    <div style={iconStyles} data-testid="item-icon-start">
      {icon}
    </div>
  ) : null;

  const contentEnd = iconPosition === 'end' && icon ? (
    <div style={iconStyles} data-testid="item-icon-end">
      {icon}
    </div>
  ) : null;

  const contentMiddle = (
    <div style={{ flex: 1, minWidth: 0 }} data-testid="item-content">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            fontWeight: state.selected ? '500' : '400',
            color: variant === 'solid' && state.selected
              ? theme.colors?.white
              : (state.selected ? theme.colors?.primary : theme.colors?.text)
          }}>
            {children || state.label}
          </div>
          {showDescription && state.description && (
            <div style={{
              fontSize: '12px',
              color: theme.colors?.muted || '#6c757d',
              marginTop: '2px'
            }}>
              {state.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {shortcut && (
            <div style={shortcutStyles} data-testid="item-shortcut">
              {shortcut}
            </div>
          )}
          {badge && (
            <div style={badgeStyles} data-testid="item-badge">
              {badge}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Arrange content based on icon position
  let content = contentMiddle;
  if (iconPosition === 'start') {
    content = (
      <>
        {contentStart}
        {contentMiddle}
      </>
    );
  } else if (iconPosition === 'end') {
    content = (
      <>
        {contentMiddle}
        {contentEnd}
      </>
    );
  }

  // Build combined styles
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles,
    ...stateStyles
  };

  return (
    <Component
      ref={ref}
      className={elementClasses}
      style={combinedStyles}
      {...attributes}
      {...focusable.attributes}
      {...pressable.attributes}
      {...semantic.attributes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      data-testid="item"
      data-selected={state.selected}
      data-hovered={state.hovered}
      data-pressed={state.pressed}
      data-disabled={state.disabled}
      data-focused={state.focused}
      data-active={state.active}
      data-value={state.value}
      data-level={state.level}
      data-interactive={state.interactive}
      data-variant={variant}
      data-size={size}
    >
      {content}
    </Component>
  );
});

Item.displayName = 'Item';

/**
 * Item.Checkbox component for checkbox-like items
 */
export const ItemCheckbox = forwardRef<HTMLElement, Omit<ItemProps, 'as'> & {
  /** Checkbox size */
  checkboxSize?: 'sm' | 'md' | 'lg';
}>(({ checkboxSize = 'md', ...props }, ref) => {
  const { state } = useItem(props);

  const checkboxStyles: React.CSSProperties = {
    width: checkboxSize === 'sm' ? '14px' : checkboxSize === 'lg' ? '20px' : '16px',
    height: checkboxSize === 'sm' ? '14px' : checkboxSize === 'lg' ? '20px' : '16px',
    borderRadius: '3px',
    border: `2px solid ${state.selected ? 'currentColor' : '#d1d5db'}`,
    backgroundColor: state.selected ? 'currentColor' : 'transparent',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    flexShrink: 0
  };

  const checkmarkStyles = {
    color: 'white',
    fontSize: checkboxSize === 'sm' ? '8px' : checkboxSize === 'lg' ? '12px' : '10px',
    display: state.selected ? 'block' : 'none'
  };

  return (
    <Item
      {...props}
      ref={ref}
      as="div"
      icon={
        <div style={checkboxStyles} data-testid="item-checkbox">
          <span style={checkmarkStyles}>✓</span>
        </div>
      }
      iconPosition="start"
    />
  );
});

ItemCheckbox.displayName = 'ItemCheckbox';

/**
 * Item.Radio component for radio-like items
 */
export const ItemRadio = forwardRef<HTMLElement, Omit<ItemProps, 'as'> & {
  /** Radio size */
  radioSize?: 'sm' | 'md' | 'lg';
}>(({ radioSize = 'md', ...props }, ref) => {
  const { state } = useItem(props);

  const radioStyles: React.CSSProperties = {
    width: radioSize === 'sm' ? '14px' : radioSize === 'lg' ? '20px' : '16px',
    height: radioSize === 'sm' ? '14px' : radioSize === 'lg' ? '20px' : '16px',
    borderRadius: '50%',
    border: `2px solid ${state.selected ? 'currentColor' : '#d1d5db'}`,
    backgroundColor: state.selected ? 'currentColor' : 'transparent',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    flexShrink: 0
  };

  const dotStyles: React.CSSProperties = {
    width: radioSize === 'sm' ? '6px' : radioSize === 'lg' ? '8px' : '7px',
    height: radioSize === 'sm' ? '6px' : radioSize === 'lg' ? '8px' : '7px',
    borderRadius: '50%',
    backgroundColor: 'white',
    display: state.selected ? 'block' : 'none'
  };

  return (
    <Item
      {...props}
      ref={ref}
      as="div"
      icon={
        <div style={radioStyles} data-testid="item-radio">
          <span style={dotStyles}></span>
        </div>
      }
      iconPosition="start"
    />
  );
});

ItemRadio.displayName = 'ItemRadio';

export default Item;