'use client';

import { ParallaxScroll } from '@hieupth/react-headless-ui';
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
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">ParallaxScroll</h1>
        <p className="docs-lead">
          A scroll-driven parallax effect backed by the headless{' '}
          <code className="docs-code">useParallaxScroll</code> hook. As
          the element scrolls through the viewport, it translates by up to{' '}
          <code className="docs-code">speed</code> × its own height along a{' '}
          <code className="docs-code">direction</code> (up / down / left /
          right). The hook tracks scroll and intersection via{' '}
          <code className="docs-code">IntersectionObserver</code> +{' '}
          <code className="docs-code">requestAnimationFrame</code>,
          optionally reacts to device orientation, and respects{' '}
          <code className="docs-code">prefers-reduced-motion</code>.{' '}
          <strong>Scroll this page</strong> to see the demo below drift relative to
          its neighbors. Note: framer-motion is a peer dependency for the Motion
          category.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Upward drift</h2>
        <p className="docs-desc">
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

      <section className="docs-section">
        <h2 className="docs-h2">Faster speed</h2>
        <p className="docs-desc">
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

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
