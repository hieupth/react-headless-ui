'use client';

import { PasswordMeter } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// PasswordMeter is headless: usePasswordMeter performs zxcvbn-style analysis
// (score, entropy, crack-time, criteria, suggestions, warnings) and the bar
// fill uses inline backgroundColor/width, so the colored bar renders visibly.
// Theme the .strength-bar track and the embedded <input> with Tailwind via
// descendant selectors.
const meterBase =
  '[&_.strength-bar]:h-2 [&_.strength-bar]:w-full [&_.strength-bar]:rounded-full [&_.strength-bar]:bg-gray-200 ' +
  '[&_.strength-bar-fill]:rounded-full [&_.strength-bar-fill]:transition-all ' +
  '[&_.strength-score]:text-xs [&_.strength-score]:font-medium ' +
  '[&_.strength-text]:text-xs [&_.strength-text]:font-medium ' +
  '[&_input]:mt-1 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-gray-300 ' +
  '[&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:text-gray-900 ' +
  '[&_input]:shadow-sm [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500 ' +
  '[&_li]:text-xs [&_li]:text-gray-600 [&_.criteria-met]:text-green-600';

export default function PasswordMeterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">PasswordMeter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A real-time password-strength meter backed by the headless{' '}
          <code className="font-mono text-sm">usePasswordMeter</code> hook. It
          scores entropy, estimates crack time, evaluates criteria (length,
          case, digits, symbols), and surfaces suggestions/warnings. The bar fill
          uses inline color + width, so it renders visibly; theme the track and
          embedded input with Tailwind. Type below to see it react.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bar variant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The default meter: an input plus a colored strength bar, score, label,
          and criteria list. Type to analyze.
        </p>
        <Demo code={`<PasswordMeter variant="bar" showScore showCriteria />`}>
          <div className="w-full max-w-sm">
            <PasswordMeter className={meterBase} variant="bar" showScore showCriteria />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Circle variant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A circular SVG progress gauge. The center text shows the score
          percentage.
        </p>
        <Demo code={`<PasswordMeter variant="circle" showScore />`}>
          <div className="w-full max-w-sm">
            <PasswordMeter className={meterBase} variant="circle" showScore />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">With visibility toggle</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>showVisibilityToggle</code> adds a show/hide button on the input;
          <code> showSuggestions</code> / <code>showWarnings</code> surface
          zxcvbn-style hints.
        </p>
        <Demo
          code={`<PasswordMeter
  variant="bar"
  showVisibilityToggle
  showSuggestions
  showWarnings
/>`}
        >
          <div className="w-full max-w-sm">
            <PasswordMeter
              className={meterBase}
              variant="bar"
              showVisibilityToggle
              showSuggestions
              showWarnings
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'bar' | 'circle' | 'dots' | 'text'",
              default: "'bar'",
              description: 'Visual display mode for the meter.',
            },
            {
              name: 'minLength / maxLength',
              type: 'number',
              default: '—',
              description: 'Length bounds used in criteria evaluation.',
            },
            {
              name: 'minStrength',
              type: 'PasswordStrength',
              default: '—',
              description: 'Minimum acceptable strength ("good", "strong", …).',
            },
            {
              name: 'showScore / showStrengthText',
              type: 'boolean',
              default: 'true / true',
              description: 'Show numeric score and strength label.',
            },
            {
              name: 'showCriteria / showSuggestions / showWarnings',
              type: 'boolean',
              default: 'true / true / true',
              description: 'Toggle the criteria list, suggestions, and warnings.',
            },
            {
              name: 'showVisibilityToggle',
              type: 'boolean',
              default: 'false',
              description: 'Add a show/hide button to the embedded input.',
            },
            {
              name: 'checkCommonPasswords',
              type: 'boolean',
              default: '—',
              description: 'Reject passwords from a common-passwords list.',
            },
            {
              name: 'calculateEntropy / estimateCrackTime',
              type: 'boolean',
              default: '—',
              description: 'Compute entropy bits / estimated crack time.',
            },
            {
              name: 'onPasswordChange',
              type: '(password, analysis) => void',
              default: '—',
              description: 'Called with the password + analysis on each change.',
            },
          ]}
        />
      </section>
    </div>
  );
}
