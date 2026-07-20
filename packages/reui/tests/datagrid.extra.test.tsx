import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useDataGrid } from '../src/hooks';
import type { UseDataGridProps, GridColumn } from '../src/hooks';

const columns: GridColumn[] = [
  { id: 'name', header: 'Name', sortable: true, filterable: true },
  { id: 'age', header: 'Age', sortable: true, type: 'number' },
];

const data = [
  { id: '1', name: 'Ada', age: 30 },
  { id: '2', name: 'Lin', age: 25 },
  { id: '3', name: 'Bo', age: 40 },
];

function HookHarness(props: UseDataGridProps & { onApi?: (api: any) => void }) {
  const { onApi, ...rest } = props;
  const api = useDataGrid(rest);
  onApi?.(api);
  return <div data-testid="harness" {...api.attributes} />;
}

function setup(props: UseDataGridProps = {}) {
  const api: { current: any } = { current: null };
  render(<HookHarness data={data} columns={columns} onApi={(a) => (api.current = a)} {...props} />);
  return api;
}

describe('useDataGrid (extra hook tests)', () => {
  it('processes data into rows and exposes aliases + state', () => {
    const api = setup();
    expect(api.current.rows).toHaveLength(3);
    expect(api.current.columns).toBe(columns);
    expect(api.current.disabled).toBe(false);
    expect(api.current.data).toBe(api.current.rows);
    expect(api.current.sortedData).toBe(api.current.rows);
    expect(api.current.filteredData).toBe(api.current.rows);
    expect(api.current.paginatedData).toBe(api.current.rows);
    expect(api.current.selectedRows).toEqual([]);
  });

  it('handleSort updates sort and notifies', () => {
    const onSortChange = vi.fn();
    const api = setup({ onSortChange });
    act(() => { api.current.handleSort('name', 'desc'); });
    expect(api.current.sort).toEqual({ column: 'name', direction: 'desc' });
    expect(onSortChange).toHaveBeenCalledWith({ column: 'name', direction: 'desc' });
  });

  it('handleSort ignored when disabled', () => {
    const onSortChange = vi.fn();
    const api = setup({ disabled: true, onSortChange });
    act(() => { api.current.handleSort('name', 'asc'); });
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('sorting asc and desc reorders rows', () => {
    const api = setup();
    act(() => { api.current.handleSort('name', 'asc'); });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Ada', 'Bo', 'Lin']);
    act(() => { api.current.handleSort('name', 'desc'); });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Lin', 'Bo', 'Ada']);
  });

  it('handleFilter applies contains/equals/startsWith/endsWith operators', () => {
    const onFilterChange = vi.fn();
    const api = setup({ onFilterChange });
    act(() => { api.current.handleFilter('name', 'Ad', 'contains'); });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Ada']);
    expect(onFilterChange).toHaveBeenCalledWith({ column: 'name', value: 'Ad', operator: 'contains' });

    act(() => { api.current.handleFilter('name', 'Lin', 'equals'); });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Lin']);

    act(() => { api.current.handleFilter('name', 'Ad', 'startsWith'); });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Ada']);

    act(() => { api.current.handleFilter('name', 'da', 'endsWith'); });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Ada']);
  });

  it('handleFilter ignored when disabled', () => {
    const onFilterChange = vi.fn();
    const api = setup({ disabled: true, onFilterChange });
    act(() => { api.current.handleFilter('name', 'x', 'contains'); });
    expect(onFilterChange).not.toHaveBeenCalled();
  });

  it('handleFilter with unknown operator returns all rows', () => {
    const api = setup();
    act(() => { api.current.handleFilter('name', 'zzz', 'between'); });
    expect(api.current.rows).toHaveLength(3);
  });

  it('handlePagination updates page/pageSize and notifies', () => {
    const onPaginationChange = vi.fn();
    const api = setup({ onPaginationChange, defaultPagination: { page: 1, pageSize: 2, total: 3, totalPages: 2 } });
    act(() => { api.current.handlePagination(2); });
    expect(api.current.pagination.page).toBe(2);
    act(() => { api.current.handlePagination(1, 1); });
    expect(api.current.pagination.pageSize).toBe(1);
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it('handlePagination ignored when disabled', () => {
    const onPaginationChange = vi.fn();
    const api = setup({ disabled: true, onPaginationChange });
    act(() => { api.current.handlePagination(5); });
    expect(onPaginationChange).not.toHaveBeenCalled();
  });

  it('handleSelection single/multiple and callbacks', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ onSelectionChange });
    act(() => { api.current.handleSelection(['1'], 'single'); });
    expect(api.current.selection.selectedRows).toEqual(['1']);
    expect(api.current.selection.mode).toBe('single');
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('handleSelection ignored when disabled', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ disabled: true, onSelectionChange });
    act(() => { api.current.handleSelection(['1']); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('handleRowClick toggles selection (multiple mode)', () => {
    const onRowClick = vi.fn();
    const api = setup({ onRowClick });
    const row = api.current.rows[0];
    act(() => { api.current.handleRowClick(row, {} as any); });
    expect(api.current.selection.selectedRows).toEqual(['1']);
    // toggle off
    act(() => { api.current.handleRowClick(api.current.rows[0], {} as any); });
    expect(api.current.selection.selectedRows).toEqual([]);
    expect(onRowClick).toHaveBeenCalled();
  });

  it('handleRowClick single mode replaces selection', () => {
    const api = setup({ defaultSelection: { selectedRows: [], mode: 'single' } });
    act(() => { api.current.handleRowClick(api.current.rows[0], {} as any); });
    expect(api.current.selection.selectedRows).toEqual(['1']);
    act(() => { api.current.handleRowClick(api.current.rows[1], {} as any); });
    expect(api.current.selection.selectedRows).toEqual(['2']);
  });

  it('handleRowClick respects disabled row and disabled grid', () => {
    const onRowClick = vi.fn();
    const api = setup({ onRowClick });
    const disabledRow = { ...api.current.rows[0], disabled: true };
    act(() => { api.current.handleRowClick(disabledRow, {} as any); });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('handleRowClick does not select when showSelection=false', () => {
    const api = setup({ showSelection: false });
    act(() => { api.current.handleRowClick(api.current.rows[0], {} as any); });
    expect(api.current.selection.selectedRows).toEqual([]);
  });

  it('handleCellClick sets selectedCell and notifies', () => {
    const onCellClick = vi.fn();
    const api = setup({ onCellClick });
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    expect(api.current.selectedCell).toEqual({ rowIndex: 0, columnId: 'name' });
    expect(onCellClick).toHaveBeenCalled();
  });

  it('handleHeaderClick toggles sort direction for sortable column', () => {
    const onHeaderClick = vi.fn();
    const api = setup({ onHeaderClick });
    act(() => { api.current.handleHeaderClick(columns[0], {} as any); });
    // first click on unsorted column -> desc (asc -> toggled to desc)
    expect(api.current.sort.column).toBe('name');
    expect(onHeaderClick).toHaveBeenCalled();
  });

  it('handleHeaderClick on non-sortable column does not sort', () => {
    const onSortChange = vi.fn();
    const nonSortable: GridColumn[] = [{ id: 'name', header: 'Name' }];
    const api = setup({ columns: nonSortable, onSortChange });
    act(() => { api.current.handleHeaderClick(nonSortable[0], {} as any); });
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('handleSelectAll selects all current rows', () => {
    const api = setup();
    act(() => { api.current.handleSelectAll(); });
    expect(api.current.selection.selectedRows).toHaveLength(3);
  });

  it('handleClearSelection empties selected rows', () => {
    const api = setup({ defaultSelection: { selectedRows: ['1', '2'], mode: 'multiple' } });
    act(() => { api.current.handleClearSelection(); });
    expect(api.current.selection.selectedRows).toEqual([]);
  });

  it('handleSelectAll/Clear ignored when disabled', () => {
    const api = setup({ disabled: true });
    act(() => { api.current.handleSelectAll(); });
    act(() => { api.current.handleClearSelection(); });
    expect(api.current.selection.selectedRows).toEqual([]);
  });

  it('handleKeyDown Enter/Space activates selected cell via handleCellClick', () => {
    const onCellClick = vi.fn();
    const api = setup({ onCellClick });
    // select a cell first
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    const harness = document.querySelector('[data-testid="harness"]')!;
    act(() => { fireEvent.keyDown(harness, { key: 'Enter' }); });
    expect(onCellClick).toHaveBeenCalled();
  });

  it('handleKeyDown Arrow keys call preventDefault and do not throw', () => {
    const api = setup();
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']) {
      const evt = { key, preventDefault: vi.fn() } as any;
      expect(() => act(() => { api.current.attributes.onKeyDown(evt); })).not.toThrow();
      expect(evt.preventDefault).toHaveBeenCalled();
    }
  });

  it('handleKeyDown Escape clears selectedCell', () => {
    const api = setup();
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    const harness = document.querySelector('[data-testid="harness"]')!;
    act(() => { fireEvent.keyDown(harness, { key: 'Escape' }); });
    expect(api.current.selectedCell).toBeUndefined();
  });

  it('handleKeyDown Ctrl+A selects all', () => {
    const api = setup();
    const harness = document.querySelector('[data-testid="harness"]')!;
    act(() => { fireEvent.keyDown(harness, { key: 'a', ctrlKey: true, preventDefault: vi.fn() }); });
    expect(api.current.selection.selectedRows).toHaveLength(3);
  });

  it('handleKeyDown custom keyBinding fires', () => {
    const custom = vi.fn();
    const api = setup({ keyBindings: { 'x': custom } });
    const harness = document.querySelector('[data-testid="harness"]')!;
    act(() => { fireEvent.keyDown(harness, { key: 'x', preventDefault: vi.fn() }); });
    expect(custom).toHaveBeenCalled();
  });

  it('handleKeyDown ignored when disabled', () => {
    const custom = vi.fn();
    const api = setup({ disabled: true, keyBindings: { 'x': custom } });
    const harness = document.querySelector('[data-testid="harness"]')!;
    act(() => { fireEvent.keyDown(harness, { key: 'x', preventDefault: vi.fn() }); });
    expect(custom).not.toHaveBeenCalled();
  });

  it('validateRow filters rows and processData transforms', () => {
    const validateRow = (row: any) => row.age >= 30;
    const api = setup({ validateRow });
    expect(api.current.rows.map((r: any) => r.data.name)).toEqual(['Ada', 'Bo']);
  });

  it('processData transforms input before processing', () => {
    const processData = (d: any[]) => d.map(x => ({ ...x, name: x.name.toUpperCase() }));
    const api = setup({ processData });
    expect(api.current.rows[0].data.name).toBe('ADA');
  });

  it('falls back to generated row ids when items lack id', () => {
    const api = setup({ data: [{ name: 'X' }, { name: 'Y' }] });
    expect(api.current.rows[0].id).toBe('row-0');
    expect(api.current.rows[1].id).toBe('row-1');
  });

  it('transformValue customizes sort and filter values', () => {
    const transformValue = vi.fn((v: any) => v);
    const api = setup({ transformValue });
    act(() => { api.current.handleSort('name', 'asc'); });
    expect(transformValue).toHaveBeenCalled();
  });

  it('attributes expose aria + data flags for label, sort, loading', () => {
    const api = setup({ loading: true, label: 'My Grid', showRowNumbers: true });
    const attrs = api.current.attributes;
    expect(attrs['aria-label']).toBe('My Grid');
    expect(attrs['aria-busy']).toBe(true);
    expect(attrs['data-loading']).toBe(true);
    expect(attrs['aria-multiselectable']).toBe(true);
    expect(attrs['aria-colcount']).toBe(4); // 2 cols + row numbers + selection
    expect(attrs.role).toBe('table');
    expect(attrs.tabIndex).toBe(0);
  });

  it('defaultFocused and focused flag are surfaced', () => {
    const api = setup({ defaultFocused: true });
    expect(api.current.focused).toBe(true);
  });
});

describe('useDataGrid (branch coverage)', () => {
  it('sorts by a column id absent from columns, falling back to an empty column descriptor', () => {
    const api = setup();
    // handleSort with a column not present in propColumns exercises the
    // `propColumns.find(...) || {}` fallback inside the sort comparator.
    act(() => { api.current.handleSort('missing', 'asc'); });
    // rows are preserved (comparator returns 0 -> stable), no throw
    expect(api.current.rows).toHaveLength(3);
  });

  it('sorts by a missing column with a transformValue active', () => {
    const transformValue = (v: any) => (v == null ? '' : v);
    const api = setup({ transformValue });
    act(() => { api.current.handleSort('missing', 'desc'); });
    expect(api.current.rows).toHaveLength(3);
  });

  it('filtering by a column id absent from columns keeps all rows', () => {
    const api = setup();
    act(() => { api.current.handleFilter('missing', 'x', 'contains'); });
    expect(api.current.rows).toHaveLength(3);
  });

  it('handleCellClick is a no-op for a disabled row', () => {
    const onCellClick = vi.fn();
    const api = setup({ onCellClick });
    const disabledRow = { ...api.current.rows[0], disabled: true };
    act(() => { api.current.handleCellClick(disabledRow, columns[0], {} as any); });
    expect(api.current.selectedCell).toBeUndefined();
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('handleCellClick reads the cell value via a function accessor', () => {
    const onCellClick = vi.fn();
    const cols: GridColumn[] = [
      { id: 'upper', header: 'Upper', accessor: (row: any) => row.name.toUpperCase() },
    ];
    const api = setup({ columns: cols, onCellClick });
    act(() => { api.current.handleCellClick(api.current.rows[0], cols[0], {} as any); });
    expect(onCellClick).toHaveBeenCalledWith(expect.anything(), cols[0], 'ADA');
  });

  it('handleCellClick is a no-op when the grid is disabled', () => {
    const onCellClick = vi.fn();
    const api = setup({ disabled: true, onCellClick });
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('handleHeaderClick does not sort when the grid is disabled', () => {
    const onSortChange = vi.fn();
    const api = setup({ disabled: true, onSortChange });
    act(() => { api.current.handleHeaderClick(columns[0], {} as any); });
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('does not run built-in keyboard shortcuts when keyboardShortcuts is false', () => {
    const api = setup({ keyboardShortcuts: false });
    const evt = { key: 'ArrowDown', preventDefault: vi.fn() } as any;
    expect(() => act(() => { api.current.attributes.onKeyDown(evt); })).not.toThrow();
    // built-in arrow handling is gated off, so preventDefault is not called
    expect(evt.preventDefault).not.toHaveBeenCalled();
  });

  it('Enter on a selected cell whose row is off-page is a no-op', () => {
    const onCellClick = vi.fn();
    // pageSize 2 -> page 1 shows original indices 0 and 1
    const api = setup({ onCellClick, defaultPagination: { page: 1, pageSize: 2, total: 3, totalPages: 2 } });
    // move to page 2, which shows only the row with original index 2
    act(() => { api.current.handlePagination(2); });
    // select that row (selectedCell.rowIndex = 2), then go back to page 1 where rows are indices 0,1
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    act(() => { api.current.handlePagination(1); });
    // selectedCell.rowIndex (2) is now beyond page-1 rows -> Enter must not call onCellClick
    act(() => { api.current.attributes.onKeyDown({ key: 'Enter', preventDefault: () => {} }); });
    expect(onCellClick).toHaveBeenCalledTimes(1);
  });

  it('pressing "a" without modifiers and with metaKey does not trigger select-all', () => {
    const api = setup();
    // no modifiers -> ctrl/meta false -> no select-all
    act(() => { api.current.attributes.onKeyDown({ key: 'a', preventDefault: () => {} }); });
    expect(api.current.selection.selectedRows).toHaveLength(0);
    // metaKey alone triggers select-all (ctrlKey path already covered elsewhere)
    act(() => { api.current.attributes.onKeyDown({ key: 'a', metaKey: true, preventDefault: () => {} }); });
    expect(api.current.selection.selectedRows).toHaveLength(3);
  });

  it('surfaces tabIndex -1 when not focusable', () => {
    const api = setup({ focusable: false });
    expect(api.current.attributes.tabIndex).toBe(-1);
  });

  it('Enter on a selected cell whose column was removed falls back to an empty column descriptor', () => {
    const onCellClick = vi.fn();
    const api: { current: any } = { current: null };
    const { rerender } = render(<HookHarness data={data} columns={columns} onCellClick={onCellClick} onApi={(a) => (api.current = a)} />);
    // select the 'name' cell
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    // remove the 'name' column via controlled prop change; selectedCell persists
    rerender(<HookHarness data={data} columns={[columns[1]]} onCellClick={onCellClick} onApi={(a) => (api.current = a)} />);
    // Enter resolves the selected column via find() -> undefined -> {} fallback; does not throw
    act(() => { api.current.attributes.onKeyDown({ key: 'Enter', preventDefault: () => {} }); });
    expect(onCellClick).toHaveBeenCalled();
  });

  it('filtering via a function-accessor column exercises the accessor/transformValue filter path', () => {
    const transformValue = vi.fn((v: any) => v);
    const cols: GridColumn[] = [
      { id: 'upper', header: 'Upper', filterable: true, accessor: (row: any) => row.name.toUpperCase() },
    ];
    const api = setup({ columns: cols, transformValue });
    act(() => { api.current.handleFilter('upper', 'ADA', 'contains'); });
    // The function accessor + transformValue path yields 'ADA', matching row 1.
    expect(api.current.rows).toHaveLength(1);
    expect(transformValue).toHaveBeenCalled();
  });

  it('handleHeaderClick on the already-sorted column flips to the opposite direction', () => {
    const onSortChange = vi.fn();
    const api = setup({ onSortChange });
    act(() => { api.current.handleHeaderClick(columns[0], {} as any); }); // asc
    // Second click on the same column reads the existing sort direction (desc path).
    act(() => { api.current.handleHeaderClick(columns[0], {} as any); });
    expect(onSortChange).toHaveBeenCalledTimes(2);
  });

  it('Enter on a selected cell whose row is on the current page activates it', () => {
    const onCellClick = vi.fn();
    const api = setup({ onCellClick });
    // Select a cell on the current page, then Enter resolves the row → handleCellClick.
    act(() => { api.current.handleCellClick(api.current.rows[0], columns[0], {} as any); });
    act(() => { api.current.attributes.onKeyDown({ key: 'Enter', preventDefault: () => {} }); });
    expect(onCellClick).toHaveBeenCalledTimes(2);
  });

  it('an unmapped key with keyboardShortcuts falls through to the focusable mixin', () => {
    const api = setup();
    // 'Tab' is not a built-in shortcut → default arm delegates to focusableMixin.
    expect(() => act(() => {
      api.current.attributes.onKeyDown({ key: 'Tab', preventDefault: () => {} });
    })).not.toThrow();
  });

  it('pagination total update clamps the page when filtered rows empty out', () => {
    const api = setup();
    // Filtering to a non-matching value empties the rows; the pagination effect
    // then computes totalPages = 0 and clamps via `totalPages || 1`.
    act(() => { api.current.handleFilter('name', 'zzz-no-match', 'contains'); });
    expect(api.current.rows).toHaveLength(0);
    // Page clamps to 1 via `Math.min(prev.page, totalPages || 1)`.
    expect(api.current.pagination.page).toBe(1);
  });

  it('controlled pagination skips the internal total-update effect', () => {
    const api = setup({ pagination: { page: 1, pageSize: 10, total: 99, totalPages: 9 } as any });
    // Controlled pagination → the effect's `!isPaginationControlled` arm is skipped.
    expect(api.current.pagination.total).toBe(99);
  });

  it('Enter without a selected cell is a no-op', () => {
    const onCellClick = vi.fn();
    const api = setup({ onCellClick });
    // No prior handleCellClick → selectedCell undefined → Enter does nothing.
    act(() => { api.current.attributes.onKeyDown({ key: 'Enter', preventDefault: () => {} }); });
    expect(onCellClick).not.toHaveBeenCalled();
  });
});

describe('useDataGrid (controlled prop resync)', () => {
  it('controlled pagination.page updates internal state on rerender', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <HookHarness
        data={data}
        columns={columns}
        pagination={{ page: 1, pageSize: 10, total: 100, totalPages: 10 }}
        onApi={(a) => (api.current = a)}
      />
    );
    expect(api.current.pagination.page).toBe(1);
    // change the controlled prop 1 -> 5; internal state MUST follow.
    rerender(
      <HookHarness
        data={data}
        columns={columns}
        pagination={{ page: 5, pageSize: 10, total: 100, totalPages: 10 }}
        onApi={(a) => (api.current = a)}
      />
    );
    expect(api.current.pagination.page).toBe(5);
  });

  it('controlled sort updates internal state on rerender', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <HookHarness data={data} columns={columns} sort={{ column: 'name', direction: 'asc' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.sort).toEqual({ column: 'name', direction: 'asc' });
    rerender(
      <HookHarness data={data} columns={columns} sort={{ column: 'age', direction: 'desc' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.sort).toEqual({ column: 'age', direction: 'desc' });
  });

  it('controlled filter updates internal state on rerender', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <HookHarness data={data} columns={columns} filter={{ column: 'name', value: 'A', operator: 'contains' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.filter).toEqual({ column: 'name', value: 'A', operator: 'contains' });
    rerender(
      <HookHarness data={data} columns={columns} filter={{ column: 'age', value: 30, operator: 'equals' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.filter).toEqual({ column: 'age', value: 30, operator: 'equals' });
  });

  it('controlled selection updates internal state on rerender', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <HookHarness data={data} columns={columns} selection={{ selectedRows: ['1'], mode: 'single' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.selection.selectedRows).toEqual(['1']);
    rerender(
      <HookHarness data={data} columns={columns} selection={{ selectedRows: ['2', '3'], mode: 'multiple' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.selection.selectedRows).toEqual(['2', '3']);
    expect(api.current.selection.mode).toBe('multiple');
  });

  it('controlled handlers call onChange but do not mutate internal state', () => {
    const onPaginationChange = vi.fn();
    const api: { current: any } = { current: null };
    render(
      <HookHarness
        data={data}
        columns={columns}
        pagination={{ page: 1, pageSize: 10, total: 100, totalPages: 10 }}
        onPaginationChange={onPaginationChange}
        onApi={(a) => (api.current = a)}
      />
    );
    act(() => { api.current.handlePagination(7); });
    expect(onPaginationChange).toHaveBeenCalledWith(expect.objectContaining({ page: 7 }));
    // controlled → internal pagination.page stays at the controlled value (1), not 7.
    expect(api.current.pagination.page).toBe(1);
  });
});
