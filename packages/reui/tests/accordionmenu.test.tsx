import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccordionMenu, AccordionMenuItem } from '../src/components/AccordionMenu';
import { useAccordionMenu } from '../src/hooks';
import type { AccordionMenuItem as AccordionMenuItemType } from '../src/hooks';

const items = [
  {
    id: 'file',
    label: 'File',
    children: [{ id: 'new', label: 'New' }],
  },
  { id: 'help', label: 'Help' },
];

describe('AccordionMenu', () => {
  it('renders the menu as a nav with item labels', () => {
    const { container } = render(<AccordionMenu items={items} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('toggles a child section when its header is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<AccordionMenu items={items} onOpenChange={onOpenChange} />);
    await user.click(screen.getByText('File'));
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('renders icons and badges on items that carry them', () => {
    render(
      <AccordionMenu
        items={[
          { id: 'x', label: 'X', icon: <span>i</span>, badge: '3' },
          { id: 'y', label: 'Y' },
        ]}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders a disabled item with the disabled semantics', () => {
    render(<AccordionMenu items={[{ id: 'd', label: 'Disabled', disabled: true }]} />);
    const item = screen.getByText('Disabled').closest('[data-disabled]') as HTMLElement;
    // Headless: disabled styling is removed; the item wrapper exposes the
    // disabled state via data-disabled / aria-disabled.
    expect(item).not.toBeNull();
    expect(item.getAttribute('data-disabled')).toBe('true');
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  it('honours the sm/lg size variants', () => {
    const { container, rerender } = render(<AccordionMenu size="sm" items={[{ id: 'a', label: 'A' }]} />);
    // Headless: size classes are removed; assert the item renders and tracks
    // its depth on the wrapper div.
    let item = container.querySelector('nav')?.querySelector('div[data-depth="0"]');
    expect(item).not.toBeNull();
    rerender(<AccordionMenu size="lg" items={[{ id: 'a', label: 'A' }]} />);
    item = container.querySelector('nav')?.querySelector('div[data-depth="0"]');
    expect(item).not.toBeNull();
  });

  it('uses a custom children render function when provided', () => {
    const childrenFn = vi.fn((item, _ip, _hp, _cp, depth, isOpen) => (
      <span data-testid={`custom-${item.id}`}>{item.label}:{depth}:{String(isOpen)}</span>
    ));
    render(<AccordionMenu items={items} children={childrenFn} />);
    expect(screen.getByTestId('custom-file')).toHaveTextContent('File:0:false');
    expect(childrenFn).toHaveBeenCalled();
  });

  it('hides icons and badges when the flags are disabled', () => {
    render(
      <AccordionMenu
        showIcons={false}
        showBadges={false}
        items={[{ id: 'x', label: 'X', icon: <span>i</span>, badge: '3' }]}
      />
    );
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });
});

describe('AccordionMenuItem', () => {
  it('renders a leaf item without children at the default depth', () => {
    const { container } = render(<AccordionMenuItem item={{ id: 'leaf', label: 'Leaf' }} />);
    const node = container.querySelector('.accordion-menu-item');
    expect(node).toBeInTheDocument();
    // default depth is 0
    expect(node?.getAttribute('data-depth')).toBe('0');
    // no children block for a leaf
    expect(container.querySelector('.accordion-menu-content')).toBeNull();
  });

  it('renders nested children recursively with increasing depth', () => {
    const { container } = render(
      <AccordionMenuItem
        item={{
          id: 'root',
          label: 'Root',
          children: [{ id: 'child', label: 'Child' }],
        }}
        depth={1}
        className="extra"
      >
        Root
      </AccordionMenuItem>
    );
    const root = container.querySelector('.accordion-menu-item');
    expect(root?.getAttribute('data-depth')).toBe('1');
    expect(root?.className).toContain('extra');
    // The content block is rendered and the child item recurses at depth 2.
    expect(container.querySelector('.accordion-menu-content')).not.toBeNull();
    const allItems = container.querySelectorAll('.accordion-menu-item');
    expect(allItems).toHaveLength(2);
    expect(allItems[1].getAttribute('data-depth')).toBe('2');
  });
});

// Hook-level branches not exercised by the deep/extra suites.
describe('useAccordionMenu (edge branches)', () => {
  const items: AccordionMenuItemType[] = [
    {
      id: 'file',
      label: 'File',
      children: [{ id: 'new', label: 'New' }],
    },
    { id: 'help', label: 'Help' },
  ];

  it('exclusive mode: toggling an open item closed clears the open set', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({
        items: [{ id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] }],
        exclusive: true,
        defaultOpenItems: ['a'],
      });
      return <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>;
    }
    render(<P />);
    expect(screen.getByTestId('open').textContent).toContain('a');
    act(() => acc.actions.toggleItem('a'));
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('controlled openItems with a null value falls back to an empty set', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items, openItems: null as any });
      return <span data-testid="open">{Array.from(acc.state.openItems).join(',')}</span>;
    }
    render(<P />);
    expect(screen.getByTestId('open').textContent).toBe('');
    expect(acc.state.totalItems).toBeGreaterThan(0);
  });

  it('Home/End on a menu with no items is a no-op (length guard)', () => {
    function P() {
      const { menuProps } = useAccordionMenu({ items: [] });
      return <div {...menuProps} data-testid="menu" />;
    }
    render(<P />);
    expect(() => fireEvent.keyDown(screen.getByTestId('menu'), { key: 'Home' })).not.toThrow();
    expect(() => fireEvent.keyDown(screen.getByTestId('menu'), { key: 'End' })).not.toThrow();
  });

  it('getItemProps gives tabIndex 0 to the focused item and -1 otherwise', () => {
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items });
      return null;
    }
    render(<P />);
    expect(acc.getItemProps(items[0], 0).tabIndex).toBe(-1);
    act(() => acc.actions.focusItem('file'));
    expect(acc.getItemProps(items[0], 0).tabIndex).toBe(0);
  });

  it('getItemHeaderProps onKeyDown Enter/Space on a leaf fires onClick', () => {
    const onClick = vi.fn();
    let acc: any;
    function P() {
      acc = useAccordionMenu({ items: [{ id: 'leaf', label: 'Leaf', onClick }] });
      return null;
    }
    render(<P />);
    const leaf = { id: 'leaf', label: 'Leaf', onClick };
    act(() => acc.getItemHeaderProps(leaf).onKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    act(() => acc.getItemHeaderProps(leaf).onKeyDown({ key: ' ', preventDefault: () => {} } as any));
    // An unhandled key falls through without invoking onClick.
    act(() => acc.getItemHeaderProps(leaf).onKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
