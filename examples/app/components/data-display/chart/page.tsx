'use client';

import { Chart } from '@hieupth/react-headless-ui';
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
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Chart</h1>
        <p className="docs-lead">
          Lightweight SVG charts backed by the headless{' '}
          <code className="docs-code">useChart</code> hook. It draws{' '}
          <code>line</code>, <code>bar</code>, <code>area</code>,{' '}
          <code>pie</code>, and <code>scatter</code> charts from one or more{' '}
          <code>datasets</code>, computing scales, axes, legends, and optional
          tooltips. Because it renders inline SVG it appears unstyled-by-CSS —
          set dimensions and colors through props.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Line chart</h2>
        <p className="docs-desc">
          Each dataset is <code>{'{ label, data, color }'}</code> where data
          points are <code>{'{ x, y }'}</code>.
        </p>
        <Demo
          code={`<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
  <Chart
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
  />
</div>`}
        >
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <Chart type="line" width={400} height={200} datasets={lineDatasets} />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Bar chart</h2>
        <p className="docs-desc">
          Switch <code>type</code> to <code>bar</code> for categorical values.
        </p>
        <Demo
          code={`<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
  <Chart
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
  />
</div>`}
        >
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <Chart type="bar" width={400} height={200} datasets={barDatasets} />
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
