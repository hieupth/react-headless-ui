import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import {
  useNavigationMenu,
  type NavigationMenuItem,
  type UseNavigationMenuProps,
} from '../src/hooks/useNavigationMenu';

function Harness({
  hookProps,
  apiRef,
}: {
  hookProps: UseNavigationMenuProps;
  apiRef: React.MutableRefObject<ReturnType<typeof useNavigationMenu> | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useNavigationMenu({ ...hookProps, navigationMenuRef: ref });
  apiRef.current = api;
  return (
    <div ref={ref} tabIndex={0} data-testid="root" {...api.attributes}>
      {api.state.items.map((it) => (
        <div
          key={it.id}
          data-testid={`item-${it.id}`}
          data-focused={api.state.focusedItemId === it.id}
          data-active={api.actions.isItemActive(it.id)}
          data-open={api.state.openDropdownId === it.id}
          onClick={() => api.actions.activateItem(it.id)}
          onMouseEnter={() => api.actions.hoverItem(it.id)}
          onMouseLeave={() => api.actions.leaveItem()}
        >
          {it.label}
        </div>
      ))}
    </div>
  );
}

function renderNav(props: UseNavigationMenuProps) {
  const apiRef = { current: null as ReturnType<typeof useNavigationMenu> | null };
  const utils = render(<Harness hookProps={props} apiRef={apiRef} />);
  return { ...utils, apiRef };
}

async function flush(apiRef: { current: ReturnType<typeof useNavigationMenu> | null }) {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return apiRef.current!;
}

const baseItems: NavigationMenuItem[] = [
  {
    id: 'products', label: 'Products', children: [
      { id: 'p1', label: 'Product A' },
      { id: 'p2', label: 'Product B', description: 'Second product' },
    ],
  },
  { id: 'home', label: 'Home', action: () => {} },
  { id: 'disabled', label: 'Disabled', disabled: true },
  { id: 'about', label: 'About' },
];

describe('useNavigationMenu', () => {
  it('initializes state, attributes and items', async () => {
    const { apiRef } = renderNav({ items: baseItems });
    const api = await flush(apiRef);
    expect(screen.getByTestId('root')).toHaveAttribute('role', 'navigation');
    expect(api.state.items).toHaveLength(4);
    expect(api.state.disabled).toBe(false);
  });

  it('activates a leaf item and fires onItemActivate + action', async () => {
    const user = userEvent.setup();
    const onItemActivate = vi.fn();
    const homeAction = vi.fn();
    const items: NavigationMenuItem[] = [{ id: 'home', label: 'Home', action: homeAction }];
    const { apiRef } = renderNav({ items, onItemActivate });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-home'));
    expect(onItemActivate).toHaveBeenCalledTimes(1);
    expect(homeAction).toHaveBeenCalledTimes(1);
    expect(apiRef.current!.state.activeMenuId).toBe('home');
  });

  it('activating a parent item opens dropdown and fires onDropdownOpen', async () => {
    const user = userEvent.setup();
    const onDropdownOpen = vi.fn();
    const { apiRef } = renderNav({ items: baseItems, onDropdownOpen });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-products'));
    expect(onDropdownOpen).toHaveBeenCalledWith('products');
    expect(apiRef.current!.state.openDropdownId).toBe('products');
  });

  it('opening a different dropdown closes the previous one', async () => {
    const onDropdownClose = vi.fn();
    const items: NavigationMenuItem[] = [
      { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
      { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
    ];
    const { apiRef } = renderNav({ items, onDropdownClose });
    await flush(apiRef);
    apiRef.current!.actions.openDropdown('a');
    await flush(apiRef);
    apiRef.current!.actions.activateItem('b');
    await flush(apiRef);
    expect(apiRef.current!.state.openDropdownId).toBe('b');
    expect(onDropdownClose).toHaveBeenCalled();
  });

  it('disabled nav is a no-op', async () => {
    const user = userEvent.setup();
    const onItemActivate = vi.fn();
    const { apiRef } = renderNav({ items: baseItems, disabled: true, onItemActivate });
    await flush(apiRef);
    await user.click(screen.getByTestId('item-home'));
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('disabled items cannot be activated', async () => {
    const onItemActivate = vi.fn();
    const { apiRef } = renderNav({ items: baseItems, onItemActivate });
    await flush(apiRef);
    apiRef.current!.actions.activateItem('disabled');
    await flush(apiRef);
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('hover/leave updates hoverPath', async () => {
    const user = userEvent.setup();
    const { apiRef } = renderNav({ items: baseItems });
    await flush(apiRef);
    await user.hover(screen.getByTestId('item-about'));
    await flush(apiRef);
    expect(apiRef.current!.state.hoverPath).toContain('about');
    await user.unhover(screen.getByTestId('item-about'));
    await flush(apiRef);
    expect(apiRef.current!.state.hoverPath).toHaveLength(0);
  });

  it('navigateNext/Previous skip disabled & separators, wrap around', async () => {
    const items: NavigationMenuItem[] = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B', type: 'separator' },
      { id: 'c', label: 'C', disabled: true },
      { id: 'd', label: 'D' },
    ];
    const { apiRef } = renderNav({ items });
    let api = await flush(apiRef);
    api.actions.navigateNext();
    await flush(apiRef);
    expect(apiRef.current!.state.focusedItemId).toBe('a');
    apiRef.current!.actions.navigateNext();
    await flush(apiRef);
    expect(apiRef.current!.state.focusedItemId).toBe('d'); // skips separator & disabled
    apiRef.current!.actions.navigateNext();
    await flush(apiRef);
    expect(apiRef.current!.state.focusedItemId).toBe('a'); // wrap
    apiRef.current!.actions.navigatePrevious();
    await flush(apiRef);
    expect(apiRef.current!.state.focusedItemId).toBe('d'); // wrap back
  });

  it('mobile menu open/close/toggle + callbacks', async () => {
    const onMobileMenuOpen = vi.fn();
    const onMobileMenuClose = vi.fn();
    // Simulate mobile viewport so the resize effect doesn't auto-close the menu.
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const { apiRef } = renderNav({ items: baseItems, onMobileMenuOpen, onMobileMenuClose });
    await flush(apiRef);
    apiRef.current!.actions.openMobileMenu();
    await flush(apiRef);
    expect(apiRef.current!.state.isMobileMenuOpen).toBe(true);
    expect(onMobileMenuOpen).toHaveBeenCalled();
    apiRef.current!.actions.toggleMobileMenu();
    await flush(apiRef);
    expect(apiRef.current!.state.isMobileMenuOpen).toBe(false);
    expect(onMobileMenuClose).toHaveBeenCalled();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalWidth });
  });

  it('closeMobileMenu resets active/dropdown/hover', async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const { apiRef } = renderNav({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.activateItem('products'); // opens dropdown
    await flush(apiRef);
    apiRef.current!.actions.openMobileMenu();
    await flush(apiRef);
    apiRef.current!.actions.closeMobileMenu();
    await flush(apiRef);
    expect(apiRef.current!.state.openDropdownId).toBeNull();
    expect(apiRef.current!.state.hoverPath).toHaveLength(0);
    expect(apiRef.current!.state.activeMenuId).toBeNull();
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalWidth });
  });

  it('closeDropdown fires callback and resets hoverPath', async () => {
    const onDropdownClose = vi.fn();
    const { apiRef } = renderNav({ items: baseItems, onDropdownClose });
    await flush(apiRef);
    apiRef.current!.actions.openDropdown('products');
    await flush(apiRef);
    apiRef.current!.actions.closeDropdown();
    await flush(apiRef);
    expect(apiRef.current!.state.openDropdownId).toBeNull();
    expect(onDropdownClose).toHaveBeenCalled();
  });

  it('setSearchQuery + filterItems narrow results', async () => {
    const { apiRef } = renderNav({ items: baseItems, enableSearch: true });
    const api = await flush(apiRef);
    api.actions.setSearchQuery('product');
    await flush(apiRef);
    const filtered = apiRef.current!.actions.filterItems(baseItems, 'product');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('products');
    expect(apiRef.current!.state.searchQuery).toBe('product');
  });

  it('query helpers: getItem, getParentItem, getSubmenuItems, hasSubmenu, isItemActive', async () => {
    const { apiRef } = renderNav({ items: baseItems, defaultActiveItemId: 'home' });
    const api = await flush(apiRef);
    expect(api.actions.getItem('p1')?.label).toBe('Product A');
    expect(api.actions.getParentItem('p1')?.id).toBe('products');
    expect(api.actions.getSubmenuItems('products')).toHaveLength(2);
    expect(api.actions.hasSubmenu('products')).toBe(true);
    expect(api.actions.hasSubmenu('home')).toBe(false);
    expect(api.actions.isItemActive('home')).toBe(true);
    expect(api.actions.getSubmenuItems('home')).toEqual([]);
  });

  it('keyboard: ArrowRight/Left navigate, ArrowDown opens dropdown, Enter activates, Escape closes', async () => {
    const { apiRef } = renderNav({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.navigateNext(); // focus first
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    await flush(apiRef);
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    await flush(apiRef);
    // open products dropdown via ArrowDown when focused on a parent — first focus products
    apiRef.current!.actions.focusItem('products');
    await flush(apiRef);
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    await flush(apiRef);
    expect(apiRef.current!.state.openDropdownId).toBe('products');
    // Escape closes dropdown
    fireEvent.keyDown(root, { key: 'Escape' });
    await flush(apiRef);
    expect(apiRef.current!.state.openDropdownId).toBeNull();
  });

  it('keyboard Enter activates focused leaf item', async () => {
    const onItemActivate = vi.fn();
    const { apiRef } = renderNav({ items: baseItems, onItemActivate });
    await flush(apiRef);
    apiRef.current!.actions.focusItem('home');
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Enter' });
    await flush(apiRef);
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('keyboard Escape closes mobile menu when no dropdown open', async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const { apiRef } = renderNav({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.openMobileMenu();
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Escape' });
    await flush(apiRef);
    expect(apiRef.current!.state.isMobileMenuOpen).toBe(false);
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalWidth });
  });

  it('keyboard is a no-op when disabled', async () => {
    const onItemActivate = vi.fn();
    const { apiRef } = renderNav({ items: baseItems, disabled: true, onItemActivate });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'ArrowRight' });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Enter' });
    await flush(apiRef);
    expect(onItemActivate).not.toHaveBeenCalled();
  });
});
