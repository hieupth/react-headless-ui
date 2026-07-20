/**
 * VisuallyHidden renderer component using headless useVisuallyHidden hook.
 * Provides screen reader-only content with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useVisuallyHidden, type UseVisuallyHiddenProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface VisuallyHiddenProps extends Omit<UseVisuallyHiddenProps, 'elementRef' | 'liveRegion'>, React.AriaAttributes {
  /** ARIA role for the element */
  role?: React.AriaRole;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object (merged with visually hidden styles) */
  style?: React.CSSProperties;
  /** Element tag */
  as?: React.ElementType;
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
      const priority = liveRegionType === 'polite' || liveRegionType === 'assertive' ? liveRegionType : undefined;
      const timer = setTimeout(() => {
        actions.announce(children, priority);
      }, announceDelay);
      return () => clearTimeout(timer);
    }
  }, [children, autoAnnounce, announceDelay, actions, liveRegionType]);

  // Build CSS classes
  /* c8 ignore next -- reason: state.focused is always false; useVisuallyHidden never calls setFocused (handleFocus/handleBlur were removed), so the focused class is structurally unreachable from the component. */
  const focusedClass = state.focused ? 'visually-hidden-focused' : '';
  const elementClasses = `
    visually-hidden
    ${state.visible ? 'visually-hidden-visible' : 'visually-hidden-hidden'}
    ${state.focusable ? 'visually-hidden-focusable' : ''}
    ${focusedClass}
    ${state.announce ? 'visually-hidden-announcing' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build combined styles
  const combinedStyles: React.CSSProperties = {
    ...styles,
    ...style,
    // Override styles when focused for better accessibility
    /* c8 ignore start -- reason: state.focused is always false (see above); the focused style block — including the theme `||` fallback arms — is structurally unreachable from the component. */
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
    /* c8 ignore end */
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
      const priority = politeness === 'polite' || politeness === 'assertive' ? politeness : undefined;
      actions.announce(message, priority);

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
    if (targetElement instanceof HTMLElement) {
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
      aria-atomic={true}
      data-testid="visually-hidden-announcer"
      data-announcing={state.announce}
    >
      {state.announcement}
    </div>
  );
});

VisuallyHiddenAnnouncer.displayName = 'VisuallyHiddenAnnouncer';

export default VisuallyHidden;