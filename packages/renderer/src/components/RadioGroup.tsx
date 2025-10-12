/**
 * RadioGroup renderer component using headless useRadioGroup hook.
 * Provides styled radio group with comprehensive accessibility support and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useRadioGroup, type UseRadioGroupProps } from '@react-ui-forge/core';
import { useTheme } from '../providers/ThemeProvider';

export interface RadioGroupProps extends Omit<UseRadioGroupProps, 'radioGroupRef'> {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Custom option renderer */
  renderOption?: (value: string, index: number, isSelected: boolean, isFocused: boolean) => React.ReactNode;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Option labels mapping (value -> label) */
  optionLabels?: Record<string, string>;
  /** Option descriptions mapping (value -> description) */
  optionDescriptions?: Record<string, string>;
}

/**
 * RadioGroup component with single selection behavior.
 * Supports horizontal/vertical layouts and proper accessibility.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({
  className = '',
  style,
  size = 'md',
  color = 'primary',
  renderOption,
  showLabels = true,
  optionLabels = {},
  optionDescriptions = {},
  ...radioGroupProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    attributes,
    getOptionAttributes
  } = useRadioGroup({
    ...radioGroupProps,
    radioGroupRef: ref as React.RefObject<HTMLDivElement>
  });

  // Size classes
  const sizeClasses = {
    sm: {
      radio: 'w-3 h-3',
      container: 'text-sm',
      spacing: state.orientation === 'horizontal' ? 'space-x-3' : 'space-y-2'
    },
    md: {
      radio: 'w-4 h-4',
      container: 'text-base',
      spacing: state.orientation === 'horizontal' ? 'space-x-4' : 'space-y-3'
    },
    lg: {
      radio: 'w-5 h-5',
      container: 'text-lg',
      spacing: state.orientation === 'horizontal' ? 'space-x-5' : 'space-y-4'
    }
  }[size];

  // Color classes
  const colorClasses = {
    primary: 'border-blue-600 bg-blue-600',
    secondary: 'border-gray-600 bg-gray-600',
    success: 'border-green-600 bg-green-600',
    warning: 'border-yellow-600 bg-yellow-600',
    error: 'border-red-600 bg-red-600'
  }[color];

  // Base classes
  const radioGroupClasses = `
    radio-group
    ${state.orientation === 'horizontal' ? 'flex items-center' : 'flex flex-col'}
    ${sizeClasses.spacing}
    ${state.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Default option renderer
  const defaultRenderOption = (value: string, index: number, isSelected: boolean, isFocused: boolean) => {
    const label = optionLabels[value] || value;
    const description = optionDescriptions[value];
    const optionAttributes = getOptionAttributes(value);

    return (
      <div
        key={value}
        className={`
          radio-option
          ${state.orientation === 'horizontal' ? 'flex items-center' : 'flex items-start'}
          ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2 rounded-md' : ''}
          ${!state.disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
          p-2 rounded-md transition-all duration-150
        `}
        onClick={() => actions.selectOption(value)}
        {...optionAttributes}
        data-testid={`radio-option-${value}`}
      >
        {/* Radio Button */}
        <div className={`
          radio-button
          relative
          ${sizeClasses.radio}
          border-2 rounded-full
          ${isSelected ? colorClasses : 'border-gray-300 bg-white'}
          ${!state.disabled && !isSelected ? 'hover:border-gray-400' : ''}
          transition-colors duration-150
          flex-shrink-0
        `}>
          {/* Inner circle for selected state */}
          {isSelected && (
            <div className="
              absolute inset-1
              bg-white
              rounded-full
              transform scale-50
            " />
          )}
        </div>

        {/* Label and Description */}
        {showLabels && (
          <div className={`
            ${state.orientation === 'horizontal' ? 'ml-2' : 'ml-3'}
            flex-1
          `}>
            <div className={`
              font-medium
              ${isSelected ? 'text-gray-900' : 'text-gray-700'}
              ${state.disabled ? 'text-gray-500' : ''}
            `}>
              {label}
            </div>
            {description && (
              <div className={`
                text-sm
                text-gray-500
                mt-0.5
                ${state.disabled ? 'text-gray-400' : ''}
              `}>
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={radioGroupClasses}
      style={style}
      {...attributes}
      data-testid="radio-group"
    >
      {state.options.map((option, index) => {
        const isSelected = actions.isOptionSelected(option);
        const isFocused = actions.isOptionFocused(option);

        return renderOption
          ? renderOption(option, index, isSelected, isFocused)
          : defaultRenderOption(option, index, isSelected, isFocused);
      })}

      {/* Empty state */}
      {state.options.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <div className={sizeClasses.radio} />
          <p className="text-sm mt-2">No options available</p>
        </div>
      )}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;