/**
 * Card headless hook following Flutter patterns.
 * Provides card behavior with sections and interactive states.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardSize = 'sm' | 'md' | 'lg';

export interface UseCardProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card description/content */
  description?: string;
  /** Card variant/semantic style */
  variant?: CardVariant;
  /** Card size */
  size?: CardSize;
  /** Whether card is interactive/clickable */
  interactive?: boolean;
  /** Whether card should show hover states */
  hoverable?: boolean;
  /** Whether card is selected */
  selected?: boolean;
  /** Whether card is disabled */
  disabled?: boolean;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Card header actions */
  actions?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Selection change handler */
  onSelectionChange?: (selected: boolean) => void;
}

export interface UseCardState {
  /** Current focus state */
  focused: boolean;
  /** Current press state */
  pressed: boolean;
  /** Current hover state */
  hovered: boolean;
  /** Current selection state */
  selected: boolean;
  /** Current disabled state */
  disabled: boolean;
}

export interface UseCardActions {
  /** Handle click */
  handleClick: (event: React.MouseEvent) => void;
  /** Handle key events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle mouse enter */
  handleMouseEnter: (event: React.MouseEvent) => void;
  /** Handle mouse leave */
  handleMouseLeave: (event: React.MouseEvent) => void;
  /** Toggle selection */
  toggleSelection: () => void;
  /** Get variant classes */
  getVariantClasses: () => string;
}

export interface UseCardReturns extends UseCardState, UseCardActions {
  /** Semantic attributes for card container */
  semanticAttributes: Record<string, any>;
  /** Reference to card container */
  cardRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to header element */
  headerRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to body element */
  bodyRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to footer element */
  footerRef: React.RefObject<HTMLDivElement | null>;
  /** Computed variant classes */
  variantClasses: string;
  /** Computed size classes */
  sizeClasses: string;
}

/**
 * Headless card hook providing card behavior.
 * Includes interactive states, variants, and accessibility.
 */
export const useCard = (props: UseCardProps): UseCardReturns => {
  const {
    title,
    subtitle,
    description,
    variant = 'default',
    size = 'md',
    interactive = false,
    hoverable = interactive,
    selected = false,
    disabled = false,
    footer,
    actions,
    onClick,
    onSelectionChange,
    defaultFocused = false,
    focusable = interactive,
    focusStrategy = 'auto',
    pressable = interactive && !disabled,
    role = interactive ? 'button' : 'article',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [hovered, setHovered] = useState(false);
  const [internalSelected, setInternalSelected] = useState(selected);

  // References
  const cardRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: interactive && focusable && !disabled,
    focusStrategy
  });

  // Press behavior for interactive cards
  const pressableMixin = usePressableMixin({
    pressable
  });

  // Sync external selected state with internal state
  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  // Compute variant classes
  const getVariantClasses = useCallback(() => {
    const variantMap = {
      default: 'bg-white border border-gray-200 shadow-sm',
      outlined: 'bg-white border-2 border-gray-300',
      elevated: 'bg-white border border-gray-200 shadow-md hover:shadow-lg',
      filled: 'bg-gray-50 border border-gray-200'
    };
    return variantMap[variant];
  }, [variant]);

  // Compute size classes
  const getSizeClasses = useCallback(() => {
    const sizeMap = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    return sizeMap[size];
  }, [size]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!interactive || disabled) return;

    event.preventDefault();

    if (onClick) {
      onClick();
    } else if (onSelectionChange) {
      const newSelected = !internalSelected;
      setInternalSelected(newSelected);
      onSelectionChange(newSelected);
    }
  }, [interactive, disabled, onClick, onSelectionChange, internalSelected]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyDown(event);

    // Handle click/selection on Enter/Space for interactive cards
    if (interactive && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();

      if (onClick) {
        onClick();
      } else if (onSelectionChange) {
        const newSelected = !internalSelected;
        setInternalSelected(newSelected);
        onSelectionChange(newSelected);
      }
    }
  }, [focusableMixin, interactive, disabled, onClick, onSelectionChange, internalSelected]);

  // Handle mouse enter
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (!hoverable || disabled) return;
    setHovered(true);
  }, [hoverable, disabled]);

  // Handle mouse leave
  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    if (!hoverable || disabled) return;
    setHovered(false);
  }, [hoverable, disabled]);

  // Toggle selection
  const toggleSelection = useCallback(() => {
    if (!onSelectionChange || disabled) return;
    const newSelected = !internalSelected;
    setInternalSelected(newSelected);
    onSelectionChange(newSelected);
  }, [onSelectionChange, disabled, internalSelected]);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label: label || title,
    labelledBy: labelledBy || (title ? `${role}-title` : undefined),
    describedBy: describedBy || (description ? `${role}-description` : undefined),
    'aria-pressed': interactive && onSelectionChange ? internalSelected : undefined,
    'aria-selected': interactive && onSelectionChange ? internalSelected : undefined,
    'aria-disabled': disabled,
    'data-variant': variant,
    'data-size': size,
    'data-interactive': interactive,
    'data-hoverable': hoverable,
    'data-selected': internalSelected,
    'data-hovered': hovered,
    'data-disabled': disabled,
    tabIndex: interactive && !disabled ? 0 : undefined,
    disabled,
    ...semanticProps
  });

  // Computed state
  const state = useMemo(() => composeState<UseCardState>({
    focused: focusableMixin.focused,
    pressed: pressableMixin.pressed,
    hovered,
    selected: internalSelected,
    disabled
  }), [focusableMixin.focused, pressableMixin.pressed, hovered, internalSelected, disabled]);

  // Computed properties
  const variantClasses = useMemo(() => getVariantClasses(), [getVariantClasses]);
  const sizeClasses = useMemo(() => getSizeClasses(), [getSizeClasses]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }), [semantic, handleClick, handleKeyDown, handleMouseEnter, handleMouseLeave]);

  return useMemo(() => ({
    // State
    ...state,

    // Actions
    handleClick,
    handleKeyDown,
    handleMouseEnter,
    handleMouseLeave,
    toggleSelection,
    getVariantClasses,

    // Computed properties
    semanticAttributes,
    cardRef,
    headerRef,
    bodyRef,
    footerRef,
    variantClasses,
    sizeClasses
  }), [state, handleClick, handleKeyDown, handleMouseEnter, handleMouseLeave, toggleSelection, getVariantClasses, semanticAttributes, cardRef, headerRef, bodyRef, footerRef, variantClasses, sizeClasses]);
};