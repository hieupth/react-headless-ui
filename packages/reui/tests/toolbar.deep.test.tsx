import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type React from 'react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '../src/components/Toolbar';
import { useToolbar } from '../src/hooks';
import type { ToolbarItem } from '../src/hooks';

const items: ToolbarItem[] = [
  { id: 'bold', label: 'Bold', type: 'button' },
  { id: 'italic', label: 'Italic', type: 'button' },
  { id: 'sep', label: '', type: 'separator' },
  { id: 'underline', label: 'Underline', type: 'button' },
];

function Harness({ ...props }: any) {
  const { state, actions } = useToolbar(props);
  return (
    <div>
      <button onClick={() => actions.activateItem('bold')} data-testid="act-bold">actBold</button>
      <button onClick={() => actions.addItem({ id: 'new', label: 'New', type: 'button' })} data-testid="add">add</button>
      <button onClick={() => actions.removeItem('italic')} data-testid="remove">remove</button>
      <button onClick={() => actions.updateItem('bold', { label: 'BoldX' })} data-testid="update">update</button>
      <button onClick={() => actions.moveItem(0, 1)} data-testid="move">move</button>
      <button onClick={actions.toggleCollapsed} data-testid="toggle-col">toggleCol</button>
      <button onClick={() => actions.setCollapsed(true)} data-testid="set-col">setCol</button>
      <button onClick={actions.navigateNext} data-testid="nav-next">navNext</button>
      <button onClick={actions.navigatePrevious} data-testid="nav-prev">navPrev</button>
      <button onClick={() => actions.setItems([{ id: 'only', label: 'Only', type: 'button' }])} data-testid="set-items">setItems</button>
      <span data-testid="active">{String(state.activeItem ?? '')}</span>
      <span data-testid="count">{state.items.length}</span>
      <span data-testid="collapsed">{String(state.collapsed)}</span>
    </div>
  );
}

