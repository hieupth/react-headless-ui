'use client';

import { HoverLift } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// HoverLift raises + scales its children on hover via the headless useHoverLift
// hook and framer-motion. liftDistance sets the rise; scale grows it;
// shadowIntensity adds an elevation shadow. Hover the cards below to see it.
const cardClasses =
  'inline-flex flex-col items-center justify-center rounded-lg bg-gray-900 text-white ' +
  'px-8 py-10 text-sm font-medium shadow-sm dark:bg-white dark:text-gray-900';

export default function HoverLiftPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">HoverLift</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A hover-driven lift effect backed by the headless{' '}
          <code className="font-mono text-sm">useHoverLift</code> hook and
          rendered with framer-motion. On hover (or focus), the element rises by{' '}
          <code>liftDistance</code>, scales by <code>scale</code>, and gains an
          elevation shadow sized by <code>shadowIntensity</code>. The hook tracks
          pointer position, exposes <code>lift</code> / <code>drop</code> /{' '}
          <code>toggle</code> actions, and respects{' '}
          <code>prefers-reduced-motion</code>. <strong>Hover the cards</strong>{' '}
          below to see them lift. framer-motion is a peer dependency for the
          Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Default lift</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The defaults rise 8px, scale to 1.02, and add a soft shadow. Tab to the
          card to lift it via focus.
        </p>
        <Demo
          code={`<HoverLift className="inline-flex flex-col items-center justify-center rounded-lg bg-gray-900 px-8 py-10 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-gray-900">
  <span>Hover me</span>
</HoverLift>`}
        >
          <HoverLift className={cardClasses}>
            <span>Hover me</span>
          </HoverLift>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stronger lift &amp; shadow</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Larger <code>liftDistance</code>, <code>scale</code>, and{' '}
          <code>shadowIntensity</code> produce a more dramatic float.
        </p>
        <Demo
          code={`<HoverLift
  liftDistance={16}
  scale={1.05}
  shadowIntensity={0.5}
  duration={250}
  className="inline-flex flex-col items-center justify-center rounded-lg bg-gray-900 px-8 py-10 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-gray-900"
>
  <span>Big lift</span>
</HoverLift>`}
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <HoverLift
              liftDistance={16}
              scale={1.05}
              shadowIntensity={0.5}
              duration={250}
              className={cardClasses}
            >
              <span>Big lift</span>
            </HoverLift>
            <HoverLift className={cardClasses}>
              <span>Default</span>
            </HoverLift>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'liftDistance',
              type: 'number',
              default: '8',
              description: 'Pixels the element rises on hover.',
            },
            {
              name: 'scale',
              type: 'number',
              default: '1.02',
              description: 'Scale factor applied on hover (1 = no scale).',
            },
            {
              name: 'shadowIntensity',
              type: 'number (0-1)',
              default: '0.2',
              description: 'Strength of the elevation shadow.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '200',
              description: 'Lift transition duration in milliseconds.',
            },
            {
              name: 'easing',
              type: 'string',
              default: "'ease-out'",
              description: 'Easing curve for the lift transition.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the hover effect.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Skips the lift when prefers-reduced-motion is set.',
            },
          ]}
        />
      </section>
    </div>
  );
}
