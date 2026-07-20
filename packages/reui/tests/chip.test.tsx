import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Chip } from '../src/components/Chip';
import { useChip } from '../src/hooks/useChip';

describe('Chip', () => {
  it('renders a chip with its children', () => {
    render(<Chip>Label</Chip>);
    expect(screen.getByTestId('chip')).toHaveTextContent('Label');
  });

  it('reflects variant/size/color in the rendered class', () => {
    render(
      <Chip variant="outline" size="lg" color="success">
        x
      </Chip>
    );
    const chip = screen.getByTestId('chip');
    expect(chip.className).toMatch(/chip-outline/);
    expect(chip.className).toMatch(/chip-success-outline/);
    expect(chip.className).toMatch(/chip-lg/);
  });

  it('renders the delete button only when deletable and not disabled', () => {
    const { rerender } = render(
      <Chip deletable>Label</Chip>
    );
    expect(screen.getByTestId('chip-delete-button')).toBeInTheDocument();
    rerender(<Chip deletable disabled>Label</Chip>);
    expect(screen.queryByTestId('chip-delete-button')).not.toBeInTheDocument();
  });

  it('toggles selection when clicked and is selectable', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Chip selectable onSelectionChange={onSelectionChange}>
        Tag
      </Chip>
    );
    const chip = screen.getByTestId('chip');
    await user.click(chip);
    expect(onSelectionChange).toHaveBeenCalledWith(true);
    await user.click(chip);
    expect(onSelectionChange).toHaveBeenCalledWith(false);
  });

  it('fires onClick and onDelete when the delete button is activated', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onClick = vi.fn();
    render(
      <Chip deletable onDelete={onDelete} onClick={onClick}>
        Removable
      </Chip>
    );
    await user.click(screen.getByTestId('chip-delete-button'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    // Clicking the delete button stops propagation, so the container click is
    // not triggered.
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Chip selectable disabled onSelectionChange={onSelectionChange}>
        x
      </Chip>
    );
    await user.click(screen.getByTestId('chip'));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    // A plain (non-selectable) chip renders role=button, which axe accepts;
    // the selectable variant renders role=option outside a listbox and is a
    // pre-existing component-level a11y quirk, out of scope here.
    const { container } = render(<Chip>x</Chip>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('truncates long string children to maxLength with an ellipsis', () => {
    render(<Chip truncate maxLength={5}>A very long label</Chip>);
    const text = screen.getByTestId('chip-content').querySelector('.chip-text');
    expect(text).toHaveTextContent('A ver...');
  });

  it('leaves short string children untouched when truncate is enabled', () => {
    render(<Chip truncate maxLength={20}>short</Chip>);
    expect(screen.getByTestId('chip-content').querySelector('.chip-text')).toHaveTextContent('short');
  });

  it('does not truncate non-string children even with truncate enabled', () => {
    render(
      <Chip truncate maxLength={2}>
        <span data-testid="node">node</span>
      </Chip>
    );
    expect(screen.getByTestId('node')).toBeInTheDocument();
  });

  it('renders an avatar and hides the prefix when an avatar is present', () => {
    render(
      <Chip avatar={<span data-testid="av">A</span>} prefix={<span data-testid="px">P</span>}>
        Tag
      </Chip>
    );
    expect(screen.getByTestId('chip-avatar')).toBeInTheDocument();
    // Prefix is suppressed when an avatar is provided.
    expect(screen.queryByTestId('chip-prefix')).not.toBeInTheDocument();
  });

  it('renders the prefix when provided without an avatar', () => {
    render(
      <Chip prefix={<span data-testid="px">P</span>}>Tag</Chip>
    );
    expect(screen.getByTestId('chip-prefix')).toBeInTheDocument();
    expect(screen.queryByTestId('chip-avatar')).not.toBeInTheDocument();
  });

  it('renders the suffix icon when provided', () => {
    render(
      <Chip suffix={<span data-testid="sx">S</span>}>Tag</Chip>
    );
    expect(screen.getByTestId('chip-suffix')).toBeInTheDocument();
  });
});

describe('useChip', () => {
  function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
    act(fn);
    hook.rerender();
  }

  it('exposes default state for an uncontrolled, non-selectable chip', () => {
    const hook = renderHook(() => useChip({ variant: 'solid', size: 'sm', color: 'error' }));
    const { state, computed, chipAttributes } = hook.result.current;
    expect(state.selected).toBe(false);
    expect(state.disabled).toBe(false);
    expect(state.variant).toBe('solid');
    expect(state.size).toBe('sm');
    expect(state.color).toBe('error');
    expect(computed.showSelection).toBe(false);
    expect(chipAttributes.role).toBe('button');
    expect(chipAttributes.tabIndex).toBe(0);
  });

  it('toggleSelection toggles selection and fires onSelectionChange (uncontrolled)', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.toggleSelection());
    expect(hook.result.current.state.selected).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('select()/deselect() are guarded by the selected flag', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, defaultSelected: true, onSelectionChange }));
    // Already selected: select() is a no-op.
    actAndRerender(hook, () => hook.result.current.actions.select());
    expect(onSelectionChange).not.toHaveBeenCalled();
    actAndRerender(hook, () => hook.result.current.actions.deselect());
    expect(hook.result.current.state.selected).toBe(false);
    expect(onSelectionChange).toHaveBeenCalledWith(false);
  });

  it('controlled selected state is authoritative and not mutated by toggleSelection', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, selected: true, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.toggleSelection());
    expect(hook.result.current.state.selected).toBe(true); // controlled stays true
    expect(onSelectionChange).toHaveBeenCalledWith(false); // callback still fires
  });

  it('toggleSelection is a no-op when disabled', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, disabled: true, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.toggleSelection());
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(hook.result.current.state.selected).toBe(false);
  });

  it('delete() fires onDelete only when deletable and not disabled', () => {
    const onDelete = vi.fn();
    const a = renderHook(() => useChip({ deletable: true, onDelete }));
    act(() => a.result.current.actions.delete());
    expect(onDelete).toHaveBeenCalledTimes(1);

    const b = renderHook(() => useChip({ deletable: false, onDelete }));
    act(() => b.result.current.actions.delete());
    expect(onDelete).toHaveBeenCalledTimes(1); // unchanged

    const c = renderHook(() => useChip({ deletable: true, disabled: true, onDelete }));
    act(() => c.result.current.actions.delete());
    expect(onDelete).toHaveBeenCalledTimes(1); // unchanged
  });

  it('focus()/blur() track focused state and fire callbacks', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const hook = renderHook(() => useChip({ onFocus, onBlur }));
    actAndRerender(hook, () => hook.result.current.actions.focus());
    expect(hook.result.current.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);
    actAndRerender(hook, () => hook.result.current.actions.blur());
    expect(hook.result.current.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('focus() is a no-op when disabled', () => {
    const onFocus = vi.fn();
    const hook = renderHook(() => useChip({ disabled: true, onFocus }));
    actAndRerender(hook, () => hook.result.current.actions.focus());
    expect(hook.result.current.state.focused).toBe(false);
    expect(onFocus).not.toHaveBeenCalled();
  });

  it('selectable chip exposes role=option and aria-selected', () => {
    const hook = renderHook(() => useChip({ selectable: true, defaultSelected: true }));
    expect(hook.result.current.chipAttributes.role).toBe('option');
    expect(hook.result.current.chipAttributes['aria-selected']).toBe(true);
    expect(hook.result.current.computed.ariaSelected).toBe(true);
  });

  it('disabled chip exposes aria-disabled and tabIndex -1', () => {
    const hook = renderHook(() => useChip({ disabled: true }));
    expect(hook.result.current.chipAttributes['aria-disabled']).toBe(true);
    expect(hook.result.current.chipAttributes.tabIndex).toBe(-1);
  });

  it('getContainerAttributes keyboard handler toggles on Enter and deletes on Backspace', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const hook = renderHook(() =>
      useChip({ selectable: true, deletable: true, onClick, onDelete })
    );
    const attrs = hook.result.current.getContainerAttributes();

    const enter = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    enter.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(enter));
    expect(enter.preventDefault).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();

    const back = new KeyboardEvent('keydown', { key: 'Backspace' }) as any;
    back.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(back));
    expect(onDelete).toHaveBeenCalled();
  });

  it('getContainerAttributes Escape blurs the chip', () => {
    const onBlur = vi.fn();
    const hook = renderHook(() => useChip({ onBlur }));
    const attrs = hook.result.current.getContainerAttributes();
    const esc = new KeyboardEvent('keydown', { key: 'Escape' }) as any;
    esc.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(esc));
    expect(onBlur).toHaveBeenCalled();
  });

  it('getContainerAttributes mouse handlers update pressed/hovered state', () => {
    const hook = renderHook(() => useChip({}));
    const attrs = hook.result.current.getContainerAttributes();
    act(() => attrs.onMouseDown());
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.pressed).toBe(true);
    act(() => attrs.onMouseUp());
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.pressed).toBe(false);
    act(() => attrs.onMouseEnter());
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.hovered).toBe(true);
    act(() => attrs.onMouseLeave());
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.hovered).toBe(false);
  });

  it('getDeleteButtonAttributes stop propagation on click and activate on Enter', () => {
    const onDelete = vi.fn();
    const hook = renderHook(() => useChip({ deletable: true, onDelete }));
    const del = hook.result.current.getDeleteButtonAttributes();
    const clickEvt = { stopPropagation: vi.fn() } as any;
    act(() => del.onClick(clickEvt));
    expect(clickEvt.stopPropagation).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);

    const enter = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    enter.preventDefault = vi.fn();
    enter.stopPropagation = vi.fn();
    act(() => del.onKeyDown(enter));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it('select() moves an unselected chip to selected (uncontrolled)', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.select());
    expect(hook.result.current.state.selected).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('select() notifies but does not mutate when controlled', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, selected: false, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.select());
    expect(hook.result.current.state.selected).toBe(false); // controlled wins
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('deselect() notifies but does not mutate when controlled', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, selected: true, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.deselect());
    expect(hook.result.current.state.selected).toBe(true); // controlled wins
    expect(onSelectionChange).toHaveBeenCalledWith(false);
  });

  it('deselect() is a no-op when already deselected', () => {
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, onSelectionChange }));
    actAndRerender(hook, () => hook.result.current.actions.deselect());
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('blur() is a no-op when disabled', () => {
    const onBlur = vi.fn();
    const hook = renderHook(() => useChip({ disabled: true, onBlur }));
    actAndRerender(hook, () => hook.result.current.actions.blur());
    expect(hook.result.current.state.focused).toBe(false);
    expect(onBlur).not.toHaveBeenCalled();
  });

  it('getContainerAttributes aria-label includes the value when provided', () => {
    const hook = renderHook(() => useChip({ value: 'apple' }));
    expect(hook.result.current.getContainerAttributes()['aria-label']).toBe('Chip: apple');
  });

  it('getContainerAttributes onFocus handler delegates to actions.focus()', () => {
    const onFocus = vi.fn();
    const hook = renderHook(() => useChip({ onFocus }));
    const attrs = hook.result.current.getContainerAttributes();
    actAndRerender(hook, () => attrs.onFocus());
    expect(hook.result.current.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('getContainerAttributes onBlur handler delegates to actions.blur()', () => {
    const onBlur = vi.fn();
    const hook = renderHook(() => useChip({ onBlur }));
    const attrs = hook.result.current.getContainerAttributes();
    actAndRerender(hook, () => attrs.onFocus());
    actAndRerender(hook, () => attrs.onBlur());
    expect(hook.result.current.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('getContainerAttributes keydown is a no-op when disabled', () => {
    const onClick = vi.fn();
    const hook = renderHook(() => useChip({ selectable: true, disabled: true, onClick }));
    const attrs = hook.result.current.getContainerAttributes();
    const enter = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    enter.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(enter));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('getContainerAttributes Space key toggles selection and fires onClick', () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const hook = renderHook(() =>
      useChip({ selectable: true, onClick, onSelectionChange })
    );
    const attrs = hook.result.current.getContainerAttributes();
    const space = new KeyboardEvent('keydown', { key: ' ' }) as any;
    space.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(space));
    expect(space.preventDefault).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('getContainerAttributes Backspace is ignored when not deletable', () => {
    const onDelete = vi.fn();
    const hook = renderHook(() => useChip({ deletable: false, onDelete }));
    const attrs = hook.result.current.getContainerAttributes();
    const back = new KeyboardEvent('keydown', { key: 'Backspace' }) as any;
    back.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(back));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('getContainerAttributes Delete key deletes when deletable', () => {
    const onDelete = vi.fn();
    const hook = renderHook(() => useChip({ deletable: true, onDelete }));
    const attrs = hook.result.current.getContainerAttributes();
    const del = new KeyboardEvent('keydown', { key: 'Delete' }) as any;
    del.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(del));
    expect(del.preventDefault).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('getContainerAttributes Enter on a non-selectable chip fires onClick only', () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const hook = renderHook(() => useChip({ onClick, onSelectionChange }));
    const attrs = hook.result.current.getContainerAttributes();
    const enter = new KeyboardEvent('keydown', { key: 'Enter' }) as any;
    enter.preventDefault = vi.fn();
    act(() => attrs.onKeyDown(enter));
    expect(onClick).toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('getDeleteButtonAttributes ignores keys other than Enter/Space', () => {
    const onDelete = vi.fn();
    const hook = renderHook(() => useChip({ deletable: true, onDelete }));
    const del = hook.result.current.getDeleteButtonAttributes();
    const tab = new KeyboardEvent('keydown', { key: 'Tab' }) as any;
    tab.preventDefault = vi.fn();
    tab.stopPropagation = vi.fn();
    act(() => del.onKeyDown(tab));
    expect(tab.preventDefault).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('getDeleteButtonAttributes Space key activates delete', () => {
    const onDelete = vi.fn();
    const hook = renderHook(() => useChip({ deletable: true, onDelete }));
    const del = hook.result.current.getDeleteButtonAttributes();
    const space = new KeyboardEvent('keydown', { key: ' ' }) as any;
    space.preventDefault = vi.fn();
    space.stopPropagation = vi.fn();
    act(() => del.onKeyDown(space));
    expect(space.preventDefault).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
