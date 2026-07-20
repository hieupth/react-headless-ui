'use client';

import { useState } from 'react';
import { Breadcrumb } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Breadcrumb applies inline theme styles, so it renders visibly. The showcase
// ThemeProvider supplies colors; navigate via the items' onClick / href.
const basicItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'reui', label: 'reui', href: '/projects/reui' },
  { id: 'tabs', label: 'Tabs', current: true },
];

export default function BreadcrumbPage() {
  const [path, setPath] = useState('Home / Projects / reui');

  const clickableItems = [
    { id: 'home', label: 'Home' },
    { id: 'docs', label: 'Docs' },
    { id: 'components', label: 'Components' },
    { id: 'breadcrumb', label: 'Breadcrumb', current: true },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Breadcrumb</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A navigation trail backed by the headless{' '}
          <code className="font-mono text-sm">useBreadcrumb</code> hook. It
          collapses long trails past <code>maxItems</code>, renders an optional
          home item, supports custom separators, and wires{' '}
          <code>aria-current="page"</code> on the active crumb. The default
          renderer applies inline theme colors, so it shows up unstyled-by-CSS.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic trail</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each item takes a <code>label</code>, optional <code>href</code>, and
          <code>current</code> to mark the last crumb.
        </p>
        <Demo
          code={`<Breadcrumb
  items={[
    { id: 'home', label: 'Home', href: '/' },
    { id: 'projects', label: 'Projects', href: '/projects' },
    { id: 'reui', label: 'reui', current: true }
  ]}
/>`}
        >
          <Breadcrumb items={basicItems} />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Custom separator &amp; navigation</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Override <code>separator</code> with any node and handle clicks via{' '}
          <code>navigate</code> (exposed by the hook). The active item carries{' '}
          <code>aria-current</code>.
        </p>
        <Demo
          code={`<Breadcrumb
  items={clickableItems}
  separator={<span aria-hidden>›</span>}
/>`}
        >
          <div className="flex flex-col items-center gap-3">
            <Breadcrumb
              items={clickableItems}
              separator={<span aria-hidden>›</span>}
            />
            <span className="text-xs text-gray-500">Navigated to: {path}</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'BreadcrumbItem[]',
              default: '—',
              description: 'Crumbs: { id, label, href?, current?, disabled? }.',
            },
            {
              name: 'separator',
              type: 'ReactNode',
              default: "'/'",
              description: 'Node rendered between crumbs.',
            },
            {
              name: 'maxItems',
              type: 'number',
              default: '—',
              description: 'Collapses the trail past this many items.',
            },
            {
              name: 'showHome',
              type: 'boolean',
              default: 'false',
              description: 'Prepend a home crumb (configure via homeItem).',
            },
            {
              name: 'homeItem',
              type: 'Partial<BreadcrumbItem>',
              default: '—',
              description: 'Configuration for the leading home crumb.',
            },
            {
              name: 'renderItem',
              type: '(item, index, isActive) => ReactNode',
              default: '—',
              description: 'Custom renderer for an individual crumb.',
            },
          ]}
        />
      </section>
    </div>
  );
}
