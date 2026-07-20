'use client';

import { useState } from 'react';
import { AccordionMenu } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// AccordionMenu renders expandable nested sections, backed by useAccordionMenu.
// It emits class hooks but no CSS — theme it.
const items = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    badge: 'New',
    children: [
      { id: 'install', label: 'Installation' },
      { id: 'usage', label: 'Usage' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    children: [
      { id: 'tabs', label: 'Tabs' },
      { id: 'menu', label: 'Menu' },
      { id: 'combobox', label: 'Combobox', disabled: true },
    ],
  },
  { id: 'about', label: 'About' },
];

export default function AccordionMenuPage() {
  const [open, setOpen] = useState<string[]>(['getting-started']);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">AccordionMenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A nested, accordion-style menu backed by the headless{' '}
          <code className="font-mono text-sm">useAccordionMenu</code> hook. It
          expands sections to reveal child items, supports exclusive
          (one-open) mode, nested groups, icons, badges, animated transitions,
          and full keyboard navigation — ideal for documentation sidebars and
          file explorers. The renderer emits class hooks; apply your own
          styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Expandable sections</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Top-level <code>items</code> carry <code>label</code>, optional{' '}
          <code>icon</code> / <code>badge</code>, and <code>children</code> for
          the nested rows. Control open sections with{' '}
          <code>openItems</code> / <code>onOpenChange</code>.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(['getting-started']);

<AccordionMenu
  items={items}
  openItems={open}
  onOpenChange={setOpen}
/>`}
        >
          <div className="w-full max-w-xs mx-auto">
            <AccordionMenu items={items} openItems={open} onOpenChange={setOpen} />
            <p className="mt-3 text-xs text-gray-500">
              Section expand/collapse + nested items render structurally — theme
              the hooks for visuals.
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Exclusive &amp; nested</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>exclusive</code> keeps a single section open at a time;{' '}
          <code>allowNested</code> permits deeper nesting.{' '}
          <code>animationDuration</code> tunes the expand transition.
        </p>
        <Demo
          code={`<AccordionMenu
  items={items}
  exclusive
  allowNested
  animationDuration={200}
/>`}
        >
          <p className="text-sm text-gray-500">
            Exclusive + nested toggles — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'AccordionMenuItem[]',
              default: '—',
              description: 'Sections: { id, label, icon?, badge?, disabled?, children?, onClick? }.',
            },
            {
              name: 'openItems / defaultOpenItems',
              type: 'string[]',
              default: '—',
              description: 'Controlled / uncontrolled open section ids.',
            },
            {
              name: 'onOpenChange',
              type: '(openItems: string[]) => void',
              default: '—',
              description: 'Fires when the open set changes.',
            },
            {
              name: 'exclusive',
              type: 'boolean',
              default: 'false',
              description: 'Allow only one section open at a time.',
            },
            {
              name: 'allowNested',
              type: 'boolean',
              default: '—',
              description: 'Permit sections nested inside sections.',
            },
            {
              name: 'animationDuration',
              type: 'number',
              default: '—',
              description: 'Expand/collapse transition duration in ms.',
            },
            {
              name: 'showIcons / showBadges / size',
              type: "boolean / boolean / 'sm'|'md'|'lg'",
              default: '—',
              description: 'Affordance + density toggles.',
            },
          ]}
        />
      </section>
    </div>
  );
}
