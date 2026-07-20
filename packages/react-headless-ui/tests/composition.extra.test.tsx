import { describe, it, expect, vi } from 'vitest';
import {
  composeState,
  composeHandlers,
  composeClasses,
  composeStyles
} from '../src/utils/Composition';

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


