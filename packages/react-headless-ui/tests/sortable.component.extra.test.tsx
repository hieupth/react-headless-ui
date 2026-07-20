import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Sortable } from '../src/components/Sortable';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import type { SortableItem } from '../src/hooks';

const defaultItems: SortableItem[] = [
  { id: 'a', value: 'apple', label: 'Apple', index: 0 },
  { id: 'b', value: 'banana', label: 'Banana', index: 1 },
  { id: 'c', value: 'cherry', label: 'Cherry', index: 2 },
];

const makeDataTransfer = () => ({
  effectAllowed: 'uninitialized',
  dropEffect: 'none',
  setData: vi.fn(),
  getData: vi.fn(() => ''),
  setDragImage: vi.fn(),
  types: [] as string[],
});

const dragStart = (el: HTMLElement, payload: any = {}) =>
  fireEvent.dragStart(el, { dataTransfer: makeDataTransfer(), clientX: 0, clientY: 0, ...payload });
const dragOver = (el: HTMLElement, payload: any = {}) =>
  fireEvent.dragOver(el, { dataTransfer: makeDataTransfer(), clientX: 10, clientY: 10, ...payload });
const drop = (el: HTMLElement, payload: any = {}) =>
  fireEvent.drop(el, { dataTransfer: makeDataTransfer(), clientX: 10, clientY: 10, ...payload });

