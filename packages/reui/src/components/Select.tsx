/**
 * Select renderer component using headless useSelect hook.
 * Provides styled select with keyboard navigation and search.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelect } from '../hooks';
import type { UseSelectProps, SelectOption } from '../hooks';

export interface SelectProps extends UseSelectProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Custom render function */
  render?: (props: SelectRenderProps) => React.ReactElement;
  /** Custom trigger render function */
  renderTrigger?: (props: SelectRenderProps) => React.ReactNode;
  /** Custom option render function */
  renderOption?: (option: SelectOption, props: SelectOptionRenderProps) => React.ReactNode;
  /** Custom listbox render function */
  renderListbox?: (props: SelectRenderProps) => React.ReactNode;
  /** Whether to show chevron icon */
  showChevron?: boolean;
  /** Custom placeholder */
  placeholder?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Variant */
  variant?: 'default' | 'outlined' | 'filled';
}

export interface SelectRenderProps {
  /** Computed class names */
  className: string;
  /** Select state */
  open: boolean;
  focused: boolean;
  pressed: boolean;
  highlightedIndex: number;
  selectedValue: any;
  inputValue: string;
  /** Event handlers */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleTriggerClick: () => void;
  handleInputChange: (value: string) => void;
  openSelect: () => void;
  closeSelect: () => void;
  toggleSelect: () => void;
  selectOption: (value: any) => void;
  clearSelection: () => void;
  highlightOption: (index: number) => void;
  /** Semantic attributes */
  triggerAttributes: Record<string, any>;
  listboxAttributes: Record<string, any>;
  getOptionAttributes: (option: SelectOption, index: number) => Record<string, any>;
  /** References */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  listboxRef: React.RefObject<HTMLUListElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Options */
  options: SelectOption[];
  filteredOptions: SelectOption[];
  selectedOption: SelectOption | undefined;
  /** Size classes */
  sizeClasses: string;
  /** Variant classes */
  variantClasses: string;
}

export interface SelectOptionRenderProps {
  /** Select option */
  option: SelectOption;
  /** Option index */
  index: number;
  /** Whether option is highlighted */
  highlighted: boolean;
  /** Whether option is selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Mouse enter handler */
  onMouseEnter: () => void;
}

/**
 * Styled select component with comprehensive behavior.
 * Uses headless hook for all logic and accessibility.
 */
