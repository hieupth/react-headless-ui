import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '../src/components/DropdownMenu';
import type { DropdownMenuItem } from '../src/hooks';
import { useDropdownMenu as useDropdownMenuHook } from '../src/hooks';

const items: DropdownMenuItem[] = [
  { id: 'edit', label: 'Edit', onClick: vi.fn() },
  { id: 'copy', label: 'Copy', onClick: vi.fn() },
  { id: 'delete', label: 'Delete', onClick: vi.fn(), destructive: true },
];

const itemsWithDisabled: DropdownMenuItem[] = [
  { id: 'edit', label: 'Edit', onClick: vi.fn() },
  { id: 'copy', label: 'Copy', disabled: true, onClick: vi.fn() },
  { id: 'delete', label: 'Delete', onClick: vi.fn() },
];

// The hook tracks focusedIndex and reflects it via `data-focused` on items plus
// a roving tabindex, but does not call .focus() on the DOM. Keydown is driven
// against the menu container, and we assert the focused item via data-focused.
function focusedLabel() {
  const el = document.querySelector('[data-focused="true"]');
  return el ? el.textContent : null;
}

// Controlled wrapper that mirrors how a consumer drives the menu.
function ControlledMenu(props: {
  items: DropdownMenuItem[];
  initialOpen?: boolean;
  loop?: boolean;
  closeOnEscape?: boolean;
  closeOnSelect?: boolean;
  closeOnClickOutside?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(props.initialOpen ?? false);
  return (
    <div>
      <span data-testid="outside">outside-region</span>
      <DropdownMenu
        items={props.items}
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          props.onOpenChange?.(v);
        }}
        loop={props.loop}
        closeOnEscape={props.closeOnEscape}
        closeOnSelect={props.closeOnSelect}
        closeOnClickOutside={props.closeOnClickOutside}
      />
    </div>
  );
}

