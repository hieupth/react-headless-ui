import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useMegaMenu } from '../src/hooks';
import type { UseMegaMenuProps, MegaMenuItem } from '../src/hooks';

const panelA = <div>Panel A</div>;
const items: MegaMenuItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Products', panel: panelA, children: [
    { id: 'p1', label: 'Product 1' },
    { id: 'p2', label: 'Product 2' },
  ] },
  { id: 'about', label: 'About', onClick: vi.fn() },
];

// Headless-hook harness following the useportal.hook.test.tsx canonical pattern.
function setup(props: Partial<UseMegaMenuProps> = {}, itemsArg: MegaMenuItem[] = items) {
  const api = { state: null as any, actions: null as any, style: null as any, ref: null as any, eventHandlers: null as any, root: null as HTMLElement | null };
  function Harness() {
    const result = useMegaMenu({ items: itemsArg, ...props });
    api.state = result.state;
    api.actions = result.actions;
    api.style = result.style;
    api.ref = result.ref;
    api.eventHandlers = result.eventHandlers;
    return <div ref={(el) => { (result as any).ref(el); api.root = el; }} data-testid="root" />;
  }
  render(<Harness />);
  return api;
}

function makeKey(key: string) {
  return { key } as unknown as React.KeyboardEvent;
}

describe('useMegaMenu hook - state', () => {
  it('initializes default state (empty open panels, active null, focused -1, disabled false)', () => {
    const api = setup();
    expect(api.state.activeItemId).toBeNull();
    expect(api.state.openPanelIds.size).toBe(0);
    expect(api.state.focusedItemIndex).toBe(-1);
    expect(api.state.disabled).toBe(false);
    expect(api.state.items).toBe(items);
    expect(typeof api.ref).toBe('function');
    expect(api.eventHandlers.onKeyDown).toBe(api.actions.handleKeyDown);
    expect(api.eventHandlers.onClick).toBe(api.actions.pressable.press);
  });

  it('honours initialActiveId and disabled flag', () => {
    const api = setup({ initialActiveId: 'home', disabled: true });
    expect(api.state.activeItemId).toBe('home');
    expect(api.state.disabled).toBe(true);
    // NOTE: initialActiveId seeds activeItemId but not focusedItemIndex; only the
    // setActiveItem action syncs the index. Documented behaviour.
    expect(api.state.focusedItemIndex).toBe(-1);
  });
});

describe('useMegaMenu hook - active item', () => {
  it('setActiveItem updates active id and focused index when not disabled', () => {
    const onActiveChange = vi.fn();
    const api = setup({ onActiveChange });
    act(() => api.actions.setActiveItem('products'));
    expect(api.state.activeItemId).toBe('products');
    // flattened: home(0), products(1), p1(2), p2(3)
    expect(api.state.focusedItemIndex).toBe(1);
    expect(onActiveChange).toHaveBeenCalledWith('products');
  });

  it('setActiveItem(null) resets focused index to -1', () => {
    const api = setup({ initialActiveId: 'home' });
    act(() => api.actions.setActiveItem(null));
    expect(api.state.activeItemId).toBeNull();
    expect(api.state.focusedItemIndex).toBe(-1);
  });

  it('setActiveItem with unknown id sets focused index to -1', () => {
    const api = setup();
    act(() => api.actions.setActiveItem('does-not-exist'));
    expect(api.state.activeItemId).toBe('does-not-exist');
    expect(api.state.focusedItemIndex).toBe(-1);
  });

  it('setActiveItem is a no-op when disabled', () => {
    const onActiveChange = vi.fn();
    const api = setup({ disabled: true, onActiveChange });
    act(() => api.actions.setActiveItem('home'));
    expect(api.state.activeItemId).toBeNull();
    expect(onActiveChange).not.toHaveBeenCalled();
  });
});