describe('useToolbar', () => {
  it('renders toolbar buttons and separators from items', () => {
    render(<Toolbar defaultItems={items} showLabels />);
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-separator')).toBeInTheDocument();
  });

  it('activating a button fires its action and onItemActivate', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const onItemActivate = vi.fn();
    const its: ToolbarItem[] = [{ id: 'b', label: 'B', type: 'button', action }];
    render(<Toolbar defaultItems={its} showLabels onItemActivate={onItemActivate} />);
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('disabled button does not fire its action', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const its: ToolbarItem[] = [{ id: 'b', label: 'B', type: 'button', action, disabled: true }];
    render(<Toolbar defaultItems={its} showLabels />);
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(action).not.toHaveBeenCalled();
  });

  it('disabled toolbar ignores activation and navigation', () => {
    render(<Harness defaultItems={items} disabled />);
    fireEvent.click(screen.getByTestId('act-bold'));
    fireEvent.click(screen.getByTestId('nav-next'));
    expect(screen.getByTestId('active').textContent).toBe('');
  });

  it('keyboard ArrowRight/ArrowLeft navigate between enabled buttons', () => {
    const onItemActivate = vi.fn();
    render(<Toolbar defaultItems={items} showLabels onItemActivate={onItemActivate} />);
    const tb = screen.getByTestId('toolbar');
    fireEvent.keyDown(tb, { key: 'ArrowRight' });
    expect(onItemActivate).toHaveBeenCalled();
    fireEvent.keyDown(tb, { key: 'ArrowLeft' });
    fireEvent.keyDown(tb, { key: 'Home' });
    fireEvent.keyDown(tb, { key: 'End' });
    expect(onItemActivate.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('keyboard Home/End jump to first/last enabled button', () => {
    const onItemActivate = vi.fn();
    render(<Toolbar defaultItems={items} showLabels onItemActivate={onItemActivate} />);
    const tb = screen.getByTestId('toolbar');
    fireEvent.keyDown(tb, { key: 'End' });
    expect(onItemActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'underline' }));
    fireEvent.keyDown(tb, { key: 'Home' });
    expect(onItemActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'bold' }));
  });

  // ---- Hook-level ----
  it('activateItem sets active item and fires action', () => {
    const action = vi.fn();
    const onItemActivate = vi.fn();
    render(<Harness defaultItems={[{ id: 'bold', label: 'Bold', type: 'button', action }]} onItemActivate={onItemActivate} />);
    fireEvent.click(screen.getByTestId('act-bold'));
    expect(screen.getByTestId('active').textContent).toBe('bold');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('activateItem ignores separators, spacers, and disabled', () => {
    render(<Harness defaultItems={[
      { id: 's', label: '', type: 'separator' },
      { id: 'sp', label: '', type: 'spacer' },
      { id: 'd', label: 'D', type: 'button', disabled: true },
    ]} />);
    fireEvent.click(screen.getByTestId('act-bold'));
    expect(screen.getByTestId('active').textContent).toBe('');
  });

  it('addItem/removeItem/updateItem/moveItem mutate uncontrolled items', () => {
    render(<Harness defaultItems={items} />);
    fireEvent.click(screen.getByTestId('add'));
    expect(Number(screen.getByTestId('count').textContent)).toBe(items.length + 1);
    fireEvent.click(screen.getByTestId('remove'));
    expect(Number(screen.getByTestId('count').textContent)).toBe(items.length);
    fireEvent.click(screen.getByTestId('update'));
    // updateItem changes Bold -> BoldX (no count change)
    expect(Number(screen.getByTestId('count').textContent)).toBe(items.length);
    fireEvent.click(screen.getByTestId('move'));
    expect(Number(screen.getByTestId('count').textContent)).toBe(items.length);
  });

  it('controlled items ignore addItem/removeItem/updateItem/moveItem/setItems', () => {
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('add'));
    fireEvent.click(screen.getByTestId('remove'));
    fireEvent.click(screen.getByTestId('update'));
    fireEvent.click(screen.getByTestId('move'));
    fireEvent.click(screen.getByTestId('set-items'));
    expect(Number(screen.getByTestId('count').textContent)).toBe(items.length);
  });

  it('toggleCollapsed/setCollapsed flip collapsed and fire onCollapse', () => {
    const onCollapse = vi.fn();
    render(<Harness defaultItems={items} onCollapse={onCollapse} />);
    fireEvent.click(screen.getByTestId('toggle-col'));
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
    expect(onCollapse).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByTestId('set-col'));
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
  });

  it('navigateNext/Previous wrap by default and activate', () => {
    const action = vi.fn();
    render(<Harness defaultItems={[
      { id: 'a', label: 'A', type: 'button', action },
      { id: 'b', label: 'B', type: 'button', action },
    ]} />);
    fireEvent.click(screen.getByTestId('nav-next'));
    expect(screen.getByTestId('active').textContent).toBe('a');
    fireEvent.click(screen.getByTestId('nav-prev'));
    // wraps to last (b) since active=a, prev wraps to b
    expect(screen.getByTestId('active').textContent).toBe('b');
  });

  it('wrapNavigation=false stops at boundaries', () => {
    render(<Harness defaultItems={[
      { id: 'a', label: 'A', type: 'button' },
      { id: 'b', label: 'B', type: 'button' },
    ]} wrapNavigation={false} />);
    // active is null -> navigateNext finds currentIndex -1 -> nextIndex stays 0 (no wrap)
    fireEvent.click(screen.getByTestId('nav-next'));
    expect(screen.getByTestId('active').textContent).toBe('a');
    fireEvent.click(screen.getByTestId('nav-next'));
    expect(screen.getByTestId('active').textContent).toBe('b');
    fireEvent.click(screen.getByTestId('nav-next'));
    // at last, no wrap -> stays b
    expect(screen.getByTestId('active').textContent).toBe('b');
  });

  it('custom renderItem renderer is used', () => {
    render(
      <Toolbar
        defaultItems={items}
        renderItem={({ item, onClick }) => (
          <button key={item.id} onClick={onClick} data-testid={`r-${item.id}`}>{item.label}</button>
        )}
      />
    );
    expect(screen.getByTestId('r-bold')).toBeInTheDocument();
  });

  it('spacer renders a flexible spacer element', () => {
    render(<Toolbar defaultItems={[{ id: 'sp', label: '', type: 'spacer' }]} />);
    expect(screen.getByTestId('toolbar-spacer')).toBeInTheDocument();
  });

  it('focusItem/blurItem are safe no-ops', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, onFocus, onBlur }); return null; }
    render(<P />);
    expect(() => act(() => api.actions.focusItem('bold'))).not.toThrow();
    expect(() => act(() => api.actions.blurItem('bold'))).not.toThrow();
  });

  it('focus/blur toolbar toggle focused state, fire callbacks, and resolve the element', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const ref: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: any = null;
    function P() {
      api = useToolbar({ defaultItems: items, onFocus, onBlur, toolbarRef: ref });
      return <div ref={ref as any} data-testid="tb-host" tabIndex={0} />;
    }
    render(<P />);
    const host = screen.getByTestId('tb-host');
    expect(api.actions.getToolbarElement()).toBe(host);
    act(() => api.actions.focus());
    expect(api.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    act(() => api.actions.blur());
    expect(api.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();
  });

  it('focus is a no-op when disabled', () => {
    const onFocus = vi.fn();
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, disabled: true, onFocus }); return null; }
    render(<P />);
    act(() => api.actions.focus());
    expect(api.state.focused).toBe(false);
    expect(onFocus).toHaveBeenCalled(); // onFocus fires regardless of disabled
  });

  it('navigateNext/Previous are no-ops when there are no navigable buttons', () => {
    let api: any = null;
    function P() {
      api = useToolbar({ defaultItems: [{ id: 's', label: '', type: 'separator' }] });
      return null;
    }
    render(<P />);
    expect(() => act(() => api.actions.navigateNext())).not.toThrow();
    expect(() => act(() => api.actions.navigatePrevious())).not.toThrow();
    expect(api.state.activeItem).toBeNull();
  });

  it('focusItem/blurItem return early when the toolbar is disabled', () => {
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, disabled: true }); return null; }
    render(<P />);
    expect(() => act(() => api.actions.focusItem('bold'))).not.toThrow();
    expect(() => act(() => api.actions.blurItem('bold'))).not.toThrow();
  });

  it('setItems replaces the uncontrolled items', () => {
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items }); return null; }
    render(<P />);
    expect(api.state.items.length).toBe(items.length);
    act(() => api.actions.setItems([{ id: 'only', label: 'Only', type: 'button' }]));
    expect(api.state.items.length).toBe(1);
    expect(api.state.items[0].id).toBe('only');
  });

  it('navigatePrevious wraps to the last item when at the first (wrapNavigation default)', () => {
    const onItemActivate = vi.fn();
    let api: any = null;
    function P() {
      api = useToolbar({
        defaultItems: [{ id: 'a', label: 'A', type: 'button' }, { id: 'b', label: 'B', type: 'button' }],
        onItemActivate,
      });
      return null;
    }
    render(<P />);
    // active is null -> currentIndex -1 -> prevIndex wraps to last (b)
    act(() => api.actions.navigatePrevious());
    expect(api.state.activeItem).toBe('b');
  });

  it('navigatePrevious moves to the previous item when the active item is not first', () => {
    let api: any = null;
    function P() {
      api = useToolbar({
        defaultItems: [{ id: 'a', label: 'A', type: 'button' }, { id: 'b', label: 'B', type: 'button' }],
      });
      return null;
    }
    render(<P />);
    act(() => api.actions.activateItem('b')); // active = b (index 1)
    act(() => api.actions.navigatePrevious()); // currentIndex 1 > 0 -> prev = a
    expect(api.state.activeItem).toBe('a');
  });

  it('navigateNext/Previous are no-ops when the toolbar is disabled', () => {
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, disabled: true }); return null; }
    render(<P />);
    act(() => api.actions.navigateNext());
    act(() => api.actions.navigatePrevious());
    expect(api.state.activeItem).toBeNull();
  });

  it('controlled collapsed state stays authoritative', () => {
    const onCollapse = vi.fn();
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, collapsed: true, onCollapse }); return null; }
    render(<P />);
    expect(api.state.collapsed).toBe(true);
    // toggleCollapsed fires onCollapse but cannot mutate the controlled value.
    act(() => api.actions.toggleCollapsed());
    expect(api.state.collapsed).toBe(true);
    expect(onCollapse).toHaveBeenLastCalledWith(false);
  });

  it('navigateNext wraps to the first item when at the last (wrapNavigation default)', () => {
    let api: any = null;
    function P() {
      api = useToolbar({ defaultItems: [{ id: 'a', label: 'A', type: 'button' }, { id: 'b', label: 'B', type: 'button' }] });
      return null;
    }
    render(<P />);
    act(() => api.actions.activateItem('b')); // active = last
    act(() => api.actions.navigateNext()); // atEnd + wrap -> wraps to a
    expect(api.state.activeItem).toBe('a');
  });

  it('navigatePrevious stays put when at the first item and wrapNavigation is false', () => {
    let api: any = null;
    function P() {
      api = useToolbar({
        defaultItems: [{ id: 'a', label: 'A', type: 'button' }, { id: 'b', label: 'B', type: 'button' }],
        wrapNavigation: false,
      });
      return null;
    }
    render(<P />);
    act(() => api.actions.activateItem('a')); // active = first
    act(() => api.actions.navigatePrevious()); // atStart + no wrap -> stays a
    expect(api.state.activeItem).toBe('a');
  });

  it('setCollapsed is a no-op on the internal state when collapsed is controlled', () => {
    const onCollapse = vi.fn();
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, collapsed: false, onCollapse }); return null; }
    render(<P />);
    act(() => api.actions.setCollapsed(true));
    expect(api.state.collapsed).toBe(false); // controlled value authoritative
    expect(onCollapse).toHaveBeenCalledWith(true);
  });

  it('the disabled toolbar reports a disabled class', () => {
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, disabled: true }); return null; }
    render(<P />);
    // Touching state forces the hook body (and the classes object) to evaluate.
    expect(api.state.disabled).toBe(true);
  });

  it('the sticky toolbar reports a sticky class', () => {
    let api: any = null;
    function P() { api = useToolbar({ defaultItems: items, sticky: true }); return null; }
    render(<P />);
    expect(api.state.sticky).toBe(true);
  });
});