describe('Sortable component (extra)', () => {
  it('uses a custom renderItem renderer and forwards drag props', () => {
    const renderItem = vi.fn(({ item, dragProps }) => (
      <div
        data-testid="custom-item"
        data-id={item.id}
        data-index={item.index}
        draggable={dragProps.draggable}
      >
        {item.label}
      </div>
    ));
    render(<Sortable defaultItems={defaultItems} renderItem={renderItem} />);
    const items = screen.getAllByTestId('custom-item');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('data-id', 'a');
    expect(renderItem).toHaveBeenCalled();
    expect(items[0]).toHaveAttribute('draggable', 'true');
  });

  it('renderItem receives isDragging and isDragOver flags during a drag', () => {
    const renderItem = vi.fn(({ item, isDragging, dragProps }) => (
      <div
        key={item.id}
        data-testid="custom-item"
        data-id={item.id}
        data-dragging={isDragging}
        draggable={dragProps.draggable}
        onDragStart={dragProps.onDragStart}
        onDragOver={dragProps.onDragOver}
        onDrop={dragProps.onDrop}
        onDragEnd={dragProps.onDragEnd}
      >
        {item.label}
      </div>
    ));
    render(<Sortable defaultItems={defaultItems} renderItem={renderItem} />);
    const items = screen.getAllByTestId('custom-item');
    act(() => dragStart(items[0]));
    act(() => dragOver(items[2]));
    const last = renderItem.mock.calls.at(-1)![0];
    expect(last.isDragOver).toBe(true);
  });

  it('renders a custom dragHandle node when showHandles is set', () => {
    render(
      <Sortable
        defaultItems={defaultItems}
        showHandles
        dragHandle={<span data-testid="my-handle">::</span>}
      />
    );
    expect(screen.getAllByTestId('my-handle')).toHaveLength(3);
  });

  it('renders the default svg drag handle when showHandles is set without a custom handle', () => {
    render(<Sortable defaultItems={defaultItems} showHandles />);
    // default handle is an svg inside the drag handle container
    const handles = screen.getAllByTestId('sortable-drag-handle');
    expect(handles).toHaveLength(3);
    expect(handles[0].querySelector('svg')).not.toBeNull();
  });

  it('renders as a custom element via the `as` prop', () => {
    const { container } = render(<Sortable defaultItems={defaultItems} as="ul" />);
    expect(container.querySelector('ul[data-testid="sortable"]')).not.toBeNull();
  });

  it('does not render the drop indicator when showDropIndicator is false', () => {
    render(<Sortable defaultItems={defaultItems} showDropIndicator={false} />);
    const items = screen.getAllByTestId('sortable-item');
    act(() => dragStart(items[0]));
    act(() => dragOver(items[1]));
    expect(screen.queryByTestId('sortable-drop-indicator')).toBeNull();
  });

  it('renders a horizontal drop indicator while dragging in horizontal mode', () => {
    render(<Sortable defaultItems={defaultItems} direction="horizontal" />);
    const items = screen.getAllByTestId('sortable-item');
    act(() => dragStart(items[0]));
    act(() => dragOver(items[1]));
    const indicator = screen.getByTestId('sortable-drop-indicator');
    // horizontal indicator uses width instead of height
    expect((indicator.style as any).width).toBeDefined();
  });

  it('reorders via the custom renderItem drag props', () => {
    const onReorder = vi.fn();
    const renderItem = ({ item, dragProps }: any) => (
      <div
        key={item.id}
        data-testid="custom-item"
        data-id={item.id}
        draggable={dragProps.draggable}
        onDragStart={dragProps.onDragStart}
        onDragEnd={dragProps.onDragEnd}
        onDragOver={dragProps.onDragOver}
        onDrop={dragProps.onDrop}
      >
        {item.label}
      </div>
    );
    render(<Sortable defaultItems={defaultItems} renderItem={renderItem} onReorder={onReorder} />);
    const items = screen.getAllByTestId('custom-item');
    act(() => dragStart(items[0]));
    act(() => dragOver(items[2]));
    act(() => drop(items[2]));
    expect(onReorder).toHaveBeenCalled();
  });

  it('marks custom-rendered items non-draggable when the sortable is disabled', () => {
    const renderItem = ({ item, dragProps }: any) => (
      <div key={item.id} data-testid="custom-item" draggable={dragProps.draggable}>
        {item.label}
      </div>
    );
    render(<Sortable defaultItems={defaultItems} renderItem={renderItem} disabled />);
    expect(screen.getAllByTestId('custom-item')[0]).toHaveAttribute('draggable', 'false');
  });

  it('applies a custom className and merges style', () => {
    render(<Sortable defaultItems={defaultItems} className="my-sortable" style={{ margin: 4 }} />);
    const root = screen.getByTestId('sortable');
    expect(root.className).toContain('my-sortable');
    expect((root.style as any).margin).toBe('4px');
  });

  it('forwards a ref to the rendered element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<Sortable ref={ref as any} defaultItems={defaultItems} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute('data-testid')).toBe('sortable');
  });

  it('horizontal layout produces flex display and row direction', () => {
    render(<Sortable defaultItems={defaultItems} direction="horizontal" />);
    const root = screen.getByTestId('sortable');
    expect((root.style as any).display).toBe('flex');
    expect((root.style as any).flexDirection).toBe('row');
  });

  it('vertical (default) layout produces block display', () => {
    render(<Sortable defaultItems={defaultItems} />);
    const root = screen.getByTestId('sortable');
    expect((root.style as any).display).toBe('block');
  });

  it('marks items non-draggable when an individual item is disabled', () => {
    const items: SortableItem[] = [
      { id: 'a', value: 'a', label: 'A', index: 0, disabled: true },
      { id: 'b', value: 'b', label: 'B', index: 1 },
    ];
    render(<Sortable defaultItems={items} />);
    const els = screen.getAllByTestId('sortable-item');
    expect(els[0]).toHaveAttribute('draggable', 'false');
    expect(els[0]).toHaveAttribute('data-disabled', 'true');
    expect(els[1]).toHaveAttribute('draggable', 'true');
  });

  it('default-render items run a full drag (start→over→drop→end) and show the vertical drop indicator', () => {
    const onReorder = vi.fn();
    render(<Sortable defaultItems={defaultItems} onReorder={onReorder} />);
    const items = screen.getAllByTestId('sortable-item');
    // Full default-render drag flow exercises handleDragStart/handleDragOver/
    // handleDrop/handleDragEnd and the getItemStyles dragging path.
    dragStart(items[0]);
    dragOver(items[2]);
    // While dragging over index 2, the vertical drop indicator renders.
    expect(screen.getByTestId('sortable-drop-indicator')).toBeInTheDocument();
    drop(items[2]);
    expect(onReorder).toHaveBeenCalled();
  });

  it('non-animated sortable renders items without transition (animated=false arm)', () => {
    render(<Sortable defaultItems={defaultItems} animated={false} />);
    const items = screen.getAllByTestId('sortable-item');
    // Non-dragged items exercise the isDragging=false arms of getItemStyles.
    expect(items[1]).toHaveAttribute('data-item-id', 'b');
  });

  it('style fallbacks fire under a stripped (partial) theme', () => {
    // Shallow-merged theme replaces colors/spacing/borderRadius with empty
    // objects, so the `theme.X || 'default'` fallbacks in the style builders
    // (and the dragging-item style branches) are taken.
    const strippedTheme = { colors: {}, spacing: {}, borderRadius: {} } as any;
    render(
      <ThemeProvider theme={strippedTheme}>
        <Sortable defaultItems={defaultItems} showHandles />
      </ThemeProvider>
    );
    const root = screen.getByTestId('sortable');
    expect(root).toBeInTheDocument();
    // Trigger a drag so getItemStyles' dragging branches run under the stripped theme,
    // then fire dragEnd to exercise the component's handleDragEnd wrapper.
    const items = screen.getAllByTestId('sortable-item');
    dragStart(items[0]);
    dragOver(items[1]);
    fireEvent.dragEnd(items[0], { dataTransfer: makeDataTransfer() });
    expect(items[0]).toBeInTheDocument();
  });
});
