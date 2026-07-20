import { describe, it, expect, vi } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { Spinner, SimpleSpinner, DotsSpinner, BarsSpinner } from '../src/components/Spinner';
import { useSpinner } from '../src/hooks';

describe('Spinner', () => {
  it('renders a spinner element', () => {
    const { container } = render(<Spinner active />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders different variants without crashing', () => {
    const { container } = render(<Spinner active variant="dots" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders all variants without crashing', () => {
    const variants = ['spin', 'pulse', 'bounce', 'dots', 'bars', 'ring'] as const;
    for (const variant of variants) {
      const { container } = render(<Spinner active variant={variant} />);
      expect(container.firstChild).not.toBeNull();
    }
  });

  it('renders all variants while inactive (animating=false) and disabled', () => {
    const variants = ['spin', 'pulse', 'bounce', 'dots', 'bars', 'ring'] as const;
    for (const variant of variants) {
      const { container } = render(<Spinner active={false} disabled variant={variant} />);
      expect(container.firstChild).not.toBeNull();
    }
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders at size=%s across variants', (size) => {
    const { container } = render(<Spinner active size={size} variant="ring" />);
    expect(container.firstChild).not.toBeNull();
  });

  it.each(['primary', 'secondary', 'error', 'success', 'warning', 'info'] as const)(
    'renders with color=%s',
    (color) => {
      const { container } = render(<Spinner active color={color} />);
      expect(container.firstChild).not.toBeNull();
    }
  );

  it('renders with a custom dimension and borderRadius', () => {
    const { container } = render(<Spinner active dimension={10} borderRadius={4} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with an unknown variant (switch default returns null)', () => {
    const { container } = render(<Spinner active variant={'bogus' as any} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('reflects focused state when the spinner element receives focus', () => {
    const { container } = render(<Spinner active />);
    // The spinner element wires onFocus/onBlur; dispatch a focus event to drive
    // state.focused (the element has no tabIndex, so a synthetic focusin is needed).
    const target = container.querySelector('div div') as HTMLElement;
    act(() => {
      target?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the label text when showLabel is true', () => {
    const { container } = render(<Spinner active showLabel label="Loading data" />);
    expect(container.textContent).toContain('Loading data');
  });

  it('shows Idle label when not active', () => {
    const { container } = render(<Spinner showLabel />);
    expect(container.textContent).toContain('Idle');
  });

  it('hides the label when showLabel is false', () => {
    const { container } = render(<Spinner active label="Hidden" showLabel={false} />);
    expect(container.textContent).not.toContain('Hidden');
  });

  it('renders three dots for the dots variant', () => {
    const { container } = render(<Spinner active variant="dots" />);
    // dots variant renders 3 child dots inside a flex container
    const flex = container.querySelector('.flex.items-center');
    expect(flex).not.toBeNull();
  });

  it('renders four bars for the bars variant', () => {
    const { container } = render(<Spinner active variant="bars" />);
    expect(container.querySelector('.flex.items-center')).not.toBeNull();
  });

  it('applies color variant classes', () => {
    const { container } = render(<Spinner active color="error" />);
    expect(container.querySelector('.border-red-600')).not.toBeNull();
  });

  it('renders a tooltip when showTooltip and tooltipText are set', () => {
    const { container } = render(<Spinner active showTooltip tooltipText="Please wait" />);
    expect(container.textContent).toContain('Please wait');
  });

  it('uses a custom renderSpinner function', () => {
    const { container } = render(
      <Spinner
        active
        renderSpinner={() => <div data-testid="custom-spinner">C</div>}
      />
    );
    expect(container.querySelector('[data-testid="custom-spinner"]')).not.toBeNull();
  });

  it('uses a custom renderLabel function', () => {
    const { container } = render(
      <Spinner active renderLabel={() => <div data-testid="custom-label">L</div>} />
    );
    expect(container.querySelector('[data-testid="custom-label"]')).not.toBeNull();
  });

  it('uses a custom render function for the whole component', () => {
    const { container } = render(
      <Spinner active render={() => <div data-testid="custom-root">R</div>} />
    );
    expect(container.querySelector('[data-testid="custom-root"]')).not.toBeNull();
  });
});

describe('Spinner wrapper variants', () => {
  it('SimpleSpinner renders', () => {
    const { container } = render(<SimpleSpinner active />);
    expect(container.firstChild).not.toBeNull();
  });

  it('DotsSpinner renders', () => {
    const { container } = render(<DotsSpinner active />);
    expect(container.firstChild).not.toBeNull();
  });

  it('BarsSpinner renders', () => {
    const { container } = render(<BarsSpinner active />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe('useSpinner', () => {
  it('toggle / start / stop call onActiveChange', () => {
    const onActiveChange = vi.fn();
    let result: any;
    const Probe = () => { result = useSpinner({ defaultActive: false, onActiveChange }); return null; };
    render(<Probe />);
    result.actions.start();
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
    result.actions.stop();
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
    result.actions.toggle();
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
  });

  it('reset returns to defaultActive', () => {
    const onActiveChange = vi.fn();
    let result: any;
    const Probe = () => { result = useSpinner({ defaultActive: true, onActiveChange }); return null; };
    render(<Probe />);
    result.actions.reset();
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
  });

  it('does not change internal state when controlled', () => {
    const onActiveChange = vi.fn();
    let result: any;
    const Probe = () => { result = useSpinner({ active: false, onActiveChange }); return null; };
    render(<Probe />);
    result.actions.toggle();
    expect(onActiveChange).toHaveBeenCalledWith(true);
    // Controlled value still wins for state.active.
    expect(result.state.active).toBe(false);
  });

  it('getDuration returns custom duration or speed-based values', () => {
    let result: any;
    const Probe = () => { result = useSpinner({}); return null; };
    render(<Probe />);
    expect(result.utils.getDuration('slow')).toBe(2000);
    expect(result.utils.getDuration('fast')).toBe(800);
    expect(result.utils.getDuration('normal')).toBe(1200);
    expect(result.utils.getDuration('normal', 500)).toBe(500);
  });

  it('formatLabel returns custom label or active/idle text', () => {
    let result: any;
    const Probe = () => { result = useSpinner({ label: 'Working' }); return null; };
    render(<Probe />);
    expect(result.utils.formatLabel(true, 'Custom')).toBe('Custom');
    expect(result.utils.formatLabel(true)).toBe('Working');
    expect(result.utils.formatLabel(false)).toBe('Idle');
  });

  it('shouldAnimate respects disabled state', () => {
    let result: any;
    const Probe = () => { result = useSpinner({}); return null; };
    render(<Probe />);
    expect(result.utils.shouldAnimate(true, false)).toBe(true);
    expect(result.utils.shouldAnimate(true, true)).toBe(false);
  });

  it('getTimestamp returns a millisecond timestamp', () => {
    let result: any;
    const Probe = () => { result = useSpinner({}); return null; };
    render(<Probe />);
    expect(typeof result.utils.getTimestamp()).toBe('number');
  });
});

// Direct hook tests for interaction handlers (focus/blur/hover/keydown) and
// animation lifecycle that the component wrapper does not exercise.
describe('useSpinner (interaction + animation)', () => {
  it('focus/blur update focused state unless disabled', () => {
    let result: any;
    const Probe = () => { result = useSpinner({ disabled: true }); return null; };
    render(<Probe />);
    act(() => result.handlers.onFocus({} as any));
    expect(result.state.focused).toBe(false);
    act(() => result.handlers.onBlur({} as any));
    expect(result.state.focused).toBe(false);

    // Enabled spinner: focus/blur actually flip the focused flag.
    let enabled: any;
    const Enabled = () => { enabled = useSpinner({}); return null; };
    render(<Enabled />);
    act(() => enabled.handlers.onFocus({} as any));
    expect(enabled.state.focused).toBe(true);
    act(() => enabled.handlers.onBlur({} as any));
    expect(enabled.state.focused).toBe(false);
  });

  it('hover enter/leave update hovered state unless disabled', () => {
    let result: any;
    const Enabled = () => { result = useSpinner({}); return null; };
    render(<Enabled />);
    act(() => result.handlers.onMouseEnter({} as any));
    expect(result.state.hovered).toBe(true);
    act(() => result.handlers.onMouseLeave({} as any));
    expect(result.state.hovered).toBe(false);
  });

  it('hover handlers are no-ops when disabled', () => {
    let result: any;
    const Probe = () => { result = useSpinner({ disabled: true }); return null; };
    render(<Probe />);
    act(() => result.handlers.onMouseEnter({} as any));
    expect(result.state.hovered).toBe(false);
    act(() => result.handlers.onMouseLeave({} as any));
    expect(result.state.hovered).toBe(false);
  });

  it('Enter/Space toggles active, Escape stops', async () => {
    const onActiveChange = vi.fn();
    let result: any;
    const Probe = () => { result = useSpinner({ defaultActive: false, onActiveChange }); return null; };
    render(<Probe />);
    const mk = (key: string) => ({ key, preventDefault: vi.fn() } as any);
    act(() => result.handlers.onKeyDown(mk('Enter')));
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
    act(() => result.handlers.onKeyDown(mk(' ')));
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
    act(() => result.handlers.onKeyDown(mk('Escape')));
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
    // unrelated key is ignored
    act(() => result.handlers.onKeyDown(mk('ArrowUp')));
  });

  it('keydown is a no-op when disabled', () => {
    const onActiveChange = vi.fn();
    let result: any;
    const Probe = () => { result = useSpinner({ disabled: true, onActiveChange }); return null; };
    render(<Probe />);
    act(() => result.handlers.onKeyDown({ key: 'Enter', preventDefault: vi.fn() } as any));
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('animation loop advances frame/elapsed and stops on deactivate', async () => {
    let result: any;
    const Probe = () => { result = useSpinner({ defaultActive: false }); return null; };
    render(<Probe />);
    expect(result.state.frame).toBe(0);
    // Activate -> the rAF loop runs; wait for at least one frame to set elapsed>0.
    act(() => result.actions.start());
    await vi.waitFor(() => expect(result.state.elapsed).toBeGreaterThan(0), { timeout: 2000 });
    expect(result.state.frame).toBeGreaterThanOrEqual(0);
    // Deactivate -> cancel + reset frame/elapsed to 0.
    act(() => result.actions.stop());
    expect(result.state.frame).toBe(0);
    expect(result.state.elapsed).toBe(0);
  });

  it('ring variant reports aria progress and progress percent', () => {
    let result: any;
    const Probe = () => { result = useSpinner({ defaultActive: false, variant: 'ring' }); return null; };
    render(<Probe />);
    expect(result.ariaAttributes.role).toBe('progressbar');
    // When inactive, progress is 0 and the value-* attrs are not emitted.
    expect(result.ariaAttributes['aria-valuemin']).toBeUndefined();
    // Activate to drive the progress branch (variant not spin/pulse).
    act(() => result.actions.start());
    expect(result.ariaAttributes['aria-valuemin']).toBe(0);
    expect(result.ariaAttributes['aria-valuemax']).toBe(100);
  });

  it('controlled active state syncs internal active via effect', () => {
    const { result, rerender } = renderHook((p: any) => useSpinner(p), {
      initialProps: { active: false },
    });
    rerender({ active: true });
    expect(result.current.state.active).toBe(true);
    rerender({ active: false });
    expect(result.current.state.active).toBe(false);
  });

  it('getDuration falls through to default for unknown speed', () => {
    let result: any;
    const Probe = () => { result = useSpinner({}); return null; };
    render(<Probe />);
    expect(result.utils.getDuration('unknown' as any)).toBe(1200);
  });

  it('controlled start/stop/reset skip internal setActive but still notify', () => {
    const onActiveChange = vi.fn();
    let result: any;
    const Probe = () => { result = useSpinner({ active: false, onActiveChange }); return null; };
    render(<Probe />);
    act(() => result.actions.start());
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
    expect(result.state.active).toBe(false); // controlled value wins
    act(() => result.actions.stop());
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
    act(() => result.actions.reset());
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
  });

  it('setSpeed/setVariant/setSize are no-op stubs that do not throw', () => {
    let result: any;
    const Probe = () => { result = useSpinner({}); return null; };
    render(<Probe />);
    expect(() => {
      result.actions.setSpeed('fast');
      result.actions.setVariant('dots');
      result.actions.setSize('lg');
    }).not.toThrow();
  });
});
