import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act, renderHook, cleanup } from '@testing-library/react';
import React from 'react';
import { Menu } from '../src/components/Menu';
import { useMenu, useMenubar, useNavigationMenu, useAccordionMenu } from '../src/hooks';
import type { MenuItem } from '../src/hooks/useMenu';
import type { NavigationMenuItem } from '../src/hooks/useNavigationMenu';
import type { AccordionMenuItem } from '../src/hooks/useAccordionMenu';

const items: MenuItem[] = [
  { key: 'new', label: 'New' },
  { key: 'open', label: 'Open' },
];

const menubarItems: MenuItem[] = [
  { id: 'file', label: 'File', children: [{ id: 'new', label: 'New' }] },
  { id: 'edit', label: 'Edit' },
];

const navItems: NavigationMenuItem[] = [
  { id: 'products', label: 'Products', children: [{ id: 'item', label: 'Item' }] },
  { id: 'about', label: 'About' },
];

const accordionItems: AccordionMenuItem[] = [
  { id: 'getting-started', label: 'Getting Started', children: [{ id: 'intro', label: 'Intro' }] },
  { id: 'guide', label: 'Guide' },
];

const escapeOn = (target: Element | Document = document) => {
  act(() => {
    fireEvent.keyDown(target as Element, { key: 'Escape' });
  });
};

describe('Escape closes menus (round 2)', () => {
  it('Menu: Escape at the document level closes an open menu', () => {
    render(<Menu items={items}><button>File</button></Menu>);
    const trigger = screen.getByRole('button', { name: 'File' });
    act(() => { fireEvent.click(trigger); });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Focus stays on the trigger after a pointer open, so the keydown never
    // reaches the menu element itself — the document listener must close it.
    escapeOn(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('useMenu: Escape at the document level closes the open menu', () => {
    const { result } = renderHook(() => useMenu({ items }));
    act(() => { result.current.openMenu(); });
    expect(result.current.open).toBe(true);

    escapeOn();
    expect(result.current.open).toBe(false);
  });

  it('useMenubar: Escape at the document level closes the open submenu', () => {
    const { result } = renderHook(() => useMenubar({ items: menubarItems }));
    act(() => { result.current.actions.openSubmenu('file'); });
    expect(result.current.state.openSubmenuId).toBe('file');

    escapeOn();
    expect(result.current.state.openSubmenuId).toBeNull();
  });

  it('useNavigationMenu: Escape at the document level closes the open dropdown', () => {
    const { result } = renderHook(() => useNavigationMenu({ items: navItems }));
    act(() => { result.current.actions.openDropdown('products'); });
    expect(result.current.state.openDropdownId).toBe('products');

    escapeOn();
    expect(result.current.state.openDropdownId).toBeNull();
  });

  it('useAccordionMenu: Escape at the document level collapses open sections', () => {
    const { result } = renderHook(() => useAccordionMenu({ items: accordionItems }));
    act(() => { result.current.actions.openItem('getting-started'); });
    expect(result.current.state.openItems.size).toBe(1);

    escapeOn();
    expect(result.current.state.openItems.size).toBe(0);
  });

  it('non-Escape keys do not close an open menu', () => {
    const { result } = renderHook(() => useMenu({ items }));
    act(() => { result.current.openMenu(); });
    act(() => {
      fireEvent.keyDown(document, { key: 'Enter' });
    });
    expect(result.current.open).toBe(true);
  });

  afterEach(cleanup);
});
