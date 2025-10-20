/**
 * Toggle component using useToggle hook.
 * Provides two-state button behavior with visual feedback.
 */

import React from 'react';
import { useToggle, type UseToggleProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface ToggleProps extends UseToggleProps {
  /** Toggle content when pressed */
  pressedChildren?: React.ReactNode;
  /** Toggle content when not pressed */
  unpressedChildren?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Toggle variant */
  variant?: 'default' | 'outline' | 'ghost';
  /** Toggle size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom pressed icon */
  pressedIcon?: React.ReactNode;
  /** Custom unpressed icon */
  unpressedIcon?: React.ReactNode;
}

/**
 * Toggle component with two-state button behavior.
 * Follows Flutter toggle patterns with proper accessibility.
 */
export const Toggle: React.FC<ToggleProps> = ({
  children,
  pressedChildren,
  unpressedChildren,
  className = '',
  variant = 'default',
  size = 'md',
  pressedIcon,
  unpressedIcon,
  ...props
}) => {
  const theme = useTheme();
  const {
    state,
    actions,
    props: toggleProps
  } = useToggle(props);

  // Determine content to show based on pressed state
  const displayContent = state.pressed
    ? (pressedChildren || children)
    : (unpressedChildren || children);

  // Determine icon to show based on pressed state
  const displayIcon = state.pressed
    ? pressedIcon
    : unpressedIcon;

  // Combine custom classes with theme classes
  const toggleClassName = [
    'toggle',
    `toggle-${variant}`,
    `toggle-${size}`,
    state.pressed ? 'toggle-pressed' : 'toggle-unpressed',
    state.disabled ? 'toggle-disabled' : '',
    className,
    theme?.extensions?.spacing?.component?.padding,
    theme?.extensions?.typography?.body?.fontSize
  ].filter(Boolean).join(' ');

  return (
    <button
      {...toggleProps}
      className={toggleClassName}
      type="button"
      disabled={state.disabled}
    >
      {displayIcon && (
        <span className="toggle-icon" aria-hidden={true}>
          {displayIcon}
        </span>
      )}
      {displayContent && (
        <span className="toggle-content">
          {displayContent}
        </span>
      )}
    </button>
  );
};

// Icon-only toggle variant
export const ToggleIcon: React.FC<ToggleProps> = ({
  pressedIcon,
  unpressedIcon,
  size = 'md',
  ...props
}) => {
  if (!pressedIcon || !unpressedIcon) {
    console.warn('ToggleIcon requires both pressedIcon and unpressedIcon props');
    return null;
  }

  return (
    <Toggle
      {...props}
      pressedIcon={pressedIcon}
      unpressedIcon={unpressedIcon}
      size={size}
      className="toggle-icon-only"
    />
  );
};

// Text formatting toggle variants
export const FormatToggle: React.FC<ToggleProps & {
  format: 'bold' | 'italic' | 'underline' | 'strikethrough';
}> = ({ format, ...props }) => {
  const formatIcons = {
    bold: {
      pressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 4v12h4.5c2.485 0 4.5-1.79 4.5-4s-2.015-4-4.5-4H9V4h3zm1.5 7H9v3h1.5c1.38 0 2.5-1.12 2.5-2.5S8.88 9 7.5 9z" clipRule="evenodd" />
        </svg>
      ),
      unpressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 4v12h4.5c2.485 0 4.5-1.79 4.5-4s-2.015-4-4.5-4H9V4h3zm1.5 7H9v3h1.5c1.38 0 2.5-1.12 2.5-2.5S8.88 9 7.5 9z" />
        </svg>
      )
    },
    italic: {
      pressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4v3h2.5l-2 10H5v3h10v-3h-2.5l2-10H15V4H8z" clipRule="evenodd" />
        </svg>
      ),
      unpressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 4v3h2.5l-2 10H5v3h10v-3h-2.5l2-10H15V4H8z" />
        </svg>
      )
    },
    underline: {
      pressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 3v7c0 2.21 1.79 4 4 4s4-1.79 4-4V3h-3v7c0 .55-.45 1-1 1s-1-.45-1-1V3H6zm-2 14v2h12v-2H4z" clipRule="evenodd" />
        </svg>
      ),
      unpressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 3v7c0 2.21 1.79 4 4 4s4-1.79 4-4V3h-3v7c0 .55-.45 1-1 1s-1-.45-1-1V3H6zm-2 14v2h12v-2H4z" />
        </svg>
      )
    },
    strikethrough: {
      pressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 9h12v2H4V9zm2-2v2h8V7h2v4h2V7c0-1.1-.9-2-2-2h-3c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2zm2 8v2h6v-2h2v4H6v-4h2z" clipRule="evenodd" />
        </svg>
      ),
      unpressed: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 9h12v2H4V9zm2-2v2h8V7h2v4h2V7c0-1.1-.9-2-2-2h-3c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2zm2 8v2h6v-2h2v4H6v-4h2z" />
        </svg>
      )
    }
  };

  return (
    <Toggle
      {...props}
      pressedIcon={formatIcons[format].pressed}
      unpressedIcon={formatIcons[format].unpressed}
      className="toggle-format"
    />
  );
};

// View mode toggle variant
export const ViewModeToggle: React.FC<ToggleProps & {
  modes: {
    on: { icon: React.ReactNode; label: string };
    off: { icon: React.ReactNode; label: string };
  };
}> = ({ modes, ...props }) => {
  return (
    <Toggle
      {...props}
      pressedIcon={modes.on.icon}
      unpressedIcon={modes.off.icon}
      pressedChildren={modes.on.label}
      unpressedChildren={modes.off.label}
      className="toggle-view-mode"
    />
  );
};

Toggle.displayName = 'Toggle';
ToggleIcon.displayName = 'ToggleIcon';
FormatToggle.displayName = 'FormatToggle';
ViewModeToggle.displayName = 'ViewModeToggle';