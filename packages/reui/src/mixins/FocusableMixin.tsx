/**
 * Focus management mixin following Flutter behavior patterns.
 * Provides comprehensive focus control and keyboard navigation.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { KeyboardNavigation, NavigationKey } from '../contracts';
import type { SemanticMixinDomProps } from './SemanticMixin';

export interface FocusableMixinProps extends SemanticMixinDomProps {
  /** Initial focus state */
  defaultFocused?: boolean;
  /** Whether element can receive focus */
  focusable?: boolean;
  /** Focus management strategy ('first' focuses the first focusable descendant) */
  focusStrategy?: 'auto' | 'manual' | 'programmatic' | 'first';
  /** Custom focus handler */
  onFocus?: (event: FocusEvent) => void;
  /** Custom blur handler */
  onBlur?: (event: FocusEvent) => void;
  /** Keyboard navigation configuration */
  keyboard?: KeyboardNavigation;
  /**
   * Inert passthrough: callers pass a uniform `{ disabled, ref, ... }` bag to
   * all three mixins; this mixin ignores `disabled` (use `focusable`). Accepted
   * so the common bag type-checks without widening named keys.
   */
  disabled?: boolean;
  /** Inert passthrough (see `disabled` above). */
  ref?: React.Ref<HTMLElement>;
}

export interface FocusableState {
  /** Current focus state */
  focused: boolean;
  /** Whether focus is disabled */
  disabled: boolean;
  /** Tab index for keyboard navigation */
  tabIndex: number;
  /** Focus reference for programmatic control */
  focusRef: React.RefObject<HTMLElement | null>;
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
  /** Forward a DOM focus event into the mixin (updates `focused`, invokes onFocus) */
  handleFocus: (event: FocusEvent) => void;
  /** Forward a DOM blur event into the mixin (updates `focused`, invokes onBlur) */
  handleBlur: (event: FocusEvent) => void;
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

  return useMemo(() => ({
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
    handleKeyUp,
    // Exposed so hooks can forward focus/blur events into the mixin.
    handleFocus,
    handleBlur
  }), [focused, focusable, focusStrategy, focusRef, focus, blur, toggleFocus, handleKeyDown, handleKeyUp, handleFocus, handleBlur, tabIndex]);
};