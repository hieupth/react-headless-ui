'use client';

import { Bounce } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Bounce translates its children along an axis via the headless useBounce hook
// and framer-motion. `direction` sets the axis; `intensity` scales the height;
// repeat=0 loops forever.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function BouncePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Bounce</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A bounce animation backed by the headless{' '}
          <code className="font-mono text-sm">useBounce</code> hook and rendered
          with framer-motion. It translates the element along a{' '}
          <code>direction</code> (up / down / left / right) scaled by{' '}
          <code>intensity</code>, repeating <code>repeat</code> times (0 = loop
          forever). The hook exposes <code>start</code> / <code>stop</code> /{' '}
          <code>pause</code> / <code>resume</code> / <code>toggle</code> actions
          and respects <code>prefers-reduced-motion</code>. Great for playful
          emphasis, notifications, and empty-state nudges. framer-motion is a
          peer dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bounce up</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount;{' '}
          <code>repeat={0}</code> (default) loops indefinitely.
        </p>
        <Demo
          code={`<Bounce initialActive direction="up" duration={800}>
  <span>Bouncing</span>
</Bounce>`}
        >
          <Bounce
            initialActive
            direction="up"
            duration={800}
            className={boxClasses}
          >
            <span>Bouncing</span>
          </Bounce>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal, higher intensity</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="right"</code> bounces sideways;{' '}
          <code>intensity</code> multiplies the travel distance.
        </p>
        <Demo
          code={`<Bounce initialActive direction="right" intensity={1.5} duration={700}>
  <span>Sideways</span>
</Bounce>`}
        >
          <Bounce
            initialActive
            direction="right"
            intensity={1.5}
            duration={700}
            className={boxClasses}
          >
            <span>Sideways</span>
          </Bounce>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'initialActive',
              type: 'boolean',
              default: 'false',
              description: 'Whether the bounce starts on mount.',
            },
            {
              name: 'direction',
              type: "'up' | 'down' | 'left' | 'right'",
              default: "'up'",
              description: 'Axis the element bounces along.',
            },
            {
              name: 'intensity',
              type: 'number',
              default: '1.0',
              description: 'Multiplier for the bounce distance.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '800',
              description: 'Duration of one bounce in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of bounces; 0 = infinite.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Skips animation when prefers-reduced-motion is set.',
            },
          ]}
        />
      </section>
    </div>
  );
}
