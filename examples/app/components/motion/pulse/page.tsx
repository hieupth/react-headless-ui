'use client';

import { Pulse } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Pulse continuously scales + fades its children via the headless usePulse hook
// and framer-motion. With initialActive it starts immediately; repeat=0 means
// loop forever.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function PulsePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Pulse</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A continuous pulse animation backed by the headless{' '}
          <code className="font-mono text-sm">usePulse</code> hook and rendered
          with framer-motion. It oscillates scale and opacity by{' '}
          <code>intensity</code>, repeating <code>repeat</code> times (0 = loop
          forever). The hook exposes <code>start</code> / <code>stop</code> /{' '}
          <code>pause</code> / <code>resume</code> actions and respects{' '}
          <code>prefers-reduced-motion</code>. Ideal for attention indicators
          like live badges or recording dots. framer-motion is a peer dependency
          for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Continuous pulse</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount;{' '}
          <code>repeat={0}</code> (default) loops indefinitely.
        </p>
        <Demo
          code={`<Pulse initialActive intensity={0.2} duration={1000}>
  <span>Live</span>
</Pulse>`}
        >
          <Pulse
            initialActive
            intensity={0.2}
            duration={1000}
            className={boxClasses}
          >
            <span>Live</span>
          </Pulse>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stronger intensity</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A higher <code>intensity</code> deepens the scale/opacity swing; a
          shorter <code>duration</code> speeds it up.
        </p>
        <Demo
          code={`<Pulse initialActive intensity={0.45} duration={600}>
  <span>Urgent</span>
</Pulse>`}
        >
          <Pulse
            initialActive
            intensity={0.45}
            duration={600}
            className={boxClasses}
          >
            <span>Urgent</span>
          </Pulse>
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
              description: 'Whether the pulse starts animating on mount.',
            },
            {
              name: 'intensity',
              type: 'number (0-1)',
              default: '0.2',
              description: 'Strength of the scale and opacity swing.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '1000',
              description: 'Duration of one pulse cycle in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of pulses; 0 = infinite.',
            },
            {
              name: 'delay',
              type: 'number',
              default: '0',
              description: 'Delay between pulses, in milliseconds.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Skips animation when prefers-reduced-motion is set.',
            },
            {
              name: 'useMotion',
              type: 'boolean',
              default: 'true',
              description: 'Use framer-motion; false falls back to CSS transitions.',
            },
          ]}
        />
      </section>
    </div>
  );
}
