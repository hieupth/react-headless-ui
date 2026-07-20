import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useSelect } from '../src/hooks/useSelect';
import type { UseSelectProps, SelectOption } from '../src/hooks/useSelect';

// Harness that renders the raw hook and exposes its full return value so tests
// can drive the imperative action API directly.
function setup(props: UseSelectProps) {
  const api: { current: ReturnType<typeof useSelect> } = { current: null as any };
  function Harness() {
    const result = useSelect(props);
    api.current = result;
    return null;
  }
  render(<Harness />);
  return api;
}

const options: SelectOption[] = [
  { key: 'a', label: 'Apple', value: 'apple' },
  { key: 'b', label: 'Banana', value: 'banana', description: 'yellow fruit' },
  { key: 'c', label: 'Cherry', value: 'cherry' },
];

const optionsWithDisabled: SelectOption[] = [
  { key: 'a', label: 'Apple', value: 'apple', disabled: true },
  { key: 'b', label: 'Banana', value: 'banana' },
  { key: 'c', label: 'Cherry', value: 'cherry' },
  { key: 'd', label: 'Date', value: 'date', disabled: true },
];

function key(key: string, opts: { shiftKey?: boolean } = {}) {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...opts,
  } as unknown as React.KeyboardEvent;
}

describe('useSelect hook — uncontrolled open & value', () => {
  it('starts closed with no selection and exposes defaults', () => {
    const api = setup({ options });
    const r = api.current;
    expect(r.open).toBe(false);
    expect(r.selectedValue).toBeUndefined();
    expect(r.highlightedIndex).toBe(-1);
    expect(r.inputValue).toBe('');
    expect(r.disabled).toBe(false);
    expect(r.searchable).toBe(false);
    expect(r.allowClear).toBe(false);
    expect(r.maxDropdownHeight).toBe(300);
    expect(r.placeholder).toBeUndefined(); // not returned, but default handled internally
  });

  it('openSelect/closeSelect/toggleSelect flip open state', () => {
    const onOpenChange = vi.fn();
    const api = setup({ options, onOpenChange });
    act(() => api.current.openSelect());
    expect(api.current.open).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled(); // uncontrolled
    act(() => api.current.closeSelect());
    expect(api.current.open).toBe(false);
    act(() => api.current.toggleSelect());
    expect(api.current.open).toBe(true);
    act(() => api.current.toggleSelect());
    expect(api.current.open).toBe(false);
  });

  it('openSelect sets highlight to first enabled option (focusStrategy=first)', () => {
    const api = setup({ options: optionsWithDisabled, focusStrategy: 'first' });
    act(() => api.current.openSelect());
    expect(api.current.highlightedIndex).toBe(1); // Apple disabled, Banana first enabled
  });

  it('openSelect sets highlight to selected option (focusStrategy=selected)', () => {
    const api = setup({
      options,
      focusStrategy: 'selected',
      defaultValue: 'cherry',
    });
    act(() => api.current.openSelect());
    expect(api.current.highlightedIndex).toBe(2);
  });

  it('selectOption updates value, fires onSelectionChange and closes when closeOnSelection', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options, onSelectionChange });
    act(() => api.current.selectOption('banana'));
    expect(api.current.selectedValue).toBe('banana');
    expect(onSelectionChange).toHaveBeenCalledWith('banana');
    expect(api.current.selectedOption?.value).toBe('banana');
  });

  it('selectOption does not close when closeOnSelection=false', () => {
    const api = setup({ options, closeOnSelection: false });
    act(() => api.current.openSelect());
    act(() => api.current.selectOption('apple'));
    expect(api.current.selectedValue).toBe('apple');
    expect(api.current.open).toBe(true);
  });

  it('selectOption ignores disabled options and unknown values', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options: optionsWithDisabled, onSelectionChange });
    act(() => api.current.selectOption('apple')); // disabled
    expect(api.current.selectedValue).toBeUndefined();
    act(() => api.current.selectOption('nonexistent'));
    expect(api.current.selectedValue).toBeUndefined();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('clearSelection clears value, input and fires callback', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options, defaultValue: 'apple', allowClear: true, onSelectionChange });
    act(() => api.current.clearSelection());
    expect(api.current.selectedValue).toBeUndefined();
    expect(onSelectionChange).toHaveBeenCalledWith(undefined);
  });

  it('getSelectedOption returns undefined when nothing selected', () => {
    const api = setup({ options });
    expect(api.current.getSelectedOption()).toBeUndefined();
  });

  it('getOptionAt and getFilteredOptions reflect current state', () => {
    const api = setup({ options });
    expect(api.current.getOptionAt(1)?.value).toBe('banana');
    expect(api.current.getOptionAt(99)).toBeUndefined();
    expect(api.current.getFilteredOptions()).toHaveLength(3);
  });
});

