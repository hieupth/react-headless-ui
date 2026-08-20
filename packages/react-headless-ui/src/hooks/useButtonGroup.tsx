"use client";
/**
 * Button group headless hook following Flutter grouping patterns.
 * Provides button grouping behavior with proper accessibility.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useSemanticMixin } from '../mixins/index.js';
import { composeState } from '../utils/index.js';
import type { SemanticMixinProps } from '../mixins/index.js';

export interface UseButtonGroupProps extends
  SemanticMixinProps {
  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical';
  /** Whether buttons are attached to each other */
  attached?: boolean;
  /** Whether only one button can be selected at a time */
  exclusive?: boolean;
  /** Currently selected button index (for exclusive mode) */
  selectedIndex?: number | null;
  /** Default selected button index (for uncontrolled exclusive mode) */
  defaultSelectedIndex?: number | null;
  /** Called when selection changes (for exclusive mode) */
  onSelectionChange?: (index: number | null) => void;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Size of all buttons in the group */
  size?: 'sm' | 'md' | 'lg';
  /** Variant of all buttons in the group */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface UseButtonGroupState {
  /** Currently selected button index */
  selectedIndex: number | null;
  /** Number of buttons in the group */
  buttonCount: number;
  /** Whether the group is disabled */
  disabled: boolean;
  /** Orientation of the group */
  orientation: 'horizontal' | 'vertical';
}

export interface UseButtonGroupActions {
  /** Select a button by index */
  selectButton: (index: number) => void;
  /** Deselect all buttons */
  deselectAll: () => void;
  /** Check if a button is selected */
  isSelected: (index: number) => boolean;
  /** Set disabled state */
  setDisabled: (disabled: boolean) => void;
}

export interface UseButtonGroupReturns {
  /** Component state */
  state: UseButtonGroupState;
  /** Component actions */
  actions: UseButtonGroupActions;
  /** Semantic attributes for the button group */
  semanticAttributes: React.HTMLAttributes<HTMLElement>;
  /** Props for the button group container */
  groupProps: React.HTMLAttributes<HTMLElement>;
  /** Props generator for individual buttons */
  getButtonProps: (index: number, additionalProps?: React.ButtonHTMLAttributes<HTMLButtonElement>) => React.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Ref for the button group container */
  groupRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Headless button group hook providing grouping behavior.
 * Supports both exclusive (radio-like) and inclusive (checkbox-like) selection.
 */
export const useButtonGroup = (props: UseButtonGroupProps & {
  totalItems: number;
}) => {
  const {
    totalItems,
    orientation = 'horizontal',
    attached = false,
    exclusive = false,
    selectedIndex: controlledSelectedIndex,
    defaultSelectedIndex = null,
    onSelectionChange,
    disabled = false,
    size = 'md',
    variant = 'primary',
    ...semanticProps
  } = props;

  // Internal state for uncontrolled mode
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number | null>(
    defaultSelectedIndex
  );
  // disabled prop is the initial value; setDisabled mutates this internal
  // state (previously a no-op stub).
  const [disabledState, setDisabledState] = useState<boolean>(disabled);
  const currentDisabled = disabledState;

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledSelectedIndex !== undefined;
  const selectedIndex = isControlled ? controlledSelectedIndex : internalSelectedIndex;

  // Refs
  const groupRef = useRef<HTMLDivElement>(null);

  // Semantic attributes
  const semantic = useSemanticMixin({
    role: exclusive ? 'radiogroup' : 'group',
    ...semanticProps
  });

  // Handle selection change
  const handleSelectionChange = useCallback((newIndex: number | null) => {
    if (exclusive) {
      // For exclusive mode, only one button can be selected
      if (newIndex === selectedIndex) {
        // Deselect if clicking the same button
        newIndex = null;
      }
    }

    if (!isControlled) {
      setInternalSelectedIndex(newIndex);
    }

    onSelectionChange?.(newIndex);
  }, [exclusive, selectedIndex, isControlled, onSelectionChange]);

  // Select a button
  const selectButton = useCallback((index: number) => {
    if (currentDisabled || index < 0 || index >= totalItems) return;

    handleSelectionChange(index);
  }, [currentDisabled, totalItems, handleSelectionChange]);

  // Deselect all buttons
  const deselectAll = useCallback(() => {
    if (currentDisabled) return;
    // No-op (and no notification) when nothing is selected: keeps the action
    // idempotent instead of emitting a redundant null change.
    if (selectedIndex === null) return;

    handleSelectionChange(null);
  }, [currentDisabled, selectedIndex, handleSelectionChange]);

  // Check if a button is selected
  const isSelected = useCallback((index: number) => {
    if (exclusive) {
      return selectedIndex === index;
    }
    // For non-exclusive mode, this would need to be implemented differently
    return false;
  }, [exclusive, selectedIndex]);

  // Set disabled state
  const setDisabled = useCallback((newDisabled: boolean) => {
    setDisabledState(newDisabled);
  }, []);

  // Group props
  const groupProps = useMemo<React.HTMLAttributes<HTMLElement>>(() => ({
    role: exclusive ? 'radiogroup' : 'group',
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
    'data-orientation': orientation,
    'data-attached': attached,
    'data-disabled': currentDisabled,
    'data-size': size,
    'data-variant': variant,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (currentDisabled) return;

      // Handle keyboard navigation
      let targetIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          if (orientation === 'horizontal' && event.key === 'ArrowRight') {
            targetIndex = selectedIndex !== null ? (selectedIndex + 1) % totalItems : 0;
          } else if (orientation === 'vertical' && event.key === 'ArrowDown') {
            targetIndex = selectedIndex !== null ? (selectedIndex + 1) % totalItems : 0;
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (orientation === 'horizontal' && event.key === 'ArrowLeft') {
            targetIndex = selectedIndex !== null ? (selectedIndex - 1 + totalItems) % totalItems : totalItems - 1;
          } else if (orientation === 'vertical' && event.key === 'ArrowUp') {
            targetIndex = selectedIndex !== null ? (selectedIndex - 1 + totalItems) % totalItems : totalItems - 1;
          }
          break;
        case 'Home':
          targetIndex = 0;
          break;
        case 'End':
          targetIndex = totalItems - 1;
          break;
        case ' ':
        case 'Enter':
          if (exclusive && selectedIndex !== null) {
            handleSelectionChange(selectedIndex);
          }
          event.preventDefault();
          return;
      }

      if (targetIndex !== null) {
        event.preventDefault();
        selectButton(targetIndex);
      }
    }
  }), [orientation, attached, currentDisabled, size, variant, totalItems, selectedIndex, selectButton, handleSelectionChange]);

