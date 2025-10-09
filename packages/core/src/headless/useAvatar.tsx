/**
 * Avatar headless hook following Flutter patterns.
 * Provides avatar behavior with image loading states and fallbacks.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, SemanticMixinProps } from '../mixins';

export interface UseAvatarProps extends
  FocusableMixinProps,
  SemanticMixinProps {
  /** Avatar image source */
  src?: string;
  /** Avatar alt text */
  alt?: string;
  /** Avatar fallback text (initials) */
  fallback?: string;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Whether avatar is clickable */
  clickable?: boolean;
  /** Image load error handler */
  onImageError?: (error: Event) => void;
  /** Image load success handler */
  onImageLoad?: (event: Event) => void;
  /** Click handler */
  onClick?: () => void;
}

export interface UseAvatarState {
  /** Current image loading state */
  loading: boolean;
  /** Whether image failed to load */
  hasError: boolean;
  /** Whether image loaded successfully */
  loaded: boolean;
  /** Current focus state */
  focused: boolean;
}

export interface UseAvatarActions {
  /** Handle image error */
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Handle image load */
  handleImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Handle click */
  handleClick: (event: React.MouseEvent) => void;
  /** Handle key events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Get fallback text */
  getFallbackText: () => string;
  /** Get avatar size classes */
  getSizeClasses: () => string;
}

export interface UseAvatarReturns extends UseAvatarState, UseAvatarActions {
  /** Semantic attributes for avatar container */
  semanticAttributes: Record<string, any>;
  /** Reference to avatar container */
  avatarRef: React.RefObject<HTMLDivElement>;
  /** Reference to image element */
  imageRef: React.RefObject<HTMLImageElement>;
  /** Computed size classes */
  sizeClasses: string;
  /** Computed fallback text */
  fallbackText: string;
}

/**
 * Headless avatar hook providing avatar behavior.
 * Includes image loading states, fallbacks, and accessibility.
 */
export const useAvatar = (props: UseAvatarProps): UseAvatarReturns => {
  const {
    src,
    alt,
    fallback,
    size = 'md',
    clickable = false,
    onImageError,
    onImageLoad,
    onClick,
    defaultFocused = false,
    focusable = clickable,
    focusStrategy = 'auto',
    disabled = false,
    role = clickable ? 'button' : 'img',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [loading, setLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // References
  const avatarRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: clickable && focusable && !disabled,
    focusStrategy
  });

  // Semantic attributes
  const semantic = useSemanticMixin({
    role,
    label: label || alt,
    labelledBy,
    describedBy,
    tabIndex: clickable && !disabled ? 0 : undefined,
    'data-size': size,
    'data-clickable': clickable,
    'data-loading': loading,
    'data-error': hasError,
    'data-loaded': loaded,
    disabled,
    ...semanticProps
  });

  // Size classes mapping
  const getSizeClasses = useCallback(() => {
    const sizeMap = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
      xl: 'w-12 h-12 text-lg',
      '2xl': 'w-16 h-16 text-xl'
    };
    return sizeMap[size];
  }, [size]);

  // Generate fallback text
  const getFallbackText = useCallback(() => {
    if (fallback) {
      return fallback;
    }

    // Generate initials from alt text or label
    const text = alt || label || '';
    if (!text) {
      return '?';
    }

    // Get initials (max 2 characters)
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return text.slice(0, 2).toUpperCase();
    }
  }, [fallback, alt, label]);

  // Handle image error
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setLoading(false);
    setHasError(true);
    setLoaded(false);
    onImageError?.(event.nativeEvent);
  }, [onImageError]);

  // Handle image load
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setLoading(false);
    setHasError(false);
    setLoaded(true);
    onImageLoad?.(event.nativeEvent);
  }, [onImageLoad]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!clickable || disabled) return;

    event.preventDefault();
    onClick?.();
  }, [clickable, disabled, onClick]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    focusableMixin.handleKeyDown(event);

    // Handle click on Enter/Space for clickable avatars
    if (clickable && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  }, [focusableMixin, clickable, disabled, onClick]);

  // Reset loading state when src changes
  useEffect(() => {
    if (src) {
      setLoading(true);
      setHasError(false);
      setLoaded(false);
    } else {
      setLoading(false);
      setHasError(true);
      setLoaded(false);
    }
  }, [src]);

  // Update focused state
  useEffect(() => {
    // Focus state managed by focusable mixin
  }, [focusableMixin.focused]);

  // Computed state
  const state = useMemo(() => composeState<UseAvatarState>({
    loading,
    hasError,
    loaded,
    focused: focusableMixin.focused
  }), [loading, hasError, loaded, focusableMixin.focused]);

  // Computed properties
  const sizeClasses = useMemo(() => getSizeClasses(), [getSizeClasses]);
  const fallbackText = useMemo(() => getFallbackText(), [getFallbackText]);

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
    handleImageError,
    handleImageLoad,
    handleClick,
    handleKeyDown,
    getFallbackText,
    getSizeClasses,

    // Computed properties
    semanticAttributes,
    avatarRef,
    imageRef,
    sizeClasses,
    fallbackText
  };
};