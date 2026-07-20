import { Skeleton } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Skeleton is one of the few reui components that applies inline theme styles,
// so it renders visibly without extra Tailwind. Variants cover text, circular,
// rectangular, and rounded placeholders; `lines` stacks text rows.
export default function SkeletonPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Skeleton</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A loading placeholder backed by the headless{' '}
          <code className="font-mono text-sm">useSkeleton</code> hook. It ships
          four shapes — <code>text</code>, <code>circular</code>,{' '}
          <code>rectangular</code>, and <code>rounded</code> — plus an{' '}
          <code>animated</code> pulse and a <code>shimmer</code> sweep. Unlike
          most reui components it applies inline theme styles, so it renders
          visibly out of the box and is ideal for layout-stable content loading.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Shapes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pick a <code>variant</code> for the placeholder shape; use{' '}
          <code>width</code> / <code>height</code> for exact dimensions.
        </p>
        <Demo
          code={`<Skeleton variant="text" />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" width={200} height={100} />`}
        >
          <div className="flex flex-col items-center gap-4">
            <Skeleton variant="text" width={220} />
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="rectangular" width={200} height={80} />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Animated &amp; multi-line</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>animated</code> pulses the placeholder;{' '}
          <code>shimmer</code> adds a sweeping highlight. For body copy, set{' '}
          <code>variant="text"</code> with <code>lines</code>.
        </p>
        <Demo
          code={`<Skeleton variant="text" lines={3} animated />
<Skeleton variant="rounded" width={120} height={32} shimmer />`}
        >
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <Skeleton variant="text" lines={3} animated />
            <Skeleton variant="rounded" width={120} height={32} shimmer />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Profile card layout</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Combine shapes to preview a loading card while real data fetches.
        </p>
        <Demo
          code={`<div className="card">
  <Skeleton variant="circular" width={40} height={40} />
  <Skeleton variant="text" lines={2} />
</div>`}
        >
          <div className="flex items-center gap-3 w-full max-w-sm">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1">
              <Skeleton variant="text" lines={2} />
            </div>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'text' | 'circular' | 'rectangular' | 'rounded'",
              default: "'text'",
              description: 'Placeholder shape.',
            },
            {
              name: 'size',
              type: "SkeletonSize",
              default: 'depends on variant',
              description: 'Preset dimensions for the chosen variant.',
            },
            {
              name: 'width / height',
              type: 'string | number',
              default: '—',
              description: 'Explicit dimensions (overrides size).',
            },
            {
              name: 'lines',
              type: 'number',
              default: '1',
              description: 'Number of rows to render for the text variant.',
            },
            {
              name: 'animated',
              type: 'boolean',
              default: 'true',
              description: 'Pulse animation to signal loading.',
            },
            {
              name: 'shimmer',
              type: 'boolean',
              default: 'false',
              description: 'Sweeping highlight overlay.',
            },
            {
              name: 'className',
              type: 'string',
              default: '—',
              description: 'Additional CSS classes.',
            },
          ]}
        />
      </section>
    </div>
  );
}
