import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useDropdownMenu } from '../src/hooks';
import type { UseDropdownMenuProps, DropdownMenuItem } from '../src/hooks';

const items: DropdownMenuItem[] = [
  { id: 'a', label: 'Apple', onClick: vi.fn() },
  { id: 'b', label: 'Banana', onClick: vi.fn() },
  { id: 'c', label: 'Cherry', onClick: vi.fn(), disabled: true },
  { id: 'd', label: 'Date', onClick: vi.fn(), checked: true, role: 'menuitemcheckbox' },
  { id: 'e', label: 'Egg', onClick: vi.fn(), hasSubmenu: true, destructive: true },
];

interface HarnessProps {
  hookProps: UseDropdownMenuProps;
  onApi?: (api: any) => void;
}

function DropdownMenuHarness({ hookProps, onApi }: HarnessProps) {
  const api = useDropdownMenu(hookProps);
  onApi?.(api);
  const { triggerProps, menuProps, getItemProps, state, actions } = api;
  return (
    <div>
      <button data-testid="trigger" {...triggerProps}>
        Trigger
      </button>
      {state.open && (
        <div data-testid="menu" {...menuProps}>
          {items.map((item, index) => (
            <div key={item.id} {...getItemProps(item, index)} data-testid={`item-${item.id}`}>
              {item.label as string}
            </div>
          ))}
        </div>
      )}
      <button data-testid="open-btn" onClick={() => actions.open()} />
      <button data-testid="close-btn" onClick={() => actions.close()} />
      <button data-testid="toggle-btn" onClick={() => actions.toggle()} />
      <button data-testid="focus-next" onClick={() => actions.focusNext()} />
      <button data-testid="focus-prev" onClick={() => actions.focusPrevious()} />
      <button data-testid="focus-first" onClick={() => actions.focusFirst()} />
      <button data-testid="focus-last" onClick={() => actions.focusLast()} />
      <button data-testid="select" onClick={() => actions.selectItem()} />
    </div>
  );
}

function setup(hookProps: Partial<UseDropdownMenuProps> = {}) {
  const api: { current: any } = { current: null };
  const { onOpenChange = vi.fn(), items: it = items, ...rest } = hookProps;
  const controlled: UseDropdownMenuProps = { items: it, open: false, onOpenChange, ...rest };
  render(<DropdownMenuHarness hookProps={controlled} onApi={(a) => (api.current = a)} />);
  return { api, onOpenChange: controlled.onOpenChange };
}

function setOpen(extra: Partial<UseDropdownMenuProps> = {}) {
  return setup({ open: true, ...extra });
}

