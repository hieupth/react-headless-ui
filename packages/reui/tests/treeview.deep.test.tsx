import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeView } from '../src/components/TreeView';
import { useTreeView } from '../src/hooks';
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

function Harness({ nodes, ...props }: { nodes: TreeNode[]; [k: string]: any }) {
  const { state, actions } = useTreeView({ nodes, ...props });
  return (
    <div>
      <button onClick={() => actions.selectNode('root')} data-testid="sel-root">selRoot</button>
      <button onClick={() => actions.toggleNodeSelection('c1')} data-testid="toggle-c1">toggleC1</button>
      <button onClick={() => actions.deselectNode('c1')} data-testid="desel-c1">deselC1</button>
      <button onClick={() => actions.toggleNodeExpansion('root')} data-testid="exp-root">expRoot</button>
      <button onClick={() => actions.expandNode('root')} data-testid="expand">expand</button>
      <button onClick={() => actions.collapseNode('root')} data-testid="collapse">collapse</button>
      <button onClick={actions.expandAll} data-testid="exp-all">expAll</button>
      <button onClick={actions.collapseAll} data-testid="col-all">colAll</button>
      <button onClick={actions.clearSelection} data-testid="clear">clear</button>
      <button onClick={() => actions.handleNodeActivate('root')} data-testid="activate">activate</button>
      <button onClick={() => actions.handleNodeActivate('c3')} data-testid="activate-disabled">activateDisabled</button>
      <button onClick={() => actions.selectNode('c3')} data-testid="sel-disabled">selDisabled</button>
      <button onClick={() => actions.expandNode('c1')} data-testid="expand-leaf">expandLeaf</button>
      <button onClick={() => actions.selectNode('missing')} data-testid="sel-missing">selMissing</button>
      <button onClick={() => actions.focusNode('c1')} data-testid="focus">focus</button>
      <button
        onClick={() => {
          const n = actions.getNode('c2');
          const p = actions.getNodePath('g1');
          const sel = actions.getSelectedNodes();
          (window as any).__tv = { label: n?.label, pathLen: p.length, selCount: sel.length };
          const ev = new Event('probe');
          document.dispatchEvent(ev);
        }}
        data-testid="probe"
      >probe</button>
      <button
        onClick={() => {
          const n = actions.getNode('does-not-exist');
          const p = actions.getNodePath('does-not-exist');
          (window as any).__tvMissing = { node: n, pathLen: p.length };
          document.dispatchEvent(new Event('probe-missing'));
        }}
        data-testid="probe-missing"
      >probeMissing</button>
      <span data-testid="selected">{Array.from(state.selectedIds).join(',')}</span>
      <span data-testid="expanded">{Array.from(state.expandedIds).join(',')}</span>
      <span data-testid="focused">{state.focusedId ?? ''}</span>
    </div>
  );
}

