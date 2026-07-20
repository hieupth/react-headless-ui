import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useButtonGroup } from '../src/hooks';
import type { UseButtonGroupProps } from '../src/hooks';

// useButtonGroup exercised directly: exclusive/non-exclusive, controlled vs
// uncontrolled, disabled guards, full keyboard matrix (arrows per orientation,
// Home/End, Enter/Space), getButtonProps composition, and bounds checking.

type SetupProps = UseButtonGroupProps & { totalItems: number };
function setup(props: SetupProps) {
  const api = { current: null as any };
  function Harness() {
    api.current = useButtonGroup(props);
    return null;
  }
  render(<Harness />);
  return api;
}

const baseExclusive = { exclusive: true, totalItems: 4 } as SetupProps;

function key(groupProps: any, key: string) {
  let pd = false;
  act(() => groupProps.onKeyDown({
    key, preventDefault: () => { pd = true; },
  } as unknown as React.KeyboardEvent));
  return pd;
}

describe('useButtonGroup hook', () => {
  it('defaults: horizontal group, null selection, correct roles', () => {
    const { current } = setup({ totalItems: 3 });
    expect(current.state.selectedIndex).toBeNull();
    expect(current.state.orientation).toBe('horizontal');
    expect(current.groupProps.role).toBe('group');
    expect(current.semanticAttributes.role).toBe('group');
    expect(current.semanticAttributes['aria-label']).toContain('3 items');
  });

  it('exclusive mode uses radiogroup role', () => {
    const { current } = setup({ exclusive: true, totalItems: 3 });
    expect(current.groupProps.role).toBe('radiogroup');
    expect(current.state.orientation).toBe('horizontal');
  });

  it('vertical orientation sets aria-orientation vertical', () => {
    const { current } = setup({ orientation: 'vertical', totalItems: 3 });
    expect(current.groupProps['aria-orientation']).toBe('vertical');
    expect(current.groupProps['data-orientation']).toBe('vertical');
  });

  it('uncontrolled selectButton/isSelected/deselectAll + onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    // Read state live (api.current) — the hook returns a fresh object each
    // render, so destructuring { current } would freeze the render-0 snapshot.
    const api = setup({ ...baseExclusive, onSelectionChange });
    act(() => api.current.actions.selectButton(2));
    expect(api.current.state.selectedIndex).toBe(2);
    expect(api.current.actions.isSelected(2)).toBe(true);
    expect(onSelectionChange).toHaveBeenLastCalledWith(2);

    // Selecting the same index in exclusive mode toggles off.
    act(() => api.current.actions.selectButton(2));
    expect(api.current.state.selectedIndex).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);

    act(() => api.current.actions.selectButton(1));
    act(() => api.current.actions.deselectAll());
    expect(api.current.state.selectedIndex).toBeNull();
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  });

  it('controlled mode: actions emit but do not mutate state', () => {
    const onSelectionChange = vi.fn();
    const { current } = setup({ ...baseExclusive, selectedIndex: 1, onSelectionChange });
    expect(current.state.selectedIndex).toBe(1);
    act(() => current.actions.selectButton(3));
    expect(current.state.selectedIndex).toBe(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith(3);
  });

  it('selectButton bounds-checked and disabled-guarded', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ ...baseExclusive, onSelectionChange });
    act(() => api.current.actions.selectButton(-1));
    act(() => api.current.actions.selectButton(99));
    act(() => api.current.actions.deselectAll());
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(api.current.state.selectedIndex).toBeNull();

    const d = setup({ ...baseExclusive, disabled: true, onSelectionChange });
    act(() => d.current.actions.selectButton(0));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('horizontal keyboard: Right/Left move, wrap, Home/End', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ ...baseExclusive, onSelectionChange });
    // No selection: ArrowRight -> 0
    expect(key(api.current.groupProps, 'ArrowRight')).toBe(true);
    expect(api.current.state.selectedIndex).toBe(0);
    // ArrowRight advances
    key(api.current.groupProps, 'ArrowRight');
    expect(api.current.state.selectedIndex).toBe(1);
    // Wrap forward
    act(() => api.current.actions.selectButton(3));
    key(api.current.groupProps, 'ArrowRight');
    expect(api.current.state.selectedIndex).toBe(0);
    // ArrowLeft from index 0 wraps to last
    key(api.current.groupProps, 'ArrowLeft');
    expect(api.current.state.selectedIndex).toBe(3);
    // ArrowLeft decrements
    key(api.current.groupProps, 'ArrowLeft');
    expect(api.current.state.selectedIndex).toBe(2);
    // No selection: ArrowLeft -> last
    act(() => api.current.actions.deselectAll());
    key(api.current.groupProps, 'ArrowLeft');
    expect(api.current.state.selectedIndex).toBe(3);
    // Home/End
    key(api.current.groupProps, 'Home');
    expect(api.current.state.selectedIndex).toBe(0);
    key(api.current.groupProps, 'End');
    expect(api.current.state.selectedIndex).toBe(3);
  });

  it('vertical keyboard: Down/Up move; horizontal arrows ignored', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ ...baseExclusive, orientation: 'vertical', onSelectionChange });
    key(api.current.groupProps, 'ArrowDown');
    expect(api.current.state.selectedIndex).toBe(0);
    key(api.current.groupProps, 'ArrowDown');
    expect(api.current.state.selectedIndex).toBe(1);
    key(api.current.groupProps, 'ArrowUp');
    expect(api.current.state.selectedIndex).toBe(0);
    // ArrowRight (horizontal) ignored in vertical orientation
    key(api.current.groupProps, 'ArrowRight');
    expect(api.current.state.selectedIndex).toBe(0);
    // ArrowLeft ignored
    key(api.current.groupProps, 'ArrowLeft');
    expect(api.current.state.selectedIndex).toBe(0);
  });

  it('Enter/Space on group re-selects current exclusive index (toggle off)', () => {
    const onSelectionChange = vi.fn();
    const { current } = setup({ ...baseExclusive, defaultSelectedIndex: 1, onSelectionChange });
    expect(key(current.groupProps, ' ')).toBe(true);
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  });

  it('keyboard no-op when disabled', () => {
    const { current } = setup({ ...baseExclusive, disabled: true });
    key(current.groupProps, 'ArrowRight');
    key(current.groupProps, 'Home');
    expect(current.state.selectedIndex).toBeNull();
  });

  it('getButtonProps: roles, aria, position, disabled, tabIndex', () => {
    const { current } = setup({ ...baseExclusive, defaultSelectedIndex: 1 });
    const first = current.getButtonProps(0);
    const selected = current.getButtonProps(1);
    const last = current.getButtonProps(3);
    expect(first.role).toBe('radio');
    expect(first['data-position']).toBe('first');
    expect(selected.tabIndex).toBe(0); // selected is tabbable
    expect(first.tabIndex).toBe(-1);
    expect(selected['aria-checked']).toBe(true);
    expect(last['data-position']).toBe('last');
    expect(current.getButtonProps(2)['data-position']).toBe('middle');
  });

  it('getButtonProps onClick selects index and composes additional onClick', () => {
    const additionalOnClick = vi.fn();
    const api = setup({ ...baseExclusive });
    const props = api.current.getButtonProps(2, { onClick: additionalOnClick });
    act(() => props.onClick({} as React.MouseEvent));
    expect(api.current.state.selectedIndex).toBe(2);
    expect(additionalOnClick).toHaveBeenCalled();
  });

  it('getButtonProps disabled guards onClick/onKeyDown', () => {
    const additionalOnKeyDown = vi.fn();
    const { current } = setup({ ...baseExclusive, disabled: true });
    const props = current.getButtonProps(0, { onKeyDown: additionalOnKeyDown });
    act(() => props.onClick({} as React.MouseEvent));
    expect(current.state.selectedIndex).toBeNull();
    act(() => props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(current.state.selectedIndex).toBeNull();
  });

  it('getButtonProps onKeyDown Enter/Space selects; composes additional onKeyDown', () => {
    const additionalOnKeyDown = vi.fn();
    const api = setup({ ...baseExclusive });
    const props = api.current.getButtonProps(1, { onKeyDown: additionalOnKeyDown });
    const pd = vi.fn();
    act(() => props.onKeyDown({ key: ' ', preventDefault: pd } as unknown as React.KeyboardEvent));
    expect(pd).toHaveBeenCalled();
    expect(api.current.state.selectedIndex).toBe(1);
    expect(additionalOnKeyDown).toHaveBeenCalled();
  });

  it('attached/size/variant surface on group + button props', () => {
    const { current } = setup({ totalItems: 2, attached: true, size: 'lg', variant: 'ghost' });
    expect(current.groupProps['data-attached']).toBe(true);
    expect(current.groupProps['data-size']).toBe('lg');
    expect(current.groupProps['data-variant']).toBe('ghost');
    const bp = current.getButtonProps(0);
    expect(bp['data-attached']).toBe(true);
    expect(bp['data-size']).toBe('lg');
    expect(bp['data-variant']).toBe('ghost');
  });
});
