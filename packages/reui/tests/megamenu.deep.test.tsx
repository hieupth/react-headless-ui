import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import { useMegaMenu, type MegaMenuItem, type UseMegaMenuProps } from '../src/hooks/useMegaMenu';

function Harness({
  hookProps,
  apiRef,
}: {
  hookProps: UseMegaMenuProps;
  apiRef: React.MutableRefObject<ReturnType<typeof useMegaMenu> | null>;
}) {
  const api = useMegaMenu(hookProps);
  apiRef.current = api;
  return (
    <nav ref={api.ref as any} data-testid="root" {...api.eventHandlers} tabIndex={0}>
      {api.state.items.map((it) => (
        <div
          key={it.id}
          data-testid={`item-${it.id}`}
          data-item-id={it.id}
          data-active={api.state.activeItemId === it.id}
          onClick={() => api.actions.handleItemClick(it)}
          onMouseEnter={() => api.actions.handleItemHover(it)}
        >
          {it.label}
          {it.panel !== undefined && (
            <span data-testid={`panel-${it.id}`} data-open={api.state.openPanelIds.has(it.id)} />
          )}
        </div>
      ))}
    </nav>
  );
}

function renderMega(props: UseMegaMenuProps) {
  const apiRef = { current: null as ReturnType<typeof useMegaMenu> | null };
  const utils = render(<Harness hookProps={props} apiRef={apiRef} />);
  return { ...utils, apiRef };
}

async function flush(apiRef: { current: ReturnType<typeof useMegaMenu> | null }) {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return apiRef.current!;
}

const panelA = <div>Panel A content</div>;
const panelB = <div>Panel B content</div>;

const baseItems: MegaMenuItem[] = [
  { id: 'a', label: 'Item A', panel: panelA, onClick: () => {} },
  { id: 'b', label: 'Item B', panel: panelB, disabled: false },
  { id: 'c', label: 'Item C' },
  { id: 'd', label: 'Item D', disabled: true },
];

