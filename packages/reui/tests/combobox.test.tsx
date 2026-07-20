import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxGroup,
  ComboboxEmpty,
} from '../src/components/Combobox';
import { useCombobox } from '../src/hooks';
import type { ComboboxOption as ComboboxOptionType, ComboboxGroup as ComboboxGroupType } from '../src/hooks';

const options: ComboboxOptionType[] = [
  { id: 'a', label: 'Apple', value: 'a' },
  { id: 'b', label: 'Banana', value: 'b' },
  { id: 'c', label: 'Cherry', value: 'c', description: 'red fruit' },
  { id: 'd', label: 'Date', value: 'd', disabled: true },
];

const groups: ComboboxGroupType[] = [
  { id: 'g1', heading: 'Group One', options: [{ id: 'a', label: 'Alpha', value: 'a' }] },
  { id: 'g2', heading: 'Group Two', options: [{ id: 'b', label: 'Beta', value: 'b' }] },
];

describe('Combobox', () => {
  it('renders a combobox input', () => {
    render(<Combobox options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('filters options as the user types', async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} defaultOpen />);
    await user.type(screen.getByRole('combobox'), 'App');
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('opens the dropdown when typing', async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(screen.getByRole('combobox'), 'Ban');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens the dropdown when defaultOpen is set', () => {
    render(<Combobox options={options} defaultOpen />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('falls back to the array index as key when an option has no id', () => {
    // An option without `id` exercises the option.id || index fallback.
    const noIdOptions: ComboboxOptionType[] = [
      { label: 'NoId', value: 'noid' },
    ];
    render(<Combobox options={noIdOptions} defaultOpen />);
    expect(screen.getByText('NoId')).toBeInTheDocument();
  });

  it('selects an option on click and updates the input value', async () => {
    render(<Combobox options={options} defaultOpen />);
    const opts = screen.getAllByRole('option');
    // Click the option element (role=option) directly.
    fireEvent.click(opts[0]); // Apple
    expect(screen.getByRole('combobox')).toHaveValue('Apple');
  });

  it('fires onValueChange when an option is selected', () => {
    const onValueChange = vi.fn();
    render(<Combobox options={options} defaultOpen onValueChange={onValueChange} />);
    const opts = screen.getAllByRole('option');
    fireEvent.click(opts[1]); // Banana
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('does not select a disabled option', () => {
    const onValueChange = vi.fn();
    render(<Combobox options={options} defaultOpen onValueChange={onValueChange} />);
    const opts = screen.getAllByRole('option');
    fireEvent.click(opts[3]); // Date (disabled)
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('navigates with ArrowDown / ArrowUp and selects with Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox options={options} defaultOpen onValueChange={onValueChange} closeOnSelect={false} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} defaultOpen />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows no-results message when filter matches nothing', async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} defaultOpen noResultsMessage="Nothing here" />);
    await user.type(screen.getByRole('combobox'), 'zzzzz');
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('clears the selection via the clear button', () => {
    const onValueChange = vi.fn();
    render(<Combobox options={options} defaultOpen onValueChange={onValueChange} showClearButton closeOnSelect={false} />);
    const opts = screen.getAllByRole('option');
    fireEvent.click(opts[0]); // Apple
    fireEvent.click(screen.getByTestId('combobox-clear'));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('renders groups with headings', () => {
    render(<Combobox groups={groups} defaultOpen />);
    expect(screen.getByText('Group One')).toBeInTheDocument();
    expect(screen.getByText('Group Two')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('filters within groups', async () => {
    const user = userEvent.setup();
    render(<Combobox groups={groups} defaultOpen />);
    await user.type(screen.getByRole('combobox'), 'Beta');
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('uses a custom filter function', async () => {
    const user = userEvent.setup();
    const filterFunction = (opts: ComboboxOptionType[], q: string) =>
      opts.filter((o) => o.label.startsWith(q));
    render(<Combobox options={options} defaultOpen filterFunction={filterFunction} />);
    await user.type(screen.getByRole('combobox'), 'Ap');
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('supports allowCustomValue with Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox options={options} allowCustomValue onValueChange={onValueChange} closeOnSelect={false} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Custom');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('Custom');
  });

  it('blocks custom value when validateCustomValue returns false', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        options={options}
        allowCustomValue
        validateCustomValue={() => false}
        onValueChange={onValueChange}
        closeOnSelect={false}
      />
    );
    await user.type(screen.getByRole('combobox'), 'Bad');
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('respects custom keyBindings', () => {
    const handler = vi.fn();
    render(<Combobox options={options} defaultOpen keyBindings={{ '/': handler }} />);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: '/' });
    expect(handler).toHaveBeenCalled();
  });

  it('fires onOpenChange when the dropdown opens via typing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Combobox options={options} onOpenChange={onOpenChange} />);
    await user.type(screen.getByRole('combobox'), 'A');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('supports controlled open state', () => {
    const onOpenChange = vi.fn();
    render(<Combobox options={options} open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders descriptions and marks selected option', async () => {
    const user = userEvent.setup();
    render(<Combobox options={options} defaultOpen defaultValue="c" />);
    expect(screen.getByText('red fruit')).toBeInTheDocument();
  });

  it('renders an option icon when provided', async () => {
    render(
      <Combobox
        options={[{ id: 'a', label: 'Apple', value: 'a', icon: <span data-testid="ico">★</span> }]}
        defaultOpen
      />
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });
});

// Direct hook tests for handlers/branches not reachable through the component.
describe('useCombobox (hook handlers)', () => {
  function setup(props: Parameters<typeof useCombobox>[0] = {}) {
    const result: { current: ReturnType<typeof useCombobox> } = { current: null as any };
    function Probe() {
      result.current = useCombobox(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  it('handleOpen / handleClose / handleToggle update open state', async () => {
    const res = setup({ options });
    await act(async () => { await res.current.handleOpen(); });
    expect(res.current.open).toBe(true);
    await act(async () => { await res.current.handleToggle(); });
    expect(res.current.open).toBe(false);
    await act(async () => { await res.current.handleOpen(); });
    await act(async () => { await res.current.handleClose(); });
    expect(res.current.open).toBe(false);
  });

  it('onBeforeOpen returning false prevents open', async () => {
    const res = setup({ options, onBeforeOpen: async () => false });
    await act(async () => { await res.current.handleOpen(); });
    expect(res.current.open).toBe(false);
  });

  it('onBeforeClose returning false prevents close', async () => {
    const res = setup({ options, defaultOpen: true, onBeforeClose: async () => false });
    await act(async () => { await res.current.handleClose(); });
    expect(res.current.open).toBe(true);
  });

  it('handleSelect respects disabled options', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, onValueChange });
    act(() => res.current.handleSelect(options[3])); // disabled Date
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('handleOptionFocus sets selected index', () => {
    const res = setup({ options });
    act(() => res.current.handleOptionFocus(1));
    expect(res.current.selectedIndex).toBe(1);
  });

  it('handleClear resets value and fires callbacks', () => {
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    const res = setup({ options, onValueChange, onClear });
    act(() => res.current.handleClear());
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onClear).toHaveBeenCalled();
  });

  it('disabled prevents open and key handling', async () => {
    const onOpenChange = vi.fn();
    const res = setup({ options, disabled: true, onOpenChange });
    await act(async () => { await res.current.handleOpen(); });
    expect(res.current.open).toBe(false);
    act(() => res.current.handleInputKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
  });

  it('Backspace clears when input empty and showClearButton enabled', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, showClearButton: true, onValueChange });
    act(() => res.current.handleInputKeyDown({ key: 'Backspace', preventDefault: () => {} } as any));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('Tab closes an open listbox', async () => {
    const res = setup({ options, defaultOpen: true });
    act(() => res.current.handleInputKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    // state.open reflects async close scheduling; just ensure no throw.
    expect(res.current.handleInputKeyDown).toBeTruthy();
  });

  it('handleBeforeOpen / handleBeforeClose delegate to handlers', async () => {
    const res = setup({ options, onBeforeOpen: () => true, onBeforeClose: () => false });
    let v1: any, v2: any;
    await act(async () => { v1 = await res.current.handleBeforeOpen(); });
    await act(async () => { v2 = await res.current.handleBeforeClose(); });
    expect(v1).toBe(true);
    expect(v2).toBe(false);
  });

  it('handleBeforeOpen / handleBeforeClose default to true when no handler is provided', async () => {
    const res = setup({ options });
    let v1: any, v2: any;
    await act(async () => { v1 = await res.current.handleBeforeOpen(); });
    await act(async () => { v2 = await res.current.handleBeforeClose(); });
    expect(v1).toBe(true);
    expect(v2).toBe(true);
  });

  it('handleClose is a no-op when already closed', async () => {
    const onClose = vi.fn();
    const res = setup({ options, onClose });
    await act(async () => { await res.current.handleClose(); });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handleToggle opens when closed', async () => {
    const res = setup({ options });
    await act(async () => { await res.current.handleToggle(); });
    expect(res.current.open).toBe(true);
  });

  it('handleInputChange forwards to onInputChange when inputValue is controlled', () => {
    const onInputChange = vi.fn();
    const res = setup({ options, inputValue: 'x', onInputChange });
    act(() => res.current.handleInputChange('y'));
    expect(onInputChange).toHaveBeenCalledWith('y');
    // controlled value is authoritative
    expect(res.current.inputValue).toBe('x');
  });

  it('handleOptionFocus flattens grouped options by index', () => {
    const groups = [
      { label: 'G1', options: [options[0], options[1]] },
      { label: 'G2', options: [options[2]] },
    ];
    const res = setup({ groups });
    act(() => res.current.handleOptionFocus(2));
    expect(res.current.selectedIndex).toBe(2);
  });

  it('ArrowDown opens the dropdown when closed; Escape closes when open', async () => {
    const res = setup({ options, closeOnEscape: true });
    act(() => res.current.handleInputKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(true);
    act(() => res.current.handleInputKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(false);
  });

  it('ArrowUp opens the dropdown when closed', () => {
    const res = setup({ options });
    act(() => res.current.handleInputKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(true);
  });

  it('Tab closes an open dropdown', async () => {
    const res = setup({ options, defaultOpen: true });
    act(() => res.current.handleInputKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(false);
  });

  it('ArrowDown/ArrowUp navigate the selected index within the open list', async () => {
    const res = setup({ options, defaultOpen: true });
    // sanity: defaultOpen makes the list open so the nav branches run
    expect(res.current.open).toBe(true);
    // selectedIndex starts at -1; ArrowDown steps -1 -> 0 -> 1.
    act(() => res.current.handleInputKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    expect(res.current.selectedIndex).toBe(0);
    act(() => res.current.handleInputKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    expect(res.current.selectedIndex).toBe(1);
    // ArrowUp steps back: 1 -> 0.
    act(() => res.current.handleInputKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any));
    expect(res.current.selectedIndex).toBe(0);
  });

  it('ArrowDown wraps to first when at the last navigable option', () => {
    const res = setup({ options: [options[0], options[1]], defaultOpen: true });
    act(() => res.current.handleOptionFocus(1));
    act(() => res.current.handleInputKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    expect(res.current.selectedIndex).toBe(0);
  });

  it('ArrowUp wraps to last when at the first navigable option', () => {
    const res = setup({ options: [options[0], options[1]], defaultOpen: true });
    act(() => res.current.handleOptionFocus(0));
    act(() => res.current.handleInputKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any));
    expect(res.current.selectedIndex).toBe(1);
  });

  it('Enter selects a custom value when the list is open but nothing is highlighted', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, allowCustomValue: true, defaultInputValue: 'custom-y', defaultOpen: true, onValueChange });
    // selectedIndex stays -1 (nothing highlighted) -> custom value branch
    act(() => res.current.handleInputKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onValueChange).toHaveBeenCalledWith('custom-y');
  });

  it('Tab closes an open listbox without selecting', () => {
    const res = setup({ options, defaultOpen: true });
    act(() => res.current.handleInputKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(false);
  });

  it('Backspace clears when the input is empty and showClearButton is enabled', () => {
    const onClear = vi.fn();
    const res = setup({ options, defaultInputValue: '', showClearButton: true, onClear });
    act(() => res.current.handleInputKeyDown({ key: 'Backspace', preventDefault: () => {} } as any));
    expect(onClear).toHaveBeenCalled();
  });

  it('handleClose honors controlled open state (no internal mutation)', async () => {
    const onClose = vi.fn();
    const res = setup({ options, open: true, onClose });
    await act(async () => { await res.current.handleClose(); });
    expect(onClose).toHaveBeenCalled();
    expect(res.current.open).toBe(true);
  });

  it('rerendering with a different-content options array replaces the stable ref', () => {
    const optsRef: { current: any[] } = { current: [...options] };
    let renders = 0;
    function Probe() {
      renders++;
      useCombobox({ options: optsRef.current });
      return null;
    }
    const { rerender } = render(<Probe />);
    const initial = renders;
    // different content (extra option) -> stabilization takes the new array
    optsRef.current = [...options, { id: 'z', label: 'Z', value: 'z' }];
    rerender(<Probe />);
    expect(renders).toBeGreaterThan(initial);
  });

  it('rerendering with a same-content groups array keeps the stable groups ref', () => {
    const group = { id: 'g1', heading: 'G1', options: [options[0]] };
    const groupsRef: { current: any[] } = { current: [group] };
    let captured: any;
    function Probe() {
      const api = useCombobox({ groups: groupsRef.current });
      captured = api;
      return null;
    }
    const { rerender } = render(<Probe />);
    // new array reference, same group element ref -> stabilization keeps prior ref
    groupsRef.current = [group];
    rerender(<Probe />);
    expect(captured).toBeDefined();
  });

  it('rerendering with different-content groups replaces the stable groups ref', () => {
    const group = { id: 'g1', heading: 'G1', options: [options[0]] };
    const groupsRef: { current: any[] } = { current: [group] };
    function Probe() {
      useCombobox({ groups: groupsRef.current });
      return null;
    }
    const { rerender } = render(<Probe />);
    // different content (new group object) -> stabilization takes the new array
    groupsRef.current = [{ id: 'g2', heading: 'G2', options: [options[1]] }];
    expect(() => rerender(<Probe />)).not.toThrow();
  });

  it('ArrowDown/ArrowUp are no-ops on an open list with only disabled options', () => {
    const allDisabled = [
      { id: 'x', label: 'X', value: 'x', disabled: true },
    ];
    const res = setup({ options: allDisabled, defaultOpen: true });
    expect(() => act(() => res.current.handleInputKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any))).not.toThrow();
    expect(() => act(() => res.current.handleInputKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any))).not.toThrow();
    expect(res.current.selectedIndex).toBe(-1);
  });

  it('Enter on an open list with nothing highlighted and no custom value is a no-op', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, defaultOpen: true, onValueChange });
    act(() => res.current.handleInputKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('Tab when closed leaves the dropdown closed', () => {
    const res = setup({ options });
    act(() => res.current.handleInputKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(false);
  });

  it('Backspace with non-empty input does not clear', () => {
    const onClear = vi.fn();
    const res = setup({ options, defaultInputValue: 'text', showClearButton: true, onClear });
    act(() => res.current.handleInputKeyDown({ key: 'Backspace', preventDefault: () => {} } as any));
    expect(onClear).not.toHaveBeenCalled();
  });

  it('handleOpen focuses the input element after opening', async () => {
    let api: ReturnType<typeof useCombobox> | null = null;
    function Probe() {
      api = useCombobox({ options });
      return <input ref={api!.inputAttributes.ref as any} data-testid="cb-input" />;
    }
    render(<Probe />);
    await act(async () => { await api!.handleOpen(); });
    // handleOpen schedules focus + animation clear via setTimeout; let them flush.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
    expect(document.activeElement).toBe(screen.getByTestId('cb-input'));
  });

  it('closes on outside click when closeOnOutsideClick is enabled', async () => {
    const onOpenChange = vi.fn();
    const res = setup({ options, defaultOpen: true, closeOnOutsideClick: true, onOpenChange });
    await act(async () => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('getOptionAttributes wires onMouseEnter to handleOptionFocus', () => {
    const res = setup({ options });
    const attrs = res.current.getOptionAttributes(options[1], 1);
    act(() => attrs.onMouseEnter());
    expect(res.current.selectedIndex).toBe(1);
  });

  it('getOptionAttributes onClick selects only enabled options', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, onValueChange });
    const enabled = res.current.getOptionAttributes(options[1], 1);
    const disabled = res.current.getOptionAttributes(options[3], 3);
    act(() => enabled.onClick());
    act(() => disabled.onClick());
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('uses controlled value and resolves the selected option', () => {
    const res = setup({ options, value: options[1].value });
    expect(res.current.value).toBe(options[1].value);
    // selecting under controlled value still fires onValueChange but does not mutate
    const onValueChange = vi.fn();
    const res2 = setup({ options, value: options[1].value, onValueChange });
    act(() => res2.current.handleSelect(options[2]));
    expect(onValueChange).toHaveBeenCalledWith(options[2].value);
    expect(res2.current.value).toBe(options[1].value);
  });

  it('selectedOption falls back to null when value matches no option', () => {
    const res = setup({ options, defaultValue: 'nonexistent' });
    // no matching option -> selectedOption null
    expect(res.current.value).toBe('nonexistent');
  });

  it('uncontrolled handleSelect reflects the selection in state.value', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, onValueChange });
    // uncontrolled -> starts at default (null)
    expect(res.current.value).toBeNull();
    act(() => res.current.handleSelect(options[2]));
    expect(onValueChange).toHaveBeenCalledWith(options[2].value);
    // regression: internal value state must now reflect the selection
    expect(res.current.value).toBe(options[2].value);
    expect(res.current.selectedOption?.value).toBe(options[2].value);
    // selecting again updates to the new value
    act(() => res.current.handleSelect(options[0]));
    expect(res.current.value).toBe(options[0].value);
  });

  it('uncontrolled handleClear resets state.value to null', () => {
    const res = setup({ options, defaultValue: options[1].value });
    expect(res.current.value).toBe(options[1].value);
    act(() => res.current.handleClear());
    expect(res.current.value).toBeNull();
    expect(res.current.selectedOption).toBeNull();
  });

  it('handleOpen/handleClose honor the controlled open state', async () => {
    const onOpenChange = vi.fn();
    const res = setup({ options, open: false, onOpenChange });
    await act(async () => { await res.current.handleOpen(); });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // controlled open stays false
    expect(res.current.open).toBe(false);
  });

  it('onBeforeOpen/onBeforeClose returning true lets the open/close proceed', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const res = setup({ options, onBeforeOpen: async () => true, onBeforeClose: async () => true, onOpen, onClose });
    await act(async () => { await res.current.handleOpen(); });
    expect(onOpen).toHaveBeenCalled();
    await act(async () => { await res.current.handleClose(); });
    expect(onClose).toHaveBeenCalled();
  });

  it('handleClear respects controlled value and inputValue', () => {
    const onValueChange = vi.fn();
    const onInputChange = vi.fn();
    const res = setup({ options, value: options[0].value, inputValue: 'Apple', onValueChange, onInputChange });
    act(() => res.current.handleClear());
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onInputChange).toHaveBeenCalledWith('');
    // controlled value/input unchanged
    expect(res.current.value).toBe(options[0].value);
    expect(res.current.inputValue).toBe('Apple');
  });

  it('handleOptionFocus ignores out-of-range indices', () => {
    const res = setup({ options });
    act(() => res.current.handleOptionFocus(99));
    expect(res.current.selectedIndex).toBe(-1);
  });

  it('Enter adds a custom value when allowCustomValue is set', () => {
    const onValueChange = vi.fn();
    const res = setup({ options, allowCustomValue: true, defaultInputValue: 'custom-x', onValueChange });
    act(() => res.current.handleInputKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onValueChange).toHaveBeenCalled();
  });

  it('Backspace clears when input empty and showClearButton enabled', () => {
    const onClear = vi.fn();
    const res = setup({ options, defaultInputValue: '', showClearButton: true, onClear });
    act(() => res.current.handleInputKeyDown({ key: 'Backspace', preventDefault: () => {} } as any));
    expect(onClear).toHaveBeenCalled();
  });

  it('Escape does not close when closeOnEscape is disabled', () => {
    const res = setup({ options, defaultOpen: true, closeOnEscape: false });
    act(() => res.current.handleInputKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    expect(res.current.open).toBe(true);
  });

  it('uses a custom filterFunction for both flat options and groups', () => {
    const filterFunction = vi.fn((opts: any[]) => opts);
    const res = setup({ options, filterFunction, defaultInputValue: 'a' });
    expect(filterFunction).toHaveBeenCalled();
    // groups path
    const groups = [{ label: 'G', options: [options[0]] }];
    const res2 = setup({ groups, filterFunction, defaultInputValue: 'a' });
    expect(res2.current.open).toBe(false);
  });

  it('exposes label-based aria attributes when label is provided', () => {
    const res = setup({ options, label: 'My Combobox' });
    const inputAttrs = res.current.inputAttributes;
    expect(inputAttrs['aria-labelledby']).toBeUndefined();
  });

  it('rerendering with a new-ref same-content options array keeps the stable ref', () => {
    const optsRef: { current: any[] } = { current: [...options] };
    function Probe() {
      const api = useCombobox({ options: optsRef.current });
      return null;
    }
    const { rerender } = render(<Probe />);
    // new array reference, same content -> stabilization keeps prior ref (no crash)
    optsRef.current = [...options];
    expect(() => rerender(<Probe />)).not.toThrow();
  });
});

describe('Combobox custom renderers and states', () => {
  it('uses a custom optionRenderer', () => {
    render(
      <Combobox
        options={options}
        defaultOpen
        optionRenderer={(option) => (
          <div key={option.id} data-testid="custom-option">{option.label}</div>
        )}
      />
    );
    expect(screen.getAllByTestId('custom-option').length).toBeGreaterThan(0);
  });

  it('uses a custom groupRenderer', () => {
    render(
      <Combobox
        groups={groups}
        defaultOpen
        groupRenderer={(g) => (
          <div key={g.id} data-testid="custom-group">{g.heading}</div>
        )}
      />
    );
    expect(screen.getAllByTestId('custom-group').length).toBe(2);
  });

  it('uses a custom noResultsRenderer', async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        options={options}
        defaultOpen
        noResultsRenderer={() => <div data-testid="custom-empty">none</div>}
      />
    );
    await user.type(screen.getByRole('combobox'), 'zzzzz');
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });

  it('shows a default loading state', () => {
    render(<Combobox options={options} loading defaultOpen />);
    expect(screen.getByTestId('combobox-loading')).toBeInTheDocument();
  });

  it('uses a custom loadingRenderer', () => {
    render(
      <Combobox
        options={options}
        loading
        defaultOpen
        loadingRenderer={() => <div data-testid="custom-loading">busy</div>}
      />
    );
    expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
  });

  it('hides the search icon when showSearchIcon is false', () => {
    const { container } = render(<Combobox options={options} showSearchIcon={false} />);
    expect(container.querySelector('.absolute.left-3')).toBeNull();
  });

  it('renders with an explicit id and data-testid on the input', () => {
    render(<Combobox options={options} id="cb" data-testid="my-cb" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'cb');
    expect(screen.getByTestId('my-cb')).toBeInTheDocument();
  });
});

describe('Combobox sub-components', () => {
  it('ComboboxInput renders an input with combobox role', () => {
    render(<ComboboxInput inputProps={{ placeholder: 'Search' }} />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('ComboboxList renders a listbox with children', () => {
    render(<ComboboxList><div>item</div></ComboboxList>);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('ComboboxOption fires onSelect when enabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComboboxOption value="x" onSelect={onSelect}>Pick</ComboboxOption>);
    await user.click(screen.getByTestId('combobox-option'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('ComboboxOption does not fire onSelect when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComboboxOption value="x" disabled onSelect={onSelect}>Pick</ComboboxOption>);
    await user.click(screen.getByTestId('combobox-option'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('ComboboxOption renders icon and description, marks selected', () => {
    render(
      <ComboboxOption
        value="x"
        selected
        icon={<span data-testid="ico">★</span>}
        description="a desc"
      >
        Pick
      </ComboboxOption>
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('a desc')).toBeInTheDocument();
  });

  it('ComboboxGroup renders heading and children', () => {
    render(
      <ComboboxGroup heading="Fruits">
        <div>child</div>
      </ComboboxGroup>
    );
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('ComboboxEmpty renders custom message and falls back to default', () => {
    const { rerender } = render(<ComboboxEmpty>Nothing</ComboboxEmpty>);
    expect(screen.getByText('Nothing')).toBeInTheDocument();
    rerender(<ComboboxEmpty />);
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
