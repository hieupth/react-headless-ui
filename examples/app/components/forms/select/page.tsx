'use client';

import { useState } from 'react';
import { Select, type SelectOption } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Select is headless: useSelect handles open/close, keyboard navigation,
// search, and ARIA combobox/listbox roles. The dropdown is portaled to
// document.body, so we theme it via the renderListbox render prop rather than
// descendant selectors.
const options: SelectOption[] = [
  { key: 'apple', label: 'Apple', value: 'apple' },
  { key: 'banana', label: 'Banana', value: 'banana' },
  { key: 'cherry', label: 'Cherry', value: 'cherry' },
  { key: 'date', label: 'Date', value: 'date' },
];

function TailwindSelect({ options: opts = options, ...rest }: { options?: SelectOption[] } & Record<string, unknown>) {
  return (
    <Select
      options={opts}
      className="w-full max-w-xs"
      renderTrigger={(p) => (
        <button
          ref={p.triggerRef}
          type="button"
          className={`inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm ` +
            `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ` +
            `${p.className} ${p.className.includes('disabled') ? 'opacity-50' : ''}`}
          onClick={p.handleTriggerClick}
          onKeyDown={p.handleKeyDown}
          {...p.triggerAttributes}
        >
          <span className={p.selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {p.selectedOption ? p.selectedOption.label : 'Select an option'}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${p.open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      renderListbox={(p) => {
        if (!p.open) return null;
        return (
          <div
            className="z-50 mt-1 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            style={{ minWidth: p.triggerRef.current?.offsetWidth || 200, maxHeight: 240 }}
          >
            <ul ref={p.listboxRef} {...p.listboxAttributes} onKeyDown={p.handleKeyDown}>
              {p.filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-400">No options</li>
              ) : (
                p.filteredOptions.map((option, index) => {
                  const isSelected = option.value === p.selectedValue;
                  const isHighlighted = index === p.highlightedIndex;
                  return (
                    <li
                      key={option.key}
                      className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ` +
                        `${isHighlighted ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} `}
                      onClick={() => p.selectOption(option.value)}
                      onMouseEnter={() => p.highlightOption(index)}
                      {...p.getOptionAttributes(option, index)}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        );
      }}
      {...rest}
    />
  );
}

export default function SelectPage() {
  const [fruit, setFruit] = useState('apple');

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Select</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A dropdown select backed by the headless{' '}
          <code className="font-mono text-sm">useSelect</code> hook. It handles
          open/close, roving arrow-key navigation, optional search, single
          selection, and full ARIA{' '}
          <code className="font-mono text-sm">combobox</code> /{' '}
          <code className="font-mono text-sm">listbox</code> roles. The listbox is
          portaled to <code className="font-mono text-sm">document.body</code>, so
          theme the trigger and dropdown via the{' '}
          <code className="font-mono text-sm">renderTrigger</code> /{' '}
          <code className="font-mono text-sm">renderListbox</code> render props.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A controlled select. Click the trigger, then arrow-key or click an
          option.
        </p>
        <Demo code={`<Select options={options} defaultValue="apple" />`}>
          <TailwindSelect defaultValue="apple" />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive selection with <code>value</code> / <code>onValueChange</code>.
        </p>
        <Demo
          code={`<Select value={fruit} onValueChange={setFruit} options={options} />`}
        >
          <div className="flex flex-col items-center gap-2">
            <TailwindSelect value={fruit} onValueChange={(v: string) => setFruit(v)} />
            <p className="text-xs text-gray-500">Selected: {fruit}</p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Searchable &amp; clearable</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>searchable</code> adds a filter input;{' '}
          <code>allowClear</code> adds a clear affordance.
        </p>
        <Demo code={`<Select searchable allowClear options={options} />`}>
          <TailwindSelect searchable allowClear />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'options',
              type: 'SelectOption[]',
              default: '[]',
              description: 'Options: { key, label, value, disabled?, icon?, description? }.',
            },
            {
              name: 'value / defaultValue',
              type: 'any',
              default: '—',
              description: 'Controlled or uncontrolled selected value.',
            },
            {
              name: 'onValueChange',
              type: '(value: any) => void',
              default: '—',
              description: 'Called when the selection changes.',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: "'Select an option'",
              description: 'Text shown when nothing is selected.',
            },
            {
              name: 'searchable',
              type: 'boolean',
              default: 'false',
              description: 'Show a filter input at the top of the listbox.',
            },
            {
              name: 'allowClear',
              type: 'boolean',
              default: 'false',
              description: 'Show a clear-selection affordance.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the trigger; reflected to ARIA.',
            },
            {
              name: 'size / variant',
              type: "'sm' | 'md' | 'lg' / 'default' | 'outlined' | 'filled'",
              default: "'md' / 'default'",
              description: 'Size and variant hooks.',
            },
            {
              name: 'renderTrigger / renderListbox / renderOption',
              type: '(props) => ReactNode',
              default: '—',
              description: 'Custom renderers for trigger, dropdown, and each option.',
            },
          ]}
        />
      </section>
    </div>
  );
}
