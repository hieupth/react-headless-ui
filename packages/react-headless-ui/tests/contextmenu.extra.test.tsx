import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useContextMenu } from '../src/hooks';
import type { UseContextMenuProps, ContextMenuItem } from '../src/hooks';

const items: ContextMenuItem[] = [
  { id: 'a', label: 'Apple', type: 'action' },
  { id: 'b', label: 'Banana', type: 'checkbox', checked: true },
  { id: 'c', label: 'Cherry', type: 'radio' },
  { id: 'sep', label: '', type: 'separator' },
  { id: 'd', label: 'Date', type: 'action', disabled: true },
  { id: 'sub', label: 'Sub', type: 'submenu', items: [{ id: 's1', label: 'Sub One', type: 'action' }] },
];

interface HarnessProps {
  hookProps: UseContextMenuProps;
  onApi?: (api: any) => void;
}

function ContextMenuHarness({ hookProps, onApi }: HarnessProps) {
  const api = useContextMenu(hookProps);
  onApi?.(api);
  const { attributes, handlers, state } = api;
  return (
    <div data-context-menu-trigger>
      <div data-testid="root" {...attributes} />
      {state.open && (
        <ul data-testid="menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              data-item-id={item.id}
              onClick={() => handlers.handleItemClick(item, index)}
              onMouseEnter={() => handlers.handleItemFocus(index)}
            >
              {item.label || item.type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function setup(hookProps: UseContextMenuProps) {
  const api: { current: any } = { current: null };
  render(<ContextMenuHarness hookProps={hookProps} onApi={(a) => (api.current = a)} />);
  return api;
}

describe('useContextMenu (extra hook tests)', () => {
  it('initializes with defaults and exposes state + handlers', () => {
    const api = setup({ items });
    expect(api.current.state.open).toBe(false);
    expect(api.current.state.disabled).toBe(false);
    expect(api.current.state.items).toBe(items);
    expect(api.current.state.variant).toBe('default');
    expect(api.current.state.alignment).toBe('start');
    expect(api.current.state.direction).toBe('ltr');
    expect(typeof api.current.handlers.handleOpen).toBe('function');
  });

  it('handleOpen opens and tracks position', () => {
    const onOpenChange = vi.fn();
    const onPositionChange = vi.fn();
    const api = setup({ items, onOpenChange, onPositionChange });
    act(() => { api.current.handlers.handleOpen({ x: 10, y: 20 }); });
    expect(api.current.state.open).toBe(true);
    expect(api.current.state.position).toEqual({ x: 10, y: 20 });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onPositionChange).toHaveBeenCalledWith({ x: 10, y: 20 });
  });

  it('handleOpen without position uses current position', () => {
    const api = setup({ items });
    act(() => { api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(true);
  });

  it('handleClose closes and resets focusedIndex', () => {
    const onOpenChange = vi.fn();
    const api = setup({ items, defaultOpen: true, onOpenChange });
    act(() => { api.current.handlers.handleItemFocus(0); });
    expect(api.current.state.focusedIndex).toBe(0);
    act(() => { api.current.handlers.handleClose(); });
    expect(api.current.state.open).toBe(false);
    expect(api.current.state.focusedIndex).toBe(-1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handleToggle flips state', () => {
    const api = setup({ items });
    act(() => { api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(true);
    act(() => { api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(false);
  });

  it('does not open/close when disabled', () => {
    const api = setup({ items, disabled: true });
    act(() => { api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    act(() => { api.current.handlers.handleClose(); });
  });

  it('controlled open state is driven by prop', () => {
    const onOpenChange = vi.fn();
    const api = setup({ items, open: false, onOpenChange });
    act(() => { api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('controlled position is driven by prop', () => {
    const api = setup({ items, position: { x: 5, y: 6 } });
    expect(api.current.state.position).toEqual({ x: 5, y: 6 });
  });

  it('handlePositionChange updates position and calls callback', () => {
    const onPositionChange = vi.fn();
    const api = setup({ items, onPositionChange });
    act(() => { api.current.handlers.handlePositionChange({ x: 1, y: 2 }); });
    expect(api.current.state.position).toEqual({ x: 1, y: 2 });
    expect(onPositionChange).toHaveBeenCalledWith({ x: 1, y: 2 });
  });

  it('handleItemFocus clamps to navigable items range', () => {
    const api = setup({ items });
    act(() => { api.current.handlers.handleItemFocus(0); });
    expect(api.current.state.focusedIndex).toBe(0);
    act(() => { api.current.handlers.handleItemFocus(99); });
    expect(api.current.state.focusedIndex).toBe(0);
  });

  it('handleItemFocus ignored when disabled', () => {
    const api = setup({ items, disabled: true });
    act(() => { api.current.handlers.handleItemFocus(0); });
    expect(api.current.state.focusedIndex).toBe(-1);
  });

  it('handleItemClick fires action for action/checkbox/radio types', () => {
    const onActionA = vi.fn();
    const actionItems: ContextMenuItem[] = [
      { id: 'a', label: 'A', type: 'action', onAction: onActionA },
      { id: 'b', label: 'B', type: 'checkbox', onAction: vi.fn() },
      { id: 'c', label: 'C', type: 'radio', onAction: vi.fn() },
    ];
    const api = setup({ items: actionItems, defaultOpen: true });
    act(() => { api.current.handlers.handleItemClick(actionItems[0], 0); });
    expect(onActionA).toHaveBeenCalled();
    expect(api.current.state.open).toBe(false);
  });

  it('handleItemClick does not fire when item disabled', () => {
    const onAction = vi.fn();
    const di: ContextMenuItem[] = [{ id: 'x', label: 'X', type: 'action', disabled: true, onAction }];
    const api = setup({ items: di, defaultOpen: true });
    act(() => { api.current.handlers.handleItemClick(di[0], 0); });
    expect(onAction).not.toHaveBeenCalled();
  });

  it('handleItemClick submenu returns without closing', () => {
    const api = setup({ items, defaultOpen: true });
    act(() => { api.current.handlers.handleItemClick(items[5], 5); });
    expect(api.current.state.open).toBe(true);
  });

  it('handleItemClick respects closeOnItemClick=false', () => {
    const di: ContextMenuItem[] = [{ id: 'a', label: 'A', type: 'action', onAction: vi.fn() }];
    const api = setup({ items: di, defaultOpen: true, closeOnItemClick: false });
    act(() => { api.current.handlers.handleItemClick(di[0], 0); });
    expect(api.current.state.open).toBe(true);
  });

  it('handleContextMenu prevents default and opens at client coords', () => {
    const onContextMenu = vi.fn();
    const api = setup({ items, onContextMenu });
    const fakeEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 42,
      clientY: 84,
    } as any;
    act(() => { api.current.handlers.handleContextMenu(fakeEvent); });
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
    expect(api.current.state.open).toBe(true);
    expect(api.current.state.position).toEqual({ x: 42, y: 84 });
    expect(onContextMenu).toHaveBeenCalled();
  });

  it('handleContextMenu ignored when disabled', () => {
    const api = setup({ items, disabled: true });
    const fakeEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn(), clientX: 1, clientY: 1 } as any;
    act(() => { api.current.handlers.handleContextMenu(fakeEvent); });
    expect(api.current.state.open).toBe(false);
  });

  it('handleKeyDown ArrowDown/Home/End navigate', () => {
    const api = setup({ items, defaultOpen: true });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'ArrowDown' }); });
    expect(api.current.state.focusedIndex).toBe(0);
    act(() => { fireEvent.keyDown(root, { key: 'ArrowDown' }); });
    expect(api.current.state.focusedIndex).toBe(1);
    act(() => { fireEvent.keyDown(root, { key: 'End' }); });
    // navigableItems = items.filter(type !== separator) = [a,b,c,d-disabled,sub]
    expect(api.current.state.focusedIndex).toBe(4);
    act(() => { fireEvent.keyDown(root, { key: 'Home' }); });
    expect(api.current.state.focusedIndex).toBe(0);
  });

  it('handleKeyDown ArrowUp wraps', () => {
    const api = setup({ items, defaultOpen: true });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'ArrowUp' }); });
    expect(api.current.state.focusedIndex).toBe(4);
  });

  it('handleKeyDown Enter activates focused item', () => {
    const onAction = vi.fn();
    const di: ContextMenuItem[] = [{ id: 'a', label: 'A', type: 'action', onAction }];
    const api = setup({ items: di, defaultOpen: true });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'ArrowDown' }); });
    act(() => { fireEvent.keyDown(root, { key: 'Enter' }); });
    expect(onAction).toHaveBeenCalled();
  });

  it('handleKeyDown Escape closes when closeOnEscape', () => {
    const api = setup({ items, defaultOpen: true, closeOnEscape: true });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'Escape' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('handleKeyDown ArrowLeft closes in ltr direction', () => {
    const api = setup({ items, defaultOpen: true, direction: 'ltr' });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'ArrowLeft' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('handleKeyDown ArrowRight closes in rtl direction', () => {
    const api = setup({ items, defaultOpen: true, direction: 'rtl' });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'ArrowRight' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('handleKeyDown character navigation jumps to matching label', () => {
    const di: ContextMenuItem[] = [
      { id: 'a', label: 'Apple', type: 'action' },
      { id: 'b', label: 'Banana', type: 'action' },
    ];
    const api = setup({ items: di, defaultOpen: true });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'b' }); });
    expect(api.current.state.focusedIndex).toBe(1);
  });

  it('handleKeyDown does nothing when not open', () => {
    const api = setup({ items });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'ArrowDown' }); });
    expect(api.current.state.focusedIndex).toBe(-1);
  });

  it('custom key bindings override defaults', () => {
    const custom = vi.fn();
    const api = setup({ items, defaultOpen: true, keyBindings: { 'x': custom } });
    const root = screen.getByTestId('root');
    act(() => { fireEvent.keyDown(root, { key: 'x' }); });
    expect(custom).toHaveBeenCalled();
  });

  it('hover trigger opens on mouse enter after delay', () => {
    vi.useFakeTimers();
    const api = setup({ items, trigger: 'hover', hoverDelay: 100 });
    act(() => { api.current.handlers.handleMouseEnter(); });
    act(() => { vi.advanceTimersByTime(150); });
    expect(api.current.state.open).toBe(true);
    vi.useRealTimers();
  });

  it('hover trigger closes on mouse leave after delay', () => {
    vi.useFakeTimers();
    const api = setup({ items, trigger: 'hover', hoverDelay: 100, defaultOpen: true });
    act(() => { api.current.handlers.handleMouseLeave(); });
    act(() => { vi.advanceTimersByTime(150); });
    expect(api.current.state.open).toBe(false);
    vi.useRealTimers();
  });

  it('mouse enter/leave ignored when not hover trigger', () => {
    vi.useFakeTimers();
    const api = setup({ items, trigger: 'click' });
    act(() => { api.current.handlers.handleMouseEnter(); });
    act(() => { vi.advanceTimersByTime(150); });
    expect(api.current.state.open).toBe(false);
    act(() => { api.current.handlers.handleMouseLeave(); });
    vi.useRealTimers();
  });

  it('mouse enter ignored when disabled', () => {
    vi.useFakeTimers();
    const api = setup({ items, trigger: 'hover', disabled: true });
    act(() => { api.current.handlers.handleMouseEnter(); });
    act(() => { vi.advanceTimersByTime(150); });
    expect(api.current.state.open).toBe(false);
    vi.useRealTimers();
  });

  it('outside click closes the open menu', () => {
    const api = setup({ items, defaultOpen: true, closeOnOutsideClick: true });
    act(() => { document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
    expect(api.current.state.open).toBe(false);
  });

  it('document-level Escape closes the open menu', () => {
    const api = setup({ items, defaultOpen: true, closeOnEscape: true });
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(api.current.state.open).toBe(false);
  });

  it('attributes expose aria, style, and data-* props', () => {
    const api = setup({ items, portal: true, zIndex: 50, maxHeight: 200, variant: 'compact', alignment: 'center', direction: 'rtl' });
    const attrs = api.current.attributes;
    expect(attrs['data-variant']).toBe('compact');
    expect(attrs['data-alignment']).toBe('center');
    expect(attrs['data-direction']).toBe('rtl');
    expect(attrs['data-portal']).toBe(true);
    expect(attrs['data-z-index']).toBe(50);
    expect(attrs.style.position).toBe('fixed');
    expect(attrs.style.zIndex).toBe(50);
    expect(attrs.style.maxHeight).toBe('200px');
    expect(attrs['aria-orientation']).toBe('vertical');
    expect(attrs.tabIndex).toBe(-1);
  });
});
