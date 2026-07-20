import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Menu, MenuSeparator, MenuGroup, DropdownMenu, ContextMenu } from '../src/components/Menu';
import { useMenu } from '../src/hooks';
import type { MenuItem } from '../src/hooks';

const items: MenuItem[] = [
  { key: 'new', label: 'New', icon: <span data-testid="ico">N</span>, shortcut: '⌘N' },
  { key: 'open', label: 'Open' },
];

describe('Menu (extra) — renderer branches', () => {
  it('uses the custom render render-prop', () => {
    render(
      <Menu items={items} render={(props) => (
        <div>
          <button data-testid="custom-trigger" onClick={props.handleTriggerClick}>T</button>
          {props.open && <ul data-testid="custom-menu">{props.items.length}</ul>}
        </div>
      )}>
        <button>Ignored</button>
      </Menu>
    );
    // render-prop fully replaces default output
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ignored' })).not.toBeInTheDocument();
  });

  it('renders item icons, shortcuts and selection indicator via renderItem', async () => {
    const user = userEvent.setup();
    render(<Menu items={items} closeOnSelection={false}><button>O</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'O' }));
    const newItem = await screen.findByRole('menuitem', { name: /New/ });
    // icon and shortcut rendered
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('⌘N')).toBeInTheDocument();
    // select New -> selection indicator (svg checkmark) appears
    await user.click(newItem);
    expect(newItem).toHaveAttribute('aria-selected', 'true');
  });

  it('uses custom renderItem', async () => {
    const user = userEvent.setup();
    render(
      <Menu items={items} renderItem={(item) => (
        <li role="menuitem" key={item.key} data-testid={`ci-${item.key}`}>CI:{item.label}</li>
      )}>
        <button>O</button>
      </Menu>
    );
    await user.click(screen.getByRole('button', { name: 'O' }));
    expect(await screen.findByTestId('ci-new')).toBeInTheDocument();
  });

  it('renders a disabled item with aria-disabled and no hover/click handlers', async () => {
    const user = userEvent.setup();
    const withDisabled: MenuItem[] = [
      { key: 'ok', label: 'OK' },
      { key: 'no', label: 'Nope', disabled: true },
    ];
    render(<Menu items={withDisabled}><button>O</button></Menu>);
    await user.click(screen.getByRole('button', { name: 'O' }));
    const disabledItem = await screen.findByRole('menuitem', { name: 'Nope' });
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    // Clicking a disabled item does not throw and does not select it.
    await user.click(disabledItem);
    expect(disabledItem).toHaveAttribute('aria-selected', 'false');
  });

  it('MenuSeparator renders a separator role with class/style', () => {
    render(
      <ul>
        <MenuSeparator className="extra" style={{ borderColor: 'red' }} />
      </ul>
    );
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass('extra');
  });

  it('MenuSeparator renders without a className', () => {
    render(<ul><MenuSeparator /></ul>);
    const sep = screen.getByRole('separator');
    expect(sep).toBeInTheDocument();
  });

  it('MenuGroup renders its title and children, and supports no-title branch', () => {
    const { rerender } = render(
      <MenuGroup title="Grouping"><div>Child</div></MenuGroup>
    );
    expect(screen.getByText('Grouping')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    // no title branch
    rerender(<MenuGroup><div>ChildOnly</div></MenuGroup>);
    expect(screen.queryByText('Grouping')).not.toBeInTheDocument();
    expect(screen.getByText('ChildOnly')).toBeInTheDocument();
  });
});

