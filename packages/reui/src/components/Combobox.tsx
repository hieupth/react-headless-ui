/**
 * Combobox renderer component.
 * Provides visual representation for combobox components.
 */

import React, { forwardRef, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useCombobox } from '../hooks';
import { useVirtualList } from '../hooks';
import type { UseComboboxProps, ComboboxOption as ComboboxOptionData, ComboboxGroup as ComboboxGroupData } from '../hooks';

/**
 * Default item count above which the Combobox list virtualizes. Below this,
 * every option renders directly (preserving the legacy DOM for small lists).
 */
const DEFAULT_VIRTUALIZE_THRESHOLD = 100;
/** Estimated row height (px) used by the virtualizer when no DOM measurement. */
const VIRTUAL_ROW_HEIGHT = 36;
/** Max dropdown height (px) — bounds the scroll viewport so the virtualizer
 *  has a real window to virtualize against. */
const VIRTUAL_MAX_HEIGHT = 280;

/**
 * Combobox component props
 */
export interface ComboboxProps extends UseComboboxProps {
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Force the loading state (overrides the hook's internal loading state) */
  loading?: boolean;
  /** Custom option renderer */
  optionRenderer?: (option: ComboboxOptionData, index: number, attributes: any) => React.ReactNode;
  /** Custom group renderer */
  groupRenderer?: (group: ComboboxGroupData) => React.ReactNode;
  /** Custom no results renderer */
  noResultsRenderer?: () => React.ReactNode;
  /** Custom loading renderer */
  loadingRenderer?: () => React.ReactNode;
  /** Force virtualization on/off regardless of option count. */
  virtualize?: boolean;
  /** Option count at/below which virtualization engages (default 100). */
  virtualizeThreshold?: number;
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
    virtualize,
    virtualizeThreshold = DEFAULT_VIRTUALIZE_THRESHOLD,
    ...props
  }: ComboboxProps, ref) => {
    const comboboxRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
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

    // Virtualization engages only for the flat (non-grouped) list above the
    // configured threshold. Grouped lists keep their legacy render path so
    // group headings remain interleaved with their options.
    const virtualizeEnabled = useMemo(
      () => (virtualize ?? filteredOptions.length >= virtualizeThreshold) && !props.groups,
      [virtualize, virtualizeThreshold, filteredOptions.length, props.groups]
    );
    const { virtualItems, totalSize, scrollToIndex } = useVirtualList({
      count: filteredOptions.length,
      getScrollElement: () => listRef.current,
      estimateSize: VIRTUAL_ROW_HEIGHT,
      enabled: virtualizeEnabled && open,
    });

    // Keep the active option in view while keyboard-navigating.
    useEffect(() => {
      if (virtualizeEnabled && selectedIndex >= 0) {
        scrollToIndex(selectedIndex);
      }
    }, [virtualizeEnabled, selectedIndex, scrollToIndex]);

    // Mirror the hook defaults so omitted boolean props behave as "on".
    const showNoResults = props.showNoResults !== false;
    const showClearButton = props.showClearButton !== false;
    const showSearchIcon = props.showSearchIcon !== false;
    const showLoading = props.loading !== undefined ? props.loading : state.loading;

    // Render combobox option. `overrideStyle` carries virtualizer positioning
    // (absolute placement) so the same renderer serves both render paths.
    const renderOption = (
      option: ComboboxOptionData,
      index: number,
      overrideAttributes?: { style?: React.CSSProperties }
    ) => {
      const optionAttributes = getOptionAttributes(option, index);

      if (optionRenderer) {
        return optionRenderer(option, index, optionAttributes);
      }

      return (
        <div
          {...optionAttributes}
          key={option.id || index}
          className={`
                 
            ${selectedIndex === index ? ' ' : ' '}
            ${option.disabled ? ' ' : ''}
            ${selectedOption?.value === option.value ? '  ' : ''}
            ${className}
          `}
          style={overrideAttributes?.style}
          data-testid="combobox-option"
        >
          <div className="  ">
            <div className="  ">
              {option.icon && (
                <span className="    ">
                  {option.icon}
                </span>
              )}
              <span>{option.label}</span>
            </div>
            {selectedOption?.value === option.value && (
              <svg className="  " fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {option.description && (
            <p className="   ">
              {option.description}
            </p>
          )}
        </div>
      );
    };

    // Render combobox group
    const renderGroup = (group: ComboboxGroupData) => {
      if (groupRenderer) {
        return groupRenderer(group);
      }

      return (
        <div key={group.id} className="combobox-group" data-testid="combobox-group">
          <div className="       ">
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
      if (!showNoResults || filteredOptions.length > 0) return null;

      if (noResultsRenderer) {
        return noResultsRenderer();
      }

      return (
        <div className="   " data-testid="combobox-empty">
          {props.noResultsMessage || 'No results found.'}
        </div>
      );
    };

    // Render loading state
    const renderLoading = () => {
      if (!showLoading) return null;

      if (loadingRenderer) {
        return loadingRenderer();
      }

      return (
        <div className="   " data-testid="combobox-loading">
          Loading...
        </div>
      );
    };

    // Render clear button
    const renderClearButton = () => {
      if (!showClearButton || !inputValue) return null;

      return (
        <button
          {...clearButtonAttributes}
          type="button"
          className="   transform -translate-y-1/2     "
          data-testid="combobox-clear"
        >
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      );
    };

    // Render search icon
    const renderSearchIcon = () => {
      if (!showSearchIcon) return null;

      return (
        <div className="   transform -translate-y-1/2 ">
          <svg className=" " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      );
    };

    // Render the option list. When virtualized, only the visible window of
    // options is mounted inside a sized spacer so the scroll viewport has a
    // real total height to virtualize against.
    const renderOptionList = () => {
      if (props.groups && filteredGroups.length > 0) {
        return filteredGroups.map(renderGroup);
      }
      if (!virtualizeEnabled) {
        return filteredOptions.map((option, index) => renderOption(option, index));
      }
      return (
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((vi) => renderOption(filteredOptions[vi.index], vi.index, {
            style: { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${vi.start}px)` },
          }))}
        </div>
      );
    };

    // Render dropdown content
    const dropdownContent = (
      <div
        ref={listRef}
        {...listAttributes}
        className={`
                   
          
          ${state.opening ? '' : ''}
          ${state.closing ? '' : ''}
        `}
        style={{
          ...listAttributes.style,
          maxHeight: virtualizeEnabled ? VIRTUAL_MAX_HEIGHT : undefined,
          zIndex: props.zIndex ?? 1000
        }}
      >
        {renderLoading()}
        {renderOptionList()}
        {renderNoResults()}
      </div>
    );

    return (
      <div
        ref={comboboxRef}
        className={`
          
          ${className}
        `}
        style={style}
        data-testid="combobox"
      >
        {/* Input Field */}
        <div className="">
          {renderSearchIcon()}
          <input
            {...inputAttributes}
            onKeyDown={handlers.handleInputKeyDown}
            {...(props.id ? { id: props.id } : {})}
            {...(props['data-testid'] ? { 'data-testid': props['data-testid'] } : {})}
            aria-autocomplete="list"
            className={`
                        
              ${showSearchIcon ? '' : ''}
              ${showClearButton && inputValue ? '' : ''}
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
      className={`           ${className}`}
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
      className={`           ${className}`}
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
             
        ${disabled ? ' ' : ' '}
        ${selected ? '  ' : ''}
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
      <div className="  ">
        <div className="  ">
          {icon && (
            <span className="    ">
              {icon}
            </span>
          )}
          <span>{children}</span>
        </div>
        {selected && (
          <svg className="  " fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {description && (
        <p className="   ">
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
      <div className="       ">
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
      className={`    ${className}`}
      style={style}
      data-testid="combobox-empty"
    >
      {children || 'No results found.'}
    </div>
  );
};

Combobox.displayName = 'Combobox';

export default Combobox;