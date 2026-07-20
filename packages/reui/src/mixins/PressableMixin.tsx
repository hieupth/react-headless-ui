/**
 * Pressable interaction mixin following Flutter gesture patterns.
 * Provides comprehensive press/touch/click behavior with accessibility.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type { SemanticMixinDomProps } from './SemanticMixin';

export interface PressableMixinProps extends SemanticMixinDomProps {
  /** Initial pressed state */
  defaultPressed?: boolean;
  /** Whether element can be pressed */
  pressable?: boolean;
  /** Press action handler */
  onPress?: () => void | Promise<void>;
  /** Press start handler (mouse down/touch start) */
  onPressStart?: () => void;
  /** Press end handler (mouse up/touch end) */
  onPressEnd?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Long press duration in milliseconds */
  longPressDuration?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  /**
   * Inert passthrough: callers pass a uniform `{ disabled, ref, ... }` bag to
   * all three mixins; this mixin ignores `ref`. Accepted so the common bag
   * type-checks without widening named keys.
   */
  ref?: React.Ref<HTMLElement>;
}

export interface PressableState {
  /** Current pressed state */
  pressed: boolean;
  /** Whether interaction is disabled */
  disabled: boolean;
  /** Whether currently in long press state */
  longPressed: boolean;
  /** Press counter for analytics */
  pressCount: number;
}

export interface PressableActions {
  /** Handle mouse down event */
  handleMouseDown: (event: React.MouseEvent) => void;
  /** Handle mouse up event */
  handleMouseUp: (event: React.MouseEvent) => void;
  /** Handle mouse enter event */
  handleMouseEnter: (event: React.MouseEvent) => void;
  /** Handle mouse leave event */
  handleMouseLeave: (event: React.MouseEvent) => void;
  /** Handle touch start event */
  handleTouchStart: (event: React.TouchEvent) => void;
  /** Handle touch end event */
  handleTouchEnd: (event: React.TouchEvent) => void;
  /** Handle click event */
  handleClick: (event: React.MouseEvent) => void;
  /** Handle key down for accessibility */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Programmatically trigger press */
  press: () => void;
  /** Reset press state */
  reset: () => void;
}

/**
 * Composable mixin providing press interaction behavior.
 * Follows Flutter GestureDetector patterns for gesture handling.
 */
export const usePressableMixin = (props: PressableMixinProps = {}): PressableState & PressableActions => {
  const {
    defaultPressed = false,
    pressable = true,
    onPress,
    onPressStart,
    onPressEnd,
    onLongPress,
    longPressDuration = 500,
    disabled = false,
    preventDefault = false
  } = props;

  const [pressed, setPressed] = useState(defaultPressed);
  const [longPressed, setLongPressed] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);

  // Start press interaction
  const startPress = useCallback(() => {
    if (!pressable || disabled) return;

    isPressedRef.current = true;
    setPressed(true);
    onPressStart?.();

    // Setup long press timer
    if (onLongPress && longPressDuration > 0) {
      longPressTimeoutRef.current = setTimeout(() => {
        setLongPressed(true);
        onLongPress();
      }, longPressDuration);
    }
  }, [pressable, disabled, onPressStart, onLongPress, longPressDuration]);

  // End press interaction
  const endPress = useCallback(() => {
    if (!isPressedRef.current) return;

    isPressedRef.current = false;
    setPressed(false);
    setLongPressed(false);
    onPressEnd?.();

    // Clear long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, [onPressEnd]);

  // Handle mouse events
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }
    startPress();
  }, [preventDefault, startPress]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    endPress();
  }, [endPress]);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    // Re-press if mouse button is still down
    if (event.buttons === 1 && isPressedRef.current) {
      setPressed(true);
    }
  }, []);

  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    // Release press when mouse leaves
    if (isPressedRef.current) {
      setPressed(false);
    }
  }, []);

  // Handle touch events
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }
    startPress();
  }, [preventDefault, startPress]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    endPress();
  }, [endPress]);

  // Handle click event
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }

    if (pressable && !disabled) {
      setPressCount(prev => prev + 1);
      onPress?.();
    }
  }, [preventDefault, pressable, disabled, onPress]);

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!pressable || disabled) return;

    // Handle Enter and Space for button-like behavior
    if (event.key === 'Enter' || event.key === ' ') {
      if (preventDefault) {
        event.preventDefault();
      }
      startPress();
    }
  }, [pressable, disabled, preventDefault, startPress]);

  // Programmatic press
  const press = useCallback(() => {
    if (pressable && !disabled) {
      setPressCount(prev => prev + 1);
      onPress?.();
    }
  }, [pressable, disabled, onPress]);

  // Reset state
  const reset = useCallback(() => {
    endPress();
    setPressCount(0);
  }, [endPress]);

  return useMemo(() => ({
    // State
    pressed,
    disabled: !pressable || disabled,
    longPressed,
    pressCount,

    // Actions
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
    handleClick,
    handleKeyDown,
    press,
    reset
  }), [pressed, pressable, disabled, longPressed, pressCount, handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd, handleClick, handleKeyDown, press, reset]);
};