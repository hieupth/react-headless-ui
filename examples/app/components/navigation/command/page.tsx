'use client';

import { useState } from 'react';
import { Command } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Command is a keyboard-driven command palette backed by useCommand. It
// filters items, virtualizes past ~100 rows, and renders an input + list that
// need CSS — show the data API as a snippet.
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
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Command</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A keyboard-first command palette backed by the headless{' '}
          <code className="font-mono text-sm">useCommand</code> hook. It filters
          items by a fuzzy search query, groups results, roves focus with full
          keyboard support (arrows, Enter, type-ahead), and{' '}
          <strong>virtualizes the list past ~100 items</strong> for constant
          memory. Ideal for ⌘K app launchers. Compose with{' '}
          <code>Command.Input</code>, <code>Command.List</code>,{' '}
          <code>Command.Item</code>, <code>Command.Group</code>, and{' '}
          <code>Command.Empty</code> — or pass an <code>items</code> array. The
          renderer emits class hooks; apply your own styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data API</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>items</code> ({'{'}
          <code>id</code>, <code>label</code>, optional <code>shortcut</code>,{' '}
          <code>icon</code>, <code>disabled</code>) and drive the search query
          with <code>value</code> / <code>onValueChange</code>.
        </p>
        <Demo
          code={`const [query, setQuery] = useState('');

<Command
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
              items={items}
              value={query}
              onValueChange={setQuery}
              placeholder="Type a command…"
            />
            <p className="mt-3 text-xs text-gray-500">
              The input + filtered list render structurally — theme the{' '}
              <code>command-*</code> hooks for visuals.
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Groups &amp; virtualization</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Group items with <code>groups</code> ({'{'}
          <code>id</code>, <code>label</code>, <code>items</code>). For large
          lists the renderer virtualizes automatically past{' '}
          <code>virtualizationThreshold</code> (default 100); override with{' '}
          <code>forceVirtualization</code>.
        </p>
        <Demo
          code={`<Command
  groups={[
    { id: 'file', label: 'File', items: fileItems },
    { id: 'edit', label: 'Edit', items: editItems }
  ]}
  virtualizationThreshold={100}
/>`}
        >
          <p className="text-sm text-gray-500">
            Grouping + auto-virtualization keep large palettes fast — see the
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
              name: 'virtualizationThreshold / forceVirtualization',
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
