'use client';

import { BlurInOut } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// BlurInOut animates a CSS blur filter via the headless useBlurInOut hook and
// framer-motion. With initialActive it transitions from initialBlur to
// finalBlur; repeat=0 loops forever.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function BlurInOutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">BlurInOut</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A blur animation backed by the headless{' '}
          <code className="font-mono text-sm">useBlurInOut</code> hook and
          rendered with framer-motion. It animates a CSS{' '}
          <code>filter: blur()</code> from <code>initialBlur</code> to{' '}
          <code>finalBlur</code>, repeating <code>repeat</code> times (0 = loop
          forever). The hook exposes <code>start</code> / <code>stop</code> /{' '}
          <code>pause</code> / <code>resume</code> / <code>toggle</code> actions
          and respects <code>prefers-reduced-motion</code> (blur is removed under
          reduced motion). Great for dreamy transitions and focus pulls.
          framer-motion is a peer dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Blur in</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount; the element resolves
          from <code>finalBlur</code> down to <code>initialBlur</code> (0 = sharp).
        </p>
        <Demo
          code={`<BlurInOut
  initialActive
  initialBlur={0}
  finalBlur={8}
  duration={600}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Coming into focus</span>
</BlurInOut>`}
        >
          <BlurInOut
            initialActive
            initialBlur={0}
            finalBlur={8}
            duration={600}
            className={boxClasses}
          >
            <span>Coming into focus</span>
          </BlurInOut>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Heavier blur</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A larger <code>finalBlur</code> deepens the effect;{' '}
          <code>repeat={0}</code> (default) keeps it looping.
        </p>
        <Demo
          code={`<BlurInOut
  initialActive
  finalBlur={14}
  duration={800}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Deep blur</span>
</BlurInOut>`}
        >
          <BlurInOut
            initialActive
            finalBlur={14}
            duration={800}
            className={boxClasses}
          >
            <span>Deep blur</span>
          </BlurInOut>
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
              description: 'Whether the blur animation starts on mount.',
            },
            {
              name: 'initialBlur / finalBlur',
              type: 'number',
              default: '0 / 8',
              description: 'Start and end blur amounts in pixels.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '400',
              description: 'Duration of one blur cycle in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of cycles; 0 = infinite.',
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
              description: 'Disables blur when prefers-reduced-motion is set.',
            },
          ]}
        />
      </section>
    </div>
  );
}
