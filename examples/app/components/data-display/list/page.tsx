'use client';

import { useState } from 'react';
import { List } from '@hieupth/react-headless-ui';
import type { ListItem } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// List renders a vertical (or horizontal) collection of rows from an `items`
// array. It owns selection (single/multi), keyboard navigation (arrows, Home/
// End, Enter), optional search, sort, pagination, and a timeline mode. Headless
// on CSS — theme through className / renderItem.
const people: ListItem[] = [
  { id: '1', value: 1, label: 'Ada Lovelace', description: 'Mathematician' },
  { id: '2', value: 2, label: 'Alan Turing', description: 'Computer scientist' },
  { id: '3', value: 3, label: 'Grace Hopper', description: 'Rear admiral' },
];

export default function ListPage() {
  const [selected, setSelected] = useState<(string | number)[]>([]);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">List</h1>
        <p className="docs-lead">
          A vertical collection backed by the headless{' '}
          <code className="docs-code">useList</code> hook. It renders an{' '}
          array of <code>ListItem</code>s (label, description, icon, metadata)
          and owns selection (single or <code>multiSelect</code>), full keyboard
          navigation, optional <code>searchable</code> filtering, sorting,
          pagination, and a <code>showTimeline</code> mode that lays items out
          along a timestamped rail.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Selectable list</h2>
        <p className="docs-desc">
          Drive <code>selectedKeys</code> with state;{' '}
          <code>onSelectionChange</code> returns the selected id array.
        </p>
        <Demo
          code={`const [selected, setSelected] = useState([]);

<List
  items={people}
  multiSelect
  selectedKeys={selected}
  onSelectionChange={setSelected}
  className="w-72 cursor-pointer divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700 [&_[role=option]]:px-3 [&_[role=option]]:py-2"
/>`}
        >
          <List
            items={people}
            multiSelect
            selectedKeys={selected}
            onSelectionChange={setSelected}
            className="w-72 cursor-pointer divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700 [&_[role=option]]:px-3 [&_[role=option]]:py-2"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Searchable</h2>
        <p className="docs-desc">
          <code>searchable</code> filters the items; the search field itself is
          headless — supply a <code>renderSearch</code> that composes the{' '}
          <code>value</code> / <code>onChange</code> / <code>placeholder</code>{' '}
          props. Use <code>searchFields</code> to constrain which fields are
          matched.
        </p>
        <Demo
          code={`<List
  items={people}
  searchable
  searchFields={['label']}
  searchPlaceholder="Filter people…"
  renderSearch={({ value, onChange, placeholder }) => (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full border-b border-gray-200 px-3 py-2 text-sm outline-none dark:border-gray-700"
    />
  )}
  className="w-72 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700 [&_[role=option]]:px-3 [&_[role=option]]:py-2"
/>`}
        >
          <List
            items={people}
            searchable
            searchFields={['label']}
            searchPlaceholder="Filter people…"
            renderSearch={({ value, onChange, placeholder }) => (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-t-lg border-b border-gray-200 px-3 py-2 text-sm outline-none dark:border-gray-700"
              />
            )}
            className="w-72 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700 [&_[role=option]]:px-3 [&_[role=option]]:py-2"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            { name: 'items / defaultItems', type: 'ListItem[]', default: '—', description: 'Controlled / initial list rows: { id, value, label, description?, icon?, timestamp? }.' },
            { name: 'multiSelect', type: 'boolean', default: 'false', description: 'Allow selecting more than one row.' },
            { name: 'selectedKeys / defaultSelectedKeys', type: '(string | number)[]', default: '—', description: 'Controlled / initial selection.' },
            { name: 'searchable', type: 'boolean', default: 'false', description: 'Show a filter input.' },
            { name: 'searchFields', type: "(keyof ListItem)[]", default: '—', description: 'Fields to match against.' },
            { name: 'sortable / defaultSortField', type: 'boolean / keyof ListItem', default: '—', description: 'Enable sorting.' },
            { name: 'showTimeline', type: 'boolean', default: 'false', description: 'Lay items out along a timestamped rail.' },
            { name: 'timelinePosition', type: "'left' | 'right' | 'center'", default: "'left'", description: 'Rail placement.' },
            { name: 'pagination', type: "{ enabled?, itemsPerPage?, defaultPage? }", default: '—', description: 'Client-side paging config.' },
            { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction.' },
            { name: 'onSelectionChange', type: '(keys) => void', default: '—', description: 'Fires with the selected id array.' },
            { name: 'onItemClick', type: '(item) => void', default: '—', description: 'Row click handler.' },
            { name: 'renderItem', type: '(props) => ReactNode', default: '—', description: 'Replace the default row renderer.' },
          ]}
        />
      </section>
    </div>
  );
}
