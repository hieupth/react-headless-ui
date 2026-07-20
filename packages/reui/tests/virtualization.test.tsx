import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { DataGrid } from '../src/components/DataGrid';
import { Combobox } from '../src/components/Combobox';
import { Command } from '../src/components/Command';
import type { GridColumn } from '../src/hooks';
import type { ComboboxOption as ComboboxOptionType } from '../src/hooks';
import type { CommandItem as CommandItemType } from '../src/hooks';

// jsdom reports 0 for all layout dimensions, so the TanStack virtualizer
// (which reads clientHeight/offsetHeight from its scroll element) would compute
// an empty visible window and render zero rows. Mock the layout properties to a
// realistic viewport so the virtualizer actually virtualizes under test.
const VIEWPORT_HEIGHT = 400;
let originalClientHeight: PropertyDescriptor | undefined;
let originalOffsetHeight: PropertyDescriptor | undefined;

beforeEach(() => {
  originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: VIEWPORT_HEIGHT });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: VIEWPORT_HEIGHT });
});

afterEach(() => {
  if (originalClientHeight) {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight);
  } else {
    // @ts-expect-error delete is fine here for test cleanup
    delete (HTMLElement.prototype as any).clientHeight;
  }
  if (originalOffsetHeight) {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
  } else {
    // @ts-expect-error delete is fine here for test cleanup
    delete (HTMLElement.prototype as any).offsetHeight;
  }
  cleanup();
});

// Build N synthetic items once per suite (cheap; reused across the three).
function makeGridData(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: String(i), name: `Name ${i}`, age: i }));
}
const gridColumns: GridColumn[] = [
  { id: 'name', header: 'Name' },
  { id: 'age', header: 'Age', type: 'number' },
];

function makeComboboxOptions(n: number): ComboboxOptionType[] {
  return Array.from({ length: n }, (_, i) => ({ id: String(i), label: `Option ${i}`, value: String(i) }));
}

function makeCommandItems(n: number): CommandItemType[] {
  return Array.from({ length: n }, (_, i) => ({ id: String(i), label: `Command ${i}`, value: String(i) }));
}

describe('DataGrid virtualization', () => {
  // The hook defaults to pageSize=10, which would cap the page and mask
  // virtualization. Disable pagination by giving a single huge page so the
  // full dataset is what the body renders (and virtualizes).
  const onePage = (n: number) => ({ page: 1, pageSize: n + 10, total: n, totalPages: 1 });

  it('mounts only a window of rows above the threshold, not all 1000', () => {
    const data = makeGridData(1000);
    const { getAllByTestId } = render(
      <DataGrid
        data={data}
        columns={gridColumns}
        showSelection={false}
        showColumnFilters={false}
        virtualizeThreshold={100}
        defaultPagination={onePage(1000)}
      />
    );
    const rows = getAllByTestId(/^data-grid-row-\d+$/);
    // ~viewport/rowHeight (400/40=10) + overscan(4)*2 should be far below 1000.
    expect(rows.length).toBeLessThan(100);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('renders every row when below the threshold (no virtualization)', () => {
    const data = makeGridData(20);
    const { getAllByTestId } = render(
      <DataGrid
        data={data}
        columns={gridColumns}
        showSelection={false}
        showColumnFilters={false}
        virtualizeThreshold={100}
        defaultPagination={onePage(20)}
      />
    );
    const rows = getAllByTestId(/^data-grid-row-\d+$/);
    expect(rows.length).toBe(20);
  });
});

describe('Combobox virtualization', () => {
  it('mounts only a window of options when virtualize is forced on', () => {
    const options = makeComboboxOptions(1000);
    render(<Combobox options={options} defaultOpen virtualize />);
    const opts = document.querySelectorAll('[data-testid="combobox-option"]');
    expect(opts.length).toBeLessThan(100);
    expect(opts.length).toBeGreaterThan(0);
  });

  it('renders every option when below the threshold', () => {
    const options = makeComboboxOptions(4);
    render(<Combobox options={options} defaultOpen virtualizeThreshold={100} />);
    const opts = document.querySelectorAll('[data-testid="combobox-option"]');
    expect(opts.length).toBe(4);
  });
});

describe('Command virtualization', () => {
  it('mounts only a window of items when virtualize is forced on', () => {
    const items = makeCommandItems(1000);
    render(<Command items={items} open showSearch={false} virtualize />);
    const rendered = document.querySelectorAll('[data-testid="command-item"]');
    expect(rendered.length).toBeLessThan(100);
    expect(rendered.length).toBeGreaterThan(0);
  });

  it('renders every item when below the threshold', () => {
    const items = makeCommandItems(3);
    render(<Command items={items} open showSearch={false} virtualizeThreshold={100} />);
    const rendered = document.querySelectorAll('[data-testid="command-item"]');
    expect(rendered.length).toBe(3);
  });
});
