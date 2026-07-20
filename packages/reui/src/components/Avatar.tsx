/**
 * Avatar renderer component using headless useAvatar hook.
 * Provides styled avatar with image loading states and fallbacks.
 */

import React, { forwardRef } from 'react';
import { useAvatar } from '../hooks';
import type { UseAvatarProps } from '../hooks';

export interface AvatarProps extends UseAvatarProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Avatar children content */
  children?: React.ReactNode;
  /** Custom render function */
  render?: (props: AvatarRenderProps) => React.ReactElement;
  /** Custom fallback render function */
  renderFallback?: (props: AvatarRenderProps) => React.ReactNode;
}

export interface AvatarRenderProps {
  /** Computed class names */
  className: string;
  /** Avatar state */
  loading: boolean;
  hasError: boolean;
  loaded: boolean;
  focused: boolean;
  /** Computed size classes */
  sizeClasses: string;
  /** Computed fallback text */
  fallbackText: string;
  /** Event handlers */
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  handleImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  handleClick: (event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** Reference to avatar container */
  avatarRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to image element */
  imageRef: React.RefObject<HTMLImageElement | null>;
  /** Children content */
  children: React.ReactNode;
}

/**
 * Styled avatar component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({
  className,
  style,
  src,
  alt,
  children,
  render,
  renderFallback,
  ...avatarProps
}: AvatarProps, ref) => {
  const avatar = useAvatar({
    ...avatarProps,
    src,
    alt
  });

  // Default fallback render function
  const defaultFallbackRender = (props: AvatarRenderProps) => {
    return (
      <div className={`flex items-center justify-center w-full h-full font-medium ${props.sizeClasses}`}>
        {props.fallbackText}
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: AvatarRenderProps) => {
    const baseClasses = `relative inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 overflow-hidden ${props.sizeClasses} ${className || ''}`;
    const interactiveClasses = props.semanticAttributes.role === 'button' ? 'cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : '';
    const stateClasses = props.loading ? 'animate-pulse bg-gray-200' : '';

    return (
      <div
        ref={props.avatarRef as React.RefObject<HTMLDivElement>}
        className={`${baseClasses} ${interactiveClasses} ${stateClasses}`}
        style={style}
        {...props.semanticAttributes}
      >
        {/* Image */}
        {src && !props.hasError && (
          <img
            ref={props.imageRef}
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${props.loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onLoad={props.handleImageLoad}
            onError={props.handleImageError}
          />
        )}

        {/* Fallback */}
        {(props.hasError || !src) && (
          renderFallback ? renderFallback(props) : defaultFallbackRender(props)
        )}

        {/* Loading indicator */}
        {props.loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Children (overlay content) */}
        {children && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Render props
  const renderProps: AvatarRenderProps = {
    className: className || '',
    loading: avatar.loading,
    hasError: avatar.hasError,
    loaded: avatar.loaded,
    focused: avatar.focused,
    sizeClasses: avatar.sizeClasses,
    fallbackText: avatar.fallbackText,
    handleImageError: avatar.handleImageError,
    handleImageLoad: avatar.handleImageLoad,
    handleClick: avatar.handleClick,
    handleKeyDown: avatar.handleKeyDown,
    semanticAttributes: avatar.semanticAttributes,
    avatarRef: avatar.avatarRef,
    imageRef: avatar.imageRef,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Avatar.displayName = 'Avatar';