import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { useChart } from '../src/hooks';
import type { UseChartProps } from '../src/hooks';

// useChart is driven through a harness so handleMouseMove can be invoked with a
// synthetic mouse event and the resulting hoveredPoint inspected directly.

function setup(props: UseChartProps = {}) {
  const api = { result: null as any };
  function Harness() {
    api.result = useChart(props);
    // Render an SVG so the hook's chartRef attaches to a real DOM node; without
    // it, getBoundingClientRect has nothing to call against.
    return <svg ref={api.result.attributes.ref as React.LegacyRef<SVGSVGElement>} />;
  }
  render(<Harness />);
  return api;
}

describe('useChart hook', () => {
  describe('mousemove hit-testing', () => {
    it('sets hoveredPoint to the nearest data point by Euclidean distance', () => {
      const datasets = [
        {
          label: 'A',
          data: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
        },
      ];
      const api = setup({ datasets, width: 400, height: 300, animated: false });

      // The chartRef points at the SVG. Stub getBoundingClientRect so SVG-local
      // coords are deterministic: rect.left/top = 0, so clientX/clientY map 1:1.
      const svgRef = api.result.attributes.ref as React.MutableRefObject<SVGSVGElement | null>;
      svgRef.current!.getBoundingClientRect = () =>
        ({ left: 0, top: 0, right: 400, bottom: 300, width: 400, height: 300, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);

      // Recompute the scaled pixel position of point (0,0) exactly as the hook
      // does internally, then target it so (0,0) is unambiguously nearest.
      const { scales } = api.result;
      const marginLeft = 40;
      const marginTop = 20;
      const padding = 20;
      const targetPx = scales.x.scale * 0 + scales.x.offset + marginLeft + padding;
      const targetPy = scales.y.scale * 0 + scales.y.offset + marginTop + padding;

      const fakeEvent = {
        clientX: targetPx,
        clientY: targetPy,
      } as unknown as React.MouseEvent;

      act(() => {
        api.result.handleMouseMove(fakeEvent);
      });

      expect(api.result.hoveredPoint).toBeDefined();
      expect(api.result.hoveredPoint.point).toEqual({ x: 0, y: 0 });
      expect(api.result.hoveredPoint.dataset).toBe(datasets[0]);
    });

    it('clears hoveredPoint on mouseLeave', () => {
      const datasets = [{ label: 'A', data: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }];
      const api = setup({ datasets, width: 400, height: 300, animated: false });

      const svgRef = api.result.attributes.ref as React.MutableRefObject<SVGSVGElement | null>;
      svgRef.current!.getBoundingClientRect = () =>
        ({ left: 0, top: 0, right: 400, bottom: 300, width: 400, height: 300, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);

      // Target the scaled position of point (0,0) so it is genuinely the nearest.
      const { scales } = api.result;
      const targetPx = scales.x.scale * 0 + scales.x.offset + 40 + 20;
      const targetPy = scales.y.scale * 0 + scales.y.offset + 20 + 20;

      act(() => {
        api.result.handleMouseMove({ clientX: targetPx, clientY: targetPy } as unknown as React.MouseEvent);
      });
      expect(api.result.hoveredPoint).toBeDefined();

      act(() => {
        api.result.handleMouseLeave();
      });
      expect(api.result.hoveredPoint).toBeUndefined();
    });
  });
});
