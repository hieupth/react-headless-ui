'use client';

import { useState } from 'react';
import { Popover } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Popover anchors floating content to a trigger and is positioned relative to
// it. It applies inline theme styles, so a controlled live preview renders
// visibly. The snippet shows the controlled API; `trigger` picks the open
// interaction.
export default function PopoverPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Popover</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Floating, anchored content backed by the headless{' '}
          <code className="font-mono text-sm">usePopover</code> hook. It
          positions relative to a trigger (12 placements), opens on click or
          hover, closes on outside-click / Escape / blur, and supports open/close
          delays. Unlike Dialog it is non-modal and stays in the layer stack.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Click trigger</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Default <code>trigger="click"</code> toggles the popover;{' '}
          <code>position</code> sets placement (<code>top</code> /{' '}
          <code>bottom</code> / <code>left</code> / <code>right</code> +{' '}
          <code>-start</code> / <code>-end</code>).
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
  position="bottom"
  trigger={<button>Settings</button>}
>
  <div className="p-3">Popover content</div>
</Popover>`}
        >
          <Popover
            open={open}
            onOpenChange={setOpen}
            position="bottom"
            closeOnClickOutside
            closeOnEscape
            trigger={
              <button
                type="button"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
              >
                Settings
              </button>
            }
          >
            <div className="w-48 rounded-md border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <p className="font-medium">Quick settings</p>
              <p className="mt-1 text-gray-500">Theme the emitted class hooks to match your app.</p>
            </div>
          </Popover>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Hover trigger &amp; delays</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>trigger="hover"</code> opens on hover with{' '}
          <code>openDelay</code> / <code>closeDelay</code> to prevent flicker;
          <code>closeOnTriggerBlur</code> dismisses when focus leaves.
        </p>
        <Demo
          code={`<Popover
  position="top"
  openDelay={200}
  closeDelay={150}
  trigger={<button>Hover me</button>}
>
  Tooltip-like content
</Popover>`}
        >
          <p className="text-sm text-gray-500">
            Hover-triggered popovers behave like rich tooltips — see snippet.
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
              description: 'Open change callback.',
            },
            {
              name: 'trigger',
              type: 'ReactNode',
              default: '—',
              description: 'The element the popover anchors to (opens on click).',
            },
            {
              name: 'position',
              type: 'PopoverPosition',
              default: "'top'",
              description: 'Placement relative to the trigger (12 options).',
            },
            {
              name: 'openDelay / closeDelay',
              type: 'number',
              default: '—',
              description: 'Hover open/close delays in ms.',
            },
            {
              name: 'closeOnClickOutside / closeOnEscape / closeOnTriggerBlur',
              type: 'boolean',
              default: 'true',
              description: 'Dismiss triggers.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable open interactions.',
            },
            {
              name: 'onOpen / onClose',
              type: '() => void',
              default: '—',
              description: 'Open/close lifecycle callbacks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
