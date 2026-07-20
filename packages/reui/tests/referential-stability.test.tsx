/**
 * Referential-stability tests: prove that memoized hooks return the SAME
 * object reference across re-renders with unchanged props, while still
 * updating correctly when props/actions change (no stale state).
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';
import { useButton } from '../src/hooks/useButton';
import { useAccordion } from '../src/hooks/useAccordion';
import { useCheckbox } from '../src/hooks/useCheckbox';
import { useCard } from '../src/hooks/useCard';
import { useField } from '../src/hooks/useField';
import { useAlert } from '../src/hooks/useAlert';
import { useSelect } from '../src/hooks/useSelect';
import { useCombobox } from '../src/hooks/useCombobox';
import { useSlider } from '../src/hooks/useSlider';
import { useTooltip } from '../src/hooks/useTooltip';
import { useDropdownMenu } from '../src/hooks/useDropdownMenu';
import { usePagination } from '../src/hooks/usePagination';
import type { SelectOption } from '../src/hooks/useSelect';
import type { ComboboxOption } from '../src/hooks/useCombobox';
import type { DropdownMenuItem } from '../src/hooks/useDropdownMenu';

// Helper: render a hook with props, return the latest result + a rerender helper.
function setupHook<T, P>(hook: (props: P) => T, initialProps: P) {
  const utils = renderHook(hook, { initialProps });
  return utils;
}

describe('referential stability of memoized hooks', () => {
  it('useButton: stable across re-renders with same props', () => {
    const utils = setupHook(useButton, { label: 'Save' });
    const first = utils.result.current;
    utils.rerender({ label: 'Save' });
    expect(utils.result.current).toBe(first);
  });

  it('useButton: updates (new ref) when a prop changes — not stale', () => {
    const utils = setupHook(useButton, { label: 'Save' });
    const first = utils.result.current;
    utils.rerender({ label: 'Cancel' });
    // New reference because semanticAttributes (which carries label) changed.
    expect(utils.result.current).not.toBe(first);
    expect(utils.result.current.semanticAttributes['aria-label']).toBe('Cancel');
  });

  it('useAccordion: stable across re-renders with same props', () => {
    const items = [{ id: 'a', title: 'A', content: 'aa' }];
    const utils = setupHook(useAccordion, {
      items,
      defaultOpenItems: ['a']
    });
    const first = utils.result.current;
    utils.rerender({ items, defaultOpenItems: ['a'] });
    expect(utils.result.current).toBe(first);
  });

  it('useAccordion: opening an item updates state — not stale', () => {
    const items = [{ id: 'a', title: 'A', content: 'aa' }];
    const utils = setupHook(useAccordion, { items, defaultOpenItems: [] });
    const before = utils.result.current.openItems;
    expect(before).toEqual([]);
    act(() => {
      utils.result.current.openItem('a');
    });
    // After the action, the hook re-rendered with updated openItems.
    expect(utils.result.current.openItems).toContain('a');
  });

  it('useCheckbox: stable across re-renders with same props', () => {
    const utils = setupHook(useCheckbox, { checked: false });
    const first = utils.result.current;
    utils.rerender({ checked: false });
    expect(utils.result.current).toBe(first);
  });

  it('useCheckbox: reflects changed checked prop — not stale', () => {
    const utils = setupHook(useCheckbox, { checked: false });
    expect(utils.result.current.checked).toBe(false);
    utils.rerender({ checked: true });
    expect(utils.result.current.checked).toBe(true);
    expect(utils.result.current.semanticAttributes['aria-checked']).toBe('true');
  });

  it('useCard: stable across re-renders with same props', () => {
    const utils = setupHook(useCard, { interactive: true });
    const first = utils.result.current;
    utils.rerender({ interactive: true });
    expect(utils.result.current).toBe(first);
  });

  it('useCard: changing a prop yields a new ref — not stale', () => {
    const utils = setupHook(useCard, { interactive: true });
    const first = utils.result.current;
    utils.rerender({ interactive: false });
    expect(utils.result.current).not.toBe(first);
  });

  it('useField: stable across re-renders with same props (nested handlers memoized)', () => {
    const utils = setupHook(useField, { label: 'Email', value: '' });
    const first = utils.result.current;
    utils.rerender({ label: 'Email', value: '' });
    // Top-level return, including the nested `handlers` object, must be stable.
    expect(utils.result.current).toBe(first);
    expect(utils.result.current.handlers).toBe(first.handlers);
  });

  it('useField: reflects changed value prop — not stale', () => {
    const utils = setupHook(useField, { label: 'Email', value: '' });
    const first = utils.result.current;
    utils.rerender({ label: 'Email', value: 'a@b.com' });
    expect(utils.result.current).not.toBe(first);
    expect(utils.result.current.attributes.value).toBe('a@b.com');
  });

  it('useAlert: stable across re-renders with same props', () => {
    const utils = setupHook(useAlert, { open: true });
    const first = utils.result.current;
    utils.rerender({ open: true });
    expect(utils.result.current).toBe(first);
  });

  it('useAlert: reflects changed open prop — not stale', () => {
    const utils = setupHook(useAlert, { open: true });
    const first = utils.result.current;
    utils.rerender({ open: false });
    expect(utils.result.current).not.toBe(first);
    expect(utils.result.current.open).toBe(false);
  });

  // ---- n–z hooks ----

  it('useSelect: stable across re-renders with same props', () => {
    const options: SelectOption[] = [
      { key: 'a', label: 'Apple', value: 'apple' },
      { key: 'b', label: 'Banana', value: 'banana' },
    ];
    const utils = setupHook(useSelect, { options });
    const first = utils.result.current;
    utils.rerender({ options });
    expect(utils.result.current).toBe(first);
  });

  it('useSelect: selecting an option updates state — not stale', () => {
    const options: SelectOption[] = [
      { key: 'a', label: 'Apple', value: 'apple' },
      { key: 'b', label: 'Banana', value: 'banana' },
    ];
    const utils = setupHook(useSelect, { options });
    expect(utils.result.current.selectedOption).toBeUndefined();
    act(() => {
      utils.result.current.selectOption('banana');
    });
    expect(utils.result.current.selectedOption?.value).toBe('banana');
  });

  it('useCombobox: stable across re-renders with same props', () => {
    const options: ComboboxOption[] = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    const utils = setupHook(useCombobox, { options });
    const first = utils.result.current;
    utils.rerender({ options });
    expect(utils.result.current).toBe(first);
  });

  it('useCombobox: reflects changed value prop — not stale', () => {
    const options: ComboboxOption[] = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];
    const utils = setupHook(useCombobox, { options, value: 'apple' });
    const first = utils.result.current;
    expect(utils.result.current.selectedOption?.value).toBe('apple');
    utils.rerender({ options, value: 'banana' });
    expect(utils.result.current).not.toBe(first);
    expect(utils.result.current.selectedOption?.value).toBe('banana');
  });

  it('useSlider: stable across re-renders with same props', () => {
    const utils = setupHook(useSlider, { defaultValue: 25, min: 0, max: 100 });
    const first = utils.result.current;
    utils.rerender({ defaultValue: 25, min: 0, max: 100 });
    expect(utils.result.current).toBe(first);
  });

  it('useSlider: reflects changed value prop — not stale', () => {
    const utils = setupHook(useSlider, { value: 10, min: 0, max: 100 });
    const first = utils.result.current;
    expect(utils.result.current.state.value).toBe(10);
    utils.rerender({ value: 80, min: 0, max: 100 });
    expect(utils.result.current).not.toBe(first);
    expect(utils.result.current.state.value).toBe(80);
  });

  it('useTooltip: stable across re-renders with same props', () => {
    const utils = setupHook(useTooltip, { content: 'Tip' });
    const first = utils.result.current;
    utils.rerender({ content: 'Tip' });
    expect(utils.result.current).toBe(first);
  });

  it('useTooltip: opening via show() updates state — not stale', () => {
    const utils = setupHook(useTooltip, { content: 'Tip' });
    expect(utils.result.current.open).toBe(false);
    act(() => {
      utils.result.current.show();
    });
    expect(utils.result.current.open).toBe(true);
  });

  it('useDropdownMenu: stable across re-renders with same props', () => {
    const items: DropdownMenuItem[] = [{ id: 'a', label: 'A' }];
    const onOpenChange = () => {};
    const utils = setupHook(useDropdownMenu, { items, open: false, onOpenChange });
    const first = utils.result.current;
    utils.rerender({ items, open: false, onOpenChange });
    expect(utils.result.current).toBe(first);
  });

  it('useDropdownMenu: reflects changed open prop — not stale', () => {
    const items: DropdownMenuItem[] = [{ id: 'a', label: 'A' }];
    const onOpenChange = () => {};
    const utils = setupHook(useDropdownMenu, { items, open: false, onOpenChange });
    const first = utils.result.current;
    expect(utils.result.current.state.open).toBe(false);
    utils.rerender({ items, open: true, onOpenChange });
    expect(utils.result.current).not.toBe(first);
    expect(utils.result.current.state.open).toBe(true);
  });

  it('usePagination: stable across re-renders with same props', () => {
    const utils = setupHook(usePagination, { totalPages: 10 });
    const first = utils.result.current;
    utils.rerender({ totalPages: 10 });
    expect(utils.result.current).toBe(first);
  });

  it('usePagination: navigating to a page updates state — not stale', () => {
    const utils = setupHook(usePagination, { totalPages: 10 });
    expect(utils.result.current.state.page).toBe(1);
    act(() => {
      utils.result.current.handlers.handlePageChange(5);
    });
    expect(utils.result.current.state.page).toBe(5);
  });
});
