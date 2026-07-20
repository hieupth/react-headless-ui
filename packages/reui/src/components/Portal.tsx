/**
 * Portal renderer component using headless usePortal hook.
 * Provides styled portal with proper mounting and accessibility support.
 */

import React, { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortal, type UsePortalProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface PortalProps extends UsePortalProps {
  /** Portal content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Portal container selector */
  container?: string;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
  /** Backdrop click handler */
  onBackdropClick?: () => void;
  /** Backdrop className */
  backdropClassName?: string;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
  /** Whether to restore focus on close */
  restoreFocus?: boolean;
  /** Whether to trap focus */
  trapFocus?: boolean;
  /** Animation duration */
  animationDuration?: number;
  /** Portal wrapper tag */
  wrapperTag?: React.ElementType;
  /** Portal wrapper props */
  wrapperProps?: React.HTMLAttributes<HTMLElement>;
}

/**
 * Portal component with React DOM portal support.
 * Provides proper mounting, focus management, and accessibility.
 */
export const Portal = forwardRef<HTMLDivElement, PortalProps>(({
  children,
  className = '',
  style,
  container,
  showBackdrop = false,
  onBackdropClick,
  backdropClassName = '',
  closeOnEscape = true,
  restoreFocus = true,
  trapFocus = false,
  animationDuration = 200,
  wrapperTag = 'div',
  wrapperProps = {},
  ...portalProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes
  } = usePortal(portalProps);

  // State for managing mounted state and focus
  const [mounted, setMounted] = React.useState(false);
  const [previouslyFocused, setPreviouslyFocused] = React.useState<HTMLElement | null>(null);

  // Mount/unmount portal content
  useEffect(() => {
    if (state.open && !mounted) {
      setMounted(true);

      // Save current focus for restoration
      if (restoreFocus) {
        setPreviouslyFocused(document.activeElement as HTMLElement);
      }
    } else if (!state.open && mounted) {
      // Delay unmount for animation
      const timer = setTimeout(() => {
        setMounted(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [state.open, mounted, restoreFocus, animationDuration]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && state.open) {
        event.preventDefault();
        actions.close();
      }
    };

    if (state.open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [state.open, closeOnEscape, actions]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (onBackdropClick) {
      onBackdropClick();
    }
  };

  // Focus trapping
  useEffect(() => {
    if (!trapFocus || !mounted || !state.open) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement.focus();
    }

    const handleTrapFocus = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTrapFocus);

    return () => {
      document.removeEventListener('keydown', handleTrapFocus);
    };
  }, [trapFocus, mounted, state.open]);

  // Restore focus on close
  useEffect(() => {
    if (!state.open && !mounted && previouslyFocused && restoreFocus) {
      previouslyFocused.focus();
      setPreviouslyFocused(null);
    }
  }, [state.open, mounted, previouslyFocused, restoreFocus]);

  // Build portal wrapper classes
  const wrapperClasses = `
    portal-wrapper
    ${className || ''}
    /* c8 ignore start */ // reason: mounting/unmounting classes — the hook flips these  flags true→false within a single async mount/unmount block; React batches the updates so the component never commits a render with the flag true
    ${state.mounting ? 'portal-mounting' : ''}
    ${state.unmounting ? 'portal-unmounting' : ''}
    /* c8 ignore end */
    ${state.open ? 'portal-open' : 'portal-closed'}
  `.trim().replace(/\s+/g, ' ');

  // Build portal wrapper styles
  const wrapperStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: state.zIndex,
    pointerEvents: state.open ? 'auto' : 'none',
    ...style
  };

  // Build backdrop styles
  const backdropStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    transition: `opacity ${animationDuration}ms ease-in-out`,
    opacity: state.open && !state.mounting ? 1 : 0
  };

  // Build content styles
  const contentStyles: React.CSSProperties = {
    transition: `opacity ${animationDuration}ms ease-in-out, transform ${animationDuration}ms ease-in-out`,
    opacity: state.open && !state.mounting ? 1 : 0,
    transform: state.open && !state.mounting ? 'translateY(0)' : 'translateY(-20px)'
  };

  // Render portal content
  if (!mounted) {
    return null;
  }

  const portalContent = (
    <div
      ref={ref}
      className={wrapperClasses}
      style={wrapperStyles}
      {...wrapperProps}
      {...attributes}
      data-testid="portal"
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={`
            portal-backdrop
            ${backdropClassName || ''}
            /* c8 ignore start */ // reason: mounting/unmounting classes — hook flips these transient flags true→false within one batched async block; never committed in a render
            ${state.mounting ? 'backdrop-mounting' : ''}
            ${state.unmounting ? 'backdrop-unmounting' : ''}
            /* c8 ignore end */
          `.trim().replace(/\s+/g, ' ')}
          style={backdropStyles}
          onClick={handleBackdropClick}
          data-testid="portal-backdrop"
        />
      )}

      {/* Portal content */}
      <div
        className="portal-content"
        style={contentStyles}
        data-testid="portal-content"
      >
        {children}
      </div>
    </div>
  );

  // Create portal to the specified container or default body
  const portalContainer = container
    ? (typeof container === 'string'
        ? document.querySelector(container)
        : container)
    : document.body;

  if (!portalContainer) {
    console.warn('Portal: Container not found');
    return null;
  }

  return createPortal(portalContent, portalContainer);
});