export const Select = forwardRef<HTMLElement, SelectProps>(({
  className,
  style,
  render,
  renderTrigger,
  renderOption,
  renderListbox,
  showChevron = true,
  placeholder = 'Select an option',
  size = 'md',
  variant = 'default',
  options,
  ...selectProps
}: SelectProps, ref) => {
  const select = useSelect({
    ...selectProps,
    options,
    placeholder
  });

  // Size classes
  const sizeClasses = {
    sm: '  ',
    md: '  ',
    lg: '  '
  }[size];

  // Variant classes
  const variantClasses = {
    default: '       ',
    outlined: '       ',
    filled: '        '
  }[variant];

  // Default option render function
  const defaultOptionRender = (option: SelectOption, props: SelectOptionRenderProps) => {
    const baseClasses = '     ';
    const disabledClasses = option.disabled ? ' ' : '';
    const highlightedClasses = props.highlighted ? ' ' : '';
    const selectedClasses = props.selected ? '  ' : '';

    return (
      <li
        key={option.key}
        className={`${baseClasses} ${disabledClasses} ${highlightedClasses} ${selectedClasses}`}
        {...(!option.disabled ? { onClick: props.onClick } : {})}
        {...(!option.disabled ? { onMouseEnter: props.onMouseEnter } : {})}
        {...select.getOptionAttributes(option, props.index)}
      >
        {/* Icon */}
        {option.icon && (
          <span className="   ">
            {option.icon}
          </span>
        )}

        {/* Content */}
        <div className=" ">
          <div className=" ">{option.label}</div>
          {option.description && (
            <div className="  ">{option.description}</div>
          )}
        </div>

        {/* Selection indicator */}
        {props.selected && (
          <span className=" ">
            <svg className="  " fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </li>
    );
  };

  // Default trigger render function
  const defaultTriggerRender = (props: SelectRenderProps) => {
    return (
      <button
        ref={props.triggerRef}
        className={`      ${sizeClasses} ${variantClasses}    ${className || ''} ${select.disabled ? '  ' : ''}`}
        style={style}
        onClick={props.handleTriggerClick}
        onKeyDown={props.handleKeyDown}
        disabled={select.disabled}
        {...props.triggerAttributes}
      >
        {/* Selected value or placeholder */}
        <span className=" ">
          {props.selectedOption ? props.selectedOption.label : placeholder}
        </span>

        {/* Chevron icon */}
        {showChevron && (
          <span className="   " style={{
            transform: props.open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            <svg className="  " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}

        {/* Clear button */}
        {select.allowClear && props.selectedOption && (
          <button
            type="button"
            className="    "
            onClick={(e: any) => {
              // reason: clearSelection is always provided by useSelect; the prior
              // `...(x ? {...} : {})` defensive spread false-arm was dead code.
              e.stopPropagation();
              props.clearSelection();
            }}
            aria-label="Clear selection"
          >
            <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </button>
    );
  };

  // Default listbox render function
  const defaultListboxRender = (props: SelectRenderProps) => {
    if (!props.open) return null;

    // Calculate dropdown position and size
    const dropdownContent = (
      <div
        className="  "
        style={{
          minWidth: props.triggerRef.current?.offsetWidth || 200,
          maxWidth: 400
        }}
      >
        <ul
          ref={props.listboxRef}
          className={`       ${className || ''}`}
          style={{
            // reason: useSelect defaults maxDropdownHeight to 300, so the prior
            // `|| 300` fallback was unreachable dead code.
            maxHeight: select.maxDropdownHeight,
            ...style
          }}
          {...props.listboxAttributes}
          onKeyDown={props.handleKeyDown}
        >
          {/* Search input */}
          {select.searchable && (
            <li className="   ">
              <input
                ref={props.inputRef}
                type="text"
                className="         "
                placeholder="Search..."
                value={props.inputValue}
                onChange={(e: any) => props.handleInputChange(e.target.value)}
                {...({ onClick: (e: any) => e.stopPropagation() })}
                aria-label="Search options"
              />
            </li>
          )}

          {/* Options */}
          {props.filteredOptions.length > 0 ? (
            props.filteredOptions.map((option, index) => {
              const isSelected = option.value === props.selectedValue;
              const isHighlighted = index === props.highlightedIndex;

              const optionProps: SelectOptionRenderProps = {
                option,
                index,
                highlighted: isHighlighted,
                selected: isSelected,
                onClick: () => props.selectOption(option.value),
                onMouseEnter: () => props.highlightOption(index)
              };

              return renderOption ? renderOption(option, optionProps) : defaultOptionRender(option, optionProps);
            })
          ) : (
            <li className="   ">
              {props.inputValue ? 'No options found' : 'No options available'}
            </li>
          )}
        </ul>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  // Default render function
  const defaultRender = (props: SelectRenderProps) => {
    return (
      <div className=" ">
        {/* Trigger */}
        {renderTrigger ? renderTrigger(props) : defaultTriggerRender(props)}

        {/* Listbox (dropdown) */}
        {renderListbox ? renderListbox(props) : defaultListboxRender(props)}
      </div>
    );
  };

  // Render props
  const renderProps: SelectRenderProps = {
    className: className || '',
    open: select.open,
    focused: select.focused,
    pressed: select.pressed,
    highlightedIndex: select.highlightedIndex,
    selectedValue: select.selectedValue,
    inputValue: select.inputValue,
    handleKeyDown: select.handleKeyDown,
    handleTriggerClick: select.handleTriggerClick,
    handleInputChange: select.handleInputChange,
    openSelect: select.openSelect,
    closeSelect: select.closeSelect,
    toggleSelect: select.toggleSelect,
    selectOption: select.selectOption,
    clearSelection: select.clearSelection,
    highlightOption: select.highlightOption,
    triggerAttributes: select.triggerAttributes,
    listboxAttributes: select.listboxAttributes,
    getOptionAttributes: select.getOptionAttributes,
    triggerRef: select.triggerRef,
    listboxRef: select.listboxRef,
    inputRef: select.inputRef,
    options,
    filteredOptions: select.filteredOptions,
    selectedOption: select.selectedOption,
    sizeClasses,
    variantClasses
  };

  // Use custom render if provided, otherwise use default render
  if (render) {
    return render(renderProps);
  }

  return defaultRender(renderProps);
});

Select.displayName = 'Select';

/**
 * Select group component for grouping related options.
 */
export interface SelectGroupProps {
  /** Group label */
  label: string;
  /** Group options */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SelectGroup = forwardRef<HTMLLIElement, SelectGroupProps>(({
  label,
  children,
  className,
  style
}, ref) => (
  <li
    ref={ref}
    role="group"
    aria-label={label}
    className={className || ''}
    style={style}
  >
    {label && (
      <div className="       ">
        {label}
      </div>
    )}
    <ul role="presentation">
      {children}
    </ul>
  </li>
));

SelectGroup.displayName = 'SelectGroup';

/**
 * Simple select wrapper for common use cases.
 */
export interface SimpleSelectProps {
  /** Select options */
  options: SelectOption[];
  /** Selected value */
  value?: any;
  /** Default selected value */
  defaultValue?: any;
  /** Value change handler (standard selection API) */
  onValueChange?: (value: any) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether select is disabled */
  disabled?: boolean;
  /** Whether select is required */
  required?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
}

export const SimpleSelect = forwardRef<HTMLElement, SimpleSelectProps>(({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className,
  style
}, ref) => (
  <Select
    options={options}
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    placeholder={placeholder}
    disabled={disabled}
    required={required}
    className={className}
    style={style}
    ref={ref}
    closeOnSelection={true}
    closeOnOutsideClick={true}
    searchable={false}
    allowClear={false}
  />
));

SimpleSelect.displayName = 'SimpleSelect';

/**
 * Searchable select wrapper.
 */
export const SearchableSelect = forwardRef<HTMLElement, SelectProps>(({
  className,
  ...props
}, ref) => (
  <Select
    {...props}
    searchable={true}
    allowClear={true}
    className={className}
    ref={ref}
  />
));

SearchableSelect.displayName = 'SearchableSelect';