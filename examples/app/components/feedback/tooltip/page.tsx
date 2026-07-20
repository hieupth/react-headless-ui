'use client';

import { useState } from 'react';
import { Tooltip, SimpleTooltip } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Tooltip portals a small label near its trigger via createPortal. The
// SimpleTooltip companion is the zero-config variant. Snippets show the API;
// the live preview below uses a styled inline note since the portal target is
// document.body.
export default function TooltipPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Tooltip</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A small contextual label backed by the headless{' '}
          <code className="font-mono text-sm">useTooltip</code> hook. It shows on
          hover and/or focus (configurable via <code>trigger</code>), positions
          to any side with flip/shift to stay in the viewport, supports an arrow,
          and renders through a portal to{' '}
          <code className="font-mono text-sm">document.body</code>. Use{' '}
          <code>SimpleTooltip</code> for the zero-config case and{' '}
          <code>RichTooltip</code> for titled, richer content.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Simple tooltip</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>SimpleTooltip</code> wraps a trigger and shows{' '}
          <code>content</code> on hover/focus. Delays via{' '}
          <code>delayShow</code> / <code>delayHide</code> prevent flicker.
        </p>
        <Demo
          code={`<SimpleTooltip content="Copy to clipboard" position="top">
  <button aria-label="Copy">⧉</button>
</SimpleTooltip>`}
        >
          <div className="relative inline-flex">
            <button
              type="button"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              aria-label="Copy"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
            >
              ⧉
            </button>
            {open && (
              <span
                role="tooltip"
                className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow"
              >
                Copy to clipboard
              </span>
            )}
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Positions &amp; arrow</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>position</code> picks the side; <code>arrow</code> renders a
          pointer; <code>flip</code> / <code>shift</code> keep it on-screen;
          <code>offset</code> sets the gap.
        </p>
        <Demo
          code={`<Tooltip
  content="Delete row"
  position="right"
  arrow
  offset={8}
  flip
  shift
>
  <button aria-label="Delete">🗑</button>
</Tooltip>`}
        >
          <p className="text-sm text-gray-500">
            The full <code>Tooltip</code> exposes positioning, delays, and
            interactivity (<code>interactive</code>) — see snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'content',
              type: 'ReactNode',
              default: '—',
              description: 'Tooltip text/node. Required.',
            },
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
              description: 'Open change callback.',
            },
            {
              name: 'position',
              type: 'TooltipPosition',
              default: "'top'",
              description: 'Side relative to the trigger.',
            },
            {
              name: 'trigger',
              type: "TooltipTrigger | TooltipTrigger[]",
              default: "['hover', 'focus']",
              description: 'What shows the tooltip (hover / focus / click).',
            },
            {
              name: 'delayShow / delayHide',
              type: 'number',
              default: '—',
              description: 'Show/hide delays in ms.',
            },
            {
              name: 'arrow / offset / maxWidth',
              type: 'boolean / number / number',
              default: '—',
              description: 'Arrow pointer, gap, and max width.',
            },
            {
              name: 'flip / shift',
              type: 'boolean',
              default: 'true',
              description: 'Reposition to stay in the viewport.',
            },
            {
              name: 'interactive',
              type: 'boolean',
              default: 'false',
              description: 'Allow pointer interaction with tooltip content.',
            },
          ]}
        />
      </section>
    </div>
  );
}
