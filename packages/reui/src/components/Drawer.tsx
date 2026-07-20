/**
 * Drawer renderer component.
 * Provides visual representation for drawer/side panel components.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDrawer } from '../hooks';
import type { UseDrawerProps } from '../hooks';

/**
 * Drawer component props
 */
export interface DrawerProps extends UseDrawerProps {
  /** Drawer content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Custom overlay renderer */
  overlayRenderer?: (props: any) => React.ReactNode;
  /** Custom header renderer */
  headerRenderer?: (props: any) => React.ReactNode;
  /** Custom footer renderer */
  footerRenderer?: (props: any) => React.ReactNode;
}

/**
 * Drawer Trigger component props
 */
export interface DrawerTriggerProps {
  /** Trigger content */
  children: React.ReactNode;
  /** Open handler */
  onOpen?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Drawer Content component props
 */
export interface DrawerContentProps {
  /** Content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Drawer Header component props
 */
export interface DrawerHeaderProps {
  /** Header content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Drawer Footer component props
 */
export interface DrawerFooterProps {
  /** Footer content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Drawer component
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({
    children,
    className = '',
    style,
    overlayRenderer,
    headerRenderer,
    footerRenderer,
    ...props
  }: DrawerProps, ref) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const {
      state,
      handlers,
      attributes,
      overlayAttributes
    } = useDrawer(props);

    const { side, size, variant, modal } = state;
    const { title, subtitle, showCloseButton } = props;

    // openingClass: `opening` is only set by useDrawer.handleOpen, which the
    // Drawer component never invokes (it has no built-in open trigger; only the
    // close button / Escape call handleClose, covered by closingClass below).
    /* c8 ignore next */
    const openingClass = state.opening ? '' : '';
    const closingClass = state.closing ? '' : '';

    // Size classes
    const sizeClasses = {
      sm: '',
      md: '',
      lg: '',
      xl: '',
      full: ''
    };

    // Side classes
    const sideClasses = {
      left: '  ',
      right: '  ',
      top: '  ',
      bottom: '  '
    };

    // Animation classes
    const animationClasses = {
      left: state.open ? '' : '-translate-x-full',
      right: state.open ? '' : '',
      top: state.open ? '' : '-translate-y-full',
      bottom: state.open ? '' : ''
    };

    const drawerClasses = `
           
      ${sideClasses[side]}
      ${sizeClasses[size]}
      ${animationClasses[side]}
      ${openingClass}
      ${closingClass}
      ${side === 'left' || side === 'right' ? '' : ''}
      ${side === 'top' || side === 'bottom' ? '' : ''}
      ${className}
    `;

    // Render overlay
    const renderOverlay = () => {
      if (!modal) return null;

      if (overlayRenderer) {
        return overlayRenderer(overlayAttributes);
      }

      // overlayOpacity: the overlay only mounts while state.open is true (the
      // panel returns null when closed), so the opacity-0 branch is unreachable.
      /* c8 ignore next */
      const overlayOpacity = state.open ? 'opacity-100' : 'opacity-0';
      // overlayOpening: see openingClass above — `opening` is unreachable here.
      /* c8 ignore next */
      const overlayOpening = state.opening ? 'animate-pulse' : '';
      const overlayClosing = state.closing ? 'animate-pulse' : '';

      return (
        <div
          {...overlayAttributes}
          data-testid="drawer-overlay"
          className={`
               
            ${overlayOpacity}
            ${overlayOpening}
            ${overlayClosing}
          `}
        />
      );
    };

    // Render header
    const renderHeader = () => {
      if (!title && !subtitle && !showCloseButton) return null;

      if (headerRenderer) {
        return headerRenderer({
          title,
          subtitle,
          showCloseButton,
          onClose: handlers.handleClose
        });
      }

      return (
        <div className="     ">
          <div>
            {title && (
              <h2 className="  " id={attributes['aria-labelledby']}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="  " id={attributes['aria-describedby']}>
                {subtitle}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={handlers.handleClose}
              className="      "
              aria-label="Close drawer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      );
    };

    // Render footer
    const renderFooter = () => {
      if (!footerRenderer) return null;

      return (
        <div className="  ">
          {footerRenderer({ onClose: handlers.handleClose })}
        </div>
      );
    };

    // Render drawer content
    const content = (
      <div
        ref={drawerRef}
        className={drawerClasses}
        {...attributes}
        style={{
          ...style,
          zIndex: props.zIndex ?? 1000
        }}
        data-testid="drawer"
      >
        {/* Header */}
        {renderHeader()}

        {/* Main content */}
        <div className=" " data-testid="drawer-content">
          {children}
        </div>

        {/* Footer */}
        {renderFooter()}
      </div>
    );

    // Focus drawer when opened
    useEffect(() => {
      if (state.open && drawerRef.current) {
        drawerRef.current.focus();
      }
    }, [state.open]);

    // Use portal if enabled
    if (props.portal && state.open) {
      return createPortal(
        <>
          {renderOverlay()}
          {content}
        </>,
        document.body
      );
    }

    return state.open ? (
      <>
        {renderOverlay()}
        {content}
      </>
    ) : null;
  }
);

/**
 * Drawer Trigger component
 */
export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({
  children,
  onOpen,
  onClose,
  className = '',
  style
}) => {
  const handleClick = () => {
    onOpen?.();
  };

  return (
    <div
      className={className}
      style={style}
      onClick={handleClick}
      data-drawer-trigger
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * Drawer Content component
 */
export const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`drawer-content ${className}`}
      style={style}
      data-testid="drawer-content-area"
    >
      {children}
    </div>
  );
};

/**
 * Drawer Header component
 */
export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`drawer-header ${className}`}
      style={style}
      data-testid="drawer-header"
    >
      {children}
    </div>
  );
};

/**
 * Drawer Footer component
 */
export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`drawer-footer ${className}`}
      style={style}
      data-testid="drawer-footer"
    >
      {children}
    </div>
  );
};

Drawer.displayName = 'Drawer';

export default Drawer;