'use client';

import { Field } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Field is headless: useField wires label association, focus/filled/invalid
// state, adornments, clear, and char-count ARIA. Its classes are empty, so
// theme the .field-container, the embedded <input>, and helpers with Tailwind
// via descendant selectors.
const fieldBase =
  'w-full ' +
  '[&>label]:mb-1 [&>label]:block [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 dark:[&>label]:text-gray-200 ' +
  '[&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-gray-300 dark:[&_input]:border-gray-600 ' +
  '[&_input]:bg-white dark:[&_input]:bg-gray-900 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-gray-900 dark:[&_input]:text-gray-100 ' +
  '[&_input]:shadow-sm dark:[&_input]:shadow-none [&_input]:placeholder:text-gray-400 ' +
  '[&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-indigo-500 [&_input]:focus:border-indigo-500 ' +
  '[&_input]:disabled:opacity-50 ' +
  '[&_p]:mt-1 [&_p]:text-xs [&_p]:text-gray-500 dark:[&_p]:text-gray-400 ' +
  '[&_.field-container_error]:text-red-600';

export default function FieldPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Field</h1>
        <p className="docs-lead">
          A complete field wrapper backed by the headless{' '}
          <code className="docs-code">useField</code> hook. It bundles a
          label, the input, prefix/suffix and start/end adornments, a clear
          button, helper/error messaging, and a character count — all wired with
          proper ARIA. Ships no styles; theme it via descendant selectors on{' '}
          <code className="docs-code">.field-container</code> and the
          embedded <code className="docs-code">&lt;input&gt;</code>.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Basic</h2>
        <p className="docs-desc">
          A labeled field with a placeholder and helper text.
        </p>
        <Demo
          code={`<Field label="Full name" placeholder="Ada Lovelace" helperText="As it appears on your ID" className="w-full [&>label]:mb-1 [&>label]:block [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 dark:[&>label]:text-gray-200 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:bg-white dark:[&_input]:bg-gray-900 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-gray-900 dark:[&_input]:text-gray-100 [&_input]:shadow-sm dark:[&_input]:shadow-none [&_input]:placeholder:text-gray-400 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-indigo-500 [&_input]:focus:border-indigo-500 [&_input]:disabled:opacity-50 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-gray-500 dark:[&_p]:text-gray-400 [&_.field-container_error]:text-red-600" />`}
        >
          <div className="w-full max-w-sm">
            <Field
              className={fieldBase}
              label="Full name"
              placeholder="Ada Lovelace"
              helperText="As it appears on your ID"
            />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Adornments &amp; clear</h2>
        <p className="docs-desc">
          <code>prefix</code> / <code>suffix</code> and{' '}
          <code>startAdornment</code> / <code>endAdornment</code> decorate the
          field; <code>clearable</code> adds a clear button when filled.
        </p>
        <Demo
          code={`<Field
  label="Amount"
  prefix={<span className="text-gray-400">$</span>}
  suffix={<span className="text-gray-400 text-xs">USD</span>}
  clearable
  className="w-full [&>label]:mb-1 [&>label]:block [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 dark:[&>label]:text-gray-200 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:bg-white dark:[&_input]:bg-gray-900 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-gray-900 dark:[&_input]:text-gray-100 [&_input]:shadow-sm dark:[&_input]:shadow-none [&_input]:placeholder:text-gray-400 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-indigo-500 [&_input]:focus:border-indigo-500 [&_input]:disabled:opacity-50 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-gray-500 dark:[&_p]:text-gray-400 [&_.field-container_error]:text-red-600"
/>`}
        >
          <div className="w-full max-w-sm">
            <Field
              className={fieldBase}
              label="Amount"
              prefix={<span className="text-gray-400">$</span>}
              suffix={<span className="text-gray-400 text-xs">USD</span>}
              clearable
            />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Error &amp; character count</h2>
        <p className="docs-desc">
          <code>showCount</code> pairs with <code>maxLength</code> for a live
          counter; an error renders a <code>role="alert"</code> message.
        </p>
        <Demo
          code={`<Field
  label="Username"
  maxLength={20}
  showCount
  error="That username is taken"
  className="w-full [&>label]:mb-1 [&>label]:block [&>label]:text-sm [&>label]:font-medium [&>label]:text-gray-700 dark:[&>label]:text-gray-200 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-gray-300 dark:[&_input]:border-gray-600 [&_input]:bg-white dark:[&_input]:bg-gray-900 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-gray-900 dark:[&_input]:text-gray-100 [&_input]:shadow-sm dark:[&_input]:shadow-none [&_input]:placeholder:text-gray-400 [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-indigo-500 [&_input]:focus:border-indigo-500 [&_input]:disabled:opacity-50 [&_p]:mt-1 [&_p]:text-xs [&_p]:text-gray-500 dark:[&_p]:text-gray-400 [&_.field-container_error]:text-red-600"
/>`}
        >
          <div className="w-full max-w-sm">
            <Field
              className={fieldBase}
              label="Username"
              maxLength={20}
              showCount
              error="That username is taken"
            />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            {
              name: 'label',
              type: 'string',
              default: '—',
              description: 'Accessible label rendered above the input.',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: '—',
              description: 'Input placeholder text.',
            },
            {
              name: 'helperText / description',
              type: 'string',
              default: '—',
              description: 'Supportive text beneath the field.',
            },
            {
              name: 'error',
              type: 'string',
              default: '—',
              description: 'Error message; sets aria-invalid and role="alert".',
            },
            {
              name: 'prefix / suffix',
              type: 'ReactNode',
              default: '—',
              description: 'Inline decoration inside the input wrapper.',
            },
            {
              name: 'startAdornment / endAdornment',
              type: 'ReactNode',
              default: '—',
              description: 'Richer adornments (icons, buttons) at the edges.',
            },
            {
              name: 'clearable',
              type: 'boolean',
              default: 'false',
              description: 'Show a clear button when the field is filled.',
            },
            {
              name: 'showCount / maxLength',
              type: 'boolean / number',
              default: 'false / —',
              description: 'Live character count against a max length.',
            },
            {
              name: 'size / variant',
              type: "'sm' | 'md' | 'lg' / 'outline' | 'filled' | 'underline'",
              default: "'md' / 'outline'",
              description: 'Size and variant hooks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
