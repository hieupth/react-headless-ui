import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from '../src/hooks/useForm';
import { Form } from '../src/components/Form';

// When true, the react-hook-form mock makes `trigger` reject so the hook's
// validate() catch branch is exercised. Toggled per-test below.
let triggerShouldThrow = false;
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<any>('react-hook-form');
  return {
    ...actual,
    useForm: (...args: any[]) => {
      const rhf = actual.useForm(...args);
      return {
        ...rhf,
        trigger: async (...t: any[]) => {
          if (triggerShouldThrow) throw new Error('validation crashed');
          return rhf.trigger(...t);
        },
      };
    },
  };
});

type Values = { name: string; email: string };

describe('useForm hook - state', () => {
  it('exposes default state', () => {
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
      })
    );
    expect(result.current.state.disabled).toBe(false);
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.readOnly).toBe(false);
    expect(result.current.state.isSubmitting).toBe(false);
    expect(result.current.state.isSubmitted).toBe(false);
    expect(result.current.state.submissionError).toBeNull();
    expect(result.current.state.currentStep).toBe(0);
    expect(result.current.state.totalSteps).toBe(1);
    expect(result.current.attributes.role).toBe('form');
  });

  it('setLoading/setDisabled/setReadOnly mutate flags', () => {
    const { result } = renderHook(() =>
      useForm<Values>({ onSubmit: vi.fn(), defaultValues: { name: '', email: '' } })
    );
    act(() => result.current.actions.setLoading(true));
    expect(result.current.state.loading).toBe(true);
    act(() => result.current.actions.setDisabled(true));
    expect(result.current.state.disabled).toBe(true);
    act(() => result.current.actions.setReadOnly(true));
    expect(result.current.state.readOnly).toBe(true);
  });
});

describe('useForm hook - field accessors', () => {
  it('getFieldValue / setFieldValue / getData / setData', () => {
    const onData = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: 'a', email: 'b@x.com' },
        onDataChange: onData,
      })
    );
    expect(result.current.actions.getFieldValue<string>('name')).toBe('a');
    act(() => result.current.actions.setFieldValue('name', 'z'));
    expect(result.current.actions.getFieldValue<string>('name')).toBe('z');
    expect(result.current.actions.getData().name).toBe('z');
    act(() => result.current.actions.setData({ name: 'set', email: 'e@x.com' }));
    expect(result.current.actions.getData()).toEqual({ name: 'set', email: 'e@x.com' });
    expect(onData).toHaveBeenCalled();
  });

  it('focusField and clearFieldError do not throw', () => {
    const { result } = renderHook(() =>
      useForm<Values>({ onSubmit: vi.fn(), defaultValues: { name: '', email: '' } })
    );
    expect(() =>
      act(() => {
        result.current.actions.focusField('name');
        result.current.actions.clearFieldError('name');
      })
    ).not.toThrow();
  });

  it('validate triggers RHF validation and returns boolean', async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        onSubmit: vi.fn(),
        defaultValues: { name: '' },
      })
    );
    let valid: boolean | undefined;
    await act(async () => {
      valid = await result.current.actions.validate();
    });
    expect(typeof valid).toBe('boolean');
  });
});

describe('useForm hook - submit', () => {
  it('submit calls onSubmit with values on success', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({ onSubmit, defaultValues: { name: 'ok', email: 'ok@x.com' } })
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(onSubmit).toHaveBeenCalledWith({ name: 'ok', email: 'ok@x.com' });
    expect(result.current.state.isSubmitted).toBe(true);
    expect(result.current.state.lastSubmittedAt).not.toBeNull();
  });

  it('submit is guarded by disabled/loading/readOnly/isSubmitting', async () => {
    const onSubmit = vi.fn();
    const disabled = renderHook(() =>
      useForm<Values>({ onSubmit, disabled: true, defaultValues: { name: '', email: '' } })
    );
    await act(async () => {
      await disabled.result.current.actions.submit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    const loading = renderHook(() =>
      useForm<Values>({ onSubmit, loading: true, defaultValues: { name: '', email: '' } })
    );
    await act(async () => {
      await loading.result.current.actions.submit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    const ro = renderHook(() =>
      useForm<Values>({ onSubmit, readOnly: true, defaultValues: { name: '', email: '' } })
    );
    await act(async () => {
      await ro.result.current.actions.submit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submit captures submission error when onFormSubmit throws', async () => {
    const onSubmit = vi.fn();
    const onFormSubmit = vi.fn().mockRejectedValue(new Error('boom'));
    const onSubmitError = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit,
        onFormSubmit,
        onSubmitError,
        defaultValues: { name: 'x', email: 'y@x.com' },
      })
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.submissionError).toBe('boom');
    expect(onSubmitError).toHaveBeenCalled();
  });

  it('reset clears submission state and resets values', () => {
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: 'orig', email: '' },
        onReset,
      })
    );
    act(() => result.current.actions.setFieldValue('name', 'changed'));
    act(() => result.current.actions.reset());
    expect(result.current.state.isSubmitted).toBe(false);
    expect(result.current.state.lastSubmittedAt).toBeNull();
    expect(result.current.state.submissionError).toBeNull();
    expect(onReset).toHaveBeenCalled();
  });
});

