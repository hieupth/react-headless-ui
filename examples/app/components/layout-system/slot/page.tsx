'use client';

import { Slot, SlotClone } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Slot is backed by the headless useSlot hook. It composes the focus/press/
// semantic mixins and forwards them onto a single child by cloning the element
// and merging props — so the child keeps its own identity (a <button> stays a
// <button>) while gaining slot behaviour and accessibility. This is the
// composition primitive that powers asChild-style APIs across the library.

export default function SlotPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Slot</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A composition primitive backed by the headless{' '}
          <code className="font-mono text-sm">useSlot</code> hook. Instead of
          rendering a wrapper, Slot clones its single child and merges props onto
          it — focus/press/semantic behaviour, classes, and any{' '}
          <code>mergeProps</code> you pass — so the child keeps its own element
          type and semantics. This is the engine behind asChild-style
          composition throughout the library. Set <code>clone</code> to merge
          directly onto the child, or omit it to wrap.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Clone onto a child</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>clone</code> (or the <code>SlotClone</code> alias), the
          passed <code>mergeProps</code> and classes land on the child{' '}
          <code>&lt;button&gt;</code> directly — no extra DOM node. Inspect the
          button to see the merged <code>data-slot</code> attributes and class.
        </p>
        <Demo
          code={`<SlotClone
  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
  mergeProps={{ 'data-slot': 'action', type: 'button' }}
>
  <button>I keep my own element</button>
</SlotClone>`}
        >
          <SlotClone
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            mergeProps={{ 'data-slot': 'action', type: 'button' }}
          >
            <button>I keep my own element</button>
          </SlotClone>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Merge strategies</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>mergeStrategy</code> controls how slot props combine with the
          child&apos;s own props: <code>merge</code> (default) deep-merges,{' '}
          <code>replace</code> overwrites, and <code>append</code> /{' '}
          <code>prepend</code> concatenate list-like values. Here two{' '}
          <code>onClick</code> handlers both fire under <code>merge</code>.
        </p>
        <Demo
          code={`<Slot
  clone
  mergeStrategy="merge"
  onClick={() => console.log('slot clicked')}
  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
  mergeProps={{ 'aria-label': 'Clickable slot' }}
>
  <button type="button" onClick={() => console.log('child clicked')}>
    Both handlers fire
  </button>
</Slot>`}
        >
          <Slot
            clone
            mergeStrategy="merge"
            onClick={() => undefined}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            mergeProps={{ 'aria-label': 'Clickable slot' }}
          >
            <button type="button">Both handlers fire</button>
          </Slot>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Wrapper mode</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Without <code>clone</code>, Slot renders a wrapper element (default{' '}
          <code>div</code>, override with <code>as</code>) and applies the slot
          behaviour there — useful when the child shouldn&apos;t be touched.
        </p>
        <Demo
          code={`<Slot
  as="span"
  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
>
  Wrapped content
</Slot>`}
        >
          <Slot
            as="span"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            Wrapped content
          </Slot>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'clone', type: 'boolean', default: 'false', description: 'Merge props onto the child element instead of rendering a wrapper.' },
            { name: 'as', type: 'ElementType', default: "'div'", description: 'Wrapper element tag used when not cloning.' },
            { name: 'mergeStrategy', type: "'merge' | 'replace' | 'append' | 'prepend'", default: "'merge'", description: 'How slot props combine with the child props.' },
            { name: 'mergeProps', type: 'Record<string, any>', default: '{}', description: 'Extra props merged onto the child.' },
            { name: 'excludeProps', type: 'string[]', default: '—', description: 'Prop names to drop during the merge.' },
            { name: 'priorityProps', type: 'string[]', default: '—', description: 'Prop names that always override the child.' },
            { name: 'active', type: 'boolean', default: 'false', description: 'Reflects an active state (slot-active class, data attrs).' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Marks the slot disabled (slot-disabled class, aria-disabled).' },
            { name: 'renderChildren', type: '(children, props) => ReactNode', default: '—', description: 'Custom render function for the merged children.' },
          ]}
        />
      </section>
    </div>
  );
}
