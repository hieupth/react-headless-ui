/**
 * Keyboard Key headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages keyboard key display state and interactions.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Keyboard key state interface
 */
export interface KbdState {
  /** Whether key is currently pressed */
  pressed: boolean;
  /** Whether key is currently hovered */
  hovered: boolean;
  /** Whether key is disabled */
  disabled: boolean;
  /** Whether key is focused */
  focused: boolean;
  /** Key value/text */
  value: string;
  /** Whether to show modifier keys */
  showModifiers: boolean;
  /** Whether to show shortcut notation */
  showShortcuts: boolean;
  /** Whether key is highlighted */
  highlighted: boolean;
  /** Current modifier keys */
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
}

/**
 * Keyboard key actions interface
 */
export interface KbdActions {
  /** Press key */
  press: () => void;
  /** Release key */
  release: () => void;
  /** Focus key */
  focus: () => void;
  /** Blur key */
  blur: () => void;
  /** Hover key */
  hover: () => void;
  /** Unhover key */
  unhover: () => void;
  /** Set value */
  setValue: (value: string) => void;
  /** Set modifiers */
  setModifiers: (modifiers: Partial<KbdState['modifiers']>) => void;
  /** Toggle modifier */
  toggleModifier: (modifier: keyof KbdState['modifiers']) => void;
  /** Clear modifiers */
  clearModifiers: () => void;
  /** Get key element */
  getElement: () => HTMLElement | null;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    'aria-label'?: string;
    'aria-keyshortcuts'?: string;
    'aria-pressed'?: boolean;
    'role'?: string;
    'tabIndex'?: number;
  };
}

/**
 * Props for useKbd hook
 */
export interface UseKbdProps {
  /** Initial key value */
  defaultValue?: string;
  /** Controlled key value */
  value?: string;
  /** Whether key is disabled */
  disabled?: boolean;
  /** Whether key is interactive (clickable) */
  interactive?: boolean;
  /** Whether to show modifier keys */
  showModifiers?: boolean;
  /** Whether to show shortcut notation */
  showShortcuts?: boolean;
  /** Whether to highlight on hover */
  highlightOnHover?: boolean;
  /** Whether to animate on press */
  animateOnPress?: boolean;
  /** Initial modifier keys */
  defaultModifiers?: Partial<KbdState['modifiers']>;
  /** Controlled modifier keys */
  modifiers?: Partial<KbdState['modifiers']>;
  /** Key size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Key variant style */
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  /** Key shape */
  shape?: 'rectangle' | 'rounded' | 'square' | 'pill';
  /** Press handler */
  onPress?: () => void;
  /** Release handler */
  onRelease?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Hover handler */
  onHover?: (hovered: boolean) => void;
  /** Change handler */
  onChange?: (value: string, modifiers: KbdState['modifiers']) => void;
  /** Key element ref */
  keyRef?: React.RefObject<HTMLElement | null>;
  /** Custom key label */
  label?: string;
  /** Custom key description */
  description?: string;
  /** Whether to show as combo */
  combo?: boolean;
  /** Combo separator */
  comboSeparator?: string;
  /** Whether to capitalize */
  capitalize?: boolean;
  /** Whether to show as icon */
  showAsIcon?: boolean;
}

/**
 * Return type for useKbd hook
 */
