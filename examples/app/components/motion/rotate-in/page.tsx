'use client';

import { RotateIn } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// RotateIn spins its children via the headless useRotateIn hook and
// framer-motion. initialAngle/finalAngle define the arc; direction controls
// clockwise vs counter-clockwise; repeat=0 loops forever.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function RotateInPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">RotateIn</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A rotation animation backed by the headless{' '}
          <code className="font-mono text-sm">useRotateIn</code> hook and rendered
          with framer-motion. It rotates from <code>initialAngle</code> to{' '}
          <code>finalAngle</code> (degrees) in a <code>direction</code> (clockwise
          or counter-clockwise), repeating <code>repeat</code> times (0 = loop
          forever). The hook exposes <code>start</code> / <code>stop</code> /{' '}
          <code>pause</code> / <code>resume</code> / <code>toggle</code> actions
          and respects <code>prefers-reduced-motion</code>. Useful for spinners,
          loading indicators, and emphasis. framer-motion is a peer dependency
          for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Full rotation</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount;{' '}
          <code>repeat={0}</code> (default) loops indefinitely.
        </p>
        <Demo
          code={`<RotateIn initialActive finalAngle={360} duration={1200}>
  <span>Spinning</span>
</RotateIn>`}
        >
          <RotateIn
            initialActive
            finalAngle={360}
            duration={1200}
            className={boxClasses}
          >
            <span>Spinning</span>
          </RotateIn>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Single quarter turn</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A bounded <code>finalAngle</code> with <code>repeat=1</code> runs once
          and stops.
        </p>
        <Demo
          code={`<RotateIn initialActive initialAngle={0} finalAngle={90} repeat={1} direction="counter-clockwise">
  <span>Quarter turn</span>
</RotateIn>`}
        >
          <RotateIn
            initialActive
            initialAngle={0}
            finalAngle={90}
            repeat={1}
            direction="counter-clockwise"
            className={boxClasses}
          >
            <span>Quarter turn</span>
          </RotateIn>
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
              description: 'Whether the rotation starts on mount.',
            },
            {
              name: 'initialAngle / finalAngle',
              type: 'number',
              default: '0 / 360',
              description: 'Start and end rotation in degrees.',
            },
            {
              name: 'direction',
              type: "'clockwise' | 'counter-clockwise'",
              default: "'clockwise'",
              description: 'Rotation direction.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '600',
              description: 'Duration of one rotation in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of rotations; 0 = infinite.',
            },
            {
              name: 'delay',
              type: 'number',
              default: '0',
              description: 'Delay before the animation starts, in milliseconds.',
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
