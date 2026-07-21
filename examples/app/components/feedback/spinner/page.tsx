'use client';

import { Spinner } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Spinner is headless in the behavior/a11y sense; the default renderer emits
// empty class strings. Tailwind below styles a plain spinning ring so the
// preview conveys the component without shipping CSS from the library.
function Ring({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]' }[size];
  return (
    <Spinner
      active
      variant="spin"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      showLabel={false}
      className={`inline-block animate-spin rounded-full border-gray-200 border-t-blue-600 ${dim}`}
    />
  );
}

export default function SpinnerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Spinner</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A loading indicator backed by the headless{' '}
          <code className="font-mono text-sm">useSpinner</code> hook. It manages
          active state, emits <code className="font-mono text-sm">aria-busy</code>{' '}
          and a status label, and offers six animation variants —{' '}
          <code>spin</code>, <code>pulse</code>, <code>bounce</code>,{' '}
          <code>dots</code>, <code>bars</code>, and <code>ring</code>. Companions{' '}
          <code className="font-mono text-sm">SimpleSpinner</code>,{' '}
          <code className="font-mono text-sm">DotsSpinner</code>, and{' '}
          <code className="font-mono text-sm">BarsSpinner</code> ship preset
          looks. The library ships no CSS — apply your own animation.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Eight density steps from <code>xs</code> to <code>4xl</code>.
        </p>
        <Demo
          code={`const dim = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-9 w-9 border-[3px]' };

<Spinner active variant="spin" size="sm" showLabel={false}
  className={\`inline-block animate-spin rounded-full border-gray-200 border-t-blue-600 \${dim.sm}\`} />
<Spinner active variant="spin" size="md" showLabel={false}
  className={\`inline-block animate-spin rounded-full border-gray-200 border-t-blue-600 \${dim.md}\`} />
<Spinner active variant="spin" size="lg" showLabel={false}
  className={\`inline-block animate-spin rounded-full border-gray-200 border-t-blue-600 \${dim.lg}\`} />`}
        >
          <div className="flex items-center justify-center gap-6 text-blue-600">
            <Ring size="sm" />
            <Ring size="md" />
            <Ring size="lg" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants &amp; label</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Switch the animation with <code>variant</code>; control speed via{' '}
          <code>speed</code> (<code>slow</code> / <code>normal</code> /{' '}
          <code>fast</code>). Set <code>showLabel</code> to announce a status.
        </p>
        <Demo
          code={`{/* dots — staggered bounce */}
<div className="flex items-center gap-1">
  {[0, 0.15, 0.3, 0.45].map((d, i) => (
    <span key={i}
      className="h-5 w-1.5 animate-bounce rounded-full bg-blue-600"
      style={{ animationDelay: \`\${d}s\` }} />
  ))}
</div>
<span className="text-xs text-gray-500">Loading data</span>`}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-blue-600">
            <div className="flex items-center gap-1">
              {[0, 0.15, 0.3, 0.45].map((d, i) => (
                <span
                  key={i}
                  className="h-5 w-1.5 animate-bounce rounded-full bg-blue-600"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">Loading data</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'active',
              type: 'boolean',
              default: 'false',
              description: 'Whether the spinner is currently animating.',
            },
            {
              name: 'variant',
              type: "'pulse' | 'spin' | 'bounce' | 'dots' | 'bars' | 'ring'",
              default: "'spin'",
              description: 'Animation style.',
            },
            {
              name: 'size',
              type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
              default: "'md'",
              description: 'Spinner dimensions.',
            },
            {
              name: 'speed',
              type: "'slow' | 'normal' | 'fast'",
              default: "'normal'",
              description: 'Animation speed.',
            },
            {
              name: 'color',
              type: "'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray'",
              default: "'primary'",
              description: 'Color variant.',
            },
            {
              name: 'label / showLabel',
              type: 'string / boolean',
              default: "— / false",
              description: 'Accessible status label and whether to render it visibly.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the spinner (aria-disabled).',
            },
            {
              name: 'renderSpinner',
              type: '(props: SpinnerElementRenderProps) => ReactNode',
              default: '—',
              description: 'Custom renderer for the animated element itself.',
            },
          ]}
        />
      </section>
    </div>
  );
}
