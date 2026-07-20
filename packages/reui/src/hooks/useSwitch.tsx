/**
 * Switch headless hook for React UI Forge.
 * Provides toggle switch behavior with accessibility support.
 *
 * Features:
 * - Binary on/off state toggle
 * - Keyboard navigation (Space to toggle)
 * - Form integration
 * - ARIA compliance
 * - Controlled/uncontrolled modes
 * - Disabled state
 * - Focus management
 *
 * Architecture Principles:
 * - Composition over inheritance (Widget-style)
 * - Behavior mixins (Flutter mixin pattern)
 * - Semantic-first (Flutter Semantics)
 * - No inline event handlers
 * - Immutable state updates
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useFocusableMixin, FocusableMixinProps } from '../mixins';
import { usePressableMixin, PressableMixinProps } from '../mixins';
import { useSemanticMixin, SemanticMixinProps } from '../mixins';
import { composeState, composeHandlers, composeClasses, composeStyles } from '../utils';

/**
 * Switch component properties
 */
export interface UseSwitchProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Whether switch is checked (on) */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Switch value for form submission */
  value?: string;
  /** Switch name for form submission */
  name?: string;
  /** Whether switch is required */
  required?: boolean;
  /** Whether switch is disabled */
  disabled?: boolean;
  /** Whether switch is read-only */
  readOnly?: boolean;
  /** Ref to the switch element */
  switchRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Switch component state
 */
export interface SwitchState {
  /** Current checked state */
  checked: boolean;
  /** Whether switch is focused */
  focused: boolean;
  /** Whether switch is pressed */
  pressed: boolean;
  /** Whether switch is hovered */
  hovered: boolean;
  /** Whether switch is disabled */
  disabled: boolean;
  /** Whether switch is read-only */
  readOnly: boolean;
}

/**
 * Switch component actions
 */
export interface SwitchActions {
  /** Toggle switch state */
  toggle: () => void;
  /** Set switch to checked state */
  setChecked: (checked: boolean) => void;
  /** Focus switch */
  focus: () => void;
  /** Blur switch */
  blur: () => void;
  /** Hover switch */
  hover: () => void;
  /** Unhover switch */
  unhover: () => void;
}

/**
 * Switch component return value
 */