  // Button props generator
  const getButtonProps = useCallback((index: number, additionalProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {}) => {
    const isSelected = exclusive ? selectedIndex === index : false;

    // Spread additionalProps FIRST so that consumer-supplied onClick/onKeyDown
    // values are composed (invoked from the handlers below) rather than
    // overwriting the group's selection behavior.
    const { onClick: additionalOnClick, onKeyDown: additionalOnKeyDown, ...restAdditional } = additionalProps;

    return {
      ...restAdditional,
      type: 'button' as const,
      role: exclusive ? 'radio' : 'button',
      'aria-checked': exclusive ? isSelected : undefined,
      'aria-pressed': exclusive ? undefined : isSelected,
      'aria-selected': exclusive ? isSelected : undefined,
      'data-selected': isSelected,
      'data-index': index,
      'data-orientation': orientation,
      'data-attached': attached,
      'data-size': size,
      'data-variant': variant,
      'data-position': index === 0 ? 'first' : index === totalItems - 1 ? 'last' : 'middle',
      disabled: currentDisabled || additionalProps.disabled,
      tabIndex: isSelected ? 0 : -1,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        if (currentDisabled) return;

        selectButton(index);
        additionalOnClick?.(event);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (currentDisabled) return;

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectButton(index);
        }
        additionalOnKeyDown?.(event);
      }
    };
  }, [exclusive, selectedIndex, orientation, attached, size, variant, currentDisabled, totalItems, selectButton]);

  // Composed state
  const state = useMemo(() => composeState<UseButtonGroupState>({
    selectedIndex,
    buttonCount: totalItems,
    disabled: currentDisabled,
    orientation
  }), [selectedIndex, totalItems, currentDisabled, orientation]);

  // Composed actions
  const actions = useMemo(() => ({
    selectButton,
    deselectAll,
    isSelected,
    setDisabled
  }), [selectButton, deselectAll, isSelected, setDisabled]);

  // Semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    role: exclusive ? 'radiogroup' : 'group',
    'aria-label': semantic['aria-label'] || `${exclusive ? 'Button group' : 'Button group'} with ${totalItems} items`,
  }), [semantic, exclusive, totalItems]);

  return useMemo(() => ({
    state,
    actions,
    semanticAttributes,
    groupProps,
    getButtonProps,
    groupRef
  }), [state, actions, semanticAttributes, groupProps, getButtonProps, groupRef]);
};