/**
 * Headless hooks for React UI Forge components.
 * Provides behavior-only hooks following Flutter patterns.
 */

// Form controls
export type { UseButtonProps, UseButtonState, UseButtonActions, UseButtonReturns } from './useButton';
export { useButton } from './useButton';

export type { UseButtonGroupProps, UseButtonGroupState, UseButtonGroupActions, UseButtonGroupReturns } from './useButtonGroup';
export { useButtonGroup } from './useButtonGroup';

export type { UseInputProps, UseInputState, UseInputActions, UseInputReturns, ValidationRule } from './useInput';
export { useInput } from './useInput';

export type { UseCheckboxProps, UseCheckboxState, UseCheckboxActions, UseCheckboxReturns, CheckboxValue } from './useCheckbox';
export { useCheckbox } from './useCheckbox';

// Navigation and selection
export type { UseSelectProps, UseSelectState, UseSelectActions, UseSelectReturns, SelectOption } from './useSelect';
export { useSelect } from './useSelect';

export type { UseTabsProps, UseTabsState, UseTabsActions, UseTabsReturns, TabItem } from './useTabs';
export { useTabs } from './useTabs';

// Form controls
export type { UseSwitchProps, UseSwitchState, UseSwitchActions, UseSwitchReturns } from './useSwitch';
export { useSwitch } from './useSwitch';

export type { UseSliderProps, UseSliderState, UseSliderActions, UseSliderReturns, SliderValue } from './useSlider';
export { useSlider } from './useSlider';

export type { UseProgressProps, UseProgressReturns, ProgressValue, ProgressMode, ProgressOrientation } from './useProgress';
export { useProgress } from './useProgress';

export type { UseSpinnerProps, UseSpinnerReturns, SpinnerValue } from './useSpinner';
export { useSpinner } from './useSpinner';

// Layout components
export type { UseAspectRatioProps, UseAspectRatioState, UseAspectRatioActions, UseAspectRatioReturns } from './useAspectRatio';
export { useAspectRatio } from './useAspectRatio';

// Navigation components
export type { UseBreadcrumbProps, UseBreadcrumbState, UseBreadcrumbActions, UseBreadcrumbReturns, BreadcrumbItem } from './useBreadcrumb';
export { useBreadcrumb } from './useBreadcrumb';

// Form components
export type { UseLabelProps, UseLabelState, UseLabelActions, UseLabelReturns } from './useLabel';
export { useLabel } from './useLabel';

// Layout components
export type { UseSeparatorProps, UseSeparatorState, UseSeparatorActions, UseSeparatorReturns } from './useSeparator';
export { useSeparator } from './useSeparator';

export type { UseSkeletonProps, UseSkeletonState, UseSkeletonActions, UseSkeletonReturns, SkeletonVariant, SkeletonSize } from './useSkeleton';
export { useSkeleton } from './useSkeleton';

// Interactive components
export type { UseToggleProps, UseToggleState, UseToggleActions, UseToggleReturns } from './useToggle';
export { useToggle } from './useToggle';

export type { UseTextareaProps, UseTextareaState, UseTextareaActions, UseTextareaReturns } from './useTextarea';
export { useTextarea } from './useTextarea';

export type { UseCollapsibleProps, UseCollapsibleState, UseCollapsibleActions, UseCollapsibleReturns } from './useCollapsible';
export { useCollapsible } from './useCollapsible';

// Complex components
export type { UseCalendarProps, UseCalendarState, UseCalendarActions, UseCalendarReturns, CalendarDate, CalendarRange, CalendarMode } from './useCalendar';
export { useCalendar } from './useCalendar';

export type { UseCarouselProps, UseCarouselState, UseCarouselActions, UseCarouselReturns } from './useCarousel';
export { useCarousel } from './useCarousel';

// TODO: Implement remaining 60+ components from components.md
// Accordion, Alert, AlertDialog, Avatar, Badge, etc.