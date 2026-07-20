import { Alert } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Alert is headless in the a11y/behavior sense, but the default renderer
// emits semantic class hooks (alert, alert-destructive, …). Tailwind below
// targets those hooks to produce a visible preview; swap them for your own.
const alertBase =
  'flex items-start gap-3 rounded-lg border p-4 text-sm w-full max-w-md shadow-sm';
const variantClasses: Record<string, string> = {
  default:
    'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200',
  destructive:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-200',
  warning:
    'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200',
  success:
    'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-200',
};

export default function AlertPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Alert</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An inline feedback banner backed by the headless{' '}
          <code className="font-mono text-sm">useAlert</code> hook. It composes
          focus, press, and semantic mixins to deliver four severity variants,
          an optional dismiss button, and auto-dismiss — all driven by ARIA
          roles. Style the emitted <code className="font-mono text-sm">data-variant</code>{' '}
          / class hooks to theme it.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Four severity variants: <code>default</code> (info),{' '}
          <code>success</code>, <code>warning</code>, and{' '}
          <code>destructive</code>.
        </p>
        <Demo
          code={`<Alert variant="default" open title="Heads up" description="A new version is available." />
<Alert variant="success" open title="Saved" description="Your changes were saved." />
<Alert variant="warning" open title="Check storage" description="You're near your quota." />
<Alert variant="destructive" open title="Failed" description="The upload could not complete." />`}
        >
          <div className="flex flex-col items-stretch gap-3 w-full">
            <Alert variant="default" open className={`${alertBase} ${variantClasses.default}`}>
              <span aria-hidden>ℹ️</span>
              <div>
                <p className="font-semibold">Heads up</p>
                <p className="opacity-90">A new version is available.</p>
              </div>
            </Alert>
            <Alert variant="success" open className={`${alertBase} ${variantClasses.success}`}>
              <span aria-hidden>✅</span>
              <div>
                <p className="font-semibold">Saved</p>
                <p className="opacity-90">Your changes were saved.</p>
              </div>
            </Alert>
            <Alert variant="destructive" open className={`${alertBase} ${variantClasses.destructive}`}>
              <span aria-hidden>⚠️</span>
              <div>
                <p className="font-semibold">Failed</p>
                <p className="opacity-90">The upload could not complete.</p>
              </div>
            </Alert>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dismissible</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>dismissible</code> to render a close affordance; wire{' '}
          <code>onDismiss</code> / <code>onOpenChange</code> to update state.
          Use <code>autoDismiss</code> (ms) to self-close.
        </p>
        <Demo
          code={`<Alert
  variant="warning"
  open
  dismissible
  title="Session expiring"
  description="You'll be signed out in 5 minutes."
  onDismiss={() => setOpen(false)}
/>`}
        >
          <Alert
            variant="warning"
            open
            dismissible
            title="Session expiring"
            description="You'll be signed out in 5 minutes."
            className={`${alertBase} ${variantClasses.warning}`}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'default' | 'success' | 'warning' | 'destructive'",
              default: "'default'",
              description: 'Semantic severity. Emitted on data-variant for styling.',
            },
            {
              name: 'severity',
              type: "'info' | 'success' | 'warning' | 'error'",
              default: 'derived from variant',
              description: 'Accessibility severity level announced to assistive tech.',
            },
            {
              name: 'title',
              type: 'string',
              default: '—',
              description: 'Heading shown in the alert (also used for aria-label).',
            },
            {
              name: 'description',
              type: 'string',
              default: '—',
              description: 'Supporting message body.',
            },
            {
              name: 'open',
              type: 'boolean',
              default: 'false',
              description: 'Controlled visibility. The default renderer returns null when closed.',
            },
            {
              name: 'dismissible',
              type: 'boolean',
              default: 'false',
              description: 'Renders a close affordance and enables Escape to dismiss.',
            },
            {
              name: 'autoDismiss',
              type: 'number',
              default: '—',
              description: 'Auto-dismiss timeout in milliseconds.',
            },
            {
              name: 'onDismiss / onOpenChange',
              type: '() => void / (open: boolean) => void',
              default: '—',
              description: 'Dismiss / visibility change callbacks.',
            },
            {
              name: 'render',
              type: '(props: AlertRenderProps) => ReactElement',
              default: '—',
              description: 'Escape-hatch custom renderer receiving state + handlers.',
            },
          ]}
        />
      </section>
    </div>
  );
}
