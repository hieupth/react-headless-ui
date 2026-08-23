'use client';

import { Tooltip, SimpleTooltip } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Tooltip portals a small label near its trigger via createPortal. The
// SimpleTooltip companion is the zero-config variant. The component is
// headless on CSS — the tooltip body is themed via the className prop, which
// lands on the portaled container (the arrow inherits currentColor).
const tooltipClassName =
  'whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow dark:bg-gray-700';

export default function TooltipPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Tooltip</h1>
        <p className="docs-lead">
          A small contextual label backed by the headless{' '}
          <code className="docs-code">useTooltip</code> hook. It shows on
          hover and/or focus (configurable via <code>trigger</code>), positions
          to any side with flip/shift to stay in the viewport, supports an arrow,
          and renders through a portal to{' '}
          <code className="docs-code">document.body</code>. Use{' '}
          <code>SimpleTooltip</code> for the zero-config case and{' '}
          <code>RichTooltip</code> for titled, richer content.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Simple tooltip</h2>
        <p className="docs-desc">
          <code>SimpleTooltip</code> wraps a trigger and shows{' '}
          <code>content</code> on hover/focus. Delays via{' '}
          <code>delayShow</code> / <code>delayHide</code> prevent flicker.
        </p>
        <Demo
          code={`<SimpleTooltip
  content="Copy to clipboard"
  className="whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow dark:bg-gray-700"
>
  <button
    type="button"
    aria-label="Copy"
    className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
  >
    ⧉
  </button>
</SimpleTooltip>`}
        >
          <SimpleTooltip content="Copy to clipboard" className={tooltipClassName}>
            <button
              type="button"
              aria-label="Copy"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
            >
              ⧉
            </button>
          </SimpleTooltip>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Positions &amp; arrow</h2>
        <p className="docs-desc">
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
  className="whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow dark:bg-gray-700"
>
  <button
    type="button"
    aria-label="Delete"
    className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
  >
    🗑
  </button>
</Tooltip>`}
        >
          <Tooltip
            content="Delete row"
            position="right"
            arrow
            offset={8}
            flip
            shift
            className={tooltipClassName}
          >
            <button
              type="button"
              aria-label="Delete"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
            >
              🗑
            </button>
          </Tooltip>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
              default: '0 / 0',
              description: 'Show/hide delays in ms.',
            },
            {
              name: 'arrow / offset / maxWidth',
              type: 'boolean / number / number',
              default: 'true / 8 / 300',
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
