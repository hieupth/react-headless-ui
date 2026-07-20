import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Sortable } from '../src/components/Sortable';
import { useSortable, type UseSortableProps, type SortableItem } from '../src/hooks';

const defaultItems: SortableItem[] = [
  { id: 'a', value: 'apple', label: 'Apple', index: 0 },
  { id: 'b', value: 'banana', label: 'Banana', index: 1 },
  { id: 'c', value: 'cherry', label: 'Cherry', index: 2 },
];

// jsdom's DataTransfer is minimal; provide a stub so the hook's setData /
// setDragImage / effectAllowed writes do not throw during dragStart.
const makeDataTransfer = () => ({
  effectAllowed: 'uninitialized',
  dropEffect: 'none',
  setData: vi.fn(),
  getData: vi.fn(() => ''),
  setDragImage: vi.fn(),
  types: [],
});

const dragStart = (el: HTMLElement, payload: any = {}) =>
  fireEvent.dragStart(el, { dataTransfer: makeDataTransfer(), clientX: 0, clientY: 0, ...payload });
const dragOver = (el: HTMLElement, payload: any = {}) =>
  fireEvent.dragOver(el, { dataTransfer: makeDataTransfer(), clientX: 10, clientY: 10, ...payload });
const drop = (el: HTMLElement, payload: any = {}) =>
  fireEvent.drop(el, { dataTransfer: makeDataTransfer(), clientX: 10, clientY: 10, ...payload });

// Harness that always exposes the latest hook API for imperative tests.
function HookHarness(props: UseSortableProps & { onApi?: (api: any) => void }) {
  const { onApi, ...rest } = props;
  const { state, actions } = useSortable(rest);
  onApi?.({ state, actions });
  return <div data-testid="harness" />;
}

