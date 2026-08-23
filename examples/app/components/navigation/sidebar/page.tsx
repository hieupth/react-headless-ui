'use client';

import { Sidebar, SidebarItem, SidebarGroup, SidebarDivider } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Sidebar renders an app navigation rail, backed by useSidebar. It emits class
// hooks + transform-based variant classes but no real CSS — theme the rail via
// the `className` prop.
const sidebarCls =
  'w-64 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

export default function SidebarPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Sidebar</h1>
        <p className="docs-lead">
          An application navigation rail backed by the headless{' '}
          <code className="docs-code">useSidebar</code> hook. It supports
          three variants — <code>permanent</code> (always visible),{' '}
          <code>persistent</code> (toggleable, pushes content), and{' '}
          <code>temporary</code> (overlay on mobile) — plus left/right
          positioning, collapsible mode, responsive breakpoints, an optional
          overlay, and full keyboard support. Compose content with{' '}
          <code>SidebarItem</code>, <code>SidebarGroup</code>, and{' '}
          <code>SidebarDivider</code>. The renderer emits class hooks; apply
          your own styling.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Persistent sidebar</h2>
        <p className="docs-desc">
          Start open with <code>defaultOpen</code>; the rail manages its own
          open/collapse state internally. Pass <code>header</code>,{' '}
          <code>footer</code>, and <code>children</code> slots.
        </p>
        <Demo
          code={`<Sidebar
  className="w-64 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
  variant="persistent"
  position="left"
  defaultOpen
  header={<span className="font-semibold">react-headless-ui</span>}
  footer={<span className="text-xs">v0.1.0</span>}
>
  <SidebarGroup label="Components">
    <SidebarItem active>Tabs</SidebarItem>
    <SidebarItem>Menu</SidebarItem>
    <SidebarItem disabled>Combobox</SidebarItem>
  </SidebarGroup>
  <SidebarDivider />
  <SidebarGroup label="Docs">
    <SidebarItem>Getting started</SidebarItem>
  </SidebarGroup>
</Sidebar>`}
        >
          <div className="w-full">
            <Sidebar
              className={sidebarCls}
              variant="persistent"
              position="left"
              defaultOpen
              header={<span className="font-semibold text-sm">react-headless-ui</span>}
              footer={<span className="text-xs text-gray-500">v0.1.0</span>}
            >
              <SidebarGroup label="Components">
                <SidebarItem active>Tabs</SidebarItem>
                <SidebarItem>Menu</SidebarItem>
                <SidebarItem disabled>Combobox</SidebarItem>
              </SidebarGroup>
              <SidebarDivider />
              <SidebarGroup label="Docs">
                <SidebarItem>Getting started</SidebarItem>
              </SidebarGroup>
            </Sidebar>
            <p className="mt-3 text-xs text-gray-500">
              Structure + a11y render; the <code>className</code> themes the{' '}
              <code>sidebar-*</code> hooks.
            </p>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Temporary + responsive</h2>
        <p className="docs-desc">
          <code>variant="temporary"</code> slides over an overlay;{' '}
          <code>responsive</code> + <code>breakpoint</code> auto-switch to
          temporary on narrow screens. <code>closeOnOverlayClick</code> dismisses
          on backdrop tap.
        </p>
        <Demo
          code={`<Sidebar
  className="w-64 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
  variant="temporary"
  position="left"
  defaultOpen
  responsive
  breakpoint={768}
  showOverlay
  closeOnOverlayClick
  trigger={<button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">Menu</button>}
>
  <SidebarGroup label="Components">
    <SidebarItem>Tabs</SidebarItem>
    <SidebarItem>Menu</SidebarItem>
  </SidebarGroup>
</Sidebar>`}
        >
          <div className="w-full">
            <Sidebar
              className={sidebarCls}
              variant="temporary"
              position="left"
              defaultOpen
              responsive
              breakpoint={768}
              showOverlay
              closeOnOverlayClick
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Menu
                </button>
              }
            >
              <SidebarGroup label="Components">
                <SidebarItem>Tabs</SidebarItem>
                <SidebarItem>Menu</SidebarItem>
              </SidebarGroup>
              <SidebarDivider />
              <SidebarGroup label="Docs">
                <SidebarItem>Getting started</SidebarItem>
              </SidebarGroup>
            </Sidebar>
            <p className="mt-3 text-xs text-gray-500">
              A temporary rail starts open here so you can see it — toggle it
              with the cloned <code>trigger</code> button; on narrow viewports{' '}
              <code>responsive</code> + <code>breakpoint</code> switch to the
              overlay behavior automatically.
            </p>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'permanent' | 'persistent' | 'temporary'",
              default: "'persistent'",
              description: 'Visibility/push behavior.',
            },
            {
              name: 'position',
              type: "'left' | 'right'",
              default: "'left'",
              description: 'Side of the viewport the rail attaches to.',
            },
            {
              name: 'defaultOpen',
              type: 'boolean',
              default: '—',
              description: 'Whether the rail starts open (uncontrolled).',
            },
            {
              name: 'size',
              type: "SidebarSize ('sm'|'md'|'lg'|'xl')",
              default: "'md'",
              description: 'Rail width/density.',
            },
            {
              name: 'responsive / breakpoint',
              type: 'boolean / number',
              default: '—',
              description: 'Auto-switch to temporary below a viewport width.',
            },
            {
              name: 'showOverlay / closeOnOverlayClick',
              type: 'boolean',
              default: '—',
              description: 'Backdrop for temporary variant + click-to-close.',
            },
            {
              name: 'header / footer / children / trigger',
              type: 'ReactNode',
              default: '—',
              description: 'Composition slots for the rail.',
            },
          ]}
        />
      </section>
    </div>
  );
}
