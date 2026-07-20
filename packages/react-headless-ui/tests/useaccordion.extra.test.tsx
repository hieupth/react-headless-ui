import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { useAccordion } from '../src/hooks';
import type { AccordionItem } from '../src/hooks';

const items: AccordionItem[] = [
  { id: 'a', trigger: 'A', content: 'CA' },
  { id: 'b', trigger: 'B', content: 'CB' },
  { id: 'c', trigger: 'C', content: 'CC' },
];

const withDisabled: AccordionItem[] = [
  { id: 'a', trigger: 'A', content: 'CA' },
  { id: 'b', trigger: 'B', content: 'CB', disabled: true },
  { id: 'c', trigger: 'C', content: 'CC' },
  { id: 'd', trigger: 'D', content: 'CD', disabled: true },
];

function Probe({ items, ...props }: any) {
  const acc = useAccordion({ items, ...props });
  return (
    <div>
      <button onKeyDown={(e) => acc.handleKeyDown(e, 'a')} data-testid="trig-a">A</button>
      <span data-testid="open">{acc.openItems.join(',')}</span>
      <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
    </div>
  );
}

describe('useAccordion (extra)', () => {
  it('getItemState reflects open state and container/item disabled flags', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, defaultOpenItems: ['a'], disabled: true });
      return null;
    }
    render(<P />);
    expect(acc.getItemState('a').isOpen).toBe(true);
    // container disabled => disabled true
    expect(acc.getItemState('a').disabled).toBe(true);
    expect(acc.getItemState('b').disabled).toBe(true);
  });

  it('getItemState returns disabled false for unknown item when container enabled', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return null;
    }
    render(<P />);
    expect(acc.getItemState('nope').isOpen).toBe(false);
    expect(acc.getItemState('nope').disabled).toBe(false);
  });

  it('toggleItem is a no-op for an unknown or disabled item', () => {
    const onItemToggle = vi.fn();
    const onOpenChange = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled, onItemToggle, onOpenChange });
      return null;
    }
    render(<P />);
    act(() => acc.toggleItem('b')); // disabled
    act(() => acc.toggleItem('missing')); // unknown
    expect(onItemToggle).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('openItem is a no-op for an unknown or disabled item', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled, onItemToggle });
      return null;
    }
    render(<P />);
    act(() => acc.openItem('b')); // disabled
    act(() => acc.openItem('missing')); // unknown
    expect(onItemToggle).not.toHaveBeenCalled();
  });

  it('collapsible: toggleItem removes an already-open item', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, defaultOpenItems: ['a', 'b'] });
      return (
        <>
          <button onClick={() => acc.toggleItem('a')} data-testid="t">t</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('t'));
    expect(screen.getByTestId('open').textContent).toBe('b');
  });

  it('collapsible: openItem does not duplicate an already-open item', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, defaultOpenItems: ['a'] });
      return (
        <>
          <button onClick={() => acc.openItem('a')} data-testid="o">o</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('o'));
    expect(screen.getByTestId('open').textContent).toBe('a');
  });

  it('closeItem fires onItemToggle false and removes id', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, defaultOpenItems: ['a', 'b'], onItemToggle });
      return (
        <>
          <button onClick={() => acc.closeItem('a')} data-testid="c">c</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('c'));
    expect(screen.getByTestId('open').textContent).toBe('b');
    expect(onItemToggle).toHaveBeenCalledWith('a', false);
  });

  it('closeAll fires onItemToggle false for each previously-open item', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, defaultOpenItems: ['a', 'b'], onItemToggle });
      return (
        <>
          <button onClick={acc.closeAll} data-testid="ca">ca</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('ca'));
    expect(screen.getByTestId('open').textContent).toBe('');
    expect(onItemToggle).toHaveBeenCalledWith('a', false);
    expect(onItemToggle).toHaveBeenCalledWith('b', false);
  });

  it('handleKeyDown is a no-op for disabled item', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled, onItemToggle });
      return (
        <button onKeyDown={(e) => acc.handleKeyDown(e, 'b')} data-testid="b">B</button>
      );
    }
    render(<P />);
    fireEvent.keyDown(screen.getByTestId('b'), { key: 'Enter' });
    expect(onItemToggle).not.toHaveBeenCalled();
  });

  it('handleKeyDown is a no-op for unknown item', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return (
        <button onKeyDown={(e) => acc.handleKeyDown(e, 'missing')} data-testid="x">X</button>
      );
    }
    render(<P />);
    expect(() => fireEvent.keyDown(screen.getByTestId('x'), { key: 'Enter' })).not.toThrow();
  });

  it('focusNextItem skips a disabled neighbor via recursion (b disabled, c enabled)', () => {
    render(<Probe items={withDisabled} />);
    fireEvent.keyDown(screen.getByTestId('trig-a'), { key: 'ArrowDown' });
    expect(screen.getByTestId('focused').textContent).toBe('c');
  });

  it('focusPreviousItem skips a disabled neighbor via recursion', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'c')} data-testid="trig-c">C</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<P />);
    // c -> ArrowUp -> b disabled -> skip -> a
    fireEvent.keyDown(screen.getByTestId('trig-c'), { key: 'ArrowUp' });
    expect(screen.getByTestId('focused').textContent).toBe('a');
  });

  it('focusNextItem does nothing when at the end of the list', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'c')} data-testid="trig-c">C</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.keyDown(screen.getByTestId('trig-c'), { key: 'ArrowDown' });
    expect(screen.getByTestId('focused').textContent).toBe('');
  });

  it('focusPreviousItem does nothing when at the start of the list', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'a')} data-testid="trig-a">A</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.keyDown(screen.getByTestId('trig-a'), { key: 'ArrowUp' });
    expect(screen.getByTestId('focused').textContent).toBe('');
  });

  it('horizontal orientation: ArrowLeft moves focus backward', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, orientation: 'horizontal' });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'c')} data-testid="trig-c">C</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.keyDown(screen.getByTestId('trig-c'), { key: 'ArrowLeft' });
    expect(screen.getByTestId('focused').textContent).toBe('b');
  });

  it('getItemTriggerProps returns aria/role/tabIndex and wired handlers', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, defaultOpenItems: ['a'] });
      return null;
    }
    render(<P />);
    const props = acc.getItemTriggerProps('a');
    expect(props.role).toBe('button');
    expect(props['aria-expanded']).toBe(true);
    expect(props['aria-controls']).toBe('a-content');
    expect(props.tabIndex).toBe(0);
    expect(props['data-state']).toBe('open');
    expect(typeof props.onClick).toBe('function');
    expect(typeof props.onKeyDown).toBe('function');
  });

  it('getItemTriggerProps marks disabled item with tabIndex -1', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled });
      return null;
    }
    render(<P />);
    const props = acc.getItemTriggerProps('b');
    expect(props.tabIndex).toBe(-1);
    expect(props.disabled).toBe(true);
    expect(props['aria-disabled']).toBe(true);
  });

  it('getItemContentProps returns region attributes reflecting open state', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, defaultOpenItems: ['a'] });
      return null;
    }
    render(<P />);
    const openProps = acc.getItemContentProps('a');
    expect(openProps.id).toBe('a-content');
    expect(openProps.role).toBe('region');
    expect(openProps.hidden).toBe(false);
    expect(openProps['data-state']).toBe('open');
    const closedProps = acc.getItemContentProps('b');
    expect(closedProps.hidden).toBe(true);
    expect(closedProps['data-state']).toBe('closed');
  });

  it('controlled openItems: internal state is not mutated', () => {
    const onOpenChange = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items, openItems: ['a'], onOpenChange });
      return (
        <>
          <button onClick={() => acc.toggleItem('b')} data-testid="t">t</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<P />);
    // Controlled: state stays as given (single mode toggles b but doesn't write internal).
    fireEvent.click(screen.getByTestId('t'));
    expect(onOpenChange).toHaveBeenCalledWith(['b']);
    // openItems still reflects controlled value ['a']
    expect(screen.getByTestId('open').textContent).toBe('a');
  });

  it('semanticAttributes includes orientation and collapsible data flags', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, orientation: 'horizontal', collapsible: true });
      return null;
    }
    render(<P />);
    expect(acc.semanticAttributes['data-orientation']).toBe('horizontal');
    expect(acc.semanticAttributes['data-collapsible']).toBe(true);
  });

  it('Enter and Space keys toggle open state via handleKeyDown', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'a')} data-testid="t">T</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.keyDown(screen.getByTestId('t'), { key: 'Enter' });
    expect(screen.getByTestId('open').textContent).toBe('a');
    fireEvent.keyDown(screen.getByTestId('t'), { key: ' ' });
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('openAll opens every enabled item and is a no-op when not collapsible', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled, collapsible: true, onItemToggle });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    act(() => acc.openAll());
    // disabled items (b, d) are excluded.
    expect(screen.getByTestId('open').textContent).toBe('a,c');
    expect(onItemToggle).toHaveBeenCalledWith('a', true);
    expect(onItemToggle).toHaveBeenCalledWith('c', true);

    // openAll is a no-op when collapsible=false.
    let acc2: any;
    function P2() {
      acc2 = useAccordion({ items, collapsible: false });
      return <span data-testid="open2">{acc2.openItems.join(',')}</span>;
    }
    render(<P2 />);
    act(() => acc2.openAll());
    expect(screen.getByTestId('open2').textContent).toBe('');
  });

  it('closeAll clears all open items', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, defaultOpenItems: ['a', 'b'] });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    act(() => acc.closeAll());
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('Home/End keys move focus to the first/last enabled item', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items: withDisabled });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'c')} data-testid="trig-c">C</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.keyDown(screen.getByTestId('trig-c'), { key: 'Home' });
    expect(screen.getByTestId('focused').textContent).toBe('a');
    fireEvent.keyDown(screen.getByTestId('trig-c'), { key: 'End' });
    expect(screen.getByTestId('focused').textContent).toBe('c');
  });

  it('openItem opens an item (single mode) and closeItem removes it', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items, onItemToggle });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    act(() => acc.openItem('b'));
    expect(screen.getByTestId('open').textContent).toBe('b');
    expect(onItemToggle).toHaveBeenCalledWith('b', true);
    act(() => acc.closeItem('b'));
    expect(screen.getByTestId('open').textContent).toBe('');
    expect(onItemToggle).toHaveBeenCalledWith('b', false);
  });

  it('collapsible openItem keeps existing open items, single openItem replaces', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, defaultOpenItems: ['a'] });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    act(() => acc.openItem('b'));
    expect(screen.getByTestId('open').textContent).toBe('a,b');
  });

  it('collapsible toggleItem adds a closed item to the open set', () => {
    const onItemToggle = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordion({ items, collapsible: true, onItemToggle });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    act(() => acc.toggleItem('a'));
    expect(screen.getByTestId('open').textContent).toBe('a');
    expect(onItemToggle).toHaveBeenCalledWith('a', true);
  });

  it('getItemTriggerProps onClick handler toggles the item open', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    const props = acc.getItemTriggerProps('a');
    act(() => props.onClick());
    expect(screen.getByTestId('open').textContent).toBe('a');
  });

  it('getItemTriggerProps onKeyDown handler toggles via Enter', () => {
    let acc: any;
    function P() {
      acc = useAccordion({ items });
      return <span data-testid="open">{acc.openItems.join(',')}</span>;
    }
    render(<P />);
    const props = acc.getItemTriggerProps('a');
    act(() => props.onKeyDown({ key: 'Enter', preventDefault: () => {} }));
    expect(screen.getByTestId('open').textContent).toBe('a');
  });

  it('Home/End do nothing when every item is disabled', () => {
    const allDisabled: AccordionItem[] = [
      { id: 'a', trigger: 'A', content: 'CA', disabled: true },
      { id: 'b', trigger: 'B', content: 'CB', disabled: true },
    ];
    let acc: any;
    function P() {
      acc = useAccordion({ items: allDisabled });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'a')} data-testid="trig-a">A</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<P />);
    // handleKeyDown early-returns for disabled items, so drive the focus fns directly.
    act(() => acc.focusFirstItem());
    expect(screen.getByTestId('focused').textContent).toBe('');
    act(() => acc.focusLastItem());
    expect(screen.getByTestId('focused').textContent).toBe('');
  });
});
