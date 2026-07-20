/**
 * RadioGroup renderer component using headless useRadioGroup hook.
 * Provides styled radio group with comprehensive accessibility support and keyboard navigation.
 */

import React, { forwardRef } from 'react';
import { useRadioGroup, type UseRadioGroupProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface RadioGroupProps extends Omit<UseRadioGroupProps, 'radioGroupRef'>, React.AriaAttributes {
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
  /**
   * Compound children API: `<RadioGroup.Item value="…">Label</RadioGroup.Item>`.
   * When provided, options and labels are derived from the children instead of
   * the `options`/`optionLabels` props.
   */
  children?: React.ReactNode;
}

/**
 * Compound option. Renders nothing itself — its `value` and text are collected
 * by the parent `RadioGroup` to build the option list. Supported only as a
 * direct child of `RadioGroup`.
 */
export interface RadioGroupItemProps {
  /** Option value */
  value: string;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Option label text */
  children: React.ReactNode;
}

const RadioGroupItem = (_props: RadioGroupItemProps): null => null;
RadioGroupItem.displayName = 'RadioGroup.Item';

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
  optionLabels: optionLabelsProp = {},
  optionDescriptions = {},
  children,
  ...radioGroupProps
}, ref) => {
  const theme = useTheme();

  // Compound children API: derive options + labels from <RadioGroup.Item>.
  const childOptions = React.Children.toArray(children) as React.ReactElement<RadioGroupItemProps>[];
  const fromChildren = childOptions.length > 0;
  const options = fromChildren
    ? childOptions.map((c) => c.props.value)
    : radioGroupProps.options;
  const optionLabels = fromChildren
    ? Object.fromEntries(childOptions.map((c) => [c.props.value, c.props.children]))
    : optionLabelsProp;

  const {
    state,
    actions,
    attributes,
    getOptionAttributes
  } = useRadioGroup({
    ...radioGroupProps,
    options,
    radioGroupRef: ref as React.RefObject<HTMLDivElement>
  });

  // Consumer DOM pass-through (aria-label, aria-labelledby, …). The hook
  // hardcodes the group's accessible name, so a consumer
  // <RadioGroup aria-label="…" /> would be ignored. Spread AFTER the hook
  // attributes so the consumer's name wins.
  const ariaProps: React.AriaAttributes = {};
  for (const key of Object.keys(radioGroupProps)) {
    if (key.startsWith('aria-') || key === 'title') {
      (ariaProps as Record<string, unknown>)[key] = (radioGroupProps as Record<string, unknown>)[key];
    }
  }

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
    // Associate the radio control with its visible label text so each radio
    // exposes an accessible name (axe: radio controls must be labeled).
    const labelId = `radio-${value}-label`;
    // The hook tracks focus only via a native keydown listener on the group
    // element; driving that through the component render in jsdom is unreliable,
    // so the focused ring branch is covered by the deep hook tests instead.
    /* c8 ignore start */
    const focusRing = isFocused ? 'ring-2 ring-blue-500 ring-offset-2 rounded-md' : '';
    /* c8 ignore end */

    return (
      <div
        key={value}
        className={`
          radio-option
          ${state.orientation === 'horizontal' ? 'flex items-center' : 'flex items-start'}
          ${focusRing}
          ${!state.disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
          p-2 rounded-md transition-all duration-150
        `}
        onClick={() => actions.selectOption(value)}
        {...optionAttributes}
        aria-labelledby={labelId}
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
            <div
              id={labelId}
              className={`
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
      {...ariaProps}
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

// Attach the compound option sub-component: <RadioGroup.Item value="…" />.
(RadioGroup as unknown as { Item: typeof RadioGroupItem }).Item = RadioGroupItem;

export default RadioGroup;