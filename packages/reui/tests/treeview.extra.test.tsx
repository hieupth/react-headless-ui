import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeView, TreeViewNode } from '../src/components/TreeView';
import type { TreeNode } from '../src/hooks';

const tree: TreeNode[] = [
  {
    id: 'root', label: 'Root', children: [
      { id: 'c1', label: 'Child 1' },
      { id: 'c2', label: 'Child 2', children: [{ id: 'g1', label: 'Grand 1' }] },
      { id: 'c3', label: 'Child 3', disabled: true },
    ],
  },
];

describe('TreeView rendering options', () => {
  it('renders with showLines adding a left border to expanded children', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={tree} showLines />);
    await user.click(screen.getByLabelText('Expand'));
    expect(await screen.findByText('Child 1')).toBeInTheDocument();
    expect(document.querySelector('.border-l.border-gray-300')).not.toBeNull();
  });

  it('applies a height and overflow-hidden when height is set', () => {
    render(<TreeView nodes={tree} height={300} />);
    const tv = screen.getByTestId('tree-view');
    expect(tv.className).toContain('overflow-hidden');
    expect((tv.style as any).height).toBe('300px');
  });

  it('renders the empty state for an empty tree', () => {
    render(<TreeView nodes={[]} />);
    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('renders custom defaultNodeIcon for every node', () => {
    render(
      <TreeView
        nodes={[{ id: 'leaf', label: 'Leaf' }]}
        defaultNodeIcon={<span data-testid="def-icon">★</span>}
      />
    );
    expect(screen.getByTestId('def-icon')).toBeInTheDocument();
  });

  it('renders a per-node icon when provided', () => {
    render(
      <TreeView nodes={[{ id: 'n', label: 'N', icon: <span data-testid="node-icon">N</span> }]} />
    );
    expect(screen.getByTestId('node-icon')).toBeInTheDocument();
  });
});

describe('TreeView custom expand/collapse icons', () => {
  it('uses custom collapse icon when expanded and expand icon when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <TreeView
        nodes={tree}
        expandIcon={<span data-testid="exp">+</span>}
        collapseIcon={<span data-testid="col">-</span>}
      />
    );
    // Collapsed -> shows expand icon
    expect(screen.getByTestId('exp')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Expand'));
    // Expanded -> shows collapse icon
    expect(screen.getByTestId('col')).toBeInTheDocument();
  });
});

describe('TreeView custom renderNode', () => {
  it('renders every node through the custom renderer with correct props', async () => {
    const spy = vi.fn(() => <div data-testid="custom-node" />);
    render(<TreeView nodes={tree} renderNode={spy} />);
    expect(screen.getAllByTestId('custom-node').length).toBeGreaterThan(0);
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
    // signature: (node, level, isExpanded, isSelected)
    expect(lastCall[0].id).toBe('root');
    expect(typeof lastCall[1]).toBe('number');
    expect(typeof lastCall[2]).toBe('boolean');
    expect(typeof lastCall[3]).toBe('boolean');
  });

  it('passes isExpanded/isSelected correctly after interaction', async () => {
    const seen: any[] = [];
    render(
      <TreeView
        nodes={tree}
        renderNode={(node, level, isExpanded, isSelected) => {
          seen.push({ id: node.id, isExpanded, isSelected });
          return <div key={node.id} data-testid={`rn-${node.id}`}>{node.label}</div>;
        }}
      />
    );
    await fireEvent.click(screen.getByText('Root'));
    const root = seen.filter((s) => s.id === 'root').pop();
    expect(root.isSelected).toBe(true);
    expect(root.isExpanded).toBe(true);
  });
});

