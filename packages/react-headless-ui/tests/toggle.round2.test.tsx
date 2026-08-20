import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormatToggle, Toggle } from '../src/components/Toggle';

describe('Toggle round-2 fixes', () => {
  it('gives default format glyphs explicit width/height so the icon-only button does not collapse to 0x0', () => {
    render(<FormatToggle format="bold" />);
    const svg = screen.getByRole('button', { name: 'Bold' }).querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('scales the default format glyphs with the size prop', () => {
    for (const [size, px] of [['sm', '16'], ['lg', '24']] as const) {
      const { container, unmount } = render(<FormatToggle format="underline" size={size} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', px);
      expect(svg).toHaveAttribute('height', px);
      unmount();
    }
  });

  it('gives icon-only toggles a minimum hit area that consumer styles can override', () => {
    const { rerender } = render(<FormatToggle format="italic" />);
    const button = screen.getByRole('button', { name: 'Italic' });
    expect(button.style.minWidth).toBe('24px');
    expect(button.style.minHeight).toBe('24px');

    rerender(<FormatToggle format="italic" style={{ minWidth: 32, minHeight: 32 }} />);
    expect(button.style.minWidth).toBe('32px');
    expect(button.style.minHeight).toBe('32px');
  });

  it('leaves text toggles without the icon-only minimum hit area', () => {
    render(<Toggle>Bold</Toggle>);
    expect(screen.getByRole('button', { name: 'Bold' }).style.minWidth).toBe('');
  });

  it('appends toggle-format to the consumer className instead of clobbering it', () => {
    render(<FormatToggle format="bold" className="custom-format" />);
    const className = screen.getByRole('button', { name: 'Bold' }).className;
    expect(className).toContain('toggle-format');
    expect(className).toContain('custom-format');
  });
});
