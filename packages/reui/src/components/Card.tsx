/**
 * Card renderer component using headless useCard hook.
 * Provides styled card with sections and interactive states.
 */

import React, { forwardRef, useCallback } from 'react';
import { useCard } from '../hooks';
import type { UseCardProps } from '../hooks';

export interface CardProps extends UseCardProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Card children content */
  children?: React.ReactNode;
  /** Custom render function */
  render?: (props: CardRenderProps) => React.ReactElement;
  /** Custom header render function */
  renderHeader?: (props: CardRenderProps) => React.ReactNode;
  /** Custom body render function */
  renderBody?: (props: CardRenderProps) => React.ReactNode;
  /** Custom footer render function */
  renderFooter?: (props: CardRenderProps) => React.ReactNode;
}

export interface CardRenderProps {
  /** Computed class names */
  className: string;
  /** Card state */
  focused: boolean;
  pressed: boolean;
  hovered: boolean;
  selected: boolean;
  disabled: boolean;
  /** Computed variant */
  variant: string;
  /** Computed size */
  size: string;
  /** Event handlers */
  handleClick: (event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleMouseEnter: (event: React.MouseEvent) => void;
  handleMouseLeave: (event: React.MouseEvent) => void;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** References to card sections */
  cardRef: React.Ref<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement | null>;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  footerRef: React.RefObject<HTMLDivElement | null>;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * Styled card component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  style,
  title,
  subtitle,
  description,
  footer,
  actions,
  children,
  render,
  renderHeader,
  renderBody,
  renderFooter,
  ...cardProps
}: CardProps, ref) => {
  const card = useCard({
    ...cardProps,
    title,
    subtitle,
    description,
    footer,
    actions
  });

  // The hook owns `cardRef` for its render-prop contract; merge it with the
  // forwarded `ref` so consumers imperatively accessing the Card's root node
  // reach the same DOM element. Without this, the forwarded ref was dropped.
  const mergedCardRef = useCallback((node: HTMLDivElement | null) => {
    (card.cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [card.cardRef, ref]);

  // Default header render function
  const defaultHeaderRender = (props: CardRenderProps) => {
    if (!title && !actions) return null;

    return (
      <div
        ref={props.headerRef}
        className="   "
      >
        <div className=" ">
          {title && (
            <h3
              id={`${props.semanticAttributes.role || 'card'}-title`}
              className="   "
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="  ">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className=" ">
            {actions}
          </div>
        )}
      </div>
    );
  };

  // Default body render function
  const defaultBodyRender = (props: CardRenderProps) => {
    return (
      <div
        ref={props.bodyRef}
        className=""
      >
        {description && (
          <p
            id={`${props.semanticAttributes.role || 'card'}-description`}
            className="  "
          >
            {description}
          </p>
        )}
        {children && (
          <div className="">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Default footer render function
  const defaultFooterRender = (props: CardRenderProps) => {
    if (!footer) return null;

    return (
      <div
        ref={props.footerRef}
        className="   "
      >
        {footer}
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: CardRenderProps) => {
    const baseClasses = `   ${card.variantClasses} ${card.sizeClasses}`;
    const interactiveClasses = cardProps.interactive ? '' : '';
    const hoverClasses = props.hovered && cardProps.hoverable ? 'transform -translate-y-1 ' : '';
    const focusClasses = props.focused ? '  ' : '';
    const selectedClasses = props.selected ? '   ' : '';
    const disabledClasses = props.disabled ? ' ' : '';

    return (
      <div
        ref={props.cardRef}
        className={`${baseClasses} ${interactiveClasses} ${hoverClasses} ${focusClasses} ${selectedClasses} ${disabledClasses} ${className || ''}`}
        style={style}
        {...props.semanticAttributes}
      >
        {/* Header */}
        {renderHeader ? renderHeader(props) : defaultHeaderRender(props)}

        {/* Body */}
        {renderBody ? renderBody(props) : defaultBodyRender(props)}

        {/* Footer */}
        {renderFooter ? renderFooter(props) : defaultFooterRender(props)}
      </div>
    );
  };

  // Render props
  const renderProps: CardRenderProps = {
    className: className || '',
    focused: card.focused,
    pressed: card.pressed,
    hovered: card.hovered,
    selected: card.selected,
    disabled: card.disabled,
    variant: cardProps.variant || 'default',
    size: cardProps.size || 'md',
    handleClick: card.handleClick,
    handleKeyDown: card.handleKeyDown,
    handleMouseEnter: card.handleMouseEnter,
    handleMouseLeave: card.handleMouseLeave,
    semanticAttributes: card.semanticAttributes,
    cardRef: mergedCardRef,
    headerRef: card.headerRef,
    bodyRef: card.bodyRef,
    footerRef: card.footerRef,
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Card.displayName = 'Card';

/**
 * Card Section components for structured content organization.
 */
export interface CardSectionProps {
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(({
  children,
  className,
  style
}, ref) => (
  <div
    ref={ref}
    className={`    ${className || ''}`}
    style={style}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(({
  children,
  className,
  style
}, ref) => (
  <div
    ref={ref}
    className={` ${className || ''}`}
    style={style}
  >
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(({
  children,
  className,
  style
}, ref) => (
  <div
    ref={ref}
    className={`    ${className || ''}`}
    style={style}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

/**
 * Card Title component for consistent typography.
 */
export interface CardTitleProps {
  /** Title text */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({
  children,
  className,
  style
}, ref) => (
  <h3
    ref={ref}
    className={`    ${className || ''}`}
    style={style}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

/**
 * Card Subtitle component for secondary text.
 */
export const CardSubtitle = forwardRef<HTMLParagraphElement, CardTitleProps>(({
  children,
  className,
  style
}, ref) => (
  <p
    ref={ref}
    className={`   ${className || ''}`}
    style={style}
  >
    {children}
  </p>
));

CardSubtitle.displayName = 'CardSubtitle';

/**
 * Card Description component for descriptive text.
 */
export const CardDescription = forwardRef<HTMLParagraphElement, CardTitleProps>(({
  children,
  className,
  style
}, ref) => (
  <p
    ref={ref}
    className={`   ${className || ''}`}
    style={style}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';