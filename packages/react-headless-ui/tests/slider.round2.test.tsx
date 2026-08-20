import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Slider, RangeSlider } from '../src/components/Slider';

// Round-2 NaN/degenerate guards: min === max divided by zero in the geometry
// and NaN values flowed unclamped into aria attributes. Bounds are widened
// (same approach as useChart) and non-finite values fall back to min.
describe('Slider degenerate props (round-2)', () => {
  it('keeps geometry finite when min === max', () => {
    const { container } = render(<Slider value={0} min={0} max={0} />);
    expect(container.innerHTML).not.toContain('NaN');
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    // widened to [-0.5, 0.5]: value 0 sits at the middle of the track
    const range = slider.children[1] as HTMLElement;
    expect(range.style.left).toBe('50%');
    expect(range.style.width).toBe('0%');
    const thumb = slider.children[2] as HTMLElement;
    // orientation defaults to vertical positioning in the default thumb
    // renderer (no orientation prop), so the offset lands on `bottom`
    expect(thumb.style.bottom).toBe('50%');
  });

  it('keeps RangeSlider geometry finite when min === max', () => {
    const { container } = render(<RangeSlider value={[0, 0]} min={0} max={0} />);
    expect(container.innerHTML).not.toContain('NaN');
    const range = (container.querySelector('[role="slider"]') as HTMLElement)
      .children[1] as HTMLElement;
    expect(range.style.left).toBe('50%');
    expect(range.style.width).toBe('0%');
  });

  it('clamps a NaN value instead of emitting NaN aria attributes', () => {
    const { container } = render(<Slider value={NaN} min={0} max={100} />);
    expect(container.innerHTML).not.toContain('NaN');
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
    expect(slider.getAttribute('aria-valuetext')).toBe('0');
  });

  it('clamps NaN range values instead of emitting "NaN to NaN"', () => {
    const { container } = render(<RangeSlider value={[NaN, NaN]} />);
    expect(container.innerHTML).not.toContain('NaN');
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-valuetext')).toBe('0 to 0');
  });
});