describe('useDropdownMenu (extra hook tests)', () => {
  it('initializes state with focusedIndex -1 and exposes actions', () => {
    const { api } = setup();
    expect(api.current.state.open).toBe(false);
    expect(api.current.state.focusedIndex).toBe(-1);
    expect(api.current.state.placement).toBe('bottom');
    expect(api.current.state.isTriggerFocused).toBe(false);
    expect(typeof api.current.actions.open).toBe('function');
  });

  it('open/close/toggle call onOpenChange', () => {
    const { api, onOpenChange } = setup();
    act(() => { api.current.actions.open(); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => { api.current.actions.close(); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    // toggle from current open=false -> true
    act(() => { api.current.actions.toggle(); });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('focuses first enabled item when open becomes true', () => {
    const { api } = setOpen();
    expect(api.current.state.focusedIndex).toBe(0);
  });

  it('focusNext moves through enabled items', () => {
    const { api } = setOpen();
    act(() => { api.current.actions.focusNext(); });
    expect(api.current.state.focusedIndex).toBe(1);
    act(() => { api.current.actions.focusNext(); });
    // c disabled, skip -> d (index 3)
    expect(api.current.state.focusedIndex).toBe(3);
  });

  it('focusNext loops when loop=true', () => {
    const { api } = setOpen();
    act(() => { api.current.actions.focusLast(); });
    act(() => { api.current.actions.focusNext(); });
    // wraps to first
    expect(api.current.state.focusedIndex).toBe(0);
  });

  it('focusNext does not loop when loop=false', () => {
    const { api } = setOpen({ loop: false });
    act(() => { api.current.actions.focusLast(); });
    act(() => { api.current.actions.focusNext(); });
    expect(api.current.state.focusedIndex).toBe(4);
  });

  it('focusPrevious moves backwards', () => {
    const { api } = setOpen();
    act(() => { api.current.actions.focusLast(); });
    act(() => { api.current.actions.focusPrevious(); });
    // last enabled = e(4), prev enabled = d(3)
    expect(api.current.state.focusedIndex).toBe(3);
  });

  it('focusPrevious loops when loop=true', () => {
    const { api } = setOpen();
    // currently at 0
    act(() => { api.current.actions.focusPrevious(); });
    // wraps to last enabled (e, index 4)
    expect(api.current.state.focusedIndex).toBe(4);
  });

  it('focusFirst focuses first enabled, focusLast focuses last enabled', () => {
    const { api } = setOpen();
    act(() => { api.current.actions.focusLast(); });
    expect(api.current.state.focusedIndex).toBe(4);
    act(() => { api.current.actions.focusFirst(); });
    expect(api.current.state.focusedIndex).toBe(0);
  });

  it('focusItem sets index when enabled and within range', () => {
    const { api } = setOpen();
    act(() => { api.current.actions.focusItem(1); });
    expect(api.current.state.focusedIndex).toBe(1);
    // disabled ignored
    act(() => { api.current.actions.focusItem(2); });
    expect(api.current.state.focusedIndex).toBe(1);
    // out of range ignored
    act(() => { api.current.actions.focusItem(99); });
    expect(api.current.state.focusedIndex).toBe(1);
  });

  it('navigation actions no-op when closed', () => {
    const { api } = setup();
    act(() => { api.current.actions.focusNext(); });
    act(() => { api.current.actions.focusPrevious(); });
    act(() => { api.current.actions.focusFirst(); });
    act(() => { api.current.actions.focusLast(); });
    act(() => { api.current.actions.focusItem(0); });
    act(() => { api.current.actions.selectItem(); });
    expect(api.current.state.focusedIndex).toBe(-1);
  });

  it('selectItem triggers current item onClick and closes on closeOnSelect', () => {
    const { api, onOpenChange } = setOpen();
    act(() => { api.current.actions.focusItem(1); });
    act(() => { api.current.actions.selectItem(); });
    expect(items[1].onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('selectItem respects closeOnSelect=false', () => {
    const { api, onOpenChange } = setOpen({ closeOnSelect: false });
    act(() => { api.current.actions.focusItem(0); });
    act(() => { api.current.actions.selectItem(); });
    expect(items[0].onClick).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenLastCalledWith(false);
  });

  it('menu keyDown ArrowDown/Up/Home/End/Enter navigate', () => {
    const { api } = setOpen();
    const menu = screen.getByTestId('menu');
    act(() => { fireEvent.keyDown(menu, { key: 'ArrowDown' }); });
    expect(api.current.state.focusedIndex).toBe(1);
    act(() => { fireEvent.keyDown(menu, { key: 'ArrowUp' }); });
    expect(api.current.state.focusedIndex).toBe(0);
    act(() => { fireEvent.keyDown(menu, { key: 'End' }); });
    expect(api.current.state.focusedIndex).toBe(4);
    act(() => { fireEvent.keyDown(menu, { key: 'Home' }); });
    expect(api.current.state.focusedIndex).toBe(0);
    act(() => { fireEvent.keyDown(menu, { key: 'ArrowDown' }); });
    act(() => { fireEvent.keyDown(menu, { key: 'Enter' }); });
    expect(items[1].onClick).toHaveBeenCalled();
  });

  it('menu keyDown Space selects', () => {
    const { api } = setOpen();
    const menu = screen.getByTestId('menu');
    act(() => { fireEvent.keyDown(menu, { key: 'Home' }); });
    act(() => { fireEvent.keyDown(menu, { key: ' ' }); });
    expect(items[0].onClick).toHaveBeenCalled();
  });

  it('menu keyDown Escape closes when closeOnEscape', () => {
    const { api, onOpenChange } = setOpen({ closeOnEscape: true });
    const menu = screen.getByTestId('menu');
    act(() => { fireEvent.keyDown(menu, { key: 'Escape' }); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('menu keyDown Tab closes', () => {
    const { onOpenChange } = setOpen();
    const menu = screen.getByTestId('menu');
    act(() => { fireEvent.keyDown(menu, { key: 'Tab' }); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('trigger keyDown Enter/Space/ArrowDown open the menu', () => {
    const { onOpenChange } = setup();
    const trigger = screen.getByTestId('trigger');
    for (const key of ['Enter', ' ', 'ArrowDown']) {
      act(() => { fireEvent.keyDown(trigger, { key }); });
    }
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('trigger onFocus/onBlur toggle isTriggerFocused', () => {
    const { api } = setup();
    const trigger = screen.getByTestId('trigger');
    act(() => { fireEvent.focus(trigger); });
    expect(api.current.state.isTriggerFocused).toBe(true);
    act(() => { fireEvent.blur(trigger); });
    expect(api.current.state.isTriggerFocused).toBe(false);
  });

  it('item onClick fires and closes on closeOnSelect', () => {
    const { onOpenChange } = setOpen();
    const item = screen.getByTestId('item-b');
    act(() => { fireEvent.click(item); });
    expect(items[1].onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('item onMouseEnter sets focus', () => {
    const { api } = setOpen();
    const item = screen.getByTestId('item-b');
    act(() => { fireEvent.mouseEnter(item); });
    expect(api.current.state.focusedIndex).toBe(1);
  });

  it('item keyDown Enter activates', () => {
    const { api } = setOpen();
    act(() => { api.current.actions.focusItem(0); });
    const item = screen.getByTestId('item-a');
    act(() => { fireEvent.keyDown(item, { key: 'Enter' }); });
    expect(items[0].onClick).toHaveBeenCalled();
  });

  it('disabled item click does nothing', () => {
    const { onOpenChange } = setOpen();
    const item = screen.getByTestId('item-c');
    act(() => { fireEvent.click(item); });
    expect(items[2].onClick).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenLastCalledWith(false);
  });

  it('document Escape closes open menu', () => {
    const { onOpenChange } = setOpen({ closeOnEscape: true });
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('outside click closes open menu', () => {
    const { onOpenChange } = setOpen({ closeOnClickOutside: true });
    act(() => { document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('getItemLabelProps exposes data flags', () => {
    const { api } = setOpen();
    const props = api.current.getItemLabelProps(items[3], 3);
    expect(props['data-label']).toBe(true);
  });

  it('arrowProps expose placement', () => {
    const { api } = setup({ placement: 'top' });
    expect(api.current.arrowProps['data-placement']).toBe('top');
  });

  it('triggerAttributes/menuAttributes expose roles', () => {
    const { api } = setup();
    expect(api.current.triggerAttributes.role).toBe('button');
    expect(api.current.menuAttributes.role).toBe('menu');
  });

  it('triggerProps expose aria-haspopup and expanded state', () => {
    const { api } = setOpen();
    expect(api.current.triggerProps['aria-haspopup']).toBe('menu');
    expect(api.current.triggerProps['aria-expanded']).toBe(true);
    expect(api.current.triggerProps['data-state']).toBe('open');
    expect(api.current.menuProps['data-placement']).toBe('bottom');
  });
});
