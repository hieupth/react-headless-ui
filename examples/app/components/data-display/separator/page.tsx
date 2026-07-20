'use client';

import { Separator } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Separator renders an <hr> (or a <div> when it has content) with the proper
// role and aria-orientation. Headless on CSS — theme the rule through
// className. A decorative separator omits the semantic role.
export default function SeparatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Separator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A visual divider backed by the headless{' '}
          <code className="font-mono text-sm">useSeparator</code> hook. It
          renders an <code>&lt;hr&gt;</code> (or a <code>&lt;div&gt;</code> when
          given content) with the correct <code>separator</code> role and{' '}
          <code>aria-orientation</code>. <code>decorative</code> separators
          carry no semantic role; horizontal and vertical orientations are
          supported.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal rule</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The default renders a horizontal divider between blocks.
        </p>
        <Demo
          code={`<p>Above</p>
<Separator />
<p>Below</p>`}
        >
          <div className="w-64 text-sm">
            <p>Above</p>
            <Separator className="my-2 border-t border-gray-300 dark:border-gray-600" />
            <p>Below</p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With content</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass children to render a labeled divider (the element becomes a{' '}
          <code>div</code>).
        </p>
        <Demo
          code={`<Separator>OR</Separator>`}
        >
          <div className="w-64">
            <Separator className="flex items-center text-xs text-gray-500 before:flex-1 before:border-t before:border-gray-300 dark:before:border-gray-600 after:flex-1 after:border-t after:border-gray-300 dark:after:border-gray-600 [&:not(:empty)]:gap-2">
              OR
            </Separator>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Vertical &amp; decorative</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>orientation="vertical"</code> divides adjacent items;{' '}
          <code>decorative</code> hides it from assistive tech.
        </p>
        <Demo
          code={`<div className="flex items-center gap-3">
  <span>Left</span>
  <Separator orientation="vertical" decorative />
  <span>Right</span>
</div>`}
        >
          <div className="flex items-center gap-3 text-sm">
            <span>Left</span>
            <Separator orientation="vertical" decorative className="self-stretch border-l border-gray-300 dark:border-gray-600" />
            <span>Right</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Divider direction (sets aria-orientation).' },
            { name: 'decorative', type: 'boolean', default: 'false', description: 'Omit the semantic role for purely visual dividers.' },
            { name: 'children', type: 'ReactNode', default: '—', description: 'Optional label; switches the element to a content divider.' },
            { name: 'className', type: 'string', default: '—', description: 'Additional classes (the hook selects the element tag).' },
          ]}
        />
      </section>
    </div>
  );
}
