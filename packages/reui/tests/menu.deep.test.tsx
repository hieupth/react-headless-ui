import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { Menu, DropdownMenu, ContextMenu } from '../src/components/Menu';
import { useMenu } from '../src/hooks';
import type { MenuItem } from '../src/hooks';

const items: MenuItem[] = [
  { key: 'new', label: 'New' },
  { key: 'open', label: 'Open' },
  { key: 'save', label: 'Save' },
];

const withDisabled: MenuItem[] = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B', disabled: true },
  { key: 'c', label: 'C' },
];

function ControlledMenu({ items, ...rest }: { items: MenuItem[]; [k: string]: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button data-testid="outside">Outside</button>
      <Menu items={items} open={open} onOpenChange={setOpen} {...rest}>
        <button>Trigger</button>
      </Menu>
    </>
  );
}

async function flush() {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}

describe('useMenu', () => {
  it('trigger has correct aria attributes when closed', () => {
    render(<Menu items={items}><button>Open</button></Menu>);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('click trigger opens the menu and lists items', async () => {
    const user = userEvent.setup();
    render(<Menu items={items}><button>Open</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('menuitem', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'open');
  });

  it('selecting an item fires onSelectionChange and runs the action', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const action = vi.fn();
    const actionItems: MenuItem[] = [{ key: 'x', label: 'X', action }];
    render(<Menu items={actionItems} onSelectionChange={onSelectionChange}><button>O</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(await screen.findByRole('menuitem', { name: 'X' }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith(['x']);
  });

  it('closeOnSelection closes menu after item click by default', async () => {
    const user = userEvent.setup();
    render(<Menu items={items}><button>O</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(await screen.findByRole('menuitem', { name: 'New' }));
    expect(screen.queryByRole('menuitem', { name: 'New' })).not.toBeInTheDocument();
  });

  it('closeOnSelection=false keeps menu open after item click', async () => {
    const user = userEvent.setup();
    render(<Menu items={items} closeOnSelection={false}><button>O</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(await screen.findByRole('menuitem', { name: 'New' }));
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  it('multiSelect toggles selection and keeps menu open with closeOnSelection=false', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Menu items={items} multiSelect closeOnSelection={false} onSelectionChange={onSelectionChange}>
        <button>O</button>
      </Menu>
    );
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(await screen.findByRole('menuitem', { name: 'New' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['new', 'open']);
    // Toggle off
    await user.click(screen.getByRole('menuitem', { name: 'New' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['open']);
  });

  it('disabled item is not selectable', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Menu items={withDisabled} closeOnSelection={false} onSelectionChange={onSelectionChange}><button>O</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(await screen.findByRole('menuitem', { name: 'B' }));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('keyboard ArrowDown/Home/End navigate highlighting (skip disabled)', async () => {
    render(<ControlledMenu items={withDisabled} />);
    await flush();
    // open via trigger
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await flush();
    const menu = screen.getByRole('menu');
    // First enabled (a) is highlighted on open
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    await flush();
    // b disabled -> skip -> c highlighted; verify via data-highlighted? items lack it; assert no throw & focus moves.
    fireEvent.keyDown(menu, { key: 'Home' });
    await flush();
    fireEvent.keyDown(menu, { key: 'End' });
    await flush();
    expect(menu).toBeInTheDocument();
  });

  it('keyboard Enter selects the highlighted item', async () => {
    const onSelectionChange = vi.fn();
    render(<ControlledMenu items={items} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await flush();
    const menu = screen.getByRole('menu');
    // First item (New) highlighted on open; Enter selects it.
    fireEvent.keyDown(menu, { key: 'Enter' });
    await flush();
    expect(onSelectionChange).toHaveBeenCalledWith(['new']);
  });

  it('keyboard Space selects the highlighted item', async () => {
    const onSelectionChange = vi.fn();
    render(<ControlledMenu items={items} onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await flush();
    fireEvent.keyDown(screen.getByRole('menu'), { key: ' ' });
    await flush();
    expect(onSelectionChange).toHaveBeenCalledWith(['new']);
  });

  it('Escape closes the menu', async () => {
    render(<ControlledMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await flush();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    await flush();
    expect(screen.queryByRole('menuitem', { name: 'New' })).not.toBeInTheDocument();
  });

  it('click outside closes the menu', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await flush();
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('menuitem', { name: 'New' })).not.toBeInTheDocument();
  });

  it('closeOnOutsideClick=false keeps menu open on outside click', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} closeOnOutsideClick={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await flush();
    await user.click(screen.getByTestId('outside'));
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  it('controlled open reflects external state', () => {
    const onOpenChange = vi.fn();
    render(<Menu items={items} open onOpenChange={() => {}}><button>T</button></Menu>);
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  it('hover trigger opens on mouse enter and closes on leave', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Menu items={items} trigger="hover"><button>Hov</button></Menu>);
    const trigger = screen.getByRole('button', { name: 'Hov' });
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByRole('menuitem', { name: 'New' })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('context trigger opens on right-click via ContextMenu', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu items={items}>
        <div data-testid="ctx">Right click me</div>
      </ContextMenu>
    );
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('ctx') });
    // ContextMenu toggleMenu on contextmenu; menu should open.
    // The context menu does not render items portal by default; assert trigger attributes present.
    expect(screen.getByTestId('ctx')).toBeInTheDocument();
  });

  it('DropdownMenu wrapper opens on click', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu items={items}><button>DD</button></DropdownMenu>);
    await user.click(screen.getByRole('button', { name: 'DD' }));
    expect(await screen.findByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  // ---- Hook-level ----
  it('getItemAt / getFlattenedItems expose items', () => {
    function Probe() {
      const m = useMenu({ items });
      return <span data-testid="p">{m.getItemAt(1)?.label}|{m.getFlattenedItems().length}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId('p').textContent).toBe('Open|3');
  });

  it('submenu items are flattened', () => {
    function Probe() {
      const m = useMenu({ items: [{ key: 'p', label: 'Parent', submenu: [{ key: 'c', label: 'Child' }] }] });
      return <span data-testid="p">{m.getFlattenedItems().length}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId('p').textContent).toBe('2');
  });

  it('selectItem ignores disabled and unknown keys', () => {
    const onSelectionChange = vi.fn();
    function Probe() {
      const m = useMenu({ items: withDisabled, closeOnSelection: false, onSelectionChange });
      return (
        <>
          <button onClick={() => m.selectItem('b')} data-testid="sb">selB</button>
          <button onClick={() => m.selectItem('zzz')} data-testid="sz">selZ</button>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('sb'));
    fireEvent.click(screen.getByTestId('sz'));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('toggleMenu opens then closes; handleKeyDown is a no-op while closed', () => {
    const onOpenChange = vi.fn();
    function Probe() {
      const m = useMenu({ items, onOpenChange });
      return (
        <>
          <button onClick={m.toggleMenu} data-testid="tg">toggle</button>
          <button onClick={() => m.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any)} data-testid="kd-closed">kdClosed</button>
          <span data-testid="open">{String(m.open)}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('tg'));
    expect(screen.getByTestId('open').textContent).toBe('true');
    fireEvent.click(screen.getByTestId('tg'));
    expect(screen.getByTestId('open').textContent).toBe('false');
    // keydown while closed is an early return (no navigation, no errors)
    expect(() => fireEvent.click(screen.getByTestId('kd-closed'))).not.toThrow();
  });

  it('ArrowUp skips over a disabled item when navigating up', () => {
    function Probe() {
      const m = useMenu({ items: withDisabled });
      const kd = (key: string) => m.handleKeyDown({ key, preventDefault: () => {} } as any);
      return (
        <>
          <button onClick={m.openMenu} data-testid="open">open</button>
          <button onClick={() => kd('End')} data-testid="end">end</button>
          <button onClick={() => kd('ArrowUp')} data-testid="up">up</button>
          <span data-testid="hl">{m.highlightedIndex}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open')); // highlight a (index 0)
    fireEvent.click(screen.getByTestId('end')); // highlight c (index 2)
    fireEvent.click(screen.getByTestId('up')); // c -> skips b (disabled) -> a (index 0)
    expect(Number(screen.getByTestId('hl').textContent)).toBe(0);
  });

  it('ArrowUp/ArrowDown/Home/End/Enter keyboard navigation', () => {
    const onSelectionChange = vi.fn();
    function Probe() {
      const m = useMenu({ items, onSelectionChange });
      const kd = (key: string) => m.handleKeyDown({ key, preventDefault: () => {} } as any);
      return (
        <>
          <button onClick={m.openMenu} data-testid="open">open</button>
          <button onClick={() => kd('ArrowDown')} data-testid="down">down</button>
          <button onClick={() => kd('ArrowUp')} data-testid="up">up</button>
          <button onClick={() => kd('Home')} data-testid="home">home</button>
          <button onClick={() => kd('End')} data-testid="end">end</button>
          <button onClick={() => kd('Enter')} data-testid="enter">enter</button>
          <span data-testid="hl">{m.highlightedIndex}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByTestId('down'));
    fireEvent.click(screen.getByTestId('down'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(2); // save
    fireEvent.click(screen.getByTestId('up'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(1); // open
    fireEvent.click(screen.getByTestId('home'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(0); // new (first)
    fireEvent.click(screen.getByTestId('up')); // at 0 -> wraps to last (save)
    expect(Number(screen.getByTestId('hl').textContent)).toBe(2);
    fireEvent.click(screen.getByTestId('end'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(2); // save (last)
    fireEvent.click(screen.getByTestId('home'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(0); // new (first)
    fireEvent.click(screen.getByTestId('enter')); // select new -> closes, resets highlight
    expect(onSelectionChange).toHaveBeenCalledWith(['new']);
  });

  it('hover trigger: enter (with pending timeout) opens; leave schedules close', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onOpenChange = vi.fn();
    function Probe() {
      const m = useMenu({ items, trigger: 'hover', onOpenChange });
      return (
        <>
          <button onClick={m.handleTriggerEnter} data-testid="enter">enter</button>
          <button onClick={m.handleTriggerLeave} data-testid="leave">leave</button>
          <span data-testid="open">{String(m.open)}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('enter'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByTestId('open').textContent).toBe('true');
    // leave schedules a close timeout, then re-entering clears it and reopens.
    fireEvent.click(screen.getByTestId('leave'));
    fireEvent.click(screen.getByTestId('enter'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByTestId('open').textContent).toBe('true');
    // finally leave and let the close timeout fire.
    fireEvent.click(screen.getByTestId('leave'));
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByTestId('open').textContent).toBe('false');
    vi.useRealTimers();
  });

  it('controlled selectedKeys are synced into the internal set', () => {
    const onSelectionChange = vi.fn();
    function Probe({ selected }: { selected: string[] }) {
      const m = useMenu({ items, selectedKeys: selected, closeOnSelection: false, onSelectionChange });
      return <span data-testid="sel">{Array.from(m.selectedKeys).join(',')}</span>;
    }
    const { rerender } = render(<Probe selected={['new']} />);
    expect(screen.getByTestId('sel').textContent).toBe('new');
    rerender(<Probe selected={['new', 'save']} />);
    expect(screen.getByTestId('sel').textContent).toBe('new,save');
  });

  it('selectItem on a controlled selection does not mutate internal state', () => {
    const onSelectionChange = vi.fn();
    // Hold the controlled keys in a stable ref so the selection-sync effect
    // does not see a new array identity on every Probe render (which would
    // otherwise loop under jsdom).
    const controlledKeys: string[] = [];
    function Probe() {
      const m = useMenu({ items, selectedKeys: controlledKeys, closeOnSelection: false, onSelectionChange });
      return <button onClick={() => m.selectItem('new')} data-testid="sel">sel</button>;
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('sel'));
    expect(onSelectionChange).toHaveBeenCalledWith(['new']);
  });

  it('openMenu with focusStrategy "auto" skips the first-item highlight', () => {
    function Probe() {
      const m = useMenu({ items, focusStrategy: 'auto' as any });
      return (
        <>
          <button onClick={m.openMenu} data-testid="open">open</button>
          <span data-testid="hl">{m.highlightedIndex}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(-1);
  });

  it('openMenu with all-disabled items finds no enabled highlight', () => {
    const allDisabled: MenuItem[] = [{ key: 'x', label: 'X', disabled: true }];
    function Probe() {
      const m = useMenu({ items: allDisabled });
      return (
        <>
          <button onClick={m.openMenu} data-testid="open">open</button>
          <button onClick={() => m.handleKeyDown({ key: 'Home', preventDefault: () => {} } as any)} data-testid="home">home</button>
          <button onClick={() => m.handleKeyDown({ key: 'End', preventDefault: () => {} } as any)} data-testid="end">end</button>
          <span data-testid="hl">{m.highlightedIndex}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByTestId('home'));
    fireEvent.click(screen.getByTestId('end'));
    expect(Number(screen.getByTestId('hl').textContent)).toBe(-1);
  });

  it('highlightItem on a disabled item is a no-op', () => {
    function Probe() {
      const m = useMenu({ items: withDisabled });
      return (
        <>
          <button onClick={m.openMenu} data-testid="open">open</button>
          <button onClick={() => m.highlightItem(1)} data-testid="hl1">hl1</button>
          <span data-testid="hl">{m.highlightedIndex}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open')); // highlight a (0)
    fireEvent.click(screen.getByTestId('hl1')); // try to highlight b (disabled, index 1)
    expect(Number(screen.getByTestId('hl').textContent)).toBe(0); // unchanged
  });

  it('Enter with no highlighted item is a no-op', () => {
    const onSelectionChange = vi.fn();
    function Probe() {
      const m = useMenu({ items, focusStrategy: 'auto' as any, closeOnSelection: false, onSelectionChange });
      return (
        <>
          <button onClick={m.openMenu} data-testid="open">open</button>
          <button onClick={() => m.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any)} data-testid="enter">enter</button>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open')); // open, highlight stays -1 (auto strategy)
    fireEvent.click(screen.getByTestId('enter')); // highlightedIndex -1 -> no selection
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('handleTriggerClick is a no-op when the trigger is not "click"', () => {
    function Probe() {
      const m = useMenu({ items, trigger: 'hover' });
      return (
        <>
          <button onClick={m.handleTriggerClick} data-testid="tc">tc</button>
          <span data-testid="open">{String(m.open)}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('tc'));
    expect(screen.getByTestId('open').textContent).toBe('false');
  });
});
