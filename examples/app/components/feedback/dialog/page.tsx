'use client';

import { useState } from 'react';
import { Dialog } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Dialog portals its overlay + content to document.body via createPortal, so a
// live preview inside the Demo frame would be misleading. The snippets below
// show the headless API; in a real app you control `open` with state and theme
// the emitted `dialog-overlay` / `dialog-content` class hooks.
export default function DialogPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Dialog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A modal dialog backed by the headless{' '}
          <code className="font-mono text-sm">useDialog</code> hook. It traps
          focus, restores it on close, closes on Escape and overlay click, and
          wires <code className="font-mono text-sm">aria-modal</code> plus
          labelled title/description. The overlay and content render through a
          portal to <code className="font-mono text-sm">document.body</code> —
          theme the <code className="font-mono text-sm">dialog-overlay</code>{' '}
          / <code className="font-mono text-sm">dialog-content</code> class
          hooks (or pass <code>renderOverlay</code> /{' '}
          <code>renderContent</code>).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic modal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Control visibility with <code>open</code> /{' '}
          <code>onOpenChange</code>. <code>title</code> and{' '}
          <code>description</code> are auto-announced.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900"
>
  Open dialog
</button>

{/* Dialog portals to document.body. Theme the emitted
    dialog-overlay / dialog-content class hooks:
      .dialog-overlay  { @apply fixed inset-0 z-50 bg-black/50; }
      .dialog-content  { @apply w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-gray-100; } */}
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Delete project"
  description="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={() => { /* … */ }}
  onCancel={() => setOpen(false)}
/>`}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900"
          >
            Open dialog
          </button>
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title="Delete project"
            description="This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Non-modal &amp; focus</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>modal={false}</code> to skip the focus trap;{' '}
          <code>initialFocus</code> accepts a selector or element to focus on
          open. Disable overlay/escape close with{' '}
          <code>closeOnOverlayClick</code> / <code>closeOnEscape</code>.
        </p>
        <Demo
          code={`<Dialog
  open={open}
  onOpenChange={setOpen}
  modal={false}
  initialFocus="#name"
  closeOnOverlayClick={false}
>
  <input id="name" />
</Dialog>`}
        >
          <p className="text-sm text-gray-500">
            Non-modal dialogs render the same portal without trapping focus —
            see the snippet.
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
              description: 'Controlled visibility.',
            },
            {
              name: 'onOpenChange',
              type: '(open: boolean) => void',
              default: '—',
              description: 'Visibility change callback (Escape / overlay click).',
            },
            {
              name: 'modal',
              type: 'boolean',
              default: 'true',
              description: 'Trap focus and mark aria-modal while open.',
            },
            {
              name: 'initialFocus',
              type: 'string | HTMLElement',
              default: '—',
              description: 'Element to focus when the dialog opens.',
            },
            {
              name: 'closeOnOverlayClick / closeOnEscape',
              type: 'boolean',
              default: 'true',
              description: 'Whether overlay click / Escape closes the dialog.',
            },
            {
              name: 'title / description',
              type: 'string',
              default: '—',
              description: 'Heading and supporting text; auto-wired to aria.',
            },
            {
              name: 'confirmText / cancelText',
              type: 'string',
              default: "'Confirm' / 'Cancel'",
              description: 'Labels for the default action buttons.',
            },
            {
              name: 'onConfirm / onCancel',
              type: '() => void',
              default: '—',
              description: 'Action button handlers.',
            },
            {
              name: 'renderOverlay / renderContent',
              type: '(props) => ReactElement',
              default: '—',
              description: 'Custom renderers for overlay and content.',
            },
          ]}
        />
      </section>
    </div>
  );
}
