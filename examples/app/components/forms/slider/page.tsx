'use client';

import { useState } from 'react';
import { Slider } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Slider is headless: useSlider provides pointer + keyboard dragging,
// min/max/step snapping, single-value and range modes, and ARIA slider roles.
// The default render ships empty classes, so theme it via the `render` prop,
// which hands back values, percentages, refs, handlers, and thumb attributes.
function TailwindSlider({ isRange, ...props }: { isRange?: boolean } & Record<string, unknown>) {
  return (
    <Slider
      {...props}
      isRange={isRange}
      className="w-full max-w-xs"
      render={(p) => {
        const min = Math.min(p.percentages[0], p.percentages[1]);
        const max = Math.max(p.percentages[0], p.percentages[1]);
        const thumbCount = isRange ? 2 : 1;
        return (
          <div className="w-full">
            <div
              ref={p.sliderRef}
              className="relative h-6 w-full flex items-center"
              onKeyDown={p.onKeyDown}
              onFocus={p.onFocus}
              onBlur={p.onBlur}
              onMouseDown={p.onMouseDown}
              onTouchStart={p.onTouchStart}
              onMouseEnter={p.onMouseEnter}
              onMouseLeave={p.onMouseLeave}
              {...p.sliderAttributes}
            >
              {/* track */}
              <div className={`h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 ${p.disabled ? 'opacity-50' : ''}`} />
              {/* filled range */}
              <div
                className="absolute h-1.5 rounded-full bg-blue-600"
                style={{ left: `${min}%`, width: `${Math.max(0, max - min)}%` }}
              />
              {/* thumbs */}
              {Array.from({ length: thumbCount }).map((_, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (p.thumbRefs[i]) (p.thumbRefs[i] as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  }}
                  className={`absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow dark:bg-gray-100 ` +
                    `transition-transform ${p.activeThumb === i ? 'scale-110' : ''} ` +
                    `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                  style={{ left: `${p.percentages[i]}%` }}
                  {...p.getThumbAttributes(i)}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{p.values[0]}</span>
              {isRange && <span>{p.values[1]}</span>}
            </div>
          </div>
        );
      }}
    />
  );
}

export default function SliderPage() {
  const [v, setV] = useState(40);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Slider</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A range slider backed by the headless{' '}
          <code className="font-mono text-sm">useSlider</code> hook. It handles
          pointer and keyboard dragging, min/max/step snapping, single-value and
          range (two-thumb) modes, and full ARIA{' '}
          <code className="font-mono text-sm">slider</code> semantics. The default
          render ships empty classes — theme it via the{' '}
          <code className="font-mono text-sm">render</code> prop.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A single-thumb slider with <code>min</code>, <code>max</code>, and{' '}
          <code>step</code>.
        </p>
        <Demo
          code={`<Slider
  min={0}
  max={100}
  step={1}
  defaultValue={40}
  className="w-full max-w-xs"
  render={(p) => (
    <div className="w-full">
      <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute h-1.5 rounded-full bg-blue-600"
          style={{ left: '0%', width: \`\${p.percentages[0]}%\` }}
        />
        <div
          ref={(el) => { p.thumbRefs[0].current = el; }}
          className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ left: \`\${p.percentages[0]}%\` }}
          {...p.getThumbAttributes(0)}
        />
      </div>
    </div>
  )}
/>`}
        >
          <TailwindSlider min={0} max={100} step={1} defaultValue={40} />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Range (two thumbs)</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>isRange</code> for a min/max selection; the value is a{' '}
          <code>[number, number]</code> tuple.
        </p>
        <Demo
          code={`<Slider
  isRange
  min={0}
  max={100}
  defaultValue={[20, 70]}
  className="w-full max-w-xs"
  render={(p) => {
    const min = Math.min(p.percentages[0], p.percentages[1]);
    const max = Math.max(p.percentages[0], p.percentages[1]);
    return (
      <div className="w-full">
        <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
          <div
            className="absolute h-1.5 rounded-full bg-blue-600"
            style={{ left: \`\${min}%\`, width: \`\${Math.max(0, max - min)}%\` }}
          />
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => { p.thumbRefs[i].current = el; }}
              className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ left: \`\${p.percentages[i]}%\` }}
              {...p.getThumbAttributes(i)}
            />
          ))}
        </div>
      </div>
    );
  }}
/>`}
        >
          <TailwindSlider isRange min={0} max={100} defaultValue={[20, 70]} />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled &amp; disabled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive value with <code>value</code> / <code>onValueChange</code>;
          <code> disabled</code> blocks interaction.
        </p>
        <Demo
          code={`const [v, setV] = useState(40);
<Slider value={v} onValueChange={setV} min={0} max={100} className="w-full max-w-xs" render={(p) => (
  <div className="w-full">
    <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="absolute h-1.5 rounded-full bg-blue-600" style={{ left: '0%', width: \`\${p.percentages[0]}%\` }} />
      <div ref={(el) => { p.thumbRefs[0].current = el; }} className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" style={{ left: \`\${p.percentages[0]}%\` }} {...p.getThumbAttributes(0)} />
    </div>
  </div>
)} />
<Slider disabled defaultValue={60} className="w-full max-w-xs" render={(p) => (
  <div className="w-full">
    <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 opacity-50" />
      <div className="absolute h-1.5 rounded-full bg-blue-600" style={{ left: '0%', width: \`\${p.percentages[0]}%\` }} />
      <div ref={(el) => { p.thumbRefs[0].current = el; }} className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow" style={{ left: \`\${p.percentages[0]}%\` }} {...p.getThumbAttributes(0)} />
    </div>
  </div>
)} />`}
        >
          <div className="w-full max-w-xs space-y-4">
            <TailwindSlider value={v} onValueChange={(nv: number) => setV(nv)} min={0} max={100} />
            <TailwindSlider disabled defaultValue={60} />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'value / defaultValue',
              type: 'number | [number, number]',
              default: '—',
              description: 'Controlled or uncontrolled value (tuple for range).',
            },
            {
              name: 'onValueChange',
              type: '(value: number | [number, number]) => void',
              default: '—',
              description: 'Called with the new value on change.',
            },
            {
              name: 'min / max',
              type: 'number',
              default: '0 / 100',
              description: 'Value bounds.',
            },
            {
              name: 'step',
              type: 'number',
              default: '1',
              description: 'Snapping increment.',
            },
            {
              name: 'isRange',
              type: 'boolean',
              default: 'false',
              description: 'Render two thumbs (min/max selection).',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Track orientation.',
            },
            {
              name: 'disabled / readOnly',
              type: 'boolean',
              default: 'false',
              description: 'Disables interaction; reflected to ARIA.',
            },
            {
              name: 'size / variant',
              type: "'sm' | 'md' | 'lg' / 'default' | 'solid' | 'outline'",
              default: "'md' / 'default'",
              description: 'Size and variant hooks.',
            },
            {
              name: 'render',
              type: '(props: SliderRenderProps) => ReactElement',
              default: '—',
              description: 'Escape-hatch custom renderer (values, percentages, refs, handlers).',
            },
          ]}
        />
      </section>
    </div>
  );
}
