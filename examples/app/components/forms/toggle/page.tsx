'use client';

import { useState } from 'react';
import { Toggle, FormatToggle } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Toggle is headless: useToggle provides two-state (pressed) button behavior,
// aria-pressed wiring, and keyboard activation. The component spreads
// toggleProps onto a <button> with empty state classes, so theme it via
// descendant selectors on .toggle / .toggle-pressed.
const toggleBase =
  'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
  '[&_.toggle-content]:text-sm ' +
  '[&.toggle-outline]:border-gray-300 dark:[&.toggle-outline]:border-gray-600 [&.toggle-outline]:text-gray-700 dark:[&.toggle-outline]:text-gray-200 ' +
  '[&.toggle-outline.toggle-pressed]:border-blue-600 [&.toggle-outline.toggle-pressed]:bg-blue-600 [&.toggle-outline.toggle-pressed]:text-white ' +
  '[&.toggle-ghost]:border-transparent [&.toggle-ghost]:text-gray-700 dark:[&.toggle-ghost]:text-gray-200 [&.toggle-ghost.toggle-pressed]:bg-gray-900 [&.toggle-ghost.toggle-pressed]:text-white dark:[&.toggle-ghost.toggle-pressed]:bg-white dark:[&.toggle-ghost.toggle-pressed]:text-gray-900';

