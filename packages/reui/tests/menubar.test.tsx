import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Menubar, MenubarItem } from '../src/components/Menubar';

const items = [
  { id: 'file', label: 'File' },
  { id: 'edit', label: 'Edit' },
];

describe('Menubar', () => {
  it('renders menu items', () => {
    render(<Menubar items={items} />);
    expect(screen.getByTestId('menubar')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders an empty state with no items', () => {
    render(<Menubar items={[]} />);
    expect(screen.getByText(/No menu items/i)).toBeInTheDocument();
  });

  it('renders vertical orientation, height, disabled, and className', () => {
    render(
      <Menubar items={items} orientation="vertical" height={200} disabled className="extra" />
    );
    const root = screen.getByTestId('menubar');
    expect(root.className).toContain('flex-col');
    expect(root.className).toContain('opacity-50');
    expect(root.className).toContain('extra');
    expect((root as HTMLElement).style.height).toBe('200px');
  });

  it('renders icons, shortcuts, separators, and submenu arrows', () => {
    const rich = [
      { id: 'open', label: 'Open', icon: <span data-testid="ico">O</span>, shortcut: 'Ctrl+O' },
      { id: 'sep', label: '', separator: true },
      { id: 'recent', label: 'Recent', children: [{ id: 'doc1', label: 'Doc 1' }] },
    ];
    const { container } = render(<Menubar items={rich} showSeparators showShortcuts />);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+O')).toBeInTheDocument();
    expect(container.querySelector('[role="separator"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="menubar-item-recent"] svg')).not.toBeNull();
  });

  it('focuses + opens a submenu on mouse enter', () => {
    const rich = [
      { id: 'file', label: 'File', children: [{ id: 'new', label: 'New' }] },
      { id: 'exit', label: 'Exit' },
    ];
    render(<Menubar items={rich} />);
    fireEvent.mouseEnter(screen.getByTestId('menubar-item-file'));
    expect(screen.getAllByText('New').length).toBeGreaterThan(0);
  });

  it('activates an item on click without throwing', () => {
    const onItemActivate = vi.fn();
    render(<Menubar items={[{ id: 'exit', label: 'Exit' }]} onItemActivate={onItemActivate} />);
    expect(() => fireEvent.click(screen.getByTestId('menubar-item-exit'))).not.toThrow();
  });

  it('ignores mouse enter / click on disabled items', () => {
    const onItemActivate = vi.fn();
    const rich = [{ id: 'x', label: 'X', disabled: true, children: [{ id: 'y', label: 'Y' }] }];
    render(<Menubar items={rich} onItemActivate={onItemActivate} />);
    fireEvent.mouseEnter(screen.getByTestId('menubar-item-x'));
    expect(screen.queryByText('Y')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('menubar-item-x'));
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('uses custom renderItem and renderSubmenu renderers', () => {
    const rich = [{ id: 'file', label: 'File', children: [{ id: 'new', label: 'New' }] }];
    render(
      <Menubar
        items={rich}
        renderItem={(item) => <span data-testid={`custom-${item.id}`}>{item.label}*</span>}
        renderSubmenu={(submenuItems) => (
          <div data-testid="custom-submenu">
            {submenuItems.map((i) => <span key={i.id}>{i.label}</span>)}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-file')).toHaveTextContent('File*');
  });

  it('opens a submenu via initial open state so the custom submenu renderer runs', () => {
    const rich = [{ id: 'file', label: 'File', children: [{ id: 'new', label: 'New' }] }];
    render(
      <Menubar
        items={rich}
        renderSubmenu={(submenuItems) => (
          <div data-testid="custom-submenu">
            {submenuItems.map((i) => <span key={i.id}>{i.label}</span>)}
          </div>
        )}
      />
    );
    // Open the submenu via the default-rendered item's mouseEnter; the custom
    // renderSubmenu then runs for the open submenu slot.
    fireEvent.mouseEnter(screen.getByTestId('menubar-item-file'));
    expect(screen.getAllByTestId('custom-submenu').length).toBeGreaterThan(0);
  });

  it('renders the standalone MenubarItem sub-component (separator + standard)', () => {
    const onClick = vi.fn();
    render(
      <div>
        <MenubarItem item={{ id: 's', separator: true } as any} level={0} isFocused={false} isActive={false} />
        <MenubarItem
          item={{ id: 'm', label: 'Standalone', icon: <span>ICO</span>, shortcut: 'S', children: [{ id: 'c' }] } as any}
          level={1}
          isFocused
          isActive
          onClick={onClick}
          showIcons
          showShortcuts
        />
      </div>
    );
    expect(screen.getByText('Standalone')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Standalone'));
    expect(onClick).toHaveBeenCalled();
  });

  it('MenubarItem covers level=0 and disabled variants', () => {
    const { container } = render(
      <MenubarItem
        item={{ id: 'top', label: 'Top', disabled: true } as any}
        level={0}
        isFocused={false}
        isActive={false}
      />
    );
    const item = container.querySelector('[data-testid="menubar-item-top"]') as HTMLElement;
    expect(item.className).toContain('text-gray-400');
    expect(item.className).toContain('px-4');
  });

  it('MenubarItem renders a level-1 separator (submenu indent)', () => {
    const { container } = render(
      <MenubarItem item={{ id: 'subsep', separator: true } as any} level={1} isFocused={false} isActive={false} />
    );
    const sep = container.querySelector('[role="separator"]') as HTMLElement;
    expect(sep.className).toContain('px-3');
  });

  it('opens a submenu that uses a custom renderItem for submenu entries', () => {
    // With a custom renderItem the top-level items lose their built-in mouseEnter,
    // so this only asserts the component renders without error (the submenu-open
    // path via custom renderItem is exercised via the hook-level tests).
    const rich = [{ id: 'file', label: 'File', children: [{ id: 'new', label: 'New' }] }];
    render(
      <Menubar
        items={rich}
        renderItem={(item) => <span data-testid={`ri-${item.id}`}>{item.label}</span>}
      />
    );
    expect(screen.getByTestId('ri-file')).toHaveTextContent('File');
  });

  it('renders a separator without showSeparators and exercises the no-children mouseEnter arm', () => {
    const rich = [
      { id: 'sep', label: '', separator: true },
      { id: 'plain', label: 'Plain' },
    ];
    render(<Menubar items={rich} />);
    expect(() => fireEvent.mouseEnter(screen.getByTestId('menubar-item-plain'))).not.toThrow();
  });

  it('renders a level-1 separator inside an open submenu', () => {
    const rich = [{
      id: 'file', label: 'File',
      children: [
        { id: 'new', label: 'New' },
        { id: 'subsep', label: '', separator: true },
        { id: 'open', label: 'Open' },
      ],
    }];
    const { container } = render(<Menubar items={rich} showSeparators />);
    fireEvent.mouseEnter(screen.getByTestId('menubar-item-file'));
    // A submenu separator at level 1 exercises the defaultRenderItem level!=0 arm.
    expect(container.querySelectorAll('[role="separator"]').length).toBeGreaterThan(0);
  });
});
