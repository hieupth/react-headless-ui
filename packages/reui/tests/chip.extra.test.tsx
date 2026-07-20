import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useChip } from '../src/hooks';
import type { UseChipProps } from '../src/hooks';

// useChip exercised directly: controlled/uncontrolled selection, selectable
// vs non-selectable, deletable + Delete/Backspace, Escape blur, container and
// delete-button attribute generators, disabled gating across every action.

function setup(props: UseChipProps = {}) {
  const api = { current: null as any };
  function Harness() {
    api.current = useChip(props);
    return null;
  }
  render(<Harness />);
  return api;
}

describe('useChip hook', () => {
  it('defaults: non-selectable chip with correct roles/tabs', () => {
    const api = setup();
    expect(api.current.state.selected).toBe(false);
    expect(api.current.state.disabled).toBe(false);
    expect(api.current.chipAttributes.role).toBe('button');
    expect(api.current.chipAttributes.tabIndex).toBe(0);
    expect(api.current.computed.ariaSelected).toBeUndefined();
    expect(api.current.computed.showSelection).toBe(false);
    expect(api.current.computed.showDelete).toBe(false);
  });

  it('selectable chip uses option role and aria-selected', () => {
    const api = setup({ selectable: true, defaultSelected: true });
    expect(api.current.chipAttributes.role).toBe('option');
    expect(api.current.chipAttributes['aria-selected']).toBe(true);
    expect(api.current.chipAttributes['aria-pressed']).toBe(true);
    expect(api.current.computed.showSelection).toBe(true);
  });

  it('uncontrolled: select/deselect/toggle fire onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ selectable: true, onSelectionChange });
    act(() => api.current.actions.select());
    expect(onSelectionChange).toHaveBeenLastCalledWith(true);
    expect(api.current.state.selected).toBe(true);

    // select when already selected is a no-op.
    act(() => api.current.actions.select());
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    act(() => api.current.actions.deselect());
    expect(onSelectionChange).toHaveBeenLastCalledWith(false);
    // deselect when already deselected is a no-op.
    act(() => api.current.actions.deselect());
    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    act(() => api.current.actions.toggleSelection());
    expect(onSelectionChange).toHaveBeenLastCalledWith(true);
  });

  it('controlled: actions emit callback but do not mutate internal state', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ selectable: true, selected: false, onSelectionChange });
    act(() => api.current.actions.select());
    expect(onSelectionChange).toHaveBeenLastCalledWith(true);
    expect(api.current.state.selected).toBe(false);
  });

  it('not selectable / disabled: select-family actions no-op', () => {
    const onSelectionChange = vi.fn();
    const ns = setup({ selectable: false, onSelectionChange });
    act(() => ns.current.actions.select());
    expect(onSelectionChange).not.toHaveBeenCalled();

    const ds = setup({ selectable: true, disabled: true, onSelectionChange });
    act(() => ds.current.actions.toggleSelection());
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('delete action fires onDelete only when deletable and not disabled', () => {
    const onDelete = vi.fn();
    const api = setup({ deletable: true, onDelete });
    act(() => api.current.actions.delete());
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(api.current.computed.showDelete).toBe(true);

    const nd = setup({ deletable: false, onDelete });
    act(() => nd.current.actions.delete());
    expect(onDelete).toHaveBeenCalledTimes(1);

    const dd = setup({ deletable: true, disabled: true, onDelete });
    act(() => dd.current.actions.delete());
    expect(dd.current.computed.showDelete).toBe(false);
  });

  it('focus/blur actions set focused and fire callbacks', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const api = setup({ onFocus, onBlur });
    act(() => api.current.actions.focus());
    expect(api.current.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    act(() => api.current.actions.blur());
    expect(api.current.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();

    // disabled: focus/blur no-op.
    const d = setup({ disabled: true, onFocus, onBlur });
    act(() => d.current.actions.focus());
    expect(d.current.state.focused).toBe(false);
  });

  it('setHovered/setPressed update state', () => {
    const api = setup();
    act(() => api.current.actions.setHovered(true));
    expect(api.current.state.hovered).toBe(true);
    act(() => api.current.actions.setPressed(true));
    expect(api.current.state.pressed).toBe(true);
  });

  it('container onKeyDown: Enter selects (selectable), Delete deletes, Escape blurs', () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const onDelete = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const api = setup({
      selectable: true, deletable: true, onClick, onSelectionChange, onDelete, onFocus, onBlur,
    });
    const attrs = api.current.getContainerAttributes();
    const pd = vi.fn();
    act(() => api.current.actions.focus()); // set focused so blur path is reachable
    act(() => attrs.onKeyDown({ key: 'Enter', preventDefault: pd } as unknown as React.KeyboardEvent));
    expect(onClick).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith(true);

    act(() => attrs.onKeyDown({ key: 'Delete', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onDelete).toHaveBeenCalled();

    act(() => attrs.onKeyDown({ key: 'Backspace', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onDelete).toHaveBeenCalledTimes(2);

    act(() => attrs.onKeyDown({ key: 'Escape', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onBlur).toHaveBeenCalled();
  });

  it('container onKeyDown no-op when disabled; non-selectable Enter only clicks', () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const d = setup({ disabled: true, onClick, onSelectionChange });
    const da = d.current.getContainerAttributes();
    act(() => da.onKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onClick).not.toHaveBeenCalled();

    const ns = setup({ selectable: false, onClick, onSelectionChange });
    const nsa = ns.current.getContainerAttributes();
    act(() => nsa.onKeyDown({ key: ' ', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onClick).toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('container onClick: click + toggle when selectable; disabled no-op', () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const api = setup({ selectable: true, onClick, onSelectionChange });
    const attrs = api.current.getContainerAttributes();
    act(() => attrs.onClick());
    expect(onClick).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith(true);

    const d = setup({ disabled: true, onClick });
    const da = d.current.getContainerAttributes();
    act(() => da.onClick());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('container mouse handlers update pressed/hovered', () => {
    const api = setup();
    const a = api.current.getContainerAttributes();
    act(() => a.onMouseDown());
    expect(api.current.state.pressed).toBe(true);
    act(() => a.onMouseUp());
    expect(api.current.state.pressed).toBe(false);
    act(() => a.onMouseEnter());
    expect(api.current.state.hovered).toBe(true);
    act(() => a.onMouseLeave());
    expect(api.current.state.hovered).toBe(false);
  });

  it('getContainerAttributes aria-label reflects selected + value', () => {
    expect(setup({ selectable: true, defaultSelected: true, value: 'x' }).current.getContainerAttributes()['aria-label'])
      .toContain('Selected chip');
    expect(setup({ selectable: true, defaultSelected: false, value: 'y' }).current.getContainerAttributes()['aria-label'])
      .toContain('Unselected chip');
    expect(setup({ selectable: false }).current.getContainerAttributes()['aria-label']).toBe('Chip');
    expect(setup({ disabled: true }).current.getContainerAttributes().tabIndex).toBe(-1);
  });

  it('getDeleteButtonAttributes: Enter/Space deletes; disabled reflects state', () => {
    const onDelete = vi.fn();
    const api = setup({ deletable: true, onDelete });
    const a = api.current.getDeleteButtonAttributes();
    expect(a['aria-label']).toBe('Delete chip');
    expect(a.type).toBe('button');
    expect(a.tabIndex).toBe(-1);
    const pd = vi.fn();
    act(() => a.onKeyDown({ key: 'Enter', preventDefault: pd, stopPropagation: vi.fn() } as unknown as React.KeyboardEvent));
    expect(pd).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    act(() => a.onClick({ stopPropagation: vi.fn() } as unknown as React.MouseEvent));
    expect(onDelete).toHaveBeenCalledTimes(2);

    const d = setup({ deletable: true, disabled: true, onDelete });
    expect(d.current.getDeleteButtonAttributes().disabled).toBe(true);
  });
});
