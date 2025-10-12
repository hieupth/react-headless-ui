/**
 * Offcanvas renderer component using headless useOffcanvas hook.
 * Provides styled slide-in panel with backdrop and animations.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useOffcanvas, type UseOffcanvasProps, type OffcanvasPosition, type OffcanvasSize } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface OffcanvasProps extends Omit<UseOffcanvasProps, 'offcanvasRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Offcanvas content */
  children?: React.ReactNode;
  /** Custom renderer for header */
  renderHeader?: (props: { onClose: () => void }) => React.ReactNode;
  /** Custom renderer for body */
  renderBody?: () => React.ReactNode;
  /** Custom renderer for footer */
  renderFooter?: (props: { onClose: () => void }) => React.ReactNode;
  /** Custom renderer for backdrop */
  renderBackdrop?: (props: { onClick: () => void }) => React.ReactNode;
  /** Offcanvas title */
  title?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom close button */
  closeButton?: React.ReactNode;
  /** Whether to use portal */
  usePortal?: boolean;
  /** Custom container for portal */
  portalContainer?: HTMLElement;
  /** Custom width/height based on position */
  customSize?: string | number;
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show footer */
  showFooter?: boolean;
  /** Header content */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Backdrop blur amount */
  backdropBlur?: string;
  /** Custom backdrop opacity */
  backdropOpacity?: number;
  /** Element tag */
  as?: keyof JSX.IntrinsicElements;
  /** Animation easing */
  animationEasing?: string;
  /** Shadow depth */
  shadow?: string;
  /** Border radius */
  borderRadius?: string;
}

/**
 * Offcanvas component with slide-in panel behavior.
 * Provides flexible panel positioning with backdrop, focus management, and animations.
 */
