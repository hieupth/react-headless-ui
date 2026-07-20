import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useProgress } from '../src/hooks/useProgress';
import { Progress, CircularProgress } from '../src/components/Progress';

describe('useProgress hook', () => {
  it('defaults: determinate, value 0, not complete/indeterminate', () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.state.value).toBe(0);
    expect(result.current.state.mode).toBe('determinate');
    expect(result.current.state.isIndeterminate).toBe(false);
    expect(result.current.state.isComplete).toBe(false);
    expect(result.current.state.disabled).toBe(false);
  });

  it('computes percentage and isComplete correctly', () => {
    const { result } = renderHook(() => useProgress({ value: 50, min: 0, max: 100 }));
    expect(result.current.state.percentage).toBe(50);
    expect(result.current.state.isComplete).toBe(false);
    const { result: r2 } = renderHook(() => useProgress({ value: 100 }));
    expect(r2.current.state.isComplete).toBe(true);
    expect(r2.current.state.percentage).toBe(100);
  });

  it('clamps percentage to [0,100] for out-of-range values', () => {
    const { result } = renderHook(() => useProgress({ value: 200 }));
    expect(result.current.state.percentage).toBe(100);
    const { result: r2 } = renderHook(() => useProgress({ value: -50 }));
    expect(r2.current.state.percentage).toBe(0);
  });

  it('indeterminate mode when value is null', () => {
    const { result } = renderHook(() => useProgress({ value: null }));
    expect(result.current.state.isIndeterminate).toBe(true);
    expect(result.current.state.percentage).toBe(0);
  });

  it('setValue clamps in uncontrolled mode and fires onValueChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useProgress({ onValueChange: onChange }));
    act(() => result.current.actions.setValue(150));
    expect(result.current.state.value).toBe(100);
    expect(onChange).toHaveBeenLastCalledWith(100);
    act(() => result.current.actions.setValue(null));
    expect(result.current.state.value).toBe(null);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('setValue no-op when disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useProgress({ disabled: true, onValueChange: onChange }));
    act(() => result.current.actions.setValue(50));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('increment/decrement respect step and bounds, skip indeterminate', () => {
    const { result } = renderHook(() => useProgress({ defaultValue: 10, step: 5 }));
    act(() => result.current.actions.increment());
    expect(result.current.state.value).toBe(15);
    act(() => result.current.actions.increment(10));
    expect(result.current.state.value).toBe(25);
    act(() => result.current.actions.decrement(20));
    expect(result.current.state.value).toBe(5);
    act(() => result.current.actions.decrement(100)); // clamps to min 0
    expect(result.current.state.value).toBe(0);
  });

  it('increment/decrement no-op for indeterminate and disabled', () => {
    const indet = renderHook(() => useProgress({ value: null }));
    act(() => indet.result.current.actions.increment());
    expect(indet.result.current.state.value).toBeNull();
    const dis = renderHook(() => useProgress({ defaultValue: 10, disabled: true }));
    act(() => dis.result.current.actions.increment());
    expect(dis.result.current.state.value).toBe(10);
  });

  it('setToMin/setToMax/reset', () => {
    const { result } = renderHook(() => useProgress({ defaultValue: 50 }));
    act(() => result.current.actions.setToMax());
    expect(result.current.state.value).toBe(100);
    act(() => result.current.actions.setToMin());
    expect(result.current.state.value).toBe(0);
    act(() => result.current.actions.reset());
    expect(result.current.state.value).toBe(50);
  });

  it('startIndeterminate/stopIndeterminate toggle mode', () => {
    const { result } = renderHook(() => useProgress({ defaultValue: 40 }));
    act(() => result.current.actions.startIndeterminate());
    expect(result.current.state.value).toBeNull();
    expect(result.current.state.isIndeterminate).toBe(true);
    act(() => result.current.actions.stopIndeterminate());
    expect(result.current.state.value).toBe(40);
    expect(result.current.state.isIndeterminate).toBe(false);
  });

  it('keyboard handlers: ArrowRight/Left/Home/End/Space', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useProgress({ defaultValue: 50, onValueChange: onChange })
    );
    const kd = (key: string) =>
      act(() =>
        result.current.handlers.onKeyDown({ key, preventDefault: vi.fn() } as any)
      );
    kd('ArrowRight'); // +1 -> 51
    expect(onChange).toHaveBeenLastCalledWith(51);
    kd('ArrowUp'); // +1 -> 52
    expect(onChange).toHaveBeenLastCalledWith(52);
    kd('ArrowLeft'); // -1 -> 51
    expect(onChange).toHaveBeenLastCalledWith(51);
    kd('ArrowDown'); // -1 -> 50
    expect(onChange).toHaveBeenLastCalledWith(50);
    kd('Home'); // -> min 0
    expect(onChange).toHaveBeenLastCalledWith(0);
    kd('End'); // -> max 100
    expect(onChange).toHaveBeenLastCalledWith(100);
    kd(' '); // toggle indeterminate
    expect(onChange).toHaveBeenLastCalledWith(null);
    kd('Enter'); // back to determinate (defaultValue)
  });

  it('keyboard ignored when disabled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useProgress({ defaultValue: 50, disabled: true, onValueChange: onChange })
    );
    act(() =>
      result.current.handlers.onKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() } as any)
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('utils: valueToPercentage, percentageToValue, isValueValid, clampValue, formatValue', () => {
    const { result } = renderHook(() => useProgress({ min: 0, max: 100 }));
    const u = result.current.utils;
    expect(u.valueToPercentage(50)).toBe(50);
    expect(u.percentageToValue(25)).toBe(25);
    expect(u.isValueValid(50)).toBe(true);
    expect(u.isValueValid(150)).toBe(false);
    expect(u.clampValue(150)).toBe(100);
    expect(u.clampValue(-10)).toBe(0);
    expect(u.formatValue(42)).toBe('42');
    expect(u.formatValue(null)).toBe('Indeterminate');
  });

  it('mouse handlers set hovered state', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.handlers.onMouseEnter({} as any));
    expect(result.current.state.hovered).toBe(true);
    act(() => result.current.handlers.onMouseLeave({} as any));
    expect(result.current.state.hovered).toBe(false);
  });
});

describe('Progress component integration', () => {
  it('renders determinate value with percentage label', () => {
    const { container } = render(<Progress value={70} showPercentage />);
    expect(container.textContent).toMatch(/70%/);
  });

  it('CircularProgress renders percentage', () => {
    const { container } = render(<CircularProgress value={33} />);
    expect(container.textContent).toMatch(/33%/);
  });
});