describe('DropdownMenu', () => {
  it('renders a menu trigger', () => {
    render(<DropdownMenu items={items} />);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('renders its items when open', () => {
    render(<DropdownMenu items={items} open />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('opens on trigger click and closes on a second click', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} />);
    await user.click(screen.getByText('Menu'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    await user.click(screen.getByText('Menu'));
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('opens the menu when the trigger receives ArrowDown/Enter', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} />);
    screen.getByText('Menu').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('navigates items with ArrowDown/ArrowUp and Home/End', () => {
    render(<ControlledMenu items={items} initialOpen closeOnSelect={false} />);
    const menu = screen.getByRole('menu');
    // First enabled item is focused on open.
    expect(focusedLabel()).toBe('Edit');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(focusedLabel()).toBe('Copy');

    fireEvent.keyDown(menu, { key: 'End' });
    expect(focusedLabel()).toBe('Delete');

    fireEvent.keyDown(menu, { key: 'Home' });
    expect(focusedLabel()).toBe('Edit');

    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    // With loop (default), ArrowUp from first wraps to last.
    expect(focusedLabel()).toBe('Delete');
  });

  it('selects the focused item on Enter and closes the menu', () => {
    render(<ControlledMenu items={items} initialOpen />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // Edit -> Copy
    fireEvent.keyDown(menu, { key: 'Enter' });
    // copy.onClick fires; closeOnSelect (default) closes the menu.
    expect(items[1].onClick).toHaveBeenCalled();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('selects the focused item on Space', () => {
    render(<ControlledMenu items={items} initialOpen />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: ' ' });
    expect(items[0].onClick).toHaveBeenCalled();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} initialOpen />);
    const menu = screen.getByRole('menu');
    const trigger = screen.getByText('Menu');
    // Focus the trigger so the hook registers it as focused for restoration.
    trigger.focus();
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    render(<ControlledMenu items={items} initialOpen closeOnEscape={false} />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('closes on Tab', () => {
    render(<ControlledMenu items={items} initialOpen />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Tab' });
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('closes on outside click when closeOnClickOutside is true', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} initialOpen closeOnClickOutside={true} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('does not close on outside click when closeOnClickOutside is false', async () => {
    const user = userEvent.setup();
    render(<ControlledMenu items={items} initialOpen closeOnClickOutside={false} />);
    await user.click(screen.getByTestId('outside'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('skips disabled items during arrow navigation', () => {
    render(<ControlledMenu items={itemsWithDisabled} initialOpen closeOnSelect={false} />);
    const menu = screen.getByRole('menu');
    expect(focusedLabel()).toBe('Edit');
    fireEvent.keyDown(menu, { key: 'ArrowDown' }); // Edit -> skips Copy (disabled) -> Delete
    expect(focusedLabel()).toBe('Delete');
  });

  it('does not activate a disabled item on Enter', () => {
    render(<ControlledMenu items={itemsWithDisabled} initialOpen closeOnSelect={false} />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'End' }); // Delete
    fireEvent.keyDown(menu, { key: 'ArrowUp' }); // wraps/skips to Edit
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(itemsWithDisabled[0].onClick).toHaveBeenCalled(); // Edit
    // Copy's onClick must never fire.
    expect(itemsWithDisabled[1].onClick).not.toHaveBeenCalled();
  });

  it('renders checkbox items with aria-checked', () => {
    const checkboxItems: DropdownMenuItem[] = [
      { id: 'bold', label: 'Bold', checked: true, role: 'menuitemcheckbox' },
    ];
    render(<DropdownMenu items={checkboxItems} open />);
    const item = screen.getByText('Bold').closest('[role="menuitemcheckbox"]')!;
    expect(item).toHaveAttribute('aria-checked', 'true');
  });

  it('renders radio items and submenu indicators', () => {
    const rich: DropdownMenuItem[] = [
      { id: 'left', label: 'Left', checked: true, role: 'menuitemradio' },
      { id: 'more', label: 'More', hasSubmenu: true, shortcut: 'Ctrl+M', badge: 'NEW' },
    ];
    render(<DropdownMenu items={rich} open />);
    expect(screen.getByText('Ctrl+M')).toBeInTheDocument();
    expect(screen.getByText('NEW')).toBeInTheDocument();
    // submenu indicator svg exists alongside the label.
    const more = screen.getByText('More').closest('[data-has-submenu="true"]');
    expect(more).not.toBeNull();
  });

  it('supports a custom children render function', () => {
    render(
      <DropdownMenu
        items={items}
        open
        closeOnSelect={false}
      >
        {(item) => <span data-testid={`custom-${item.id}`}>{item.label}</span>}
      </DropdownMenu>
    );
    expect(screen.getByTestId('custom-edit')).toBeInTheDocument();
  });

  it('keeps the menu open when closeOnSelect is false', () => {
    render(<ControlledMenu items={items} initialOpen closeOnSelect={false} />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(items[0].onClick).toHaveBeenCalled();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('disables looping when loop is false', () => {
    render(<ControlledMenu items={items} initialOpen loop={false} closeOnSelect={false} />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Home' }); // first
    fireEvent.keyDown(menu, { key: 'ArrowUp' }); // at first, loop off -> stays
    expect(focusedLabel()).toBe('Edit');
  });
});

// Direct hook coverage for actions and prop generators not all reachable via
// the component (focusItem, selectItem guards, arrowProps, label props).
describe('useDropdownMenu hook', () => {
  function setup(itemList: DropdownMenuItem[], opts: { open?: boolean; loop?: boolean } = {}) {
    const captured: { current: any } = { current: null };
    function Probe() {
      const [open, setOpen] = useState(opts.open ?? false);
      const result = useDropdownMenuHook({
        items: itemList,
        open,
        onOpenChange: setOpen,
        loop: opts.loop ?? true,
      });
      captured.current = result;
      return null;
    }
    render(<Probe />);
    return captured;
  }

  it('open/close/toggle delegate to onOpenChange', () => {
    const captured = setup(items);
    act(() => captured.current.actions.open());
    expect(captured.current.state.open).toBe(true);
    act(() => captured.current.actions.toggle());
    expect(captured.current.state.open).toBe(false);
    act(() => captured.current.actions.close());
    expect(captured.current.state.open).toBe(false);
  });

  it('focusItem ignores out-of-range and disabled indices', () => {
    const captured = setup(items, { open: true });
    act(() => captured.current.actions.focusItem(0));
    expect(captured.current.state.focusedIndex).toBe(0);
    act(() => captured.current.actions.focusItem(1));
    expect(captured.current.state.focusedIndex).toBe(1);
    // Disabled item -> ignored.
    const c2 = setup(itemsWithDisabled, { open: true });
    act(() => c2.current.actions.focusItem(1)); // Copy disabled
    expect(c2.current.state.focusedIndex).not.toBe(1);
    // Out-of-range -> ignored.
    act(() => c2.current.actions.focusItem(99));
    expect(c2.current.state.focusedIndex).not.toBe(99);
  });

  it('selectItem fires onClick on the focused item and closes when closeOnSelect', () => {
    const onClick = vi.fn();
    const localItems: DropdownMenuItem[] = [
      { id: 'x', label: 'X', onClick },
    ];
    function Probe() {
      const [open, setOpen] = useState(true);
      const result = useDropdownMenuHook({
        items: localItems,
        open,
        onOpenChange: setOpen,
        closeOnSelect: true,
      });
      (window as any).__r = result;
      return null;
    }
    render(<Probe />);
    const result = (window as any).__r;
    act(() => result.actions.selectItem());
    expect(onClick).toHaveBeenCalled();
  });

  it('focusNext/focusPrevious are no-ops when the menu is closed', () => {
    const captured = setup(items, { open: false });
    const before = captured.current.state.focusedIndex;
    act(() => captured.current.actions.focusNext());
    act(() => captured.current.actions.focusPrevious());
    act(() => captured.current.actions.focusFirst());
    act(() => captured.current.actions.focusLast());
    expect(captured.current.state.focusedIndex).toBe(before);
  });

  it('exposes arrow props and item label props', () => {
    const captured = setup(items, { open: true });
    expect(captured.current.arrowProps['data-arrow']).toBe(true);
    expect(captured.current.arrowProps['data-placement']).toBe('bottom');
    const labelProps = captured.current.getItemLabelProps(items[0], 0);
    expect(labelProps['data-label']).toBe(true);
    expect(labelProps['data-disabled']).toBeFalsy();
  });

  it('keyDown handler on the menu drives navigation and selection', () => {
    const onClick = vi.fn();
    const localItems: DropdownMenuItem[] = [
      { id: 'a', label: 'A', onClick },
      { id: 'b', label: 'B', onClick: vi.fn() },
    ];
    function Probe() {
      const [open, setOpen] = useState(true);
      const result = useDropdownMenuHook({
        items: localItems,
        open,
        onOpenChange: setOpen,
        closeOnSelect: false,
      });
      (window as any).__r = result;
      return null;
    }
    render(<Probe />);
    const result = (window as any).__r;
    const menuProps = result.menuProps;
    const prevent = () => {};
    act(() => menuProps.onKeyDown({ key: 'ArrowDown', preventDefault: prevent } as any));
    act(() => menuProps.onKeyDown({ key: 'Enter', preventDefault: prevent } as any));
    expect(onClick).toHaveBeenCalled();
  });
});
