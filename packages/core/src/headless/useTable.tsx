/**
 * Table headless hook for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 * Manages table data, sorting, filtering, and pagination.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useFocusableMixin, usePressableMixin, useSemanticMixin } from '../mixins';

/**
 * Table column definition
 */
export interface TableColumn {
  /** Unique column key */
  key: string;
  /** Column title */
  title: string;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Column width */
  width?: string | number;
  /** Custom cell renderer */
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
  /** Data type for sorting/filtering */
  dataType?: 'string' | 'number' | 'date' | 'boolean';
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Table sort configuration
 */
export interface TableSort {
  /** Column key to sort by */
  column: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Table filter configuration
 */
export interface TableFilter {
  /** Column key to filter by */
  column: string;
  /** Filter value */
  value: string;
  /** Filter operator */
  operator?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

/**
 * Table pagination configuration
 */
export interface TablePagination {
  /** Current page number (0-based) */
  page: number;
  /** Number of rows per page */
  pageSize: number;
  /** Total number of rows */
  total: number;
}

/**
 * Table selection configuration
 */
export interface TableSelection {
  /** Array of selected row keys */
  selectedRowKeys: string[];
  /** Whether selection is single (true) or multiple (false) */
  single?: boolean;
  /** Row key accessor */
  getRowKey: (row: any) => string;
}

/**
 * Table state interface
 */
export interface TableState {
  /** Table data rows */
  data: any[];
  /** Columns configuration */
  columns: TableColumn[];
  /** Current sorting */
  sort?: TableSort;
  /** Current filters */
  filters: TableFilter[];
  /** Pagination state */
  pagination?: TablePagination;
  /** Selection state */
  selection?: TableSelection;
  /** Loading state */
  loading: boolean;
  /** Expanded rows */
  expandedRows: Set<string>;
}

/**
 * Table actions interface
 */
export interface TableActions {
  /** Sort table by column */
  sort: (column: string, direction?: 'asc' | 'desc') => void;
  /** Clear sorting */
  clearSort: () => void;
  /** Add filter */
  addFilter: (filter: TableFilter) => void;
  /** Remove filter */
  removeFilter: (column: string) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (pageSize: number) => void;
  /** Select row */
  selectRow: (rowKey: string) => void;
  /** Deselect row */
  deselectRow: (rowKey: string) => void;
  /** Select all rows */
  selectAll: () => void;
  /** Deselect all rows */
  deselectAll: () => void;
  /** Toggle row expansion */
  toggleRowExpansion: (rowKey: string) => void;
  /** Expand all rows */
  expandAll: () => void;
  /** Collapse all rows */
  collapseAll: () => void;
  /** Set data */
  setData: (data: any[]) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
}

/**
 * Props for useTable hook
 */
export interface UseTableProps {
  /** Table columns */
  columns: TableColumn[];
  /** Initial table data */
  data?: any[];
  /** Default sorting */
  defaultSort?: TableSort;
  /** Default filters */
  defaultFilters?: TableFilter[];
  /** Default pagination */
  defaultPagination?: Omit<TablePagination, 'total'>;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Enable selection */
  enableSelection?: boolean;
  /** Selection configuration */
  selectionConfig?: Omit<TableSelection, 'selectedRowKeys'>;
  /** Enable row expansion */
  enableExpansion?: boolean;
  /** Default expanded rows */
  defaultExpandedRows?: string[];
  /** Loading state */
  loading?: boolean;
  /** Custom data processing */
  processData?: (data: any[]) => any[];
  /** Callback when sort changes */
  onSortChange?: (sort?: TableSort) => void;
  /** Callback when filters change */
  onFiltersChange?: (filters: TableFilter[]) => void;
  /** Callback when pagination changes */
  onPaginationChange?: (pagination: TablePagination) => void;
  /** Callback when selection changes */
  onSelectionChange?: (selection: TableSelection) => void;
}

/**
 * Return type for useTable hook
 */
export interface UseTableReturns {
  /** Current table state */
  state: TableState;
  /** Table actions */
  actions: TableActions;
  /** Computed properties */
  computed: {
    /** Processed and sorted/filtered data */
    processedData: any[];
    /** Paginated data */
    paginatedData: any[];
    /** Whether all rows are selected */
    allRowsSelected: boolean;
    /** Whether some rows are selected */
    someRowsSelected: boolean;
    /** Selected rows */
    selectedRows: any[];
  };
  /** Table attributes */
  tableAttributes: {
    role: string;
    'aria-label': string;
    'aria-rowcount': number;
    'aria-multiselectable': boolean;
  };
  /** Get column header attributes */
  getColumnHeaderAttributes: (column: TableColumn) => {
    key: string;
    'aria-sort': string | undefined;
    scope: string;
    tabIndex: number;
    'aria-label': string;
  };
  /** Get row attributes */
  getRowAttributes: (row: any, index: number) => {
    key: string;
    'aria-rowindex': number;
    'aria-selected': boolean;
    'aria-expanded': boolean;
    tabIndex: number;
  };
  /** Get cell attributes */
  getCellAttributes: (column: TableColumn, row: any, rowIndex: number, columnIndex: number) => {
    key: string;
    'aria-colindex': number;
    'aria-describedby': string | undefined;
  };
  /** Get selection checkbox attributes */
  getSelectionCheckboxAttributes: (row: any) => {
    'aria-label': string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
  /** Get expander attributes */
  getExpanderAttributes: (row: any) => {
    'aria-label': string;
    'aria-expanded': boolean;
    onClick: () => void;
  };
}

/**
 * Table hook implementation
 * @param props - Table configuration props
 * @returns Table state, actions, computed properties, and attributes
 */
export function useTable(props: UseTableProps): UseTableReturns {
  const {
    columns,
    data: initialData = [],
    defaultSort,
    defaultFilters = [],
    defaultPagination,
    enablePagination = false,
    enableSelection = false,
    selectionConfig,
    enableExpansion = false,
    defaultExpandedRows = [],
    loading: initialLoading = false,
    processData,
    onSortChange,
    onFiltersChange,
    onPaginationChange,
    onSelectionChange
  } = props;

  // State management
  const [data, setData] = useState<any[]>(initialData);
  const [sort, setSort] = useState<TableSort | undefined>(defaultSort);
  const [filters, setFilters] = useState<TableFilter[]>(defaultFilters);
  const [pagination, setPagination] = useState<TablePagination | undefined>(
    defaultPagination ? { ...defaultPagination, total: initialData.length } : undefined
  );
  const [selection, setSelection] = useState<TableSelection | undefined>(
    enableSelection ? { selectedRowKeys: [], ...selectionConfig } : undefined
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(defaultExpandedRows));
  const [loading, setLoading] = useState(initialLoading);

  // Process data (apply custom processing)
  const processedData = useMemo(() => {
    let result = processData ? processData(data) : [...data];

    // Apply filters
    if (filters.length > 0) {
      result = result.filter(row => {
        return filters.every(filter => {
          const cellValue = row[filter.column];
          const filterValue = filter.value;
          const operator = filter.operator || 'contains';

          switch (operator) {
            case 'contains':
              return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
            case 'equals':
              return cellValue === filterValue;
            case 'startsWith':
              return String(cellValue).toLowerCase().startsWith(filterValue.toLowerCase());
            case 'endsWith':
              return String(cellValue).toLowerCase().endsWith(filterValue.toLowerCase());
            case 'greaterThan':
              return Number(cellValue) > Number(filterValue);
            case 'lessThan':
              return Number(cellValue) < Number(filterValue);
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sort) {
      const column = columns.find(col => col.key === sort.column);
      if (column) {
        result.sort((a, b) => {
          const aValue = a[sort.column];
          const bValue = b[sort.column];

          let comparison = 0;
          switch (column.dataType) {
            case 'number':
              comparison = (aValue || 0) - (bValue || 0);
              break;
            case 'date':
              comparison = new Date(aValue || 0).getTime() - new Date(bValue || 0).getTime();
              break;
            case 'boolean':
              comparison = (aValue ? 1 : 0) - (bValue ? 1 : 0);
              break;
            default:
              comparison = String(aValue || '').localeCompare(String(bValue || ''));
          }

          return sort.direction === 'desc' ? -comparison : comparison;
        });
      }
    }

    return result;
  }, [data, filters, sort, columns, processData]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination || !enablePagination) {
      return processedData;
    }

    const startIndex = pagination.page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, pagination, enablePagination]);

  // Computed properties
  const computed = useMemo(() => {
    const allRowsSelected = selection ? processedData.every(row =>
      selection.selectedRowKeys.includes(selection.getRowKey(row))
    ) : false;

    const someRowsSelected = selection ? processedData.some(row =>
      selection.selectedRowKeys.includes(selection.getRowKey(row))
    ) : false;

    const selectedRows = selection ? processedData.filter(row =>
      selection.selectedRowKeys.includes(selection.getRowKey(row))
    ) : [];

    return {
      processedData,
      paginatedData,
      allRowsSelected,
      someRowsSelected,
      selectedRows
    };
  }, [processedData, paginatedData, selection]);

  // Actions
  const actions = useMemo(() => {
    const sortTable = (column: string, direction?: 'asc' | 'desc') => {
      const newSort = sort?.column === column && !direction
        ? { column, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: direction || 'asc' };

      setSort(newSort);
      onSortChange?.(newSort);
    };

    const clearSort = () => {
      setSort(undefined);
      onSortChange?.(undefined);
    };

    const addFilter = (filter: TableFilter) => {
      const newFilters = filters.filter(f => f.column !== filter.column);
      newFilters.push(filter);
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    };

    const removeFilter = (column: string) => {
      const newFilters = filters.filter(f => f.column !== column);
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    };

    const clearFilters = () => {
      setFilters([]);
      onFiltersChange?.([]);
    };

    const setPage = (page: number) => {
      if (!pagination) return;
      const newPagination = { ...pagination, page };
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    };

    const setPageSize = (pageSize: number) => {
      if (!pagination) return;
      const newPagination = { ...pagination, pageSize, page: 0 };
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    };

    const selectRow = (rowKey: string) => {
      if (!selection) return;

      const newSelection = selection.single
        ? { ...selection, selectedRowKeys: [rowKey] }
        : { ...selection, selectedRowKeys: [...selection.selectedRowKeys, rowKey] };

      setSelection(newSelection);
      onSelectionChange?.(newSelection);
    };

    const deselectRow = (rowKey: string) => {
      if (!selection) return;

      const newSelection = {
        ...selection,
        selectedRowKeys: selection.selectedRowKeys.filter(key => key !== rowKey)
      };

      setSelection(newSelection);
      onSelectionChange?.(newSelection);
    };

    const selectAll = () => {
      if (!selection || selection.single) return;

      const allRowKeys = processedData.map(row => selection.getRowKey(row));
      const newSelection = { ...selection, selectedRowKeys: allRowKeys };
      setSelection(newSelection);
      onSelectionChange?.(newSelection);
    };

    const deselectAll = () => {
      if (!selection) return;

      const newSelection = { ...selection, selectedRowKeys: [] };
      setSelection(newSelection);
      onSelectionChange?.(newSelection);
    };

    const toggleRowExpansion = (rowKey: string) => {
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(rowKey)) {
        newExpanded.delete(rowKey);
      } else {
        newExpanded.add(rowKey);
      }
      setExpandedRows(newExpanded);
    };

    const expandAll = () => {
      if (!selection) return;
      const allRowKeys = processedData.map(row => selection.getRowKey(row));
      setExpandedRows(new Set(allRowKeys));
    };

    const collapseAll = () => {
      setExpandedRows(new Set());
    };

    return {
      sort: sortTable,
      clearSort,
      addFilter,
      removeFilter,
      clearFilters,
      setPage,
      setPageSize,
      selectRow,
      deselectRow,
      selectAll,
      deselectAll,
      toggleRowExpansion,
      expandAll,
      collapseAll,
      setData,
      setLoading
    };
  }, [sort, filters, pagination, selection, expandedRows, processedData, onSortChange, onFiltersChange, onPaginationChange, onSelectionChange]);

  // Update pagination total when data changes
  useMemo(() => {
    if (pagination && enablePagination) {
      const newPagination = { ...pagination, total: processedData.length };
      if (newPagination.total !== pagination.total) {
        setPagination(newPagination);
        onPaginationChange?.(newPagination);
      }
    }
  }, [processedData.length, pagination, enablePagination, onPaginationChange]);

  // Build state
  const state: TableState = {
    data,
    columns,
    sort,
    filters,
    pagination,
    selection,
    loading,
    expandedRows
  };

  // Build table attributes
  const tableAttributes = {
    role: 'table',
    'aria-label': 'Data table',
    'aria-rowcount': processedData.length,
    'aria-multiselectable': enableSelection && !selection?.single
  };

  // Build column header attributes
  const getColumnHeaderAttributes = (column: TableColumn) => ({
    key: column.key,
    'aria-sort': sort?.column === column.key
      ? (sort.direction === 'asc' ? 'ascending' : 'descending')
      : undefined,
    scope: 'col',
    tabIndex: column.sortable ? 0 : -1,
    'aria-label': column.title + (column.sortable ? ', sortable' : '')
  });

  // Build row attributes
  const getRowAttributes = (row: any, index: number) => {
    const rowKey = selection?.getRowKey(row) || `row-${index}`;
    return {
      key: rowKey,
      'aria-rowindex': index + 1,
      'aria-selected': selection?.selectedRowKeys.includes(rowKey) || false,
      'aria-expanded': expandedRows.has(rowKey),
      tabIndex: 0
    };
  };

  // Build cell attributes
  const getCellAttributes = (column: TableColumn, row: any, rowIndex: number, columnIndex: number) => ({
    key: `${column.key}-${rowIndex}`,
    'aria-colindex': columnIndex + 1,
    'aria-describedby': column.filterable ? `filter-${column.key}` : undefined
  });

  // Build selection checkbox attributes
  const getSelectionCheckboxAttributes = (row: any) => {
    const rowKey = selection?.getRowKey(row) || `row-${0}`;
    return {
      'aria-label': `Select row ${rowKey}`,
      checked: selection?.selectedRowKeys.includes(rowKey) || false,
      onChange: (checked: boolean) => {
        if (checked) {
          actions.selectRow(rowKey);
        } else {
          actions.deselectRow(rowKey);
        }
      }
    };
  };

  // Build expander attributes
  const getExpanderAttributes = (row: any) => {
    const rowKey = selection?.getRowKey(row) || `row-${0}`;
    return {
      'aria-label': `Expand row ${rowKey}`,
      'aria-expanded': expandedRows.has(rowKey),
      onClick: () => actions.toggleRowExpansion(rowKey)
    };
  };

  return {
    state,
    actions,
    computed,
    tableAttributes,
    getColumnHeaderAttributes,
    getRowAttributes,
    getCellAttributes,
    getSelectionCheckboxAttributes,
    getExpanderAttributes
  };
}