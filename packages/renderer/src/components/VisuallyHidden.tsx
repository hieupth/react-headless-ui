/**
 * VisuallyHidden renderer component using headless useVisuallyHidden hook.
 * Provides screen reader-only content with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useVisuallyHidden, type UseVisuallyHiddenProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface VisuallyHiddenProps extends Omit<UseVisuallyHiddenProps, 'elementRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object (merged with visually hidden styles) */
  style?: React.CSSProperties;
  /** Element tag */
  as?: keyof JSX.IntrinsicElements;
  /** Content to display */
  children?: React.ReactNode;
  /** Whether to show content as live region */
  liveRegion?: boolean;
  /** Live region politeness level */
  liveRegionType?: 'polite' | 'assertive' | 'off';
  /** Whether to automatically announce when children change */
  autoAnnounce?: boolean;
  /** Delay before announcing in ms */
  announceDelay?: number;
}

/**
 * VisuallyHidden component with screen reader-only content.
 * Provides comprehensive accessibility features for screen readers.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(({
  className = '',
  style,
  as: Component = 'span',
  children,
  liveRegion = true,
  liveRegionType = 'polite',
  autoAnnounce = false,
  announceDelay = 100,
  ...visuallyHiddenProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    styles,
    focusable,
    semantic
  } = useVisuallyHidden({
    ...visuallyHiddenProps,
    elementRef: ref as React.RefObject<HTMLElement>,
    useLiveRegion: liveRegion,
    liveRegion: liveRegionType
  });

  // Auto-announce children changes
  React.useEffect(() => {
    if (autoAnnounce && children && typeof children === 'string') {
      const timer = setTimeout(() => {
        actions.announce(children, liveRegionType);
      }, announceDelay);
      return () => clearTimeout(timer);
    }
  }, [children, autoAnnounce, announceDelay, actions, liveRegionType]);

  // Build CSS classes
  const elementClasses = `
    visually-hidden
    ${state.visible ? 'visually-hidden-visible' : 'visually-hidden-hidden'}
    ${state.focusable ? 'visually-hidden-focusable' : ''}
    ${state.focused ? 'visually-hidden-focused' : ''}
    ${state.announce ? 'visually-hidden-announcing' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build combined styles
  const combinedStyles: React.CSSProperties = {
    ...styles,
    ...style,
    // Override styles when focused for better accessibility
    ...(state.focused && state.focusable ? {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '4px 8px',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
      border: '2px solid',
      borderColor: theme.colors?.primary || '#007bff',
      backgroundColor: theme.colors?.background || '#ffffff',
      color: theme.colors?.text || '#000000',
      outline: '2px solid',
      outlineColor: theme.colors?.primary || '#007bff',
      outlineOffset: '2px',
      borderRadius: '4px',
      zIndex: 999999
    } : {})
  };

  // Build content
  const content = React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return child;
    }
    if (React.isValidElement(child)) {
      return child;
    }
    return null;
  })?.join(' ') || '';

  return (
    <Component
      ref={ref}
      className={elementClasses}
      style={combinedStyles}
      {...attributes}
      {...focusable.attributes}
      {...semantic.attributes}
      data-testid="visually-hidden"
      data-visible={state.visible}
      data-focusable={state.focusable}
      data-announcing={state.announce}
    >
      {content}
    </Component>
  );
});

VisuallyHidden.displayName = 'VisuallyHidden';

/**
 * VisuallyHidden.Focusable component for focusable visually hidden content
 */
export const VisuallyHiddenFocusable = forwardRef<HTMLElement, Omit<VisuallyHiddenProps, 'focusable'>>((props, ref) => {
  return <VisuallyHidden {...props} ref={ref} focusable={true} />;
});

VisuallyHiddenFocusable.displayName = 'VisuallyHiddenFocusable';

/**
 * VisuallyHidden.LiveRegion component for live announcements
 */
export const VisuallyHiddenLiveRegion = forwardRef<HTMLElement, Omit<VisuallyHiddenProps, 'liveRegion' | 'liveRegionType'> & {
  /** Live region politeness */
  politeness?: 'polite' | 'assertive' | 'off';
  /** Announcement message */
  message?: string;
  /** Whether to clear message after announcement */
  clearAfterAnnounce?: boolean;
  /** Clear delay in ms */
  clearDelay?: number;
}>(({
  politeness = 'polite',
  message,
  clearAfterAnnounce = false,
  clearDelay = 1000,
  ...props
}, ref) => {
  const { actions } = useVisuallyHidden({
    useLiveRegion: true,
    liveRegion: politeness
  });

  // Handle message announcement
  React.useEffect(() => {
    if (message) {
      actions.announce(message, politeness);

      if (clearAfterAnnounce) {
        const timer = setTimeout(() => {
          actions.clearAnnouncement();
        }, clearDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [message, politeness, clearAfterAnnounce, clearDelay, actions]);

  return (
    <VisuallyHidden
      {...props}
      ref={ref}
      liveRegion={true}
      liveRegionType={politeness}
      aria-live={politeness}
      role="status"
    >
      {message}
    </VisuallyHidden>
  );
});

VisuallyHiddenLiveRegion.displayName = 'VisuallyHiddenLiveRegion';

/**
 * VisuallyHidden.SkipLink component for skip navigation links
 */
export const VisuallyHiddenSkipLink = forwardRef<HTMLAnchorElement, {
  /** Skip link text */
  text?: string;
  /** Target element selector */
  target?: string;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
}>(({
  text = 'Skip to main content',
  target = '#main',
  className = '',
  style,
  onClick
}, ref) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();

    const targetElement = document.querySelector(target);
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    onClick?.(event);
  };

  return (
    <a
      ref={ref}
      href={target}
      className={`
        visually-hidden-skip-link
        visually-hidden-focusable
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#000',
        color: '#fff',
        padding: '8px',
        textDecoration: 'none',
        borderRadius: '4px',
        zIndex: 999999,
        transition: 'top 0.2s',
        ...style
      }}
      onClick={handleClick}
      onFocus={(e) => {
        e.currentTarget.style.top = '6px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.top = '-40px';
      }}
      data-testid="visually-hidden-skip-link"
    >
      {text}
    </a>
  );
});

VisuallyHiddenSkipLink.displayName = 'VisuallyHiddenSkipLink';

/**
 * VisuallyHidden.Announcer component for programmatic announcements
 */
export const VisuallyHiddenAnnouncer = React.forwardRef<HTMLDivElement, {
  /** Whether to announce immediately */
  announce?: boolean;
  /** Message to announce */
  message?: string;
  /** Announcement priority */
  priority?: 'polite' | 'assertive';
  /** Custom announcement handler */
  onAnnounce?: (message: string, priority: 'polite' | 'assertive') => void;
}>(({
  announce = false,
  message,
  priority = 'polite',
  onAnnounce
}, ref) => {
  const { actions, state } = useVisuallyHidden({
    useLiveRegion: true,
    liveRegion: priority
  });

  // Handle announcements
  React.useEffect(() => {
    if (announce && message) {
      actions.announce(message, priority);
      onAnnounce?.(message, priority);
    }
  }, [announce, message, priority, actions, onAnnounce]);

  return (
    <div
      ref={ref}
      className="visually-hidden-announcer"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
      aria-live={priority}
      aria-atomic="true"
      data-testid="visually-hidden-announcer"
      data-announcing={state.announce}
    >
      {state.announcement}
    </div>
  );
});

VisuallyHiddenAnnouncer.displayName = 'VisuallyHiddenAnnouncer';

export default VisuallyHidden;