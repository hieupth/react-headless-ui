/**
 * Focus management mixin following Flutter behavior patterns.
 * Provides comprehensive focus control and keyboard navigation.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { KeyboardNavigation, NavigationKey } from '../contracts';

export interface FocusableMixinProps {
  /** Initial focus state */
  defaultFocused?: boolean;
  /** Whether element can receive focus */
  focusable?: boolean;
  /** Focus management strategy */
  focusStrategy?: 'auto' | 'manual' | 'programmatic';
  /** Custom focus handler */
  onFocus?: (event: FocusEvent) => void;
  /** Custom blur handler */
  onBlur?: (event: FocusEvent) => void;
  /** Keyboard navigation configuration */
  keyboard?: KeyboardNavigation;
}

export interface FocusableState {
  /** Current focus state */
  focused: boolean;
  /** Whether focus is disabled */
  disabled: boolean;
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Focus reference for programmatic control */
  focusRef: React.RefObject<HTMLElement>;
}

export interface FocusableActions {
  /** Programmatically focus element */
  focus: () => void;
  /** Programmatically blur element */
  blur: () => void;
  /** Toggle focus state */
  toggleFocus: () => void;
  /** Handle keyboard events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle key up events */
  handleKeyUp: (event: React.KeyboardEvent) => void;
}

/**
 * Composable mixin providing focus management behavior.
 * Follows Flutter mixin pattern for reusable behavior.
 */
export const useFocusableMixin = (props: FocusableMixinProps = {}): FocusableState & FocusableActions => {
  const {
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    onFocus,
    onBlur,
    keyboard
  } = props;

  const [focused, setFocused] = useState(defaultFocused);
  const focusRef = useRef<HTMLElement>(null);

  // Determine tab index based on focusability and strategy
  const tabIndex = useCallback(() => {
    if (!focusable) return -1;
    if (focusStrategy === 'manual') return 0;
    return focused ? 0 : -1;
  }, [focusable, focusStrategy, focused]);

  // Handle focus events
  const handleFocus = useCallback((event: FocusEvent) => {
    if (!focusable) return;
    setFocused(true);
    onFocus?.(event);
  }, [focusable, onFocus]);

  // Handle blur events
  const handleBlur = useCallback((event: FocusEvent) => {
    setFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  // Programmatic focus
  const focus = useCallback(() => {
    if (focusRef.current && focusable) {
      focusRef.current.focus();
    }
  }, [focusable]);

  // Programmatic blur
  const blur = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.blur();
    }
  }, []);

  // Toggle focus state
  const toggleFocus = useCallback(() => {
    if (focused) {
      blur();
    } else {
      focus();
    }
  }, [focused, focus, blur]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!keyboard?.navigationKeys.length) return;

    if (keyboard.navigationKeys.includes(event.key as NavigationKey)) {
      keyboard.onKeyDown?.(event.nativeEvent);
    }
  }, [keyboard]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (!keyboard?.navigationKeys.length) return;

    if (keyboard.navigationKeys.includes(event.key as NavigationKey)) {
      keyboard.onKeyUp?.(event.nativeEvent);
    }
  }, [keyboard]);

  // Auto-focus logic
  useEffect(() => {
    if (defaultFocused && focusStrategy === 'auto') {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(focus, 0);
      return () => clearTimeout(timeout);
    }
  }, [defaultFocused, focusStrategy, focus]);

  return {
    // State
    focused,
    disabled: !focusable,
    tabIndex: tabIndex(),
    focusRef,

    // Actions
    focus,
    blur,
    toggleFocus,
    handleKeyDown,
    handleKeyUp
  };
};