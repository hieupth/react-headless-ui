'use client';

import { Tabs } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Tabs is headless: it emits semantic class hooks (tabs-container, tabs-list,
// tabs-content) and ARIA, but ships no styles. The showcase themes it with
// Tailwind by targeting those hooks + the data-* attributes the trigger
// buttons emit.
const tabsBase =
  'flex border-b border-gray-200 dark:border-gray-700 gap-1';
const panelBase = 'pt-4 text-sm text-gray-700 dark:text-gray-300';

const accountItems = [
  {
    key: 'account',
    label: 'Account',
    content: <p className={panelBase}>Manage your account settings and profile.</p>,
  },
  {
    key: 'password',
    label: 'Password',
    content: <p className={panelBase}>Change your password and enable 2FA.</p>,
  },
  {
    key: 'team',
    label: 'Team',
    content: <p className={panelBase}>Invite members and manage roles.</p>,
    disabled: true,
  },
];

export default function TabsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Tabs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A tabbed panel switcher backed by the headless{' '}
          <code className="font-mono text-sm">useTabs</code> hook. It handles
          arrow-key navigation, roving tab focus, automatic/manual activation,
          and full ARIA wiring (<code>role="tablist"</code> /{' '}
          <code>tab</code> / <code>tabpanel</code> with{' '}
          <code>aria-controls</code>). The renderer emits semantic class hooks
          (<code>tabs-container</code>, <code>tabs-list</code>,{' '}
          <code>tabs-content</code>) — theme them, or use the compound{' '}
          <code>Tabs.List</code> / <code>Tabs.Trigger</code> /{' '}
          <code>Tabs.Content</code> API.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Items API</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass an <code>items</code> array (each with <code>key</code>,{' '}
          <code>label</code>, <code>content</code>). Control selection with{' '}
          <code>value</code> / <code>defaultValue</code> +{' '}
          <code>onValueChange</code>. Disabled items are skipped by the keyboard.
        </p>
        <Demo
          code={`<Tabs
  defaultValue="account"
  items={[
    { key: 'account', label: 'Account', content: <p>Manage your account.</p> },
    { key: 'password', label: 'Password', content: <p>Change your password.</p> },
    { key: 'team', label: 'Team', content: <p>Manage your team.</p>, disabled: true }
  ]}
/>`}
        >
          {/* Tabs renders structure + a11y; theme the emitted hooks with Tailwind. */}
          <div className="w-full">
            <Tabs
              defaultValue="account"
              items={accountItems}
              className={tabsBase}
            />
            <p className="mt-3 text-xs text-gray-500">
              Note: the default renderer ships minimal styling — apply your own
              classes via the <code>className</code> prop or a{' '}
              <code>render</code> function.
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Compound API &amp; variants</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compose with <code>&lt;Tabs.List&gt;</code>,{' '}
          <code>&lt;Tabs.Trigger&gt;</code>, and{' '}
          <code>&lt;Tabs.Content&gt;</code>. Set{' '}
          <code>variant</code> (<code>default</code> | <code>underline</code> |{' '}
          <code>pills</code> | <code>enclosed</code>) and{' '}
          <code>orientation="vertical"</code> for a side tab list.
        </p>
        <Demo
          code={`<Tabs defaultValue="overview" variant="pills">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Overview panel</Tabs.Content>
  <Tabs.Content value="activity">Activity panel</Tabs.Content>
</Tabs>`}
        >
          <p className="text-sm text-gray-500">
            The compound children are collected by the parent{' '}
            <code>&lt;Tabs&gt;</code> and matched by <code>value</code> — see the
            snippet for the API shape.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'items',
              type: 'TabItem[]',
              default: '—',
              description: 'Tab definitions: { key, label, content, disabled, icon, badge }.',
            },
            {
              name: 'value / defaultValue',
              type: 'string',
              default: '—',
              description: 'Controlled / uncontrolled selected tab key.',
            },
            {
              name: 'onValueChange',
              type: '(value: string) => void',
              default: '—',
              description: 'Fires when the selected tab changes.',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Layout of the tab list (also affects arrow-key axis).',
            },
            {
              name: 'activationMode',
              type: "'automatic' | 'manual'",
              default: "'automatic'",
              description: 'Whether focus or both focus+Enter activates a tab.',
            },
            {
              name: 'variant',
              type: "'default' | 'underline' | 'pills' | 'enclosed'",
              default: "'default'",
              description: 'Visual variant (emitted as hooks for styling).',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Density of the tab list.',
            },
            {
              name: 'showContent',
              type: 'boolean',
              default: 'true',
              description: 'Whether to render the matching tab panels.',
            },
            {
              name: 'animated',
              type: 'boolean',
              default: 'true',
              description: 'Animate panel transitions on switch.',
            },
          ]}
        />
      </section>
    </div>
  );
}