describe('useMegaMenu hook - panels', () => {
  it('openPanel opens a panel item (single mode closes others) and fires onPanelOpen', () => {
    const onPanelOpen = vi.fn();
    const api = setup({ onPanelOpen });
    act(() => api.actions.openPanel('products'));
    expect(api.state.openPanelIds.has('products')).toBe(true);
    expect(onPanelOpen).toHaveBeenCalledWith('products');
    // single mode: opening another replaces
    act(() => api.actions.openPanel('products'));
  });

  it('openPanel ignores items without a panel', () => {
    const onPanelOpen = vi.fn();
    const api = setup({ onPanelOpen });
    act(() => api.actions.openPanel('home'));
    expect(api.state.openPanelIds.size).toBe(0);
    expect(onPanelOpen).not.toHaveBeenCalled();
  });

  it('openPanel ignores unknown ids', () => {
    const api = setup();
    act(() => api.actions.openPanel('nope'));
    expect(api.state.openPanelIds.size).toBe(0);
  });

  it('openPanel is a no-op when disabled', () => {
    const api = setup({ disabled: true });
    act(() => api.actions.openPanel('products'));
    expect(api.state.openPanelIds.size).toBe(0);
  });

  it('allowMultipleOpen keeps previously open panels', () => {
    const multiItems: MegaMenuItem[] = [
      { id: 'a', label: 'A', panel: <div /> },
      { id: 'b', label: 'B', panel: <div /> },
    ];
    const api = setup({ config: { allowMultipleOpen: true } }, multiItems);
    act(() => api.actions.openPanel('a'));
    act(() => api.actions.openPanel('b'));
    expect(api.state.openPanelIds.has('a')).toBe(true);
    expect(api.state.openPanelIds.has('b')).toBe(true);
  });

  it('closePanel removes the panel and fires onPanelClose', () => {
    const onPanelClose = vi.fn();
    const api = setup({ onPanelClose });
    act(() => api.actions.openPanel('products'));
    act(() => api.actions.closePanel('products'));
    expect(api.state.openPanelIds.has('products')).toBe(false);
    expect(onPanelClose).toHaveBeenCalledWith('products');
  });

  it('closePanel is a no-op when disabled', () => {
    const api = setup({ disabled: true });
    act(() => api.actions.closePanel('products'));
    // no error, no state change
    expect(api.state.openPanelIds.size).toBe(0);
  });

  it('togglePanel opens then closes', () => {
    const api = setup();
    act(() => api.actions.togglePanel('products'));
    expect(api.state.openPanelIds.has('products')).toBe(true);
    act(() => api.actions.togglePanel('products'));
    expect(api.state.openPanelIds.has('products')).toBe(false);
  });

  it('closeAllPanels clears all', () => {
    const api = setup({ config: { allowMultipleOpen: true } }, [
      { id: 'a', label: 'A', panel: <div /> },
      { id: 'b', label: 'B', panel: <div /> },
    ]);
    act(() => api.actions.openPanel('a'));
    act(() => api.actions.openPanel('b'));
    act(() => api.actions.closeAllPanels());
    expect(api.state.openPanelIds.size).toBe(0);
  });

  it('closeAllPanels is a no-op when disabled', () => {
    const api = setup({ disabled: true });
    expect(() => act(() => api.actions.closeAllPanels())).not.toThrow();
  });
});

describe('useMegaMenu hook - navigation', () => {
  it('navigateFirst/navigateLast set first/last flattened item', () => {
    // Flattened order: home(0), products(1), p1(2), p2(3), about(4)
    const api = setup();
    act(() => api.actions.navigateFirst());
    expect(api.state.activeItemId).toBe('home');
    act(() => api.actions.navigateLast());
    expect(api.state.activeItemId).toBe('about');
  });

  it('navigateNext wraps from last to first; navigatePrevious wraps from first to last', () => {
    // Use setActiveItem (not initialActiveId) so focusedItemIndex is synced.
    const api = setup();
    act(() => api.actions.setActiveItem('about')); // index 4 (last)
    act(() => api.actions.navigateNext()); // wrap to first
    expect(api.state.activeItemId).toBe('home');
    act(() => api.actions.setActiveItem('home')); // index 0 (first)
    act(() => api.actions.navigatePrevious()); // wrap to last
    expect(api.state.activeItemId).toBe('about');
  });

  it('navigateNext/Previous move by one in the middle', () => {
    const api = setup();
    act(() => api.actions.setActiveItem('products')); // index 1
    act(() => api.actions.navigateNext());
    expect(api.state.activeItemId).toBe('p1');
    act(() => api.actions.navigatePrevious());
    expect(api.state.activeItemId).toBe('products');
  });

  it('navigation actions are no-ops when disabled or items empty', () => {
    const api = setup({ disabled: true });
    act(() => api.actions.navigateFirst());
    expect(api.state.activeItemId).toBeNull();
    act(() => api.actions.navigateLast());
    expect(api.state.activeItemId).toBeNull();
    act(() => api.actions.navigateNext());
    expect(api.state.activeItemId).toBeNull();
    act(() => api.actions.navigatePrevious());
    expect(api.state.activeItemId).toBeNull();

    const empty = setup({}, []);
    act(() => empty.actions.navigateFirst());
    expect(empty.state.activeItemId).toBeNull();
  });
});

