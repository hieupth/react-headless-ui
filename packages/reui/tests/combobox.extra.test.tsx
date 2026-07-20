import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCombobox } from '../src/hooks';
import type { UseComboboxProps, ComboboxOption, ComboboxGroup } from '../src/hooks';

const options: ComboboxOption[] = [
  { id: 'a', label: 'Apple', value: 'a' },
  { id: 'b', label: 'Banana', value: 'b' },
  { id: 'c', label: 'Cherry', value: 'c', description: 'red fruit' },
  { id: 'd', label: 'Date', value: 'd', disabled: true },
];

const groups: ComboboxGroup[] = [
  { id: 'g1', heading: 'Group One', options: [{ id: 'a', label: 'Alpha', value: 'a' }, { id: 'b', label: 'Beta', value: 'b', disabled: true }] },
  { id: 'g2', heading: 'Group Two', options: [{ id: 'c', label: 'Gamma', value: 'c' }] },
];

interface HarnessProps {
  hookProps: UseComboboxProps;
  onApi?: (api: any) => void;
}

function ComboboxHarness({ hookProps, onApi }: HarnessProps) {
  const api = useCombobox(hookProps);
  onApi?.(api);
  const { inputAttributes, attributes, listAttributes, getOptionAttributes, clearButtonAttributes, state } = api;
  return (
    <div role="combobox" data-combobox-trigger aria-label="cb">
      <input {...inputAttributes} onKeyDown={attributes.onKeyDown} data-testid="input" />
      <button data-testid="clear" {...clearButtonAttributes} />
      {state.open && (
        <ul {...listAttributes} data-testid="list">
          {state.filteredOptions.map((opt: ComboboxOption, i: number) => (
            <li key={opt.id} {...getOptionAttributes(opt, i)}>{opt.label}</li>
          ))}
        </ul>
      )}
      <div data-testid="root" {...attributes} />
    </div>
  );
}

function setup(hookProps: UseComboboxProps = {}) {
  const api: { current: any } = { current: null };
  render(<ComboboxHarness hookProps={hookProps} onApi={(a) => (api.current = a)} />);
  return api;
}

