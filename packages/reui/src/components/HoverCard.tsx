/**
 * HoverCard renderer component using headless useHoverCard hook.
 * Provides styled hover card with comprehensive accessibility support and positioning.
 */

import React, { forwardRef } from 'react';
import { useHoverCard, type UseHoverCardProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface HoverCardProps extends Omit<UseHoverCardProps, 'triggerRef' | 'cardRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Hover card trigger element */
  trigger: React.ReactNode;
  /** Hover card content */
  children: React.ReactNode;
  /** Additional CSS class for trigger */
  triggerClassName?: string;
  /** Additional CSS class for content */
  contentClassName?: string;
  /** Whether to show arrow pointer */
  showArrow?: boolean;
  /** Maximum width of hover card */
  maxWidth?: number | string;
  /** Whether to prevent text selection in trigger */
  preventTextSelection?: boolean;
}

/**
 * HoverCard component with rich content appearing on hover.
 * Supports positioning, delays, and proper accessibility.
 */
export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(({
  className = '',
  style,
  trigger,
  children,
  triggerClassName = '',
  contentClassName = '',
  showArrow = true,
  maxWidth = 350,
  preventTextSelection = true,
  ...hoverCardProps
}: HoverCardProps, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    triggerAttributes,
    cardAttributes,
    triggerProps,
    cardProps,
    arrowProps,
    triggerRef,
    cardRef
  } = useHoverCard({
    ...hoverCardProps
  });

  // Position classes for arrow
  const getArrowPositionClass = (placement: string) => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-45';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 rotate-45';
      case 'top-start':
        return 'bottom-full left-4 transform -translate-y-1/2 rotate-45';
      case 'top-end':
        return 'bottom-full right-4 transform -translate-y-1/2 rotate-45';
      case 'bottom-start':
        return 'top-full left-4 transform translate-y-1/2 rotate-45';
      case 'bottom-end':
        return 'top-full right-4 transform translate-y-1/2 rotate-45';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45';
    }
  };

  // Position classes for content
  const getContentPositionClass = (placement: string) => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'top-start':
        return 'bottom-full left-0 mb-2';
      case 'top-end':
        return 'bottom-full right-0 mb-2';
      case 'bottom-start':
        return 'top-full left-0 mt-2';
      case 'bottom-end':
        return 'top-full right-0 mt-2';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    }
  };

  // Base trigger classes
  const triggerClasses = `
    hover-card-trigger
      
    ${preventTextSelection ? '' : ''}
    ${state.isOverTrigger ? '' : ''}
    
    
     
    ${triggerClassName || ''}
  `.trim().replace(/\s+/g, ' ');

  // Base content classes
  const contentClasses = `
    hover-card-content
     
        
    
    ${getContentPositionClass(state.placement)}
    ${state.open ? ' ' : '  pointer-events-none'}
      
    ${contentClassName || ''}
  `.trim().replace(/\s+/g, ' ');

  // Arrow classes
  const arrowClasses = `
    hover-card-arrow
         
    ${getArrowPositionClass(state.placement)}
    ${state.open ? '' : ''}
     
  `;

  return (
    <div
      ref={ref}
      className={`hover-card   ${className}`}
      style={style}
      data-testid="hover-card"
    >
      {/* Trigger */}
      <div
        ref={triggerRef}
        className={triggerClasses}
        {...triggerProps}
        {...triggerAttributes}
        data-testid="hover-card-trigger"
      >
        {trigger}
      </div>

      {/* Content Portal */}
      {state.open && (
        <div
          className="hover-card-portal   pointer-events-none "
          style={{ pointerEvents: 'none' }}
        >
          {/* Content */}
          <div
            ref={cardRef}
            className={contentClasses}
            style={{
              maxWidth,
              pointerEvents: 'auto'
            }}
            {...cardProps}
            {...cardAttributes}
            data-testid="hover-card-content"
          >
            {children}

            {/* Arrow */}
            {showArrow && (
              <div
                className={arrowClasses}
                {...arrowProps}
                data-testid="hover-card-arrow"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

HoverCard.displayName = 'HoverCard';

export default HoverCard;