import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup, fireEvent } from '@testing-library/react';
import { useChart } from '../src/hooks';
import { Chart } from '../src/components/Chart';
import type { UseChartProps, ChartDataset, ChartDataPoint } from '../src/hooks';

// Drives the useChart hook directly: dataset flattening, range/scale/dimension
// computation, every handler (click / mousemove / keydown branches), and the
// semantic attribute bag across disabled and non-focusable configurations.

function setup(props: UseChartProps = {}) {
  const api = { current: null as any };
  function Harness() {
    api.current = useChart(props);
    return null;
  }
  render(<Harness />);
  return api;
}

const datasets: ChartDataset[] = [
  { label: 'A', data: [{ x: 0, y: 10 }, { x: 1, y: 30 }, { x: 2, y: 20 }] },
  { label: 'B', data: [{ x: 0, y: 5 }, { x: 1, y: 15 }] },
];

describe('useChart hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe('state + defaults', () => {
    it('exposes defaults for an empty chart', () => {
      const { current } = setup();
      expect(current.type).toBe('line');
      expect(current.datasets).toEqual([]);
      expect(current.dataPoints).toEqual([]);
      expect(current.disabled).toBe(false);
      expect(current.loading).toBe(false);
      expect(current.colors.length).toBeGreaterThan(0);
    });

    it('honours the chart type override', () => {
      const { current } = setup({ type: 'bar' });
      expect(current.type).toBe('bar');
    });

    it('flattens datasets into dataPoints with assigned colors', () => {
      const { current } = setup({ datasets, colors: ['#aaa', '#bbb'] });
      expect(current.dataPoints.length).toBe(5);
      expect(current.dataPoints[0].color).toBe('#aaa');
      expect(current.dataPoints[3].color).toBe('#bbb');
      expect(current.dataPoints[0].datasetIndex).toBe(0);
      expect(current.dataPoints[3].datasetIndex).toBe(1);
    });
  });

  describe('range computation', () => {
    it('returns a default 0..100 range for empty data', () => {
      const { current } = setup();
      expect(current.ranges).toEqual({ x: { min: 0, max: 100 }, y: { min: 0, max: 100 } });
    });

    it('derives ranges from data with padding', () => {
      const { current } = setup({ datasets });
      // y spans 5..30, x spans 0..2 with 10% padding applied via floor/ceil.
      expect(current.ranges.y.min).toBeLessThanOrEqual(5);
      expect(current.ranges.y.max).toBeGreaterThanOrEqual(30);
      expect(current.ranges.x.min).toBeLessThanOrEqual(0);
      expect(current.ranges.x.max).toBeGreaterThanOrEqual(2);
    });

    it('axis min/max override the derived range', () => {
      const { current } = setup({
        datasets,
        xAxis: { min: -10, max: 10 },
        yAxis: { min: -5, max: 50 },
      });
      expect(current.ranges.x).toEqual({ min: -10, max: 10 });
      expect(current.ranges.y).toEqual({ min: -5, max: 50 });
    });

    it('scales and dimensions derive from ranges + geometry', () => {
      const { current } = setup({
        datasets,
        width: 500,
        height: 400,
        padding: 10,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      });
      // chartWidth = 500 - 10 - 10 - 20 = 460
      expect(current.dimensions.width).toBe(460);
      expect(current.dimensions.height).toBe(360);
      expect(current.dimensions.totalWidth).toBe(500);
      expect(current.dimensions.totalHeight).toBe(400);
      const span = current.ranges.x.max - current.ranges.x.min;
      expect(current.scales.x.scale).toBeCloseTo(460 / span, 5);
      // y scale is negative (svg y-axis inversion).
      expect(current.scales.y.scale).toBeLessThan(0);
    });

    it('falls back to default margins when margin keys are missing', () => {
      // Empty margin object → all four `?? 20` / `?? 40` defaults fire.
      const { current } = setup({ datasets, margin: {} });
      expect(current.dimensions.totalWidth).toBe(400);
    });

    it('coerces non-numeric x/y to 0 and uses the color fallback', () => {
      // Empty colors + a point lacking a color exercises the final '#000000'
      // fallback, and a non-numeric x exercises the typeof guard.
      const ds: ChartDataset[] = [{ label: 'L', data: [{ x: 'a' as any, y: 'b' as any }] }];
      const { current } = setup({ datasets: ds, colors: [] });
      expect(current.dataPoints[0].color).toBe('#000000');
    });
  });

  describe('handlers', () => {
    it('handleDataPointClick records selection and forwards callback unless disabled', () => {
      const onDataPointClick = vi.fn();
      const api = setup({ datasets, onDataPointClick });
      const ds = datasets[0];
      const pt = ds.data[1];
      act(() => api.current.handleDataPointClick(ds, pt, {} as any));
      expect(api.current.selectedPoint).toEqual({ dataset: ds, point: pt });
      expect(onDataPointClick).toHaveBeenCalledWith(ds, pt);
    });

    it('disabled chart ignores data point click', () => {
      const onDataPointClick = vi.fn();
      const { current } = setup({ datasets, disabled: true, onDataPointClick });
      act(() => current.handleDataPointClick(datasets[0], datasets[0].data[0], {} as any));
      expect(current.selectedPoint).toBeUndefined();
      expect(onDataPointClick).not.toHaveBeenCalled();
    });

    it('handleDatasetClick forwards the dataset and is blocked when disabled', () => {
      const onDatasetClick = vi.fn();
      const { current } = setup({ datasets, onDatasetClick });
      act(() => current.handleDatasetClick(datasets[1], {} as any));
      expect(onDatasetClick).toHaveBeenCalledWith(datasets[1]);
      const disabled = setup({ datasets, disabled: true, onDatasetClick });
      act(() => disabled.current.handleDatasetClick(datasets[1], {} as any));
      expect(onDatasetClick).toHaveBeenCalledTimes(1); // no extra call
    });

    it('handleChartClick clears selection and forwards event unless disabled', () => {
      const onChartClick = vi.fn();
      const api = setup({ datasets, onChartClick });
      const ds = datasets[0];
      const pt = ds.data[0];
      act(() => api.current.handleDataPointClick(ds, pt, {} as any));
      expect(api.current.selectedPoint).toBeDefined();
      act(() => api.current.handleChartClick({} as any));
      expect(api.current.selectedPoint).toBeUndefined();
      expect(onChartClick).toHaveBeenCalledTimes(1);
    });

    it('disabled chart ignores handleChartClick and handleMouseMove', () => {
      const onChartClick = vi.fn();
      const onMouseMove = vi.fn();
      const { current } = setup({ datasets, disabled: true, onChartClick, onMouseMove });
      act(() => current.handleChartClick({} as any));
      expect(onChartClick).not.toHaveBeenCalled();
      act(() => current.handleMouseMove({ clientX: 1, clientY: 1 } as any));
      expect(onMouseMove).not.toHaveBeenCalled();
    });

    it('handleMouseMove forwards to callback and tolerates missing ref rect', () => {
      const onMouseMove = vi.fn();
      const { current } = setup({ datasets, onMouseMove });
      // ref has no mounted SVG, so getBoundingClientRect returns undefined.
      expect(() => act(() => {
        current.handleMouseMove({ clientX: 5, clientY: 7 } as any);
      })).not.toThrow();
      expect(onMouseMove).toHaveBeenCalled();
    });

    it('handleMouseMove uses bounding rect when the ref is mounted', () => {
      const onMouseMove = vi.fn();
      const api = { current: null as any };
      function Harness() {
        api.current = useChart({ datasets, onMouseMove });
        return (
          <svg ref={api.current.attributes.ref as any} data-testid="svg">
            <circle cx={0} cy={0} r={0} />
          </svg>
        );
      }
      render(<Harness />);
      const svg = document.querySelector('svg') as SVGSVGElement;
      svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
      act(() => api.current.handleMouseMove({ clientX: 30, clientY: 40 } as any));
      expect(onMouseMove).toHaveBeenCalled();
    });

    it('handleMouseLeave clears hover and forwards callback', () => {
      const onMouseLeave = vi.fn();
      const { current } = setup({ datasets, onMouseLeave });
      act(() => current.handleMouseLeave());
      expect(current.hoveredPoint).toBeUndefined();
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('handleDataPointHover records the hovered point and forwards nothing when disabled', () => {
      const api = setup({ datasets });
      const ds = datasets[0];
      const pt = ds.data[1];
      act(() => api.current.handleDataPointHover(ds, pt));
      expect(api.current.hoveredPoint).toEqual({ dataset: ds, point: pt });
      // leaving clears it
      act(() => api.current.handleDataPointLeave());
      expect(api.current.hoveredPoint).toBeUndefined();
      // disabled guard: hover is a no-op
      const disabled = setup({ datasets, disabled: true });
      act(() => disabled.current.handleDataPointHover(datasets[0], datasets[0].data[0]));
      expect(disabled.current.hoveredPoint).toBeUndefined();
    });
  });

  describe('keyboard navigation', () => {
    const preventDefault = () => {};

    it('ArrowRight advances the selected point and wraps at the end', () => {
      const api = setup({ datasets });
      // Select the first point, then move forward.
      act(() => api.current.handleDataPointClick(datasets[0], datasets[0].data[0], {} as any));
      act(() => api.current.handleKeyDown({ key: 'ArrowRight', preventDefault } as any));
      expect((api.current.selectedPoint as any).point).toEqual(datasets[0].data[1]);
      // Jump to last then wrap back to 0.
      const last = api.current.dataPoints[api.current.dataPoints.length - 1];
      act(() => api.current.handleDataPointClick(
        api.current.datasets[(last as any).datasetIndex], last, {} as any));
      act(() => api.current.handleKeyDown({ key: 'ArrowRight', preventDefault } as any));
      // Wraps to index 0 (dataset 0, first point).
      expect((api.current.selectedPoint as any).point).toEqual(datasets[0].data[0]);
    });

    it('ArrowLeft moves backward and wraps at the start', () => {
      const api = setup({ datasets });
      act(() => api.current.handleDataPointClick(datasets[0], datasets[0].data[0], {} as any));
      act(() => api.current.handleKeyDown({ key: 'ArrowLeft', preventDefault } as any));
      // Wraps to the last point (dataset 1, last point).
      expect((api.current.selectedPoint as any).point).toEqual(datasets[1].data[datasets[1].data.length - 1]);
    });

    it('ArrowDown/ArrowUp behave like Right/Left', () => {
      const api = setup({ datasets });
      act(() => api.current.handleDataPointClick(datasets[0], datasets[0].data[0], {} as any));
      act(() => api.current.handleKeyDown({ key: 'ArrowDown', preventDefault } as any));
      expect((api.current.selectedPoint as any).point).toEqual(datasets[0].data[1]);
      act(() => api.current.handleKeyDown({ key: 'ArrowUp', preventDefault } as any));
      expect((api.current.selectedPoint as any).point).toEqual(datasets[0].data[0]);
    });

    it('Enter/Space activate the selected point, Escape clears it', () => {
      const onDataPointClick = vi.fn();
      const api = setup({ datasets, onDataPointClick });
      act(() => api.current.handleDataPointClick(datasets[0], datasets[0].data[1], {} as any));
      onDataPointClick.mockClear();
      act(() => api.current.handleKeyDown({ key: 'Enter', preventDefault } as any));
      expect(onDataPointClick).toHaveBeenCalledWith(datasets[0], datasets[0].data[1]);
      act(() => api.current.handleKeyDown({ key: 'Escape', preventDefault } as any));
      expect(api.current.selectedPoint).toBeUndefined();
    });

    it('Enter without a selection does not activate; arrows without data are inert', () => {
      const onDataPointClick = vi.fn();
      const api = setup({ datasets, onDataPointClick });
      // No prior selection → Enter is a no-op.
      act(() => api.current.handleKeyDown({ key: 'Enter', preventDefault } as any));
      expect(onDataPointClick).not.toHaveBeenCalled();
      // Empty datasets → arrow keys do nothing (allDataPoints.length === 0 arm).
      const empty = setup({ datasets: [] });
      expect(() => act(() => {
        empty.current.handleKeyDown({ key: 'ArrowRight', preventDefault } as any);
      })).not.toThrow();
    });

    it('ArrowRight with data but no selection starts navigation from index 0', () => {
      const api = setup({ datasets });
      // No selection: selectedDatasetIndex/currentIndex fall back to -1, then
      // ArrowRight advances to index 0.
      act(() => api.current.handleKeyDown({ key: 'ArrowRight', preventDefault } as any));
      expect(api.current.selectedPoint).toBeDefined();
    });

    it('disabled chart ignores keyboard nav', () => {
      const { current } = setup({ datasets, disabled: true });
      const before = current.selectedPoint;
      act(() => current.handleKeyDown({ key: 'ArrowRight', preventDefault } as any));
      expect(current.selectedPoint).toBe(before);
    });

    it('falls through to the focusable mixin for unknown keys', () => {
      const { current } = setup({ datasets });
      expect(() => act(() => current.handleKeyDown({ key: 'Home', preventDefault } as any))).not.toThrow();
    });
  });

  describe('animation + attributes', () => {
    it('runs the animation effect on mount', () => {
      const api = setup({ datasets, animated: true, animationDuration: 1000 });
      // Animation starts immediately with progress 0.
      expect(api.current.animating).toBe(true);
      // After advancing enough raf-driven time, animation completes.
      // jsdom requestAnimationFrame fires on setTimeout(0); flush a few.
      act(() => { vi.advanceTimersByTime(1500); });
      expect(api.current.animationProgress).toBe(1);
      expect(api.current.animating).toBe(false);
    });

    it('animated=false skips the animation effect', () => {
      const { current } = setup({ datasets, animated: false });
      expect(current.animating).toBe(false);
      expect(current.animationProgress).toBe(0);
    });

    it('semanticAttributes expose role/labels and keydown when focusable', () => {
      const { current } = setup({ datasets, label: 'Sales', type: 'pie' });
      expect(current.attributes.role).toBe('img');
      expect(current.attributes['aria-label']).toBe('Sales');
      expect(current.attributes['data-chart-type']).toBe('pie');
      expect(current.attributes['data-theme']).toBe('light');
      expect(current.attributes.tabIndex).toBe(0);
      expect(typeof current.attributes.onKeyDown).toBe('function');
    });

    it('non-focusable chart sets tabIndex -1', () => {
      const { current } = setup({ datasets, focusable: false });
      expect(current.attributes.tabIndex).toBe(-1);
    });

    it('uses default label when none provided', () => {
      const { current } = setup({ datasets });
      expect(current.attributes['aria-label']).toBe('Chart visualization');
    });
  });
});

