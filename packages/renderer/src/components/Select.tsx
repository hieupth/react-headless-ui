/**
 * Select renderer component using headless useSelect hook.
 * Provides styled select with keyboard navigation and search.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useSelect } from '@react-ui-forge/core';
import type { UseSelectProps, SelectOption } from '@react-ui-forge/core';

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
  triggerRef: React.RefObject<HTMLElement>;
  listboxRef: React.RefObject<HTMLUListElement>;
  inputRef: React.RefObject<HTMLInputElement>;
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
  ...selectProps
}, ref) => {
  const select = useSelect({
    ...selectProps,
    placeholder,
    // Merge external ref with internal ref
    triggerRef: ref as React.RefObject<HTMLElement>
  });

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }[size];

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
    outlined: 'bg-transparent border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
    filled: 'bg-gray-100 border border-transparent hover:bg-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
  }[variant];

  // Default option render function
  const defaultOptionRender = (option: SelectOption, props: SelectOptionRenderProps) => {
    const baseClasses = 'flex items-center px-3 py-2 cursor-default transition-colors';
    const disabledClasses = option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100';
    const highlightedClasses = props.highlighted ? 'bg-blue-50 text-blue-700' : 'text-gray-700';
    const selectedClasses = props.selected ? 'bg-blue-100 text-blue-800 font-medium' : '';

    return (
      <li
        key={option.key}
        className={`${baseClasses} ${disabledClasses} ${highlightedClasses} ${selectedClasses}`}
        onClick={!option.disabled ? props.onClick : undefined}
        onMouseEnter={!option.disabled ? props.onMouseEnter : undefined}
        {...select.getOptionAttributes(option, props.index)}
      >
        {/* Icon */}
        {option.icon && (
          <span className="mr-3 flex-shrink-0 w-4 h-4">
            {option.icon}
          </span>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="truncate font-medium">{option.label}</div>
          {option.description && (
            <div className="text-sm text-gray-500 truncate">{option.description}</div>
          )}
        </div>

        {/* Selection indicator */}
        {props.selected && (
          <span className="ml-3 flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
        className={`select-trigger w-full text-left flex items-center justify-between ${sizeClasses} ${variantClasses} rounded-md shadow-sm transition-colors ${className || ''} ${select.disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
        style={style}
        onClick={props.handleTriggerClick}
        onKeyDown={props.handleKeyDown}
        disabled={select.disabled}
        {...props.triggerAttributes}
      >
        {/* Selected value or placeholder */}
        <span className="flex-1 truncate">
          {props.selectedOption ? props.selectedOption.label : placeholder}
        </span>

        {/* Chevron icon */}
        {showChevron && (
          <span className="ml-2 flex-shrink-0 transition-transform duration-200" style={{
            transform: props.open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}

        {/* Clear button */}
        {select.allowClear && props.selectedOption && (
          <button
            type="button"
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              props.clearSelection();
            }}
            aria-label="Clear selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        className="fixed z-50 w-full"
        style={{
          minWidth: triggerRef.current?.offsetWidth || 200,
          maxWidth: 400
        }}
      >
        <ul
          ref={props.listboxRef}
          className={`py-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto ${className || ''}`}
          style={{
            maxHeight: select.maxDropdownHeight || 300,
            ...style
          }}
          {...props.listboxAttributes}
          onKeyDown={props.handleKeyDown}
        >
          {/* Search input */}
          {select.searchable && (
            <li className="px-3 py-2 border-b border-gray-100">
              <input
                ref={props.inputRef}
                type="text"
                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search..."
                value={props.inputValue}
                onChange={(e) => props.handleInputChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
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
            <li className="px-3 py-2 text-gray-500 text-center">
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
      <div className="select-container relative">
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
    options: select.options,
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
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
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
  /** Selection change handler */
  onSelectionChange?: (value: any) => void;
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
  onSelectionChange,
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
    onSelectionChange={onSelectionChange}
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