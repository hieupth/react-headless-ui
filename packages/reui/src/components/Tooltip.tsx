/**
 * Tooltip renderer component using headless useTooltip hook.
 * Provides styled tooltip with Portal, positioning, and animations.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTooltip } from '../hooks';
import type { UseTooltipProps, TooltipPosition } from '../hooks';

/** Props the trigger child element is expected to accept. */
type TriggerElementProps = React.HTMLAttributes<HTMLElement> &
  React.RefAttributes<HTMLElement>;

export interface TooltipProps extends UseTooltipProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Tooltip trigger element */
  children: React.ReactElement<TriggerElementProps>;
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
  position: TooltipPosition;
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
  triggerAttributes: Record<string, unknown>;
  tooltipAttributes: Record<string, unknown>;
  /** References */
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  /** Computed styles */
  tooltipStyles: React.CSSProperties;
  arrowStyles: React.CSSProperties;
  /** Children */
  children: React.ReactElement<TriggerElementProps>;
}

/**
 * Styled tooltip component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Tooltip = forwardRef<HTMLElement, TooltipProps>((props, ref) => {
  // React 19's forwardRef wraps the props parameter in PropsWithoutRef (an
  // Omit). Because the mixin bases carry a string-index signature
  // (`[key: string]: unknown`), Omit collapses every declared field —
  // `content`, `className`, `render`, etc. — to `unknown` inside this render
  // function. Recover the full TooltipProps typing once (same convention used
  // in DropdownMenu). No `any`: this re-tightens exactly what TS lost.
  const {
    className,
    style,
    children,
    render,
    renderContent,
    renderArrow,
    ...tooltipProps
  } = props as TooltipProps;

  const tooltip = useTooltip(tooltipProps);

  // Forward the consumer ref to the trigger element alongside the hook's ref.
  // The hook creates and manages its own triggerRef for positioning; the
  // forwarded ref is exposed so consumers can imperatively access the trigger.
  const setTriggerRef = React.useCallback<(node: HTMLElement | null) => void>(
    (node) => {
      tooltip.triggerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref]
  );

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
      ref: setTriggerRef,
      ...props.triggerAttributes,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        props.children.props.onMouseEnter?.(e);
        props.handleTriggerEnter();
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        props.children.props.onMouseLeave?.(e);
        props.handleTriggerLeave();
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        props.children.props.onFocus?.(e);
        props.handleTriggerFocus();
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        props.children.props.onBlur?.(e);
        props.handleTriggerBlur();
      },
      onClick: (e: React.MouseEvent<HTMLElement>) => {
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
  children: React.ReactElement<TriggerElementProps>;
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
  // Redeclared explicitly: Omit collapses TooltipProps' mixin string-index
  // signature, which would otherwise widen these inherited fields to `unknown`.
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Tooltip title */
  title?: string;
  /** Tooltip description */
  description?: React.ReactNode;
  /** Tooltip actions */
  actions?: React.ReactNode;
  /** Children to wrap */
  children: React.ReactElement<TriggerElementProps>;
}

export const RichTooltip = forwardRef<HTMLElement, RichTooltipProps>((props, ref) => {
  // See Tooltip for why props are re-tightened: forwardRef's PropsWithoutRef
  // collapses the mixin string-index signatures to `unknown`.
  const {
    title,
    description,
    actions,
    className,
    style,
    children,
    ...tooltipProps
  } = props as RichTooltipProps;
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