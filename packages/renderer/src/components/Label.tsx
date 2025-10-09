import React from 'react';
import { useLabel, type UseLabelProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface LabelProps extends UseLabelProps {
  /** Label text content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom renderer for required indicator */
  renderRequiredIndicator?: () => React.ReactNode;
}

/**
 * Label component provides accessible form labels with proper focus management.
 * Supports required indicators, error states, and accessibility features.
 *
 * @param props - Component configuration props
 * @returns Styled label component
 */
export const Label: React.FC<LabelProps> = ({
  children,
  className,
  renderRequiredIndicator,
  ...labelProps
}) => {
  const { state, actions, props, requiredIndicator } = useLabel(labelProps);
  const theme = useTheme();

  // Build CSS classes for label
  const labelClasses = [
    'label',
    state.disabled && 'label-disabled',
    state.error && 'label-error',
    state.required && 'label-required',
    className
  ].filter(Boolean).join(' ');

  /**
   * Default renderer for required indicator
   */
  const defaultRenderRequiredIndicator = () => (
    <span
      className="label-required-indicator"
      style={{
        color: state.error ? theme.colors.destructive : theme.colors.primary,
        marginLeft: state.requiredPosition === 'end' ? theme.spacing.xs : '0',
        marginRight: state.requiredPosition === 'start' ? theme.spacing.xs : '0',
        fontWeight: 'bold',
      }}
    >
      {requiredIndicator}
    </span>
  );

  const renderRequiredFunction = renderRequiredIndicator || defaultRenderRequiredIndicator;

  return (
    <label
      className={labelClasses}
      {...props}
      style={{
        ...props.style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing.xs,
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.medium,
        color: state.error
          ? theme.colors.destructive
          : state.disabled
            ? theme.colors.muted
            : theme.colors.foreground,
        cursor: state.disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transition: 'color 0.2s ease',
      }}
    >
      {/* Required indicator at start */}
      {state.required && state.requiredPosition === 'start' && renderRequiredFunction()}

      {/* Label content */}
      <span className="label-text">{children}</span>

      {/* Required indicator at end */}
      {state.required && state.requiredPosition === 'end' && renderRequiredFunction()}
    </label>
  );
};