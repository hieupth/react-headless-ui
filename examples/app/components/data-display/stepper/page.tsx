'use client';

import { Stepper } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Stepper renders a multi-step workflow: numbered step markers connected by a
// progress line plus optional navigation buttons. It is headless on CSS —
// supply colors through className. The hook owns step state, validation, and
// skip/complete semantics.
const steps = [
  { key: 'account', title: 'Account', description: 'Create your credentials' },
  { key: 'profile', title: 'Profile', description: 'Tell us about you' },
  { key: 'confirm', title: 'Confirm', description: 'Review and finish' },
];

export default function StepperPage() {
  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">Stepper</h1>
        <p className="docs-lead">
          A multi-step progress indicator backed by the headless{' '}
          <code className="docs-code">useStepper</code> hook. It tracks
          the current step, completed and invalid steps, supports{' '}
          <code>linear</code> ordering, per-step <code>validate</code>{' '}
          callbacks, and horizontal / vertical orientations. Variants include{' '}
          <code>default</code>, <code>dots</code>, and <code>progress</code>;
          optional navigation buttons advance the flow.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Horizontal flow</h2>
        <p className="docs-desc">
          Each step needs a unique <code>key</code> and a <code>title</code>.
          <code>showNavigation</code> renders Back / Next buttons.
        </p>
        <Demo
          code={`const steps = [
  { key: 'account', title: 'Account' },
  { key: 'profile', title: 'Profile' },
  { key: 'confirm', title: 'Confirm' },
];

<Stepper steps={steps} showNavigation className="flex items-center text-sm text-gray-800 dark:text-gray-200" />`}
        >
          <Stepper
            steps={steps}
            showNavigation
            className="flex items-center text-sm text-gray-800 dark:text-gray-200"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Vertical &amp; dots variant</h2>
        <p className="docs-desc">
          <code>orientation="vertical"</code> stacks the steps;{' '}
          <code>variant="dots"</code> swaps numbered markers for dots.
        </p>
        <Demo
          code={`<Stepper
  steps={steps}
  orientation="vertical"
  variant="dots"
  initialStep={1}
  className="flex flex-col items-start text-sm text-gray-800 dark:text-gray-200"
/>`}
        >
          <Stepper
            steps={steps}
            orientation="vertical"
            variant="dots"
            initialStep={1}
            className="flex flex-col items-start text-sm text-gray-800 dark:text-gray-200"
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            { name: 'steps', type: 'StepperStep[]', default: '—', description: 'Step config: { key, title, description?, validate?, optional? }.' },
            { name: 'initialStep', type: 'number', default: '0', description: 'Starting step index.' },
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Stepper density.' },
            { name: 'variant', type: "'default' | 'dots' | 'progress'", default: "'default'", description: 'Visual presentation.' },
            { name: 'linear', type: 'boolean', default: 'false', description: 'Force completing steps in order.' },
            { name: 'showStepNumbers', type: 'boolean', default: 'true', description: 'Number the step markers.' },
            { name: 'showNavigation / showProgress', type: 'boolean', default: '—', description: 'Render nav buttons / a progress bar.' },
            { name: 'allowSkip', type: 'boolean', default: 'false', description: 'Allow skipping optional steps.' },
            { name: 'onStepChange', type: '(step, previousStep) => void', default: '—', description: 'Fires on step navigation.' },
            { name: 'onComplete', type: '() => void', default: '—', description: 'Fires when the last step completes.' },
            { name: 'renderStep / renderNavigation', type: '(…) => ReactNode', default: '—', description: 'Replace the default step / nav renderers.' },
          ]}
        />
      </section>
    </div>
  );
}
