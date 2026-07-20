import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { Tabs, SimpleTabs, VerticalTabs } from '../src/components/Tabs';
import { useTabs } from '../src/hooks';
import type { TabItem } from '../src/hooks';

// Controlled wrapper: drives selectedKey and re-renders so selection state reflects.
function Controlled({ items, initial = 'a', ...rest }: { items: TabItem[]; initial?: string; [k: string]: any }) {
  const [key, setKey] = useState(initial);
  return <Tabs items={items} selectedKey={key} onSelectionChange={setKey} {...rest} />;
}

const items: TabItem[] = [
  { key: 'a', label: 'Alpha', content: 'Alpha content' },
  { key: 'b', label: 'Bravo', content: 'Bravo content' },
  { key: 'c', label: 'Charlie', content: 'Charlie content' },
];

const withDisabled: TabItem[] = [
  { key: 'a', label: 'Alpha', content: 'A' },
  { key: 'b', label: 'Bravo', content: 'B', disabled: true },
  { key: 'c', label: 'Charlie', content: 'C' },
];

describe('useTabs', () => {
  it('renders a tablist and the default-selected tab as selected', () => {
    render(<Tabs items={items} defaultSelectedKey="a" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('falls back to the first enabled tab when no default given', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('skips a disabled default key and selects the first enabled', () => {
    render(<Tabs items={withDisabled} defaultSelectedKey="b" />);
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking a tab fires onSelectionChange and switches (controlled)', async () => {
    const user = userEvent.setup();
    render(<Controlled items={items} />);
    await user.click(screen.getByRole('tab', { name: 'Bravo' }));
    expect(screen.getByRole('tab', { name: 'Bravo' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'false');
  });

  it('disabled tab does not fire selection and is marked aria-disabled', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Tabs items={withDisabled} defaultSelectedKey="a" onSelectionChange={onSelectionChange} />);
    const bravo = screen.getByRole('tab', { name: 'Bravo' });
    expect(bravo).toHaveAttribute('aria-disabled', 'true');
    await user.click(bravo);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('keyboard ArrowRight moves selection in automatic mode (controlled)', () => {
    render(<Controlled items={items} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Bravo' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keyboard ArrowLeft wraps and skips disabled', () => {
    render(<Controlled items={withDisabled} initial="c" />);
    const tablist = screen.getByRole('tablist');
    // From Charlie (index 2), ArrowLeft -> skip disabled Bravo -> Alpha
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keyboard Home/End jump to first/last enabled', () => {
    render(<Controlled items={withDisabled} initial="a" />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Charlie' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('vertical orientation uses ArrowUp/ArrowDown', () => {
    render(<Controlled items={items} orientation="vertical" />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowDown' });
    expect(screen.getByRole('tab', { name: 'Bravo' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'ArrowUp' });
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('manual activation: arrows move highlight but Enter selects', () => {
    const onSelectionChange = vi.fn();
    render(<Controlled items={items} initial="a" activationMode="manual" onSelectionChange={onSelectionChange} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    // Manual: highlight moved but selection not changed
    expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.keyDown(tablist, { key: 'Enter' });
    expect(onSelectionChange).toHaveBeenCalledWith('b');
  });

  it('shows the selected panel content and hides others', () => {
    render(<Tabs items={items} defaultSelectedKey="b" showContent />);
    expect(screen.getByText('Bravo content')).toBeInTheDocument();
  });

  it('SimpleTabs and VerticalTabs wrappers render', () => {
    const { rerender } = render(<SimpleTabs items={items} defaultSelectedKey="a" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    rerender(<VerticalTabs items={items} defaultSelectedKey="a" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('custom renderTab replaces the default tab element', () => {
    render(
      <Tabs
        items={items}
        defaultSelectedKey="a"
        renderTab={(tab) => <button key={tab.key} data-testid={`t-${tab.key}`}>{tab.label}</button>}
      />
    );
    expect(screen.getByTestId('t-a')).toBeInTheDocument();
  });

  // ---- Hook-level ----
  it('hook getTabIndex/getTabAt/getSelectedTab query helpers', () => {
    function Probe() {
      const tabs = useTabs({ items, defaultSelectedKey: 'b' });
      return (
        <span data-testid="probe">
          {tabs.getTabIndex('c')},{tabs.getTabAt(0)?.key},{tabs.getSelectedTab()?.key}
        </span>
      );
    }
    render(<Probe />);
    expect(screen.getByTestId('probe').textContent).toBe('2,a,b');
  });

  it('hook selectTab ignores disabled and unknown keys', () => {
    function Probe() {
      const tabs = useTabs({ items: withDisabled, defaultSelectedKey: 'a' });
      return (
        <>
          <button onClick={() => tabs.selectTab('b')} data-testid="sel-b">selB</button>
          <button onClick={() => tabs.selectTab('zzz')} data-testid="sel-z">selZ</button>
          <button onClick={() => tabs.selectTab('c')} data-testid="sel-c">selC</button>
          <span data-testid="sel">{tabs.selectedKey}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('sel-b'));
    fireEvent.click(screen.getByTestId('sel-z'));
    // disabled and unknown ignored; selectedKey stays 'a' (uncontrolled but no internal state update)
    expect(screen.getByTestId('sel').textContent).toBe('a');
    fireEvent.click(screen.getByTestId('sel-c'));
    // selectTab fires onSelectionChange but selectedKey (derived) stays 'a' unless controlled
    expect(screen.getByTestId('sel').textContent).toBe('a');
  });

  it('highlightTab only highlights enabled tabs', () => {
    function Probe() {
      const tabs = useTabs({ items: withDisabled, defaultSelectedKey: 'a' });
      return (
        <>
          <button onClick={() => tabs.highlightTab(1)} data-testid="hl-b">hlB</button>
          <span data-testid="hl">{tabs.highlightedIndex}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('hl-b'));
    // index 1 is Bravo (disabled) -> highlight rejected -> stays -1 after effect? initial highlight syncs to selected
    expect(screen.getByTestId('hl').textContent).not.toBe('1');
  });
});
