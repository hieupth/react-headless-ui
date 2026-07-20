'use client';

import { ContextMenu } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// ContextMenu (the dedicated renderer) opens at the cursor via the headless
// useContextMenu hook and portals its list to document.body at a fixed {x, y}.
// A live preview in the Demo frame is misleading, so the snippets show the API.
const items = [
  { id: 'copy', label: 'Copy', icon: '⧉' },
  { id: 'cut', label: 'Cut' },
  { id: 'paste', label: 'Paste', disabled: true },
  { id: 'rename', label: 'Rename', type: 'action' },
  { id: 'delete', label: 'Delete', type: 'action' },
];

export default function ContextMenuPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">ContextMenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A right-click menu backed by the headless{' '}
          <code className="font-mono text-sm">useContextMenu</code> hook. It
          opens at the cursor position, supports action / checkbox / radio /
          separator / submenu item types, roves focus with the keyboard, and
          closes on outside-click / Escape / select. The list portals to{' '}
          <code className="font-mono text-sm">document.body</code> at a fixed{' '}
          <code>{'{ x, y }'}</code> — theme the rendered items in your app.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Right-click trigger</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Wrap a region with <code>&lt;ContextMenuTrigger&gt;</code>; the hook
          suppresses the native menu and reports the cursor{' '}
          <code>position</code>. Control open state with{' '}
          <code>open</code> / <code>onOpenChange</code>.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<ContextMenu
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Item types</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>type</code> per item: <code>action</code>,{' '}
          <code>checkbox</code>, <code>radio</code>, <code>separator</code>, or{' '}
          <code>submenu</code>. Checkbox/radio items render a checked state.
        </p>
        <Demo
          code={`<ContextMenu
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
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