describe('useMegaMenu', () => {
  it('initializes state with defaults', async () => {
    const { apiRef } = renderMega({ items: baseItems });
    const api = await flush(apiRef);
    expect(api.state.items).toHaveLength(4);
    expect(api.state.openPanelIds.size).toBe(0);
    expect(api.state.focusedItemIndex).toBe(-1);
    expect(api.state.disabled).toBe(false);
  });

  it('uses initialActiveId', async () => {
    const { apiRef } = renderMega({ items: baseItems, initialActiveId: 'b' });
    const api = await flush(apiRef);
    expect(api.state.activeItemId).toBe('b');
  });

  it('handleItemClick sets active, toggles panel, fires onClick + onItemSelect', async () => {
    const onItemSelect = vi.fn();
    const onClick = vi.fn();
    const items: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA, onClick }];
    const { apiRef } = renderMega({ items, onItemSelect });
    await flush(apiRef);
    apiRef.current!.actions.handleItemClick(items[0]);
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a');
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith(items[0]);
  });

  it('clicking an open panel item toggles it closed', async () => {
    const { apiRef } = renderMega({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.handleItemClick(baseItems[0]);
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    apiRef.current!.actions.handleItemClick(baseItems[0]);
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(false);
  });

  it('disabled item is a no-op for click', async () => {
    const onItemSelect = vi.fn();
    const { apiRef } = renderMega({ items: baseItems, onItemSelect });
    await flush(apiRef);
    apiRef.current!.actions.handleItemClick(baseItems[3]); // disabled
    await flush(apiRef);
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(apiRef.current!.state.activeItemId).toBeNull();
  });

  it('disabled mega menu ignores actions', async () => {
    const onItemSelect = vi.fn();
    const { apiRef } = renderMega({ items: baseItems, disabled: true, onItemSelect });
    await flush(apiRef);
    apiRef.current!.actions.handleItemClick(baseItems[0]);
    apiRef.current!.actions.navigateNext();
    apiRef.current!.actions.openPanel('a');
    await flush(apiRef);
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(apiRef.current!.state.activeItemId).toBeNull();
  });

  it('openPanel/closePanel/togglePanel/closeAllPanels manage panel state', async () => {
    const onPanelOpen = vi.fn();
    const onPanelClose = vi.fn();
    const { apiRef } = renderMega({ items: baseItems, onPanelOpen, onPanelClose });
    let api = await flush(apiRef);
    api.actions.openPanel('a');
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    expect(onPanelOpen).toHaveBeenCalledWith('a');
    // allowMultipleOpen=false -> opening b closes a
    apiRef.current!.actions.openPanel('b');
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(false);
    expect(apiRef.current!.state.openPanelIds.has('b')).toBe(true);
    // Opening b while a is open (allowMultipleOpen=false) replaces a without
    // firing onPanelClose for the displaced panel.
    apiRef.current!.actions.togglePanel('b');
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('b')).toBe(false);
    apiRef.current!.actions.openPanel('a');
    await flush(apiRef);
    apiRef.current!.actions.closeAllPanels();
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.size).toBe(0);
  });

  it('allowMultipleOpen permits several panels open', async () => {
    const { apiRef } = renderMega({ items: baseItems, config: { allowMultipleOpen: true } });
    await flush(apiRef);
    apiRef.current!.actions.openPanel('a');
    await flush(apiRef);
    apiRef.current!.actions.openPanel('b');
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    expect(apiRef.current!.state.openPanelIds.has('b')).toBe(true);
  });

  it('setActiveItem updates active + focused index, fires onActiveChange', async () => {
    const onActiveChange = vi.fn();
    const { apiRef } = renderMega({ items: baseItems, onActiveChange });
    await flush(apiRef);
    apiRef.current!.actions.setActiveItem('c');
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('c');
    expect(apiRef.current!.state.focusedItemIndex).toBe(2);
    expect(onActiveChange).toHaveBeenCalledWith('c');
    apiRef.current!.actions.setActiveItem(null);
    await flush(apiRef);
    expect(apiRef.current!.state.focusedItemIndex).toBe(-1);
  });

  it('navigateNext/Previous/First/Last move focused index and wrap', async () => {
    const { apiRef } = renderMega({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.navigateFirst();
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a');
    apiRef.current!.actions.navigateNext();
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('b');
    apiRef.current!.actions.navigateLast();
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('d');
    apiRef.current!.actions.navigateNext(); // wrap
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a');
    apiRef.current!.actions.navigatePrevious(); // wrap back
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('d');
  });

  it('selectCurrentItem toggles panel + fires callbacks for active item', async () => {
    const onItemSelect = vi.fn();
    const onClick = vi.fn();
    const items: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA, onClick }];
    const { apiRef } = renderMega({ items, onItemSelect });
    await flush(apiRef);
    apiRef.current!.actions.setActiveItem('a');
    await flush(apiRef);
    apiRef.current!.actions.selectCurrentItem();
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    expect(onClick).toHaveBeenCalled();
    expect(onItemSelect).toHaveBeenCalled();
  });

  it('selectCurrentItem no-op when disabled item is active', async () => {
    const onItemSelect = vi.fn();
    const { apiRef } = renderMega({ items: baseItems, onItemSelect });
    await flush(apiRef);
    // Manually set active to disabled item via state init
    apiRef.current!.actions.setActiveItem('d');
    await flush(apiRef);
    apiRef.current!.actions.selectCurrentItem();
    await flush(apiRef);
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('keyboard: ArrowRight/Left/Home/End navigate; Enter selects; Escape clears', async () => {
    const onActiveChange = vi.fn();
    const { apiRef } = renderMega({ items: baseItems, onActiveChange });
    await flush(apiRef);
    const root = screen.getByTestId('root');
    fireEvent.keyDown(root, { key: 'Home' });
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a');
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('b');
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a');
    fireEvent.keyDown(root, { key: 'End' });
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('d');
    fireEvent.keyDown(root, { key: 'Enter' });
    await flush(apiRef);
    fireEvent.keyDown(root, { key: 'Escape' });
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBeNull();
    expect(apiRef.current!.state.openPanelIds.size).toBe(0);
  });

  it('keyboard is a no-op when disabled', async () => {
    const { apiRef } = renderMega({ items: baseItems, disabled: true });
    await flush(apiRef);
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByTestId('root'), { key: 'Enter' });
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBeNull();
  });

  it('handleItemHover with hoverActivation opens panel after delay', async () => {
    const onPanelOpen = vi.fn();
    const { apiRef } = renderMega({
      items: baseItems,
      config: { hoverActivation: true, openDelay: 0, closeDelay: 0 },
      onPanelOpen,
    });
    await flush(apiRef);
    apiRef.current!.actions.handleItemHover(baseItems[0]);
    // openDelay setTimeout(0)
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    expect(apiRef.current!.state.activeItemId).toBe('a');
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    expect(onPanelOpen).toHaveBeenCalledWith('a');
  });

  it('handleItemHover is a no-op without hoverActivation', async () => {
    const { apiRef } = renderMega({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.handleItemHover(baseItems[0]);
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBeNull();
  });

  it('outside click closes panels when closeOnOutsideClick', async () => {
    const { apiRef } = renderMega({ items: baseItems });
    await flush(apiRef);
    apiRef.current!.actions.openPanel('a');
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
    // Click outside the root node
    fireEvent.mouseDown(document.body);
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.size).toBe(0);
    expect(apiRef.current!.state.activeItemId).toBeNull();
  });

  it('closeOnOutsideClick disabled keeps panel open on outside click', async () => {
    const { apiRef } = renderMega({ items: baseItems, config: { closeOnOutsideClick: false } });
    await flush(apiRef);
    apiRef.current!.actions.openPanel('a');
    await flush(apiRef);
    fireEvent.mouseDown(document.body);
    await flush(apiRef);
    expect(apiRef.current!.state.openPanelIds.has('a')).toBe(true);
  });

  it('flatens nested children for navigation', async () => {
    const items: MegaMenuItem[] = [
      { id: 'a', label: 'A', children: [
        { id: 'a1', label: 'A1' },
        { id: 'a2', label: 'A2' },
      ] },
      { id: 'b', label: 'B' },
    ];
    const { apiRef } = renderMega({ items });
    await flush(apiRef);
    apiRef.current!.actions.navigateFirst();
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a');
    apiRef.current!.actions.navigateNext();
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a1');
    apiRef.current!.actions.navigateNext();
    await flush(apiRef);
    expect(apiRef.current!.state.activeItemId).toBe('a2');
  });
});
