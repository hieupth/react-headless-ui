import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useChart } from '../src/hooks';
import { Chart } from '../src/components/Chart';
import type { UseChartProps, ChartDataset } from '../src/hooks';

// chartAriaLabel: dedicated accessible name for the chart svg so the
// announcement can be localized. Falls back to `label`, then to the built-in
// English 'Chart visualization' — consumers passing nothing are unchanged.

const datasets: ChartDataset[] = [
  { label: 'A', data: [{ x: 0, y: 10 }, { x: 1, y: 30 }, { x: 2, y: 20 }] },
];

function setup(props: UseChartProps = {}) {
  const api = { current: null as any };
  function Harness() {
    api.current = useChart(props);
    return null;
  }
  render(<Harness />);
  return api;
}

describe('useChart chartAriaLabel', () => {
  it('defaults to the English fallback when neither label is passed', () => {
    const { current } = setup({ datasets });
    expect(current.attributes['aria-label']).toBe('Chart visualization');
  });

  it('chartAriaLabel overrides the default and the generic label', () => {
    const { current } = setup({ datasets, label: 'Sales', chartAriaLabel: 'トークン配分チャート' });
    expect(current.attributes['aria-label']).toBe('トークン配分チャート');
  });

  it('label alone still names the chart (pre-existing behavior)', () => {
    const { current } = setup({ datasets, label: 'Sales' });
    expect(current.attributes['aria-label']).toBe('Sales');
  });
});

describe('Chart chartAriaLabel wiring', () => {
  it('renders the localized name on the chart svg', () => {
    const { container } = render(
      <Chart type="pie" datasets={datasets} chartAriaLabel="トークン配分チャート" animated={false} />
    );
    expect(container.querySelector('svg.chart-svg')).toHaveAttribute('aria-label', 'トークン配分チャート');
  });
});