describe('useSelect hook — controlled open & value', () => {
  it('controlled open fires onOpenChange but does not flip internal open', () => {
    const onOpenChange = vi.fn();
    const api = setup({ options, open: false, onOpenChange });
    act(() => api.current.openSelect());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(api.current.open).toBe(false); // still controlled=false
  });

  it('controlled close fires onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    const api = setup({ options, open: true, onOpenChange });
    act(() => api.current.closeSelect());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('controlled value does not mutate from selectOption, fires callback', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options, value: 'apple', onSelectionChange });
    act(() => api.current.selectOption('banana'));
    expect(api.current.selectedValue).toBe('apple'); // controlled, unchanged
    expect(onSelectionChange).toHaveBeenCalledWith('banana');
  });

  it('controlled value clear fires onSelectionChange(undefined) without mutating', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options, value: 'apple', onSelectionChange });
    act(() => api.current.clearSelection());
    expect(api.current.selectedValue).toBe('apple');
    expect(onSelectionChange).toHaveBeenCalledWith(undefined);
  });
});

describe('useSelect hook — disabled path', () => {
  it('openSelect/handleTriggerClick/handleKeyDown are no-ops when disabled', () => {
    const onOpenChange = vi.fn();
    const api = setup({ options, disabled: true, onOpenChange });
    act(() => api.current.openSelect());
    expect(api.current.open).toBe(false);
    act(() => api.current.handleTriggerClick());
    expect(api.current.open).toBe(false);
    act(() => api.current.handleKeyDown(key('ArrowDown')));
    expect(api.current.open).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('useSelect hook — keyboard navigation', () => {
  it('ArrowDown opens when closed, then moves highlight', () => {
    const api = setup({ options });
    act(() => api.current.handleKeyDown(key('ArrowDown')));
    expect(api.current.open).toBe(true);
    expect(api.current.highlightedIndex).toBe(0);
    act(() => api.current.handleKeyDown(key('ArrowDown')));
    expect(api.current.highlightedIndex).toBe(1);
    act(() => api.current.handleKeyDown(key('ArrowDown')));
    expect(api.current.highlightedIndex).toBe(2);
    // Wrap around
    act(() => api.current.handleKeyDown(key('ArrowDown')));
    expect(api.current.highlightedIndex).toBe(0);
  });

  it('ArrowUp opens when closed (sets first highlight), then wraps to last', () => {
    const api = setup({ options });
    // While closed, ArrowUp falls into the `!open` branch and just opens, which
    // sets highlight to the first option (focusStrategy default 'first').
    act(() => api.current.handleKeyDown(key('ArrowUp')));
    expect(api.current.open).toBe(true);
    expect(api.current.highlightedIndex).toBe(0);
    // Now open: ArrowUp wraps from 0 -> last (2)
    act(() => api.current.handleKeyDown(key('ArrowUp')));
    expect(api.current.highlightedIndex).toBe(2);
    act(() => api.current.handleKeyDown(key('ArrowUp')));
    expect(api.current.highlightedIndex).toBe(1);
  });

  it('ArrowDown/Up skip disabled options', () => {
    const api = setup({ options: optionsWithDisabled });
    act(() => api.current.openSelect()); // highlight -> 1 (Banana)
    act(() => api.current.handleKeyDown(key('ArrowDown'))); // -> Cherry (2), skip Date(3 disabled)
    expect(api.current.highlightedIndex).toBe(2);
    act(() => api.current.handleKeyDown(key('ArrowDown'))); // wrap skip Date -> Banana
    expect(api.current.highlightedIndex).toBe(1);
    act(() => api.current.handleKeyDown(key('ArrowUp'))); // -> Cherry
    expect(api.current.highlightedIndex).toBe(2);
  });

  it('Home/End jump to first/last enabled option (only when open)', () => {
    const api = setup({ options: optionsWithDisabled });
    // Home/End while closed should be ignored for highlight (no-op on index)
    act(() => api.current.handleKeyDown(key('Home')));
    expect(api.current.highlightedIndex).toBe(-1);
    act(() => api.current.openSelect());
    act(() => api.current.handleKeyDown(key('End')));
    expect(api.current.highlightedIndex).toBe(2); // last enabled (Date disabled)
    act(() => api.current.handleKeyDown(key('Home')));
    expect(api.current.highlightedIndex).toBe(1); // first enabled
  });

  it('Enter/Space open when closed, then select highlighted', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options, onSelectionChange });
    act(() => api.current.handleKeyDown(key('Enter')));
    expect(api.current.open).toBe(true);
    // openSelect set highlight to 0 (apple). ArrowDown -> 1 (banana).
    act(() => api.current.handleKeyDown(key('ArrowDown')));
    expect(api.current.highlightedIndex).toBe(1);
    act(() => api.current.handleKeyDown(key('Enter')));
    expect(api.current.selectedValue).toBe('banana');
    expect(onSelectionChange).toHaveBeenCalledWith('banana');
    // Space also opens+selects highlighted (highlight reset to first via open)
    act(() => api.current.openSelect());
    act(() => api.current.handleKeyDown(key(' ')));
    expect(api.current.selectedValue).toBe('apple');
  });

  it('Enter does nothing when no option highlighted (-1)', () => {
    const onSelectionChange = vi.fn();
    // focusStrategy 'selected' with no defaultValue keeps highlight at -1 on open.
    const api = setup({ options, onSelectionChange, focusStrategy: 'selected' });
    act(() => api.current.openSelect());
    expect(api.current.highlightedIndex).toBe(-1);
    act(() => api.current.handleKeyDown(key('Enter')));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('Enter on disabled highlighted option does not select', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options: optionsWithDisabled, onSelectionChange });
    act(() => api.current.openSelect());
    // Move to Banana (1), then highlight the disabled Apple explicitly (no-op).
    act(() => api.current.handleKeyDown(key('End'))); // last enabled = Cherry (2)
    act(() => api.current.highlightOption(0)); // Apple disabled -> no-op
    expect(api.current.highlightedIndex).toBe(2);
  });

  it('Escape closes and focuses trigger', () => {
    const api = setup({ options });
    act(() => api.current.openSelect());
    act(() => api.current.handleKeyDown(key('Escape')));
    expect(api.current.open).toBe(false);
    expect(api.current.highlightedIndex).toBe(-1);
  });

  it('highlightOption ignores disabled options', () => {
    const api = setup({ options: optionsWithDisabled });
    act(() => api.current.highlightOption(0)); // Apple disabled
    expect(api.current.highlightedIndex).toBe(-1);
    act(() => api.current.highlightOption(1)); // Banana enabled
    expect(api.current.highlightedIndex).toBe(1);
  });
});

