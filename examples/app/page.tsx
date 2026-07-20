import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { componentCategories, getComponentsByCategory } from '@/lib/component-meta';

const installCommand = 'npm install @hieupth/reui';

const features = [
  {
    title: 'Headless',
    description:
      'Behavior, state, and a11y — no styles baked in. Bring your own Tailwind, CSS Modules, or plain CSS.',
  },
  {
    title: 'Hooks',
    description:
      'Every component is backed by a composable hook (useButton, useDialog, useTabs, …) for full control.',
  },
  {
    title: 'Mixins',
    description:
      'Reusable prop-presets and behavior mixins compose onto any component without inheritance.',
  },
  {
    title: 'Theming',
    description:
      'ThemeProvider exposes deep-merged design tokens (colors, radius, spacing) to renderer components.',
  },
  {
    title: 'Accessible',
    description:
      'Keyboard navigation, focus traps, ARIA wiring, and roles — audited against axe with zero violations.',
  },
  {
    title: 'Tree-shakeable',
    description:
      'Pure ESM with per-component exports and opt-in peer deps (framer-motion, react-hook-form).',
  },
];

const docLinks = [
  { label: 'Getting Started', href: '/docs/getting-started/' },
  { label: 'Theming', href: '/docs/theming/' },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <span className="mb-4 inline-block rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
          Headless React UI primitives
        </span>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">@hieupth/reui</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Composition over inheritance. Fully accessible, unstyled React components,
          hooks, and mixins — themable via design tokens and tree-shakeable to the byte.
        </p>
        <div className="mt-8 w-full max-w-xl text-left">
          <CodeBlock code={installCommand} language="bash" />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/getting-started/"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Get Started
          </Link>
          <Link
            href="/docs/theming/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Theming
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-20">
        <h2 className="text-2xl font-semibold">Why reui?</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-gray-200 p-5 dark:border-gray-700"
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Documentation</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {docLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-700 underline-offset-2 hover:underline dark:text-gray-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Components</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {componentCategories.map((category) => (
              <li key={category}>
                <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {getComponentsByCategory(category).length}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