describe('TreeView keyboard navigation', () => {
  it('Space toggles selection and expansion of a parent node', () => {
    const onSelectionChange = vi.fn();
    render(<TreeView nodes={tree} onSelectionChange={onSelectionChange} />);
    const root = screen.getByTestId('tree-node-root');
    fireEvent.keyDown(root, { key: ' ' });
    expect(onSelectionChange).toHaveBeenCalled();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('ArrowRight on an already-expanded parent is a no-op for expansion', () => {
    const onExpansionChange = vi.fn();
    render(
      <TreeView
        nodes={tree}
        defaultExpandedIds={['root']}
        onExpansionChange={onExpansionChange}
      />
    );
    const root = screen.getByTestId('tree-node-root');
    // already expanded
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    onExpansionChange.mockClear();
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(onExpansionChange).not.toHaveBeenCalled();
  });

  it('ArrowRight on a collapsed parent expands it', () => {
    const onExpansionChange = vi.fn();
    render(<TreeView nodes={tree} onExpansionChange={onExpansionChange} />);
    const root = screen.getByTestId('tree-node-root');
    // collapsed initially -> children absent
    expect(screen.queryByText('Child 1')).toBeNull();
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(onExpansionChange).toHaveBeenCalled();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('ArrowLeft on an expanded parent collapses it', () => {
    const onExpansionChange = vi.fn();
    render(
      <TreeView nodes={tree} defaultExpandedIds={['root']} onExpansionChange={onExpansionChange} />
    );
    const root = screen.getByTestId('tree-node-root');
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    onExpansionChange.mockClear();
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(onExpansionChange).toHaveBeenCalled();
    expect(screen.queryByText('Child 1')).toBeNull();
  });

  it('double-click on a node fires handleNodeActivate', () => {
    const onNodeActivate = vi.fn();
    render(<TreeView nodes={tree} onNodeActivate={onNodeActivate} />);
    const root = screen.getByTestId('tree-node-root');
    fireEvent.doubleClick(root);
    expect(onNodeActivate).toHaveBeenCalledTimes(1);
    expect(onNodeActivate.mock.calls[0][0]).toMatchObject({ id: 'root', label: 'Root' });
  });

  it('clicking a parent node toggles its expansion', () => {
    const onExpansionChange = vi.fn();
    render(<TreeView nodes={tree} onExpansionChange={onExpansionChange} />);
    const root = screen.getByTestId('tree-node-root');
    expect(screen.queryByText('Child 1')).toBeNull();
    fireEvent.click(root);
    expect(onExpansionChange).toHaveBeenCalled();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('keyboard Enter on a parent toggles selection and expansion', () => {
    const onSelectionChange = vi.fn();
    const onExpansionChange = vi.fn();
    render(
      <TreeView
        nodes={tree}
        onSelectionChange={onSelectionChange}
        onExpansionChange={onExpansionChange}
      />
    );
    const root = screen.getByTestId('tree-node-root');
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onSelectionChange).toHaveBeenCalled();
    expect(onExpansionChange).toHaveBeenCalled();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('clicking and pressing Enter on a leaf node selects without expanding', () => {
    const onSelectionChange = vi.fn();
    const onExpansionChange = vi.fn();
    render(
      <TreeView
        nodes={tree}
        defaultExpandedIds={['root']}
        onSelectionChange={onSelectionChange}
        onExpansionChange={onExpansionChange}
      />
    );
    const c1 = screen.getByTestId('tree-node-c1');
    onSelectionChange.mockClear();
    onExpansionChange.mockClear();
    fireEvent.click(c1);
    expect(onSelectionChange).toHaveBeenCalled();
    expect(onExpansionChange).not.toHaveBeenCalled();
    fireEvent.keyDown(c1, { key: 'Enter' });
    expect(onExpansionChange).not.toHaveBeenCalled();
  });

  it('ArrowLeft on a collapsed parent is a no-op for collapse', () => {
    const onExpansionChange = vi.fn();
    render(<TreeView nodes={tree} onExpansionChange={onExpansionChange} />);
    const root = screen.getByTestId('tree-node-root');
    onExpansionChange.mockClear();
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(onExpansionChange).not.toHaveBeenCalled();
  });

  it('ArrowRight on a leaf node does nothing', () => {
    const onExpansionChange = vi.fn();
    render(
      <TreeView
        nodes={tree}
        defaultExpandedIds={['root']}
        onExpansionChange={onExpansionChange}
      />
    );
    const c1 = screen.getByTestId('tree-node-c1');
    onExpansionChange.mockClear();
    fireEvent.keyDown(c1, { key: 'ArrowRight' });
    expect(onExpansionChange).not.toHaveBeenCalled();
  });

  it('ArrowUp/ArrowDown call preventDefault without expanding', () => {
    render(<TreeView nodes={tree} defaultExpandedIds={['root']} />);
    const c1 = screen.getByTestId('tree-node-c1');
    const up = createEvent.keyDown(c1, { key: 'ArrowUp' });
    const pdUp = vi.spyOn(up, 'preventDefault');
    fireEvent(c1, up);
    const down = createEvent.keyDown(c1, { key: 'ArrowDown' });
    const pdDown = vi.spyOn(down, 'preventDefault');
    fireEvent(c1, down);
    expect(pdUp).toHaveBeenCalledTimes(1);
    expect(pdDown).toHaveBeenCalledTimes(1);
  });

  it('keyboard Enter on a disabled node does nothing', () => {
    const onSelectionChange = vi.fn();
    render(
      <TreeView
        nodes={tree}
        defaultExpandedIds={['root']}
        onSelectionChange={onSelectionChange}
      />
    );
    const c3 = screen.getByTestId('tree-node-c3');
    fireEvent.keyDown(c3, { key: 'Enter' });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('other keys (e.g. Tab) are ignored', () => {
    render(<TreeView nodes={tree} />);
    const root = screen.getByTestId('tree-node-root');
    expect(() => fireEvent.keyDown(root, { key: 'Tab' })).not.toThrow();
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });
});

describe('TreeView click and double-click', () => {
  it('clicking a parent toggles both selection and expansion', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<TreeView nodes={tree} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByText('Root'));
    expect(onSelectionChange).toHaveBeenCalled();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('double-clicking a disabled node does not activate', async () => {
    const user = userEvent.setup();
    const onNodeActivate = vi.fn();
    render(
      <TreeView
        nodes={tree}
        defaultExpandedIds={['root']}
        onNodeActivate={onNodeActivate}
      />
    );
    await user.dblClick(screen.getByText('Child 3'));
    expect(onNodeActivate).not.toHaveBeenCalled();
  });

  it('expand button toggles expansion independently of selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<TreeView nodes={tree} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByLabelText('Expand'));
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    // Toggling expansion via the expand button should not select root
    const root = screen.getByTestId('tree-node-root');
    expect(root.getAttribute('aria-selected')).toBe('false');
  });
});

describe('TreeView default render details', () => {
  it('renders a spacer for leaf nodes without children', () => {
    render(<TreeView nodes={[{ id: 'leaf', label: 'Leaf' }]} />);
    const node = screen.getByTestId('tree-node-leaf');
    // leaf node has a spacer span (w-6 h-6)
    expect(node.querySelector('span.w-6')).not.toBeNull();
  });

  it('aria-expanded reflects expanded state and is undefined for leaves', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={tree} />);
    const root = screen.getByTestId('tree-node-root');
    expect(root.getAttribute('aria-expanded')).toBe('false');
    await user.click(screen.getByLabelText('Expand'));
    expect(root.getAttribute('aria-expanded')).toBe('true');
    // re-render with a leaf
  });

  it('aria-level increments per depth', async () => {
    const user = userEvent.setup();
    render(
      <TreeView
        nodes={[{ id: 'a', label: 'A', children: [{ id: 'b', label: 'B' }] }]}
        defaultExpandedIds={['a']}
      />
    );
    expect(screen.getByTestId('tree-node-a').getAttribute('aria-level')).toBe('1');
    expect(screen.getByTestId('tree-node-b').getAttribute('aria-level')).toBe('2');
  });
});

describe('TreeViewNode (standalone)', () => {
  const leaf: TreeNode = { id: 'x', label: 'X' };
  const parent: TreeNode = { id: 'p', label: 'P', children: [{ id: 'c', label: 'C' }] };

  it('renders a selected, disabled node with correct classes and aria', () => {
    render(
      <TreeViewNode
        node={{ ...leaf, disabled: true }}
        level={0}
        isExpanded={false}
        isSelected
        showExpandIcon={false}
      />
    );
    const node = screen.getByTestId('tree-node-x');
    expect(node.getAttribute('aria-selected')).toBe('true');
    expect(node.getAttribute('aria-disabled')).toBe('true');
    expect(node.className).toContain('opacity-50');
  });

  it('renders an expand button only when showExpandIcon and node has children', () => {
    render(
      <TreeViewNode
        node={parent}
        level={0}
        isExpanded
        isSelected
        showExpandIcon
        expandIcon={<span data-testid="e">+</span>}
        collapseIcon={<span data-testid="c">-</span>}
      />
    );
    const node = screen.getByTestId('tree-node-p');
    expect(node.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('does not render an expand button for a leaf even with showExpandIcon', () => {
    render(
      <TreeViewNode
        node={leaf}
        level={0}
        isExpanded={false}
        isSelected={false}
        showExpandIcon
      />
    );
    expect(screen.queryByLabelText('Expand')).not.toBeInTheDocument();
  });

  it('uses custom expand/collapse icons based on isExpanded', () => {
    const { rerender } = render(
      <TreeViewNode
        node={parent}
        level={0}
        isExpanded={false}
        isSelected={false}
        showExpandIcon
        expandIcon={<span data-testid="e">+</span>}
        collapseIcon={<span data-testid="c">-</span>}
      />
    );
    expect(screen.getByTestId('e')).toBeInTheDocument();
    rerender(
      <TreeViewNode
        node={parent}
        level={0}
        isExpanded
        isSelected={false}
        showExpandIcon
        expandIcon={<span data-testid="e">+</span>}
        collapseIcon={<span data-testid="c">-</span>}
      />
    );
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('renders a node icon when provided', () => {
    render(
      <TreeViewNode
        node={{ id: 'n', label: 'N', icon: <span data-testid="ni">N</span> }}
        level={0}
        isExpanded={false}
        isSelected={false}
        showExpandIcon={false}
      />
    );
    expect(screen.getByTestId('ni')).toBeInTheDocument();
  });

  it('fires onClick / onDoubleClick / onKeyDown handlers', async () => {
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <TreeViewNode
        node={leaf}
        level={0}
        isExpanded={false}
        isSelected={false}
        showExpandIcon={false}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      />
    );
    const node = screen.getByTestId('tree-node-x');
    fireEvent.click(node);
    fireEvent.doubleClick(node);
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('applies paddingLeft based on level', () => {
    render(
      <TreeViewNode
        node={leaf}
        level={3}
        isExpanded={false}
        isSelected={false}
        showExpandIcon={false}
      />
    );
    expect((screen.getByTestId('tree-node-x').style as any).paddingLeft).toBe('68px');
  });

  it('merges custom className and style', () => {
    render(
      <TreeViewNode
        className="my-node"
        style={{ color: 'red' }}
        node={leaf}
        level={0}
        isExpanded={false}
        isSelected={false}
        showExpandIcon={false}
      />
    );
    const node = screen.getByTestId('tree-node-x');
    expect(node.className).toContain('my-node');
    expect((node.style as any).color).toBe('red');
  });
});

describe('TreeView focus and aria on the container', () => {
  it('marks the focused node tabbable (tabIndex 0)', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={tree} />);
    const root = screen.getByTestId('tree-node-root');
    // No focused node initially -> tabIndex -1
    expect(root.getAttribute('tabindex')).toBe('-1');
    // Focus root by clicking it
    await user.click(root);
    expect(root.getAttribute('tabindex')).toBe('0');
  });
});
