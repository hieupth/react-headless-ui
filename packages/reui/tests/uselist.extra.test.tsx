import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useList } from '../src/hooks';
import type { UseListProps, ListItem } from '../src/hooks';

const items = (n = 3): ListItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `i${i}`, value: i, label: `Item ${i}` }));

// Headless-hook harness following the useportal.hook.test.tsx canonical pattern.
function setup(props: UseListProps) {
  const api = { state: null as any, actions: null as any, attributes: null as any, classes: null as any, ref: null as HTMLElement | null };
  const refObj = { current: null as HTMLElement | null };
  function Harness() {
    const result = useList({ listRef: refObj as any, ...props });
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    api.classes = result.classes;
    return <div ref={(el) => { refObj.current = el; api.ref = el; }} />;
  }
  render(<Harness />);
  return api;
}

describe('useList hook - state & classes', () => {
  it('default state: empty items, no selection, vertical listbox', () => {
    const api = setup({});
    expect(api.state.items).toEqual([]);
    expect(api.state.selectedItems.size).toBe(0);
    expect(api.state.activeItem).toBeNull();
    expect(api.state.disabled).toBe(false);
    expect(api.state.loading).toBe(false);
    expect(api.state.searchable).toBe(false);
    expect(api.state.searchQuery).toBe('');
    expect(api.state.filteredItems).toEqual([]);
    expect(api.state.sorted).toBe(false);
    expect(api.state.sortField).toBeNull();
    expect(api.state.sortDirection).toBe('asc');
    expect(api.state.showTimeline).toBe(false);
    expect(api.state.timelinePosition).toBe('left');
    expect(api.state.showTimestamps).toBe(true);
    expect(api.state.currentPage).toBe(1);
    expect(api.state.totalPages).toBe(1);
    expect(api.state.itemsPerPage).toBe(10);
    expect(api.state.showPagination).toBe(false);
    expect(api.attributes.role).toBe('listbox');
    expect(api.attributes['aria-multiselectable']).toBe(false);
    expect(api.attributes['aria-orientation']).toBe('vertical');
    expect(api.attributes['aria-busy']).toBeUndefined();
    expect(api.classes.base).toBe('list');
  });

  it('reflects loading/searchable/timeline/pagination flags in attributes and classes', () => {
    const api = setup({
      defaultItems: items(2),
      loading: true,
      searchable: true,
      showTimeline: true,
      timelinePosition: 'right',
      pagination: { enabled: true, itemsPerPage: 1, defaultPage: 2 },
    });
    expect(api.attributes['aria-busy']).toBe(true);
    expect(api.classes.loading).toBe('list-loading');
    expect(api.classes.searchable).toBe('list-searchable');
    expect(api.classes.timeline).toBe('list-timeline');
    expect(api.classes.paginated).toBe('list-paginated');
    expect(api.state.timelinePosition).toBe('right');
    expect(api.state.itemsPerPage).toBe(1);
    expect(api.state.currentPage).toBe(2);
    expect(api.state.totalPages).toBe(2); // 2 items / 1 per page
    // state.filteredItems is the pre-pagination filter result (both items)
    expect(api.state.filteredItems).toHaveLength(2);
  });
});

