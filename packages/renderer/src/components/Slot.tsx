/**
 * Slot renderer component using headless useSlot hook.
 * Provides flexible content composition with element forwarding.
 */

import React, { forwardRef, cloneElement, Children, isValidElement } from 'react';
import ReactDOM from 'react-dom';
import { useSlot, type UseSlotProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface SlotProps extends Omit<UseSlotProps, 'slotRef' | 'forwardedRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Whether to render as div wrapper */
  as?: keyof JSX.IntrinsicElements;
  /** Wrapper props when not cloning */
  wrapperProps?: React.HTMLAttributes<HTMLElement>;
  /** Children renderer function */
  renderChildren?: (children: React.ReactNode, props: any) => React.ReactNode;
  /** Debug mode to show slot boundaries */
  debug?: boolean;
}

/**
 * Slot component with flexible content composition.
 * Provides element forwarding and prop merging capabilities.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(({
  className = '',
  style,
  as: Component = 'div',
  wrapperProps = {},
  renderChildren,
  debug = false,
  children,
  mergeStrategy = 'merge',
  clone = false,
  allowRefForward = true,
  mergeProps: additionalMergeProps = {},
  excludeProps,
  priorityProps,
  ...slotProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    focusable,
    pressable,
    semantic
  } = useSlot({
    ...slotProps,
    children,
    mergeStrategy,
    clone,
    allowRefForward,
    mergeProps: additionalMergeProps,
    excludeProps,
    priorityProps,
    slotRef: ref as React.RefObject<HTMLElement>,
    forwardedRef: ref as React.RefObject<HTMLElement>
  });

  /**
   * Render a single child with merged props
   */
  const renderChild = (child: React.ReactNode): React.ReactNode => {
    if (!isValidElement(child)) {
      return child;
    }

    const childProps = child.props || {};
    const mergedProps = actions.mergeProps(childProps, {
      ...attributes,
      ...focusable.attributes,
      ...pressable.attributes,
      ...semantic.attributes,
      className: `
        slot-content
        ${state.active ? 'slot-active' : ''}
        ${state.disabled ? 'slot-disabled' : ''}
        ${state.focused ? 'slot-focused' : ''}
        ${debug ? 'slot-debug' : ''}
        ${className || ''}
        ${childProps.className || ''}
      `.trim().replace(/\s+/g, ' '),
      style: {
        ...childProps.style,
        ...style,
        ...(debug ? {
          outline: '2px dashed red',
          outlineOffset: '2px',
          position: 'relative'
        } : {})
      }
    });

    // Handle ref forwarding
    const childRef = (child as any).ref;
    const mergedRef = (element: HTMLElement) => {
      if (allowRefForward) {
        if (typeof childRef === 'function') {
          childRef(element);
        } else if (childRef && typeof childRef === 'object') {
          (childRef as React.RefObject<HTMLElement>).current = element;
        }
      }

      if (typeof ref === 'function') {
        ref(element);
      } else if (ref && typeof ref === 'object') {
        (ref as React.RefObject<HTMLElement>).current = element;
      }
    };

    if (state.clone || clone) {
      return cloneElement(child, {
        ...mergedProps,
        ref: mergedRef
      });
    }

    return React.cloneElement(child, mergedProps);
  };

  /**
   * Render all children
   */
  const renderChildrenContent = (): React.ReactNode => {
    if (!children) {
      return null;
    }

    if (renderChildren) {
      return renderChildren(children, {
        ...attributes,
        ...focusable.attributes,
        ...pressable.attributes,
        ...semantic.attributes,
        className,
        style
      });
    }

    const childrenArray = Children.toArray(children);

    if (childrenArray.length === 1) {
      return renderChild(childrenArray[0]);
    }

    // Multiple children - render each with slot behavior
    return childrenArray.map((child, index) => {
      if (isValidElement(child)) {
        return (
          <React.Fragment key={child.key || index}>
            {renderChild(child)}
          </React.Fragment>
        );
      }
      return child;
    });
  };

  /**
   * Render wrapper element
   */
  const renderWrapper = (content: React.ReactNode): React.ReactNode => {
    const wrapperClasses = `
      slot-wrapper
      ${state.active ? 'slot-wrapper-active' : ''}
      ${state.disabled ? 'slot-wrapper-disabled' : ''}
      ${state.focused ? 'slot-wrapper-focused' : ''}
      ${debug ? 'slot-wrapper-debug' : ''}
      ${className || ''}
    `.trim().replace(/\s+/g, ' ');

    const wrapperStyles: React.CSSProperties = {
      ...style,
      ...(debug ? {
        border: '1px solid blue',
        backgroundColor: 'rgba(0, 0, 255, 0.05)',
        position: 'relative',
        '::before': {
          content: '"SLOT"',
          position: 'absolute',
          top: '-20px',
          left: '0',
          fontSize: '10px',
          color: 'blue',
          backgroundColor: 'white',
          padding: '2px 4px',
          border: '1px solid blue',
          borderRadius: '2px'
        }
      } : {})
    };

    if (state.clone || clone) {
      // When cloning, we don't render a wrapper
      return content;
    }

    return (
      <Component
        ref={ref}
        className={wrapperClasses}
        style={wrapperStyles}
        {...attributes}
        {...focusable.attributes}
        {...pressable.attributes}
        {...semantic.attributes}
        {...wrapperProps}
        data-testid="slot-wrapper"
      >
        {content}
        {debug && (
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              left: '0',
              fontSize: '10px',
              color: 'blue',
              backgroundColor: 'white',
              padding: '2px 4px',
              border: '1px solid blue',
              borderRadius: '2px',
              fontFamily: 'monospace',
              zIndex: 1000
            }}
          >
            SLOT: {state.mergeStrategy}
          </div>
        )}
      </Component>
    );
  };

  // Build debug overlay
  const debugOverlay = debug && (
    <div
      style={{
        position: 'absolute',
        top: '0',
        right: '0',
        fontSize: '10px',
        color: 'red',
        backgroundColor: 'white',
        padding: '2px 4px',
        border: '1px solid red',
        borderRadius: '2px',
        fontFamily: 'monospace',
        zIndex: 1001,
        pointerEvents: 'none'
      }}
    >
      {state.clone ? 'CLONE' : 'WRAPPER'}
      {state.focused && ' | FOCUSED'}
      {state.disabled && ' | DISABLED'}
      {state.active && ' | ACTIVE'}
    </div>
  );

  // Render slot content
  const content = renderChildrenContent();

  // Return wrapper with content
  return (
    <div style={{ position: 'relative' }}>
      {renderWrapper(content)}
      {debugOverlay}
    </div>
  );
});

