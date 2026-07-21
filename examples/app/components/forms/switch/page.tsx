'use client';

import { useState } from 'react';
import { Switch } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Switch is headless: useSwitch provides checked state, keyboard activation,
// and ARIA (role="switch"). The default render ships empty classes, so the
// cleanest styling path is the `render` escape hatch, which hands back full
// state + handlers. We draw a Tailwind track + thumb from that.
const sizeMap = {
  sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', on: 'translate-x-4', off: 'translate-x-0.5' },
  md: { track: 'h-6 w-11', thumb: 'h-5 w-5', on: 'translate-x-5', off: 'translate-x-0.5' },
  lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', on: 'translate-x-7', off: 'translate-x-1' },
} as const;

function TailwindSwitch({
  size = 'md',
  label,
  labelPosition = 'right',
}: {
  size?: keyof typeof sizeMap;
  label?: string;
  labelPosition?: 'left' | 'right';
}) {
  return (
    <Switch
      size={size}
      showLabel={!!label}
      label={label}
      labelPosition={labelPosition}
      render={(p) => {
        const s = sizeMap[p.disabled ? 'md' : size];
        const track = (
          <button
            ref={p.switchRef}
            type="button"
            className={`relative inline-flex ${s.track} items-center rounded-full transition-colors ` +
              `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ` +
              `${p.checked ? 'bg-blue-600' : 'bg-gray-300'} ${p.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={p.onClick}
            onKeyDown={p.onKeyDown}
            onFocus={p.onFocus}
            onBlur={p.onBlur}
            onMouseEnter={p.onMouseEnter}
            onMouseLeave={p.onMouseLeave}
            {...p.switchAttributes}
            {...p.formAttributes}
            {...p.ariaProps}
          >
            <span
              className={`inline-block ${s.thumb} transform rounded-full bg-white shadow transition-transform ${p.checked ? s.on : s.off}`}
            />
          </button>
        );
        if (!label) return track;
        return (
          <label className={`inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 ${labelPosition === 'left' ? 'flex-row-reverse' : ''}`}>
            {track}
            <span>{label}</span>
          </label>
        );
      }}
    />
  );
}

export default function SwitchPage() {
  const [on, setOn] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Switch</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A toggle switch backed by the headless{' '}
          <code className="font-mono text-sm">useSwitch</code> hook. It provides
          checked state, Space/Enter toggling, mouse/hover tracking, and{' '}
          <code className="font-mono text-sm">role="switch"</code> semantics.
          The default render ships empty classes, so theme it via the{' '}
          <code className="font-mono text-sm">render</code> prop (as below).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes &amp; states</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>sm</code> / <code>md</code> / <code>lg</code>, plus default-checked
          and disabled.
        </p>
        <Demo
          code={`<Switch size="sm" defaultChecked render={(p) => (
  <button ref={p.switchRef} type="button" className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 \${p.checked ? 'bg-blue-600' : 'bg-gray-300'}\`} {...p.ariaProps}>
    <span className={\`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform \${p.checked ? 'translate-x-4' : 'translate-x-0.5'}\`} />
  </button>
)} />
<Switch size="md" defaultChecked render={(p) => (
  <button ref={p.switchRef} type="button" className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 \${p.checked ? 'bg-blue-600' : 'bg-gray-300'}\`} {...p.ariaProps}>
    <span className={\`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform \${p.checked ? 'translate-x-5' : 'translate-x-0.5'}\`} />
  </button>
)} />
<Switch size="lg" disabled render={(p) => (
  <button ref={p.switchRef} type="button" className={\`relative inline-flex h-7 w-14 items-center rounded-full transition-colors opacity-50 cursor-not-allowed focus:outline-none \${p.checked ? 'bg-blue-600' : 'bg-gray-300'}\`} {...p.ariaProps}>
    <span className={\`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform \${p.checked ? 'translate-x-7' : 'translate-x-1'}\`} />
  </button>
)} />`}
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <TailwindSwitch size="sm" />
            <TailwindSwitch size="md" />
            <TailwindSwitch size="lg" />
            <TailwindSwitch size="md" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Labeled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>label</code> + <code>showLabel</code> render an accessible name;
          <code> labelPosition</code> places it left or right.
        </p>
        <Demo
          code={`<Switch label="Airplane mode" showLabel labelPosition="left" render={(p) => (
  <label className="inline-flex flex-row-reverse items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
    <button ref={p.switchRef} type="button" className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 \${p.checked ? 'bg-blue-600' : 'bg-gray-300'}\`} {...p.ariaProps}>
      <span className={\`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform \${p.checked ? 'translate-x-5' : 'translate-x-0.5'}\`} />
    </button>
    <span>Airplane mode</span>
  </label>
)} />`}
        >
          <TailwindSwitch label="Airplane mode" labelPosition="left" />
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
<Switch checked={on} onCheckedChange={setOn} render={(p) => (
  <button ref={p.switchRef} type="button" className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 \${p.checked ? 'bg-blue-600' : 'bg-gray-300'}\`} onClick={p.onClick} {...p.switchAttributes} {...p.ariaProps}>
    <span className={\`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform \${p.checked ? 'translate-x-5' : 'translate-x-0.5'}\`} />
  </button>
)} />`}
        >
          <div className="flex flex-col items-center gap-2">
            <Switch
              checked={on}
              onCheckedChange={setOn}
              render={(p) => (
                <button
                  ref={p.switchRef}
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ` +
                    `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ` +
                    `${p.checked ? 'bg-blue-600' : 'bg-gray-300'}`}
                  onClick={p.onClick}
                  onKeyDown={p.onKeyDown}
                  onFocus={p.onFocus}
                  onBlur={p.onBlur}
                  {...p.switchAttributes}
                  {...p.formAttributes}
                  {...p.ariaProps}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${p.checked ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              )}
            />
            <p className="text-xs text-gray-500">{on ? 'On' : 'Off'}</p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'checked / defaultChecked',
              type: 'boolean',
              default: 'false',
              description: 'Controlled or uncontrolled checked state.',
            },
            {
              name: 'onCheckedChange',
              type: '(checked: boolean) => void',
              default: '—',
              description: 'Called with the new checked state.',
            },
            {
              name: 'disabled / readOnly',
              type: 'boolean',
              default: 'false',
              description: 'Disables interaction; reflected to ARIA.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size variant.',
            },
            {
              name: 'variant',
              type: "'default' | 'outline' | 'solid'",
              default: "'default'",
              description: 'Visual variant hook.',
            },
            {
              name: 'label / showLabel / labelPosition',
              type: 'string / boolean / "left" | "right"',
              default: '— / false / "right"',
              description: 'Accessible label and its placement.',
            },
            {
              name: 'animated',
              type: 'boolean',
              default: 'true',
              description: 'Enable transition classes.',
            },
            {
              name: 'render',
              type: '(props: SwitchRenderProps) => ReactElement',
              default: '—',
              description: 'Escape-hatch custom renderer (full state + handlers).',
            },
          ]}
        />
      </section>
    </div>
  );
}
