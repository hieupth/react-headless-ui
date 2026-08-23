'use client';

import { Label } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Label is one of the few react-headless-ui components that applies inline theme styles,
// so it renders visibly without extra Tailwind. It wires htmlFor, disabled
// and error colors, and a configurable required indicator.
export default function LabelPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Label</h1>
        <p className="docs-lead">
          An accessible form label backed by the headless{' '}
          <code className="docs-code">useLabel</code> hook. It manages{' '}
          <code className="docs-code">htmlFor</code> association, disabled
          and error coloring, and a configurable required indicator (position
          and custom render). Unlike most react-headless-ui components it applies inline theme
          styles, so it renders visibly out of the box.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Basic</h2>
        <p className="docs-desc">
          A simple label associated with a field by <code>htmlFor</code>.
        </p>
        <Demo code={`<Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</Label>`}>
          <div className="flex flex-col items-start gap-1">
            <Label htmlFor="email-demo" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</Label>
            <input
              id="email-demo"
              type="email"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none"
              placeholder="you@example.com"
            />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Required indicator</h2>
        <p className="docs-desc">
          Set <code>required</code> to show an indicator; control its position
          with <code>requiredPosition</code> (<code>start</code> /{' '}
          <code>end</code>) and its glyph with{' '}
          <code>renderRequiredIndicator</code>.
        </p>
        <Demo
          code={`<Label required requiredPosition="start" className="text-sm font-medium text-gray-700 dark:text-gray-200">First name</Label>
<Label required requiredPosition="end" className="text-sm font-medium text-gray-700 dark:text-gray-200">Last name</Label>`}
        >
          <div className="flex flex-col items-start gap-2">
            <Label required requiredPosition="start" className="text-sm font-medium text-gray-700 dark:text-gray-200">First name</Label>
            <Label required requiredPosition="end" className="text-sm font-medium text-gray-700 dark:text-gray-200">Last name</Label>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Error &amp; disabled</h2>
        <p className="docs-desc">
          <code>error</code> tints the label destructive;{' '}
          <code>disabled</code> mutes it and switches the cursor.
        </p>
        <Demo
          code={`<Label error className="text-sm font-medium">Username is taken</Label>
<Label disabled className="text-sm font-medium text-gray-700 dark:text-gray-200">Locked field</Label>`}
        >
          <div className="flex flex-col items-start gap-2">
            <Label error className="text-sm font-medium">Username is taken</Label>
            <Label disabled className="text-sm font-medium text-gray-700 dark:text-gray-200">Locked field</Label>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
