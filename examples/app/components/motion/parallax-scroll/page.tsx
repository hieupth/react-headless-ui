'use client';

import { ParallaxScroll } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// ParallaxScroll translates its children based on scroll position via the
// headless useParallaxScroll hook. `speed` (0-1) sets how far it drifts;
// `direction` sets the axis. Best observed while scrolling the page.
const panelClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-6 py-12 text-base font-medium dark:bg-white dark:text-gray-900';

export default function ParallaxScrollPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">ParallaxScroll</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A scroll-driven parallax effect backed by the headless{' '}
          <code className="font-mono text-sm">useParallaxScroll</code> hook. As
          the element scrolls through the viewport, it translates by up to{' '}
          <code>speed</code> × its own height along a <code>direction</code> (up
          / down / left / right). The hook tracks scroll and intersection via
          <code> IntersectionObserver</code> + <code>requestAnimationFrame</code>,
          optionally reacts to device orientation, and respects{' '}
          <code>prefers-reduced-motion</code>. <strong>Scroll this page</strong>{' '}
          to see the demo below drift relative to its neighbors. Note:
          framer-motion is a peer dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Upward drift</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="up"</code> with <code>speed={0.4}</code> moves the
          element up as it scrolls into view. Scroll up and down to compare it
          against a static reference panel.
        </p>
        <Demo
          code={`<ParallaxScroll speed={0.4} direction="up">
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-12 text-base font-medium text-white dark:bg-white dark:text-gray-900">
    Drifting up
  </div>
</ParallaxScroll>`}
        >
          <div className="w-full space-y-3">
            <div className={panelClasses}>Static reference</div>
            <ParallaxScroll speed={0.4} direction="up">
              <div className={panelClasses}>Drifting up</div>
            </ParallaxScroll>
            <div className={panelClasses}>Static reference</div>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Faster speed</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A higher <code>speed</code> exaggerates the offset. Combine with{' '}
          <code>startOffset</code> / <code>endOffset</code> to gate the effect to
          a viewport band.
        </p>
        <Demo
          code={`<ParallaxScroll speed={0.7} direction="up" startOffset={0} endOffset={1}>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-12 text-base font-medium text-white dark:bg-white dark:text-gray-900">
    Faster drift
  </div>
</ParallaxScroll>`}
        >
          <div className="w-full space-y-3">
            <div className={panelClasses}>Static reference</div>
            <ParallaxScroll speed={0.7} direction="up" startOffset={0} endOffset={1}>
              <div className={panelClasses}>Faster drift</div>
            </ParallaxScroll>
            <div className={panelClasses}>Static reference</div>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'speed',
              type: 'number (0-1)',
              default: '0.5',
              description: 'How far the element drifts, as a fraction of its height.',
            },
            {
              name: 'direction',
              type: "'up' | 'down' | 'left' | 'right'",
              default: "'up'",
              description: 'Axis and sign of the parallax movement.',
            },
            {
              name: 'startOffset / endOffset',
              type: 'number (0-1)',
              default: '0 / 1',
              description: 'Viewport band within which parallax is active.',
            },
            {
              name: 'useDeviceOrientation',
              type: 'boolean',
              default: 'false',
              description: 'Also react to device tilt (mobile).',
            },
            {
              name: 'container',
              type: 'HTMLElement | Window',
              default: 'window',
              description: 'Scroll container to track.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Disables movement when prefers-reduced-motion is set.',
            },
          ]}
        />
      </section>
    </div>
  );
}
