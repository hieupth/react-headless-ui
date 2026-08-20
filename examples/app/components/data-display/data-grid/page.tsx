'use client';

import { DataGrid } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// DataGrid is a feature-rich grid built on useDataGrid + useVirtualList. It
// supports sorting, filtering, pagination, row selection, column visibility,
// and virtualizes the body past ~100 rows. Headless on CSS — theme through
// className.
const columns = [
  { id: 'name', header: 'Name', sortable: true },
  // `title` feeds the column filter placeholder ("Filter Role...")
  { id: 'role', header: 'Role', title: 'Role', filterable: true },
  { id: 'age', header: 'Age', sortable: true, type: 'number' as const },
];

// Rows are flat records with a unique `id`; column ids map to record keys.
const data = [
  { id: '1', name: 'Ada Lovelace', role: 'Engineer', age: 36 },
  { id: '2', name: 'Alan Turing', role: 'Researcher', age: 41 },
  { id: '3', name: 'Grace Hopper', role: 'Manager', age: 85 },
];

export default function DataGridPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">DataGrid</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A feature-rich grid backed by the headless{' '}
          <code className="font-mono text-sm">useDataGrid</code> hook and{' '}
          <code>useVirtualList</code>. Beyond a plain table it offers
          client-side sorting, filtering, pagination, row selection, column
          visibility/resizing, and automatic body virtualization once the row
          count crosses the threshold (~100). Each column declares{' '}
          <code>sortable</code>, <code>filterable</code>,{' '}
          <code>resizable</code>, and an optional{' '}
          <code>cellRenderer</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic grid</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Rows are flat records with a unique <code>id</code>; column ids map
          to record keys.
        </p>
        <Demo
          code={`<DataGrid
  columns={[
    { id: 'name', header: 'Name', sortable: true },
    { id: 'role', header: 'Role', title: 'Role', filterable: true },
    { id: 'age', header: 'Age', sortable: true, type: 'number' }
  ]}
  data={data}
  className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
/>`}
        >
          <DataGrid
            columns={columns}
            data={data}
            className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Selection &amp; pagination</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>showSelection</code> adds a checkbox column;{' '}
          <code>showPagination</code> renders paging controls driven by{' '}
          <code>pageSizeOptions</code>.
        </p>
        <Demo
          code={`<DataGrid
  columns={columns}
  data={data}
  showSelection
  showPagination
  pageSizeOptions={[5, 10, 25]}
  onSelectionChange={(s) => console.log(s)}
  className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
/>`}
        >
          <DataGrid
            columns={columns}
            data={data}
            showSelection
            showPagination
            pageSizeOptions={[5, 10, 25]}
            onSelectionChange={(s) => console.log(s)}
            className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Virtualized</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>virtualize</code> to window the body so large grids render
          only the visible rows. It kicks in automatically once{' '}
          <code>data</code> grows past <code>virtualizeThreshold</code> (default{' '}
          100), or set <code>virtualize</code> explicitly to force it on.
        </p>
        <Demo
          code={`<DataGrid
  columns={columns}
  data={largeData}
  virtualize
  virtualizeThreshold={100}
  className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
/>`}
        >
          <div className="text-xs text-gray-500 text-center py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded w-full">
            Code-only: pass a large <code>data</code> array with{' '}
            <code>virtualize</code> to window the body.
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'columns', type: 'GridColumn[]', default: '—', description: 'Column config: { id, header, sortable?, filterable?, resizable?, accessor?, cellRenderer? }.' },
            { name: 'data', type: 'Record<string, unknown>[]', default: '—', description: 'Rows: flat records with a unique id; column ids map to record keys.' },
            { name: 'sort / defaultSort', type: '{ key, direction }', default: '—', description: 'Controlled / initial sort.' },
            { name: 'filter / defaultFilter', type: 'GridFilter', default: '—', description: 'Controlled / initial filter.' },
            { name: 'pagination / defaultPagination', type: 'GridPagination', default: '—', description: 'Controlled / initial paging.' },
            { name: 'showHeader / showPagination / showSelection / showRowNumbers', type: 'boolean', default: '—', description: 'Feature visibility toggles.' },
            { name: 'pageSizeOptions', type: 'number[]', default: '—', description: 'Page-size choices for the pager.' },
            { name: 'virtualize', type: 'boolean', default: 'auto', description: 'Force body virtualization on/off. Auto-enables past virtualizeThreshold.' },
            { name: 'virtualizeThreshold', type: 'number', default: '100', description: 'Row count at which virtualization auto-enables.' },
            { name: 'onSortChange / onFilterChange / onSelectionChange', type: '(value) => void', default: '—', description: 'Feature change callbacks.' },
            { name: 'cellRenderer / headerRenderer', type: '(…) => ReactNode', default: '—', description: 'Per-cell / per-header render overrides.' },
          ]}
        />
      </section>
    </div>
  );
}
