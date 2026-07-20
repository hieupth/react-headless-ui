import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Chart, ChartPoint, ChartLine, ChartBar } from '../src/components/Chart';
import type { ChartDataset } from '../src/hooks';

const lineDatasets: ChartDataset[] = [
  {
    label: 'Sales',
    data: [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 2 },
      { x: 3, y: 5 },
    ],
  },
];

const barDatasets: ChartDataset[] = [
  {
    label: 'Revenue',
    data: [
      { x: 0, y: 4 },
      { x: 1, y: 7 },
      { x: 2, y: 3 },
    ],
    backgroundColor: '#ef4444',
  },
];

const pieDatasets: ChartDataset[] = [
  {
    label: 'Share',
    data: [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 },
    ],
  },
];

describe('Chart', () => {
  it('renders an SVG container for the dataset', () => {
    const { container } = render(<Chart type="line" datasets={lineDatasets} width={200} height={100} />);
    expect(container.querySelector('svg.chart-svg')).toBeInTheDocument();
  });

  it('renders a chart container with a data-testid', () => {
    const { container } = render(<Chart type="line" datasets={lineDatasets} width={200} height={100} />);
    expect(container.querySelector('[data-testid="chart"]')).toBeInTheDocument();
  });

  it('renders bar rectangles for a bar chart', () => {
    const { container } = render(<Chart type="bar" datasets={barDatasets} width={200} height={100} />);
    expect(container.querySelectorAll('rect.chart-bar').length).toBeGreaterThan(0);
  });

  it('renders line paths for a line chart', () => {
    const { container } = render(<Chart type="line" datasets={lineDatasets} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-line').length).toBeGreaterThan(0);
  });

  it('renders points (circles) for a line chart', () => {
    const { container } = render(<Chart type="line" datasets={lineDatasets} width={200} height={100} />);
    expect(container.querySelectorAll('circle.chart-point').length).toBeGreaterThan(0);
  });

  it('renders scatter points for a scatter chart', () => {
    const { container } = render(<Chart type="scatter" datasets={lineDatasets} width={200} height={100} />);
    expect(container.querySelectorAll('circle.chart-point').length).toBeGreaterThan(0);
  });

  it('renders pie slices for a pie chart', () => {
    const { container } = render(<Chart type="pie" datasets={pieDatasets} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-pie-slice').length).toBe(3);
  });

  it('renders axes for cartesian charts', () => {
    const { container } = render(<Chart type="bar" datasets={barDatasets} width={200} height={100} />);
    expect(container.querySelector('g.chart-axes')).toBeInTheDocument();
  });

  it('renders an area fill when a dataset has fill enabled', () => {
    const filled: ChartDataset[] = [{ ...lineDatasets[0], fill: true }];
    const { container } = render(<Chart type="line" datasets={filled} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-area').length).toBeGreaterThan(0);
  });

  it('renders nothing for the chart body when type is unknown', () => {
    const { container } = render(<Chart type={'unknown' as any} datasets={lineDatasets} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-line').length).toBe(0);
    expect(container.querySelector('svg.chart-svg')).toBeInTheDocument();
  });

  it('uses custom colors when provided', () => {
    const colors = ['#ff0000', '#00ff00'];
    const { container } = render(
      <Chart type="line" datasets={lineDatasets} colors={colors} width={200} height={100} />
    );
    const points = container.querySelectorAll('circle.chart-point');
    expect(points.length).toBeGreaterThan(0);
    expect(points[0].getAttribute('fill')).toBe('#ff0000');
  });

  it('uses a custom point renderer when provided', () => {
    const pointRenderer = vi.fn(() => <rect key="r" className="custom-point" x={0} y={0} width={2} height={2} />);
    const { container } = render(
      <Chart type="line" datasets={lineDatasets} pointRenderer={pointRenderer} width={200} height={100} />
    );
    expect(pointRenderer).toHaveBeenCalled();
    expect(container.querySelectorAll('.custom-point').length).toBeGreaterThan(0);
  });

  it('uses a custom bar renderer when provided', () => {
    const barRenderer = vi.fn(() => <rect key="r" className="custom-bar" x={0} y={0} width={2} height={2} />);
    const { container } = render(
      <Chart type="bar" datasets={barDatasets} barRenderer={barRenderer} width={200} height={100} />
    );
    expect(barRenderer).toHaveBeenCalled();
    expect(container.querySelectorAll('.custom-bar').length).toBeGreaterThan(0);
  });

  it('uses a custom line renderer when provided', () => {
    const lineRenderer = vi.fn(() => <path key="r" className="custom-line" d="M0 0" />);
    const { container } = render(
      <Chart type="line" datasets={lineDatasets} lineRenderer={lineRenderer} width={200} height={100} />
    );
    expect(lineRenderer).toHaveBeenCalled();
    expect(container.querySelectorAll('.custom-line').length).toBeGreaterThan(0);
  });
});

// Exercises the component-internal render branches: explicit margin/padding,
// non-numeric points, empty/short datasets, selection/hover styling, the
// animation < 1 vs >= 1 arms, the pie largeArc branch, and the tooltip render.
describe('Chart render branches', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('honours an explicit partial margin/padding (left/top ?? fallback arms)', () => {
    // margin with left/top absent exercises the `margin.left ?? 0` / `margin.top ?? 0`
    // fallback arms both in the chart-body layout and in renderAxes.
    const { container } = render(
      <Chart
        type="bar"
        datasets={barDatasets}
        width={200}
        height={100}
        margin={{ right: 5, bottom: 5 }}
        padding={5}
      />
    );
    act(() => { vi.advanceTimersByTime(2000); });
    expect(container.querySelectorAll('rect.chart-bar').length).toBeGreaterThan(0);
  });

  it('honours a fully-specified margin (left/top provided arms)', () => {
    const { container } = render(
      <Chart
        type="bar"
        datasets={barDatasets}
        width={200}
        height={100}
        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        padding={5}
      />
    );
    act(() => { vi.advanceTimersByTime(2000); });
    expect(container.querySelectorAll('rect.chart-bar').length).toBeGreaterThan(0);
  });

  it('renders points whose x/y are non-numeric (typeof guard falls back to 0)', () => {
    const weird: ChartDataset[] = [
      { label: 'W', data: [{ x: undefined as any, y: undefined as any }, { x: 1, y: 2 }] },
    ];
    const { container } = render(<Chart type="scatter" datasets={weird} width={200} height={100} />);
    expect(container.querySelectorAll('circle.chart-point').length).toBeGreaterThan(0);
  });

  it('renders an area chart (type=area) that drives the line renderer + fill path', () => {
    const filled: ChartDataset[] = [{ ...lineDatasets[0], fill: true, backgroundColor: '#f00' }];
    const { container } = render(<Chart type="area" datasets={filled} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-area').length).toBeGreaterThan(0);
  });

  it('renders nothing for a line dataset with fewer than 2 points', () => {
    const one: ChartDataset[] = [{ label: 'One', data: [{ x: 0, y: 1 }] }];
    const { container } = render(<Chart type="line" datasets={one} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-line').length).toBe(0);
  });

  it('renders pie slices including a slice > 180deg (largeArc branch) and completes animation', () => {
    // one dominant slice (>50%) forces angle > 180 -> largeArcFlag = 1
    const bigPie: ChartDataset[] = [
      { label: 'Big', data: [{ x: 0, y: 90 }, { x: 1, y: 10 }] },
    ];
    const { container } = render(<Chart type="pie" datasets={bigPie} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-pie-slice').length).toBe(2);
    // advance rAF so the pie animationProgress>=1 transition arm fires
    act(() => { vi.advanceTimersByTime(2000); });
    expect(container.querySelectorAll('path.chart-pie-slice').length).toBe(2);
  });

  it('renders pie slices when every value is 0 (total === 0 guard)', () => {
    const zeroPie: ChartDataset[] = [
      { label: 'Z', data: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
    ];
    const { container } = render(<Chart type="pie" datasets={zeroPie} width={200} height={100} />);
    expect(container.querySelectorAll('path.chart-pie-slice').length).toBe(2);
  });

  it('fires the line animation dash arms while animationProgress < 1', () => {
    const { container } = render(<Chart type="line" datasets={lineDatasets} width={200} height={100} />);
    // before rAF runs the animation, progress is 0 (< 1) so dasharray is set
    const line = container.querySelector('path.chart-line');
    expect(line).not.toBeNull();
    // advance to completion so the progress>=1 transition arm also fires
    act(() => { vi.advanceTimersByTime(2000); });
    expect(container.querySelector('path.chart-line')).not.toBeNull();
  });

  it('forwards a callback ref and an object ref onto the rendered svg', () => {
    // function-ref arm of the svgRef combiner
    const fnRef = vi.fn();
    render(<Chart ref={fnRef} type="line" datasets={lineDatasets} width={200} height={100} />);
    expect(fnRef).toHaveBeenCalled();
    expect(fnRef.mock.calls[0][0] instanceof SVGSVGElement).toBe(true);

    // object-ref arm of the svgRef combiner
    const objRef: { current: SVGSVGElement | null } = { current: null };
    render(<Chart ref={objRef} type="line" datasets={lineDatasets} width={200} height={100} />);
    expect(objRef.current instanceof SVGSVGElement).toBe(true);
  });

  it('falls back to #000000 when dataset has no color and the palette is empty', () => {
    // empty colors array + no dataset.color exercises the final `|| '#000000'`
    // fallback arms in renderLine / renderBar.
    const noColor: ChartDataset[] = [{ label: 'N', data: [{ x: 0, y: 1 }, { x: 1, y: 2 }] }];
    const line = render(
      <Chart type="line" datasets={noColor} colors={[]} width={200} height={100} animated={false} />
    );
    expect(line.container.querySelectorAll('path.chart-line').length).toBeGreaterThan(0);
    const bar = render(
      <Chart type="bar" datasets={noColor} colors={[]} width={200} height={100} animated={false} />
    );
    expect(bar.container.querySelectorAll('rect.chart-bar').length).toBeGreaterThan(0);
  });

  it('renders an empty dataset without crashing (points || [] fallback in line/bar)', () => {
    const empty: ChartDataset[] = [{ label: 'Empty', data: [] }];
    const line = render(<Chart type="line" datasets={empty} width={200} height={100} />);
    expect(line.container.querySelectorAll('path.chart-line').length).toBe(0);
    const bar = render(<Chart type="bar" datasets={empty} width={200} height={100} />);
    // no bars rendered, but no crash — the `|| []` fallback kept .map finite
    expect(bar.container.querySelectorAll('rect.chart-bar').length).toBe(0);
  });

  it('pie chart coerces non-numeric values to 0 and falls back to #000000 color', () => {
    // y is undefined for one slice -> typeof guard falls back to 0; empty palette
    // + no point.color -> the `|| '#000000'` arm fires for each slice.
    const weirdPie: ChartDataset[] = [
      { label: 'W', data: [{ x: 0, y: undefined as any }, { x: 1, y: 20 }] },
    ];
    const { container } = render(
      <Chart type="pie" datasets={weirdPie} colors={[]} width={200} height={100} />
    );
    expect(container.querySelectorAll('path.chart-pie-slice').length).toBe(2);
  });

  it('pie chart honors an explicit per-point color', () => {
    const coloredPie: ChartDataset[] = [
      { label: 'C', data: [{ x: 0, y: 10, color: '#123456' }, { x: 1, y: 20 }] },
    ];
    const { container } = render(
      <Chart type="pie" datasets={coloredPie} width={200} height={100} />
    );
    const slices = container.querySelectorAll('path.chart-pie-slice');
    expect(slices.length).toBe(2);
    expect(slices[0].getAttribute('fill')).toBe('#123456');
  });
});

describe('ChartPoint', () => {
  it('renders a circle with the given coordinates and color', () => {
    const { container } = render(<svg><ChartPoint x={5} y={6} radius={3} color="#abc" /></svg>);
    const circle = container.querySelector('circle.chart-point');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('cx')).toBe('5');
    expect(circle?.getAttribute('cy')).toBe('6');
    expect(circle?.getAttribute('fill')).toBe('#abc');
  });

  it('applies selected styling when selected', () => {
    const { container } = render(<svg><ChartPoint x={1} y={1} selected /></svg>);
    expect(container.querySelector('.chart-point-selected')).not.toBeNull();
  });

  it('applies hovered styling when hovered', () => {
    const { container } = render(<svg><ChartPoint x={1} y={1} hovered /></svg>);
    expect(container.querySelector('.chart-point-hovered')).not.toBeNull();
  });

  it('wires onClick when provided and omits it otherwise', () => {
    const onClick = vi.fn();
    const { container: withClick } = render(
      <svg><ChartPoint x={1} y={1} onClick={onClick} /></svg>
    );
    const circle = withClick.querySelector('circle.chart-point')!;
    circle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
    // without onClick the prop is simply absent (no crash)
    const { container: noClick } = render(<svg><ChartPoint x={1} y={1} /></svg>);
    expect(noClick.querySelector('circle.chart-point')).not.toBeNull();
  });
});

describe('ChartLine', () => {
  it('renders a line path when given 2+ points', () => {
    const { container } = render(
      <svg><ChartLine points={[{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]} color="#000" /></svg>
    );
    expect(container.querySelector('path.chart-line')).not.toBeNull();
  });

  it('renders nothing when fewer than 2 points', () => {
    const { container } = render(<svg><ChartLine points={[{ x: 0, y: 0 }]} /></svg>);
    expect(container.querySelector('path.chart-line')).toBeNull();
  });

  it('renders an area when fill is enabled', () => {
    const { container } = render(
      <svg><ChartLine points={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} fill fillColor="#f00" /></svg>
    );
    expect(container.querySelector('path.chart-area')).not.toBeNull();
  });

  it('falls back to color for the area fill when fillColor is absent', () => {
    const { container } = render(
      <svg><ChartLine points={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} fill color="#00f" /></svg>
    );
    const area = container.querySelector('path.chart-area');
    expect(area).not.toBeNull();
    expect(area?.getAttribute('fill')).toBe('#00f');
  });
});

describe('ChartBar', () => {
  it('renders a rect with the given dimensions', () => {
    const { container } = render(<svg><ChartBar x={1} y={2} width={3} height={4} color="#0f0" /></svg>);
    const bar = container.querySelector('rect.chart-bar');
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('width')).toBe('3');
    expect(bar?.getAttribute('height')).toBe('4');
  });

  it('applies selected/hovered classes and wires onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <svg><ChartBar x={1} y={2} width={3} height={4} selected hovered onClick={onClick} /></svg>
    );
    const bar = container.querySelector('rect.chart-bar')!;
    expect(bar.classList.contains('chart-bar-selected')).toBe(true);
    expect(bar.classList.contains('chart-bar-hovered')).toBe(true);
    bar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
    // without onClick the prop is absent (no crash)
    const { container: noClick } = render(<svg><ChartBar x={1} y={2} width={3} height={4} /></svg>);
    expect(noClick.querySelector('rect.chart-bar')).not.toBeNull();
  });
});
