/**
 * Keyboard Key renderer component using headless useKbd hook.
 * Provides styled keyboard key display for shortcuts and documentation.
 */

import React, { forwardRef } from 'react';
import { useKbd, type UseKbdProps, formatKeyDisplay, parseKeyShortcut } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface KbdProps extends Omit<UseKbdProps, 'keyRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Key content */
  children?: React.ReactNode;
  /** Custom renderer for key content */
  renderKey?: (props: {
    value: string;
    modifiers: { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean };
    display: string;
    state: any;
  }) => React.ReactNode;
  /** Whether to show border */
  showBorder?: boolean;
  /** Whether to show shadow */
  showShadow?: boolean;
  /** Whether to show background */
  showBackground?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Custom shadow */
  shadow?: string;
  /** Element tag */
  as?: React.ElementType;
  /** Animation duration */
  animationDuration?: number;
  /** Press scale */
  pressScale?: number;
  /** Hover scale */
  hoverScale?: number;
  /** Custom key mapping */
  keyMap?: Record<string, string>;
  /** Whether to use symbols for modifiers */
  useModifierSymbols?: boolean;
  /** Whether to show as tooltip */
  showTooltip?: boolean;
  /** Tooltip content */
  tooltip?: string;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Keyboard Key component with styled display for shortcuts and documentation.
 * Provides flexible key rendering with modifier support and accessibility.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(({
  className = '',
  style,
  children,
  renderKey,
  showBorder = true,
  showShadow = true,
  showBackground = true,
  backgroundColor,
  textColor,
  borderColor,
  shadow,
  as: Component = 'kbd',
  animationDuration = 150,
  pressScale = 0.95,
  hoverScale = 1.05,
  keyMap = {},
  useModifierSymbols = true,
  showTooltip = false,
  tooltip,
  tooltipPosition = 'top',
  ...kbdProps
}: KbdProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    classes,
    focusable,
    pressable,
    semantic
  } = useKbd({
    ...kbdProps,
    keyRef: ref as React.RefObject<HTMLElement>
  });

  // Event handlers
  const handleClick = (event: React.MouseEvent) => {
    if (state.disabled || !kbdProps.interactive) return;
    actions.press();
    // Release after a short delay
    setTimeout(() => actions.release(), 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (state.disabled || !kbdProps.interactive) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      actions.press();
      setTimeout(() => actions.release(), 100);
    }
  };

  const handleKeyUp = () => {
    actions.release();
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

  const handleFocus = () => {
    actions.focus();
  };

  const handleBlur = () => {
    actions.blur();
  };

  // Format key display
  const formatKey = (value: string): string => {
    // Apply custom key mapping
    const mappedValue = keyMap[value.toLowerCase()] || value;

    // Handle special keys
    switch (mappedValue.toLowerCase()) {
      case 'space':
        return 'Space';
      case 'enter':
        return 'Enter';
      case 'escape':
        return 'Esc';
      case 'backspace':
        return '⌫';
      case 'delete':
        return 'Del';
      case 'tab':
        return 'Tab';
      case 'arrowup':
        return '↑';
      case 'arrowdown':
        return '↓';
      case 'arrowleft':
        return '←';
      case 'arrowright':
        return '→';
      case ' ':
        return 'Space';
      default:
        return mappedValue;
    }
  };

  // Build display text
  const getDisplayText = (): string => {
    if (children) {
      return String(children);
    }

    if (kbdProps.combo) {
      return formatKeyDisplay(
        formatKey(state.value),
        state.modifiers,
        {
          showModifiers: state.showModifiers,
          combo: true,
          comboSeparator: kbdProps.comboSeparator,
          capitalize: kbdProps.capitalize,
          useSymbols: useModifierSymbols
        }
      );
    }

    // Simple display for single key
    const parts: string[] = [];

    if (state.showModifiers) {
      Object.entries(state.modifiers).forEach(([key, value]) => {
        if (value) {
          if (useModifierSymbols) {
            const symbols: Record<string, string> = {
              ctrl: '⌃',
              shift: '⇧',
              alt: '⌥',
              meta: '⌘'
            };
            // state.modifiers only ever has ctrl/shift/alt/meta, all present in
            // the symbol map, so no fallback is needed.
            parts.push(symbols[key]);
          } else {
            parts.push(key.charAt(0).toUpperCase() + key.slice(1));
          }
        }
      });
    }

    if (state.value) {
      parts.push(formatKey(state.value));
    }

    // This path is only reached when `combo` is false (the combo branch above
    // returns early), so modifiers/value are joined with a single space.
    return parts.join(' ');
  };

  // Build CSS classes
  const elementClasses = `
    kbd
    kbd-${kbdProps.size || 'md'}
    kbd-${kbdProps.variant || 'default'}
    kbd-${kbdProps.shape || 'rounded'}
    ${classes.base}
    ${classes.pressed}
    ${classes.hovered}
    ${classes.disabled}
    ${classes.focused}
    ${classes.highlighted}
    ${classes.interactive}
    ${showBorder ? 'kbd-bordered' : 'kbd-borderless'}
    ${showShadow ? 'kbd-shadow' : 'kbd-shadowless'}
    ${showBackground ? 'kbd-background' : 'kbd-transparent'}
    ${kbdProps.showAsIcon ? 'kbd-icon' : 'kbd-text'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build base styles
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: kbdProps.showAsIcon ? 'auto' : '1.5em',
    height: kbdProps.showAsIcon ? 'auto' : '1.5em',
    padding: kbdProps.showAsIcon ? '0' : '0.25em 0.5em',
    fontSize: '0.875em',
    fontFamily: theme.fonts?.mono || 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    fontWeight: '500',
    lineHeight: '1',
    textAlign: 'center',
    cursor: kbdProps.interactive && !state.disabled ? 'pointer' : 'default',
    userSelect: 'none',
    transition: `all ${animationDuration}ms ease-in-out`,
    transform: state.pressed ? `scale(${pressScale})` : (state.hovered ? `scale(${hoverScale})` : 'scale(1)'),
    ...style
  };

  // Apply variant-specific styles
  const variantStyles: React.CSSProperties = {};

  switch (kbdProps.variant) {
    case 'filled':
      variantStyles.backgroundColor = backgroundColor || theme.colors?.gray + '20';
      variantStyles.color = textColor || theme.colors?.text || '#374151';
      variantStyles.border = showBorder ? `1px solid ${borderColor || theme.colors?.gray + '40'}` : 'none';
      variantStyles.boxShadow = showShadow ? (shadow || '0 1px 2px rgba(0, 0, 0, 0.05)') : 'none';
      break;
    case 'outlined':
      variantStyles.backgroundColor = showBackground ? (backgroundColor || theme.colors?.white || '#ffffff') : 'transparent';
      variantStyles.color = textColor || theme.colors?.text || '#374151';
      variantStyles.border = showBorder ? `1px solid ${borderColor || theme.colors?.gray + '60'}` : 'none';
      variantStyles.boxShadow = showShadow ? (shadow || '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none';
      break;
    case 'minimal':
      variantStyles.backgroundColor = 'transparent';
      variantStyles.color = textColor || theme.colors?.muted || '#6b7280';
      variantStyles.border = 'none';
      variantStyles.boxShadow = 'none';
      variantStyles.padding = '0 0.25em';
      break;
    default:
      variantStyles.backgroundColor = backgroundColor || theme.colors?.gray + '10';
      variantStyles.color = textColor || theme.colors?.text || '#111827';
      variantStyles.border = showBorder ? `1px solid ${borderColor || theme.colors?.gray + '30'}` : 'none';
      variantStyles.boxShadow = showShadow ? (shadow || '0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7)') : 'none';
      break;
  }

  // Apply size-specific styles
  const sizeStyles: React.CSSProperties = {};

  switch (kbdProps.size) {
    case 'xs':
      sizeStyles.fontSize = '0.75em';
      sizeStyles.minWidth = '1.25em';
      sizeStyles.height = '1.25em';
      sizeStyles.padding = '0.125em 0.375em';
      break;
    case 'sm':
      sizeStyles.fontSize = '0.8125em';
      sizeStyles.minWidth = '1.375em';
      sizeStyles.height = '1.375em';
      sizeStyles.padding = '0.1875em 0.4375em';
      break;
    case 'lg':
      sizeStyles.fontSize = '1em';
      sizeStyles.minWidth = '1.75em';
      sizeStyles.height = '1.75em';
      sizeStyles.padding = '0.3125em 0.5625em';
      break;
    default:
      // md styles already set in baseStyles
      break;
  }

  // Apply shape-specific styles
  const shapeStyles: React.CSSProperties = {};

  switch (kbdProps.shape) {
    case 'rectangle':
      shapeStyles.borderRadius = '0.25rem';
      break;
    case 'square':
      shapeStyles.borderRadius = '0.125rem';
      sizeStyles.minWidth = sizeStyles.height || '1.5em';
      break;
    case 'pill':
      shapeStyles.borderRadius = '9999px';
      break;
    default:
      shapeStyles.borderRadius = theme.borderRadius?.md || '0.375rem';
      break;
  }

  // Apply state-specific styles
  const stateStyles: React.CSSProperties = {};

  if (state.disabled) {
    stateStyles.opacity = 0.5;
    stateStyles.cursor = 'not-allowed';
  }

  // NOTE: `state.focused` is always false today — useKbd declares a `focused`
  // state but its setter is never invoked, so no focus-style branch is emitted.

  if (state.highlighted) {
    stateStyles.backgroundColor = theme.colors?.primary + '10';
    stateStyles.borderColor = theme.colors?.primary + '50';
  }

  // Tooltip styles
  const tooltipStyles: React.CSSProperties = {
    position: 'relative',
  };

  const tooltipContentStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: tooltipPosition === 'top' ? '100%' : 'auto',
    top: tooltipPosition === 'bottom' ? '100%' : 'auto',
    left: tooltipPosition === 'right' ? '100%' : '50%',
    right: tooltipPosition === 'left' ? '100%' : 'auto',
    transform: tooltipPosition === 'left' ? 'translateY(-50%)' :
                tooltipPosition === 'right' ? 'translateY(-50%)' :
                'translateX(-50%)',
    marginBottom: tooltipPosition === 'top' ? '0.5rem' : '0',
    marginTop: tooltipPosition === 'bottom' ? '0.5rem' : '0',
    marginLeft: tooltipPosition === 'right' ? '0.5rem' : '0',
    marginRight: tooltipPosition === 'left' ? '0.5rem' : '0',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    backgroundColor: theme.colors?.gray + '90',
    color: theme.colors?.white || '#ffffff',
    borderRadius: theme.borderRadius?.sm || '0.25rem',
    whiteSpace: 'nowrap',
    zIndex: 50,
    opacity: state.hovered ? 1 : 0,
    visibility: state.hovered ? 'visible' : 'hidden',
    transition: 'opacity 150ms, visibility 150ms',
    pointerEvents: 'none'
  };

  // Build combined styles
  const combinedStyles = {
    ...baseStyles,
    ...variantStyles,
    ...sizeStyles,
    ...shapeStyles,
    ...stateStyles
  };

  // Render custom content
  if (renderKey) {
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
        onKeyUp={handleKeyUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-testid="kbd"
        data-pressed={state.pressed}
        data-hovered={state.hovered}
        data-disabled={state.disabled}
        data-focused={state.focused}
        data-value={state.value}
        data-modifiers={Object.entries(state.modifiers).filter(([, v]) => v).map(([k]) => k).join('+')}
        data-size={kbdProps.size}
        data-variant={kbdProps.variant}
        data-shape={kbdProps.shape}
        data-interactive={kbdProps.interactive}
      >
        {renderKey({
          value: state.value,
          modifiers: state.modifiers,
          display: getDisplayText(),
          state
        })}
      </Component>
    );
  }

  // Render default content
  const content = children || getDisplayText();

  return (
    <Component
      ref={ref}
      className={elementClasses}
      style={showTooltip ? tooltipStyles : combinedStyles}
      {...attributes}
      {...focusable.attributes}
      {...pressable.attributes}
      {...semantic.attributes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-testid="kbd"
      data-pressed={state.pressed}
      data-hovered={state.hovered}
      data-disabled={state.disabled}
      data-focused={state.focused}
      data-value={state.value}
      data-modifiers={Object.entries(state.modifiers).filter(([, v]) => v).map(([k]) => k).join('+')}
      data-size={kbdProps.size}
      data-variant={kbdProps.variant}
      data-shape={kbdProps.shape}
      data-interactive={kbdProps.interactive}
    >
      {content}
      {showTooltip && (tooltip || kbdProps.description) && (
        <span style={tooltipContentStyles} data-testid="kbd-tooltip">
          {tooltip || kbdProps.description}
        </span>
      )}
    </Component>
  );
});

Kbd.displayName = 'Kbd';

/**
 * Kbd.Shortcut component for displaying keyboard shortcuts
 */
export const KbdShortcut = forwardRef<HTMLElement, Omit<KbdProps, 'value' | 'defaultValue'> & {
  /** Keyboard shortcut string (e.g., "Ctrl+S", "Cmd+C") */
  shortcut: string;
  /** Whether to parse the shortcut automatically */
  parse?: boolean;
}>(({ shortcut, parse: parseShortcut = true, ...props }, ref) => {
  const parsed = parseShortcut ? parseKeyShortcut(shortcut) : { value: shortcut, modifiers: { ctrl: false, shift: false, alt: false, meta: false } };

  return (
    <Kbd
      {...props}
      ref={ref}
      value={parsed.value}
      defaultModifiers={parsed.modifiers}
      combo={true}
      showModifiers={true}
    />
  );
});

KbdShortcut.displayName = 'KbdShortcut';

/**
 * Kbd.Modifier component for displaying modifier keys only
 */
export const KbdModifier = forwardRef<HTMLElement, Omit<KbdProps, 'value' | 'defaultValue'> & {
  /** Modifier key type */
  modifier: 'ctrl' | 'shift' | 'alt' | 'meta';
  /** Whether to show symbol */
  showSymbol?: boolean;
}>(({ modifier, showSymbol = true, ...props }, ref) => {
  const symbols = {
    ctrl: '⌃',
    shift: '⇧',
    alt: '⌥',
    meta: '⌘'
  };

  return (
    <Kbd
      {...props}
      ref={ref}
      value={showSymbol ? symbols[modifier] : modifier}
      showAsIcon={showSymbol}
      size={props.size || 'sm'}
    />
  );
});

KbdModifier.displayName = 'KbdModifier';

export default Kbd;