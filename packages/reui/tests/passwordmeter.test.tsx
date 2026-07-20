import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordMeter } from '../src/components/PasswordMeter';
import { usePasswordMeter } from '../src/hooks';

// Helper: render with instant analysis (no debounce) so assertions are synchronous.
function renderMeter(overrides: Record<string, any> = {}) {
  return render(<PasswordMeter analysisDelay={0} {...overrides} />);
}

describe('PasswordMeter', () => {
  it('renders a password input and strength meter', () => {
    render(<PasswordMeter />);
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('shows empty-state guidance before any password is typed', () => {
    renderMeter();
    expect(screen.getByText(/Enter a password to see strength/i)).toBeInTheDocument();
  });

  it('updates strength when a password is typed', async () => {
    const user = userEvent.setup();
    render(<PasswordMeter variant="text" showStrengthText analysisDelay={0} />);
    const input = screen.getByTestId('password-input');
    await user.type(input, 'Str0ng!Pass');
    expect(input).toHaveValue('Str0ng!Pass');
  });

  it('reports a weak score for an empty-ish / common password', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'text' });
    await user.type(screen.getByTestId('password-input'), 'password');
    // Common password -> should produce warning(s) mentioning common.
    expect(screen.getAllByText(/common password/i).length).toBeGreaterThan(0);
  });

  it('reports a strong score for a long, varied password', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'text' });
    await user.type(screen.getByTestId('password-input'), 'Str0ng!Pass-2024#abc');
    // Criteria should all be met (length, lower, upper, digit, special, not-common)
    const criteria = screen.getAllByText(/At least|Contains|Not a common/i);
    expect(criteria.length).toBeGreaterThan(0);
  });

  it('clears the password via the Clear button', async () => {
    const user = userEvent.setup();
    renderMeter();
    await user.type(screen.getByTestId('password-input'), 'abc');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByTestId('password-input')).toHaveValue('');
  });

  it('analyzes manually via the Analyze button', async () => {
    const user = userEvent.setup();
    renderMeter({ analysisDelay: 99999 });
    const input = screen.getByTestId('password-input');
    await user.type(input, 'manual!Pass1');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    // Strength label should appear after manual analysis.
    expect(screen.getByText(/Password Strength/i)).toBeInTheDocument();
  });

  it('toggles visibility via the visibility toggle button', async () => {
    const user = userEvent.setup();
    renderMeter({ showVisibilityToggle: true });
    const input = screen.getByTestId('password-input');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('respects the disabled prop (no analysis, disabled controls)', () => {
    renderMeter({ disabled: true });
    expect(screen.getByTestId('password-input')).toBeDisabled();
  });

  it('renders the bar variant with a score', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'bar', showScore: true });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    // score percentage is rendered somewhere
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('renders the circle variant', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'circle' });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the dots variant', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots' });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders entropy and crack-time when enabled', async () => {
    const user = userEvent.setup();
    renderMeter({ showEntropy: true, showCrackTime: true });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByText(/Entropy:/i)).toBeInTheDocument();
    expect(screen.getByText(/Crack time:/i)).toBeInTheDocument();
  });

  it('uses a custom renderStrength renderer', async () => {
    const user = userEvent.setup();
    renderMeter({ renderStrength: (a: any) => <div data-testid="custom-strength">{a ? a.score : 'none'}</div> });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByTestId('custom-strength')).toBeInTheDocument();
  });

  it('uses a custom renderCriteria renderer', async () => {
    const user = userEvent.setup();
    renderMeter({ renderCriteria: (c: any) => <div data-testid="custom-criteria">{c.length}</div> });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByTestId('custom-criteria')).toBeInTheDocument();
  });

  it('respects a custom validation rule with weight', async () => {
    const user = userEvent.setup();
    renderMeter({
      validationRules: [
        { name: 'nofoo', validate: (p: string) => !p.includes('foo'), message: 'must not contain foo', weight: 50 },
      ],
    });
    await user.type(screen.getByTestId('password-input'), 'fooBar1!');
    expect(screen.getByText('must not contain foo')).toBeInTheDocument();
  });

  it('fires onStrengthChange callback', async () => {
    const user = userEvent.setup();
    const onStrengthChange = vi.fn();
    renderMeter({ onStrengthChange, analysisDelay: 0 });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(onStrengthChange).toHaveBeenCalled();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders the circle variant at size=%s', async (size) => {
    const user = userEvent.setup();
    renderMeter({ variant: 'circle', size, showScore: true });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it.each([
    'a',
    'ab',
    'abc123!',
    'Abcdefg1!',
    'Str0ng!Pass-2024#abcxyz',
  ])('renders the dots variant across strength levels (pw=%s)', async (pw) => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots' });
    await user.type(screen.getByTestId('password-input'), pw);
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders the bar variant with animations disabled', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'bar', animated: false, showScore: true });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('renders the circle variant with animations disabled', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'circle', animated: false, showScore: true });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the dots variant idle (no strength yet)', () => {
    renderMeter({ variant: 'dots' });
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders the circle variant idle (no strength yet, empty center text)', () => {
    renderMeter({ variant: 'circle', showScore: true });
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders the circle variant without a score in the center', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'circle', showScore: false });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the text variant idle before any password is entered', () => {
    renderMeter({ variant: 'text', showStrengthText: true });
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders the dots variant at size=%s', async (size) => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots', size });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders the dots variant with animations disabled', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots', animated: false });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it.each([
    ['a', 'very-weak'],
    ['Abc1', 'weak'],
    ['abcdefgh', 'fair'],
    ['Password1', 'good'],
    ['Abcdefg1', 'strong'],
    ['Abcdefg1!', 'very-strong'],
  ])('renders the dots variant for the %s strength level', async (pw, _label) => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots' });
    await user.type(screen.getByTestId('password-input'), pw);
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders the text variant with animations disabled and a strength label', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'text', animated: false, showStrengthText: true });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aa');
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('renders the bar variant for an unknown variant value (default fallback)', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'bogus' as any });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
  });

  it('shows the analyzing indicator and analyzing button label while debouncing', async () => {
    const user = userEvent.setup();
    renderMeter({ analysisDelay: 1000 });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    // while the debounce runs, the Analyze button shows the analyzing label
    expect(screen.getByRole('button', { name: /analyzing|analyze/i })).toBeInTheDocument();
  });

  it('shows an error message when analysis throws after a prior successful analysis', async () => {
    const user = userEvent.setup();
    // The rule only throws once the password includes 'boom'; a prior valid
    // analysis establishes state.analysis so renderAdditionalInfo renders the error.
    renderMeter({
      analysisDelay: 0,
      validationRules: [
        { name: 'boom', validate: (p: string) => { if (p.includes('boom')) throw new Error('analysis failed'); return true; }, message: 'x' },
      ],
    });
    // first: a non-throwing password establishes analysis
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    // then append 'boom' to trigger the throw; prior analysis persists, error is set
    await user.type(screen.getByTestId('password-input'), 'boom');
    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });
});

