import React from 'react';
import { useSeparator, type UseSeparatorProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface SeparatorProps extends UseSeparatorProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Separator component provides visual separation between content sections.
 * Can be horizontal or vertical, with optional text content.
 *
 * @param props - Component configuration props
 * @returns Styled separator component
 */
export const Separator: React.FC<SeparatorProps> = ({
  children,
  className,
  ...separatorProps
}) => {
  // Forward `children` to the hook so it can compute hasContent (the hook
  // decides whether to render a plain rule or a content separator).
  const { state, props: hookProps } = useSeparator({ ...separatorProps, children });
  // The hook exposes the recommended element tag under `props.as` (Radix-style
  // asChild pattern). Pull it out so it is not spread onto the DOM element, and
  // fall back to an <hr> when unspecified.
  const { as: Element = 'hr', ...props } = hookProps;
  const theme = useTheme();

  // Build CSS classes for separator
  const separatorClasses = [
    'separator',
    `separator-${state.orientation}`,
    state.decorative && 'separator-decorative',
    state.hasContent && 'separator-with-content',
    className
  ].filter(Boolean).join(' ');

  // If separator has content, render as div with styled borders
  if (state.hasContent) {
    return (
      <div
        className={separatorClasses}
        {...props}
        style={{
          ...props.style,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
          width: state.orientation === 'horizontal' ? '100%' : 'auto',
          height: state.orientation === 'vertical' ? '100%' : 'auto',
          margin: state.orientation === 'horizontal'
            ? `${theme.spacing.md} 0`
            : `0 ${theme.spacing.md}`,
        }}
      >
        {/* Left line */}
        <div
          className="separator-line separator-line-left"
          style={{
            flex: 1,
            height: state.orientation === 'horizontal' ? '1px' : 'auto',
            width: state.orientation === 'vertical' ? '1px' : 'auto',
            backgroundColor: theme.colors.border,
          }}
        />

        {/* Content */}
        <span
          className="separator-content"
          style={{
            padding: `0 ${theme.spacing.sm}`,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.mutedForeground,
            whiteSpace: 'nowrap',
          }}
        >
          {children}
        </span>

        {/* Right line */}
        <div
          className="separator-line separator-line-right"
          style={{
            flex: 1,
            height: state.orientation === 'horizontal' ? '1px' : 'auto',
            width: state.orientation === 'vertical' ? '1px' : 'auto',
            backgroundColor: theme.colors.border,
          }}
        />
      </div>
    );
  }

  // Render simple separator without content
  return (
    <Element
      className={separatorClasses}
      {...props}
      style={{
        ...props.style,
        border: 'none',
        backgroundColor: theme.colors.border,
        ...(state.orientation === 'horizontal' && {
          width: '100%',
          height: '1px',
          margin: `${theme.spacing.md} 0`,
        }),
        ...(state.orientation === 'vertical' && {
          width: '1px',
          height: '100%',
          margin: `0 ${theme.spacing.md}`,
        }),
      }}
    />
  );
};