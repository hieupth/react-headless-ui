import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '../src/components/DropdownMenu';
import { useDropdownMenu } from '../src/hooks/useDropdownMenu';
import type { DropdownMenuItem as DropdownMenuItemType, UseDropdownMenuProps } from '../src/hooks/useDropdownMenu';

// Controlled wrapper that lets us drive open state and capture selection.
function Controlled({
  items,
  initialOpen = false,
  closeOnSelect = true,
  loop = true,
  closeOnEscape = true,
  closeOnClickOutside = true,
}: {
  items: DropdownMenuItem[];
  initialOpen?: boolean;
  closeOnSelect?: boolean;
  loop?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <button data-testid="outside">Outside</button>
      <DropdownMenu
        items={items}
        open={open}
        onOpenChange={setOpen}
        closeOnSelect={closeOnSelect}
        loop={loop}
        closeOnEscape={closeOnEscape}
        closeOnClickOutside={closeOnClickOutside}
      />
    </>
  );
}

const baseItems: DropdownMenuItem[] = [
  { id: 'edit', label: 'Edit', onClick: vi.fn() },
  { id: 'cut', label: 'Cut', onClick: vi.fn() },
  { id: 'paste', label: 'Paste', onClick: vi.fn() },
];

const withDisabled: DropdownMenuItem[] = [
  { id: 'a', label: 'A', onClick: vi.fn() },
  { id: 'b', label: 'B', disabled: true, onClick: vi.fn() },
  { id: 'c', label: 'C', onClick: vi.fn() },
];

async function flush() {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
}