describe('Sortable', () => {
  it('renders the sortable list with item labels', () => {
    render(<Sortable defaultItems={defaultItems} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('marks items draggable by default', () => {
    render(<Sortable defaultItems={defaultItems} />);
    const items = screen.getAllByTestId('sortable-item');
    expect(items.length).toBe(3);
    expect(items[0]).toHaveAttribute('draggable', 'true');
  });

  it('reorders items when dragging item 0 onto item 2', () => {
    const onReorder = vi.fn();
    render(<Sortable defaultItems={defaultItems} onReorder={onReorder} />);
    const items = screen.getAllByTestId('sortable-item');
    act(() => {
      dragStart(items[0]);
    });
    expect(items[0]).toHaveAttribute('data-dragging', 'true');
    act(() => {
      dragOver(items[2]);
    });
    expect(items[2]).toHaveAttribute('data-drag-over', 'true');
    act(() => {
      drop(items[2]);
    });
    // After reorder: Banana, Cherry, Apple
    const reordered = screen.getAllByTestId('sortable-item');
    expect(reordered[0].getAttribute('data-item-id')).toBe('b');
    expect(reordered[2].getAttribute('data-item-id')).toBe('a');
    expect(onReorder).toHaveBeenCalled();
  });

  it('fires onDragStart and onDragEnd during a drag', () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    render(
      <Sortable
        defaultItems={defaultItems}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    );
    const items = screen.getAllByTestId('sortable-item');
    act(() => {
      dragStart(items[0]);
    });
    expect(onDragStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
    act(() => {
      drop(items[2]);
    });
    expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
  });

  it('does not start a drag for a disabled item', () => {
    const onDragStart = vi.fn();
    const items: SortableItem[] = [
      { id: 'a', value: 'a', label: 'Apple', index: 0, disabled: true },
      { id: 'b', value: 'b', label: 'Banana', index: 1 },
    ];
    render(<Sortable defaultItems={items} onDragStart={onDragStart} />);
    const els = screen.getAllByTestId('sortable-item');
    expect(els[0]).toHaveAttribute('draggable', 'false');
    act(() => {
      dragStart(els[0]);
    });
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('blocks all dragging when the sortable is disabled', () => {
    const onDragStart = vi.fn();
    render(<Sortable defaultItems={defaultItems} disabled onDragStart={onDragStart} />);
    const els = screen.getAllByTestId('sortable-item');
    expect(els[0]).toHaveAttribute('draggable', 'false');
    expect(screen.getByTestId('sortable')).toHaveAttribute('data-disabled', 'true');
    act(() => {
      dragStart(els[0]);
    });
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('blocks dragging when locked', () => {
    const onReorder = vi.fn();
    render(<Sortable defaultItems={defaultItems} locked onReorder={onReorder} />);
    const els = screen.getAllByTestId('sortable-item');
    expect(els[0]).toHaveAttribute('draggable', 'false');
    expect(screen.getByTestId('sortable')).toHaveAttribute('data-locked', 'true');
  });

  it('renders a horizontal layout when direction is horizontal', () => {
    render(<Sortable defaultItems={defaultItems} direction="horizontal" />);
    expect(screen.getByTestId('sortable')).toHaveAttribute('data-direction', 'horizontal');
  });

  it('renders drag handles when showHandles is set', () => {
    render(<Sortable defaultItems={defaultItems} showHandles />);
    expect(screen.getAllByTestId('sortable-drag-handle').length).toBe(3);
  });

  it('shows the drop indicator while dragging over a target', () => {
    render(<Sortable defaultItems={defaultItems} />);
    const items = screen.getAllByTestId('sortable-item');
    act(() => {
      dragStart(items[0]);
    });
    act(() => {
      dragOver(items[1]);
    });
    expect(screen.getByTestId('sortable-drop-indicator')).toBeInTheDocument();
  });

  it('no-ops drop when the target equals the source index', () => {
    const onReorder = vi.fn();
    render(<Sortable defaultItems={defaultItems} onReorder={onReorder} />);
    const items = screen.getAllByTestId('sortable-item');
    act(() => {
      dragStart(items[1]);
    });
    act(() => {
      drop(items[1]);
    });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('imperatively moves, adds, removes, and updates items', () => {
    let api: any;
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} />);
    expect(api.state.items.length).toBe(3);

    act(() => {
      api.actions.moveItem(0, 2);
    });
    expect(api.state.items[2].id).toBe('a');

    act(() => {
      api.actions.addItem({ id: 'd', value: 'date', label: 'Date', index: 0 } as SortableItem, 0);
    });
    expect(api.state.items[0].id).toBe('d');

    act(() => {
      api.actions.updateItem('d', { label: 'Dragonfruit' });
    });
    expect(api.state.items[0].label).toBe('Dragonfruit');

    act(() => {
      api.actions.removeItem('d');
    });
    expect(api.state.items.find((i: SortableItem) => i.id === 'd')).toBeUndefined();
  });

  it('moveItem is a no-op when from === to', () => {
    let api: any;
    const onReorder = vi.fn();
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} onReorder={onReorder} />);
    act(() => {
      api.actions.moveItem(1, 1);
    });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('reorderItems replaces the full list and reindexes', () => {
    let api: any;
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.reorderItems([defaultItems[2], defaultItems[1], defaultItems[0]]);
    });
    expect(api.state.items.map((i: SortableItem) => i.id)).toEqual(['c', 'b', 'a']);
    expect(api.state.items.map((i: SortableItem) => i.index)).toEqual([0, 1, 2]);
  });

  it('does not mutate controlled items', () => {
    let api: any;
    render(<HookHarness items={defaultItems} onApi={(a) => (api = a)} />);
    const before = api.state.items.map((i: SortableItem) => i.id).join('');
    act(() => {
      api.actions.moveItem(0, 2);
    });
    expect(api.state.items.map((i: SortableItem) => i.id).join('')).toBe(before);
  });

  it('setItems publishes the new list through onItemsChange', () => {
    let api: any;
    const onItemsChange = vi.fn();
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} onItemsChange={onItemsChange} />);
    act(() => {
      api.actions.setItems([defaultItems[1], defaultItems[0]]);
    });
    expect(onItemsChange).toHaveBeenCalled();
  });

  it('reports the sortable element via getSortableElement', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    const apiRef: { current: any } = { current: null };
    function R() {
      const { state, actions } = useSortable({ defaultItems, sortableRef: ref });
      apiRef.current = actions;
      return <div ref={ref as any} data-testid="root" />;
    }
    render(<R />);
    expect(apiRef.current.getSortableElement()).toHaveAttribute('data-testid', 'root');
  });

  // ---- coverage: dragImage branches, guard returns, no-op actions, auto-scroll ----

  it('uses a string dragImage by creating an Image and calling setDragImage', () => {
    const setDragImage = vi.fn();
    const dt = makeDataTransfer();
    dt.setDragImage = setDragImage;
    let api: any;
    render(<HookHarness defaultItems={defaultItems} dragImage="https://x/img.png" onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.startDrag(defaultItems[0], {
        dataTransfer: dt,
        clientX: 1,
        clientY: 2,
        target: {} as HTMLElement,
      } as any);
    });
    expect(setDragImage).toHaveBeenCalled();
    expect(dt.setData).toHaveBeenCalledWith('text/plain', 'Apple');
  });

  it('uses an HTMLElement dragImage via setDragImage', () => {
    const setDragImage = vi.fn();
    const dt = makeDataTransfer();
    dt.setDragImage = setDragImage;
    const el = document.createElement('div');
    let api: any;
    render(<HookHarness defaultItems={defaultItems} dragImage={el} onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.startDrag(defaultItems[0], {
        dataTransfer: dt,
        clientX: 1,
        clientY: 2,
        target: {} as HTMLElement,
      } as any);
    });
    expect(setDragImage).toHaveBeenCalledWith(el, 0, 0);
  });

  it('startDrag without dataTransfer does not throw (jsdom fallback)', () => {
    let api: any;
    const onDragStart = vi.fn();
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} onDragStart={onDragStart} />);
    act(() => {
      api.actions.startDrag(defaultItems[0], { clientX: 1, clientY: 2, target: {} as HTMLElement } as any);
    });
    expect(onDragStart).toHaveBeenCalled();
  });

  it('handleDragOver/handleDrop guard when disabled, locked, or not dragging', () => {
    let api: any;
    const onReorder = vi.fn();
    const onDrop = vi.fn();
    render(
      <HookHarness
        defaultItems={defaultItems}
        disabled
        onApi={(a) => (api = a)}
        onReorder={onReorder}
        onDrop={onDrop}
      />
    );
    const ev = { preventDefault: vi.fn(), dataTransfer: makeDataTransfer() } as any;
    act(() => {
      api.actions.handleDragOver(1, ev);
      api.actions.handleDrop(2, ev);
    });
    expect(ev.preventDefault).not.toHaveBeenCalled();
    expect(onReorder).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('handleDrop moves the dragged item, fires onReorder + onDrop, and clears dragging', () => {
    let api: any;
    const onReorder = vi.fn();
    const onDrop = vi.fn();
    render(
      <HookHarness
        defaultItems={defaultItems}
        onApi={(a) => (api = a)}
        onReorder={onReorder}
        onDrop={onDrop}
      />
    );
    act(() => {
      api.actions.startDrag(defaultItems[0], {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    const ev = { preventDefault: vi.fn(), dataTransfer: makeDataTransfer() } as any;
    act(() => {
      api.actions.handleDrop(2, ev);
    });
    expect(onReorder).toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a' }),
      expect.objectContaining({ id: 'a' })
    );
    expect(api.state.draggingItem).toBeNull();
  });

  it('handleDrop no-ops when the dragged item is not found in the list', () => {
    let api: any;
    const onReorder = vi.fn();
    render(
      <HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} onReorder={onReorder} />
    );
    // Start a drag for an item that is no longer in the list.
    const ghost = { id: 'zzz', value: 'z', label: 'Z', index: 99 };
    act(() => {
      api.actions.startDrag(ghost, {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    const ev = { preventDefault: vi.fn(), dataTransfer: makeDataTransfer() } as any;
    act(() => {
      api.actions.handleDrop(1, ev);
    });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('moveItem/reorderItems/addItem/removeItem/updateItem guard when disabled or locked', () => {
    let api: any;
    const onReorder = vi.fn();
    render(
      <HookHarness defaultItems={defaultItems} locked onApi={(a) => (api = a)} onReorder={onReorder} />
    );
    act(() => {
      api.actions.moveItem(0, 1);
      api.actions.reorderItems([defaultItems[1]]);
      api.actions.addItem({ id: 'd', value: 'd', label: 'D', index: 0 });
      api.actions.removeItem('a');
      api.actions.updateItem('a', { label: 'X' });
    });
    expect(onReorder).not.toHaveBeenCalled();
    expect(api.state.items.length).toBe(3);
  });

  it('addItem appends at the end when no index is provided', () => {
    let api: any;
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.addItem({ id: 'd', value: 'date', label: 'Date' } as SortableItem);
    });
    expect(api.state.items[3].id).toBe('d');
    expect(api.state.items[3].index).toBe(3);
  });

  it('setDirection/lock/unlock are inert no-ops (state is prop-driven)', () => {
    let api: any;
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} />);
    expect(() => {
      act(() => {
        api.actions.setDirection('horizontal');
        api.actions.lock();
        api.actions.unlock();
      });
    }).not.toThrow();
  });

  it('fires onDragEnd when endDrag runs while an item is being dragged', () => {
    let api: any;
    const onDragEnd = vi.fn();
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} onDragEnd={onDragEnd} />);
    act(() => {
      api.actions.startDrag(defaultItems[0], {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    act(() => {
      api.actions.endDrag();
    });
    expect(onDragEnd).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
  });

  it('endDrag is a no-op for onDragEnd when nothing is being dragged', () => {
    let api: any;
    const onDragEnd = vi.fn();
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} onDragEnd={onDragEnd} />);
    act(() => {
      api.actions.endDrag();
    });
    expect(onDragEnd).not.toHaveBeenCalled();
  });

  it('document "dragend" globally resets dragging state', () => {
    let api: any;
    render(<HookHarness defaultItems={defaultItems} onApi={(a) => (api = a)} />);
    act(() => {
      api.actions.startDrag(defaultItems[0], {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    expect(api.state.draggingItem).not.toBeNull();
    act(() => {
      document.dispatchEvent(new Event('dragend'));
    });
    expect(api.state.draggingItem).toBeNull();
  });

  it('document "dragover" auto-scrolls a vertical container when near the top/bottom edges', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    const apiRef: { current: any } = { current: null };
    function R() {
      const { actions } = useSortable({
        defaultItems,
        sortableRef: ref,
        autoScroll: true,
        autoScrollSpeed: 5,
        direction: 'vertical',
      });
      apiRef.current = actions;
      return <div ref={ref as any} data-testid="root" style={{ overflow: 'scroll' }} />;
    }
    render(<R />);
    expect(ref.current).not.toBeNull();
    // jsdom returns zero-sized rects; inject a deterministic rect so the
    // geometry branches are reachable.
    Object.defineProperty(ref.current!, 'getBoundingClientRect', {
      value: () => ({ top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} }),
      configurable: true,
    });
    let scrollTop = 20;
    Object.defineProperty(ref.current!, 'scrollTop', { get: () => scrollTop, set: (v) => (scrollTop = v), configurable: true });
    act(() => {
      apiRef.current.startDrag(defaultItems[0], {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    act(() => {
      document.dispatchEvent(new MouseEvent('dragover', { clientX: 10, clientY: 5 }));
    });
    expect(scrollTop).toBe(15); // 20 - 5
    act(() => {
      document.dispatchEvent(new MouseEvent('dragover', { clientX: 10, clientY: 95 }));
    });
    expect(scrollTop).toBe(20); // 15 + 5
    // Middle of the container — neither edge threshold: no scroll.
    act(() => {
      document.dispatchEvent(new MouseEvent('dragover', { clientX: 10, clientY: 50 }));
    });
    expect(scrollTop).toBe(20);
  });

  it('document "dragover" auto-scrolls a horizontal container near the edges', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    const apiRef: { current: any } = { current: null };
    function R() {
      const { actions } = useSortable({
        defaultItems,
        sortableRef: ref,
        autoScroll: true,
        autoScrollSpeed: 5,
        direction: 'horizontal',
      });
      apiRef.current = actions;
      return <div ref={ref as any} data-testid="root" style={{ overflow: 'scroll' }} />;
    }
    render(<R />);
    Object.defineProperty(ref.current!, 'getBoundingClientRect', {
      value: () => ({ top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} }),
      configurable: true,
    });
    let scrollLeft = 20;
    Object.defineProperty(ref.current!, 'scrollLeft', { get: () => scrollLeft, set: (v) => (scrollLeft = v), configurable: true });
    act(() => {
      apiRef.current.startDrag(defaultItems[0], {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    act(() => {
      document.dispatchEvent(new MouseEvent('dragover', { clientX: 5, clientY: 10 }));
    });
    expect(scrollLeft).toBe(15);
    act(() => {
      document.dispatchEvent(new MouseEvent('dragover', { clientX: 95, clientY: 10 }));
    });
    expect(scrollLeft).toBe(20);
    // Middle of the container — neither edge threshold: no scroll.
    act(() => {
      document.dispatchEvent(new MouseEvent('dragover', { clientX: 50, clientY: 10 }));
    });
    expect(scrollLeft).toBe(20);
  });

  it('document "dragover" is a no-op when autoScroll is disabled', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    const apiRef: { current: any } = { current: null };
    function R() {
      const { actions } = useSortable({ defaultItems, sortableRef: ref, autoScroll: false });
      apiRef.current = actions;
      return <div ref={ref as any} data-testid="root" />;
    }
    render(<R />);
    act(() => {
      apiRef.current.startDrag(defaultItems[0], {
        dataTransfer: makeDataTransfer(),
        clientX: 0,
        clientY: 0,
        target: {} as HTMLElement,
      } as any);
    });
    expect(() => {
      act(() => {
        document.dispatchEvent(new MouseEvent('dragover', { clientX: 5, clientY: 5 }));
      });
    }).not.toThrow();
  });
});