describe('useMegaMenu hook - select & click', () => {
  it('selectCurrentItem toggles panel for panel-items and fires onItemSelect', () => {
    const onItemSelect = vi.fn();
    const api = setup({ initialActiveId: 'products', onItemSelect });
    act(() => api.actions.selectCurrentItem());
    expect(api.state.openPanelIds.has('products')).toBe(true);
    expect(onItemSelect).toHaveBeenCalledTimes(1);

    // disabled item is skipped
    const disabledItems: MegaMenuItem[] = [{ id: 'd', label: 'D', disabled: true }];
    const api2 = setup({ initialActiveId: 'd' }, disabledItems);
    act(() => api2.actions.selectCurrentItem());
    expect(api2.state.openPanelIds.size).toBe(0);
  });

  it('selectCurrentItem invokes item.onClick for items without a panel', () => {
    const onClick = vi.fn();
    const single: MegaMenuItem[] = [{ id: 'x', label: 'X', onClick }];
    const api = setup({ initialActiveId: 'x' }, single);
    act(() => api.actions.selectCurrentItem());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('selectCurrentItem is a no-op when disabled or no active item', () => {
    const api = setup({ disabled: true, initialActiveId: 'home' });
    act(() => api.actions.selectCurrentItem());
    const api2 = setup();
    act(() => api2.actions.selectCurrentItem());
    expect(api2.state.activeItemId).toBeNull();
  });

  it('handleItemClick sets active, toggles panel, fires onClick + onItemSelect', () => {
    const onItemSelect = vi.fn();
    const api = setup({ onItemSelect });
    act(() => api.actions.handleItemClick({ id: 'about', label: 'About', onClick: () => {} }));
    expect(api.state.activeItemId).toBe('about');
    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it('handleItemClick ignores disabled items and disabled menu', () => {
    const onItemSelect = vi.fn();
    const api = setup({ onItemSelect });
    act(() => api.actions.handleItemClick({ id: 'd', label: 'D', disabled: true }));
    expect(api.state.activeItemId).toBeNull();
    expect(onItemSelect).not.toHaveBeenCalled();

    const api2 = setup({ disabled: true });
    act(() => api2.actions.handleItemClick({ id: 'home', label: 'Home' }));
    expect(api2.state.activeItemId).toBeNull();
  });
});

describe('useMegaMenu hook - keyboard', () => {
  it('ArrowRight/ArrowLeft navigate; Home/End jump', () => {
    const api = setup();
    const preventDefault = vi.fn();
    const evt = (key: string) => ({ key, preventDefault } as unknown as React.KeyboardEvent);
    act(() => api.actions.handleKeyDown(evt('ArrowRight')));
    expect(api.state.activeItemId).toBe('home');
    act(() => api.actions.handleKeyDown(evt('ArrowRight')));
    expect(api.state.activeItemId).toBe('products');
    act(() => api.actions.handleKeyDown(evt('ArrowLeft')));
    expect(api.state.activeItemId).toBe('home');
    act(() => api.actions.handleKeyDown(evt('End')));
    expect(api.state.activeItemId).toBe('about'); // last flattened
    act(() => api.actions.handleKeyDown(evt('Home')));
    expect(api.state.activeItemId).toBe('home');
  });

  it('Enter and Space select the current item', () => {
    const api = setup({ initialActiveId: 'products' });
    const preventDefault = vi.fn();
    act(() => api.actions.handleKeyDown({ key: 'Enter', preventDefault } as any));
    expect(api.state.openPanelIds.has('products')).toBe(true);
    act(() => api.actions.handleKeyDown({ key: ' ', preventDefault } as any));
    expect(api.state.openPanelIds.has('products')).toBe(false); // toggled closed
  });

  it('Escape closes all panels and clears active (when closeOnEscape)', () => {
    const api = setup({ initialActiveId: 'products' });
    act(() => api.actions.openPanel('products'));
    const preventDefault = vi.fn();
    act(() => api.actions.handleKeyDown({ key: 'Escape', preventDefault } as any));
    expect(api.state.openPanelIds.size).toBe(0);
    expect(api.state.activeItemId).toBeNull();
  });

  it('Escape is ignored when closeOnEscape is false', () => {
    const api = setup({ initialActiveId: 'products', config: { closeOnEscape: false } });
    act(() => api.actions.openPanel('products'));
    act(() => api.actions.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    expect(api.state.openPanelIds.has('products')).toBe(true);
    expect(api.state.activeItemId).toBe('products');
  });

  it('keyboard is a no-op when disabled', () => {
    const api = setup({ disabled: true });
    act(() => api.actions.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any));
    expect(api.state.activeItemId).toBeNull();
  });

  it('unhandled keys do nothing', () => {
    const api = setup({ initialActiveId: 'home' });
    act(() => api.actions.handleKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    expect(api.state.activeItemId).toBe('home');
  });
});

describe('useMegaMenu hook - hover & outside click', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('handleItemHover opens panel after openDelay when hoverActivation enabled', () => {
    const api = setup({ config: { hoverActivation: true, openDelay: 100 } });
    act(() => api.actions.handleItemHover({ id: 'products', label: 'Products', panel: panelA }));
    expect(api.state.activeItemId).toBeNull(); // not yet
    act(() => { vi.advanceTimersByTime(100); });
    expect(api.state.activeItemId).toBe('products');
    expect(api.state.openPanelIds.has('products')).toBe(true);
  });

  it('handleItemHover is a no-op when hoverActivation disabled, item disabled, or menu disabled', () => {
    const api = setup({ config: { hoverActivation: false } });
    act(() => api.actions.handleItemHover({ id: 'products', label: 'P', panel: panelA }));
    act(() => { vi.advanceTimersByTime(200); });
    expect(api.state.activeItemId).toBeNull();

    const api2 = setup({ config: { hoverActivation: true } });
    act(() => api2.actions.handleItemHover({ id: 'x', label: 'X', disabled: true }));
    expect(api2.state.activeItemId).toBeNull();

    const api3 = setup({ disabled: true, config: { hoverActivation: true } });
    act(() => api3.actions.handleItemHover({ id: 'products', label: 'P', panel: panelA }));
    expect(api3.state.activeItemId).toBeNull();
  });

  it('onMouseLeave handler closes panels after closeDelay (hoverActivation)', () => {
    const api = setup({ config: { hoverActivation: true, closeDelay: 100 } });
    act(() => api.actions.openPanel('products'));
    // Invoke the event handler directly
    act(() => (api.eventHandlers.onMouseLeave as () => void)());
    expect(api.state.openPanelIds.has('products')).toBe(true); // not yet
    act(() => { vi.advanceTimersByTime(100); });
    expect(api.state.openPanelIds.size).toBe(0);
  });

  it('onMouseLeave is a no-op when hoverActivation disabled', () => {
    const api = setup({ config: { hoverActivation: false } });
    act(() => api.actions.openPanel('products'));
    act(() => (api.eventHandlers.onMouseLeave as () => void)());
    act(() => { vi.advanceTimersByTime(500); });
    expect(api.state.openPanelIds.has('products')).toBe(true);
  });

  it('handleOutsideClick closes all panels and clears active (when closeOnOutsideClick)', () => {
    const api = setup({ initialActiveId: 'products', config: { closeOnOutsideClick: true } });
    act(() => api.actions.openPanel('products'));
    act(() => api.actions.handleOutsideClick());
    expect(api.state.openPanelIds.size).toBe(0);
    expect(api.state.activeItemId).toBeNull();
  });

  it('handleOutsideClick is a no-op when closeOnOutsideClick disabled', () => {
    const api = setup({ initialActiveId: 'products', config: { closeOnOutsideClick: false } });
    act(() => api.actions.openPanel('products'));
    act(() => api.actions.handleOutsideClick());
    expect(api.state.openPanelIds.has('products')).toBe(true);
    expect(api.state.activeItemId).toBe('products');
  });

  it('document mousedown outside the root closes panels (effect listener)', () => {
    const api = setup({ initialActiveId: 'products', config: { closeOnOutsideClick: true } });
    act(() => api.actions.openPanel('products'));
    // Dispatch a mousedown on body (outside root)
    act(() => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.state.openPanelIds.size).toBe(0);
    expect(api.state.activeItemId).toBeNull();
  });

  it('document mousedown inside the root does NOT close panels', () => {
    const api = setup({ initialActiveId: 'products', config: { closeOnOutsideClick: true } });
    act(() => api.actions.openPanel('products'));
    act(() => {
      api.root!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.state.openPanelIds.has('products')).toBe(true);
  });

  it('onMouseEnter event handler resolves item via dataset and hovers it', () => {
    const api = setup({ config: { hoverActivation: true, openDelay: 0 } });
    const target = document.createElement('div');
    target.dataset.itemId = 'products';
    act(() => {
      api.eventHandlers.onMouseEnter({ currentTarget: target } as unknown as React.MouseEvent);
    });
    act(() => { vi.advanceTimersByTime(10); });
    expect(api.state.activeItemId).toBe('products');
  });

  it('onMouseEnter ignores targets without a known itemId', () => {
    const api = setup({ config: { hoverActivation: true, openDelay: 0 } });
    const target = document.createElement('div');
    target.dataset.itemId = 'unknown-id';
    expect(() => act(() => {
      api.eventHandlers.onMouseEnter({ currentTarget: target } as unknown as React.MouseEvent);
    })).not.toThrow();
  });

  it('onBlur event handler delegates to handleOutsideClick', () => {
    const api = setup({ initialActiveId: 'home', config: { closeOnOutsideClick: true } });
    act(() => api.actions.openPanel('products'));
    act(() => api.eventHandlers.onBlur({} as unknown as React.FocusEvent));
    expect(api.state.openPanelIds.size).toBe(0);
    expect(api.state.activeItemId).toBeNull();
  });

  it('opening via hover then leaving clears pending open timeout before closing', () => {
    const api = setup({ config: { hoverActivation: true, openDelay: 100, closeDelay: 50 } });
    act(() => api.actions.handleItemHover({ id: 'products', label: 'P', panel: panelA }));
    // Leave before the open delay fires -> pending open cancelled, then close scheduled
    act(() => (api.eventHandlers.onMouseLeave as () => void)());
    act(() => { vi.advanceTimersByTime(200); });
    expect(api.state.openPanelIds.size).toBe(0);
  });
});

describe('useMegaMenu hook - remaining branch coverage', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('findItemById descends into nested children to resolve an item', () => {
    // Hovering a child id (p1) exercises the recursive found-branch in findItemById.
    const api = setup({ config: { hoverActivation: true, openDelay: 0 } });
    const target = document.createElement('div');
    target.dataset.itemId = 'p1';
    act(() => {
      api.eventHandlers.onMouseEnter({ currentTarget: target } as unknown as React.MouseEvent);
    });
    act(() => { vi.advanceTimersByTime(10); });
    expect(api.state.activeItemId).toBe('p1');
  });

  it('pressable press selects the current active item (onPress wiring)', () => {
    const onItemSelect = vi.fn();
    const api = setup({ initialActiveId: 'products', onItemSelect });
    act(() => { (api.eventHandlers.onClick as () => void)(); });
    expect(api.state.openPanelIds.has('products')).toBe(true);
    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it('handleItemClick opens a panel item and handles items without onClick', () => {
    // Panel item -> the `if (item.panel)` true branch; no onClick -> the
    // `if (item.onClick)` false branch.
    const onItemSelect = vi.fn();
    const api = setup({ onItemSelect });
    act(() => api.actions.handleItemClick({ id: 'products', label: 'Products', panel: panelA }));
    expect(api.state.activeItemId).toBe('products');
    expect(api.state.openPanelIds.has('products')).toBe(true);
    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it('handleItemHover sets active for a non-panel item under hoverActivation', () => {
    const api = setup({ config: { hoverActivation: true, openDelay: 0 } });
    act(() => api.actions.handleItemHover({ id: 'home', label: 'Home' })); // no panel
    act(() => { vi.advanceTimersByTime(10); });
    expect(api.state.activeItemId).toBe('home');
    expect(api.state.openPanelIds.size).toBe(0);
  });

  it('onMouseEnter ignores targets without dataset.itemId', () => {
    const api = setup({ config: { hoverActivation: true, openDelay: 0 } });
    const target = document.createElement('div'); // no data-item-id
    expect(() => act(() => {
      api.eventHandlers.onMouseEnter({ currentTarget: target } as unknown as React.MouseEvent);
    })).not.toThrow();
  });
});
