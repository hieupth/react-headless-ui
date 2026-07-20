import { Label } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Label is one of the few reui components that applies inline theme styles,
// so it renders visibly without extra Tailwind. It wires htmlFor, disabled
// and error colors, and a configurable required indicator.
export default function LabelPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Label</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An accessible form label backed by the headless{' '}
          <code className="font-mono text-sm">useLabel</code> hook. It manages{' '}
          <code className="font-mono text-sm">htmlFor</code> association, disabled
          and error coloring, and a configurable required indicator (position
          and custom render). Unlike most reui components it applies inline theme
          styles, so it renders visibly out of the box.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A simple label associated with a field by <code>htmlFor</code>.
        </p>
        <Demo code={`<Label htmlFor="email">Email</Label>`}>
          <div className="flex flex-col items-start gap-1">
            <Label htmlFor="email-demo">Email</Label>
            <input
              id="email-demo"
              type="email"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Required indicator</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>required</code> to show an indicator; control its position
          with <code>requiredPosition</code> (<code>start</code> /{' '}
          <code>end</code>) and its glyph with{' '}
          <code>renderRequiredIndicator</code>.
        </p>
        <Demo
          code={`<Label required requiredPosition="start">First name</Label>
<Label required requiredPosition="end">Last name</Label>`}
        >
          <div className="flex flex-col items-start gap-2">
            <Label required requiredPosition="start">First name</Label>
            <Label required requiredPosition="end">Last name</Label>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Error &amp; disabled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>error</code> tints the label destructive;{' '}
          <code>disabled</code> mutes it and switches the cursor.
        </p>
        <Demo
          code={`<Label error>Username is taken</Label>
<Label disabled>Locked field</Label>`}
        >
          <div className="flex flex-col items-start gap-2">
            <Label error>Username is taken</Label>
            <Label disabled>Locked field</Label>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'htmlFor',
              type: 'string',
              default: '—',
              description: 'Associates the label with a form control by id.',
            },
            {
              name: 'required',
              type: 'boolean',
              default: 'false',
              description: 'Show the required indicator.',
            },
            {
              name: 'requiredPosition',
              type: "'start' | 'end'",
              default: "'end'",
              description: 'Where to render the required indicator.',
            },
            {
              name: 'requiredIndicator',
              type: 'ReactNode',
              default: "'*'",
              description: 'Custom glyph/text for the required indicator.',
            },
            {
              name: 'renderRequiredIndicator',
              type: '() => ReactNode',
              default: '—',
              description: 'Fully custom renderer for the indicator.',
            },
            {
              name: 'error',
              type: 'boolean',
              default: 'false',
              description: 'Tints the label with the destructive color.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Mutes the label and sets cursor: not-allowed.',
            },
            {
              name: 'className',
              type: 'string',
              default: '—',
              description: 'Additional CSS classes.',
            },
          ]}
        />
      </section>
    </div>
  );
}
