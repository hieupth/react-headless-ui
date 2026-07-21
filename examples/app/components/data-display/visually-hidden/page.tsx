'use client';

import { VisuallyHidden } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// VisuallyHidden renders content available only to assistive technology: it
// applies the standard visually-hidden inline styles (clipped to 1px) so the
// text is invisible on screen but announced by screen readers. The hook also
// supports a focusable mode (visible-on-focus) and live-region announcements.
export default function VisuallyHiddenPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">VisuallyHidden</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Screen-reader-only content backed by the headless{' '}
          <code className="font-mono text-sm">useVisuallyHidden</code> hook. It
          applies the standard visually-hidden inline styles (clipped, 1px,
          absolutely positioned) so content is invisible on screen but read by
          assistive technology. A <code>focusable</code> mode reveals the
          content when focused (useful for skip links), and a built-in live
          region can announce dynamic messages.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Extra context for screen readers</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The icon below has no visible label; the visually-hidden text gives
          screen-reader users the meaning. The text is in the DOM but clipped
          off-screen.
        </p>
        <Demo
          code={`<button className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
  <span aria-hidden>🗑️</span>
  <VisuallyHidden>Delete item</VisuallyHidden>
</button>`}
        >
          <button className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
            <span aria-hidden>🗑️</span>
            <VisuallyHidden>Delete item</VisuallyHidden>
          </button>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Focusable (skip link)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>focusable</code> so the content becomes visible when
          focused — the standard pattern for a &quot;skip to content&quot; link.
          Tab into the demo to reveal it.
        </p>
        <Demo
          code={`<VisuallyHidden as="a" focusable className="focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:shadow focus:not-sr-only">
  Skip to content
</VisuallyHidden>`}
        >
          <div className="text-sm">
            <VisuallyHidden as="a" focusable className="focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:shadow focus:not-sr-only">
              Skip to content
            </VisuallyHidden>
            <span className="text-gray-500">Tab into this preview to focus the link.</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Live-region announcement</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The hook exposes a polite/assertive live region;{' '}
          <code>autoAnnounce</code> reads children that change. Screen readers
          re-announce the updated text without moving focus.
        </p>
        <Demo
          code={`<VisuallyHidden liveRegion liveRegionType="polite" autoAnnounce>
  {message}
</VisuallyHidden>`}
        >
          <div className="text-sm text-gray-500">
            Code-only: bind a dynamic <code>children</code> string with{' '}
            <code>liveRegionType="polite"</code> and{' '}
            <code>autoAnnounce</code> to surface status updates to assistive
            tech. (The element is visually hidden, so there is nothing to see
            here.)
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'children', type: 'ReactNode', default: '—', description: 'Content read by screen readers.' },
            { name: 'as', type: 'ElementType', default: "'span'", description: 'Element tag (span, a, p, …).' },
            { name: 'focusable', type: 'boolean', default: 'false', description: 'Reveal content when focused (skip-link pattern).' },
            { name: 'liveRegion', type: 'boolean', default: 'true', description: 'Render as an ARIA live region.' },
            { name: 'liveRegionType', type: "'polite' | 'assertive' | 'off'", default: "'polite'", description: 'Live-region politeness.' },
            { name: 'autoAnnounce', type: 'boolean', default: 'false', description: 'Announce string children when they change.' },
            { name: 'announceDelay', type: 'number', default: '100', description: 'ms delay before announcing.' },
            { name: 'role', type: 'AriaRole', default: '—', description: 'Override the ARIA role.' },
          ]}
        />
      </section>
    </div>
  );
}
