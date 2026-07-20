/**
 * Resizable renderer component using headless useResizable hook.
 * Provides styled resizable container with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useResizable, type UseResizableProps, type HandlePosition } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface ResizableProps extends UseResizableProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Children content */
  children?: React.ReactNode;
  /** Custom handle renderer */
  renderHandle?: (handle: HandlePosition, isActive: boolean, attributes: any, styles: React.CSSProperties) => React.ReactNode;
  /** Handle size */
  handleSize?: 'sm' | 'md' | 'lg';
  /** Handle color theme */
  handleColor?: 'primary' | 'secondary' | 'default';
  /** Whether handles are always visible */
  handlesVisible?: boolean;
  /** Resize animation duration */
  animationDuration?: number;
  /** Minimum visual size */
  minVisualSize?: number;
}

/**
 * Resizable component with drag handles.
 * Supports constraints, aspect ratio, and grid snapping.
 */
export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(({
  className = '',
  style,
  children,
  renderHandle,
  handleSize = 'md',
  handleColor = 'default',
  handlesVisible = false,
  animationDuration = 0,
  minVisualSize = 50,
  ...resizableProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    resizableAttributes,
    getHandleAttributes,
    getHandleStyles
  } = useResizable(resizableProps);

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'resizable-sm',
      md: 'resizable-md',
      lg: 'resizable-lg'
    };
    return sizes[handleSize];
  };

  // Color classes
  const getColorClasses = () => {
    const colors = {
      primary: 'resizable-primary',
      secondary: 'resizable-secondary',
      default: 'resizable-default'
    };
    return colors[handleColor];
  };

  // Base resizable classes
  const resizableClasses = `
    resizable
    ${getSizeClasses()}
    ${getColorClasses()}
    ${state.disabled ? 'resizable-disabled' : ''}
    ${state.isResizing ? 'resizable-active' : ''}
    ${handlesVisible ? 'resizable-handles-visible' : 'resizable-handles-hover'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default handle renderer
  const defaultRenderHandle = (handle: HandlePosition, isActive: boolean, attributes: any, styles: React.CSSProperties) => {
    const handleClasses = `
      
      ${handle}
      ${isActive ? '' : ''}
      ${state.disabled ? '' : ''}
      ${handleSize === 'sm' ? '' : ''}
      ${handleSize === 'lg' ? '' : ''}
      ${handleColor === 'primary' ? '' : ''}
      ${handleColor === 'secondary' ? '' : ''}
    `.trim().replace(/\s+/g, ' ');

    // Corner handles (larger)
    if (handle.includes('-')) {
      return (
        <div
          {...attributes}
          className={handleClasses}
          style={styles}
          data-testid={`resize-handle-${handle}`}
        >
          <div className="">
            <div className="" />
            <div className="" />
            <div className="" />
            <div className="" />
          </div>
        </div>
      );
    }

    // Edge handles (thinner lines)
    return (
      <div
        {...attributes}
        className={handleClasses}
        style={styles}
        data-testid={`resize-handle-${handle}`}
      >
        <div className="" />
      </div>
    );
  };

  // Container styles with animation
  const containerStyles: React.CSSProperties = {
    ...resizableAttributes.style,
    ...style,
    transition: state.isResizing ? 'none' : `width ${animationDuration}ms, height ${animationDuration}ms`,
    minWidth: minVisualSize,
    minHeight: minVisualSize
  };

  // Size display for debugging
  const SizeDisplay = () => (
    <div className="resizable-size-display">
      {Math.round(state.width)} × {Math.round(state.height)}
    </div>
  );

  return (
    <div
      ref={ref}
      className={resizableClasses}
      {...resizableAttributes}
      style={containerStyles}
      data-testid="resizable"
    >
      {/* Content */}
      <div className="resizable-content" data-testid="resizable-content">
        {children}
      </div>

      {/* Resize Handles */}
      {computed.availableHandles.map((handle) => {
        const attributes = getHandleAttributes(handle);
        const styles = getHandleStyles(handle);
        const isActive = state.activeHandle === handle;

        return (
          <div key={handle} className="">
            {renderHandle
              ? renderHandle(handle, isActive, attributes, styles)
              : defaultRenderHandle(handle, isActive, attributes, styles)}
          </div>
        );
      })}

      {/* Size display (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <SizeDisplay />
      )}

      {/* Visual feedback when resizing */}
      {state.isResizing && (
        <div className="resizable-overlay">
          <div className="resizable-resizing-indicator">
            <div className="resizable-resizing-text">Resizing...</div>
            <div className="resizable-resizing-size">
              {Math.round(state.width)} × {Math.round(state.height)}
            </div>
          </div>
        </div>
      )}

      {/* Constraints indicators */}
      {computed.isAtMinSize && (
        <div className="resizable-indicator resizable-min-size" aria-live="polite">
          Minimum size reached
        </div>
      )}
      {computed.isAtMaxSize && (
        <div className="resizable-indicator resizable-max-size" aria-live="polite">
          Maximum size reached
        </div>
      )}

      {/* Accessibility hints */}
      <div className="sr-only" aria-live="polite">
        {state.isResizing && `Resizing to ${Math.round(state.width)} by ${Math.round(state.height)} pixels`}
        {!state.isResizing && state.lastResizeHandle && `Resize stopped at ${Math.round(state.width)} by ${Math.round(state.height)} pixels`}
      </div>
    </div>
  );
});

Resizable.displayName = 'Resizable';

export default Resizable;