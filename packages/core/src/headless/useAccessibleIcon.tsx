/**
 * AccessibleIcon headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages accessible icon with proper screen reader support.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Icon state interface
 */
export interface AccessibleIconState {
  /** Current icon state */
  icon: string | React.ReactNode;
  /** Label for screen readers */
  label: string;
  /** Whether icon is decorative */
  decorative: boolean;
  /** Whether icon is hidden */
  hidden: boolean;
  /** Current icon size */
  size: number;
  /** Icon color */
  color: string;
  /** Icon rotation degrees */
  rotation: number;
  /** Icon variant */
  variant: 'solid' | 'outline' | 'duotone' | 'light';
}

/**
 * Icon actions interface
 */
export interface AccessibleIconActions {
  /** Set icon */
  setIcon: (icon: string | React.ReactNode) => void;
  /** Set label */
  setLabel: (label: string) => void;
  /** Toggle decorative mode */
  toggleDecorative: () => void;
  /** Set decorative mode */
  setDecorative: (decorative: boolean) => void;
  /** Toggle visibility */
  toggleHidden: () => void;
  /** Set visibility */
  setHidden: (hidden: boolean) => void;
  /** Set size */
  setSize: (size: number) => void;
  /** Set color */
  setColor: (color: string) => void;
  /** Set rotation */
  setRotation: (degrees: number) => void;
  /** Rotate icon */
  rotate: (degrees: number) => void;
  /** Set variant */
  setVariant: (variant: 'solid' | 'outline' | 'duotone' | 'light') => void;
  /** Focus icon */
  focus: () => void;
  /** Get accessibility attributes */
  getAccessibilityProps: () => {
    'aria-hidden'?: boolean;
    'aria-label'?: string;
    'role'?: string;
    'tabIndex'?: number;
  };
}

/**
 * Props for useAccessibleIcon hook
 */
export interface UseAccessibleIconProps {
  /** Initial icon */
  icon?: string | React.ReactNode;
  /** Initial label */
  label?: string;
  /** Whether icon is decorative (default: false) */
  decorative?: boolean;
  /** Whether icon is initially hidden */
  hidden?: boolean;
  /** Initial icon size */
  size?: number;
  /** Initial icon color */
  color?: string;
  /** Initial rotation degrees */
  rotation?: number;
  /** Initial icon variant */
  variant?: 'solid' | 'outline' | 'duotone' | 'light';
  /** Click handler */
  onClick?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Whether icon is interactive */
  interactive?: boolean;
  /** Whether icon should animate */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Ref to the icon element */
  iconRef?: React.RefObject<HTMLElement>;
}

/**
 * Return type for useAccessibleIcon hook
 */
export interface UseAccessibleIconReturns {
  /** Current icon state */
  state: AccessibleIconState;
  /** Icon actions */
  actions: AccessibleIconActions;
  /** Accessibility attributes */
  attributes: {
    'aria-hidden'?: boolean;
    'aria-label'?: string;
    'role'?: string;
    'tabIndex'?: number;
  };
  /** Icon CSS styles */
  styles: {
    fontSize: string;
    color: string;
    transform: string;
    transition: string;
    opacity: number;
  };
  /** Focusable mixin returns */
  focusable: any;
  /** Pressable mixin returns */
  pressable: any;
  /** Semantic mixin returns */
  semantic: any;
}

/**
 * AccessibleIcon hook implementation
 * @param props - Accessible icon configuration props
 * @returns Accessible icon state, actions, and attributes
 */
