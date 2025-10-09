/**
 * React UI Forge - Core Package
 *
 * Flutter-inspired headless UI library for React.
 * Provides foundational contracts, mixins, and utilities.
 *
 * Architecture Principles:
 * - Composition over inheritance (Widget-style)
 * - Behavior mixins (Flutter mixin pattern)
 * - Theme extensions (ThemeExtension pattern)
 * - Semantic-first (Flutter Semantics)
 * - Traversal rendering (Widget tree)
 */

// Core contracts
export type {
  ComponentContract,
  ComponentState,
  ComponentLifecycle,
  TraversalNode,
  SemanticContract,
  AriaRole,
  KeyboardNavigation,
  NavigationKey
} from './contracts';

// Core mixins
export type {
  FocusableMixinProps,
  FocusableState,
  FocusableActions,
  PressableMixinProps,
  PressableState,
  PressableActions,
  SemanticMixinProps
} from './mixins';

export {
  useFocusableMixin,
  usePressableMixin,
  useSemanticMixin
} from './mixins';

// Core utilities
export type {
  CompositionOptions,
  MergeStrategy
} from './utils';

export {
  composeState,
  composeHandlers,
  composeClasses,
  composeStyles,
  createTraversalTree,
  composeLifecycle,
  useComposition
} from './utils';

// Headless hooks
export type {
  ButtonProps,
  ButtonState,
  ButtonActions,
  ButtonReturns,
  InputProps,
  InputState,
  InputActions,
  InputReturns,
  DialogProps,
  DialogState,
  DialogActions,
  DialogReturns,
  MenuItem,
  MenuProps,
  MenuState,
  MenuActions,
  MenuReturns,
  SelectOption,
  SelectProps,
  SelectState,
  SelectActions,
  SelectReturns,
  TabItem,
  TabsProps,
  TabsState,
  TabsActions,
  TabsReturns,
  SwitchProps,
  SwitchState,
  SwitchActions,
  SwitchReturns,
  SliderProps,
  SliderState,
  SliderActions,
  SliderReturns,
  SliderValue,
  UseSpinnerProps,
  UseSpinnerReturns,
  SpinnerValue,
  UseAspectRatioProps,
  UseAspectRatioState,
  UseAspectRatioActions,
  UseAspectRatioReturns,
  UseBreadcrumbProps,
  UseBreadcrumbState,
  UseBreadcrumbActions,
  UseBreadcrumbReturns,
  BreadcrumbItem,
  UseLabelProps,
  UseLabelState,
  UseLabelActions,
  UseLabelReturns,
  UseSeparatorProps,
  UseSeparatorState,
  UseSeparatorActions,
  UseSeparatorReturns,
  UseSkeletonProps,
  UseSkeletonState,
  UseSkeletonActions,
  UseSkeletonReturns,
  SkeletonVariant,
  SkeletonSize,
  UseCalendarProps,
  UseCalendarState,
  UseCalendarActions,
  UseCalendarReturns,
  CalendarDate,
  CalendarRange,
  CalendarMode,
  UseCarouselProps,
  UseCarouselState,
  UseCarouselActions,
  UseCarouselReturns
} from './headless';

export {
  useButton,
  useInput,
  useDialog,
  useMenu,
  useSelect,
  useTabs,
  useSwitch,
  useSlider,
  useSpinner,
  useAspectRatio,
  useBreadcrumb,
  useLabel,
  useSeparator,
  useSkeleton,
  useCalendar,
  useCarousel
} from './headless';