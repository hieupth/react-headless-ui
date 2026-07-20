'use client';

import { useState } from 'react';
import { NavigationMenu } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// NavigationMenu renders a site nav with dropdown panels, backed by
// useNavigationMenu. It emits class hooks but no CSS — theme it.
const items = [
  {
    id: 'products',
    label: 'Products',
    children: [
      { id: 'reui', label: 'reui', description: 'Headless React primitives' },
      { id: 'forge', label: 'Forge', description: 'Design token studio' },
    ],
  },
  {
    id: 'docs',
    label: 'Docs',
    children: [
      { id: 'start', label: 'Getting started' },
      { id: 'theming', label: 'Theming' },
    ],
  },
  { id: 'pricing', label: 'Pricing' },
  { id: 'blog', label: 'Blog', disabled: true },
];

export default function NavigationMenuPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">NavigationMenu</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A site navigation bar with dropdown panels, backed by the headless{' '}
          <code className="font-mono text-sm">useNavigationMenu</code> hook. It
          supports horizontal/vertical layouts, mega-style dropdowns, a mobile
          breakpoint, optional search, active-item tracking, and full keyboard
          navigation. The renderer emits class hooks — apply your own styling.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Dropdown panels</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Nest items under <code>children</code> to define dropdown panels;
          <code>description</code> adds supporting text. Track activation with{' '}
          <code>onItemActivate</code>; <code>mobileBreakpoint</code> switches to
          a mobile menu below a width.
        </p>
        <Demo
          code={`const [active, setActive] = useState(null);

<NavigationMenu
  items={items}
  mobileBreakpoint={768}
  onItemActivate={(item) => setActive(item.id)}
/>`}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <NavigationMenu
              items={items}
              mobileBreakpoint={768}
              onItemActivate={(item) => setActive(item.id)}
            />
            <span className="text-xs text-gray-500">
              {active ? `Activated: ${active}` : 'Renders structure + a11y — theme it with CSS.'}
            </span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Search &amp; auto-close</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enable <code>enableSearch</code> for a filterable mega panel and{' '}
          <code>autoCloseDropdowns</code> to dismiss on blur.{' '}
          <code>onDropdownOpen</code> / <code>onDropdownClose</code> fire as
          panels appear.
        </p>
        <Demo
          code={`<NavigationMenu
  items={items}
  enableSearch
  autoCloseDropdowns
  onDropdownOpen={(id) => console.log('open', id)}
/>`}
        >
          <p className="text-sm text-gray-500">
            Search + auto-close are hook-level toggles — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'NavigationMenuItem[]',
              default: '—',
              description: 'Entries: { id, label, description?, href?, icon?, badge?, children?, active? }.',
            },
            {
              name: 'position',
              type: 'NavigationMenuPosition',
              default: '—',
              description: 'Placement of the bar (horizontal / vertical variants).',
            },
            {
              name: 'mobileBreakpoint',
              type: 'number',
              default: '—',
              description: 'Pixel width below which the mobile menu engages.',
            },
            {
              name: 'enableSearch',
              type: 'boolean',
              default: 'false',
              description: 'Render a search filter inside mega panels.',
            },
            {
              name: 'autoCloseDropdowns',
              type: 'boolean',
              default: '—',
              description: 'Dismiss open dropdowns when focus leaves.',
            },
            {
              name: 'onItemActivate',
              type: '(item: NavigationMenuItem) => void',
              default: '—',
              description: 'Fires when a leaf item is activated.',
            },
            {
              name: 'onDropdownOpen / onDropdownClose',
              type: '(itemId) => void / () => void',
              default: '—',
              description: 'Dropdown lifecycle callbacks.',
            },
          ]}
        />
      </section>
    </div>
  );
}
