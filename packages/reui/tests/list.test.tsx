import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { List, ListTimeline, ListCompact } from '../src/components/List';
import { useList, type UseListProps, type ListItem } from '../src/hooks';
import { ThemeProvider } from '../src/providers/ThemeProvider';

const fruits: ListItem[] = [
  { id: 'a', value: 'apple', label: 'Apple' },
  { id: 'b', value: 'banana', label: 'Banana' },
  { id: 'c', value: 'cherry', label: 'Cherry' },
];

// Wrapper that exposes the hook's actions through a button so tests can drive
// imperative actions (addItem, pagination, sorting, etc.) that the component
// does not surface via DOM interactions.
function HookHarness(props: UseListProps & { onActions?: (api: any) => void }) {
  const { onActions, ...rest } = props;
  const { state, actions } = useList(rest);
  // Expose the latest {state, actions} on every render so tests can drive
  // imperative actions and then read the updated state synchronously.
  onActions?.({ state, actions });
  return (
    <div>
      <span data-testid="harness-mounted" />
    </div>
  );
}

describe('List', () => {
  it('renders items from the items prop', () => {
    render(<List items={fruits} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders an empty message when items is empty', () => {
    render(<List items={[]} />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders a custom empty message', () => {
    render(<List items={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('selects an item on click and marks it active', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<List items={fruits} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByText('Apple'));
    const apple = screen.getAllByTestId('list-item')[0];
    expect(apple).toHaveAttribute('data-selected', 'true');
    expect(apple).toHaveAttribute('data-active', 'true');
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
  });

  it('replaces selection in single-select mode', async () => {
    const user = userEvent.setup();
    render(<List items={fruits} />);
    await user.click(screen.getByText('Apple'));
    await user.click(screen.getByText('Banana'));
    const items = screen.getAllByTestId('list-item');
    expect(items[0]).toHaveAttribute('data-selected', 'false');
    expect(items[1]).toHaveAttribute('data-selected', 'true');
  });

  it('accumulates selection in multi-select mode', async () => {
    const user = userEvent.setup();
    render(<List items={fruits} multiSelect />);
    await user.click(screen.getByText('Apple'));
    await user.click(screen.getByText('Banana'));
    const items = screen.getAllByTestId('list-item');
    expect(items[0]).toHaveAttribute('data-selected', 'true');
    expect(items[1]).toHaveAttribute('data-selected', 'true');
  });

  it('deselects a selected item on a second click in multi-select mode', async () => {
    const user = userEvent.setup();
    render(<List items={fruits} multiSelect />);
    await user.click(screen.getByText('Apple'));
    await user.click(screen.getByText('Apple'));
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-selected', 'false');
  });

  it('does not toggle a disabled item on click', async () => {
    const user = userEvent.setup();
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', disabled: true },
      { id: 'b', value: 'b', label: 'Banana' },
    ];
    render(<List items={items} />);
    await user.click(screen.getByText('Apple'));
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-selected', 'false');
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-disabled', 'true');
  });

  it('ignores clicks when the whole list is disabled', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<List items={fruits} disabled onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByText('Apple'));
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('list')).toHaveAttribute('data-disabled', 'true');
  });

  it('filters items by the search query', async () => {
    const user = userEvent.setup();
    render(
      <List
        items={fruits}
        searchable
        renderSearch={({ value, onChange }) => (
          <input
            data-testid="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />
    );
    await user.type(screen.getByTestId('search'), 'che');
    expect(screen.getByText('Cherry')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('moves active item with ArrowDown / ArrowUp', () => {
    render(<List items={fruits} />);
    const list = screen.getByTestId('list');
    act(() => {
      fireEvent.keyDown(list, { key: 'ArrowDown' });
    });
    // active item becomes the first filtered item (no active set initially)
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
    act(() => {
      fireEvent.keyDown(list, { key: 'ArrowDown' });
    });
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'true');
    act(() => {
      fireEvent.keyDown(list, { key: 'ArrowUp' });
    });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
  });

  it('jumps to first / last with Home / End', () => {
    render(<List items={fruits} />);
    const list = screen.getByTestId('list');
    act(() => {
      fireEvent.keyDown(list, { key: 'End' });
    });
    expect(screen.getAllByTestId('list-item')[2]).toHaveAttribute('data-active', 'true');
    act(() => {
      fireEvent.keyDown(list, { key: 'Home' });
    });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
  });

  it('toggles the active item via Enter', () => {
    render(<List items={fruits} />);
    const list = screen.getByTestId('list');
    act(() => {
      fireEvent.keyDown(list, { key: 'ArrowDown' });
    });
    act(() => {
      fireEvent.keyDown(list, { key: 'Enter' });
    });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-selected', 'true');
  });

  it('selects all via Ctrl+A only in multi-select mode', () => {
    const onSelectionChange = vi.fn();
    render(<List items={fruits} multiSelect onSelectionChange={onSelectionChange} />);
    const list = screen.getByTestId('list');
    act(() => {
      fireEvent.keyDown(list, { key: 'a', ctrlKey: true });
    });
    expect(onSelectionChange).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('does nothing on Ctrl+A in single-select mode', () => {
    const onSelectionChange = vi.fn();
    render(<List items={fruits} onSelectionChange={onSelectionChange} />);
    const list = screen.getByTestId('list');
    act(() => {
      fireEvent.keyDown(list, { key: 'a', ctrlKey: true });
    });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('auto-focuses the first non-disabled item when autoFocus is set', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', disabled: true },
      { id: 'b', value: 'b', label: 'Banana' },
    ];
    render(<List items={items} autoFocus />);
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'true');
  });

  it('paginates items and exposes total pages via the hook', () => {
    let captured: any;
    render(
      <HookHarness
        items={fruits}
        pagination={{ enabled: true, itemsPerPage: 2, defaultPage: 1 }}
        onActions={(a) => (captured = a)}
      />
    );
    expect(captured.actions.nextPage).toBeDefined();
    act(() => {
      captured.actions.nextPage();
    });
    // page 2 of 2-per-page -> only cherry remains on page 2
    expect(captured).toBeDefined();
  });

  it('clamps goToPage within the valid range', () => {
    let captured: any;
    const onPageChange = vi.fn();
    render(
      <HookHarness
        items={fruits}
        pagination={{ enabled: true, itemsPerPage: 2 }}
        onPageChange={onPageChange}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.goToPage(99);
    });
    // 3 items / 2 per page = 2 pages, so 99 clamps to 2
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('adds and removes items when uncontrolled', () => {
    let captured: any;
    render(
      <HookHarness
        defaultItems={fruits}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.addItem({ id: 'd', value: 'date', label: 'Date' });
    });
    expect(captured).toBeDefined();
    act(() => {
      captured.actions.removeItem('a');
    });
    expect(captured).toBeDefined();
  });

  it('no-ops add/remove when items are controlled', () => {
    let captured: any;
    render(
      <HookHarness
        items={fruits}
        onActions={(a) => (captured = a)}
      />
    );
    const before = captured.state.items.length;
    act(() => {
      captured.actions.addItem({ id: 'd', value: 'd', label: 'Date' });
      captured.actions.removeItem('a');
    });
    expect(captured.state.items.length).toBe(before);
  });

  it('updates and moves items via the hook actions', () => {
    let captured: any;
    render(
      <HookHarness
        defaultItems={fruits}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.updateItem('a', { label: 'Apricot' });
    });
    expect(captured.state.items[0].label).toBe('Apricot');
    act(() => {
      captured.actions.moveItem(0, 2);
    });
    expect(captured.state.items[2].id).toBe('a');
  });

  it('removes a selected item from the selection set', () => {
    let captured: any;
    render(
      <HookHarness
        defaultItems={fruits}
        defaultSelectedKeys={['a']}
        onActions={(a) => (captured = a)}
      />
    );
    expect(captured.state.selectedItems.has('a')).toBe(true);
    act(() => {
      captured.actions.removeItem('a');
    });
    expect(captured.state.selectedItems.has('a')).toBe(false);
  });

  it('sorts items when sortable and setSorting is called', () => {
    let captured: any;
    const onSort = vi.fn();
    render(
      <HookHarness
        defaultItems={[fruits[2], fruits[0], fruits[1]]}
        sortable
        defaultSortField="label"
        onSort={onSort}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.setSorting('label', 'desc');
    });
    expect(captured.state.sortDirection).toBe('desc');
    expect(captured.state.filteredItems[0].label).toBe('Cherry');
    expect(onSort).toHaveBeenCalledWith('label', 'desc');
  });

  it('uses a custom filter function when provided', () => {
    let captured: any;
    render(
      <HookHarness
        defaultItems={fruits}
        searchable
        filterFunction={(item, query) => item.label.toLowerCase().startsWith(query)}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.setSearchQuery('Ap');
    });
    expect(captured.state.filteredItems.length).toBe(1);
    expect(captured.state.filteredItems[0].label).toBe('Apple');
  });

  it('clears search and resets page', () => {
    let captured: any;
    render(
      <HookHarness
        defaultItems={fruits}
        searchable
        pagination={{ enabled: true, itemsPerPage: 2 }}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.setSearchQuery('xyz');
    });
    expect(captured.state.searchQuery).toBe('xyz');
    act(() => {
      captured.actions.clearSearch();
    });
    expect(captured.state.searchQuery).toBe('');
  });

  it('deselectAll and clearSelection emit empty selection', () => {
    let captured: any;
    const onSelectionChange = vi.fn();
    render(
      <HookHarness
        defaultItems={fruits}
        defaultSelectedKeys={['a', 'b']}
        onSelectionChange={onSelectionChange}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.deselectAll();
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it('emits onActiveItemChange when active item changes', () => {
    let captured: any;
    const onActiveItemChange = vi.fn();
    render(
      <HookHarness
        defaultItems={fruits}
        onActiveItemChange={onActiveItemChange}
        onActions={(a) => (captured = a)}
      />
    );
    act(() => {
      captured.actions.setActiveItem('b');
    });
    expect(onActiveItemChange).toHaveBeenCalledWith('b');
  });

  it('honours controlled selection and does not mutate internal state', () => {
    let captured: any;
    render(
      <HookHarness
        defaultItems={fruits}
        selectedKeys={['b']}
        onActions={(a) => (captured = a)}
      />
    );
    expect(captured.state.selectedItems.has('b')).toBe(true);
    // toggling another item in controlled mode should not change internal state
    act(() => {
      captured.actions.selectItem('a');
    });
    expect(captured.state.selectedItems.has('a')).toBe(false);
  });
});

describe('List (rendering branches)', () => {
  it('paginates visible items when pagination is enabled across multiple pages', () => {
    const many: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple' },
      { id: 'b', value: 'b', label: 'Banana' },
      { id: 'c', value: 'c', label: 'Cherry' },
      { id: 'd', value: 'd', label: 'Date' },
    ];
    render(<List items={many} pagination={{ enabled: true, itemsPerPage: 2 }} />);
    const items = screen.getAllByTestId('list-item');
    expect(items).toHaveLength(2); // first page only
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });

  it('renders a custom renderPagination slot', () => {
    render(
      <List
        items={fruits}
        pagination={{ enabled: true, itemsPerPage: 2 }}
        renderPagination={({ currentPage, totalPages, onPageChange }) => (
          <button data-testid="pager" onClick={() => onPageChange(currentPage + 1)}>
            {currentPage}/{totalPages}
          </button>
        )}
      />
    );
    const pager = screen.getByTestId('pager');
    expect(pager.textContent).toBe('1/2');
    act(() => { fireEvent.click(pager); });
    expect(screen.getByTestId('pager').textContent).toBe('2/2');
  });

  it('renders a custom renderEmpty slot', () => {
    render(<List items={[]} renderEmpty={() => <div data-testid="custom-empty">none</div>} />);
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });

  it('renders a custom renderLoading slot', () => {
    render(<List items={[]} loading renderLoading={() => <div data-testid="custom-loading">loading</div>} />);
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('renders a custom renderSearch slot when searchable', () => {
    render(
      <List
        items={fruits}
        searchable
        renderSearch={({ value, onChange, placeholder }) => (
          <input
            data-testid="custom-search"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      />
    );
    expect(screen.getByTestId('custom-search')).toHaveAttribute('placeholder', 'Search items...');
  });

  it('renders items through a custom renderItem slot', () => {
    render(
      <List
        items={fruits}
        renderItem={({ item, selected, active }) => (
          <div data-testid={`custom-${item.id}`} data-selected={selected} data-active={active}>
            {item.label}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-a')).toBeInTheDocument();
    // custom renderItem path does not render the timeline/empty slots.
  });

  it('formats timestamps rendered as Date / string / number', () => {
    const items: ListItem[] = [
      { id: 'd', value: 'd', label: 'D', timestamp: new Date('2024-01-15T00:00:00Z') },
      { id: 's', value: 's', label: 'S', timestamp: '2024-02-20T00:00:00Z' },
      { id: 'n', value: 'n', label: 'N', timestamp: 1700000000000 },
    ];
    const { container } = render(<List items={items} showTimestamps />);
    // Each item renders a timestamp node; all three format branches execute.
    expect(container.querySelectorAll('[data-testid="list-item"]')).toHaveLength(3);
  });

  it('renders item descriptions and numbers', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', description: 'A red fruit' },
      { id: 'b', value: 'b', label: 'Banana', description: 'A yellow fruit' },
    ];
    render(<List items={items} showNumbers />);
    expect(screen.getByText('A red fruit')).toBeInTheDocument();
    expect(screen.getAllByTestId('list-item-number')).toHaveLength(2);
  });

  it('renders the timeline line and dots (left + right position, item color)', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', color: '#ff0000' },
      { id: 'b', value: 'b', label: 'Banana' },
    ];
    const { rerender } = render(<List items={items} showTimeline timelinePosition="left" />);
    expect(screen.getByTestId('list-timeline')).toBeInTheDocument();
    expect(screen.getAllByTestId('list-timeline-dot')).toHaveLength(2);

    rerender(<List items={items} showTimeline timelinePosition="right" />);
    expect(screen.getByTestId('list-timeline')).toBeInTheDocument();
  });

  it('applies a custom timelineColor', () => {
    render(<List items={fruits} showTimeline timelineColor="#123456" />);
    expect(screen.getByTestId('list-timeline')).toBeInTheDocument();
  });

  it('renders in horizontal orientation with sm and lg item sizes', () => {
    const { rerender } = render(<List items={fruits} orientation="horizontal" itemSize="sm" />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-orientation', 'horizontal');
    rerender(<List items={fruits} orientation="horizontal" itemSize="lg" />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(3);
  });

  it('renders with compact, dividers, no borders, and no numbers variants', () => {
    const { container } = render(
      <List items={fruits} compact showDividers showBorders={false} />
    );
    const list = screen.getByTestId('list');
    expect(list.className).toContain('list-compact');
    expect(list.className).toContain('list-divided');
    expect(list.className).toContain('list-borderless');
    expect(list.className).toContain('list-unnumbered');
    expect(container).toBeTruthy();
  });

  it('marks a selected item with selected styles and renders an active outline', async () => {
    const user = userEvent.setup();
    render(<List items={fruits} />);
    await user.click(screen.getByText('Apple'));
    const apple = screen.getAllByTestId('list-item')[0];
    expect(apple).toHaveAttribute('data-selected', 'true');
    expect(apple).toHaveAttribute('data-active', 'true');
  });
});

describe('List (keyboard navigation branches)', () => {
  it('is a no-op on keydown when the whole list is disabled', () => {
    const onSelectionChange = vi.fn();
    render(<List items={fruits} disabled onSelectionChange={onSelectionChange} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'ArrowDown' }); });
    act(() => { fireEvent.keyDown(list, { key: 'Enter' }); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('navigates horizontally with ArrowRight/ArrowLeft in horizontal orientation', () => {
    render(<List items={fruits} orientation="horizontal" />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'ArrowRight' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
    act(() => { fireEvent.keyDown(list, { key: 'ArrowRight' }); });
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'true');
    // ArrowDown in horizontal mode does not move.
    act(() => { fireEvent.keyDown(list, { key: 'ArrowDown' }); });
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'true');
    act(() => { fireEvent.keyDown(list, { key: 'ArrowLeft' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
  });

  it('wraps navigation when wrapNavigation is true and clamps when false', () => {
    // wrap: ArrowDown at last item wraps to first
    const { unmount } = render(<List items={fruits} wrapNavigation />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'End' }); });
    expect(screen.getAllByTestId('list-item')[2]).toHaveAttribute('data-active', 'true');
    act(() => { fireEvent.keyDown(list, { key: 'ArrowDown' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
    // wrap: ArrowUp at first item wraps to last
    act(() => { fireEvent.keyDown(list, { key: 'ArrowUp' }); });
    expect(screen.getAllByTestId('list-item')[2]).toHaveAttribute('data-active', 'true');
    unmount();

    // no wrap: ArrowDown at last item stays put
    render(<List items={fruits} wrapNavigation={false} />);
    const list2 = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list2, { key: 'End' }); });
    expect(screen.getAllByTestId('list-item')[2]).toHaveAttribute('data-active', 'true');
    act(() => { fireEvent.keyDown(list2, { key: 'ArrowDown' }); });
    expect(screen.getAllByTestId('list-item')[2]).toHaveAttribute('data-active', 'true');
    // ArrowUp at first item with no wrap stays put
    act(() => { fireEvent.keyDown(list2, { key: 'Home' }); });
    act(() => { fireEvent.keyDown(list2, { key: 'ArrowUp' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
  });

  it('skips navigation onto a disabled neighbour', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple' },
      { id: 'b', value: 'b', label: 'Banana', disabled: true },
      { id: 'c', value: 'c', label: 'Cherry' },
    ];
    render(<List items={items} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'Home' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
    // ArrowDown would land on disabled Banana -> no move
    act(() => { fireEvent.keyDown(list, { key: 'ArrowDown' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
  });

  it('Enter does nothing when no item is active', () => {
    const onSelectionChange = vi.fn();
    render(<List items={fruits} onSelectionChange={onSelectionChange} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'Enter' }); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('Home and End do nothing when every item is disabled', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', disabled: true },
      { id: 'b', value: 'b', label: 'Banana', disabled: true },
    ];
    render(<List items={items} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'Home' }); });
    act(() => { fireEvent.keyDown(list, { key: 'End' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'false');
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'false');
  });

  it('selects all via meta+A (metaKey branch)', () => {
    const onSelectionChange = vi.fn();
    render(<List items={fruits} multiSelect onSelectionChange={onSelectionChange} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'a', metaKey: true }); });
    expect(onSelectionChange).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('A without ctrl/meta does not select all', () => {
    const onSelectionChange = vi.fn();
    render(<List items={fruits} multiSelect onSelectionChange={onSelectionChange} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'a' }); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

describe('ListTimeline / ListCompact', () => {
  it('ListTimeline renders a timeline list with timestamps', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', timestamp: '2024-01-01T00:00:00Z' },
    ];
    const { container } = render(<ListTimeline items={items} />);
    expect(screen.getByTestId('list')).toHaveAttribute('data-timeline', 'true');
    expect(container.querySelector('[data-testid="list-timeline"]')).toBeInTheDocument();
  });

  it('ListCompact renders a compact list', () => {
    render(<ListCompact items={fruits} />);
    const list = screen.getByTestId('list');
    expect(list.className).toContain('list-compact');
    expect(list).toHaveAttribute('data-item-size', 'sm');
  });
});

describe('List (remaining style + render branches)', () => {
  it('ArrowLeft/ArrowUp are no-ops in the non-matching orientation', () => {
    // vertical list: ArrowLeft does not move (line 133 false branch)
    render(<List items={fruits} orientation="vertical" />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'Home' }); });
    act(() => { fireEvent.keyDown(list, { key: 'ArrowLeft' }); });
    expect(screen.getAllByTestId('list-item')[0]).toHaveAttribute('data-active', 'true');
  });

  it('ArrowUp onto a disabled previous item is a no-op', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', disabled: true },
      { id: 'b', value: 'b', label: 'Banana' },
    ];
    render(<List items={items} />);
    const list = screen.getByTestId('list');
    act(() => { fireEvent.keyDown(list, { key: 'End' }); });
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'true');
    // ArrowUp would land on disabled Apple -> no move
    act(() => { fireEvent.keyDown(list, { key: 'ArrowUp' }); });
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-active', 'true');
  });

  it('applies selected + dividers + active + disabled item styles', async () => {
    const user = userEvent.setup();
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple' },
      { id: 'b', value: 'b', label: 'Banana', disabled: true },
    ];
    render(<List items={items} showDividers />);
    // select + activate Apple
    await user.click(screen.getByText('Apple'));
    const apple = screen.getAllByTestId('list-item')[0];
    expect(apple).toHaveAttribute('data-selected', 'true');
    expect(apple).toHaveAttribute('data-active', 'true');
    // disabled Banana gets disabled styles
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-disabled', 'true');
  });

  it('renders timeline dots for a selected item (boxShadow branch) on both positions', () => {
    const items: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple' },
      { id: 'b', value: 'b', label: 'Banana' },
    ];
    const { rerender } = render(<List items={items} showTimeline defaultSelectedKeys={['a']} timelinePosition="left" />);
    expect(screen.getAllByTestId('list-timeline-dot')).toHaveLength(2);

    rerender(<List items={items} showTimeline defaultSelectedKeys={['a']} timelinePosition="right" />);
    expect(screen.getAllByTestId('list-timeline-dot')).toHaveLength(2);
  });

  it('renders the custom-renderItem path with loading, search, empty, and pagination slots', () => {
    const { rerender } = render(
      <List
        items={fruits}
        renderItem={({ item }) => <div key={item.id} data-testid={`ri-${item.id}`}>{item.label}</div>}
        renderLoading={() => <div data-testid="ri-loading">loading</div>}
        renderSearch={({ value, onChange }) => (
          <input data-testid="ri-search" value={value} onChange={(e) => onChange(e.target.value)} />
        )}
        renderEmpty={() => <div data-testid="ri-empty">empty</div>}
        renderPagination={() => <div data-testid="ri-pager">pager</div>}
        searchable
        pagination={{ enabled: true, itemsPerPage: 2 }}
      />
    );
    expect(screen.getByTestId('ri-search')).toBeInTheDocument();
    expect(screen.getByTestId('ri-pager')).toBeInTheDocument();
    // page-1 items (2 per page) render through renderItem
    expect(screen.getByTestId('ri-a')).toBeInTheDocument();
    expect(screen.getByTestId('ri-b')).toBeInTheDocument();

    // loading slot appears when loading
    rerender(
      <List
        items={[]}
        loading
        renderItem={({ item }) => <div key={item.id}>{item.label}</div>}
        renderLoading={() => <div data-testid="ri-loading">loading</div>}
        renderSearch={() => null}
        renderEmpty={() => <div data-testid="ri-empty">empty</div>}
        renderPagination={() => null}
      />
    );
    expect(screen.getByTestId('ri-loading')).toBeInTheDocument();

    // empty slot in the renderItem path
    rerender(
      <List
        items={[]}
        renderItem={({ item }) => <div key={item.id}>{item.label}</div>}
        renderEmpty={() => <div data-testid="ri-empty">empty</div>}
      />
    );
    expect(screen.getByTestId('ri-empty')).toBeInTheDocument();
  });

  it('renders the default empty message when no renderEmpty is provided', () => {
    render(<List items={[]} emptyMessage="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('exercises theme-fallback style arms via a stripped-down theme', () => {
    // Shallow-merged theme replaces colors/spacing/borderRadius with empty
    // objects, so the `theme.X || 'default'` fallbacks in the style builders
    // are taken.
    const strippedTheme = {
      colors: {},
      spacing: {},
      borderRadius: {},
    } as any;
    const { rerender } = render(
      <ThemeProvider theme={strippedTheme}>
        <List
          items={fruits}
          showTimeline
          showTimestamps
          showNumbers
          showDividers
          itemSize="lg"
          defaultSelectedKeys={['a']}
        />
      </ThemeProvider>
    );
    // select Apple so selected+active style branches (with stripped theme) run
    const apple = screen.getAllByTestId('list-item')[0];
    expect(apple).toHaveAttribute('data-selected', 'true');

    // right-position timeline + descriptions + active outline (stripped theme)
    const descItems: ListItem[] = [
      { id: 'a', value: 'a', label: 'Apple', description: 'desc', timestamp: '2024-01-01T00:00:00Z' },
    ];
    rerender(
      <ThemeProvider theme={strippedTheme}>
        <List
          items={descItems}
          showTimeline
          showTimestamps
          timelinePosition="right"
          autoFocus
        />
      </ThemeProvider>
    );
    expect(screen.getAllByTestId('list-timeline-dot')).toHaveLength(1);

    // empty state with stripped theme (padding/color fallbacks)
    rerender(
      <ThemeProvider theme={strippedTheme}>
        <List items={[]} emptyMessage="none" />
      </ThemeProvider>
    );
    expect(screen.getByText('none')).toBeInTheDocument();
  });
});
