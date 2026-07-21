'use client';

import { Badge, BadgeWrapper } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Badge renders a real <span> with role="status" (or "button" when onClick is
// set). It is headless on CSS — theme it via Tailwind through className.
export default function BadgePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Badge</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A small status label backed by the headless{' '}
          <code className="font-mono text-sm">useBadge</code> hook. It supports
          count indicators with a <code>maxCount</code> cap, a dot variant, four
          semantic variants, and a <code>BadgeWrapper</code> that positions a
          badge over another element. The default renderer emits the ARIA{' '}
          <code>status</code>/<code>button</code> structure — apply your own
          color and shape through <code>className</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants &amp; sizes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant</code> selects the semantic tone; <code>size</code> sets
          the density. Pass children for free-form content.
        </p>
        <Demo
          code={`<Badge variant="default" className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900">Default</Badge>
<Badge variant="secondary" className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">Secondary</Badge>
<Badge variant="destructive" className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-600 text-white">Error</Badge>
<Badge variant="outline" size="lg" className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100">Outline</Badge>`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900">Default</Badge>
            <Badge variant="secondary" className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">Secondary</Badge>
            <Badge variant="destructive" className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-600 text-white">Error</Badge>
            <Badge variant="outline" size="lg" className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100">Outline</Badge>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Count &amp; dot</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A numeric <code>count</code> caps at <code>maxCount</code> (default
          99). Set <code>dot</code> for a content-less indicator.
        </p>
        <Demo
          code={`<Badge count={5} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1.5 text-xs font-medium bg-indigo-600 text-white" />
<Badge count={120} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1.5 text-xs font-medium bg-indigo-600 text-white" />
<Badge dot className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />`}
        >
          <div className="flex items-center gap-3">
            <Badge count={5} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1.5 text-xs font-medium bg-indigo-600 text-white" />
            <Badge count={120} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1.5 text-xs font-medium bg-indigo-600 text-white" />
            <Badge dot className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Anchored with BadgeWrapper</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>BadgeWrapper</code> overlays a badge at one of four corners of
          its child via <code>position</code>.
        </p>
        <Demo
          code={`<BadgeWrapper
  badge={<Badge count={9} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1.5 text-xs font-medium bg-red-600 text-white" />}
  position="top-right"
>
  <span className="rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-600">Inbox</span>
</BadgeWrapper>`}
        >
          <BadgeWrapper badge={<Badge count={9} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full px-1.5 text-xs font-medium bg-red-600 text-white" />} position="top-right">
            <span className="rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-600">Inbox</span>
          </BadgeWrapper>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'variant', type: "'default' | 'secondary' | 'destructive' | 'outline'", default: "'default'", description: 'Semantic tone of the badge.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Badge density.' },
            { name: 'count', type: 'number', default: '—', description: 'Numeric indicator; caps at maxCount.' },
            { name: 'maxCount', type: 'number', default: '99', description: 'Above this, shows "maxCount+".' },
            { name: 'dot', type: 'boolean', default: 'false', description: 'Render a content-less dot indicator.' },
            { name: 'position', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'", default: "'top-right'", description: 'Placement when used with BadgeWrapper.' },
            { name: 'visible', type: 'boolean', default: 'true', description: 'Toggle visibility (hidden when false, unless dot).' },
            { name: 'animated', type: 'boolean', default: 'true', description: 'Animate on count change.' },
            { name: 'onClick', type: '() => void', default: '—', description: 'Makes the badge focusable with role="button".' },
          ]}
        />
      </section>
    </div>
  );
}