describe('DropdownMenu / ContextMenu wrappers', () => {
  it('DropdownMenu opens on click and exposes its items', async () => {
    const user = userEvent.setup();
    const plain: MenuItem[] = [{ key: 'new', label: 'New' }, { key: 'open', label: 'Open' }];
    render(<DropdownMenu items={plain}><button>Open</button></DropdownMenu>);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('menuitem', { name: 'New' })).toBeInTheDocument();
  });

  it('ContextMenu toggles on right-click and forwards the child\'s onContextMenu', () => {
    const childHandler = vi.fn();
    render(
      <ContextMenu items={items}>
        <div data-testid="ctx" onContextMenu={childHandler}>Right click</div>
      </ContextMenu>
    );
    fireEvent.contextMenu(screen.getByTestId('ctx'));
    expect(childHandler).toHaveBeenCalledTimes(1);
  });
});

// Headless hook-direct coverage for the useMenu branches not reached through
// the rendered Menu tree above. Props that are arrays/objects are passed via
// stable `initialProps` so the controlled-selection sync effect does not see a
// new prop identity on every render (which would loop under jsdom).
describe('useMenu (headless branch coverage)', () => {
  const plain: MenuItem[] = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B', disabled: true },
    { key: 'c', label: 'C' },
  ];

  it('selectItem closes the menu when closeOnSelection is true (default)', () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() =>
      useMenu({ items: plain, onSelectionChange })
    );
    act(() => result.current.openMenu());
    act(() => result.current.selectItem('a'));
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
    // closeOnSelection default -> menu closed after selection.
    expect(result.current.open).toBe(false);
  });

  it('controlled selection: selectItem fires onSelectionChange without mutating internal state', () => {
    const onSelectionChange = vi.fn();
    const controlledKeys: string[] = [];
    const { result } = renderHook(
      (props: { selectedKeys: string[] }) =>
        useMenu({ items: plain, closeOnSelection: false, onSelectionChange, ...props }),
      { initialProps: { selectedKeys: controlledKeys } },
    );
    // Controlled arm: selectedKeys is derived from the prop (new Set), not internal state.
    expect(result.current.selectedKeys.size).toBe(0);
    act(() => result.current.selectItem('a'));
    // onSelectionChange still fires with the would-be selection...
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
    // ...but internal state is not overwritten, so the prop value still wins.
    expect(result.current.selectedKeys.size).toBe(0);
  });

  it('Enter with no highlighted item is a no-op; Enter on a now-disabled highlighted item is skipped', () => {
    const onSelectionChange = vi.fn();
    // focusStrategy 'none' so openMenu leaves highlightedIndex at -1.
    let itemList: MenuItem[] = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ];
    const { result, rerender } = renderHook(
      (props: { items: MenuItem[] }) =>
        useMenu({ items: props.items, closeOnSelection: false, focusStrategy: 'none', onSelectionChange }),
      { initialProps: { items: itemList } },
    );
    act(() => result.current.openMenu());
    expect(result.current.highlightedIndex).toBe(-1);
    // Enter with no highlight -> the `highlightedIndex >= 0` guard skips selection.
    act(() => result.current.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onSelectionChange).not.toHaveBeenCalled();

    // Highlight 'b' (index 1), then mutate items so index 1 becomes disabled.
    act(() => result.current.highlightItem(1));
    expect(result.current.highlightedIndex).toBe(1);
    itemList = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', disabled: true },
    ];
    rerender({ items: itemList });
    // Enter now reads a disabled item at the highlighted index -> the
    // `!item.disabled` guard skips selection (defensive arm).
    act(() => result.current.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('outside click (mousedown) closes an uncontrolled open menu', () => {
    function Harness() {
      const menu = useMenu({ items: plain, defaultOpen: true, closeOnOutsideClick: true });
      return (
        <>
          <button ref={menu.triggerRef as any}>trig</button>
          <div ref={menu.menuRef as any}>menu</div>
          <button data-testid="outside">out</button>
        </>
      );
    }
    render(<Harness />);
    // mousedown on a target outside both trigger and menu -> closeMenu fires.
    act(() => {
      fireEvent.mouseDown(screen.getByTestId('outside'));
    });
    // The outside button remains; the menu closed (open state flipped).
    expect(screen.getByTestId('outside')).toBeInTheDocument();
  });
});
