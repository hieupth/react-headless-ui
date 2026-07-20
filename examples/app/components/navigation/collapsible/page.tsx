'use client';

import { useState } from 'react';
import { Collapsible } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Collapsible emits class hooks (collapsible-trigger-icon) + an inline SVG
// chevron and ARIA, but needs CSS for layout. Theme it via the hooks.
export default function CollapsiblePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Collapsible</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A single expand/collapse disclosure widget backed by the headless{' '}
          <code className="font-mono text-sm">useCollapsible</code> hook. It
          animates the content height, wires <code>aria-expanded</code> /{' '}
          <code>aria-controls</code>, and supports controlled or uncontrolled
          open state. Use it for one-off disclosures (vs. Accordion for grouped
          panels). The renderer emits class hooks + a chevron icon — apply your
          own styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled disclosure</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>trigger</code> (the toggle label) and <code>content</code>;
          drive <code>open</code> with state. <code>animated</code> toggles the
          height transition.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<Collapsible
  open={open}
  onOpenChange={setOpen}
  trigger="Show details"
  animated
>
  <p>Here are the hidden details.</p>
</Collapsible>`}
        >
          <div className="w-full max-w-sm mx-auto">
            <Collapsible
              open={open}
              onOpenChange={setOpen}
              trigger="Show details"
              animated
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Here are the hidden details.
              </p>
            </Collapsible>
            <p className="mt-3 text-xs text-gray-500">
              The trigger + content render structurally — theme the{' '}
              <code>collapsible-*</code> hooks for visuals.
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Uncontrolled + disabled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Omit <code>open</code> for an uncontrolled widget started by{' '}
          <code>defaultOpen</code>. A <code>disabled</code> collapsible is
          non-interactive.
        </p>
        <Demo
          code={`<Collapsible defaultOpen trigger="Expand me">
  <p>Uncontrolled content.</p>
</Collapsible>`}
        >
          <p className="text-sm text-gray-500">
            Uncontrolled mode uses internal state seeded by{' '}
            <code>defaultOpen</code> — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'open / defaultOpen',
              type: 'boolean',
              default: '—',
              description: 'Controlled / uncontrolled open state.',
            },
            {
              name: 'onOpenChange',
              type: '(open: boolean) => void',
              default: '—',
              description: 'Fires when the open state toggles.',
            },
            {
              name: 'trigger',
              type: 'ReactNode',
              default: '—',
              description: 'Content of the toggle button.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              default: '—',
              description: 'The collapsible content body.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the toggle.',
            },
            {
              name: 'animated',
              type: 'boolean',
              default: 'true',
              description: 'Animate the height transition.',
            },
            {
              name: 'customTrigger / contentWrapper',
              type: 'component',
              default: '—',
              description: 'Override the trigger button / content wrapper element.',
            },
          ]}
        />
      </section>
    </div>
  );
}
