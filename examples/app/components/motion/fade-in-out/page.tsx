'use client';

import { FadeInOut } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// FadeInOut wraps its children in a framer-motion <motion.div> whose opacity is
// driven by the headless useFadeInOut hook. The trigger prop controls when it
// runs; here we use "on-mount" so the demo animates in as the page loads.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function FadeInOutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">FadeInOut</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A fade in/out animation backed by the headless{' '}
          <code className="font-mono text-sm">useFadeInOut</code> hook and
          rendered with framer-motion. It drives opacity from{' '}
          <code>initialOpacity</code> to <code>finalOpacity</code> over{' '}
          <code>duration</code>, supports multiple <code>trigger</code> modes
          (immediate, on-mount, on-hover, on-click, manual), and respects{' '}
          <code>prefers-reduced-motion</code>. The hook ships{' '}
          <code>fadeIn</code> / <code>fadeOut</code> / <code>toggle</code>{' '}
          actions for imperative control. Note: framer-motion is a peer
          dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Fade in on mount</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>trigger="on-mount"</code> and{' '}
          <code>initialVisible</code>, the content fades from{' '}
          <code>initialOpacity</code> (0) to <code>finalOpacity</code> (1) when
          the component mounts.
        </p>
        <Demo
          code={`<FadeInOut
  trigger="on-mount"
  initialVisible
  duration={600}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Faded in</span>
</FadeInOut>`}
        >
          <FadeInOut
            trigger="on-mount"
            initialVisible
            duration={600}
            className={boxClasses}
          >
            <span>Faded in</span>
          </FadeInOut>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Duration &amp; delay</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A longer <code>duration</code> with a <code>delay</code> slows the
          transition; <code>easing</code> maps to a named framer-motion easing.
        </p>
        <Demo
          code={`<FadeInOut
  trigger="on-mount"
  initialVisible
  duration={1200}
  delay={200}
  easing="ease-out"
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Slow + delayed</span>
</FadeInOut>`}
        >
          <FadeInOut
            trigger="on-mount"
            initialVisible
            duration={1200}
            delay={200}
            easing="ease-out"
            className={boxClasses}
          >
            <span>Slow + delayed</span>
          </FadeInOut>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'trigger',
              type: "'immediate' | 'on-mount' | 'on-hover' | 'on-click' | 'manual'",
              default: "'immediate'",
              description: 'When the fade animation fires.',
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
              description: 'Easing curve (mapped to a framer-motion named easing).',
            },
            {
              name: 'initialOpacity / finalOpacity',
              type: 'number (0-1)',
              default: '0 / 1',
              description: 'Start and end opacity values.',
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
            {
              name: 'variants / transition',
              type: 'object',
              default: '—',
              description: 'Custom framer-motion variants and transition config.',
            },
          ]}
        />
      </section>
    </div>
  );
}
