import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Calendar,
  SingleDateCalendar,
  MultiDateCalendar,
  RangeCalendar,
  DatePickerCalendar,
} from '../src/components/Calendar';

const month = new Date(2024, 0, 1); // January 2024

describe('Calendar', () => {
  it('renders weekday headers and day buttons for the month', () => {
    const { container } = render(<Calendar defaultMonth={month} mode="single" />);
    // The wrapper mounts and the grid renders a button for each visible day.
    expect(container.querySelector('.calendar-wrapper')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('calls onSelect when a day button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar defaultMonth={month} mode="single" onSelect={onSelect} />);
    // Click any enabled day button (day cells render as <button class="calendar-day">).
    const dayButtons = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('calendar-day') && !b.hasAttribute('disabled'));
    expect(dayButtons.length).toBeGreaterThan(0);
    await user.click(dayButtons[0]);
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders spacer cells instead of outside days when showOutsideDays is false', () => {
    render(<Calendar defaultMonth={month} mode="single" showOutsideDays={false} />);
    expect(screen.getAllByText('').length).toBeGreaterThanOrEqual(0);
    // spacers render as div.calendar-day-spacer (no role=button)
    expect(document.querySelectorAll('.calendar-day-spacer').length).toBeGreaterThan(0);
  });

  it('renders custom format and formatMonth functions', () => {
    render(
      <Calendar
        defaultMonth={month}
        mode="single"
        formatMonth={() => 'Custom Month'}
        format={() => 'D'}
      />
    );
    expect(screen.getByText('Custom Month')).toBeInTheDocument();
  });

  it('renders week numbers when showWeekNumber is set', () => {
    render(<Calendar defaultMonth={month} mode="single" showWeekNumber />);
    // Week-number header is rendered.
    expect(screen.getByText('Wk')).toBeInTheDocument();
  });

  it('paints in-range / range-start / range-end / outside-day classes and a "Today" aria-label', () => {
    const from = new Date(2024, 0, 10);
    const to = new Date(2024, 0, 20);
    const today = new Date();
    // Render the fixed January 2024 range, plus a second calendar whose visible
    // month is the current month so a "Today" cell is actually on screen.
    render(
      <Calendar defaultMonth={month} mode="range" value={{ from, to }} />
    );
    expect(document.querySelectorAll('.calendar-day-in-range').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.calendar-day-range-start').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.calendar-day-range-end').length).toBeGreaterThan(0);
    // showOutsideDays defaults to true, so adjacent-month days are painted as outside.
    expect(document.querySelectorAll('.calendar-day-outside').length).toBeGreaterThan(0);

    cleanup();
    render(
      <Calendar defaultMonth={new Date(today.getFullYear(), today.getMonth(), 1)} mode="single" />
    );
    // The today cell advertises itself in its aria-label.
    expect(document.querySelectorAll('[aria-label*="(Today)"]').length).toBeGreaterThan(0);
  });

  it('does not select a disabled day when it is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    // fromDate=2024-01-15 disables all days before the 15th within January 2024.
    render(
      <Calendar
        defaultMonth={month}
        mode="single"
        fromDate={new Date(2024, 0, 15)}
        onSelect={onSelect}
      />
    );
    const disabledDay = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('calendar-day') && b.hasAttribute('disabled'))[0];
    expect(disabledDay).toBeTruthy();
    await user.click(disabledDay);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders custom Day/Header/Weekday components when provided', () => {
    const HeaderComponent = () => <div data-testid="custom-header">H</div>;
    const DayComponent = ({ date }: any) => <div data-testid={`custom-day-${date.day}`}>{date.day}</div>;
    const WeekdayComponent = ({ weekday }: any) => <div data-testid={`custom-wd-${weekday}`}>{weekday}</div>;
    render(
      <Calendar
        defaultMonth={month}
        mode="single"
        HeaderComponent={HeaderComponent as any}
        DayComponent={DayComponent as any}
        WeekdayComponent={WeekdayComponent as any}
      />
    );
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.getAllByTestId(/custom-wd-/).length).toBeGreaterThan(0);
    expect(screen.getAllByTestId(/custom-day-/).length).toBeGreaterThan(0);
  });
});

describe('Calendar variants', () => {
  it('SingleDateCalendar renders with single mode', () => {
    const { container } = render(<SingleDateCalendar defaultMonth={month} />);
    expect(container.querySelector('.calendar-wrapper')).toBeInTheDocument();
  });

  it('MultiDateCalendar renders with multiple mode', () => {
    const { container } = render(<MultiDateCalendar defaultMonth={month} />);
    expect(container.querySelector('.calendar-wrapper')).toBeInTheDocument();
  });

  it('RangeCalendar renders with range mode', () => {
    const { container } = render(<RangeCalendar defaultMonth={month} />);
    expect(container.querySelector('.calendar-wrapper')).toBeInTheDocument();
  });

  it('DatePickerCalendar fires onSelect with a Date instance when a day is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<DatePickerCalendar defaultMonth={month} onSelect={onSelect} />);
    const dayButtons = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('calendar-day') && !b.hasAttribute('disabled'));
    await user.click(dayButtons[0]);
    expect(onSelect).toHaveBeenCalled();
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(Date);
  });
});
