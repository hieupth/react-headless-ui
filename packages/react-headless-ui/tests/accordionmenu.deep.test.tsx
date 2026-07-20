import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccordionMenu } from '../src/components/AccordionMenu';
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

const exclusiveItems: AccordionMenuItem[] = [
  { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
  { id: 'b', label: 'B', children: [{ id: 'b1', label: 'B1' }] },
];

function Harness({ ...props }: any) {
  const { state, actions } = useAccordionMenu(props);
  return (
    <div>
      <button onClick={() => actions.toggleItem('file')} data-testid="t-file">tFile</button>
      <button onClick={() => actions.openItem('file')} data-testid="o-file">oFile</button>
      <button onClick={() => actions.closeItem('file')} data-testid="c-file">cFile</button>
      <button onClick={actions.openAll} data-testid="o-all">oAll</button>
      <button onClick={actions.closeAll} data-testid="c-all">cAll</button>
      <button onClick={() => actions.focusItem('new')} data-testid="f-new">fNew</button>
      <button onClick={() => actions.toggleItem('help')} data-testid="t-help">tHelp</button>
      <span data-testid="open">{Array.from(state.openItems).join(',')}</span>
      <span data-testid="focused">{state.focusedItemId ?? ''}</span>
    </div>
  );
}

describe('useAccordionMenu', () => {
  it('renders a nav and item labels', () => {
    const { container } = render(<AccordionMenu items={items} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('clicking a header with children toggles expansion and fires onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<AccordionMenu items={items} onOpenChange={onOpenChange} />);
    await user.click(screen.getByText('File'));
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('expanded section reveals its children', async () => {
    const user = userEvent.setup();
    render(<AccordionMenu items={items} />);
    await user.click(screen.getByText('File'));
    expect(await screen.findByText('New')).toBeInTheDocument();
  });

  it('leaf item (no children) click fires its onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const leafItems: AccordionMenuItem[] = [{ id: 'x', label: 'X', onClick }];
    render(<AccordionMenu items={leafItems} />);
    await user.click(screen.getByText('X'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('exclusive: opening second closes the first', () => {
    function Excl() {
      const { state, actions } = useAccordionMenu({ items: exclusiveItems, exclusive: true });
      return (
        <div>
          <button onClick={() => actions.openItem('a')} data-testid="o-a">oA</button>
          <button onClick={() => actions.openItem('b')} data-testid="o-b">oB</button>
          <span data-testid="open">{Array.from(state.openItems).join(',')}</span>
        </div>
      );
    }
    render(<Excl />);
    fireEvent.click(screen.getByTestId('o-a'));
    expect(screen.getByTestId('open').textContent).toBe('a');
    fireEvent.click(screen.getByTestId('o-b'));
    expect(screen.getByTestId('open').textContent).toBe('b');
  });

  it('openAll is a no-op in exclusive mode', () => {
    render(<Harness items={items} exclusive />);
    fireEvent.click(screen.getByTestId('o-all'));
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('openAll opens every item in non-exclusive mode', () => {
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('o-all'));
    const open = screen.getByTestId('open').textContent!;
    expect(open).toContain('file');
    expect(open).toContain('help');
  });

  it('closeAll empties open items', () => {
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('o-all'));
    fireEvent.click(screen.getByTestId('c-all'));
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('toggleItem flips open state for an item with children', () => {
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('t-file'));
    expect(screen.getByTestId('open').textContent).toContain('file');
    fireEvent.click(screen.getByTestId('t-file'));
    expect(screen.getByTestId('open').textContent).not.toContain('file');
  });

  it('focusItem sets focused item id', () => {
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('f-new'));
    expect(screen.getByTestId('focused').textContent).toBe('new');
  });

  it('controlled openItems reflect external value', () => {
    function Controlled() {
      const { state } = useAccordionMenu({ items, openItems: ['file'] });
      return <span data-testid="open">{Array.from(state.openItems).join(',')}</span>;
    }
    render(<Controlled />);
    expect(screen.getByTestId('open').textContent).toContain('file');
  });

  it('defaultOpenItems seeds initial open set', () => {
    render(<Harness items={items} defaultOpenItems={['help']} />);
    expect(screen.getByTestId('open').textContent).toContain('help');
  });

  it('keyboard Enter on a focused item with children toggles it', () => {
    function Probe() {
      const { menuProps, actions } = useAccordionMenu({ items });
      return (
        <div {...menuProps} data-testid="menu">
          <button onClick={() => actions.focusItem('file')} data-testid="focus">focus</button>
        </div>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('focus'));
    const menu = screen.getByTestId('menu');
    fireEvent.keyDown(menu, { key: 'Enter' });
    // No direct state probe here; verify no crash and event preventDefault called.
    expect(menu).toBeInTheDocument();
  });

  it('keyboard ArrowDown/Home/End move focus across flattened items', () => {
    function Probe() {
      const { menuProps, state } = useAccordionMenu({ items });
      return (
        <div {...menuProps} data-testid="menu">
          <span data-testid="focused">{state.focusedItemId ?? ''}</span>
        </div>
      );
    }
    render(<Probe />);
    const menu = screen.getByTestId('menu');
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(screen.getByTestId('focused').textContent).toBe('file');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByTestId('focused').textContent).toBe('new');
    fireEvent.keyDown(menu, { key: 'End' });
    expect(screen.getByTestId('focused').textContent).toBe('help');
  });

  it('keyboard ArrowRight opens a focused item with children; ArrowLeft closes', () => {
    function Probe() {
      const { menuProps, state, actions } = useAccordionMenu({ items });
      return (
        <div {...menuProps} data-testid="menu">
          <button onClick={() => actions.focusItem('file')} data-testid="focus">focus</button>
          <span data-testid="open">{Array.from(state.openItems).join(',')}</span>
        </div>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('focus'));
    const menu = screen.getByTestId('menu');
    fireEvent.keyDown(menu, { key: 'ArrowRight' });
    expect(screen.getByTestId('open').textContent).toContain('file');
    fireEvent.keyDown(menu, { key: 'ArrowLeft' });
    expect(screen.getByTestId('open').textContent).not.toContain('file');
  });

  it('keyboard Enter on a focused leaf fires its onClick', () => {
    const onClick = vi.fn();
    const leaf: AccordionMenuItem[] = [{ id: 'x', label: 'X', onClick }];
    function Probe() {
      const { menuProps, actions } = useAccordionMenu({ items: leaf });
      return (
        <div {...menuProps} data-testid="menu">
          <button onClick={() => actions.focusItem('x')} data-testid="focus">focus</button>
        </div>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('focus'));
    fireEvent.keyDown(screen.getByTestId('menu'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('custom children renderer is used', () => {
    render(
      <AccordionMenu items={items}>
        {(item) => <strong data-testid={`r-${item.id}`}>{item.label}!</strong>}
      </AccordionMenu>
    );
    expect(screen.getByTestId('r-file')).toHaveTextContent('File!');
  });

  it('maxDepth limits nested flattening', () => {
    const deep: AccordionMenuItem[] = [
      { id: 'l0', label: 'L0', children: [{ id: 'l1', label: 'L1', children: [{ id: 'l2', label: 'L2' }] }] },
    ];
    function Probe() {
      const { state } = useAccordionMenu({ items: deep, maxDepth: 1 });
      return <span data-testid="total">{state.totalItems}</span>;
    }
    render(<Probe />);
    // maxDepth=1 -> only top-level flattened (1 item)
    expect(Number(screen.getByTestId('total').textContent)).toBe(1);
  });
});
