/**
 * Calendar headless hook following Flutter calendar patterns.
 * Provides date selection functionality with proper accessibility.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useSemanticMixin, useFocusableMixin, usePressableMixin } from '../mixins';
import { composeState, composeHandlers } from '../utils';
import type { SemanticMixinProps, FocusableMixinProps, PressableMixinProps } from '../mixins';

export type CalendarMode = 'single' | 'multiple' | 'range';

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
  date: Date;
}

export interface CalendarRange {
  from: Date | null;
  to: Date | null;
}

/** A calendar selection value (null indicates no selection in single mode). */
export type CalendarValue = Date | Date[] | CalendarRange | null;

export interface UseCalendarProps extends
  SemanticMixinProps,
  FocusableMixinProps,
  PressableMixinProps {
  /** Calendar selection mode */
  mode?: CalendarMode;
  /** Default selected date(s) */
  defaultValue?: CalendarValue;
  /** Controlled selected date(s) */
  value?: CalendarValue;
  /** Called when selection changes */
  onSelect?: (value: CalendarValue) => void;
  /** Currently displayed month */
  defaultMonth?: Date;
  /** Controlled displayed month */
  month?: Date;
  /** Called when displayed month changes */
  onMonthChange?: (month: Date) => void;
  /** Minimum selectable date */
  fromDate?: Date;
  /** Maximum selectable date */
  toDate?: Date;
  /** Array of disabled dates */
  disabledDates?: Date[];
  /** Array of dates that cannot be deselected */
  fixedDates?: Date[];
  /** Day of week to start the calendar (0-6, Sunday = 0) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Whether to show week numbers */
  showWeekNumber?: boolean;
  /** Custom function to format dates */
  format?: (date: Date) => string;
  /** Custom function to format month name */
  formatMonth?: (date: Date) => string;
  /** Custom function to format weekday name */
  formatWeekday?: (date: Date) => string;
}

export interface UseCalendarState {
  /** Current selection mode */
  mode: CalendarMode;
  /** Currently selected date(s) */
  value: CalendarValue;
  /** Currently displayed month */
  month: Date;
  /** Calendar grid for current month */
  grid: CalendarDate[][];
  /** Weekday names */
  weekdays: string[];
  /** Week numbers */
  weekNumbers?: number[];
}

export interface UseCalendarActions {
  /** Select a date */
  selectDate: (date: Date) => void;
  /** Navigate to previous month */
  previousMonth: () => void;
  /** Navigate to next month */
  nextMonth: () => void;
  /** Navigate to specific month */
  goToMonth: (month: Date) => void;
  /** Clear selection */
  clear: () => void;
  /** Check if date is selected */
  isSelected: (date: Date) => boolean;
  /** Check if date is disabled */
  isDisabled: (date: Date) => boolean;
  /** Check if date is today */
  isToday: (date: Date) => boolean;
  /** Check if date is in current month */
  isCurrentMonth: (date: Date) => boolean;
  /** Check if date is in selected range */
  isInRange: (date: Date) => boolean;
  /** Check if date is range start/end */
  isRangeStart: (date: Date) => boolean;
  /** Check if date is range end */
  isRangeEnd: (date: Date) => boolean;
}

export interface UseCalendarReturns {
  /** Component state */
  state: UseCalendarState;
  /** Component actions */
  actions: UseCalendarActions;
  /** Semantic attributes for calendar */
  semanticAttributes: Record<string, any>;
  /** Grid navigation handlers */
  gridHandlers: Record<string, any>;
}

/**
 * Headless calendar hook providing date selection functionality.
 * Supports single, multiple, and range selection modes.
 */