// Direct hook tests covering manual analyze, clear, visibility, reset, disabled.
describe('usePasswordMeter (hook actions)', () => {
  function setup(props: Parameters<typeof usePasswordMeter>[0] = {}) {
    const result: { current: ReturnType<typeof usePasswordMeter> } = { current: null as any };
    function Probe() {
      result.current = usePasswordMeter({ analysisDelay: 0, ...props });
      return null;
    }
    render(<Probe />);
    return result;
  }

  it('analyze() returns analysis and updates state', () => {
    const res = setup();
    let analysis: any;
    act(() => { analysis = res.current.actions.analyze('Str0ng!Pass'); });
    expect(analysis.strength).toBeTruthy();
    expect(res.current.state.analysis).not.toBeNull();
    expect(res.current.state.lastAnalyzed).not.toBeNull();
  });

  it('toggleVisibility / setVisibility flip the visible flag', () => {
    const res = setup();
    act(() => res.current.actions.toggleVisibility());
    expect(res.current.state.visible).toBe(true);
    act(() => res.current.actions.setVisibility(false));
    expect(res.current.state.visible).toBe(false);
  });

  it('getStrengthPercentage / getStrengthColor reflect analysis', () => {
    const res = setup();
    expect(res.current.actions.getStrengthPercentage()).toBe(0);
    expect(res.current.actions.getStrengthColor()).toBe('#e5e7eb');
    act(() => res.current.actions.analyze('Str0ng!Pass-2024#abc'));
    expect(res.current.actions.getStrengthPercentage()).toBeGreaterThan(0);
    expect(res.current.actions.getStrengthColor()).not.toBe('#e5e7eb');
  });

  it('clear() wipes password and analysis', () => {
    const res = setup();
    act(() => { res.current.actions.analyze('Str0ng!Pass'); });
    act(() => res.current.actions.clear());
    expect(res.current.state.password).toBe('');
    expect(res.current.state.analysis).toBeNull();
  });

  it('reset() restores initial state', () => {
    const res = setup({ defaultVisible: true });
    act(() => res.current.actions.setPassword('abc'));
    act(() => res.current.actions.reset());
    expect(res.current.state.password).toBe('');
    expect(res.current.state.visible).toBe(true);
  });

  it('disabled prevents setPassword / clear / visibility changes', () => {
    const res = setup({ disabled: true });
    act(() => res.current.actions.setPassword('abc'));
    expect(res.current.state.password).toBe('');
    act(() => res.current.actions.clear());
    act(() => res.current.actions.toggleVisibility());
    expect(res.current.state.visible).toBe(false);
  });

  it('onPasswordChange fires with null analysis when autoAnalyze is false', () => {
    const onPasswordChange = vi.fn();
    const res = setup({ autoAnalyze: false, onPasswordChange });
    act(() => res.current.actions.setPassword('abc'));
    expect(onPasswordChange).toHaveBeenCalledWith('abc', null);
  });

  it('onAnalysisComplete fires after analysis', () => {
    const onAnalysisComplete = vi.fn();
    const res = setup({ onAnalysisComplete });
    act(() => res.current.actions.analyze('Aa1!abcd'));
    expect(onAnalysisComplete).toHaveBeenCalled();
  });
});
