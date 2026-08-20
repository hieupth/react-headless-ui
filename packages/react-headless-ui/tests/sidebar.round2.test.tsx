import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../src/components/Sidebar';

describe('Sidebar round-2 fixes', () => {
  it('gives the collapse chevron explicit svg size and a minimum hit area', () => {
    render(
      <Sidebar variant="persistent">
        <span>Menu</span>
      </Sidebar>
    );
    const button = screen.getByLabelText('Collapse sidebar');
    expect(button.style.minWidth).toBe('24px');
    expect(button.style.minHeight).toBe('24px');
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('gives the default trigger button the same intrinsic sizing', () => {
    render(
      <Sidebar variant="permanent" trigger="menu">
        <span>Menu</span>
      </Sidebar>
    );
    const button = screen.getByLabelText('Open sidebar');
    expect(button.style.minWidth).toBe('24px');
    expect(button.style.minHeight).toBe('24px');
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});