describe('useList hook - selection', () => {
  it('selectItem (single) selects only the given id and fires callbacks', () => {
    const onSelectionChange = vi.fn();
    const onItemClick = vi.fn();
    const api = setup({ defaultItems: items(3), onSelectionChange, onItemClick });
    act(() => api.actions.selectItem('i1'));
    expect(Array.from(api.state.selectedItems)).toEqual(['i1']);
    expect(onSelectionChange).toHaveBeenCalledWith(['i1']);
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });

  it('selectItem (multiSelect) accumulates selection', () => {
    const api = setup({ defaultItems: items(3), multiSelect: true });
    act(() => api.actions.selectItem('i0'));
    act(() => api.actions.selectItem('i2'));
    expect(Array.from(api.state.selectedItems).sort()).toEqual(['i0', 'i2']);
  });

  it('selectItem ignores disabled items, missing items, and disabled list', () => {
    const onSelectionChange = vi.fn();
    const api = setup({
      defaultItems: [{ id: 'a', value: 1, label: 'A', disabled: true }, ...items(2)],
      onSelectionChange,
    });
    act(() => api.actions.selectItem('a'));
    expect(api.state.selectedItems.size).toBe(0);
    act(() => api.actions.selectItem('missing'));
    expect(api.state.selectedItems.size).toBe(0);
    const api2 = setup({ defaultItems: items(2), disabled: true });
    act(() => api2.actions.selectItem('i0'));
    expect(api2.state.selectedItems.size).toBe(0);
  });

  it('deselectItem removes from multi selection; no-op for single/disabled', () => {
    const api = setup({ defaultItems: items(3), multiSelect: true, defaultSelectedItems: ['i0', 'i1'] });
    act(() => api.actions.deselectItem('i0'));
    expect(Array.from(api.state.selectedItems)).toEqual(['i1']);
    // single-select: deselect is a no-op
    const api2 = setup({ defaultItems: items(2) });
    act(() => api2.actions.deselectItem('i0'));
    expect(api2.state.selectedItems.size).toBe(0);
    // disabled list: no-op
    const api3 = setup({ defaultItems: items(2), multiSelect: true, defaultSelectedItems: ['i0'], disabled: true });
    act(() => api3.actions.deselectItem('i0'));
    expect(api3.state.selectedItems.size).toBe(1);
  });

  it('toggleItem selects/deselects based on current state', () => {
    const api = setup({ defaultItems: items(2), multiSelect: true });
    act(() => api.actions.toggleItem('i0'));
    expect(api.state.selectedItems.has('i0')).toBe(true);
    act(() => api.actions.toggleItem('i0'));
    expect(api.state.selectedItems.has('i0')).toBe(false);
  });

  it('selectAll selects all enabled+selectable paginated items (multiSelect)', () => {
    const onSelectionChange = vi.fn();
    const api = setup({
      defaultItems: [{ id: 'a', value: 1, label: 'A', disabled: true }, { id: 'b', value: 2, label: 'B', selectable: false }, { id: 'c', value: 3, label: 'C' }],
      multiSelect: true,
      onSelectionChange,
    });
    act(() => api.actions.selectAll());
    expect(Array.from(api.state.selectedItems)).toEqual(['c']);
    expect(onSelectionChange).toHaveBeenCalledWith(['c']);
  });

  it('selectAll is a no-op for single-select or disabled', () => {
    const api = setup({ defaultItems: items(2) });
    act(() => api.actions.selectAll());
    expect(api.state.selectedItems.size).toBe(0);
    const api2 = setup({ defaultItems: items(2), multiSelect: true, disabled: true });
    act(() => api2.actions.selectAll());
    expect(api2.state.selectedItems.size).toBe(0);
  });

  it('deselectAll/clearSelection empty the selection (controlled-safe)', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ defaultItems: items(2), multiSelect: true, defaultSelectedItems: ['i0'], onSelectionChange });
    act(() => api.actions.deselectAll());
    expect(api.state.selectedItems.size).toBe(0);
    expect(onSelectionChange).toHaveBeenCalledWith([]);
    act(() => api.actions.selectItem('i1'));
    act(() => api.actions.clearSelection());
    expect(api.state.selectedItems.size).toBe(0);
    // disabled
    const api2 = setup({ defaultItems: items(2), multiSelect: true, defaultSelectedItems: ['i0'], disabled: true });
    act(() => api2.actions.deselectAll());
    expect(api2.state.selectedItems.size).toBe(1);
  });

  it('controlled selectedItems does not mutate internal selection', () => {
    const api = setup({ defaultItems: items(2), selectedItems: ['i0'] });
    act(() => api.actions.selectItem('i1'));
    expect(Array.from(api.state.selectedItems)).toEqual(['i0']);
  });

  it('setActiveItem updates activeItem and fires onActiveItemChange', () => {
    const onActiveItemChange = vi.fn();
    const api = setup({ defaultItems: items(2), onActiveItemChange });
    act(() => api.actions.setActiveItem('i1'));
    expect(api.state.activeItem).toBe('i1');
    expect(onActiveItemChange).toHaveBeenCalledWith('i1');
    act(() => api.actions.setActiveItem(null));
    expect(api.state.activeItem).toBeNull();
  });
});

