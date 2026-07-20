import React from 'react';
import { useAspectRatio, type UseAspectRatioProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface AspectRatioProps extends UseAspectRatioProps {
  /** Content to display within aspect ratio container */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AspectRatio component maintains consistent aspect ratio for content.
 * Prevents layout shift and ensures responsive scaling across different viewports.
 *
 * @param props - Component configuration props
 * @returns Styled aspect ratio container component
 */
export const AspectRatio: React.FC<AspectRatioProps> = ({
  children,
  className,
  ...aspectRatioProps
}) => {
  const { state, actions, containerRef, props } = useAspectRatio(aspectRatioProps);
  const theme = useTheme();

  // Build CSS classes for aspect ratio container
  const containerClasses = [
    // Base aspect ratio styles
    'aspect-ratio-container',

    // State-based classes
    state.disabled && 'aspect-ratio-disabled',
    state.isClient && 'aspect-ratio-mounted',

    // Custom classes
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      {...props}
      style={{
        ...props.style,
        // Theme-aware styling
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
      }}
    >
      {/* Content container with absolute positioning */}
      <div
        className="aspect-ratio-content"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};