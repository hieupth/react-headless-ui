import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useSortable, type UseSortableProps, type SortableItem } from '../src/hooks';

const baseItems: SortableItem[] = [
  { id: 'a', value: 'a', label: 'A', index: 0 },
  { id: 'b', value: 'b', label: 'B', index: 1 },
  { id: 'c', value: 'c', label: 'C', index: 2 },
];

const makeDT = () => ({
  effectAllowed: 'uninitialized' as string,
  dropEffect: 'none' as string,
  setData: vi.fn(),
  getData: vi.fn(() => ''),
  setDragImage: vi.fn(),
  types: [] as string[],
});

function makeEvent(): DragEvent {
  return {
    dataTransfer: makeDT() as any,
    clientX: 5,
    clientY: 7,
    target: ({ tagName: 'DIV' } as any),
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as any;
}

function Probe(props: UseSortableProps & { onApi?: (api: any) => void }) {
  const { onApi, ...rest } = props;
  const api = useSortable(rest);
  onApi?.(api);
  return <div data-testid="h" ref={api.focusable.ref as any} />;
}

describe('useSortable — extra coverage', () => {
  it('startDrag no-ops when disabled / locked / item disabled', () => {
    let api: any;
    const onDragStart = vi.fn();
    render(<Probe defaultItems={baseItems} disabled onDragStart={onDragStart} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    expect(onDragStart).not.toHaveBeenCalled();
    expect(api.state.draggingItem).toBeNull();
  });

  it('startDrag no-ops when locked', () => {
    let api: any;
    const onDragStart = vi.fn();
    render(<Probe defaultItems={baseItems} locked onDragStart={onDragStart} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('startDrag no-ops for a disabled item', () => {
    let api: any;
    const onDragStart = vi.fn();
    const items = [{ ...baseItems[0], disabled: true }, baseItems[1], baseItems[2]];
    render(<Probe defaultItems={items} onDragStart={onDragStart} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(items[0], makeEvent()));
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('startDrag sets data transfer and fires onDragStart', () => {
    let api: any;
    const onDragStart = vi.fn();
    const evt = makeEvent();
    render(<Probe defaultItems={baseItems} onDragStart={onDragStart} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[1], evt));
    expect(onDragStart).toHaveBeenCalledWith(baseItems[1]);
    expect((evt.dataTransfer as any).setData).toHaveBeenCalledWith('text/plain', 'B');
    expect((evt.dataTransfer as any).setData).toHaveBeenCalledWith('application/json', JSON.stringify(baseItems[1]));
    expect(evt.dataTransfer!.effectAllowed).toBe('move');
    expect(api.state.draggingItem).toEqual(baseItems[1]);
  });

  it('startDrag uses string dragImage', () => {
    let api: any;
    const evt = makeEvent();
    render(<Probe defaultItems={baseItems} dragImage="http://img.png" onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], evt));
    expect((evt.dataTransfer as any).setDragImage).toHaveBeenCalled();
  });

  it('startDrag uses HTMLElement dragImage', () => {
    let api: any;
    const evt = makeEvent();
    const el = document.createElement('img');
    render(<Probe defaultItems={baseItems} dragImage={el} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], evt));
    expect((evt.dataTransfer as any).setDragImage).toHaveBeenCalledWith(el, 0, 0);
  });

  it('endDrag fires onDragEnd only when an item was being dragged', () => {
    let api: any;
    const onDragEnd = vi.fn();
    render(<Probe defaultItems={baseItems} onDragEnd={onDragEnd} onApi={(a) => (api = a)} />);
    // No drag in progress: should NOT fire onDragEnd.
    act(() => api.actions.endDrag());
    expect(onDragEnd).not.toHaveBeenCalled();
    // Start a drag, then end.
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    act(() => api.actions.endDrag());
    expect(onDragEnd).toHaveBeenCalledWith(baseItems[0]);
    expect(api.state.draggingItem).toBeNull();
  });

  it('handleDragOver is a no-op without dragging / disabled / locked', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} onApi={(a) => (api = a)} />);
    const evt = makeEvent();
    act(() => api.actions.handleDragOver(1, evt));
    expect(evt.preventDefault).not.toHaveBeenCalled();
    expect(api.state.dragOverIndex).toBeNull();
  });

  it('handleDragOver updates state when dragging', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    const evt = makeEvent();
    act(() => api.actions.handleDragOver(2, evt));
    expect(evt.preventDefault).toHaveBeenCalled();
    expect(api.state.dragOverIndex).toBe(2);
    expect(api.state.dropZoneActive).toBe(true);
  });

  it('handleDrop is a no-op when not dragging / disabled / locked', () => {
    let api: any;
    const onReorder = vi.fn();
    render(<Probe defaultItems={baseItems} onReorder={onReorder} onApi={(a) => (api = a)} />);
    const evt = makeEvent();
    act(() => api.actions.handleDrop(2, evt));
    expect(onReorder).not.toHaveBeenCalled();
    expect(evt.preventDefault).not.toHaveBeenCalled();
  });

  it('handleDrop fires onDrop with dragged + target items', () => {
    let api: any;
    const onDrop = vi.fn();
    const onReorder = vi.fn();
    render(<Probe defaultItems={baseItems} onDrop={onDrop} onReorder={onReorder} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    const evt = makeEvent();
    act(() => api.actions.handleDrop(2, evt));
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(api.state.items.map((i: SortableItem) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('moveItem is a no-op when disabled / locked', () => {
    let api: any;
    const onReorder = vi.fn();
    render(<Probe defaultItems={baseItems} disabled onReorder={onReorder} onApi={(a) => (api = a)} />);
    act(() => api.actions.moveItem(0, 2));
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('reorderItems is a no-op when disabled / locked', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} locked onApi={(a) => (api = a)} />);
    act(() => api.actions.reorderItems([baseItems[1]]));
    expect(api.state.items.length).toBe(3);
  });

  it('addItem appends at end when no index provided', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} onApi={(a) => (api = a)} />);
    act(() => api.actions.addItem({ id: 'd', value: 'd', label: 'D', index: 99 }));
    expect(api.state.items[3].id).toBe('d');
    expect(api.state.items[3].index).toBe(3);
  });

  it('addItem / removeItem / updateItem are no-ops when locked', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} locked onApi={(a) => (api = a)} />);
    act(() => api.actions.addItem({ id: 'd', value: 'd', label: 'D' }));
    act(() => api.actions.removeItem('a'));
    act(() => api.actions.updateItem('a', { label: 'X' }));
    expect(api.state.items.length).toBe(3);
    expect(api.state.items[0].label).toBe('A');
  });

  it('setItems calls onItemsChange even when controlled', () => {
    let api: any;
    const onItemsChange = vi.fn();
    render(<Probe items={baseItems} onItemsChange={onItemsChange} onApi={(a) => (api = a)} />);
    act(() => api.actions.setItems([baseItems[0]]));
    expect(onItemsChange).toHaveBeenCalled();
    // controlled items untouched
    expect(api.state.items.length).toBe(3);
  });

  it('getAccessibilityProps reflects direction, disabled, and busy', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} direction="horizontal" onApi={(a) => (api = a)} />);
    const attrs = api.actions.getAccessibilityProps();
    expect(attrs).toEqual({ role: 'list', 'aria-orientation': 'horizontal', 'aria-disabled': false, 'aria-busy': false });
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    expect(api.actions.getAccessibilityProps()['aria-busy']).toBe(true);
  });

  it('setDirection / lock / unlock are externally-managed no-ops', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} onApi={(a) => (api = a)} />);
    expect(() => {
      api.actions.setDirection('horizontal');
      api.actions.lock();
      api.actions.unlock();
    }).not.toThrow();
  });

  it('classes reflect disabled / locked / direction / animated', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} disabled locked onApi={(a) => (api = a)} />);
    expect(api.classes).toMatchObject({
      base: 'sortable',
      dragging: '',
      dropZone: '',
      disabled: 'sortable-disabled',
      locked: 'sortable-locked',
      'sortable-vertical': true,
      'sortable-animated': true,
    });
  });

  it('classes reflect horizontal direction and animated=false', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} direction="horizontal" animated={false} onApi={(a) => (api = a)} />);
    expect(api.classes['sortable-horizontal']).toBe(true);
    expect(api.classes['sortable-vertical']).toBeUndefined();
    expect(api.classes['sortable-animated']).toBe(false);
  });

  it('auto-scroll adjusts scrollTop for vertical direction near the top edge', () => {
    let api: any;
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    function R() {
      const r = useSortable({ defaultItems: baseItems, autoScroll: true, autoScrollSpeed: 7, sortableRef: ref });
      api = r;
      return (
        <div
          ref={ref as any}
          data-testid="scroller"
          // minimal rect stub via getBoundingClientRect override below
        />
      );
    }
    render(<R />);
    // Provide a deterministic rect + scrollTop slot.
    const node = ref.current!;
    node.scrollTop = 100;
    (node as any).getBoundingClientRect = () => ({ top: 0, bottom: 200, left: 0, right: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => '' });
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    act(() => {
      const e = new Event('dragover', { bubbles: true }) as any;
      e.clientY = 5; // within top threshold (rect.top + 50)
      e.clientX = 100;
      document.dispatchEvent(e);
    });
    expect(node.scrollTop).toBe(93);
  });

  it('auto-scroll adjusts scrollLeft for horizontal direction near the right edge', () => {
    let api: any;
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    function R() {
      const r = useSortable({ defaultItems: baseItems, autoScroll: true, autoScrollSpeed: 9, direction: 'horizontal', sortableRef: ref });
      api = r;
      return <div ref={ref as any} data-testid="scroller" />;
    }
    render(<R />);
    const node = ref.current!;
    node.scrollLeft = 50;
    (node as any).getBoundingClientRect = () => ({ top: 0, bottom: 200, left: 0, right: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => '' });
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    act(() => {
      const e = new Event('dragover', { bubbles: true }) as any;
      e.clientX = 195; // beyond right - threshold
      e.clientY = 100;
      document.dispatchEvent(e);
    });
    expect(node.scrollLeft).toBe(59);
  });

  it('global dragend handler resets drag state', () => {
    let api: any;
    render(<Probe defaultItems={baseItems} onApi={(a) => (api = a)} />);
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    expect(api.state.draggingItem).not.toBeNull();
    act(() => {
      document.dispatchEvent(new Event('dragend', { bubbles: true }));
    });
    expect(api.state.draggingItem).toBeNull();
  });

  it('global dragover handler is a no-op when autoScroll is disabled', () => {
    let api: any;
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    function R() {
      const r = useSortable({ defaultItems: baseItems, autoScroll: false, sortableRef: ref });
      api = r;
      return <div ref={ref as any} />;
    }
    render(<R />);
    const node = ref.current!;
    node.scrollTop = 100;
    (node as any).getBoundingClientRect = () => ({ top: 0, bottom: 200, left: 0, right: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => '' });
    act(() => api.actions.startDrag(baseItems[0], makeEvent()));
    act(() => {
      const e = new Event('dragover', { bubbles: true }) as any;
      e.clientY = 5; e.clientX = 100;
      document.dispatchEvent(e);
    });
    expect(node.scrollTop).toBe(100); // unchanged
  });
});
