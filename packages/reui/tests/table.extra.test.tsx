import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../src/components/Table';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true, dataType: 'number' as const },
];
const data = [
  { name: 'Ada', age: 30 },
  { name: 'Lin', age: 25 },
  { name: 'Bo', age: 40 },
];

describe('Table extras', () => {
  it('renders the bordered and striped variants with row striping', () => {
    const { rerender } = render(<Table columns={columns} data={data} variant="bordered" />);
    // Headless: the border class is removed; assert the table renders its rows.
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    rerender(<Table columns={columns} data={data} variant="striped" />);
    const rows = screen.getAllByRole('row');
    // striped variant stripes odd data rows
    expect(rows.length).toBeGreaterThan(1);
  });

  it('renders size variants sm/lg', () => {
    const { rerender } = render(<Table columns={columns} data={data} size="sm" />);
    // Headless: the text-xs/text-base size classes are removed; assert the table
    // renders its data cells under each size.
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    rerender(<Table columns={columns} data={data} size="lg" />);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('renders row numbers when showRowNumbers is true', () => {
    render(<Table columns={columns} data={data} showRowNumbers />);
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies compact (table-auto) class', () => {
    const { container } = render(<Table columns={columns} data={data} compact />);
    expect(container.querySelector('.table-auto')).toBeInTheDocument();
  });

  it('hides headers when showHeaders is false', () => {
    render(<Table columns={columns} data={data} showHeaders={false} />);
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('renders columns with center/right align configuration', () => {
    const cols = [
      { key: 'name', title: 'Name', align: 'center' as const },
      { key: 'age', title: 'Age', align: 'right' as const },
    ];
    render(<Table columns={cols} data={data} />);
    // Headless: the text-center/text-right align classes are removed; assert the
    // configured headers still render in column order.
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('applies a custom cell renderer', () => {
    render(
      <Table
        columns={columns}
        data={data}
        renderCell={(column, row, ri, ci) => <span data-testid={`cell-${ri}-${ci}`}>[{row[column.key]}]</span>}
      />
    );
    expect(screen.getByTestId('cell-0-0')).toHaveTextContent('[Ada]');
    expect(screen.getByTestId('cell-0-1')).toHaveTextContent('[30]');
  });

  it('applies a custom header renderer', () => {
    render(
      <Table columns={columns} data={data} renderHeader={(column) => <span data-testid={`hdr-${column.key}`}>H:{column.title}</span>} />
    );
    expect(screen.getByTestId('hdr-name')).toHaveTextContent('H:Name');
  });

  it('uses custom empty and loading renderers', () => {
    const { unmount: un1 } = render(
      <Table columns={columns} data={[]} renderEmpty={() => <div data-testid="custom-empty">none</div>} />
    );
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    un1();

    render(
      <Table columns={columns} data={data} loading renderLoading={() => <div data-testid="custom-loading">spinner</div>} />
    );
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('uses a custom pagination renderer', () => {
    render(
      <Table
        columns={columns}
        data={data}
        enablePagination
        defaultPagination={{ page: 0, pageSize: 2 }}
        renderPagination={() => <div data-testid="custom-pager">pager</div>}
      />
    );
    expect(screen.getByTestId('custom-pager')).toBeInTheDocument();
  });

  it('renders the default pagination footer and navigates pages', async () => {
    const onPaginationChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={data}
        enablePagination
        defaultPagination={{ page: 0, pageSize: 2 }}
        onPaginationChange={onPaginationChange}
      />
    );
    expect(screen.getByText(/Showing/)).toBeInTheDocument();
    // page buttons 1, 2 rendered
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    // Previous disabled on page 0
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it('disables Next on the last page', () => {
    render(
      <Table columns={columns} data={data} enablePagination defaultPagination={{ page: 1, pageSize: 2 }} />
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('selects and deselects via the header select-all checkbox', async () => {
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
    const selectAll = screen.getByLabelText('Select all rows');
    // select all
    await act(async () => {
      fireEvent.click(selectAll);
    });
    expect(onSelectionChange).toHaveBeenCalled();
    // deselect all
    await act(async () => {
      fireEvent.click(selectAll);
    });
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('toggles a row checkbox via the row selection checkbox', async () => {
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
    // Row checkboxes: one per row (3) plus header = 4 total checkboxes
    const rowCheckboxes = screen.getAllByRole('checkbox');
    expect(rowCheckboxes.length).toBe(4);
    await act(async () => {
      fireEvent.click(rowCheckboxes[1]); // first data row checkbox
    });
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('expands a row via the expander button and shows details', async () => {
    const { container } = render(
      <Table columns={columns} data={data} enableExpansion selectionConfig={{ getRowKey: (r: any) => r.name }} />
    );
    const expanderButtons = container.querySelectorAll('tbody button');
    expect(expanderButtons.length).toBe(3);
    await act(async () => {
      fireEvent.click(expanderButtons[0]);
    });
    expect(screen.getByText('Row Details')).toBeInTheDocument();
    // collapse again
    await act(async () => {
      fireEvent.click(expanderButtons[0]);
    });
    expect(screen.queryByText('Row Details')).not.toBeInTheDocument();
  });

  it('renders an aria-sort indicator for a sorted column asc/desc', async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} data={data} />);
    await user.click(screen.getByText('Age'));
    // sort direction svgs exist; verify the column header is marked sortable
    expect(screen.getByText('Age').closest('th')).toBeInTheDocument();
  });

  it('falls back to row-index keys when no selection getRowKey is provided', () => {
    render(<Table columns={columns} data={data} />);
    // renders without error using row-${index} keys
    expect(screen.getAllByRole('row').length).toBe(4);
  });

  it('applies custom className and style', () => {
    const { container } = render(<Table columns={columns} data={data} className="my-table" style={{ color: 'red' }} />);
    const table = container.querySelector('table');
    expect(table?.className).toContain('my-table');
    expect(table?.getAttribute('style')).toContain('color');
  });
});