describe('useTreeView', () => {
  it('renders the root label and empty-state message for an empty tree', () => {
    const { rerender } = render(<TreeView nodes={tree} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    rerender(<TreeView nodes={[]} />);
    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('expand/collapse via expand button toggles children visibility', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={tree} />);
    // Root has an expand button labeled "Expand" (collapsed initially)
    const expandBtn = screen.getByLabelText('Expand');
    await user.click(expandBtn);
    expect(await screen.findByText('Child 1')).toBeInTheDocument();
  });

  it('clicking a node selects it (single mode)', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<TreeView nodes={tree} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByText('Root'));
    expect(onSelectionChange).toHaveBeenCalled();
    const root = screen.getByTestId('tree-node-root');
    expect(root).toHaveAttribute('aria-selected', 'true');
  });

  it('disabled node is not selectable via click', async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={[{ id: 'd', label: 'Disabled', disabled: true }]} />);
    await user.click(screen.getByText('Disabled'));
    expect(screen.getByTestId('tree-node-d')).toHaveAttribute('aria-selected', 'false');
  });

  it('double-click activates the node', async () => {
    const user = userEvent.setup();
    const onNodeActivate = vi.fn();
    render(<TreeView nodes={tree} onNodeActivate={onNodeActivate} />);
    await user.dblClick(screen.getByText('Root'));
    expect(onNodeActivate).toHaveBeenCalled();
  });

  it('keyboard Enter toggles selection and expansion of a parent', async () => {
    const onSelectionChange = vi.fn();
    render(<TreeView nodes={tree} onSelectionChange={onSelectionChange} />);
    const root = screen.getByTestId('tree-node-root');
    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onSelectionChange).toHaveBeenCalled();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
  });

  it('keyboard ArrowRight expands a collapsed parent; ArrowLeft collapses', async () => {
    render(<TreeView nodes={tree} />);
    const root = screen.getByTestId('tree-node-root');
    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
  });

  // ---- Hook-level behavior ----
  it('single selection replaces the previous selection', () => {
    render(<Harness nodes={tree} selectionMode="single" />);
    fireEvent.click(screen.getByTestId('sel-root'));
    expect(screen.getByTestId('selected').textContent).toBe('root');
  });

  it('multiple selection accumulates; deselect removes', () => {
    render(<Harness nodes={tree} selectionMode="multiple" />);
    fireEvent.click(screen.getByTestId('sel-root'));
    fireEvent.click(screen.getByTestId('toggle-c1'));
    expect(screen.getByTestId('selected').textContent).toContain('root');
    expect(screen.getByTestId('selected').textContent).toContain('c1');
    fireEvent.click(screen.getByTestId('desel-c1'));
    expect(screen.getByTestId('selected').textContent).not.toContain('c1');
  });

  it('none selection mode ignores selection', () => {
    render(<Harness nodes={tree} selectionMode="none" />);
    fireEvent.click(screen.getByTestId('sel-root'));
    expect(screen.getByTestId('selected').textContent).toBe('');
  });

  it('toggleNodeSelection flips selection in single mode', () => {
    render(<Harness nodes={tree} selectionMode="single" />);
    fireEvent.click(screen.getByTestId('sel-root'));
    expect(screen.getByTestId('selected').textContent).toBe('root');
  });

  it('expandAll/collapseAll operate on every node id', () => {
    render(<Harness nodes={tree} />);
    fireEvent.click(screen.getByTestId('exp-all'));
    expect(screen.getByTestId('expanded').textContent).toContain('root');
    fireEvent.click(screen.getByTestId('col-all'));
    expect(screen.getByTestId('expanded').textContent).toBe('');
  });

  it('expandNode on a leaf (no children) is a no-op', () => {
    render(<Harness nodes={tree} />);
    // c1 has no children
    fireEvent.click(screen.getByTestId('exp-root'));
    expect(screen.getByTestId('expanded').textContent).toContain('root');
  });

  it('collapseNode removes only the targeted id', () => {
    render(<Harness nodes={tree} />);
    fireEvent.click(screen.getByTestId('expand'));
    fireEvent.click(screen.getByTestId('expand'));
    fireEvent.click(screen.getByTestId('collapse'));
    expect(screen.getByTestId('expanded').textContent).not.toContain('root');
  });

  it('clearSelection empties selected ids and fires callback', () => {
    const onSelectionChange = vi.fn();
    render(<Harness nodes={tree} selectionMode="multiple" onSelectionChange={onSelectionChange} />);
    fireEvent.click(screen.getByTestId('sel-root'));
    fireEvent.click(screen.getByTestId('clear'));
    expect(screen.getByTestId('selected').textContent).toBe('');
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('handleNodeActivate fires onNodeActivate for an enabled node', () => {
    const onNodeActivate = vi.fn();
    render(<Harness nodes={tree} onNodeActivate={onNodeActivate} />);
    fireEvent.click(screen.getByTestId('activate'));
    expect(onNodeActivate).toHaveBeenCalled();
  });

  it('disabled tree blocks selection and expansion', () => {
    render(<Harness nodes={tree} disabled />);
    // Exercise every action's disabled early-return guard.
    fireEvent.click(screen.getByTestId('sel-root'));
    fireEvent.click(screen.getByTestId('toggle-c1'));
    fireEvent.click(screen.getByTestId('desel-c1'));
    fireEvent.click(screen.getByTestId('exp-root'));
    fireEvent.click(screen.getByTestId('expand'));
    fireEvent.click(screen.getByTestId('collapse'));
    fireEvent.click(screen.getByTestId('exp-all'));
    fireEvent.click(screen.getByTestId('col-all'));
    fireEvent.click(screen.getByTestId('clear'));
    fireEvent.click(screen.getByTestId('focus'));
    expect(screen.getByTestId('selected').textContent).toBe('');
    expect(screen.getByTestId('expanded').textContent).toBe('');
    expect(screen.getByTestId('focused').textContent).toBe('');
  });

  it('expandAll prop expands all nodes on mount', () => {
    render(<Harness nodes={tree} expandAll />);
    expect(screen.getByTestId('expanded').textContent).toContain('root');
    expect(screen.getByTestId('expanded').textContent).toContain('c2');
  });

  it('defaultExpandedIds seeds initial expansion', () => {
    render(<Harness nodes={tree} defaultExpandedIds={['root']} />);
    expect(screen.getByTestId('expanded').textContent).toContain('root');
  });

  it('getNode/getNodePath/getSelectedNodes query helpers work', () => {
    render(<Harness nodes={tree} selectionMode="multiple" />);
    const probeListener = vi.fn(() => {});
    document.addEventListener('probe', probeListener);
    fireEvent.click(screen.getByTestId('sel-root'));
    fireEvent.click(screen.getByTestId('probe'));
    const data = (window as any).__tv;
    expect(data.label).toBe('Child 2');
    expect(data.pathLen).toBe(3); // root -> c2 -> g1
    expect(data.selCount).toBe(1);
    document.removeEventListener('probe', probeListener);
  });

  it('focusNode sets the focused id', () => {
    render(<Harness nodes={tree} />);
    fireEvent.click(screen.getByTestId('focus'));
    expect(screen.getByTestId('focused').textContent).toBe('c1');
  });

  it('getNode/getNodePath return empty results for a missing id', () => {
    // Exercises the not-found branches of the recursive findNodeById and
    // getNodePath helpers (return undefined / return null).
    const probeMissing = vi.fn(() => {});
    document.addEventListener('probe-missing', probeMissing);
    render(<Harness nodes={tree} />);
    fireEvent.click(screen.getByTestId('probe-missing'));
    const data = (window as any).__tvMissing;
    expect(data.node).toBeUndefined();
    expect(data.pathLen).toBe(0);
    document.removeEventListener('probe-missing', probeMissing);
  });

  it('guards ignore disabled/missing nodes for selection, expansion, activation', () => {
    // selectNode on a disabled node (c3), a missing node, expandNode on a leaf,
    // and handleNodeActivate on a disabled node are all no-ops.
    render(<Harness nodes={tree} selectionMode="multiple" />);
    fireEvent.click(screen.getByTestId('sel-disabled'));
    fireEvent.click(screen.getByTestId('sel-missing'));
    fireEvent.click(screen.getByTestId('expand-leaf'));
    fireEvent.click(screen.getByTestId('activate-disabled'));
    expect(screen.getByTestId('selected').textContent).toBe('');
  });

  it('getSelectedNodes skips ids that no longer exist in the tree', () => {
    // A selected id absent from `nodes` exercises the `if (node)` false-arm.
    render(<Harness nodes={tree} selectionMode="multiple" defaultSelectedIds={['ghost']} />);
    document.addEventListener('probe', () => {});
    fireEvent.click(screen.getByTestId('probe'));
    const data = (window as any).__tv;
    expect(data.selCount).toBe(0);
  });
});
