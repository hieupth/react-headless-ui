import Link from 'next/link';
import { CodeBlock } from '@/components/code-block';
import { componentCategories, getComponentsByCategory } from '@/lib/component-meta';

// The package is unpublished; install from GitHub. Once published this becomes
// `npm install @hieupth/react-headless-ui` (see docs/getting-started.mdx and the root README).
const installCommand = 'npm install github:hieupth/react-headless-ui';

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
      'ThemeProvider exposes per-section shallow-merged design tokens (colors, radius, spacing) to renderer components.',
  },
  {
    title: 'Accessible',
    description:
      'Keyboard navigation, focus traps, ARIA wiring, and roles — audited against axe with zero violations.',
  },
  {
    title: 'Tree-shakeable',
    description:
      'Pure ESM with per-component exports and a peer-dep surface kept minimal.',
  },
];

const docLinks = [
  { label: 'Getting Started', href: '/docs/getting-started/' },
  { label: 'Theming', href: '/docs/theming/' },
];

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <span className="home-badge">Headless React UI primitives</span>
        <h1 className="home-title">@hieupth/react-headless-ui</h1>
        <p className="home-lead">
          Composition over inheritance. Fully accessible, unstyled React components,
          hooks, and mixins — themable via design tokens and tree-shakeable to the byte.
        </p>
        <div className="home-install">
          <CodeBlock code={installCommand} language="bash" />
        </div>
        <div className="home-actions">
          <Link href="/docs/getting-started/" className="button button-default button-lg">
            Get Started
          </Link>
          <Link href="/docs/theming/" className="button button-outline button-lg">
            Theming
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="home-section">
        <h2 className="docs-h2">Why react-headless-ui?</h2>
        <div className="home-grid">
          {features.map((feature) => (
            <div key={feature.title} className="home-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="home-section">
        <div className="home-grid">
          <div className="home-card">
            <h2 className="docs-h3">Documentation</h2>
            <ul className="home-list">
              {docLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="home-card">
            <h2 className="docs-h3">Components</h2>
            <ul className="home-list">
              {componentCategories.map((category) => (
                <li key={category}>
                  <span className="home-cat">{category}</span>
                  <span className="home-count">
                    {getComponentsByCategory(category).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
