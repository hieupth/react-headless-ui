import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useItem } from '../src/hooks';
import type { UseItemProps } from '../src/hooks';

// Headless-hook harness following the useportal.hook.test.tsx canonical pattern.
function setup(props: UseItemProps, withElement = true) {
  const api = { state: null as any, actions: null as any, attributes: null as any, classes: null as any };
  const refObj = { current: null as HTMLElement | null };
  function Harness() {
    const result = useItem({ itemRef: refObj as any, ...props });
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    api.classes = result.classes;
    return withElement ? (
      <div>
        <span ref={(el) => { refObj.current = el; }} tabIndex={0} data-testid="item-el" />
      </div>
    ) : null;
  }
  render(<Harness />);
  return api;
}

describe('useItem hook', () => {
  it('exposes default state and classes', () => {
    const api = setup({});
    expect(api.state.selected).toBe(false);
    expect(api.state.hovered).toBe(false);
    expect(api.state.pressed).toBe(false);
    expect(api.state.focused).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.value).toBe('');
    expect(api.state.label).toBe('');
    expect(api.state.description).toBeUndefined();
    expect(api.state.hasSubItems).toBe(false);
    expect(api.state.level).toBe(1);
    expect(api.state.highlighted).toBe(false);
    expect(api.state.active).toBe(false);
    expect(api.state.interactive).toBe(true);
    expect(api.classes.base).toBe('item');
  });

  it('reflects configured defaults', () => {
    const api = setup({
      defaultSelected: true,
      defaultValue: 'v1',
      defaultLabel: 'Hello',
      defaultDescription: 'World',
      level: 3,
      hasSubItems: true,
      highlightOnHover: true,
      showActive: true,
      checkable: true,
    });
    expect(api.state.selected).toBe(true);
    expect(api.state.value).toBe('v1');
    expect(api.state.label).toBe('Hello');
    expect(api.state.description).toBe('World');
    expect(api.state.level).toBe(3);
    expect(api.state.hasSubItems).toBe(true);
    expect(api.state.active).toBe(true);
    expect(api.attributes['aria-current']).toBe('page');
    expect(api.attributes['aria-selected']).toBe(true);
    expect(api.attributes['aria-level']).toBe(3);
    expect(api.attributes['aria-expanded']).toBe(false);
    expect(api.classes.active).toBe('item-active');
    expect(api.classes.selected).toBe('item-selected');
  });

  it('select/deselect/toggle fire callbacks and update uncontrolled state', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onClick = vi.fn();
    const onChange = vi.fn();
    const api = setup({ onSelect, onDeselect, onClick, onChange, checkable: true });

    act(() => api.actions.select());
    expect(api.state.selected).toBe(true);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true, '');

    act(() => api.actions.deselect());
    expect(api.state.selected).toBe(false);
    expect(onDeselect).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false, '');

    act(() => api.actions.toggle()); // false -> true
    expect(api.state.selected).toBe(true);
    act(() => api.actions.toggle()); // true -> false
    expect(api.state.selected).toBe(false);
  });

  it('select is a no-op when disabled or non-interactive', () => {
    const onSelect = vi.fn();
    const api = setup({ disabled: true, onSelect });
    act(() => api.actions.select());
    expect(api.state.selected).toBe(false);
    expect(onSelect).not.toHaveBeenCalled();

    const api2 = setup({ interactive: false, onSelect: vi.fn() });
    act(() => api2.actions.select());
    expect(api2.state.selected).toBe(false);
  });

  it('deselect is a no-op when disabled', () => {
    const onDeselect = vi.fn();
    const api = setup({ disabled: true, defaultSelected: true, onDeselect });
    act(() => api.actions.deselect());
    expect(api.state.selected).toBe(true);
    expect(onDeselect).not.toHaveBeenCalled();
  });

  it('controlled selected does not mutate internal state on select/deselect', () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    const api = setup({ selected: false, onSelect, onChange });
    act(() => api.actions.select());
    expect(api.state.selected).toBe(false); // controlled: unchanged
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true, '');
  });

  it('controlled selected: deselect fires callbacks without mutating internal state', () => {
    const onDeselect = vi.fn();
    const onChange = vi.fn();
    const api = setup({ selected: true, onDeselect, onChange });
    act(() => api.actions.deselect());
    expect(api.state.selected).toBe(true); // controlled: unchanged
    expect(onDeselect).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false, '');
  });

  it('unhover is a no-op when disabled/non-interactive', () => {
    const onHover = vi.fn();
    const api = setup({ disabled: true, onHover });
    act(() => api.actions.unhover());
    expect(api.state.hovered).toBe(false);
    expect(onHover).not.toHaveBeenCalled();
  });

  it('uses the internal ref when no itemRef is provided', () => {
    const api = { actions: null as any };
    function Harness() {
      const result = useItem({});
      (api as any).actions = result.actions;
      return null;
    }
    render(<Harness />);
    // internal ref is never attached -> getElement returns null
    expect(api.actions.getElement()).toBeNull();
  });

  it('hover/unhover toggle hovered + highlighted and fire onHover', () => {
    const onHover = vi.fn();
    const api = setup({ onHover });
    act(() => api.actions.hover());
    expect(api.state.hovered).toBe(true);
    expect(api.state.highlighted).toBe(true);
    expect(api.classes.hovered).toBe('item-hovered');
    expect(api.classes.highlighted).toBe('item-highlighted');
    expect(onHover).toHaveBeenCalledWith(true);

    act(() => api.actions.unhover());
    expect(api.state.hovered).toBe(false);
    expect(api.state.highlighted).toBe(false);
    expect(onHover).toHaveBeenCalledWith(false);
  });

  it('hover is a no-op when disabled/non-interactive; aria-expanded tracks hovered for subitems', () => {
    const onHover = vi.fn();
    const api = setup({ disabled: true, onHover, hasSubItems: true });
    act(() => api.actions.hover());
    expect(api.state.hovered).toBe(false);
    expect(api.attributes['aria-expanded']).toBe(false);
    expect(onHover).not.toHaveBeenCalled();

    const api2 = setup({ hasSubItems: true, highlightOnHover: true });
    act(() => api2.actions.hover());
    expect(api2.attributes['aria-expanded']).toBe(true);
  });

  it('press/release toggle pressed and fire onPress', () => {
    const onPress = vi.fn();
    const api = setup({ onPress });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(true);
    expect(api.classes.pressed).toBe('item-pressed');
    expect(onPress).toHaveBeenCalledWith(true);

    act(() => api.actions.release());
    expect(api.state.pressed).toBe(false);
    expect(onPress).toHaveBeenCalledWith(false);
  });

  it('press is a no-op when disabled; release always clears pressed', () => {
    const onPress = vi.fn();
    const api = setup({ disabled: true, onPress });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(false);
    expect(onPress).not.toHaveBeenCalled();
    // release always clears (no guard)
    act(() => api.actions.release());
    expect(api.state.pressed).toBe(false);
  });

  it('setValue/setLabel/setDescription mutate uncontrolled state', () => {
    const api = setup({});
    act(() => api.actions.setValue(42));
    expect(api.state.value).toBe(42);
    act(() => api.actions.setLabel('NewLabel'));
    expect(api.state.label).toBe('NewLabel');
    act(() => api.actions.setDescription('Desc'));
    expect(api.state.description).toBe('Desc');
    act(() => api.actions.setDescription(undefined));
    expect(api.state.description).toBeUndefined();
  });

  it('setValue is a no-op when value is controlled', () => {
    const api = setup({ value: 'controlled' });
    act(() => api.actions.setValue('other'));
    expect(api.state.value).toBe('controlled');
  });

  it('setDisabled is a defensive no-op', () => {
    const api = setup({});
    expect(() => act(() => api.actions.setDisabled(true))).not.toThrow();
  });

  it('focus/blur/getElement operate on the bound ref', () => {
    const api = setup({});
    expect(api.actions.getElement()).toBeInstanceOf(HTMLElement);
    expect(() => act(() => api.actions.focus())).not.toThrow();
    expect(() => act(() => api.actions.blur())).not.toThrow();
  });

  it('focus is a no-op when disabled/non-interactive', () => {
    const api = setup({ disabled: true });
    expect(() => act(() => api.actions.focus())).not.toThrow();
  });

  it('getElement returns null when no ref is bound', () => {
    const api = setup({}, false);
    expect(api.actions.getElement()).toBeNull();
  });

  it('accessibility attributes: aria-disabled, setsize/posinset, tabIndex', () => {
    const api = setup({ disabled: true, listSize: 5, position: 2 });
    expect(api.attributes['aria-disabled']).toBe(true);
    expect(api.attributes['aria-setsize']).toBe(5);
    expect(api.attributes['aria-posinset']).toBe(3);
    expect(api.attributes.tabIndex).toBeUndefined();
  });

  it('tabIndex=0 when interactive and enabled; omitted when non-interactive', () => {
    expect(setup({ checkable: true }).attributes.tabIndex).toBe(0);
    expect(setup({ interactive: false }).attributes.tabIndex).toBeUndefined();
  });

  it('selectionMode none + checkable omits aria-selected; showActive false omits aria-current', () => {
    const api = setup({ selectionMode: 'none', checkable: true, defaultSelected: true });
    expect(api.attributes['aria-selected']).toBeUndefined();
    expect(api.attributes['aria-current']).toBeUndefined();
  });

  it('level 1 omits aria-level', () => {
    expect(setup({ level: 1 }).attributes['aria-level']).toBeUndefined();
  });

  it('getAccessibilityProps reflects live hovered state for aria-expanded', () => {
    const api = setup({ hasSubItems: true });
    act(() => api.actions.hover());
    expect(api.actions.getAccessibilityProps()['aria-expanded']).toBe(true);
  });
});
