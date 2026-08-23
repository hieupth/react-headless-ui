'use client';

import { useState } from 'react';
import { AlertDialog, AlertDialogTrigger } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// AlertDialog portals to document.body and is designed for confirmations and
// destructive actions. The snippet shows the controlled API; theme the
// emitted overlay/content class hooks in your app.
export default function AlertDialogPage() {
  const [open, setOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">AlertDialog</h1>
        <p className="docs-lead">
          A confirmation dialog backed by the headless{' '}
          <code className="docs-code">useAlertDialog</code> hook. Unlike
          a plain Dialog it is purpose-built for destructive or blocking
          decisions: it forces attention with three severity variants —{' '}
          <code>default</code>, <code>warning</code>,{' '}
          <code>destructive</code> — supports an async{' '}
          <code>onConfirm</code>, and renders through a portal to{' '}
          <code className="docs-code">document.body</code>. Theme the
          emitted class hooks or pass a <code>children</code> render function
          for full control.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Destructive confirmation</h2>
        <p className="docs-desc">
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

      <section className="docs-section">
        <h2 className="docs-h2">With trigger &amp; async confirm</h2>
        <p className="docs-desc">
          <code>AlertDialogTrigger</code> wires a button to open the dialog.
          <code>onConfirm</code> may be async — the dialog stays open until the
          promise resolves.
        </p>
        <Demo
          code={`const [publishOpen, setPublishOpen] = useState(false);

<AlertDialogTrigger
  onClick={() => setPublishOpen(true)}
  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
>
  Publish release
</AlertDialogTrigger>

<AlertDialog
  open={publishOpen}
  onOpenChange={setPublishOpen}
  title="Publish release?"
  confirmText="Publish"
  onConfirm={async () => {
    await publishRelease(); // dialog stays open until the promise resolves
    setPublishOpen(false);
  }}
>
  {({ state, confirmButtonProps, cancelButtonProps }) => (
    <div className="dialog-card">
      <h3>Publish release?</h3>
      <button {...cancelButtonProps}>Cancel</button>
      <button {...confirmButtonProps}>
        {state.confirming ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  )}
</AlertDialog>`}
        >
          <div className="flex flex-col items-center gap-3">
            <AlertDialogTrigger
              onClick={() => setPublishOpen(true)}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              Publish release
            </AlertDialogTrigger>
            <AlertDialog
              open={publishOpen}
              onOpenChange={setPublishOpen}
              title="Publish release?"
              description="The changelog becomes visible to everyone immediately."
              confirmText="Publish"
              cancelText="Cancel"
              onConfirm={async () => {
                await new Promise((resolve) => setTimeout(resolve, 800));
                setPublishOpen(false);
              }}
            >
              {({ state, confirmButtonProps, cancelButtonProps }) => (
                <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="docs-h3">
                    Publish release?
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    The changelog becomes visible to everyone immediately.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      {...(cancelButtonProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      {...(confirmButtonProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {state.confirming ? 'Publishing…' : 'Publish'}
                    </button>
                  </div>
                </div>
              )}
            </AlertDialog>
            <span className="text-xs text-gray-500">
              The render-prop <code>children</code> receives{' '}
              <code>confirmButtonProps</code> /{' '}
              <code>cancelButtonProps</code> (aria + handlers) for custom
              layouts. <code>onConfirm</code> awaits an 800&nbsp;ms promise —
              the confirm button shows the busy state until it resolves.
            </span>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
