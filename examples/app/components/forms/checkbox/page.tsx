'use client';

import { useState } from 'react';
import { Checkbox } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Checkbox is headless: useCheckbox provides tri-state logic, keyboard
// activation, and ARIA wiring. The component renders a visually-hidden native
// input plus a .checkbox-visual box. Theme that box (and the .checkbox-wrapper
// layout) with Tailwind by targeting the emitted classes.
const visualBase =
  '[&_.checkbox-visual]:h-5 [&_.checkbox-visual]:w-5 [&_.checkbox-visual]:rounded ' +
  '[&_.checkbox-visual]:border-2 [&_.checkbox-visual]:border-gray-300 ' +
  '[&_.checkbox-visual]:bg-white dark:[&_.checkbox-visual]:bg-gray-900 ' +
  '[&_.checkbox-visual]:dark:border-gray-600 [&_.checkbox-visual]:flex ' +
  '[&_.checkbox-visual]:items-center [&_.checkbox-visual]:justify-center ' +
  '[&_.checkbox-visual]:text-white [&_.checkbox-visual]:transition-colors ' +
  '[&_.checkbox-checked]:border-blue-600 [&_.checkbox-checked]:bg-blue-600 ' +
  '[&_.checkbox-indeterminate]:border-blue-600 [&_.checkbox-indeterminate]:bg-blue-600 ' +
  '[&_.checkbox-label]:ml-2 [&_.checkbox-label]:text-sm [&_.checkbox-label]:text-gray-700 ' +
  'dark:[&_.checkbox-label]:text-gray-200 ' +
  '[&_.checkbox-icon]:h-4 [&_.checkbox-icon]:w-4 ' +
  'inline-flex items-center cursor-pointer select-none';

