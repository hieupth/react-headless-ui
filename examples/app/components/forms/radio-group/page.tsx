'use client';

import { useState } from 'react';
import { RadioGroup } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// RadioGroup is headless: useRadioGroup handles roving-tabindex arrow-key
// navigation, single selection, and ARIA radiogroup/radio roles. Theme the
// emitted .radio-group / .radio-option / .radio-button classes with Tailwind.
const groupBase =
  'flex gap-4 ' +
  '[&_.radio-option]:flex [&_.radio-option]:items-center [&_.radio-option]:gap-2 ' +
  '[&_.radio-option]:cursor-pointer [&_.radio-option]:text-sm [&_.radio-option]:text-gray-700 dark:[&_.radio-option]:text-gray-200 ' +
  '[&_.radio-button]:h-5 [&_.radio-button]:w-5 [&_.radio-button]:rounded-full ' +
  '[&_.radio-button]:border-2 [&_.radio-button]:border-gray-300 dark:[&_.radio-button]:border-gray-600 [&_.radio-button]:bg-white dark:[&_.radio-button]:bg-gray-900 ' +
  '[&_.radio-button]:flex [&_.radio-button]:items-center [&_.radio-button]:justify-center ' +
  '[&_.radio-button]:transition-colors ' +
  '[&_.radio-button]:[&>div]:h-2.5 [&_.radio-button]:[&>div]:w-2.5 [&_.radio-button]:[&>div]:rounded-full ' +
  '[&_.radio-button]:[&>div]:bg-blue-600';

const verticalBase = groupBase.replace('flex gap-4', 'flex flex-col gap-3');

