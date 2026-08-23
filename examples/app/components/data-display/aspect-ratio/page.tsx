'use client';

import { AspectRatio } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// AspectRatio constrains its children to a fixed width/height ratio (default
// 16/9). It measures its container and computes the matching height to prevent
// layout shift. Headless on CSS — it sets the box; style the child.
export default function AspectRatioPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">AspectRatio</h1>
        <p className="docs-lead">
          A container that locks its children to a fixed width/height ratio,
          backed by the headless{' '}
          <code className="docs-code">useAspectRatio</code> hook. The
          default ratio is <code>16/9</code>; pass <code>ratio</code> to change
          it. The hook measures the container width and computes the matching
          height to prevent layout shift while media loads.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">16:9 (default)</h2>
        <p className="docs-desc">
          Without a fixed ratio, images and embeds cause cumulative layout
          shift; AspectRatio reserves the space up front.
        </p>
        <Demo
          code={`<AspectRatio ratio={16 / 9} className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" alt="A landscape" className="h-full w-full object-cover" />
</AspectRatio>`}
        >
          <div className="w-80">
            <AspectRatio ratio={16 / 9} className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                16 : 9
              </div>
            </AspectRatio>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Custom ratios</h2>
        <p className="docs-desc">
          <code>ratio</code> is width divided by height — 1 for a square, 4/3
          for classic video, 21/9 for cinematic.
        </p>
        <Demo
          code={`<AspectRatio ratio={1} className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
  <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold">1 : 1</div>
</AspectRatio>
<AspectRatio ratio={4 / 3} className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
  <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white text-sm font-semibold">4 : 3</div>
</AspectRatio>`}
        >
          <div className="flex gap-3 w-full">
            <div className="flex-1">
              <AspectRatio ratio={1} className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold">1 : 1</div>
              </AspectRatio>
            </div>
            <div className="flex-1">
              <AspectRatio ratio={4 / 3} className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white text-sm font-semibold">4 : 3</div>
              </AspectRatio>
            </div>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Responsive media</h2>
        <p className="docs-desc">
          Embed videos and maps so they scale with the column width while
          keeping their shape.
        </p>
        <Demo
          code={`<AspectRatio ratio={16 / 9} className="relative w-full overflow-hidden rounded-lg bg-gray-800 dark:bg-gray-700">
  <iframe src="https://example.com/video" title="Demo" className="h-full w-full" />
</AspectRatio>`}
        >
          <div className="w-72">
            <AspectRatio ratio={16 / 9} className="relative w-full overflow-hidden rounded-lg bg-gray-800 dark:bg-gray-700">
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-sm">
                iframe / video goes here
              </div>
            </AspectRatio>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            { name: 'ratio', type: 'number', default: '16 / 9', description: 'Width / height ratio (e.g. 1, 4/3, 21/9).' },
            { name: 'children', type: 'ReactNode', default: '—', description: 'Content constrained to the ratio.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable dimension recalculation.' },
            { name: 'className', type: 'string', default: '—', description: 'Additional container classes.' },
          ]}
        />
      </section>
    </div>
  );
}
