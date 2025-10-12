/**
 * Chip renderer component using headless useChip hook.
 * Provides styled chip with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useChip, type UseChipProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface ChipProps extends UseChipProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Chip content */
  children?: React.ReactNode;
  /** Custom prefix icon */
  prefix?: React.ReactNode;
  /** Custom suffix icon */
  suffix?: React.ReactNode;
  /** Custom delete icon */
  deleteIcon?: React.ReactNode;
  /** Custom selection icon */
  selectionIcon?: React.ReactNode;
  /** Avatar component */
  avatar?: React.ReactNode;
  /** Whether to truncate long text */
  truncate?: boolean;
  /** Maximum text length before truncation */
  maxLength?: number;
}

/**
 * Chip component with selection and deletion support.
 * Supports avatars, icons, and various style variants.
 */
export const Chip = forwardRef<HTMLDivElement, ChipProps>(({
  className = '',
  style,
  children,
  prefix,
  suffix,
  deleteIcon,
  selectionIcon,
  avatar,
  truncate = false,
  maxLength = 20,
  ...chipProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    chipAttributes,
    getContainerAttributes,
    getDeleteButtonAttributes
  } = useChip(chipProps);

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: 'chip-sm',
      md: 'chip-md',
      lg: 'chip-lg'
    };
    return sizes[state.size];
  };

  // Variant classes
  const getVariantClasses = () => {
    const variants = {
      solid: `chip-solid chip-${state.color}-solid`,
      outline: `chip-outline chip-${state.color}-outline`,
      soft: `chip-soft chip-${state.color}-soft`
    };
    return variants[state.variant];
  };

  // Base chip classes
  const chipClasses = `
    chip
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${state.disabled ? 'chip-disabled' : ''}
    ${state.focused ? 'chip-focused' : ''}
    ${state.hovered ? 'chip-hovered' : ''}
    ${state.pressed ? 'chip-pressed' : ''}
    ${computed.showSelection ? 'chip-selected' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Truncate text if needed
  const displayText = truncate && typeof children === 'string' && children.length > maxLength
    ? `${children.substring(0, maxLength)}...`
    : children;

  // Default delete icon
  const defaultDeleteIcon = (
    <svg
      className="chip-delete-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  // Default selection icon
  const defaultSelectionIcon = (
    <svg
      className="chip-selection-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M19.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L12 15.586l6.293-6.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      ref={ref}
      className={chipClasses}
      style={style}
      {...getContainerAttributes()}
      data-testid="chip"
    >
      {/* Avatar */}
      {avatar && (
        <div className="chip-avatar" data-testid="chip-avatar">
          {avatar}
        </div>
      )}

      {/* Prefix icon */}
      {prefix && !avatar && (
        <div className="chip-prefix" data-testid="chip-prefix">
          {prefix}
        </div>
      )}

      {/* Selection indicator */}
      {computed.showSelection && (
        <div className="chip-selection-indicator" data-testid="chip-selection">
          {selectionIcon || defaultSelectionIcon}
        </div>
      )}

      {/* Chip content */}
      <div className="chip-content" data-testid="chip-content">
        <span className="chip-text">
          {displayText}
        </span>
      </div>

      {/* Suffix icon */}
      {suffix && (
        <div className="chip-suffix" data-testid="chip-suffix">
          {suffix}
        </div>
      )}

      {/* Delete button */}
      {computed.showDelete && (
        <button
          className="chip-delete-button"
          {...getDeleteButtonAttributes()}
          data-testid="chip-delete-button"
        >
          {deleteIcon || defaultDeleteIcon}
        </button>
      )}

      {/* Visual feedback for keyboard navigation */}
      {state.focused && !state.disabled && (
        <div className="chip-focus-ring" />
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite">
        {state.selected && 'Chip selected'}
        {!state.selected && state.selectable && 'Chip not selected'}
        {state.disabled && 'Chip disabled'}
      </div>
    </div>
  );
});

Chip.displayName = 'Chip';

export default Chip;