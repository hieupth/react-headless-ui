/**
 * Calendar component using useCalendar hook.
 * Provides interactive date selection with multiple modes.
 */

import React from 'react';
import { useCalendar, type UseCalendarProps, type CalendarDate } from '../../core/src/headless/useCalendar';
import { useTheme } from '../providers/ThemeProvider';

export interface CalendarProps extends UseCalendarProps {
  /** Additional CSS classes */
  className?: string;
  /** Custom header component */
  HeaderComponent?: React.FC<{ month: Date; onPrevious: () => void; onNext: () => void }>;
  /** Custom day component */
  DayComponent?: React.FC<{
    date: CalendarDate;
    isSelected: boolean;
    isDisabled: boolean;
    isToday: boolean;
    isCurrentMonth: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    onSelect: (date: Date) => void;
  }>;
  /** Custom weekday header component */
  WeekdayComponent?: React.FC<{ weekday: string; index: number }>;
  /** Whether to show outside days */
  showOutsideDays?: boolean;
}

/**
 * Calendar component with single, multiple, and range selection modes.
 * Follows Flutter calendar patterns with proper accessibility.
 */
export const Calendar: React.FC<CalendarProps> = ({
  className = '',
  HeaderComponent,
  DayComponent,
  WeekdayComponent,
  showOutsideDays = true,
  ...props
}) => {
  const theme = useTheme();
  const {
    state,
    actions,
    semanticAttributes,
    gridHandlers
  } = useCalendar(props);

  const gridRef = React.useRef<HTMLDivElement>(null);

  // Combine custom classes with theme classes
  const wrapperClassName = [
    'calendar-wrapper',
    className,
    theme?.extensions?.spacing?.component?.padding
  ].filter(Boolean).join(' ');

  const headerClassName = [
    'calendar-header',
    theme?.extensions?.spacing?.component?.margin
  ].filter(Boolean).join(' ');

  const gridClassName = [
    'calendar-grid',
    theme?.extensions?.spacing?.component?.gap
  ].filter(Boolean).join(' ');

  const weekdayClassName = [
    'calendar-weekday',
    'calendar-weekday-header',
    theme?.extensions?.typography?.small?.fontSize,
    theme?.extensions?.spacing?.component?.padding
  ].filter(Boolean).join(' ');

  const weekNumberClassName = [
    'calendar-week-number',
    'calendar-week-number-header',
    theme?.extensions?.typography?.small?.fontSize,
    theme?.extensions?.spacing?.component?.padding
  ].filter(Boolean).join(' ');

  // Default Header component
  const DefaultHeader = ({ month, onPrevious, onNext }: { month: Date; onPrevious: () => void; onNext: () => void }) => (
    <div className={headerClassName}>
      <button
        onClick={onPrevious}
        className="calendar-nav-button calendar-nav-previous"
        aria-label="Previous month"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="calendar-month-display">
        {props.formatMonth?.(month) || month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>

      <button
        onClick={onNext}
        className="calendar-nav-button calendar-nav-next"
        aria-label="Next month"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  // Default Day component
  const DefaultDay = ({
    date,
    isSelected,
    isDisabled,
    isToday,
    isCurrentMonth,
    isInRange,
    isRangeStart,
    isRangeEnd,
    onSelect
  }: {
    date: CalendarDate;
    isSelected: boolean;
    isDisabled: boolean;
    isToday: boolean;
    isCurrentMonth: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    onSelect: (date: Date) => void;
  }) => {
    const dayClassName = [
      'calendar-day',
      isSelected && 'calendar-day-selected',
      isDisabled && 'calendar-day-disabled',
      isToday && 'calendar-day-today',
      !isCurrentMonth && 'calendar-day-outside',
      isInRange && 'calendar-day-in-range',
      isRangeStart && 'calendar-day-range-start',
      isRangeEnd && 'calendar-day-range-end',
      theme?.extensions?.spacing?.component?.padding
    ].filter(Boolean).join(' ');

    const handleClick = () => {
      if (!isDisabled) {
        onSelect(date.date);
      }
    };

    return (
      <button
        className={dayClassName}
        onClick={handleClick}
        disabled={isDisabled}
        type="button"
        aria-pressed={isSelected}
        aria-label={`${date.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${isToday ? ' (Today)' : ''}`}
      >
        {props.format?.(date.date) || date.day}
      </button>
    );
  };

  // Default Weekday component
  const DefaultWeekday = ({ weekday }: { weekday: string; index: number }) => (
    <div className={weekdayClassName} aria-hidden="true">
      {weekday}
    </div>
  );

  const Header = HeaderComponent || DefaultHeader;
  const Day = DayComponent || DefaultDay;
  const Weekday = WeekdayComponent || DefaultWeekday;

  return (
    <div className={wrapperClassName}>
      <Header
        month={state.month}
        onPrevious={actions.previousMonth}
        onNext={actions.nextMonth}
      />

      <div
        ref={gridRef}
        {...semanticAttributes}
        {...gridHandlers}
        className={gridClassName}
      >
        {/* Weekday headers */}
        <div className="calendar-weekdays" role="row">
          {props.showWeekNumber && (
            <div className={weekNumberClassName} aria-hidden="true">
              Wk
            </div>
          )}
          {state.weekdays.map((weekday, index) => (
            <Weekday key={index} weekday={weekday} index={index} />
          ))}
        </div>

        {/* Calendar days */}
        {state.grid.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week" role="row">
            {props.showWeekNumber && state.weekNumbers && (
              <div className={weekNumberClassName} aria-hidden="true">
                {state.weekNumbers[weekIndex]}
              </div>
            )}
            {week.map((date, dayIndex) => {
              // Hide outside days if not showing them
              if (!showOutsideDays && !actions.isCurrentMonth(date.date)) {
                return (
                  <div key={`${weekIndex}-${dayIndex}`} className="calendar-day-spacer" />
                );
              }

              return (
                <Day
                  key={`${weekIndex}-${dayIndex}`}
                  date={date}
                  isSelected={actions.isSelected(date.date)}
                  isDisabled={actions.isDisabled(date.date)}
                  isToday={actions.isToday(date.date)}
                  isCurrentMonth={actions.isCurrentMonth(date.date)}
                  isInRange={actions.isInRange(date.date)}
                  isRangeStart={actions.isRangeStart(date.date)}
                  isRangeEnd={actions.isRangeEnd(date.date)}
                  onSelect={actions.selectDate}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Calendar variants for specific use cases
export const SingleDateCalendar: React.FC<Omit<CalendarProps, 'mode'>> = (props) => (
  <Calendar {...props} mode="single" />
);

export const MultiDateCalendar: React.FC<Omit<CalendarProps, 'mode'>> = (props) => (
  <Calendar {...props} mode="multiple" />
);

export const RangeCalendar: React.FC<Omit<CalendarProps, 'mode'>> = (props) => (
  <Calendar {...props} mode="range" />
);

export const DatePickerCalendar: React.FC<Omit<CalendarProps, 'mode' | 'onSelect'> & {
  onSelect?: (date: Date) => void;
}> = (props) => (
  <Calendar
    {...props}
    mode="single"
    onSelect={(value) => {
      if (value instanceof Date) {
        props.onSelect?.(value);
      }
    }}
  />
);

Calendar.displayName = 'Calendar';
SingleDateCalendar.displayName = 'SingleDateCalendar';
MultiDateCalendar.displayName = 'MultiDateCalendar';
RangeCalendar.displayName = 'RangeCalendar';
DatePickerCalendar.displayName = 'DatePickerCalendar';