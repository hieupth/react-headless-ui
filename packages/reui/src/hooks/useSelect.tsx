/**
 * Select headless hook following Flutter patterns.
 * Provides select/dropdown behavior with keyboard navigation and selection.
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';
import { composeState } from '../utils';
import type { FocusableMixinProps, PressableMixinProps, SemanticMixinProps } from '../mixins';

export interface SelectOption {
  /** Option key */
  key: string;
  /** Option label */
  label: string;
  /** Option value */
  value?: any;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Option group */
  group?: string;
  /** Option description */
  description?: string;
  /** Option icon */
  icon?: React.ReactNode;
}

export interface UseSelectProps extends
  FocusableMixinProps,
  PressableMixinProps,
  SemanticMixinProps {
  /** Select options */
  options: SelectOption[];
  /** Selected value */
  value?: any;
  /** Default selected value */
  defaultValue?: any;
  /** Value change handler (standard selection API) */
  onValueChange?: (value: any) => void;
  /**
   * @deprecated Use `onValueChange`. Alias retained for backward compatibility;
   * routed to `onValueChange`.
   */
  onSelectionChange?: (value: any) => void;
  /** Whether select is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether select is disabled */
  disabled?: boolean;
  /** Whether select is required */
  required?: boolean;
  /** Whether to allow clearing selection */
  allowClear?: boolean;
  /** Close on selection */
  closeOnSelection?: boolean;
  /** Close on outside click */
  closeOnOutsideClick?: boolean;
  /** Maximum height of dropdown */
  maxDropdownHeight?: number;
  /** Custom filter function */
  filter?: (options: SelectOption[], inputValue: string) => SelectOption[];
  /** Whether to allow search/filtering */
  searchable?: boolean;
}

export interface UseSelectState {
  /** Current open state */
  open: boolean;
  /** Current focus state */
  focused: boolean;
  /** Current press state */
  pressed: boolean;
  /** Current highlighted index */
  highlightedIndex: number;
  /** Current selected value */
  selectedValue: any;
  /** Current input value for search */
  inputValue: string;
}

export interface UseSelectActions {
  /** Open select */
  openSelect: () => void;
  /** Close select */
  closeSelect: () => void;
  /** Toggle select */
  toggleSelect: () => void;
  /** Highlight option */
  highlightOption: (index: number) => void;
  /** Select option */
  selectOption: (value: any) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Handle keyboard navigation */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle trigger click */
  handleTriggerClick: () => void;
  /** Handle input change for search */
  handleInputChange: (value: string) => void;
  /** Get filtered options */
  getFilteredOptions: () => SelectOption[];
  /** Get selected option */
  getSelectedOption: () => SelectOption | undefined;
  /** Get option at index */
  getOptionAt: (index: number) => SelectOption | undefined;
}

export interface UseSelectReturns extends UseSelectState, UseSelectActions {
  /** Semantic attributes for select trigger */
  triggerAttributes: Record<string, any>;
  /** Semantic attributes for select listbox */
  listboxAttributes: Record<string, any>;
  /** Semantic attributes for options */
  getOptionAttributes: (option: SelectOption, index: number) => Record<string, any>;
  /** Reference to trigger element */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** Reference to listbox element */
  listboxRef: React.RefObject<HTMLUListElement | null>;
  /** Reference to input element */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Computed selected option */
  selectedOption: SelectOption | undefined;
  /** Filtered options */
  filteredOptions: SelectOption[];
  /** Whether the select is disabled (passthrough flag for renderers) */
  disabled: boolean;
  /** Whether the select supports search/filtering (passthrough flag) */
  searchable: boolean;
  /** Whether the selection can be cleared (passthrough flag) */
  allowClear: boolean;
  /** Maximum dropdown height in px (passthrough flag) */
  maxDropdownHeight: number;
}

/**
 * Filter options based on input value
 */
const defaultFilter = (options: SelectOption[], inputValue: string): SelectOption[] => {
  if (!inputValue) return options;

  const searchLower = inputValue.toLowerCase();
  return options.filter(option =>
    option.label.toLowerCase().includes(searchLower) ||
    option.description?.toLowerCase().includes(searchLower)
  );
};

/**
 * Headless select hook providing select behavior.
 * Includes keyboard navigation, search, and accessibility.
 */
