'use client';

import { useState } from 'react';
import { HoverCard } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// HoverCard anchors a richer panel to a trigger and shows it on hover with a
// small grace period (hoverDelay / leaveDelay) so the pointer can cross the
// gap. It applies inline theme styles. The snippet shows the API.
export default function HoverCardPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">HoverCard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A hover-revealed detail card backed by the headless{' '}
          <code className="font-mono text-sm">useHoverCard</code> hook — think
          Twitter-style user previews. Unlike a Tooltip it holds richer content
          and stays open with a grace period (<code>hoverDelay</code> /{' '}
          <code>leaveDelay</code>) so the pointer can travel into the card. It
          positions to any side and closes on outside-click / Escape.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">User preview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hover the link to reveal a profile card. <code>placement</code> sets
          the side; <code>offset</code> the gap.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<HoverCard
  open={open}
  onOpenChange={setOpen}
  placement="bottom-start"
  hoverDelay={300}
  leaveDelay={200}
  trigger={<a href="/u/ada">@ada</a>}
>
  <div className="card">
    <strong>Ada Lovelace</strong>
    <p>Computer scientist · 1843</p>
  </div>
</HoverCard>`}
        >
          <HoverCard
            open={open}
            onOpenChange={setOpen}
            placement="bottom-start"
            hoverDelay={300}
            leaveDelay={200}
            offset={6}
            closeOnClickOutside
            closeOnEscape
            trigger={
              <a
                href="#hovercard-ada"
                className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
              >
                @ada
              </a>
            }
          >
            <div className="w-56 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                <div>
                  <p className="font-semibold">Ada Lovelace</p>
                  <p className="text-gray-500">@ada</p>
                </div>
              </div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Mathematician and the first computer programmer.
              </p>
            </div>
          </HoverCard>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Placements &amp; timing</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>placement</code> supports <code>top</code>/<code>bottom</code>/
          <code>left</code>/<code>right</code> with <code>-start</code> /
          <code>-end</code> alignment. Tune <code>hoverDelay</code> to avoid
          accidental opens and <code>leaveDelay</code> to let users cross into
          the card.
        </p>
        <Demo
          code={`<HoverCard placement="right" hoverDelay={500} leaveDelay={300} trigger={<button>?</button>}>
  Help text
</HoverCard>`}
        >
          <p className="text-sm text-gray-500">
            Higher delays make the card feel intentional — see snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'open',
              type: 'boolean',
              default: '—',
              description: 'Controlled open state.',
            },
            {
              name: 'onOpenChange',
              type: '(open: boolean) => void',
              default: '—',
              description: 'Open change callback.',
            },
            {
              name: 'placement',
              type: "'top' | 'bottom' | 'left' | 'right' (± '-start'/'-end')",
              default: "'bottom'",
              description: 'Side + alignment relative to the trigger.',
            },
            {
              name: 'offset',
              type: 'number',
              default: '—',
              description: 'Gap between trigger and card in px.',
            },
            {
              name: 'hoverDelay / leaveDelay',
              type: 'number',
              default: '—',
              description: 'Open / close delay in ms.',
            },
            {
              name: 'closeOnClickOutside / closeOnEscape',
              type: 'boolean',
              default: 'true',
              description: 'Dismiss triggers.',
            },
            {
              name: 'trigger',
              type: 'ReactNode',
              default: '—',
              description: 'The element the card anchors to.',
            },
          ]}
        />
      </section>
    </div>
  );
}
