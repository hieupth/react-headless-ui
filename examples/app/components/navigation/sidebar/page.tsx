'use client';

import { Sidebar, SidebarItem, SidebarGroup, SidebarDivider } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Sidebar renders an app navigation rail, backed by useSidebar. It emits class
// hooks + transform-based variant classes but no real CSS — theme it.
export default function SidebarPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Sidebar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An application navigation rail backed by the headless{' '}
          <code className="font-mono text-sm">useSidebar</code> hook. It supports
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Persistent sidebar</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Start open with <code>defaultOpen</code>; the rail manages its own
          open/collapse state internally. Pass <code>header</code>,{' '}
          <code>footer</code>, and <code>children</code> slots.
        </p>
        <Demo
          code={`<Sidebar
  variant="persistent"
  position="left"
  defaultOpen
  header={<span className="font-semibold">reui</span>}
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
              variant="persistent"
              position="left"
              defaultOpen
              header={<span className="font-semibold text-sm">reui</span>}
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
              Structure + a11y render; theme the <code>sidebar-*</code> hooks for
              visuals.
            </p>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Temporary + responsive</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>variant="temporary"</code> slides over an overlay;{' '}
          <code>responsive</code> + <code>breakpoint</code> auto-switch to
          temporary on narrow screens. <code>closeOnOverlayClick</code> dismisses
          on backdrop tap.
        </p>
        <Demo
          code={`<Sidebar
  variant="temporary"
  responsive
  breakpoint={768}
  showOverlay
  closeOnOverlayClick
/>`}
        >
          <p className="text-sm text-gray-500">
            Temporary/responsive behavior is hook-driven — see the snippet.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
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
