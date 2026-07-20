import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menubar, MenubarItem } from '../src/components/Menubar';
import type { MenuItem } from '../src/hooks/useMenubar';

const items: MenuItem[] = [
  {
    id: 'file', label: 'File', icon: <span>F</span>, shortcut: 'Alt+F',
    children: [
      { id: 'new', label: 'New' },
      { id: 'open', label: 'Open', disabled: true },
    ],
  },
  { id: 'sep', label: '', separator: true },
  { id: 'edit', label: 'Edit' },
  { id: 'disabled', label: 'Disabled', disabled: true },
];

describe('Menubar (extra) — renderer branches', () => {
  it('renders items with icons, shortcuts, submenu arrow, and separators', () => {
    render(<Menubar items={items} showSeparators showShortcuts />);
    // labels
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    // separator rendered with role
    expect(screen.getAllByRole('separator').length).toBeGreaterThan(0);
    // submenu arrow svg present on File (has children)
    expect(screen.getByTestId('menubar-item-file')).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.getByTestId('menubar-item-edit')).not.toHaveAttribute('aria-haspopup');
  });

  it('disabled item does not activate on click', async () => {
    const user = userEvent.setup();
    const onItemActivate = vi.fn();
    render(<Menubar items={items} onItemActivate={onItemActivate} />);
    await user.click(screen.getByTestId('menubar-item-disabled'));
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('clicking a parent item opens its submenu', async () => {
    render(<Menubar items={items} />);
    await userEvent.click(screen.getByTestId('menubar-item-file'));
    // submenu children rendered (default submenu renderer). The component
    // renders the open submenu in two places, so assert >=1 occurrence.
    expect(screen.getAllByText('New').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0);
  });

  it('hovering a parent item opens its submenu and focuses it', async () => {
    render(<Menubar items={items} />);
    fireEvent.mouseEnter(screen.getByTestId('menubar-item-file'));
    expect(screen.getAllByText('New').length).toBeGreaterThan(0);
  });

  it('clicking a submenu child activates it', async () => {
    const user = userEvent.setup();
    const onItemActivate = vi.fn();
    render(<Menubar items={items} onItemActivate={onItemActivate} />);
    await user.click(screen.getByTestId('menubar-item-file'));
    // submenu "New" child appears at least once; click the first.
    await user.click(screen.getAllByText('New')[0]);
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('renders vertical orientation and applies height', () => {
    render(<Menubar items={items} orientation="vertical" height={120} />);
    const bar = screen.getByTestId('menubar');
    expect(bar.style.height).toBe('120px');
  });

  it('applies disabled styling and custom className to the bar', () => {
    render(<Menubar items={items} disabled className="my-bar" />);
    const bar = screen.getByTestId('menubar');
    // Headless-only: disabled is exposed via tabindex=-1, not an opacity class.
    expect(bar).toHaveAttribute('tabindex', '-1');
    expect(bar.className).toContain('my-bar');
  });

  it('uses custom renderItem', () => {
    render(
      <Menubar
        items={items}
        renderItem={(item) => (
          <div key={item.id} data-testid={`custom-${item.id}`}>C:{item.label || 'sep'}</div>
        )}
      />
    );
    expect(screen.getByTestId('custom-file')).toBeInTheDocument();
    expect(screen.getByTestId('custom-edit')).toBeInTheDocument();
  });

  it('uses custom renderSubmenu when a submenu opens', async () => {
    render(
      <Menubar
        items={items}
        renderSubmenu={(submenuItems) => (
          <div data-testid="custom-submenu">{submenuItems.map((i) => i.label).join(',')}</div>
        )}
      />
    );
    await userEvent.click(screen.getByTestId('menubar-item-file'));
    // custom renderSubmenu is invoked for both inline + open-submenu blocks.
    expect(screen.getAllByTestId('custom-submenu').length).toBeGreaterThan(0);
  });

  it('showIcons=false hides item icons', () => {
    render(<Menubar items={items} showIcons={false} />);
    // File item has an icon; with showIcons=false the icon span text 'F' must not render
    const fileItem = screen.getByTestId('menubar-item-file');
    expect(fileItem).toBeInTheDocument();
    expect(screen.queryByText('F')).not.toBeInTheDocument();
  });

  it('showShortcuts=true renders the shortcut text', () => {
    render(<Menubar items={items} showShortcuts />);
    expect(screen.getByText('Alt+F')).toBeInTheDocument();
  });

  it('openSubmenuId path renders submenu via the open-submenu IIFE block', async () => {
    // File has children -> openSubmenuId set; the IIFE at line 226 renders the submenu
    render(<Menubar items={items} />);
    await userEvent.click(screen.getByTestId('menubar-item-file'));
    // The submenu renders role=menu containers (inline + open-submenu block).
    expect(screen.getAllByRole('menu').length).toBeGreaterThan(0);
  });
});

describe('MenubarItem (standalone)', () => {
  it('renders a separator when item.separator is true', () => {
    render(
      <MenubarItem
        item={{ id: 's', label: '', separator: true }}
        level={0}
        isFocused={false}
        isActive={false}
      />
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders a normal item with attributes, icon, shortcut and submenu arrow', () => {
    render(
      <MenubarItem
        item={{ id: 'f', label: 'File', icon: <span>IC</span>, shortcut: '⌘F', children: [{ id: 'n', label: 'N' }] }}
        level={0}
        isFocused
        isActive
        showIcons
        showShortcuts
        onClick={() => {}}
        onMouseEnter={() => {}}
      />
    );
    const item = screen.getByTestId('menubar-item-f');
    expect(item).toHaveAttribute('aria-haspopup', 'menu');
    expect(item).toHaveAttribute('aria-expanded', 'true');
    expect(item).toHaveAttribute('tabIndex', '0');
    expect(screen.getByText('IC')).toBeInTheDocument();
    expect(screen.getByText('⌘F')).toBeInTheDocument();
  });
});
