'use client';

import { useState } from 'react';
import { Toolbar, type ToolbarProps } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Toolbar is backed by the headless useToolbar hook. It composes the
// focus/press/semantic mixins and ships a default renderer that maps items
// (buttons, separators, spacers, groups) to styled buttons with arrow-key /
// Home / End navigation. It also exposes a `renderItem` escape hatch so you can
// draw each item yourself. Headless on CSS — the default renderer reads theme
// tokens (theme.spacing / theme.colors), and you can override via className.
const fileItems: ToolbarProps['defaultItems'] = [
  { id: 'new', label: 'New', type: 'button', icon: <span aria-hidden>＋</span>, variant: 'primary' },
  { id: 'open', label: 'Open', type: 'button', icon: <span aria-hidden>📂</span> },
  { id: 'sep1', label: '', type: 'separator' },
  { id: 'cut', label: 'Cut', type: 'button', icon: <span aria-hidden>✂</span> },
  { id: 'copy', label: 'Copy', type: 'button', icon: <span aria-hidden>⧉</span> },
  { id: 'paste', label: 'Paste', type: 'button', disabled: true },
  { id: 'sep2', label: '', type: 'separator' },
  { id: 'undo', label: 'Undo', type: 'button' },
];

const verticalItems: ToolbarProps['defaultItems'] = [
  { id: 'bold', label: 'Bold', type: 'button', icon: <span aria-hidden>B</span> },
  { id: 'italic', label: 'Italic', type: 'button', icon: <span aria-hidden>I</span> },
  { id: 'underline', label: 'Underline', type: 'button', icon: <span aria-hidden>U</span> },
  { id: 'sep', label: '', type: 'separator' },
  { id: 'clear', label: 'Clear', type: 'button' },
];

export default function ToolbarPage() {
  const [lastActivated, setLastActivated] = useState<string>('—');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Toolbar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A grouped set of action buttons backed by the headless{' '}
          <code className="font-mono text-sm">useToolbar</code> hook. It manages
          item activation, keyboard navigation (Arrow / Home / End), and the{' '}
          <code>toolbar</code> role with <code>aria-orientation</code>. Items are
          declared as data — <code>button</code>, <code>separator</code>,{' '}
          <code>spacer</code>, or <code>group</code> — and the default renderer
          maps them to styled controls. Provide <code>renderItem</code> to draw
          each item yourself.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal toolbar</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A file-style toolbar: a primary action, regular buttons, a separator,
          and a disabled item. Last activated:{' '}
          <code className="font-mono">{lastActivated}</code>.
        </p>
        <Demo
          code={`<Toolbar
  defaultItems={[
    { id: 'new', label: 'New', type: 'button', icon: <span aria-hidden>＋</span>, variant: 'primary' },
    { id: 'open', label: 'Open', type: 'button', icon: <span aria-hidden>📂</span> },
    { id: 'sep1', label: '', type: 'separator' },
    { id: 'cut', label: 'Cut', type: 'button', icon: <span aria-hidden>✂</span> },
    { id: 'copy', label: 'Copy', type: 'button', icon: <span aria-hidden>⧉</span> },
    { id: 'paste', label: 'Paste', type: 'button', disabled: true },
    { id: 'sep2', label: '', type: 'separator' },
    { id: 'undo', label: 'Undo', type: 'button' },
  ]}
  orientation="horizontal"
  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
  onItemActivate={(item) => console.log(item.id)}
/>`}
        >
          <Toolbar
            defaultItems={fileItems}
            orientation="horizontal"
            label="File actions"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            onItemActivate={(item) => setLastActivated(String(item.id))}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Icon-only &amp; vertical</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>showLabels</code> off, only icons render.{' '}
          <code>orientation="vertical"</code> stacks the items and flips{' '}
          <code>aria-orientation</code>.
        </p>
        <Demo
          code={`<Toolbar
  defaultItems={verticalItems}
  orientation="vertical"
  size="sm"
  showLabels={false}
  className="inline-flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
/>`}
        >
          <Toolbar
            defaultItems={verticalItems}
            orientation="vertical"
            size="sm"
            showLabels={false}
            className="inline-flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            onItemActivate={(item) => setLastActivated(String(item.id))}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Custom item renderer</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>renderItem</code> to take full control of how each item is
          drawn — useful for toggles, dropdowns, or brand-styled buttons.
        </p>
        <Demo
          code={`<Toolbar
  defaultItems={[
    { id: 'left', label: 'Left', type: 'button' },
    { id: 'center', label: 'Center', type: 'button' },
    { id: 'right', label: 'Right', type: 'button' },
  ]}
  showBorder={false}
  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
  renderItem={({ item, isActive, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      data-active={isActive}
      className={
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
        (isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800')
      }
    >
      {item.label}
    </button>
  )}
/>`}
        >
          <Toolbar
            defaultItems={[
              { id: 'left', label: 'Left', type: 'button' },
              { id: 'center', label: 'Center', type: 'button' },
              { id: 'right', label: 'Right', type: 'button' },
            ]}
            showBorder={false}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            renderItem={({ item, isActive, onClick }) => (
              <button
                type="button"
                onClick={onClick}
                data-active={isActive}
                className={
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800')
                }
              >
                {item.label}
              </button>
            )}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'defaultItems', type: 'ToolbarItem[]', default: '[]', description: 'Uncontrolled initial items (button | separator | spacer | group).' },
            { name: 'items', type: 'ToolbarItem[]', default: '—', description: 'Controlled item list.' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction; sets aria-orientation.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Density of the toolbar and its default buttons.' },
            { name: 'showLabels', type: 'boolean', default: 'true', description: 'When false, only icons render on buttons.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the whole toolbar (aria-disabled).' },
            { name: 'collapsed', type: 'boolean', default: 'false', description: 'Controlled collapsed state for overflow menus.' },
            { name: 'sticky', type: 'boolean', default: 'false', description: 'Makes the toolbar position: sticky at the top.' },
            { name: 'label', type: 'string', default: '—', description: 'Accessible name (aria-label) for the toolbar.' },
            { name: 'onItemActivate', type: '(item: ToolbarItem) => void', default: '—', description: 'Fires when an item is activated (click or keyboard).' },
            { name: 'renderItem', type: '(props) => ReactNode', default: '—', description: 'Escape-hatch custom renderer per item.' },
          ]}
        />
      </section>
    </div>
  );
}
