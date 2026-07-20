'use client';

import { Chart } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Chart renders lightweight SVG line / bar / area / pie / scatter charts from
// datasets. The hook computes scales, axes, and tooltips; the component draws
// the SVG. It draws with inline SVG so it shows up without CSS — set width /
// height and colors via props.
const lineDatasets = [
  {
    label: 'Revenue',
    color: '#6366f1',
    data: [
      { x: 'Jan', y: 12 },
      { x: 'Feb', y: 18 },
      { x: 'Mar', y: 14 },
      { x: 'Apr', y: 22 },
      { x: 'May', y: 28 },
    ],
  },
];

const barDatasets = [
  {
    label: 'Signups',
    color: '#10b981',
    data: [
      { x: 'Mon', y: 30 },
      { x: 'Tue', y: 45 },
      { x: 'Wed', y: 25 },
      { x: 'Thu', y: 60 },
      { x: 'Fri', y: 38 },
    ],
  },
];

export default function ChartPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Chart</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Lightweight SVG charts backed by the headless{' '}
          <code className="font-mono text-sm">useChart</code> hook. It draws{' '}
          <code>line</code>, <code>bar</code>, <code>area</code>,{' '}
          <code>pie</code>, and <code>scatter</code> charts from one or more{' '}
          <code>datasets</code>, computing scales, axes, legends, and optional
          tooltips. Because it renders inline SVG it appears unstyled-by-CSS —
          set dimensions and colors through props.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Line chart</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each dataset is <code>{'{ label, data, color }'}</code> where data
          points are <code>{'{ x, y }'}</code>.
        </p>
        <Demo
          code={`<Chart
  type="line"
  width={400}
  height={200}
  datasets={[{
    label: 'Revenue',
    color: '#6366f1',
    data: [
      { x: 'Jan', y: 12 }, { x: 'Feb', y: 18 },
      { x: 'Mar', y: 14 }, { x: 'Apr', y: 22 }, { x: 'May', y: 28 }
    ]
  }]}
/>`}
        >
          <Chart type="line" width={400} height={200} datasets={lineDatasets} />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bar chart</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Switch <code>type</code> to <code>bar</code> for categorical values.
        </p>
        <Demo
          code={`<Chart
  type="bar"
  width={400}
  height={200}
  datasets={[{
    label: 'Signups',
    color: '#10b981',
    data: [
      { x: 'Mon', y: 30 }, { x: 'Tue', y: 45 }, { x: 'Wed', y: 25 },
      { x: 'Thu', y: 60 }, { x: 'Fri', y: 38 }
    ]
  }]}
/>`}
        >
          <Chart type="bar" width={400} height={200} datasets={barDatasets} />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'type', type: "'line' | 'bar' | 'pie' | 'area' | 'scatter'", default: "'line'", description: 'Chart kind.' },
            { name: 'datasets', type: 'ChartDataset[]', default: '—', description: 'Series: { label, data: {x,y}[], color?, fill? }.' },
            { name: 'width / height', type: 'number', default: '—', description: 'SVG dimensions.' },
            { name: 'xAxis / yAxis', type: 'ChartAxis', default: '—', description: 'Axis configuration (labels, ticks).' },
            { name: 'legend', type: 'ChartLegend', default: '—', description: 'Legend visibility and placement.' },
            { name: 'colors', type: 'string[]', default: '—', description: 'Override the default palette.' },
            { name: 'responsive', type: 'boolean', default: '—', description: 'Scale to the container width.' },
            { name: 'animated / animationDuration', type: 'boolean / number', default: '—', description: 'Enter animation controls.' },
            { name: 'showTooltips', type: 'boolean', default: '—', description: 'Render data-point tooltips.' },
            { name: 'onDataPointClick', type: '(dataset, point) => void', default: '—', description: 'Point click handler.' },
            { name: 'pointRenderer / barRenderer / lineRenderer', type: '(…) => ReactNode', default: '—', description: 'Replace the default SVG primitives.' },
          ]}
        />
      </section>
    </div>
  );
}
