'use client';

import { useState } from 'react';
import { AlertDialog } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// AlertDialog portals to document.body and is designed for confirmations and
// destructive actions. The snippet shows the controlled API; theme the
// emitted overlay/content class hooks in your app.
export default function AlertDialogPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">AlertDialog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A confirmation dialog backed by the headless{' '}
          <code className="font-mono text-sm">useAlertDialog</code> hook. Unlike
          a plain Dialog it is purpose-built for destructive or blocking
          decisions: it forces attention with three severity variants —{' '}
          <code>default</code>, <code>warning</code>,{' '}
          <code>destructive</code> — supports an async{' '}
          <code>onConfirm</code>, and renders through a portal to{' '}
          <code className="font-mono text-sm">document.body</code>. Theme the
          emitted class hooks or pass a <code>children</code> render function
          for full control.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Destructive confirmation</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant="destructive"</code> styles the confirm action as a
          danger button; <code>showCancel</code> toggles the cancel affordance.
        </p>
        <Demo
          code={`const [open, setOpen] = useState(false);

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
>
  Delete account
</button>

{/* AlertDialog portals to document.body. Theme the emitted
    alertdialog-overlay / alertdialog-content class hooks:
      .alertdialog-overlay  { @apply fixed inset-0 z-50 bg-black/50; }
      .alertdialog-content  { @apply w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-gray-100; } */}
<AlertDialog
  open={open}
  onOpenChange={setOpen}
  variant="destructive"
  title="Delete account"
  description="This permanently erases your data."
  confirmText="Delete account"
  cancelText="Keep account"
  onConfirm={async () => { await api.delete(); }}
/>`}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete account
          </button>
          <AlertDialog
            open={open}
            onOpenChange={setOpen}
            variant="destructive"
            title="Delete account"
            description="This permanently erases your data."
            confirmText="Delete account"
            cancelText="Keep account"
            onConfirm={() => setOpen(false)}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With trigger &amp; async confirm</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>AlertDialogTrigger</code> wires a button to open the dialog.
          <code>onConfirm</code> may be async — the dialog stays open until the
          promise resolves.
        </p>
        <Demo
          code={`<AlertDialog title="Publish?" confirmText="Publish" onConfirm={publish}>
  {({ confirmButtonProps, cancelButtonProps }) => (
    <>
      <button {...cancelButtonProps}>Cancel</button>
      <button {...confirmButtonProps}>Publish</button>
    </>
  )}
</AlertDialog>`}
        >
          <p className="text-sm text-gray-500">
            The render-prop <code>children</code> receives{' '}
            <code>confirmButtonProps</code> /{' '}
            <code>cancelButtonProps</code> (aria + handlers) for custom layouts.
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
              description: 'Visibility change callback.',
            },
            {
              name: 'title',
              type: 'ReactNode',
              default: '—',
              description: 'Required dialog heading (auto-announced).',
            },
            {
              name: 'description',
              type: 'ReactNode',
              default: '—',
              description: 'Supporting body text.',
            },
            {
              name: 'variant',
              type: "'default' | 'destructive' | 'warning'",
              default: "'default'",
              description: 'Severity; drives confirm button styling.',
            },
            {
              name: 'confirmText / cancelText',
              type: 'string',
              default: "'Confirm' / 'Cancel'",
              description: 'Action button labels.',
            },
            {
              name: 'onConfirm',
              type: '() => void | Promise<void>',
              default: '—',
              description: 'Async confirm handler; dialog awaits resolution.',
            },
            {
              name: 'onCancel',
              type: '() => void',
              default: '—',
              description: 'Cancel handler.',
            },
            {
              name: 'showCancel',
              type: 'boolean',
              default: 'true',
              description: 'Whether to render the cancel button.',
            },
            {
              name: 'children',
              type: '(renderArgs) => ReactNode',
              default: '—',
              description: 'Render-prop for fully custom content/buttons.',
            },
          ]}
        />
      </section>
    </div>
  );
}
