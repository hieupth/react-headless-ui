/**
 * Popover renderer component using headless usePopover hook.
 * Provides styled popover with comprehensive accessibility support and positioning.
 */

import React, { forwardRef, useRef } from 'react';
import { usePopover, type UsePopoverProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface PopoverProps extends Omit<UsePopoverProps, 'triggerRef' | 'contentRef' | 'trigger'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Popover trigger element */
  trigger: React.ReactNode;
  /** Popover content */
  children: React.ReactNode;
  /** Additional CSS class for trigger */
  triggerClassName?: string;
  /** Additional CSS class for content */
  contentClassName?: string;
  /** Whether to show arrow pointer */
  showArrow?: boolean;
  /** Maximum width of popover */
  maxWidth?: number | string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom close button content */
  closeButtonContent?: React.ReactNode;
}

/**
 * Popover component with floating panel relative to trigger element.
 * Supports multiple triggers, positioning, and proper accessibility.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(({
  className = '',
  style,
  trigger,
  children,
  triggerClassName = '',
  contentClassName = '',
  showArrow = true,
  maxWidth = 320,
  showCloseButton = false,
  closeButtonContent,
  ...popoverProps
}, ref) => {
  const theme = useTheme();
  // Wire the hook's outside-click detection: without these refs the hook cannot
  // tell the trigger/content apart from the rest of the document, so clicks
  // outside would never close the popover.
  const triggerElRef = useRef<HTMLElement>(null);
  const contentElRef = useRef<HTMLElement>(null);
  const {
    state,
    actions,
    triggerAttributes,
    contentAttributes,
    focusable,
    pressable,
    semantic
  } = usePopover({
    ...popoverProps,
    triggerRef: triggerElRef,
    contentRef: contentElRef
  });

  // Position classes for arrow
  const getArrowPositionClass = (position: string) => {
    switch (position) {
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
      // reason: no default — position is always a member of the closed
      // PopoverPosition union (all 8 cases handled above).
    }
  };

  // Position classes for content
  const getContentPositionClass = (position: string) => {
    switch (position) {
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
      // reason: no default — position is always a member of the closed
      // PopoverPosition union (all 8 cases handled above).
    }
  };

  // Base trigger classes
  const triggerClasses = `
    popover-trigger
      
    ${state.disabled ? ' ' : ''}
    
    
     
    ${triggerClassName || ''}
  `.trim().replace(/\s+/g, ' ');

  // Base content classes
  const contentClasses = `
    popover-content
     
        
    
    ${getContentPositionClass(state.position)}
    ${state.open ? ' ' : '  pointer-events-none'}
      
    ${contentClassName || ''}
  `.trim().replace(/\s+/g, ' ');

  // Arrow classes
  const arrowClasses = `
    popover-arrow
         
    ${getArrowPositionClass(state.position)}
    ${state.open ? '' : ''}
     
  `;

  // Close button classes
  const closeButtonClasses = `
    popover-close-button
      
      
     
     
     
       
  `;

  return (
    <div
      ref={ref}
      className={`popover   ${className}`}
      style={style}
      data-testid="popover"
    >
      {/* Trigger */}
      <div
        ref={triggerElRef as React.RefObject<HTMLDivElement>}
        className={triggerClasses}
        onClick={actions.handleTriggerClick}
        onMouseEnter={actions.handleTriggerMouseEnter}
        onMouseLeave={actions.handleTriggerMouseLeave}
        onFocus={actions.handleTriggerFocus}
        onBlur={actions.handleTriggerBlur}
        {...triggerAttributes}
        data-testid="popover-trigger"
      >
        {trigger}
      </div>

      {/* Content Portal */}
      {state.open && (
        <div
          className="popover-portal   pointer-events-none "
          style={{ pointerEvents: 'none' }}
        >
          {/* Content */}
          <div
            ref={contentElRef as React.RefObject<HTMLDivElement>}
            className={contentClasses}
            style={{
              maxWidth,
              pointerEvents: 'auto'
            }}
            {...contentAttributes}
            data-testid="popover-content"
          >
            {/* Close Button */}
            {showCloseButton && (
              <button
                className={closeButtonClasses}
                onClick={actions.close}
                aria-label="Close popover"
                data-testid="popover-close-button"
              >
                {closeButtonContent || (
                  <svg
                    className=" "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Children Content */}
            <div className="popover-children">
              {children}
            </div>

            {/* Arrow */}
            {showArrow && (
              <div
                className={arrowClasses}
                data-testid="popover-arrow"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Popover.displayName = 'Popover';

export default Popover;