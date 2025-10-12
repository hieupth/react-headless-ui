/**
 * Combobox renderer component.
 * Provides visual representation for combobox components.
 */

import React, { forwardRef, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCombobox } from '@react-ui-forge/core';
import type { UseComboboxProps, ComboboxOption, ComboboxGroup } from '@react-ui-forge/core';

/**
 * Combobox component props
 */
export interface ComboboxProps extends UseComboboxProps {
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Custom option renderer */
  optionRenderer?: (option: ComboboxOption, index: number, attributes: any) => React.ReactNode;
  /** Custom group renderer */
  groupRenderer?: (group: ComboboxGroup) => React.ReactNode;
  /** Custom no results renderer */
  noResultsRenderer?: () => React.ReactNode;
  /** Custom loading renderer */
  loadingRenderer?: () => React.ReactNode;
}

/**
 * Combobox Input component props
 */
export interface ComboboxInputProps {
  /** Input attributes */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Combobox List component props
 */
export interface ComboboxListProps {
  /** List content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Combobox Option component props
 */
export interface ComboboxOptionProps {
  /** Option content */
  children: React.ReactNode;
  /** Option value */
  value: any;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Whether option is selected */
  selected?: boolean;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional description */
  description?: string;
  /** Select handler */
  onSelect?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Combobox Group component props
 */
export interface ComboboxGroupProps {
  /** Group heading */
  heading: string;
  /** Group content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Combobox Empty component props
 */
export interface ComboboxEmptyProps {
  /** Empty message */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Combobox component
 */
export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  ({
    className = '',
    style,
    optionRenderer,
    groupRenderer,
    noResultsRenderer,
    loadingRenderer,
    ...props
  }, ref) => {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const {
      state,
      handlers,
      attributes,
      inputAttributes,
      listAttributes,
      getOptionAttributes,
      clearButtonAttributes,
      selectedOption
    } = useCombobox(props);

    const { open, inputValue, filteredOptions, filteredGroups, selectedIndex } = state;

    // Render combobox option
    const renderOption = (option: ComboboxOption, index: number) => {
      const optionAttributes = getOptionAttributes(option, index);

      if (optionRenderer) {
        return optionRenderer(option, index, optionAttributes);
      }

      return (
        <div
          {...optionAttributes}
          key={option.id || index}
          className={`
            px-3 py-2 text-sm cursor-pointer transition-colors duration-150
            ${selectedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
            ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${selectedOption?.value === option.value ? 'bg-blue-100 text-blue-800 font-medium' : ''}
            ${className}
          `}
          data-testid="combobox-option"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {option.icon && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {option.icon}
                </span>
              )}
              <span>{option.label}</span>
            </div>
            {selectedOption?.value === option.value && (
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {option.description && (
            <p className="text-xs text-gray-500 mt-1 ml-6">
              {option.description}
            </p>
          )}
        </div>
      );
    };

    // Render combobox group
    const renderGroup = (group: ComboboxGroup) => {
      if (groupRenderer) {
        return groupRenderer(group);
      }

      return (
        <div key={group.id} className="combobox-group" data-testid="combobox-group">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
            {group.heading}
          </div>
          <div className="combobox-group-options">
            {group.options.map((option, index) => {
              const globalIndex = filteredGroups
                .slice(0, filteredGroups.indexOf(group))
                .reduce((acc, g) => acc + g.options.length, 0) + index;
              return renderOption(option, globalIndex);
            })}
          </div>
        </div>
      );
    };

    // Render no results message
    const renderNoResults = () => {
      if (!props.showNoResults || filteredOptions.length > 0) return null;

      if (noResultsRenderer) {
        return noResultsRenderer();
      }

      return (
        <div className="p-4 text-center text-gray-500 text-sm" data-testid="combobox-empty">
          {props.noResultsMessage || 'No results found.'}
        </div>
      );
    };

    // Render loading state
    const renderLoading = () => {
      if (!state.loading) return null;

      if (loadingRenderer) {
        return loadingRenderer();
      }

      return (
        <div className="p-4 text-center text-gray-500 text-sm" data-testid="combobox-loading">
          Loading...
        </div>
      );
    };

    // Render clear button
    const renderClearButton = () => {
      if (!props.showClearButton || !inputValue) return null;

      return (
        <button
          {...clearButtonAttributes}
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          data-testid="combobox-clear"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      );
    };

    // Render search icon
    const renderSearchIcon = () => {
      if (!props.showSearchIcon) return null;

      return (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      );
    };

    // Render dropdown content
    const dropdownContent = (
      <div
        {...listAttributes}
        className={`
          absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50
          ${state.opening ? 'animate-pulse' : ''}
          ${state.closing ? 'animate-pulse' : ''}
        `}
        style={{
          ...listAttributes.style,
          zIndex: attributes['data-z-index']
        }}
      >
        {renderLoading()}
        {props.groups && filteredGroups.length > 0 ? (
          filteredGroups.map(renderGroup)
        ) : (
          filteredOptions.map((option, index) => renderOption(option, index))
        )}
        {renderNoResults()}
      </div>
    );

    return (
      <div
        ref={comboboxRef}
        className={`
          relative
          ${className}
        `}
        style={style}
        data-testid="combobox"
      >
        {/* Input Field */}
        <div className="relative">
          {renderSearchIcon()}
          <input
            {...inputAttributes}
            aria-autocomplete="list"
            className={`
              w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${props.showSearchIcon ? 'pl-10' : ''}
              ${props.showClearButton && inputValue ? 'pr-10' : ''}
              ${className}
            `}
          />
          {renderClearButton()}
        </div>

        {/* Dropdown */}
        {open && dropdownContent}
      </div>
    );
  }
);

/**
 * Combobox Input component
 */
export const ComboboxInput: React.FC<ComboboxInputProps> = ({
  inputProps,
  className = '',
  style
}) => {
  return (
    <input
      {...inputProps}
      className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      style={style}
      data-testid="combobox-input"
      role="combobox"
    />
  );
};

/**
 * Combobox List component
 */
export const ComboboxList: React.FC<ComboboxListProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto ${className}`}
      style={style}
      role="listbox"
      data-testid="combobox-list"
    >
      {children}
    </div>
  );
};

/**
 * Combobox Option component
 */
export const ComboboxOption: React.FC<ComboboxOptionProps> = ({
  children,
  value,
  disabled = false,
  selected = false,
  icon,
  description,
  onSelect,
  className = '',
  style
}) => {
  const handleClick = () => {
    if (!disabled) {
      onSelect?.();
    }
  };

  return (
    <div
      className={`
        px-3 py-2 text-sm cursor-pointer transition-colors duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}
        ${selected ? 'bg-blue-100 text-blue-800 font-medium' : ''}
        ${className}
      `}
      style={style}
      onClick={handleClick}
      role="option"
      data-value={value}
      data-disabled={disabled}
      data-selected={selected}
      data-testid="combobox-option"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && (
            <span className="w-4 h-4 flex items-center justify-center">
              {icon}
            </span>
          )}
          <span>{children}</span>
        </div>
        {selected && (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 ml-6">
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * Combobox Group component
 */
export const ComboboxGroup: React.FC<ComboboxGroupProps> = ({
  heading,
  children,
  className = '',
  style
}) => {
  return (
    <div className={`combobox-group ${className}`} style={style} data-testid="combobox-group">
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
        {heading}
      </div>
      <div className="combobox-group-options">
        {children}
      </div>
    </div>
  );
};

/**
 * Combobox Empty component
 */
export const ComboboxEmpty: React.FC<ComboboxEmptyProps> = ({
  children,
  className = '',
  style
}) => {
  return (
    <div
      className={`p-4 text-center text-gray-500 text-sm ${className}`}
      style={style}
      data-testid="combobox-empty"
    >
      {children || 'No results found.'}
    </div>
  );
};

Combobox.displayName = 'Combobox';

export default Combobox;