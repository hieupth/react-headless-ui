'use client';

import { useState } from 'react';
import { Menu } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Menu portals its list to document.body via createPortal and positions it
// absolutely. A live preview inside the Demo frame would be misleading, so the
// snippets below show the headless API; theme the emitted `menu` / `menuitem`
// roles and class hooks in your app. The `className` themes the floating list;
// the trigger is the styled child button.
const triggerBtn =
  'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 ' +
  'text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800';

const menuListCls =
  'min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

export default function MenuPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Menu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A vertical menu backed by the headless{' '}
          <code className="font-mono text-sm">useMenu</code> hook. It opens on
          click / hover / right-click, roves focus with arrow keys, supports
          single/multi selection, submenus, separators, and closes on
          outside-click / Escape / selection. The floating list renders through
          a portal to <code className="font-mono text-sm">document.body</code> —
          theme the <code>menu</code> / <code>menuitem</code> roles.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Click-trigger menu</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass a trigger element as <code>children</code> and an{' '}
          <code>items</code> array. Default <code>trigger="click"</code> toggles
          the menu; <code>closeOnSelection</code> dismisses after a click.
        </p>
        <Demo
          code={`<Menu
  className="min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  open={open}
  onOpenChange={setOpen}
  trigger="click"
  items={[
    { key: 'new', label: 'New file', shortcut: '⌘N' },
    { key: 'open', label: 'Open…' },
    { key: 'sep', label: '—' },
    { key: 'exit', label: 'Exit', disabled: true }
  ]}
>
  <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
    File
  </button>
</Menu>`}
        >
          <div className="flex flex-col items-center gap-3">
            <Menu
              className={menuListCls}
              open={open}
              onOpenChange={setOpen}
              trigger="click"
              items={[
                { key: 'new', label: 'New file', shortcut: '⌘N' },
                { key: 'open', label: 'Open…' },
                { key: 'exit', label: 'Exit', disabled: true },
              ]}
            >
              <button type="button" className={triggerBtn}>
                File <span aria-hidden>▾</span>
              </button>
            </Menu>
            <span className="text-xs text-gray-500">
              The menu list portals to body and positions absolutely — the{' '}
              <code>className</code> themes the list; theme the trigger button.
            </span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Selection &amp; submenus</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enable <code>multiSelect</code> to render check marks for more than
          one item; nest items under <code>submenu</code> for cascading menus.
          Hover-triggered menus open with <code>trigger="hover"</code>.
        </p>
        <Demo
          code={`<Menu
  className="min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  trigger="hover"
  multiSelect
  items={[
    { key: 'bold', label: 'Bold', selected: true },
    { key: 'italic', label: 'Italic' },
    { key: 'theme', label: 'Theme', submenu: [
      { key: 'light', label: 'Light' },
      { key: 'dark', label: 'Dark' }
    ]}
  ]}
>
  <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
    Format
  </button>
</Menu>`}
        >
          <p className="text-sm text-gray-500">
            Multi-select + submenu behavior is wired by the hook — see the
            snippet for the data shape.
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
              description: 'Menu entries: { key, label, shortcut?, disabled?, submenu?, action? }.',
            },
            {
              name: 'children',
              type: 'ReactElement',
              default: '—',
              description: 'The trigger element (cloned with menu-managed handlers + ARIA).',
            },
            {
              name: 'open / onOpenChange',
              type: 'boolean / (open) => void',
              default: '—',
              description: 'Controlled visibility of the menu.',
            },
            {
              name: 'trigger',
              type: "'click' | 'hover' | 'context'",
              default: "'click'",
              description: 'Interaction that opens the menu.',
            },
            {
              name: 'multiSelect',
              type: 'boolean',
              default: 'false',
              description: 'Allow more than one item to be selected at a time.',
            },
            {
              name: 'closeOnSelection / closeOnOutsideClick',
              type: 'boolean',
              default: 'true',
              description: 'Dismiss after selecting an item / clicking outside.',
            },
            {
              name: 'renderItem',
              type: '(item, props) => ReactNode',
              default: '—',
              description: 'Custom renderer for each menu item.',
            },
          ]}
        />
      </section>
    </div>
  );
}
