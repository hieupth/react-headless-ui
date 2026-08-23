'use client';

import { useState } from 'react';
import { TreeView } from '@hieupth/react-headless-ui';
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
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [activated, setActivated] = useState<string | null>(null);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">TreeView</h1>
        <p className="docs-lead">
          A collapsible hierarchical node tree backed by the headless{' '}
          <code className="docs-code">useTreeView</code> hook. It expands
          and collapses branches, supports single / multiple / none selection,
          full keyboard navigation (arrows, Enter, Home/End, type-ahead),
          <code>aria-expanded</code> / <code>aria-selected</code> wiring, and
          optional connecting lines. Ideal for file explorers and category
          browsers. The renderer emits class hooks; apply your own styling.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Hierarchical data</h2>
        <p className="docs-desc">
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

      <section className="docs-section">
        <h2 className="docs-h2">Multi-select &amp; expand-all</h2>
        <p className="docs-desc">
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
          <div className="w-full max-w-xs mx-auto">
            <TreeView
              className={treeCls}
              nodes={nodes}
              selectionMode="multiple"
              expandAll
              showLines
              onSelectionChange={setMultiSelected}
              onNodeActivate={(node) => setActivated(node.id)}
            />
            <p className="mt-3 text-xs text-gray-500">
              {multiSelected.length
                ? `Selected: ${multiSelected.join(', ')}`
                : activated
                  ? `Activated: ${activated}`
                  : 'Multiple branches start expanded — Ctrl/Cmd-click or arrow + Space to multi-select.'}
            </p>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