export interface UseKbdReturns {
  /** Current keyboard key state */
  state: KbdState;
  /** Keyboard key actions */
  actions: KbdActions;
  /** Accessibility attributes */
  attributes: {
    'aria-label'?: string;
    'aria-keyshortcuts'?: string;
    'aria-pressed'?: boolean;
    'role'?: string;
    'tabIndex'?: number;
  };
  /** CSS classes for styling */
  classes: {
    base: string;
    pressed: string;
    hovered: string;
    disabled: string;
    focused: string;
    highlighted: string;
    interactive: string;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * Default modifier keys state
 */
const DEFAULT_MODIFIERS = {
  ctrl: false,
  shift: false,
  alt: false,
  meta: false
};

/**
 * Map modifier keys to symbols
 */
const MODIFIER_SYMBOLS = {
  ctrl: '⌃',
  shift: '⇧',
  alt: '⌥',
  meta: '⌘'
};

/**
 * Keyboard key hook implementation
 * @param props - Keyboard key configuration props
 * @returns Keyboard key state, actions, and attributes
 */
export function useKbd(props: UseKbdProps): UseKbdReturns {
  const {
    defaultValue = '',
    value: controlledValue,
    disabled = false,
    interactive = true,
    showModifiers = true,
    showShortcuts = true,
    highlightOnHover = true,
    animateOnPress = true,
    defaultModifiers = {},
    modifiers: controlledModifiers,
    size = 'md',
    variant = 'default',
    shape = 'rounded',
    onPress,
    onRelease,
    onFocus,
    onBlur,
    onHover,
    onChange,
    keyRef,
    label,
    description,
    combo = false,
    comboSeparator = '+',
    capitalize = false,
    showAsIcon = false
  } = props;

  // State management
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [pressed, setPressed] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [internalModifiers, setInternalModifiers] = useState<KbdState['modifiers']>({
    ...DEFAULT_MODIFIERS,
    ...defaultModifiers
  });

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = keyRef || internalRef;

  // Determine if component is controlled
  const isValueControlled = controlledValue !== undefined;
  const isModifiersControlled = controlledModifiers !== undefined;
  const currentValue = isValueControlled ? controlledValue : internalValue;
  const currentModifiers = isModifiersControlled
    ? { ...DEFAULT_MODIFIERS, ...controlledModifiers }
    : internalModifiers;

  /**
   * Press key
   */
  const pressAction = useCallback(() => {
    if (!interactive || disabled) return;

    if (animateOnPress) {
      setPressed(true);
    }

    onPress?.();
    onChange?.(currentValue, currentModifiers);
  }, [interactive, disabled, animateOnPress, currentValue, currentModifiers, onPress, onChange]);

  /**
   * Release key
   */
  const releaseAction = useCallback(() => {
    setPressed(false);
    onRelease?.();
  }, [onRelease]);

  /**
   * Focus key
   */
  const focusAction = useCallback(() => {
    if (!interactive || disabled) return;
    setFocused(true);
    elementRef.current?.focus();
  }, [interactive, disabled]);

  /**
   * Blur key
   */
  const blurAction = useCallback(() => {
    setFocused(false);
    elementRef.current?.blur();
  }, []);

  /**
   * Hover key
   */
  const hoverAction = useCallback(() => {
    if (!interactive || disabled) return;
    setHovered(true);
    onHover?.(true);
  }, [interactive, disabled, onHover]);

  /**
   * Unhover key
   */
  const unhoverAction = useCallback(() => {
    if (!interactive || disabled) return;
    setHovered(false);
    onHover?.(false);
  }, [interactive, disabled, onHover]);

  /**
   * Set value
   */
  const setValueAction = useCallback((newValue: string) => {
    if (!isValueControlled) {
      setInternalValue(newValue);
    }
  }, [isValueControlled]);

  /**
   * Set modifiers
   */
  const setModifiersAction = useCallback((newModifiers: Partial<KbdState['modifiers']>) => {
    if (!isModifiersControlled) {
      setInternalModifiers(prev => ({ ...prev, ...newModifiers }));
    }
  }, [isModifiersControlled]);

  /**
   * Toggle modifier
   */
  const toggleModifierAction = useCallback((modifier: keyof KbdState['modifiers']) => {
    if (!isModifiersControlled) {
      setInternalModifiers(prev => ({ ...prev, [modifier]: !prev[modifier] }));
    }
  }, [isModifiersControlled]);

  /**
   * Clear modifiers
   */
  const clearModifiersAction = useCallback(() => {
    if (!isModifiersControlled) {
      setInternalModifiers(DEFAULT_MODIFIERS);
    }
  }, [isModifiersControlled]);

  /**
   * Get key element
   */
  const getElementAction = useCallback(() => {
    return elementRef.current;
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    const props: any = {};

    // ARIA label
    if (label) {
      props['aria-label'] = label;
    } else if (description) {
      props['aria-label'] = description;
    } else {
      // Generate label from value and modifiers
      const parts: string[] = [];

      Object.entries(currentModifiers).forEach(([key, value]) => {
        if (value) {
          parts.push(key.charAt(0).toUpperCase() + key.slice(1));
        }
      });

      if (currentValue) {
        parts.push(capitalize ? currentValue.toUpperCase() : currentValue);
      }

      props['aria-label'] = parts.join(' ');
    }

    // ARIA key shortcuts
    if (showShortcuts && (currentValue || Object.values(currentModifiers).some(v => v))) {
      const shortcuts: string[] = [];

      Object.entries(currentModifiers).forEach(([key, value]) => {
        if (value) {
          shortcuts.push(key);
        }
      });

      if (currentValue) {
        shortcuts.push(currentValue.toLowerCase());
      }

      // reason: shortcuts always has ≥1 element here — the enclosing guard
      // (currentValue || some-modifier) plus the pushes above guarantee it.
      props['aria-keyshortcuts'] = shortcuts.join('+');
    }

    // ARIA pressed (for interactive keys)
    if (interactive && pressed) {
      props['aria-pressed'] = true;
    }

    // Role
    props['role'] = interactive ? 'button' : 'kbd';

    // Tab index
    if (interactive && !disabled) {
      props['tabIndex'] = 0;
    }

    return props;
  }, [label, description, currentValue, currentModifiers, showShortcuts, capitalize, interactive, pressed]);

  // Build state
  const state: KbdState = useMemo(() => ({
    pressed,
    hovered,
    disabled,
    focused,
    value: currentValue,
    showModifiers,
    showShortcuts,
    highlighted: highlightOnHover && hovered,
    modifiers: currentModifiers
  }), [pressed, hovered, disabled, focused, currentValue, showModifiers, showShortcuts, highlightOnHover, currentModifiers]);

  // Build actions
  const actions: KbdActions = useMemo(() => ({
    press: pressAction,
    release: releaseAction,
    focus: focusAction,
    blur: blurAction,
    hover: hoverAction,
    unhover: unhoverAction,
    setValue: setValueAction,
    setModifiers: setModifiersAction,
    toggleModifier: toggleModifierAction,
    clearModifiers: clearModifiersAction,
    getElement: getElementAction,
    getAccessibilityProps: getAccessibilityPropsAction
  }), [pressAction, releaseAction, focusAction, blurAction, hoverAction, unhoverAction, setValueAction, setModifiersAction, toggleModifierAction, clearModifiersAction, getElementAction, getAccessibilityPropsAction]);

  // Build accessibility attributes
  const accessibilityProps = useMemo(() => getAccessibilityPropsAction(), [getAccessibilityPropsAction]);

  // Build CSS classes
  const classes = useMemo(() => ({
    base: 'kbd',
    pressed: pressed ? 'kbd-pressed' : '',
    hovered: hovered ? 'kbd-hovered' : '',
    disabled: disabled ? 'kbd-disabled' : '',
    focused: focused ? 'kbd-focused' : '',
    highlighted: state.highlighted ? 'kbd-highlighted' : '',
    interactive: interactive ? 'kbd-interactive' : 'kbd-static'
  }), [pressed, hovered, disabled, focused, state.highlighted, interactive]);

  // Mixins
  const focusable = useFocusableMixin({
    disabled: !interactive || disabled,
    ref: elementRef
  });

  const pressable = usePressableMixin({
    disabled: !interactive || disabled,
    ref: elementRef
  });

  const semantic = useSemanticMixin({
    role: interactive ? 'button' : undefined,
    ref: elementRef
  });

  return useMemo(() => ({
    state,
    actions,
    attributes: accessibilityProps,
    classes,
    focusable,
    pressable,
    semantic
  }), [state, actions, accessibilityProps, classes, focusable, pressable, semantic]);
}

/**
 * Utility function to format key display
 */
export function formatKeyDisplay(
  value: string,
  modifiers: KbdState['modifiers'],
  options: {
    showModifiers?: boolean;
    combo?: boolean;
    comboSeparator?: string;
    capitalize?: boolean;
    useSymbols?: boolean;
  } = {}
): string {
  const {
    showModifiers = true,
    combo = false,
    comboSeparator = '+',
    capitalize = false,
    useSymbols = true
  } = options;

  const parts: string[] = [];

  // Add modifiers
  if (showModifiers) {
    Object.entries(modifiers).forEach(([key, value]) => {
      if (value) {
        if (useSymbols) {
          parts.push(MODIFIER_SYMBOLS[key as keyof typeof MODIFIER_SYMBOLS] || key);
        } else {
          parts.push(capitalize ? key.toUpperCase() : key);
        }
      }
    });
  }

  // Add main key
  if (value) {
    parts.push(capitalize ? value.toUpperCase() : value);
  }

  // Join with separator or space
  return combo ? parts.join(comboSeparator) : parts.join(' ');
}

/**
 * Utility function to parse key shortcut string
 */
export function parseKeyShortcut(shortcut: string): {
  value: string;
  modifiers: KbdState['modifiers'];
} {
  const modifiers = { ...DEFAULT_MODIFIERS };
  const parts = shortcut.toLowerCase().split('+').map(p => p.trim());
  let value = '';

  parts.forEach(part => {
    switch (part) {
      case 'ctrl':
      case 'control':
        modifiers.ctrl = true;
        break;
      case 'shift':
        modifiers.shift = true;
        break;
      case 'alt':
        modifiers.alt = true;
        break;
      case 'meta':
      case 'cmd':
      case 'command':
        modifiers.meta = true;
        break;
      default:
        value = part;
        break;
    }
  });

  return { value, modifiers };
}