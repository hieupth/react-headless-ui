'use client';

import { useState } from 'react';
import { Panel } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Panel renders a content surface with optional header / footer / actions and
// an expand-collapse mode. It composes a title, subtitle, icon, body, and
// footer; collapsible panels toggle via the header. Headless on CSS — theme
// through className.
export default function PanelPage() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A content surface backed by the headless{' '}
          <code className="font-mono text-sm">usePanel</code> hook. Panel
          composes a header (<code>title</code>, <code>subtitle</code>,{' '}
          <code>icon</code>, <code>actions</code>), a body, and an optional
          footer. Set <code>collapsible</code> to let the header toggle the body
          open/closed, with the expanded state controlled via{' '}
          <code>expanded</code>/<code>onToggle</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic panel</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>title</code> and <code>footer</code> populate the surrounding
          sections; children fill the body.
        </p>
        <Demo
          code={`<Panel title="Storage" footer="12 GB of 64 GB used">
  <p>Your documents and media.</p>
</Panel>`}
        >
          <Panel
            title="Storage"
            footer="12 GB of 64 GB used"
            className="w-80 border border-gray-200 dark:border-gray-700 rounded-lg [&_>div]:p-4"
          >
            <p className="text-sm">Your documents and media.</p>
          </Panel>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Collapsible</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>collapsible</code>, the header toggles the body. Drive it
          controlled via <code>expanded</code> + <code>onToggle</code>.
        </p>
        <Demo
          code={`const [expanded, setExpanded] = useState(true);

<Panel
  title="Details"
  collapsible
  expanded={expanded}
  onToggle={setExpanded}
>
  <p>Expandable content.</p>
</Panel>`}
        >
          <Panel
            title="Details"
            collapsible
            expanded={expanded}
            onToggle={setExpanded}
            className="w-80 border border-gray-200 dark:border-gray-700 rounded-lg [&_>div]:p-4 cursor-pointer"
          >
            <p className="text-sm">Expandable content.</p>
          </Panel>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With actions</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>actions</code> renders in the header next to the title.
        </p>
        <Demo
          code={`<Panel
  title="Notifications"
  actions={<button>Settings</button>}
>
  <p>You have 3 unread.</p>
</Panel>`}
        >
          <Panel
            title="Notifications"
            actions={<span className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded">Settings</span>}
            className="w-80 border border-gray-200 dark:border-gray-700 rounded-lg [&_>div]:p-4"
          >
            <p className="text-sm">You have 3 unread.</p>
          </Panel>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'title / subtitle', type: 'string', default: '—', description: 'Header heading and secondary text.' },
            { name: 'icon', type: 'ReactNode', default: '—', description: 'Leading header icon.' },
            { name: 'header / footer / actions', type: 'ReactNode', default: '—', description: 'Section content slots.' },
            { name: 'collapsible / expandable', type: 'boolean', default: 'false', description: 'Allow header-driven expand/collapse.' },
            { name: 'expanded / defaultExpanded', type: 'boolean', default: '—', description: 'Controlled / initial expanded state.' },
            { name: 'onToggle / onExpand / onCollapse', type: '() => void', default: '—', description: 'Expand/collapse callbacks.' },
            { name: 'showHeader / showFooter / showActions', type: 'boolean', default: '—', description: 'Section visibility toggles.' },
            { name: 'loading / disabled', type: 'boolean', default: 'false', description: 'Loading and disabled states.' },
            { name: 'animateHeight / animationDuration', type: 'boolean / number', default: '—', description: 'Animate body height changes.' },
            { name: 'renderHeader / renderBody / renderFooter', type: '(props) => ReactNode', default: '—', description: 'Custom section renderers.' },
          ]}
        />
      </section>
    </div>
  );
}
