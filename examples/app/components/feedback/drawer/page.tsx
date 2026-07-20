'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Drawer is a compound component (Drawer + DrawerTrigger / Content / Header /
// Footer). It slides in from a side and, when modal, portals a backdrop to
// document.body. The snippet shows the compound API; theme the sides with
// `side` and `size`.
export default function DrawerPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Drawer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A side panel backed by the headless{' '}
          <code className="font-mono text-sm">useDrawer</code> hook. It slides in
          from <code>left</code> / <code>right</code> / <code>top</code> /{' '}
          <code>bottom</code>, supports modal (backdrop + focus trap) and
          persistent variants, and exposes a compound API —{' '}
          <code>Drawer</code>, <code>DrawerTrigger</code>,{' '}
          <code>DrawerContent</code>, <code>DrawerHeader</code>,{' '}
          <code>DrawerFooter</code>. Modal drawers portal a backdrop to{' '}
          <code className="font-mono text-sm">document.body</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Right side, modal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Default <code>side="right"</code> with a backdrop and focus trap. Use{' '}
          <code>size</code> (<code>sm</code>–<code>full</code>) to set panel
          width.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<Drawer open={open} onOpenChange={setOpen} side="right" size="md" modal title="Filters">
  <DrawerTrigger>Open filters</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>Filters</DrawerHeader>
    {/* …filter controls… */}
    <DrawerFooter>{/* Apply / Reset */}</DrawerFooter>
  </DrawerContent>
</Drawer>`}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          >
            Open drawer
          </button>
          <Drawer
            open={open}
            onOpenChange={setOpen}
            side="right"
            size="md"
            modal
            title="Filters"
          >
            <DrawerContent>
              <DrawerHeader>Filters</DrawerHeader>
              <p className="px-4 text-sm text-gray-500">
                Panel contents go here — theme the emitted class hooks.
              </p>
              <DrawerFooter>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Apply
                </button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Persistent &amp; sides</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant="persistent"</code> omits the backdrop (useful for
          app-shell navigation). <code>side</code> picks the slide direction;
          <code>trapFocus</code> / <code>restoreFocus</code> tune focus behavior.
        </p>
        <Demo
          code={`<Drawer side="left" variant="persistent" showCloseButton={false}>
  <DrawerContent>
    <DrawerHeader>Navigation</DrawerHeader>
  </DrawerContent>
</Drawer>`}
        >
          <p className="text-sm text-gray-500">
            Persistent drawers stay open alongside content — see the snippet.
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
              name: 'side',
              type: "'left' | 'right' | 'top' | 'bottom'",
              default: "'right'",
              description: 'Edge the panel slides in from.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg' | 'xl' | 'full'",
              default: "'md'",
              description: 'Panel dimension along the slide axis.',
            },
            {
              name: 'variant',
              type: "'default' | 'persistent' | 'temporary'",
              default: "'default'",
              description: 'Persistent omits the backdrop; temporary auto-closes.',
            },
            {
              name: 'modal',
              type: 'boolean',
              default: 'true',
              description: 'Render a backdrop and trap focus.',
            },
            {
              name: 'closeOnOutsideClick / closeOnEscape',
              type: 'boolean',
              default: 'true',
              description: 'Close triggers.',
            },
            {
              name: 'trapFocus / restoreFocus',
              type: 'boolean',
              default: 'true',
              description: 'Focus management behavior.',
            },
            {
              name: 'onBeforeOpen / onBeforeClose',
              type: '() => boolean | Promise<boolean>',
              default: '—',
              description: 'Guards that can veto the open/close.',
            },
          ]}
        />
      </section>
    </div>
  );
}
