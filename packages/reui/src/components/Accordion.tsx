/**
 * Accordion renderer component using headless useAccordion hook.
 * Provides styled collapsible panels with keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useAccordion } from '../hooks';
import type { UseAccordionProps, AccordionItem } from '../hooks';

export interface AccordionProps extends UseAccordionProps, React.AriaAttributes {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function for accordion container */
  render?: (props: AccordionRenderProps) => React.ReactElement;
  /** Custom render function for accordion items */
  renderItem?: (props: AccordionItemRenderProps) => React.ReactElement;
  /** Accordion item content (passed through to items) */
  children?: React.ReactNode;
}

/**
 * Compound item. Renders nothing itself — its `value`, trigger, and content
 * children are collected by the parent `Accordion`. Supported only as a direct
 * child of `Accordion`.
 */
export interface AccordionItemProps {
  /** Item value (used as the item id) */
  value: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** <Accordion.Trigger> and <Accordion.Content> children */
  children: React.ReactNode;
}

/** Compound trigger. Its children become the trigger button's accessible name. */
export interface AccordionTriggerProps {
  children: React.ReactNode;
}

/** Compound content panel. */
export interface AccordionContentProps {
  children: React.ReactNode;
}

const withName = <P,>(name: string): React.FC<P> => {
  const fn = (_props: P): null => null;
  fn.displayName = name;
  return fn as unknown as React.FC<P>;
};

const AccordionItem = withName<AccordionItemProps>('Accordion.Item');
const AccordionTrigger = withName<AccordionTriggerProps>('Accordion.Trigger');
const AccordionContent = withName<AccordionContentProps>('Accordion.Content');

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
  children,
  ...accordionProps
}: AccordionProps, ref) => {
  // Compound children API: derive items from <Accordion.Item>. Each item's
  // nested <Accordion.Trigger>/<Accordion.Content> become the trigger/content.
  const childItems = React.Children.toArray(children)
    .filter((c): c is React.ReactElement<AccordionItemProps> =>
      React.isValidElement(c) && (c.type as { displayName?: string }).displayName === 'Accordion.Item')
    .map((c): AccordionItem => {
      let trigger: React.ReactNode = null;
      let content: React.ReactNode = null;
      React.Children.forEach(c.props.children, (child) => {
        if (!React.isValidElement(child)) return;
        const dn = (child.type as { displayName?: string }).displayName;
        if (dn === 'Accordion.Trigger') trigger = (child.props as { children: React.ReactNode }).children;
        else if (dn === 'Accordion.Content') content = (child.props as { children: React.ReactNode }).children;
      });
      return {
        id: c.props.value,
        trigger,
        content,
        disabled: c.props.disabled
      };
    });
  const items = childItems.length > 0 ? childItems : accordionProps.items;

  const accordion = useAccordion({
    ...accordionProps,
    items
  });

  // Consumer DOM pass-through (aria-label, …) forwarded onto the container.
  const ariaProps: React.AriaAttributes = {};
  for (const key of Object.keys(accordionProps)) {
    if (key.startsWith('aria-') || key === 'title') {
      (ariaProps as Record<string, unknown>)[key] = (accordionProps as Record<string, unknown>)[key];
    }
  }

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
          <span className="accordion-trigger-icon" aria-hidden={true}>
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
        {...ariaProps}
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
    children
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Accordion.displayName = 'Accordion';

// Attach compound sub-components: <Accordion.Item/Trigger/Content>.
(Accordion as unknown as {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
}).Item = AccordionItem;
(Accordion as unknown as {
  Trigger: typeof AccordionTrigger;
}).Trigger = AccordionTrigger;
(Accordion as unknown as {
  Content: typeof AccordionContent;
}).Content = AccordionContent;