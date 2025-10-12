/**
 * Command hook following Flutter patterns.
 * Provides composable behavior for command palette/components.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Command item interface
 */
export interface CommandItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Keyboard shortcut */
  shortcut?: string[];
  /** Whether item is disabled */
  disabled?: boolean;
  /** Item value */
  value?: any;
  /** Item group/category */
  group?: string;
  /** Action handler */
  onSelect?: () => void;
}

/**
 * Command group interface
 */
export interface CommandGroup {
  /** Group identifier */
  id: string;
  /** Group heading */
  heading: string;
  /** Items in this group */
  items: CommandItem[];
}

/**
 * Props for useCommand hook
 */
export interface UseCommandProps extends
  SemanticProps,
  FocusableProps {
  /** Command items */
  items?: CommandItem[];
  /** Command groups */
  groups?: CommandGroup[];
  /** Whether command is open */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Open handler */
  onOpenChange?: (open: boolean) => void;
  /** Search query */
  value?: string;
  /** Default search query */
  defaultValue?: string;
  /** Search handler */
  onValueChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to close on select */
  closeOnSelect?: boolean;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether to close on escape */
  closeOnEscape?: boolean;
  /** Whether to use portal */
  portal?: boolean;
  /** Z-index for command */
  zIndex?: number;
  /** Max height of command list */
  maxHeight?: number;
  /** Whether to filter items */
  shouldFilter?: boolean;
  /** Custom filter function */
  filterFunction?: (items: CommandItem[], query: string) => CommandItem[];
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
  onSelect?: (item: CommandItem) => void;
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
 * Command component state
 */
export interface CommandState {
  /** Whether command is open */
  open: boolean;
  /** Current search query */
  value: string;
  /** Filtered items */
  filteredItems: CommandItem[];
  /** Filtered groups */
  filteredGroups: CommandGroup[];
  /** Selected item index */
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
 * Command handlers
 */
export interface CommandHandlers {
  /** Handle open command */
  handleOpen: () => Promise<void>;
  /** Handle close command */
  handleClose: () => Promise<void>;
  /** Handle toggle command */
  handleToggle: () => void;
  /** Handle search input */
  handleSearch: (value: string) => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle item select */
  handleSelect: (item: CommandItem) => void;
  /** Handle item focus */
  handleItemFocus: (index: number) => void;
  /** Handle before open */
  handleBeforeOpen: () => boolean | Promise<boolean>;
  /** Handle before close */
  handleBeforeClose: () => boolean | Promise<boolean>;
}

/**
 * Composable command hook using Flutter-style mixins
 * @param props - Command configuration
 * @returns Command state, handlers, and attributes
 */
export function useCommand(props: UseCommandProps = {}) {
  const {
    items: propItems = [],
    groups: propGroups = [],
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    value: controlledValue,
    defaultValue = '',
    onValueChange,
    placeholder = 'Type a command or search...',
    showSearch = true,
    closeOnSelect = true,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    portal = true,
    zIndex = 1000,
    maxHeight = 300,
    shouldFilter = true,
    filterFunction,
    showNoResults = true,
    noResultsMessage = 'No results found.',
    highlightMatches = true,
    keyBindings = {},
    onOpen,
    onClose,
    onSelect,
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
  const [value, setValue] = useState(defaultValue);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Determine if component is controlled
  const isControlled = controlledOpen !== undefined;
  const isValueControlled = controlledValue !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const searchValue = isValueControlled ? controlledValue : value;

  // Compose mixins for command behavior
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

  // Combine items from props and groups
  const allItems = useMemo(() => {
    if (propGroups.length > 0) {
      return propGroups.flatMap(group => group.items);
    }
    return propItems;
  }, [propItems, propGroups]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!shouldFilter || !searchValue.trim()) {
      return allItems;
    }

    if (filterFunction) {
      return filterFunction(allItems, searchValue);
    }

    const query = searchValue.toLowerCase().trim();
    return allItems.filter(item => {
      const searchText = `${item.label} ${item.description || ''}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [allItems, searchValue, shouldFilter, filterFunction]);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (propGroups.length === 0) {
      return [];
    }

    if (!shouldFilter || !searchValue.trim()) {
      return propGroups;
    }

    return propGroups.map(group => ({
      ...group,
      items: filterFunction
        ? filterFunction(group.items, searchValue)
        : group.items.filter(item => {
            const searchText = `${item.label} ${item.description || ''}`.toLowerCase();
            return searchText.includes(searchValue.toLowerCase());
          })
    })).filter(group => group.items.length > 0);
  }, [propGroups, searchValue, shouldFilter, filterFunction]);

  // Update selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Compose command state
  const state = useMemo(() => ({
    open: isOpen,
    value: searchValue,
    filteredItems,
    filteredGroups,
    selectedIndex,
    disabled,
    focused: focusableMixin.focused,
    loading: false,
    closing,
    opening
  }), [isOpen, searchValue, filteredItems, filteredGroups, selectedIndex, disabled, focusableMixin.focused, closing, opening]);

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

    // Focus search input
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
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

    // Clear search
    if (!isValueControlled) {
      setValue('');
    }

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
  }, [disabled, isOpen, onBeforeClose, isControlled, onOpenChange, onClose, onAfterClose, isValueControlled]);

  const handleToggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, handleClose, handleOpen]);

  const handleSearch = useCallback((newValue: string) => {
    if (isValueControlled) {
      onValueChange?.(newValue);
    } else {
      setValue(newValue);
    }
  }, [isValueControlled, onValueChange]);

  const handleSelect = useCallback((item: CommandItem) => {
    if (item.disabled) return;

    // Call item's onSelect handler
    item.onSelect?.();

    // Call global onSelect handler
    onSelect?.(item);

    // Close on select if enabled
    if (closeOnSelect) {
      handleClose();
    }
  }, [onSelect, closeOnSelect, handleClose]);

  const handleItemFocus = useCallback((index: number) => {
    const items = propGroups.length > 0 ?
      filteredGroups.flatMap(group => group.items) :
      filteredItems;

    if (index >= 0 && index < items.length) {
      setSelectedIndex(index);
    }
  }, [filteredItems, filteredGroups, propGroups.length]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled) return;

    // Handle custom key bindings
    if (keyBindings[event.key]) {
      event.preventDefault();
      keyBindings[event.key]();
      return;
    }

    const items = propGroups.length > 0 ?
      filteredGroups.flatMap(group => group.items) :
      filteredItems;
    const navigableItems = items.filter(item => !item.disabled);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (navigableItems.length > 0) {
          const nextIndex = selectedIndex < navigableItems.length - 1 ? selectedIndex + 1 : 0;
          handleItemFocus(nextIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (navigableItems.length > 0) {
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : navigableItems.length - 1;
          handleItemFocus(prevIndex);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < navigableItems.length) {
          const item = navigableItems[selectedIndex];
          handleSelect(item);
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
        break;

      default:
        // Focus search input for typing
        if (searchInputRef.current && event.target !== searchInputRef.current) {
          searchInputRef.current.focus();
        }
        break;
    }
  }, [focusable, disabled, keyBindings, selectedIndex, filteredItems, filteredGroups, propGroups.length, handleItemFocus, handleSelect, closeOnEscape, handleClose]);

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
      if (!target.closest('[role="combobox"]') && !target.closest('[data-command-trigger]')) {
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
    onKeyDown: handleKeyDown,
    role: role
  }), [semantic, isOpen, label, labelledBy, describedBy, portal, zIndex, closing, opening, handleKeyDown, role]);

  // Generate search input attributes
  const searchInputAttributes = useMemo(() => ({
    type: 'text',
    placeholder,
    value: searchValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value),
    ref: searchInputRef,
    'aria-label': 'Search commands',
    'aria-autocomplete': 'list',
    'aria-controls': isOpen ? 'command-list' : undefined,
    'aria-activedescendant': isOpen && selectedIndex >= 0 ? `command-item-${selectedIndex}` : undefined,
    role: 'searchbox',
    autoComplete: 'off',
    spellCheck: false
  }), [placeholder, searchValue, handleSearch, isOpen, selectedIndex]);

  // Generate command list attributes
  const listAttributes = useMemo(() => ({
    id: 'command-list',
    role: 'listbox',
    'aria-label': 'Command list',
    'aria-orientation': 'vertical' as const,
    style: {
      maxHeight: `${maxHeight}px`,
      overflowY: 'auto'
    }
  }), [maxHeight]);

  // Generate command item attributes
  const getItemAttributes = useCallback((item: CommandItem, index: number) => ({
    id: `command-item-${index}`,
    role: 'option',
    'aria-selected': selectedIndex === index,
    'aria-disabled': item.disabled || false,
    'data-value': item.value || item.label,
    'data-disabled': item.disabled,
    onClick: () => !item.disabled && handleSelect(item),
    onMouseEnter: () => handleItemFocus(index),
    tabIndex: -1
  }), [selectedIndex, handleSelect, handleItemFocus]);

  return {
    state,
    handlers: {
      handleOpen,
      handleClose,
      handleToggle,
      handleSearch,
      handleKeyDown,
      handleSelect,
      handleItemFocus,
      handleBeforeOpen,
      handleBeforeClose
    },
    attributes: semanticAttributes,
    searchInputAttributes,
    listAttributes,
    getItemAttributes
  };
}

// Export types for external use
export type {
  UseCommandProps,
  CommandState,
  CommandHandlers,
  CommandItem,
  CommandGroup
};