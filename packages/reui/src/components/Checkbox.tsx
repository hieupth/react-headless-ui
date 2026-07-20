/**
 * Checkbox component using useCheckbox hook.
 * Provides tri-state checkbox with visual feedback and accessibility.
 */

import React from 'react';
import { useCheckbox, type UseCheckboxProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface CheckboxProps extends UseCheckboxProps {
  /** Checkbox label text */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom checked icon */
  checkedIcon?: React.ReactNode;
  /** Custom unchecked icon */
  uncheckedIcon?: React.ReactNode;
  /** Custom indeterminate icon */
  indeterminateIcon?: React.ReactNode;
}

/**
 * Checkbox component with tri-state support (checked, unchecked, indeterminate).
 * Follows Flutter checkbox patterns with proper accessibility.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  children,
  className = '',
  checkedIcon,
  uncheckedIcon,
  indeterminateIcon,
  ...props
}: CheckboxProps) => {
  const theme = useTheme();
  const {
    checked,
    indeterminate,
    focused,
    disabled,
    required,
    toggle,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleKeyUp,
    semanticAttributes,
    className: hookClassName,
    tabIndex,
    ref,
    inputValue
  } = useCheckbox(props);

  // Default icons using theme extensions
  const defaultCheckedIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const defaultUncheckedIcon = null;
  const defaultIndeterminateIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <rect x="4" y="9" width="12" height="2" />
    </svg>
  );

  const icon = indeterminate
    ? (indeterminateIcon || defaultIndeterminateIcon)
    : checked === true
    ? (checkedIcon || defaultCheckedIcon)
    : (uncheckedIcon || defaultUncheckedIcon);

  // Combine custom classes with hook classes.
  // Theme tokens that are CSS *values* (not class names) go to `style`,
  // never into className — otherwise the hex/pixel string lands in the
  // class attribute where it does nothing (category error).
  const combinedClassName = [
    'checkbox-component',
    hookClassName,
    className,
    theme?.extensions?.spacing?.component?.padding,
    theme?.extensions?.typography?.body?.fontSize
  ].filter(Boolean).join(' ');

  const themeStyle: React.CSSProperties = {
    ...(theme?.extensions?.color?.primary?.background
      ? { backgroundColor: theme.extensions.color.primary.background }
      : null)
  };

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    toggle();
  };

  return (
    <div className={`checkbox-wrapper ${combinedClassName}`} style={themeStyle}>
      <input
        ref={ref}
        type="checkbox"
        className="checkbox-input"
        tabIndex={tabIndex}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        value={inputValue}
        {...semanticAttributes}
      />

      <div
        className={`checkbox-visual
          ${checked === true ? 'checkbox-checked' : ''}
          ${checked === false ? 'checkbox-unchecked' : ''}
          ${indeterminate ? 'checkbox-indeterminate' : ''}
          ${focused ? 'checkbox-focused' : ''}
          ${disabled ? 'checkbox-disabled' : ''}
          ${required ? 'checkbox-required' : ''}
        `}
        onClick={handleClick}
        role="presentation"
      >
        {icon && (
          <span className="checkbox-icon">
            {icon}
          </span>
        )}
      </div>

      {children && (
        <label
          className={`checkbox-label
            ${disabled ? 'checkbox-label-disabled' : ''}
            ${focused ? 'checkbox-label-focused' : ''}
          `}
          onClick={handleClick}
        >
          {children}
          {required && (
            <span className="checkbox-required-indicator" aria-hidden={true}>
              *
            </span>
          )}
        </label>
      )}
    </div>
  );
};

Checkbox.displayName = 'Checkbox';