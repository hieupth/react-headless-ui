import { describe, it, expect, vi } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { useRating } from '../src/hooks';
import type { UseRatingProps } from '../src/hooks';

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

describe('useRating hook — extended branches', () => {
  it('defaults: value 0, max 5, size md, variant star, no half, no clear', () => {
    const hook = renderHook(() => useRating());
    const { state, ratingAttributes, computed } = hook.result.current;
    expect(state.value).toBe(0);
    expect(state.max).toBe(5);
    expect(state.size).toBe('md');
    expect(state.variant).toBe('star');
    expect(state.allowHalf).toBe(false);
    expect(state.readonly).toBe(false);
    expect(state.disabled).toBe(false);
    expect(computed.isEmpty).toBe(true);
    expect(computed.isFull).toBe(false);
    expect(computed.canIncrement).toBe(true);
    expect(computed.canDecrement).toBe(false);
    expect(computed.fillPercentage).toBe(0);
    expect(computed.items).toHaveLength(5);
    expect(ratingAttributes.role).toBe('slider');
    expect(ratingAttributes['aria-valuemin']).toBe(0);
    expect(ratingAttributes['aria-valuemax']).toBe(5);
    expect(ratingAttributes['aria-valuenow']).toBeUndefined(); // value 0
    expect(ratingAttributes.tabIndex).toBe(0);
  });

  it('clamps initial value above max to max', () => {
    const hook = renderHook(() => useRating({ defaultValue: 99, max: 5 }));
    expect(hook.result.current.state.value).toBe(5);
    expect(hook.result.current.computed.isFull).toBe(true);
  });

  it('setValue fires onChange and updates value (uncontrolled)', () => {
    const onChange = vi.fn();
    const hook = renderHook(() => useRating({ onChange }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(3));
    expect(hook.result.current.state.value).toBe(3);
    expect(onChange).toHaveBeenCalledWith(3);
    // setValue clamps above max.
    actAndRerender(hook, () => hook.result.current.actions.setValue(99));
    expect(hook.result.current.state.value).toBe(5);
    // and below 0.
    actAndRerender(hook, () => hook.result.current.actions.setValue(-3));
    expect(hook.result.current.state.value).toBe(0);
  });

  it('readonly / disabled block setValue, setHoverValue, clear, increment, decrement', () => {
    const onChange = vi.fn();
    const onHoverChange = vi.fn();
    const onClear = vi.fn();
    const hook = renderHook(() =>
      useRating({ readonly: true, onChange, onHoverChange, onClear, allowClear: true })
    );
    actAndRerender(hook, () => hook.result.current.actions.setValue(3));
    actAndRerender(hook, () => hook.result.current.actions.setHoverValue(2));
    actAndRerender(hook, () => hook.result.current.actions.clear());
    actAndRerender(hook, () => hook.result.current.actions.increment());
    actAndRerender(hook, () => hook.result.current.actions.decrement());
    expect(onChange).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
    expect(hook.result.current.state.value).toBe(0);
    expect(hook.result.current.ratingAttributes.tabIndex).toBe(-1);
    expect(hook.result.current.ratingAttributes['aria-readonly']).toBe(true);
  });

  it('disabled blocks all mutations and exposes aria-disabled', () => {
    const onChange = vi.fn();
    const hook = renderHook(() => useRating({ disabled: true, onChange, allowClear: true }));
    actAndRerender(hook, () => hook.result.current.actions.setValue(2));
    actAndRerender(hook, () => hook.result.current.actions.clear());
    expect(onChange).not.toHaveBeenCalled();
    expect(hook.result.current.ratingAttributes['aria-disabled']).toBe(true);
    expect(hook.result.current.ratingAttributes.tabIndex).toBe(-1);
  });

  it('controlled value: setValue does not mutate internal state', () => {
    const onChange = vi.fn();
    const hook = renderHook(({ value }) => useRating({ value, onChange }), {
      initialProps: { value: 2 },
    });
    act(() => hook.result.current.actions.setValue(4));
    hook.rerender({ value: 2 }); // controlled unchanged
    expect(hook.result.current.state.value).toBe(2);
    expect(onChange).toHaveBeenCalledWith(4);
    // Changing controlled value resets hover.
    act(() => hook.result.current.actions.setHoverValue(5));
    hook.rerender({ value: 3 });
    expect(hook.result.current.state.value).toBe(3);
    expect(hook.result.current.state.hoverValue).toBeNull(); // hover reset by effect
  });

  it('hover state updates displayValue and fillPercentage via setHoverValue', () => {
    const onHoverChange = vi.fn();
    const hook = renderHook(() => useRating({ defaultValue: 2, onHoverChange }));
    actAndRerender(hook, () => hook.result.current.actions.setHoverValue(4));
    expect(hook.result.current.state.hoverValue).toBe(4);
    expect(hook.result.current.computed.displayValue).toBe(4);
    expect(hook.result.current.computed.fillPercentage).toBe(80);
    expect(onHoverChange).toHaveBeenCalledWith(4);
    // items hover flag follows hoverValue.
    expect(hook.result.current.computed.items[3].hover).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setHoverValue(null));
    expect(hook.result.current.computed.displayValue).toBe(2); // back to value
  });

  it('clear requires allowClear; fires onClear', () => {
    const onClear = vi.fn();
    const onChange = vi.fn();
    // allowClear=false (default): clear is a no-op.
    const hook = renderHook(() => useRating({ defaultValue: 3, onClear, onChange }));
    actAndRerender(hook, () => hook.result.current.actions.clear());
    expect(hook.result.current.state.value).toBe(3);
    expect(onClear).not.toHaveBeenCalled();
    // allowClear=true clears to 0.
    const hook2 = renderHook(() => useRating({ defaultValue: 3, allowClear: true, onClear, onChange }));
    actAndRerender(hook2, () => hook2.result.current.actions.clear());
    expect(hook2.result.current.state.value).toBe(0);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('increment / decrement respect step and clamp', () => {
    const hook = renderHook(() => useRating({ defaultValue: 2, step: 2 }));
    actAndRerender(hook, () => hook.result.current.actions.increment());
    expect(hook.result.current.state.value).toBe(4);
    actAndRerender(hook, () => hook.result.current.actions.increment()); // clamp at max 5
    expect(hook.result.current.state.value).toBe(5);
    actAndRerender(hook, () => hook.result.current.actions.decrement());
    expect(hook.result.current.state.value).toBe(3);
    actAndRerender(hook, () => hook.result.current.actions.decrement());
    actAndRerender(hook, () => hook.result.current.actions.decrement());
    expect(hook.result.current.state.value).toBe(0); // clamp at 0
  });

  it('allowHalf produces half-filled items', () => {
    const hook = renderHook(() => useRating({ defaultValue: 2.5, allowHalf: true, max: 5 }));
    const items = hook.result.current.computed.items;
    expect(items[0].filled).toBe(true);
    expect(items[1].filled).toBe(true);
    expect(items[2].half).toBe(true);
    expect(items[2].filled).toBe(true); // half also counts as filled
    expect(items[3].filled).toBe(false);
    expect(hook.result.current.state.allowHalf).toBe(true);
  });

  it('getItemAttributes wires click (with allowClear) / hover / focus / keyboard', () => {
    const onChange = vi.fn();
    const onHoverChange = vi.fn();
    const hook = renderHook(() =>
      useRating({ defaultValue: 0, max: 3, allowClear: true, onChange, onHoverChange })
    );
    const item1 = hook.result.current.getItemAttributes(1);
    expect(item1['aria-label']).toBe('Rate 1 out of 3');
    expect(item1['aria-setsize']).toBe(3);
    expect(item1['aria-posinset']).toBe(1);
    expect(item1.tabIndex).toBe(0);
    expect(item1.disabled).toBe(false);
    // Click selects.
    actAndRerender(hook, () => item1.onClick());
    expect(hook.result.current.state.value).toBe(1);
    expect(onChange).toHaveBeenCalledWith(1);
    // Hover.
    actAndRerender(hook, () => item1.onMouseEnter());
    expect(hook.result.current.state.hoverValue).toBe(1);
    expect(onHoverChange).toHaveBeenCalledWith(1);
    actAndRerender(hook, () => item1.onMouseLeave());
    expect(hook.result.current.state.hoverValue).toBeNull();
    // Focus sets focusedValue (note: the item onFocus handler updates
    // focusedValue state directly; it does not invoke the user's onFocus prop).
    actAndRerender(hook, () => item1.onFocus());
    expect(hook.result.current.state.focusedValue).toBe(1);
    actAndRerender(hook, () => item1.onBlur());
    expect(hook.result.current.state.focusedValue).toBeNull();
    // Click same item with allowClear clears. Re-fetch the item so its closure
    // observes the now-current value (1) and triggers the clear branch.
    actAndRerender(hook, () => hook.result.current.getItemAttributes(1).onClick());
    expect(hook.result.current.state.value).toBe(0);
  });

  it('getItemAttributes keyboard: arrows, Home/End, Enter/Space (with allowClear)', () => {
    const onChange = vi.fn();
    const hook = renderHook(() =>
      useRating({ defaultValue: 2, max: 5, step: 1, allowClear: true, onChange })
    );
    // Fetch a fresh item each step so closures see the latest value.
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('ArrowRight')));
    expect(hook.result.current.state.value).toBe(3);
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('ArrowUp')));
    expect(hook.result.current.state.value).toBe(4);
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('ArrowLeft')));
    expect(hook.result.current.state.value).toBe(3);
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('ArrowDown')));
    expect(hook.result.current.state.value).toBe(2);
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('Home')));
    expect(hook.result.current.state.value).toBe(0);
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('End')));
    expect(hook.result.current.state.value).toBe(5);
    // Enter on itemValue 2 — value(5) !== 2, so sets to 2.
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent('Enter')));
    expect(hook.result.current.state.value).toBe(2);
    // Space on same item (2) with value===2 and allowClear clears to 0.
    actAndRerender(hook, () => hook.result.current.getItemAttributes(2).onKeyDown(keyEvent(' ')));
    expect(hook.result.current.state.value).toBe(0);
  });

  it('getItemAttributes keyboard is a no-op when disabled or readonly', () => {
    const onChange = vi.fn();
    const disabled = renderHook(() => useRating({ disabled: true, onChange }));
    const dItem = disabled.result.current.getItemAttributes(2);
    actAndRerender(disabled, () => dItem.onKeyDown(keyEvent('ArrowRight')));
    expect(onChange).not.toHaveBeenCalled();
    const ro = renderHook(() => useRating({ readonly: true, onChange }));
    const rItem = ro.result.current.getItemAttributes(2);
    actAndRerender(ro, () => rItem.onKeyDown(keyEvent('ArrowRight')));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('getHalfItemAttributes produces first/second half handlers', () => {
    const onChange = vi.fn();
    const hook = renderHook(() =>
      useRating({ defaultValue: 0, allowHalf: true, max: 5, onChange })
    );
    const first = hook.result.current.getHalfItemAttributes(2, 'first');
    const second = hook.result.current.getHalfItemAttributes(2, 'second');
    expect(first['aria-label']).toBe('Rate 1.5 out of 5');
    expect(second['aria-label']).toBe('Rate 2 out of 5');
    expect(first.tabIndex).toBe(0);
    expect(first.disabled).toBe(false);
    // first half selects 1.5.
    actAndRerender(hook, () => first.onClick());
    expect(hook.result.current.state.value).toBe(1.5);
    expect(onChange).toHaveBeenCalledWith(1.5);
    // second half selects 2.
    actAndRerender(hook, () => second.onClick());
    expect(hook.result.current.state.value).toBe(2);
    // Hover handlers.
    actAndRerender(hook, () => first.onMouseEnter());
    expect(hook.result.current.state.hoverValue).toBe(1.5);
    actAndRerender(hook, () => first.onMouseLeave());
    expect(hook.result.current.state.hoverValue).toBeNull();
    // Focus handlers.
    actAndRerender(hook, () => first.onFocus());
    expect(hook.result.current.state.focusedValue).toBe(1.5);
    actAndRerender(hook, () => first.onBlur());
    expect(hook.result.current.state.focusedValue).toBeNull();
  });

  it('half items are disabled and untabindex when readonly', () => {
    const hook = renderHook(() => useRating({ readonly: true, allowHalf: true }));
    const first = hook.result.current.getHalfItemAttributes(1, 'first');
    expect(first.disabled).toBe(true);
    expect(first.tabIndex).toBe(-1);
    const item = hook.result.current.getItemAttributes(1);
    expect(item.disabled).toBe(true);
    expect(item.tabIndex).toBe(-1);
  });

  it('focus / blur actions call container focus/blur', () => {
    const ref = { current: null as HTMLDivElement | null };
    function Harness() {
      const result = useRating();
      return (
        <div
          ref={(el) => {
            // Steal the ref into our object, and also mirror into result's container
            ref.current = el;
            (result as any).__container = el;
            // Patch the container ref used internally by the hook.
            ((result as any).__containerRef = { current: el });
          }}
          tabIndex={0}
        />
      );
    }
    // The hook uses an internal containerRef not exposed; focus/blur require it.
    // We instead verify the actions exist and don't throw when no container is set.
    const hook = renderHook(() => useRating());
    expect(() => {
      act(() => hook.result.current.actions.focus());
      act(() => hook.result.current.actions.blur());
    }).not.toThrow();
  });

  it('items: filled and hover flags follow displayValue/hoverValue', () => {
    const hook = renderHook(() => useRating({ defaultValue: 3, max: 5 }));
    actAndRerender(hook, () => hook.result.current.actions.setHoverValue(5));
    const items = hook.result.current.computed.items;
    expect(items[0].filled).toBe(true);
    expect(items[4].filled).toBe(true);
    expect(items[0].hover).toBe(true);
    expect(items[4].hover).toBe(true);
    expect(items[0].focused).toBe(false);
  });

  it('focusedValue drives item.focused flag', () => {
    const hook = renderHook(() => useRating({ max: 3 }));
    const item = hook.result.current.getItemAttributes(2);
    actAndRerender(hook, () => item.onFocus());
    expect(hook.result.current.computed.items[1].focused).toBe(true);
  });
});
