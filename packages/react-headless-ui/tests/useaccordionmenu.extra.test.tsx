import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { useAccordionMenu } from '../src/hooks';
import type { AccordionMenuItem } from '../src/hooks';

const items: AccordionMenuItem[] = [
  {
    id: 'file', label: 'File', children: [
      { id: 'new', label: 'New' },
      { id: 'open', label: 'Open' },
    ],
  },
  { id: 'help', label: 'Help' },
];

function MenuProbe({
  items,
  ...props
}: any) {
  const { menuProps, state, actions } = useAccordionMenu({ items, ...props });
  return (
    <div {...menuProps} data-testid="menu">
      <button onClick={() => actions.focusItem('file')} data-testid="focus-file">ff</button>
      <button onClick={() => actions.focusItem('help')} data-testid="focus-help">fh</button>
      <span data-testid="open">{Array.from(state.openItems).join(',')}</span>
      <span data-testid="focused">{state.focusedItemId ?? ''}</span>
    </div>
  );
}

describe('useAccordionMenu (extra)', () => {
  it('toggleItem in non-exclusive mode clears before re-adding on second toggle', () => {
    const onOpenChange = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items, onOpenChange });
      return (
        <>
          <button onClick={() => acc.actions.toggleItem('file')} data-testid="t">t</button>
          <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('t'));
    expect(screen.getByTestId('open').textContent).toContain('file');
    fireEvent.click(screen.getByTestId('t'));
    expect(screen.getByTestId('open').textContent).not.toContain('file');
  });

  it('exclusive mode: toggleItem clears others when opening', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({
        items: [
          { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
          { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
        ],
        exclusive: true,
        defaultOpenItems: ['a'],
      });
      return (
        <>
          <button onClick={() => acc.actions.toggleItem('b')} data-testid="t">t</button>
          <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('t'));
    expect(screen.getByTestId('open').textContent).toBe('b');
  });

  it('openItem in exclusive mode clears prior open items', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({
        items: [
          { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
          { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
        ],
        exclusive: true,
      });
      return (
        <>
          <button onClick={() => acc.actions.openItem('a')} data-testid="oa">oa</button>
          <button onClick={() => acc.actions.openItem('b')} data-testid="ob">ob</button>
          <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('oa'));
    fireEvent.click(screen.getByTestId('ob'));
    expect(screen.getByTestId('open').textContent).toBe('b');
  });

  it('controlled openItems: internal state is not mutated by toggle', () => {
    const onOpenChange = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items, openItems: ['file'], onOpenChange });
      return (
        <>
          <button onClick={() => acc.actions.toggleItem('help')} data-testid="t">t</button>
          <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('t'));
    expect(onOpenChange).toHaveBeenCalled();
    // controlled value persists
    expect(screen.getByTestId('open').textContent).toContain('file');
  });

  it('hasChildren / getItemChildren / getItemDepth for nested items', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items });
      return null;
    }
    render(<P />);
    expect(acc.actions.hasChildren('file')).toBe(true);
    expect(acc.actions.hasChildren('help')).toBe(false);
    expect(acc.actions.getItemChildren('file').map((c: any) => c.id)).toEqual(['new', 'open']);
    expect(acc.actions.getItemChildren('help')).toEqual([]);
    expect(acc.actions.getItemDepth('file')).toBe(0);
    expect(acc.actions.getItemDepth('new')).toBe(1);
    expect(acc.actions.getItemDepth('missing')).toBe(0);
    // hasChildren on unknown item returns false
    expect(acc.actions.hasChildren('missing')).toBe(false);
  });

  it('allowNested=false prevents flattening children', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items, allowNested: false });
      return <span data-testid="total">{acc.state.totalItems}</span>;
    }
    render(<P />);
    // Only top-level flattened (file, help) -> children not expanded
    expect(Number(screen.getByTestId('total').textContent)).toBe(2);
  });

  it('maxDepth allows two levels of flattening when set to 2', () => {
    const deep: AccordionMenuItem[] = [
      { id: 'l0', label: 'L0', children: [{ id: 'l1', label: 'L1', children: [{ id: 'l2', label: 'L2' }] }] },
    ];
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items: deep, maxDepth: 2 });
      return <span data-testid="total">{acc.state.totalItems}</span>;
    }
    render(<P />);
    // maxDepth=2 -> depth 0 and depth 1 flattened (l0, l1), l2 not
    expect(Number(screen.getByTestId('total').textContent)).toBe(2);
  });

  it('keyboard ArrowDown at the last item is a no-op', () => {
    render(<MenuProbe items={items} />);
    fireEvent.click(screen.getByTestId('focus-help'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'ArrowDown' });
    expect(screen.getByTestId('focused').textContent).toBe('help');
  });

  it('keyboard ArrowUp at the first item is a no-op', () => {
    render(<MenuProbe items={items} />);
    fireEvent.click(screen.getByTestId('focus-file'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'ArrowUp' });
    expect(screen.getByTestId('focused').textContent).toBe('file');
  });

  it('keyboard ArrowUp moves focus backward across flattened items', () => {
    render(<MenuProbe items={items} />);
    fireEvent.click(screen.getByTestId('focus-help'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'ArrowUp' });
    expect(screen.getByTestId('focused').textContent).toBe('open');
  });

  it('keyboard ArrowRight is a no-op when the item is already open', () => {
    render(<MenuProbe items={items} defaultOpenItems={['file']} />);
    fireEvent.click(screen.getByTestId('focus-file'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'ArrowRight' });
    // still open (no crash)
    expect(screen.getByTestId('open').textContent).toContain('file');
  });

  it('keyboard ArrowLeft is a no-op when the item is already closed', () => {
    render(<MenuProbe items={items} />);
    fireEvent.click(screen.getByTestId('focus-file'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'ArrowLeft' });
    expect(screen.getByTestId('open').textContent).not.toContain('file');
  });

  it('keyboard ArrowRight is a no-op for a leaf item (no children)', () => {
    render(<MenuProbe items={items} />);
    fireEvent.click(screen.getByTestId('focus-help'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'ArrowRight' });
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('keyboard Enter on a disabled focused item does nothing', () => {
    const onClick = vi.fn();
    const disabledItems: AccordionMenuItem[] = [
      { id: 'x', label: 'X', disabled: true, onClick },
    ];
    function P() {
      const { menuProps, actions } = useAccordionMenu({ items: disabledItems });
      return (
        <div {...menuProps} data-testid="menu">
          <button onClick={() => actions.focusItem('x')} data-testid="f">f</button>
        </div>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('f'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('getItemProps returns correct aria and data attributes', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items, defaultOpenItems: ['file'] });
      return null;
    }
    render(<P />);
    const fileProps = acc.getItemProps(items[0], 0);
    expect(fileProps.role).toBe('menuitem');
    expect(fileProps['aria-expanded']).toBe(true);
    expect(fileProps['aria-haspopup']).toBe('menu');
    expect(fileProps['data-has-children']).toBe(true);
    expect(fileProps['data-depth']).toBe(0);
    const helpProps = acc.getItemProps(items[1], 0);
    expect(helpProps['aria-expanded']).toBeUndefined();
    expect(helpProps['aria-haspopup']).toBeUndefined();
    expect(helpProps['data-has-children']).toBe(false);
  });

  it('getItemHeaderProps: clicking a header with children toggles; leaf fires onClick', () => {
    const onClick = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items: [{ id: 'leaf', label: 'Leaf', onClick }, ...items] });
      return <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>;
    }
    render(<P />);
    const leafHeader = acc.getItemHeaderProps({ id: 'leaf', label: 'Leaf', onClick });
    act(() => leafHeader.onClick());
    expect(onClick).toHaveBeenCalledTimes(1);
    const fileHeader = acc.getItemHeaderProps(items[0]);
    act(() => fileHeader.onClick());
    expect(screen.getByTestId('open').textContent).toContain('file');
  });

  it('getItemHeaderProps: disabled header onClick and Enter do nothing', () => {
    const onClick = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items: [{ id: 'd', label: 'D', disabled: true, onClick }] });
      return null;
    }
    render(<P />);
    const header = acc.getItemHeaderProps({ id: 'd', label: 'D', disabled: true, onClick });
    header.onClick();
    header.onKeyDown({ key: 'Enter', preventDefault: () => {} } as any);
    header.onKeyDown({ key: ' ', preventDefault: () => {} } as any);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('getItemHeaderProps: Enter toggles a parent and Space toggles too', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items });
      return <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>;
    }
    render(<P />);
    // Enter opens the parent
    act(() => acc.getItemHeaderProps(items[0]).onKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(screen.getByTestId('open').textContent).toContain('file');
    // Re-fetch header props to pick up the updated closure, then Space closes it
    act(() => acc.getItemHeaderProps(items[0]).onKeyDown({ key: ' ', preventDefault: () => {} } as any));
    expect(screen.getByTestId('open').textContent).not.toContain('file');
  });

  it('getItemContentProps returns region attributes with animation transition', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items, defaultOpenItems: ['file'], animationDuration: 350 });
      return null;
    }
    render(<P />);
    const openContent = acc.getItemContentProps(items[0], 0);
    expect(openContent.id).toBe('accordion-content-file');
    expect(openContent.role).toBe('region');
    expect(openContent['data-open']).toBe(true);
    expect(openContent.hidden).toBe(false);
    expect(openContent.style.transition).toContain('350ms');
    const closedContent = acc.getItemContentProps(items[1], 0);
    expect(closedContent.hidden).toBe(true);
    expect(closedContent.style.display).toBe('none');
  });

  it('menuProps onKeyDown ignores keys that are not handled (no crash)', () => {
    render(<MenuProbe items={items} />);
    const menu = screen.getByTestId('menu');
    expect(() => fireEvent.keyDown(menu, { key: 'Escape' })).not.toThrow();
    expect(() => fireEvent.keyDown(menu, { key: 'Tab' })).not.toThrow();
  });

  it('menuProps onKeyDown Enter with no focused item does nothing', () => {
    const onClick = vi.fn();
    const leaf: AccordionMenuItem[] = [{ id: 'x', label: 'X', onClick }];
    function P() {
      const { menuProps } = useAccordionMenu({ items: leaf });
      return <div {...menuProps} data-testid="menu" />;
    }
    render(<P />);
    expect(() => fireEvent.keyDown(screen.getByTestId('menu'), { key: 'Enter' })).not.toThrow();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('focusItem sets focusedItemId and updates currentDepth in state', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items });
      return (
        <>
          <button onClick={() => acc.actions.focusItem('new')} data-testid="f">f</button>
          <span data-testid="depth">{acc.state.currentDepth}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('f'));
    expect(screen.getByTestId('depth').textContent).toBe('1');
  });

  it('semanticAttributes provides role menu and a default aria-label', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items });
      return null;
    }
    render(<P />);
    expect(acc.semanticAttributes.role).toBe('menu');
    expect(acc.semanticAttributes['aria-label']).toContain('2 items');
  });

  it('openAll in non-exclusive opens every flattened item including children', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items });
      return (
        <>
          <button onClick={acc.actions.openAll} data-testid="oa">oa</button>
          <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>
        </>
      );
    }
    render(<P />);
    fireEvent.click(screen.getByTestId('oa'));
    const open = screen.getByTestId('open').textContent!;
    expect(open).toContain('file');
    expect(open).toContain('new');
    expect(open).toContain('help');
  });
});
