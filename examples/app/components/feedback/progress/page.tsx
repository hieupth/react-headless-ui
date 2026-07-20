import { Progress } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Progress is headless in the behavior/a11y sense; the default renderer emits
// empty class strings plus inline width. Tailwind below themes the track and
// the hook-driven inner fill so the preview is visible.
const trackBase =
  'w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800';
const trackSize: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
  xl: 'h-5',
};
export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Determinate and indeterminate progress indicators backed by the
          headless <code className="font-mono text-sm">useProgress</code> hook.
          It computes percentage, emits the{' '}
          <code className="font-mono text-sm">progressbar</code> role with{' '}
          <code className="font-mono text-sm">aria-valuenow/min/max</code>, and
          drives an inline-width fill. Companions{' '}
          <code className="font-mono text-sm">SimpleProgress</code>,{' '}
          <code className="font-mono text-sm">CircularProgress</code>, and{' '}
          <code className="font-mono text-sm">LoadingProgress</code> cover
          minimal, radial, and top-of-page variants.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Determinate bar</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>value</code> (0–100). With{' '}
          <code>showPercentage</code> the bar surfaces a numeric label.
        </p>
        <Demo
          code={`<Progress value={40} />
<Progress value={70} size="lg" />
<Progress value={100} color="success" showPercentage />`}
        >
          <div className="flex flex-col items-stretch gap-4 w-full max-w-md">
            <Progress value={40} className={`${trackBase} ${trackSize.md}`} />
            <Progress
              value={70}
              size="lg"
              className={`${trackBase} ${trackSize.lg}`}
            />
            <Progress
              value={100}
              color="success"
              showPercentage
              className={`${trackBase} ${trackSize.lg}`}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Indeterminate &amp; reversed</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>mode="indeterminate"</code> (or <code>value</code> omitted)
          renders an unknown-duration bar; <code>reversed</code> fills from the
          opposite end. Animate with <code>animated</code>.
        </p>
        <Demo
          code={`<Progress mode="indeterminate" />
<Progress value={60} reversed animated />`}
        >
          <div className="flex flex-col items-stretch gap-4 w-full max-w-md">
            <Progress
              mode="indeterminate"
              className={`${trackBase} ${trackSize.md}`}
            />
            <Progress
              value={60}
              reversed
              animated
              className={`${trackBase} ${trackSize.md}`}
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'number | null',
              default: '—',
              description: 'Current value (0–100). null/omitted → indeterminate.',
            },
            {
              name: 'mode',
              type: "'determinate' | 'indeterminate'",
              default: "'determinate'",
              description: 'Whether the duration is known.',
            },
            {
              name: 'min / max',
              type: 'number',
              default: '0 / 100',
              description: 'Value range; maps to aria-valuemin / aria-valuemax.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg' | 'xl'",
              default: "'md'",
              description: 'Bar height.',
            },
            {
              name: 'color',
              type: "'primary' | 'success' | 'warning' | 'error' | 'info'",
              default: "'primary'",
              description: 'Semantic fill color.',
            },
            {
              name: 'showPercentage',
              type: 'boolean',
              default: 'false',
              description: 'Render a numeric percentage label.',
            },
            {
              name: 'reversed / animated',
              type: 'boolean',
              default: 'false',
              description: 'Fill right-to-left / animate the fill.',
            },
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Bar orientation.',
            },
            {
              name: 'ariaLabel / ariaValueText',
              type: 'string',
              default: '—',
              description: 'Accessible name and human value text.',
            },
          ]}
        />
      </section>
    </div>
  );
}
