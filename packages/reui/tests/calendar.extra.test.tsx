import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useCalendar } from '../src/hooks';
import type { UseCalendarProps } from '../src/hooks';

// Extends useCalendar coverage for the branches not exercised by
// useCalendar.hook.test.tsx: the from-only isInRange path, the unknown-mode
// selectDate early-return, the gridHandlers arrow-key handler, controlled
// month/value callbacks, and custom formatters.

function setup(props: UseCalendarProps = {}) {
  const api = { result: null as any };
  function Harness() {
    api.result = useCalendar(props);
    return null;
  }
  render(<Harness />);
  return api;
}

const jan1 = new Date(2024, 0, 1);
const jan15 = new Date(2024, 0, 15);
const jan17 = new Date(2024, 0, 17);
const jan20 = new Date(2024, 0, 20);

describe('useCalendar extra coverage', () => {
  describe('isInRange branch coverage', () => {
    it('non-range modes never report in-range', () => {
      const { result } = setup({ defaultMonth: jan1, mode: 'single', defaultValue: jan15 });
      expect(result.actions.isInRange(jan15)).toBe(false);
    });

    it('range with from but no to: every date >= from is in range', () => {
      const { result } = setup({ defaultMonth: jan1, mode: 'range' });
      act(() => result.actions.selectDate(jan15)); // from set, to null
      // Earlier than from -> false (guarded by the from-only branch path).
      expect(result.actions.isInRange(new Date(2024, 0, 10))).toBe(false);
      // from itself -> in range.
      expect(result.actions.isInRange(jan15)).toBe(true);
      // A later date -> in range (exercises the `date >= range.from` return).
      expect(result.actions.isInRange(jan17)).toBe(true);
      expect(result.actions.isInRange(jan20)).toBe(true);
    });

    it('range with null from returns false for any date', () => {
      const { result } = setup({ defaultMonth: jan1, mode: 'range' });
      expect(result.actions.isInRange(jan15)).toBe(false);
    });

    it('range predicates return false for a non-object value', () => {
      const { result } = setup({
        defaultMonth: jan1,
        mode: 'range',
        // Force a malformed value through controlled value.
        value: null as any,
      });
      expect(result.actions.isInRange(jan15)).toBe(false);
      expect(result.actions.isRangeStart(jan15)).toBe(false);
      expect(result.actions.isRangeEnd(jan15)).toBe(false);
    });
  });

  describe('selectDate unknown-mode early return', () => {
    it('does nothing when mode is not single/multiple/range', () => {
      const onSelect = vi.fn();
      const { result } = setup({ defaultMonth: jan1, mode: 'invalid' as any });
      act(() => result.actions.selectDate(jan15));
      // No state change, no onSelect invocation.
      expect(onSelect).not.toHaveBeenCalled();
      expect(result.state.value).toBeNull();
    });

    it('skips disabled dates silently', () => {
      const onSelect = vi.fn();
      const { result } = setup({
        defaultMonth: jan1,
        mode: 'single',
        disabledDates: [jan15],
        onSelect,
      });
      act(() => result.actions.selectDate(jan15));
      expect(onSelect).not.toHaveBeenCalled();
      expect(result.state.value).toBeNull();
    });
  });

  describe('gridHandlers.onKeyDown', () => {
    it('arrow keys call preventDefault and do not throw', () => {
      const { result } = setup({ defaultMonth: jan1 });
      for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
        const preventDefault = vi.fn();
        expect(() => act(() => {
          result.gridHandlers.onKeyDown({ key, preventDefault } as any);
        })).not.toThrow();
        expect(preventDefault).toHaveBeenCalled();
      }
      // Non-arrow keys are ignored (no preventDefault).
      const preventDefault = vi.fn();
      act(() => {
        result.gridHandlers.onKeyDown({ key: 'Enter', preventDefault } as any);
      });
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('controlled month callbacks', () => {
    it('controlled month still fires onMonthChange on navigation', () => {
      const onMonthChange = vi.fn();
      const { result } = setup({ defaultMonth: jan1, month: jan1, onMonthChange });
      act(() => result.actions.nextMonth());
      expect(onMonthChange).toHaveBeenCalledTimes(1);
      // State stays on the controlled value.
      expect(result.state.month.getMonth()).toBe(0);
    });

    it('goToMonth fires onMonthChange even when controlled', () => {
      const onMonthChange = vi.fn();
      const { result } = setup({ defaultMonth: jan1, month: jan1, onMonthChange });
      act(() => result.actions.goToMonth(new Date(2024, 5, 1)));
      expect(onMonthChange).toHaveBeenCalled();
    });
  });

  describe('controlled value still fires onSelect', () => {
    it('controlled single value: selectDate fires onSelect without mutating state', () => {
      const onSelect = vi.fn();
      const { result } = setup({ defaultMonth: jan1, mode: 'single', value: jan15, onSelect });
      act(() => result.actions.selectDate(jan20));
      expect(onSelect).toHaveBeenCalledWith(jan20);
      expect(result.state.value).toEqual(jan15); // unchanged
    });

    it('controlled multiple value: toggling still fires onSelect', () => {
      const onSelect = vi.fn();
      const { result } = setup({
        defaultMonth: jan1,
        mode: 'multiple',
        value: [jan15],
        onSelect,
      });
      act(() => result.actions.selectDate(jan20));
      expect(onSelect).toHaveBeenCalled();
      // Controlled value is unchanged.
      expect(result.state.value).toEqual([jan15]);
    });

    it('clear on controlled value fires onSelect but leaves state unchanged', () => {
      const onSelect = vi.fn();
      const { result } = setup({ defaultMonth: jan1, mode: 'single', value: jan15, onSelect });
      act(() => result.actions.clear());
      expect(onSelect).toHaveBeenCalledWith(null);
      expect(result.state.value).toEqual(jan15);
    });
  });

  describe('custom formatters', () => {
    it('uses provided format / formatMonth / formatWeekday', () => {
      const format = (d: Date) => `d${d.getDate()}`;
      const formatMonth = (d: Date) => `m${d.getMonth()}`;
      const formatWeekday = (d: Date) => `w${d.getDay()}`;
      const { result } = setup({
        defaultMonth: jan1,
        format,
        formatMonth,
        formatWeekday,
      });
      // formatMonth shows up on the aria-label.
      expect(result.semanticAttributes['aria-label']).toBe('m0');
      // formatWeekday produced custom weekday strings.
      expect(result.state.weekdays.every(w => /^w\d$/.test(w))).toBe(true);
    });
  });

  describe('defaultValue normalization per mode', () => {
    it('multiple mode seeds from a Date[] defaultValue', () => {
      const { result } = setup({ defaultMonth: jan1, mode: 'multiple', defaultValue: [jan15, jan20] });
      expect(result.actions.isSelected(jan15)).toBe(true);
      expect(result.actions.isSelected(jan20)).toBe(true);
    });

    it('range mode seeds from a CalendarRange defaultValue', () => {
      const { result } = setup({
        defaultMonth: jan1,
        mode: 'range',
        defaultValue: { from: jan15, to: jan20 },
      });
      expect(result.actions.isRangeStart(jan15)).toBe(true);
      expect(result.actions.isRangeEnd(jan20)).toBe(true);
      expect(result.actions.isInRange(jan17)).toBe(true);
    });

    it('single mode seeds from a Date defaultValue', () => {
      const { result } = setup({ defaultMonth: jan1, mode: 'single', defaultValue: jan15 });
      expect(result.actions.isSelected(jan15)).toBe(true);
    });

    it('single mode with a non-Date truthy defaultValue falls back to null', () => {
      // The defaultValue union (Date | Date[] | CalendarRange | null) is not
      // narrowed by mode, so a single-mode call may receive an array/range.
      // The `instanceof Date` guard rejects it and the chain falls through to
      // the default `return null`, keeping the selection empty rather than
      // seeding an invalid value.
      const arrayResult = setup({
        defaultMonth: jan1,
        mode: 'single',
        defaultValue: [jan15] as any,
      });
      expect(arrayResult.result.state.value).toBeNull();
      expect(arrayResult.result.actions.isSelected(jan15)).toBe(false);

      const rangeResult = setup({
        defaultMonth: jan1,
        mode: 'single',
        defaultValue: { from: jan15, to: jan20 } as any,
      });
      expect(rangeResult.result.state.value).toBeNull();
    });

    it('no defaultValue yields empty initial state per mode', () => {
      const r1 = setup({ defaultMonth: jan1, mode: 'single' });
      expect(r1.result.state.value).toBeNull();
      const r2 = setup({ defaultMonth: jan1, mode: 'multiple' });
      expect(r2.result.state.value).toEqual([]);
      const r3 = setup({ defaultMonth: jan1, mode: 'range' });
      expect(r3.result.state.value).toEqual({ from: null, to: null });
    });
  });

  describe('multiple mode fixedDates without existing selection', () => {
    it('appends a new date when not already selected', () => {
      const api = setup({ defaultMonth: jan1, mode: 'multiple' });
      // selectDate reads the latest value via an internal ref, so drive it
      // through the holder's current result; the destructured snapshot's
      // `state.value` would be stale across the act() boundary.
      act(() => api.result.actions.selectDate(jan15));
      act(() => api.result.actions.selectDate(jan20));
      expect(api.result.state.value).toHaveLength(2);
    });
  });
});
