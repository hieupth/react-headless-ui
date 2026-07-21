'use client';

import { useState } from 'react';
import { TreeView } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// TreeView renders a hierarchical node tree, backed by useTreeView. It emits
// class hooks + ARIA tree roles but no CSS — theme the tree via the
// `className` prop.
const treeCls =
  'w-full rounded-lg border border-gray-200 bg-white p-2 text-sm ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

const nodes = [
  {
    id: 'src',
    label: 'src',
    defaultExpanded: true,
    children: [
      { id: 'components', label: 'components', defaultExpanded: true, children: [
        { id: 'tabs', label: 'Tabs.tsx' },
        { id: 'menu', label: 'Menu.tsx' },
      ] },
      { id: 'hooks', label: 'hooks', children: [
        { id: 'usetabs', label: 'useTabs.tsx' },
      ] },
    ],
  },
  { id: 'readme', label: 'README.md' },
  { id: 'license', label: 'LICENSE', disabled: true },
];

export default function TreeViewPage() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">TreeView</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A collapsible hierarchical node tree backed by the headless{' '}
          <code className="font-mono text-sm">useTreeView</code> hook. It expands
          and collapses branches, supports single / multiple / none selection,
          full keyboard navigation (arrows, Enter, Home/End, type-ahead),
          <code>aria-expanded</code> / <code>aria-selected</code> wiring, and
          optional connecting lines. Ideal for file explorers and category
          browsers. The renderer emits class hooks; apply your own styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Hierarchical data</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass a <code>nodes</code> tree (each node: <code>id</code>,{' '}
          <code>label</code>, optional <code>children</code>,{' '}
          <code>defaultExpanded</code>, <code>disabled</code>). Track selection
          via <code>onSelectionChange</code> (array of keys).
        </p>
        <Demo
          code={`<TreeView
  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
  nodes={nodes}
  selectionMode="single"
  onSelectionChange={setSelected}
/>`}
        >
          <div className="w-full max-w-xs mx-auto">
            <TreeView
              className={treeCls}
              nodes={nodes}
              selectionMode="single"
              onSelectionChange={setSelected}
            />
            <p className="mt-3 text-xs text-gray-500">
              {selected.length ? `Selected: ${selected.join(', ')}` : 'Tree structure + a11y render — the className themes the tree.'}
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Multi-select &amp; expand-all</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>selectionMode="multiple"</code> enables checkbox-style
          selection; <code>expandAll</code> opens every branch initially.{' '}
          <code>onNodeActivate</code> fires on double-click / Enter.
        </p>
        <Demo
          code={`<TreeView
  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
  nodes={nodes}
  selectionMode="multiple"
  expandAll
  showLines
  onNodeActivate={(node) => console.log('open', node.id)}
/>`}
        >
          <p className="text-sm text-gray-500">
            Multi-select + expand-all + connector lines — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'nodes',
              type: 'TreeNode[]',
              default: '—',
              description: 'Tree data: { id, label, children?, defaultExpanded?, disabled?, icon? }.',
            },
            {
              name: 'selectionMode',
              type: "'single' | 'multiple' | 'none'",
              default: "'single'",
              description: 'How many nodes can be selected.',
            },
            {
              name: 'defaultSelectedKeys',
              type: 'string[]',
              default: '—',
              description: 'Initially selected node ids (array form).',
            },
            {
              name: 'defaultExpandedIds / expandAll',
              type: 'string[] / boolean',
              default: '—',
              description: 'Initially expanded branches, or expand everything.',
            },
            {
              name: 'onSelectionChange',
              type: '(selectedKeys: string[]) => void',
              default: '—',
              description: 'Fires when the selection set changes (array form).',
            },
            {
              name: 'onNodeActivate',
              type: '(node: TreeNode) => void',
              default: '—',
              description: 'Fires on double-click or Enter.',
            },
            {
              name: 'showLines / renderNode',
              type: 'boolean / (node, props) => ReactNode',
              default: '—',
              description: 'Connector lines + custom node renderer.',
            },
          ]}
        />
      </section>
    </div>
  );
}
