import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Calendar, RangeCalendar } from '../src/components/Calendar';

const month = new Date(2024, 0, 1); // January 2024

describe('Calendar round-2 fixes', () => {
  it('gives default nav chevrons explicit width/height so they do not collapse to 0x0', () => {
    render(<Calendar defaultMonth={month} mode="single" />);
    for (const name of ['Previous month', 'Next month']) {
      const svg = screen.getByRole('button', { name }).querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    }
  });

  it('renders weekday headers as readable columnheaders inside the grid', () => {
    render(<Calendar defaultMonth={month} mode="single" />);
    const grid = screen.getByRole('grid');
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    // Headers must be announced: they are no longer aria-hidden.
    for (const header of headers) {
      expect(header).not.toHaveAttribute('aria-hidden');
      expect(header.textContent).not.toBe('');
    }
  });

  it('renders day cells as gridcells wrapping the day buttons', () => {
    render(<Calendar defaultMonth={month} mode="single" />);
    const grid = screen.getByRole('grid');
    const cells = within(grid).getAllByRole('gridcell');
    // January 2024 spans 5 weeks x 7 days with outside days shown.
    expect(cells).toHaveLength(35);
    for (const cell of cells) {
      // The interactive day keeps its native button semantics inside the cell.
      expect(cell.querySelector('button.calendar-day')).toBeTruthy();
    }
  });
});

describe('Calendar range mode Date[] values (round-2)', () => {
  // CalendarValue admits Date[] in range mode; it used to crash the range
  // predicates (reading from/to off an array). It is now normalized.
  it('renders a single-date array value without throwing and marks the range start', () => {
    const { container } = render(
      <RangeCalendar value={[new Date(2024, 0, 5)]} defaultMonth={month} />
    );
    const start = container.querySelector('.calendar-day-range-start');
    expect(start).not.toBeNull();
    expect(start?.textContent).toBe('5');
    // An open range has no end marker yet
    expect(container.querySelector('.calendar-day-range-end')).toBeNull();
  });

  it('normalizes a [from, to] tuple value into range start/end', () => {
    const { container } = render(
      <RangeCalendar value={[new Date(2024, 0, 5), new Date(2024, 0, 10)]} defaultMonth={month} />
    );
    expect(container.querySelector('.calendar-day-range-start')?.textContent).toBe('5');
    expect(container.querySelector('.calendar-day-range-end')?.textContent).toBe('10');
  });

  it('renders an empty array value as an empty range', () => {
    expect(() => render(<Calendar mode="range" value={[]} defaultMonth={month} />)).not.toThrow();
    const { container } = render(<Calendar mode="range" value={[]} defaultMonth={month} />);
    expect(container.querySelector('.calendar-day-range-start')).toBeNull();
    expect(container.querySelector('.calendar-day-range-end')).toBeNull();
  });
});