describe('useForm hook - multi-step', () => {
  const multiStep = {
    enabled: true,
    totalSteps: 3,
    stepValidation: async () => true,
  };

  it('nextStep advances when validation passes; previousStep decrements; goToStep jumps', async () => {
    const onStep = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { ...multiStep, onStepChange: vi.fn() },
        onStepChange: onStep,
      })
    );
    expect(result.current.state.totalSteps).toBe(3);
    let advanced: boolean | undefined;
    await act(async () => {
      advanced = await result.current.actions.nextStep();
    });
    expect(advanced).toBe(true);
    expect(result.current.state.currentStep).toBe(1);
    let jumped: boolean | undefined;
    await act(async () => {
      jumped = await result.current.actions.goToStep(2);
    });
    expect(jumped).toBe(true);
    let wentPrev: boolean | undefined;
    act(() => {
      wentPrev = result.current.actions.previousStep();
    });
    expect(wentPrev).toBe(true);
  });

  it('nextStep returns false when not multi-step or at last step', async () => {
    const single = renderHook(() =>
      useForm<Values>({ onSubmit: vi.fn(), defaultValues: { name: '', email: '' } })
    );
    await expect(single.result.current.actions.nextStep()).resolves.toBe(false);
    expect(single.result.current.actions.previousStep()).toBe(false);
    await expect(single.result.current.actions.goToStep(0)).resolves.toBe(false);
  });

  it('validateStep falls back to validate when not multi-step', async () => {
    const { result } = renderHook(() =>
      useForm<Values>({ onSubmit: vi.fn(), defaultValues: { name: '', email: '' } })
    );
    let r: boolean | undefined;
    await act(async () => {
      r = await result.current.actions.validateStep();
    });
    expect(typeof r).toBe('boolean');
  });

  it('multi-step: validateStep without a stepValidation fn validates via validate', async () => {
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { enabled: true, totalSteps: 2 },
      })
    );
    let r: boolean | undefined;
    await act(async () => {
      r = await result.current.actions.validateStep();
    });
    expect(typeof r).toBe('boolean');
  });

  it('multi-step: nextStep returns false at the last step', async () => {
    const onStep = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { enabled: true, totalSteps: 2, stepValidation: async () => true, onStepChange: vi.fn() },
        onStepChange: onStep,
      })
    );
    // advance to the last step (step index 1 of 2)
    await act(async () => { await result.current.actions.nextStep(); });
    await waitFor(() => expect(result.current.state.currentStep).toBe(1));
    let atLast: boolean | undefined;
    await act(async () => { atLast = await result.current.actions.nextStep(); });
    expect(atLast).toBe(false);
  });

  it('multi-step: previousStep returns false at the first step', () => {
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { enabled: true, totalSteps: 2 },
      })
    );
    expect(result.current.actions.previousStep()).toBe(false);
  });

  it('multi-step: goToStep returns false for an out-of-range step', async () => {
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { enabled: true, totalSteps: 2 },
      })
    );
    await expect(result.current.actions.goToStep(5)).resolves.toBe(false);
    await expect(result.current.actions.goToStep(-1)).resolves.toBe(false);
  });

  it('multi-step: nextStep does not advance when step validation fails', async () => {
    const onStep = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { enabled: true, totalSteps: 3, stepValidation: async () => false },
        onStepChange: onStep,
      })
    );
    let result_bool: boolean | undefined;
    await act(async () => { result_bool = await result.current.actions.nextStep(); });
    // validation failed -> nextStep resolves false and the step must not advance.
    expect(result_bool).toBe(false);
    expect(onStep).not.toHaveBeenCalled();
    expect(result.current.state.currentStep).toBe(0);
  });

  it('multi-step: goToStep does not jump when current-step validation fails', async () => {
    const onStep = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({
        onSubmit: vi.fn(),
        defaultValues: { name: '', email: '' },
        multiStep: { enabled: true, totalSteps: 3, stepValidation: async () => false },
        onStepChange: onStep,
      })
    );
    let result_bool: boolean | undefined;
    await act(async () => { result_bool = await result.current.actions.goToStep(1); });
    expect(result_bool).toBe(false);
    expect(onStep).not.toHaveBeenCalled();
    expect(result.current.state.currentStep).toBe(0);
  });

  it('getFieldError returns the string message for an errored field and undefined otherwise', async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        onSubmit: vi.fn(),
        defaultValues: { name: '' },
      })
    );
    // Force a string error onto a field via the RHF setError API to exercise the message path.
    act(() => {
      result.current.rhf.setError('name' as any, { type: 'manual', message: 'Required' });
    });
    expect(result.current.actions.getFieldError('name')).toBe('Required');
    expect(result.current.actions.getFieldError('missing')).toBeUndefined();
  });

  it('validate returns false when the underlying trigger rejects (catch branch)', async () => {
    triggerShouldThrow = true;
    try {
      const { result } = renderHook(() =>
        useForm<{ name: string }>({ onSubmit: vi.fn(), defaultValues: { name: '' } })
      );
      let r: boolean | undefined;
      await act(async () => {
        r = await result.current.actions.validate();
      });
      expect(r).toBe(false);
    } finally {
      triggerShouldThrow = false;
    }
  });

  it('submit records a generic message when onFormSubmit rejects with a non-Error value', async () => {
    const onFormSubmit = vi.fn().mockRejectedValue('string failure');
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        onSubmit: vi.fn(),
        onFormSubmit,
        defaultValues: { name: 'x' },
      })
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.submissionError).toBe('Submission failed');
  });

  it('getFieldAttributes reports aria-invalid/describedby for errored and clean fields', () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({ onSubmit: vi.fn(), defaultValues: { name: '' } })
    );
    // clean field: no describedby, not invalid
    const clean = result.current.getFieldAttributes('name');
    expect(clean['aria-invalid']).toBe(false);
    expect(clean['aria-describedby']).toBeUndefined();
    // errored field: describedby set, invalid true
    act(() => {
      result.current.rhf.setError('name' as any, { type: 'manual', message: 'bad' });
    });
    const errored = result.current.getFieldAttributes('name');
    expect(errored['aria-invalid']).toBe(true);
    expect(errored['aria-describedby']).toBe('name-error');
  });
});