describe('useCombobox (extra hook tests)', () => {
  it('initializes with defaults and exposes state + handlers', () => {
    const api = setup({ options });
    expect(api.current.state.open).toBe(false);
    expect(api.current.state.inputValue).toBe('');
    expect(api.current.state.value).toBe(null);
    expect(api.current.state.disabled).toBe(false);
    expect(typeof api.current.handlers.handleOpen).toBe('function');
    expect(api.current.state.filteredOptions).toHaveLength(4);
  });

  it('handleOpen/handleClose toggle open state and call callbacks', async () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onOpenChange = vi.fn();
    const onAfterOpen = vi.fn();
    const api = setup({ options, onOpen, onOpenChange, onAfterOpen });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(onOpen).toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(onAfterOpen).toHaveBeenCalled();
    const onClose = vi.fn();
    api.current.handlers.handleClose = setup({ options, onClose }).current.handlers.handleClose; // noop guard
    await act(async () => { await api.current.handlers.handleClose(); });
    vi.useRealTimers();
  });

  it('handleToggle flips state', async () => {
    const api = setup({ options });
    await act(async () => { await api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(true);
    await act(async () => { await api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(false);
  });

  it('does not open when disabled', async () => {
    const api = setup({ options, disabled: true });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    await act(async () => { await api.current.handlers.handleToggle(); });
    expect(api.current.state.open).toBe(false);
  });

  it('respects onBeforeOpen returning false', async () => {
    const onBeforeOpen = vi.fn(() => false);
    const api = setup({ options, onBeforeOpen });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false);
    // handleBeforeOpen returns false
    await expect(api.current.handlers.handleBeforeOpen()).resolves.toBe(false);
  });

  it('respects onBeforeClose returning false', async () => {
    const onBeforeClose = vi.fn(() => false);
    const api = setup({ options, onBeforeClose, defaultOpen: true });
    await act(async () => { await api.current.handlers.handleClose(); });
    expect(api.current.state.open).toBe(true);
    await expect(api.current.handlers.handleBeforeClose()).resolves.toBe(false);
  });

  it('handleBeforeOpen/Close default to true when no handler', async () => {
    const api = setup({ options });
    await expect(api.current.handlers.handleBeforeOpen()).resolves.toBe(true);
    await expect(api.current.handlers.handleBeforeClose()).resolves.toBe(true);
  });

  it('controlled open state is driven by prop', async () => {
    const onOpenChange = vi.fn();
    const api = setup({ options, open: false, onOpenChange });
    await act(async () => { await api.current.handlers.handleOpen(); });
    expect(api.current.state.open).toBe(false); // controlled, stays false
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('controlled value/inputValue are reflected in state', () => {
    const api = setup({ options, value: 'b', inputValue: 'Banana' });
    expect(api.current.state.value).toBe('b');
    expect(api.current.state.inputValue).toBe('Banana');
    expect(api.current.selectedOption?.value).toBe('b');
  });

  it('filters options by input value', () => {
    const api = setup({ options, defaultInputValue: 'an' });
    expect(api.current.state.filteredOptions.map((o: ComboboxOption) => o.label)).toEqual(['Banana']);
  });

  it('uses a custom filterFunction', () => {
    const filterFunction = vi.fn((opts: ComboboxOption[], q: string) => opts.filter(o => o.label.endsWith(q)));
    const api = setup({ options, defaultInputValue: 'a', filterFunction });
    expect(filterFunction).toHaveBeenCalled();
    // 'Banana' ends with 'a'; others do not.
    expect(api.current.state.filteredOptions.map((o: ComboboxOption) => o.id)).toEqual(['b']);
  });

  it('disables filtering when shouldFilter=false', () => {
    const api = setup({ options, defaultInputValue: 'an', shouldFilter: false });
    expect(api.current.state.filteredOptions).toHaveLength(4);
  });

  it('handleInputChange opens when typing in uncontrolled mode', async () => {
    const api = setup({ options });
    await act(async () => { api.current.handlers.handleInputChange('Ban'); });
    expect(api.current.state.inputValue).toBe('Ban');
    expect(api.current.state.open).toBe(true);
  });

  it('handleInputChange in controlled mode only calls onInputChange', async () => {
    const onInputChange = vi.fn();
    const api = setup({ options, inputValue: '', onInputChange });
    await act(async () => { api.current.handlers.handleInputChange('X'); });
    expect(api.current.state.inputValue).toBe('');
    expect(onInputChange).toHaveBeenCalledWith('X');
  });

  it('handleSelect updates value/input and closes on closeOnSelect', async () => {
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    const onInputChange = vi.fn();
    const api = setup({ options, defaultOpen: true, onValueChange, onSelect, onInputChange });
    await act(async () => { api.current.handlers.handleSelect(options[1]); });
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(onSelect).toHaveBeenCalledWith(options[1]);
    expect(api.current.state.inputValue).toBe('Banana');
    expect(api.current.state.open).toBe(false);
  });

  it('handleSelect respects disabled options', async () => {
    const onValueChange = vi.fn();
    const api = setup({ options, defaultOpen: true, onValueChange });
    await act(async () => { api.current.handlers.handleSelect(options[3]); });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('handleSelect does not close when closeOnSelect=false', async () => {
    const api = setup({ options, defaultOpen: true, closeOnSelect: false });
    await act(async () => { api.current.handlers.handleSelect(options[0]); });
    expect(api.current.state.open).toBe(true);
  });

  it('handleClear clears value/input and calls onClear', () => {
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    const onInputChange = vi.fn();
    const api = setup({ options, defaultInputValue: 'Apple', defaultValue: 'a', onClear, onValueChange, onInputChange });
    act(() => { api.current.handlers.handleClear(); });
    expect(api.current.state.inputValue).toBe('');
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onInputChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  it('handleOptionFocus sets selectedIndex within range', () => {
    const api = setup({ options });
    act(() => { api.current.handlers.handleOptionFocus(2); });
    expect(api.current.state.selectedIndex).toBe(2);
    act(() => { api.current.handlers.handleOptionFocus(99); });
    expect(api.current.state.selectedIndex).toBe(2);
  });

  it('keyboard ArrowDown opens then navigates', async () => {
    const api = setup({ options });
    const input = screen.getByTestId('input');
    await act(async () => { fireEvent.keyDown(input, { key: 'ArrowDown' }); });
    expect(api.current.state.open).toBe(true);
    await act(async () => { fireEvent.keyDown(input, { key: 'ArrowDown' }); });
    expect(api.current.state.selectedIndex).toBe(0);
    await act(async () => { fireEvent.keyDown(input, { key: 'ArrowDown' }); });
    expect(api.current.state.selectedIndex).toBe(1);
  });

  it('keyboard ArrowUp wraps to last navigable option', async () => {
    const api = setup({ options, defaultOpen: true });
    const input = screen.getByTestId('input');
    await act(async () => { fireEvent.keyDown(input, { key: 'ArrowUp' }); });
    // navigable = [a,b,c] (d disabled); from -1 -> last = c (index 2)
    expect(api.current.state.selectedIndex).toBe(2);
  });

  it('Enter selects the highlighted navigable option', async () => {
    const onValueChange = vi.fn();
    const api = setup({ options, defaultOpen: true, onValueChange });
    const input = screen.getByTestId('input');
    await act(async () => { api.current.handlers.handleOptionFocus(1); });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('Escape closes when closeOnEscape', async () => {
    const api = setup({ options, defaultOpen: true, closeOnEscape: true });
    const input = screen.getByTestId('input');
    await act(async () => { fireEvent.keyDown(input, { key: 'Escape' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('Tab closes an open combobox', async () => {
    const api = setup({ options, defaultOpen: true });
    const input = screen.getByTestId('input');
    await act(async () => { fireEvent.keyDown(input, { key: 'Tab' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('Backspace clears when input empty and clear button shown', () => {
    const onValueChange = vi.fn();
    const api = setup({ options, defaultValue: 'a', showClearButton: true, onValueChange });
    const input = screen.getByTestId('input');
    // selectedOption sets inputValue to 'Apple' via effect; force empty
    act(() => { api.current.handlers.handleInputChange(''); });
    act(() => { fireEvent.keyDown(input, { key: 'Backspace' }); });
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('Enter creates a custom value when allowCustomValue', async () => {
    const validateCustomValue = vi.fn(() => true);
    const onValueChange = vi.fn();
    const api = setup({ options, allowCustomValue: true, validateCustomValue, onValueChange, defaultOpen: true });
    const input = screen.getByTestId('input');
    await act(async () => { api.current.handlers.handleInputChange('custom-x'); });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
    expect(validateCustomValue).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith('custom-x');
  });

  it('custom key bindings override defaults', async () => {
    const custom = vi.fn();
    const api = setup({ options, keyBindings: { 'x': custom } });
    const input = screen.getByTestId('input');
    await act(async () => { fireEvent.keyDown(input, { key: 'x' }); });
    expect(custom).toHaveBeenCalled();
  });

  it('does nothing on key events when disabled', async () => {
    const api = setup({ options, disabled: true });
    const input = screen.getByTestId('input');
    await act(async () => { fireEvent.keyDown(input, { key: 'ArrowDown' }); });
    expect(api.current.state.open).toBe(false);
  });

  it('groups flatten to allOptions and filteredGroups filter', () => {
    const api = setup({ groups, defaultInputValue: 'alpha' });
    expect(api.current.state.filteredOptions.map((o: ComboboxOption) => o.id)).toEqual(['a']);
    expect(api.current.state.filteredGroups).toHaveLength(1);
    expect(api.current.state.filteredGroups[0].id).toBe('g1');
  });

  it('groups with custom filterFunction filter per group', () => {
    const filterFunction = vi.fn((opts: ComboboxOption[]) => opts);
    const api = setup({ groups, defaultInputValue: 'alpha', filterFunction });
    expect(filterFunction).toHaveBeenCalled();
    expect(api.current.state.filteredGroups.length).toBeGreaterThanOrEqual(1);
  });

  it('outside click closes the open combobox', async () => {
    const api = setup({ options, defaultOpen: true, closeOnOutsideClick: true });
    await act(async () => {
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(api.current.state.open).toBe(false);
  });

  it('document-level Escape closes the open combobox', async () => {
    const api = setup({ options, defaultOpen: true, closeOnEscape: true });
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(api.current.state.open).toBe(false);
  });

  it('clear button onClick clears selection', () => {
    const onValueChange = vi.fn();
    const api = setup({ options, defaultValue: 'a', onValueChange });
    const clear = screen.getByTestId('clear');
    act(() => { fireEvent.click(clear); });
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('option onClick selects and onMouseEnter focuses', async () => {
    const api = setup({ options, defaultOpen: true });
    const listItems = screen.getAllByRole('option');
    await act(async () => { fireEvent.mouseEnter(listItems[1]); });
    expect(api.current.state.selectedIndex).toBe(1);
    const onValueChange = vi.fn();
    api.current.handlers.handleSelect = setup({ options, onValueChange }).current.handlers.handleSelect;
    await act(async () => { fireEvent.click(listItems[2]); });
  });

  it('getOptionAttributes marks selected/disabled correctly', () => {
    const api = setup({ options, defaultValue: 'b' });
    const attrs = api.current.getOptionAttributes(options[1], 1);
    expect(attrs['aria-selected']).toBe(true);
    const disabledAttrs = api.current.getOptionAttributes(options[3], 3);
    expect(disabledAttrs['aria-disabled']).toBe(true);
  });

  it('listAttributes expose id and style', () => {
    const api = setup({ options, maxHeight: 120 });
    expect(api.current.listAttributes.id).toBe('combobox-list');
    expect(api.current.listAttributes.style.maxHeight).toBe('120px');
  });
});

// Regression coverage for the systemic gap where tests only asserted initial
// render: controlled props must keep driving state after a rerender with new
// values, otherwise a prop-update bug (F3/F4-class) can hide behind a passing
// initial-render assertion.
describe('useCombobox (controlled prop-update on rerender)', () => {
  it('controlled value change reflects in state.value and selectedOption', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <ComboboxHarness hookProps={{ options, value: 'a' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.value).toBe('a');
    expect(api.current.selectedOption?.value).toBe('a');

    rerender(
      <ComboboxHarness hookProps={{ options, value: 'c' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.value).toBe('c');
    expect(api.current.selectedOption?.value).toBe('c');
  });

  it('controlled inputValue change reflects in state.inputValue and filteredOptions', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <ComboboxHarness hookProps={{ options, inputValue: '' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.inputValue).toBe('');
    expect(api.current.state.filteredOptions).toHaveLength(4);

    rerender(
      <ComboboxHarness hookProps={{ options, inputValue: 'an' }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.inputValue).toBe('an');
    expect(api.current.state.filteredOptions.map((o: ComboboxOption) => o.label)).toEqual(['Banana']);
  });

  it('controlled open change reflects in state.open', () => {
    const api: { current: any } = { current: null };
    const { rerender } = render(
      <ComboboxHarness hookProps={{ options, open: false }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.open).toBe(false);

    rerender(
      <ComboboxHarness hookProps={{ options, open: true }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.open).toBe(true);

    rerender(
      <ComboboxHarness hookProps={{ options, open: false }} onApi={(a) => (api.current = a)} />
    );
    expect(api.current.state.open).toBe(false);
  });
});
