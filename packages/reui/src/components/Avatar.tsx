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
      <div className={`      ${props.sizeClasses}`}>
        {props.fallbackText}
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: AvatarRenderProps) => {
    const baseClasses = `        ${props.sizeClasses} ${className || ''}`;
    const interactiveClasses = props.semanticAttributes.role === 'button' ? '     ' : '';
    const stateClasses = props.loading ? ' ' : '';

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
            className={`  object-cover ${props.loading ? '' : ''}  `}
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
          <div className="    ">
            <div className="    "></div>
          </div>
        )}

        {/* Children (overlay content) */}
        {children && (
          <div className="    ">
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