'use client';

import { Textarea } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Textarea is headless: useTextarea provides value tracking, auto-resize,
// char counting, and ARIA wiring, but ships no CSS. Theme the emitted
// .textarea-* classes with Tailwind.
const fieldBase =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'shadow-sm placeholder:text-gray-400 transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export default function TextareaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Textarea</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A multi-line text input backed by the headless{' '}
          <code className="font-mono text-sm">useTextarea</code> hook. It adds
          auto-resize, character counting, validation, and full ARIA semantics
          on top of the base input behavior — with no styles baked in.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A simple textarea with a label and helper text.
        </p>
        <Demo
          code={`<Textarea
  label="Bio"
  helperText="Tell us a little about yourself"
  placeholder="I'm a designer who…"
/>`}
        >
          <div className="w-full max-w-sm">
            <Textarea
              label="Bio"
              helperText="Tell us a little about yourself"
              placeholder="I'm a designer who…"
              className={fieldBase}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Character count &amp; limit</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pair <code>showCharCount</code> with <code>maxLength</code> for a live
          counter; reaching the limit flips an <code>aria-live</code> state.
        </p>
        <Demo
          code={`<Textarea
  label="Message"
  showCharCount
  maxLength={140}
  placeholder="Max 140 characters…"
/>`}
        >
          <div className="w-full max-w-sm">
            <Textarea
              label="Message"
              showCharCount
              maxLength={140}
              placeholder="Max 140 characters…"
              className={fieldBase}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Auto-resize &amp; error</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>autoResize</code> to grow with content; an{' '}
          <code>error</code> sets <code>aria-invalid</code> and a{' '}
          <code>role="alert"</code> message.
        </p>
        <Demo
          code={`<Textarea autoResize label="Notes" error="Notes cannot be empty" />`}
        >
          <div className="w-full max-w-sm">
            <Textarea
              autoResize
              label="Notes"
              error="Notes cannot be empty"
              className={`${fieldBase} border-red-500 focus:ring-red-500 focus:border-red-500`}
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
              description: 'Controlled or uncontrolled text value.',
            },
            {
              name: 'onChange',
              type: '(e: ChangeEvent<HTMLTextAreaElement>) => void',
              default: '—',
              description: 'Change handler receiving the native textarea event.',
            },
            {
              name: 'label',
              type: 'ReactNode',
              default: '—',
              description: 'Label rendered above the textarea (click focuses).',
            },
            {
              name: 'helperText',
              type: 'ReactNode',
              default: '—',
              description: 'Supportive text shown beneath the textarea.',
            },
            {
              name: 'error',
              type: 'ReactNode',
              default: '—',
              description: 'Error message; sets aria-invalid and role="alert".',
            },
            {
              name: 'autoResize',
              type: 'boolean',
              default: 'false',
              description: 'Grow the textarea height to fit its content.',
            },
            {
              name: 'showCharCount',
              type: 'boolean',
              default: 'false',
              description: 'Show a live character count (pairs with maxLength).',
            },
            {
              name: 'charCountFormatter',
              type: '(current: number, max?: number) => string',
              default: '—',
              description: 'Custom formatter for the character count text.',
            },
            {
              name: 'maxLength / disabled / required',
              type: 'number / boolean',
              default: '—',
              description: 'Native field attributes reflected to ARIA.',
            },
          ]}
        />
      </section>
    </div>
  );
}
