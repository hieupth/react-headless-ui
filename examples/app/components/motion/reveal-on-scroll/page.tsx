'use client';

import { RevealOnScroll } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// RevealOnScroll triggers an entrance animation when its children enter the
// viewport via the headless useRevealOnScroll hook. `direction` selects the
// motion (up/down/left/right/fade/scale); `once` keeps it revealed.
const panelClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-6 py-12 text-base font-medium dark:bg-white dark:text-gray-900';

export default function RevealOnScrollPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">RevealOnScroll</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A scroll-triggered reveal backed by the headless{' '}
          <code className="font-mono text-sm">useRevealOnScroll</code> hook. When
          the element intersects the viewport (configurable{' '}
          <code>threshold</code> and <code>rootMargin</code>), it animates opacity
          and a transform defined by <code>direction</code> (up / down / left /
          right / fade / scale). With <code>once=true</code> it stays revealed;
          otherwise it re-hides when it leaves. The hook exposes{' '}
          <code>reveal</code> / <code>hide</code> / <code>reset</code> actions and
          respects <code>prefers-reduced-motion</code>.{' '}
          <strong>Scroll down to the demo</strong> to trigger it. Note:
          framer-motion is a peer dependency for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Reveal from below</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="up"</code> rises + fades in when scrolled into view;
          <code> once</code> keeps it shown. This demo is placed below a spacer so
          it starts off-screen — scroll to reveal it.
        </p>
        <Demo
          code={`<RevealOnScroll direction="up" once duration={600}>
  <div>Revealed</div>
</RevealOnScroll>`}
        >
          <div className="w-full">
            <div className="h-[60vh] flex items-center justify-center text-xs text-gray-400">
              ↓ scroll down to reveal ↓
            </div>
            <RevealOnScroll direction="up" once duration={600}>
              <div className={panelClasses}>Revealed</div>
            </RevealOnScroll>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Scale reveal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="scale"</code> grows the element into view from{' '}
          <code>initialOpacity</code> + a 0.8 scale.
        </p>
        <Demo
          code={`<RevealOnScroll direction="scale" once duration={700}>
  <div>Scaled in</div>
</RevealOnScroll>`}
        >
          <div className="w-full">
            <div className="h-[40vh] flex items-center justify-center text-xs text-gray-400">
              ↓ keep scrolling ↓
            </div>
            <RevealOnScroll direction="scale" once duration={700}>
              <div className={panelClasses}>Scaled in</div>
            </RevealOnScroll>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'direction',
              type: "'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'",
              default: "'up'",
              description: 'Entrance motion applied on reveal.',
            },
            {
              name: 'once',
              type: 'boolean',
              default: 'true',
              description: 'Reveal only the first time; false re-hides on exit.',
            },
            {
              name: 'threshold',
              type: 'number | number[]',
              default: '0.1',
              description: 'Intersection ratio at which reveal triggers.',
            },
            {
              name: 'rootMargin',
              type: 'string',
              default: "'0px'",
              description: 'Margin around the root for intersection detection.',
            },
            {
              name: 'duration / delay',
              type: 'number',
              default: '600 / 0',
              description: 'Reveal animation duration and delay (ms).',
            },
            {
              name: 'initialOpacity / initialOffset',
              type: 'number',
              default: '0 / 30',
              description: 'Start opacity (0-1) and transform offset in px.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Shows content immediately when prefers-reduced-motion is set.',
            },
          ]}
        />
      </section>
    </div>
  );
}