export interface SwitchReturns {
  /** Switch state */
  state: SwitchState;
  /** Switch actions */
  actions: SwitchActions;
  /** Event handlers */
  handlers: {
    /** Click handler */
    onClick: (event: React.MouseEvent) => void;
    /** Key down handler */
    onKeyDown: (event: React.KeyboardEvent) => void;
    /** Focus handler */
    onFocus: (event: React.FocusEvent) => void;
    /** Blur handler */
    onBlur: (event: React.FocusEvent) => void;
    /** Mouse enter handler */
    onMouseEnter: (event: React.MouseEvent) => void;
    /** Mouse leave handler */
    onMouseLeave: (event: React.MouseEvent) => void;
  };
  /** Semantic attributes for accessibility */
  switchAttributes: {
    role: string;
    'aria-checked': boolean;
    'aria-disabled': boolean;
    'aria-readonly': boolean;
    'aria-required': boolean;
    tabIndex: number;
  };
  /** Form attributes */
  formAttributes: {
    name?: string;
    value?: string;
    type: string;
  };
  /** CSS class names */
  className: string;
  /** Ref to switch element */
  switchRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Switch headless hook implementation
 *
 * @param props - Switch properties
 * @returns Switch behavior and attributes
 */
export const useSwitch = (props: UseSwitchProps): SwitchReturns => {
  const {
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    value,
    name,
    required = false,
    disabled = false,
    readOnly = false,
    switchRef: externalRef,
    className,
    style,
    ...mixinProps
  } = props as UseSwitchProps & { className?: string; style?: React.CSSProperties };

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [hovered, setHovered] = useState(false);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  // Create internal ref
  const internalRef = useRef<HTMLButtonElement>(null);
  const switchRef = externalRef || internalRef;

  // Focusable mixin behavior
  const focusable = useFocusableMixin({
    disabled,
    className,
    style,
    ...mixinProps
  });

  // Pressable mixin behavior
  const pressable = usePressableMixin({
    disabled,
    className,
    style,
    ...mixinProps
  });

  // Semantic mixin behavior
  const semantic = useSemanticMixin({
    role: 'switch',
    disabled,
    className,
    style,
    ...mixinProps
  });

  /**
   * Toggle switch state
   */
  const toggle = useCallback(() => {
    if (disabled || readOnly) return;

    const newChecked = !checked;

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    // Call change handler
    onCheckedChange?.(newChecked);
  }, [checked, disabled, readOnly, isControlled, onCheckedChange]);

  /**
   * Set switch to specific state
   */
  const setChecked = useCallback((newChecked: boolean) => {
    if (disabled || readOnly || isControlled) return;

    setInternalChecked(newChecked);
    onCheckedChange?.(newChecked);
  }, [disabled, readOnly, isControlled, onCheckedChange]);

  /**
   * Focus switch
   */
  const focus = useCallback(() => {
    switchRef.current?.focus();
  }, [switchRef]);

  /**
   * Blur switch
   */
  const blur = useCallback(() => {
    switchRef.current?.blur();
  }, [switchRef]);

  /**
   * Hover switch
   */
  const hover = useCallback(() => {
    setHovered(true);
  }, []);

  /**
   * Unhover switch
   */
  const unhover = useCallback(() => {
    setHovered(false);
  }, []);

  /**
   * Handle click events
   */
  const handleClick = useCallback((event: React.MouseEvent) => {
    // Prevent default if read-only
    if (readOnly) {
      event.preventDefault();
      return;
    }

    // Call pressable handler
    pressable.handleClick(event);

    // Toggle state
    toggle();
  }, [readOnly, pressable.handleClick, toggle]);

  /**
   * Handle key down events
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Call pressable handler first
    pressable.handleKeyDown(event);

    // Handle Space key to toggle
    if (event.key === ' ' || event.key === 'Space') {
      event.preventDefault();
      toggle();
    }

    // Handle Enter key to toggle
    if (event.key === 'Enter') {
      event.preventDefault();
      toggle();
    }
  }, [pressable.handleKeyDown, toggle]);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback((event: React.FocusEvent) => {
    focusable.handleFocus(event as unknown as FocusEvent);
    semantic.handlers?.onFocus?.(event);
  }, [focusable.handleFocus, semantic.handlers]);

  /**
   * Handle blur events
   */
  const handleBlur = useCallback((event: React.FocusEvent) => {
    focusable.handleBlur(event as unknown as FocusEvent);
    semantic.handlers?.onBlur?.(event);
  }, [focusable.handleBlur, semantic.handlers]);

  /**
   * Handle mouse enter events
   */
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    pressable.handleMouseEnter(event);
    setHovered(true);
  }, [pressable.handleMouseEnter]);

  /**
   * Handle mouse leave events
   */
  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    pressable.handleMouseLeave(event);
    setHovered(false);
  }, [pressable.handleMouseLeave]);

  // Compose state from mixins
  const composedState = composeState<SwitchState>({
    checked,
    focused: focusable.focused,
    pressed: pressable.pressed,
    hovered,
    disabled,
    readOnly
  });

  // Handlers (plain object — composeHandlers merges functions, not handler maps)
  const composedHandlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  };

  // Compose class names (include hovered class so it reflects DOM hover state)
  const composedClassName = composeClasses(className, hovered && 'switch-hovered');

  // Compose styles
  const composedStyle = composeStyles(style);

  // Create actions object
  const actions: SwitchActions = {
    toggle,
    setChecked,
    focus,
    blur,
    hover,
    unhover
  };

  // Create semantic attributes
  const switchAttributes = {
    role: semantic.role || 'switch',
    'aria-checked': checked,
    'aria-disabled': disabled,
    'aria-readonly': readOnly,
    'aria-required': required,
    tabIndex: disabled ? -1 : 0
  };

  // Create form attributes
  const formAttributes = {
    name,
    value,
    type: 'checkbox'
  };

  return useMemo(() => ({
    state: composedState,
    actions,
    handlers: composedHandlers,
    switchAttributes,
    formAttributes,
    className: composedClassName,
    switchRef
  }), [composedState, actions, composedHandlers, switchAttributes, formAttributes, composedClassName, switchRef]);
};