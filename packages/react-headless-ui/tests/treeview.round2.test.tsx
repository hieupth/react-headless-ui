import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TreeView } from '../src/components/TreeView';

const nodes = [
  { id: 'root', label: 'Root', children: [
    { id: 'child1', label: 'Child 1' },
  ]},
];

describe('TreeView round-2 fixes', () => {
  it('gives the default expand chevron explicit svg size and the button a minimum hit area', () => {
    render(<TreeView nodes={nodes} />);
    const button = screen.getByRole('button', { name: 'Expand' });
    expect(button.style.minWidth).toBe('24px');
    expect(button.style.minHeight).toBe('24px');
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('uses sized chevrons after expansion too', () => {
    render(<TreeView nodes={nodes} defaultExpandedIds={['root']} />);
    const button = screen.getByRole('button', { name: 'Collapse' });
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });
});
