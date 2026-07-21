'use client';

import { useState } from 'react';
import { Menubar } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Menubar renders a horizontal/vertical bar of top-level menus with submenus,
// backed by useMenubar. It emits semantic class hooks but no CSS — theme the
// bar via the `className` prop.
const menubarCls =
  'flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

const items = [
  {
    id: 'file',
    label: 'File',
    children: [
      { id: 'new', label: 'New', shortcut: '⌘N' },
      { id: 'open', label: 'Open…', shortcut: '⌘O' },
      { id: 'exit', label: 'Exit' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    children: [
      { id: 'undo', label: 'Undo', shortcut: '⌘Z' },
      { id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
    ],
  },
  { id: 'view', label: 'View' },
  { id: 'help', label: 'Help', disabled: true },
];

export default function MenubarPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Menubar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A horizontal (or vertical) top-level menu bar backed by the headless{' '}
          <code className="font-mono text-sm">useMenubar</code> hook. It manages
          the application-menu keyboard model — arrow keys move between
          top-level items, Up/Down open and traverse a submenu, Esc closes — and
          wires <code>role="menubar"</code> / <code>menuitem</code>. The
          renderer emits class hooks; apply your own styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Top-level menus + submenus</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Nest items under <code>children</code> to define submenus. Track the
          active item via <code>onItemActivate</code>;{' '}
          <code>orientation</code> switches the bar axis and arrow-key model.
        </p>
        <Demo
          code={`<Menubar
  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  orientation="horizontal"
  onItemActivate={(item) => setActive(item.id)}
/>`}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <Menubar
              className={menubarCls}
              items={items}
              orientation="horizontal"
              onItemActivate={(item) => setActive(item.id)}
            />
            <span className="text-xs text-gray-500">
              {active ? `Activated: ${active}` : 'The bar renders structure + a11y — theme it with CSS.'}
            </span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Toggles &amp; lifecycle hooks</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>showSeparators</code> / <code>showIcons</code> /{' '}
          <code>showShortcuts</code> control affordances;{' '}
          <code>onSubmenuOpen</code> / <code>onSubmenuClose</code> fire as panels
          appear. A disabled bar is non-interactive.
        </p>
        <Demo
          code={`<Menubar
  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  showSeparators
  showIcons
  showShortcuts
  onSubmenuOpen={(id) => console.log('open', id)}
  onSubmenuClose={() => console.log('close')}
/>`}
        >
          <p className="text-sm text-gray-500">
            Affordance toggles + submenu lifecycle callbacks — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'MenuItem[]',
              default: '—',
              description: 'Top-level entries: { id, label, icon?, shortcut?, children?, action? }.',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Bar layout (also flips the traversal axis).',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the whole menubar.',
            },
            {
              name: 'defaultOpen',
              type: 'boolean',
              default: 'false',
              description: 'Whether the bar starts in its open/active state.',
            },
            {
              name: 'onItemActivate',
              type: '(item: MenuItem) => void',
              default: '—',
              description: 'Fires when a (leaf) item is activated.',
            },
            {
              name: 'onSubmenuOpen / onSubmenuClose',
              type: '(itemId) => void / () => void',
              default: '—',
              description: 'Submenu lifecycle callbacks.',
            },
            {
              name: 'showSeparators / showIcons / showShortcuts',
              type: 'boolean',
              default: 'false',
              description: 'Toggle row affordances.',
            },
          ]}
        />
      </section>
    </div>
  );
}
