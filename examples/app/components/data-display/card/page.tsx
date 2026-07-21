'use client';

import { Card } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Card renders a real container <div> with header / body / footer sub-nodes.
// It is headless on CSS — theme it through className. Interactive cards wire
// role="button" + keyboard activation via the underlying useCard hook.
export default function CardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Card</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A surface container backed by the headless{' '}
          <code className="font-mono text-sm">useCard</code> hook. It composes a
          header (title + subtitle + actions), a body (description + children),
          and a footer, with four variants and interactive/hoverable/selected
          states. Pass <code>interactive</code> to make the whole card clickable
          with full keyboard support; otherwise it renders as{' '}
          <code>role="article"</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic card</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>title</code>, <code>subtitle</code>, <code>description</code>,
          and <code>footer</code> populate the default sections.
        </p>
        <Demo
          code={`<Card
  title="Monthly report"
  subtitle="Q2 2026"
  description="Revenue is up 12% versus last quarter."
  footer="Updated 2 hours ago"
  className="w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
/>`}
        >
          <Card
            title="Monthly report"
            subtitle="Q2 2026"
            description="Revenue is up 12% versus last quarter."
            footer="Updated 2 hours ago"
            className="w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant</code> selects <code>default</code>,{' '}
          <code>outlined</code>, <code>elevated</code>, or{' '}
          <code>filled</code>. Here the styling is supplied by Tailwind since
          the component ships no CSS.
        </p>
        <Demo
          code={`<Card variant="outlined" title="Outlined" description="Border-only." className="w-44 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-900" />
<Card variant="filled" title="Filled" description="Solid surface." className="w-44 rounded-lg bg-gray-100 p-4 dark:bg-gray-800" />`}
        >
          <div className="flex gap-4">
            <Card variant="outlined" title="Outlined" description="Border-only." className="w-44 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-900" />
            <Card variant="filled" title="Filled" description="Solid surface." className="w-44 rounded-lg bg-gray-100 p-4 dark:bg-gray-800" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive card</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>interactive</code> to make the card focusable and
          Enter/Space activatable. <code>actions</code> renders in the header.
        </p>
        <Demo
          code={`<Card
  interactive
  title="Click me"
  description="Entire card is a button."
  actions={<button>Star</button>}
  onClick={() => alert('Card clicked')}
  className="w-72 cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
/>`}
        >
          <Card
            interactive
            title="Click me"
            description="Entire card is a button."
            actions={<span className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600">Star</span>}
            onClick={() => alert('Card clicked')}
            className="w-72 cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'title', type: 'string', default: '—', description: 'Card heading.' },
            { name: 'subtitle', type: 'string', default: '—', description: 'Secondary heading under the title.' },
            { name: 'description', type: 'string', default: '—', description: 'Body paragraph above children.' },
            { name: 'variant', type: "'default' | 'outlined' | 'elevated' | 'filled'", default: "'default'", description: 'Visual variant hook.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Density hook.' },
            { name: 'footer', type: 'ReactNode', default: '—', description: 'Footer section content.' },
            { name: 'actions', type: 'ReactNode', default: '—', description: 'Header action slot.' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'Makes the card clickable with role="button".' },
            { name: 'hoverable', type: 'boolean', default: '= interactive', description: 'Whether to emit hover state.' },
            { name: 'selected / disabled', type: 'boolean', default: 'false', description: 'Selection and disabled flags.' },
            { name: 'onClick', type: '() => void', default: '—', description: 'Click handler (interactive cards).' },
            { name: 'render / renderHeader / renderBody / renderFooter', type: '(props) => ReactNode', default: '—', description: 'Replace any default section renderer.' },
          ]}
        />
      </section>
    </div>
  );
}