// Drives the wired Chart's point/bar selection + hover feature end-to-end:
// the rendered elements forward click/mouseEnter/mouseLeave to the hook, which
// records selectedPoint/hoveredPoint; the renderer then matches by value (via
// the retained originalX/originalY coords) and applies the *-selected /
// *-hovered classes. This is the path that was previously dead code masked by
// c8 ignore (reference equality against spread point copies never matched).
describe('Chart point selection + hover wiring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  const scatterDatasets: ChartDataset[] = [
    { label: 'S', data: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }] },
  ];
  const barDatasets: ChartDataset[] = [
    { label: 'B', data: [{ x: 0, y: 4 }, { x: 1, y: 7 }, { x: 2, y: 3 }] },
  ];

  it('clicking a point applies chart-point-selected; others stay unselected', () => {
    const { container } = render(
      <Chart type="scatter" datasets={scatterDatasets} width={200} height={100} animated={false} />
    );
    const points = container.querySelectorAll('circle.chart-point');
    expect(points.length).toBe(3);
    expect(container.querySelector('.chart-point-selected')).toBeNull();

    act(() => { fireEvent.click(points[1]); });
    const selected = container.querySelectorAll('.chart-point-selected');
    expect(selected.length).toBe(1);
    expect(selected[0]).toBe(points[1]);
  });

  it('hovering a point applies chart-point-hovered; leaving clears it', () => {
    const { container } = render(
      <Chart type="scatter" datasets={scatterDatasets} width={200} height={100} animated={false} />
    );
    const points = container.querySelectorAll('circle.chart-point');
    expect(container.querySelector('.chart-point-hovered')).toBeNull();

    act(() => { fireEvent.mouseEnter(points[2]); });
    const hovered = container.querySelectorAll('.chart-point-hovered');
    expect(hovered.length).toBe(1);
    expect(hovered[0]).toBe(points[2]);

    act(() => { fireEvent.mouseLeave(points[2]); });
    expect(container.querySelector('.chart-point-hovered')).toBeNull();
  });

  it('clicking a bar applies chart-bar-selected; hovering applies chart-bar-hovered', () => {
    const { container } = render(
      <Chart type="bar" datasets={barDatasets} width={200} height={100} animated={false} />
    );
    const bars = container.querySelectorAll('rect.chart-bar');
    expect(bars.length).toBe(3);

    act(() => { fireEvent.click(bars[0]); });
    expect(bars[0].classList.contains('chart-bar-selected')).toBe(true);
    expect(container.querySelectorAll('.chart-bar-selected').length).toBe(1);

    act(() => { fireEvent.mouseEnter(bars[2]); });
    expect(bars[2].classList.contains('chart-bar-hovered')).toBe(true);
    expect(container.querySelectorAll('.chart-bar-hovered').length).toBe(1);

    act(() => { fireEvent.mouseLeave(bars[2]); });
    expect(container.querySelector('.chart-bar-hovered')).toBeNull();
  });

  it('forwards onDataPointClick with the dataset and original coords on click', () => {
    const onDataPointClick = vi.fn();
    const { container } = render(
      <Chart
        type="scatter"
        datasets={scatterDatasets}
        width={200}
        height={100}
        animated={false}
        onDataPointClick={onDataPointClick}
      />
    );
    const points = container.querySelectorAll('circle.chart-point');
    act(() => { fireEvent.click(points[1]); });
    expect(onDataPointClick).toHaveBeenCalledTimes(1);
    const [ds, pt] = onDataPointClick.mock.calls[0];
    expect(ds).toBe(scatterDatasets[0]);
    // The wired click forwards the retained raw coords, not the scaled copy.
    expect(pt).toEqual({ x: 1, y: 3 });
  });

  it('does not select on click when disabled', () => {
    const { container } = render(
      <Chart type="scatter" datasets={scatterDatasets} width={200} height={100} animated={false} disabled />
    );
    const points = container.querySelectorAll('circle.chart-point');
    act(() => { fireEvent.click(points[0]); });
    expect(container.querySelector('.chart-point-selected')).toBeNull();
  });
});
