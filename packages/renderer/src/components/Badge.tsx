/**
 * Badge renderer component using headless useBadge hook.
 * Provides styled badge with variants, positioning, and animations.
 */

import React, { forwardRef } from 'react';
import { useBadge } from '@react-ui-forge/core';
import type { UseBadgeProps } from '@react-ui-forge/core';

export interface BadgeProps extends UseBadgeProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function */
  render?: (props: BadgeRenderProps) => React.ReactElement;
  /** Custom content render function */
  renderContent?: (props: BadgeRenderProps) => React.ReactNode;
}

export interface BadgeRenderProps {
  /** Computed class names */
  className: string;
  /** Badge state */
  visible: boolean;
  focused: boolean;
  animating: boolean;
  /** Computed variant */
  variant: string;
  /** Computed size */
  size: string;
  /** Display text for badge */
  displayText: string;
  /** Event handlers */
  handleClick: (event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** Reference to badge element */
  badgeRef: React.RefObject<HTMLSpanElement>;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * Styled badge component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  className,
  style,
  children,
  render,
  renderContent,
  ...badgeProps
}, ref) => {
  const badge = useBadge({
    ...badgeProps,
    // Merge external ref with internal ref
    badgeRef: ref as React.RefObject<HTMLSpanElement>
  });

  // Default content render function
  const defaultContentRender = (props: BadgeRenderProps) => {
    return props.displayText;
  };

  // Default render function
  const defaultRender = (props: BadgeRenderProps) => {
    if (!props.visible && !badgeProps.dot) {
      return null;
    }

    const baseClasses = `inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 ${badge.variantClasses} ${badge.sizeClasses}`;
    const interactiveClasses = badgeProps.onClick ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : '';
    const animationClasses = props.animating ? 'scale-110' : 'scale-100';
    const dotClasses = badgeProps.dot ? 'rounded-full' : 'rounded-full';

    return (
      <span
        ref={props.badgeRef as React.RefObject<HTMLSpanElement>}
        className={`${baseClasses} ${interactiveClasses} ${animationClasses} ${dotClasses} ${className || ''}`}
        style={style}
        {...props.semanticAttributes}
      >
        {/* Badge content */}
        {!badgeProps.dot && (
          renderContent ? renderContent(props) : defaultContentRender(props)
        )}

        {/* Dot indicator */}
        {badgeProps.dot && (
          <span className="block w-full h-full rounded-full" />
        )}
      </span>
    );
  };

  // Render props
  const renderProps: BadgeRenderProps = {
    className: className || '',
    visible: badge.visible,
    focused: badge.focused,
    animating: badge.animating,
    variant: badgeProps.variant || 'default',
    size: badgeProps.size || 'md',
    displayText: badge.displayText,
    handleClick: badge.handleClick,
    handleKeyDown: badge.handleKeyDown,
    semanticAttributes: badge.semanticAttributes,
    badgeRef: badge.badgeRef,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Badge.displayName = 'Badge';

/**
 * Badge wrapper component for positioning badges relative to other elements.
 */
export interface BadgeWrapperProps {
  /** Children to wrap with badge */
  children: React.ReactNode;
  /** Badge content */
  badge?: React.ReactNode;
  /** Badge position */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Additional wrapper class names */
  className?: string;
  /** Custom wrapper style */
  style?: React.CSSProperties;
}

export const BadgeWrapper = forwardRef<HTMLDivElement, BadgeWrapperProps>(({
  children,
  badge,
  position = 'top-right',
  className,
  style
}, ref) => {
  const getPositionClasses = (pos: string) => {
    const positionMap = {
      'top-right': 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
      'top-left': 'top-0 left-0 -translate-y-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-0 right-0 translate-y-1/2 translate-x-1/2',
      'bottom-left': 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2'
    };
    return positionMap[pos as keyof typeof positionMap] || positionMap['top-right'];
  };

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className || ''}`}
      style={style}
    >
      {/* Main content */}
      {children}

      {/* Badge overlay */}
      {badge && (
        <div className={`absolute ${getPositionClasses(position)} pointer-events-none`}>
          {badge}
        </div>
      )}
    </div>
  );
});

BadgeWrapper.displayName = 'BadgeWrapper';