export function useAccessibleIcon(props: UseAccessibleIconProps): UseAccessibleIconReturns {
  const {
    icon: initialIcon = '',
    label: initialLabel = '',
    decorative: initialDecorative = false,
    hidden: initialHidden = false,
    size: initialSize = 16,
    color: initialColor = 'currentColor',
    rotation: initialRotation = 0,
    variant: initialVariant = 'solid',
    onClick,
    onFocus,
    onBlur,
    interactive = false,
    animated = true,
    animationDuration = 200,
    iconRef
  } = props;

  // State management
  const [icon, setIconState] = useState<string | React.ReactNode>(initialIcon);
  const [label, setLabelState] = useState<string>(initialLabel);
  const [decorative, setDecorativeState] = useState<boolean>(initialDecorative);
  const [hidden, setHiddenState] = useState<boolean>(initialHidden);
  const [size, setSizeState] = useState<number>(initialSize);
  const [color, setColorState] = useState<string>(initialColor);
  const [rotation, setRotationState] = useState<number>(initialRotation);
  const [variant, setVariantState] = useState<'solid' | 'outline' | 'duotone' | 'light'>(initialVariant);

  // Refs
  const internalRef = useRef<HTMLElement>(null);
  const iconElementRef = iconRef || internalRef;

  /**
   * Set icon
   */
  const setIconAction = useCallback((newIcon: string | React.ReactNode) => {
    setIconState(newIcon);
  }, []);

  /**
   * Set label
   */
  const setLabelAction = useCallback((newLabel: string) => {
    setLabelState(newLabel);
  }, []);

  /**
   * Toggle decorative mode
   */
  const toggleDecorativeAction = useCallback(() => {
    setDecorativeState(prev => !prev);
  }, []);

  /**
   * Set decorative mode
   */
  const setDecorativeAction = useCallback((newDecorative: boolean) => {
    setDecorativeState(newDecorative);
  }, []);

  /**
   * Toggle visibility
   */
  const toggleHiddenAction = useCallback(() => {
    setHiddenState(prev => !prev);
  }, []);

  /**
   * Set visibility
   */
  const setHiddenAction = useCallback((newHidden: boolean) => {
    setHiddenState(newHidden);
  }, []);

  /**
   * Set size
   */
  const setSizeAction = useCallback((newSize: number) => {
    setSizeState(newSize);
  }, []);

  /**
   * Set color
   */
  const setColorAction = useCallback((newColor: string) => {
    setColorState(newColor);
  }, []);

  /**
   * Set rotation
   */
  const setRotationAction = useCallback((degrees: number) => {
    setRotationState(degrees);
  }, []);

  /**
   * Rotate icon
   */
  const rotateAction = useCallback((degrees: number) => {
    setRotationState(prev => prev + degrees);
  }, []);

  /**
   * Set variant
   */
  const setVariantAction = useCallback((newVariant: 'solid' | 'outline' | 'duotone' | 'light') => {
    setVariantState(newVariant);
  }, []);

  /**
   * Focus icon
   */
  const focusAction = useCallback(() => {
    iconElementRef.current?.focus();
  }, []);

  /**
   * Get accessibility attributes
   */
  const getAccessibilityPropsAction = useCallback(() => {
    const props: any = {};

    if (decorative || hidden) {
      props['aria-hidden'] = true;
    } else if (label) {
      props['aria-label'] = label;
      props['role'] = 'img';
    }

    if (interactive) {
      props['tabIndex'] = 0;
    }

    return props;
  }, [decorative, hidden, label, interactive]);

  // Click handler
  const handleClick = useCallback(() => {
    if (interactive && onClick) {
      onClick();
    }
  }, [interactive, onClick]);

  // Focus handler
  const handleFocus = useCallback(() => {
    if (interactive && onFocus) {
      onFocus();
    }
  }, [interactive, onFocus]);

  // Blur handler
  const handleBlur = useCallback(() => {
    if (interactive && onBlur) {
      onBlur();
    }
  }, [interactive, onBlur]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!interactive) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleClick();
          break;
      }
    };

    const element = iconElementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [interactive, handleClick]);

  // Build state
  const state: AccessibleIconState = {
    icon,
    label,
    decorative,
    hidden,
    size,
    color,
    rotation,
    variant
  };

  // Build actions
  const actions: AccessibleIconActions = {
    setIcon: setIconAction,
    setLabel: setLabelAction,
    toggleDecorative: toggleDecorativeAction,
    setDecorative: setDecorativeAction,
    toggleHidden: toggleHiddenAction,
    setHidden: setHiddenAction,
    setSize: setSizeAction,
    setColor: setColorAction,
    setRotation: setRotationAction,
    rotate: rotateAction,
    setVariant: setVariantAction,
    focus: focusAction,
    getAccessibilityProps: getAccessibilityPropsAction
  };

  // Build accessibility attributes
  const accessibilityProps = getAccessibilityPropsAction();

  // Build CSS styles
  const styles = {
    fontSize: `${size}px`,
    color,
    transform: `rotate(${rotation}deg)`,
    transition: animated ? `transform ${animationDuration}ms ease-in-out, opacity ${animationDuration}ms ease-in-out` : 'none',
    opacity: hidden ? 0 : 1
  };

  // Mixins
  const focusable = useFocusableMixin({
    disabled: !interactive,
    ref: iconElementRef
  });

  const pressable = usePressableMixin({
    disabled: !interactive,
    ref: iconElementRef
  });

  const semantic = useSemanticMixin({
    role: decorative ? 'presentation' : 'img',
    ariaLabel: label,
    ref: iconElementRef
  });

  return {
    state,
    actions,
    attributes: accessibilityProps,
    styles,
    focusable,
    pressable,
    semantic
  };
}