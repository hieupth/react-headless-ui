/**
 * Data Grid hook following Flutter patterns.
 * Provides composable behavior for data grid/table components.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Grid column configuration
 */
export interface GridColumn {
  /** Column identifier */
  id: string;
  /** Column header text */
  header: string;
  /** Column title (used for header label and filter placeholder) */
  title?: string;
  /** Additional CSS class for the column's cells and header */
  className?: string;
  /** Column width */
  width?: number | string;
  /** Column is sortable */
  sortable?: boolean;
  /** Column is filterable */
  filterable?: boolean;
  /** Column is resizable */
  resizable?: boolean;
  /** Column is visible */
  visible?: boolean;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Column type */
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  /** Custom cell renderer */
  cellRenderer?: (value: any, row: any, rowIndex: number) => React.ReactNode;
  /** Custom header renderer */
  headerRenderer?: (column: GridColumn) => React.ReactNode;
  /** Custom filter renderer */
  filterRenderer?: (column: GridColumn, value: any, onChange: (value: any) => void) => React.ReactNode;
  /** Column accessor */
  accessor?: string | ((row: any) => any);
  /** Value formatter for number cells */
  format?: (value: any) => string;
}

/**
 * Grid row configuration
 */
export interface GridRow {
  /** Row identifier */
  id: string;
  /** Row data */
  data: Record<string, any>;
  /** Whether row is selected */
  selected?: boolean;
  /** Whether row is disabled */
  disabled?: boolean;
  /** Row height */
  height?: number;
  /** Row index */
  index?: number;
}

/**
 * Grid sort configuration
 */
