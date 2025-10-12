/**
 * Combobox hook following Flutter patterns.
 * Provides composable behavior for combobox components.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Combobox option interface
 */
export interface ComboboxOption {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Option value */
  value: any;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Group identifier */
  group?: string;
}

/**
 * Combobox group interface
 */
export interface ComboboxGroup {
  /** Group identifier */
  id: string;
  /** Group heading */
  heading: string;
  /** Options in this group */
  options: ComboboxOption[];
}

/**
 * Props for useCombobox hook
 */
export interface UseComboboxProps extends
  SemanticProps,
  FocusableProps {
  /** Combobox options */
  options?: ComboboxOption[];
  /** Combobox groups */
  groups?: ComboboxGroup[];
  /** Selected value */
  value?: any;
  /** Default selected value */
  defaultValue?: any;
  /** Value change handler */
  onValueChange?: (value: any) => void;
  /** Input value */
  inputValue?: string;
  /** Default input value */
  defaultInputValue?: string;
  /** Input value change handler */
  onInputChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether combobox is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open handler */
  onOpenChange?: (open: boolean) => void;
  /** Whether to close on select */
  closeOnSelect?: boolean;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
  /** Whether to use portal */
  portal?: boolean;
  /** Z-index for dropdown */
  zIndex?: number;
  /** Max height of dropdown */
  maxHeight?: number;
  /** Whether to filter options */
  shouldFilter?: boolean;
  /** Custom filter function */
  filterFunction?: (options: ComboboxOption[], query: string) => ComboboxOption[];
  /** Whether to allow custom values */
  allowCustomValue?: boolean;
  /** Custom value validation */
  validateCustomValue?: (value: string) => boolean;
  /** Whether to show clear button */
  showClearButton?: boolean;
  /** Whether to show search icon */
  showSearchIcon?: boolean;
  /** Whether to show no results message */
  showNoResults?: boolean;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Whether to highlight matches */
  highlightMatches?: boolean;
  /** Custom key bindings */
  keyBindings?: Record<string, () => void>;
  /** Open handler */
  onOpen?: () => void;
  /** Close handler */
  onClose?: () => void;
  /** Select handler */
  onSelect?: (option: ComboboxOption) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Before open handler (can prevent open) */
  onBeforeOpen?: () => boolean | Promise<boolean>;
  /** Before close handler (can prevent close) */
  onBeforeClose?: () => boolean | Promise<boolean>;
  /** After open handler */
  onAfterOpen?: () => void;
  /** After close handler */
  onAfterClose?: () => void;
}

/**
 * Combobox component state
 */
export interface ComboboxState {
  /** Whether combobox is open */
  open: boolean;
  /** Current input value */
  inputValue: string;
  /** Selected value */
  value: any;
  /** Filtered options */
  filteredOptions: ComboboxOption[];
  /** Filtered groups */
  filteredGroups: ComboboxGroup[];
  /** Selected option index */
  selectedIndex: number;
  /** Whether component is disabled */
  disabled: boolean;
  /** Whether component is focused */
  focused: boolean;
  /** Whether component is loading */
  loading: boolean;
  /** Whether component is closing */
  closing: boolean;
  /** Whether component is opening */
  opening: boolean;
}

/**
 * Combobox handlers
 */
export interface ComboboxHandlers {
  /** Handle open combobox */
  handleOpen: () => Promise<void>;
  /** Handle close combobox */
  handleClose: () => Promise<void>;
  /** Handle toggle combobox */
  handleToggle: () => void;
  /** Handle input change */
  handleInputChange: (value: string) => void;
  /** Handle input key down */
  handleInputKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle option select */
  handleSelect: (option: ComboboxOption) => void;
  /** Handle option focus */
  handleOptionFocus: (index: number) => void;
  /** Handle clear */
  handleClear: () => void;
  /** Handle before open */
  handleBeforeOpen: () => boolean | Promise<boolean>;
  /** Handle before close */
  handleBeforeClose: () => boolean | Promise<boolean>;
}

/**
 * Composable combobox hook using Flutter-style mixins
 * @param props - Combobox configuration
 * @returns Combobox state, handlers, and attributes
 */
