/**
 * Tooltip renderer component using headless useTooltip hook.
 * Provides styled tooltip with Portal, positioning, and animations.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTooltip } from '@react-ui-forge/core';
import type { UseTooltipProps } from '@react-ui-forge/core';

export interface TooltipProps extends UseTooltipProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Tooltip trigger element */
  children: React.ReactElement;
  /** Custom render function */
  render?: (props: TooltipRenderProps) => React.ReactElement;
  /** Custom content render function */
  renderContent?: (props: TooltipRenderProps) => React.ReactNode;
  /** Custom arrow render function */
  renderArrow?: (props: TooltipRenderProps) => React.ReactNode;
}

export interface TooltipRenderProps {
  /** Computed class names */
  className: string;
  /** Tooltip state */
  open: boolean;
  focused: boolean;
  showing: boolean;
  hiding: boolean;
  /** Computed position */
  position: string;
  /** Tooltip content */
  content: React.ReactNode;
  /** Event handlers */
  handleTriggerEnter: () => void;
  handleTriggerLeave: () => void;
  handleTriggerFocus: () => void;
  handleTriggerBlur: () => void;
  handleTriggerClick: () => void;
  handleTooltipEnter: () => void;
  handleTooltipLeave: () => void;
  /** Semantic attributes */
  triggerAttributes: Record<string, any>;
  tooltipAttributes: Record<string, any>;
  /** References */
  triggerRef: React.RefObject<HTMLElement>;
  tooltipRef: React.RefObject<HTMLDivElement>;
  /** Computed styles */
  tooltipStyles: React.CSSProperties;
  arrowStyles: React.CSSProperties;
  /** Children */
  children: React.ReactElement;
}

/**
 * Styled tooltip component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Tooltip = forwardRef<HTMLElement, TooltipProps>(({
  className,
  style,
  children,
  render,
  renderContent,
  renderArrow,
  ...tooltipProps
}, ref) => {
  const tooltip = useTooltip({
    ...tooltipProps,
    // Merge external ref with internal ref
    triggerRef: ref as React.RefObject<HTMLElement>
  });

  // Default content render function
  const defaultContentRender = (props: TooltipRenderProps) => {
    return props.content;
  };

  // Default arrow render function
  const defaultArrowRender = (props: TooltipRenderProps) => {
    return (
      <div
        style={props.arrowStyles}
        className="border-gray-900"
      />
    );
  };

  // Default render function
  const defaultRender = (props: TooltipRenderProps) => {
    // Clone trigger element with tooltip props
    const triggerElement = React.cloneElement(props.children, {
      ref: props.triggerRef,
      ...props.triggerAttributes,
      onMouseEnter: (e: React.MouseEvent) => {
        props.children.props.onMouseEnter?.(e);
        props.handleTriggerEnter();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        props.children.props.onMouseLeave?.(e);
        props.handleTriggerLeave();
      },
      onFocus: (e: React.FocusEvent) => {
        props.children.props.onFocus?.(e);
        props.handleTriggerFocus();
      },
      onBlur: (e: React.FocusEvent) => {
        props.children.props.onBlur?.(e);
        props.handleTriggerBlur();
      },
      onClick: (e: React.MouseEvent) => {
        props.children.props.onClick?.(e);
        props.handleTriggerClick();
      }
    });

    // Tooltip content
    const tooltipContent = props.open && (
      <div
        ref={props.tooltipRef}
        className={`absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none transition-opacity duration-150 ${
          props.showing ? 'opacity-0' : props.hiding ? 'opacity-0' : 'opacity-100'
        } ${className || ''}`}
        style={{
          ...props.tooltipStyles,
          ...style
        }}
        {...props.tooltipAttributes}
        onMouseEnter={props.handleTooltipEnter}
        onMouseLeave={props.handleTooltipLeave}
      >
        {/* Arrow */}
        {tooltipProps.arrow && (
          renderArrow ? renderArrow(props) : defaultArrowRender(props)
        )}

        {/* Content */}
        <div className="relative z-10">
          {renderContent ? renderContent(props) : defaultContentRender(props)}
        </div>
      </div>
    );

    return (
      <>
        {triggerElement}
        {/* Portal for tooltip */}
        {tooltipContent && createPortal(tooltipContent, document.body)}
      </>
    );
  };

  // Render props
  const renderProps: TooltipRenderProps = {
    className: className || '',
    open: tooltip.open,
    focused: tooltip.focused,
    showing: tooltip.showing,
    hiding: tooltip.hiding,
    position: tooltip.position,
    content: tooltipProps.content,
    handleTriggerEnter: tooltip.handleTriggerEnter,
    handleTriggerLeave: tooltip.handleTriggerLeave,
    handleTriggerFocus: tooltip.handleTriggerFocus,
    handleTriggerBlur: tooltip.handleTriggerBlur,
    handleTriggerClick: tooltip.handleTriggerClick,
    handleTooltipEnter: tooltip.handleTooltipEnter,
    handleTooltipLeave: tooltip.handleTooltipLeave,
    triggerAttributes: tooltip.triggerAttributes,
    tooltipAttributes: tooltip.tooltipAttributes,
    triggerRef: tooltip.triggerRef,
    tooltipRef: tooltip.tooltipRef,
    tooltipStyles: tooltip.tooltipStyles,
    arrowStyles: tooltip.arrowStyles,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Tooltip.displayName = 'Tooltip';

/**
 * Simple tooltip wrapper for common use cases.
 */
export interface SimpleTooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip position */
  position?: UseTooltipProps['position'];
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Children to wrap */
  children: React.ReactElement;
}

export const SimpleTooltip = forwardRef<HTMLElement, SimpleTooltipProps>(({
  content,
  position = 'top',
  className,
  style,
  children
}, ref) => (
  <Tooltip
    content={content}
    position={position}
    className={className}
    style={style}
    trigger={['hover', 'focus']}
    delayShow={300}
    delayHide={100}
    arrow
    interactive={false}
    ref={ref}
  >
    {children}
  </Tooltip>
));

SimpleTooltip.displayName = 'SimpleTooltip';

/**
 * Rich tooltip with more styling options.
 */
export interface RichTooltipProps extends Omit<TooltipProps, 'children' | 'content'> {
  /** Tooltip title */
  title?: string;
  /** Tooltip description */
  description?: React.ReactNode;
  /** Tooltip actions */
  actions?: React.ReactNode;
  /** Children to wrap */
  children: React.ReactElement;
}

export const RichTooltip = forwardRef<HTMLElement, RichTooltipProps>(({
  title,
  description,
  actions,
  className,
  style,
  children,
  ...tooltipProps
}, ref) => {
  const content = (
    <div className="max-w-sm">
      {title && (
        <div className="font-medium text-gray-900 mb-1">{title}</div>
      )}
      {description && (
        <div className="text-sm text-gray-600">{description}</div>
      )}
      {actions && (
        <div className="mt-2 pt-2 border-t border-gray-200">{actions}</div>
      )}
    </div>
  );

  return (
    <Tooltip
      {...tooltipProps}
      content={content}
      className={`bg-white border border-gray-200 shadow-lg ${className || ''}`}
      style={{
        maxWidth: 320,
        ...style
      }}
      interactive
      arrow
      ref={ref}
    >
      {children}
    </Tooltip>
  );
});

RichTooltip.displayName = 'RichTooltip';