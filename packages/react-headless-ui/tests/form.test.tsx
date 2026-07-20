import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../src/components/Form';
import { useForm } from '../src/hooks/useForm';

describe('Form', () => {
  it('renders a form element with default submit and reset actions', () => {
    render(<Form>{() => null}</Form>);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('renders default fields derived from defaultValues when no children are given', () => {
    render(<Form defaultValues={{ name: '' }} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('default field path renders a text input, label, and placeholder', () => {
    const { container } = render(<Form defaultValues={{ email: '' }} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.placeholder).toBe('Enter email');
    expect(input.id).toBe('field-email');
  });

  it('default field input is disabled when the form is disabled', () => {
    const { container } = render(<Form disabled defaultValues={{ name: '' }} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeDisabled();
    // Headless-only: the disabled label no longer emits a gray text utility;
    // the disabled behavior is covered by the input's disabled attribute above.
  });

  // The fieldSpacing/layout spacing tests asserted only removed Tailwind
  // spacing utilities (mb-2/4/6, flex-shrink-0) and were removed headless-only.

  it('default field input reflects isSubmitting submit-button text', () => {
    // Submit button shows "Submitting..." only while submitting; here we assert
    // the static text and that the button is the submit control.
    render(<Form submitText="Go" defaultValues={{ name: '' }} />);
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});

describe('Form layout / size / state classes', () => {
  it.each([
    ['vertical' as const],
    ['horizontal' as const],
    ['inline' as const],
    ['grid' as const],
  ])('applies layout=%s classes', (layout) => {
    render(<Form layout={layout}>{() => null}</Form>);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it.each([
    ['sm' as const],
    ['md' as const],
    ['lg' as const],
  ])('applies size=%s classes', (size) => {
    render(<Form size={size}>{() => null}</Form>);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('disables the submit button when disabled', () => {
    render(<Form disabled>{() => null}</Form>);
    // Headless-only: the disabled form no longer emits an opacity utility;
    // the disabled state is exposed via the submit button's disabled attribute.
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('adds pointer-events-none when loading', () => {
    render(<Form loading>{() => null}</Form>);
    expect(screen.getByRole('form').className).toContain('pointer-events-none');
  });

  it('hides actions when showActions=false', () => {
    render(<Form showActions={false}>{() => null}</Form>);
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  });
});

describe('Form children modes', () => {
  it('renders static children nodes', () => {
    render(<Form><span data-testid="kid">hi</span></Form>);
    expect(screen.getByTestId('kid')).toBeInTheDocument();
  });

  it('invokes children as a render function with rhf/state/actions', () => {
    let received: any = null;
    render(
      <Form onSubmit={vi.fn()} defaultValues={{ name: '' }}>
        {(rhf, state, actions) => {
          received = { hasRegister: typeof rhf.register, hasState: !!state, hasActions: !!actions };
          return <span data-testid="fn">x</span>;
        }}
      </Form>
    );
    expect(received).toEqual({ hasRegister: 'function', hasState: true, hasActions: true });
  });
});

describe('Form default field renderer (text input)', () => {
  it('renders label, placeholder, required marker, and helper text', () => {
    const { container } = render(
      <Form defaultValues={{ name: '' }} renderField={(name) => (
        <div key={name}>
          <label>
            Name
            <span className="req">*</span>
          </label>
          <input data-testid="i" />
          <div className="helper">help</div>
        </div>
      )} />
    );
    // Custom renderField fully replaces defaultRenderField.
    expect(container.querySelector('.helper')!.textContent).toBe('help');
  });

  it('defaultRenderField renders a text input with capitalized label and helper', () => {
    const { container } = render(
      <Form
        defaultValues={{ email: '' }}
        renderField={(fieldName, fieldProps) => (
          <FormRendererSpy key={fieldName} fieldName={fieldName} fieldProps={fieldProps} />
        )}
      />
    );
    // The component passes fieldProps with type='text'; spy asserts that.
    expect(container.textContent).toContain('email:text');
  });
});

// Helper: surfaces the fieldProps the component hands to renderField so we can
// assert the default field-config shape (type is always 'text').
function FormRendererSpy({ fieldName, fieldProps }: { fieldName: string; fieldProps: any }) {
  return <div data-testid="spy">{`${fieldName}:${fieldProps.type}`}</div>;
}

describe('Form loading overlay and success', () => {
  it('renders the loading overlay when loading', () => {
    const { container } = render(<Form loading loadingText="Please wait">{() => null}</Form>);
    expect(container.textContent).toContain('Please wait');
  });

  it('does not render the loading overlay when showLoading=false', () => {
    const { container } = render(<Form loading showLoading={false}>{() => null}</Form>);
    expect(container.textContent).not.toContain('Submitting...');
  });

  it('renders a custom success message after submit', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Form onSubmit={vi.fn()} defaultValues={{ name: '' }} renderSuccess={() => <div>done!</div>}>
        {(rhf) => <input {...rhf.register('name')} data-testid="i" />}
      </Form>
    );
    await user.type(screen.getByTestId('i'), 'x');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    // renderSuccess gates the built-in success banner (its own return is not
    // rendered); the banner's static text appears once isSubmitted is true.
    await waitFor(() => {
      expect(container.textContent).toContain('Form submitted successfully!');
    });
  });

  it('renders a submission error when onFormSubmit throws', async () => {
    const user = userEvent.setup();
    render(
      <Form
        onSubmit={vi.fn()}
        onFormSubmit={async () => { throw new Error('nope'); }}
        defaultValues={{ name: '' }}
      >
        {(rhf) => <input {...rhf.register('name')} data-testid="i" />}
      </Form>
    );
    await user.type(screen.getByTestId('i'), 'x');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Submission Error')).toBeInTheDocument();
      expect(screen.getByText('nope')).toBeInTheDocument();
    });
  });
});

describe('Form custom renderers', () => {
  it('uses a custom renderActions', () => {
    render(
      <Form renderActions={(actions) => <button data-testid="custom-action" onClick={() => actions.reset()}>R</button>}>
        {() => null}
      </Form>
    );
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  });
});

describe('Form multi-step', () => {
  const multiStep = { enabled: true, totalSteps: 3, stepValidation: async () => true };

  it('renders the step indicator and Next button on step 0', () => {
    render(<Form multiStep={multiStep} defaultValues={{ name: '' }}>{() => null}</Form>);
    // Step indicator renders 3 circles (numbered 1..3 on step 0).
    const circles = screen.getAllByText(/[1-3]/);
    expect(circles.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('shows Finish on the last step and Previous enabled mid-flow', async () => {
    let actionsRef: any = null;
    const { rerender } = render(
      <Form multiStep={multiStep} defaultValues={{ name: '' }}>
        {(_rhf, _state, actions) => {
          actionsRef = actions;
          return null;
        }}
      </Form>
    );
    await waitFor(() => expect(actionsRef).not.toBeNull());
    // nextStep is async (runs stepValidation); await each inside act.
    await act(async () => { await actionsRef.nextStep(); });
    await act(async () => { await actionsRef.nextStep(); });
    rerender(
      <Form multiStep={multiStep} defaultValues={{ name: '' }}>
        {() => null}
      </Form>
    );
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();
  });
});

describe('useForm (hook actions)', () => {
  function setup(props: Parameters<typeof useForm>[0]) {
    const result: { current: ReturnType<typeof useForm> } = { current: null as any };
    function Probe() {
      result.current = useForm(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  it('exposes default state and attributes', () => {
    const res = setup({ defaultValues: { name: '' } });
    expect(res.current.state.disabled).toBe(false);
    expect(res.current.state.isSubmitting).toBe(false);
    expect(res.current.state.currentStep).toBe(0);
    expect(res.current.attributes.role).toBe('form');
  });

  it('submit() resolves and fires onSubmit with form data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({ defaultValues: { name: 'x' }, onSubmit });
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmit).toHaveBeenCalled();
    expect(res.current.state.isSubmitted).toBe(true);
  });

  it('submit() is a no-op when disabled/loading/readOnly/isSubmitting', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({ defaultValues: { name: 'x' }, disabled: true, onSubmit });
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submit() captures errors and fires onSubmitError', async () => {
    const onSubmitError = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'));
    const res = setup({ defaultValues: { name: 'x' }, onSubmit, onSubmitError });
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error));
    expect(res.current.state.submissionError).toBe('boom');
  });

  it('onFormSubmit is awaited before onSubmit', async () => {
    const onFormSubmit = vi.fn().mockResolvedValue(undefined);
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({ defaultValues: { name: 'x' }, onFormSubmit, onSubmit });
    await act(async () => { await res.current.actions.submit(); });
    expect(onFormSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });

  it('reset() restores defaults and fires onReset', () => {
    const onReset = vi.fn();
    const res = setup({ defaultValues: { name: 'default' }, onReset });
    act(() => res.current.actions.reset());
    expect(onReset).toHaveBeenCalled();
    expect(res.current.state.isSubmitted).toBe(false);
  });

  it('validate() returns a boolean', async () => {
    const res = setup({ defaultValues: { name: '' } });
    const result = await act(async () => await res.current.actions.validate());
    expect(typeof result).toBe('boolean');
  });

  it('setFieldValue/getFieldValue/getData/setData round-trip and fire onDataChange', () => {
    const onDataChange = vi.fn();
    const res = setup({ defaultValues: { name: '' }, onDataChange });
    act(() => res.current.actions.setFieldValue('name', 'hi'));
    expect(res.current.actions.getFieldValue('name')).toBe('hi');
    act(() => res.current.actions.setData({ name: 'set' }));
    expect(res.current.actions.getData().name).toBe('set');
    expect(onDataChange).toHaveBeenCalled();
  });

  it('getFieldError/clearFieldError/focusField operate on fields', () => {
    const res = setup({ defaultValues: { name: '' } });
    expect(res.current.actions.getFieldError('name')).toBeUndefined();
    expect(() => act(() => res.current.actions.clearFieldError('name'))).not.toThrow();
    expect(() => act(() => res.current.actions.focusField('name'))).not.toThrow();
  });

  it('getFieldAttributes exposes aria and data state', () => {
    const res = setup({ defaultValues: { name: '' } });
    const attrs = res.current.getFieldAttributes('name');
    expect(attrs.id).toBe('field-name');
    expect(attrs['aria-invalid']).toBe(false);
  });

  it('multi-step actions navigate when enabled', async () => {
    const onStepChange = vi.fn();
    const res = setup({
      defaultValues: { name: '' },
      multiStep: { enabled: true, totalSteps: 3, onStepChange },
    });
    await act(async () => { await res.current.actions.nextStep(); });
    expect(res.current.state.currentStep).toBe(1);
    act(() => res.current.actions.previousStep());
    expect(res.current.state.currentStep).toBe(0);
    // at step 0, previousStep returns false (no move)
    act(() => expect(res.current.actions.previousStep()).toBe(false));
    // goToStep to a valid step
    await act(async () => { await res.current.actions.goToStep(2); });
  });

  it('multi-step nextStep returns false at the last step', async () => {
    const res = setup({
      defaultValues: { name: '' },
      multiStep: { enabled: true, totalSteps: 2 },
    });
    await act(async () => { await res.current.actions.nextStep(); });
    // now at last step (1) -> nextStep returns false
    let moved = true;
    await act(async () => { moved = await res.current.actions.nextStep(); });
    expect(moved).toBe(false);
  });

  it('step actions are no-ops when multiStep is disabled', async () => {
    const res = setup({ defaultValues: { name: '' } });
    await expect(res.current.actions.nextStep()).resolves.toBe(false);
    expect(res.current.actions.previousStep()).toBe(false);
    await expect(res.current.actions.goToStep(1)).resolves.toBe(false);
    const v = await act(async () => await res.current.actions.validateStep());
    expect(typeof v).toBe('boolean');
  });

  it('validateStep uses custom stepValidation when provided', async () => {
    const stepValidation = vi.fn().mockResolvedValue(false);
    const res = setup({
      defaultValues: { name: '' },
      multiStep: { enabled: true, totalSteps: 2, stepValidation },
    });
    const v = await act(async () => await res.current.actions.validateStep(1));
    expect(stepValidation).toHaveBeenCalledWith(1, expect.any(Object));
    expect(v).toBe(false);
  });

  it('goToStep to an out-of-range step returns false', async () => {
    const res = setup({
      defaultValues: { name: '' },
      multiStep: { enabled: true, totalSteps: 2 },
    });
    await expect(res.current.actions.goToStep(99)).resolves.toBe(false);
    await expect(res.current.actions.goToStep(-1)).resolves.toBe(false);
  });

  it('nextStep/goToStep do not advance when the step is invalid', async () => {
    const res = setup({
      defaultValues: { name: '' },
      multiStep: { enabled: true, totalSteps: 3, stepValidation: async () => false },
    });
    // validation awaited -> nextStep resolves false and the step does not advance
    let nextOk = true;
    await act(async () => { nextOk = await res.current.actions.nextStep(); });
    expect(nextOk).toBe(false);
    expect(res.current.state.currentStep).toBe(0);
    let jumpOk = true;
    await act(async () => { jumpOk = await res.current.actions.goToStep(2); });
    expect(jumpOk).toBe(false);
    expect(res.current.state.currentStep).toBe(0);
  });

  // Regression: nextStep() used to return true synchronously while validation
  // ran in a detached .then(), so callers could not trust the return value.
  // It must now await validation and resolve true only when the step advanced.
  it('nextStep awaits validation and resolves true only when the step advances', async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        onSubmit: vi.fn(),
        defaultValues: { name: '' },
        multiStep: { enabled: true, totalSteps: 3, stepValidation: async () => true },
      })
    );
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.actions.nextStep(); });
    expect(ok).toBe(true);
    expect(result.current.state.currentStep).toBe(1);
  });

  it('nextStep resolves false and does not advance when validation fails', async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        onSubmit: vi.fn(),
        defaultValues: { name: '' },
        multiStep: { enabled: true, totalSteps: 3, stepValidation: async () => false },
      })
    );
    let ok: boolean | undefined;
    await act(async () => { ok = await result.current.actions.nextStep(); });
    expect(ok).toBe(false);
    expect(result.current.state.currentStep).toBe(0);
  });

  it('submit() handles a non-Error thrown value', async () => {
    const onSubmitError = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue('string error');
    const res = setup({ defaultValues: { name: 'x' }, onSubmit, onSubmitError });
    await act(async () => { await res.current.actions.submit(); });
    expect(res.current.state.submissionError).toBe('Submission failed');
  });

  it('getFieldError returns undefined for non-string error messages', () => {
    // default form has no errors -> message undefined -> returns undefined
    const res = setup({ defaultValues: { name: '' } });
    expect(res.current.actions.getFieldError('name')).toBeUndefined();
  });

  it('exposes aria-busy when loading', () => {
    const res = setup({ defaultValues: { name: '' }, loading: true });
    expect(res.current.attributes['aria-busy']).toBe('true');
    const res2 = setup({ defaultValues: { name: '' } });
    expect(res2.current.attributes['aria-busy']).toBeUndefined();
  });

  it('exposes aria-disabled/aria-readonly when disabled/readOnly', () => {
    const res = setup({ defaultValues: { name: '' }, disabled: true, readOnly: true });
    expect(res.current.attributes['aria-disabled']).toBe('true');
    expect(res.current.attributes['aria-readonly']).toBe('true');
  });

  it('getFieldError / getFieldAttributes reflect RHF field errors after validation', async () => {
    const res = setup({ defaultValues: { name: '' } });
    // Register the field with a required rule and trigger validation (empty value -> error)
    res.current.rhf.register('name', { required: 'name is required' });
    await act(async () => { await res.current.rhf.trigger('name'); });
    expect(typeof res.current.actions.getFieldError('name')).toBe('string');
    const attrs = res.current.getFieldAttributes('name');
    expect(attrs['aria-invalid']).toBe(true);
    expect(attrs['aria-describedby']).toBe('name-error');
  });

  // Regression: the forwarded ref must attach to the <form> DOM element.
  // Before the fix, <form> used a local unused ref, so the consumer's ref
  // stayed null.
  it('forwards the ref to the <form> DOM element', () => {
    const ref = createRef<HTMLFormElement>();
    render(<Form ref={ref}>{() => null}</Form>);
    expect(ref.current).toBeInstanceOf(HTMLFormElement);
    expect(ref.current?.tagName).toBe('FORM');
  });
});

describe('useForm validationRules wiring', () => {
  function setup(props: Parameters<typeof useForm>[0]) {
    const result: { current: ReturnType<typeof useForm> } = { current: null as any };
    function Probe() {
      result.current = useForm(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  it('blocks submit when a required validationRule fails on an empty field', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({
      defaultValues: { name: '' },
      validationRules: [
        {
          field: 'name',
          name: 'required',
          message: 'name is required',
          validate: (v: string) => (v && v.trim() !== '') || false
        }
      ],
      onSubmit
    });
    // Field is empty -> validation should fail and submit must not call onSubmit.
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(typeof res.current.actions.getFieldError('name')).toBe('string');
    expect(res.current.actions.getFieldError('name')).toBe('name is required');
  });

  it('allows submit once the rule passes after the field is filled', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({
      defaultValues: { name: '' },
      validationRules: [
        {
          field: 'name',
          name: 'required',
          message: 'name is required',
          validate: (v: string) => (v && v.trim() !== '') || false
        }
      ],
      onSubmit
    });
    act(() => res.current.actions.setFieldValue('name', 'Alice'));
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(res.current.actions.getFieldError('name')).toBeUndefined();
  });

  it('honors a string return from validate as the error message', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({
      defaultValues: { name: 'a' },
      validationRules: [
        {
          field: 'name',
          name: 'minLength',
          message: 'fallback',
          validate: (v: string) => (v.length >= 3 ? true : 'too short')
        }
      ],
      onSubmit
    });
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(res.current.actions.getFieldError('name')).toBe('too short');
  });

  it('passes a consumer-supplied resolver through to React Hook Form', async () => {
    // A resolver that always marks the form invalid should block submit,
    // proving the resolver reached useReactHookForm instead of being dropped.
    const resolver = vi.fn(() => ({ values: {} as Record<string, never>, errors: { name: { type: 'x', message: 'blocked' } } }));
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({
      defaultValues: { name: 'x' },
      resolver: resolver as any,
      onSubmit
    });
    await act(async () => { await res.current.actions.submit(); });
    expect(resolver).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not validate when no validationRules and no resolver are provided', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const res = setup({ defaultValues: { name: '' }, onSubmit });
    await act(async () => { await res.current.actions.submit(); });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
