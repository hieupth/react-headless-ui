'use client';

import { MagneticHover } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// MagneticHover pulls its children toward the cursor via the headless
// useMagneticHover hook and framer-motion. `strength` sets how far it follows;
// `scale`/`scaleFactor` grow it. Hover + move across the button below.
const pillClasses =
  'inline-flex items-center justify-center rounded-full bg-gray-900 text-white ' +
  'px-8 py-4 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function MagneticHoverPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">MagneticHover</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A magnetic effect that pulls the element toward the cursor, backed by
          the headless <code className="font-mono text-sm">useMagneticHover</code>{' '}
          hook and rendered with framer-motion. As the pointer moves over the
          element, it translates by up to <code>strength</code> pixels toward the
          cursor (clamped by <code>boundary</code>), optionally scaling by{' '}
          <code>scaleFactor</code>. The hook exposes <code>start</code> /{' '}
          <code>end</code> / <code>reset</code> actions and respects{' '}
          <code>prefers-reduced-motion</code>. <strong>Hover and move</strong>{' '}
          across the button below to feel the pull. framer-motion is a peer
          dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Default magnetism</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The defaults follow the cursor by up to 20px and scale to 1.05. Move
          the mouse around inside the demo to see it track.
        </p>
        <Demo
          code={`<MagneticHover>
  <button>Magnetic</button>
</MagneticHover>`}
        >
          <MagneticHover className={pillClasses}>
            <span>Magnetic</span>
          </MagneticHover>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stronger pull</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A larger <code>strength</code> widens the travel; <code>scale=false</code>{' '}
          disables the grow so only the follow remains.
        </p>
        <Demo
          code={`<MagneticHover strength={40} scale={false}>
  <button>Strong pull</button>
</MagneticHover>`}
        >
          <MagneticHover strength={40} scale={false} className={pillClasses}>
            <span>Strong pull</span>
          </MagneticHover>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'strength',
              type: 'number',
              default: '20',
              description: 'Max pixels the element follows the cursor.',
            },
            {
              name: 'scale / scaleFactor',
              type: 'boolean / number',
              default: 'true / 1.05',
              description: 'Whether to scale on hover, and by how much.',
            },
            {
              name: 'boundary',
              type: "'parent' | 'viewport' | 'none'",
              default: "'parent'",
              description: 'Constrains magnetic movement to a region.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '300',
              description: 'Magnetic transition duration in milliseconds.',
            },
            {
              name: 'easing',
              type: 'string',
              default: "'ease-out'",
              description: 'Easing curve for the magnetic transition.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the magnetic effect.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Skips movement when prefers-reduced-motion is set.',
            },
          ]}
        />
      </section>
    </div>
  );
}
