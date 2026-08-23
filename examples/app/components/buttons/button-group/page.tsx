'use client';

import { ButtonGroup } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// react-headless-ui components are headless: ButtonGroup ships grouping + a11y state but no
// CSS. The showcase targets the rendered container + buttons with Tailwind.
// Because ButtonGroup composes its own internal button classes (empty in the
// headless build), we use the `children` render prop to apply classes per item
// and color the selected (exclusive) segment.
const btnBase =
  'px-4 py-2 text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

const variantStyle: Record<string, { rest: string; selected: string }> = {
  primary: {
    rest: 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200',
    selected: 'bg-indigo-600 text-white',
  },
  outline: {
    rest: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
    selected: 'border-indigo-600 bg-indigo-600 text-white',
  },
  ghost: {
    rest: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
    selected: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
  },
};

export default function ButtonGroupPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">ButtonGroup</h1>
        <p className="docs-lead">
          Groups related buttons into a connected segmented control, backed by
          the headless <code className="docs-code">useButtonGroup</code>{' '}
          hook. Supports horizontal/vertical orientation, attached edges, and
          exclusive (radio-like) or multi selection — all wired with proper ARIA
          roles. Like every react-headless-ui component it ships no styles; theme the
          container and each item via classes or the{' '}
          <code className="docs-code">children</code> render prop.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Attached segments</h2>
        <p className="docs-desc">
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
  {(_, props, index) => {
    const isLast = index === 2;
    const radius = index === 0 ? 'rounded-l-md' : isLast ? 'rounded-r-md' : '';
    return (
      <button
        {...props}
        className={\`\${btnBase} \${variantStyle.primary.rest} \${radius}\`}
      />
    );
  }}
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

      <section className="docs-section">
        <h2 className="docs-h2">Exclusive selection</h2>
        <p className="docs-desc">
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
>
  {(_, props, index, isSelected) => {
    const radius = index === 0
      ? 'rounded-l-md border-r-0'
      : index === 2
        ? 'rounded-r-md'
        : 'border-r-0';
    const state = isSelected ? variantStyle.outline.selected : variantStyle.outline.rest;
    return <button {...props} className={\`\${btnBase} \${radius} \${state}\`} />;
  }}
</ButtonGroup>`}
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

      <section className="docs-section">
        <h2 className="docs-h2">Vertical &amp; disabled</h2>
        <p className="docs-desc">
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
>
  {(_, props, index) => {
    const radius = index === 0 ? 'rounded-t-md' : index === 2 ? 'rounded-b-md' : '';
    return (
      <button
        {...props}
        className={\`\${btnBase} w-full text-left \${variantStyle.ghost.rest} \${radius}\`}
      />
    );
  }}
</ButtonGroup>`}
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

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
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
