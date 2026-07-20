'use client';

import { SlideIn } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// SlideIn drives a translate + opacity via the headless useSlideIn hook and
// framer-motion. The `direction` controls the entry axis (up/down/left/right)
// and `distance` controls how far it travels in pixels.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function SlideInPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">SlideIn</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A directional slide animation backed by the headless{' '}
          <code className="font-mono text-sm">useSlideIn</code> hook and rendered
          with framer-motion. It animates a <code>translate</code> + opacity from
          an offset defined by <code>direction</code> (up / down / left / right)
          and <code>distance</code>. The hook exposes{' '}
          <code>slideIn</code> / <code>slideOut</code> / <code>toggle</code>{' '}
          actions and respects <code>prefers-reduced-motion</code>. framer-motion
          is a peer dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Slide in from below</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="up"</code> moves the element up into place;{' '}
          <code>distance</code> sets the pixel offset.
        </p>
        <Demo
          code={`<SlideIn direction="up" distance={24} duration={600} initialVisible>
  <span>Slide up</span>
</SlideIn>`}
        >
          <SlideIn
            direction="up"
            distance={24}
            duration={600}
            initialVisible
            className={boxClasses}
          >
            <span>Slide up</span>
          </SlideIn>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Slide from the left</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A horizontal entry with a longer <code>duration</code> and a{' '}
          <code>delay</code>.
        </p>
        <Demo
          code={`<SlideIn direction="left" distance={40} duration={800} delay={150} initialVisible>
  <span>Slide from left</span>
</SlideIn>`}
        >
          <SlideIn
            direction="left"
            distance={40}
            duration={800}
            delay={150}
            initialVisible
            className={boxClasses}
          >
            <span>Slide from left</span>
          </SlideIn>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'direction',
              type: "'up' | 'down' | 'left' | 'right'",
              default: "'up'",
              description: 'Axis the element slides along.',
            },
            {
              name: 'distance',
              type: 'number',
              default: '20',
              description: 'Pixel distance the element travels.',
            },
            {
              name: 'initialVisible',
              type: 'boolean',
              default: 'false',
              description: 'Whether the element starts in the visible state.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '300',
              description: 'Animation duration in milliseconds.',
            },
            {
              name: 'delay',
              type: 'number',
              default: '0',
              description: 'Delay before the animation starts, in milliseconds.',
            },
            {
              name: 'easing',
              type: "'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'",
              default: "'ease-in-out'",
              description: 'Easing curve applied to the transition.',
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
