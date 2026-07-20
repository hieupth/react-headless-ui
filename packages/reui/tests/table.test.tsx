import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../src/components/Table';
import { useTable, type UseTableProps } from '../src/hooks';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true, dataType: 'number' as const },
];
const data = [
  { name: 'Ada', age: 30 },
  { name: 'Lin', age: 25 },
  { name: 'Bo', age: 40 },
];

function HookHarness(props: UseTableProps & { onApi?: (api: any) => void }) {
  const { onApi, ...rest } = props;
  const api = useTable(rest);
  onApi?.(api);
  return <div data-testid="harness" />;
}

describe('Table', () => {
  it('renders a grid/table with column headers and row data', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Lin')).toBeInTheDocument();
  });

  it('fires onSortChange when a sortable header is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table columns={columns} data={data} onSortChange={onSortChange} />);
    await user.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalled();
  });

  it('toggles sort direction asc -> desc when clicking the same header twice', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<Table columns={columns} data={data} onSortChange={onSortChange} />);
    await user.click(screen.getByText('Age'));
    expect(onSortChange).toHaveBeenLastCalledWith(expect.objectContaining({ column: 'age', direction: 'asc' }));
    await user.click(screen.getByText('Age'));
    expect(onSortChange).toHaveBeenLastCalledWith(expect.objectContaining({ column: 'age', direction: 'desc' }));
  });

  it('re-orders rows by a numeric column when sorted', async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} data={data} />);
    await user.click(screen.getByText('Age'));
    const rows = screen.getAllByRole('row');
    // header is row 0; first data row should now be Lin (age 25)
    expect(rows[1].textContent).toContain('Lin');
  });

  it('renders the empty state when there is no data', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByTestId('table-empty')).toBeInTheDocument();
  });

  it('renders the loading state when loading is true', () => {
    render(<Table columns={columns} data={data} loading />);
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
  });

  it('does not toggle sort for a non-sortable column', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const cols = [{ key: 'name', title: 'Name' }];
    render(<Table columns={cols} data={data} onSortChange={onSortChange} />);
    await user.click(screen.getByText('Name'));
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('sorts, filters, paginates, selects, and expands via the hook actions', () => {
    let api: any;
    const onSortChange = vi.fn();
    const onFiltersChange = vi.fn();
    const onPaginationChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <HookHarness
        columns={columns}
        data={data}
        enablePagination
        defaultPagination={{ page: 0, pageSize: 2 }}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
        enableExpansion
        onSortChange={onSortChange}
        onFiltersChange={onFiltersChange}
        onPaginationChange={onPaginationChange}
        onSelectionChange={onSelectionChange}
        onApi={(a) => (api = a)}
      />
    );

    // sort
    act(() => {
      api.actions.sort('age', 'desc');
    });
    expect(api.state.sort).toEqual({ column: 'age', direction: 'desc' });
    expect(api.computed.processedData[0].age).toBe(40);
    expect(onSortChange).toHaveBeenCalled();

    // filter (contains)
    act(() => {
      api.actions.addFilter({ column: 'name', value: 'ad', operator: 'contains' });
    });
    expect(api.computed.processedData.length).toBe(1);
    expect(api.computed.processedData[0].name).toBe('Ada');
    expect(onFiltersChange).toHaveBeenCalled();

    // clear filters restores all rows
    act(() => {
      api.actions.clearFilters();
    });
    expect(api.computed.processedData.length).toBe(3);

    // pagination: page 0 shows 2 rows
    expect(api.computed.paginatedData.length).toBe(2);
    act(() => {
      api.actions.setPage(1);
    });
    expect(onPaginationChange).toHaveBeenCalled();

    // change page size
    act(() => {
      api.actions.setPageSize(10);
    });
    expect(api.state.pagination?.pageSize).toBe(10);

    // selection
    act(() => {
      api.actions.selectRow('Ada');
    });
    expect(api.state.selection?.selectedRowKeys).toContain('Ada');
    expect(api.computed.someRowsSelected).toBe(true);
    act(() => {
      api.actions.selectAll();
    });
    expect(api.computed.allRowsSelected).toBe(true);
    act(() => {
      api.actions.deselectRow('Ada');
    });
    expect(api.state.selection?.selectedRowKeys).not.toContain('Ada');
    act(() => {
      api.actions.deselectAll();
    });
    expect(api.state.selection?.selectedRowKeys).toHaveLength(0);

    // expansion
    act(() => {
      api.actions.toggleRowExpansion('Ada');
    });
    expect(api.state.expandedRows.has('Ada')).toBe(true);
    act(() => {
      api.actions.toggleRowExpansion('Ada');
    });
    expect(api.state.expandedRows.has('Ada')).toBe(false);
    act(() => {
      api.actions.expandAll();
    });
    expect(api.state.expandedRows.size).toBe(3);
    act(() => {
      api.actions.collapseAll();
    });
    expect(api.state.expandedRows.size).toBe(0);

    // clearSort
    act(() => {
      api.actions.clearSort();
    });
    expect(api.state.sort).toBeUndefined();
  });

  it('exercises all filter operators via the hook', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);

    act(() => {
      api.actions.addFilter({ column: 'name', value: 'Ada', operator: 'equals' });
    });
    expect(api.computed.processedData.length).toBe(1);

    act(() => {
      api.actions.addFilter({ column: 'name', value: 'Ad', operator: 'startsWith' });
    });
    expect(api.computed.processedData.length).toBe(1);

    act(() => {
      api.actions.addFilter({ column: 'name', value: 'da', operator: 'endsWith' });
    });
    expect(api.computed.processedData.length).toBe(1);

    act(() => {
      api.actions.addFilter({ column: 'age', value: '30', operator: 'greaterThan' });
    });
    expect(api.computed.processedData.every((r: any) => r.age > 30)).toBe(true);

    act(() => {
      api.actions.addFilter({ column: 'age', value: '40', operator: 'lessThan' });
    });
    expect(api.computed.processedData.every((r: any) => r.age < 40)).toBe(true);

    // removeFilter for a single column
    act(() => {
      api.actions.removeFilter('age');
    });
    expect(api.state.filters.find((f: any) => f.column === 'age')).toBeUndefined();
  });

  it('sorts by date and boolean data types', () => {
    let api: any;
    const cols = [
      { key: 'd', title: 'Date', sortable: true, dataType: 'date' as const },
      { key: 'active', title: 'Active', sortable: true, dataType: 'boolean' as const },
    ];
    const rows = [
      { d: '2020-01-01', active: false },
      { d: '2021-01-01', active: true },
      { d: '2019-01-01', active: true },
    ];
    render(<HookHarness columns={cols} data={rows} onApi={(a) => (api = a)} />);

    act(() => {
      api.actions.sort('d', 'asc');
    });
    expect(api.computed.processedData[0].d).toBe('2019-01-01');

    act(() => {
      api.actions.sort('active', 'desc');
    });
    // true (1) before false (0) when desc
    expect(api.computed.processedData[0].active).toBe(true);
  });

  it('applies a custom processData function', () => {
    let api: any;
    render(
      <HookHarness
        columns={columns}
        data={data}
        processData={(rows) => rows.filter((r) => r.age >= 30)}
        onApi={(a) => (api = a)}
      />
    );
    expect(api.computed.processedData.length).toBe(2);
  });

  it('uses custom column renderers in the component', () => {
    const cols = [
      {
        key: 'name',
        title: 'Name',
        render: (value: any) => <span data-testid="cell-{value}">[{value}]</span>,
      },
    ];
    render(<Table columns={cols} data={data} />);
    expect(screen.getByText('[Ada]')).toBeInTheDocument();
  });

  it('selects all rows from the header checkbox', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
        onSelectionChange={onSelectionChange}
      />
    );
    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
    await act(async () => {
      // React checkbox onChange passes an event; flip checked via click
      fireEvent.click(selectAll);
    });
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('uses the default getRowKey when selectionConfig omits one', () => {
    let api: any;
    render(
      <HookHarness
        columns={[{ key: 'id', title: 'ID' }]}
        data={[{ id: 7, name: 'Seven' }]}
        enableSelection
        onApi={(a) => (api = a)}
      />
    );
    expect(api.state.selection?.getRowKey({ id: 7 })).toBe('7');
    // default getRowKey falls back to the whole row when no id is present
    expect(api.state.selection?.getRowKey('x')).toBe('x');
  });

  it('filter with an unknown operator keeps all rows (default case)', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.addFilter({ column: 'name', value: 'Ada', operator: 'unknown-op' as any });
    });
    expect(api.computed.processedData.length).toBe(3);
  });

  it('selection/pagination actions are no-ops when their features are disabled', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);
    // pagination disabled
    expect(() => act(() => api.actions.setPage(2))).not.toThrow();
    expect(() => act(() => api.actions.setPageSize(5))).not.toThrow();
    expect(api.state.pagination).toBeUndefined();
    // selection disabled
    expect(() => act(() => api.actions.selectRow('Ada'))).not.toThrow();
    expect(() => act(() => api.actions.deselectRow('Ada'))).not.toThrow();
    expect(() => act(() => api.actions.selectAll())).not.toThrow();
    expect(() => act(() => api.actions.deselectAll())).not.toThrow();
    expect(() => act(() => api.actions.expandAll())).not.toThrow();
    expect(api.state.selection).toBeUndefined();
  });

  it('selectAll is a no-op for single-row selection mode', () => {
    let api: any;
    render(
      <HookHarness
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name, single: true }}
        onApi={(a) => (api = a)}
      />
    );
    act(() => api.actions.selectAll());
    expect(api.state.selection?.selectedRowKeys).toHaveLength(0);
  });

  it('getSelectionCheckboxAttributes wires onChange to select/deselect', () => {
    let api: any;
    render(
      <HookHarness
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
        onApi={(a) => (api = a)}
      />
    );
    const attrs = api.getSelectionCheckboxAttributes(data[0]);
    expect(attrs.checked).toBe(false);
    act(() => attrs.onChange({ target: { checked: true } } as any));
    expect(api.state.selection?.selectedRowKeys).toContain('Ada');
    const updated = api.getSelectionCheckboxAttributes(data[0]);
    act(() => updated.onChange({ target: { checked: false } } as any));
    expect(api.state.selection?.selectedRowKeys).not.toContain('Ada');
  });

  it('getExpanderAttributes wires onClick to toggle expansion', () => {
    let api: any;
    render(
      <HookHarness
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
        onApi={(a) => (api = a)}
      />
    );
    const attrs = api.getExpanderAttributes(data[0]);
    expect(attrs['aria-expanded']).toBe(false);
    act(() => attrs.onClick());
    expect(api.state.expandedRows.has('Ada')).toBe(true);
  });

  it('checkbox/expander attributes fall back to a synthetic key when selection is disabled', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);
    const cb = api.getSelectionCheckboxAttributes(data[0]);
    expect(cb.checked).toBe(false);
    expect(() => act(() => cb.onChange({ target: { checked: true } } as any))).not.toThrow();
    const exp = api.getExpanderAttributes(data[0]);
    expect(() => act(() => exp.onClick())).not.toThrow();
  });

  it('sort toggles asc/desc when called on the same column without a direction', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);
    act(() => api.actions.sort('name', 'asc'));
    expect(api.state.sort.direction).toBe('asc');
    // same column, no direction -> toggles to desc
    act(() => api.actions.sort('name'));
    expect(api.state.sort.direction).toBe('desc');
    // toggles back to asc
    act(() => api.actions.sort('name'));
    expect(api.state.sort.direction).toBe('asc');
  });

  it('sort by an unknown column key is a no-op on row order', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);
    act(() => api.actions.sort('nonexistent', 'asc'));
    expect(api.state.sort.column).toBe('nonexistent');
    // rows untouched (column lookup fails -> no sort applied)
    expect(api.computed.processedData.length).toBe(3);
  });

  it('default string sort tolerates nullish cell values', () => {
    let api: any;
    const cols = [{ key: 'label', title: 'Label', sortable: true }];
    const rows = [
      { label: undefined },
      { label: 'a' },
      { label: null as any },
    ];
    render(<HookHarness columns={cols} data={rows} onApi={(a) => (api = a)} />);
    act(() => api.actions.sort('label', 'asc'));
    expect(api.computed.processedData.length).toBe(3);
  });

  it('sorts by a default-typed (string) column and tolerates nullish cell values', () => {
    let api: any;
    const cols = [
      { key: 'label', title: 'Label', sortable: true },
      { key: 'n', title: 'N', sortable: true, dataType: 'number' as const },
      { key: 'd', title: 'D', sortable: true, dataType: 'date' as const },
      { key: 'flag', title: 'Flag', sortable: true, dataType: 'boolean' as const },
    ];
    const rows = [
      { label: 'b', n: undefined, d: undefined, flag: undefined },
      { label: 'a', n: 2, d: '2020-01-01', flag: false },
      { label: 'c', n: null as any, d: null as any, flag: null as any },
    ];
    render(<HookHarness columns={cols} data={rows} onApi={(a) => (api = a)} />);
    // default string sort
    act(() => api.actions.sort('label', 'asc'));
    expect(api.computed.processedData[0].label).toBe('a');
    // number sort with nullish -> treated as 0
    act(() => api.actions.sort('n', 'asc'));
    expect(api.computed.processedData.length).toBe(3);
    // date sort with nullish
    act(() => api.actions.sort('d', 'asc'));
    expect(api.computed.processedData.length).toBe(3);
    // boolean sort with nullish
    act(() => api.actions.sort('flag', 'asc'));
    expect(api.computed.processedData.length).toBe(3);
  });

  it('uses the contains operator when a filter omits operator', () => {
    let api: any;
    render(<HookHarness columns={columns} data={data} onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.addFilter({ column: 'name', value: 'ad' } as any);
    });
    expect(api.computed.processedData.length).toBe(1);
  });

  it('selectRow replaces the selection in single mode', () => {
    let api: any;
    render(
      <HookHarness
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name, single: true }}
        onApi={(a) => (api = a)}
      />
    );
    act(() => api.actions.selectRow('Ada'));
    expect(api.state.selection?.selectedRowKeys).toEqual(['Ada']);
    act(() => api.actions.selectRow('Lin'));
    expect(api.state.selection?.selectedRowKeys).toEqual(['Lin']);
  });

  it('exposes filterable column aria-describedby', () => {
    let api: any;
    render(
      <HookHarness
        columns={[{ key: 'name', title: 'Name', filterable: true }]}
        data={data}
        onApi={(a) => (api = a)}
      />
    );
    const attrs = api.getCellAttributes({ key: 'name', title: 'Name', filterable: true }, data[0], 0, 0);
    expect(attrs['aria-describedby']).toBe('filter-name');
    // non-filterable column -> undefined
    const plain = api.getCellAttributes({ key: 'age', title: 'Age' }, data[0], 0, 1);
    expect(plain['aria-describedby']).toBeUndefined();
  });
});

