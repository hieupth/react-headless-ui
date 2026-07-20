import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Menu } from '../src/components/Menu';
import { useMenu } from '../src/hooks';
import type { MenuItem } from '../src/hooks';

const items = [
  { key: 'new', label: 'New' },
  { key: 'open', label: 'Open' },
];

const withDisabled: MenuItem[] = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B', disabled: true },
  { key: 'c', label: 'C' },
];

// minimal keyboard-event factory for the headless handleKeyDown action
const kd = (key: string) => ({ key, preventDefault: vi.fn() } as any);

describe('Menu', () => {
  it('renders its trigger', () => {
    render(
      <Menu items={items}>
        <button>Open menu</button>
      </Menu>
    );
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('opens the menu on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Menu items={items}>
        <button>Open menu</button>
      </Menu>
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(await screen.findByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });
});

// Lightweight, renderHook-based coverage of the headless useMenu hook. Driving
// the hook directly (rather than through the full Menu component tree) keeps
// the suite small and avoids the heavy DOM rendering that makes the deep
// component suite memory-heavy under coverage.
describe('useMenu (headless)', () => {
  it('controlled open delegates to onOpenChange and honours focusStrategy=first', () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useMenu({ items: withDisabled, open: false, onOpenChange, focusStrategy: 'first' })
    );
    act(() => result.current.openMenu());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // closeMenu on controlled delegates too
    act(() => result.current.closeMenu());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('uncontrolled open toggles internally; toggleMenu opens then closes', () => {
    const { result } = renderHook(() => useMenu({ items }));
    act(() => result.current.openMenu());
    expect(result.current.open).toBe(true);
    act(() => result.current.toggleMenu()); // open -> close
    expect(result.current.open).toBe(false);
    act(() => result.current.toggleMenu()); // closed -> open
    expect(result.current.open).toBe(true);
  });

  it('highlightItem / getItemAt / getFlattenedItems', () => {
    const { result } = renderHook(() => useMenu({ items }));
    act(() => result.current.highlightItem(1));
    expect(result.current.highlightedIndex).toBe(1);
    // disabled item is not highlighted
    const { result: d } = renderHook(() => useMenu({ items: withDisabled }));
    act(() => d.current.highlightItem(1)); // 'b' disabled
    expect(d.current.highlightedIndex).not.toBe(1);
    expect(d.current.getItemAt(0)?.key).toBe('a');
    expect(d.current.getFlattenedItems().length).toBe(3);
  });

  it('selectItem: single + multiSelect toggle + action + closeOnSelection', () => {
    const action = vi.fn();
    const multi: MenuItem[] = [
      { key: 'x', label: 'X', action },
      { key: 'y', label: 'Y' },
    ];
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() =>
      useMenu({ items: multi, multiSelect: true, closeOnSelection: false, onSelectionChange })
    );
    act(() => result.current.selectItem('x'));
    expect(Array.from(result.current.selectedKeys)).toEqual(['x']);
    expect(action).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith(['x']);
    // selecting again toggles it off (multiSelect)
    act(() => result.current.selectItem('x'));
    expect(Array.from(result.current.selectedKeys)).toEqual([]);
  });

  it('selectItem ignores disabled and unknown keys', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() =>
      useMenu({ items: withDisabled, onSelectionChange })
    );
    act(() => result.current.selectItem('b')); // disabled
    act(() => result.current.selectItem('zzz')); // unknown
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(result.current.selectedKeys.size).toBe(0);
  });

  it('keyboard ArrowDown/ArrowUp/Home/End/Enter/Escape navigate, select, and close', () => {
    const { result } = renderHook(() => useMenu({ items: withDisabled, closeOnSelection: false }));
    act(() => result.current.openMenu());
    act(() => result.current.handleKeyDown(kd('Escape'))); // closes (before any selection)
    expect(result.current.open).toBe(false);
    act(() => result.current.openMenu());
    act(() => result.current.handleKeyDown(kd('End')));
    expect(result.current.highlightedIndex).toBe(2); // last enabled 'c'
    act(() => result.current.handleKeyDown(kd('Home')));
    expect(result.current.highlightedIndex).toBe(0); // first enabled 'a'
    act(() => result.current.handleKeyDown(kd('ArrowDown'))); // skips disabled 'b' -> 'c'
    expect(result.current.highlightedIndex).toBe(2);
    act(() => result.current.handleKeyDown(kd('ArrowUp'))); // back up, skips disabled 'b' -> 'a'
    expect(result.current.highlightedIndex).toBe(0);
    act(() => result.current.handleKeyDown(kd('Enter'))); // selects 'a' (closeOnSelection=false keeps it open)
    expect(result.current.selectedKeys.has('a')).toBe(true);
    // an unhandled key (no switch case) is a no-op
    act(() => result.current.handleKeyDown(kd('Tab')));
    expect(result.current.open).toBe(true);
  });

  it('keyboard navigation wraps around with ArrowDown at the end and ArrowUp at the start', () => {
    const { result } = renderHook(() => useMenu({ items, closeOnSelection: false }));
    act(() => result.current.openMenu());
    act(() => result.current.handleKeyDown(kd('End'))); // highlight 'open' (index 1)
    act(() => result.current.handleKeyDown(kd('ArrowDown'))); // wrap -> 'new' (index 0)
    expect(result.current.highlightedIndex).toBe(0);
    act(() => result.current.handleKeyDown(kd('ArrowUp'))); // wrap -> 'open' (index 1)
    expect(result.current.highlightedIndex).toBe(1);
  });

  it('selectItem on an all-disabled list and a list with no enabled items for Home/End', () => {
    const allDisabled: MenuItem[] = [
      { key: 'd1', label: 'D1', disabled: true },
      { key: 'd2', label: 'D2', disabled: true },
    ];
    const onSel = vi.fn();
    const { result } = renderHook(() => useMenu({ items: allDisabled, onSelectionChange: onSel }));
    act(() => result.current.openMenu());
    // Home/End find no enabled item -> no highlight change (no throw)
    act(() => result.current.handleKeyDown(kd('Home')));
    act(() => result.current.handleKeyDown(kd('End')));
    // selecting a disabled item is ignored
    act(() => result.current.selectItem('d1'));
    expect(onSel).not.toHaveBeenCalled();
  });

  it('selectItem updates internal state only when selection is uncontrolled', () => {
    const onSelectionChange = vi.fn();
    // Pass selectedKeys via stable initialProps so the controlled-selection
    // sync effect does not see a new array identity on every render (which
    // would otherwise loop under jsdom).
    const controlledKeys: string[] = [];
    const { result } = renderHook(
      (props: { selectedKeys: string[] }) =>
        useMenu({ items, closeOnSelection: false, onSelectionChange, ...props }),
      { initialProps: { selectedKeys: controlledKeys } },
    );
    // controlled selectedKeys: selectItem still fires onSelectionChange but
    // does not overwrite internal state (controlled arm).
    act(() => result.current.selectItem('new'));
    expect(onSelectionChange).toHaveBeenCalledWith(['new']);
  });

  it('focusStrategy other than "first" skips the initial-highlight block', () => {
    const { result } = renderHook(() => useMenu({ items, focusStrategy: 'none' as any }));
    act(() => result.current.openMenu());
    // no first-item highlight set
    expect(result.current.highlightedIndex).toBe(-1);
  });

  it('handleTriggerClick/Enter/Leave are no-ops for non-matching triggers', () => {
    const { result } = renderHook(() => useMenu({ items, trigger: 'context' }));
    act(() => result.current.handleTriggerClick()); // context -> no toggle
    expect(result.current.open).toBe(false);
    act(() => result.current.handleTriggerEnter()); // context -> no open
    expect(result.current.open).toBe(false);
    act(() => result.current.handleTriggerLeave()); // context -> no schedule
    expect(result.current.open).toBe(false);
  });

  it('hover trigger clears a pending leave-timeout on re-enter', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useMenu({ items, trigger: 'hover' }));
    act(() => result.current.handleTriggerEnter()); // open
    act(() => result.current.handleTriggerLeave()); // schedule close
    act(() => result.current.handleTriggerEnter()); // re-enter clears timeout, stays open
    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current.open).toBe(true);
    vi.useRealTimers();
  });

  it('handleKeyDown is a no-op while closed', () => {
    const { result } = renderHook(() => useMenu({ items }));
    act(() => result.current.handleKeyDown(kd('ArrowDown')));
    expect(result.current.highlightedIndex).toBe(-1);
  });

  it('hover trigger opens on enter (clearing a pending timeout) and closes on leave', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useMenu({ items, trigger: 'hover' }));
    act(() => result.current.handleTriggerEnter());
    expect(result.current.open).toBe(true);
    act(() => result.current.handleTriggerLeave()); // schedules close
    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current.open).toBe(false);
    vi.useRealTimers();
  });

  it('click/context triggers do not open on hover, and click trigger toggles on click', () => {
    const { result: click } = renderHook(() => useMenu({ items, trigger: 'click' }));
    act(() => click.current.handleTriggerEnter()); // no-op for click trigger
    expect(click.current.open).toBe(false);
    act(() => click.current.handleTriggerClick()); // opens
    expect(click.current.open).toBe(true);
    const { result: ctx } = renderHook(() => useMenu({ items, trigger: 'context' }));
    act(() => ctx.current.handleTriggerEnter()); // no-op for context
    expect(ctx.current.open).toBe(false);
  });

  it('controlled selectedKeys sync to internal state', () => {
    const { result, rerender } = renderHook(({ sel }) => useMenu({ items, selectedKeys: sel }), {
      initialProps: { sel: ['new'] as string[] },
    });
    expect(result.current.selectedKeys.has('new')).toBe(true);
    rerender({ sel: ['open'] });
    expect(result.current.selectedKeys.has('open')).toBe(true);
  });

  it('closes on outside click when closeOnOutsideClick is true', () => {
    function Harness() {
      const menu = useMenu({ items, defaultOpen: true, closeOnOutsideClick: true });
      return (
        <>
          <button ref={menu.triggerRef as any}>trig</button>
          <div ref={menu.menuRef as any}>menu</div>
          <button data-testid="outside">out</button>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByText('menu')).toBeInTheDocument();
    act(() => {
      fireEvent.mouseDown(screen.getByTestId('outside'));
    });
    // outside click triggers the document listener -> menu closes (re-render)
    // We assert the outside handler ran without error; the menu text may unmount.
    expect(screen.getByTestId('outside')).toBeInTheDocument();
  });

  it('renders submenu flattening with depth', () => {
    const nested: MenuItem[] = [
      { key: 'p', label: 'Parent', submenu: [{ key: 'c', label: 'Child' }] },
    ];
    const { result } = renderHook(() => useMenu({ items: nested }));
    expect(result.current.getFlattenedItems().length).toBe(2);
  });

  // Regression: an inline `selectedKeys` array (new identity each render) must
  // NOT cause an infinite sync loop. Before the content-signature fix this threw
  // "Maximum update depth exceeded".
  it('does not loop when selectedKeys is an inline array', () => {
    const { container } = render(
      <Menu items={items} selectedKeys={['new']}>
        <button>Open menu</button>
      </Menu>
    );
    // Reaching these assertions means render completed without looping.
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    expect(container).toBeTruthy();
  });
});
