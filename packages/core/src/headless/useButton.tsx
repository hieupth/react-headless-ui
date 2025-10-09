/**
 * Button headless hook following Flutter ElevatedButton patterns.
 * Composes focus, press, and semantic mixins for complete button behavior.
 */

import { useCallback, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export interface UseButtonProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Button variant for styling */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Whether button shows loading state */
  loading?: boolean;
  /** Whether button takes full width */
  fullWidth?: boolean;
  /** Button type for form submission */
  type?: 'button' | 'submit' | 'reset';
  /** Button value for form submission */
  value?: string;
  /** Button name for form submission */
  name?: string;
}

export interface UseButtonState {
  /** Current pressed state from pressable mixin */
  pressed: boolean;
  /** Current focus state from focusable mixin */
  focused: boolean;
  /** Current disabled state */
  disabled: boolean;
  /** Current loading state */
  loading: boolean;
  /** Current variant */
  variant: string;
  /** Current size */
  size: string;
  /** Whether button takes full width */
  fullWidth: boolean;
  /** Press count for analytics */
  pressCount: number;
}

export interface UseButtonActions {
  /** Handle button click */
  handleClick: (event: React.MouseEvent) => void;
  /** Handle key down for accessibility */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle focus event */
  onFocus: (event: FocusEvent) => void;
  /** Handle blur event */
  onBlur: (event: FocusEvent) => void;
  /** Programmatically trigger button press */
  press: () => void;
  /** Focus button programmatically */
  focus: () => void;
  /** Blur button programmatically */
  blur: () => void;
}

export interface UseButtonReturns extends UseButtonState, UseButtonActions {
  /** Semantic attributes for accessibility */
  semanticAttributes: Record<string, any>;
  /** Computed class names */
  className: string;
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Reference to DOM element */
  ref: React.RefObject<HTMLElement>;
}

/**
 * Headless button hook providing complete button behavior.
 * Composes multiple mixins following Flutter composition patterns.
 */
export const useButton = (props: UseButtonProps = {}): UseButtonReturns => {
  const {
    variant = 'default',
    size = 'md',
    loading = false,
    fullWidth = false,
    type = 'button',
    value,
    name,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    onPress,
    onPressStart,
    onPressEnd,
    onLongPress,
    disabled = false,
    preventDefault = false,
    role = 'button',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // Compose mixins for button behavior
  const focusable = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !loading && !disabled,
    focusStrategy
  });

  const pressable = usePressableMixin({
    defaultPressed: false,
    pressable: !loading && !disabled,
    onPress,
    onPressStart,
    onPressEnd,
    onLongPress,
    disabled,
    preventDefault
  });

  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    disabled: disabled || loading,
    ...semanticProps
  });

  // Compose button state
  const state = useMemo(() => composeState<UseButtonState>({
    pressed: pressable.pressed,
    focused: focusable.focused,
    disabled: pressable.disabled,
    loading,
    variant,
    size,
    fullWidth,
    pressCount: pressable.pressCount
  }), [pressable.pressed, pressable.disabled, pressable.pressCount, focusable.focused, loading, variant, size, fullWidth]);

  // Compose handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    pressable.handleClick(event);
  }, [loading, disabled, pressable.handleClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (loading || disabled) return;

    // Combine focusable and pressable key handlers
    focusable.handleKeyDown(event);
    pressable.handleKeyDown(event);
  }, [loading, disabled, focusable.handleKeyDown, pressable.handleKeyDown]);

  const composedHandlers = useMemo(() => composeHandlers(
    pressable.handleMouseDown,
    pressable.handleMouseUp,
    pressable.handleMouseEnter,
    pressable.handleMouseLeave,
    pressable.handleTouchStart,
    pressable.handleTouchEnd
  ), [pressable]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    type,
    value,
    name,
    'aria-busy': loading,
    'data-variant': variant,
    'data-size': size,
    'data-loading': loading,
    'data-full-width': fullWidth,
    'data-pressed': state.pressed,
    'data-focused': state.focused,
    'data-disabled': state.disabled,
    onClick: pressable.handleClick,
    onKeyDown: pressable.handleKeyDown
  }), [semantic, type, value, name, loading, variant, size, state.pressed, state.focused, state.disabled, fullWidth, pressable.handleClick, pressable.handleKeyDown]);

  // Generate class names
  const className = useMemo(() => {
    const classes = [
      'button',
      `button-${variant}`,
      `button-${size}`
    ];

    if (state.pressed) classes.push('button-pressed');
    if (state.focused) classes.push('button-focused');
    if (state.disabled) classes.push('button-disabled');
    if (loading) classes.push('button-loading');
    if (fullWidth) classes.push('button-full-width');

    return classes.join(' ');
  }, [variant, size, state.pressed, state.focused, state.disabled, loading, fullWidth]);

  return {
    // State
    ...state,

    // Actions
    handleClick,
    handleKeyDown,
    onFocus: focusable.handleFocus,
    onBlur: focusable.handleBlur,
    press: pressable.press,
    focus: focusable.focus,
    blur: focusable.blur,

    // Computed properties
    semanticAttributes,
    className,
    tabIndex: focusable.tabIndex,
    ref: focusable.focusRef
  };
};