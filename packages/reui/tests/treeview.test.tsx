import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreeView } from '../src/components/TreeView';

const nodes = [
  { id: 'root', label: 'Root', children: [
    { id: 'child1', label: 'Child 1' },
    { id: 'child2', label: 'Child 2' },
  ]},
];

describe('TreeView', () => {
  it('renders a tree with the root node', () => {
    render(<TreeView nodes={nodes} />);
    // The outer wrapper and inner container both carry role="tree".
    expect(screen.getAllByRole('tree').length).toBeGreaterThan(0);
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('fires onNodeActivate when a node is double-clicked', async () => {
    const user = userEvent.setup();
    const onNodeActivate = vi.fn();
    render(<TreeView nodes={nodes} onNodeActivate={onNodeActivate} />);
    await user.dblClick(screen.getByText('Root'));
    expect(onNodeActivate).toHaveBeenCalled();
  });
});