Slot.displayName = 'Slot';

/**
 * Slot.Clone component for explicit cloning behavior
 */
export const SlotClone = forwardRef<HTMLElement, Omit<SlotProps, 'clone'>>((props, ref) => {
  return <Slot {...props} ref={ref} clone={true} />;
});

SlotClone.displayName = 'SlotClone';

/**
 * Slot.Wrapper component for explicit wrapper behavior
 */
export const SlotWrapper = forwardRef<HTMLElement, Omit<SlotProps, 'clone'>>((props, ref) => {
  return <Slot {...props} ref={ref} clone={false} />;
});

SlotWrapper.displayName = 'SlotWrapper';

/**
 * Slot.Portal component for portal-based slot
 */
export const SlotPortal = forwardRef<HTMLElement, Omit<SlotProps, 'clone'> & {
  /** Portal container */
  container?: string | HTMLElement;
  /** Whether to show backdrop */
  showBackdrop?: boolean;
}>(({ container, showBackdrop = false, ...props }, ref) => {
  const [mounted, setMounted] = React.useState(false);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  // Find portal container
  React.useEffect(() => {
    if (container) {
      const element = typeof container === 'string'
        ? document.querySelector(container) as HTMLElement
        : container;

      if (element) {
        setPortalContainer(element);
        setMounted(true);
      }
    }
  }, [container]);

  if (!mounted || !portalContainer) {
    return null;
  }

  const content = (
    <Slot {...props} ref={ref}>
      {props.children}
    </Slot>
  );

  // Create backdrop
  const backdrop = showBackdrop && (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: '999'
      }}
      data-testid="slot-portal-backdrop"
    />
  );

  return (
    <>
      {backdrop}
      {ReactDOM.createPortal(
        <div style={{ position: 'relative', zIndex: '1000' }}>
          {content}
        </div>,
        portalContainer
      )}
    </>
  );
});

SlotPortal.displayName = 'SlotPortal';

/**
 * Slot.RadioGroup component for radio button slot composition
 */
export const SlotRadioGroup = forwardRef<HTMLDivElement, {
  /** Radio group name */
  name?: string;
  /** Selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Radio options */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}>(({
  name = 'slot-radio-group',
  value,
  defaultValue,
  onChange,
  children,
  className = '',
  style,
  orientation = 'vertical'
}, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setSelectedValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div
      ref={ref}
      className={`
        slot-radio-group
        slot-radio-group-${orientation}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: '8px',
        ...style
      }}
      role="radiogroup"
      data-testid="slot-radio-group"
    >
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          const isChecked = currentValue === child.props.value;

          return (
            <Slot
              key={child.key || index}
              mergeProps={{
                type: 'radio',
                name,
                checked: isChecked,
                onChange: () => handleChange(child.props.value),
                'aria-checked': isChecked,
                'data-radio-checked': isChecked
              }}
            >
              {child}
            </Slot>
          );
        }
        return child;
      })}
    </div>
  );
});

SlotRadioGroup.displayName = 'SlotRadioGroup';

export default Slot;