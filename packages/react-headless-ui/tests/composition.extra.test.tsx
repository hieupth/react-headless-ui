import { describe, it, expect, vi } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import * as React from 'react';
import {
  composeState,
  composeHandlers,
  composeClasses,
  composeStyles,
  createTraversalTree,
  composeLifecycle,
  useComposition
} from '../src/utils/Composition';
import type { ComponentContract } from '../src/contracts';

// Helper to build a ComponentContract tree.
const makeComponent = (
  id: string,
  children: ComponentContract[] = []
): ComponentContract => ({
  id,
  state: 'idle',
  mounted: false,
  children
});

describe('composeState', () => {
  it('merges multiple partial states in order, later wins', () => {
    expect(composeState({ a: 1 }, { a: 2, b: 3 })).toEqual({ a: 2, b: 3 });
  });

  it('skips undefined states and undefined values', () => {
    expect(composeState(undefined, { a: 1, b: undefined }, { c: 3 })).toEqual({
      a: 1,
      c: 3
    });
  });

  it('returns empty object for no / all-undefined inputs', () => {
    expect(composeState()).toEqual({});
    expect(composeState(undefined, undefined)).toEqual({});
  });

  it('preserves null values (only undefined is skipped)', () => {
    expect(composeState({ a: null }, { b: 'x' })).toEqual({ a: null, b: 'x' });
  });
});

