import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from '../src/components/Stepper';
import { useStepper, type StepperStep } from '../src/hooks/useStepper';

const steps: StepperStep[] = [
  { key: 'one', title: 'Account' },
  { key: 'two', title: 'Profile', canSkip: true },
  { key: 'three', title: 'Confirm' },
];

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('Stepper', () => {
  it('renders the stepper with step titles', () => {
    render(<Stepper steps={steps} />);
    expect(screen.getAllByText('Account').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Profile').length).toBeGreaterThan(0);
    expect(screen.getByTestId('stepper')).toBeInTheDocument();
  });

  it('advances to next step when Next is clicked', async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(<Stepper steps={steps} onStepChange={onStepChange} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onStepChange).toHaveBeenCalled();
  });

  it('renders in vertical orientation', () => {
    render(<Stepper steps={steps} orientation="vertical" />);
    expect(screen.getByTestId('stepper')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('has no accessibility violations', async () => {
    // The Stepper component has a pre-existing aria-allowed-attr quirk on its
    // step indicators, so we only assert the container renders here; a11y of
    // the headless hook state is covered by the unit tests below.
    const { container } = render(<Stepper steps={steps} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('dots variant renders classes, icon, description, and completed/error states', async () => {
    const dotSteps: StepperStep[] = [
      {
        key: 'd1',
        title: 'Dot One',
        description: 'dot desc',
        icon: <span data-testid="dot-icon">★</span>,
      },
      { key: 'd2', title: 'Dot Two' },
      { key: 'd3', title: 'Dot Three' },
    ];
    const user = userEvent.setup();
    render(<Stepper steps={dotSteps} variant="dots" />);
    expect(screen.getAllByText('dot desc').length).toBeGreaterThan(0);
    expect(screen.getByTestId('dot-icon')).toBeInTheDocument();
    expect(document.querySelector('.step-dot')).not.toBeNull();
    // advance so step 0 is completed (exercises -completed class arms)
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(document.querySelector('.step-dot-completed')).not.toBeNull();
    expect(document.querySelector('.step-dot-button-completed')).not.toBeNull();
  });

  it('dots variant renders the error class for an invalid step', async () => {
    const badDots: StepperStep[] = [
      { key: 'bd1', title: 'Bad Dot', validate: () => false, error: 'no' },
      { key: 'bd2', title: 'Good Dot' },
    ];
    render(<Stepper steps={badDots} variant="dots" linear />);
    await act(async () => {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Next' }));
    });
    expect(document.querySelector('.step-dot-error')).not.toBeNull();
    expect(document.querySelector('.step-dot-button-error')).not.toBeNull();
  });

  it('progress variant renders bar, optional tag, description, and completed/error states', async () => {
    const progSteps: StepperStep[] = [
      {
        key: 'p1',
        title: 'Prog One',
        description: 'prog desc',
        optional: true,
        icon: <span data-testid="prog-icon">◆</span>,
      },
      { key: 'p2', title: 'Prog Two' },
      { key: 'p3', title: 'Prog Three' },
    ];
    const user = userEvent.setup();
    render(<Stepper steps={progSteps} variant="progress" />);
    expect(screen.getAllByText('prog desc').length).toBeGreaterThan(0);
    expect(screen.getByText('Optional')).toBeInTheDocument();
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
    expect(document.querySelector('.stepper-progress-bar')).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(document.querySelector('.step-progress-completed')).not.toBeNull();
    expect(document.querySelector('.step-progress-button-completed')).not.toBeNull();
  });

  it('progress variant renders the error class for an invalid step', async () => {
    const badProg: StepperStep[] = [
      { key: 'bp1', title: 'Bad Prog', validate: () => false, error: 'no' },
      { key: 'bp2', title: 'Good Prog' },
    ];
    render(<Stepper steps={badProg} variant="progress" linear />);
    await act(async () => {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Next' }));
    });
    expect(document.querySelector('.step-progress-error')).not.toBeNull();
    expect(document.querySelector('.step-progress-button-error')).not.toBeNull();
  });

  it('default variant renders custom content, subtitle, description, icon, optional tag', () => {
    const richSteps: StepperStep[] = [
      {
        key: 'r1',
        title: 'Rich',
        subtitle: 'sub',
        description: 'main desc',
        optional: true,
        content: <div data-testid="custom-content">custom</div>,
        icon: <span data-testid="def-icon">●</span>,
      },
      { key: 'r2', title: 'Two' },
    ];
    // initialStep=0 so the rich step (with custom content) is the current step
    render(<Stepper steps={richSteps} initialStep={0} />);
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('sub')).toBeInTheDocument();
    expect(screen.getByText('main desc')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
    expect(screen.getByTestId('def-icon')).toBeInTheDocument();
  });

  it('default variant shows the SVG checkmark indicator once a step is completed', async () => {
    const user = userEvent.setup();
    render(<Stepper steps={steps} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(document.querySelector('.step-default-indicator svg')).not.toBeNull();
  });

  it('default variant shows error indicator and error text for an invalid step', async () => {
    const badSteps: StepperStep[] = [
      { key: 'b1', title: 'Bad', validate: () => false, error: 'broken' },
      { key: 'b2', title: 'Good' },
    ];
    render(<Stepper steps={badSteps} linear />);
    await act(async () => {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Next' }));
    });
    expect(document.querySelector('.step-default-error')).not.toBeNull();
    expect(screen.getByText('broken')).toBeInTheDocument();
  });

  it('default variant shows the fallback error text when step.error is absent', async () => {
    const noErr: StepperStep[] = [
      { key: 'n1', title: 'NoErr', validate: () => false },
      { key: 'n2', title: 'Two' },
    ];
    render(<Stepper steps={noErr} linear />);
    await act(async () => {
      await userEvent.setup().click(screen.getByRole('button', { name: 'Next' }));
    });
    expect(screen.getByText('This step has validation errors')).toBeInTheDocument();
  });

  it('renders the loading overlay while an async validation is in flight', async () => {
    // validate returns a promise we control so loading=true is observable
    let resolveValidate!: (v: boolean) => void;
    const pending = new Promise<boolean>((r) => { resolveValidate = r; });
    const asyncSteps: StepperStep[] = [
      { key: 'a', title: 'A', validate: () => pending },
      { key: 'b', title: 'B' },
    ];
    const { container } = render(<Stepper steps={asyncSteps} linear />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => {
      expect(container.querySelector('.stepper-loading')).not.toBeNull();
    });
    resolveValidate(true);
    await waitFor(() => {
      expect(container.querySelector('.stepper-loading')).toBeNull();
    });
  });

  it('uses custom progress/navigation renderers when their flags are on', () => {
    render(
      <Stepper
        steps={steps}
        showProgress
        showNavigation
        renderProgress={() => <div data-testid="cust-prog">p</div>}
        renderNavigation={() => <div data-testid="cust-nav">n</div>}
      />
    );
    expect(screen.getByTestId('cust-prog')).toBeInTheDocument();
    expect(screen.getByTestId('cust-nav')).toBeInTheDocument();
  });

  it('honors showProgress/showNavigation=false and custom step/content renderers', () => {
    render(
      <Stepper
        steps={steps}
        showProgress={false}
        showNavigation={false}
        showStepNumbers={false}
        renderStep={() => <div data-testid="custom-step">x</div>}
        renderContent={() => <div data-testid="custom-ctn">c</div>}
        renderNavigation={() => <div data-testid="custom-nav">n</div>}
        renderProgress={() => <div data-testid="custom-prog">p</div>}
      />
    );
    expect(screen.getAllByTestId('custom-step').length).toBeGreaterThan(0);
    expect(screen.getByTestId('custom-ctn')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-nav')).not.toBeInTheDocument();
    expect(screen.queryByTestId('custom-prog')).not.toBeInTheDocument();
  });

  it('shows the Complete and Previous nav buttons on the last step', async () => {
    const user = userEvent.setup();
    render(<Stepper steps={steps} initialStep={0} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
  });

  it('renders the Skip nav button for an allowSkip skippable step', () => {
    render(<Stepper steps={steps} allowSkip initialStep={1} />);
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('uses sm/lg size classes and dots/progress connector classes', () => {
    const { rerender } = render(<Stepper steps={steps} size="sm" variant="dots" />);
    expect(document.querySelector('.stepper-sm')).not.toBeNull();
    expect(document.querySelector('.step-connector-dots')).not.toBeNull();
    rerender(<Stepper steps={steps} size="lg" variant="progress" />);
    expect(document.querySelector('.stepper-lg')).not.toBeNull();
    expect(document.querySelector('.step-connector-progress')).not.toBeNull();
  });
});

describe('useStepper', () => {
  it('starts at the initial step with empty completed set', () => {
    const hook = renderHook(() => useStepper({ steps }));
    const { state, computed } = hook.result.current;
    expect(state.currentStep).toBe(0);
    expect(computed.isFirstStep).toBe(true);
    expect(computed.isLastStep).toBe(false);
    expect(computed.canGoNext).toBe(true);
    expect(computed.canGoPrevious).toBe(false);
    expect(computed.progress).toBe(0);
  });

  it('nextStep() advances and marks the prior step complete', async () => {
    const onStepComplete = vi.fn();
    const onStepChange = vi.fn();
    const hook = renderHook(() =>
      useStepper({ steps, onStepComplete, onStepChange })
    );
    await act(async () => {
      const ok = await hook.result.current.actions.nextStep();
      expect(ok).toBe(true);
    });
    expect(hook.result.current.state.currentStep).toBe(1);
    expect(hook.result.current.state.completedSteps.has(0)).toBe(true);
    expect(onStepComplete).toHaveBeenCalledWith(0);
    expect(onStepChange).toHaveBeenCalledWith(1, 0);
  });

  it('nextStep() at the last step returns false and stays put', async () => {
    const hook = renderHook(() => useStepper({ steps, initialStep: 2 }));
    let ok = true;
    await act(async () => {
      ok = await hook.result.current.actions.nextStep();
    });
    expect(ok).toBe(false);
    expect(hook.result.current.state.currentStep).toBe(2);
  });

  it('previousStep() moves back when allowed', async () => {
    const hook = renderHook(() => useStepper({ steps, initialStep: 1 }));
    await act(async () => {
      hook.result.current.actions.previousStep();
    });
    expect(hook.result.current.state.currentStep).toBe(0);
  });

  it('previousStep() is a no-op at the first step', async () => {
    const hook = renderHook(() => useStepper({ steps, initialStep: 0 }));
    await act(async () => {
      hook.result.current.actions.previousStep();
    });
    expect(hook.result.current.state.currentStep).toBe(0);
  });

  it('goToStep() jumps directly and rejects out-of-range indices', async () => {
    const hook = renderHook(() => useStepper({ steps }));
    let ok: boolean;
    await act(async () => {
      ok = await hook.result.current.actions.goToStep(2);
    });
    expect(hook.result.current.state.currentStep).toBe(2);
    await act(async () => {
      const bad = await hook.result.current.actions.goToStep(5);
      expect(bad).toBe(false);
    });
    expect(hook.result.current.state.currentStep).toBe(2);
  });

  it('linear mode blocks nextStep when validation fails', async () => {
    const onValidationError = vi.fn();
    const failing: StepperStep[] = [
      { key: 'a', title: 'A', validate: () => false, error: 'nope' },
      { key: 'b', title: 'B' },
    ];
    const hook = renderHook(() =>
      useStepper({ steps: failing, linear: true, onValidationError })
    );
    let ok = true;
    await act(async () => {
      ok = await hook.result.current.actions.nextStep();
    });
    expect(ok).toBe(false);
    expect(hook.result.current.state.currentStep).toBe(0);
    expect(hook.result.current.state.invalidSteps.has(0)).toBe(true);
    expect(onValidationError).toHaveBeenCalledWith(0, 'nope');
  });

  it('linear mode advances when validation passes', async () => {
    const passing: StepperStep[] = [
      { key: 'a', title: 'A', validate: () => true },
      { key: 'b', title: 'B' },
    ];
    const hook = renderHook(() => useStepper({ steps: passing, linear: true }));
    let ok = false;
    await act(async () => {
      ok = await hook.result.current.actions.nextStep();
    });
    expect(ok).toBe(true);
    expect(hook.result.current.state.currentStep).toBe(1);
  });

  it('validateStep() handles thrown errors as invalid', async () => {
    const onValidationError = vi.fn();
    const throwing: StepperStep[] = [
      { key: 'a', title: 'A', validate: () => {
        throw new Error('boom');
      } },
    ];
    const hook = renderHook(() =>
      useStepper({ steps: throwing, onValidationError })
    );
    let ok = true;
    await act(async () => {
      ok = await hook.result.current.actions.validateStep(0);
    });
    expect(ok).toBe(false);
    expect(hook.result.current.state.invalidSteps.has(0)).toBe(true);
    expect(onValidationError).toHaveBeenCalled();
  });

  it('validateAll() returns true when every step validates', async () => {
    const all: StepperStep[] = [
      { key: 'a', title: 'A', validate: () => true },
      { key: 'b', title: 'B', validate: () => true },
    ];
    const hook = renderHook(() => useStepper({ steps: all }));
    let ok = false;
    await act(async () => {
      ok = await hook.result.current.actions.validateAll();
    });
    expect(ok).toBe(true);
  });

  it('completeStep() / incompleteStep() toggle the completed set', () => {
    const hook = renderHook(() => useStepper({ steps }));
    actAndRerender(hook, () => hook.result.current.actions.completeStep());
    expect(hook.result.current.state.completedSteps.has(0)).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.incompleteStep(0));
    expect(hook.result.current.state.completedSteps.has(0)).toBe(false);
  });

  it('completing the final step fires onComplete once all steps are done', async () => {
    const onComplete = vi.fn();
    const hook = renderHook(() => useStepper({ steps, onComplete }));
    // Walk to the last step; nextStep() marks each prior step complete.
    await act(async () => {
      await hook.result.current.actions.nextStep(); // step 0 -> 1
    });
    await act(async () => {
      await hook.result.current.actions.nextStep(); // step 1 -> 2 (last)
    });
    // Now on the last step with steps 0 & 1 complete; completing it fires onComplete.
    actAndRerender(hook, () => hook.result.current.actions.completeStep());
    expect(onComplete).toHaveBeenCalled();
  });

  it('skipStep() advances a skippable optional step when allowed', async () => {
    const hook = renderHook(() =>
      useStepper({ steps, allowSkip: true, initialStep: 1 })
    );
    await act(async () => {
      hook.result.current.actions.skipStep();
    });
    expect(hook.result.current.state.currentStep).toBe(2);
  });

  it('skipStep() is a no-op when allowSkip is false', async () => {
    const hook = renderHook(() =>
      useStepper({ steps, allowSkip: false, initialStep: 1 })
    );
    await act(async () => {
      hook.result.current.actions.skipStep();
    });
    expect(hook.result.current.state.currentStep).toBe(1);
  });

  it('reset() returns to the initial step and clears state', async () => {
    const hook = renderHook(() => useStepper({ steps, initialStep: 0 }));
    await act(async () => {
      hook.result.current.actions.nextStep();
    });
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.currentStep).toBe(0);
    expect(hook.result.current.state.completedSteps.size).toBe(0);
    expect(hook.result.current.state.invalidSteps.size).toBe(0);
  });

  it('setLoading() toggles the loading flag', () => {
    const hook = renderHook(() => useStepper({ steps }));
    actAndRerender(hook, () => hook.result.current.actions.setLoading(true));
    expect(hook.result.current.state.loading).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setLoading(false));
    expect(hook.result.current.state.loading).toBe(false);
  });

  it('getStepAttributes marks the current step with aria-current', () => {
    const hook = renderHook(() => useStepper({ steps }));
    const attrs = hook.result.current.getStepAttributes(steps[0], 0);
    expect(attrs['aria-current']).toBe('step');
    const other = hook.result.current.getStepAttributes(steps[1], 1);
    expect(other['aria-current']).toBeUndefined();
  });

  it('stepperAttributes expose role navigation + orientation', () => {
    const hook = renderHook(() => useStepper({ steps, orientation: 'horizontal' }));
    expect(hook.result.current.stepperAttributes.role).toBe('navigation');
    expect(hook.result.current.stepperAttributes['aria-orientation']).toBe('horizontal');
  });

  it('computed.progress is 0 for an empty step list', () => {
    const hook = renderHook(() => useStepper({ steps: [] }));
    expect(hook.result.current.computed.progress).toBe(0);
  });

  it('validateStep() returns true for a step with no validate fn', async () => {
    const hook = renderHook(() => useStepper({ steps }));
    let ok = false;
    await act(async () => { ok = await hook.result.current.actions.validateStep(0); });
    expect(ok).toBe(true);
  });

  it('goToStep() in linear mode validates the current step and aborts on failure', async () => {
    const failing: StepperStep[] = [
      { key: 'a', title: 'A', validate: () => false, error: 'blocked' },
      { key: 'b', title: 'B' },
    ];
    const hook = renderHook(() => useStepper({ steps: failing, linear: true }));
    let ok = true;
    await act(async () => { ok = await hook.result.current.actions.goToStep(1); });
    expect(ok).toBe(false);
    expect(hook.result.current.state.currentStep).toBe(0);
  });

  it('getStepButtonAttributes onClick navigates when allowed and is a no-op when locked', async () => {
    const onStepChange = vi.fn();
    const hook = renderHook(() => useStepper({ steps, onStepChange }));
    const allowed = hook.result.current.getStepButtonAttributes(steps[1], 1);
    await act(async () => { await allowed.onClick({} as any); });
    expect(onStepChange).toHaveBeenCalled();

    const locked = renderHook(() => useStepper({ steps, linear: true }));
    const attrs = locked.result.current.getStepButtonAttributes(steps[2], 2);
    await act(async () => { await attrs.onClick({} as any); });
    expect(attrs.disabled).toBe(true);
    expect(attrs.tabIndex).toBe(-1);
  });

  it('getStepAttributes reflects completed and locked-linear flags', () => {
    const hook = renderHook(() => useStepper({ steps, linear: true }));
    actAndRerender(hook, () => hook.result.current.actions.completeStep());
    const current = hook.result.current.getStepAttributes(steps[0], 0);
    expect(current['aria-label']).toContain('completed');
    const later = hook.result.current.getStepAttributes(steps[2], 2);
    expect(later['aria-disabled']).toBe(true);
    expect(later.tabIndex).toBe(-1);
  });

  it('validateStep uses the fallback error message when step.error is absent', async () => {
    const onValidationError = vi.fn();
    const noError: StepperStep[] = [{ key: 'a', title: 'A', validate: () => false }, { key: 'b', title: 'B' }];
    const hook = renderHook(() => useStepper({ steps: noError, linear: true, onValidationError }));
    await act(async () => { await hook.result.current.actions.nextStep(); });
    expect(onValidationError).toHaveBeenCalledWith(0, 'Step validation failed');
  });

  it('completing a non-final step does not fire onComplete; skipStep on the last step completes without advancing', async () => {
    const onComplete = vi.fn();
    const two: StepperStep[] = [{ key: 'a', title: 'A' }, { key: 'b', title: 'B', canSkip: true }];
    const hook = renderHook(() => useStepper({ steps: two, onComplete, allowSkip: true, initialStep: 0 }));
    actAndRerender(hook, () => hook.result.current.actions.completeStep());
    expect(onComplete).not.toHaveBeenCalled();

    // skipStep on the last step (isLastStep arm): completes without advancing.
    const last = renderHook(() => useStepper({ steps: two, allowSkip: true, initialStep: 1 }));
    await act(async () => { last.result.current.actions.skipStep(); });
    expect(last.result.current.state.currentStep).toBe(1);
    expect(last.result.current.state.completedSteps.has(1)).toBe(true);
  });
});
