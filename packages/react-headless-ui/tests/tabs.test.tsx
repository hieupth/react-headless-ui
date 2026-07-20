import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { Tabs, Tab, TabPanel, SimpleTabs, VerticalTabs } from '../src/components/Tabs';
import { useTabs, type TabItem } from '../src/hooks/useTabs';

const items = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Bravo' },
  { key: 'c', label: 'Charlie' },
];

describe('Tabs', () => {
  it('renders a tablist with tab items', () => {
    render(<Tabs items={items} defaultSelectedKey="a" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('fires onSelectionChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Tabs items={items} defaultSelectedKey="a" onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByRole('tab', { name: 'Bravo' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
  });
});

describe('useTabs', () => {
  const mixedItems: TabItem[] = [
    { key: 'a', label: 'Alpha' },
    { key: 'b', label: 'Bravo', disabled: true },
    { key: 'c', label: 'Charlie' },
  ];

  function setup(props: Parameters<typeof useTabs>[0]) {
    const result: { current: ReturnType<typeof useTabs> } = { current: null as any };
    function Probe() {
      result.current = useTabs(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
    act(fn);
    hook.rerender();
  }

  it('defaults the selected key to the defaultSelectedKey when enabled', () => {
    const res = setup({ items, defaultSelectedKey: 'b' });
    expect(res.current.selectedKey).toBe('b');
  });

  it('falls back to the first enabled tab when defaultSelectedKey is disabled/missing', () => {
    const res = setup({ items: mixedItems, defaultSelectedKey: 'b' });
    // 'b' is disabled -> falls back to first enabled 'a'
    expect(res.current.selectedKey).toBe('a');
  });

  it('honours a controlled selectedKey', () => {
    const res = setup({ items, selectedKey: 'c' });
    expect(res.current.selectedKey).toBe('c');
  });

  it('selectTab/activateTab fire onSelectionChange and ignore disabled tabs', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items: mixedItems, onSelectionChange });
    act(() => res.current.selectTab('c'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
    // disabled tab is ignored
    act(() => res.current.selectTab('b'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('activateTab selects only in manual activation mode', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, activationMode: 'manual', onSelectionChange });
    act(() => res.current.activateTab('b'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    // automatic mode: activateTab is a no-op
    const res2 = setup({ items, activationMode: 'automatic', onSelectionChange });
    const before = onSelectionChange.mock.calls.length;
    act(() => res2.current.activateTab('c'));
    expect(onSelectionChange.mock.calls.length).toBe(before);
  });

  it('highlightTab sets the highlighted index for enabled tabs only', () => {
    const res = setup({ items: mixedItems });
    act(() => res.current.highlightTab(2));
    expect(res.current.highlightedIndex).toBe(2);
    // disabled tab is not highlighted
    act(() => res.current.highlightTab(1));
    expect(res.current.highlightedIndex).toBe(2);
  });

  it('handleTabClick selects in automatic mode and highlights in manual mode', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, activationMode: 'automatic', onSelectionChange });
    act(() => res.current.handleTabClick('c', 2));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');

    const res2 = setup({ items, activationMode: 'manual', onSelectionChange });
    const before = onSelectionChange.mock.calls.length;
    act(() => res2.current.handleTabClick('b', 1));
    // manual mode: no selection on click, just highlight
    expect(onSelectionChange.mock.calls.length).toBe(before);
  });

  it('handleTabClick ignores disabled tabs', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items: mixedItems, onSelectionChange });
    const before = onSelectionChange.mock.calls.length;
    act(() => res.current.handleTabClick('b', 1));
    expect(onSelectionChange.mock.calls.length).toBe(before);
  });

  it('keyboard navigation moves through tabs in horizontal orientation', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'a', onSelectionChange });
    act(() => res.current.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    act(() => res.current.handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
    // Home/End
    act(() => res.current.handleKeyDown({ key: 'Home', preventDefault: () => {} } as any));
    act(() => res.current.handleKeyDown({ key: 'End', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('keyboard navigation uses vertical keys in vertical orientation', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'a', orientation: 'vertical', onSelectionChange });
    act(() => res.current.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    act(() => res.current.handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any));
    act(() => res.current.handleKeyDown({ key: 'PageUp', preventDefault: () => {} } as any));
    act(() => res.current.handleKeyDown({ key: 'PageDown', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('Enter/Space selects the highlighted tab in manual mode', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'a', activationMode: 'manual', onSelectionChange });
    // highlight 'b' then activate via Enter
    act(() => res.current.highlightTab(1));
    act(() => res.current.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    act(() => res.current.handleKeyDown({ key: ' ', preventDefault: () => {} } as any));
  });

  it('Tab key passes through (no selection change)', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, onSelectionChange });
    const before = onSelectionChange.mock.calls.length;
    act(() => res.current.handleKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    expect(onSelectionChange.mock.calls.length).toBe(before);
  });

  it('getTabAt / getTabIndex / getSelectedTab return the right items', () => {
    const res = setup({ items, defaultSelectedKey: 'b' });
    expect(res.current.getTabAt(1)).toEqual(items[1]);
    expect(res.current.getTabIndex('c')).toBe(2);
    expect(res.current.getSelectedTab()).toEqual(items[1]);
  });

  it('getTabAttributes / getTabPanelAttributes expose aria and data state', () => {
    const res = setup({ items, defaultSelectedKey: 'a' });
    const attrs = res.current.getTabAttributes(items[0], 0);
    expect(attrs['aria-selected']).toBe(true);
    expect(attrs.tabIndex).toBe(0);
    const panelAttrs = res.current.getTabPanelAttributes(items[1]);
    expect(panelAttrs.hidden).toBe(true);
    expect(panelAttrs.role).toBe('tabpanel');
  });

  it('returns an empty selected key when there are no items', () => {
    const res = setup({ items: [] });
    expect(res.current.selectedKey).toBe('');
  });

  it('selectTab in controlled mode skips the internal update branch', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, selectedKey: 'a', onSelectionChange });
    act(() => res.current.selectTab('c'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('keyboard navigation wraps around and skips disabled tabs', () => {
    const onSelectionChange = vi.fn();
    // items: a (sel), b (disabled), c
    const res = setup({ items: mixedItems, defaultSelectedKey: 'a', onSelectionChange });
    // from 'a' (index 0), ArrowRight wraps past disabled 'b' to 'c'
    act(() => res.current.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
    // from 'c', ArrowRight wraps back to 'a'
    act(() => res.current.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
    // ArrowLeft from 'a' wraps to 'c'
    act(() => res.current.handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('ArrowLeft skips a disabled tab in the backward path', () => {
    const onSelectionChange = vi.fn();
    // from 'c' (index 2), ArrowLeft -> 'b' (disabled) -> skip -> 'a'
    const res = setup({ items: mixedItems, defaultSelectedKey: 'c', onSelectionChange });
    act(() => res.current.handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
  });

  it('keyboard navigation in manual mode only highlights (no auto-select)', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'a', activationMode: 'manual', onSelectionChange });
    const before = onSelectionChange.mock.calls.length;
    act(() => res.current.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any));
    act(() => res.current.handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any));
    act(() => res.current.handleKeyDown({ key: 'Home', preventDefault: () => {} } as any));
    act(() => res.current.handleKeyDown({ key: 'End', preventDefault: () => {} } as any));
    expect(onSelectionChange.mock.calls.length).toBe(before);
  });

  it('keyboard nav when nothing is highlighted falls back to the selected index', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'b', onSelectionChange });
    // highlightedIndex starts -1 -> nav uses selectedIndex
    act(() => res.current.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('Enter/Space in manual mode selects the highlighted tab', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'a', activationMode: 'manual', onSelectionChange });
    act(() => res.current.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
    act(() => res.current.handleKeyDown({ key: ' ', preventDefault: () => {} } as any));
  });

  it('vertical keyboard nav finds first/last enabled tabs', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items: mixedItems, defaultSelectedKey: 'a', orientation: 'vertical', onSelectionChange });
    act(() => res.current.handleKeyDown({ key: 'PageDown', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
    act(() => res.current.handleKeyDown({ key: 'PageUp', preventDefault: () => {} } as any));
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
  });

  it('Enter/Space in automatic mode is a no-op (selection happens on nav)', () => {
    const onSelectionChange = vi.fn();
    const res = setup({ items, defaultSelectedKey: 'a', activationMode: 'automatic', onSelectionChange });
    const before = onSelectionChange.mock.calls.length;
    act(() => res.current.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onSelectionChange.mock.calls.length).toBe(before);
  });

  it('keyboard nav with all tabs disabled finds no enabled tab', () => {
    const onSelectionChange = vi.fn();
    const allDisabled = [
      { key: 'a', label: 'A', disabled: true },
      { key: 'b', label: 'B', disabled: true },
    ];
    const res = setup({ items: allDisabled, onSelectionChange });
    expect(() => act(() => res.current.handleKeyDown({ key: 'Home', preventDefault: () => {} } as any))).not.toThrow();
    expect(() => act(() => res.current.handleKeyDown({ key: 'End', preventDefault: () => {} } as any))).not.toThrow();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Renderer coverage: exercises the Tabs.tsx presentational paths
// (defaultTabRender variants, content positions, compound API, custom render
// props, and the Tab/TabPanel/SimpleTabs/VerticalTabs wrappers).
// ---------------------------------------------------------------------------

const renderItems: TabItem[] = [
  { key: 'a', label: 'Alpha', content: 'Alpha content' },
  { key: 'b', label: 'Bravo', content: 'Bravo content' },
  { key: 'c', label: 'Charlie', content: 'Charlie content' },
];

const richItems: TabItem[] = [
  { key: 'a', label: 'Alpha', content: 'A', icon: <span data-testid="icon-a">star</span>, badge: 3 },
  { key: 'b', label: 'Bravo', content: 'B', disabled: true },
  { key: 'c', label: 'Charlie', content: 'C' },
];

describe('Tabs renderer', () => {
  it('renders the selected tab panel content', () => {
    render(<Tabs items={renderItems} defaultSelectedKey="b" />);
    expect(screen.getByText('Bravo content')).toBeInTheDocument();
  });

  it('hides content entirely when showContent is false', () => {
    render(<Tabs items={renderItems} defaultSelectedKey="a" showContent={false} />);
    expect(screen.queryByText('Alpha content')).not.toBeInTheDocument();
  });

  it('renders a panel as null when the tab has no content', () => {
    const noContent = [{ key: 'a', label: 'Alpha' }];
    render(<Tabs items={noContent} defaultSelectedKey="a" />);
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('renders every variant (default, underline, pills, enclosed)', () => {
    for (const variant of ['default', 'underline', 'pills', 'enclosed'] as const) {
      const { unmount } = render(<Tabs items={renderItems} defaultSelectedKey="a" variant={variant} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      unmount();
    }
  });

  it('falls back to no variant-specific classes for an unknown variant', () => {
    // The variant chain initialises variantSpecificClasses='' and only the four
    // known variants set it; an unknown value leaves it empty (defensive).
    render(<Tabs items={renderItems} defaultSelectedKey="a" variant={'unknown' as any} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('disables the animation classes when animated is false', () => {
    render(<Tabs items={renderItems} defaultSelectedKey="a" animated={false} />);
    // animated=false -> the panel omits the transition classes
    const panel = screen.getByText('Alpha content').closest('[role="tabpanel"]');
    expect(panel?.className).not.toContain('transition-all');
  });

  it('renders a disabled tab with icon and badge and skips selection on click', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Tabs items={richItems} defaultSelectedKey="a" onSelectionChange={onSelectionChange} />);
    expect(screen.getByTestId('icon-a')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    const bravo = screen.getByRole('tab', { name: /Bravo/ });
    expect(bravo).toHaveAttribute('aria-disabled', 'true');
    await user.click(bravo);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('renders bottom, left, and right content positions', () => {
    for (const pos of ['bottom', 'left', 'right'] as const) {
      const { unmount } = render(<Tabs items={renderItems} defaultSelectedKey="a" tabPosition={pos} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders the bottom position with vertical orientation (flex branch)', () => {
    const { container } = render(
      <Tabs items={renderItems} defaultSelectedKey="a" tabPosition="bottom" orientation="vertical" />
    );
    // bottom + vertical -> tabs-container picks up the `flex` class
    expect(container.querySelector('.tabs-container')?.className).toContain('flex');
  });

  it('renders a vertical tab list for vertical orientation', () => {
    const { container } = render(<Tabs items={renderItems} defaultSelectedKey="a" orientation="vertical" />);
    expect(container.querySelector('.flex-col')).not.toBeNull();
  });

  it('renders a vertical layout for the left/right content positions', () => {
    // left position with vertical orientation exercises the flex-col branch
    const { unmount } = render(
      <Tabs items={renderItems} defaultSelectedKey="a" tabPosition="left" orientation="vertical" />
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    unmount();
    // right position with vertical orientation exercises the flex-col-reverse branch
    const { container } = render(
      <Tabs items={renderItems} defaultSelectedKey="a" tabPosition="right" orientation="vertical" />
    );
    expect(container.querySelector('.flex-col-reverse')).not.toBeNull();
  });

  it('uses a custom render prop instead of the default layout', () => {
    render(
      <Tabs
        items={renderItems}
        defaultSelectedKey="a"
        render={(props) => (
          <div data-testid="custom-root">
            <span data-testid="sel-key">{props.selectedKey}</span>
            <span data-testid="sel-idx">{props.selectedIndex}</span>
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-root')).toBeInTheDocument();
    expect(screen.getByTestId('sel-key')).toHaveTextContent('a');
    expect(screen.getByTestId('sel-idx')).toHaveTextContent('0');
  });

  it('uses custom renderTab, renderTabList, and renderTabPanel', () => {
    render(
      <Tabs
        items={renderItems}
        defaultSelectedKey="a"
        renderTab={(tab, p) => (
          <button key={tab.key} data-testid={`rt-${tab.key}`} onClick={p.onClick}>
            {tab.label}{p.selected ? '*' : ''}
          </button>
        )}
        renderTabList={(props) => <div data-testid="custom-list">{props.items.length}</div>}
        renderTabPanel={(tab, p) => (
          <div key={tab.key} data-testid={`rp-${tab.key}`} hidden={!p.selected}>
            panel:{tab.label}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-list')).toHaveTextContent('3');
    expect(screen.getByTestId('rp-a')).toHaveTextContent('panel:Alpha');
  });

  it('uses custom renderTab within the default tab list (no renderTabList)', () => {
    // Exercises the renderTab branch inside defaultTabListRender.
    render(
      <Tabs
        items={renderItems}
        defaultSelectedKey="a"
        renderTab={(tab, p) => (
          <button key={tab.key} data-testid={`rt-${tab.key}`} onClick={p.onClick}>
            {tab.label}{p.selected ? '*' : ''}
          </button>
        )}
      />
    );
    expect(screen.getByTestId('rt-a')).toHaveTextContent('Alpha*');
    expect(screen.getByTestId('rt-b')).toHaveTextContent('Bravo');
  });

  it('forwards className and style to the tabs-list wrapper', () => {
    const { container } = render(
      <Tabs items={renderItems} defaultSelectedKey="a" className="extra" style={{ color: 'blue' }} />
    );
    const list = container.querySelector('.tabs-list') as HTMLElement;
    expect(list.className).toContain('extra');
    expect(list.getAttribute('style')).toContain('color');
  });
});

describe('Tabs compound children API', () => {
  it('derives items and content from Tabs.List/Trigger/Content', () => {
    render(
      <Tabs defaultSelectedKey="a">
        <Tabs.List>
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
          <Tabs.Trigger value="b">Bravo</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Alpha body</Tabs.Content>
        <Tabs.Content value="b">Bravo body</Tabs.Content>
      </Tabs>
    );
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bravo' })).toBeInTheDocument();
    expect(screen.getByText('Alpha body')).toBeInTheDocument();
  });

  it('ignores non-Tabs children inside Tabs.List', () => {
    render(
      <Tabs defaultSelectedKey="a">
        <Tabs.List>
          <span>not a trigger</span>
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    );
    // only the valid Trigger becomes a tab
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('ignores non-element children of Tabs (strings/numbers)', () => {
    render(
      <Tabs defaultSelectedKey="a">
        text-and-numbers
        <Tabs.List>
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    );
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('ignores direct element children that are neither Tabs.List nor Tabs.Content', () => {
    render(
      <Tabs defaultSelectedKey="a">
        <div>stray</div>
        <Tabs.List>
          <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    );
    // the stray div is not a Tabs.* marker, so it is skipped; only the Trigger
    // becomes a tab.
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('the Tabs.List / Tabs.Trigger / Tabs.Content markers render null on their own', () => {
    // Rendered outside <Tabs>, these marker components execute their bodies
    // (which return null) — they exist only to contribute element structure
    // when composed under <Tabs>.
    const { container } = render(
      <>
        <Tabs.List>x</Tabs.List>
        <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
        <Tabs.Content value="a">body</Tabs.Content>
      </>
    );
    expect(container.textContent).toBe('');
  });
});

describe('Tab / TabPanel / SimpleTabs / VerticalTabs wrappers', () => {
  it('Tab renders a standalone tab button with children', () => {
    render(<Tab label="Solo">extra</Tab>);
    const tab = screen.getByRole('tab', { name: /Solo/ });
    expect(tab).toBeInTheDocument();
    expect(tab).toHaveTextContent('extra');
  });

  it('TabPanel shows when selected and hides when not', () => {
    const { container, rerender } = render(<TabPanel selected>Visible</TabPanel>);
    const panel = () => container.querySelector('[role="tabpanel"]') as HTMLElement;
    expect(panel()).toHaveTextContent('Visible');
    expect(panel()).not.toHaveAttribute('hidden');
    rerender(<TabPanel selected={false}>Visible</TabPanel>);
    expect(panel()).toHaveAttribute('hidden');
  });

  it('SimpleTabs selects a tab on click', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<SimpleTabs items={renderItems} defaultSelectedKey="a" onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByRole('tab', { name: 'Charlie' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('VerticalTabs renders a vertical tablist', () => {
    render(<VerticalTabs items={renderItems} defaultSelectedKey="a" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
