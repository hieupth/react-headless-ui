'use client';

import { useState } from 'react';
import { Offcanvas, OffcanvasTrigger } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Offcanvas is a full-viewport slide-over (mobile-first sibling of Drawer) that
// portals to document.body with a backdrop. The snippet shows the controlled
// API; theme the emitted class hooks.
export default function OffcanvasPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Offcanvas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A full-viewport slide-over panel backed by the headless{' '}
          <code className="font-mono text-sm">useOffcanvas</code> hook — the
          mobile-first sibling of Drawer. It slides in from any edge, renders an
          optional backdrop, traps focus, prevents body scroll, and portals to{' '}
          <code className="font-mono text-sm">document.body</code>. Pair it with{' '}
          <code>OffcanvasTrigger</code> for an uncontrolled open button, or drive{' '}
          <code>open</code> yourself.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Left off-canvas menu</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Default <code>position="left"</code> with a backdrop and body-scroll
          lock. <code>size</code> controls how far it covers the viewport.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<Offcanvas open={open} onToggle={setOpen} position="left" size="md" showBackdrop>
  <OffcanvasTrigger>Menu</OffcanvasTrigger>
  {/* …nav items… */}
</Offcanvas>`}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          >
            Open menu
          </button>
          <Offcanvas
            open={open}
            onToggle={setOpen}
            position="left"
            size="md"
            showBackdrop
            closeOnBackdropClick
            closeOnEscape
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Persistent &amp; positions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>persistent</code> keeps the panel mounted without a backdrop;
          <code>position</code> picks the edge (<code>left</code> /{' '}
          <code>right</code> / <code>top</code> / <code>bottom</code>).
        </p>
        <Demo
          code={`<Offcanvas position="right" persistent trapFocus={false}>
  <OffcanvasTrigger>Details</OffcanvasTrigger>
</Offcanvas>`}
        >
          <p className="text-sm text-gray-500">
            Persistent offcanvas panels coexist with page content — see snippet.
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
              name: 'position',
              type: "'left' | 'right' | 'top' | 'bottom'",
              default: "'left'",
              description: 'Edge the panel slides from.',
            },
            {
              name: 'size',
              type: 'OffcanvasSize',
              default: '—',
              description: 'How much of the viewport the panel covers.',
            },
            {
              name: 'showBackdrop',
              type: 'boolean',
              default: 'true',
              description: 'Render a dimmed backdrop behind the panel.',
            },
            {
              name: 'closeOnBackdropClick / closeOnEscape',
              type: 'boolean',
              default: 'true',
              description: 'Close triggers.',
            },
            {
              name: 'trapFocus / restoreFocus',
              type: 'boolean',
              default: 'true',
              description: 'Focus management while open.',
            },
            {
              name: 'preventBodyScroll',
              type: 'boolean',
              default: 'true',
              description: 'Lock body scroll while the panel is open.',
            },
            {
              name: 'persistent',
              type: 'boolean',
              default: 'false',
              description: 'Stay mounted without a backdrop.',
            },
            {
              name: 'onOpen / onClose / onToggle',
              type: '() => void / (open: boolean) => void',
              default: '—',
              description: 'Lifecycle callbacks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