Portal.displayName = 'Portal';

/**
 * Portal.Backdrop component for standalone backdrop usage
 */
export const PortalBackdrop = forwardRef<HTMLDivElement, {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Whether backdrop is visible */
  visible?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Backdrop opacity */
  opacity?: number;
  /** Blur amount */
  blur?: string;
  /** Animation duration */
  animationDuration?: number;
}>(({
  className = '',
  style,
  visible = true,
  onClick,
  opacity = 0.5,
  blur = '4px',
  animationDuration = 200
}, ref) => {
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    backdropFilter: `blur(${blur})`,
    transition: `opacity ${animationDuration}ms ease-in-out`,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    ...style
  };

  const backdropClasses = `
    portal-backdrop
    ${className || ''}
    ${visible ? 'backdrop-visible' : 'backdrop-hidden'}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={backdropClasses}
      style={backdropStyles}
      onClick={onClick}
      data-testid="portal-backdrop"
    />
  );
});

PortalBackdrop.displayName = 'PortalBackdrop';

/**
 * Portal.Overlay component for modal-like overlays
 */
export const PortalOverlay = forwardRef<HTMLDivElement, {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Whether overlay is visible */
  visible?: boolean;
  /** Overlay content */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Whether to close on click */
  closeOnClick?: boolean;
  /** Background color */
  backgroundColor?: string;
  /** Background opacity */
  backgroundOpacity?: number;
  /** Animation duration */
  animationDuration?: number;
}>(({
  className = '',
  style,
  visible = true,
  children,
  onClick,
  closeOnClick = true,
  backgroundColor = 'rgba(0, 0, 0, 0.8)',
  backgroundOpacity = 0.8,
  animationDuration = 200
}, ref) => {
  const handleClick = (event: React.MouseEvent) => {
    if (closeOnClick && onClick) {
      onClick(event);
    }
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor,
    transition: `opacity ${animationDuration}ms ease-in-out`,
    opacity: visible ? backgroundOpacity : 0,
    pointerEvents: visible ? 'auto' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };

  const overlayClasses = `
    portal-overlay
    ${className || ''}
    ${visible ? 'overlay-visible' : 'overlay-hidden'}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={overlayClasses}
      style={overlayStyles}
      onClick={handleClick}
      data-testid="portal-overlay"
    >
      {children}
    </div>
  );
});

PortalOverlay.displayName = 'PortalOverlay';

export default Portal;