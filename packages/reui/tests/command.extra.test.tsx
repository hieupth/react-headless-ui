import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useCommand } from '../src/hooks';
import type { UseCommandProps, CommandItem, CommandGroup } from '../src/hooks';

const items: CommandItem[] = [
  { id: 'a', label: 'Apple', value: 'a' },
  { id: 'b', label: 'Banana', value: 'b' },
  { id: 'c', label: 'Cherry', description: 'red', value: 'c' },
  { id: 'd', label: 'Date', value: 'd', disabled: true },
];

const groups: CommandGroup[] = [
  { id: 'g1', heading: 'Group One', items: [{ id: 'a', label: 'Alpha', value: 'a' }, { id: 'b', label: 'Beta', value: 'b', disabled: true }] },
  { id: 'g2', heading: 'Group Two', items: [{ id: 'c', label: 'Gamma', value: 'c' }] },
];

interface HarnessProps {
  hookProps: UseCommandProps;
  onApi?: (api: any) => void;
}

function CommandHarness({ hookProps, onApi }: HarnessProps) {
  const api = useCommand(hookProps);
  onApi?.(api);
  const { searchInputAttributes, attributes, listAttributes, getItemAttributes, state } = api;
  return (
    <div role="combobox" data-command-trigger>
      <input {...searchInputAttributes} onKeyDown={attributes.onKeyDown} data-testid="search" />
      {state.open && (
        <ul {...listAttributes} data-testid="list">
          {state.filteredItems.map((item: CommandItem, i: number) => (
            <li key={item.id} {...getItemAttributes(item, i)}>{item.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function setup(hookProps: UseCommandProps = {}) {
  const api: { current: any } = { current: null };
  render(<CommandHarness hookProps={hookProps} onApi={(a) => (api.current = a)} />);
  return api;
}

describe('useCommand (extra hook tests)', () => {
  it('initializes with defaults and exposes state + handlers', () => {
    const api = setup({ items });
    expect(api.current.state.open).toBe(false);
    expect(api.current.state.value).toBe('');
    expect(api.current.state.selectedIndex).toBe(0);
    expect(api.current.state.filteredItems).toHaveLength(4);
    expect(typeof api.current.handlers.handleOpen).toBe('function');
  });

  it('handleOpen/handleClose toggle open state and call callbacks', async () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onOpenChange = vi.fn();
    const onAfterOpen = vi.fn();
    const api = setup({ items, onOpen, onOpenChange, onAfterOpen });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpen).toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(onAfterOpen).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('handleClose clears search and restores callbacks', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const onAfterClose = vi.fn();
    const api = setup({ items, defaultOpen: true, defaultValue: 'foo', onClose, onAfterClose });
    await act(async () => { await api.current.handlers.handleClose(); });
    expect(api.current.state.open).toBe(false);
    expect(onClose).toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(onAfterClose).toHaveBeenCalled();
    expect(api.current.state.value).toBe('');
    vi.useRealTimers();
  });

  it('handleToggle flips state', async () => {
    const api = setup({ items });
    await act(async () => { await api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(true);
    await act(async () => { await api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(false);
  });

  it('does not open/close when disabled', async () => {
    const api = setup({ items, disabled: true });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    await act(async () => { await api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(false);
  });

  it('respects onBeforeOpen returning false', async () => {
    const onBeforeOpen = vi.fn(() => false);
    const api = setup({ items, onBeforeOpen });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    await expect(api.current.handlers.handleBeforeOpen()).resolves.toBe(false);
  });

  it('respects onBeforeClose returning false', async () => {
    const onBeforeClose = vi.fn(() => false);
    const api = setup({ items, onBeforeClose, defaultOpen: true });
    await act(async () => { await api.current.handlers.handleClose(); });
    expect(api.current.state.open).toBe(true);
    await expect(api.current.handlers.handleBeforeClose()).resolves.toBe(false);
  });

  it('handleBeforeOpen/Close default to true when no handler', async () => {
    const api = setup({ items });
    await expect(api.current.handlers.handleBeforeOpen()).resolves.toBe(true);
    await expect(api.current.handlers.handleBeforeClose()).resolves.toBe(true);
  });

  it('controlled open state is driven by prop', async () => {
    const onOpenChange = vi.fn();
    const api = setup({ items, open: false, onOpenChange });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('filters items by search query', () => {
    const api = setup({ items, defaultValue: 'an' });
    expect(api.current.state.filteredItems.map((i: CommandItem) => i.label)).toEqual(['Banana']);
  });

  it('uses a custom filterFunction', () => {
    const filterFunction = vi.fn((list: CommandItem[], q: string) => list.filter(i => i.label.endsWith(q)));
    const api = setup({ items, defaultValue: 'a', filterFunction });
    expect(filterFunction).toHaveBeenCalled();
    expect(api.current.state.filteredItems.map((i: CommandItem) => i.id)).toEqual(['b']);
  });

  it('disables filtering when shouldFilter=false', () => {
    const api = setup({ items, defaultValue: 'zzz', shouldFilter: false });
    expect(api.current.state.filteredItems).toHaveLength(4);
  });

  it('handleSearch in uncontrolled mode updates value', async () => {
    const api = setup({ items });
    await act(async () => { api.current.handlers.handleSearch('App'); });
    expect(api.current.state.value).toBe('App');
  });

  it('handleSearch in controlled mode only calls onValueChange', async () => {
    const onValueChange = vi.fn();
    const api = setup({ items, value: '', onValueChange });
    await act(async () => { api.current.handlers.handleSearch('X'); });
    expect(api.current.state.value).toBe('');
    expect(onValueChange).toHaveBeenCalledWith('X');
  });

  it('handleSelect calls item onSelect + onSelect callback and closes', async () => {
    const itemOnSelect = vi.fn();
    const onSelect = vi.fn();
    const api = setup({ items: [{ ...items[0], onSelect: itemOnSelect }], defaultOpen: true, onSelect });
    await act(async () => { api.current.handlers.handleSelect(api.current.state.filteredItems[0]); });
    expect(itemOnSelect).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
    expect(api.current.state.open).toBe(false);
  });

  it('handleSelect respects disabled items', async () => {
    const onSelect = vi.fn();
    const api = setup({ items, defaultOpen: true, onSelect });
    await act(async () => { api.current.handlers.handleSelect(items[3]); });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handleSelect does not close when closeOnSelect=false', async () => {
    const api = setup({ items, defaultOpen: true, closeOnSelect: false });
    await act(async () => { api.current.handlers.handleSelect(items[0]); });
    expect(api.current.state.open).toBe(true);
  });

  it('handleItemFocus sets selectedIndex within range', () => {
    const api = setup({ items });
    act(() => { api.current.handlers.handleItemFocus(2); });
    expect(api.current.state.selectedIndex).toBe(2);
    act(() => { api.current.handlers.handleItemFocus(99); });
    expect(api.current.state.selectedIndex).toBe(2);
  });

  it('keyboard ArrowDown/ArrowUp wrap navigation', async () => {
    const api = setup({ items, defaultOpen: true });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowDown' }); });
    expect(api.current.state.selectedIndex).toBe(1);
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowUp' }); });
    expect(api.current.state.selectedIndex).toBe(0);
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowUp' }); });
    // wraps to last navigable (Cherry, index 2)
    expect(api.current.state.selectedIndex).toBe(2);
  });

  it('Enter selects the highlighted navigable item', async () => {
    const onSelect = vi.fn();
    const api = setup({ items, defaultOpen: true, onSelect });
    const search = screen.getByTestId('search');
    await act(async () => { api.current.handlers.handleItemFocus(1); });
    await act(async () => { fireEvent.keyDown(search, { key: 'Enter' }); });
    expect(onSelect).toHaveBeenCalled();
  });

  it('Escape closes when closeOnEscape', async () => {
    const api = setup({ items, defaultOpen: true });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'Escape' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('custom key bindings override defaults', async () => {
    const custom = vi.fn();
    const api = setup({ items, keyBindings: { 'x': custom } });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'x' }); });
    expect(custom).toHaveBeenCalled();
  });

  it('does nothing on key events when disabled', async () => {
    const api = setup({ items, disabled: true });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowDown' }); });
    expect(api.current.state.selectedIndex).toBe(0);
  });

  it('groups flatten to allItems and filteredGroups filter', () => {
    const api = setup({ groups, defaultValue: 'alpha' });
    expect(api.current.state.filteredItems.map((i: CommandItem) => i.id)).toEqual(['a']);
    expect(api.current.state.filteredGroups).toHaveLength(1);
    expect(api.current.state.filteredGroups[0].id).toBe('g1');
  });

  it('groups with custom filterFunction filter per group', () => {
    const filterFunction = vi.fn((list: CommandItem[]) => list);
    const api = setup({ groups, defaultValue: 'alpha', filterFunction });
    expect(filterFunction).toHaveBeenCalled();
    expect(api.current.state.filteredGroups.length).toBeGreaterThanOrEqual(1);
  });

  it('outside click closes the open command', async () => {
    const api = setup({ items, defaultOpen: true, closeOnOutsideClick: true });
    await act(async () => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.current.state.open).toBe(false);
  });

  it('document-level Escape closes the open command', async () => {
    const api = setup({ items, defaultOpen: true, closeOnEscape: true });
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(api.current.state.open).toBe(false);
  });

  it('item onClick selects and onMouseEnter focuses', async () => {
    const onSelect = vi.fn();
    const api = setup({ items, defaultOpen: true, onSelect });
    const listItems = screen.getAllByRole('option');
    await act(async () => { fireEvent.mouseEnter(listItems[1]); });
    expect(api.current.state.selectedIndex).toBe(1);
    await act(async () => { fireEvent.click(listItems[1]); });
    expect(onSelect).toHaveBeenCalled();
  });

  it('disabled item click does not select', async () => {
    const onSelect = vi.fn();
    setup({ items, defaultOpen: true, onSelect });
    const listItems = screen.getAllByRole('option');
    await act(async () => { fireEvent.click(listItems[3]); });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('getItemAttributes marks selected/disabled correctly', () => {
    const api = setup({ items });
    const sel = api.current.getItemAttributes(items[0], 0);
    expect(sel['aria-selected']).toBe(true);
    const dis = api.current.getItemAttributes(items[3], 3);
    expect(dis['aria-disabled']).toBe(true);
  });

  it('listAttributes expose id and style', () => {
    const api = setup({ items, maxHeight: 200 });
    expect(api.current.listAttributes.id).toBe('command-list');
    expect(api.current.listAttributes.style.maxHeight).toBe('200px');
  });

  it('groups with an empty search value return all groups unfiltered', () => {
    // shouldFilter defaults true; an empty/whitespace search returns propGroups
    // verbatim (the `!searchValue.trim()` early return).
    const api = setup({ groups, defaultValue: '   ' });
    expect(api.current.state.filteredGroups.length).toBe(groups.length);
  });

  it('handleItemFocus navigates within flattened groups', async () => {
    const api = setup({ groups, defaultOpen: true });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowDown' }); });
    expect(api.current.state.selectedIndex).toBeGreaterThanOrEqual(0);
  });

  it('Tab and default keys are tolerated without changing selection', async () => {
    const api = setup({ items, defaultOpen: true });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'Tab' }); });
    await act(async () => { fireEvent.keyDown(search, { key: 'z' }); });
    expect(api.current.state.selectedIndex).toBe(0);
  });

  it('default key focuses the search input when fired from another element', async () => {
    const api = setup({ items, defaultOpen: true });
    // Invoke the keydown handler with a target that is NOT the search input so
    // the `event.target !== searchInputRef.current` arm focuses the input.
    const fakeTarget = document.createElement('input');
    await act(async () => {
      api.current.attributes.onKeyDown({ key: 'z', target: fakeTarget, preventDefault: () => {} });
    });
    expect(document.activeElement).toBe(screen.getByTestId('search'));
  });

  it('handleClose is a no-op when the command is already closed', async () => {
    const api = setup({ items }); // default closed
    await act(async () => { await api.current.handlers.handleClose(); });
    expect(api.current.state.open).toBe(false);
  });

  it('search input onChange drives handleSearch in uncontrolled mode', async () => {
    const api = setup({ items, defaultOpen: true });
    const search = screen.getByTestId('search') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(search, { target: { value: 'apple' } });
    });
    expect(api.current.state.value).toBe('apple');
  });

  it('ArrowDown wraps from the last navigable item back to the first', async () => {
    // navigable items: a, b, c (d disabled). Start at the last, ArrowDown wraps to 0.
    const api = setup({ items, defaultOpen: true });
    await act(async () => { api.current.handlers.handleItemFocus(2); }); // last navigable (c)
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowDown' }); });
    expect(api.current.state.selectedIndex).toBe(0);
  });

  it('Enter on an empty list is a no-op (no navigable items)', async () => {
    const api = setup({ items: [], defaultOpen: true });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowDown' }); });
    await act(async () => { fireEvent.keyDown(search, { key: 'ArrowUp' }); });
    await act(async () => { fireEvent.keyDown(search, { key: 'Enter' }); });
    // No navigable items → selection stays at the initial index without error.
    expect(api.current.state.selectedIndex).toBe(0);
  });

  it('handleClose proceeds past the before-close guard when it returns true', async () => {
    vi.useFakeTimers();
    const onBeforeClose = vi.fn(async () => true);
    const onClose = vi.fn();
    const api = setup({ items, onBeforeClose, onClose, defaultOpen: true });
    await act(async () => { await api.current.handlers.handleClose(); });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(api.current.state.open).toBe(false);
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('Escape does not close when closeOnEscape is false', async () => {
    const api = setup({ items, defaultOpen: true, closeOnEscape: false });
    const search = screen.getByTestId('search');
    await act(async () => { fireEvent.keyDown(search, { key: 'Escape' }); });
    expect(api.current.state.open).toBe(true);
  });

  it('outside click inside the combobox does not close', async () => {
    const api = setup({ items, defaultOpen: true, closeOnOutsideClick: true });
    await act(async () => {
      // Click target is the combobox wrapper itself.
      screen.getByRole('combobox').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.current.state.open).toBe(true);
  });

  it('controlled close proceeds via onOpenChange without internal setOpen', async () => {
    const onOpenChange = vi.fn();
    const api = setup({ items, open: true, onOpenChange });
    await act(async () => { await api.current.handlers.handleClose(); });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handleOpen proceeds past the before-open guard when it returns true', async () => {
    vi.useFakeTimers();
    const onAfterOpen = vi.fn();
    const onBeforeOpen = vi.fn(async () => true);
    const api = setup({ items, onBeforeOpen, onAfterOpen });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(true);
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(onAfterOpen).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('semanticAttributes omits aria-labelledby when a label is provided', () => {
    const api = setup({ items, label: 'Commands', labelledBy: 'lb' });
    expect(api.current.attributes['aria-label']).toBe('Commands');
    expect(api.current.attributes['aria-labelledby']).toBeUndefined();
  });

  it('getItemAttributes falls back to label when value is absent and marks enabled', () => {
    const noValue = [{ id: 'x', label: 'XOnly' }];
    const api = setup({ items: noValue });
    const attrs = api.current.getItemAttributes(noValue[0], 0);
    expect(attrs['data-value']).toBe('XOnly');
    expect(attrs['aria-disabled']).toBe(false);
  });
});
