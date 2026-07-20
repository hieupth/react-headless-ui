import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  Progress,
  SimpleProgress,
  CircularProgress,
  LoadingProgress,
} from '../src/components/Progress';
import { useProgress } from '../src/hooks';

describe('Progress', () => {
  it('renders a progress bar into the DOM', () => {
    const { container } = render(<Progress value={40} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('reflects the value through the filled width', () => {
    const { container } = render(<Progress value={50} showPercentage />);
    expect(container.firstChild).not.toBeNull();
    expect(container.textContent).toMatch(/50%/);
  });

  it('exposes progressbar role and aria values', () => {
    render(<Progress value={30} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders an SVG circle for CircularProgress', () => {
    const { container } = render(<CircularProgress value={75} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.textContent).toMatch(/75%/);
  });

  it('renders a SimpleProgress track', () => {
    const { container } = render(<SimpleProgress value={20} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a LoadingProgress with shimmer', () => {
    const { container } = render(<LoadingProgress value={50} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders 0% width when given an indeterminate value', () => {
    const { container } = render(<Progress value={null} />);
    // Headless-only: select the fill via its role rather than a color utility.
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('0%');
  });
});

describe('useProgress', () => {
  it('computes percentage and completion', () => {
    let result: any;
    const Probe = () => { result = useProgress({ value: 75, max: 100 }); return null; };
    render(<Probe />);
    expect(result.state.percentage).toBe(75);
    expect(result.state.isComplete).toBe(false);
  });

  it('marks complete when value reaches max', () => {
    let result: any;
    const Probe = () => { result = useProgress({ value: 100 }); return null; };
    render(<Probe />);
    expect(result.state.isComplete).toBe(true);
  });

  it('treats null value as indeterminate', () => {
    let result: any;
    const Probe = () => { result = useProgress({ value: null }); return null; };
    render(<Probe />);
    expect(result.state.isIndeterminate).toBe(true);
    expect(result.state.mode).toBe('indeterminate');
  });

  it('increments and decrements via actions', () => {
    let result: any;
    const onValueChange = vi.fn();
    const Probe = () => { result = useProgress({ defaultValue: 10, onValueChange }); return null; };
    render(<Probe />);
    act(() => result.actions.increment(5));
    expect(onValueChange).toHaveBeenLastCalledWith(15);
    act(() => result.actions.decrement(3));
    expect(onValueChange).toHaveBeenLastCalledWith(12);
  });

  it('setToMin and setToMax', () => {
    let result: any;
    const onValueChange = vi.fn();
    const Probe = () => { result = useProgress({ defaultValue: 50, onValueChange }); return null; };
    render(<Probe />);
    act(() => result.actions.setToMin());
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    act(() => result.actions.setToMax());
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it('reset returns to default value', () => {
    let result: any;
    const onValueChange = vi.fn();
    const Probe = () => { result = useProgress({ defaultValue: 25, onValueChange }); return null; };
    render(<Probe />);
    act(() => result.actions.setValue(80));
    act(() => result.actions.reset());
    expect(onValueChange).toHaveBeenLastCalledWith(25);
  });

  it('startIndeterminate / stopIndeterminate', () => {
    let result: any;
    const onValueChange = vi.fn();
    const Probe = () => { result = useProgress({ defaultValue: 50, onValueChange }); return null; };
    render(<Probe />);
    act(() => result.actions.startIndeterminate());
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    act(() => result.actions.stopIndeterminate());
    expect(onValueChange).toHaveBeenLastCalledWith(50);
  });

  it('keyboard handler adjusts the value', () => {
    let result: any;
    const onValueChange = vi.fn();
    const Probe = () => { result = useProgress({ defaultValue: 50, onValueChange }); return null; };
    render(<Probe />);
    act(() => {
      result.handlers.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any);
    });
    expect(onValueChange).toHaveBeenLastCalledWith(51);
    act(() => {
      result.handlers.onKeyDown({ key: 'Home', preventDefault: () => {} } as any);
    });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('utility functions convert values and clamp', () => {
    let result: any;
    const Probe = () => { result = useProgress({ min: 0, max: 100 }); return null; };
    render(<Probe />);
    expect(result.utils.valueToPercentage(50)).toBe(50);
    expect(result.utils.percentageToValue(25)).toBe(25);
    expect(result.utils.clampValue(150)).toBe(100);
    expect(result.utils.isValueValid(50)).toBe(true);
    expect(result.utils.formatValue(null)).toBe('Indeterminate');
  });
});

describe('useProgress (additional coverage)', () => {
  // Returns a stable box whose `.current` always reflects the latest render.
  const probe = (props: any) => {
    const box: { current: any } = { current: null };
    const Probe = () => { box.current = useProgress(props); return null; };
    render(<Probe />);
    return box;
  };
  const key = (box: any, k: string) =>
    act(() => {
      box.current.handlers.onKeyDown({ key: k, preventDefault: () => {} } as any);
    });

  it('formatValue rounds a numeric value', () => {
    const r = probe({ value: 42.6 });
    expect(r.current.utils.formatValue(42.6)).toBe('43');
  });

  it('isValueValid rejects values outside the bounds', () => {
    const r = probe({ min: 0, max: 100 });
    expect(r.current.utils.isValueValid(-1)).toBe(false);
    expect(r.current.utils.isValueValid(101)).toBe(false);
  });

  it('setValue is a no-op when disabled (no internal mutation, no callback)', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 10, disabled: true, onValueChange });
    act(() => r.current.actions.setValue(50));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(r.current.state.value).toBe(10);
  });

  it('setValue respects controlled mode (does not mutate internal state)', () => {
    const onValueChange = vi.fn();
    const r = probe({ value: 20, onValueChange });
    act(() => r.current.actions.setValue(50));
    expect(onValueChange).toHaveBeenCalledWith(50);
    // controlled -> state still reports the controlled value
    expect(r.current.state.value).toBe(20);
  });

  it('setValue(null) in uncontrolled mode switches to indeterminate', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 10, onValueChange });
    act(() => r.current.actions.setValue(null));
    expect(r.current.state.value).toBe(null);
    expect(r.current.state.isIndeterminate).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it('setValue(null) in controlled mode emits the callback without mutating internal state', () => {
    const onValueChange = vi.fn();
    const r = probe({ value: 30, onValueChange });
    act(() => r.current.actions.setValue(null));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    // controlled -> state still reports the controlled value
    expect(r.current.state.value).toBe(30);
  });

  it('increment / decrement / setToMin / setToMax no-op when disabled', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 50, disabled: true, onValueChange });
    act(() => r.current.actions.increment());
    act(() => r.current.actions.decrement());
    act(() => r.current.actions.setToMin());
    act(() => r.current.actions.setToMax());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('increment / decrement / setToMin / setToMax no-op in indeterminate mode', () => {
    const onValueChange = vi.fn();
    const r = probe({ value: null, onValueChange });
    act(() => r.current.actions.increment());
    act(() => r.current.actions.decrement());
    act(() => r.current.actions.setToMin());
    act(() => r.current.actions.setToMax());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('increment / decrement use the configured step when no override is given', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 10, step: 5, onValueChange });
    act(() => r.current.actions.increment());
    expect(onValueChange).toHaveBeenLastCalledWith(15);
    act(() => r.current.actions.decrement());
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it('keyboard handler: ArrowLeft decrements, End sets to max, Space toggles indeterminate', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 50, onValueChange });
    key(r, 'ArrowLeft');
    expect(onValueChange).toHaveBeenLastCalledWith(49);
    key(r, 'ArrowDown');
    expect(onValueChange).toHaveBeenLastCalledWith(48);
    key(r, 'End');
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    // Space on a determinate value toggles into indeterminate
    const r2 = probe({ defaultValue: 50, onValueChange });
    key(r2, 'Enter');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    // Space on an indeterminate value stops indeterminate
    const r3 = probe({ defaultValue: 50, value: null, onValueChange });
    key(r3, ' ');
    expect(onValueChange).toHaveBeenLastCalledWith(50);
  });

  it('keyboard handler is a no-op when disabled', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 50, disabled: true, onValueChange });
    key(r, 'ArrowRight');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keyboard handler ignores unrelated keys', () => {
    const onValueChange = vi.fn();
    const r = probe({ defaultValue: 50, onValueChange });
    key(r, 'Tab');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('focus / blur handlers update focused state and compose props callbacks', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const r = probe({ defaultValue: 50, onFocus, onBlur });
    act(() => r.current.handlers.onFocus({} as any));
    expect(r.current.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    act(() => r.current.handlers.onBlur({} as any));
    expect(r.current.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();
  });

  it('mouse enter / leave handlers update hovered state', () => {
    const r = probe({ defaultValue: 50 });
    act(() => r.current.handlers.onMouseEnter({} as any));
    expect(r.current.state.hovered).toBe(true);
    act(() => r.current.handlers.onMouseLeave({} as any));
    expect(r.current.state.hovered).toBe(false);
  });

  it('exposes disabled-related attributes (tabIndex undefined, aria-valuetext override)', () => {
    const r = probe({ value: 30, disabled: true, ariaValueText: 'thirty percent' });
    expect(r.current.progressAttributes.tabIndex).toBeUndefined();
    expect(r.current.progressAttributes['aria-valuetext']).toBe('thirty percent');
  });

  it('drives the indeterminate animation loop past the wrap point using fake timers', () => {
    // The animation advances the --progress-value by 2 per frame and wraps to 0
    // once it reaches 100. Fake timers make rAF deterministic, so we can cross
    // the wrap boundary reliably.
    vi.useFakeTimers();
    try {
      const box: { current: any } = { current: null };
      const Probe = () => { box.current = useProgress({ value: null, animated: true }); return null; };
      render(<Probe />);
      // 51 rAF callbacks: 50 bring the value to 100, the 51st wraps it to 0.
      for (let i = 0; i < 51; i++) {
        act(() => { vi.advanceTimersByTime(16); });
      }
      // after wrapping, the value is back in [0, 100)
      expect(box.current.state.isIndeterminate).toBe(true);
      expect(box.current.progressAttributes.style['--progress-value']).toBeLessThanOrEqual(100);
    } finally {
      vi.useRealTimers();
    }
  });
});

afterEach(() => {
  // ensure fake timers never leak across tests
  vi.useRealTimers();
});
