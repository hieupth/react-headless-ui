'use client';

import { useToast } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Toast is a queue-based notification system. The headless useToast hook owns
// the queue + actions (addToast / dismiss / pause / resume) and exposes
// top-level variant helpers (success / error / warning / info). The <Toast>
// component renders the same queue with positioning + ARIA. The demo below
// drives the hook directly so buttons can fire toasts, and renders the queue
// inline. In a full app you'd mount <Toast> once near the root.
const variantChip: Record<string, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900',
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900',
};

function ToastPlayground() {
  const { state, actions, success, error, warning } = useToast({
    position: 'top-right',
    maxToasts: 4,
    defaultDuration: 4000,
    pauseOnHover: true,
  });

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => success('Profile saved successfully.')}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          Success
        </button>
        <button
          type="button"
          onClick={() => error('Upload failed — try again.')}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Error
        </button>
        <button
          type="button"
          onClick={() => warning('Storage almost full.')}
          className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
        >
          Warning
        </button>
        <button
          type="button"
          onClick={() =>
            actions.addToast({
              message: 'New comment on your post.',
              variant: 'info',
              dismissible: true,
              action: { label: 'View', onClick: () => {} },
            })
          }
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          With action
        </button>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-sm flex-col gap-2"
      >
        {state.toasts.length === 0 && (
          <p className="text-center text-xs text-gray-400">
            Click a button to fire a toast.
          </p>
        )}
        {[...state.toasts]
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((t) => (
            <div
              key={t.id}
              className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm shadow-sm ${variantChip[t.variant ?? 'default']}`}
            >
              <div>
                {t.title && <p className="font-semibold">{t.title}</p>}
                <p>{t.message}</p>
                {t.action && (
                  <button
                    type="button"
                    onClick={t.action.onClick}
                    className="mt-1 text-xs font-semibold underline underline-offset-2"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => actions.dismiss(t.id)}
                aria-label="Dismiss notification"
                className="text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function ToastPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Toast</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A queue-based notification system backed by the headless{' '}
          <code className="font-mono text-sm">useToast</code> hook. It manages a
          stack of messages with variants (<code>success</code> /{' '}
          <code>error</code> / <code>warning</code> / <code>info</code>),
          auto-dismiss timers, hover-to-pause, optional action buttons, six
          screen positions, and a max-stack cap. The{' '}
          <code className="font-mono text-sm">Toast</code> component renders the
          same queue with positioning and{' '}
          <code className="font-mono text-sm">aria-live</code>; drive it with the
          hook's <code>actions</code> and variant helpers for an ergonomic API.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Fire toasts</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The hook exposes <code>success</code> / <code>error</code> /{' '}
          <code>warning</code> / <code>info</code> helpers plus raw{' '}
          <code>addToast</code> for actions and custom durations. Hover a toast
          to pause its timer.
        </p>
        <Demo
          code={`const { state, actions, success, error, info } = useToast({
  position: 'top-right',
  maxToasts: 4,
  defaultDuration: 4000,
  pauseOnHover: true,
});

success('Profile saved successfully.');
error('Upload failed — try again.');
actions.addToast({
  message: 'New comment on your post.',
  variant: 'info',
  dismissible: true,
  action: { label: 'View', onClick: () => {} },
});

{/* Each toast renders with: theme the emitted toast class hook, or style inline:
      .toast { @apply flex items-start justify-between gap-3 rounded-lg border p-4 shadow-lg bg-white dark:bg-gray-900; }
  success → bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200
  error   → bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:text-red-200
  warning → bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-200
  info    → bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:text-blue-200 */}`}
        >
          <ToastPlayground />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Container &amp; ARIA</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>&lt;Toast&gt;</code> / <code>&lt;ToastProvider&gt;</code> render
          the positioned queue with <code>role="status"</code> and{' '}
          <code>aria-live="polite"</code>. <code>showProgress</code> renders a
          shrinking progress bar tied to the auto-dismiss timer;{' '}
          <code>renderToast</code> swaps the per-item renderer.
        </p>
        <Demo
          code={`<Toast
  position="bottom-right"
  maxToasts={5}
  defaultDuration={5000}
  showProgress
  pauseOnHover
/>`}
        >
          <p className="text-sm text-gray-500">
            Mount <code>&lt;Toast&gt;</code> once near your app root; the hook's{' '}
            <code>actions</code> push messages into it from anywhere.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'position',
              type: "'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'",
              default: "'top-right'",
              description: 'Where the toast stack appears on screen.',
            },
            {
              name: 'maxToasts',
              type: 'number',
              default: '—',
              description: 'Cap on simultaneously visible toasts.',
            },
            {
              name: 'defaultDuration',
              type: 'number',
              default: '—',
              description: 'Auto-dismiss time in ms (0 = sticky).',
            },
            {
              name: 'pauseOnHover',
              type: 'boolean',
              default: 'true',
              description: 'Pause the dismiss timer while hovered.',
            },
            {
              name: 'showProgress',
              type: 'boolean',
              default: 'false',
              description: 'Render a shrinking progress bar per toast.',
            },
            {
              name: 'renderToast',
              type: '(toast, index, onDismiss) => ReactNode',
              default: '—',
              description: 'Custom per-toast renderer.',
            },
            {
              name: 'actions.addToast',
              type: '(toast: Omit<ToastItem, "id"|"createdAt">) => string',
              default: '—',
              description: 'Push a toast (returns its id).',
            },
            {
              name: 'success / error / warning / info',
              type: '(message, options?) => string',
              default: '—',
              description: 'Top-level variant convenience helpers on the hook return.',
            },
            {
              name: 'actions.dismiss / clearAll / pause / resume',
              type: '(id) => void / () => void',
              default: '—',
              description: 'Queue control actions.',
            },
          ]}
        />
      </section>
    </div>
  );
}