export const Offcanvas = forwardRef<HTMLElement, OffcanvasProps>(({
  className = '',
  style,
  children,
  renderHeader,
  renderBody,
  renderFooter,
  renderBackdrop,
  title,
  showCloseButton = true,
  closeButton,
  usePortal = true,
  portalContainer,
  customSize,
  showHeader = true,
  showFooter = false,
  header,
  footer,
  backdropBlur = '4px',
  backdropOpacity = 0.5,
  as: Component = 'div',
  animationEasing = 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  shadow = '0 10px 25px rgba(0, 0, 0, 0.15)',
  borderRadius = '0',
  ...offcanvasProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    classes,
    focusable,
    pressable,
    semantic
  } = useOffcanvas({
    ...offcanvasProps,
    offcanvasRef: ref as React.RefObject<HTMLElement>
  });

  // Event handlers
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      actions.close();
    }
  };

  const handleCloseButtonClick = () => {
    actions.close();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && state.closeOnEscape) {
      actions.close();
    }
  };

  // Get size styles based on position
  const getSizeStyles = (): React.CSSProperties => {
    if (customSize) {
      const sizeValue = typeof customSize === 'number' ? `${customSize}px` : customSize;

      switch (state.position) {
        case 'top':
        case 'bottom':
          return { height: sizeValue, maxHeight: '100vh' };
        case 'left':
        case 'right':
          return { width: sizeValue, maxWidth: '100vw' };
        default:
          return {};
      }
    }

    const sizeMap = {
      sm: { width: '256px', height: '256px' },
      md: { width: '384px', height: '384px' },
      lg: { width: '512px', height: '512px' },
      xl: { width: '640px', height: '640px' },
      full: { width: '100vw', height: '100vh' }
    };

    const sizeStyles = sizeMap[state.size] || sizeMap.md;

    switch (state.position) {
      case 'top':
        return { height: sizeStyles.height, maxHeight: '100vh', width: '100%' };
      case 'bottom':
        return { height: sizeStyles.height, maxHeight: '100vh', width: '100%' };
      case 'left':
        return { width: sizeStyles.width, maxWidth: '100vw', height: '100%' };
      case 'right':
        return { width: sizeStyles.width, maxWidth: '100vw', height: '100%' };
      default:
        return sizeStyles;
    }
  };

  // Get position styles
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: offcanvasProps.zIndex || 1050,
      pointerEvents: state.open ? 'auto' : 'none'
    };

    const positionStyles = {
      top: { transform: state.open ? 'translateY(0)' : 'translateY(-100%)' },
      right: { transform: state.open ? 'translateX(0)' : 'translateX(100%)' },
      bottom: { transform: state.open ? 'translateY(0)' : 'translateY(100%)' },
      left: { transform: state.open ? 'translateX(0)' : 'translateX(-100%)' }
    };

    return {
      ...baseStyles,
      ...positionStyles[state.position]
    };
  };

  // Build CSS classes
  const elementClasses = `
    offcanvas
    offcanvas-${state.position}
    offcanvas-${state.size}
    ${classes.base}
    ${classes.open}
    ${classes.closed}
    ${classes.transitioning}
    ${classes.disabled}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build offcanvas styles
  const offcanvasStyles: React.CSSProperties = {
    ...getSizeStyles(),
    ...getPositionStyles(),
    backgroundColor: theme.colors?.background || '#ffffff',
    boxShadow: shadow,
    borderRadius,
    transition: `transform ${state.animationDuration}ms ${animationEasing}, opacity ${state.animationDuration}ms ${animationEasing}`,
    opacity: state.open ? 1 : 0,
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    ...style
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing?.lg || '24px',
    borderBottom: `1px solid ${theme.colors?.border || '#e5e7eb'}`,
    minHeight: '64px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: theme.colors?.text || '#111827',
    margin: 0
  };

  const closeButtonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: theme.borderRadius?.sm || '4px',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors?.muted || '#6b7280',
    cursor: 'pointer',
    transition: 'all 150ms ease-in-out',
    ...((hover) => ({
      backgroundColor: theme.colors?.gray + '10' || '#f9fafb',
      color: theme.colors?.text || '#111827'
    }))
  };

  // Body styles
  const bodyStyles: React.CSSProperties = {
    flex: 1,
    padding: theme.spacing?.lg || '24px',
    overflowY: 'auto',
    overflowX: 'hidden'
  };

  // Footer styles
  const footerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing?.sm || '8px',
    padding: theme.spacing?.lg || '24px',
    borderTop: `1px solid ${theme.colors?.border || '#e5e7eb'}`,
    minHeight: '64px'
  };

  // Backdrop styles
  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
    backdropFilter: `blur(${backdropBlur})`,
    zIndex: (offcanvasProps.zIndex || 1050) - 1,
    opacity: state.open ? 1 : 0,
    pointerEvents: state.open ? 'auto' : 'none',
    transition: `opacity ${state.animationDuration}ms ${animationEasing}`
  };

  // Render header
  const renderHeaderContent = (): React.ReactNode => {
    if (renderHeader) {
      return renderHeader({ onClose: actions.close });
    }

    if (header || title || showCloseButton) {
      return (
        <div style={headerStyles} data-testid="offcanvas-header">
          <div>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {header}
          </div>
          {showCloseButton && (
            <button
              style={closeButtonStyles}
              onClick={handleCloseButtonClick}
              data-offcanvas-close
              data-testid="offcanvas-close-button"
              aria-label="Close"
            >
              {closeButton || (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  // Render body
  const renderBodyContent = (): React.ReactNode => {
    if (renderBody) {
      return renderBody();
    }

    return <div style={bodyStyles} data-testid="offcanvas-body">{children}</div>;
  };

  // Render footer
  const renderFooterContent = (): React.ReactNode => {
    if (renderFooter) {
      return renderFooter({ onClose: actions.close });
    }

    if (footer || showFooter) {
      return (
        <div style={footerStyles} data-testid="offcanvas-footer">
          {footer}
        </div>
      );
    }

    return null;
  };

  // Render backdrop
  const renderBackdropContent = (): React.ReactNode => {
    if (!state.showBackdrop) return null;

    if (renderBackdrop) {
      return renderBackdrop({ onClick: actions.close });
    }

    return (
      <div
        style={backdropStyles}
        onClick={handleBackdropClick}
        data-testid="offcanvas-backdrop"
      />
    );
  };

  // Offcanvas content
  const offcanvasContent = (
    <>
      {renderBackdropContent()}
      <Component
        ref={ref}
        className={elementClasses}
        style={offcanvasStyles}
        {...attributes}
        {...focusable.attributes}
        {...pressable.attributes}
        {...semantic.attributes}
        onKeyDown={handleKeyDown}
        data-testid="offcanvas"
        data-position={state.position}
        data-size={state.size}
        data-open={state.open}
        data-transitioning={state.transitioning}
      >
        {showHeader && renderHeaderContent()}
        {renderBodyContent()}
        {renderFooterContent()}
      </Component>
    </>
  );

  // Render with portal or directly
  if (usePortal && state.open) {
    return createPortal(offcanvasContent, portalContainer || document.body);
  }

  return offcanvasContent;
});

Offcanvas.displayName = 'Offcanvas';

/**
 * Offcanvas.Trigger component for opening offcanvas
 */
export const OffcanvasTrigger = forwardRef<HTMLButtonElement, {
  /** Click handler */
  onClick?: () => void;
  /** Button children */
  children?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Offcanvas actions to control */
  offcanvas?: ReturnType<typeof useOffcanvas>['actions'];
}>(({ onClick, children, className = '', style, variant = 'primary', size = 'md', disabled = false, offcanvas, ...props }, ref) => {
  const theme = useTheme();

  const handleClick = () => {
    if (offcanvas) {
      offcanvas.toggle();
    }
    onClick?.();
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors?.primary || '#2563eb',
      color: theme.colors?.white || '#ffffff',
      border: 'none'
    },
    secondary: {
      backgroundColor: theme.colors?.gray + '100' || '#f3f4f6',
      color: theme.colors?.text || '#111827',
      border: `1px solid ${theme.colors?.border || '#e5e7eb'}`
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors?.primary || '#2563eb',
      border: `1px solid ${theme.colors?.primary || '#2563eb'}`
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors?.text || '#111827',
      border: '1px solid transparent'
    }
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.875rem' },
    md: { padding: '8px 16px', fontSize: '0.9375rem' },
    lg: { padding: '12px 24px', fontSize: '1rem' }
  };

  const buttonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: theme.borderRadius?.md || '6px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms ease-in-out',
    opacity: disabled ? 0.5 : 1,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style
  };

  return (
    <button
      ref={ref}
      className={`offcanvas-trigger ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled}
      data-testid="offcanvas-trigger"
      {...props}
    >
      {children}
    </button>
  );
});

OffcanvasTrigger.displayName = 'OffcanvasTrigger';

export default Offcanvas;