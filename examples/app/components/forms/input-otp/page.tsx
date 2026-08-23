'use client';

import { useState } from 'react';
import { InputOTP } from '@hieupth/react-headless-ui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// InputOTP is headless: useInputOTP manages per-slot character entry,
// auto-advance, backspace handling, masking, completion detection, and ARIA.
// Each slot is a maxLength=1 <input> with class .otp-slot. Theme those inputs
// (and the .input-otp container) with Tailwind via descendant selectors.
const otpBase =
  'flex items-center gap-2 ' +
  '[&_.otp-slot]:h-12 [&_.otp-slot]:w-10 [&_.otp-slot]:rounded-md ' +
  '[&_.otp-slot]:border [&_.otp-slot]:border-gray-300 dark:[&_.otp-slot]:border-gray-600 [&_.otp-slot]:bg-white dark:[&_.otp-slot]:bg-gray-900 ' +
  '[&_.otp-slot]:text-center [&_.otp-slot]:text-xl [&_.otp-slot]:font-semibold ' +
  '[&_.otp-slot]:text-gray-900 dark:[&_.otp-slot]:text-gray-100 [&_.otp-slot]:transition-colors ' +
  '[&_.otp-slot]:focus:outline-none [&_.otp-slot]:focus:ring-2 [&_.otp-slot]:focus:ring-indigo-500 [&_.otp-slot]:focus:border-indigo-500 ' +
  '[&_.otp-slot]:disabled:opacity-50';

export default function InputOTPPage() {
  const [code, setCode] = useState('');

  return (
    <div className="docs-page">
      <header className="docs-header">
        <h1 className="docs-h1">InputOTP</h1>
        <p className="docs-lead">
          A one-time-password input backed by the headless{' '}
          <code className="docs-code">useInputOTP</code> hook. It manages
          per-slot character entry, auto-advance, backspace navigation, optional
          masking, completion detection, and attempt counting — each slot is a{' '}
          <code className="docs-code">maxLength=1</code> input with full
          ARIA. Ships no styles; theme the{' '}
          <code className="docs-code">.otp-slot</code> inputs with
          Tailwind.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-h2">Basic</h2>
        <p className="docs-desc">
          A 6-digit OTP. Typing auto-advances; Backspace on an empty slot jumps
          back.
        </p>
        <Demo code={`<InputOTP length={6} className="flex items-center gap-2 [&_.otp-slot]:h-12 [&_.otp-slot]:w-10 [&_.otp-slot]:rounded-md [&_.otp-slot]:border [&_.otp-slot]:border-gray-300 dark:[&_.otp-slot]:border-gray-600 [&_.otp-slot]:bg-white dark:[&_.otp-slot]:bg-gray-900 [&_.otp-slot]:text-center [&_.otp-slot]:text-xl [&_.otp-slot]:font-semibold [&_.otp-slot]:text-gray-900 dark:[&_.otp-slot]:text-gray-100 [&_.otp-slot]:transition-colors [&_.otp-slot]:focus:outline-none [&_.otp-slot]:focus:ring-2 [&_.otp-slot]:focus:ring-indigo-500 [&_.otp-slot]:focus:border-indigo-500 [&_.otp-slot]:disabled:opacity-50" />`}>
          <InputOTP className={otpBase} length={6} />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Masked &amp; tracked</h2>
        <p className="docs-desc">
          <code>inputType="password"</code> masks filled slots;{' '}
          <code>onValueChange(value, slots)</code> mirrors the live value, and{' '}
          <code>onComplete</code> fires when every slot is filled.
        </p>
        <Demo
          code={`const [code, setCode] = useState('');
<InputOTP
  length={4}
  inputType="password"
  onValueChange={(v) => setCode(v)}
  className="flex items-center gap-2 [&_.otp-slot]:h-12 [&_.otp-slot]:w-10 [&_.otp-slot]:rounded-md [&_.otp-slot]:border [&_.otp-slot]:border-gray-300 dark:[&_.otp-slot]:border-gray-600 [&_.otp-slot]:bg-white dark:[&_.otp-slot]:bg-gray-900 [&_.otp-slot]:text-center [&_.otp-slot]:text-xl [&_.otp-slot]:font-semibold [&_.otp-slot]:text-gray-900 dark:[&_.otp-slot]:text-gray-100 [&_.otp-slot]:transition-colors [&_.otp-slot]:focus:outline-none [&_.otp-slot]:focus:ring-2 [&_.otp-slot]:focus:ring-indigo-500 [&_.otp-slot]:focus:border-indigo-500 [&_.otp-slot]:disabled:opacity-50"
/>`}
        >
          <div className="flex flex-col items-center gap-2">
            <InputOTP
              className={otpBase}
              length={4}
              inputType="password"
              onValueChange={(v) => setCode(v)}
            />
            <p className="text-xs text-gray-500">Value: {code || '—'}</p>
          </div>
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Custom slot renderer</h2>
        <p className="docs-desc">
          The <code>renderSlot</code> escape hatch lets you draw each slot from
          full state (value, filled, focused, hasError).
        </p>
        <Demo
          code={`<InputOTP
  length={4}
  renderSlot={(slot, i) => (
    <input
      key={i}
      type="text"
      value={slot.value}
      maxLength={1}
      inputMode="numeric"
      aria-label={\`Digit \${i + 1}\`}
      className={\`h-12 w-10 rounded-md border text-center text-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100 \` +
        \`\${slot.focused ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'} \` +
        \`\${slot.hasError ? 'border-red-500' : ''}\`}
    />
  )}
/>`}
        >
          <InputOTP
            length={4}
            renderSlot={(slot, i) => (
              <input
                key={i}
                type="text"
                value={slot.value}
                maxLength={1}
                inputMode="numeric"
                aria-label={`Digit ${i + 1}`}
                className={`h-12 w-10 rounded-md border text-center text-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100 ` +
                  `${slot.focused ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'} ` +
                  `${slot.hasError ? 'border-red-500' : ''}`}
              />
            )}
          />
        </Demo>
      </section>

      <section className="docs-section">
        <h2 className="docs-h2">Props</h2>
        <PropsTable
          props={[
            {
              name: 'length',
              type: 'number',
              default: '6',
              description: 'Number of OTP slots to render.',
            },
            {
              name: 'defaultValue',
              type: 'string',
              default: "''",
              description: 'Initial OTP value (uncontrolled).',
            },
            {
              name: 'onValueChange',
              type: '(value: string, slots: OTPSlot[]) => void',
              default: '—',
              description: 'Called with the full OTP string + slot states.',
            },
            {
              name: 'onComplete',
              type: '(value: string) => void',
              default: '—',
              description: 'Fires once every slot is filled.',
            },
            {
              name: 'inputType',
              type: "'text' | 'password' | 'number'",
              default: "'text'",
              description: 'Slot input type. "password" masks filled slots.',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disables all slots; reflected to ARIA.',
            },
            {
              name: 'showErrors / showAttempts / showClear / showCompleteIndicator',
              type: 'boolean',
              default: 'true / true / true / true',
              description: 'Toggle the built-in status affordances.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size variant hook.',
            },
            {
              name: 'renderSlot',
              type: '(slot, index) => ReactNode',
              default: '—',
              description: 'Custom renderer per slot with full state.',
            },
          ]}
        />
      </section>
    </div>
  );
}
