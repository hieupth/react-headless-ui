'use client';

import { Flip } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Flip rotates its children in 3D via the headless useFlip hook and
// framer-motion. `axis` sets the rotation axis (x/y/z); `direction` controls
// forward/backward/alternate; repeat=0 loops forever.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function FlipPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Flip</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A 3D flip animation backed by the headless{' '}
          <code className="font-mono text-sm">useFlip</code> hook and rendered
          with framer-motion. It rotates the element 180° around an{' '}
          <code>axis</code> (x / y / z) with a <code>direction</code> of forward,
          backward, or alternate, repeating <code>repeat</code> times (0 = loop
          forever). The hook sets <code>transform-style: preserve-3d</code> and{' '}
          <code>backface-visibility: hidden</code>, and exposes{' '}
          <code>start</code> / <code>stop</code> / <code>pause</code> /{' '}
          <code>resume</code> / <code>toggle</code> actions. It respects{' '}
          <code>prefers-reduced-motion</code>. framer-motion is a peer dependency
          for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Y-axis flip</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount;{' '}
          <code>repeat={0}</code> (default) loops indefinitely.
        </p>
        <Demo
          code={`<Flip initialActive axis="y" duration={900}>
  <span>Flipping</span>
</Flip>`}
        >
          <Flip
            initialActive
            axis="y"
            duration={900}
            className={boxClasses}
          >
            <span>Flipping</span>
          </Flip>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Alternate on X</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="alternate"</code> reverses on each repeat;{' '}
          <code>axis="x"</code> flips over the horizontal axis.
        </p>
        <Demo
          code={`<Flip initialActive axis="x" direction="alternate" duration={800}>
  <span>Alternate</span>
</Flip>`}
        >
          <Flip
            initialActive
            axis="x"
            direction="alternate"
            duration={800}
            className={boxClasses}
          >
            <span>Alternate</span>
          </Flip>
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
              description: 'Whether the flip starts on mount.',
            },
            {
              name: 'axis',
              type: "'x' | 'y' | 'z'",
              default: "'y'",
              description: 'Axis the element rotates around (180° flip).',
            },
            {
              name: 'direction',
              type: "'forward' | 'backward' | 'alternate'",
              default: "'forward'",
              description: 'Rotation direction; alternate reverses each repeat.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '600',
              description: 'Duration of one flip in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of flips; 0 = infinite.',
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
