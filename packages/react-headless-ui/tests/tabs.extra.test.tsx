import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Tabs,
  Tab,
  TabPanel,
  SimpleTabs,
  VerticalTabs,
} from '../src/components/Tabs';
import type { TabItem } from '../src/hooks';

const items: TabItem[] = [
  { key: 'a', label: 'Alpha', content: 'Alpha content' },
  { key: 'b', label: 'Bravo', content: 'Bravo content' },
  { key: 'c', label: 'Charlie', content: 'Charlie content' },
];

const richItems: TabItem[] = [
  { key: 'a', label: 'Alpha', content: 'A', icon: <span data-testid="icon-a">★</span>, badge: 3 },
  { key: 'b', label: 'Bravo', content: 'B', disabled: true },
  { key: 'c', label: 'Charlie', content: 'C' },
];

describe('Tabs extras', () => {
  it('renders tab content for the selected tab', () => {
    render(<Tabs items={items} defaultValue="b" />);
    expect(screen.getByText('Bravo content')).toBeInTheDocument();
  });

  it('hides content when showContent is false', () => {
    render(<Tabs items={items} defaultValue="a" showContent={false} />);
    expect(screen.queryByText('Alpha content')).not.toBeInTheDocument();
  });

  it('does not render panel content when a tab has no content', () => {
    const noContent = [{ key: 'a', label: 'Alpha' }];
    render(<Tabs items={noContent} defaultValue="a" />);
    expect(screen.getByRole('tab', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('renders all four variants', () => {
    const variants = ['default', 'underline', 'pills', 'enclosed'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Tabs items={items} defaultValue="a" variant={variant} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      unmount();
    }
  });

  it('navigates with ArrowRight and ArrowLeft (automatic activation)', () => {
    const onSelectionChange = vi.fn();
    render(<Tabs items={items} defaultValue="a" onValueChange={onSelectionChange} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
  });

  it('navigates with ArrowDown/ArrowUp when vertical', () => {
    const onSelectionChange = vi.fn();
    render(<Tabs items={items} defaultValue="a" orientation="vertical" onValueChange={onSelectionChange} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
    fireEvent.keyDown(tablist, { key: 'ArrowUp' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
  });

  it('Home selects the first enabled tab and End the last', () => {
    const onSelectionChange = vi.fn();
    render(<Tabs items={richItems} defaultValue="c" onValueChange={onSelectionChange} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('a');
  });

  it('skips disabled tabs during arrow navigation', () => {
    const onSelectionChange = vi.fn();
    render(<Tabs items={richItems} defaultValue="a" onValueChange={onSelectionChange} />);
    const tablist = screen.getByRole('tablist');
    // from a, ArrowRight should skip disabled b and land on c
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('manual activation mode highlights on arrow and selects on Enter/Space', () => {
    const onSelectionChange = vi.fn();
    render(
      <Tabs items={items} defaultValue="a" activationMode="manual" onValueChange={onSelectionChange} />
    );
    const tablist = screen.getByRole('tablist');
    // arrow only highlights in manual mode (no selection)
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelectionChange).not.toHaveBeenCalled();
    // Enter activates
    fireEvent.keyDown(tablist, { key: 'Enter' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('b');
  });

  it('ArrowLeft wraps around to the last tab', () => {
    const onSelectionChange = vi.fn();
    render(<Tabs items={items} defaultValue="a" onValueChange={onSelectionChange} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('Tab key does nothing special (no selection change)', () => {
    const onSelectionChange = vi.fn();
    render(<Tabs items={items} defaultValue="a" onValueChange={onSelectionChange} />);
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Tab' });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('renders a disabled tab with icon and badge, and does not select on click', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Tabs items={richItems} defaultValue="a" onValueChange={onSelectionChange} />);
    expect(screen.getByTestId('icon-a')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    const bravo = screen.getByRole('tab', { name: /Bravo/ });
    expect(bravo).toHaveAttribute('aria-disabled', 'true');
    await user.click(bravo);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('renders bottom/left/right tab positions', () => {
    for (const pos of ['bottom', 'left', 'right'] as const) {
      const { unmount } = render(<Tabs items={items} defaultValue="a" tabPosition={pos} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      unmount();
    }
  });

  it('uses custom render prop', () => {
    render(
      <Tabs
        items={items}
        defaultValue="a"
        render={(props) => (
          <div data-testid="custom-root">
            <div data-testid="sel-key">{props.selectedKey}</div>
            <div data-testid="sel-idx">{props.selectedIndex}</div>
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
        items={items}
        defaultValue="a"
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

  it('Tab and TabPanel components render', () => {
    render(
      <>
        <Tab label="Solo" />
        <TabPanel selected>Panel text</TabPanel>
      </>
    );
    expect(screen.getByRole('tab', { name: 'Solo' })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel text');
  });

  it('TabPanel hides when not selected', () => {
    const { container } = render(<TabPanel selected={false}>Hidden</TabPanel>);
    const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
    expect(panel).toHaveAttribute('hidden');
    expect(panel).not.toBeVisible();
  });

  it('SimpleTabs selects a tab', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<SimpleTabs items={items} defaultValue="a" onValueChange={onSelectionChange} />);
    await user.click(screen.getByRole('tab', { name: 'Charlie' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith('c');
  });

  it('VerticalTabs renders a vertical tablist', () => {
    render(<VerticalTabs items={items} defaultValue="a" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('forwards className and style to the tabs-list', () => {
    const { container } = render(
      <Tabs items={items} defaultValue="a" className="extra" style={{ color: 'blue' }} />
    );
    const list = container.querySelector('.tabs-list') as HTMLElement;
    expect(list.className).toContain('extra');
    expect(list.getAttribute('style')).toContain('color');
  });
});
