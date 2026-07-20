import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCheckbox } from '../src/hooks/useCheckbox';
import { Checkbox } from '../src/components/Checkbox';

function setup(props: any = {}) {
  const api: any = {};
  function Harness() {
    const r = useCheckbox(props);
    Object.assign(api, r);
    return <input data-testid="cb" {...r.semanticAttributes} />;
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

describe('useCheckbox hook', () => {
  it('defaults to unchecked, enabled, not required', () => {
    const { api } = setup();
    expect(api.checked).toBe(false);
    expect(api.indeterminate).toBe(false);
    expect(api.disabled).toBe(false);
    expect(api.required).toBe(false);
    expect(api.semanticAttributes['aria-checked']).toBe('false');
    expect(api.className).toContain('checkbox-unchecked');
  });

  it('defaultChecked and defaultIndeterminate are honoured', () => {
    const { api } = setup({ defaultChecked: true, defaultIndeterminate: true });
    expect(api.checked).toBe(true);
    expect(api.indeterminate).toBe(true);
    // aria-checked reflects checked boolean; 'mixed' only when checked==='indeterminate'.
    expect(api.semanticAttributes['aria-checked']).toBe('true');
    expect(api.className).toContain('checkbox-indeterminate');
  });

  it('aria-checked is "mixed" only when checked is the indeterminate value', () => {
    const { api } = setup({ checked: 'indeterminate', indeterminate: true });
    expect(api.semanticAttributes['aria-checked']).toBe('mixed');
    expect(api.className).toContain('checkbox-indeterminate');
    expect(api.semanticAttributes['data-indeterminate']).toBe(true);
  });

  it('toggle goes unchecked->checked->unchecked', () => {
    const onChecked = vi.fn();
    const { api } = setup({ onCheckedChange: onChecked });
    act(() => api.toggle());
    expect(api.checked).toBe(true);
    expect(onChecked).toHaveBeenLastCalledWith(true);
    act(() => api.toggle());
    expect(api.checked).toBe(false);
    expect(onChecked).toHaveBeenLastCalledWith(false);
  });

  it('toggle resolves indeterminate to checked and clears indeterminate', () => {
    const onChecked = vi.fn();
    const onIndet = vi.fn();
    const { api } = setup({
      defaultIndeterminate: true,
      onCheckedChange: onChecked,
      onIndeterminateChange: onIndet,
    });
    act(() => api.toggle());
    expect(api.checked).toBe(true);
    expect(api.indeterminate).toBe(false);
    expect(onChecked).toHaveBeenLastCalledWith(true);
    expect(onIndet).toHaveBeenLastCalledWith(false);
  });

  it('disabled toggle is a no-op', () => {
    const onChecked = vi.fn();
    const { api } = setup({ disabled: true, onCheckedChange: onChecked });
    act(() => api.toggle());
    expect(onChecked).not.toHaveBeenCalled();
    expect(api.checked).toBe(false);
  });

  it('Space keydown toggles', () => {
    const onChecked = vi.fn();
    const { api } = setup({ onCheckedChange: onChecked });
    act(() => api.handleKeyDown({ key: ' ', preventDefault: vi.fn() } as any));
    expect(onChecked).toHaveBeenLastCalledWith(true);
  });

  it('disabled keydown does nothing', () => {
    const onChecked = vi.fn();
    const { api } = setup({ disabled: true, onCheckedChange: onChecked });
    act(() => api.handleKeyDown({ key: ' ', preventDefault: vi.fn() } as any));
    expect(onChecked).not.toHaveBeenCalled();
  });

  it('setChecked / setIndeterminate programmatic setters fire callbacks', () => {
    const onChecked = vi.fn();
    const onIndet = vi.fn();
    const { api } = setup({
      onCheckedChange: onChecked,
      onIndeterminateChange: onIndet,
    });
    act(() => api.setChecked(true));
    expect(api.checked).toBe(true);
    expect(onChecked).toHaveBeenLastCalledWith(true);
    act(() => api.setIndeterminate(true));
    expect(api.indeterminate).toBe(true);
    expect(onIndet).toHaveBeenLastCalledWith(true);
  });

  it('controlled checked/indeterminate ignore internal setters but still notify', () => {
    const onChecked = vi.fn();
    const { api } = setup({ checked: false, onCheckedChange: onChecked });
    act(() => api.toggle());
    // Controlled value wins: internal state not mutated.
    expect(onChecked).toHaveBeenLastCalledWith(true);
    expect(api.checked).toBe(false);
  });

  it('handleFocus/handleBlur/handleKeyUp/handleKeyDown exercise mixin paths', () => {
    const { api } = setup();
    expect(() =>
      act(() => {
        api.handleFocus({} as any);
        api.handleBlur({} as any);
        api.handleKeyUp({ key: 'a' } as any);
        api.handleKeyDown({ key: 'a', preventDefault: vi.fn() } as any);
      })
    ).not.toThrow();
  });

  it('inputValue reflects value prop (default "on")', () => {
    expect(setup().api.inputValue).toBe('on');
    expect(setup({ value: 'agree' }).api.inputValue).toBe('agree');
  });
});

describe('Checkbox component integration', () => {
  it('click toggles checked via the visual handler', async () => {
    const user = userEvent.setup();
    const onChecked = vi.fn();
    render(<Checkbox onCheckedChange={onChecked}>Accept</Checkbox>);
    const cb = screen.getByRole('checkbox');
    await user.click(cb);
    expect(onChecked).toHaveBeenLastCalledWith(true);
  });

  it('reflects controlled checked and indeterminate aria', () => {
    render(<Checkbox checked indeterminate>Mixed</Checkbox>);
    const cb = screen.getByRole('checkbox');
    // checked=true dominates aria-checked; indeterminate is exposed via data-*.
    expect(cb).toHaveAttribute('aria-checked', 'true');
    expect(cb).toHaveAttribute('data-indeterminate', 'true');
  });

  it('applies checkbox-checked visual class when checked is true', () => {
    const { container } = render(<Checkbox checked>On</Checkbox>);
    const visual = container.querySelector('.checkbox-visual');
    expect(visual?.className).toContain('checkbox-checked');
    expect(visual?.className).not.toContain('checkbox-unchecked');
  });

  it('applies checkbox-unchecked visual class when checked is false', () => {
    const { container } = render(<Checkbox checked={false}>Off</Checkbox>);
    const visual = container.querySelector('.checkbox-visual');
    expect(visual?.className).toContain('checkbox-unchecked');
    expect(visual?.className).not.toContain('checkbox-checked');
  });

  it('marks the label as disabled and focused via label classes', () => {
    const { container, rerender } = render(<Checkbox disabled>Locked</Checkbox>);
    const label = container.querySelector('.checkbox-label');
    expect(label?.className).toContain('checkbox-label-disabled');
    // Focus the input to drive the focused label class.
    fireEvent.focus(screen.getByRole('checkbox'));
    rerender(<Checkbox focused>Active</Checkbox>);
    expect(container.querySelector('.checkbox-label')?.className).toContain('checkbox-label-focused');
  });

  it('renders the required indicator when required', () => {
    const { container } = render(<Checkbox required>Must accept</Checkbox>);
    expect(container.querySelector('.checkbox-required-indicator')).not.toBeNull();
  });
});
