import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { useProgress } from '../src/hooks';
import type { UseProgressProps } from '../src/hooks';

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

function keyEvent(key: string): React.KeyboardEvent {
  return {
    key,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as unknown as React.KeyboardEvent;
}

describe('useProgress hook — extended branches', () => {
  beforeEach(() => {
    // requestAnimationFrame is used by the indeterminate animation effect.
    // jsdom provides it; fake timers are not needed for most cases.
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to determinate mode at 0 with horizontal orientation', () => {
    const hook = renderHook(() => useProgress());
    const { state, config, progressAttributes } = hook.result.current;
    expect(state.mode).toBe('determinate');
    expect(state.value).toBe(0);
    expect(state.percentage).toBe(0);
    expect(state.isComplete).toBe(false);
    expect(state.isIndeterminate).toBe(false);
    expect(config.min).toBe(0);
    expect(config.max).toBe(100);
    expect(config.orientation).toBe('horizontal');
    expect(config.step).toBe(1);
    expect(config.reversed).toBe(false);
    expect(config.showLabel).toBe(false);
    expect(progressAttributes['data-mode']).toBe('determinate');
    expect(progressAttributes['aria-valuemin']).toBe(0);
    expect(progressAttributes['aria-valuemax']).toBe(100);
    expect(progressAttributes['aria-valuenow']).toBe(0);
    expect(progressAttributes.tabIndex).toBe(0);
  });

  it('clamps initial value to [min, max] in percentage math', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 150, min: 0, max: 100 }));
    // percentage is clamped via Math.max/min; value itself is not clamped on init.
    expect(hook.result.current.state.percentage).toBe(100);
  });

  it('marks isComplete when value >= max', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 100 }));
    expect(hook.result.current.state.isComplete).toBe(true);
    expect(hook.result.current.formAttributes['data-complete']).toBe(true);
  });

  it('isIndeterminate when value is null', () => {
    const hook = renderHook(() => useProgress({ defaultValue: null }));
    expect(hook.result.current.state.isIndeterminate).toBe(true);
    expect(hook.result.current.state.mode).toBe('indeterminate');
    expect(hook.result.current.state.percentage).toBe(0);
    expect(hook.result.current.progressAttributes['aria-valuenow']).toBeUndefined();
    expect(hook.result.current.progressAttributes['data-mode']).toBe('indeterminate');
  });

  it('propMode overrides value-derived mode', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 50, mode: 'indeterminate' }));
    expect(hook.result.current.state.isIndeterminate).toBe(true);
    expect(hook.result.current.state.mode).toBe('indeterminate');
  });

  it('setValue clamps and fires onValueChange (uncontrolled)', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() => useProgress({ onValueChange }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(250));
    expect(hook.result.current.state.value).toBe(100);
    expect(onValueChange).toHaveBeenCalledWith(100);
    actAndRerender(hook, () => hook.result.current.actions.setValue(-10));
    expect(hook.result.current.state.value).toBe(0);
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it('setValue(null) switches to indeterminate and fires onValueChange(null)', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() => useProgress({ onValueChange }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(null));
    expect(hook.result.current.state.value).toBeNull();
    expect(hook.result.current.state.isIndeterminate).toBe(true);
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('controlled value: setValue does not mutate internal state', () => {
    const hook = renderHook(() => useProgress({ value: 30 }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(80));
    expect(hook.result.current.state.value).toBe(30); // still controlled
  });

  it('disabled setValue is a no-op', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() => useProgress({ disabled: true, onValueChange }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(50));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(hook.result.current.state.value).toBe(0);
    expect(hook.result.current.progressAttributes.tabIndex).toBeUndefined();
  });

  it('reset() restores the defaultValue', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 25 }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(80));
    actAndRerender(hook, () => hook.result.current.actions.reset());
    expect(hook.result.current.state.value).toBe(25);
  });

  it('startIndeterminate / stopIndeterminate toggle modes', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 40 }));
    actAndRerender(hook, () => hook.result.current.actions.startIndeterminate());
    expect(hook.result.current.state.isIndeterminate).toBe(true);
    expect(hook.result.current.state.value).toBeNull();
    actAndRerender(hook, () => hook.result.current.actions.stopIndeterminate());
    expect(hook.result.current.state.isIndeterminate).toBe(false);
    expect(hook.result.current.state.value).toBe(40); // back to defaultValue
  });

  it('increment / decrement respect step and clamp', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 40, step: 5 }));
    actAndRerender(hook, () => hook.result.current.actions.increment());
    expect(hook.result.current.state.value).toBe(45);
    actAndRerender(hook, () => hook.result.current.actions.increment(10));
    expect(hook.result.current.state.value).toBe(55);
    actAndRerender(hook, () => hook.result.current.actions.decrement());
    expect(hook.result.current.state.value).toBe(50);
    actAndRerender(hook, () => hook.result.current.actions.decrement(100));
    expect(hook.result.current.state.value).toBe(0); // clamped
    // increment beyond max clamps to max
    actAndRerender(hook, () => hook.result.current.actions.increment(500));
    expect(hook.result.current.state.value).toBe(100);
  });

  it('increment / decrement are no-ops when indeterminate or disabled', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() => useProgress({ defaultValue: null, onValueChange }));
    actAndRerender(hook, () => hook.result.current.actions.increment());
    expect(onValueChange).not.toHaveBeenCalled();
    const hook2 = renderHook(() => useProgress({ defaultValue: 10, disabled: true, onValueChange }));
    actAndRerender(hook2, () => hook2.result.current.actions.increment());
    actAndRerender(hook2, () => hook2.result.current.actions.decrement());
    actAndRerender(hook2, () => hook2.result.current.actions.setToMin());
    actAndRerender(hook2, () => hook2.result.current.actions.setToMax());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('setToMin / setToMax move value to bounds', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 40, min: 10, max: 90 }));
    actAndRerender(hook, () => hook.result.current.actions.setToMin());
    expect(hook.result.current.state.value).toBe(10);
    actAndRerender(hook, () => hook.result.current.actions.setToMax());
    expect(hook.result.current.state.value).toBe(90);
  });

  it('utils: valueToPercentage, percentageToValue, isValueValid, clampValue, formatValue', () => {
    const hook = renderHook(() => useProgress({ min: 0, max: 100 }));
    const { utils } = hook.result.current;
    expect(utils.valueToPercentage(50)).toBe(50);
    expect(utils.percentageToValue(50)).toBe(50);
    expect(utils.isValueValid(50)).toBe(true);
    expect(utils.isValueValid(150)).toBe(false);
    expect(utils.isValueValid(-5)).toBe(false);
    expect(utils.clampValue(150)).toBe(100);
    expect(utils.clampValue(-5)).toBe(0);
    expect(utils.formatValue(42.6)).toBe('43');
    expect(utils.formatValue(null)).toBe('Indeterminate');
  });

  it('handlers.onKeyDown drives Arrow/Home/End/Space/Enter', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 40, step: 10 }));
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('ArrowRight')));
    expect(hook.result.current.state.value).toBe(50);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('ArrowUp')));
    expect(hook.result.current.state.value).toBe(60);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('ArrowLeft')));
    expect(hook.result.current.state.value).toBe(50);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('ArrowDown')));
    expect(hook.result.current.state.value).toBe(40);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('Home')));
    expect(hook.result.current.state.value).toBe(0);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('End')));
    expect(hook.result.current.state.value).toBe(100);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent(' ')));
    // determinate + Space => startIndeterminate
    expect(hook.result.current.state.isIndeterminate).toBe(true);
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('Enter')));
    // indeterminate + Enter => stopIndeterminate (back to default)
    expect(hook.result.current.state.isIndeterminate).toBe(false);
  });

  it('handlers.onKeyDown is a no-op when disabled', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 10, disabled: true }));
    actAndRerender(hook, () => hook.result.current.handlers.onKeyDown(keyEvent('ArrowRight')));
    expect(hook.result.current.state.value).toBe(10);
  });

  it('handlers.onFocus / onBlur / onMouseEnter / onMouseLeave flip focus/hover state', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const hook = renderHook(() => useProgress({ onFocus, onBlur }));
    const focusEvent = {} as React.FocusEvent;
    const mouseEvent = {} as React.MouseEvent;
    actAndRerender(hook, () => hook.result.current.handlers.onFocus(focusEvent));
    expect(hook.result.current.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    actAndRerender(hook, () => hook.result.current.handlers.onMouseEnter(mouseEvent));
    expect(hook.result.current.state.hovered).toBe(true);
    actAndRerender(hook, () => hook.result.current.handlers.onMouseLeave(mouseEvent));
    expect(hook.result.current.state.hovered).toBe(false);
    actAndRerender(hook, () => hook.result.current.handlers.onBlur(focusEvent));
    expect(hook.result.current.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();
  });

  it('progressAttributes carry orientation, reversed, animated, complete data attrs', () => {
    const hook = renderHook(() =>
      useProgress({ orientation: 'vertical', reversed: true, animated: false, defaultValue: 100 })
    );
    const attrs = hook.result.current.progressAttributes;
    expect(attrs['data-orientation']).toBe('vertical');
    expect(attrs['data-reversed']).toBe(true);
    expect(attrs['data-animated']).toBe(false);
    expect(attrs['data-complete']).toBe(true);
    expect((attrs.style as any)['--progress-value']).toBe(100); // determinate => percentage
  });

  it('indeterminate animated path schedules a rAF and exposes style vars', () => {
    // Observe that the indeterminate animation effect schedules at least one
    // rAF and that the style vars are populated. Use a counting rAF stub.
    const origRAF = globalThis.requestAnimationFrame;
    const origCAF = globalThis.cancelAnimationFrame;
    let scheduled = 0;
    globalThis.requestAnimationFrame = (() => {
      scheduled += 1;
      return scheduled;
    }) as any;
    globalThis.cancelAnimationFrame = (() => {}) as any;
    try {
      const hook = renderHook(() => useProgress({ defaultValue: null, animated: true }));
      expect(scheduled).toBeGreaterThan(0);
      const attrs = hook.result.current.progressAttributes;
      expect((attrs.style as any)['--progress-min']).toBe(0);
      expect((attrs.style as any)['--progress-max']).toBe(100);
      hook.unmount();
    } finally {
      globalThis.requestAnimationFrame = origRAF;
      globalThis.cancelAnimationFrame = origCAF;
    }
  });

  it('indeterminate animation is skipped when disabled or animated=false', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    rafSpy.mockImplementation(() => 0);
    const cafSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    cafSpy.mockImplementation(() => {});
    const hook = renderHook(() => useProgress({ defaultValue: null, animated: false }));
    // animated=false => no rAF scheduled.
    expect(rafSpy).not.toHaveBeenCalled();
    hook.unmount();
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  it('custom ariaLabel / ariaValueText are forwarded into attributes', () => {
    const hook = renderHook(() =>
      useProgress({ defaultValue: 50, min: 0, max: 100, ariaLabel: 'Upload progress', ariaValueText: 'half' })
    );
    const attrs = hook.result.current.progressAttributes;
    expect(attrs['aria-label']).toBe('Upload progress');
    expect(attrs['aria-valuetext']).toBe('half');
  });

  it('custom min/max produce correct percentage and clamping', () => {
    const hook = renderHook(() => useProgress({ defaultValue: 25, min: 0, max: 50 }));
    expect(hook.result.current.state.percentage).toBe(50);
    actAndRerender(hook, () => hook.result.current.actions.setValue(60));
    expect(hook.result.current.state.value).toBe(50); // clamped to max
  });
});
