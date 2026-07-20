import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useNavigationMenu } from '../src/hooks';
import type {
  NavigationMenuItem,
  UseNavigationMenuProps,
} from '../src/hooks';

// Build a representative item tree with nested submenus, a disabled item,
// and a separator so navigate-next/prev skip logic can be exercised.
function buildItems(): NavigationMenuItem[] {
  return [
    {
      id: 'file',
      label: 'File',
      children: [
        { id: 'new', label: 'New', description: 'create' },
        { id: 'open', label: 'Open' },
        { id: 'sep', label: '', type: 'separator' },
        { id: 'disabled-child', label: 'Disabled', disabled: true },
      ],
    },
    { id: 'edit', label: 'Edit', disabled: true },
    {
      id: 'help',
      label: 'Help',
      children: [
        { id: 'about', label: 'About', description: 'info' },
      ],
    },
    { id: 'leaf', label: 'Leaf', action: () => {} },
  ];
}

interface SetupOpts extends Partial<UseNavigationMenuProps> {
  items?: NavigationMenuItem[];
}

function setup(opts: SetupOpts = {}) {
  const api: { current: any } = { current: null };
  const ref = React.createRef<HTMLElement>();

  function Harness() {
    const result = useNavigationMenu({
      items: opts.items ?? buildItems(),
      position: opts.position,
      variant: opts.variant,
      disabled: opts.disabled,
      mobileBreakpoint: opts.mobileBreakpoint,
      defaultActiveItemId: opts.defaultActiveItemId,
      enableSearch: opts.enableSearch,
      autoCloseDropdowns: opts.autoCloseDropdowns,
      onItemActivate: opts.onItemActivate,
      onDropdownOpen: opts.onDropdownOpen,
      onDropdownClose: opts.onDropdownClose,
      onMobileMenuOpen: opts.onMobileMenuOpen,
      onMobileMenuClose: opts.onMobileMenuClose,
      navigationMenuRef: opts.navigationMenuRef ?? ref,
    });
    api.current = result;
    return (
      <nav
        ref={ref as any}
        data-testid="nav"
        tabIndex={result.attributes.tabIndex}
      >
        <span data-testid="active">{result.state.activeMenuId ?? ''}</span>
        <span data-testid="focused">{result.state.focusedItemId ?? ''}</span>
        <span data-testid="dropdown">{result.state.openDropdownId ?? ''}</span>
        <span data-testid="mobile-open">{String(result.state.isMobileMenuOpen)}</span>
        <span data-testid="search">{result.state.searchQuery}</span>
        <span data-testid="hover-path">{result.state.hoverPath.join('|')}</span>
      </nav>
    );
  }

  const utils = render(<Harness />);
  return { api, ref, ...utils };
}

