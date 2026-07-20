'use client';

import { InputGroup } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// InputGroup is headless: useInputGroup manages per-item values, focus
// tracking, layout, validation rules, and a built-in Validate/Reset/Clear
// action row. The component renders each item itself (inputs, labels, helpers,
// prefixes/suffixes, actions). Theme via descendant selectors on .input-group
// and the embedded .input-field inputs / buttons.
const groupBase =
  '[&_.input-item]:mb-3 ' +
  '[&_.input-item_label]:mb-1 [&_.input-item_label]:block [&_.input-item_label]:text-sm [&_.input-item_label]:font-medium [&_.input-item_label]:text-gray-700 ' +
  '[&_.input-field]:w-full [&_.input-field]:rounded-md [&_.input-field]:border [&_.input-field]:border-gray-300 ' +
  '[&_.input-field]:bg-white [&_.input-field]:px-3 [&_.input-field]:py-2 [&_.input-field]:text-sm [&_.input-field]:text-gray-900 ' +
  '[&_.input-field]:shadow-sm [&_.input-field]:placeholder:text-gray-400 ' +
  '[&_.input-field]:focus:outline-none [&_.input-field]:focus:ring-2 [&_.input-field]:focus:ring-blue-500 ' +
  '[&_.input-field]:disabled:opacity-50 ' +
  '[&_button]:rounded-md [&_button]:border [&_button]:border-gray-300 [&_button]:bg-white [&_button]:px-3 [&_button]:py-1.5 ' +
  '[&_button]:text-xs [&_button]:font-medium [&_button]:text-gray-700 [&_button]:transition-colors ' +
  '[&_button:hover]:bg-gray-100 [&_button]:disabled:opacity-50 ' +
  '[&_.error-messages]:mt-1 [&_.error-messages]:text-xs [&_.error-messages]:text-red-600 ' +
  '[&_.prefix-item]:-mt-2 [&_.prefix-item]:text-sm [&_.prefix-item]:text-gray-500 ' +
  '[&_.helper-item]:-mt-2 [&_.helper-item]:text-xs [&_.helper-item]:text-gray-500';

const items = [
  { id: 'first', type: 'input' as const, content: 'First name', placeholder: 'Ada', required: true },
  { id: 'last', type: 'input' as const, content: 'Last name', placeholder: 'Lovelace', required: true },
  { id: 'email', type: 'input' as const, content: 'Email', inputType: 'email', placeholder: 'ada@example.com' },
];

export default function InputGroupPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">InputGroup</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A declarative form-field group backed by the headless{' '}
          <code className="font-mono text-sm">useInputGroup</code> hook. Describe
          your fields as an <code className="font-mono text-sm">items</code> array
          (inputs, labels, helpers, prefixes/suffixes, actions) and it manages
          per-item values, focus, layout, and validation — plus a built-in
          Validate / Reset / Clear action row. Ships no styles; theme it via
          descendant selectors on{' '}
          <code className="font-mono text-sm">.input-group</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A vertical group of three inputs with labels. Use the action row to
          validate, reset, or clear.
        </p>
        <Demo
          code={`<InputGroup
  layout="vertical"
  items={[
    { id: 'first', type: 'input', content: 'First name', required: true },
    { id: 'last', type: 'input', content: 'Last name', required: true },
    { id: 'email', type: 'input', content: 'Email', inputType: 'email' },
  ]}
/>`}
        >
          <div className="w-full max-w-sm">
            <InputGroup className={groupBase} layout="vertical" items={items} />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inline layout &amp; validation</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>layout="inline"</code> places fields on one row;{' '}
          <code>validationRules</code> drive the error messaging on Validate.
        </p>
        <Demo
          code={`<InputGroup
  layout="inline"
  items={[
    { id: 'user', type: 'input', content: 'Username', placeholder: 'ada' },
    { id: 'pass', type: 'input', content: 'Password', inputType: 'password' },
  ]}
  validationRules={[{
    name: 'required', itemId: 'user',
    validate: (v) => v.trim().length > 0,
    message: 'Required'
  }]}
/>`}
        >
          <div className="w-full max-w-lg">
            <InputGroup
              className={groupBase}
              layout="inline"
              items={[
                { id: 'user', type: 'input' as const, content: 'Username', placeholder: 'ada' },
                { id: 'pass', type: 'input' as const, content: 'Password', inputType: 'password', placeholder: '••••••' },
              ]}
              validationRules={[{
                name: 'required',
                itemId: 'user',
                validate: (v: string) => v.trim().length > 0,
                message: 'Username is required',
              }]}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With helper &amp; prefix items</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mix non-input item types (<code>helper</code>, <code>prefix</code>,{' '}
          <code>suffix</code>) into the same group.
        </p>
        <Demo
          code={`<InputGroup
  items={[
    { id: 'name', type: 'input', content: 'Workspace', placeholder: 'my-team' },
    { id: 'pfx', type: 'prefix', content: 'reui.app/' },
    { id: 'hlp', type: 'helper', content: 'Lowercase letters and dashes.' },
  ]}
/>`}
        >
          <div className="w-full max-w-sm">
            <InputGroup
              className={groupBase}
              items={[
                { id: 'name', type: 'input' as const, content: 'Workspace', placeholder: 'my-team' },
                { id: 'pfx', type: 'prefix' as const, content: 'reui.app/' },
                { id: 'hlp', type: 'helper' as const, content: 'Lowercase letters and dashes.' },
              ]}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'InputGroupItem[]',
              default: '— (required)',
              description: 'Fields to render: { id, type, content, placeholder?, inputType?, required?, disabled? }.',
            },
            {
              name: 'layout',
              type: "'horizontal' | 'vertical' | 'stacked' | 'inline'",
              default: "'vertical'",
              description: 'Arrangement of the items.',
            },
            {
              name: 'defaultValues',
              type: 'Record<string, string>',
              default: '{}',
              description: 'Initial values keyed by item id.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size variant applied to all items.',
            },
            {
              name: 'validationRules',
              type: 'InputGroupValidationRule[]',
              default: '[]',
              description: 'Rules: { name, itemId, validate(value, all), message }. itemId "group" = group-level.',
            },
            {
              name: 'validateOnChange / validateOnBlur',
              type: 'boolean',
              default: 'true / true',
              description: 'When to run validation automatically.',
            },
            {
              name: 'onValuesChange',
              type: '(values, itemId) => void',
              default: '—',
              description: 'Called on every value change with all values.',
            },
            {
              name: 'showErrors / showLabels / showHelpers / showBorders',
              type: 'boolean',
              default: 'true / true / true / true',
              description: 'Toggle built-in affordances.',
            },
          ]}
        />
      </section>
    </div>
  );
}
