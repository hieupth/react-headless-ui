'use client';

import { EmptyState } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// EmptyState renders a placeholder for empty data: an icon, title, description,
// and optional primary/secondary actions. Semantic variants cue the context
// (no-data, no-results, error…). Headless on CSS — theme through className.
export default function EmptyStatePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">EmptyState</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A placeholder for empty data, backed by the headless{' '}
          <code className="font-mono text-sm">useEmptyState</code> hook. It
          composes an <code>icon</code>, <code>title</code>,{' '}
          <code>description</code>, and optional primary/secondary actions, and
          carries a <code>variant</code> (<code>no-data</code>,{' '}
          <code>no-results</code>, <code>no-connection</code>,{' '}
          <code>error</code>, <code>loading</code>) to cue the context. Set{' '}
          <code>dismissible</code> to render a dismiss control.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic empty state</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>title</code>, <code>description</code>, and an{' '}
          <code>icon</code> convey the situation.
        </p>
        <Demo
          code={`<EmptyState
  icon={<span>📭</span>}
  title="No documents"
  description="Upload a file to get started."
/>`}
        >
          <EmptyState
            icon={<span className="text-4xl">📭</span>}
            title="No documents"
            description="Upload a file to get started."
            variant="no-data"
            className="w-80 py-8 flex flex-col items-center gap-2 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With actions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>primaryActionText</code> / <code>secondaryActionText</code>{' '}
          render action buttons wired to the hook's action callbacks.
        </p>
        <Demo
          code={`<EmptyState
  icon={<span>🔍</span>}
  title="No results"
  description="Try a different search term."
  variant="no-results"
  primaryActionText="Clear filters"
  onPrimaryAction={() => alert('cleared')}
/>`}
        >
          <EmptyState
            icon={<span className="text-4xl">🔍</span>}
            title="No results"
            description="Try a different search term."
            variant="no-results"
            primaryActionText="Clear filters"
            onPrimaryAction={() => alert('cleared')}
            className="w-80 py-8 flex flex-col items-center gap-3 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dismissible error</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant="error"</code> plus <code>dismissible</code> renders a
          close control; <code>onDismiss</code> fires on dismiss.
        </p>
        <Demo
          code={`<EmptyState
  variant="error"
  title="Something went wrong"
  description="We couldn't load your data."
  dismissible
  onDismiss={() => alert('dismissed')}
/>`}
        >
          <EmptyState
            variant="error"
            title="Something went wrong"
            description="We couldn't load your data."
            dismissible
            onDismiss={() => alert('dismissed')}
            className="w-80 py-8 flex flex-col items-center gap-2 text-center border border-red-300 dark:border-red-800 rounded-lg"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'title', type: 'string', default: '—', description: 'Heading text.' },
            { name: 'description', type: 'string', default: '—', description: 'Supporting paragraph.' },
            { name: 'icon', type: 'ReactNode', default: '—', description: 'Illustration or icon.' },
            { name: 'variant', type: "'no-data' | 'no-results' | 'no-connection' | 'error' | 'loading'", default: "'no-data'", description: 'Contextual cue.' },
            { name: 'visible', type: 'boolean', default: 'true', description: 'Toggle visibility.' },
            { name: 'dismissible', type: 'boolean', default: 'false', description: 'Render a dismiss control.' },
            { name: 'primaryActionText / secondaryActionText', type: 'string', default: '—', description: 'Action button labels.' },
            { name: 'onPrimaryAction / onSecondaryAction', type: '() => void', default: '—', description: 'Action button callbacks.' },
            { name: 'onDismiss', type: '() => void', default: '—', description: 'Fires when dismissed.' },
            { name: 'showActions', type: 'boolean', default: '—', description: 'Toggle the action row.' },
          ]}
        />
      </section>
    </div>
  );
}
