/**
 * Collapsible component using useCollapsible hook.
 * Provides expandable/collapsible content with smooth animations.
 */

import React from 'react';
import { useCollapsible, type UseCollapsibleProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface CollapsibleProps extends UseCollapsibleProps {
  /** Collapsible trigger content */
  trigger?: React.ReactNode;
  /** Collapsible content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom trigger component */
  TriggerComponent?: React.FC<{ isOpen: boolean; children: React.ReactNode }>;
  /** Custom content wrapper component */
  ContentComponent?: React.FC<{ isOpen: boolean; children: React.ReactNode }>;
}

/**
 * Collapsible component that can show/hide content with smooth animations.
 * Follows Flutter collapsible patterns with proper accessibility.
 */
export const Collapsible: React.FC<CollapsibleProps> = ({
  trigger,
  children,
  className = '',
  TriggerComponent,
  ContentComponent,
  ...props
}) => {
  const theme = useTheme();
  const {
    state,
    actions,
    triggerProps,
    contentProps
  } = useCollapsible(props);

  const contentRef = React.useRef<HTMLDivElement>(null);

  // Update content props with ref
  React.useEffect(() => {
    if (contentRef.current && !contentRef.current.id) {
      contentRef.current.id = `collapsible-content-${Math.random().toString(36).substr(2, 9)}`;
    }
    // Update trigger props with correct content id
    if (contentRef.current) {
      triggerProps['aria-controls'] = contentRef.current.id;
    }
  }, [contentRef.current, triggerProps]);

  // Combine custom classes with theme classes
  const wrapperClassName = [
    'collapsible-wrapper',
    className,
    theme?.extensions?.spacing?.component?.margin
  ].filter(Boolean).join(' ');

  const triggerClassName = [
    'collapsible-trigger',
    state.open ? 'collapsible-trigger-open' : 'collapsible-trigger-closed',
    state.disabled ? 'collapsible-trigger-disabled' : '',
    theme?.extensions?.spacing?.component?.padding,
    theme?.extensions?.typography?.body?.fontSize
  ].filter(Boolean).join(' ');

  const contentClassName = [
    'collapsible-content',
    state.open ? 'collapsible-content-open' : 'collapsible-content-closed',
    state.animated ? 'collapsible-animated' : 'collapsible-not-animated',
    theme?.extensions?.spacing?.component?.padding
  ].filter(Boolean).join(' ');

  const DefaultTrigger = ({ isOpen, children: triggerChildren }: { isOpen: boolean; children: React.ReactNode }) => (
    <button
      {...triggerProps}
      className={triggerClassName}
      type="button"
    >
      {triggerChildren}
      <span className="collapsible-trigger-icon" aria-hidden={true}>
        {isOpen ? (
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    </button>
  );

  const DefaultContent = ({ isOpen, children: contentChildren }: { isOpen: boolean; children: React.ReactNode }) => (
    <div
      ref={contentRef}
      {...contentProps}
      className={contentClassName}
      style={{
        ...contentProps.style,
        // Override height to use actual measurement
        height: isOpen ? 'auto' : '0px',
        visibility: isOpen ? 'visible' : 'hidden',
      }}
    >
      <div className="collapsible-content-inner">
        {contentChildren}
      </div>
    </div>
  );

  const Trigger = TriggerComponent || DefaultTrigger;
  const Content = ContentComponent || DefaultContent;

  return (
    <div className={wrapperClassName}>
      {trigger && (
        <Trigger isOpen={state.open}>
          {trigger}
        </Trigger>
      )}
      <Content isOpen={state.open}>
        {children}
      </Content>
    </div>
  );
};

// Named subcomponents for compound component pattern
export const CollapsibleTrigger: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ isOpen, children, className = '', onClick }) => {
  const theme = useTheme();

  const handleClick = () => {
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={[
        'collapsible-trigger',
        isOpen ? 'collapsible-trigger-open' : 'collapsible-trigger-closed',
        className,
        theme?.extensions?.spacing?.component?.padding
      ].filter(Boolean).join(' ')}
      type="button"
      aria-expanded={isOpen}
    >
      {children}
      <span className="collapsible-trigger-icon" aria-hidden={true}>
        {isOpen ? (
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    </button>
  );
};

export const CollapsibleContent: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}> = ({ isOpen, children, className = '', animated = true }) => {
  const theme = useTheme();
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={contentRef}
      className={[
        'collapsible-content',
        isOpen ? 'collapsible-content-open' : 'collapsible-content-closed',
        animated ? 'collapsible-animated' : 'collapsible-not-animated',
        className,
        theme?.extensions?.spacing?.component?.padding
      ].filter(Boolean).join(' ')}
      style={{
        overflow: 'hidden',
        transition: animated ? 'height 0.2s ease-in-out' : 'none',
        height: isOpen ? 'auto' : '0px',
        visibility: isOpen ? 'visible' : 'hidden',
      }}
      aria-hidden={!isOpen}
    >
      <div className="collapsible-content-inner">
        {children}
      </div>
    </div>
  );
};

Collapsible.displayName = 'Collapsible';
CollapsibleTrigger.displayName = 'CollapsibleTrigger';
CollapsibleContent.displayName = 'CollapsibleContent';