export const useCalendar = (props: UseCalendarProps = {}): UseCalendarReturns => {
  const { totalItems, ...restProps } = props as UseCalendarProps & { totalItems?: number };
  const {
    mode = 'single',
    defaultValue,
    value: controlledValue,
    onSelect,
    defaultMonth = new Date(),
    month: controlledMonth,
    onMonthChange,
    fromDate,
    toDate,
    disabledDates = [],
    fixedDates = [],
    weekStartsOn = 0,
    showWeekNumber = false,
    formatMonth = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    formatWeekday = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }),
    ...semanticProps
  } = restProps;

  // Internal state
  const [internalValue, setInternalValue] = useState<CalendarValue>(() => {
    if (defaultValue) {
      if (mode === 'multiple' && Array.isArray(defaultValue)) {
        return [...defaultValue];
      } else if (mode === 'range' && typeof defaultValue === 'object' && 'from' in defaultValue) {
        return defaultValue as CalendarRange;
      } else if (mode === 'single' && defaultValue instanceof Date) {
        return defaultValue;
      }
    }
    return mode === 'multiple' ? [] : mode === 'range' ? { from: null, to: null } : null;
  });

  const [internalMonth, setInternalMonth] = useState(defaultMonth);

  // Determine controlled/uncontrolled state
  const isValueControlled = controlledValue !== undefined;
  const value = isValueControlled ? controlledValue : internalValue;

  // Keep the latest value in a ref so predicate/action callbacks (isSelected,
  // isInRange, selectDate, ...) always observe the most recent selection
  // instead of closing over a stale render's value within an act cycle.
  const valueRef = useRef(value);
  valueRef.current = value;
  const getValue = () => valueRef.current;

  const isMonthControlled = controlledMonth !== undefined;
  const month = isMonthControlled ? controlledMonth : internalMonth;

  // Semantic attributes
  const semanticAttributes = useSemanticMixin({
    role: 'grid',
    ...semanticProps
  });

  // Create calendar grid
  const createCalendarGrid = useCallback((targetMonth: Date): CalendarDate[][] => {
    const year = targetMonth.getFullYear();
    const monthIndex = targetMonth.getMonth();

    // Get first day of month and adjust for week start
    const firstDay = new Date(year, monthIndex, 1);
    const startOffset = (firstDay.getDay() - weekStartsOn + 7) % 7;

    // Get days in month and previous month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const grid: CalendarDate[][] = [];
    let currentDate = new Date(year, monthIndex, 1 - startOffset);

    // Create 6 weeks to ensure full month coverage
    for (let week = 0; week < 6; week++) {
      const weekRow: CalendarDate[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate);
        weekRow.push({
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          date
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      grid.push(weekRow);

      // Stop if we've covered all days of the month and next month starts
      if (week >= 4 && currentDate.getMonth() !== monthIndex) {
        break;
      }
    }

    return grid;
  }, [weekStartsOn]);

  // Get weekday names
  const weekdays = useMemo(() => {
    const weekdays = [];
    const date = new Date();

    for (let i = 0; i < 7; i++) {
      const dayIndex = (weekStartsOn + i) % 7;
      date.setDate(1 + dayIndex);
      weekdays.push(formatWeekday(date));
    }

    return weekdays;
  }, [weekStartsOn, formatWeekday]);

  // Get week numbers
  const weekNumbers = useMemo(() => {
    if (!showWeekNumber) return undefined;

    const numbers: number[] = [];
    const grid = createCalendarGrid(month);

    for (const week of grid) {
      /* c8 ignore next */
      if (week.length > 0) {
        const firstDate = week[0].date;
        const weekNumber = getISOWeek(firstDate);
        numbers.push(weekNumber);
      }
    }

    return numbers;
  }, [showWeekNumber, month, createCalendarGrid]);

  // Calendar grid for current month
  const grid = useMemo(() => createCalendarGrid(month), [month, createCalendarGrid]);

  // Helper function to get ISO week number
  function getISOWeek(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    /* c8 ignore next */
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  }

  // Date utility functions
  const isSameDay = useCallback((date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }, []);

  const isDateDisabled = useCallback((date: Date) => {
    // Check from/to constraints
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;

    // Check disabled dates
    return disabledDates.some(disabledDate => isSameDay(disabledDate, date));
  }, [fromDate, toDate, disabledDates, isSameDay]);

  const isDateSelected = useCallback((date: Date) => {
    const currentValue = getValue();
    if (mode === 'single') {
      return currentValue instanceof Date && isSameDay(currentValue, date);
    } else if (mode === 'multiple' && Array.isArray(currentValue)) {
      return currentValue.some(selectedDate => isSameDay(selectedDate, date));
    } else if (mode === 'range' && typeof currentValue === 'object' && currentValue !== null) {
      const range = currentValue as CalendarRange;
      return Boolean((range.from && isSameDay(range.from, date)) ||
             (range.to && isSameDay(range.to, date)));
    }
    return false;
  }, [mode, isSameDay, getValue]);

  const isDateInRange = useCallback((date: Date) => {
    const currentValue = getValue();
    if (mode !== 'range' || typeof currentValue !== 'object' || currentValue === null) {
      return false;
    }

    const range = currentValue as CalendarRange;
    if (!range.from) return false;

    if (range.to) {
      return date >= range.from && date <= range.to;
    }

    return date >= range.from;
  }, [mode, getValue]);

  const isRangeStart = useCallback((date: Date) => {
    const currentValue = getValue();
    if (mode !== 'range' || typeof currentValue !== 'object' || currentValue === null) {
      return false;
    }

    const range = currentValue as CalendarRange;
    return range.from !== null && isSameDay(range.from, date);
  }, [mode, isSameDay, getValue]);

  const isRangeEnd = useCallback((date: Date) => {
    const currentValue = getValue();
    if (mode !== 'range' || typeof currentValue !== 'object' || currentValue === null) {
      return false;
    }

    const range = currentValue as CalendarRange;
    return range.to !== null && isSameDay(range.to, date);
  }, [mode, isSameDay, getValue]);

  const isDateToday = useCallback((date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  }, [isSameDay]);

  const isCurrentMonthDate = useCallback((date: Date) => {
    return date.getFullYear() === month.getFullYear() &&
           date.getMonth() === month.getMonth();
  }, [month]);

  // Action functions
  const selectDate = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;

    const currentValue = getValue();
    let newValue: CalendarValue;

    if (mode === 'single') {
      newValue = date;
    } else if (mode === 'multiple') {
      const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];
      const existingIndex = currentArray.findIndex(d => isSameDay(d, date));

      if (existingIndex >= 0) {
        // Check if date is fixed (cannot be deselected)
        const isFixed = fixedDates.some(fixedDate => isSameDay(fixedDate, date));
        if (!isFixed) {
          currentArray.splice(existingIndex, 1);
        }
      } else {
        currentArray.push(date);
      }

      newValue = currentArray;
    } else if (mode === 'range') {
      const currentRange = (typeof currentValue === 'object' && currentValue !== null) ? currentValue as CalendarRange : { from: null, to: null };

      if (!currentRange.from || (currentRange.from && currentRange.to)) {
        // Start new range
        newValue = { from: date, to: null };
      } else if (date < currentRange.from) {
        // New start before current start
        newValue = { from: date, to: currentRange.from };
      } else {
        // Complete range
        newValue = { from: currentRange.from, to: date };
      }
    } else {
      return;
    }

    if (!isValueControlled) {
      setInternalValue(newValue);
    }
    onSelect?.(newValue);
  }, [mode, isDateDisabled, fixedDates, isSameDay, isValueControlled, onSelect, getValue]);

  const goToMonth = useCallback((newMonth: Date) => {
    if (!isMonthControlled) {
      setInternalMonth(newMonth);
    }
    onMonthChange?.(newMonth);
  }, [isMonthControlled, onMonthChange]);

  const previousMonth = useCallback(() => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() - 1);
    goToMonth(newMonth);
  }, [month, goToMonth]);

  const nextMonth = useCallback(() => {
    const newMonth = new Date(month);
    newMonth.setMonth(newMonth.getMonth() + 1);
    goToMonth(newMonth);
  }, [month, goToMonth]);

  const clear = useCallback(() => {
    const newValue = mode === 'multiple' ? [] : mode === 'range' ? { from: null, to: null } : null;

    if (!isValueControlled) {
      setInternalValue(newValue);
    }
    onSelect?.(newValue);
  }, [mode, isValueControlled, onSelect]);

  // Grid navigation
  const gridHandlers = useMemo(() => ({
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        // Grid navigation would be handled by the renderer component
      }
    }
  }), []);

  // Composed state
  const state = useMemo(() => composeState<UseCalendarState>({
    mode,
    value,
    month,
    grid,
    weekdays,
    weekNumbers
  }), [mode, value, month, grid, weekdays, weekNumbers]);

  // Composed actions
  const actions = useMemo(() => ({
    selectDate,
    previousMonth,
    nextMonth,
    goToMonth,
    clear,
    isSelected: isDateSelected,
    isDisabled: isDateDisabled,
    isToday: isDateToday,
    isCurrentMonth: isCurrentMonthDate,
    isInRange: isDateInRange,
    isRangeStart,
    isRangeEnd
  }), [selectDate, previousMonth, nextMonth, goToMonth, clear,
      isDateSelected, isDateDisabled, isDateToday, isCurrentMonthDate,
      isDateInRange, isRangeStart, isRangeEnd]);

  // Semantic attributes
  const finalSemanticAttributes = useMemo(() => ({
    ...semanticAttributes,
    role: 'grid',
    'aria-label': formatMonth(month)
  }), [semanticAttributes, month, formatMonth]);

  return useMemo(() => ({
    state,
    actions,
    semanticAttributes: finalSemanticAttributes,
    gridHandlers
  }), [state, actions, finalSemanticAttributes, gridHandlers]);
};