import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import { useContextMenu, type ContextMenuItem, type UseContextMenuProps } from '../src/hooks/useContextMenu';

function Harness({
  hookProps,
  apiRef,
}: {
  hookProps: UseContextMenuProps;
  apiRef: React.MutableRefObject<ReturnType<typeof useContextMenu> | null>;
}) {
  const api = useContextMenu(hookProps);
  apiRef.current = api;
  const { state, handlers } = api;
  return (
    <div
      data-testid="root"
      data-context-menu-trigger
      onContextMenu={handlers.handleContextMenu}
      onMouseEnter={handlers.handleMouseEnter}
      onMouseLeave={handlers.handleMouseLeave}
      onKeyDown={handlers.handleKeyDown}
      tabIndex={0}
    >
      {state.open && (
        <div role="menu" data-testid="menu">
          {state.items.map((it, idx) => (
            <div
              key={it.id}
              role="menuitem"
              data-testid={`item-${it.id}`}
              data-focused={state.focusedIndex === idx}
              onClick={() => handlers.handleItemClick(it, idx)}
              onMouseEnter={() => handlers.handleItemFocus(idx)}
            >
              {it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderCtx(props: UseContextMenuProps) {
  const apiRef = { current: null as ReturnType<typeof useContextMenu> | null };
  const utils = render(<Harness hookProps={props} apiRef={apiRef} />);
  return { ...utils, apiRef };
}

async function flush(apiRef: { current: ReturnType<typeof useContextMenu> | null }) {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return apiRef.current!;
}

const baseItems: ContextMenuItem[] = [
  { id: 'copy', label: 'Copy', type: 'action', onAction: vi.fn() },
  { id: 'paste', label: 'Paste', type: 'action', onAction: vi.fn() },
  { id: 'cut', label: 'Cut', type: 'action', onAction: vi.fn() },
];

const withSeparatorDisabled: ContextMenuItem[] = [
  { id: 'copy', label: 'Copy', type: 'action', onAction: vi.fn() },
  { id: 'sep', label: '', type: 'separator' },
  { id: 'cut', label: 'Cut', type: 'action', onAction: vi.fn() },
  { id: 'redo', label: 'Redo', type: 'action', disabled: true, onAction: vi.fn() },
];

describe('useContextMenu', () => {
  it('initializes with default closed state', async () => {
    const { apiRef } = renderCtx({ items: baseItems });
    const api = await flush(apiRef);
    expect(api.state.open).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.items).toHaveLength(3);
  });

  it('defaultOpen=true opens initially', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('controlled open prop overrides internal state', async () => {
    const { apiRef } = renderCtx({ items: baseItems, open: true });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
  });

  it('handleOpen opens menu and fires onOpenChange + onPositionChange', async () => {
    const onOpenChange = vi.fn();
    const onPositionChange = vi.fn();
    const { apiRef } = renderCtx({ items: baseItems, onOpenChange, onPositionChange });
    await flush(apiRef);
    apiRef.current!.handlers.handleOpen({ x: 10, y: 20 });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onPositionChange).toHaveBeenCalledWith({ x: 10, y: 20 });
  });

  it('handleClose closes menu, resets focus, fires onOpenChange(false)', async () => {
    const onOpenChange = vi.fn();
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true, onOpenChange });
    await flush(apiRef);
    apiRef.current!.handlers.handleItemFocus(0);
    await flush(apiRef);
    apiRef.current!.handlers.handleClose();
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
    expect(apiRef.current!.state.focusedIndex).toBe(-1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handleToggle flips state', async () => {
    const { apiRef } = renderCtx({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.handlers.handleToggle();
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
    apiRef.current!.handlers.handleToggle();
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('disabled menu ignores open/close/toggle', async () => {
    const onOpenChange = vi.fn();
    const { apiRef } = renderCtx({ items: baseItems, disabled: true, onOpenChange });
    await flush(apiRef);
    apiRef.current!.handlers.handleOpen();
    apiRef.current!.handlers.handleToggle();
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('handleContextMenu prevents default, sets position, opens', async () => {
    const onOpenChange = vi.fn();
    const onContextMenu = vi.fn();
    const { apiRef } = renderCtx({ items: baseItems, onOpenChange, onContextMenu });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.contextMenu(root, { clientX: 50, clientY: 60 });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
    expect(apiRef.current!.state.position).toEqual({ x: 50, y: 60 });
    expect(onContextMenu).toHaveBeenCalled();
  });

  it('clicking an action item fires onAction and closes (closeOnItemClick)', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'copy', label: 'Copy', type: 'action', onAction }];
    const { apiRef } = renderCtx({ items, defaultOpen: true });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-copy'));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('closeOnItemClick=false keeps menu open after action', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'copy', label: 'Copy', type: 'action', onAction }];
    const { apiRef } = renderCtx({ items, defaultOpen: true, closeOnItemClick: false });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-copy'));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(apiRef.current!.state.open).toBe(true);
  });

  it('disabled item is a no-op', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'x', label: 'X', type: 'action', disabled: true, onAction }];
    const { apiRef } = renderCtx({ items, defaultOpen: true });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-x'));
    expect(onAction).not.toHaveBeenCalled();
  });

  it('checkbox/radio items fire onAction', async () => {
    const user = userEvent.setup();
    const cbAction = vi.fn();
    const radioAction = vi.fn();
    const items: ContextMenuItem[] = [
      { id: 'cb', label: 'CB', type: 'checkbox', checked: false, onAction: cbAction },
      { id: 'rd', label: 'RD', type: 'radio', checked: true, onAction: radioAction },
    ];
    const { apiRef } = renderCtx({ items, defaultOpen: true, closeOnItemClick: false });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-cb'));
    await user.click(screen.getByTestId('item-rd'));
    expect(cbAction).toHaveBeenCalledTimes(1);
    expect(radioAction).toHaveBeenCalledTimes(1);
  });

  it('submenu item does not close menu', async () => {
    const user = userEvent.setup();
    const items: ContextMenuItem[] = [
      { id: 'sub', label: 'Sub', type: 'submenu', items: [{ id: 'c', label: 'C' }] },
    ];
    const { apiRef } = renderCtx({ items, defaultOpen: true });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-sub'));
    expect(apiRef.current!.state.open).toBe(true);
  });

  it('keyboard ArrowDown/Up/Home/End navigate, skipping separators', async () => {
    // navigableItems filters separators but NOT disabled, so order is:
    // [copy=0, cut=1, redo=2]
    const { apiRef } = renderCtx({ items: withSeparatorDisabled, defaultOpen: true });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(0); // copy
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(1); // cut
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(2); // redo
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(0); // wrap to copy
    fireEvent.keyDown(root, { key: 'End' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(2); // redo (last)
    fireEvent.keyDown(root, { key: 'Home' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(0); // copy
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(2); // wrap back to redo
  });

  it('keyboard Enter activates focused item', async () => {
    const onAction = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'copy', label: 'Copy', type: 'action', onAction }];
    const { apiRef } = renderCtx({ items, defaultOpen: true, closeOnItemClick: false });
    await flush(apiRef);
    apiRef.current!.handlers.handleItemFocus(0);
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Enter' });
    await flush(apiRef);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('keyboard Escape closes menu', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Escape' });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('document Escape closes menu (global listener)', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    fireEvent.keyDown(document, { key: 'Escape' });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('keyboard is a no-op when menu closed or disabled', async () => {
    const onAction = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'copy', label: 'Copy', type: 'action', onAction }];
    const { apiRef } = renderCtx({ items, disabled: true, defaultOpen: true });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Enter' });
    await flush(apiRef);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('custom keyBindings override defaults', async () => {
    const custom = vi.fn();
    const { apiRef } = renderCtx({
      items: baseItems,
      defaultOpen: true,
      keyBindings: { 'x': custom },
    });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'x' });
    await flush(apiRef);
    expect(custom).toHaveBeenCalledTimes(1);
  });

  it('outside click closes menu', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
    fireEvent.mouseDown(document.body);
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('closeOnOutsideClick=false keeps menu open on outside click', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true, closeOnOutsideClick: false });
    await flush(apiRef);
    fireEvent.mouseDown(document.body);
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
  });

  it('handlePositionChange updates position when uncontrolled', async () => {
    const onPositionChange = vi.fn();
    const { apiRef } = renderCtx({ items: baseItems, onPositionChange });
    await flush(apiRef);
    apiRef.current!.handlers.handlePositionChange({ x: 5, y: 7 });
    await flush(apiRef);
    expect(apiRef.current!.state.position).toEqual({ x: 5, y: 7 });
    expect(onPositionChange).toHaveBeenCalledWith({ x: 5, y: 7 });
  });

  it('controlled position is not overridden by handlePositionChange', async () => {
    const onPositionChange = vi.fn();
    const { apiRef } = renderCtx({
      items: baseItems,
      position: { x: 1, y: 2 },
      onPositionChange,
    });
    await flush(apiRef);
    apiRef.current!.handlers.handlePositionChange({ x: 99, y: 99 });
    await flush(apiRef);
    expect(apiRef.current!.state.position).toEqual({ x: 1, y: 2 }); // controlled stays
    expect(onPositionChange).toHaveBeenCalledWith({ x: 99, y: 99 });
  });

  it('hover trigger opens after hoverDelay and closes on mouse leave', async () => {
    const onOpenChange = vi.fn();
    const { apiRef } = renderCtx({
      items: baseItems,
      trigger: 'hover',
      hoverDelay: 0,
      onOpenChange,
    });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.mouseEnter(root);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(apiRef.current!.state.open).toBe(true);
    fireEvent.mouseLeave(root);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('hover trigger is a no-op when disabled', async () => {
    const { apiRef } = renderCtx({ items: baseItems, trigger: 'hover', hoverDelay: 0, disabled: true });
    await flush(apiRef);
    fireEvent.mouseEnter(screen.getByTestId('root'));
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('ArrowLeft (ltr) closes an open menu', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true, direction: 'ltr' });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'ArrowLeft' });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('ArrowRight (rtl) closes an open menu', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true, direction: 'rtl' });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'ArrowRight' });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('character navigation jumps to matching item label', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'c' }); // matches 'copy' / 'cut'
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBeGreaterThanOrEqual(0);
  });

  it('disabled menu: handleClose/handlePositionChange/handleItemFocus/handleContextMenu are no-ops', async () => {
    const { apiRef } = renderCtx({ items: baseItems, disabled: true });
    await flush(apiRef);
    const api = apiRef.current!;
    expect(() => {
      api.handlers.handleClose();
      api.handlers.handlePositionChange({ x: 9, y: 9 });
      api.handlers.handleItemFocus(0);
      api.handlers.handleContextMenu({ preventDefault: () => {} } as any);
    }).not.toThrow();
    expect(api.state.open).toBe(false);
    expect(api.state.focusedIndex).toBe(-1);
  });

  it('handleItemFocus ignores out-of-range indices', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    apiRef.current!.handlers.handleItemFocus(-1);
    apiRef.current!.handlers.handleItemFocus(99);
    expect(apiRef.current!.state.focusedIndex).toBe(-1);
  });

  it('ArrowLeft in LTR closes the menu; ArrowRight in RTL closes the menu', async () => {
    // LTR: ArrowLeft closes.
    const ltr = renderCtx({ items: baseItems, defaultOpen: true, direction: 'ltr' });
    await flush(ltr.apiRef);
    fireEvent.keyDown(ltr.container.querySelector('[data-testid="root"]')!, { key: 'ArrowLeft' });
    await flush(ltr.apiRef);
    expect(ltr.apiRef.current!.state.open).toBe(false);
    ltr.unmount();

    // RTL: ArrowRight closes.
    const rtl = renderCtx({ items: baseItems, defaultOpen: true, direction: 'rtl' });
    await flush(rtl.apiRef);
    fireEvent.keyDown(rtl.container.querySelector('[data-testid="root"]')!, { key: 'ArrowRight' });
    await flush(rtl.apiRef);
    expect(rtl.apiRef.current!.state.open).toBe(false);
  });

  it('ArrowLeft/Right on a submenu item in the matching direction prevents default (no close)', async () => {
    const subItems: ContextMenuItem[] = [
      { id: 'sub', label: 'Sub', type: 'submenu' },
      { id: 'copy', label: 'Copy', type: 'action' },
    ];
    // LTR + submenu + ArrowRight → navigate-into arm (preventDefault, no close).
    const ltr = renderCtx({ items: subItems, defaultOpen: true, direction: 'ltr' });
    await flush(ltr.apiRef);
    const ltrRoot = ltr.container.querySelector('[data-testid="root"]')!;
    fireEvent.keyDown(ltrRoot, { key: 'ArrowDown' });
    await flush(ltr.apiRef);
    fireEvent.keyDown(ltrRoot, { key: 'ArrowRight' });
    await flush(ltr.apiRef);
    expect(ltr.apiRef.current!.state.open).toBe(true);
    ltr.unmount();

    // RTL + submenu + ArrowLeft → navigate-into arm.
    const rtl = renderCtx({ items: subItems, defaultOpen: true, direction: 'rtl' });
    await flush(rtl.apiRef);
    const rtlRoot = rtl.container.querySelector('[data-testid="root"]')!;
    fireEvent.keyDown(rtlRoot, { key: 'ArrowDown' });
    await flush(rtl.apiRef);
    fireEvent.keyDown(rtlRoot, { key: 'ArrowLeft' });
    await flush(rtl.apiRef);
    expect(rtl.apiRef.current!.state.open).toBe(true);
  });

  it('menu attributes reflect portal=fixed positioning and maxHeight', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true, portal: true, maxHeight: 300 });
    await flush(apiRef);
    const attrs = apiRef.current!.attributes;
    expect((attrs.style as any).position).toBe('fixed');
    expect((attrs.style as any).maxHeight).toBe('300px');
  });

  it('ArrowUp from a non-zero index moves back without wrapping', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.keyDown(root, { key: 'End' }); // focus last (index 2)
    await flush(apiRef);
    fireEvent.keyDown(root, { key: 'ArrowUp' }); // 2 -> 1 (focusedIndex > 0 arm)
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(1);
  });

  it('Enter with no focused item is a no-op', async () => {
    const onAction = vi.fn();
    const items: ContextMenuItem[] = [{ id: 'x', label: 'X', type: 'action', onAction }];
    const { apiRef } = renderCtx({ items, defaultOpen: true });
    await flush(apiRef);
    // No item focused (focusedIndex stays -1) → Enter arm is skipped.
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Enter' });
    await flush(apiRef);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('Escape does not close when closeOnEscape is false', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true, closeOnEscape: false });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Escape' });
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(true);
  });

  it('closing a controlled menu skips the internal setOpen branch', async () => {
    const onOpenChange = vi.fn();
    const { apiRef } = renderCtx({ items: baseItems, open: true, onOpenChange });
    await flush(apiRef);
    apiRef.current!.handlers.handleClose();
    await flush(apiRef);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hover trigger clears a pending open timeout on re-entry and on leave', async () => {
    const { apiRef } = renderCtx({ items: baseItems, trigger: 'hover', hoverDelay: 200 });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    // Enter schedules a 200ms open timeout; leaving before it fires clears it (pending-timeout arm).
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(apiRef.current!.state.open).toBe(false);
    // A second enter→re-enter→leave also clears a pending timeout on re-entry.
    fireEvent.mouseEnter(root);
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);
    await flush(apiRef);
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('ArrowLeft in RTL and ArrowRight in LTR on a non-submenu item do nothing', async () => {
    // RTL + action item + ArrowLeft → not a submenu, not ltr → no-op (no close).
    const rtl = renderCtx({ items: baseItems, defaultOpen: true, direction: 'rtl' });
    await flush(rtl.apiRef);
    fireEvent.keyDown(rtl.container.querySelector('[data-testid="root"]')!, { key: 'ArrowLeft' });
    await flush(rtl.apiRef);
    expect(rtl.apiRef.current!.state.open).toBe(true);
    rtl.unmount();

    // LTR + action item + ArrowRight → not a submenu, not rtl → no-op (no close).
    const ltr = renderCtx({ items: baseItems, defaultOpen: true, direction: 'ltr' });
    await flush(ltr.apiRef);
    fireEvent.keyDown(ltr.container.querySelector('[data-testid="root"]')!, { key: 'ArrowRight' });
    await flush(ltr.apiRef);
    expect(ltr.apiRef.current!.state.open).toBe(true);
  });

  it('typing a character that matches no item label is a no-op', async () => {
    const { apiRef } = renderCtx({ items: baseItems, defaultOpen: true });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'z' }); // no item starts with 'z'
    await flush(apiRef);
    expect(apiRef.current!.state.focusedIndex).toBe(-1);
  });

  it('hover leave after the menu opened (no pending timeout) still closes', async () => {
    const { apiRef } = renderCtx({ items: baseItems, trigger: 'hover', hoverDelay: 0 });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.mouseEnter(root);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(apiRef.current!.state.open).toBe(true);
    fireEvent.mouseLeave(root);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(apiRef.current!.state.open).toBe(false);
  });

  it('handleMouseLeave directly clears a pending open timeout set by handleMouseEnter', async () => {
    const { apiRef } = renderCtx({ items: baseItems, trigger: 'hover', hoverDelay: 200 });
    await flush(apiRef);
    // Drive the handlers directly so the enter timeout is guaranteed pending at leave.
    apiRef.current!.handlers.handleMouseEnter();
    expect(apiRef.current!.state.open).toBe(false); // not yet opened (200ms delay)
    apiRef.current!.handlers.handleMouseLeave(); // clears the pending open timeout
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(apiRef.current!.state.open).toBe(false);
  });
});
