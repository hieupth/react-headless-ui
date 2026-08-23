'use client';

import { useState } from 'react';
import { NavigationMenu } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// NavigationMenu renders a site nav with dropdown panels, backed by
// useNavigationMenu. It emits class hooks but no CSS — theme the bar via the
// `className` prop.
const navMenuCls =
  'flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

const items = [
  {
    id: 'products',
    label: 'Products',
    children: [
      { id: 'react-headless-ui', label: 'react-headless-ui', description: 'Headless React primitives' },
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
  const [dropdownEvent, setDropdownEvent] = useState<string | null>(null);

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">NavigationMenu</h1>
        <p className="docs-lead">
          A site navigation bar with dropdown panels, backed by the headless{' '}
          <code className="docs-code">useNavigationMenu</code> hook. It
          supports horizontal/vertical layouts, mega-style dropdowns, a mobile
          breakpoint, optional search, active-item tracking, and full keyboard
          navigation. The renderer emits class hooks — apply your own styling.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Dropdown panels</h2>
        <p className="docs-desc">
          Nest items under <code>children</code> to define dropdown panels;
          <code>description</code> adds supporting text. Track activation with{' '}
          <code>onItemActivate</code>; <code>mobileBreakpoint</code> switches to
          a mobile menu below a width.
        </p>
        <Demo
          code={`<NavigationMenu
  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  mobileBreakpoint={768}
  onItemActivate={(item) => setActive(item.id)}
/>`}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <NavigationMenu
              className={navMenuCls}
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

      <section className="docs-section">
        <h2 className="docs-h2">Search &amp; auto-close</h2>
        <p className="docs-desc">
          Enable <code>enableSearch</code> for a filterable mega panel and{' '}
          <code>autoCloseDropdowns</code> to dismiss on blur.{' '}
          <code>onDropdownOpen</code> / <code>onDropdownClose</code> fire as
          panels appear.
        </p>
        <Demo
          code={`<NavigationMenu
  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  items={items}
  enableSearch
  autoCloseDropdowns
  onDropdownOpen={(id) => console.log('open', id)}
/>`}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <NavigationMenu
              className={navMenuCls}
              items={items}
              enableSearch
              autoCloseDropdowns
              onDropdownOpen={(id) => setDropdownEvent(`open: ${id}`)}
              onDropdownClose={() => setDropdownEvent('close')}
            />
            <span className="text-xs text-gray-500">
              {dropdownEvent
                ? `Last dropdown event: ${dropdownEvent}`
                : 'enableSearch filters mega panels; autoCloseDropdowns dismisses on blur.'}
            </span>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
