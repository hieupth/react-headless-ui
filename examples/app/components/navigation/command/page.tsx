'use client';

import { useState } from 'react';
import { Command } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Command is a keyboard-driven command palette backed by useCommand. It
// filters items, virtualizes past ~100 rows, and renders an input + list.
// The `className` themes the palette container.
const commandCls =
  'w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm ' +
  'shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

const items = [
  { id: 'new', label: 'New file', shortcut: ['⌘', 'N'] },
  { id: 'open', label: 'Open file', shortcut: ['⌘', 'O'] },
  { id: 'save', label: 'Save', shortcut: ['⌘', 'S'] },
  { id: 'theme', label: 'Toggle theme', shortcut: ['⌘', 'D'] },
  { id: 'exit', label: 'Quit', disabled: true },
];

export default function CommandPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Command</h1>
        <p className="docs-lead">
          A keyboard-first command palette backed by the headless{' '}
          <code className="docs-code">useCommand</code> hook. It filters
          items by a fuzzy search query, groups results, roves focus with full
          keyboard support (arrows, Enter, type-ahead), and{' '}
          <strong>virtualizes the list past ~100 items</strong> for constant
          memory. Ideal for ⌘K app launchers. Compose with{' '}
          <code>CommandInput</code>, <code>CommandList</code>,{' '}
          <code>CommandItem</code>, <code>CommandGroup</code>, and{' '}
          <code>CommandEmpty</code> — or pass an <code>items</code> array. The
          renderer emits class hooks; apply your own styling.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Data API</h2>
        <p className="docs-desc">
          Pass <code>items</code> ({'{'}
          <code>id</code>, <code>label</code>, optional <code>shortcut</code>,{' '}
          <code>icon</code>, <code>disabled</code>) and drive the search query
          with <code>value</code> / <code>onValueChange</code>.
        </p>
        <Demo
          code={`<Command
  className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={[
    { id: 'new', label: 'New file', shortcut: ['⌘', 'N'] },
    { id: 'open', label: 'Open file', shortcut: ['⌘', 'O'] },
    { id: 'save', label: 'Save', shortcut: ['⌘', 'S'] }
  ]}
  value={query}
  onValueChange={setQuery}
  placeholder="Type a command…"
/>`}
        >
          <div className="w-full max-w-sm mx-auto">
            <Command
              className={commandCls}
              items={items}
              value={query}
              onValueChange={setQuery}
              placeholder="Type a command…"
            />
            <p className="mt-3 text-xs text-gray-500">
              The input + filtered list render — the <code>className</code>{' '}
              themes the <code>command-*</code> hooks.
            </p>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Groups &amp; virtualization</h2>
        <p className="docs-desc">
          Group items with <code>groups</code> ({'{'}
          <code>id</code>, <code>label</code>, <code>items</code>). For large
          lists the renderer virtualizes automatically past{' '}
          <code>virtualizeThreshold</code> (default 100); override with{' '}
          <code>virtualize</code>.
        </p>
        <Demo
          code={`<Command
  className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  groups={[
    { id: 'file', label: 'File', items: fileItems },
    { id: 'edit', label: 'Edit', items: editItems }
  ]}
  virtualizeThreshold={100}
/>`}
        >
          <p className="text-sm text-gray-500">
            Grouping + auto-virtualization keep large palettes fast — see the
            snippet.
          </p>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'CommandItem[]',
              default: '—',
              description: 'Flat entries: { id, label, shortcut?, icon?, description?, disabled? }.',
            },
            {
              name: 'groups',
              type: 'CommandGroup[]',
              default: '—',
              description: 'Grouped entries: { id, label, items }.',
            },
            {
              name: 'open / defaultOpen / onOpenChange',
              type: 'boolean / (open) => void',
              default: '—',
              description: 'Palette visibility (controlled / uncontrolled).',
            },
            {
              name: 'value / onValueChange',
              type: 'string / (value) => void',
              default: '—',
              description: 'Search query (drives filtering).',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: '—',
              description: 'Input placeholder text.',
            },
            {
              name: 'virtualizeThreshold / virtualize',
              type: 'number / boolean',
              default: '100 / false',
              description: 'When to virtualize the list, or force it on/off.',
            },
            {
              name: 'itemRenderer / groupRenderer / noResultsRenderer',
              type: '(…) => ReactNode',
              default: '—',
              description: 'Custom renderers for items, groups, and the empty state.',
            },
          ]}
        />
      </section>
    </div>
  );
}