export interface GridSort {
  /** Sort column */
  column: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Grid filter configuration
 */
export interface GridFilter {
  /** Filter column */
  column: string;
  /** Filter value */
  value: any;
  /** Filter operator */
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
}

/**
 * Grid pagination configuration
 */
export interface GridPagination {
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Total items */
  total: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Grid selection configuration
 */
export interface GridSelection {
  /** Selected row IDs */
  selectedRows: string[];
  /** Selection mode */
  mode: 'single' | 'multiple';
  /** Select all on page */
  selectAllOnPage?: boolean;
}

/**
 * Props for useDataGrid hook
 */
export interface UseDataGridProps extends
  SemanticProps,
  FocusableProps {
  /** Grid data */
  data?: any[];
  /** Grid columns */
  columns?: GridColumn[];
  /** Default sort */
  defaultSort?: GridSort;
  /** Current sort */
  sort?: GridSort;
  /** Sort change handler */
  onSortChange?: (sort: GridSort) => void;
  /** Default filter */
  defaultFilter?: GridFilter;
  /** Current filter */
  filter?: GridFilter;
  /** Filter change handler */
  onFilterChange?: (filter: GridFilter) => void;
  /** Default pagination */
  defaultPagination?: GridPagination;
  /** Current pagination */
  pagination?: GridPagination;
  /** Pagination change handler */
  onPaginationChange?: (pagination: GridPagination) => void;
  /** Default selection */
  defaultSelection?: GridSelection;
  /** Current selection */
  selection?: GridSelection;
  /** Selection change handler */
  onSelectionChange?: (selection: GridSelection) => void;
  /** Row click handler */
  onRowClick?: (row: GridRow) => void;
  /** Cell click handler */
  onCellClick?: (row: GridRow, column: GridColumn, value: any) => void;
  /** Header click handler */
  onHeaderClick?: (column: GridColumn) => void;
  /** Whether grid is loading */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Empty message */
  emptyMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Grid height */
  height?: number | string;
  /** Grid width */
  width?: number | string;
  /** Whether grid is responsive */
  responsive?: boolean;
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Whether to show selection column */
  showSelection?: boolean;
  /** Whether to show row numbers */
  showRowNumbers?: boolean;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Virtual scroll settings */
  virtualScrolling?: {
    enabled?: boolean;
    itemHeight?: number;
    overscan?: number;
  };
  /** Custom row height */
  rowHeight?: number;
  /** Header height */
  headerHeight?: number;
  /** Border width */
  borderWidth?: number;
  /** Cell padding */
  cellPadding?: number;
  /** Background color */
  backgroundColor?: string;
  /** Header background color */
  headerBackgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Selected row color */
  selectedRowColor?: string;
  /** Hovered row color */
  hoveredRowColor?: string;
  /** Z-index for dropdowns */
  zIndex?: number;
  /** Keyboard shortcuts */
  keyboardShortcuts?: boolean;
  /** Custom key bindings */
  keyBindings?: Record<string, () => void>;
  /** Data processing functions */
  processData?: (data: any[]) => any[];
  /** Validation functions */
  validateRow?: (row: any) => boolean;
  /** Transform functions */
  transformValue?: (value: any, column: GridColumn, row: any) => any;
}

/**
 * Data Grid component state
 */
export interface DataGridState {
  /** Processed data rows */
  rows: GridRow[];
  /** Grid columns */
  columns: GridColumn[];
  /** Sort configuration */
  sort: GridSort;
  /** Filter configuration */
  filter: GridFilter;
  /** Pagination configuration */
  pagination: GridPagination;
  /** Selection configuration */
  selection: GridSelection;
  /** Whether component is disabled */
  disabled: boolean;
  /** Whether component is focused */
  focused: boolean;
  /** Whether component is loading */
  loading: boolean;
  /** Error state */
  error?: string;
  /** Selected cell */
  selectedCell?: { rowIndex: number; columnId: string };
  /** Hovered cell */
  hoveredCell?: { rowIndex: number; columnId: string };
}

/**
 * Data Grid handlers
 */
export interface DataGridHandlers {
  /** Handle sort change */
  handleSort: (column: string, direction: 'asc' | 'desc') => void;
  /** Handle filter change */
  handleFilter: (column: string, value: any, operator?: GridFilter['operator']) => void;
  /** Handle pagination change */
  handlePagination: (page: number, pageSize?: number) => void;
  /** Handle selection change */
  handleSelection: (rowIds: string[], mode?: 'single' | 'multiple') => void;
  /** Handle row click */
  handleRowClick: (row: GridRow, event: React.MouseEvent) => void;
  /** Handle cell click */
  handleCellClick: (row: GridRow, column: GridColumn, event: React.MouseEvent) => void;
  /** Handle header click */
  handleHeaderClick: (column: GridColumn, event: React.MouseEvent) => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Handle select all */
  handleSelectAll: () => void;
  /** Handle clear selection */
  handleClearSelection: () => void;
}

/**
 * Composable data grid hook using Flutter-style mixins
 * @param props - Data grid configuration
 * @returns Data grid state, handlers, and computed properties
 */
export function useDataGrid(props: UseDataGridProps = {}) {
  const {
    data: propData = [],
    columns: propColumns = [],
    defaultSort,
    sort: controlledSort,
    onSortChange,
    defaultFilter,
    filter: controlledFilter,
    onFilterChange,
    defaultPagination,
    pagination: controlledPagination,
    onPaginationChange,
    defaultSelection,
    selection: controlledSelection,
    onSelectionChange,
    onRowClick,
    onCellClick,
    onHeaderClick,
    loading = false,
    loadingMessage = 'Loading...',
    emptyMessage = 'No data available',
    errorMessage = 'An error occurred',
    height = 400,
    width = '100%',
    responsive = true,
    showHeader = true,
    showPagination = true,
    showSelection = true,
    showRowNumbers = false,
    pageSizeOptions = [10, 25, 50, 100],
    virtualScrolling = { enabled: false, itemHeight: 40, overscan: 5 },
    rowHeight = 40,
    headerHeight = 40,
    borderWidth = 1,
    cellPadding = 8,
    backgroundColor = '#ffffff',
    headerBackgroundColor = '#f9fafb',
    borderColor = '#e5e7eb',
    selectedRowColor = '#eff6ff',
    hoveredRowColor = '#f9fafb',
    zIndex = 1000,
    keyboardShortcuts = true,
    keyBindings = {},
    processData,
    validateRow,
    transformValue,
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    role = 'table',
    label,
    labelledBy,
    describedBy,
    disabled = false,
    ...semanticProps
  } = props;

  // State management
  const [sort, setSort] = useState<GridSort>(controlledSort || defaultSort || { column: '', direction: 'asc' });
  const [filter, setFilter] = useState<GridFilter>(controlledFilter || defaultFilter || { column: '', value: '' });
  const [pagination, setPagination] = useState<GridPagination>(controlledPagination || defaultPagination || { page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [selection, setSelection] = useState<GridSelection>(controlledSelection || defaultSelection || { selectedRows: [], mode: 'multiple' });
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; columnId: string } | undefined>();
  const [hoveredCell, setHoveredCell] = useState<{ rowIndex: number; columnId: string } | undefined>();

  // Determine if component is controlled
  const isSortControlled = controlledSort !== undefined;
  const isFilterControlled = controlledFilter !== undefined;
  const isPaginationControlled = controlledPagination !== undefined;
  const isSelectionControlled = controlledSelection !== undefined;

  // Compose mixins for grid behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label,
    labelledBy,
    describedBy,
    ...semanticProps
  });

