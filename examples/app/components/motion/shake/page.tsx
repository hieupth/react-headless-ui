'use client';

import { Shake } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Shake translates its children back and forth via the headless useShake hook
// and framer-motion. `direction` sets the axis; `intensity` and `cycles` shape
// the wobble; repeat=0 loops forever.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function ShakePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Shake</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A shake animation backed by the headless{' '}
          <code className="font-mono text-sm">useShake</code> hook and rendered
          with framer-motion. It oscillates the element along a{' '}
          <code>direction</code> (horizontal / vertical / both) using{' '}
          <code>cycles</code> oscillations within each <code>duration</code>,
          scaled by <code>intensity</code>, repeating <code>repeat</code> times
          (0 = loop forever). The hook exposes <code>start</code> /{' '}
          <code>stop</code> / <code>pause</code> / <code>resume</code> /{' '}
          <code>toggle</code> actions and respects{' '}
          <code>prefers-reduced-motion</code>. Ideal for error feedback and
          attention-grabbing alerts. framer-motion is a peer dependency for the
          Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal shake</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount;{' '}
          <code>repeat={0}</code> (default) loops indefinitely.
        </p>
        <Demo
          code={`<Shake initialActive direction="horizontal" intensity={1.2} cycles={4}>
  <span>Shaking</span>
</Shake>`}
        >
          <Shake
            initialActive
            direction="horizontal"
            intensity={1.2}
            cycles={4}
            className={boxClasses}
          >
            <span>Shaking</span>
          </Shake>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Both axes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="both"</code> wobbles diagonally;{' '}
          <code>cycles</code> sets the number of oscillations per cycle.
        </p>
        <Demo
          code={`<Shake initialActive direction="both" cycles={6} duration={600}>
  <span>Wobble</span>
</Shake>`}
        >
          <Shake
            initialActive
            direction="both"
            cycles={6}
            duration={600}
            className={boxClasses}
          >
            <span>Wobble</span>
          </Shake>
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
              description: 'Whether the shake starts on mount.',
            },
            {
              name: 'direction',
              type: "'horizontal' | 'vertical' | 'both'",
              default: "'horizontal'",
              description: 'Axes the element shakes along.',
            },
            {
              name: 'intensity',
              type: 'number',
              default: '1.0',
              description: 'Multiplier for the shake distance.',
            },
            {
              name: 'cycles',
              type: 'number',
              default: '4',
              description: 'Number of oscillations within each shake duration.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '500',
              description: 'Duration of one shake cycle in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of shake cycles; 0 = infinite.',
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