export default function RadioGroupPage() {
  const [plan, setPlan] = useState('pro');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">RadioGroup</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A single-selection radio group backed by the headless{' '}
          <code className="font-mono text-sm">useRadioGroup</code> hook. It
          implements roving-tabindex + arrow-key navigation and proper{' '}
          <code className="font-mono text-sm">radiogroup</code>/{' '}
          <code className="font-mono text-sm">radio</code> roles. Offers a
          compound API (<code className="font-mono text-sm">&lt;RadioGroup.Item&gt;</code>){' '}
          or an <code className="font-mono text-sm">options</code> array. Ships no styles.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Declare options as an array; labels come from <code>optionLabels</code>{' '}
          (falling back to the value). The component also supports a compound{' '}
          <code>&lt;RadioGroup.Item&gt;</code> children API at runtime.
        </p>
        <Demo
          code={`<RadioGroup
  defaultValue="pro"
  orientation="horizontal"
  className="flex gap-4 [&_.radio-option]:flex [&_.radio-option]:items-center [&_.radio-option]:gap-2 [&_.radio-option]:cursor-pointer [&_.radio-option]:text-sm [&_.radio-option]:text-gray-700 dark:[&_.radio-option]:text-gray-200 [&_.radio-button]:h-5 [&_.radio-button]:w-5 [&_.radio-button]:rounded-full [&_.radio-button]:border-2 [&_.radio-button]:border-gray-300 dark:[&_.radio-button]:border-gray-600 [&_.radio-button]:bg-white dark:[&_.radio-button]:bg-gray-900 [&_.radio-button]:flex [&_.radio-button]:items-center [&_.radio-button]:justify-center [&_.radio-button]:transition-colors [&_.radio-button]:[&>div]:h-2.5 [&_.radio-button]:[&>div]:w-2.5 [&_.radio-button]:[&>div]:rounded-full [&_.radio-button]:[&>div]:bg-blue-600"
  options={['free', 'pro', 'team']}
  optionLabels={{ free: 'Free', pro: 'Pro', team: 'Team' }}
/>`}
        >
          <RadioGroup
            className={groupBase}
            defaultValue="pro"
            orientation="horizontal"
            options={['free', 'pro', 'team']}
            optionLabels={{ free: 'Free', pro: 'Pro', team: 'Team' }}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Vertical with descriptions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>orientation="vertical"</code> stacks options;{' '}
          <code>optionDescriptions</code> adds secondary text.
        </p>
        <Demo
          code={`<RadioGroup
  orientation="vertical"
  className="flex flex-col gap-3 [&_.radio-option]:flex [&_.radio-option]:items-center [&_.radio-option]:gap-2 [&_.radio-option]:cursor-pointer [&_.radio-option]:text-sm [&_.radio-option]:text-gray-700 dark:[&_.radio-option]:text-gray-200 [&_.radio-button]:h-5 [&_.radio-button]:w-5 [&_.radio-button]:rounded-full [&_.radio-button]:border-2 [&_.radio-button]:border-gray-300 dark:[&_.radio-button]:border-gray-600 [&_.radio-button]:bg-white dark:[&_.radio-button]:bg-gray-900 [&_.radio-button]:flex [&_.radio-button]:items-center [&_.radio-button]:justify-center [&_.radio-button]:transition-colors [&_.radio-button]:[&>div]:h-2.5 [&_.radio-button]:[&>div]:w-2.5 [&_.radio-button]:[&>div]:rounded-full [&_.radio-button]:[&>div]:bg-blue-600"
  options={['standard', 'express', 'overnight']}
  optionLabels={{ standard: 'Standard', express: 'Express', overnight: 'Overnight' }}
  optionDescriptions={{ standard: '3–5 days', express: '1–2 days', overnight: 'Next morning' }}
/>`}
        >
          <RadioGroup
            className={verticalBase}
            orientation="vertical"
            options={['standard', 'express', 'overnight']}
            optionLabels={{ standard: 'Standard', express: 'Express', overnight: 'Overnight' }}
            optionDescriptions={{ standard: '3–5 days', express: '1–2 days', overnight: 'Next morning' }}
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive selection with <code>value</code> / <code>onValueChange</code>.
        </p>
        <Demo
          code={`const [plan, setPlan] = useState('pro');
<RadioGroup
  value={plan}
  onValueChange={setPlan}
  className="flex gap-4 [&_.radio-option]:flex [&_.radio-option]:items-center [&_.radio-option]:gap-2 [&_.radio-option]:cursor-pointer [&_.radio-option]:text-sm [&_.radio-option]:text-gray-700 dark:[&_.radio-option]:text-gray-200 [&_.radio-button]:h-5 [&_.radio-button]:w-5 [&_.radio-button]:rounded-full [&_.radio-button]:border-2 [&_.radio-button]:border-gray-300 dark:[&_.radio-button]:border-gray-600 [&_.radio-button]:bg-white dark:[&_.radio-button]:bg-gray-900 [&_.radio-button]:flex [&_.radio-button]:items-center [&_.radio-button]:justify-center [&_.radio-button]:transition-colors [&_.radio-button]:[&>div]:h-2.5 [&_.radio-button]:[&>div]:w-2.5 [&_.radio-button]:[&>div]:rounded-full [&_.radio-button]:[&>div]:bg-blue-600"
  options={['free', 'pro']}
  optionLabels={{ free: 'Free', pro: 'Pro' }}
/>`}
        >
          <div className="flex flex-col items-center gap-2">
            <RadioGroup
              className={groupBase}
              value={plan}
              onValueChange={setPlan}
              options={['free', 'pro']}
              optionLabels={{ free: 'Free', pro: 'Pro' }}
            />
            <p className="text-xs text-gray-500">Selected: {plan}</p>
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
              description: 'Controlled or uncontrolled selected value.',
            },
            {
              name: 'onValueChange',
              type: '(value: string) => void',
              default: '—',
              description: 'Called when the selection changes.',
            },
            {
              name: 'options',
              type: 'string[]',
              default: '— (required)',
              description: 'Option values. Labels fall back to the value.',
            },
            {
              name: 'children',
              type: 'ReactNode',
              default: '—',
              description: 'Optional <RadioGroup.Item> compound options (runtime API).',
            },
            {
              name: 'optionLabels / optionDescriptions',
              type: 'Record<string, string>',
              default: '—',
              description: 'Map option values to display labels / descriptions.',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'vertical'",
              description: 'Layout direction of the options.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size variant.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the entire group.',
            },
            {
              name: 'renderOption',
              type: '(value, index, isSelected, isFocused) => ReactNode',
              default: '—',
              description: 'Custom per-option renderer.',
            },
          ]}
        />
      </section>
    </div>
  );
}