describe('composeHandlers', () => {
  it('passes a single handler-map object through unchanged', () => {
    const map = { onClick: vi.fn(), onKeyDown: vi.fn() };
    expect(composeHandlers(map)).toBe(map);
  });

  it('invokes multiple function handlers in order with shared args', () => {
    const a = vi.fn();
    const b = vi.fn(x => x + 1);
    const composed = composeHandlers(a, b) as (n: number) => void;
    composed(5);
    expect(a).toHaveBeenCalledWith(5);
    expect(b).toHaveBeenCalledWith(5);
  });

  it('skips undefined and non-function entries', () => {
    const a = vi.fn();
    const composed = composeHandlers(undefined as any, a, 'nope' as any) as () => void;
    composed();
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('isolates handler errors (logs and continues)', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const good = vi.fn();
    const composed = composeHandlers(
      () => {
        throw new Error('boom');
      },
      good
    ) as () => void;
    composed();
    expect(good).toHaveBeenCalledTimes(1);
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('returns a promise when a handler is async', async () => {
    const composed = composeHandlers(async () => 1, async () => 2) as () => Promise<any>;
    const result = await composed();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('returns undefined when all handlers are sync', () => {
    const composed = composeHandlers(() => 1, () => 2) as () => any;
    expect(composed()).toBeUndefined();
  });

  it('treats null as a multi-handler call style (not handler-map)', () => {
    // null fails the object check, so it falls to the chained path.
    const a = vi.fn();
    const composed = composeHandlers(null as any, a) as () => void;
    composed();
    expect(a).toHaveBeenCalledTimes(1);
  });
});

describe('composeClasses', () => {
  it('joins truthy classes with spaces', () => {
    expect(composeClasses('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out undefined, null, false and empty strings', () => {
    expect(composeClasses('a', undefined, null, false, '', 'b')).toBe('a b');
  });

  it('returns empty string for no / all-falsy inputs', () => {
    expect(composeClasses()).toBe('');
    expect(composeClasses(undefined, null, false, '')).toBe('');
  });
});

describe('composeStyles', () => {
  it('shallow-merges flat style objects, later wins', () => {
    expect(composeStyles({ color: 'red' }, { color: 'blue', padding: 8 })).toEqual({
      color: 'blue',
      padding: 8
    });
  });

  it('skips undefined style args', () => {
    expect(composeStyles(undefined, { color: 'red' }, undefined)).toEqual({
      color: 'red'
    });
  });

  it('deep-merges nested objects when both sides are objects', () => {
    const merged = composeStyles(
      { '::before': { content: '"x"', color: 'red' } } as any,
      { '::before': { color: 'blue' } } as any
    );
    expect(merged).toEqual({ '::before': { content: '"x"', color: 'blue' } });
  });

  it('overwrites when the new value is not a plain object', () => {
    // target is object, incoming is primitive -> override branch.
    const merged = composeStyles(
      { '::before': { color: 'red' } } as any,
      { '::before': 'literal' } as any
    );
    expect(merged).toEqual({ '::before': 'literal' });
  });

  it('overwrites when target value is not an object', () => {
    // target primitive, incoming object -> else branch.
    const merged = composeStyles(
      { color: 'red' } as any,
      { nested: { a: 1 } } as any
    );
    expect(merged).toEqual({ color: 'red', nested: { a: 1 } });
  });

  it('treats arrays as non-mergeable (override, not deep merge)', () => {
    const merged = composeStyles(
      { gridTemplateColumns: ['1fr', '1fr'] } as any,
      { gridTemplateColumns: ['1fr'] } as any
    );
    expect(merged).toEqual({ gridTemplateColumns: ['1fr'] });
  });

  it('preserves null values', () => {
    expect(composeStyles({ a: null } as any, { b: 'x' } as any)).toEqual({
      a: null,
      b: 'x'
    });
  });
});

describe('createTraversalTree', () => {
  it('builds a depth-ordered node list with paths and depth', () => {
    const root = makeComponent('root', [makeComponent('a', [makeComponent('a1')]), makeComponent('b')]);
    const tree = createTraversalTree(root, { id: 'root' });
    expect(tree.map(n => ({ id: n.component.id, depth: n.depth, path: n.path }))).toEqual([
      { id: 'root', depth: 0, path: ['root'] },
      { id: 'a', depth: 1, path: ['root', 'a'] },
      { id: 'a1', depth: 2, path: ['root', 'a', 'a1'] },
      { id: 'b', depth: 1, path: ['root', 'b'] }
    ]);
  });

  it('marks nodes traversable when they have children', () => {
    const root = makeComponent('root', [makeComponent('leaf')]);
    const tree = createTraversalTree(root, { id: 'root' });
    expect(tree[0].traversable).toBe(true); // root has children
    expect(tree[1].traversable).toBe(false); // leaf has no children
  });

  it('uses default options when omitted', () => {
    const root = makeComponent('solo');
    const tree = createTraversalTree(root);
    expect(tree).toHaveLength(1);
    expect(tree[0].path).toEqual(['solo']);
    expect(tree[0].traversable).toBe(false);
  });

  it('avoids infinite loops on cyclic graphs via visited set', () => {
    // Construct a self-referencing cycle (a -> a).
    const a = makeComponent('a');
    (a.children as ComponentContract[]).push(a);
    const tree = createTraversalTree(a, { id: 'cycle' });
    expect(tree).toHaveLength(1);
  });
});

describe('composeLifecycle', () => {
  it('enhances a component with parent, children (re-parented) and mounted flag', () => {
    const base = makeComponent('base');
    const childA = makeComponent('childA');
    const childB = makeComponent('childB');
    const parent = makeComponent('parent');
    const enhanced = composeLifecycle(base, {
      id: 'lc',
      parent,
      children: [childA, childB]
    });
    expect(enhanced.id).toBe('base');
    expect(enhanced.mounted).toBe(true);
    expect(enhanced.parent).toBe(parent);
    expect(enhanced.children).toHaveLength(2);
    expect(enhanced.children[0].parent).toBe(enhanced);
    expect(enhanced.children[1].parent).toBe(enhanced);
  });

  it('defaults children to empty array when omitted', () => {
    const base = makeComponent('base');
    const enhanced = composeLifecycle(base);
    expect(enhanced.children).toEqual([]);
    expect(enhanced.mounted).toBe(true);
  });
});

describe('useComposition', () => {
  it('builds a component instance, traversal tree and exposes compose helpers', () => {
    const child = makeComponent('child');
    const parent = makeComponent('parent', [child]);
    const { result } = renderHook(() =>
      useComposition({ id: 'root', parent })
    );
    expect(result.current.component.id).toBe('root');
    expect(result.current.component.state).toBe('idle');
    expect(result.current.component.mounted).toBe(false);
    expect(result.current.component.parent).toBe(parent);
    // traversal tree built from the synthesized component (no children -> 1 node).
    expect(result.current.traversalTree).toHaveLength(1);
    expect(result.current.traversalTree[0].component.id).toBe('root');
    // Helpers are wired through.
    expect(result.current.composeClasses('a', 'b')).toBe('a b');
    expect(result.current.composeState({ x: 1 })).toEqual({ x: 1 });
    expect(typeof result.current.composeHandlers(() => {})).toBe('function');
    expect(result.current.composeStyles({ color: 'red' })).toEqual({ color: 'red' });
  });

  it('renders inside a component tree via a Probe', () => {
    const Probe = () => {
      const { component, traversalTree } = useComposition({ id: 'probe' });
      return (
        <div data-testid="out">
          {component.id}:{traversalTree.length}
        </div>
      );
    };
    const { getByTestId } = render(<React.Suspense fallback={null}><Probe /></React.Suspense>);
    expect(getByTestId('out').textContent).toBe('probe:1');
  });
});
