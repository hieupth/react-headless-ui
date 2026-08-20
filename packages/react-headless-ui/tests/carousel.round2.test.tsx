import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Carousel } from '../src/components/Carousel';

const slides = [
  <div key="1">Slide one</div>,
  <div key="2">Slide two</div>,
  <div key="3">Slide three</div>,
];

describe('Carousel round-2 fixes', () => {
  it('does not throw on a single non-array child and renders it as a slide', () => {
    // children is typed as React.ReactNode[]; a dynamically built single child
    // arrives at runtime as a bare element, which previously crashed children.map.
    const singleChild = { children: <div>Only slide</div> } as any;
    render(<Carousel showArrows showDots {...singleChild} />);
    expect(screen.getByText('Only slide')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument();
  });

  it('does not throw when children is missing and renders an empty shell', () => {
    const noChildren = { children: undefined } as any;
    render(<Carousel showArrows showDots {...noChildren} />);
    expect(document.querySelectorAll('.carousel-slide')).toHaveLength(0);
  });

  it('gives default arrow icons explicit width/height so they do not collapse to 0x0', () => {
    render(<Carousel showArrows>{slides}</Carousel>);
    for (const name of ['Previous slide', 'Next slide']) {
      const svg = screen.getByRole('button', { name }).querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    }
  });

  it('renders dots in a labelled group of plain buttons with aria-current', () => {
    render(<Carousel showDots>{slides}</Carousel>);
    const group = screen.getByRole('group', { name: 'Carousel navigation' });
    const dots = within(group).getAllByRole('button');
    expect(dots).toHaveLength(3);
    // No tab semantics left behind and no aria-selected on plain buttons.
    for (const [i, dot] of dots.entries()) {
      expect(dot).not.toHaveAttribute('role');
      expect(dot).not.toHaveAttribute('aria-selected');
      expect(dot).toHaveAttribute('aria-label', `Go to slide ${i + 1}`);
    }
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
    expect(dots[1]).not.toHaveAttribute('aria-current');
    expect(dots[2]).not.toHaveAttribute('aria-current');
  });

  it('renders a visible default dot with a minimum hit area', () => {
    render(<Carousel showDots>{slides}</Carousel>);
    const dot = screen.getByRole('button', { name: 'Go to slide 1' });
    // The lib ships no CSS: the default dot must paint itself and keep a
    // 24px minimum hit area so it is visible and clickable.
    // jsdom lowercases the shorthand keyword value.
    expect(dot.style.background.toLowerCase()).toBe('currentcolor');
    expect(dot.style.borderRadius).toBe('50%');
    expect(dot.style.width).toBe('8px');
    expect(dot.style.height).toBe('8px');
    expect(dot.style.minWidth).toBe('24px');
    expect(dot.style.minHeight).toBe('24px');
    expect(dot.textContent).toBe('');
  });
});
