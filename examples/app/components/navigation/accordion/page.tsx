'use client';

import { useState } from 'react';
import { Accordion } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Accordion emits semantic class hooks (accordion-item, accordion-trigger,
// accordion-content) + ARIA, but no CSS. Theme it. Items carry explicit
// `trigger` and `content` nodes.
const items = [
  {
    id: 'item-1',
    trigger: 'What is reui?',
    content: <p className="text-sm text-gray-600 dark:text-gray-400">Headless React UI primitives — behavior + a11y, no styles.</p>,
  },
  {
    id: 'item-2',
    trigger: 'Is it accessible?',
    content: <p className="text-sm text-gray-600 dark:text-gray-400">Yes — keyboard nav and ARIA out of the box.</p>,
  },
];

export default function AccordionPage() {
  const [open, setOpen] = useState<string[]>(['item-1']);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Accordion</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A stack of collapsible disclosure panels backed by the headless{' '}
          <code className="font-mono text-sm">useAccordion</code> hook. It wires{' '}
          <code>aria-expanded</code> / <code>aria-controls</code> on each
          trigger, supports single (exclusive) or multiple open panels,
          horizontal/vertical orientation, and full keyboard support. Pass an{' '}
          <code>items</code> array where each item carries a{' '}
          <code>trigger</code> and <code>content</code> node.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Items API</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each item takes an <code>id</code>, a <code>trigger</code> (toggle
          label), and <code>content</code>. Control open panels with{' '}
          <code>openItems</code> / <code>onOpenChange</code>.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(['item-1']);

<Accordion
  items={[
    { id: 'item-1', trigger: 'What is reui?',
      content: <p>Headless React UI primitives.</p> },
    { id: 'item-2', trigger: 'Is it accessible?',
      content: <p>Keyboard nav and ARIA out of the box.</p> }
  ]}
  openItems={open}
  onOpenChange={setOpen}
/>`}
        >
          <div className="w-full">
            <Accordion items={items} openItems={open} onOpenChange={setOpen} />
            <p className="mt-3 text-xs text-gray-500">
              Structure + a11y render; theme the <code>accordion-*</code> hooks
              for visuals.
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Exclusive mode &amp; disabled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>collapsible</code> lets every panel close;{' '}
          <code>orientation="horizontal"</code> lays panels side by side. Mark
          individual items <code>disabled</code> to opt them out. Use{' '}
          <code>defaultOpenItems</code> for an uncontrolled start.
        </p>
        <Demo
          code={`<Accordion
  collapsible
  defaultOpenItems={['a']}
  items={[
    { id: 'a', trigger: 'Section A', content: <p>Only one open at a time.</p> },
    { id: 'b', trigger: 'Section B (locked)', disabled: true,
      content: <p>Cannot open.</p> }
  ]}
/>`}
        >
          <p className="text-sm text-gray-500">
            Exclusive + disabled-item behavior is hook-driven — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'AccordionItem[]',
              default: '—',
              description: 'Panels: { id, trigger, content, disabled? }.',
            },
            {
              name: 'openItems / defaultOpenItems',
              type: 'string[]',
              default: '—',
              description: 'Controlled / uncontrolled open panel ids.',
            },
            {
              name: 'onOpenChange',
              type: '(openItems: string[]) => void',
              default: '—',
              description: 'Fires when the set of open panels changes.',
            },
            {
              name: 'collapsible',
              type: 'boolean',
              default: '—',
              description: 'Allow all panels to be closed (no forced-open one).',
            },
            {
              name: 'orientation',
              type: "'vertical' | 'horizontal'",
              default: "'vertical'",
              description: 'Stacking direction (affects arrow-key axis).',
            },
            {
              name: 'onItemToggle',
              type: '(itemId: string, isOpen: boolean) => void',
              default: '—',
              description: 'Per-item toggle callback.',
            },
          ]}
        />
      </section>
    </div>
  );
}
