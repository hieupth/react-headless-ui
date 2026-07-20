'use client';

import { useState } from 'react';
import { Sortable, type SortableProps } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Sortable is backed by the headless useSortable hook and the native HTML
// drag-and-drop API. Declare items as data; the default renderer wires
// draggable, onDragStart/Over/Drop, a drag handle, and a drop indicator. It is
// semi-styled through theme tokens, and you can take over with `renderItem`.
const initialTasks: SortableProps['defaultItems'] = [
  { id: 1, value: 'task-1', label: 'Design the landing page', index: 0 },
  { id: 2, value: 'task-2', label: 'Write the API spec', index: 1 },
  { id: 3, value: 'task-3', label: 'Set up CI', index: 2 },
  { id: 4, value: 'task-4', label: 'Ship v1', index: 3, disabled: true },
];

const horizontalItems: SortableProps['defaultItems'] = [
  { id: 'a', value: 'todo', label: 'To Do', index: 0 },
  { id: 'b', value: 'doing', label: 'In Progress', index: 1 },
  { id: 'c', value: 'done', label: 'Done', index: 2 },
];

export default function SortablePage() {
  const [order, setOrder] = useState('1 → 2 → 3 → 4');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Sortable</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A drag-and-drop reorderable list backed by the headless{' '}
          <code className="font-mono text-sm">useSortable</code> hook. It wraps
          the native HTML drag-and-drop API — tracking the dragging item, the
          drop target, and animating transitions — while exposing{' '}
          <code>onReorder</code> with the old and new indices. Items are plain
          data; the default renderer wires up <code>draggable</code>, drag
          handlers, an optional drag handle, and a drop indicator. Override any
          of it with <code>renderItem</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Vertical list</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drag an item up or down to reorder. The disabled item stays put.
          Current order: <code className="font-mono">{order}</code>.
        </p>
        <Demo
          code={`<Sortable
  defaultItems={[
    { id: 1, value: 'task-1', label: 'Design the landing page', index: 0 },
    { id: 2, value: 'task-2', label: 'Write the API spec', index: 1 },
    { id: 3, value: 'task-3', label: 'Set up CI', index: 2 },
  ]}
  direction="vertical"
  showHandles
  onReorder={(items) => console.log(items)}
/>`}
        >
          <div className="w-full max-w-sm">
            <Sortable
              defaultItems={initialTasks}
              direction="vertical"
              showHandles
              onReorder={(items) =>
                setOrder(items.map((i) => i.id).join(' → '))
              }
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="horizontal"</code> lays items out in a row and drops
          a vertical separator between targets.
        </p>
        <Demo
          code={`<Sortable
  defaultItems={horizontalItems}
  direction="horizontal"
/>`}
        >
          <div className="w-full">
            <Sortable defaultItems={horizontalItems} direction="horizontal" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Custom item renderer</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>renderItem</code> receives the item, its index, and ready-made{' '}
          <code>dragProps</code> — spread them onto any element to make it
          draggable without touching the hook yourself.
        </p>
        <Demo
          code={`<Sortable
  defaultItems={items}
  renderItem={({ item, isDragging, dragProps }) => (
    <div {...dragProps} style={{ opacity: isDragging ? 0.4 : 1 }}>
      {item.label}
    </div>
  )}
/>`}
        >
          <div className="w-full max-w-sm">
            <Sortable
              defaultItems={initialTasks}
              direction="vertical"
              renderItem={({ item, isDragging, dragProps }) => (
                <div
                  {...dragProps}
                  className={
                    'flex items-center gap-2 rounded-md border px-3 py-2 text-sm ' +
                    (isDragging
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900')
                  }
                >
                  <span className="text-gray-400 cursor-grab" aria-hidden>⠿</span>
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <span className="text-xs text-gray-400">locked</span>
                  )}
                </div>
              )}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'defaultItems', type: 'SortableItem[]', default: '[]', description: 'Uncontrolled initial items (id, value, label, index).' },
            { name: 'items', type: 'SortableItem[]', default: '—', description: 'Controlled item list.' },
            { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'List axis; also drives the drop indicator orientation.' },
            { name: 'showHandles', type: 'boolean', default: 'false', description: 'Show a drag handle grip instead of making the whole item draggable.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable dragging for the entire list.' },
            { name: 'locked', type: 'boolean', default: 'false', description: 'Temporarily lock reordering while keeping items visible.' },
            { name: 'animated', type: 'boolean', default: 'true', description: 'Animate item transitions and the dragging transform.' },
            { name: 'dragThreshold', type: 'number', default: '—', description: 'Pixels of movement before a drag starts.' },
            { name: 'onReorder', type: '(items, oldIndex, newIndex) => void', default: '—', description: 'Fires after a successful drop with the new ordering.' },
            { name: 'renderItem', type: '(props) => ReactNode', default: '—', description: 'Custom renderer receiving item, index, flags, and dragProps.' },
          ]}
        />
      </section>
    </div>
  );
}