describe('Form component integration', () => {
  it('renders default submit/reset actions', () => {
    render(<Form onSubmit={vi.fn()}>{() => null}</Form>);
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('submits with entered values on click', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Form<Values> onSubmit={onSubmit} defaultValues={{ name: '', email: '' }}>
        {(rhf) => (
          <>
            <label htmlFor="f-name">Name</label>
            <input id="f-name" {...rhf.register('name')} data-testid="i-name" />
            <label htmlFor="f-email">Email</label>
            <input id="f-email" {...rhf.register('email')} data-testid="i-email" />
          </>
        )}
      </Form>
    );
    await user.type(screen.getByTestId('i-name'), 'Alice');
    await user.type(screen.getByTestId('i-email'), 'a@b.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice', email: 'a@b.com' });
    });
  });

  it('reset button restores defaults', async () => {
    const user = userEvent.setup();
    render(
      <Form<Values> onSubmit={vi.fn()} defaultValues={{ name: 'default', email: '' }}>
        {(rhf) => <input {...rhf.register('name')} data-testid="i-name" />}
      </Form>
    );
    const input = screen.getByTestId('i-name') as HTMLInputElement;
    await user.type(input, 'X');
    expect(input.value).toBe('defaultX');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input.value).toBe('default');
  });

  it('disabled form disables the submit button', () => {
    render(
      <Form onSubmit={vi.fn()} disabled defaultValues={{ name: '' }}>
        {() => null}
      </Form>
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
});
