/**
 * DirectionProvider renderer component using headless useDirectionProvider hook.
 * Provides text direction (LTR/RTL) support for internationalization.
 */

import React, { forwardRef, createContext, useContext } from 'react';
import { useDirectionProvider, type UseDirectionProviderProps, type DirectionProviderState, type DirectionProviderActions } from '../hooks';

export interface DirectionProviderProps extends UseDirectionProviderProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Element tag */
  as?: React.ElementType;
  /** Children components */
  children?: React.ReactNode;
}

/**
 * Direction context for sharing direction state throughout the app
 */
export const DirectionContext = createContext<{
  state: DirectionProviderState;
  actions: DirectionProviderActions;
} | null>(null);

/**
 * Hook to access direction context
 */
export const useDirection = () => {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
};

/**
 * DirectionProvider component with LTR/RTL support.
 * Provides comprehensive direction management for internationalization.
 */
export const DirectionProvider = forwardRef<HTMLElement, DirectionProviderProps>(({
  className = '',
  style,
  as: Component = 'div',
  children,
  ...directionProviderProps
}, ref) => {
  const {
    state,
    actions,
    cssProperties,
    ariaAttributes
  } = useDirectionProvider(directionProviderProps);

  // Build CSS classes
  const elementClasses = `
    direction-provider
    direction-${state.layoutDirection}
    ${state.isRTL ? 'direction-rtl' : 'direction-ltr'}
    ${state.isAuto ? 'direction-auto' : 'direction-manual'}
    ${state.changing ? 'direction-changing' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Build combined styles
  const combinedStyles: React.CSSProperties = {
    ...cssProperties,
    ...style,
    transition: state.changing ? 'all 0.1s ease-in-out' : undefined
  };

  const contextValue = {
    state,
    actions
  };

  return (
    <DirectionContext.Provider value={contextValue}>
      <Component
        ref={ref}
        className={elementClasses}
        style={combinedStyles}
        {...ariaAttributes}
        data-testid="direction-provider"
        data-direction={state.layoutDirection}
        data-rtl={state.isRTL}
        data-auto={state.isAuto}
        data-locale={state.locale}
      >
        {children}
      </Component>
    </DirectionContext.Provider>
  );
});

DirectionProvider.displayName = 'DirectionProvider';

/**
 * DirectionProvider.Text component for directional text
 */
export const DirectionalText = forwardRef<HTMLSpanElement, {
  /** Text content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Text alignment */
  align?: 'auto' | 'left' | 'right' | 'start' | 'end';
  /** Whether to auto-detect direction */
  autoDetect?: boolean;
}>(({ children, className = '', style, align = 'auto', autoDetect = false }, ref) => {
  const { state, actions } = useDirection();

  // Auto-detect direction from text content
  React.useEffect(() => {
    if (autoDetect && typeof children === 'string') {
      actions.autoDetect(children);
    }
  }, [children, autoDetect, actions]);

  // Determine text alignment
  const textAlign = align === 'auto'
    ? (state.isRTL ? 'right' : 'left')
    : align;

  const textClasses = `
    directional-text
    text-align-${textAlign}
    ${state.isRTL ? 'text-rtl' : 'text-ltr'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const textStyles: React.CSSProperties = {
    textAlign,
    direction: state.layoutDirection,
    ...style
  };

  return (
    <span
      ref={ref}
      className={textClasses}
      style={textStyles}
      data-testid="directional-text"
      data-align={textAlign}
    >
      {children}
    </span>
  );
});

DirectionalText.displayName = 'DirectionalText';

/**
 * DirectionProvider.Flex component for directional flexbox layouts
 */
export const DirectionalFlex = forwardRef<HTMLDivElement, {
  /** Flex content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Flex direction */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Justify content */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  /** Align items */
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  /** Gap between items */
  gap?: string;
  /** Whether to reverse for RTL */
  reverseForRTL?: boolean;
}>(({
  children,
  className = '',
  style,
  direction = 'row',
  justify = 'start',
  align = 'start',
  gap,
  reverseForRTL = true
}, ref) => {
  const { state } = useDirection();

  // Adjust direction for RTL
  const actualDirection = reverseForRTL && state.isRTL && direction === 'row'
    ? 'row-reverse'
    : reverseForRTL && state.isRTL && direction === 'row-reverse'
    ? 'row'
    : direction;

  // Map justify/align values
  const justifyContent = justify === 'start'
    ? (state.isRTL ? 'flex-end' : 'flex-start')
    : justify === 'end'
    ? (state.isRTL ? 'flex-start' : 'flex-end')
    : justify;

  const alignItems = align === 'start'
    ? 'flex-start'
    : align === 'end'
    ? 'flex-end'
    : align;

  const flexClasses = `
    directional-flex
    flex-direction-${actualDirection}
    justify-${justify}
    align-${align}
    ${state.isRTL ? 'flex-rtl' : 'flex-ltr'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const flexStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: actualDirection,
    justifyContent,
    alignItems,
    gap,
    direction: state.layoutDirection,
    ...style
  };

  return (
    <div
      ref={ref}
      className={flexClasses}
      style={flexStyles}
      data-testid="directional-flex"
      data-direction={actualDirection}
      data-justify={justifyContent}
      data-align={alignItems}
    >
      {children}
    </div>
  );
});

DirectionalFlex.displayName = 'DirectionalFlex';

/**
 * DirectionProvider.Spacer component for directional spacing
 */
export const DirectionalSpacer = forwardRef<HTMLDivElement, {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Start spacing */
  start?: string;
  /** End spacing */
  end?: string;
  /** Top spacing */
  top?: string;
  /** Bottom spacing */
  bottom?: string;
  /** All spacing */
  all?: string;
  /** Whether to use logical properties */
  logical?: boolean;
}>(({ className = '', style, start, end, top, bottom, all, logical = true }, ref) => {
  const { actions } = useDirection();

  const spacerStyles: React.CSSProperties = {
    ...style
  };

  if (all) {
    spacerStyles.margin = all;
  } else {
    if (logical) {
      if (start) spacerStyles.marginInlineStart = start;
      if (end) spacerStyles.marginInlineEnd = end;
    } else {
      if (start) {
        spacerStyles.marginLeft = actions.getAlignForDirection(start, '0');
        spacerStyles.marginRight = actions.getAlignForDirection('0', start);
      }
      if (end) {
        spacerStyles.marginLeft = actions.getAlignForDirection(end, '0');
        spacerStyles.marginRight = actions.getAlignForDirection('0', end);
      }
    }
    if (top) spacerStyles.marginTop = top;
    if (bottom) spacerStyles.marginBottom = bottom;
  }

  const spacerClasses = `
    directional-spacer
    ${logical ? 'spacer-logical' : 'spacer-physical'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={ref}
      className={spacerClasses}
      style={spacerStyles}
      data-testid="directional-spacer"
    />
  );
});

DirectionalSpacer.displayName = 'DirectionalSpacer';

/**
 * DirectionProvider.Toggle component for switching directions
 */
export const DirectionToggle = forwardRef<HTMLButtonElement, {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Toggle button text */
  children?: React.ReactNode;
  /** Whether to show current direction */
  showDirection?: boolean;
  /** Custom active/inactive text */
  activeText?: string;
  inactiveText?: string;
  /** Click handler */
  onClick?: () => void;
}>(({
  className = '',
  style,
  children,
  showDirection = true,
  activeText = 'RTL',
  inactiveText = 'LTR',
  onClick
}, ref) => {
  const { state, actions } = useDirection();

  const handleClick = () => {
    actions.toggle();
    onClick?.();
  };

  const buttonText = children || (state.isRTL ? activeText : inactiveText);

  const toggleClasses = `
    direction-toggle
    ${state.isRTL ? 'direction-toggle-rtl' : 'direction-toggle-ltr'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      ref={ref}
      className={toggleClasses}
      style={style}
      onClick={handleClick}
      data-testid="direction-toggle"
      data-current-direction={state.layoutDirection}
      aria-label={`Switch to ${state.isRTL ? 'LTR' : 'RTL'} layout`}
    >
      {buttonText}
      {showDirection && (
        <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
          ({state.layoutDirection.toUpperCase()})
        </span>
      )}
    </button>
  );
});

DirectionToggle.displayName = 'DirectionToggle';

export default DirectionProvider;