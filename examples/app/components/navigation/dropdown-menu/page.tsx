'use client';

import { useState } from 'react';
import { DropdownMenu } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// DropdownMenu (the dedicated renderer) anchors a positioned panel under a
// trigger via the headless useDropdownMenu hook. It renders its own trigger
// button and positions the floating list absolutely. The `className` themes
// the floating panel; the auto-rendered trigger is styled via Tailwind.
const dropdownCls =
  'min-w-[12rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

const items = [
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings', shortcut: '⌘,' },
  { id: 'billing', label: 'Billing' },
  { id: 'logout', label: 'Log out' },
];

export default function DropdownMenuPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">DropdownMenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A button-triggered contextual menu backed by the headless{' '}
          <code className="font-mono text-sm">useDropdownMenu</code> hook. It
          renders its own trigger, positions the panel with 6 placements, roves
          focus with full keyboard support (arrows, Home/End, type-ahead),
          renders icons / shortcuts / badges / checkmarks, and closes on
          outside-click / Escape / select. The panel is positioned absolutely —
          theme the rendered trigger + items in your app.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled open + placement</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive <code>open</code> with state and pass{' '}
          <code>placement</code> (<code>bottom</code> /{' '}
          <code>bottom-start</code> / <code>bottom-end</code> +{' '}
          <code>top-*</code>). The trigger button is auto-rendered with{' '}
          <code>aria-haspopup="menu"</code>.
        </p>
        <Demo
          code={`<DropdownMenu
  className="min-w-[12rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={[
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings', shortcut: '⌘,' },
    { id: 'logout', label: 'Log out' }
  ]}
  open={open}
  onOpenChange={setOpen}
  placement="bottom-start"
/>`}
        >
          <div className="flex flex-col items-center gap-3">
            <DropdownMenu
              className={dropdownCls}
              items={items}
              open={open}
              onOpenChange={setOpen}
              placement="bottom-start"
            />
            <span className="text-xs text-gray-500">
              The trigger + floating panel render — the <code>className</code>{' '}
              themes the panel; theme the trigger button in your app.
            </span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Item types &amp; render-prop</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each <code>DropdownMenuItem</code> supports <code>icon</code>,{' '}
          <code>shortcut</code>, <code>badge</code>, <code>disabled</code>, and a
          <code>checked</code> state. Pass a <code>children</code> render-prop
          to fully customize each row. Set{' '}
          <code>closeOnSelect={'{false}'}</code> for option toggles.
        </p>
        <Demo
          code={`<DropdownMenu
  className="min-w-[12rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={[
    { id: 'asc', label: 'Ascending', checked: true },
    { id: 'desc', label: 'Descending' },
    { id: 'count', label: 'Issues', badge: 12 }
  ]}
  closeOnSelect={false}
>
  {(item, itemProps) => (
    <button {...itemProps}>{item.label}</button>
  )}
</DropdownMenu>`}
        >
          <p className="text-sm text-gray-500">
            Icons, checkmarks, and badges are wired by the item data; the{' '}
            <code>children</code> render-prop overrides the default row — see the
            snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'DropdownMenuItem[]',
              default: '[]',
              description: 'Entries: { id, label, icon?, shortcut?, disabled?, checked?, badge? }.',
            },
            {
              name: 'open / onOpenChange',
              type: 'boolean / (open) => void',
              default: '—',
              description: 'Controlled visibility of the panel.',
            },
            {
              name: 'placement',
              type: "'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'",
              default: "'bottom'",
              description: 'Panel placement relative to the auto-rendered trigger.',
            },
            {
              name: 'align',
              type: "'start' | 'center' | 'end'",
              default: "'start'",
              description: 'Cross-axis alignment.',
            },
            {
              name: 'offset',
              type: 'number',
              default: '4',
              description: 'Pixel gap between trigger and panel.',
            },
            {
              name: 'closeOnSelect / closeOnClickOutside / closeOnEscape',
              type: 'boolean',
              default: 'true',
              description: 'Dismiss triggers.',
            },
            {
              name: 'children',
              type: '(item, itemProps, labelProps, index) => ReactNode',
              default: '—',
              description: 'Render-prop to fully customize each menu item row.',
            },
            {
              name: 'size / variant',
              type: "'sm'|'md'|'lg' / 'default'|'dense'|'loose'",
              default: "'md' / 'default'",
              description: 'Item density hooks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
