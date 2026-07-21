'use client';

import { useState } from 'react';
import { Scrollspy } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Scrollspy tracks the active section while the page scrolls, backed by
// useScrollspy (IntersectionObserver). It emits class hooks but no CSS — theme
// the nav list via the `className` prop. The live preview needs a real scroll
// container, so it renders the styled list statically.
const scrollspyCls =
  'flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 text-sm ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'install', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'theming', label: 'Theming' },
  { id: 'api', label: 'API', disabled: true },
];

export default function ScrollspyPage() {
  const [active, setActive] = useState<string | null>('intro');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Scrollspy</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An in-page navigation list that highlights the active section as the
          user scrolls, backed by the headless{' '}
          <code className="font-mono text-sm">useScrollspy</code> hook. It uses
          an IntersectionObserver with configurable{' '}
          <code>offset</code> / <code>rootMargin</code> /{' '}
          <code>threshold</code>, smooth-scrolls to a section on click, and
          fires <code>onActiveSectionChange</code>. Ideal for docs and long-form
          pages. The renderer emits class hooks; theme the active/inactive
          states.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Section tracking</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>sections</code> ({'{'}
          <code>id</code>, <code>label</code>, optional <code>element</code>{' '}
          ref). The hook highlights the section in view and reports it via{' '}
          <code>onActiveSectionChange</code>.
        </p>
        <Demo
          code={`<Scrollspy
  className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
  sections={[
    { id: 'intro', label: 'Introduction' },
    { id: 'install', label: 'Installation' },
    { id: 'usage', label: 'Usage' }
  ]}
  offset={80}
  onActiveSectionChange={setActive}
/>`}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <Scrollspy
              className={scrollspyCls}
              sections={sections}
              offset={80}
              onActiveSectionChange={setActive}
            />
            <span className="text-xs text-gray-500">
              Active section: {active ?? '—'}. Needs a scroll container with
              matching section ids to observe — see the snippet.
            </span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Orientation &amp; indicators</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>orientation</code> (<code>vertical</code> /{' '}
          <code>horizontal</code>) and <code>position</code> place the spy;
          <code>showIndicators</code> / <code>showProgress</code> render active
          dots and a scroll-progress bar.
        </p>
        <Demo
          code={`<Scrollspy
  className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
  sections={sections}
  orientation="horizontal"
  position="top"
  showIndicators
  showProgress
/>`}
        >
          <p className="text-sm text-gray-500">
            Horizontal layout + progress/indicators — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'sections',
              type: 'ScrollspySection[]',
              default: '—',
              description: 'Targets: { id, label, element?, disabled? }.',
            },
            {
              name: 'offset',
              type: 'number',
              default: '—',
              description: 'Pixels from top before a section activates.',
            },
            {
              name: 'root / rootMargin / threshold',
              type: 'HTMLElement / string / number',
              default: '—',
              description: 'IntersectionObserver tuning.',
            },
            {
              name: 'autoUpdate',
              type: 'boolean',
              default: 'true',
              description: 'Recompute the active section on scroll.',
            },
            {
              name: 'onActiveSectionChange',
              type: '(sectionId: string | null) => void',
              default: '—',
              description: 'Fires when the active section changes.',
            },
            {
              name: 'orientation / position',
              type: "'vertical'|'horizontal' / 'left'|'right'|'top'|'bottom'",
              default: "'vertical' / 'left'",
              description: 'Placement of the spy list.',
            },
            {
              name: 'showIndicators / showProgress / showIcons',
              type: 'boolean',
              default: 'false',
              description: 'Active dots, progress bar, and section icons.',
            },
          ]}
        />
      </section>
    </div>
  );
}