export default function TogglePage() {
  const [pressed, setPressed] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Toggle</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A two-state (pressed) button backed by the headless{' '}
          <code className="font-mono text-sm">useToggle</code> hook. It manages{' '}
          <code className="font-mono text-sm">aria-pressed</code>, keyboard
          activation, and swappable pressed/unpressed content and icons. Ships
          no styles — theme the emitted{' '}
          <code className="font-mono text-sm">.toggle</code> /{' '}
          <code className="font-mono text-sm">.toggle-pressed</code> classes with
          Tailwind. A <code className="font-mono text-sm">FormatToggle</code>{' '}
          variant ships ready-made bold/italic/underline glyphs.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A pressed/unpressed toggle. Click or press Space/Enter.
        </p>
        <Demo code={`<Toggle variant="outline" className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&_.toggle-content]:text-sm [&.toggle-outline]:border-gray-300 dark:[&.toggle-outline]:border-gray-600 [&.toggle-outline]:text-gray-700 dark:[&.toggle-outline]:text-gray-200 [&.toggle-outline.toggle-pressed]:border-blue-600 [&.toggle-outline.toggle-pressed]:bg-blue-600 [&.toggle-outline.toggle-pressed]:text-white [&.toggle-ghost]:border-transparent [&.toggle-ghost]:text-gray-700 dark:[&.toggle-ghost]:text-gray-200 [&.toggle-ghost.toggle-pressed]:bg-gray-900 [&.toggle-ghost.toggle-pressed]:text-white dark:[&.toggle-ghost.toggle-pressed]:bg-white dark:[&.toggle-ghost.toggle-pressed]:text-gray-900">Bookmark</Toggle>`}>
          <Toggle className={toggleBase} variant="outline">Bookmark</Toggle>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Swappable content</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>pressedChildren</code> / <code>unpressedChildren</code> swap
          content by state.
        </p>
        <Demo
          code={`<Toggle
  pressedChildren="Following ✓"
  unpressedChildren="Follow"
  variant="outline"
  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&_.toggle-content]:text-sm [&.toggle-outline]:border-gray-300 dark:[&.toggle-outline]:border-gray-600 [&.toggle-outline]:text-gray-700 dark:[&.toggle-outline]:text-gray-200 [&.toggle-outline.toggle-pressed]:border-blue-600 [&.toggle-outline.toggle-pressed]:bg-blue-600 [&.toggle-outline.toggle-pressed]:text-white [&.toggle-ghost]:border-transparent [&.toggle-ghost]:text-gray-700 dark:[&.toggle-ghost]:text-gray-200 [&.toggle-ghost.toggle-pressed]:bg-gray-900 [&.toggle-ghost.toggle-pressed]:text-white dark:[&.toggle-ghost.toggle-pressed]:bg-white dark:[&.toggle-ghost.toggle-pressed]:text-gray-900"
/>`}
        >
          <Toggle
            className={toggleBase}
            pressedChildren="Following ✓"
            unpressedChildren="Follow"
            variant="outline"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled &amp; format toggle</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive state with <code>pressed</code> /{' '}
          <code>onPressedChange</code>. <code>FormatToggle</code> ships formatting
          glyphs.
        </p>
        <Demo
          code={`const [p, setP] = useState(false);
<Toggle pressed={p} onPressedChange={setP} variant="ghost" className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&_.toggle-content]:text-sm [&.toggle-outline]:border-gray-300 dark:[&.toggle-outline]:border-gray-600 [&.toggle-outline]:text-gray-700 dark:[&.toggle-outline]:text-gray-200 [&.toggle-outline.toggle-pressed]:border-blue-600 [&.toggle-outline.toggle-pressed]:bg-blue-600 [&.toggle-outline.toggle-pressed]:text-white [&.toggle-ghost]:border-transparent [&.toggle-ghost]:text-gray-700 dark:[&.toggle-ghost]:text-gray-200 [&.toggle-ghost.toggle-pressed]:bg-gray-900 [&.toggle-ghost.toggle-pressed]:text-white dark:[&.toggle-ghost.toggle-pressed]:bg-white dark:[&.toggle-ghost.toggle-pressed]:text-gray-900">
  {p ? 'Unmute' : 'Mute'}
</Toggle>
<FormatToggle format="bold" className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&_.toggle-content]:text-sm [&.toggle-outline]:border-gray-300 dark:[&.toggle-outline]:border-gray-600 [&.toggle-outline]:text-gray-700 dark:[&.toggle-outline]:text-gray-200 [&.toggle-outline.toggle-pressed]:border-blue-600 [&.toggle-outline.toggle-pressed]:bg-blue-600 [&.toggle-outline.toggle-pressed]:text-white [&.toggle-ghost]:border-transparent [&.toggle-ghost]:text-gray-700 dark:[&.toggle-ghost]:text-gray-200 [&.toggle-ghost.toggle-pressed]:bg-gray-900 [&.toggle-ghost.toggle-pressed]:text-white dark:[&.toggle-ghost.toggle-pressed]:bg-white dark:[&.toggle-ghost.toggle-pressed]:text-gray-900" />`}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Toggle
              className={toggleBase}
              pressed={pressed}
              onPressedChange={setPressed}
              variant="ghost"
            >
              {pressed ? 'Unmute' : 'Mute'}
            </Toggle>
            <FormatToggle className={toggleBase} format="bold" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'pressed / defaultPressed',
              type: 'boolean',
              default: 'false',
              description: 'Controlled or uncontrolled pressed state.',
            },
            {
              name: 'onPressedChange',
              type: '(pressed: boolean) => void',
              default: '—',
              description: 'Called with the new pressed state.',
            },
            {
              name: 'pressedChildren / unpressedChildren',
              type: 'ReactNode',
              default: '—',
              description: 'State-specific content (falls back to children).',
            },
            {
              name: 'pressedIcon / unpressedIcon',
              type: 'ReactNode',
              default: '—',
              description: 'State-specific leading icon.',
            },
            {
              name: 'variant',
              type: "'default' | 'outline' | 'ghost'",
              default: "'default'",
              description: 'Visual variant hook (emitted as toggle-<variant>).',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size variant (emitted as toggle-<size>).',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the toggle button.',
            },
            {
              name: 'className',
              type: 'string',
              default: '—',
              description: 'Applied to the rendered <button>.',
            },
          ]}
        />
      </section>
    </div>
  );
}
