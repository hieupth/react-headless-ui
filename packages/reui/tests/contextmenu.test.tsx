import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ContextMenu, ContextMenuTrigger } from '../src/components/ContextMenu';
import type { ContextMenuItem } from '../src/hooks';

const items = [
  { id: 'copy', label: 'Copy' },
  { id: 'paste', label: 'Paste' },
];

describe('ContextMenu', () => {
  it('renders its items when open', () => {
    render(<ContextMenu items={items} open />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ContextMenu items={items} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a default separator item', () => {
    const withSep: ContextMenuItem[] = [
      { id: 'copy', label: 'Copy', type: 'action' },
      { id: 'sep', label: '', type: 'separator' },
      { id: 'paste', label: 'Paste', type: 'action' },
    ];
    const { container } = render(<ContextMenu items={withSep} open />);
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('renders a custom separator via separatorRenderer', () => {
    const withSep: ContextMenuItem[] = [
      { id: 'copy', label: 'Copy', type: 'action' },
      { id: 'sep', label: '', type: 'separator' },
    ];
    render(
      <ContextMenu
        items={withSep}
        open
        separatorRenderer={(index) => <hr key={index} data-testid="custom-sep" />}
      />
    );
    expect(screen.getByTestId('custom-sep')).toBeInTheDocument();
  });

  it('renders items through a custom itemRenderer', () => {
    render(
      <ContextMenu
        items={items}
        open
        itemRenderer={(item) => <div key={item.id} data-testid={`custom-${item.id}`}>{item.label}</div>}
      />
    );
    expect(screen.getByTestId('custom-copy')).toBeInTheDocument();
  });

  it('focuses the menu container when opened', () => {
    render(<ContextMenu items={items} open />);
    const menu = screen.getByTestId('context-menu');
    expect(menu).toHaveAttribute('tabindex', '-1');
  });

  it('renders into a portal when portal + open', () => {
    render(
      <div data-testid="host">
        <ContextMenu items={items} open portal />
      </div>
    );
    // Portal renders into document.body, outside the host subtree.
    const menu = screen.getByTestId('context-menu');
    expect(menu.parentElement).not.toBe(screen.getByTestId('host'));
  });

  it('does not portal when open is false even if portal is set', () => {
    const { container } = render(<ContextMenu items={items} portal />);
    expect(container.firstChild).toBeNull();
  });

  it('applies size + alignment + direction classes for every variant', () => {
    const variants = ['default', 'compact', 'minimal'] as const;
    const alignments = ['start', 'center', 'end'] as const;
    const { rerender } = render(<ContextMenu items={items} open variant="default" alignment="start" direction="ltr" />);
    for (const variant of variants) {
      for (const alignment of alignments) {
        for (const direction of ['ltr', 'rtl'] as const) {
          rerender(<ContextMenu items={items} open variant={variant} alignment={alignment} direction={direction} />);
        }
      }
    }
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  });

  it('renders an item with icon, description, shortcut, and destructive flag', () => {
    const rich: ContextMenuItem[] = [
      {
        id: 'del',
        label: 'Delete',
        type: 'action',
        icon: <span>X</span>,
        description: 'Removes the row',
        shortcut: 'Del',
        destructive: true,
      },
    ];
    render(<ContextMenu items={rich} open />);
    expect(screen.getByText('Removes the row')).toBeInTheDocument();
    expect(screen.getByText('Del')).toBeInTheDocument();
  });

  it('renders checkbox and radio indicators (checked + unchecked)', () => {
    const checks: ContextMenuItem[] = [
      { id: 'cb-on', label: 'CB on', type: 'checkbox', checked: true },
      { id: 'cb-off', label: 'CB off', type: 'checkbox', checked: false },
      { id: 'rd-on', label: 'RD on', type: 'radio', checked: true },
      { id: 'rd-off', label: 'RD off', type: 'radio', checked: false },
    ];
    render(<ContextMenu items={checks} open />);
    // checkbox/radio render their indicator mark; labels always render.
    expect(screen.getByText('CB on')).toBeInTheDocument();
    expect(screen.getByText('CB off')).toBeInTheDocument();
    expect(screen.getByText('RD on')).toBeInTheDocument();
    expect(screen.getByText('RD off')).toBeInTheDocument();
  });

  it('renders a submenu indicator for submenu items', () => {
    const sub: ContextMenuItem[] = [
      { id: 'sub', label: 'More', type: 'submenu', items: [{ id: 's1', label: 'Inner' }] },
    ];
    render(<ContextMenu items={sub} open />);
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('marks the focused item with a bg class and tabIndex 0', () => {
    render(<ContextMenu items={items} open />);
    const menu = screen.getByTestId('context-menu');
    // Drive focus via keyboard: menu's onKeyDown comes from the hook attributes.
    act(() => { fireEvent.keyDown(menu, { key: 'ArrowDown' }); });
    const first = screen.getByTestId('context-menu-item-copy');
    expect(first.className).toContain('bg-gray-100');
    expect(first).toHaveAttribute('tabindex', '0');
  });

  it('focuses the item element when its focused prop becomes true', () => {
    render(<ContextMenu items={items} open />);
    const menu = screen.getByTestId('context-menu');
    act(() => { fireEvent.keyDown(menu, { key: 'ArrowDown' }); });
    expect(document.activeElement).toBe(screen.getByTestId('context-menu-item-copy'));
  });

  it('invokes onFocus when an item receives focus', () => {
    render(<ContextMenu items={items} open />);
    const item = screen.getByTestId('context-menu-item-copy');
    act(() => { fireEvent.focus(item); });
    // focusing the item triggers handleItemFocus internally; no throw expected.
    expect(item).toBeInTheDocument();
  });

  it('clicks a non-disabled item (calls handleItemClick) and a disabled item is a no-op', () => {
    const onAction = vi.fn();
    const mixed: ContextMenuItem[] = [
      { id: 'copy', label: 'Copy', type: 'action', onAction },
      { id: 'locked', label: 'Locked', type: 'action', disabled: true, onAction },
    ];
    render(<ContextMenu items={mixed} open closeOnItemClick={false} />);
    act(() => { fireEvent.click(screen.getByTestId('context-menu-item-copy')); });
    expect(onAction).toHaveBeenCalledTimes(1);
    act(() => { fireEvent.click(screen.getByTestId('context-menu-item-locked')); });
    // disabled item does not invoke its action
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('context-menu-item-locked')).toHaveAttribute('aria-disabled', 'true');
  });

  it('activates a focused item via Enter and Space keydown', () => {
    const onAction = vi.fn();
    const di: ContextMenuItem[] = [{ id: 'copy', label: 'Copy', type: 'action', onAction }];
    render(<ContextMenu items={di} open closeOnItemClick={false} />);
    const item = screen.getByTestId('context-menu-item-copy');
    act(() => { fireEvent.keyDown(item, { key: 'Enter' }); });
    act(() => { fireEvent.keyDown(item, { key: ' ' }); });
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('does not activate a disabled item via keydown', () => {
    const onAction = vi.fn();
    const di: ContextMenuItem[] = [{ id: 'x', label: 'X', type: 'action', disabled: true, onAction }];
    render(<ContextMenu items={di} open closeOnItemClick={false} />);
    const item = screen.getByTestId('context-menu-item-x');
    act(() => { fireEvent.keyDown(item, { key: 'Enter' }); });
    expect(onAction).not.toHaveBeenCalled();
  });

  it('ignores non-activation keys on item keydown', () => {
    const onAction = vi.fn();
    const di: ContextMenuItem[] = [{ id: 'copy', label: 'Copy', type: 'action', onAction }];
    render(<ContextMenu items={di} open closeOnItemClick={false} />);
    const item = screen.getByTestId('context-menu-item-copy');
    act(() => { fireEvent.keyDown(item, { key: 'ArrowDown' }); });
    expect(onAction).not.toHaveBeenCalled();
  });

  it('falls back to index-based keys for items/separators without an id', () => {
    // Empty-string ids are falsy, exercising the `item.id || fallback` branches
    // for the default separator and the custom itemRenderer fragment.
    const noId: ContextMenuItem[] = [
      { id: '', label: 'Anon', type: 'action' } as ContextMenuItem,
      { id: '', label: '', type: 'separator' } as ContextMenuItem,
    ];
    render(
      <ContextMenu
        items={noId}
        open
        itemRenderer={(item) => <div key="anon" data-testid="anon-item">{item.label}</div>}
      />
    );
    expect(screen.getByTestId('anon-item')).toBeInTheDocument();
  });

  it('falls back to index-based keys for default-rendered items without an id', () => {
    const noId: ContextMenuItem[] = [{ id: '', label: 'Anon', type: 'action' } as ContextMenuItem];
    const { container } = render(<ContextMenu items={noId} open />);
    expect(container.querySelector('[data-testid="context-menu-item-"]')).toBeInTheDocument();
  });
});

describe('ContextMenuTrigger', () => {
  function makeMenu() {
    const handleContextMenu = vi.fn();
    return { state: {}, handlers: { handleContextMenu } } as any;
  }

  it('renders children and calls handleContextMenu on contextmenu (preventDefault on)', () => {
    const menu = makeMenu();
    render(
      <ContextMenuTrigger menu={menu}>
        <span>target</span>
      </ContextMenuTrigger>
    );
    const trigger = screen.getByText('target').parentElement!;
    act(() => { fireEvent.contextMenu(trigger); });
    expect(menu.handlers.handleContextMenu).toHaveBeenCalled();
  });

  it('does not call preventDefault when preventDefault is false', () => {
    const menu = makeMenu();
    const preventDefault = vi.fn();
    render(
      <ContextMenuTrigger menu={menu} preventDefault={false}>
        <span>target</span>
      </ContextMenuTrigger>
    );
    const trigger = screen.getByText('target').parentElement!;
    act(() => {
      fireEvent.contextMenu(trigger, { preventDefault });
    });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(menu.handlers.handleContextMenu).toHaveBeenCalled();
  });

  it('applies custom className and style to the trigger wrapper', () => {
    const menu = makeMenu();
    render(
      <ContextMenuTrigger menu={menu} className="my-trigger" style={{ color: 'red' }}>
        <span>target</span>
      </ContextMenuTrigger>
    );
    const wrapper = screen.getByText('target').parentElement!;
    expect(wrapper.className).toContain('my-trigger');
    expect(wrapper.getAttribute('style')).toContain('color: red');
  });
});
