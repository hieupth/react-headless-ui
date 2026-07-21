'use client';

import { useState } from 'react';
import { Chip } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Chip renders a <div> with role="button" (or option when selectable). It
// supports selection toggling and an optional delete button. Headless on CSS.
export default function ChipPage() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Chip</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A compact tag backed by the headless{' '}
          <code className="font-mono text-sm">useChip</code> hook. Chips come in{' '}
          <code>solid</code>, <code>outline</code>, and <code>soft</code>{' '}
          variants with six semantic colors, can be made{' '}
          <code>selectable</code> (toggle) or <code>deletable</code> (with an
          onDelete button), and accept an <code>avatar</code> plus prefix /
          suffix icons.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants &amp; colors</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant</code> sets the surface treatment; <code>color</code>{' '}
          sets the semantic hue.
        </p>
        <Demo
          code={`<Chip variant="solid" color="primary" className="inline-flex items-center rounded-full bg-indigo-600 px-2 py-1 text-xs font-medium text-white">Primary</Chip>
<Chip variant="outline" color="success" className="inline-flex items-center rounded-full border border-emerald-500 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">Success</Chip>
<Chip variant="soft" color="error" className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">Error</Chip>`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Chip variant="solid" color="primary" className="inline-flex items-center rounded-full bg-indigo-600 px-2 py-1 text-xs font-medium text-white">Primary</Chip>
            <Chip variant="outline" color="success" className="inline-flex items-center rounded-full border border-emerald-500 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">Success</Chip>
            <Chip variant="soft" color="error" className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">Error</Chip>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Selectable</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>selectable</code> chips toggle an ARIA-selected state. Drive them
          controlled via <code>selected</code> + <code>onSelectionChange</code>.
        </p>
        <Demo
          code={`const [selected, setSelected] = useState(false);

<Chip
  selectable
  selected={selected}
  onSelectionChange={setSelected}
  className={\`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium cursor-pointer \${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600'}\`}
>
  {selected ? 'Selected' : 'Click to select'}
</Chip>`}
        >
          <div className="flex flex-col items-center gap-2">
            <Chip
              selectable
              selected={selected}
              onSelectionChange={setSelected}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium cursor-pointer ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}
            >
              {selected ? 'Selected' : 'Click to select'}
            </Chip>
            <span className="text-xs text-gray-500">Selected: {String(selected)}</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Deletable</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>deletable</code> chips render a delete affordance; wire{' '}
          <code>onDelete</code> to remove them.
        </p>
        <Demo
          code={`<Chip deletable onDelete={() => alert('deleted')} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-gray-800">
  React
</Chip>`}
        >
          <Chip deletable onDelete={() => alert('deleted')} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-gray-800">
            React
          </Chip>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'variant', type: "'solid' | 'outline' | 'soft'", default: "'solid'", description: 'Surface treatment.' },
            { name: 'color', type: "'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'", default: "'primary'", description: 'Semantic color.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Chip density.' },
            { name: 'selectable', type: 'boolean', default: 'false', description: 'Chip toggles a selected state.' },
            { name: 'selected / defaultSelected', type: 'boolean', default: 'false', description: 'Controlled / initial selected state.' },
            { name: 'deletable', type: 'boolean', default: 'false', description: 'Show a delete button.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction.' },
            { name: 'avatar / prefix / suffix', type: 'ReactNode', default: '—', description: 'Leading avatar and icon slots.' },
            { name: 'onSelectionChange', type: '(selected: boolean) => void', default: '—', description: 'Fires on select toggle.' },
            { name: 'onDelete', type: '() => void', default: '—', description: 'Fires when the delete button is used.' },
          ]}
        />
      </section>
    </div>
  );
}
