import { ButtonGroup } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// reui components are headless: ButtonGroup ships grouping + a11y state but no
// CSS. The showcase targets the rendered container + buttons with Tailwind.
// Because ButtonGroup composes its own internal button classes (empty in the
// headless build), we use the `children` render prop to apply classes per item
// and color the selected (exclusive) segment.
const btnBase =
  'px-4 py-2 text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const variantStyle: Record<string, { rest: string; selected: string }> = {
  primary: {
    rest: 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200',
    selected: 'bg-blue-600 text-white',
  },
  outline: {
    rest: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
    selected: 'border-blue-600 bg-blue-600 text-white',
  },
  ghost: {
    rest: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
    selected: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
  },
};

export default function ButtonGroupPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">ButtonGroup</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Groups related buttons into a connected segmented control, backed by
          the headless <code className="font-mono text-sm">useButtonGroup</code>{' '}
          hook. Supports horizontal/vertical orientation, attached edges, and
          exclusive (radio-like) or multi selection — all wired with proper ARIA
          roles. Like every reui component it ships no styles; theme the
          container and each item via classes or the{' '}
          <code className="font-mono text-sm">children</code> render prop.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Attached segments</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A connected toolbar of actions using{' '}
          <code>attached</code>. Each item is themed through the{' '}
          <code>children</code> render prop (the headless build leaves internal
          classes empty).
        </p>
        <Demo
          code={`<ButtonGroup
  variant="primary"
  attached
  buttons={[
    { label: 'Day' },
    { label: 'Week' },
    { label: 'Month' },
  ]}
>
  {(_, props, i) => <button {...props} className={btn(i)} />}
</ButtonGroup>`}
        >
          <ButtonGroup
            variant="primary"
            attached
            buttons={[
              { label: 'Day' },
              { label: 'Week' },
              { label: 'Month' },
            ]}
          >
            {(_, props, index) => {
              const isLast = index === 2;
              const radius = index === 0
                ? 'rounded-l-md'
                : isLast
                  ? 'rounded-r-md'
                  : '';
              return (
                <button
                  {...props}
                  className={`${btnBase} ${variantStyle.primary.rest} ${radius}`}
                />
              );
            }}
          </ButtonGroup>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Exclusive selection</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          With <code>exclusive</code>, the group behaves like a radio control:
          a single selected index, controlled via{' '}
          <code>selectedIndex</code> / <code>onSelectionChange</code>.
        </p>
        <Demo
          code={`<ButtonGroup
  variant="outline"
  exclusive
  defaultSelectedIndex={1}
  buttons={[
    { label: 'List' },
    { label: 'Grid' },
    { label: 'Gallery' },
  ]}
/>`}
        >
          <ButtonGroup
            variant="outline"
            exclusive
            defaultSelectedIndex={1}
            buttons={[
              { label: 'List' },
              { label: 'Grid' },
              { label: 'Gallery' },
            ]}
          >
            {(_, props, index, isSelected) => {
              const radius = index === 0
                ? 'rounded-l-md border-r-0'
                : index === 2
                  ? 'rounded-r-md'
                  : 'border-r-0';
              const state = isSelected
                ? variantStyle.outline.selected
                : variantStyle.outline.rest;
              return <button {...props} className={`${btnBase} ${radius} ${state}`} />;
            }}
          </ButtonGroup>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Vertical &amp; disabled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set <code>orientation="vertical"</code> for stacked groups, and{' '}
          <code>disabled</code> to disable every item at once.
        </p>
        <Demo
          code={`<ButtonGroup
  variant="ghost"
  orientation="vertical"
  buttons={[
    { label: 'Profile' },
    { label: 'Settings' },
    { label: 'Sign out' },
  ]}
/>`}
        >
          <ButtonGroup
            variant="ghost"
            orientation="vertical"
            buttons={[
              { label: 'Profile' },
              { label: 'Settings' },
              { label: 'Sign out' },
            ]}
          >
            {(_, props, index) => {
              const radius = index === 0
                ? 'rounded-t-md'
                : index === 2
                  ? 'rounded-b-md'
                  : '';
              return (
                <button
                  {...props}
                  className={`${btnBase} w-full text-left ${variantStyle.ghost.rest} ${radius}`}
                />
              );
            }}
          </ButtonGroup>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'buttons',
              type: 'Array<{ label: ReactNode; value?: any; disabled?: boolean; onClick?: (e) => void; buttonProps?: Record<string, any> }>',
              default: '[]',
              description: 'List of buttons to render in the group.',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Layout direction of the group.',
            },
            {
              name: 'attached',
              type: 'boolean',
              default: 'false',
              description: 'Visually connect adjacent button edges.',
            },
            {
              name: 'exclusive',
              type: 'boolean',
              default: 'false',
              description: 'Radio-like selection: only one item selected at a time.',
            },
            {
              name: 'selectedIndex',
              type: 'number | null',
              default: '—',
              description: 'Controlled selected index (exclusive mode).',
            },
            {
              name: 'defaultSelectedIndex',
              type: 'number | null',
              default: '—',
              description: 'Initial selected index for uncontrolled exclusive mode.',
            },
            {
              name: 'onSelectionChange',
              type: '(index: number | null) => void',
              default: '—',
              description: 'Called when the exclusive selection changes.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size applied to every button in the group.',
            },
            {
              name: 'variant',
              type: "'primary' | 'secondary' | 'outline' | 'ghost'",
              default: "'primary'",
              description: 'Variant applied to every button in the group.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables the entire group.',
            },
            {
              name: 'children',
              type: '(button, props, index, isSelected) => ReactNode',
              default: '—',
              description: 'Render prop for custom per-item rendering with full state.',
            },
          ]}
        />
      </section>
    </div>
  );
}