export function useCombobox(props: UseComboboxProps = {}) {
  const {
    options: propOptions = [],
    groups: propGroups = [],
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    inputValue: controlledInputValue,
    defaultInputValue = '',
    onInputChange,
    placeholder = 'Select an option...',
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    portal = true,
    zIndex = 1000,
    maxHeight = 300,
    shouldFilter = true,
    filterFunction,
    allowCustomValue = false,
    validateCustomValue = () => true,
    showClearButton = true,
    showSearchIcon = true,
    showNoResults = true,
    noResultsMessage = 'No results found.',
    highlightMatches = true,
    keyBindings = {},
    onOpen,
    onClose,
    onSelect,
    onClear,
    onBeforeOpen,
    onBeforeClose,
    onAfterOpen,
    onAfterClose,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    role = 'combobox',
    label,
    labelledBy,
    describedBy,
    disabled = false,
    ...semanticProps
  } = props;

  // State management
  const [open, setOpen] = useState(defaultOpen);
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Determine if component is controlled
  const isControlled = controlledOpen !== undefined;
  const isValueControlled = controlledValue !== undefined;
  const isInputValueControlled = controlledInputValue !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const currentValue = isValueControlled ? controlledValue : defaultValue;
  const currentInputValue = isInputValueControlled ? controlledInputValue : inputValue;

  // Compose mixins for combobox behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  });

  // Combine options from props and groups
  const allOptions = useMemo(() => {
    if (propGroups.length > 0) {
      return propGroups.flatMap(group => group.options);
    }
    return propOptions;
  }, [propOptions, propGroups]);

  // Get selected option
  const selectedOption = useMemo(() => {
    if (currentValue === null || currentValue === undefined) return null;
    return allOptions.find(option => option.value === currentValue) || null;
  }, [currentValue, allOptions]);

  // Update input value when selected option changes
  useEffect(() => {
    if (selectedOption && !isInputValueControlled) {
      setInputValue(selectedOption.label);
    }
  }, [selectedOption, isInputValueControlled]);

  // Filter options based on input value
  const filteredOptions = useMemo(() => {
    if (!shouldFilter || !currentInputValue.trim()) {
      return allOptions;
    }

    if (filterFunction) {
      return filterFunction(allOptions, currentInputValue);
    }

    const query = currentInputValue.toLowerCase().trim();
    return allOptions.filter(option => {
      const searchText = `${option.label} ${option.description || ''}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [allOptions, currentInputValue, shouldFilter, filterFunction]);

  // Filter groups based on input value
  const filteredGroups = useMemo(() => {
    if (propGroups.length === 0) {
      return [];
    }

    if (!shouldFilter || !currentInputValue.trim()) {
      return propGroups;
    }

    return propGroups.map(group => ({
      ...group,
      options: filterFunction
        ? filterFunction(group.options, currentInputValue)
        : group.options.filter(option => {
            const searchText = `${option.label} ${option.description || ''}`.toLowerCase();
            return searchText.includes(currentInputValue.toLowerCase());
          })
    })).filter(group => group.options.length > 0);
  }, [propGroups, currentInputValue, shouldFilter, filterFunction]);

  // Update selected index when filtered options change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredOptions]);

  // Compose combobox state
  const state = useMemo(() => ({
    open: isOpen,
    inputValue: currentInputValue,
    value: currentValue,
    filteredOptions,
    filteredGroups,
    selectedIndex,
    disabled,
    focused: focusableMixin.focused,
    loading: false,
    closing,
    opening
  }), [isOpen, currentInputValue, currentValue, filteredOptions, filteredGroups, selectedIndex, disabled, focusableMixin.focused, closing, opening]);

  // Event handlers
  const handleOpen = useCallback(async () => {
    if (disabled || isOpen) return;

    // Check before open handler
    if (onBeforeOpen) {
      const canOpen = await onBeforeOpen();
      if (!canOpen) return;
    }

    // Store current focus for restoration
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Set opening state
    setOpening(true);

    // Update open state
    if (!isControlled) {
      setOpen(true);
    }

    onOpenChange?.(true);
    onOpen?.();

    // Focus input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);

    // Clear opening state after animation
    setTimeout(() => {
      setOpening(false);
      onAfterOpen?.();
    }, 200);
  }, [disabled, isOpen, onBeforeOpen, isControlled, onOpenChange, onOpen, onAfterOpen]);

  const handleClose = useCallback(async () => {
    if (disabled || !isOpen) return;

    // Check before close handler
    if (onBeforeClose) {
      const canClose = await onBeforeClose();
      if (!canClose) return;
    }

    // Set closing state
    setClosing(true);

    // Update open state
    if (!isControlled) {
      setOpen(false);
    }

    onOpenChange?.(false);
    onClose?.();

    // Restore focus
    if (previousFocusRef.current) {
      setTimeout(() => {
        previousFocusRef.current?.focus();
      }, 50);
    }

    // Clear closing state after animation
    setTimeout(() => {
      setClosing(false);
      onAfterClose?.();
    }, 200);
  }, [disabled, isOpen, onBeforeClose, isControlled, onOpenChange, onClose, onAfterClose]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleClose, handleOpen]);

  const handleInputChange = useCallback((newInputValue: string) => {
    if (isInputValueControlled) {
      onInputChange?.(newInputValue);
    } else {
      setInputValue(newInputValue);
    }

    // Open dropdown if typing and not already open
    if (newInputValue && !isOpen) {
      handleOpen();
    }
  }, [isInputValueControlled, onInputChange, isOpen, handleOpen]);

  const handleSelect = useCallback((option: ComboboxOption) => {
    if (option.disabled) return;

    // Update value
    if (!isValueControlled) {
      // Update selected value (would be handled by parent)
    }
    onValueChange?.(option.value);

    // Update input value
    if (!isInputValueControlled) {
      setInputValue(option.label);
    }
    onInputChange?.(option.label);

    // Call select handler
    onSelect?.(option);

    // Close on select if enabled
    if (closeOnSelect) {
      handleClose();
    }
  }, [isValueControlled, isInputValueControlled, onValueChange, onInputChange, onSelect, closeOnSelect, handleClose]);

  const handleOptionFocus = useCallback((index: number) => {
    const options = propGroups.length > 0 ?
      filteredGroups.flatMap(group => group.options) :
      filteredOptions;

    if (index >= 0 && index < options.length) {
      setSelectedIndex(index);
    }
  }, [filteredOptions, filteredGroups, propGroups.length]);

  const handleClear = useCallback(() => {
    // Clear value
    if (!isValueControlled) {
      // Clear selected value (would be handled by parent)
    }
    onValueChange?.(null);

    // Clear input
    if (!isInputValueControlled) {
      setInputValue('');
    }
    onInputChange?.('');

    // Call clear handler
    onClear?.();

    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isValueControlled, isInputValueControlled, onValueChange, onInputChange, onClear]);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled) return;

    // Handle custom key bindings
    if (keyBindings[event.key]) {
      event.preventDefault();
      keyBindings[event.key]();
      return;
    }

    const options = propGroups.length > 0 ?
      filteredGroups.flatMap(group => group.options) :
      filteredOptions;
    const navigableOptions = options.filter(option => !option.disabled);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          handleOpen();
        } else if (navigableOptions.length > 0) {
          const nextIndex = selectedIndex < navigableOptions.length - 1 ? selectedIndex + 1 : 0;
          handleOptionFocus(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          handleOpen();
        } else if (navigableOptions.length > 0) {
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : navigableOptions.length - 1;
          handleOptionFocus(prevIndex);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (isOpen && selectedIndex >= 0 && selectedIndex < navigableOptions.length) {
          const option = navigableOptions[selectedIndex];
          handleSelect(option);
        } else if (allowCustomValue && currentInputValue.trim()) {
          // Handle custom value
          if (validateCustomValue(currentInputValue)) {
            const customOption: ComboboxOption = {
              id: currentInputValue,
              label: currentInputValue,
              value: currentInputValue
            };
            handleSelect(customOption);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (closeOnEscape) {
          handleClose();
        }
        break;

      case 'Tab':
        // Allow default tab behavior
        if (isOpen) {
          handleClose();
        }
        break;

      case 'Backspace':
        // Handle clear on backspace if input is empty
        if (currentInputValue === '' && showClearButton) {
          handleClear();
        }
        break;

      default:
        // Let typing handle input change
        break;
    }
  }, [focusable, disabled, keyBindings, selectedIndex, filteredOptions, filteredGroups, propGroups.length, isOpen, currentInputValue, allowCustomValue, validateCustomValue, handleOpen, handleOptionFocus, handleSelect, closeOnEscape, handleClose, showClearButton, handleClear]);

  const handleBeforeOpen = useCallback(async () => {
    if (onBeforeOpen) {
      return await onBeforeOpen();
    }
    return true;
  }, [onBeforeOpen]);

  const handleBeforeClose = useCallback(async () => {
    if (onBeforeClose) {
      return await onBeforeClose();
    }
    return true;
  }, [onBeforeClose]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[role="combobox"]') && !target.closest('[data-combobox-trigger]')) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnOutsideClick, handleClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, handleClose]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox',
    'aria-label': label,
    'aria-labelledby': label ? undefined : labelledBy,
    'aria-describedby': describedBy,
    'data-open': isOpen,
    'data-portal': portal,
    'data-z-index': zIndex,
    'data-closing': closing,
    'data-opening': opening,
    tabIndex: 0,
    onKeyDown: handleInputKeyDown,
    role: role
  }), [semantic, isOpen, label, labelledBy, describedBy, portal, zIndex, closing, opening, handleInputKeyDown, role]);

  // Generate input attributes
  const inputAttributes = useMemo(() => ({
    type: 'text',
    placeholder,
    value: currentInputValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value),
    ref: inputRef,
    'aria-label': label || 'Select an option',
    'aria-labelledby': label ? undefined : labelledBy,
    'aria-describedby': describedBy,
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    'aria-controls': isOpen ? 'combobox-list' : undefined,
    'aria-activedescendant': isOpen && selectedIndex >= 0 ? `combobox-option-${selectedIndex}` : undefined,
    'aria-disabled': disabled,
    role: 'combobox',
    autoComplete: 'off',
    spellCheck: false,
    disabled
  }), [placeholder, currentInputValue, handleInputChange, label, labelledBy, describedBy, isOpen, selectedIndex, disabled]);

  // Generate list attributes
  const listAttributes = useMemo(() => ({
    id: 'combobox-list',
    role: 'listbox',
    'aria-label': 'Options',
    'aria-orientation': 'vertical' as const,
    style: {
      maxHeight: `${maxHeight}px`,
      overflowY: 'auto'
    }
  }), [maxHeight]);

  // Generate option attributes
  const getOptionAttributes = useCallback((option: ComboboxOption, index: number) => ({
    id: `combobox-option-${index}`,
    role: 'option',
    'aria-selected': selectedOption?.value === option.value,
    'aria-disabled': option.disabled || false,
    'data-value': option.value,
    'data-disabled': option.disabled,
    onClick: () => !option.disabled && handleSelect(option),
    onMouseEnter: () => handleOptionFocus(index),
    tabIndex: -1
  }), [selectedOption, handleSelect, handleOptionFocus]);

  // Generate clear button attributes
  const clearButtonAttributes = useMemo(() => ({
    type: 'button',
    onClick: handleClear,
    'aria-label': 'Clear selection',
    tabIndex: -1,
    role: 'button'
  }), [handleClear]);

  return {
    state,
    handlers: {
      handleOpen,
      handleClose,
      handleToggle,
      handleInputChange,
      handleInputKeyDown,
      handleSelect,
      handleOptionFocus,
      handleClear,
      handleBeforeOpen,
      handleBeforeClose
    },
    attributes: semanticAttributes,
    inputAttributes,
    listAttributes,
    getOptionAttributes,
    clearButtonAttributes,
    selectedOption
  };
}

// Export types for external use
export type {
  UseComboboxProps,
  ComboboxState,
  ComboboxHandlers,
  ComboboxOption,
  ComboboxGroup
};