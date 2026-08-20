import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import React from 'react';
import { Sortable } from '../src/components/Sortable';
import type { SortableItem } from '../src/hooks';

const defaultItems: SortableItem[] = [
  { id: 'a', value: 'apple', label: 'Apple', index: 0 },
  { id: 'b', value: 'banana', label: 'Banana', index: 1 },
  { id: 'c', value: 'cherry', label: 'Cherry', index: 2 },
];

describe('Sortable list semantics (round 2)', () => {
  it('role="list" container owns role="listitem" children (default rendering)', () => {
    render(<Sortable defaultItems={defaultItems} />);
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    // Every direct child of the list is a listitem — no unroled divs.
    expect(list.children.length).toBe(items.length);
  });

  it('role="list" container owns role="listitem" children (custom renderItem)', () => {
    render(
      <Sortable
        defaultItems={defaultItems}
        renderItem={({ item }) => <div>{item.label}</div>}
      />
    );
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(list.children.length).toBe(items.length);
  });

  afterEach(cleanup);
});
