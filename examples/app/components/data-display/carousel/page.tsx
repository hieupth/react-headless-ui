'use client';

import { Carousel } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Carousel renders a sliding track of children with prev/next arrows and dot
// indicators. The hook owns the active index, infinite loop, auto-play, and
// keyboard navigation; the component wires the track + controls. Headless on
// CSS — theme slides through className.
const slides = [
  { key: '1', label: 'First', tone: 'bg-indigo-500' },
  { key: '2', label: 'Second', tone: 'bg-emerald-500' },
  { key: '3', label: 'Third', tone: 'bg-amber-500' },
];

export default function CarouselPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Carousel</h1>
        <p className="docs-lead">
          A sliding-content carousel backed by the headless{' '}
          <code className="docs-code">useCarousel</code> hook. It
          tracks the active slide, supports <code>itemsPerView</code>,{' '}
          <code>loop</code>, <code>autoPlay</code> (with{' '}
          <code>pauseOnHover</code>), and arrow-key navigation, and renders
          optional prev/next arrows and dot indicators. Each slide is a child;
          the component lays them out in a translated track.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Basic carousel</h2>
        <p className="docs-desc">
          Pass slides as an array of children. Arrows and dots are on by
          default.
        </p>
        <Demo
          code={`<Carousel className="w-72 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 [&_.slide]:flex [&_.slide]:h-32 [&_.slide]:items-center [&_.slide]:justify-center [&_.slide]:font-semibold [&_.slide]:text-white">
  <div className="slide bg-indigo-500">First</div>
  <div className="slide bg-emerald-500">Second</div>
  <div className="slide bg-amber-500">Third</div>
</Carousel>`}
        >
          <Carousel className="w-72 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden [&_.slide]:h-32 [&_.slide]:flex [&_.slide]:items-center [&_.slide]:justify-center [&_.slide]:text-white [&_.slide]:font-semibold">
            {slides.map((s) => (
              <div key={s.key} className={`slide h-32 flex items-center justify-center text-white font-semibold ${s.tone}`}>
                {s.label}
              </div>
            ))}
          </Carousel>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Looping &amp; auto-play</h2>
        <p className="docs-desc">
          <code>loop</code> wraps the track end-to-start;{' '}
          <code>autoPlay</code> (ms) advances automatically.
        </p>
        <Demo
          code={`<Carousel loop autoPlay={2500} pauseOnHover showDots className="w-72 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 [&_.slide]:flex [&_.slide]:h-32 [&_.slide]:items-center [&_.slide]:justify-center [&_.slide]:font-semibold [&_.slide]:text-white">
  {/* slides */}
</Carousel>`}
        >
          <Carousel loop autoPlay={2500} pauseOnHover showDots className="w-72 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden [&_.slide]:h-32 [&_.slide]:flex [&_.slide]:items-center [&_.slide]:justify-center [&_.slide]:text-white [&_.slide]:font-semibold">
            {slides.map((s) => (
              <div key={s.key} className={`slide h-32 flex items-center justify-center text-white font-semibold ${s.tone}`}>
                {s.label}
              </div>
            ))}
          </Carousel>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Multiple per view</h2>
        <p className="docs-desc">
          <code>itemsPerView</code> shows several slides at once;{' '}
          <code>spacing</code> adds gutters between them.
        </p>
        <Demo
          code={`<Carousel itemsPerView={2} spacing={8} showArrows className="w-72 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 [&_.slide]:flex [&_.slide]:h-32 [&_.slide]:items-center [&_.slide]:justify-center [&_.slide]:font-semibold [&_.slide]:text-white">
  {/* slides */}
</Carousel>`}
        >
          <Carousel itemsPerView={2} spacing={8} showArrows showDots={false} className="w-72 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden [&_.slide]:h-32 [&_.slide]:flex [&_.slide]:items-center [&_.slide]:justify-center [&_.slide]:text-white [&_.slide]:font-semibold">
            {slides.map((s) => (
              <div key={s.key} className={`slide h-32 flex items-center justify-center text-white font-semibold ${s.tone}`}>
                {s.label}
              </div>
            ))}
          </Carousel>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            { name: 'children', type: 'ReactNode[]', default: '—', description: 'Slides to render in the track.' },
            { name: 'itemsPerView', type: 'number', default: '1', description: 'Slides visible per view.' },
            { name: 'spacing', type: 'number', default: '0', description: 'Pixel gutter between slides.' },
            { name: 'loop', type: 'boolean', default: 'false', description: 'Wrap end-to-start infinitely.' },
            { name: 'autoPlay', type: 'number', default: '—', description: 'Auto-advance interval in ms.' },
            { name: 'pauseOnHover', type: 'boolean', default: 'false', description: 'Pause auto-play while hovered.' },
            { name: 'showArrows / showDots', type: 'boolean', default: 'true', description: 'Render prev/next arrows and dot indicators.' },
            { name: 'animationDuration / animationEasing', type: 'number / string', default: '—', description: 'Slide transition controls.' },
            { name: 'onSlideChange', type: '(index: number) => void', default: '—', description: 'Fires when the active slide changes.' },
            { name: 'onStart / onEnd', type: '() => void', default: '—', description: 'Fires when the track reaches its start / end.' },
            { name: 'PreviousArrow / NextArrow / DotIndicator', type: 'React.FC', default: '—', description: 'Custom control renderers.' },
          ]}
        />
      </section>
    </div>
  );
}
