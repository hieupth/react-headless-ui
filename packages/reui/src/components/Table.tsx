/**
 * Table renderer component using headless useTable hook.
 * Provides styled table with comprehensive accessibility support.
 */

import React, { forwardRef } from 'react';
import { useTable, type UseTableProps } from '../hooks';
import { useTheme } from '../providers/ThemeProvider';

export interface TableProps extends UseTableProps {
  /** Additional CSS class names */
  className?: string;
  /** Custom style object */
  style?: React.CSSProperties;
  /** Table size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Table variant */
  variant?: 'default' | 'bordered' | 'striped';
  /** Whether to show headers */
  showHeaders?: boolean;
  /** Whether to show row numbers */
  showRowNumbers?: boolean;
  /** Whether table is compact */
  compact?: boolean;
  /** Custom empty state renderer */
  renderEmpty?: () => React.ReactNode;
  /** Custom loading renderer */
  renderLoading?: () => React.ReactNode;
  /** Custom cell renderer */
  renderCell?: (column: any, row: any, rowIndex: number, columnIndex: number) => React.ReactNode;
  /** Custom header renderer */
  renderHeader?: (column: any, columnIndex: number) => React.ReactNode;
  /** Custom pagination renderer */
  renderPagination?: () => React.ReactNode;
}

