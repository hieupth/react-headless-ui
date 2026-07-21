'use client';

import { DataGrid } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// DataGrid is a feature-rich grid built on useDataGrid + useVirtualList. It
// supports sorting, filtering, pagination, row selection, column visibility,
// and virtualizes the body past ~100 rows. Headless on CSS — theme through
// className.
const columns = [
  { id: 'name', header: 'Name', sortable: true },
  { id: 'role', header: 'Role', filterable: true },
  { id: 'age', header: 'Age', sortable: true, type: 'number' as const },
];

const data = [
  { id: '1', data: { name: 'Ada Lovelace', role: 'Engineer', age: 36 } },
  { id: '2', data: { name: 'Alan Turing', role: 'Researcher', age: 41 } },
  { id: '3', data: { name: 'Grace Hopper', role: 'Manager', age: 85 } },
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
          Rows are <code>{'{ id, data }'}</code> records; columns map to{' '}
          <code>data</code> keys.
        </p>
        <Demo
          code={`<DataGrid
  columns={[
    { id: 'name', header: 'Name', sortable: true },
    { id: 'role', header: 'Role', filterable: true },
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
            className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Virtualized</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>virtualScrolling.enabled</code>, large grids render only
          the visible rows plus an overscan buffer — governed by{' '}
          <code>itemHeight</code> and a max body height.
        </p>
        <Demo
          code={`<DataGrid
  columns={columns}
  data={largeData}
  height={300}
  virtualScrolling={{ enabled: true, itemHeight: 40, overscan: 5 }}
  className="w-full rounded-lg border border-gray-200 text-sm dark:border-gray-700 [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold"
/>`}
        >
          <div className="text-xs text-gray-500 text-center py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded w-full">
            Code-only: pass a large <code>data</code> array with{' '}
            <code>virtualScrolling={'{ enabled: true }'}</code> to window the
            body.
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'columns', type: 'GridColumn[]', default: '—', description: 'Column config: { id, header, sortable?, filterable?, resizable?, accessor?, cellRenderer? }.' },
            { name: 'data', type: 'GridRow[]', default: '—', description: 'Rows: { id, data, selected?, disabled? }.' },
            { name: 'sort / defaultSort', type: '{ key, direction }', default: '—', description: 'Controlled / initial sort.' },
            { name: 'filter / defaultFilter', type: 'GridFilter', default: '—', description: 'Controlled / initial filter.' },
            { name: 'pagination / defaultPagination', type: 'GridPagination', default: '—', description: 'Controlled / initial paging.' },
            { name: 'showHeader / showPagination / showSelection / showRowNumbers', type: 'boolean', default: '—', description: 'Feature visibility toggles.' },
            { name: 'pageSizeOptions', type: 'number[]', default: '—', description: 'Page-size choices for the pager.' },
            { name: 'virtualScrolling', type: "{ enabled?, itemHeight?, overscan? }", default: '—', description: 'Body virtualization config.' },
            { name: 'height / width', type: "number | string", default: '—', description: 'Grid dimensions.' },
            { name: 'onSortChange / onFilterChange / onSelectionChange', type: '(value) => void', default: '—', description: 'Feature change callbacks.' },
            { name: 'cellRenderer / headerRenderer', type: '(…) => ReactNode', default: '—', description: 'Per-cell / per-header render overrides.' },
          ]}
        />
      </section>
    </div>
  );
}
