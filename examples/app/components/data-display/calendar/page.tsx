'use client';

import { useEffect, useState } from 'react';
import { Calendar } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Calendar renders an interactive month grid with single, multiple, and range
// selection modes. The hook computes the month grid, disabled ranges, and
// today; the component wires a grid role with full arrow-key navigation.
// Headless on CSS — theme the day cells through className.

// The page is statically exported, so seeding render state with `new Date()`
// makes the prerendered HTML (build date) diverge from the first client
// render (visit date) — a text mismatch that trips React hydration error
// #418. Render a fixed month deterministically, then switch to the live
// month in an effect after hydration.
const INITIAL_MONTH = new Date(2026, 7, 1);

export default function CalendarPage() {
  const [month, setMonth] = useState(INITIAL_MONTH);
  const [value, setValue] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setValue(now);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A date picker backed by the headless{' '}
          <code className="font-mono text-sm">useCalendar</code> hook. It
          supports <code>single</code>, <code>multiple</code>, and{' '}
          <code>range</code> selection modes, controlled month navigation,{' '}
          <code>fromDate</code>/<code>toDate</code> bounds, and arbitrary{' '}
          <code>disabledDates</code>. The grid carries a <code>grid</code> role
          with arrow-key day navigation and <code>weekStartsOn</code> control.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Single selection</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive <code>value</code> with state and listen to{' '}
          <code>onSelect</code>.
        </p>
        <Demo
          code={`// Fixed initial month renders deterministically at build; switching to
// the live month in an effect avoids the build-date vs visit-date text
// mismatch behind React hydration error #418.
const [month, setMonth] = useState(new Date(2026, 7, 1));
const [value, setValue] = useState<Date | null>(null);

useEffect(() => {
  const now = new Date();
  setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  setValue(now);
}, []);

<Calendar
  mode="single"
  value={value}
  month={month}
  onMonthChange={setMonth}
  onSelect={setValue}
  className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 [&_.calendar-day]:h-8 [&_.calendar-day]:w-8 [&_.calendar-day]:flex [&_.calendar-day]:items-center [&_.calendar-day]:justify-center [&_.calendar-day]:rounded [&_.calendar-grid]:grid [&_.calendar-grid]:grid-cols-7 [&_.calendar-grid]:gap-1 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:text-gray-500"
/>`}
        >
          <div className="flex flex-col items-center gap-2">
            <Calendar
              mode="single"
              value={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={(v) => setValue(v as Date)}
              className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 [&_.calendar-day]:h-8 [&_.calendar-day]:w-8 [&_.calendar-day]:flex [&_.calendar-day]:items-center [&_.calendar-day]:justify-center [&_.calendar-day]:rounded [&_.calendar-grid]:grid [&_.calendar-grid]:grid-cols-7 [&_.calendar-grid]:gap-1 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:text-gray-500"
            />
            <span className="text-xs text-gray-500">{value?.toDateString() ?? '—'}</span>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Range selection</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>mode="range"</code> selects a start and end date; in-between
          days render as in-range.
        </p>
        <Demo
          code={`<Calendar
  mode="range"
  defaultMonth={new Date(2026, 6, 1)}
  defaultValue={{ from: new Date(2026, 6, 5), to: new Date(2026, 6, 12) }}
  className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 [&_.calendar-day]:h-8 [&_.calendar-day]:w-8 [&_.calendar-day]:flex [&_.calendar-day]:items-center [&_.calendar-day]:justify-center [&_.calendar-day]:rounded [&_.calendar-grid]:grid [&_.calendar-grid]:grid-cols-7 [&_.calendar-grid]:gap-1 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:text-gray-500"
/>`}
        >
          <Calendar
            mode="range"
            defaultMonth={new Date(2026, 6, 1)}
            defaultValue={{ from: new Date(2026, 6, 5), to: new Date(2026, 6, 12) }}
            className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 [&_.calendar-day]:h-8 [&_.calendar-day]:w-8 [&_.calendar-day]:flex [&_.calendar-day]:items-center [&_.calendar-day]:justify-center [&_.calendar-day]:rounded [&_.calendar-grid]:grid [&_.calendar-grid]:grid-cols-7 [&_.calendar-grid]:gap-1 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:text-gray-500"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bounded &amp; week start</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>fromDate</code>/<code>toDate</code> disable out-of-range days;
          <code>weekStartsOn</code> (0 = Sunday) shifts the first column.
        </p>
        <Demo
          code={`<Calendar
  mode="single"
  weekStartsOn={1}
  defaultMonth={new Date(2026, 6, 1)}
  fromDate={new Date(2026, 6, 1)}
  toDate={new Date(2026, 6, 20)}
  className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 [&_.calendar-day]:h-8 [&_.calendar-day]:w-8 [&_.calendar-day]:flex [&_.calendar-day]:items-center [&_.calendar-day]:justify-center [&_.calendar-day]:rounded [&_.calendar-grid]:grid [&_.calendar-grid]:grid-cols-7 [&_.calendar-grid]:gap-1 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:text-gray-500"
/>`}
        >
          <Calendar
            mode="single"
            weekStartsOn={1}
            defaultMonth={new Date(2026, 6, 1)}
            fromDate={new Date(2026, 6, 1)}
            toDate={new Date(2026, 6, 20)}
            className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 [&_.calendar-day]:h-8 [&_.calendar-day]:w-8 [&_.calendar-day]:flex [&_.calendar-day]:items-center [&_.calendar-day]:justify-center [&_.calendar-day]:rounded [&_.calendar-grid]:grid [&_.calendar-grid]:grid-cols-7 [&_.calendar-grid]:gap-1 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:text-gray-500"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'mode', type: "'single' | 'multiple' | 'range'", default: "'single'", description: 'Selection semantics.' },
            { name: 'value / defaultValue', type: 'Date | Date[] | CalendarRange | null', default: '—', description: 'Controlled / initial selection.' },
            { name: 'onSelect', type: '(value) => void', default: '—', description: 'Fires on selection change.' },
            { name: 'month / defaultMonth', type: 'Date', default: 'current', description: 'Controlled / initial displayed month.' },
            { name: 'onMonthChange', type: '(month: Date) => void', default: '—', description: 'Fires on prev/next month.' },
            { name: 'fromDate / toDate', type: 'Date', default: '—', description: 'Selectable bounds.' },
            { name: 'disabledDates', type: 'Date[]', default: '—', description: 'Individually disabled dates.' },
            { name: 'weekStartsOn', type: '0 | 1 | 2 | 3 | 4 | 5 | 6', default: '0', description: 'First day of the week (0 = Sunday).' },
            { name: 'showWeekNumber', type: 'boolean', default: 'false', description: 'Show ISO week numbers.' },
            { name: 'format / formatMonth / formatWeekday', type: '(date: Date) => string', default: '—', description: 'Custom label formatters.' },
            { name: 'HeaderComponent / DayComponent', type: 'React.FC', default: '—', description: 'Replace the header or day cell renderer.' },
          ]}
        />
      </section>
    </div>
  );
}
