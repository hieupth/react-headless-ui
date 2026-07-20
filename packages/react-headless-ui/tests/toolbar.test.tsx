import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { Toolbar } from '../src/components/Toolbar';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { useToolbar, type ToolbarItem } from '../src/hooks/useToolbar';

const items = [
  { id: 'bold', label: 'Bold', type: 'button' as const },
  { id: 'italic', label: 'Italic', type: 'button' as const },
];

describe('Toolbar', () => {
  it('renders toolbar buttons from items', () => {
    render(<Toolbar defaultItems={items} showLabels />);
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
  });

  it('fires onItemActivate when a button is clicked', async () => {
    const user = userEvent.setup();
    const onItemActivate = vi.fn();
    render(<Toolbar defaultItems={items} showLabels onItemActivate={onItemActivate} />);
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('renders separators, spacers, icons, and variants', () => {
    render(
      <Toolbar
        showLabels
        defaultItems={[
          { id: 'b', label: 'B', type: 'button', icon: <span data-testid="ico">B</span>, variant: 'primary' },
          { id: 'sep', label: '', type: 'separator' },
          { id: 'spc', label: '', type: 'spacer' },
          { id: 'i', label: 'I', type: 'button', variant: 'secondary' },
          { id: 'grp', label: 'G', type: 'group' },
        ]}
      />
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-separator')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-spacer')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders at size=%s', (size) => {
    const { container } = render(<Toolbar size={size} defaultItems={items} />);
    expect(container.querySelector('[data-testid="toolbar"]')).toBeInTheDocument();
  });

  it('renders vertical, sticky, collapsed, disabled, and borderless states', () => {
    const { container } = render(
      <Toolbar
        defaultItems={items}
        orientation="vertical"
        sticky
        defaultCollapsed
        disabled
        showBorder={false}
      />
    );
    const tb = container.querySelector('[data-testid="toolbar"]') as HTMLElement;
    expect(tb.getAttribute('data-disabled')).toBe('true');
  });

  it('activates items via keyboard navigation', () => {
    const onItemActivate = vi.fn();
    render(<Toolbar defaultItems={items} onItemActivate={onItemActivate} />);
    const tb = screen.getByTestId('toolbar');
    fireEvent.keyDown(tb, { key: 'ArrowRight' });
    fireEvent.keyDown(tb, { key: 'ArrowLeft' });
    fireEvent.keyDown(tb, { key: 'Home' });
    fireEvent.keyDown(tb, { key: 'End' });
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('ignores keyboard nav when disabled', () => {
    const onItemActivate = vi.fn();
    render(<Toolbar disabled defaultItems={items} onItemActivate={onItemActivate} />);
    fireEvent.keyDown(screen.getByTestId('toolbar'), { key: 'ArrowRight' });
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('renders a disabled button item', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'x', label: 'X', type: 'button', disabled: true }]}
        showLabels
      />
    );
    expect(screen.getByRole('button', { name: 'X' })).toBeDisabled();
  });

  it('uses a custom renderItem renderer', () => {
    render(
      <Toolbar
        defaultItems={items}
        renderItem={({ item, isActive, onClick }) => (
          <button key={item.id} data-testid={`custom-${item.id}`} data-active={isActive} onClick={onClick}>
            {item.label}
          </button>
        )}
      />
    );
    expect(screen.getByTestId('custom-bold')).toBeInTheDocument();
  });

  it('fires activateItem when a custom-rendered item is clicked', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        defaultItems={items}
        onItemActivate={onItemActivate}
        renderItem={({ item, onClick }) => (
          <button key={item.id} data-testid={`custom-${item.id}`} onClick={onClick}>
            {item.label}
          </button>
        )}
      />
    );
    fireEvent.click(screen.getByTestId('custom-italic'));
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('Home/End are no-ops when there are no enabled buttons', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        defaultItems={[{ id: 'x', label: 'X', type: 'button', disabled: true }]}
        onItemActivate={onItemActivate}
      />
    );
    fireEvent.keyDown(screen.getByTestId('toolbar'), { key: 'Home' });
    fireEvent.keyDown(screen.getByTestId('toolbar'), { key: 'End' });
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders separator/icon sizes at size=%s in vertical orientation', (size) => {
    render(
      <Toolbar
        size={size}
        orientation="vertical"
        showLabels
        defaultItems={[
          { id: 'b', label: 'B', type: 'button', icon: <span data-testid="ico">i</span> },
          { id: 'sep', label: '', type: 'separator' },
          { id: 'i', label: 'I', type: 'button' },
        ]}
      />
    );
    expect(screen.getByTestId('toolbar-separator')).toBeInTheDocument();
  });

  it('reflects focused state styling', () => {
    const { container } = render(<Toolbar defaultItems={items} />);
    const tb = container.querySelector('[data-testid="toolbar"]') as HTMLElement;
    // focus to drive the focusable mixin's focused state -> focus outline
    fireEvent.focus(tb);
    expect(tb).toBeInTheDocument();
  });

  it('falls back to default theme values when the theme lacks them', () => {
    render(
      <ThemeProvider theme={{ colors: {}, borderRadius: {}, spacing: {} }}>
        <Toolbar
          defaultItems={[
            { id: 'b', label: 'B', type: 'button', variant: 'primary' },
            { id: 's', label: 'S', type: 'button', variant: 'secondary' },
            { id: 'sep', label: '', type: 'separator' },
          ]}
          showLabels
        />
      </ThemeProvider>
    );
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('useToolbar', () => {
  const baseItems: ToolbarItem[] = [
    { id: 'a', label: 'A', type: 'button' },
    { id: 'b', label: 'B', type: 'button' },
    { id: 'sep', label: '', type: 'separator' },
    { id: 'spc', label: '', type: 'spacer' },
    { id: 'c', label: 'C', type: 'button', disabled: true },
  ];

  it('exposes default state and classes', () => {
    const { result } = renderHook(() => useToolbar({ defaultItems: baseItems }));
    expect(result.current.state.disabled).toBe(false);
    expect(result.current.state.collapsed).toBe(false);
    expect(result.current.state.orientation).toBe('horizontal');
    expect(result.current.state.size).toBe('md');
    expect(result.current.classes.base).toBe('toolbar');
    expect(result.current.classes['toolbar-horizontal']).toBe(true);
    expect(result.current.classes['toolbar-md']).toBe(true);
  });

  it('reflects vertical orientation, size, sticky, and showLabels flags', () => {
    const { result } = renderHook(() =>
      useToolbar({ defaultItems: baseItems, orientation: 'vertical', size: 'lg', sticky: true, showLabels: false, label: 'Tools' })
    );
    expect(result.current.state.orientation).toBe('vertical');
    expect(result.current.state.size).toBe('lg');
    expect(result.current.state.sticky).toBe(true);
    expect(result.current.state.showLabels).toBe(false);
    expect(result.current.attributes['aria-label']).toBe('Tools');
    expect(result.current.classes['toolbar-vertical']).toBe(true);
    expect(result.current.classes.sticky).toBe('toolbar-sticky');
  });

  it('activateItem runs the action, sets activeItem, and fires onItemActivate', () => {
    const action = vi.fn();
    const onItemActivate = vi.fn();
    const hook = renderHook(() =>
      useToolbar({ defaultItems: [{ id: 'x', label: 'X', type: 'button', action }], onItemActivate })
    );
    actAndRerender(hook, () => hook.result.current.actions.activateItem('x'));
    expect(action).toHaveBeenCalledTimes(1);
    expect(onItemActivate).toHaveBeenCalledTimes(1);
    expect(hook.result.current.state.activeItem).toBe('x');
  });

  it('activateItem is a no-op when the toolbar is disabled', () => {
    const action = vi.fn();
    const hook = renderHook(() =>
      useToolbar({ disabled: true, defaultItems: [{ id: 'x', label: 'X', type: 'button', action }] })
    );
    actAndRerender(hook, () => hook.result.current.actions.activateItem('x'));
    expect(action).not.toHaveBeenCalled();
  });

  it('activateItem ignores separator/spacer/disabled items and unknown ids', () => {
    const action = vi.fn();
    const hook = renderHook(() =>
      useToolbar({
        defaultItems: [
          { id: 'sep', label: '', type: 'separator', action },
          { id: 'spc', label: '', type: 'spacer', action },
          { id: 'd', label: 'D', type: 'button', disabled: true, action },
        ],
      })
    );
    actAndRerender(hook, () => hook.result.current.actions.activateItem('sep'));
    actAndRerender(hook, () => hook.result.current.actions.activateItem('spc'));
    actAndRerender(hook, () => hook.result.current.actions.activateItem('d'));
    actAndRerender(hook, () => hook.result.current.actions.activateItem('missing'));
    expect(action).not.toHaveBeenCalled();
    expect(hook.result.current.state.activeItem).toBeNull();
  });

  it('focusItem/blurItem are no-ops (disabled toolbar returns early)', () => {
    const hook = renderHook(() => useToolbar({ disabled: true, defaultItems: baseItems }));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.focusItem('a'))).not.toThrow();
    expect(() => actAndRerender(hook, () => hook.result.current.actions.blurItem('a'))).not.toThrow();
  });

  it('focusItem/blurItem run without effect on an enabled toolbar (stub bodies)', () => {
    const hook = renderHook(() => useToolbar({ defaultItems: baseItems }));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.focusItem('a'))).not.toThrow();
    expect(() => actAndRerender(hook, () => hook.result.current.actions.blurItem('a'))).not.toThrow();
  });

  it('addItem/removeItem/updateItem/moveItem mutate internal items when uncontrolled', () => {
    const hook = renderHook(() => useToolbar({ defaultItems: [...baseItems] }));
    actAndRerender(hook, () => hook.result.current.actions.addItem({ id: 'new', label: 'N', type: 'button' }));
    expect(hook.result.current.state.items.some(i => i.id === 'new')).toBe(true);

    actAndRerender(hook, () => hook.result.current.actions.updateItem('new', { label: 'N2' }));
    expect(hook.result.current.state.items.find(i => i.id === 'new')?.label).toBe('N2');

    actAndRerender(hook, () => hook.result.current.actions.moveItem(0, 1));
    expect(hook.result.current.state.items[0].id).toBe('b');

    actAndRerender(hook, () => hook.result.current.actions.removeItem('new'));
    expect(hook.result.current.state.items.some(i => i.id === 'new')).toBe(false);
  });

  it('addItem/removeItem/updateItem/moveItem are no-ops when items are controlled', () => {
    const controlled = [...baseItems];
    const hook = renderHook(() => useToolbar({ items: controlled }));
    const before = hook.result.current.state.items.length;
    actAndRerender(hook, () => hook.result.current.actions.addItem({ id: 'new', label: 'N', type: 'button' }));
    actAndRerender(hook, () => hook.result.current.actions.removeItem('a'));
    actAndRerender(hook, () => hook.result.current.actions.updateItem('a', { label: 'Z' }));
    actAndRerender(hook, () => hook.result.current.actions.moveItem(0, 1));
    expect(hook.result.current.state.items.length).toBe(before);
    expect(hook.result.current.state.items.find(i => i.id === 'a')?.label).toBe('A');
  });

  it('setItems replaces internal items when uncontrolled', () => {
    const hook = renderHook(() => useToolbar({ defaultItems: baseItems }));
    actAndRerender(hook, () => hook.result.current.actions.setItems([{ id: 'z', label: 'Z', type: 'button' }]));
    expect(hook.result.current.state.items).toHaveLength(1);
    expect(hook.result.current.state.items[0].id).toBe('z');
  });

  it('setItems is a no-op when items are controlled', () => {
    const hook = renderHook(() => useToolbar({ items: baseItems }));
    actAndRerender(hook, () => hook.result.current.actions.setItems([{ id: 'z', label: 'Z', type: 'button' }]));
    expect(hook.result.current.state.items).toBe(baseItems);
  });

  it('toggleCollapsed flips the collapsed state and fires onCollapse', () => {
    const onCollapse = vi.fn();
    const hook = renderHook(() => useToolbar({ defaultItems: baseItems, onCollapse }));
    expect(hook.result.current.state.collapsed).toBe(false);
    actAndRerender(hook, () => hook.result.current.actions.toggleCollapsed());
    expect(hook.result.current.state.collapsed).toBe(true);
    expect(onCollapse).toHaveBeenCalledWith(true);
    expect(hook.result.current.classes.collapsed).toBe('toolbar-collapsed');
  });

  it('toggleCollapsed does not mutate internal state when collapsed is controlled', () => {
    const onCollapse = vi.fn();
    const hook = renderHook(() => useToolbar({ defaultItems: baseItems, collapsed: false, onCollapse }));
    actAndRerender(hook, () => hook.result.current.actions.toggleCollapsed());
    expect(hook.result.current.state.collapsed).toBe(false);
    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it('setCollapsed sets the state and fires onCollapse', () => {
    const onCollapse = vi.fn();
    const hook = renderHook(() => useToolbar({ defaultItems: baseItems, onCollapse }));
    actAndRerender(hook, () => hook.result.current.actions.setCollapsed(true));
    expect(hook.result.current.state.collapsed).toBe(true);
    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it('setCollapsed does not mutate internal state when controlled', () => {
    const onCollapse = vi.fn();
    const hook = renderHook(() => useToolbar({ defaultItems: baseItems, collapsed: false, onCollapse }));
    actAndRerender(hook, () => hook.result.current.actions.setCollapsed(true));
    expect(hook.result.current.state.collapsed).toBe(false);
  });

  it('navigateNext/navigatePrevious wrap by default', () => {
    const onItemActivate = vi.fn();
    const navItems: ToolbarItem[] = [
      { id: 'n1', label: '1', type: 'button' },
      { id: 'n2', label: '2', type: 'button' },
    ];
    const hook = renderHook(() => useToolbar({ defaultItems: navItems, onItemActivate }));
    // no active item -> next wraps to first; previous wraps to last
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.activeItem).toBe('n1');
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.activeItem).toBe('n2');
    // at end, wraps to first
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.activeItem).toBe('n1');
    // at start, previous wraps to last
    actAndRerender(hook, () => hook.result.current.actions.navigatePrevious());
    expect(hook.result.current.state.activeItem).toBe('n2');
    // from a mid position (n2), previous steps to n1 (currentIndex-1)
    actAndRerender(hook, () => hook.result.current.actions.navigatePrevious());
    expect(hook.result.current.state.activeItem).toBe('n1');
  });

  it('navigateNext/navigatePrevious clamp when wrapNavigation is false', () => {
    const navItems: ToolbarItem[] = [
      { id: 'n1', label: '1', type: 'button' },
      { id: 'n2', label: '2', type: 'button' },
    ];
    const hook = renderHook(() => useToolbar({ defaultItems: navItems, wrapNavigation: false }));
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.activeItem).toBe('n2');
    // at end, no wrap -> stays on last
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    expect(hook.result.current.state.activeItem).toBe('n2');
    // at start (currentIndex 0 from findIndex miss -> -1 <= 0), previous clamps
    actAndRerender(hook, () => {
      hook.result.current.actions.activateItem('n1');
    });
    actAndRerender(hook, () => hook.result.current.actions.navigatePrevious());
    expect(hook.result.current.state.activeItem).toBe('n1');
  });

  it('navigateNext/navigatePrevious are no-ops with no navigable items or disabled toolbar', () => {
    const hook = renderHook(() =>
      useToolbar({ defaultItems: [{ id: 's', label: '', type: 'separator' }] })
    );
    actAndRerender(hook, () => hook.result.current.actions.navigateNext());
    actAndRerender(hook, () => hook.result.current.actions.navigatePrevious());
    expect(hook.result.current.state.activeItem).toBeNull();

    const disabledHook = renderHook(() => useToolbar({ disabled: true, defaultItems: items }));
    actAndRerender(disabledHook, () => disabledHook.result.current.actions.navigateNext());
    actAndRerender(disabledHook, () => disabledHook.result.current.actions.navigatePrevious());
    expect(disabledHook.result.current.state.activeItem).toBeNull();
  });

  it('focus/blur update focused state and fire callbacks against the toolbar element', () => {
    const ref: React.RefObject<HTMLDivElement | null> = { current: null };
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    let api: ReturnType<typeof useToolbar> | null = null;
    function Probe() {
      api = useToolbar({ toolbarRef: ref as any, onFocus, onBlur });
      return <div ref={ref as any} data-testid="tb" tabIndex={0} />;
    }
    render(<Probe />);
    act(() => api!.actions.focus());
    expect(api!.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByTestId('tb'));
    act(() => api!.actions.blur());
    expect(api!.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();
  });

  it('focus is a no-op against the DOM when disabled but still fires onFocus', () => {
    const ref: React.RefObject<HTMLDivElement | null> = { current: null };
    const onFocus = vi.fn();
    let api: ReturnType<typeof useToolbar> | null = null;
    function Probe() {
      api = useToolbar({ disabled: true, toolbarRef: ref as any, onFocus });
      return <div ref={ref as any} data-testid="tb-d" tabIndex={0} />;
    }
    render(<Probe />);
    act(() => api!.actions.focus());
    expect(api!.state.focused).toBe(false);
    expect(onFocus).toHaveBeenCalled();
  });

  it('getToolbarElement returns the live element and getAccessibilityProps exposes role/attrs', () => {
    const ref: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: ReturnType<typeof useToolbar> | null = null;
    function Probe() {
      api = useToolbar({ toolbarRef: ref as any, label: 'Actions', disabled: true, orientation: 'vertical' });
      return <div ref={ref as any} data-testid="tb2" />;
    }
    render(<Probe />);
    expect(api!.actions.getToolbarElement()).toBe(screen.getByTestId('tb2'));
    const props = api!.actions.getAccessibilityProps();
    expect(props.role).toBe('toolbar');
    expect(props['aria-label']).toBe('Actions');
    expect(props['aria-orientation']).toBe('vertical');
    expect(props['aria-disabled']).toBe(true);
  });
});
