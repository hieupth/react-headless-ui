'use client';

import { useState } from 'react';
import { Portal } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Portal is backed by the headless usePortal hook. It renders its children into
// a DOM node outside the current React tree (document.body by default) via
// React's createPortal, then layers on focus trapping, focus restoration, an
// Escape-to-close handler, an optional backdrop, and enter/leave animation
// timing. Because it portals to the top of the DOM, the preview here is
// interactive — toggle the buttons to see content render over the page.

export default function PortalPage() {
  const [openBasic, setOpenBasic] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Portal</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A portal renderer backed by the headless{' '}
          <code className="font-mono text-sm">usePortal</code> hook. It lifts
          children out of the current React tree into{' '}
          <code>document.body</code> (or a custom container) via React&apos;s{' '}
          <code>createPortal</code>, then adds the overlay ergonomics you usually
          hand-roll: an optional backdrop, focus trapping, focus restoration on
          close, an Escape-to-close listener, and enter/leave animation timing.
          Dialogs, drawers, tooltips, and menus all build on this primitive.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic portal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The simplest case: open controlled with{' '}
          <code>open</code> and the content renders above everything else. Close
          with the button or press <kbd className="font-mono">Escape</kbd>.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<Portal open={open} closeOnEscape onClose={() => setOpen(false)}>
  <div className="mx-auto mt-32 max-w-xs rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
    <p className="text-sm text-gray-700 dark:text-gray-200">
      I render in <code>document.body</code>, not inside the preview box.
    </p>
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
    >
      Close
    </button>
  </div>
</Portal>

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
>
  Open portal
</button>`}
        >
          <button
            type="button"
            onClick={() => setOpenBasic(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Open portal
          </button>
          <Portal
            open={openBasic}
            closeOnEscape
            onClose={() => setOpenBasic(false)}
          >
            <div className="mx-auto mt-32 max-w-xs rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                I render in <code>document.body</code>, not inside the preview
                box.
              </p>
              <button
                type="button"
                onClick={() => setOpenBasic(false)}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </Portal>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Modal with backdrop</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>showBackdrop</code> adds a dimmed/blurred layer behind the
          content; <code>onBackdropClick</code> closes it.{' '}
          <code>trapFocus</code> keeps Tab cycling inside the portal.
        </p>
        <Demo
          code={`<Portal
  open={open}
  showBackdrop
  trapFocus
  restoreFocus
  closeOnEscape
  onBackdropClick={() => setOpen(false)}
  onClose={() => setOpen(false)}
>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Confirm"
    className="mx-auto mt-32 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Are you sure?
    </h3>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
      Focus is trapped and restored when this closes.
    </p>
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Confirm
      </button>
    </div>
  </div>
</Portal>

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
>
  Open modal
</button>`}
        >
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Open modal
          </button>
          <Portal
            open={openModal}
            showBackdrop
            trapFocus
            restoreFocus
            closeOnEscape
            onBackdropClick={() => setOpenModal(false)}
            onClose={() => setOpenModal(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm"
              className="mx-auto mt-32 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Are you sure?
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Focus is trapped and restored when this closes.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </Portal>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'open', type: 'boolean', default: '—', description: 'Controlled visibility of the portal.' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Uncontrolled initial open state.' },
            { name: 'container', type: 'string | HTMLElement', default: 'document.body', description: 'Selector or node to portal into.' },
            { name: 'showBackdrop', type: 'boolean', default: 'false', description: 'Render a dimmed/blurred backdrop behind the content.' },
            { name: 'onBackdropClick', type: '() => void', default: '—', description: 'Fires when the backdrop is clicked.' },
            { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Close the portal when Escape is pressed.' },
            { name: 'trapFocus', type: 'boolean', default: 'false', description: 'Keep Tab focus cycling inside the portal.' },
            { name: 'restoreFocus', type: 'boolean', default: 'true', description: 'Return focus to the previously focused element on close.' },
            { name: 'animationDuration', type: 'number', default: '200', description: 'Enter/leave transition duration in ms (delayed unmount).' },
            { name: 'wrapperTag', type: 'ElementType', default: "'div'", description: 'Element tag for the portal wrapper.' },
          ]}
        />
      </section>
    </div>
  );
}
