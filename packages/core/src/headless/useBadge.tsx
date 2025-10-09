/**
 * Badge headless hook following Flutter patterns.
 * Provides badge behavior with variants and positioning.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, SemanticMixinProps } from '../mixins';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface UseBadgeProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Badge content */
  children?: React.ReactNode;
  /** Badge variant/semantic style */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge count for number indicators */
  count?: number;
  /** Maximum count to display (shows count+ if exceeded) */
  maxCount?: number;
  /** Whether badge shows dot indicator */
  dot?: boolean;
  /** Badge position relative to parent */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Whether badge is visible */
  visible?: boolean;
  /** Whether badge should animate when value changes */
  animated?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface UseBadgeState {
  /** Current visibility state */
  visible: boolean;
  /** Current focus state */
  focused: boolean;
  /** Whether badge is animating */
  animating: boolean;
  /** Previous count value for animation */
  previousCount: number;
}

export interface UseBadgeActions {
  /** Handle click */
  handleClick: (event: React.MouseEvent) => void;
  /** Handle key events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Get display text */
  getDisplayText: () => string;
  /** Get position classes */
  getPositionClasses: () => string;
}

export interface UseBadgeReturns extends UseBadgeState, UseBadgeActions {
  /** Semantic attributes for badge element */
  semanticAttributes: Record<string, any>;
  /** Reference to badge element */
  badgeRef: React.RefObject<HTMLSpanElement>;
  /** Computed variant classes */
  variantClasses: string;
  /** Computed size classes */
  sizeClasses: string;
  /** Display text for badge */
  displayText: string;
  /** Position classes for placement */
  positionClasses: string;
}

/**
 * Headless badge hook providing badge behavior.
 * Includes variants, positioning, animations, and accessibility.
 */
export const useBadge = (props: UseBadgeProps): UseBadgeReturns => {
  const {
    children,
    variant = 'default',
    size = 'md',
    count,
    maxCount = 99,
    dot = false,
    position = 'top-right',
    visible = true,
    animated = true,
    onClick,
    defaultFocused = false,
    focusable = !!onClick,
    focusStrategy = 'auto',
    disabled = false,
    role = onClick ? 'button' : 'status',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [focused, setFocused] = useState(defaultFocused);
  const [animating, setAnimating] = useState(false);
  const [previousCount, setPreviousCount] = useState(count || 0);

  // References
  const badgeRef = React.useRef<HTMLSpanElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: visible && focusable && !disabled,
    focusStrategy
  });

  // Compute variant classes
  const getVariantClasses = useCallback(() => {
    const variantMap = {
      default: 'bg-blue-500 text-white border-blue-500',
      secondary: 'bg-gray-500 text-white border-gray-500',
      destructive: 'bg-red-500 text-white border-red-500',
      outline: 'bg-transparent text-gray-700 border-gray-300 border'
    };
    return variantMap[variant];
  }, [variant]);

  // Compute size classes
  const getSizeClasses = useCallback(() => {
    const sizeMap = {
      sm: dot ? 'w-2 h-2' : 'px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5',
      md: dot ? 'w-2.5 h-2.5' : 'px-2 py-0.5 text-xs min-w-[1.5rem] h-6',
      lg: dot ? 'w-3 h-3' : 'px-2.5 py-1 text-sm min-w-[1.75rem] h-7'
    };
    return sizeMap[size];
  }, [size, dot]);

  // Compute position classes
  const getPositionClasses = useCallback(() => {
    const positionMap = {
      'top-right': '-top-2 -right-2',
      'top-left': '-top-2 -left-2',
      'bottom-right': '-bottom-2 -right-2',
      'bottom-left': '-bottom-2 -left-2'
    };
    return positionMap[position];
  }, [position]);

  // Get display text
  const getDisplayText = useCallback(() => {
    if (dot) return '';
    if (count === undefined || count === null) return '';
    if (count > maxCount) return `${maxCount}+`;
    return count.toString();
  }, [count, maxCount, dot]);

  // Handle animation when count changes
  useEffect(() => {
    if (animated && count !== undefined && previousCount !== count) {
      setAnimating(true);
      setPreviousCount(count || 0);

      // Animation duration
      const timer = setTimeout(() => {
        setAnimating(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [count, previousCount, animated]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!onClick || disabled || !visible) return;

    event.preventDefault();
    event.stopPropagation();
    onClick();
  }, [onClick, disabled, visible]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyDown(event);

    // Handle click on Enter/Space for clickable badges
    if (onClick && !disabled && visible && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    }
  }, [focusableMixin, onClick, disabled, visible]);

  // Update focused state
  useEffect(() => {
    setFocused(focusableMixin.focused);
  }, [focusableMixin.focused]);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label: label || (count !== undefined ? `${count} items` : undefined),
    labelledBy,
    describedBy,
    'aria-label': label || (count !== undefined ? `${count} items` : undefined),
    'aria-hidden': !visible,
    'data-variant': variant,
    'data-size': size,
    'data-position': position,
    'data-dot': dot,
    'data-count': count,
    'data-animating': animating,
    'data-visible': visible,
    disabled,
    ...semanticProps
  });

  // Computed state
  const state = useMemo(() => composeState<UseBadgeState>({
    visible,
    focused: focusableMixin.focused,
    animating,
    previousCount
  }), [visible, focusableMixin.focused, animating, previousCount]);

  // Computed properties
  const variantClasses = useMemo(() => getVariantClasses(), [getVariantClasses]);
  const sizeClasses = useMemo(() => getSizeClasses(), [getSizeClasses]);
  const displayText = useMemo(() => getDisplayText(), [getDisplayText]);
  const positionClasses = useMemo(() => getPositionClasses(), [getPositionClasses]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    onClick: handleClick,
    onKeyDown: handleKeyDown
  }), [semantic, handleClick, handleKeyDown]);

  return {
    // State
    ...state,

    // Actions
    handleClick,
    handleKeyDown,
    getDisplayText,
    getPositionClasses,

    // Computed properties
    semanticAttributes,
    badgeRef,
    variantClasses,
    sizeClasses,
    displayText,
    positionClasses
  };
};