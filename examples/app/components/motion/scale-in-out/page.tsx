'use client';

import { ScaleInOut } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// ScaleInOut animates a scale + opacity via the headless useScaleInOut hook
// and framer-motion. With initialActive it transitions from initialScale to
// finalScale; `origin` sets the transform origin.
const boxClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function ScaleInOutPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">ScaleInOut</h1>
        <p className="docs-lead">
          A scale animation backed by the headless{' '}
          <code className="docs-code">useScaleInOut</code> hook and
          rendered with framer-motion. It transitions the element from{' '}
          <code>initialScale</code> to <code>finalScale</code> (with a fade),
          anchored at <code>origin</code> (center or a corner). The hook exposes{' '}
          <code>start</code> / <code>stop</code> / <code>pause</code> /{' '}
          <code>resume</code> actions and respects{' '}
          <code>prefers-reduced-motion</code>. Great for entrance and pop
          effects. framer-motion is a peer dependency for the Motion category.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Scale in from center</h2>
        <p className="docs-desc">
          <code>initialActive</code> runs it on mount; the element grows from{' '}
          <code>initialScale</code> to <code>finalScale</code>.
        </p>
        <Demo
          code={`<ScaleInOut
  initialActive
  initialScale={0.6}
  finalScale={1}
  duration={500}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Pop in</span>
</ScaleInOut>`}
        >
          <ScaleInOut
            initialActive
            initialScale={0.6}
            finalScale={1}
            duration={500}
            className={boxClasses}
          >
            <span>Pop in</span>
          </ScaleInOut>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Corner origin</h2>
        <p className="docs-desc">
          Set <code>origin</code> to a corner so the scale radiates from that
          edge.
        </p>
        <Demo
          code={`<ScaleInOut
  initialActive
  origin="bottom-right"
  duration={600}
  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900"
>
  <span>Bottom-right origin</span>
</ScaleInOut>`}
        >
          <ScaleInOut
            initialActive
            origin="bottom-right"
            duration={600}
            className={boxClasses}
          >
            <span>Bottom-right origin</span>
          </ScaleInOut>
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
              description: 'Whether the scale animation starts on mount.',
            },
            {
              name: 'initialScale / finalScale',
              type: 'number',
              default: '0.8 / 1',
              description: 'Start and end scale values.',
            },
            {
              name: 'origin',
              type: "'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
              default: "'center'",
              description: 'Transform origin for the scale.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '300',
              description: 'Animation duration in milliseconds.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of repeats; 0 = infinite.',
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
