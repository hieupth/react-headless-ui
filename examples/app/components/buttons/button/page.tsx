'use client';

import { Button } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// reui components are headless — they ship behavior + a11y, not styles.
// The showcase applies Tailwind classes via the `className` prop and the
// `data-variant`/`data-size` attributes the Button emits.
const variantClasses =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ' +
  'transition-colors disabled:opacity-50 disabled:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const variantStyles: Record<string, string> = {
  default:
    'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
  ghost:
    'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
  icon: 'p-2',
};

export default function ButtonPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Button</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A versatile trigger button backed by the headless{' '}
          <code className="font-mono text-sm">useButton</code> hook. It composes
          focus, press, and semantic mixins to deliver complete keyboard, ARIA,
          loading, and icon behavior — with no styles baked in. Apply your own
          classes (or target the emitted <code className="font-mono text-sm">data-variant</code>{' '}
          / <code className="font-mono text-sm">data-size</code> attributes) to theme it.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Six semantic variants: <code>default</code>, <code>secondary</code>,{' '}
          <code>outline</code>, <code>ghost</code>, <code>destructive</code>, and{' '}
          <code>link</code>.
        </p>
        <Demo
          code={`<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>`}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="default" className={`${variantClasses} ${variantStyles.default}`}>
              Default
            </Button>
            <Button variant="secondary" className={`${variantClasses} ${variantStyles.secondary}`}>
              Secondary
            </Button>
            <Button variant="outline" className={`${variantClasses} ${variantStyles.outline}`}>
              Outline
            </Button>
            <Button variant="destructive" className={`${variantClasses} ${variantStyles.destructive}`}>
              Delete
            </Button>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes &amp; states</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sizes <code>sm</code> / <code>md</code> / <code>lg</code> /{' '}
          <code>icon</code>, plus <code>disabled</code> and{' '}
          <code>loading</code> states (the loader is swappable via{' '}
          <code>loadingIndicator</code>).
        </p>
        <Demo
          code={`<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
<Button loading> Saving… </Button>`}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" className={`${variantClasses} ${sizeStyles.sm} ${variantStyles.default}`}>
              Small
            </Button>
            <Button size="lg" className={`${variantClasses} ${sizeStyles.lg} ${variantStyles.default}`}>
              Large
            </Button>
            <Button disabled className={`${variantClasses} ${variantStyles.default}`}>
              Disabled
            </Button>
            <Button loading className={`${variantClasses} ${variantStyles.default}`}>
              Saving…
            </Button>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With icons</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Leading and trailing icon slots via <code>leadingIcon</code> and{' '}
          <code>trailingIcon</code>.
        </p>
        <Demo
          code={`<Button leadingIcon={<PlusIcon />}>New item</Button>
<Button variant="outline" trailingIcon={<ArrowIcon />}>Next</Button>`}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              leadingIcon={<span aria-hidden>＋</span>}
              className={`${variantClasses} ${variantStyles.default}`}
            >
              New item
            </Button>
            <Button
              variant="outline"
              trailingIcon={<span aria-hidden>→</span>}
              className={`${variantClasses} ${variantStyles.outline}`}
            >
              Next
            </Button>
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'",
              default: "'default'",
              description: 'Semantic visual variant. Emitted on data-variant for styling hooks.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg' | 'icon'",
              default: "'md'",
              description: 'Control density. Emitted on data-size.',
            },
            {
              name: 'loading',
              type: 'boolean',
              default: 'false',
              description: 'Disables interaction and renders the loadingIndicator when provided.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the button and sets aria-disabled.',
            },
            {
              name: 'fullWidth',
              type: 'boolean',
              default: 'false',
              description: 'Sets data-full-width for stretch-to-container styling.',
            },
            {
              name: 'onPress',
              type: '(event: React.MouseEvent) => void',
              default: '—',
              description: 'Primary press handler (guarded against loading/disabled).',
            },
            {
              name: 'leadingIcon / trailingIcon',
              type: 'ReactNode',
              default: '—',
              description: 'Icon slots rendered before/after the children.',
            },
            {
              name: 'loadingIndicator',
              type: 'ReactNode',
              default: '—',
              description: 'Custom node shown in place of content while loading.',
            },
            {
              name: 'render',
              type: '(props: ButtonRenderProps) => ReactElement',
              default: '—',
              description: 'Escape-hatch custom renderer receiving state + handlers.',
            },
          ]}
        />
      </section>
    </div>
  );
}
