'use client';

import { StaggerChildren } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// StaggerChildren animates each child in sequence via the headless
// useStaggerChildren hook and framer-motion. staggerDelay spaces each child;
// direction reorders (normal/reverse/center-out).
const itemClasses =
  'inline-flex items-center justify-center rounded-md bg-gray-900 text-white ' +
  'px-4 py-3 text-sm font-medium dark:bg-white dark:text-gray-900';

export default function StaggerChildrenPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">StaggerChildren</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A container that animates each child in sequence, backed by the headless{' '}
          <code className="font-mono text-sm">useStaggerChildren</code> hook and
          rendered with framer-motion. <code>staggerDelay</code> spaces each
          child; <code>direction</code> reorders the cascade (normal, reverse, or
          center-out); <code>duration</code> sets each child's transition. The
          hook derives <code>childrenCount</code> from the children automatically
          and exposes <code>start</code> / <code>stop</code> / <code>pause</code> /{' '}
          <code>resume</code> / <code>toggle</code> actions. It respects{' '}
          <code>prefers-reduced-motion</code>. framer-motion is a peer dependency
          for the Motion category.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Normal cascade</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>initialActive</code> starts it on mount; each child fades and
          rises <code>staggerDelay</code> ms after the previous.
        </p>
        <Demo
          code={`<StaggerChildren
  initialActive
  staggerDelay={120}
  duration={400}
  className="flex flex-wrap items-center justify-center gap-3"
>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">One</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">Two</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">Three</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">Four</div>
</StaggerChildren>`}
        >
          <StaggerChildren
            initialActive
            staggerDelay={120}
            duration={400}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <div className={itemClasses}>One</div>
            <div className={itemClasses}>Two</div>
            <div className={itemClasses}>Three</div>
            <div className={itemClasses}>Four</div>
          </StaggerChildren>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Center-out</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>direction="center-out"</code> animates the middle child first,
          expanding outward.
        </p>
        <Demo
          code={`<StaggerChildren
  initialActive
  direction="center-out"
  staggerDelay={150}
  className="flex flex-wrap items-center justify-center gap-3"
>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">A</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">B</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">C</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">D</div>
  <div className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-gray-900">E</div>
</StaggerChildren>`}
        >
          <StaggerChildren
            initialActive
            direction="center-out"
            staggerDelay={150}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <div className={itemClasses}>A</div>
            <div className={itemClasses}>B</div>
            <div className={itemClasses}>C</div>
            <div className={itemClasses}>D</div>
            <div className={itemClasses}>E</div>
          </StaggerChildren>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'staggerDelay',
              type: 'number',
              default: '100',
              description: 'Delay between each child starting, in milliseconds.',
            },
            {
              name: 'duration',
              type: 'number',
              default: '300',
              description: 'Duration of each child animation in milliseconds.',
            },
            {
              name: 'direction',
              type: "'normal' | 'reverse' | 'center-out'",
              default: "'normal'",
              description: 'Order in which children animate.',
            },
            {
              name: 'initialActive',
              type: 'boolean',
              default: 'false',
              description: 'Whether the stagger starts on mount.',
            },
            {
              name: 'repeat',
              type: 'number',
              default: '0',
              description: 'Number of stagger cycles; 0 = infinite.',
            },
            {
              name: 'respectReducedMotion',
              type: 'boolean',
              default: 'true',
              description: 'Skips animation when prefers-reduced-motion is set.',
            },
            {
              name: 'childVariants / childTransition',
              type: 'object',
              default: '—',
              description: 'Custom framer-motion variants/transition per child.',
            },
          ]}
        />
      </section>
    </div>
  );
}
