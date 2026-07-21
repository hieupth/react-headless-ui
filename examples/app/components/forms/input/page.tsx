'use client';

import { Input } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// reui's Input is headless: it ships validation, focus, character-count, and
// a11y behavior via useInput, but no CSS. The showcase targets the emitted
// .input-element / .input-label / .input-error classes with Tailwind via a
// <style> scope OR uses the `render` escape hatch to draw its own markup.
// Here we use the render prop to fully control styling.
const fieldBase =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm dark:shadow-none ' +
  'placeholder:text-gray-400 transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export default function InputPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Input</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A text input backed by the headless{' '}
          <code className="font-mono text-sm">useInput</code> hook. It composes
          focus, validation, character counting, and ARIA semantics — with no
          styles baked in. Use the <code className="font-mono text-sm">render</code>{' '}
          prop to draw your own markup and theme it with Tailwind.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A controlled text input with a placeholder.
        </p>
        <Demo code={`<Input placeholder="you@example.com" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm dark:shadow-none placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />`}>
          <Input
            placeholder="you@example.com"
            className={fieldBase}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">States</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Disabled and error states wire up <code>aria-disabled</code> /{' '}
          <code>aria-invalid</code> automatically.
        </p>
        <Demo
          code={`<Input disabled placeholder="Disabled" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm dark:shadow-none placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />
<Input error="This field is required" className="w-full rounded-md border border-red-500 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm dark:shadow-none placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed" />`}
        >
          <div className="w-full max-w-sm space-y-3">
            <Input
              disabled
              placeholder="Disabled"
              className={`${fieldBase} bg-gray-50`}
            />
            <Input
              error="This field is required"
              className={`${fieldBase} border-red-500 focus:ring-red-500 focus:border-red-500`}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With adornments &amp; helper text</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Leading/trailing elements, helper text, label, and live character
          count (<code>showCharacterCount</code> + <code>maxLength</code>).
        </p>
        <Demo
          code={`<Input
  label="Username"
  helperText="3–20 characters"
  leadingElement={<span className="text-gray-400">@</span>}
  trailingElement={<button className="text-xs text-blue-600">Check</button>}
  showCharacterCount
  maxLength={20}
  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm dark:shadow-none placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
/>`}
        >
          <div className="w-full max-w-sm">
            <Input
              label="Username"
              helperText="3–20 characters"
              leadingElement={<span className="text-gray-400">@</span>}
              trailingElement={
                <button className="text-xs text-blue-600">Check</button>
              }
              showCharacterCount
              maxLength={20}
              className={fieldBase}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'value / defaultValue',
              type: 'string',
              default: '—',
              description: 'Controlled or uncontrolled input value.',
            },
            {
              name: 'onChange',
              type: '(e: ChangeEvent<HTMLInputElement>) => void',
              default: '—',
              description: 'Change handler receiving the native input event.',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: '—',
              description: 'Placeholder text.',
            },
            {
              name: 'label',
              type: 'string',
              default: '—',
              description: 'Accessible label rendered above the input.',
            },
            {
              name: 'helperText',
              type: 'string',
              default: '—',
              description: 'Supportive text shown beneath the input.',
            },
            {
              name: 'error',
              type: 'string',
              default: '—',
              description: 'Error message; sets aria-invalid and role="alert".',
            },
            {
              name: 'leadingElement / trailingElement',
              type: 'ReactNode',
              default: '—',
              description: 'Adornments rendered before/after the input.',
            },
            {
              name: 'showCharacterCount',
              type: 'boolean',
              default: 'false',
              description: 'Show a live character count (pairs with maxLength).',
            },
            {
              name: 'disabled / readOnly / required',
              type: 'boolean',
              default: 'false',
              description: 'Native field states; reflected to ARIA attributes.',
            },
            {
              name: 'render',
              type: '(props: InputRenderProps) => ReactElement',
              default: '—',
              description: 'Escape-hatch custom renderer receiving state + handlers.',
            },
          ]}
        />
      </section>
    </div>
  );
}
