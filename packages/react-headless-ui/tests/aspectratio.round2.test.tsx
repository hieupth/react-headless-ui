import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AspectRatio } from '../src/components/AspectRatio';

// Round-2 NaN guard: ratio=NaN leaked into the aria-label ("aspect ratio
// NaN:1") and padding-bottom:NaN%, and ratio=0 produced padding-bottom:
// Infinity%. Degenerate ratios fall back to the 16/9 default.
describe('AspectRatio degenerate ratio (round-2)', () => {
  it('falls back to the default ratio for ratio=NaN', () => {
    const { container } = render(<AspectRatio ratio={NaN}>Body</AspectRatio>);
    expect(container.innerHTML).not.toContain('NaN');
    const root = container.querySelector('.aspect-ratio-container') as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Content with aspect ratio 1.7777777777777777:1');
    expect(root.style.paddingBottom).toBe('56.25%');
  });

  it('falls back to the default ratio for ratio=0 (no Infinity padding)', () => {
    const { container } = render(<AspectRatio ratio={0}>Body</AspectRatio>);
    expect(container.innerHTML).not.toContain('Infinity');
    const root = container.querySelector('.aspect-ratio-container') as HTMLElement;
    expect(root.style.paddingBottom).toBe('56.25%');
  });
});
