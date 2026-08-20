import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Progress, SimpleProgress, CircularProgress } from '../src/components/Progress';

// Round-2 NaN guard: value=NaN used to leak into aria attributes, the
// --progress-value custom property, the bar width, and the circular
// stroke-dashoffset. Non-finite values are clamped to min at the boundary.
describe('Progress NaN value (round-2)', () => {
  it('Progress clamps value=NaN instead of leaking NaN', () => {
    const { container } = render(<Progress value={NaN} aria-label="Upload" />);
    expect(container.innerHTML).not.toContain('NaN');
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(bar.getAttribute('aria-valuetext')).toBe('0%');
    expect(bar.getAttribute('style')).toContain('--progress-value: 0');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('0%');
  });

  it('SimpleProgress clamps value=NaN', () => {
    const { container } = render(<SimpleProgress value={NaN} />);
    expect(container.innerHTML).not.toContain('NaN');
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');
  });

  it('CircularProgress clamps value=NaN instead of a NaN dashoffset', () => {
    const { container } = render(<CircularProgress value={NaN} />);
    expect(container.innerHTML).not.toContain('NaN');
    const circle = container.querySelectorAll('circle')[1] as SVGCircleElement;
    expect(circle.getAttribute('stroke-dashoffset')).not.toContain('NaN');
  });
});
