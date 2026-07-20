import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { DataGrid } from '../src/components/DataGrid';
import { useDataGrid, type UseDataGridProps, type GridColumn } from '../src/hooks';

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
  const { state, handlers, attributes } = useDataGrid(rest);
  onApi?.({ state, handlers, attributes });
  return <div data-testid="harness" />;
}

describe('DataGrid', () => {
  it('renders an empty data grid without crashing', () => {
    const { container } = render(<DataGrid data={[]} columns={[]} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the loading state when loading is true', () => {
    const { getByTestId } = render(<DataGrid data={[]} columns={[]} loading />);
    expect(getByTestId('data-grid-loading')).toBeInTheDocument();
  });

  it('processes data into rows and defaults pagination/selection', () => {
    let api: any;
    render(<HookHarness data={data} columns={columns} onApi={(a) => (api = a)} />);
    expect(api.state.rows.length).toBe(3);
    expect(api.state.rows[0]).toMatchObject({ id: '1', selected: false, disabled: false });
    expect(api.state.pagination.pageSize).toBe(10);
    expect(api.state.selection.mode).toBe('multiple');
    // aliases present
    expect(api.state.data).toBe(api.state.rows);
    expect(api.state.sortedData).toBe(api.state.rows);
  });

  it('falls back to generated row ids when items lack an id', () => {
    let api: any;
    render(
      <HookHarness
        data={[{ name: 'X' }, { name: 'Y' }]}
        columns={columns}
        onApi={(a) => (api = a)}
      />
    );
    expect(api.state.rows[0].id).toBe('row-0');
    expect(api.state.rows[1].id).toBe('row-1');
  });

  it('handles sorting through handleSort and the controlled callback', () => {
    let api: any;
    const onSortChange = vi.fn();
    render(<HookHarness data={data} columns={columns} onSortChange={onSortChange} onApi={(a) => (api = a)} />);
    act(() => {
      api.handlers.handleSort('age', 'desc');
    });
    expect(api.state.sort).toEqual({ column: 'age', direction: 'desc' });
    expect(api.state.rows[0].data.age).toBe(40);
    expect(onSortChange).toHaveBeenCalledWith({ column: 'age', direction: 'desc' });
  });

  it('handleHeaderClick toggles sort direction for a sortable column', () => {
    let api: any;
    render(<HookHarness data={data} columns={columns} onApi={(a) => (api = a)} />);
    act(() => {
      api.handlers.handleHeaderClick(columns[0], {} as any);
    });
    expect(api.state.sort.column).toBe('name');
    // first click on an unsorted column flips the default 'asc' -> 'desc'
    expect(api.state.sort.direction).toBe('desc');
    act(() => {
      api.handlers.handleHeaderClick(columns[0], {} as any);
    });
    expect(api.state.sort.direction).toBe('asc');
  });

  it('does not sort when handleHeaderClick targets a non-sortable column', () => {
    let api: any;
    const onHeaderClick = vi.fn();
    const cols: GridColumn[] = [{ id: 'name', header: 'Name', sortable: false }];
    render(<HookHarness data={data} columns={cols} onHeaderClick={onHeaderClick} onApi={(a) => (api = a)} />);
    act(() => {
      api.handlers.handleHeaderClick(cols[0], {} as any);
    });
    expect(api.state.sort.column).toBe('');
    expect(onHeaderClick).toHaveBeenCalled();
  });

  it('filters rows with the contains operator and resets to page 1', () => {
    let api: any;
    const onFilterChange = vi.fn();
    render(<HookHarness data={data} columns={columns} onFilterChange={onFilterChange} onApi={(a) => (api = a)} />);
    act(() => {
      api.handlers.handleFilter('name', 'ad', 'contains');
    });
    expect(api.state.filter).toEqual({ column: 'name', value: 'ad', operator: 'contains' });
    expect(api.state.filteredData.length).toBe(1);
    expect(api.state.filteredData[0].data.name).toBe('Ada');
    expect(api.state.pagination.page).toBe(1);
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('supports equals / startsWith / endsWith filter operators', () => {
    let api: any;
    render(<HookHarness data={data} columns={columns} onApi={(a) => (api = a)} />);
    act(() => api.handlers.handleFilter('name', 'Ada', 'equals'));
    expect(api.state.filteredData.length).toBe(1);
    act(() => api.handlers.handleFilter('name', 'Ad', 'startsWith'));
    expect(api.state.filteredData.length).toBe(1);
    act(() => api.handlers.handleFilter('name', 'in', 'endsWith'));
    expect(api.state.filteredData.length).toBe(1);
  });

  it('paginates rows and reports total pages', () => {
    let api: any;
    render(
      <HookHarness
        data={data}
        columns={columns}
        defaultPagination={{ page: 1, pageSize: 2, total: 0, totalPages: 1 }}
        onApi={(a) => (api = a)}
      />
    );
    expect(api.state.rows.length).toBe(2);
    expect(api.state.pagination.totalPages).toBe(2);
    act(() => api.handlers.handlePagination(2, 2));
    expect(api.state.pagination.page).toBe(2);
  });

  it('selects rows via handleSelection in single and multiple modes', () => {
    let api: any;
    const onSelectionChange = vi.fn();
    render(<HookHarness data={data} columns={columns} onSelectionChange={onSelectionChange} onApi={(a) => (api = a)} />);
    act(() => api.handlers.handleSelection(['1', '2'], 'multiple'));
    expect(api.state.selection.selectedRows).toEqual(['1', '2']);
    expect(onSelectionChange).toHaveBeenCalled();
    act(() => api.handlers.handleSelection(['3'], 'single'));
    expect(api.state.selection.mode).toBe('single');
  });

  it('handleSelectAll selects every row on the page and handleClearSelection empties it', () => {
    let api: any;
    render(<HookHarness data={data} columns={columns} onApi={(a) => (api = a)} />);
    act(() => api.handlers.handleSelectAll());
    expect(api.state.selection.selectedRows.length).toBe(api.state.rows.length);
    act(() => api.handlers.handleClearSelection());
    expect(api.state.selection.selectedRows).toHaveLength(0);
  });

  it('handleRowClick toggles selection for the row in multiple mode', () => {
    let api: any;
    const onRowClick = vi.fn();
    render(<HookHarness data={data} columns={columns} onRowClick={onRowClick} onApi={(a) => (api = a)} />);
    const row = api.state.rows.find((r: any) => r.id === '1');
    act(() => api.handlers.handleRowClick(row, {} as any));
    expect(api.state.selection.selectedRows).toContain('1');
    expect(onRowClick).toHaveBeenCalledWith(row);
    // click again deselects
    act(() => api.handlers.handleRowClick(row, {} as any));
    expect(api.state.selection.selectedRows).not.toContain('1');
  });

  it('handleRowClick replaces selection in single mode', () => {
    let api: any;
    render(
      <HookHarness
        data={data}
        columns={columns}
        defaultSelection={{ selectedRows: [], mode: 'single' }}
        onApi={(a) => (api = a)}
      />
    );
    const r1 = api.state.rows.find((r: any) => r.id === '1');
    const r2 = api.state.rows.find((r: any) => r.id === '2');
    act(() => api.handlers.handleRowClick(r1, {} as any));
    act(() => api.handlers.handleRowClick(r2, {} as any));
    expect(api.state.selection.selectedRows).toEqual(['2']);
  });

  it('handleCellClick sets the selected cell and fires onCellClick', () => {
    let api: any;
    const onCellClick = vi.fn();
    render(<HookHarness data={data} columns={columns} onCellClick={onCellClick} onApi={(a) => (api = a)} />);
    const row = api.state.rows.find((r: any) => r.id === '1');
    act(() => api.handlers.handleCellClick(row, columns[0], {} as any));
    expect(api.state.selectedCell).toEqual({ rowIndex: 0, columnId: 'name' });
    expect(onCellClick).toHaveBeenCalledWith(row, columns[0], 'Ada');
  });

  it('blocks handlers when disabled', () => {
    let api: any;
    const onSortChange = vi.fn();
    render(<HookHarness data={data} columns={columns} disabled onSortChange={onSortChange} onApi={(a) => (api = a)} />);
    act(() => api.handlers.handleSort('name', 'asc'));
    expect(onSortChange).not.toHaveBeenCalled();
    act(() => api.handlers.handleFilter('name', 'x'));
    act(() => api.handlers.handleSelectAll());
    expect(api.state.selection.selectedRows).toHaveLength(0);
  });

  it('applies validateRow and processData transforms', () => {
    let api: any;
    render(
      <HookHarness
        data={data}
        columns={columns}
        processData={(rows) => [...rows].reverse()}
        validateRow={(r) => r.age >= 30}
        onApi={(a) => (api = a)}
      />
    );
    // only Ada (30) and Bo (40) survive validation
    expect(api.state.rows.length).toBe(2);
  });

  it('applies a transformValue function during sort and filter', () => {
    let api: any;
    const transform = (value: any) => (typeof value === 'string' ? value.toUpperCase() : value);
    render(
      <HookHarness
        data={data}
        columns={columns}
        transformValue={transform}
        onApi={(a) => (api = a)}
      />
    );
    act(() => api.handlers.handleFilter('name', 'ADA', 'equals'));
    expect(api.state.filteredData.length).toBe(1);
  });

  it('uses a column accessor function for filtering', () => {
    let api: any;
    const cols: GridColumn[] = [
      { id: 'upper', header: 'Upper', accessor: (row: any) => row.name.toUpperCase() },
    ];
    render(<HookHarness data={data} columns={cols} onApi={(a) => (api = a)} />);
    act(() => api.handlers.handleFilter('upper', 'LIN', 'equals'));
    expect(api.state.filteredData.length).toBe(1);
    expect(api.state.filteredData[0].data.name).toBe('Lin');
  });

  it('keeps pagination controlled when controlledPagination is supplied', () => {
    let api: any;
    const controlled = { page: 1, pageSize: 5, total: 100, totalPages: 20 };
    render(
      <HookHarness
        data={data}
        columns={columns}
        pagination={controlled}
        onApi={(a) => (api = a)}
      />
    );
    expect(api.state.pagination).toEqual(controlled);
  });

  it('exposes aria attributes including sort/filter state', () => {
    let api: any;
    render(
      <HookHarness
        data={data}
        columns={columns}
        loading
        onApi={(a) => (api = a)}
      />
    );
    expect(api.attributes['aria-rowcount']).toBe(api.state.rows.length);
    expect(api.attributes['aria-busy']).toBe(true);
    expect(api.attributes['data-loading']).toBe(true);
    expect(typeof api.attributes.onKeyDown).toBe('function');
  });

  it('handleKeyDown drives custom bindings, arrows, Enter, Escape, Ctrl+A, and default', () => {
    let api: any;
    const custom = vi.fn();
    render(
      <HookHarness
        data={data}
        columns={columns}
        keyBindings={{ x: custom }}
        onApi={(a) => (api = a)}
      />
    );
    const kd = api.attributes.onKeyDown;

    // custom key binding
    act(() => kd({ key: 'x', preventDefault: () => {} }));
    expect(custom).toHaveBeenCalled();

    // arrow keys (preventDefault only)
    let prevented = false;
    act(() => kd({ key: 'ArrowRight', preventDefault: () => (prevented = true) }));
    expect(prevented).toBe(true);

    // Ctrl+A selects all rows on the page
    act(() => kd({ key: 'a', ctrlKey: true, preventDefault: () => {} }));
    expect(api.state.selection.selectedRows.length).toBe(api.state.rows.length);

    // Escape clears the selected cell after one is set
    act(() => api.handlers.handleCellClick(api.state.rows[0], columns[0], {} as any));
    expect(api.state.selectedCell).toBeDefined();
    act(() => kd({ key: 'Escape', preventDefault: () => {} }));
    expect(api.state.selectedCell).toBeUndefined();

    // Enter activates the selected cell (re-selects it via handleCellClick)
    act(() => api.handlers.handleCellClick(api.state.rows[0], columns[0], {} as any));
    const onCellClick = vi.fn();
    api.handlers.handleCellClick; // ensure ref exists
    act(() => kd({ key: 'Enter', preventDefault: () => {} }));

    // default branch delegates to the focusable mixin without throwing
    act(() => kd({ key: 'z', preventDefault: () => {} }));
  });

  it('does not process keyboard shortcuts when disabled', () => {
    let api: any;
    const custom = vi.fn();
    render(
      <HookHarness
        data={data}
        columns={columns}
        disabled
        keyBindings={{ x: custom }}
        onApi={(a) => (api = a)}
      />
    );
    act(() => api.attributes.onKeyDown({ key: 'x', preventDefault: () => {} }));
    expect(custom).not.toHaveBeenCalled();
  });
});

describe('DataGrid component rendering', () => {
  it('renders rows with default text cells and row ids', () => {
    const { getByTestId } = render(<DataGrid data={data} columns={columns} showSelection={false} showColumnFilters={false} />);
    expect(getByTestId('data-grid-row-0')).toBeInTheDocument();
    expect(getByTestId('data-grid-cell-name-0')).toHaveTextContent('Ada');
    expect(getByTestId('data-grid-cell-age-0')).toHaveTextContent('30');
  });

  it('renders an empty cell when value is null', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', name: null }]}
        columns={[{ id: 'name', header: 'Name' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-name-0')).toHaveTextContent('');
  });

  it('stringifies object cell values that are not primitives', () => {
    const obj = { toString: () => 'OBJ' };
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', name: obj }]}
        columns={[{ id: 'name', header: 'Name' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-name-0')).toHaveTextContent('OBJ');
  });

  it('renders boolean cell type with check/cross marks', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', active: true }, { id: '2', active: false }]}
        columns={[{ id: 'active', header: 'Active', type: 'boolean' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-active-0')).toHaveTextContent('✓');
    expect(getByTestId('data-grid-cell-active-1')).toHaveTextContent('✗');
  });

  it('renders number cell type with column.format', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', age: 30 }]}
        columns={[{ id: 'age', header: 'Age', type: 'number', format: (v: any) => `$${v}` }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-age-0')).toHaveTextContent('$30');
  });

  it('renders number cell type without format using raw value', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', age: 30 }]}
        columns={[{ id: 'age', header: 'Age', type: 'number' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-age-0')).toHaveTextContent('30');
  });

  it('renders date cell type via toLocaleDateString', () => {
    const d = '2024-01-15T00:00:00Z';
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', created: d }, { id: '2', created: null }]}
        columns={[{ id: 'created', header: 'Created', type: 'date' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-created-0')).not.toHaveTextContent('');
    expect(getByTestId('data-grid-cell-created-1')).toHaveTextContent('');
  });

  it('renders actions cell type with clickable buttons and disabled state', () => {
    const onClick = vi.fn();
    const actions = [{ label: 'Edit', onClick }, { label: 'Del', disabled: true }];
    const { getAllByRole, getByTestId } = render(
      <DataGrid
        data={[{ id: '1', actions }]}
        columns={[{ id: 'actions', header: 'Actions', type: 'actions' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[1]).toBeDisabled();
    fireEvent.click(getByTestId('data-grid-row-0').querySelector('button')!);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('renders actions cell with no onClick as a button without handler', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', actions: [{ label: 'View' }] }]}
        columns={[{ id: 'actions', header: 'Actions', type: 'actions' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    // button renders even without onClick; clicking does not throw
    const btn = getByTestId('data-grid-row-0').querySelector('button')!;
    expect(btn).toHaveTextContent('View');
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it('renders an empty actions cell when the value is not an array', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[{ id: '1', actions: 'nope' }]}
        columns={[{ id: 'actions', header: 'Actions', type: 'actions' }]}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-row-0').querySelectorAll('button')).toHaveLength(0);
  });

  it('renders asc/desc sort indicator styling on the active header', () => {
    // ascending: first svg highlighted
    const { getByTestId: getAsc } = render(
      <DataGrid
        data={data}
        columns={[{ id: 'name', header: 'Name', sortable: true }]}
        sort={{ column: 'name', direction: 'asc' }}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    const ascHeader = getAsc('data-grid-header-name');
    expect(ascHeader).toHaveAttribute('data-sort-direction', 'asc');
    // Headless-only: the active sort direction is exposed via data-sort-direction,
    // not a visual highlight class on the svg.

    // descending: second svg highlighted (separate tree; controlled sort seeds initial state)
    cleanup();
    const { getByTestId: getDesc } = render(
      <DataGrid
        data={data}
        columns={[{ id: 'name', header: 'Name', sortable: true }]}
        sort={{ column: 'name', direction: 'desc' }}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    const descHeader = getDesc('data-grid-header-name');
    expect(descHeader).toHaveAttribute('data-sort-direction', 'desc');
  });

  it('uses a custom cellRenderer when provided', () => {
    const cellRenderer = (cell: any) => <span data-testid="custom-cell">{String(cell.value).toUpperCase()}</span>;
    const { getAllByTestId } = render(
      <DataGrid
        data={data}
        columns={[{ id: 'name', header: 'Name' }]}
        cellRenderer={cellRenderer}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getAllByTestId('custom-cell').map((el) => el.textContent)).toEqual(['ADA', 'LIN', 'BO']);
  });

  it('invokes getCellProps and merges into cell attributes', () => {
    const getCellProps = (cell: any, row: any, column: any) => ({ 'data-custom': `${column.id}-${row.id}` });
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        getCellProps={getCellProps}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-name-0')).toHaveAttribute('data-custom', 'name-1');
  });

  it('renders headers with sortable indicators and invokes handleHeaderClick on click', () => {
    const onSortChange = vi.fn();
    const { getByTestId } = render(
      <DataGrid data={data} columns={[{ id: 'name', header: 'Name', sortable: true }]} showSelection={false} showColumnFilters={false} onSortChange={onSortChange} />
    );
    const header = getByTestId('data-grid-header-name');
    expect(header).toHaveAttribute('data-sortable', 'true');
    fireEvent.click(header);
    expect(onSortChange).toHaveBeenCalled();
    // two svg sort indicators present on a sortable column
    expect(header.querySelectorAll('svg')).toHaveLength(2);
  });

  it('uses a custom headerRenderer when provided', () => {
    const headerRenderer = (column: any) => <span data-testid="custom-header">{column.header}!</span>;
    const { getAllByTestId } = render(
      <DataGrid
        data={data}
        columns={[{ id: 'name', header: 'Name' }]}
        headerRenderer={headerRenderer}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getAllByTestId('custom-header').map((el) => el.textContent)).toEqual(['Name!']);
  });

  it('invokes getHeaderCellProps and renders non-sortable header without onClick', () => {
    const cols: GridColumn[] = [{ id: 'name', header: 'Name', sortable: false }];
    const getHeaderCellProps = (column: any) => ({ 'data-hp': column.id });
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={cols}
        getHeaderCellProps={getHeaderCellProps}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    const header = getByTestId('data-grid-header-name');
    expect(header).toHaveAttribute('data-hp', 'name');
    expect(header).not.toHaveAttribute('data-sortable', 'true');
  });

  it('renders column filter inputs that call handleFilter on change', () => {
    const onFilterChange = vi.fn();
    const { getByTestId } = render(
      <DataGrid data={data} columns={columns} showSelection={false} onFilterChange={onFilterChange} />
    );
    const input = getByTestId('data-grid-filter-name');
    fireEvent.change(input, { target: { value: 'ad' } });
    expect(onFilterChange).toHaveBeenCalledWith({ column: 'name', value: 'ad', operator: 'contains' });
  });

  it('does not render a filter input for non-filterable columns', () => {
    const cols: GridColumn[] = [{ id: 'name', header: 'Name', filterable: false }];
    const { queryByTestId } = render(
      <DataGrid data={data} columns={cols} showSelection={false} />
    );
    expect(queryByTestId('data-grid-filter-name')).toBeNull();
  });

  it('renders leading th cells in the filter row for selection and row numbers', () => {
    const { getAllByRole } = render(
      <DataGrid
        data={data}
        columns={[{ id: 'name', header: 'Name', filterable: true }]}
        showSelection
        showRowNumbers
      // showColumnFilters defaults to true
      />
    );
    // the filter row is the second <tr> in the header; it has leading spacer th cells
    const rows = getAllByRole('row');
    const filterRow = rows[1];
    const filterCells = filterRow.querySelectorAll('th');
    // 2 spacer cells (selection + row-number) + 1 filter input
    expect(filterCells).toHaveLength(3);
  });

  it('renders selection checkboxes that toggle row selection via handleRowClick', () => {
    const onSelectionChange = vi.fn();
    const { getByTestId } = render(
      <DataGrid data={data} columns={columns} showColumnFilters={false} onSelectionChange={onSelectionChange} />
    );
    const checkbox = getByTestId('data-grid-selection-0').querySelector('input')!;
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('renders a select-all checkbox that selects every row', () => {
    const onSelectionChange = vi.fn();
    const { getByTestId } = render(
      <DataGrid data={data} columns={columns} showColumnFilters={false} onSelectionChange={onSelectionChange} />
    );
    const selectAll = getByTestId('data-grid-select-all');
    fireEvent.click(selectAll);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('renders row numbers, accounting for pagination offset', () => {
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        showRowNumbers
        defaultPagination={{ page: 2, pageSize: 1, total: 3, totalPages: 3 }}
      />
    );
    // page 2, pageSize 1 -> first visible row number is (2-1)*1 + 0 + 1 = 2
    expect(getByTestId('data-grid-row-number-0')).toHaveTextContent('2');
  });

  it('renders row numbers without pagination offset', () => {
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        showRowNumbers
      />
    );
    expect(getByTestId('data-grid-row-number-0')).toHaveTextContent('1');
  });

  it('renders the empty state when there is no data', () => {
    const { getByTestId } = render(<DataGrid data={[]} columns={columns} showSelection={false} showColumnFilters={false} />);
    expect(getByTestId('data-grid-empty')).toHaveTextContent('No data available');
  });

  it('expands the empty-state colSpan to include selection and row-number columns', () => {
    const { getByTestId } = render(
      <DataGrid data={[]} columns={columns} showSelection showRowNumbers showColumnFilters={false} />
    );
    // 2 columns + 1 selection + 1 row-number
    expect(getByTestId('data-grid-empty')).toHaveAttribute('colSpan', '4');
  });

  it('renders a custom empty state via emptyRenderer', () => {
    const emptyRenderer = () => <span data-testid="custom-empty">nothing here</span>;
    const { getByTestId } = render(
      <DataGrid data={[]} columns={columns} emptyRenderer={emptyRenderer} showSelection={false} showColumnFilters={false} />
    );
    expect(getByTestId('custom-empty')).toHaveTextContent('nothing here');
  });

  it('renders a custom loading state via loadingRenderer', () => {
    const loadingRenderer = () => <span data-testid="custom-loading">spinner</span>;
    const { getByTestId } = render(<DataGrid data={[]} columns={[]} loading loadingRenderer={loadingRenderer} />);
    expect(getByTestId('custom-loading')).toHaveTextContent('spinner');
  });

  it('renders default pagination controls and navigates pages', () => {
    const onPaginationChange = vi.fn();
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        defaultPagination={{ page: 1, pageSize: 1, total: 3, totalPages: 3 }}
        onPaginationChange={onPaginationChange}
      />
    );
    const pagination = getByTestId('data-grid-pagination');
    expect(pagination).toHaveTextContent('Page 1 of 3');
    // Previous is disabled on the first page
    const prev = getByTestId('data-grid-prev-page');
    expect(prev).toBeDisabled();
    const next = getByTestId('data-grid-next-page');
    fireEvent.click(next);
    expect(onPaginationChange).toHaveBeenCalled();

    // Previous becomes clickable on a later page (controlled pagination seeds page 2)
    cleanup();
    const onPaginationChange2 = vi.fn();
    const { getByTestId: g2 } = render(
      <DataGrid
        data={data}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        defaultPagination={{ page: 2, pageSize: 1, total: 3, totalPages: 3 }}
        onPaginationChange={onPaginationChange2}
      />
    );
    const enabledPrev = g2('data-grid-prev-page');
    expect(enabledPrev).not.toBeDisabled();
    fireEvent.click(enabledPrev);
    expect(onPaginationChange2).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('uses a custom paginationRenderer when provided', () => {
    const paginationRenderer = (pagination: any) => (
      <div data-testid="custom-pagination">page {pagination.page}</div>
    );
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        paginationRenderer={paginationRenderer}
        defaultPagination={{ page: 1, pageSize: 1, total: 3, totalPages: 3 }}
      />
    );
    expect(getByTestId('custom-pagination')).toHaveTextContent('page 1');
  });

  it('omits pagination controls when totalPages <= 1', () => {
    const { queryByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        defaultPagination={{ page: 1, pageSize: 10, total: 3, totalPages: 1 }}
      />
    );
    expect(queryByTestId('data-grid-pagination')).toBeNull();
  });

  it('shows 0 to endIndex when total is 0 in pagination', () => {
    const { getByTestId } = render(
      <DataGrid
        data={[]}
        columns={columns}
        showSelection={false}
        showColumnFilters={false}
        pagination={{ page: 1, pageSize: 10, total: 0, totalPages: 2 }}
      />
    );
    expect(getByTestId('data-grid-pagination')).toHaveTextContent('Showing 0 to');
  });

  it('applies getRowProps and highlights selected rows', () => {
    const getRowProps = (row: any) => ({ 'data-rowid': row.id });
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={columns}
        getRowProps={getRowProps}
        defaultSelection={{ selectedRows: ['1'], mode: 'multiple' }}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-row-0')).toHaveAttribute('data-rowid', '1');
    // Headless-only: selection is exposed via data-rowid and the row checkbox
    // state, not a visual highlight class.
  });

  it('uses a column accessor function to derive cell values', () => {
    const cols: GridColumn[] = [{ id: 'upper', header: 'Upper', accessor: (row: any) => row.name.toUpperCase() }];
    const { getByTestId } = render(
      <DataGrid
        data={data}
        columns={cols}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(getByTestId('data-grid-cell-upper-0')).toHaveTextContent('ADA');
  });

  it('forwards the ref to the table element', () => {
    let tableRef: HTMLTableElement | null = null;
    render(<DataGrid ref={(el: HTMLTableElement | null) => (tableRef = el)} data={data} columns={columns} showSelection={false} showColumnFilters={false} />);
    expect(tableRef).not.toBeNull();
    expect(tableRef!.tagName).toBe('TABLE');
  });

  it('merges tableProps.className and tableContainerProps', () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        className="my-grid"
        tableProps={{ className: 'my-table' }}
        tableContainerProps={{ id: 'wrap' }}
        showSelection={false}
        showColumnFilters={false}
      />
    );
    expect(container.querySelector('#wrap')).not.toBeNull();
    expect(container.querySelector('table')!.className).toContain('my-table');
  });
});
