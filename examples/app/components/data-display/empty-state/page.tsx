'use client';

import { EmptyState } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// EmptyState renders a placeholder for empty data: an icon, title, description,
// and optional primary/secondary actions. Semantic variants cue the context
// (no-data, no-results, error…). Headless on CSS — theme through className.
export default function EmptyStatePage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">EmptyState</h1>
        <p className="docs-lead">
          A placeholder for empty data, backed by the headless{' '}
          <code className="docs-code">useEmptyState</code> hook. It
          composes an <code>icon</code>, <code>title</code>,{' '}
          <code>description</code>, and optional primary/secondary actions, and
          carries a <code>variant</code> (<code>no-data</code>,{' '}
          <code>no-results</code>, <code>no-connection</code>,{' '}
          <code>error</code>, <code>loading</code>) to cue the context. Set{' '}
          <code>dismissible</code> to render a dismiss control.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Basic empty state</h2>
        <p className="docs-desc">
          <code>title</code>, <code>description</code>, and an{' '}
          <code>icon</code> convey the situation.
        </p>
        <Demo
          code={`<EmptyState
  icon={<span>📭</span>}
  title="No documents"
  description="Upload a file to get started."
  variant="no-data"
  className="flex w-80 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600"
/>`}
        >
          <EmptyState
            icon={<span className="text-4xl">📭</span>}
            title="No documents"
            description="Upload a file to get started."
            variant="no-data"
            className="flex w-80 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">With actions</h2>
        <p className="docs-desc">
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
  className="flex w-80 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600"
/>`}
        >
          <EmptyState
            icon={<span className="text-4xl">🔍</span>}
            title="No results"
            description="Try a different search term."
            variant="no-results"
            primaryActionText="Clear filters"
            onPrimaryAction={() => alert('cleared')}
            className="flex w-80 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Dismissible error</h2>
        <p className="docs-desc">
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
  className="flex w-80 flex-col items-center justify-center gap-2 rounded-lg border border-red-300 p-8 text-center dark:border-red-800"
/>`}
        >
          <EmptyState
            variant="error"
            title="Something went wrong"
            description="We couldn't load your data."
            dismissible
            onDismiss={() => alert('dismissed')}
            className="flex w-80 flex-col items-center justify-center gap-2 rounded-lg border border-red-300 p-8 text-center dark:border-red-800"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
