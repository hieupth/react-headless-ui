import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Calendar } from '../src/components/Calendar';

// August 2026: the 1st falls on a Saturday. The old weekday memo derived
// header labels from `new Date()` (the real current month's 1st), so this
// month rendered "Sat Sun ... Fri" over a Sunday-aligned grid — every date
// sat one weekday early and "today" was mislabeled.
const month = new Date(2026, 7, 1);

const FULL_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Header labels plus, for each column, the weekday name of every day-cell
 *  rendered under it (from the day button's aria-label). */
const extractColumns = () => {
  const grid = screen.getByRole('grid');
  const headers = within(grid).getAllByRole('columnheader').map((h) => h.textContent);
  const weekRows = within(grid).getAllByRole('row').slice(1); // first row is the header row
  const columns: string[][] = [];

  for (let c = 0; c < 7; c++) {
    columns.push(
      weekRows.map((row) => {
        const cell = within(row).getAllByRole('gridcell')[c];
        const label = cell.querySelector('button.calendar-day')?.getAttribute('aria-label') ?? '';
        // aria-label format: "Saturday, August 1, 2026"
        return label.split(',')[0];
      })
    );
  }

  return { headers, columns };
};

describe('Calendar weekday headers match the displayed month (round-3)', () => {
  it.each([0, 1] as const)('aligns header %i with the grid it labels (weekStartsOn=%i)', (weekStartsOn) => {
    render(<Calendar month={month} mode="single" weekStartsOn={weekStartsOn} />);

    const { headers, columns } = extractColumns();

    // The first header names the weekday of the displayed month's first
    // grid column: Sunday for weekStartsOn 0, Monday for weekStartsOn 1.
    expect(headers[0]).toBe(SHORT_WEEKDAYS[weekStartsOn]);
    expect(headers).toEqual(
      SHORT_WEEKDAYS.map((_, i) => SHORT_WEEKDAYS[(weekStartsOn + i) % 7])
    );

    // Every day-cell under a header actually falls on that weekday.
    for (let c = 0; c < 7; c++) {
      const expected = FULL_WEEKDAYS[(weekStartsOn + c) % 7];
      for (const weekday of columns[c]) {
        expect(weekday).toBe(expected);
      }
    }
  });

  it('places August 1, 2026 (a Saturday) under the "Sat" header for weekStartsOn 0', () => {
    const { container } = render(<Calendar month={month} mode="single" weekStartsOn={0} />);

    const grid = screen.getByRole('grid');
    const headers = within(grid).getAllByRole('columnheader').map((h) => h.textContent);

    const aug1 = container.querySelector('button.calendar-day[aria-label^="Saturday, August 1, 2026"]');
    expect(aug1).not.toBeNull();

    const cell = aug1?.closest('[role="gridcell"]');
    const row = cell?.closest('[role="row"]');
    const columnIndex = row ? Array.prototype.indexOf.call(row.children, cell) : -1;

    // Saturday is the 7th column of a Sunday-aligned grid.
    expect(columnIndex).toBe(6);
    expect(headers[columnIndex]).toBe('Sat');
  });

  it('places August 1, 2026 (a Saturday) under the "Sat" header for weekStartsOn 1', () => {
    const { container } = render(<Calendar month={month} mode="single" weekStartsOn={1} />);

    const grid = screen.getByRole('grid');
    const headers = within(grid).getAllByRole('columnheader').map((h) => h.textContent);

    const aug1 = container.querySelector('button.calendar-day[aria-label^="Saturday, August 1, 2026"]');
    expect(aug1).not.toBeNull();

    const cell = aug1?.closest('[role="gridcell"]');
    const row = cell?.closest('[role="row"]');
    const columnIndex = row ? Array.prototype.indexOf.call(row.children, cell) : -1;

    // Saturday is the 6th column of a Monday-aligned grid.
    expect(columnIndex).toBe(5);
    expect(headers[columnIndex]).toBe('Sat');
  });
});