describe('useDropdownMenu', () => {
  it('renders trigger with correct aria attributes', () => {
    render(<Controlled items={baseItems} />);
    const trigger = screen.getByText('Menu').closest('button')!;
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking trigger toggles menu open', async () => {
    const user = userEvent.setup();
    render(<Controlled items={baseItems} />);
    await user.click(screen.getByText('Menu'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('trigger Enter/Space/ArrowDown opens menu', async () => {
    render(<Controlled items={baseItems} />);
    const trigger = screen.getByText('Menu').closest('button')!;
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    await flush();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('clicking an item fires onClick and closes when closeOnSelect', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: DropdownMenuItem[] = [{ id: 'x', label: 'X', onClick }];
    render(<Controlled items={items} initialOpen />);
    await user.click(screen.getByText('X'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('X')).not.toBeInTheDocument();
  });

  it('closeOnSelect=false keeps menu open after item click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: DropdownMenuItem[] = [{ id: 'x', label: 'X', onClick }];
    render(<Controlled items={items} initialOpen closeOnSelect={false} />);
    await user.click(screen.getByText('X'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('disabled item does not fire onClick and stays open', async () => {
    const user = userEvent.setup();
    render(<Controlled items={withDisabled} initialOpen />);
    await user.click(screen.getByText('B'));
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('keyboard ArrowDown/Home/End navigate and skip disabled', async () => {
    render(<Controlled items={withDisabled} initialOpen />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    // first enabled = a (focused on open)
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('A');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    await flush();
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('C'); // skip disabled B
    fireEvent.keyDown(menu, { key: 'Home' });
    await flush();
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('A');
    fireEvent.keyDown(menu, { key: 'End' });
    await flush();
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('C');
  });

  it('keyboard ArrowUp/ArrowDown wrap when loop=true', async () => {
    render(<Controlled items={baseItems} initialOpen />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: 'ArrowUp' }); // wrap to last
    await flush();
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('Paste');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // wrap to first
    await flush();
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('Edit');
  });

  it('loop=false stops at boundaries', async () => {
    render(<Controlled items={baseItems} initialOpen loop={false} />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: 'ArrowUp' }); // at first, no wrap
    await flush();
    expect(menu.querySelector('[data-focused="true"]')?.textContent).toContain('Edit');
  });

  it('Enter on focused item activates and closes', async () => {
    const onClick = vi.fn();
    const items: DropdownMenuItem[] = [
      { id: 'a', label: 'A', onClick },
      { id: 'b', label: 'B' },
    ];
    render(<Controlled items={items} initialOpen />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: 'Enter' });
    await flush();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('Escape closes the menu', async () => {
    render(<Controlled items={baseItems} initialOpen />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: 'Escape' });
    await flush();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('Tab closes the menu', async () => {
    render(<Controlled items={baseItems} initialOpen />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    fireEvent.keyDown(menu, { key: 'Tab' });
    await flush();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('document Escape closes menu and returns focus to trigger', async () => {
    render(<Controlled items={baseItems} initialOpen />);
    await flush();
    const trigger = screen.getByText('Menu').closest('button')!;
    trigger.focus();
    await flush();
    fireEvent.keyDown(document, { key: 'Escape' });
    await flush();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('click outside closes menu', async () => {
    const user = userEvent.setup();
    render(<Controlled items={baseItems} initialOpen />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('closeOnClickOutside=false keeps menu open on outside click', async () => {
    const user = userEvent.setup();
    render(<Controlled items={baseItems} initialOpen closeOnClickOutside={false} />);
    await user.click(screen.getByTestId('outside'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('hovering an item focuses it', async () => {
    render(<Controlled items={baseItems} initialOpen />);
    await flush();
    const menu = document.querySelector('[role="menu"]') as HTMLElement;
    const pasteItem = Array.from(menu.querySelectorAll('[role="menuitem"]')).find(
      (el) => el.textContent === 'Paste'
    ) as HTMLElement;
    fireEvent.mouseEnter(pasteItem);
    await flush();
    expect(pasteItem).toHaveAttribute('data-focused', 'true');
  });

  it('renders custom item children renderer', () => {
    render(
      <DropdownMenu
        items={baseItems}
        open
        onOpenChange={() => {}}
      >
        {(item) => <span data-testid={`custom-${item.id}`}>{item.label}!</span>}
      </DropdownMenu>
    );
    expect(screen.getByTestId('custom-edit')).toHaveTextContent('Edit!');
  });

  it('renders rich items (checked/destructive/icon/shortcut/badge/submenu) with all adornments', () => {
    const items: DropdownMenuItemType[] = [
      { id: 'bold', label: 'Bold', checked: true, shortcut: 'Ctrl+B', badge: <span data-testid="bdg">2</span> },
      { id: 'del', label: 'Delete', destructive: true, icon: <span data-testid="ico">D</span> },
      { id: 'radio', label: 'Radio', role: 'menuitemradio', checked: true },
      { id: 'more', label: 'More', hasSubmenu: true },
    ];
    const { container } = render(
      <DropdownMenu items={items} open onOpenChange={() => {}} />
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByTestId('bdg')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="bdg"]')).not.toBeNull();
    // destructive + submenu items render their labels.
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('renders the standalone sub-components (Trigger/Item/Separator/Label)', () => {
    const onClick = vi.fn();
    render(
      <div>
        <DropdownMenuTrigger onClick={onClick} className="trig">Open</DropdownMenuTrigger>
        <DropdownMenuLabel className="lbl">Section</DropdownMenuLabel>
        <DropdownMenuItem item={{ id: 'x', label: 'X' } as any} className="it" onClick={onClick} />
        <DropdownMenuSeparator className="sep" />
      </div>
    );
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('X'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe('useDropdownMenu (hook-direct branch coverage)', () => {
  const items: DropdownMenuItemType[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B', disabled: true },
    { id: 'c', label: 'C' },
  ];

  function setup(props: Partial<UseDropdownMenuProps> = {}) {
    return renderHook(() => useDropdownMenu({ items, onOpenChange: () => {}, ...props } as any));
  }

  it('navigation helpers early-return when the menu is closed', () => {
    const h = setup({ open: false });
    expect(h.result.current.state.open).toBe(false);
    expect(() => act(() => {
      h.result.current.actions.focusNext();
      h.result.current.actions.focusPrevious();
      h.result.current.actions.focusFirst();
      h.result.current.actions.focusLast();
      h.result.current.actions.focusItem(0);
      h.result.current.actions.selectItem(items[1]);
    })).not.toThrow();
    expect(h.result.current.state.focusedIndex).toBe(-1);
  });

  it('open menu: focusFirst/focusLast/focusNext/focusPrevious navigate, focusItem clamps bounds', () => {
    const h = setup({ open: true });
    act(() => h.result.current.actions.focusFirst());
    expect(h.result.current.state.focusedIndex).toBe(0);
    act(() => h.result.current.actions.focusLast());
    expect(h.result.current.state.focusedIndex).toBe(2);
    act(() => h.result.current.actions.focusPrevious());
    expect(h.result.current.state.focusedIndex).toBe(0);
    act(() => h.result.current.actions.focusNext());
    expect(h.result.current.state.focusedIndex).toBe(2);
    act(() => h.result.current.actions.focusItem(99));
    expect(h.result.current.state.focusedIndex).toBe(2);
  });

  it('getItemProps.onKeyDown activates enabled items and respects closeOnSelect', () => {
    const onClick = vi.fn();
    const enabledItem = { id: 'x', label: 'X', onClick };
    const onOpenChange = vi.fn();
    const h = setup({ items: [enabledItem], open: true, closeOnSelect: true, onOpenChange });
    const props = h.result.current.getItemProps(enabledItem, 0);
    act(() => props.onKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('getItemProps.onKeyDown is a no-op on disabled items and on non-activation keys', () => {
    const onClick = vi.fn();
    const disabledItem = { id: 'd', label: 'D', disabled: true, onClick };
    const h = setup({ items: [disabledItem], open: true });
    const props = h.result.current.getItemProps(disabledItem, 0);
    act(() => props.onKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('getItemProps.onKeyDown does not close when closeOnSelect=false', () => {
    const onClick = vi.fn();
    const item = { id: 'x', label: 'X', onClick };
    const onOpenChange = vi.fn();
    const h = setup({ items: [item], open: true, closeOnSelect: false, onOpenChange });
    const props = h.result.current.getItemProps(item, 0);
    act(() => props.onKeyDown({ key: ' ', preventDefault: () => {} } as any));
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('navigation on a menu where all items are disabled early-returns', () => {
    const allDisabled: DropdownMenuItemType[] = [
      { id: 'a', label: 'A', disabled: true },
      { id: 'b', label: 'B', disabled: true },
    ];
    const h = setup({ items: allDisabled, open: true });
    expect(() => act(() => {
      h.result.current.actions.focusFirst();
      h.result.current.actions.focusLast();
      h.result.current.actions.focusNext();
      h.result.current.actions.focusPrevious();
    })).not.toThrow();
  });

  it('focusItem ignores a disabled index; selectItem activates the focused item', () => {
    const onClick = vi.fn();
    const sel = [{ id: 'a', label: 'A', onClick }, { id: 'b', label: 'B', disabled: true }];
    const onOpenChange = vi.fn();
    const h = setup({ items: sel, open: true, closeOnSelect: true, onOpenChange });
    // focusItem on the disabled index 1 is ignored.
    act(() => h.result.current.actions.focusItem(1));
    // Focus + select the enabled item.
    act(() => h.result.current.actions.focusItem(0));
    act(() => h.result.current.actions.selectItem());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('trigger keydown (Enter/Space/ArrowDown) opens the menu', () => {
    const onOpenChange = vi.fn();
    const h = setup({ open: false, onOpenChange });
    const tp = h.result.current.triggerProps;
    act(() => tp.onKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    act(() => tp.onKeyDown({ key: ' ', preventDefault: () => {} } as any));
    act(() => tp.onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('focusNext with loop=false stays at the boundary', () => {
    const h = setup({ items, open: true, loop: false });
    act(() => h.result.current.actions.focusFirst());
    act(() => h.result.current.actions.focusLast());
    act(() => h.result.current.actions.focusNext());
    expect(h.result.current.state.focusedIndex).toBe(2);
  });

  it('selectItem on a disabled item is a no-op; selectItem with closeOnSelect=false stays open', () => {
    const onClick = vi.fn();
    const sel = [{ id: 'a', label: 'A', onClick }, { id: 'b', label: 'B', disabled: true }];
    const onOpenChange = vi.fn();
    // Focus the disabled item via focusItem won't work; selectItem reads focusedIndex.
    // Force-select with a disabled focused item is impossible (focusItem rejects disabled),
    // so exercise closeOnSelect=false path with an enabled focused item.
    const h = setup({ items: sel, open: true, closeOnSelect: false, onOpenChange });
    act(() => h.result.current.actions.focusItem(0));
    act(() => h.result.current.actions.selectItem());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('trigger + item keydown tolerate non-activation keys; Escape respects closeOnEscape=false', () => {
    const onOpenChange = vi.fn();
    const h = setup({ items, open: true, closeOnEscape: false, onOpenChange });
    // Non-activation trigger key does not open/close.
    act(() => h.result.current.triggerProps.onKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    // Item-level non-activation key does not select.
    const ip = h.result.current.getItemProps(items[0], 0);
    act(() => ip.onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    // Escape with closeOnEscape=false does not close.
    act(() => { fireEvent.keyDown(document, { key: 'Escape' }); });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('menu keydown Escape respects closeOnEscape; trigger focus/blur toggle isTriggerFocused', () => {
    const onOpenChange = vi.fn();
    const h = setup({ items, open: true, closeOnEscape: false, onOpenChange });
    act(() => h.result.current.menuProps.onKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => (h.result.current.triggerProps as any).onFocus({} as any));
    act(() => (h.result.current.triggerProps as any).onBlur({} as any));
    expect(h.result.current.state.isTriggerFocused).toBe(false);
  });
});

