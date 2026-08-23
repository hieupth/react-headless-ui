'use client';

import { MagneticHover } from '@hieupth/react-headless-ui';
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
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">MagneticHover</h1>
        <p className="docs-lead">
          A magnetic effect that pulls the element toward the cursor, backed by
          the headless <code className="docs-code">useMagneticHover</code>{' '}
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

      <section className="docs-section">
        <h2 className="docs-h2">Default magnetism</h2>
        <p className="docs-desc">
          The defaults follow the cursor by up to 20px and scale to 1.05. Move
          the mouse around inside the demo to see it track.
        </p>
        <Demo
          code={`<MagneticHover className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-white dark:bg-white dark:text-gray-900">
  <span>Magnetic</span>
</MagneticHover>`}
        >
          <MagneticHover className={pillClasses}>
            <span>Magnetic</span>
          </MagneticHover>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Stronger pull</h2>
        <p className="docs-desc">
          A larger <code>strength</code> widens the travel; <code>scale=false</code>{' '}
          disables the grow so only the follow remains.
        </p>
        <Demo
          code={`<MagneticHover
  strength={40}
  scale={false}
  className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Strong pull</span>
</MagneticHover>`}
        >
          <MagneticHover strength={40} scale={false} className={pillClasses}>
            <span>Strong pull</span>
          </MagneticHover>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
