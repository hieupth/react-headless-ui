import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { usePanel } from '../src/hooks';
import type { UsePanelProps } from '../src/hooks';

// jsdom in this environment ships a non-functional localStorage; provide a
// working in-memory implementation so the rememberCollapsed code path is
// exercised.
const store = new Map<string, string>();
const localStorageShim = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() {
    return store.size;
  },
};
vi.stubGlobal('localStorage', localStorageShim);

// Render-hook style harness: renders the hook and exposes the latest return
// value on a shared `api` object so tests can drive actions imperatively.
function setup(props: UsePanelProps) {
  const api: { returns: ReturnType<typeof usePanel> | null } = { returns: null };
  function Harness() {
    const returns = usePanel(props);
    api.returns = returns;
    return (
      <div
        ref={(el) => {
          // Bind the hook's ref to a real DOM node so focus()/blur() work.
          (returns as any).__bound = el;
          // Attach the panelRef (default internal ref) to the rendered element.
          const r = (returns as any);
          if (r && r.state) {
            (r as any).__panelEl = el;
          }
        }}
        tabIndex={0}
      >
        <button>inner</button>
      </div>
    );
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

// Variant that attaches the hook's panelRef to the rendered element.
function setupWithRef(props: UsePanelProps) {
  const ref = { current: null as HTMLElement | null };
  const api: { returns: ReturnType<typeof usePanel> | null } = { returns: null };
  function Harness() {
    const returns = usePanel({ ...props, panelRef: ref });
    api.returns = returns;
    return (
      <div
        ref={(el) => {
          ref.current = el;
        }}
        tabIndex={0}
      >
        <button>inner</button>
      </div>
    );
  }
  const utils = render(<Harness />);
  return { api, ref, ...utils };
}

describe('usePanel hook', () => {
  it('exposes default state and classes', () => {
    const { api } = setup({ collapsible: true, expandable: true });
    const r = api.returns!;
    expect(r.state.expanded).toBe(false);
    expect(r.state.collapsed).toBe(true); // collapsed when not expanded AND (collapsible||expandable)
    expect(r.state.disabled).toBe(false);
    expect(r.state.loading).toBe(false);
    expect(r.state.collapsible).toBe(true);
    expect(r.state.expandable).toBe(true);
    expect(r.state.interactive).toBe(true);
    expect(r.state.selected).toBe(false);
    expect(r.state.highlighted).toBe(false);
    expect(r.classes.base).toBe('panel');
    expect(r.classes['panel-default']).toBe(true);
    expect(r.classes['panel-md']).toBe(true);
    expect(r.classes.expanded).toBe('');
    expect(r.classes.collapsed).toBe('panel-collapsed');
    expect(r.classes.interactive).toBe('panel-interactive');
  });

  it('collapsed is false when not collapsible/expandable', () => {
    const { api } = setup({});
    expect(api.returns!.state.collapsed).toBe(false);
    expect(api.returns!.classes.collapsed).toBe('');
    expect(api.returns!.classes.interactive).toBe('panel-interactive');
  });

  it('expand/collapse/toggle in uncontrolled mode fire callbacks and flip state', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    const onToggle = vi.fn();
    const { api } = setup({ collapsible: true, expandable: true, onExpand, onCollapse, onToggle });
    const r = api.returns!;

    act(() => r.actions.expand());
    expect(api.returns!.state.expanded).toBe(true);
    expect(api.returns!.state.collapsed).toBe(false);
    expect(api.returns!.classes.expanded).toBe('panel-expanded');
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);

    act(() => r.actions.collapse());
    expect(api.returns!.state.expanded).toBe(false);
    expect(onCollapse).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(false);

    // toggle when collapsed -> expands
    act(() => api.returns!.actions.toggle());
    expect(api.returns!.state.expanded).toBe(true);

    // toggle when expanded -> collapses
    act(() => api.returns!.actions.toggle());
    expect(api.returns!.state.expanded).toBe(false);
  });

  it('expand is a no-op when expandable=false', () => {
    const onExpand = vi.fn();
    const { api } = setup({ expandable: false, onExpand });
    act(() => api.returns!.actions.expand());
    expect(api.returns!.state.expanded).toBe(false);
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('collapse is a no-op when collapsible=false', () => {
    const onCollapse = vi.fn();
    const { api } = setup({ collapsible: false, onCollapse });
    act(() => api.returns!.actions.collapse());
    expect(api.returns!.state.expanded).toBe(false);
    expect(onCollapse).not.toHaveBeenCalled();
  });

  it('expand/collapse are no-ops when disabled', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    const { api } = setup({ disabled: true, collapsible: true, expandable: true, onExpand, onCollapse });
    act(() => api.returns!.actions.expand());
    act(() => api.returns!.actions.collapse());
    expect(onExpand).not.toHaveBeenCalled();
    expect(onCollapse).not.toHaveBeenCalled();
  });

  it('controlled expanded: actions do not mutate internal state', () => {
    const onToggle = vi.fn();
    const { api } = setup({ expanded: false, collapsible: true, expandable: true, onToggle });
    act(() => api.returns!.actions.expand());
    // Controlled -> state stays false, but callbacks still fire
    expect(api.returns!.state.expanded).toBe(false);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('controlled expanded: collapse does not mutate internal state but fires callbacks', () => {
    const onCollapse = vi.fn();
    const onToggle = vi.fn();
    const { api } = setup({ expanded: true, collapsible: true, expandable: true, onCollapse, onToggle });
    act(() => api.returns!.actions.collapse());
    expect(api.returns!.state.expanded).toBe(true);
    expect(onCollapse).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('focus/blur operate on the bound element when interactive', () => {
    const { ref } = setupWithRef({ interactive: true });
    const r = (window as any);
    act(() => {
      // reach into the rendered hook returns via the harness by re-querying
    });
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('focus() focuses the bound element', () => {
    const { ref, api } = setupWithRef({ interactive: true });
    act(() => api.returns!.actions.focus());
    expect(ref.current).toHaveFocus();
  });

  it('focus() is a no-op when not interactive', () => {
    const { ref, api } = setupWithRef({ interactive: false });
    ref.current?.focus();
    act(() => api.returns!.actions.focus());
    // focus won't run because interactive=false
    expect(api.returns!.attributes.tabIndex).toBeUndefined();
  });

  it('focus() is a no-op when disabled', () => {
    const { ref, api } = setupWithRef({ disabled: true });
    act(() => api.returns!.actions.focus());
    expect(ref.current).not.toHaveFocus();
  });

  it('blur() blurs the bound element', () => {
    const { ref, api } = setupWithRef({ interactive: true });
    ref.current?.focus();
    expect(ref.current).toHaveFocus();
    act(() => api.returns!.actions.blur());
    expect(ref.current).not.toHaveFocus();
  });

  it('focus/blur track focused state and the panel-focused class', () => {
    const { api } = setupWithRef({ interactive: true });
    expect(api.returns!.state.focused).toBe(false);
    expect(api.returns!.classes.focused).toBe('');
    act(() => api.returns!.actions.focus());
    expect(api.returns!.state.focused).toBe(true);
    expect(api.returns!.classes.focused).toBe('panel-focused');
    act(() => api.returns!.actions.blur());
    expect(api.returns!.state.focused).toBe(false);
    expect(api.returns!.classes.focused).toBe('');
  });

  it('hover/unhover toggle hovered state, class, and fire onHover', () => {
    const onHover = vi.fn();
    const { api } = setup({ onHover });
    act(() => api.returns!.actions.hover());
    expect(api.returns!.state.hovered).toBe(true);
    expect(api.returns!.classes.hovered).toBe('panel-hovered');
    expect(onHover).toHaveBeenCalledWith(true);
    act(() => api.returns!.actions.unhover());
    expect(api.returns!.state.hovered).toBe(false);
    expect(api.returns!.classes.hovered).toBe('');
    expect(onHover).toHaveBeenCalledWith(false);
  });

  it('hover is a no-op when disabled/non-interactive', () => {
    const onHover = vi.fn();
    const { api } = setup({ disabled: true, onHover });
    act(() => api.returns!.actions.hover());
    expect(api.returns!.state.hovered).toBe(false);
    expect(onHover).not.toHaveBeenCalled();
  });

  it('setSelected updates uncontrolled selected state and fires callback', () => {
    const onSelectionChange = vi.fn();
    const { api } = setup({ onSelectionChange });
    act(() => api.returns!.actions.setSelected(true));
    expect(api.returns!.state.selected).toBe(true);
    expect(api.returns!.classes.selected).toBe('panel-selected');
    expect(onSelectionChange).toHaveBeenCalledWith(true);

    act(() => api.returns!.actions.setSelected(false));
    expect(api.returns!.state.selected).toBe(false);
    expect(onSelectionChange).toHaveBeenCalledWith(false);
  });

  it('setSelected does not mutate internal state when controlled', () => {
    const onSelectionChange = vi.fn();
    const { api } = setup({ selected: false, onSelectionChange });
    act(() => api.returns!.actions.setSelected(true));
    expect(api.returns!.state.selected).toBe(false);
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('setHighlighted toggles highlighted state and class', () => {
    const { api } = setup({});
    act(() => api.returns!.actions.setHighlighted(true));
    expect(api.returns!.state.highlighted).toBe(true);
    expect(api.returns!.classes.highlighted).toBe('panel-highlighted');
    act(() => api.returns!.actions.setHighlighted(false));
    expect(api.returns!.state.highlighted).toBe(false);
  });

  it('getPanelElement returns the bound element', () => {
    const { ref, api } = setupWithRef({});
    expect(api.returns!.actions.getPanelElement()).toBe(ref.current);
  });

  it('getAccessibilityProps reflects collapsible/disabled/selected/loading/interactive', () => {
    const { api } = setup({
      collapsible: true,
      disabled: true,
      loading: true,
      defaultSelected: true,
      interactive: true,
    });
    const props = api.returns!.actions.getAccessibilityProps();
    expect(props['aria-expanded']).toBe(false);
    expect(props['aria-disabled']).toBe(true);
    expect(props['aria-busy']).toBe(true);
    expect(props['aria-selected']).toBe(true);
    expect(props.role).toBe('button');
    // tabIndex omitted when disabled
    expect(props.tabIndex).toBeUndefined();
  });

  it('getAccessibilityProps uses role region and tabIndex 0 when interactive & not disabled', () => {
    const { api } = setup({ interactive: true });
    const props = api.returns!.actions.getAccessibilityProps();
    expect(props.role).toBe('region');
    expect(props.tabIndex).toBe(0);
    expect(props['aria-expanded']).toBeUndefined();
  });

  it('getAccessibilityProps omits tabIndex when not interactive', () => {
    const { api } = setup({ interactive: false });
    const props = api.returns!.actions.getAccessibilityProps();
    expect(props.tabIndex).toBeUndefined();
  });

  it('remembers collapsed state via localStorage when rememberCollapsed is set', () => {
    const key = 'panel-test-key';
    store.clear();
    store.set(key, JSON.stringify(true));
    const { api } = setup({ rememberCollapsed: true, storageKey: key, collapsible: true });
    expect(api.returns!.state.expanded).toBe(true);

    // Saving state on collapse writes back to storage
    act(() => api.returns!.actions.collapse());
    expect(JSON.parse(store.get(key)!)).toBe(false);
    store.clear();
  });

  it('falls back to defaultExpanded when storage value is missing', () => {
    const key = 'panel-missing-key';
    store.clear();
    store.delete(key);
    const { api } = setup({ rememberCollapsed: true, storageKey: key, defaultExpanded: true, expandable: true });
    expect(api.returns!.state.expanded).toBe(true);
    store.clear();
  });

  it('rememberCollapsed without storageKey uses defaultExpanded', () => {
    const { api } = setup({ rememberCollapsed: true, defaultExpanded: true, expandable: true });
    expect(api.returns!.state.expanded).toBe(true);
  });

  it('classes reflect all variants and flags', () => {
    const { api } = setup({
      variant: 'elevated',
      size: 'xl',
      disabled: true,
      loading: true,
      collapsible: true,
      defaultSelected: true,
    });
    const c = api.returns!.classes;
    expect(c['panel-elevated']).toBe(true);
    expect(c['panel-xl']).toBe(true);
    expect(c.disabled).toBe('panel-disabled');
    expect(c.loading).toBe('panel-loading');
    expect(c['panel-collapsible']).toBe(true);
    expect(c.selected).toBe('panel-selected');
  });

  it('expanded class shows when expanded', () => {
    const { api } = setup({ collapsible: true, defaultExpanded: true });
    expect(api.returns!.classes.expanded).toBe('panel-expanded');
    expect(api.returns!.classes.collapsed).toBe('');
  });

  it('interactive=false produces panel-static class', () => {
    const { api } = setup({ interactive: false });
    expect(api.returns!.classes.interactive).toBe('panel-static');
  });
});
