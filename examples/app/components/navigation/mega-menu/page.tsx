'use client';

import { useState } from 'react';
import { MegaMenu } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// MegaMenu renders large multi-column dropdown panels, backed by useMegaMenu.
// It emits class hooks + some inline theme styles; the `className` themes the
// trigger row. Panels are themed via their own Tailwind classes.
const megaCls =
  'flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

const items = [
  {
    id: 'products',
    label: 'Products',
    panel: (
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">reui</p>
          <p className="text-gray-500 dark:text-gray-400">Headless React primitives.</p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">Forge</p>
          <p className="text-gray-500 dark:text-gray-400">Design token studio.</p>
        </div>
      </div>
    ),
    children: [
      { id: 'reui', label: 'reui', description: 'Headless React primitives' },
      { id: 'forge', label: 'Forge', description: 'Design token studio' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    children: [
      { id: 'docs', label: 'Docs' },
      { id: 'guides', label: 'Guides' },
    ],
  },
  { id: 'pricing', label: 'Pricing' },
];

export default function MegaMenuPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">MegaMenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A large multi-column navigation panel backed by the headless{' '}
          <code className="font-mono text-sm">useMegaMenu</code> hook. Each
          top-level item can carry a rich <code>panel</code> (any ReactNode) or
          nested <code>children</code>. It supports horizontal/vertical layouts,
          configurable open/close animations, panel positioning, arrow
          indicators, and full keyboard navigation. Note:{' '}
          <strong>framer-motion</strong> is a peer dependency for the animated
          transitions.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Rich panels</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Give an item a <code>panel</code> node to render arbitrary content
          (grids, images, promo cards). Track the open item via{' '}
          <code>onActiveChange</code>.
        </p>
        <Demo
          code={`<MegaMenu
  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  orientation="horizontal"
  onActiveChange={setActive}
/>`}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <MegaMenu
              className={megaCls}
              items={items}
              orientation="horizontal"
              onActiveChange={setActive}
            />
            <span className="text-xs text-gray-500">
              {active ? `Open panel: ${active}` : 'Panels reveal on hover/focus — theme the rendered markup.'}
            </span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Layout &amp; animation</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>orientation="vertical"</code> for a side-stacked menu.
          <code>animationDuration</code> tunes the panel transition;{' '}
          <code>panelPosition</code> controls where the panel appears relative
          to its trigger; <code>showArrows</code> adds expand indicators.
        </p>
        <Demo
          code={`<MegaMenu
  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  orientation="vertical"
  animationDuration={200}
  panelPosition="right"
  showArrows
/>`}
        >
          <p className="text-sm text-gray-500">
            Vertical layout + animation knobs — see the snippet. (Animation
            requires the framer-motion peer dep.)
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'MegaMenuItem[]',
              default: '—',
              description: 'Entries: { id, label, panel?, children?, icon?, description?, disabled? }.',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Layout of the trigger row.',
            },
            {
              name: 'panelPosition',
              type: 'string',
              default: '—',
              description: 'Where the dropdown panel appears relative to its trigger.',
            },
            {
              name: 'animationDuration',
              type: 'number',
              default: '—',
              description: 'Panel open/close transition duration in ms (framer-motion).',
            },
            {
              name: 'showPanelArrows',
              type: 'boolean',
              default: 'true',
              description: 'Show expand arrows on triggers that have a panel/children.',
            },
            {
              name: 'initialActiveId',
              type: 'string',
              default: '—',
              description: 'Item whose panel is open initially.',
            },
            {
              name: 'onActiveChange / onPanelOpen / onPanelClose',
              type: '(id) => void',
              default: '—',
              description: 'Active-item and panel lifecycle callbacks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