export default function CheckboxPage() {
  const [on, setOn] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Checkbox</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A tri-state checkbox backed by the headless{' '}
          <code className="font-mono text-sm">useCheckbox</code> hook. It supports
          checked / unchecked / indeterminate, keyboard toggling, and full ARIA
          semantics — with no styles baked in. The native input is visually
          hidden; theme the <code className="font-mono text-sm">.checkbox-visual</code>{' '}
          box with Tailwind via descendant selectors.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A labeled checkbox. Space toggles it; the label is also clickable.
        </p>
        <Demo code={`<Checkbox defaultChecked className="[&_.checkbox-visual]:h-5 [&_.checkbox-visual]:w-5 [&_.checkbox-visual]:rounded [&_.checkbox-visual]:border-2 [&_.checkbox-visual]:border-gray-300 [&_.checkbox-visual]:bg-white dark:[&_.checkbox-visual]:bg-gray-900 [&_.checkbox-visual]:dark:border-gray-600 [&_.checkbox-visual]:flex [&_.checkbox-visual]:items-center [&_.checkbox-visual]:justify-center [&_.checkbox-visual]:text-white [&_.checkbox-visual]:transition-colors [&_.checkbox-checked]:border-blue-600 [&_.checkbox-checked]:bg-blue-600 [&_.checkbox-indeterminate]:border-blue-600 [&_.checkbox-indeterminate]:bg-blue-600 [&_.checkbox-label]:ml-2 [&_.checkbox-label]:text-sm [&_.checkbox-label]:text-gray-700 dark:[&_.checkbox-label]:text-gray-200 [&_.checkbox-icon]:h-4 [&_.checkbox-icon]:w-4 inline-flex items-center cursor-pointer select-none">Accept terms</Checkbox>`}>
          <Checkbox className={visualBase} defaultChecked>Accept terms</Checkbox>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">States</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Unchecked, indeterminate (use <code>indeterminate</code>), and
          disabled. Pass custom icons via <code>checkedIcon</code> /{' '}
          <code>indeterminateIcon</code>.
        </p>
        <Demo
          code={`<Checkbox className="[&_.checkbox-visual]:h-5 [&_.checkbox-visual]:w-5 [&_.checkbox-visual]:rounded [&_.checkbox-visual]:border-2 [&_.checkbox-visual]:border-gray-300 [&_.checkbox-visual]:bg-white dark:[&_.checkbox-visual]:bg-gray-900 [&_.checkbox-visual]:dark:border-gray-600 [&_.checkbox-visual]:flex [&_.checkbox-visual]:items-center [&_.checkbox-visual]:justify-center [&_.checkbox-visual]:text-white [&_.checkbox-visual]:transition-colors [&_.checkbox-checked]:border-blue-600 [&_.checkbox-checked]:bg-blue-600 [&_.checkbox-indeterminate]:border-blue-600 [&_.checkbox-indeterminate]:bg-blue-600 [&_.checkbox-label]:ml-2 [&_.checkbox-label]:text-sm [&_.checkbox-label]:text-gray-700 dark:[&_.checkbox-label]:text-gray-200 [&_.checkbox-icon]:h-4 [&_.checkbox-icon]:w-4 inline-flex items-center cursor-pointer select-none">Unchecked</Checkbox>
<Checkbox indeterminate className="[&_.checkbox-visual]:h-5 [&_.checkbox-visual]:w-5 [&_.checkbox-visual]:rounded [&_.checkbox-visual]:border-2 [&_.checkbox-visual]:border-gray-300 [&_.checkbox-visual]:bg-white dark:[&_.checkbox-visual]:bg-gray-900 [&_.checkbox-visual]:dark:border-gray-600 [&_.checkbox-visual]:flex [&_.checkbox-visual]:items-center [&_.checkbox-visual]:justify-center [&_.checkbox-visual]:text-white [&_.checkbox-visual]:transition-colors [&_.checkbox-checked]:border-blue-600 [&_.checkbox-checked]:bg-blue-600 [&_.checkbox-indeterminate]:border-blue-600 [&_.checkbox-indeterminate]:bg-blue-600 [&_.checkbox-label]:ml-2 [&_.checkbox-label]:text-sm [&_.checkbox-label]:text-gray-700 dark:[&_.checkbox-label]:text-gray-200 [&_.checkbox-icon]:h-4 [&_.checkbox-icon]:w-4 inline-flex items-center cursor-pointer select-none">Indeterminate</Checkbox>
<Checkbox checked disabled className="[&_.checkbox-visual]:h-5 [&_.checkbox-visual]:w-5 [&_.checkbox-visual]:rounded [&_.checkbox-visual]:border-2 [&_.checkbox-visual]:border-gray-300 [&_.checkbox-visual]:bg-white dark:[&_.checkbox-visual]:bg-gray-900 [&_.checkbox-visual]:dark:border-gray-600 [&_.checkbox-visual]:flex [&_.checkbox-visual]:items-center [&_.checkbox-visual]:justify-center [&_.checkbox-visual]:text-white [&_.checkbox-visual]:transition-colors [&_.checkbox-checked]:border-blue-600 [&_.checkbox-checked]:bg-blue-600 [&_.checkbox-indeterminate]:border-blue-600 [&_.checkbox-indeterminate]:bg-blue-600 [&_.checkbox-label]:ml-2 [&_.checkbox-label]:text-sm [&_.checkbox-label]:text-gray-700 dark:[&_.checkbox-label]:text-gray-200 [&_.checkbox-icon]:h-4 [&_.checkbox-icon]:w-4 inline-flex items-center cursor-pointer select-none">Disabled</Checkbox>`}
        >
          <div className="flex flex-col items-start gap-3">
            <Checkbox className={visualBase}>Unchecked</Checkbox>
            <Checkbox className={visualBase} indeterminate>Indeterminate</Checkbox>
            <Checkbox className={visualBase} checked disabled>Disabled</Checkbox>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive state with <code>checked</code> /{' '}
          <code>onCheckedChange</code>.
        </p>
        <Demo
          code={`const [on, setOn] = useState(false);
<Checkbox checked={on} onCheckedChange={setOn} className="[&_.checkbox-visual]:h-5 [&_.checkbox-visual]:w-5 [&_.checkbox-visual]:rounded [&_.checkbox-visual]:border-2 [&_.checkbox-visual]:border-gray-300 [&_.checkbox-visual]:bg-white dark:[&_.checkbox-visual]:bg-gray-900 [&_.checkbox-visual]:dark:border-gray-600 [&_.checkbox-visual]:flex [&_.checkbox-visual]:items-center [&_.checkbox-visual]:justify-center [&_.checkbox-visual]:text-white [&_.checkbox-visual]:transition-colors [&_.checkbox-checked]:border-blue-600 [&_.checkbox-checked]:bg-blue-600 [&_.checkbox-indeterminate]:border-blue-600 [&_.checkbox-indeterminate]:bg-blue-600 [&_.checkbox-label]:ml-2 [&_.checkbox-label]:text-sm [&_.checkbox-label]:text-gray-700 dark:[&_.checkbox-label]:text-gray-200 [&_.checkbox-icon]:h-4 [&_.checkbox-icon]:w-4 inline-flex items-center cursor-pointer select-none">Email updates</Checkbox>`}
        >
          <Checkbox
            className={visualBase}
            checked={on}
            onCheckedChange={(c) => setOn(c === true)}
          >
            Email updates
          </Checkbox>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'checked',
              type: 'boolean | null',
              default: '—',
              description: 'Controlled state. null maps to indeterminate.',
            },
            {
              name: 'defaultChecked',
              type: 'boolean | null',
              default: 'false',
              description: 'Initial uncontrolled state.',
            },
            {
              name: 'indeterminate',
              type: 'boolean',
              default: 'false',
              description: 'Force the indeterminate (mixed) visual state.',
            },
            {
              name: 'onCheckedChange',
              type: '(checked: CheckboxValue) => void',
              default: '—',
              description: 'Called with the new state (boolean | "indeterminate").',
            },
            {
              name: 'disabled / required',
              type: 'boolean',
              default: 'false',
              description: 'Native states reflected to ARIA.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              default: '—',
              description: 'Label text rendered beside the box.',
            },
            {
              name: 'checkedIcon / uncheckedIcon / indeterminateIcon',
              type: 'ReactNode',
              default: '—',
              description: 'Custom glyphs for each visual state.',
            },
            {
              name: 'className',
              type: 'string',
              default: '—',
              description: 'Applied to the .checkbox-wrapper container.',
            },
          ]}
        />
      </section>
    </div>
  );
}
