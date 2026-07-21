'use client';

import { Resizable } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Resizable is backed by the headless useResizable hook. It manages width/
// height state, min/max constraints, aspect-ratio locking, grid snapping, and
// renders one handle per enabled edge/corner. The handles are positioned
// absolutely by the hook; the container itself ships no CSS, so give it a
// border/background to make the resize behaviour visible.
const boxClasses =
  'w-full h-full flex items-center justify-center rounded-md border ' +
  'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 ' +
  'text-sm text-gray-600 dark:text-gray-300 select-none';

export default function ResizablePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Resizable</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A draggable-resize container backed by the headless{' '}
          <code className="font-mono text-sm">useResizable</code> hook. It tracks
          width/height, applies min/max constraints, optional aspect-ratio
          locking and grid snapping, and renders one handle per enabled edge or
          corner with the correct <code>aria-roledescription</code>. The
          container ships no styles — give it a border so the resize handles have
          something to sit on.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Corner &amp; edge handles</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All eight handles (four edges + four corners). Drag any handle to
          resize; the live dimensions are read from <code>state.width</code> /
          <code>state.height</code>.
        </p>
        <Demo
          code={`<Resizable
  initialWidth={280}
  initialHeight={160}
  handles={['right','bottom','bottom-right','left','top','top-left','top-right','bottom-left']}
  handlesVisible
  className="border border-gray-300 rounded-md dark:border-gray-600"
>
  <div className={\`${boxClasses}\`}>Drag any edge or corner</div>
</Resizable>`}
        >
          <Resizable
            initialWidth={280}
            initialHeight={160}
            handles={['right', 'bottom', 'bottom-right', 'left', 'top', 'top-left', 'top-right', 'bottom-left']}
            handlesVisible
            className="border border-gray-300 rounded-md dark:border-gray-600"
          >
            <div className={boxClasses}>Drag any edge or corner</div>
          </Resizable>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Constrained &amp; single axis</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Restrict to the <code>right</code> handle for horizontal-only resizing,
          and clamp with <code>constraints</code> ({'{ min, max }'}) so the box
          can&apos;t collapse or run away.
        </p>
        <Demo
          code={`<Resizable
  initialWidth={200}
  initialHeight={120}
  handles={['right']}
  constraints={{ minWidth: 120, maxWidth: 400 }}
  handlesVisible
  className="border border-gray-300 rounded-md dark:border-gray-600"
>
  <div className={\`${boxClasses}\`}>Horizontal only, 120–400px</div>
</Resizable>`}
        >
          <Resizable
            initialWidth={200}
            initialHeight={120}
            handles={['right']}
            constraints={{ minWidth: 120, maxWidth: 400 }}
            handlesVisible
            className="border border-gray-300 rounded-md dark:border-gray-600"
          >
            <div className={boxClasses}>Horizontal only, 120–400px</div>
          </Resizable>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Aspect-ratio locked</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>constraints.aspectRatio</code> set, height tracks width to
          keep the box square (or any ratio) as you drag.
        </p>
        <Demo
          code={`<Resizable
  initialWidth={160}
  initialHeight={160}
  handles={['bottom-right']}
  constraints={{ aspectRatio: 1 }}
  handlesVisible
  className="border border-gray-300 rounded-md dark:border-gray-600"
>
  <div className={\`${boxClasses}\`}>Square (1:1)</div>
</Resizable>`}
        >
          <Resizable
            initialWidth={160}
            initialHeight={160}
            handles={['bottom-right']}
            constraints={{ aspectRatio: 1 }}
            handlesVisible
            className="border border-gray-300 rounded-md dark:border-gray-600"
          >
            <div className={boxClasses}>Square (1:1)</div>
          </Resizable>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'initialWidth / initialHeight', type: 'number', default: '—', description: 'Uncontrolled starting dimensions (px).' },
            { name: 'width / height', type: 'number', default: '—', description: 'Controlled dimensions.' },
            { name: 'handles', type: "HandlePosition[]", default: "['bottom','right','bottom-right']", description: "Edges/corners to render: 'top' | 'right' | 'bottom' | 'left' | corners." },
            { name: 'constraints', type: 'ResizeConstraints', default: '—', description: '{ minWidth, maxWidth, minHeight, maxHeight, aspectRatio, snap }.' },
            { name: 'direction', type: 'ResizeDirection', default: '—', description: 'Restrict resizing to a single axis (e.g. "horizontal").' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all resize handles.' },
            { name: 'handlesVisible', type: 'boolean', default: 'false', description: 'Always show handles instead of on hover.' },
            { name: 'handleSize', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size token for the default handle renderer.' },
            { name: 'onResize', type: '(width, height) => void', default: '—', description: 'Fires continuously during a drag.' },
            { name: 'onResizeStart / onResizeEnd', type: '(handle?, width, height) => void', default: '—', description: 'Fire at the start/end of a resize gesture.' },
            { name: 'renderHandle', type: '(handle, isActive, attrs, styles) => ReactNode', default: '—', description: 'Custom handle renderer.' },
          ]}
        />
      </section>
    </div>
  );
}