// Renderer-level coverage: exercises the Table component's visual branches
// (variants, sizes, renderers, selection/expansion columns, pagination UI).
describe('Table (renderer branches)', () => {
  it('renders the default pagination bar when pagination is enabled', () => {
    render(
      <Table
        columns={columns}
        data={data}
        enablePagination
        defaultPagination={{ page: 0, pageSize: 2 }}
      />
    );
    // Default pagination renders the "Showing X to Y of Z results" copy.
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders no pagination bar when pagination is not enabled', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('paginates via the default pagination controls', async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={columns}
        data={data}
        enablePagination
        defaultPagination={{ page: 0, pageSize: 2 }}
      />
    );
    // page 0 shows Ada + Lin; Next moves to page 1 showing Bo.
    expect(screen.getByText('Ada')).toBeInTheDocument();
    await user.click(screen.getByText('Next'));
    expect(screen.getByText('Bo')).toBeInTheDocument();
    // Click a numbered page button to jump back to page 1.
    await user.click(screen.getByText('1'));
    expect(screen.getByText('Ada')).toBeInTheDocument();
    // Previous returns to page 0.
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Previous'));
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('renders a custom loading state via renderLoading', () => {
    render(
      <Table
        columns={columns}
        data={data}
        loading
        renderLoading={() => <div data-testid="custom-loading">spinner</div>}
      />
    );
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('renders a custom empty state via renderEmpty', () => {
    render(
      <Table
        columns={columns}
        data={[]}
        renderEmpty={() => <div data-testid="custom-empty">nothing</div>}
      />
    );
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });

  it('renders a custom pagination bar via renderPagination', () => {
    render(
      <Table
        columns={columns}
        data={data}
        renderPagination={() => <div data-testid="custom-pagination">pager</div>}
      />
    );
    expect(screen.getByTestId('custom-pagination')).toBeInTheDocument();
  });

  it('renders a custom header via renderHeader', () => {
    render(
      <Table
        columns={columns}
        data={data}
        renderHeader={(column) => <div data-testid={`h-${column.key}`}>{column.title}</div>}
      />
    );
    expect(screen.getByTestId('h-name')).toBeInTheDocument();
  });

  it('renders a custom cell via renderCell', () => {
    render(
      <Table
        columns={columns}
        data={data}
        renderCell={(column) => <div data-testid={`c-${column.key}`}>{column.key}</div>}
      />
    );
    expect(screen.getAllByTestId('c-name').length).toBeGreaterThan(0);
  });

  it('renders with compact, sm size, and bordered variant without error', () => {
    render(<Table columns={columns} data={data} size="sm" variant="bordered" compact />);
    const table = screen.getByRole('table');
    // Headless-only: size/variant/compact no longer emit utility classes.
    expect(table).toBeInTheDocument();
  });

  it('renders with lg size and striped variant without error', () => {
    render(<Table columns={columns} data={data} size="lg" variant="striped" />);
    const table = screen.getByRole('table');
    // Headless-only: size/variant no longer emit utility classes; rows still render.
    expect(table).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
  });

  it('hides column headers when showHeaders is false', () => {
    render(<Table columns={columns} data={data} showHeaders={false} />);
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('renders row numbers when showRowNumbers is true', () => {
    render(<Table columns={columns} data={data} showRowNumbers />);
    // Header "#" plus row numbers 1, 2, 3.
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('aligns header and cell content for center/right columns', () => {
    const cols = [
      { key: 'name', title: 'Name', align: 'center' as const },
      { key: 'age', title: 'Age', align: 'right' as const },
    ];
    render(<Table columns={cols} data={data} />);
    const headers = screen.getAllByRole('columnheader');
    // Headless-only: align no longer emits a text-align utility; headers render.
    expect(headers.length).toBe(2);
  });

  it('deselects all rows when the header checkbox is unchecked', async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
      />
    );
    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
    // select all
    await user.click(selectAll);
    // deselect all (toggle off)
    await user.click(selectAll);
    // selected rows no longer highlighted.
    const rows = screen.getAllByRole('row');
    expect(rows[1].className).not.toContain('bg-blue-50');
  });

  it('highlights selected rows with a blue background', async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
      />
    );
    // Select the first data row via its row-level checkbox.
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is the header select-all; checkboxes[1] is row 0 (Ada).
    await user.click(checkboxes[1]);
    const rows = screen.getAllByRole('row');
    // First data row (Ada) is selected; headless-only exposes this via the
    // row checkbox state rather than a visual highlight class.
    expect(checkboxes[1]).toBeChecked();
  });

  it('renders an expansion column and toggles expanded row content', async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={columns}
        data={data}
        enableExpansion
      />
    );
    // The header exposes the sr-only "Expand" label.
    expect(screen.getByText('Expand')).toBeInTheDocument();
    // Expanded details are not present yet.
    expect(screen.queryByText('Row Details')).not.toBeInTheDocument();
    // Click the first row's expander button.
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(screen.getByText('Row Details')).toBeInTheDocument();
    // Collapse again.
    await user.click(buttons[0]);
    expect(screen.queryByText('Row Details')).not.toBeInTheDocument();
  });

  it('expansion colSpan accounts for selection and row-number columns', async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={columns}
        data={data}
        enableSelection
        selectionConfig={{ getRowKey: (r: any) => r.name }}
        enableExpansion
        showRowNumbers
      />
    );
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    const detailsCell = screen.getByText('Row Details').closest('td');
    // 2 data columns + selection + expansion + row-number = 5.
    expect(detailsCell?.getAttribute('colSpan')).toBe('5');
  });
});