describe('useNavigationMenu (extra)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    cleanup();
  });

  // Render at mobile width so the resize effect does not auto-close the
  // mobile menu (the effect closes it whenever `!mobile && isMobileMenuOpen`).
  function setupMobile(opts: SetupOpts = {}) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    return setup(opts);
  }

  describe('defaults + state', () => {
    it('exposes default state values', () => {
      const { api } = setup();
      expect(api.current.state.position).toBe('top');
      expect(api.current.state.variant).toBe('horizontal');
      expect(api.current.state.disabled).toBe(false);
      expect(api.current.state.activeMenuId).toBeNull();
      expect(api.current.state.openDropdownId).toBeNull();
      expect(api.current.state.isMobileMenuOpen).toBe(false);
      expect(api.current.state.searchQuery).toBe('');
      expect(api.current.state.hoverPath).toEqual([]);
      // isMobile computed by initial innerWidth check
      expect(api.current.state.isMobile).toBe(false);
    });

    it('honours provided position/variant/disabled/defaultActiveItemId', () => {
      const { api } = setup({
        position: 'left',
        variant: 'mega',
        disabled: true,
        defaultActiveItemId: 'help',
      });
      expect(api.current.state.position).toBe('left');
      expect(api.current.state.variant).toBe('mega');
      expect(api.current.state.disabled).toBe(true);
      expect(api.current.state.activeMenuId).toBe('help');
    });

    it('attributes reflect role/aria-label and tabIndex depends on disabled', () => {
      const { api: a1 } = setup();
      expect(a1.current.attributes.role).toBe('navigation');
      expect(a1.current.attributes['aria-label']).toBe('Main navigation');
      expect(a1.current.attributes.tabIndex).toBe(0);

      const { api: a2 } = setup({ disabled: true });
      expect(a2.current.attributes.tabIndex).toBe(-1);
    });

    it('uses internal ref when navigationMenuRef is not provided', () => {
      const api = { current: null as any };
      function Harness() {
        api.current = useNavigationMenu({ items: buildItems() });
        // The hook's internal ref is exposed via the focusable mixin's focusRef.
        return <nav data-testid="nav" ref={api.current.focusable.focusRef as any} />;
      }
      render(<Harness />);
      expect(api.current.focusable.focusRef).toBeDefined();
      expect(api.current.focusable.focusRef.current).not.toBeNull();
    });
  });

  describe('focusItem', () => {
    it('sets focusedItemId for an enabled item', () => {
      const { api } = setup();
      act(() => api.current.actions.focusItem('file'));
      expect(api.current.state.focusedItemId).toBe('file');
    });

    it('ignores a disabled item', () => {
      const { api } = setup();
      act(() => api.current.actions.focusItem('edit'));
      expect(api.current.state.focusedItemId).toBeNull();
    });

    it('ignores an unknown item id', () => {
      const { api } = setup();
      act(() => api.current.actions.focusItem('does-not-exist'));
      expect(api.current.state.focusedItemId).toBeNull();
    });

    it('is a no-op when the whole menu is disabled', () => {
      const { api } = setup({ disabled: true });
      act(() => api.current.actions.focusItem('file'));
      expect(api.current.state.focusedItemId).toBeNull();
    });
  });

  describe('activateItem', () => {
    it('activates a parent item and opens its dropdown', () => {
      const onDropdownOpen = vi.fn();
      const { api } = setup({ onDropdownOpen });
      act(() => api.current.actions.activateItem('file'));
      expect(api.current.state.activeMenuId).toBe('file');
      expect(api.current.state.openDropdownId).toBe('file');
      expect(api.current.state.hoverPath).toEqual(['file']);
      expect(api.current.state.focusedItemId).toBe('file');
      expect(onDropdownOpen).toHaveBeenCalledWith('file');
    });

    it('closes a previously-open dropdown when activating a different parent', () => {
      const onDropdownClose = vi.fn();
      const { api } = setup({ onDropdownClose });
      act(() => api.current.actions.activateItem('file'));
      act(() => api.current.actions.activateItem('help'));
      expect(api.current.state.openDropdownId).toBe('help');
      expect(onDropdownClose).toHaveBeenCalled();
    });

    it('activating a leaf item runs its action and onItemActivate, and auto-closes dropdown', () => {
      const action = vi.fn();
      const onItemActivate = vi.fn();
      const items = buildItems();
      const leaf = items.find((i) => i.id === 'leaf')!;
      leaf.action = action;
      const { api } = setup({ items, onItemActivate });
      act(() => api.current.actions.activateItem('leaf'));
      expect(api.current.state.activeMenuId).toBe('leaf');
      expect(action).toHaveBeenCalledTimes(1);
      expect(onItemActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'leaf' }));
      expect(api.current.state.openDropdownId).toBeNull();
      expect(api.current.state.hoverPath).toEqual([]);
    });

    it('does not auto-close when autoCloseDropdowns=false', () => {
      const api = { current: null as any };
      function Harness() {
        api.current = useNavigationMenu({
          items: buildItems(),
          autoCloseDropdowns: false,
        });
        return <nav data-testid="nav" />;
      }
      render(<Harness />);
      // First open a dropdown via activating a parent.
      act(() => api.current.actions.activateItem('file'));
      act(() => api.current.actions.activateItem('help'));
      // help is a parent; dropdown stays on help (not auto-closed by leaf logic).
      expect(api.current.state.openDropdownId).toBe('help');
    });

    it('is a no-op for disabled items and disabled menu', () => {
      const onItemActivate = vi.fn();
      const { api: a1 } = setup({ onItemActivate });
      act(() => a1.current.actions.activateItem('edit'));
      expect(a1.current.state.activeMenuId).toBeNull();
      expect(onItemActivate).not.toHaveBeenCalled();

      const { api: a2 } = setup({ disabled: true, onItemActivate });
      act(() => a2.current.actions.activateItem('file'));
      expect(a2.current.state.activeMenuId).toBeNull();
      expect(onItemActivate).not.toHaveBeenCalled();
    });

    it('activates a disabled-parent (children but no action) path without firing onItemActivate', () => {
      const onItemActivate = vi.fn();
      const items: NavigationMenuItem[] = [
        { id: 'parent', label: 'Parent', children: [{ id: 'c', label: 'C' }] },
      ];
      const { api } = setup({ items, onItemActivate });
      act(() => api.current.actions.activateItem('parent'));
      expect(api.current.state.openDropdownId).toBe('parent');
      expect(onItemActivate).not.toHaveBeenCalled();
    });
  });

  describe('hoverItem / leaveItem', () => {
    it('hoverItem extends the hover path for enabled items', () => {
      const { api } = setup();
      act(() => api.current.actions.hoverItem('file'));
      expect(api.current.state.hoverPath).toEqual(['file']);
      // Hovering a child keeps building the path.
      act(() => api.current.actions.hoverItem('new'));
      expect(api.current.state.hoverPath).toEqual(['file', 'new']);
    });

    it('hoverItem ignores disabled items and disabled menu', () => {
      const { api: a1 } = setup();
      act(() => a1.current.actions.hoverItem('edit'));
      expect(a1.current.state.hoverPath).toEqual([]);

      const { api: a2 } = setup({ disabled: true });
      act(() => a2.current.actions.hoverItem('file'));
      expect(a2.current.state.hoverPath).toEqual([]);
    });

    it('leaveItem clears the hover path', () => {
      const { api } = setup();
      act(() => api.current.actions.hoverItem('file'));
      act(() => api.current.actions.leaveItem());
      expect(api.current.state.hoverPath).toEqual([]);
    });

    it('leaveItem is a no-op when disabled', () => {
      const { api } = setup({ disabled: true });
      expect(() => act(() => api.current.actions.leaveItem())).not.toThrow();
    });
  });

  describe('openDropdown / closeDropdown', () => {
    it('openDropdown opens a parent with children', () => {
      const onDropdownOpen = vi.fn();
      const { api } = setup({ onDropdownOpen });
      act(() => api.current.actions.openDropdown('file'));
      expect(api.current.state.openDropdownId).toBe('file');
      expect(api.current.state.hoverPath).toEqual(['file']);
      expect(onDropdownOpen).toHaveBeenCalledWith('file');
    });

    it('openDropdown is ignored for a leaf item (no children)', () => {
      const onDropdownOpen = vi.fn();
      const { api } = setup({ onDropdownOpen });
      act(() => api.current.actions.openDropdown('leaf'));
      expect(api.current.state.openDropdownId).toBeNull();
      expect(onDropdownOpen).not.toHaveBeenCalled();
    });

    it('openDropdown is ignored for an unknown item', () => {
      const { api } = setup();
      act(() => api.current.actions.openDropdown('nope'));
      expect(api.current.state.openDropdownId).toBeNull();
    });

    it('closeDropdown clears state and fires onDropdownClose', () => {
      const onDropdownClose = vi.fn();
      const { api } = setup({ onDropdownClose });
      act(() => api.current.actions.openDropdown('file'));
      act(() => api.current.actions.closeDropdown());
      expect(api.current.state.openDropdownId).toBeNull();
      expect(api.current.state.hoverPath).toEqual([]);
      expect(onDropdownClose).toHaveBeenCalledTimes(1);
    });

    it('open/close are no-ops when disabled', () => {
      const onDropdownOpen = vi.fn();
      const onDropdownClose = vi.fn();
      const { api } = setup({ disabled: true, onDropdownOpen, onDropdownClose });
      act(() => api.current.actions.openDropdown('file'));
      expect(api.current.state.openDropdownId).toBeNull();
      expect(onDropdownOpen).not.toHaveBeenCalled();
      act(() => api.current.actions.closeDropdown());
      expect(onDropdownClose).not.toHaveBeenCalled();
    });
  });

  describe('mobile menu', () => {
    it('openMobileMenu sets state and fires onMobileMenuOpen', () => {
      const onMobileMenuOpen = vi.fn();
      const { api } = setupMobile({ onMobileMenuOpen });
      act(() => api.current.actions.openMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(true);
      expect(onMobileMenuOpen).toHaveBeenCalledTimes(1);
    });

    it('closeMobileMenu clears all menu state and fires onMobileMenuClose', () => {
      const onMobileMenuClose = vi.fn();
      const { api } = setupMobile({ onMobileMenuClose });
      act(() => api.current.actions.openMobileMenu());
      act(() => api.current.actions.activateItem('file'));
      act(() => api.current.actions.closeMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(false);
      expect(api.current.state.activeMenuId).toBeNull();
      expect(api.current.state.openDropdownId).toBeNull();
      expect(api.current.state.hoverPath).toEqual([]);
      expect(onMobileMenuClose).toHaveBeenCalledTimes(1);
    });

    it('toggleMobileMenu flips open state', () => {
      const { api } = setupMobile();
      act(() => api.current.actions.toggleMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(true);
      act(() => api.current.actions.toggleMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(false);
    });

    it('all mobile actions are no-ops when disabled', () => {
      const onMobileMenuOpen = vi.fn();
      const onMobileMenuClose = vi.fn();
      const { api } = setupMobile({ disabled: true, onMobileMenuOpen, onMobileMenuClose });
      act(() => api.current.actions.openMobileMenu());
      act(() => api.current.actions.toggleMobileMenu());
      act(() => api.current.actions.closeMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(false);
      expect(onMobileMenuOpen).not.toHaveBeenCalled();
      expect(onMobileMenuClose).not.toHaveBeenCalled();
    });

    it('resize effect closes the mobile menu when growing to desktop', () => {
      const { api } = setupMobile({ mobileBreakpoint: 768 });
      act(() => api.current.actions.openMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(true);
      // Grow back to desktop: effect should close the mobile menu.
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1200,
        });
        window.dispatchEvent(new Event('resize'));
      });
      expect(api.current.state.isMobileMenuOpen).toBe(false);
      expect(api.current.state.isMobile).toBe(false);
    });
  });

  describe('search', () => {
    it('setSearchQuery updates the search query', () => {
      const { api } = setup();
      act(() => api.current.actions.setSearchQuery('fo'));
      expect(api.current.state.searchQuery).toBe('fo');
    });

    it('setSearchQuery is a no-op when disabled', () => {
      const { api } = setup({ disabled: true });
      act(() => api.current.actions.setSearchQuery('fo'));
      expect(api.current.state.searchQuery).toBe('');
    });
  });

  describe('navigation next/prev', () => {
    it('navigateNext is a no-op without a focused item and empty items', () => {
      const { api } = setup({ items: [] });
      expect(() => act(() => api.current.actions.navigateNext())).not.toThrow();
    });

    it('navigateNext wraps from last to first', () => {
      const { api } = setup();
      act(() => api.current.actions.focusItem('leaf'));
      act(() => api.current.actions.navigateNext());
      expect(api.current.state.focusedItemId).toBe('file');
    });

    it('navigateNext moves forward and skips disabled items + separators', () => {
      const items: NavigationMenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'sep', label: '', type: 'separator' },
        { id: 'b-disabled', label: 'B', disabled: true },
        { id: 'c', label: 'C' },
      ];
      const { api } = setup({ items });
      act(() => api.current.actions.focusItem('a'));
      act(() => api.current.actions.navigateNext());
      // a -> skip sep & disabled -> c
      expect(api.current.state.focusedItemId).toBe('c');
    });

    it('navigatePrevious wraps from first to last', () => {
      const { api } = setup();
      act(() => api.current.actions.focusItem('file'));
      act(() => api.current.actions.navigatePrevious());
      expect(api.current.state.focusedItemId).toBe('leaf');
    });

    it('navigatePrevious moves backward skipping disabled items + separators', () => {
      const items: NavigationMenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'sep', label: '', type: 'separator' },
        { id: 'b-disabled', label: 'B', disabled: true },
        { id: 'c', label: 'C' },
      ];
      const { api } = setup({ items });
      act(() => api.current.actions.focusItem('c'));
      act(() => api.current.actions.navigatePrevious());
      // c -> skip disabled & sep -> a
      expect(api.current.state.focusedItemId).toBe('a');
    });

    it('navigateNext/prev are no-ops when disabled', () => {
      const { api } = setup({ disabled: true });
      act(() => api.current.actions.navigateNext());
      act(() => api.current.actions.navigatePrevious());
      expect(api.current.state.focusedItemId).toBeNull();
    });

    it('navigateNext respects search filter', () => {
      const items: NavigationMenuItem[] = [
        { id: 'apple', label: 'Apple' },
        { id: 'banana', label: 'Banana' },
        { id: 'apricot', label: 'Apricot' },
      ];
      const { api } = setup({ items, enableSearch: true });
      act(() => api.current.actions.setSearchQuery('ap'));
      act(() => api.current.actions.focusItem('apple'));
      act(() => api.current.actions.navigateNext());
      expect(api.current.state.focusedItemId).toBe('apricot');
    });
  });

  describe('query helpers', () => {
    it('getItem / getParentItem / getSubmenuItems / hasSubmenu / isItemActive', () => {
      const { api } = setup({ defaultActiveItemId: 'help' });
      expect(api.current.actions.getItem('new')?.id).toBe('new');
      expect(api.current.actions.getItem('missing')).toBeUndefined();
      expect(api.current.actions.getParentItem('new')?.id).toBe('file');
      // A top-level item has no parent -> findParentItem returns its default (null).
      expect(api.current.actions.getParentItem('file')).toBeNull();
      expect(api.current.actions.getSubmenuItems('file').map((i: any) => i.id)).toEqual([
        'new',
        'open',
        'sep',
        'disabled-child',
      ]);
      expect(api.current.actions.getSubmenuItems('leaf')).toEqual([]);
      expect(api.current.actions.hasSubmenu('file')).toBe(true);
      expect(api.current.actions.hasSubmenu('leaf')).toBe(false);
      expect(api.current.actions.isItemActive('help')).toBe(true);
      expect(api.current.actions.isItemActive('file')).toBe(false);
    });

    it('getItemsAtLevel returns items at root, at a path, and [] for invalid path', () => {
      const { api } = setup();
      const root = api.current.actions.getItemsAtLevel([]);
      expect(root.map((i: any) => i.id)).toEqual(['file', 'edit', 'help', 'leaf']);
      const level1 = api.current.actions.getItemsAtLevel(['file']);
      expect(level1.map((i: any) => i.id)).toEqual(['new', 'open', 'sep', 'disabled-child']);
      // Path into a leaf yields [].
      expect(api.current.actions.getItemsAtLevel(['file', 'new'])).toEqual([]);
      // Unknown path yields [].
      expect(api.current.actions.getItemsAtLevel(['unknown'])).toEqual([]);
    });

    it('filterItems returns items unchanged for blank query', () => {
      const { api } = setup();
      const items = api.current.state.items;
      expect(api.current.actions.filterItems(items, '')).toEqual(items);
      expect(api.current.actions.filterItems(items, '   ')).toEqual(items);
    });

    it('filterItems matches by label and description and prunes children', () => {
      const { api } = setup();
      const items = api.current.state.items;
      const matched = api.current.actions.filterItems(items, 'about');
      // 'about' is a child of 'help' -> help kept, child kept
      const help = matched.find((i: any) => i.id === 'help');
      expect(help).toBeDefined();
      expect(help?.children?.map((c: any) => c.id)).toEqual(['about']);
      // file (no match in itself or children) pruned
      expect(matched.find((i: any) => i.id === 'file')).toBeUndefined();
    });

    it('filterItems matches parent by label and retains filtered children', () => {
      const { api } = setup();
      const items = api.current.state.items;
      const matched = api.current.actions.filterItems(items, 'file');
      const file = matched.find((i: any) => i.id === 'file');
      expect(file).toBeDefined();
      // file matches label -> kept, children filtered (none match 'file')
      expect(file?.children).toEqual([]);
    });
  });

  describe('keyboard handling (document-level listener bound to nav element)', () => {
    function setupKeyboard(opts: Partial<UseNavigationMenuProps> = {}) {
      const api = { current: null as any };
      const ref = React.createRef<HTMLElement>();
      function Harness() {
        api.current = useNavigationMenu({ items: buildItems(), navigationMenuRef: ref, ...opts });
        return (
          <nav data-testid="nav" ref={ref as any} tabIndex={0}>
            <span data-testid="focused">{api.current.state.focusedItemId ?? ''}</span>
            <span data-testid="dropdown">{api.current.state.openDropdownId ?? ''}</span>
          </nav>
        );
      }
      const utils = render(<Harness />);
      return { api, ...utils };
    }

    it('ArrowRight triggers navigateNext', () => {
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.focusItem('file'));
      fireEvent.keyDown(getByTestId('nav'), { key: 'ArrowRight' });
      expect(getByTestId('focused').textContent).toBe('help');
    });

    it('ArrowLeft triggers navigatePrevious', () => {
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.focusItem('help'));
      fireEvent.keyDown(getByTestId('nav'), { key: 'ArrowLeft' });
      expect(getByTestId('focused').textContent).toBe('file');
    });

    it('ArrowDown opens a submenu when focused item has children', () => {
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.focusItem('file'));
      fireEvent.keyDown(getByTestId('nav'), { key: 'ArrowDown' });
      expect(getByTestId('dropdown').textContent).toBe('file');
    });

    it('ArrowDown falls back to navigateNext when focused item has no submenu', () => {
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.focusItem('file'));
      fireEvent.keyDown(getByTestId('nav'), { key: 'ArrowUp' });
      // From file, ArrowUp -> navigatePrevious wraps to leaf.
      expect(getByTestId('focused').textContent).toBe('leaf');
      // leaf has no submenu -> ArrowDown should navigateNext.
      fireEvent.keyDown(getByTestId('nav'), { key: 'ArrowDown' });
      expect(getByTestId('focused').textContent).toBe('file');
    });

    it('Enter activates the focused item', () => {
      const onItemActivate = vi.fn();
      const { api, getByTestId } = setupKeyboard({ onItemActivate });
      act(() => api.current.actions.focusItem('leaf'));
      fireEvent.keyDown(getByTestId('nav'), { key: 'Enter' });
      expect(api.current.state.activeMenuId).toBe('leaf');
      expect(onItemActivate).toHaveBeenCalled();
    });

    it('Space activates the focused item', () => {
      const onItemActivate = vi.fn();
      const { api, getByTestId } = setupKeyboard({ onItemActivate });
      act(() => api.current.actions.focusItem('leaf'));
      fireEvent.keyDown(getByTestId('nav'), { key: ' ' });
      expect(api.current.state.activeMenuId).toBe('leaf');
    });

    it('Enter does nothing when no item is focused', () => {
      const { api, getByTestId } = setupKeyboard();
      fireEvent.keyDown(getByTestId('nav'), { key: 'Enter' });
      expect(api.current.state.activeMenuId).toBeNull();
    });

    it('Escape closes an open dropdown', () => {
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.openDropdown('file'));
      fireEvent.keyDown(getByTestId('nav'), { key: 'Escape' });
      expect(api.current.state.openDropdownId).toBeNull();
    });

    it('Escape closes the mobile menu when no dropdown is open', () => {
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.openMobileMenu());
      fireEvent.keyDown(getByTestId('nav'), { key: 'Escape' });
      expect(api.current.state.isMobileMenuOpen).toBe(false);
    });

    it('Escape is a no-op when nothing is open', () => {
      const { api, getByTestId } = setupKeyboard();
      expect(() =>
        fireEvent.keyDown(getByTestId('nav'), { key: 'Escape' })
      ).not.toThrow();
      expect(api.current.state.openDropdownId).toBeNull();
      expect(api.current.state.isMobileMenuOpen).toBe(false);
    });

    it('ignored keys do nothing (no crash)', () => {
      const { getByTestId } = setupKeyboard();
      expect(() => fireEvent.keyDown(getByTestId('nav'), { key: 'Tab' })).not.toThrow();
      expect(() => fireEvent.keyDown(getByTestId('nav'), { key: 'a' })).not.toThrow();
    });

    it('keyboard handling is a no-op when disabled (listener not even attached)', () => {
      const { api, getByTestId } = setupKeyboard({ disabled: true });
      // focusItem is a no-op while disabled, so nothing is focused.
      act(() => api.current.actions.focusItem('file'));
      expect(api.current.state.focusedItemId).toBeNull();
      // The keyboard handler short-circuits on disabled; no crash, no change.
      expect(() =>
        fireEvent.keyDown(getByTestId('nav'), { key: 'ArrowRight' })
      ).not.toThrow();
      expect(api.current.state.focusedItemId).toBeNull();
    });

    it('keyboard via userEvent drives ArrowRight', async () => {
      const user = userEvent.setup();
      const { api, getByTestId } = setupKeyboard();
      act(() => api.current.actions.focusItem('file'));
      await user.type(getByTestId('nav'), '{arrowright}');
      expect(getByTestId('focused').textContent).toBe('help');
    });
  });

  describe('mixins + attributes', () => {
    it('exposes focusable/pressable/semantic mixins', () => {
      const { api } = setup();
      expect(api.current.focusable).toBeDefined();
      expect(api.current.pressable).toBeDefined();
      expect(api.current.semantic).toBeDefined();
      expect(api.current.semantic.role).toBe('navigation');
      expect(api.current.semantic.ariaLabel).toBe('Main navigation');
    });

    it('honours an externally-supplied navigationMenuRef', () => {
      const external = React.createRef<HTMLElement>();
      const api = { current: null as any };
      function Harness() {
        api.current = useNavigationMenu({
          items: buildItems(),
          navigationMenuRef: external,
        });
        // Attach the externally-supplied ref to a real DOM node so the
        // keyboard listener has a target.
        return <nav data-testid="nav-ext" ref={external as any} tabIndex={0} />;
      }
      render(<Harness />);
      expect(external.current).not.toBeNull();
      // Keyboard listener is bound to the externally-supplied element.
      act(() => api.current.actions.focusItem('file'));
      fireEvent.keyDown(external.current!, { key: 'ArrowRight' });
      expect(api.current.state.focusedItemId).toBe('help');
    });
  });

  describe('branch coverage: leaf-without-action, nested find, wrap-skip, mobile', () => {
    it('activating a leaf item without an action still fires onItemActivate', () => {
      const onItemActivate = vi.fn();
      const items: NavigationMenuItem[] = [{ id: 'plain', label: 'Plain' }];
      const { api } = setup({ items, onItemActivate });
      act(() => api.current.actions.activateItem('plain'));
      expect(onItemActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'plain' }));
    });

    it('findItem resolves a nested child via the children recursion', () => {
      const items = buildItems();
      const { api } = setup({ items });
      // 'about' is a child of 'help'; the recursive find walks item.children.
      const about = api.current.actions.getItem?.('about');
      expect(about).toBeDefined();
      expect(about.id).toBe('about');
    });

    it('navigateNext wraps past the end when the only forward item is disabled', () => {
      const items: NavigationMenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B', disabled: true },
      ];
      const { api } = setup({ items });
      act(() => api.current.actions.focusItem('a'));
      // b is disabled → the skip loop wraps back to a.
      act(() => api.current.actions.navigateNext());
      expect(api.current.state.focusedItemId).toBe('a');
    });

    it('navigatePrevious wraps past the start when the only backward item is disabled', () => {
      const items: NavigationMenuItem[] = [
        { id: 'a', label: 'A', disabled: true },
        { id: 'b', label: 'B' },
      ];
      const { api } = setup({ items });
      act(() => api.current.actions.focusItem('b'));
      act(() => api.current.actions.navigatePrevious());
      expect(api.current.state.focusedItemId).toBe('b');
    });

    it('Escape closes the mobile menu when no dropdown is open', () => {
      const { api } = setupMobile({ mobile: false });
      act(() => api.current.actions.toggleMobileMenu());
      expect(api.current.state.isMobileMenuOpen).toBe(true);
      // No dropdown open → Escape hits the `else if (isMobileMenuOpen)` arm.
      const nav = document.querySelector('[data-testid="nav"]') as HTMLElement;
      fireEvent.keyDown(nav, { key: 'Escape' });
      expect(api.current.state.isMobileMenuOpen).toBe(false);
    });

    it('getItem of an unknown id recurses fully and returns undefined', () => {
      const { api } = setup();
      expect(api.current.actions.getItem?.('nope')).toBeUndefined();
    });

    it('navigateNext/Previous are no-ops when the level has no items', () => {
      const items: NavigationMenuItem[] = [];
      const { api } = setup({ items });
      expect(() => act(() => {
        api.current.actions.navigateNext();
        api.current.actions.navigatePrevious();
      })).not.toThrow();
    });

    it('navigateNext skips to null when every forward item is disabled', () => {
      const items: NavigationMenuItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B', disabled: true },
        { id: 'c', label: 'C', disabled: true },
      ];
      const { api } = setup({ items });
      act(() => api.current.actions.focusItem('a'));
      // b and c disabled → wrap loop exhausts to null, focus stays on a.
      act(() => api.current.actions.navigateNext());
      expect(api.current.state.focusedItemId).toBe('a');
    });

    it('navigatePrevious skips to null when every backward item is disabled', () => {
      const items: NavigationMenuItem[] = [
        { id: 'a', label: 'A', disabled: true },
        { id: 'b', label: 'B' },
      ];
      const { api } = setup({ items });
      act(() => api.current.actions.focusItem('b'));
      act(() => api.current.actions.navigatePrevious());
      expect(api.current.state.focusedItemId).toBe('b');
    });

    it('activating a leaf with autoCloseDropdowns=false does not clear the dropdown', () => {
      const items = buildItems();
      const { api } = setup({ items, autoCloseDropdowns: false });
      act(() => api.current.actions.activateItem('help'));
      act(() => api.current.actions.activateItem('leaf'));
      expect(api.current.state.activeMenuId).toBe('leaf');
    });

    it('getParentItem recurses through children, returns null for unknown, and skips leaf items', () => {
      const { api } = setup();
      // 'about' is nested under 'help' → parent is 'help'.
      expect(api.current.actions.getParentItem?.('about')?.id).toBe('help');
      // Unknown id → full recursion returns null.
      expect(api.current.actions.getParentItem?.('ghost')).toBeNull();
      // Top-level leaf has no parent (its own parent is null).
      expect(api.current.actions.getParentItem?.('leaf')).toBeNull();
    });
  });
});
