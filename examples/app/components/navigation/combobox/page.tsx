'use client';

import { useState } from 'react';
import { Combobox } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Combobox is a searchable select backed by useCombobox. It filters options,
// virtualizes past ~100, and renders an input + dropdown. The `className`
// themes the root wrapper (input + dropdown are portal-rendered).
const comboboxCls =
  'w-full rounded-md border border-gray-300 bg-white text-sm ' +
  'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

const options = [
  { id: 'react', label: 'React', value: 'react', description: 'UI library' },
  { id: 'vue', label: 'Vue', value: 'vue', description: 'Progressive framework' },
  { id: 'svelte', label: 'Svelte', value: 'svelte', description: 'Compiler-first' },
  { id: 'solid', label: 'Solid', value: 'solid', description: 'Fine-grained reactive' },
  { id: 'angular', label: 'Angular', value: 'angular', disabled: true },
];

export default function ComboboxPage() {
  const [value, setValue] = useState<any>(null);
  const [input, setInput] = useState('');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Combobox</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A searchable select backed by the headless{' '}
          <code className="font-mono text-sm">useCombobox</code> hook. It
          filters options by the input query, supports grouped options and
          free-text entry, roves focus with full keyboard support (arrows,
          Enter, Escape), and{' '}
          <strong>virtualizes the dropdown past ~100 options</strong>. Compose
          with <code>Combobox.Input</code>, <code>Combobox.List</code>,{' '}
          <code>Combobox.Option</code>, and <code>Combobox.Group</code> — or pass
          an <code>options</code> array. The renderer emits class hooks; apply
          your own styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data API</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>options</code> ({'{'}
          <code>id</code>, <code>label</code>, <code>value</code>, optional{' '}
          <code>description</code>, <code>disabled</code>). Track selection with{' '}
          <code>value</code> / <code>onValueChange</code> and the input query
          with <code>inputValue</code> / <code>onInputChange</code>.
        </p>
        <Demo
          code={`<Combobox
  className="w-full rounded-md border border-gray-300 bg-white text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  options={[
    { id: 'react', label: 'React', value: 'react' },
    { id: 'vue', label: 'Vue', value: 'vue' },
    { id: 'svelte', label: 'Svelte', value: 'svelte' }
  ]}
  value={value}
  onValueChange={setValue}
  inputValue={input}
  onInputChange={setInput}
  placeholder="Pick a framework…"
/>`}
        >
          <div className="w-full max-w-sm mx-auto">
            <Combobox
              className={comboboxCls}
              options={options}
              value={value}
              onValueChange={setValue}
              inputValue={input}
              onInputChange={setInput}
              placeholder="Pick a framework…"
            />
            <p className="mt-3 text-xs text-gray-500">
              {value ? `Selected: ${value}` : 'Input + filtered dropdown render — the className themes the root.'}
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Groups, loading &amp; virtualization</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Group options with <code>groups</code>; show a loading state with{' '}
          <code>loading</code> (or a custom <code>loadingRenderer</code>). For
          large option sets the dropdown virtualizes past{' '}
          <code>virtualizationThreshold</code> (default 100).
        </p>
        <Demo
          code={`<Combobox
  className="w-full rounded-md border border-gray-300 bg-white text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  groups={[
    { id: 'frontend', label: 'Frontend', options: frontendOpts },
    { id: 'backend', label: 'Backend', options: backendOpts }
  ]}
  loading={isLoading}
  virtualizationThreshold={100}
/>`}
        >
          <p className="text-sm text-gray-500">
            Grouping, async loading, and virtualization keep large lists snappy —
            see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'options',
              type: 'ComboboxOption[]',
              default: '—',
              description: 'Flat options: { id, label, value, description?, disabled? }.',
            },
            {
              name: 'groups',
              type: 'ComboboxGroup[]',
              default: '—',
              description: 'Grouped options: { id, label, options }.',
            },
            {
              name: 'value / defaultValue / onValueChange',
              type: 'any / (value) => void',
              default: '—',
              description: 'Selected value (controlled / uncontrolled).',
            },
            {
              name: 'inputValue / onInputChange',
              type: 'string / (value) => void',
              default: '—',
              description: 'Search input text (drives filtering).',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: '—',
              description: 'Input placeholder.',
            },
            {
              name: 'loading',
              type: 'boolean',
              default: 'false',
              description: 'Force the loading state (async fetches).',
            },
            {
              name: 'virtualizeThreshold / virtualize',
              type: 'number / boolean',
              default: '100 / false',
              description: 'When to virtualize the dropdown, or force it on/off.',
            },
            {
              name: 'optionRenderer / groupRenderer / noResultsRenderer',
              type: '(…) => ReactNode',
              default: '—',
              description: 'Custom renderers for options, groups, and the empty state.',
            },
          ]}
        />
      </section>
    </div>
  );
}
