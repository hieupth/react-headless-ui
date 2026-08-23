'use client';

import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// ContextMenu (the dedicated renderer) opens at the cursor via the headless
// useContextMenu hook and portals its list to document.body at a fixed {x, y}.
// A live preview in the Demo frame is misleading, so the snippets show the API.

export default function ContextMenuPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">ContextMenu</h1>
        <p className="docs-lead">
          A right-click menu backed by the headless{' '}
          <code className="docs-code">useContextMenu</code> hook. It
          opens at the cursor position, supports action / checkbox / radio /
          separator / submenu item types, roves focus with the keyboard, and
          closes on outside-click / Escape / select. The list portals to{' '}
          <code className="docs-code">document.body</code> at a fixed{' '}
          <code>{'{ x, y }'}</code> — theme the rendered items in your app.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Right-click trigger</h2>
        <p className="docs-desc">
          Wrap a region with <code>&lt;ContextMenuTrigger&gt;</code>; the hook
          suppresses the native menu and reports the cursor{' '}
          <code>position</code>. Control open state with{' '}
          <code>open</code> / <code>onOpenChange</code>.
        </p>
        <Demo
          code={`<ContextMenu
  className="min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  open={open}
  onOpenChange={setOpen}
  trigger="contextmenu"
/>`}
        >
          <div className="w-full rounded-md border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500">
            Right-click anywhere in a real app to open the menu at the cursor.
            The list portals to <code>body</code> at a fixed position — see the
            snippet.
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Item types</h2>
        <p className="docs-desc">
          Set <code>type</code> per item: <code>action</code>,{' '}
          <code>checkbox</code>, <code>radio</code>, <code>separator</code>, or{' '}
          <code>submenu</code>. Checkbox/radio items render a checked state.
        </p>
        <Demo
          code={`<ContextMenu
  className="min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={[
    { id: 'wrap', label: 'Word wrap', type: 'checkbox', checked: true },
    { id: 'mini', label: 'Minimap', type: 'checkbox' },
    { id: 'sep1', label: '—', type: 'separator' },
    { id: 'theme', label: 'Theme', type: 'submenu' }
  ]}
/>`}
        >
          <p className="text-sm text-gray-500">
            Item typing drives the rendered affordance — see the snippet for the
            data shape.
          </p>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'ContextMenuItem[]',
              default: '—',
              description: 'Entries: { id, label, type?, disabled?, checked?, icon? }.',
            },
            {
              name: 'open / defaultOpen / onOpenChange',
              type: 'boolean / (open) => void',
              default: '—',
              description: 'Controlled / uncontrolled visibility.',
            },
            {
              name: 'position / defaultPosition',
              type: '{ x: number; y: number }',
              default: '—',
              description: 'Pixel coordinates where the menu appears.',
            },
            {
              name: 'trigger',
              type: "'contextmenu' | 'click' | 'hover' | 'manual'",
              default: "'contextmenu'",
              description: 'Interaction that opens the menu.',
            },
            {
              name: 'hoverDelay',
              type: 'number',
              default: '—',
              description: 'Auto-close delay when trigger="hover".',
            },
            {
              name: 'itemRenderer',
              type: '(item, index, props) => ReactNode',
              default: '—',
              description: 'Custom renderer for each item.',
            },
            {
              name: 'ContextMenuTrigger',
              type: 'component',
              default: '—',
              description: 'Wraps a region to open the menu on right-click.',
            },
          ]}
        />
      </section>
    </div>
  );
}
