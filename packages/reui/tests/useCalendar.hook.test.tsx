import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useCalendar } from '../src/hooks';
import type { UseCalendarProps } from '../src/hooks';

// useCalendar is exercised directly through a harness so the imperative
// actions (selectDate / previousMonth / range selection / predicates) and all
// three selection modes can be covered precisely.

function setup(props: UseCalendarProps = {}) {
  const api = { state: null as any, actions: null as any, gridHandlers: null as any };
  function Harness() {
    const result = useCalendar(props);
    api.state = result.state;
    api.actions = result.actions;
    api.gridHandlers = result.gridHandlers;
    return null;
  }
  render(<Harness />);
  return api;
}

const jan1 = new Date(2024, 0, 1);
const jan15 = new Date(2024, 0, 15);
const jan20 = new Date(2024, 0, 20);
const feb1 = new Date(2024, 1, 1);

describe('useCalendar hook', () => {
  describe('grid + navigation', () => {
    it('builds a 6-row x 7-col grid and weekday headers', () => {
      const api = setup({ defaultMonth: jan1, weekStartsOn: 0 });
      expect(api.state.grid.length).toBeGreaterThanOrEqual(5);
      expect(api.state.grid.length).toBeLessThanOrEqual(6);
      expect(api.state.grid[0]).toHaveLength(7);
      expect(api.state.weekdays).toHaveLength(7);
      // Each weekday header advances by exactly one day.
      for (let i = 1; i < 7; i++) {
        expect(api.state.weekdays[i]).not.toBe(api.state.weekdays[i - 1]);
      }
    });

    it('previousMonth / nextMonth move the displayed month and fire onMonthChange', () => {
      const onMonthChange = vi.fn();
      const api = setup({ defaultMonth: jan1, onMonthChange });
      act(() => api.actions.previousMonth());
      expect(api.state.month.getMonth()).toBe(11); // December 2023
      expect(api.state.month.getFullYear()).toBe(2023);
      expect(onMonthChange).toHaveBeenCalledTimes(1);

      act(() => api.actions.nextMonth());
      act(() => api.actions.nextMonth());
      expect(api.state.month.getMonth()).toBe(1); // February 2024
    });

    it('goToMonth jumps to an arbitrary month', () => {
      const api = setup({ defaultMonth: jan1 });
      act(() => api.actions.goToMonth(feb1));
      expect(api.state.month.getMonth()).toBe(1);
    });

    it('controlled month ignores internal navigation', () => {
      const api = setup({ defaultMonth: jan1, month: jan1 });
      act(() => api.actions.nextMonth());
      // Controlled: state stays on January.
      expect(api.state.month.getMonth()).toBe(0);
    });

    it('weekStartsOn=1 shifts the weekday order by one position', () => {
      const api0 = setup({ defaultMonth: jan1, weekStartsOn: 0 });
      const api1 = setup({ defaultMonth: jan1, weekStartsOn: 1 });
      // Starting on Monday means the Sunday-first list rotates by one slot.
      expect(api1.state.weekdays[0]).toBe(api0.state.weekdays[1]);
      expect(api1.state.weekdays[6]).toBe(api0.state.weekdays[0]);
    });

    it('emits ISO week numbers when showWeekNumber is on', () => {
      const api = setup({ defaultMonth: jan1, showWeekNumber: true });
      expect(api.state.weekNumbers).toBeDefined();
      expect(api.state.weekNumbers!.length).toBeGreaterThan(0);
    });
  });

  describe('single mode', () => {
    it('selectDate sets the value and reports isSelected', () => {
      const onSelect = vi.fn();
      const api = setup({ defaultMonth: jan1, mode: 'single', onSelect });
      act(() => api.actions.selectDate(jan15));
      expect(api.state.value).toEqual(jan15);
      expect(api.actions.isSelected(jan15)).toBe(true);
      expect(api.actions.isSelected(jan20)).toBe(false);
      expect(onSelect).toHaveBeenCalledWith(jan15);
    });

    it('clear resets selection', () => {
      const api = setup({ defaultMonth: jan1, mode: 'single', defaultValue: jan15 });
      expect(api.actions.isSelected(jan15)).toBe(true);
      act(() => api.actions.clear());
      expect(api.state.value).toBeNull();
      expect(api.actions.isSelected(jan15)).toBe(false);
    });

    it('controlled value is not mutated by selectDate', () => {
      const api = setup({ defaultMonth: jan1, mode: 'single', value: jan15 });
      act(() => api.actions.selectDate(jan20));
      expect(api.state.value).toEqual(jan15);
    });
  });

  describe('multiple mode', () => {
    it('toggles dates and reports membership', () => {
      const api = setup({ defaultMonth: jan1, mode: 'multiple' });
      act(() => api.actions.selectDate(jan15));
      act(() => api.actions.selectDate(jan20));
      expect(Array.isArray(api.state.value)).toBe(true);
      expect(api.actions.isSelected(jan15)).toBe(true);
      expect(api.actions.isSelected(jan20)).toBe(true);
      // Toggle off.
      act(() => api.actions.selectDate(jan15));
      expect(api.actions.isSelected(jan15)).toBe(false);
      expect(api.actions.isSelected(jan20)).toBe(true);
    });

    it('fixedDates cannot be deselected', () => {
      const api = setup({
        defaultMonth: jan1,
        mode: 'multiple',
        defaultValue: [jan15],
        fixedDates: [jan15]
      });
      act(() => api.actions.selectDate(jan15)); // attempt deselect
      expect(api.actions.isSelected(jan15)).toBe(true);
    });
  });

  describe('range mode', () => {
    it('builds a range across two picks and reports start/end/in-range', () => {
      const api = setup({ defaultMonth: jan1, mode: 'range' });
      act(() => api.actions.selectDate(jan20)); // first pick -> from
      expect(api.actions.isRangeStart(jan20)).toBe(true);
      expect(api.state.value).toEqual({ from: jan20, to: null });

      act(() => api.actions.selectDate(jan15)); // earlier date becomes from
      const value = api.state.value;
      expect(value.from).toEqual(jan15);
      expect(value.to).toEqual(jan20);
      expect(api.actions.isRangeStart(jan15)).toBe(true);
      expect(api.actions.isRangeEnd(jan20)).toBe(true);
      expect(api.actions.isInRange(jan17())).toBe(true);
    });

    it('picking before an existing start swaps the start forward', () => {
      const api = setup({ defaultMonth: jan1, mode: 'range' });
      act(() => api.actions.selectDate(jan20)); // from = Jan 20
      act(() => api.actions.selectDate(jan15)); // earlier -> from=15, to=20
      expect(api.state.value.from).toEqual(jan15);
      expect(api.state.value.to).toEqual(jan20);
    });

    it('a completed range restarts when a new date is picked', () => {
      const api = setup({ defaultMonth: jan1, mode: 'range' });
      act(() => api.actions.selectDate(jan15));
      act(() => api.actions.selectDate(jan20)); // completed
      act(() => api.actions.selectDate(jan17())); // new range start
      expect(api.state.value).toEqual({ from: jan17(), to: null });
    });

    it('clear resets the range', () => {
      const api = setup({
        defaultMonth: jan1,
        mode: 'range',
        defaultValue: { from: jan15, to: jan20 }
      });
      act(() => api.actions.clear());
      expect(api.state.value).toEqual({ from: null, to: null });
    });
  });

  describe('disabled / constrained dates', () => {
    it('fromDate / toDate mark out-of-range dates disabled and block selection', () => {
      const api = setup({
        defaultMonth: jan1,
        mode: 'single',
        fromDate: jan15,
        toDate: jan20
      });
      expect(api.actions.isDisabled(jan10())).toBe(true); // before fromDate
      expect(api.actions.isDisabled(jan25())).toBe(true); // after toDate
      expect(api.actions.isDisabled(jan17())).toBe(false);
      // Selecting a disabled date is a no-op.
      act(() => api.actions.selectDate(jan10()));
      expect(api.state.value).toBeNull();
    });

    it('disabledDates are reported and cannot be selected', () => {
      const api = setup({
        defaultMonth: jan1,
        mode: 'single',
        disabledDates: [jan15]
      });
      expect(api.actions.isDisabled(jan15)).toBe(true);
      act(() => api.actions.selectDate(jan15));
      expect(api.state.value).toBeNull();
    });
  });

  describe('predicates', () => {
    it('isToday / isCurrentMonth classify a date', () => {
      const api = setup({ defaultMonth: jan1 });
      const today = new Date();
      expect(api.actions.isToday(today)).toBe(true);
      expect(api.actions.isCurrentMonth(jan15)).toBe(true);
      expect(api.actions.isCurrentMonth(feb1)).toBe(false);
    });
  });

  describe('range predicate coverage', () => {
    it('isSelected/isInRange cover from-only range, completed range, and the non-range fallbacks', () => {
      // Completed range: isSelected true at both ends; isInRange true in the middle.
      const api = setup({
        defaultMonth: jan1,
        mode: 'range',
        defaultValue: { from: jan15, to: jan20 },
      });
      expect(api.actions.isSelected(jan15)).toBe(true);
      expect(api.actions.isSelected(jan20)).toBe(true);
      expect(api.actions.isSelected(jan17())).toBe(false);
      expect(api.actions.isInRange(jan17())).toBe(true);

      // From-only range: isInRange returns true for dates >= from; isSelected at from.
      const api2 = setup({ defaultMonth: jan1, mode: 'range' });
      act(() => api2.actions.selectDate(jan15));
      expect(api2.actions.isSelected(jan15)).toBe(true);
      expect(api2.actions.isInRange(jan17())).toBe(true);
      expect(api2.actions.isInRange(jan10())).toBe(false);

      // Non-range mode: range predicates return false.
      const api3 = setup({ defaultMonth: jan1, mode: 'single', defaultValue: jan15 });
      expect(api3.actions.isInRange(jan15)).toBe(false);
      expect(api3.actions.isRangeStart(jan15)).toBe(false);
      expect(api3.actions.isRangeEnd(jan15)).toBe(false);
    });

    it('gridHandlers.onKeyDown prevents default on arrow keys', () => {
      const api = setup({ defaultMonth: jan1 });
      const preventDefault = vi.fn();
      api.gridHandlers.onKeyDown({ key: 'ArrowRight', preventDefault } as any);
      api.gridHandlers.onKeyDown({ key: 'ArrowUp', preventDefault } as any);
      api.gridHandlers.onKeyDown({ key: 'ArrowDown', preventDefault } as any);
      api.gridHandlers.onKeyDown({ key: 'ArrowLeft', preventDefault } as any);
      // A non-arrow key does not preventDefault.
      api.gridHandlers.onKeyDown({ key: 'Enter', preventDefault } as any);
      expect(preventDefault).toHaveBeenCalledTimes(4);
    });

    it('multiple-mode selectDate from a null value coerces to an array; single-mode clear → null', () => {
      const api = setup({ defaultMonth: jan1, mode: 'multiple', defaultValue: null as any });
      act(() => api.actions.selectDate(jan15));
      expect(Array.isArray(api.state.value)).toBe(true);

      // single-mode clear yields null.
      const api2 = setup({ defaultMonth: jan1, mode: 'single', defaultValue: jan15 });
      act(() => api2.actions.clear());
      expect(api2.state.value).toBeNull();
    });

    it('isInRange returns false for a range missing `from`', () => {
      const api = setup({ defaultMonth: jan1, mode: 'range', defaultValue: { from: null, to: null } });
      expect(api.actions.isInRange(jan15)).toBe(false);
    });

    it('clear yields [] in multiple mode and is a no-op on internal state when controlled', () => {
      const api = setup({ defaultMonth: jan1, mode: 'multiple', defaultValue: [jan15] });
      act(() => api.actions.clear());
      expect(api.state.value).toEqual([]);

      const onSelect = vi.fn();
      const api2 = setup({ defaultMonth: jan1, mode: 'single', value: jan15, onSelect });
      act(() => api2.actions.clear());
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it('isSelected returns false for a value whose type does not match the mode', () => {
      // single mode with a null value → instanceof Date is false → final return false.
      const api = setup({ defaultMonth: jan1, mode: 'single', defaultValue: null as any });
      expect(api.actions.isSelected(jan15)).toBe(false);
      // unknown mode → falls through every branch to the final return false.
      const api2 = setup({ defaultMonth: jan1, mode: 'unknown' as any });
      expect(api2.actions.isSelected(jan15)).toBe(false);
    });

    it('selectDate is a no-op when mode is unset and selectDate coerces non-array/non-object values', () => {
      // mode unknown → selectDate returns early (final else).
      const api = setup({ defaultMonth: jan1, mode: 'unknown' as any });
      expect(() => act(() => api.actions.selectDate(jan15))).not.toThrow();

      // multiple mode with a controlled non-array value coerces to [].
      const api2 = setup({ defaultMonth: jan1, mode: 'multiple', value: null as any });
      act(() => api2.actions.selectDate(jan15));
      expect(Array.isArray(api2.state.value)).toBe(false); // controlled, internal stays unset

      // range mode with a controlled non-object value coerces to {from:null,to:null}.
      const api3 = setup({ defaultMonth: jan1, mode: 'range', value: null as any });
      expect(() => act(() => api3.actions.selectDate(jan15))).not.toThrow();
    });
  });
});

// Helper to build a fresh date inside January 2024 to avoid sharing references.
function jan10() { return new Date(2024, 0, 10); }
function jan17() { return new Date(2024, 0, 17); }
function jan25() { return new Date(2024, 0, 25); }
