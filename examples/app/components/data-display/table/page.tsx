'use client';

import { Table } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Table renders a real <table> from a columns + data config. The hook owns
// sorting, filtering, pagination, selection, and row expansion. Headless on
// CSS — theme rows/cells through className.
const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'role', title: 'Role' },
  { key: 'age', title: 'Age', sortable: true, dataType: 'number' as const },
];

const data = [
  { id: '1', name: 'Ada Lovelace', role: 'Engineer', age: 36 },
  { id: '2', name: 'Alan Turing', role: 'Researcher', age: 41 },
  { id: '3', name: 'Grace Hopper', role: 'Manager', age: 85 },
];

export default function TablePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Table</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A styled data table backed by the headless{' '}
          <code className="font-mono text-sm">useTable</code> hook. Pass a{' '}
          <code>columns</code> config and a <code>data</code> array; the hook
          drives client-side sorting (<code>defaultSort</code>), filtering
          (<code>defaultFilters</code>), pagination, row selection, and row
          expansion — each toggled with <code>enable*</code> flags. Columns can
          declare <code>sortable</code>, <code>filterable</code>, an{' '}
          <code>align</code>, and a per-cell <code>render</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic table</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Columns map to row keys; mark <code>sortable</code> columns to get
          clickable headers.
        </p>
        <Demo
          code={`<Table
  columns={[
    { key: 'name', title: 'Name', sortable: true },
    { key: 'role', title: 'Role' },
    { key: 'age', title: 'Age', sortable: true, dataType: 'number' }
  ]}
  data={data}
/>`}
        >
          <Table
            columns={columns}
            data={data}
            variant="bordered"
            className="w-full text-sm border border-gray-200 dark:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:px-3 [&_td]:py-2"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Striped &amp; compact</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant="striped"</code> and <code>compact</code> are density
          hooks (style them through your theme).
        </p>
        <Demo
          code={`<Table columns={columns} data={data} variant="striped" compact />`}
        >
          <Table
            columns={columns}
            data={data}
            variant="striped"
            compact
            className="w-full text-sm border border-gray-200 dark:border-gray-700 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(even)]:bg-gray-50 dark:[&_tbody_tr:nth-child(even)]:bg-gray-900/40"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With selection</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>enableSelection</code> adds a checkbox column; listen via{' '}
          <code>onSelectionChange</code>.
        </p>
        <Demo
          code={`<Table
  columns={columns}
  data={data}
  enableSelection
  onSelectionChange={(s) => console.log(s)}
/>`}
        >
          <Table
            columns={columns}
            data={data}
            enableSelection
            className="w-full text-sm border border-gray-200 dark:border-gray-700 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:px-3 [&_td]:py-2"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'columns', type: 'TableColumn[]', default: '—', description: 'Column config: { key, title, sortable?, filterable?, align?, render?, dataType? }.' },
            { name: 'data', type: 'any[]', default: '—', description: 'Row objects keyed by column.key.' },
            { name: 'defaultSort', type: '{ key, direction }', default: '—', description: 'Initial sort.' },
            { name: 'enablePagination / enableSelection / enableExpansion', type: 'boolean', default: 'false', description: 'Enable built-in features.' },
            { name: 'selectionConfig', type: 'object', default: '—', description: 'Selection mode + initial selection.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Density hook.' },
            { name: 'variant', type: "'default' | 'bordered' | 'striped'", default: "'default'", description: 'Visual variant hook.' },
            { name: 'showHeaders / showRowNumbers / compact', type: 'boolean', default: '—', description: 'Header, row-number, and compact toggles.' },
            { name: 'onSortChange / onSelectionChange', type: '(value) => void', default: '—', description: 'Feature change callbacks.' },
            { name: 'renderCell / renderHeader', type: '(…) => ReactNode', default: '—', description: 'Custom cell/header renderers.' },
          ]}
        />
      </section>
    </div>
  );
}
