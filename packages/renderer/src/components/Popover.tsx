/**
 * Popover renderer component using headless usePopover hook.
 * Provides styled popover with comprehensive accessibility support and positioning.
 */

import React, { forwardRef } from 'react';
import { usePopover, type UsePopoverProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface PopoverProps extends Omit<UsePopoverProps, 'triggerRef' | 'contentRef'> {
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
  const {
    state,
    actions,
    triggerAttributes,
    contentAttributes,
    focusable,
    pressable,
    semantic
  } = usePopover({
    ...popoverProps
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
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45';
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
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    }
  };

  // Base trigger classes
  const triggerClasses = `
    popover-trigger
    inline-flex items-center justify-center
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${state.isTriggerHovered ? 'text-blue-600' : 'text-gray-600'}
    hover:text-blue-600
    transition-colors duration-150
    ${triggerClassName || ''}
  `.trim().replace(/\s+/g, ' ');

  // Base content classes
  const contentClasses = `
    popover-content
    absolute z-50
    bg-white border border-gray-200 rounded-lg shadow-lg
    p-4
    ${getContentPositionClass(state.position)}
    ${state.open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    transition-all duration-150 ease-out
    ${contentClassName || ''}
  `.trim().replace(/\s+/g, ' ');

  // Arrow classes
  const arrowClasses = `
    popover-arrow
    absolute w-2 h-2 bg-white border border-gray-200
    ${getArrowPositionClass(state.position)}
    ${state.open ? 'opacity-100' : 'opacity-0'}
    transition-opacity duration-150
  `;

  // Close button classes
  const closeButtonClasses = `
    popover-close-button
    absolute top-2 right-2
    flex items-center justify-center
    w-6 h-6
    text-gray-400 hover:text-gray-600
    transition-colors duration-150
    focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
  `;

  return (
    <div
      ref={ref}
      className={`popover relative inline-block ${className}`}
      style={style}
      data-testid="popover"
    >
      {/* Trigger */}
      <div
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
          className="popover-portal fixed inset-0 pointer-events-none z-50"
          style={{ pointerEvents: 'none' }}
        >
          {/* Content */}
          <div
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
                    className="w-4 h-4"
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