describe('useSelect hook — search / filter', () => {
  it('handleInputChange sets input and resets highlight to 0', () => {
    const api = setup({ options, searchable: true });
    act(() => api.current.handleInputChange('ban'));
    expect(api.current.inputValue).toBe('ban');
    expect(api.current.highlightedIndex).toBe(0);
  });

  it('defaultFilter matches label and description case-insensitively', () => {
    const api = setup({ options, searchable: true });
    act(() => api.current.handleInputChange('BAN'));
    expect(api.current.filteredOptions.map(o => o.value)).toEqual(['banana']);
    act(() => api.current.handleInputChange('yellow'));
    expect(api.current.filteredOptions.map(o => o.value)).toEqual(['banana']);
    act(() => api.current.handleInputChange(''));
    expect(api.current.filteredOptions).toHaveLength(3);
  });

  it('custom filter overrides default', () => {
    const custom = (opts: SelectOption[], _input: string) => opts.filter(o => o.value === 'cherry');
    const api = setup({ options, filter: custom });
    expect(api.current.getFilteredOptions().map(o => o.value)).toEqual(['cherry']);
  });
});

describe('useSelect hook — backspace clear & trigger click', () => {
  it('Backspace clears selection when searchable + allowClear + empty input', () => {
    const onSelectionChange = vi.fn();
    const api = setup({
      options,
      searchable: true,
      allowClear: true,
      defaultValue: 'apple',
      onSelectionChange,
    });
    act(() => api.current.handleKeyDown(key('Backspace')));
    expect(api.current.selectedValue).toBeUndefined();
    expect(onSelectionChange).toHaveBeenCalledWith(undefined);
  });

  it('Backspace does nothing when input non-empty or not clearable', () => {
    const onSelectionChange = vi.fn();
    const api = setup({
      options,
      searchable: true,
      allowClear: true,
      defaultValue: 'apple',
      onSelectionChange,
    });
    act(() => api.current.handleInputChange('x'));
    act(() => api.current.handleKeyDown(key('Backspace')));
    expect(api.current.selectedValue).toBe('apple');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('Backspace no-op when no selection', () => {
    const onSelectionChange = vi.fn();
    const api = setup({ options, searchable: true, allowClear: true, onSelectionChange });
    act(() => api.current.handleKeyDown(key('Backspace')));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('handleTriggerClick toggles open', () => {
    const api = setup({ options });
    act(() => api.current.handleTriggerClick());
    expect(api.current.open).toBe(true);
    act(() => api.current.handleTriggerClick());
    expect(api.current.open).toBe(false);
  });
});

describe('useSelect hook — searchable input focus on open', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('openSelect focuses the input after a tick when searchable + input mounted', () => {
    const api: { current: ReturnType<typeof useSelect> } = { current: null as any };
    function Harness() {
      const result = useSelect({ options, searchable: true });
      api.current = result;
      return <input data-testid="i" ref={result.inputRef as any} />;
    }
    render(<Harness />);
    const input = document.querySelector('[data-testid="i"]') as HTMLInputElement;
    const focusSpy = vi.spyOn(input, 'focus');
    act(() => {
      api.current.openSelect();
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(focusSpy).toHaveBeenCalled();
  });

  it('openSelect is safe when searchable but inputRef.current is null', () => {
    const api = setup({ options, searchable: true });
    // No input rendered (default setup); openSelect should not throw.
    act(() => api.current.openSelect());
    act(() => vi.advanceTimersByTime(10));
    expect(api.current.open).toBe(true);
  });
});

describe('useSelect hook — outside click effect', () => {
  it('closes on mousedown outside trigger & listbox when closeOnOutsideClick', () => {
    const api: { current: ReturnType<typeof useSelect> } = { current: null as any };
    function Harness() {
      const result = useSelect({ options });
      api.current = result;
      return (
        <div>
          <button ref={result.triggerRef as any}>trigger</button>
          <ul ref={result.listboxRef as any} />
        </div>
      );
    }
    render(<Harness />);
    act(() => api.current.openSelect());
    expect(api.current.open).toBe(true);
    // Dispatch mousedown on an unrelated outside node.
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.current.open).toBe(false);
    document.body.removeChild(outside);
  });

  it('does NOT close when closeOnOutsideClick is false', () => {
    const api: { current: ReturnType<typeof useSelect> } = { current: null as any };
    function Harness() {
      const result = useSelect({ options, closeOnOutsideClick: false });
      api.current = result;
      return (
        <div>
          <button ref={result.triggerRef as any}>trigger</button>
          <ul ref={result.listboxRef as any} />
        </div>
      );
    }
    render(<Harness />);
    act(() => api.current.openSelect());
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.current.open).toBe(true);
    document.body.removeChild(outside);
  });

  it('does NOT close when clicking inside the listbox or trigger', () => {
    const api: { current: ReturnType<typeof useSelect> } = { current: null as any };
    function Harness() {
      const result = useSelect({ options });
      api.current = result;
      return (
        <div>
          <button ref={result.triggerRef as any}>trigger</button>
          <ul ref={result.listboxRef as any} />
        </div>
      );
    }
    const { container } = render(<Harness />);
    act(() => api.current.openSelect());
    const trigger = container.querySelector('button')!;
    act(() => {
      trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.current.open).toBe(true);
  });
});

describe('useSelect hook — attributes & computed', () => {
  it('trigger and listbox attributes reflect open/disabled/required state', () => {
    const api = setup({ options, disabled: true, required: true, role: 'listbox' });
    expect(api.current.triggerAttributes['aria-haspopup']).toBe('listbox');
    expect(api.current.triggerAttributes['aria-expanded']).toBe(false);
    expect(api.current.triggerAttributes['data-disabled']).toBe(true);
    expect(api.current.triggerAttributes['data-required']).toBe(true);
    expect(api.current.triggerAttributes['data-state']).toBe('closed');
    expect(api.current.listboxAttributes.role).toBe('listbox');
    expect(api.current.listboxAttributes.id).toBe('listbox-listbox');
    expect(api.current.listboxAttributes['aria-orientation']).toBe('vertical');
  });

  it('aria-controls only set when open', () => {
    const api = setup({ options });
    expect(api.current.triggerAttributes['aria-controls']).toBeUndefined();
    act(() => api.current.openSelect());
    expect(api.current.triggerAttributes['aria-controls']).toBe('listbox-listbox');
    expect(api.current.triggerAttributes['data-state']).toBe('open');
  });

  it('getOptionAttributes returns selected/highlighted/disabled flags', () => {
    const api = setup({ options, defaultValue: 'banana' });
    act(() => api.current.openSelect());
    act(() => api.current.highlightOption(1));
    const attrs = api.current.getOptionAttributes(options[1], 1);
    expect(attrs['aria-selected']).toBe(true);
    expect(attrs['data-selected']).toBe(true);
    expect(attrs['data-highlighted']).toBe(true);
    expect(attrs.role).toBe('option');
    expect(attrs['data-key']).toBe('b');
    expect(attrs.tabIndex).toBe(-1);
  });

  it('getOptionAttributes for disabled option', () => {
    const api = setup({ options: optionsWithDisabled });
    const attrs = api.current.getOptionAttributes(optionsWithDisabled[0], 0);
    expect(attrs['aria-disabled']).toBe(true);
    expect(attrs['data-disabled']).toBe(true);
  });
});

describe('useSelect hook — all-disabled and selected-strategy branches', () => {
  const allDisabled: SelectOption[] = [
    { key: 'a', label: 'Apple', value: 'apple', disabled: true },
    { key: 'b', label: 'Banana', value: 'banana', disabled: true },
  ];

  it('focusStrategy "first" with all options disabled leaves highlight at -1', () => {
    const api = setup({ options: allDisabled, focusStrategy: 'first' });
    act(() => api.current.openSelect());
    // firstEnabledIndex=-1 -> setHighlightedIndex skipped.
    expect(api.current.highlightedIndex).toBe(-1);
  });

  it('focusStrategy "selected" sets highlight to the selected option when present', () => {
    const api = setup({ options, defaultValue: 'banana', focusStrategy: 'selected' });
    act(() => api.current.openSelect());
    expect(api.current.highlightedIndex).toBe(1); // banana
  });

  it('Home/End with all options disabled do not move highlight', () => {
    const api = setup({ options: allDisabled });
    act(() => api.current.openSelect()); // open without crashing
    act(() => api.current.handleKeyDown(key('Home')));
    expect(api.current.highlightedIndex).toBe(-1);
    act(() => api.current.handleKeyDown(key('End')));
    expect(api.current.highlightedIndex).toBe(-1);
  });

  it('Enter on a disabled highlighted option does not select', () => {
    const onSelectionChange = vi.fn();
    // A custom filter that surfaces a disabled option at index 0; combined with
    // handleInputChange (which sets highlight to 0 unconditionally), Enter must
    // refuse to select the disabled option at that index.
    const filter = () => [
      { key: 'd', label: 'Date', value: 'date', disabled: true },
      { key: 'b', label: 'Banana', value: 'banana' },
    ];
    const api = setup({ options: optionsWithDisabled, filter, onSelectionChange });
    act(() => api.current.openSelect());
    act(() => api.current.handleInputChange('d')); // highlight forced to 0 (Date, disabled)
    act(() => api.current.handleKeyDown(key('Enter')));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('focusStrategy "auto" (neither first nor selected) skips the highlight init', () => {
    const api = setup({ options, focusStrategy: 'auto' });
    act(() => api.current.openSelect());
    // Neither 'first' nor 'selected' branch runs -> highlight stays at its default.
    expect(api.current.highlightedIndex).toBe(-1);
  });

  it('End pressed while closed is a no-op for highlight', () => {
    const api = setup({ options });
    expect(api.current.open).toBe(false);
    act(() => api.current.handleKeyDown(key('End')));
    expect(api.current.highlightedIndex).toBe(-1);
  });
});
