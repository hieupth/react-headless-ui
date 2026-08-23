'use client';

import { Shake } from '@hieupth/react-headless-ui';
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
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Shake</h1>
        <p className="docs-lead">
          A shake animation backed by the headless{' '}
          <code className="docs-code">useShake</code> hook and rendered
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

      <section className="docs-section">
        <h2 className="docs-h2">Horizontal shake</h2>
        <p className="docs-desc">
          <code>initialActive</code> starts it on mount;{' '}
          <code>repeat={0}</code> (default) loops indefinitely.
        </p>
        <Demo
          code={`<Shake
  initialActive
  direction="horizontal"
  intensity={1.2}
  cycles={4}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
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

      <section className="docs-section">
        <h2 className="docs-h2">Both axes</h2>
        <p className="docs-desc">
          <code>direction="both"</code> wobbles diagonally;{' '}
          <code>cycles</code> sets the number of oscillations per cycle.
        </p>
        <Demo
          code={`<Shake
  initialActive
  direction="both"
  cycles={6}
  duration={600}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
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

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
