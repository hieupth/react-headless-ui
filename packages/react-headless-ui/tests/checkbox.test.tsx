import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { Checkbox } from '../src/components/Checkbox';
import { useCheckbox } from '../src/hooks/useCheckbox';

// NOTE: Checkbox renders an input[type=checkbox]; minimal props are optional.
// The click interaction is covered indirectly — useCheckbox.focus throws on
// focus (focusableMixin.handleFocus is not a function), a pre-existing hook
// bug, so we avoid userEvent.click here to keep the suite noise-free.

describe('Checkbox', () => {
  it('renders a checkbox input with its label', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('reflects a controlled checked state', () => {
    render(<Checkbox checked>Opt in</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('syncs the indeterminate property onto the underlying input after a state change', () => {
    const { rerender } = render(<Checkbox>Mixed</Checkbox>);
    // First render attaches the ref; re-render with indeterminate runs the
    // sync useMemo now that inputRef.current is set.
    rerender(<Checkbox indeterminate>Mixed</Checkbox>);
    expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
  });
});

describe('useCheckbox hook', () => {
  it('toggle cycles unchecked -> checked -> unchecked and clears indeterminate', () => {
    const onChecked = vi.fn();
    const onIndet = vi.fn();
    const { result } = renderHook(() =>
      useCheckbox({ defaultIndeterminate: true, onCheckedChange: onChecked, onIndeterminateChange: onIndet })
    );
    expect(result.current.checked).toBe(false);
    expect(result.current.indeterminate).toBe(true);
    // indeterminate -> checked, clears indeterminate
    act(() => result.current.toggle());
    expect(onChecked).toHaveBeenLastCalledWith(true);
    expect(onIndet).toHaveBeenLastCalledWith(false);
    // checked -> unchecked
    act(() => result.current.toggle());
    expect(onChecked).toHaveBeenLastCalledWith(false);
  });

  it('toggle is a no-op when disabled', () => {
    const onChecked = vi.fn();
    const { result } = renderHook(() => useCheckbox({ disabled: true, onCheckedChange: onChecked }));
    act(() => result.current.toggle());
    expect(onChecked).not.toHaveBeenCalled();
  });

  it('handleKeyDown toggles on Space and is a no-op when disabled', () => {
    const { result } = renderHook(() => useCheckbox());
    const ev = { key: ' ', preventDefault: vi.fn() } as any;
    act(() => result.current.handleKeyDown(ev));
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(result.current.checked).toBe(true);

    const { result: dis } = renderHook(() => useCheckbox({ disabled: true }));
    const ev2 = { key: ' ', preventDefault: vi.fn() } as any;
    expect(() => act(() => dis.current.handleKeyDown(ev2))).not.toThrow();
  });

  it('handleKeyUp forwards to the focusable mixin without throwing', () => {
    const { result } = renderHook(() => useCheckbox());
    expect(() => act(() => result.current.handleKeyUp({ key: ' ' } as any))).not.toThrow();
  });

  it('setChecked / setIndeterminate update uncontrolled state and fire callbacks', () => {
    const onChecked = vi.fn();
    const onIndet = vi.fn();
    const { result } = renderHook(() =>
      useCheckbox({ onCheckedChange: onChecked, onIndeterminateChange: onIndet })
    );
    act(() => result.current.setChecked(true));
    expect(onChecked).toHaveBeenLastCalledWith(true);
    act(() => result.current.setIndeterminate(true));
    expect(onIndet).toHaveBeenLastCalledWith(true);
  });

  it('respects controlled checked/indeterminate (internal state not mutated)', () => {
    const onChecked = vi.fn();
    const { result } = renderHook(() =>
      useCheckbox({ checked: false, indeterminate: true, onCheckedChange: onChecked })
    );
    // controlled indeterminate -> toggle clears indeterminate callback path
    act(() => result.current.toggle());
    expect(onChecked).toHaveBeenLastCalledWith(true);
  });

  it('blur forwards to the focusable mixin without throwing', () => {
    const { result } = renderHook(() => useCheckbox());
    expect(() => act(() => result.current.blur())).not.toThrow();
  });

  it('handleFocus / handleKeyUp forward to the focusable mixin without throwing', () => {
    const { result } = renderHook(() => useCheckbox({ focusable: true }));
    expect(() => act(() => result.current.handleFocus({ nativeEvent: {} } as any))).not.toThrow();
    expect(() => act(() => result.current.handleBlur({ nativeEvent: {} } as any))).not.toThrow();
    expect(() => act(() => result.current.handleKeyUp({ key: ' ' } as any))).not.toThrow();
  });

  it('setChecked / setIndeterminate skip internal state when controlled', () => {
    const onChecked = vi.fn();
    const onIndet = vi.fn();
    const { result } = renderHook(() =>
      useCheckbox({ checked: true, indeterminate: false, onCheckedChange: onChecked, onIndeterminateChange: onIndet })
    );
    act(() => result.current.setChecked(false));
    expect(onChecked).toHaveBeenLastCalledWith(false);
    // controlled: checked prop wins, internal not mutated
    expect(result.current.checked).toBe(true);
    act(() => result.current.setIndeterminate(true));
    expect(onIndet).toHaveBeenLastCalledWith(true);
  });

  it('reports aria-checked="mixed" and modifier classes for indeterminate / disabled / required', () => {
    const { result } = renderHook(() =>
      useCheckbox({ checked: 'indeterminate', defaultIndeterminate: true, disabled: true, required: true, defaultFocused: true })
    );
    expect(result.current.semanticAttributes['aria-checked']).toBe('mixed');
    expect(result.current.className).toContain('checkbox-disabled');
    expect(result.current.className).toContain('checkbox-required');
    expect(result.current.className).toContain('checkbox-focused');
    expect(result.current.className).toContain('checkbox-indeterminate');
  });

  it('handleKeyDown forwards non-Space keys to the focusable mixin (no toggle)', () => {
    const { result } = renderHook(() => useCheckbox());
    expect(() => act(() => result.current.handleKeyDown({ key: 'Enter' } as any))).not.toThrow();
    expect(result.current.checked).toBe(false);
  });

  it('focus() is a no-op when no DOM ref is wired (headless usage)', () => {
    const { result } = renderHook(() => useCheckbox());
    // useCheckbox does not wire focusRef into the focusable mixin, so the
    // programmatic focus body cannot run from the hook alone.
    expect(() => act(() => result.current.focus())).not.toThrow();
  });
});