  // Process data
  const processedData = useMemo(() => {
    let processed = processData ? processData(propData) : propData;

    // Apply validation
    if (validateRow) {
      processed = processed.filter(validateRow);
    }

    // Convert to GridRow objects
    return processed.map((item, index) => ({
      id: item.id || `row-${index}`,
      data: item,
      selected: selection.selectedRows.includes(item.id || `row-${index}`),
      disabled: item.disabled || false,
      index
    }));
  }, [propData, processData, validateRow, selection.selectedRows]);

  // Apply sorting
  const sortedRows = useMemo(() => {
    if (!sort.column) return processedData;

    const sorted = [...processedData].sort((a, b) => {
      const aValue = transformValue ? transformValue(a.data[sort.column], propColumns.find(c => c.id === sort.column) || {} as any, a) : a.data[sort.column];
      const bValue = transformValue ? transformValue(b.data[sort.column], propColumns.find(c => c.id === sort.column) || {} as any, b) : b.data[sort.column];

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sort.direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [processedData, sort, propColumns, transformValue]);

  // Apply filtering
  const filteredRows = useMemo(() => {
    if (!filter.column || !filter.value) return sortedRows;

    return sortedRows.filter(row => {
      const column = propColumns.find(c => c.id === filter.column);
      if (!column) return true;

      const accessor = column.accessor || filter.column;
      const value = typeof accessor === 'function' ? accessor(row.data) : row.data[accessor];
      const transformedValue = transformValue ? transformValue(value, column, row) : value;

      if (filter.operator === 'contains') {
        return String(transformedValue).toLowerCase().includes(String(filter.value).toLowerCase());
      }

      if (filter.operator === 'equals') {
        return transformedValue === filter.value;
      }

      if (filter.operator === 'startsWith') {
        return String(transformedValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
      }

      if (filter.operator === 'endsWith') {
        return String(transformedValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
      }

      return true;
    });
  }, [sortedRows, filter, propColumns, transformValue]);

  // Apply pagination
  const paginatedRows = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, pagination]);

  // Update pagination total
  useEffect(() => {
    if (!isPaginationControlled) {
      const totalItems = filteredRows.length;
      const totalPages = Math.ceil(totalItems / pagination.pageSize);

      setPagination(prev => ({
        ...prev,
        total: totalItems,
        totalPages,
        page: Math.min(prev.page, totalPages || 1)
      }));
    }
  }, [filteredRows, pagination.pageSize, isPaginationControlled]);

  // Resync internal state when controlled props change after mount.
  // Mirrors the useSelect pattern: derive current value from controlled || internal.
  useEffect(() => {
    if (isSortControlled) setSort(controlledSort as GridSort);
  }, [isSortControlled, controlledSort]);

  useEffect(() => {
    if (isFilterControlled) setFilter(controlledFilter as GridFilter);
  }, [isFilterControlled, controlledFilter]);

  useEffect(() => {
    if (isPaginationControlled) setPagination(controlledPagination as GridPagination);
  }, [isPaginationControlled, controlledPagination]);

  useEffect(() => {
    if (isSelectionControlled) setSelection(controlledSelection as GridSelection);
  }, [isSelectionControlled, controlledSelection]);

  // Compose data grid state
  const state = useMemo(() => ({
    rows: paginatedRows,
    columns: propColumns,
    sort,
    filter,
    pagination,
    selection,
    disabled,
    focused: focusableMixin.focused,
    loading,
    error: errorMessage,
    selectedCell,
    hoveredCell,
    // Aliases matching the DataGrid component's expected state shape.
    data: paginatedRows,
    selectedRows: selection.selectedRows,
    filters: filter,
    sortedData: paginatedRows,
    filteredData: paginatedRows,
    paginatedData: paginatedRows
  }), [paginatedRows, propColumns, sort, filter, pagination, selection, disabled, focusableMixin.focused, loading, errorMessage, selectedCell, hoveredCell]);

  // Event handlers
  const handleSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    if (disabled) return;

    const newSort = { column, direction };
    if (!isSortControlled) setSort(newSort);
    onSortChange?.(newSort);
  }, [disabled, isSortControlled, onSortChange]);

  const handleFilter = useCallback((column: string, value: any, operator: GridFilter['operator'] = 'contains') => {
    if (disabled) return;

    const newFilter = { column, value, operator };
    if (!isFilterControlled) setFilter(newFilter);
    onFilterChange?.(newFilter);

    // Reset to first page when filtering
    if (!isPaginationControlled) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [disabled, isFilterControlled, onFilterChange, isPaginationControlled]);

  const handlePagination = useCallback((page: number, pageSize?: number) => {
    if (disabled) return;

    const newPagination = {
      ...pagination,
      page,
      ...(pageSize && { pageSize, totalPages: Math.ceil(pagination.total / pageSize) })
    };
    if (!isPaginationControlled) setPagination(newPagination);
    onPaginationChange?.(newPagination);
  }, [disabled, pagination, isPaginationControlled, onPaginationChange]);

  const handleSelection = useCallback((rowIds: string[], mode: 'single' | 'multiple' = 'multiple') => {
    if (disabled) return;

    const newSelection = {
      selectedRows: rowIds,
      mode
    };
    if (!isSelectionControlled) setSelection(newSelection);
    onSelectionChange?.( newSelection);
  }, [disabled, isSelectionControlled, onSelectionChange]);

  const handleRowClick = useCallback((row: GridRow, event: React.MouseEvent) => {
    if (disabled || row.disabled) return;

    onRowClick?.(row);

    // Handle row selection
    if (showSelection) {
      const isSelected = selection.selectedRows.includes(row.id);
      const newSelectedRows = selection.mode === 'single'
        ? [row.id]
        : isSelected
          ? selection.selectedRows.filter(id => id !== row.id)
          : [...selection.selectedRows, row.id];

      handleSelection(newSelectedRows, selection.mode);
    }
  }, [disabled, onRowClick, showSelection, selection.selectedRows, selection.mode, handleSelection]);

  const handleCellClick = useCallback((row: GridRow, column: GridColumn, event: React.MouseEvent) => {
    if (disabled || row.disabled) return;

    setSelectedCell({ rowIndex: row.index || 0, columnId: column.id });
    const cellValue = typeof column.accessor === 'function'
      ? column.accessor(row.data)
      : row.data[column.accessor || column.id];
    onCellClick?.(row, column, cellValue);
  }, [disabled, onCellClick]);

  const handleHeaderClick = useCallback((column: GridColumn, event: React.MouseEvent) => {
    if (disabled) return;

    if (column.sortable) {
      const currentDirection = sort.column === column.id ? sort.direction : 'asc';
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      handleSort(column.id, newDirection);
    }

    onHeaderClick?.(column);
  }, [disabled, sort.column, sort.direction, handleSort, onHeaderClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled) return;

    // Handle custom key bindings
    if (keyBindings[event.key]) {
      event.preventDefault();
      keyBindings[event.key]();
      return;
    }

    // Handle built-in shortcuts
    if (keyboardShortcuts) {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          // Move the active cell within the grid bounds.
          const colCount = state.columns.length;
          const rowCount = state.rows.length;
          if (colCount === 0 || rowCount === 0) break;

          const current = selectedCell ?? { rowIndex: 0, columnId: state.columns[0].id };
          const currentColIndex = Math.max(
            0,
            state.columns.findIndex(c => c.id === current.columnId)
          );

          let nextRow = current.rowIndex;
          let nextCol = currentColIndex;
          if (event.key === 'ArrowUp') nextRow -= 1;
          else if (event.key === 'ArrowDown') nextRow += 1;
          else if (event.key === 'ArrowLeft') nextCol -= 1;
          else nextCol += 1;

          // Clamp to grid bounds.
          nextRow = Math.min(Math.max(nextRow, 0), rowCount - 1);
          nextCol = Math.min(Math.max(nextCol, 0), colCount - 1);

          const nextColumn = state.columns[nextCol];
          if (
            nextRow !== current.rowIndex ||
            nextColumn?.id !== current.columnId
          ) {
            setSelectedCell({
              rowIndex: nextRow,
              columnId: nextColumn ? nextColumn.id : current.columnId
            });
          }
          event.preventDefault();
          break;
        }

        case 'Enter':
        case ' ':
          // Activate selected cell
          if (selectedCell) {
            const row = state.rows[selectedCell.rowIndex];
            if (row) {
              handleCellClick(row, state.columns.find(c => c.id === selectedCell.columnId) || {} as any, event as any);
            }
          }
          break;

        case 'Escape':
          // Clear selection
          setSelectedCell(undefined);
          break;

        case 'a':
        case 'A':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleSelectAll();
          }
          break;

        default:
          // Delegate to focusable mixin for standard navigation
          focusableMixin.handleKeyDown(event);
          break;
      }
    }
  }, [focusable, disabled, keyBindings, keyboardShortcuts, selectedCell, state.rows, state.columns, handleCellClick, focusableMixin.handleKeyDown]);

  const handleSelectAll = useCallback(() => {
    if (disabled) return;

    const allRowIds = state.rows.map(row => row.id);
    handleSelection(allRowIds, selection.mode);
  }, [disabled, state.rows, selection.mode, handleSelection]);

  const handleClearSelection = useCallback(() => {
    if (disabled) return;

    handleSelection([], selection.mode);
  }, [disabled, selection.mode, handleSelection]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-label': label || 'Data table',
    'aria-rowcount': state.rows.length,
    'aria-colcount': state.columns.length + (showRowNumbers ? 1 : 0) + (showSelection ? 1 : 0),
    'aria-multiselectable': selection.mode === 'multiple',
    'data-sort-column': sort.column,
    'data-sort-direction': sort.direction,
    'data-filter-column': filter.column,
    'data-loading': loading,
    'aria-busy': loading,
    tabIndex: focusable ? 0 : -1,
    onKeyDown: handleKeyDown,
    role: role
  }), [semantic, label, state.rows.length, state.columns.length, showRowNumbers, showSelection, selection.mode, sort.column, sort.direction, filter.column, loading, focusable, handleKeyDown, role]);

  // Handlers object (memoized so the outer return can be referentially stable).
  const handlers = useMemo(() => ({
    handleSort,
    handleFilter,
    handlePagination,
    handleSelection,
    handleRowClick,
    handleCellClick,
    handleHeaderClick,
    handleKeyDown,
    handleSelectAll,
    handleClearSelection
  }), [handleSort, handleFilter, handlePagination, handleSelection, handleRowClick, handleCellClick, handleHeaderClick, handleKeyDown, handleSelectAll, handleClearSelection]);

  return useMemo(() => ({
    state,
    handlers,
    attributes: semanticAttributes
  }), [state, handlers, semanticAttributes]);
}