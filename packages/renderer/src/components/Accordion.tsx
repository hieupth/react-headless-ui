/**
 * Accordion renderer component using headless useAccordion hook.
 * Provides styled collapsible panels with keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useAccordion } from '@react-ui-forge/core';
import type { UseAccordionProps, AccordionItem } from '@react-ui-forge/core';

export interface AccordionProps extends UseAccordionProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function for accordion container */
  render?: (props: AccordionRenderProps) => React.ReactElement;
  /** Custom render function for accordion items */
  renderItem?: (props: AccordionItemRenderProps) => React.ReactElement;
}

export interface AccordionRenderProps {
  /** Computed class names */
  className: string;
  /** Semantic attributes */
  semanticAttributes: Record<string, any>;
  /** Accordion state */
  openItems: string[];
  focused: boolean;
  /** Event handlers */
  toggleItem: (itemId: string) => void;
  handleKeyDown: (event: React.KeyboardEvent, itemId: string) => void;
  /** Item helpers */
  getItemState: (itemId: string) => { isOpen: boolean; disabled: boolean };
  getItemTriggerProps: (itemId: string) => any;
  getItemContentProps: (itemId: string) => any;
  /** Children */
  children: React.ReactNode;
}

export interface AccordionItemRenderProps {
  /** Item identifier */
  id: string;
  /** Item state */
  isOpen: boolean;
  disabled: boolean;
  /** Trigger props */
  triggerProps: any;
  /** Content props */
  contentProps: any;
  /** Item content */
  trigger: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Styled accordion component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(({
  className,
  style,
  render,
  renderItem,
  ...accordionProps
}, ref) => {
  const accordion = useAccordion(accordionProps);

  // Default item render function
  const defaultItemRender = (props: AccordionItemRenderProps) => {
    return (
      <div className={`accordion-item ${props.isOpen ? 'accordion-item-open' : ''} ${props.disabled ? 'accordion-item-disabled' : ''}`}>
        <button
          {...props.triggerProps}
          className={`accordion-trigger ${props.isOpen ? 'accordion-trigger-open' : ''} ${props.disabled ? 'accordion-trigger-disabled' : ''}`}
        >
          <span className="accordion-trigger-content">
            {props.trigger}
          </span>
          <span className="accordion-trigger-icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`accordion-icon ${props.isOpen ? 'accordion-icon-open' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </button>

        <div
          {...props.contentProps}
          className={`accordion-content ${props.isOpen ? 'accordion-content-open' : ''}`}
        >
          <div className="accordion-content-inner">
            {props.content}
          </div>
        </div>
      </div>
    );
  };

  // Default render function
  const defaultRender = (props: AccordionRenderProps) => {
    return (
      <div
        ref={ref}
        className={`accordion ${props.className}`}
        style={style}
        {...props.semanticAttributes}
      >
        {accordion.items.map(item => {
          const itemProps: AccordionItemRenderProps = {
            id: item.id,
            isOpen: props.getItemState(item.id).isOpen,
            disabled: item.disabled || false,
            triggerProps: props.getItemTriggerProps(item.id),
            contentProps: props.getItemContentProps(item.id),
            trigger: item.trigger,
            content: item.content
          };

          // Use custom item render if provided, otherwise use default
          return (
            <React.Fragment key={item.id}>
              {renderItem ? renderItem(itemProps) : defaultItemRender(itemProps)}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Render props
  const renderProps: AccordionRenderProps = {
    className: `${className || ''}`,
    semanticAttributes: accordion.semanticAttributes,
    openItems: accordion.openItems,
    focused: accordion.focused,
    toggleItem: accordion.toggleItem,
    handleKeyDown: accordion.handleKeyDown,
    getItemState: accordion.getItemState,
    getItemTriggerProps: accordion.getItemTriggerProps,
    getItemContentProps: accordion.getItemContentProps,
    children: accordionProps.children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Accordion.displayName = 'Accordion';