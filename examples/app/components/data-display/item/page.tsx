'use client';

import { Item, ItemCheckbox, ItemRadio } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Item renders a generic row suitable for lists, menus, and dropdowns. It owns
// selection, hover/press, and disabled states, plus ARIA for listitem / option /
// treeitem roles. ItemCheckbox and ItemRadio are convenience wrappers for
// checkable single/multiple selection. Headless on CSS — theme via className.
export default function ItemPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Item</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A generic row backed by the headless{' '}
          <code className="font-mono text-sm">useItem</code> hook.{' '}
          <code>Item</code> is the building block for lists, menus, dropdowns,
          and trees — it manages selection, hover, press, and disabled states,
          carries <code>aria-selected</code> / <code>aria-current</code>, and
          accepts an <code>icon</code>, <code>badge</code>,{' '}
          <code>shortcut</code>, and a <code>defaultDescription</code> (shown
          when <code>showDescription</code> is set).{' '}
          <code>ItemCheckbox</code> and <code>ItemRadio</code> add single- and
          multi-selection affordances.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic item</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Children become the label; <code>icon</code> and{' '}
          <code>defaultDescription</code> decorate the row (set{' '}
          <code>showDescription</code> to render it).
        </p>
        <Demo
          code={`<Item
  icon={<span>📁</span>}
  defaultDescription="3 files"
  showDescription
  className="flex w-64 items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
>
  Documents
</Item>`}
        >
          <Item
            icon={<span>📁</span>}
            defaultDescription="3 files"
            showDescription
            className="flex w-64 items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
          >
            Documents
          </Item>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Selectable rows</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>ItemCheckbox</code> toggles <code>selected</code> (multiple
          selection); <code>ItemRadio</code> represents single choice.
        </p>
        <Demo
          code={`<ItemCheckbox selected className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Receive newsletter</ItemCheckbox>
<ItemRadio selected className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Dark theme</ItemRadio>`}
        >
          <div className="flex flex-col gap-2 w-64">
            <ItemCheckbox selected className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Receive newsletter</ItemCheckbox>
            <ItemRadio selected className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Dark theme</ItemRadio>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">States</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>disabled</code> blocks interaction; <code>badge</code> renders a
          trailing marker; <code>shortcut</code> shows a keyboard hint.
        </p>
        <Demo
          code={`<Item shortcut="⌘S" badge="New" className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Save</Item>
<Item disabled className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm opacity-50 dark:border-gray-700">Deleted (disabled)</Item>`}
        >
          <div className="flex flex-col gap-2 w-64">
            <Item shortcut="⌘S" badge="New" className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Save</Item>
            <Item disabled className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm opacity-50 dark:border-gray-700">Deleted (disabled)</Item>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'selected / defaultSelected', type: 'boolean', default: 'false', description: 'Controlled / initial selected state.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the item.' },
            { name: 'interactive', type: 'boolean', default: '—', description: 'Make the row hoverable/activatable.' },
            { name: 'icon', type: 'ReactNode', default: '—', description: 'Leading icon.' },
            { name: 'iconPosition', type: "'start' | 'end'", default: "'start'", description: 'Where to render the icon.' },
            { name: 'defaultDescription', type: 'string', default: '—', description: 'Secondary line; render it via showDescription.' },
            { name: 'showDescription', type: 'boolean', default: 'false', description: 'Render the description text.' },
            { name: 'badge', type: 'ReactNode', default: '—', description: 'Trailing badge marker.' },
            { name: 'shortcut', type: 'string', default: '—', description: 'Trailing keyboard shortcut hint.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Row density.' },
            { name: 'variant', type: "'default' | 'subtle' | 'ghost' | 'solid'", default: "'default'", description: 'Visual variant hook.' },
            { name: 'as', type: 'ElementType', default: '—', description: 'Element tag (li, div, a, …).' },
            { name: 'onClick / onSelect / onChange', type: '() => void', default: '—', description: 'Interaction callbacks.' },
          ]}
        />
      </section>
    </div>
  );
}
