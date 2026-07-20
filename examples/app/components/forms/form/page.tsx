'use client';

import { useState } from 'react';
import { Form, type UseFormReturns } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Form wraps React Hook Form via the headless useForm hook. Its default render
// ships empty classes, so the cleanest styling path is the `children` render
// prop, which receives (rhf, state, actions) — register inputs and draw your
// own fields with Tailwind.
const inputCls =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700';
const errCls = 'mt-1 text-xs text-red-600';

function SignInForm() {
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);
  return (
    <Form
      defaultValues={{ email: '', password: '' }}
      onSubmit={(data) => setSubmitted(data as Record<string, string>)}
    >
      {(rhf: UseFormReturns['rhf']) => {
        const { register, formState: { errors } } = rhf;
        return (
          <div className="w-full max-w-sm space-y-3">
            <div>
              <label className={labelCls} htmlFor="email">Email</label>
              <input
                id="email"
                className={`${inputCls} ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className={errCls}>{errors.email.message as string}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`${inputCls} ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              {errors.password && <p className={errCls}>{errors.password.message as string}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Sign in
            </button>
            {submitted && (
              <p className="text-xs text-green-600">Submitted: {JSON.stringify(submitted)}</p>
            )}
          </div>
        );
      }}
    </Form>
  );
}

export default function FormPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Form</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A form component built on{' '}
          <a className="font-mono text-sm underline" href="https://react-hook-form.com" target="_blank" rel="noreferrer">React Hook Form</a>{' '}
          via the headless <code className="font-mono text-sm">useForm</code> hook.
          It manages registration, validation, submit/reset, loading state, and
          multi-step flows. The default render ships empty classes, so use the{' '}
          <code className="font-mono text-sm">children</code> render prop —{' '}
          <code className="font-mono text-sm">(rhf, state, actions) =&gt; …</code>{' '}
          — to register inputs and theme them with Tailwind.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sign-in form</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Validation runs on submit; errors appear inline. Submit a valid form
          to see the serialized data.
        </p>
        <Demo
          code={`<Form defaultValues={{ email: '', password: '' }} onSubmit={onSubmit}>
  {(rhf) => {
    const { register, formState: { errors } } = rhf;
    return (
      <>
        <input {...register('email', { required: true })} />
        <input type="password" {...register('password', { minLength: 6 })} />
        <button type="submit">Sign in</button>
      </>
    );
  }}
</Form>`}
        >
          <SignInForm />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled submit &amp; reset</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The actions from the render prop (<code>submit</code>,{' '}
          <code>reset</code>) plus <code>isSubmitting</code> drive async submits
          and a loading state.
        </p>
        <Demo
          code={`<Form onSubmit={async (data) => { await api.signIn(data); }}>
  {(_, state, actions) => (
    <>
      <input {...rhf.register('username')} />
      <button disabled={state.isSubmitting}>
        {state.isSubmitting ? '…' : 'Submit'}
      </button>
    </>
  )}
</Form>`}
        >
          <p className="text-sm text-gray-500">
            The live form above already demonstrates this pattern (submit + the
            serialized result). Swap <code>onSubmit</code> for an async function
            to engage the <code>isSubmitting</code> loading state.
          </p>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'defaultValues',
              type: 'Record<string, any>',
              default: '{}',
              description: 'Initial field values passed to React Hook Form.',
            },
            {
              name: 'onSubmit',
              type: '(data) => void | Promise<void>',
              default: '—',
              description: 'Required submit handler receiving validated data.',
            },
            {
              name: 'mode',
              type: "'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'",
              default: "'onSubmit'",
              description: 'When validation runs.',
            },
            {
              name: 'validationRules',
              type: 'FormValidationRule[]',
              default: '[]',
              description: 'Declarative per-field validation rules.',
            },
            {
              name: 'resolver',
              type: 'Resolver (zod / yup / …)',
              default: '—',
              description: 'Schema resolver passed straight to RHF.',
            },
            {
              name: 'multiStep',
              type: 'MultiStepFormConfig',
              default: '—',
              description: 'Multi-step config; enables next/previous/goToStep.',
            },
            {
              name: 'disabled / loading / readOnly',
              type: 'boolean',
              default: 'false',
              description: 'Whole-form states reflected to fields.',
            },
            {
              name: 'layout / size',
              type: "'vertical' | 'horizontal' | 'inline' | 'grid' / 'sm' | 'md' | 'lg'",
              default: "'vertical' / 'md'",
              description: 'Layout and size hooks for the default render.',
            },
            {
              name: 'children',
              type: 'ReactNode | ((rhf, state, actions) => ReactNode)',
              default: '—',
              description: 'Static content or a render prop with the full RHF API.',
            },
          ]}
        />
      </section>
    </div>
  );
}