export const useSelect = (props: UseSelectProps): UseSelectReturns => {
  const {
    options,
    value: controlledValue,
    defaultValue,
    onValueChange,
    onSelectionChange,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    placeholder = 'Select an option',
    disabled = false,
    required = false,
    allowClear = false,
    closeOnSelection = true,
    closeOnOutsideClick = true,
    maxDropdownHeight = 300,
    filter = defaultFilter,
    searchable = false,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'first',
    pressable = true,
    role = 'listbox',
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  } = props;

  // State management
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalSelectedValue, setInternalSelectedValue] = useState(defaultValue);
  const [inputValue, setInputValue] = useState('');

  // References
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // This hook accepts an additional `'selected'` strategy (highlight the
  // selected option on open) beyond the mixin's focus strategies.
  const selectFocusStrategy = focusStrategy as 'auto' | 'manual' | 'programmatic' | 'first' | 'selected';

  // Focus management
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable,
    focusStrategy: selectFocusStrategy === 'selected' ? 'auto' : selectFocusStrategy
  });

  // Press behavior for select trigger
  const pressableMixin = usePressableMixin({
    pressable
  });

  // Determine if open is controlled or uncontrolled
  const isControlledOpen = controlledOpen !== undefined;
  const open = isControlledOpen ? controlledOpen : internalOpen;

  // Determine if selection is controlled
  const isControlledSelected = controlledValue !== undefined;
  const selectedValue = isControlledSelected ? controlledValue : internalSelectedValue;

  // Standard selection callback. `onValueChange` is the unified API; the legacy
  // `onSelectionChange` is kept as a deprecated alias that routes here.
  const handleChange = useCallback((value: any) => {
    onValueChange?.(value);
    onSelectionChange?.(value);
  }, [onValueChange, onSelectionChange]);

  // Get filtered options
  const getFilteredOptions = useCallback(() => {
    return filter(options, inputValue);
  }, [options, inputValue, filter]);

  // Get selected option
  const getSelectedOption = useCallback(() => {
    // When nothing is selected (selectedValue is undefined), return undefined
    // instead of matching the first option that also lacks an explicit `value`
    // (since `undefined === undefined` would otherwise be true).
    if (selectedValue === undefined) return undefined;
    return options.find(option => option.value === selectedValue);
  }, [options, selectedValue]);

  // Get option at index
  const getOptionAt = useCallback((index: number) => {
    const filtered = getFilteredOptions();
    return filtered[index];
  }, [getFilteredOptions]);

  // Open select
  const openSelect = useCallback(() => {
    if (disabled) return;

    if (isControlledOpen) {
      onOpenChange?.(true);
    } else {
      setInternalOpen(true);
    }

    // Set initial highlight based on strategy
    const filtered = getFilteredOptions();
    if (focusStrategy === 'first') {
      const firstEnabledIndex = filtered.findIndex(option => !option.disabled);
      if (firstEnabledIndex !== -1) {
        setHighlightedIndex(firstEnabledIndex);
      }
    } else if (selectFocusStrategy === 'selected') {
      const selectedIndex = filtered.findIndex(option => option.value === selectedValue);
      if (selectedIndex !== -1) {
        setHighlightedIndex(selectedIndex);
      }
    }

    // Focus input if searchable
    if (searchable && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [disabled, isControlledOpen, onOpenChange, focusStrategy, getFilteredOptions, selectedValue, searchable]);

  // Close select
  const closeSelect = useCallback(() => {
    if (isControlledOpen) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
    setHighlightedIndex(-1);
    setInputValue('');
  }, [isControlledOpen, onOpenChange]);

  // Toggle select
  const toggleSelect = useCallback(() => {
    if (open) {
      closeSelect();
    } else {
      openSelect();
    }
  }, [open, openSelect, closeSelect]);

  // Highlight option
  const highlightOption = useCallback((index: number) => {
    const filtered = getFilteredOptions();
    const option = filtered[index];

    if (option && !option.disabled) {
      setHighlightedIndex(index);
    }
  }, [getFilteredOptions]);

  // Select option
  const selectOption = useCallback((value: any) => {
    const option = options.find(opt => opt.value === value);
    if (!option || option.disabled) return;

    // Update selection
    if (!isControlledSelected) {
      setInternalSelectedValue(value);
    }
    handleChange(value);

    // Clear input
    setInputValue('');

    // Close on selection
    if (closeOnSelection) {
      closeSelect();
    }
  }, [options, isControlledSelected, handleChange, closeOnSelection, closeSelect]);

  // Clear selection
  const clearSelection = useCallback(() => {
    if (!isControlledSelected) {
      setInternalSelectedValue(undefined);
    }
    handleChange(undefined);
    setInputValue('');
  }, [isControlledSelected, handleChange]);

  // Handle input change for search
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setHighlightedIndex(0); // Reset highlight to first filtered option
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    const filtered = getFilteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          openSelect();
        } else {
          let nextIndex = highlightedIndex;
          do {
            nextIndex = (nextIndex + 1) % filtered.length;
          } while (filtered[nextIndex].disabled && nextIndex !== highlightedIndex);
          highlightOption(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          openSelect();
        } else {
          let prevIndex = highlightedIndex;
          do {
            prevIndex = prevIndex <= 0 ? filtered.length - 1 : prevIndex - 1;
          } while (filtered[prevIndex].disabled && prevIndex !== highlightedIndex);
          highlightOption(prevIndex);
        }
        break;

      case 'Home':
        event.preventDefault();
        if (open) {
          const firstEnabledIndex = filtered.findIndex(option => !option.disabled);
          if (firstEnabledIndex !== -1) {
            highlightOption(firstEnabledIndex);
          }
        }
        break;

      case 'End':
        event.preventDefault();
        if (open) {
          let lastEnabledIndex = -1;
          for (let i = filtered.length - 1; i >= 0; i--) {
            if (!filtered[i].disabled) {
              lastEnabledIndex = i;
              break;
            }
          }
          if (lastEnabledIndex !== -1) {
            highlightOption(lastEnabledIndex);
          }
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) {
          openSelect();
        } else if (highlightedIndex >= 0) {
          const option = filtered[highlightedIndex];
          if (option && !option.disabled) {
            selectOption(option.value);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        closeSelect();
        triggerRef.current?.focus();
        break;

      case 'Backspace':
        if (searchable && !inputValue && allowClear && selectedValue !== undefined) {
          clearSelection();
        }
        break;
    }
  }, [disabled, open, highlightedIndex, getFilteredOptions, openSelect, highlightOption, selectOption, closeSelect, inputValue, searchable, allowClear, selectedValue, clearSelection]);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    toggleSelect();
  }, [disabled, toggleSelect]);

  // Handle outside click
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        listboxRef.current && !listboxRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        closeSelect();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeOnOutsideClick, closeSelect]);

  // Sync external selected value with internal state
  useEffect(() => {
    if (isControlledSelected) {
      setInternalSelectedValue(controlledValue);
    }
  }, [isControlledSelected, controlledValue]);

  // Sync external open state with internal state
  useEffect(() => {
    if (isControlledOpen) {
      setInternalOpen(controlledOpen);
    }
  }, [isControlledOpen, controlledOpen]);

  // Reset highlighted index when dropdown closes
  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1);
    }
  }, [open]);

  // Semantic attributes for trigger
  const triggerAttributes = useSemanticMixin({
    'aria-haspopup': 'listbox',
    'aria-expanded': open,
    'aria-controls': open ? `${role}-listbox` : undefined,
    'data-state': open ? 'open' : 'closed',
    'data-disabled': disabled,
    'data-required': required,
    ...semanticProps
  });

  // Semantic attributes for listbox
  const listboxAttributes = useSemanticMixin({
    id: `${role}-listbox`,
    role,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-orientation': 'vertical',
    'data-state': open ? 'open' : 'closed',
    tabIndex: -1
  });

  // Get option attributes
  const getOptionAttributes = useCallback((option: SelectOption, index: number) => {
    const isSelected = option.value === selectedValue;
    const isHighlighted = index === highlightedIndex;

    return {
      role: 'option',
      'aria-selected': isSelected,
      'aria-disabled': option.disabled,
      'data-highlighted': isHighlighted,
      'data-selected': isSelected,
      'data-disabled': option.disabled,
      'data-value': option.value,
      'data-key': option.key,
      'data-group': option.group,
      tabIndex: -1
    };
  }, [selectedValue, highlightedIndex]);

  // Computed state
  const state = useMemo(() => composeState<UseSelectState>({
    open,
    focused: focusableMixin.focused,
    pressed: pressableMixin.pressed,
    highlightedIndex,
    selectedValue,
    inputValue
  }), [open, focusableMixin.focused, pressableMixin.pressed, highlightedIndex, selectedValue, inputValue]);

  // Computed values
  const filteredOptions = useMemo(() => getFilteredOptions(), [getFilteredOptions]);
  const selectedOption = useMemo(() => getSelectedOption(), [getSelectedOption]);

  return useMemo(() => ({
    // State
    ...state,

    // Actions
    openSelect,
    closeSelect,
    toggleSelect,
    highlightOption,
    selectOption,
    clearSelection,
    handleKeyDown,
    handleTriggerClick,
    handleInputChange,
    getFilteredOptions,
    getSelectedOption,
    getOptionAt,

    // Computed properties
    triggerAttributes,
    listboxAttributes,
    getOptionAttributes,
    triggerRef,
    listboxRef,
    inputRef,
    selectedOption,
    filteredOptions,

    // Passthrough flags consumed by the renderer component
    disabled,
    searchable,
    allowClear,
    maxDropdownHeight
  }), [state, openSelect, closeSelect, toggleSelect, highlightOption, selectOption, clearSelection, handleKeyDown, handleTriggerClick, handleInputChange, getFilteredOptions, getSelectedOption, getOptionAt, triggerAttributes, listboxAttributes, getOptionAttributes, triggerRef, listboxRef, inputRef, selectedOption, filteredOptions, disabled, searchable, allowClear, maxDropdownHeight]);
};