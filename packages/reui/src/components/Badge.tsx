/**
 * Badge renderer component using headless useBadge hook.
 * Provides styled badge with variants, positioning, and animations.
 */

import React, { forwardRef } from 'react';
import { useBadge } from '../hooks';
import type { UseBadgeProps } from '../hooks';

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
  badgeRef: React.RefObject<HTMLSpanElement | null>;
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
}: BadgeProps, ref) => {
  const badge = useBadge({
    ...badgeProps
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

    const baseClasses = `       ${badge.variantClasses} ${badge.sizeClasses}`;
    const interactiveClasses = badgeProps.onClick ? '     ' : '';
    const animationClasses = props.animating ? '' : '';
    const dotClasses = badgeProps.dot ? '' : '';

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
          <span className="   " />
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
      '': '  -translate-y-1/2 ',
      '': '  -translate-y-1/2 -translate-x-1/2',
      '': '   ',
      '': '   -translate-x-1/2'
    };
    return positionMap[pos as keyof typeof positionMap] || positionMap[''];
  };

  return (
    <div
      ref={ref}
      className={`    ${className || ''}`}
      style={style}
    >
      {/* Main content */}
      {children}

      {/* Badge overlay */}
      {badge && (
        <div className={` ${getPositionClasses(position)} pointer-events-none`}>
          {badge}
        </div>
      )}
    </div>
  );
});

BadgeWrapper.displayName = 'BadgeWrapper';