describe('useList hook - item mutations', () => {
  it('addItem appends; no-op when controlled', () => {
    const api = setup({ defaultItems: items(2) });
    act(() => api.actions.addItem({ id: 'x', value: 9, label: 'X' }));
    expect(api.state.items).toHaveLength(3);
    const api2 = setup({ items: items(2) });
    act(() => api2.actions.addItem({ id: 'x', value: 9, label: 'X' }));
    expect(api2.state.items).toHaveLength(2);
  });

  it('removeItem drops the item and cleans selection', () => {
    const api = setup({ defaultItems: items(3), multiSelect: true, defaultSelectedItems: ['i0', 'i1'] });
    act(() => api.actions.removeItem('i0'));
    expect(api.state.items.map(i => i.id)).toEqual(['i1', 'i2']);
    expect(Array.from(api.state.selectedItems)).toEqual(['i1']);
    // controlled items: no-op
    const api2 = setup({ items: items(2) });
    act(() => api2.actions.removeItem('i0'));
    expect(api2.state.items).toHaveLength(2);
  });

  it('updateItem merges updates by id', () => {
    const api = setup({ defaultItems: items(2) });
    act(() => api.actions.updateItem('i0', { label: 'Updated', disabled: true }));
    expect(api.state.items[0].label).toBe('Updated');
    expect(api.state.items[0].disabled).toBe(true);
    const api2 = setup({ items: items(2) });
    act(() => api2.actions.updateItem('i0', { label: 'X' }));
    expect(api2.state.items[0].label).toBe('Item 0');
  });

  it('moveItem reorders by from/to indices', () => {
    const api = setup({ defaultItems: items(3) });
    act(() => api.actions.moveItem(0, 2));
    expect(api.state.items.map(i => i.id)).toEqual(['i1', 'i2', 'i0']);
    const api2 = setup({ items: items(3) });
    act(() => api2.actions.moveItem(0, 2));
    expect(api2.state.items.map(i => i.id)).toEqual(['i0', 'i1', 'i2']);
  });
});

describe('useList hook - search', () => {
  it('setSearchQuery filters by label/description (default fields) and resets page', () => {
    const onSearch = vi.fn();
    const api = setup({
      defaultItems: [
        { id: 'a', value: 1, label: 'Apple' },
        { id: 'b', value: 2, label: 'Banana', description: 'yellow' },
      ],
      searchable: true,
      pagination: { enabled: true, itemsPerPage: 1 },
      onSearch,
    });
    act(() => api.actions.goToPage(2));
    expect(api.state.currentPage).toBe(2);
    act(() => api.actions.setSearchQuery('app'));
    expect(api.state.searchQuery).toBe('app');
    expect(api.state.filteredItems.map(i => i.id)).toEqual(['a']);
    expect(api.state.currentPage).toBe(1); // reset
    expect(onSearch).toHaveBeenCalled();
  });

  it('search matches numeric fields too', () => {
    const api = setup({
      defaultItems: [{ id: 'a', value: 42, label: 'A' }, { id: 'b', value: 7, label: 'B' }],
      searchable: true,
      searchFields: ['value'],
    });
    act(() => api.actions.setSearchQuery('42'));
    expect(api.state.filteredItems.map(i => i.id)).toEqual(['a']);
  });

  it('custom filterFunction overrides default matching', () => {
    const api = setup({
      defaultItems: items(3),
      searchable: true,
      filterFunction: (item, q) => item.id === q,
    });
    act(() => api.actions.setSearchQuery('i1'));
    expect(api.state.filteredItems.map(i => i.id)).toEqual(['i1']);
  });

  it('clearSearch resets the query', () => {
    const api = setup({ defaultItems: items(3), searchable: true });
    act(() => api.actions.setSearchQuery('i1'));
    act(() => api.actions.clearSearch());
    expect(api.state.searchQuery).toBe('');
    expect(api.state.filteredItems).toHaveLength(3);
  });

  it('search is inert when searchable is false', () => {
    const api = setup({ defaultItems: items(3), searchable: false });
    act(() => api.actions.setSearchQuery('zzz'));
    expect(api.state.filteredItems).toHaveLength(3);
  });
});