/**
 * Table component with sorting, filtering, and pagination support.
 * Supports selection, expansion, and custom rendering.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(({
  className = '',
  style,
  size = 'md',
  variant = 'default',
  showHeaders = true,
  showRowNumbers = false,
  compact = false,
  renderEmpty,
  renderLoading,
  renderCell,
  renderHeader,
  renderPagination,
  ...tableProps
}, ref) => {
  const theme = useTheme();
  const {
    state,
    actions,
    computed,
    tableAttributes,
    getColumnHeaderAttributes,
    getRowAttributes,
    getCellAttributes,
    getSelectionCheckboxAttributes,
    getExpanderAttributes
  } = useTable(tableProps);

  // Size classes
  const getSizeClasses = () => {
    const sizes = {
      sm: '',
      md: '',
      lg: ''
    };
    return sizes[size];
  };

  // Variant classes
  const getVariantClasses = () => {
    const variants = {
      default: '',
      bordered: ' ',
      striped: ' '
    };
    return variants[variant];
  };

  // Base table classes
  const tableClasses = `
    
    
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${compact ? 'table-auto' : 'table-fixed'}
    ${className || ''}
  `.trim().replace(/\s+/g, ' ');

  // Handle column header click for sorting
  const handleHeaderClick = (column: any) => {
    if (column.sortable) {
      actions.sort(column.key);
    }
  };

  // Default empty state
  const defaultRenderEmpty = () => (
    <div className="    ">
      <div className="">
        <svg
          className="mx-auto   "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="   ">No data</h3>
        <p className="  ">
          No items to display
        </p>
      </div>
    </div>
  );

  // Default loading state
  const defaultRenderLoading = () => (
    <div className="   ">
      <div className="  ">
        <div className="     "></div>
        <span className="">Loading...</span>
      </div>
    </div>
  );

  // Default pagination
  const defaultRenderPagination = () => {
    if (!state.pagination) return null;

    const { page, pageSize, total } = state.pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = page * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, total);

    return (
      <div className="        ">
        <div className=" ">
          <p className=" ">
            Showing <span className="">{startIndex}</span> to{' '}
            <span className="">{endIndex}</span> of{' '}
            <span className="">{total}</span> results
          </p>
        </div>
        <div className="  ">
          <button
            onClick={() => actions.setPage(page - 1)}
            disabled={page === 0}
            className="              "
          >
            Previous
          </button>
          <div className="  ">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => actions.setPage(i)}
                className={`        ${
                  i === page
                    ? ' '
                    : '    '
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => actions.setPage(page + 1)}
            disabled={page === totalPages - 1}
            className="              "
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (state.loading) {
    return (
      <div className={tableClasses} style={style} data-testid="table-loading">
        {renderLoading ? renderLoading() : defaultRenderLoading()}
      </div>
    );
  }

  // Empty state
  if (computed.processedData.length === 0) {
    return (
      <div className={tableClasses} style={style} data-testid="table-empty">
        {renderEmpty ? renderEmpty() : defaultRenderEmpty()}
      </div>
    );
  }

  return (
    <div className="" data-testid="table-container">
      <table
        ref={ref}
        className={tableClasses}
        style={style}
        {...tableAttributes}
      >
        {/* Table Header */}
        {showHeaders && (
          <thead className="">
            <tr>
              {/* Selection column */}
              {state.selection && (
                <th className="  ">
                  <input
                    type="checkbox"
                    className="     "
                    checked={computed.allRowsSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        actions.selectAll();
                      } else {
                        actions.deselectAll();
                      }
                    }}
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* Expansion column */}
              {state.enableExpansion && (
                <th className="  ">
                  <span className="sr-only">Expand</span>
                </th>
              )}

              {/* Row number column */}
              {showRowNumbers && (
                <th className="       ">
                  #
                </th>
              )}

              {/* Data columns */}
              {state.columns.map((column, columnIndex) => {
                const attributes = getColumnHeaderAttributes(column);
                const isSorted = state.sort?.column === column.key;
                const sortDirection = state.sort?.direction;

                return (
                  <th
                    key={column.key}
                    {...attributes}
                    onClick={() => handleHeaderClick(column)}
                    className={`
                             
                      ${column.sortable ? ' ' : ''}
                      ${column.align === 'center' ? '' : ''}
                      ${column.align === 'right' ? '' : ''}
                    `}
                    style={{ width: column.width }}
                  >
                    <div className="  ">
                      <span>
                        {renderHeader ? renderHeader(column, columnIndex) : column.title}
                      </span>
                      {column.sortable && (
                        <span className=" ">
                          <svg
                            className={`   ${
                              isSorted && sortDirection === 'asc' ? '' : ''
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <svg
                            className={`  ${
                              isSorted && sortDirection === 'desc' ? '' : ''
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
        )}

        {/* Table Body */}
        <tbody className="  ">
          {computed.paginatedData.map((row, rowIndex) => {
            const rowAttributes = getRowAttributes(row, rowIndex);
            const rowKey = state.selection?.getRowKey(row) || `row-${rowIndex}`;
            const isExpanded = state.expandedRows.has(rowKey);

            return (
              <React.Fragment key={rowKey}>
                <tr
                  {...rowAttributes}
                  className={`
                    
                    ${rowIndex % 2 === 1 && variant === 'striped' ? '' : ''}
                    ${state.selection?.selectedRowKeys.includes(rowKey) ? '' : ''}
                  `}
                >
                  {/* Selection checkbox */}
                  {state.selection && (
                    <td className="  ">
                      <input
                        type="checkbox"
                        className="     "
                        {...getSelectionCheckboxAttributes(row)}
                      />
                    </td>
                  )}

                  {/* Expansion button */}
                  {state.enableExpansion && (
                    <td className="  ">
                      <button
                        {...getExpanderAttributes(row)}
                        className="   "
                      >
                        <svg
                          className={`  transform  ${isExpanded ? '' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  )}

                  {/* Row number */}
                  {showRowNumbers && (
                    <td className="    ">
                      {rowIndex + 1}
                    </td>
                  )}

                  {/* Data cells */}
                  {state.columns.map((column, columnIndex) => {
                    const cellAttributes = getCellAttributes(column, row, rowIndex, columnIndex);
                    const cellValue = row[column.key];

                    return (
                      <td
                        key={`${column.key}-${rowIndex}`}
                        {...cellAttributes}
                        className={`
                              
                          ${column.align === 'center' ? '' : ''}
                          ${column.align === 'right' ? '' : ''}
                        `}
                      >
                        {renderCell
                          ? renderCell(column, row, rowIndex, columnIndex)
                          : column.render
                          ? column.render(cellValue, row, rowIndex)
                          : cellValue}
                      </td>
                    );
                  })}
                </tr>

                {/* Expanded row content */}
                {state.enableExpansion && isExpanded && (
                  <tr>
                    <td
                      colSpan={
                        state.columns.length +
                        (state.selection ? 1 : 0) +
                        // reason: this row only renders when enableExpansion is
                        // true (the surrounding guard), so it always adds 1.
                        1 +
                        (showRowNumbers ? 1 : 0)
                      }
                      className="  "
                    >
                      <div className=" ">
                        <h4 className="  ">Row Details</h4>
                        <pre className="">{JSON.stringify(row, null, 2)}</pre>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {renderPagination ? renderPagination() : defaultRenderPagination()}
    </div>
  );
});

Table.displayName = 'Table';

export default Table;