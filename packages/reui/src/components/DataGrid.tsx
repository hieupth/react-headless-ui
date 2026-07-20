/**
 * DataGrid renderer component.
 * Provides visual representation for data grid components using HTML table.
 */

import React, { forwardRef, useMemo } from 'react';
import { useDataGrid } from '../hooks';
import type { UseDataGridProps, GridColumn, GridRow, GridPagination } from '../hooks';

/**
 * Action descriptor for action-type columns.
 */
export interface GridAction {
  /** Action label */
  label?: React.ReactNode;
  /** Click handler invoked with the owning row */
  onClick?: (row: GridRow) => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Grid cell value used by the DataGrid renderers.
 * The hook does not export a GridCell type, so the component owns this local shape.
 */
export interface GridCell {
  /** Cell value */
  value?: unknown;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * DataGrid component props
 */
export interface DataGridProps extends UseDataGridProps {
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Custom renderer for table cells */
  cellRenderer?: (cell: GridCell, row: GridRow, column: GridColumn) => React.ReactNode;
  /** Custom renderer for table headers */
  headerRenderer?: (column: GridColumn) => React.ReactNode;
  /** Custom renderer for pagination controls */
  paginationRenderer?: (pagination: GridPagination) => React.ReactNode;
  /** Custom renderer for loading state */
  loadingRenderer?: () => React.ReactNode;
  /** Custom renderer for empty state */
  emptyRenderer?: () => React.ReactNode;
  /** Whether to show row selection checkboxes */
  showSelection?: boolean;
  /** Whether to show row numbers */
  showRowNumbers?: boolean;
  /** Whether to show column filters */
  showColumnFilters?: boolean;
  /** Table container props */
  tableContainerProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Table element props */
  tableProps?: React.HTMLAttributes<HTMLTableElement>;
  /** Table header props */
  theadProps?: React.HTMLAttributes<HTMLTableSectionElement>;
  /** Table body props */
  tbodyProps?: React.HTMLAttributes<HTMLTableSectionElement>;
  /** Row props getter */
  getRowProps?: (row: GridRow, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  /** Cell props getter */
  getCellProps?: (cell: GridCell, row: GridRow, column: GridColumn) => React.HTMLAttributes<HTMLTableCellElement>;
  /** Header cell props getter */
  getHeaderCellProps?: (column: GridColumn) => React.HTMLAttributes<HTMLTableCellElement>;
}

/**
 * DataGrid component
 */
export const DataGrid = forwardRef<HTMLTableElement, DataGridProps>(
  ({
    className = '',
    style,
    cellRenderer,
    headerRenderer,
    paginationRenderer,
    loadingRenderer,
    emptyRenderer,
    showSelection = true,
    showRowNumbers = false,
    showColumnFilters = true,
    tableContainerProps = {},
    tableProps = {},
    theadProps = {},
    tbodyProps = {},
    getRowProps,
    getCellProps,
    getHeaderCellProps,
    ...props
  }: Pick<DataGridProps,
    | 'className'
    | 'style'
    | 'cellRenderer'
    | 'headerRenderer'
    | 'paginationRenderer'
    | 'loadingRenderer'
    | 'emptyRenderer'
    | 'showSelection'
    | 'showRowNumbers'
    | 'showColumnFilters'
    | 'tableContainerProps'
    | 'tableProps'
    | 'theadProps'
    | 'tbodyProps'
    | 'getRowProps'
    | 'getCellProps'
    | 'getHeaderCellProps'
  >, ref) => {
    const {
      state,
      handlers,
      attributes
    } = useDataGrid(props);

    const {
      data,
      columns,
      loading,
      paginatedData,
      selectedRows,
      sort,
      filter,
      pagination
    } = state;

    // Render table cell
    const renderCell = (cell: GridCell, row: GridRow, column: GridColumn, rowIndex: number) => {
      const baseProps = {
        'data-testid': `data-grid-cell-${column.id}-${rowIndex}`,
        'data-column-id': column.id,
        'data-row-index': rowIndex,
        'data-cell-type': column.type || 'text',
        className: `data-grid-cell ${column.className || ''}`,
        ...(getCellProps?.(cell, row, column) || {})
      };

      if (cellRenderer) {
        return (
          <td key={column.id} {...baseProps}>
            {cellRenderer(cell, row, column)}
          </td>
        );
      }

      // Default cell rendering based on type. GridColumn allows arbitrary
      // values for `type` via its index signature, so widen to string here.
      const cellType: string = column.type ?? 'text';

      let content: React.ReactNode =
        typeof cell.value === 'string' ||
        typeof cell.value === 'number' ||
        typeof cell.value === 'boolean'
          ? cell.value
          : cell.value == null
            ? null
            : String(cell.value);

      if (cellType === 'boolean') {
        const boolValue = Boolean(cell.value);
        content = (
          <span className={`inline-flex items-center ${boolValue ? 'text-green-600' : 'text-gray-400'}`}>
            {boolValue ? '✓' : '✗'}
          </span>
        );
      } else if (cellType === 'number') {
        content = (
          <span className="text-right block w-full">
            {column.format ? column.format(cell.value) : cell.value}
          </span>
        );
      } else if (cellType === 'date') {
        const raw = cell.value;
        content = raw ? new Date(raw as string | number | Date).toLocaleDateString() : '';
      } else if (cellType === 'actions') {
        const actions = (Array.isArray(cell.value) ? cell.value : []) as GridAction[];
        content = (
          <div className="flex gap-1">
            {actions.map((action, index: number) => {
              const handleAction = action.onClick;
              return (
              <button
                key={index}
                {...(handleAction ? { onClick: () => handleAction(row) } : {})}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={Boolean(action.disabled)}
              >
                {action.label}
              </button>
              );
            })}
          </div>
        );
      }

      return (
        <td key={column.id} {...baseProps}>
          {content}
        </td>
      );
    };

    // Render table header
    const renderHeader = (column: GridColumn) => {
      const isSorted = sort.column === column.id;
      const sortDirection = sort.direction;

      const headerProps = {
        key: column.id,
        'data-testid': `data-grid-header-${column.id}`,
        'data-column-id': column.id,
        'data-sortable': column.sortable,
        'data-sorted': isSorted,
        'data-sort-direction': isSorted ? sortDirection : undefined,
        className: `data-grid-header-cell ${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`,
        ...(column.sortable ? { onClick: (e: React.MouseEvent) => handlers.handleHeaderClick(column, e) } : {}),
        ...(getHeaderCellProps?.(column) || {})
      };

      if (headerRenderer) {
        return <th {...headerProps}>{headerRenderer(column)}</th>;
      }

      return (
        <th {...headerProps}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{column.title}</span>
            {column.sortable && (
              <div className="flex flex-col ml-2">
                <svg
                  className={`w-3 h-3 ${isSorted && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <svg
                  className={`w-3 h-3 -mt-1 ${isSorted && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </th>
      );
    };

    // Render filter input for column
    const renderFilterInput = (column: GridColumn) => {
      if (!column.filterable || !showColumnFilters) return null;

      const filterValue = filter?.column === column.id ? filter.value : '';

      return (
        <th key={`filter-${column.id}`} className="p-2 border-b border-gray-200">
          <input
            type="text"
            value={filterValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlers.handleFilter(column.id, e.target.value)}
            placeholder={`Filter ${column.title}...`}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid={`data-grid-filter-${column.id}`}
          />
        </th>
      );
    };

    // Render row selection checkbox
    const renderSelectionCell = (row: GridRow, rowIndex: number) => {
      if (!showSelection) return null;

      const isSelected = selectedRows.includes(row.id);
      const rowProps = getRowProps?.(row, rowIndex) || {};

      return (
        <td
          key="selection"
          className="data-grid-selection-cell p-2 border-b border-gray-200"
          data-testid={`data-grid-selection-${rowIndex}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handlers.handleRowClick(row, {} as React.MouseEvent)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-label={`Select row ${rowIndex + 1}`}
          />
        </td>
      );
    };

    // Render row number
    const renderRowNumber = (rowIndex: number) => {
      if (!showRowNumbers) return null;

      const actualRowIndex = (pagination.page - 1) * pagination.pageSize + rowIndex + 1;

      return (
        <td
          key="row-number"
          className="data-grid-row-number p-2 border-b border-gray-200 text-gray-500 text-sm"
          data-testid={`data-grid-row-number-${rowIndex}`}
        >
          {actualRowIndex}
        </td>
      );
    };

    // Render table rows
    const renderRows = () => {
      const dataToRender = paginatedData;

      if (dataToRender.length === 0) {
        return (
          <tr>
            <td
              colSpan={columns.length + (showSelection ? 1 : 0) + (showRowNumbers ? 1 : 0)}
              className="p-8 text-center text-gray-500"
              data-testid="data-grid-empty"
            >
              {emptyRenderer ? emptyRenderer() : 'No data available'}
            </td>
          </tr>
        );
      }

      return dataToRender.map((row, rowIndex) => {
        const rowProps = {
          key: row.id,
          'data-testid': `data-grid-row-${rowIndex}`,
          'data-row-id': row.id,
          className: `data-grid-row hover:bg-gray-50 ${selectedRows.includes(row.id) ? 'bg-blue-50' : ''}`,
          ...(getRowProps?.(row, rowIndex) || {})
        };

        return (
          <tr {...rowProps}>
            {renderSelectionCell(row, rowIndex)}
            {renderRowNumber(rowIndex)}
            {columns.map((column) => {
              const cell: GridCell = {
                value: typeof column.accessor === 'function'
                  ? column.accessor(row.data)
                  : row.data?.[column.id]
              };
              return renderCell(cell, row, column, rowIndex);
            })}
          </tr>
        );
      });
    };

    // Render pagination controls
    const renderPagination = () => {
      if (!pagination || pagination.totalPages <= 1) return null;

      if (paginationRenderer) {
        return paginationRenderer(pagination);
      }

      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = Math.min(startIndex + pagination.pageSize, pagination.total);

      return (
        <div className="flex items-center justify-between p-4 border-t border-gray-200" data-testid="data-grid-pagination">
          <div className="text-sm text-gray-700">
            Showing {pagination.total === 0 ? 0 : startIndex + 1} to {endIndex} of {pagination.total} items
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlers.handlePagination(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="data-grid-prev-page"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlers.handlePagination(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="data-grid-next-page"
            >
              Next
            </button>
          </div>
        </div>
      );
    };

    // Render loading state
    if (loading) {
      return (
        <div
          className={`data-grid-loading flex items-center justify-center p-8 ${className}`}
          style={{ minHeight: 200, ...style }}
          data-testid="data-grid-loading"
        >
          {loadingRenderer ? loadingRenderer() : (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mt-2 text-gray-600">Loading...</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`data-grid-container overflow-auto ${className}`}
        style={style}
        data-testid="data-grid"
        {...tableContainerProps}
      >
        <table
          ref={ref}
          {...attributes}
          {...tableProps}
          className={`data-grid min-w-full divide-y divide-gray-200 ${tableProps.className || ''}`}
        >
          <thead {...theadProps} className="bg-gray-50">
            <tr>
              {showSelection && (
                <th className="p-2 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={() => handlers.handleSelectAll()}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    data-testid="data-grid-select-all"
                  />
                </th>
              )}
              {showRowNumbers && (
                <th className="p-2 border-b border-gray-200 text-gray-500 text-sm font-medium">
                  #
                </th>
              )}
              {columns.map(renderHeader)}
            </tr>
            {showColumnFilters && (
              <tr>
                {showSelection && <th className="p-2 border-b border-gray-200"></th>}
                {showRowNumbers && <th className="p-2 border-b border-gray-200"></th>}
                {columns.map(renderFilterInput)}
              </tr>
            )}
          </thead>
          <tbody {...tbodyProps} className="bg-white divide-y divide-gray-200">
            {renderRows()}
          </tbody>
        </table>
        {renderPagination()}
      </div>
    );
  }
);

DataGrid.displayName = 'DataGrid';

export default DataGrid;