/**
 * AccessibleIcon renderer component using headless useAccessibleIcon hook.
 * Provides styled accessible icon with comprehensive screen reader support.
 */

import React, { forwardRef } from 'react';
import { useAccessibleIcon, type UseAccessibleIconProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface AccessibleIconProps extends Omit<UseAccessibleIconProps, 'iconRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Icon library prefix (e.g., 'fas', 'far', 'fal') */
  iconPrefix?: string;
  /** Custom icon renderer */
  renderIcon?: (icon: string | React.ReactNode, props: any) => React.ReactNode;
  /** Custom fallback icon */
  fallbackIcon?: React.ReactNode;
  /** Whether to show tooltip on hover */
  showTooltip?: boolean;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Tooltip content */
  tooltip?: string;
  /** Whether to show label as visible text */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to animate on hover */
  animateOnHover?: boolean;
  /** Hover scale factor */
  hoverScale?: number;
  /** Whether to allow keyboard rotation */
  allowRotation?: boolean;
  /** Rotation step degrees */
  rotationStep?: number;
}

/**
 * AccessibleIcon component with proper screen reader support.
 * Provides icon accessibility features including ARIA labels and roles.
 */
export const AccessibleIcon = forwardRef<HTMLElement, AccessibleIconProps>(({
  className = '',
  style,
  iconPrefix = 'fas',
  renderIcon,
  fallbackIcon,
  showTooltip = false,
  tooltipPosition = 'top',
  tooltip,
  showLabel = false,
  labelPosition = 'bottom',
  animateOnHover = true,
  hoverScale = 1.1,
  allowRotation = false,
  rotationStep = 45,
  interactive = false,
  ...accessibleIconProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    styles
  } = useAccessibleIcon({
    ...accessibleIconProps,
    iconRef: ref as React.RefObject<HTMLElement>
  });

  // State for hover and tooltip visibility
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltipState, setShowTooltipState] = React.useState(false);

  // Default icon renderer (Font Awesome compatible)
  const defaultRenderIcon = (icon: string | React.ReactNode, props: any) => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { ...props });
    }

    if (typeof icon === 'string') {
      // Handle Font Awesome classes
      const iconClass = icon.startsWith('fa-') ? icon : `fa-${icon}`;
      return (
        <i
          {...props}
          className={`${iconPrefix} ${iconClass}`}
          style={{ ...props.style, ...styles }}
        />
      );
    }

    return fallbackIcon || <span {...props} />;
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (showTooltip && tooltip) {
      setShowTooltipState(true);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltipState(false);
  };

  // Handle keyboard rotation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!allowRotation || interactive) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        actions.rotate(rotationStep);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        actions.rotate(-rotationStep);
        break;
    }
  };

  // Build CSS classes
  const iconClasses = `
    accessible-icon
      
    ${interactive ? '' : ''}
    ${state.hidden ? ' pointer-events-none' : ''}
    ${animateOnHover ? ' ' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build combined styles
  const combinedStyles = {
    ...styles,
    ...(isHovered && animateOnHover ? { transform: `scale(${hoverScale}) rotate(${state.rotation}deg)` } : {}),
    ...style
  };

  // Build label styles
  const labelStyles = {
    fontSize: `${Math.max(state.size * 0.75, 12)}px`,
    color: state.color,
    ...(interactive ? { cursor: 'pointer' } : {})
  };

  // Build container styles
  const containerStyles: React.CSSProperties = {};
  const labelClasses = [];

  // Adjust container based on label position
  switch (labelPosition) {
    case 'top':
      containerStyles.flexDirection = 'column';
      containerStyles.alignItems = 'center';
      containerStyles.gap = `${Math.max(state.size * 0.25, 4)}px`;
      break;
    case 'bottom':
      containerStyles.flexDirection = 'column';
      containerStyles.alignItems = 'center';
      containerStyles.gap = `${Math.max(state.size * 0.25, 4)}px`;
      break;
    case 'left':
      containerStyles.flexDirection = 'row';
      containerStyles.alignItems = 'center';
      containerStyles.gap = `${Math.max(state.size * 0.5, 8)}px`;
      break;
    case 'right':
      containerStyles.flexDirection = 'row-reverse';
      containerStyles.alignItems = 'center';
      containerStyles.gap = `${Math.max(state.size * 0.5, 8)}px`;
      break;
  }

  // Build tooltip styles
  const tooltipStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1000,
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none'
  };

  // Adjust tooltip position
  switch (tooltipPosition) {
    case 'top':
      tooltipStyles.bottom = '100%';
      tooltipStyles.marginBottom = '4px';
      tooltipStyles.left = '50%';
      tooltipStyles.transform = 'translateX(-50%)';
      break;
    case 'bottom':
      tooltipStyles.top = '100%';
      tooltipStyles.marginTop = '4px';
      tooltipStyles.left = '50%';
      tooltipStyles.transform = 'translateX(-50%)';
      break;
    case 'left':
      tooltipStyles.right = '100%';
      tooltipStyles.marginRight = '4px';
      tooltipStyles.top = '50%';
      tooltipStyles.transform = 'translateY(-50%)';
      break;
    case 'right':
      tooltipStyles.left = '100%';
      tooltipStyles.marginLeft = '4px';
      tooltipStyles.top = '50%';
      tooltipStyles.transform = 'translateY(-50%)';
      break;
  }

  // Build label element
  const labelElement = showLabel && state.label && !state.decorative && (
    <span className="accessible-icon-label" style={labelStyles}>
      {state.label}
    </span>
  );

  return (
    <span
      className={iconClasses}
      style={containerStyles}
      role="group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      data-testid="accessible-icon-container"
    >
      {/* Icon element */}
      <span
        className="accessible-icon-wrapper"
        ref={ref}
        style={combinedStyles}
        {...attributes}
        data-testid="accessible-icon"
      >
        {renderIcon
          ? renderIcon(state.icon, {
            'aria-hidden': state.decorative || state.hidden,
            'aria-label': state.label,
            style: combinedStyles
          })
          : defaultRenderIcon(state.icon, {
            'aria-hidden': state.decorative || state.hidden,
            'aria-label': state.label,
            style: combinedStyles
          })
        }
      </span>

      {/* Label */}
      {(labelPosition === 'top' || labelPosition === 'left') && labelElement}

      {/* Label */}
      {(labelPosition === 'bottom' || labelPosition === 'right') && labelElement}

      {/* Tooltip */}
      {showTooltip && tooltip && showTooltipState && (
        <div
          className="accessible-icon-tooltip"
          style={tooltipStyles}
          data-testid="accessible-icon-tooltip"
        >
          {tooltip}
          {/* Tooltip arrow */}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid rgba(0, 0, 0, 0.8)',
              ...(() => {
                switch (tooltipPosition) {
                  case 'top':
                    return {
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    };
                  case 'bottom':
                    return {
                      top: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(180deg)'
                    };
                  case 'left':
                    return {
                      right: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(90deg)'
                    };
                  case 'right':
                    return {
                      left: '-4px',
                      top: '50%',
                      transform: 'translateY(-50%) rotate(-90deg)'
                    };
                  // reason: tooltipPosition is typed 'top'|'bottom'|'left'|'right';
                  // all four cases above are exhaustive, so a default is unreachable.
                }
              })()
            }}
          />
        </div>
      )}
    </span>
  );
});

AccessibleIcon.displayName = 'AccessibleIcon';

export default AccessibleIcon;