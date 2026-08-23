'use client';

import { useState } from 'react';
import { DropdownMenu } from '@hieupth/react-headless-ui';
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
  const [typesOpen, setTypesOpen] = useState(false);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">DropdownMenu</h1>
        <p className="docs-lead">
          A button-triggered contextual menu backed by the headless{' '}
          <code className="docs-code">useDropdownMenu</code> hook. It
          renders its own trigger, positions the panel with 6 placements, roves
          focus with full keyboard support (arrows, Home/End, type-ahead),
          renders icons / shortcuts / badges / checkmarks, and closes on
          outside-click / Escape / select. The panel is positioned absolutely —
          theme the rendered trigger + items in your app.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Controlled open + placement</h2>
        <p className="docs-desc">
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

      <section className="docs-section">
        <h2 className="docs-h2">Item types &amp; render-prop</h2>
        <p className="docs-desc">
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
  open={typesOpen}
  onOpenChange={setTypesOpen}
  closeOnSelect={false}
>
  {(item, itemProps) => (
    <button {...itemProps}>{item.label}</button>
  )}
</DropdownMenu>`}
        >
          <div className="flex flex-col items-center gap-3">
            <DropdownMenu
              className={dropdownCls}
              items={[
                { id: 'asc', label: 'Ascending', checked: true },
                { id: 'desc', label: 'Descending' },
                { id: 'count', label: 'Issues', badge: 12 },
              ]}
              open={typesOpen}
              onOpenChange={setTypesOpen}
              closeOnSelect={false}
            >
              {(item) => (
                <span className="flex w-full items-center justify-between gap-4 px-3 py-1.5 text-sm">
                  <span className="flex items-center gap-2">
                    {item.checked !== undefined && (
                      <span
                        aria-hidden
                        className={item.checked ? 'font-medium text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'}
                      >
                        ✓
                      </span>
                    )}
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </DropdownMenu>
            <span className="text-xs text-gray-500">
              Open the menu — checkmarks and badges come from the item data; the{' '}
              <code>children</code> render-prop overrides each row.
            </span>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