describe('useList hook - sorting', () => {
  // Sort order is only observable through pagination (autoFocus picks the first
  // sorted paginated item), since state.filteredItems holds the pre-sort list.
  it('setSorting sets sort state, fires onSort, and orders paginated items (autoFocus observes)', () => {
    const onSort = vi.fn();
    const api = setup({
      defaultItems: [
        { id: 'a', value: 3, label: 'A' },
        { id: 'b', value: 1, label: 'B' },
        { id: 'c', value: 2, label: 'C' },
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
      onSort,
    });
    // No sort yet -> first paginated item is 'a'
    expect(api.state.activeItem).toBe('a');
    act(() => api.actions.setSorting('value', 'asc'));
    expect(api.state.sortField).toBe('value');
    expect(api.state.sortDirection).toBe('asc');
    expect(api.state.sorted).toBe(true);
    expect(onSort).toHaveBeenCalledWith('value', 'asc');
    // After ascending sort, first paginated item is the smallest value 'b'
    expect(api.state.activeItem).toBe('b');
  });

  it('descending sort orders largest first (autoFocus observes)', () => {
    const api = setup({
      defaultItems: [
        { id: 'a', value: 1, label: 'A' },
        { id: 'b', value: 9, label: 'B' },
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
    });
    act(() => api.actions.setSorting('value', 'desc'));
    expect(api.state.activeItem).toBe('b');
  });

  it('sorting by string label uses localeCompare (autoFocus observes)', () => {
    const api = setup({
      defaultItems: [
        { id: 'a', value: 1, label: 'Banana' },
        { id: 'b', value: 2, label: 'Apple' },
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
    });
    act(() => api.actions.setSorting('label', 'asc'));
    expect(api.state.activeItem).toBe('b'); // 'Apple' sorts first
  });

  it('sorting by Date uses getTime comparison (autoFocus observes)', () => {
    const api = setup({
      defaultItems: [
        { id: 'a', value: 1, label: 'A', timestamp: new Date('2024-01-01') as any },
        { id: 'b', value: 2, label: 'B', timestamp: new Date('2023-01-01') as any },
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
    });
    act(() => api.actions.setSorting('timestamp' as any, 'asc'));
    expect(api.state.activeItem).toBe('b'); // 2023 date sorts first ascending
  });

  it('custom sortFunction overrides default comparison', () => {
    const api = setup({
      defaultItems: [
        { id: 'a', value: 2, label: 'A' },
        { id: 'b', value: 1, label: 'B' },
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
      sortFunction: (a, b) => (a.value % 2) - (b.value % 2), // even first
    });
    act(() => api.actions.setSorting('value', 'asc'));
    expect(api.state.activeItem).toBe('a'); // value 2 is even -> sorts first
  });

  it('fallback to String.localeCompare for mixed/non-comparable types', () => {
    const api = setup({
      defaultItems: [
        { id: 'a', value: true as any, label: 'A' },
        { id: 'b', value: 5 as any, label: 'B' },
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 2 },
    });
    expect(() => act(() => api.actions.setSorting('value', 'asc'))).not.toThrow();
    expect(api.state.sorted).toBe(true);
  });

  it('fallback String.localeCompare handles falsy field values', () => {
    // Both items lack the sort field -> aValue/bValue undefined -> else branch
    // with the `aValue || ''` falsy side exercised.
    const api = setup({
      defaultItems: [
        { id: 'a', label: 'A' } as any,
        { id: 'b', label: 'B' } as any,
      ],
      sortable: true,
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 2 },
    });
    expect(() => act(() => api.actions.setSorting('missing' as any, 'asc'))).not.toThrow();
    expect(api.state.sorted).toBe(true);
  });

  it('sortItems is a no-op when sortable is disabled', () => {
    // sortable=false forces sortField to null, so no sorting is applied and
    // the original item order is preserved.
    const api = setup({
      defaultItems: [{ id: 'a', value: 2, label: 'A' }, { id: 'b', value: 1, label: 'B' }],
      sortable: false,
      defaultSortField: 'value',
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
    });
    expect(api.state.activeItem).toBe('a');
  });

  it('uses the internal ref when no listRef is provided', () => {
    const api = { actions: null as any };
    function Harness() {
      const result = useList({ defaultItems: items(2) });
      (api as any).actions = result.actions;
      return null;
    }
    render(<Harness />);
    // internal ref is never attached -> getListElement returns null
    expect(api.actions.getListElement()).toBeNull();
  });

  it('clearSorting resets sortField/direction', () => {
    const api = setup({ defaultItems: items(2), sortable: true });
    act(() => api.actions.setSorting('value', 'desc'));
    act(() => api.actions.clearSorting());
    expect(api.state.sortField).toBeNull();
    expect(api.state.sortDirection).toBe('asc');
    expect(api.state.sorted).toBe(false);
  });

  it('default sort applied when sortable with defaultSortField', () => {
    const api = setup({
      defaultItems: [{ id: 'a', value: 2, label: 'A' }, { id: 'b', value: 1, label: 'B' }],
      sortable: true,
      defaultSortField: 'value',
      defaultSortDirection: 'desc',
      autoFocus: true,
      pagination: { enabled: true, itemsPerPage: 1 },
    });
    expect(api.state.sortField).toBe('value');
    expect(api.state.sortDirection).toBe('desc');
    // Largest value 'a' (2) sorts first descending
    expect(api.state.activeItem).toBe('a');
  });
});

describe('useList hook - pagination', () => {
  it('goToPage clamps to [1, totalPages] and fires onPageChange', () => {
    const onPageChange = vi.fn();
    const api = setup({
      defaultItems: items(5),
      pagination: { enabled: true, itemsPerPage: 2 },
      onPageChange,
    });
    expect(api.state.totalPages).toBe(3);
    act(() => api.actions.goToPage(2));
    expect(api.state.currentPage).toBe(2);
    expect(onPageChange).toHaveBeenCalledWith(2);
    act(() => api.actions.goToPage(99));
    expect(api.state.currentPage).toBe(3);
    act(() => api.actions.goToPage(0));
    expect(api.state.currentPage).toBe(1);
  });

  it('nextPage/previousPage navigate and clamp', () => {
    const api = setup({ defaultItems: items(5), pagination: { enabled: true, itemsPerPage: 2 } });
    act(() => api.actions.nextPage());
    expect(api.state.currentPage).toBe(2);
    act(() => api.actions.nextPage());
    act(() => api.actions.nextPage()); // at last (3)
    expect(api.state.currentPage).toBe(3);
    act(() => api.actions.nextPage()); // no-op
    expect(api.state.currentPage).toBe(3);
    act(() => api.actions.previousPage());
    expect(api.state.currentPage).toBe(2);
    act(() => api.actions.previousPage());
    expect(api.state.currentPage).toBe(1);
    act(() => api.actions.previousPage()); // no-op at 1
    expect(api.state.currentPage).toBe(1);
  });

  it('setItemsPerPage resets to page 1', () => {
    const api = setup({ defaultItems: items(5), pagination: { enabled: true, itemsPerPage: 2, defaultPage: 2 } });
    expect(api.state.currentPage).toBe(2);
    act(() => api.actions.setItemsPerPage(5));
    expect(api.state.itemsPerPage).toBe(5);
    expect(api.state.currentPage).toBe(1);
  });
});

describe('useList hook - misc', () => {
  it('refresh clones internal items; no-op when controlled', () => {
    const api = setup({ defaultItems: items(2) });
    expect(() => act(() => api.actions.refresh())).not.toThrow();
    expect(api.state.items).toHaveLength(2);
    const api2 = setup({ items: items(2) });
    expect(() => act(() => api2.actions.refresh())).not.toThrow();
  });

  it('getListElement returns the bound ref', () => {
    const api = setup({ defaultItems: items(2) });
    expect(api.actions.getListElement()).toBeInstanceOf(HTMLElement);
  });

  it('autoFocus sets first non-disabled item as active', () => {
    const api = setup({
      defaultItems: [{ id: 'a', value: 1, label: 'A', disabled: true }, { id: 'b', value: 2, label: 'B' }],
      autoFocus: true,
    });
    expect(api.state.activeItem).toBe('b');
    const api2 = setup({ defaultItems: items(2), autoFocus: true, disabled: true });
    expect(api2.state.activeItem).toBeNull();
  });

  it('getAccessibilityProps reflects live loading', () => {
    const api = setup({ defaultItems: items(1) });
    expect(api.actions.getAccessibilityProps()['aria-busy']).toBeUndefined();
  });

  it('controlled selection: deselectItem/selectAll/deselectAll fire callbacks without mutating internal set', () => {
    // Controlled selectedItems -> internal setters are skipped but callbacks fire.
    const onSelectionChange = vi.fn();
    const api = setup({
      defaultItems: items(3),
      multiSelect: true,
      selectedItems: ['i0', 'i1'],
      onSelectionChange,
    });
    act(() => api.actions.deselectItem('i0'));
    // Internal selection stays as the controlled value (['i0','i1']).
    expect(Array.from(api.state.selectedItems).sort()).toEqual(['i0', 'i1']);
    expect(onSelectionChange).toHaveBeenCalledWith(['i1']);

    act(() => api.actions.selectAll());
    expect(onSelectionChange).toHaveBeenCalledWith(['i0', 'i1', 'i2']);
    expect(Array.from(api.state.selectedItems).sort()).toEqual(['i0', 'i1']);

    act(() => api.actions.deselectAll());
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('removeItem on controlled selection skips the internal-selection-cleanup branch', () => {
    const api = setup({
      defaultItems: items(2),
      selectedItems: ['i0'], // controlled selection -> cleanup branch skipped
    });
    expect(() => act(() => api.actions.removeItem('i0'))).not.toThrow();
    expect(api.state.items).toHaveLength(1);
    // selection unchanged (controlled)
    expect(Array.from(api.state.selectedItems)).toEqual(['i0']);
  });

  it('autoFocus is a no-op when the list is disabled (covers !disabled branch)', () => {
    const api = setup({
      defaultItems: [{ id: 'a', value: 1, label: 'A', disabled: true }],
      autoFocus: true,
      disabled: true,
    });
    expect(api.state.activeItem).toBeNull();
  });

  it('autoFocus finds no active item when every item is disabled (firstItem falsy)', () => {
    const api = setup({
      defaultItems: [{ id: 'a', value: 1, label: 'A', disabled: true }, { id: 'b', value: 2, label: 'B', disabled: true }],
      autoFocus: true,
    });
    expect(api.state.activeItem).toBeNull();
  });

  it('getPaginatedItems short-circuits when all items fit on one page', () => {
    const api = setup({ defaultItems: items(2), pagination: { enabled: true, itemsPerPage: 10 } });
    expect(api.state.totalPages).toBe(1);
    expect(api.state.showPagination).toBe(true);
  });
});
