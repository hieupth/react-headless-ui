import { describe, it, expect, vi } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { useRadioGroup } from '../src/hooks';
import type { UseRadioGroupProps } from '../src/hooks';

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

// The keyboard handler is bound directly to the radio group DOM element via
// addEventListener, so we need a real rendered element with the hook's
// radioGroupRef attached (the hook reads radioGroupElementRef.current).
function renderGroup(props: UseRadioGroupProps) {
  const api: any = {};
  const groupRef = { current: null as HTMLElement | null };
  function Harness() {
    const result = useRadioGroup({ radioGroupRef: groupRef, ...props });
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    api.getOptionAttributes = result.getOptionAttributes;
    api.returns = result;
    return (
      <div ref={groupRef as any} data-testid="rg" tabIndex={0}>
        {props.options.map((opt) => (
          <div key={opt} data-value={opt}>
            {opt}
          </div>
        ))}
      </div>
    );
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

function keyDown(el: HTMLElement, key: string) {
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
}

describe('useRadioGroup hook — extended branches', () => {
  it('defaults: vertical orientation, no selection, options passed through', () => {
    const hook = renderHook(() => useRadioGroup({ options: ['a', 'b', 'c'] }));
    const { state, attributes } = hook.result.current;
    expect(state.value).toBeUndefined();
    expect(state.disabled).toBe(false);
    expect(state.orientation).toBe('vertical');
    expect(state.options).toEqual(['a', 'b', 'c']);
    expect(state.focusedOption).toBeUndefined();
    expect(attributes.role).toBe('radiogroup');
    expect(attributes['aria-orientation']).toBe('vertical');
    expect(attributes['aria-disabled']).toBeUndefined();
  });

  it('disabled state sets aria-disabled and blocks selection', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() =>
      useRadioGroup({ options: ['a', 'b'], disabled: true, onValueChange })
    );
    expect(hook.result.current.attributes['aria-disabled']).toBe('true');
    actAndRerender(hook, () => hook.result.current.actions.selectOption('a'));
    expect(hook.result.current.state.value).toBeUndefined();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('selectOption fires callbacks and updates value (uncontrolled)', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() =>
      useRadioGroup({ options: ['a', 'b', 'c'], onValueChange })
    );
    actAndRerender(hook, () => hook.result.current.actions.selectOption('b'));
    expect(hook.result.current.state.value).toBe('b');
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('selectOption ignores unknown values', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() =>
      useRadioGroup({ options: ['a', 'b'], onValueChange })
    );
    actAndRerender(hook, () => hook.result.current.actions.selectOption('zzz'));
    expect(hook.result.current.state.value).toBeUndefined();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('controlled value: selectOption does not mutate internal state but fires callbacks', () => {
    const onValueChange = vi.fn();
    const hook = renderHook(() =>
      useRadioGroup({ options: ['a', 'b'], value: 'a', onValueChange })
    );
    actAndRerender(hook, () => hook.result.current.actions.selectOption('b'));
    expect(hook.result.current.state.value).toBe('a'); // controlled unchanged
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('controlled value syncs internal state via effect', () => {
    const hook = renderHook(({ value }) => useRadioGroup({ options: ['a', 'b'], value }), {
      initialProps: { value: 'a' as string | undefined },
    });
    expect(hook.result.current.state.value).toBe('a');
    hook.rerender({ value: 'b' });
    expect(hook.result.current.state.value).toBe('b');
  });

  it('focusOption sets focusedOption; blocked when disabled or unknown', () => {
    const hook = renderHook(() => useRadioGroup({ options: ['a', 'b', 'c'] }));
    actAndRerender(hook, () => hook.result.current.actions.focusOption('b'));
    expect(hook.result.current.state.focusedOption).toBe('b');
    actAndRerender(hook, () => hook.result.current.actions.focusOption('zzz'));
    expect(hook.result.current.state.focusedOption).toBe('b'); // unchanged
    const disabled = renderHook(() => useRadioGroup({ options: ['a'], disabled: true }));
    actAndRerender(disabled, () => disabled.result.current.actions.focusOption('a'));
    expect(disabled.result.current.state.focusedOption).toBeUndefined();
  });

  it('navigateNext / navigatePrevious wrap by default and clamp when wrapNavigation=false', () => {
    const hook = renderHook(() => useRadioGroup({ options: ['a', 'b', 'c'] }));
    // No focus yet -> navigateNext starts at index 0.
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.focusedOption).toBe('a');
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.focusedOption).toBe('b');
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.focusedOption).toBe('c');
    // Wrap to start.
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.focusedOption).toBe('a');
    // Previous wraps back to end.
    actAndRerender(hook, () => hook.result.current.actions.navigatePrevious());
    expect(hook.result.current.state.focusedOption).toBe('c');

    // No-wrap variant.
    const noWrap = renderHook(() =>
      useRadioGroup({ options: ['a', 'b', 'c'], wrapNavigation: false })
    );
    actAndRerender(noWrap, () => noWrap.result.current.actions.navigateNext());
    actAndRerender(noWrap, () => noWrap.result.current.actions.navigateNext());
    actAndRerender(noWrap, () => noWrap.result.current.actions.navigateNext());
    expect(noWrap.result.current.state.focusedOption).toBe('c');
    actAndRerender(noWrap, () => noWrap.result.current.actions.navigateNext());
    expect(noWrap.result.current.state.focusedOption).toBe('c'); // clamped, no wrap
    // Previous from initial state clamps to 0 (no wrap) — currentIndex starts at options.length (3) -> prevIndex 2.
    const noWrap2 = renderHook(() =>
      useRadioGroup({ options: ['a', 'b', 'c'], wrapNavigation: false })
    );
    actAndRerender(noWrap2, () => noWrap2.result.current.actions.navigatePrevious());
    expect(noWrap2.result.current.state.focusedOption).toBe('c');
    actAndRerender(noWrap2, () => noWrap2.result.current.actions.navigatePrevious());
    expect(noWrap2.result.current.state.focusedOption).toBe('b');
  });

  it('navigation is a no-op with empty options or disabled', () => {
    const empty = renderHook(() => useRadioGroup({ options: [] }));
    actAndRerender(empty, () => empty.result.current.actions.navigateNext());
    actAndRerender(empty, () => empty.result.current.actions.navigatePrevious());
    expect(empty.result.current.state.focusedOption).toBeUndefined();
    const disabled = renderHook(() =>
      useRadioGroup({ options: ['a', 'b'], disabled: true })
    );
    actAndRerender(disabled, () => disabled.result.current.actions.navigateNext());
    expect(disabled.result.current.state.focusedOption).toBeUndefined();
  });

  it('navigatePrevious with wrapNavigation=false clamps to index 0 when already at start', () => {
    // Focus index 0, then navigatePrevious without wrap -> prevIndex -1 -> clamps to 0.
    const hook = renderHook(() =>
      useRadioGroup({ options: ['a', 'b', 'c'], wrapNavigation: false })
    );
    actAndRerender(hook, () => hook.result.current.actions.focusOption('a'));
    actAndRerender(hook, () => hook.result.current.actions.navigatePrevious());
    expect(hook.result.current.state.focusedOption).toBe('a'); // clamped at first
  });

  it('getOptionIndex / isOptionSelected / isOptionFocused helpers', () => {
    const hook = renderHook(() => useRadioGroup({ options: ['a', 'b', 'c'], defaultValue: 'b' }));
    const { actions, state } = hook.result.current;
    expect(actions.getOptionIndex('b')).toBe(1);
    expect(actions.getOptionIndex('zzz')).toBe(-1);
    expect(actions.isOptionSelected('b')).toBe(true);
    expect(actions.isOptionSelected('a')).toBe(false);
    actAndRerender(hook, () => actions.focusOption('c'));
    expect(hook.result.current.actions.isOptionFocused('c')).toBe(true);
    expect(hook.result.current.actions.isOptionFocused('a')).toBe(false);
  });

  it('getOptionAttributes returns radio role with correct aria + tabIndex', () => {
    const hook = renderHook(() => useRadioGroup({ options: ['a', 'b'], defaultValue: 'a' }));
    actAndRerender(hook, () => hook.result.current.actions.focusOption('a'));
    const attrsFocused = hook.result.current.getOptionAttributes('a');
    expect(attrsFocused.role).toBe('radio');
    expect(attrsFocused['aria-checked']).toBe(true);
    expect(attrsFocused['aria-disabled']).toBe(false);
    expect(attrsFocused.tabIndex).toBe(0); // focused
    expect(attrsFocused['data-value']).toBe('a');
    expect(attrsFocused['data-index']).toBe(0);
    const attrsOther = hook.result.current.getOptionAttributes('b');
    expect(attrsOther['aria-checked']).toBe(false);
    expect(attrsOther.tabIndex).toBe(-1); // not focused
  });

  it('horizontal orientation: ArrowRight/ArrowDown navigate; ArrowLeft/ArrowUp go back', () => {
    const { api, getByTestId } = renderGroup({
      options: ['a', 'b', 'c'],
      orientation: 'horizontal',
    });
    const el = getByTestId('rg') as HTMLElement;
    // Focus first via Home.
    keyDown(el, 'Home');
    expect(api.state.focusedOption).toBe('a');
    // ArrowRight navigates forward in horizontal.
    keyDown(el, 'ArrowRight');
    expect(api.state.focusedOption).toBe('b');
    // ArrowDown is ignored in horizontal.
    keyDown(el, 'ArrowDown');
    expect(api.state.focusedOption).toBe('b');
    // ArrowLeft navigates backward.
    keyDown(el, 'ArrowLeft');
    expect(api.state.focusedOption).toBe('a');
    // ArrowUp is ignored in horizontal.
    keyDown(el, 'ArrowUp');
    expect(api.state.focusedOption).toBe('a');
  });

  it('vertical orientation: ArrowDown/ArrowUp navigate; ArrowLeft/ArrowRight ignored', () => {
    const { api, getByTestId } = renderGroup({
      options: ['a', 'b', 'c'],
      orientation: 'vertical',
    });
    const el = getByTestId('rg') as HTMLElement;
    keyDown(el, 'Home');
    expect(api.state.focusedOption).toBe('a');
    keyDown(el, 'ArrowDown');
    expect(api.state.focusedOption).toBe('b');
    keyDown(el, 'ArrowRight'); // ignored in vertical
    expect(api.state.focusedOption).toBe('b');
    keyDown(el, 'ArrowUp');
    expect(api.state.focusedOption).toBe('a');
    keyDown(el, 'ArrowLeft'); // ignored in vertical
    expect(api.state.focusedOption).toBe('a');
  });

  it('Space/Enter select the focused option; End jumps to last', () => {
    const onValueChange = vi.fn();
    const { api, getByTestId } = renderGroup({
      options: ['a', 'b', 'c'],
      onValueChange,
    });
    const el = getByTestId('rg') as HTMLElement;
    keyDown(el, 'Home');
    expect(api.state.focusedOption).toBe('a');
    keyDown(el, 'ArrowDown'); // vertical default: ArrowDown advances to next
    expect(api.state.focusedOption).toBe('b');
    keyDown(el, ' ');
    expect(api.state.value).toBe('b');
    expect(onValueChange).toHaveBeenCalledWith('b');
    keyDown(el, 'Enter');
    expect(api.state.value).toBe('b');
    keyDown(el, 'End');
    expect(api.state.focusedOption).toBe('c');
    // Space/Enter with no focused option is a no-op selection-wise.
    const empty = renderGroup({ options: ['x', 'y'] });
    // Scope to this render's container to avoid matching the prior group.
    const e2 = empty.container.querySelector('[data-testid="rg"]') as HTMLElement;
    keyDown(e2, ' ');
    expect(empty.api.state.value).toBeUndefined();
  });

  it('keyboard handler does nothing when disabled', () => {
    const { api, getByTestId } = renderGroup({
      options: ['a', 'b'],
      disabled: true,
    });
    const el = getByTestId('rg') as HTMLElement;
    keyDown(el, 'Home');
    keyDown(el, 'ArrowDown');
    expect(api.state.focusedOption).toBeUndefined();
  });

  it('Home/End are no-ops on an empty options group', () => {
    const { api, getByTestId } = renderGroup({ options: [] });
    const el = getByTestId('rg') as HTMLElement;
    keyDown(el, 'Home');
    keyDown(el, 'End');
    expect(api.state.focusedOption).toBeUndefined();
  });

  it('horizontal orientation attribute reflects in attributes', () => {
    const hook = renderHook(() => useRadioGroup({ options: ['a'], orientation: 'horizontal' }));
    expect(hook.result.current.attributes['aria-orientation']).toBe('horizontal');
  });
});
