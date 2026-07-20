import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSwitch } from '../src/hooks/useSwitch';
import { Switch } from '../src/components/Switch';

function setup(props: any = {}) {
  const api: any = { state: null, actions: null, handlers: null };
  function Harness() {
    const r = useSwitch(props);
    api.state = r.state;
    api.actions = r.actions;
    api.handlers = r.handlers;
    api.switchAttributes = r.switchAttributes;
    api.formAttributes = r.formAttributes;
    return (
      <button
        ref={r.switchRef as any}
        data-testid="sw"
        {...r.handlers}
        {...r.switchAttributes}
      />
    );
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

describe('useSwitch hook', () => {
  it('defaults to unchecked, enabled, not readonly', () => {
    const { api } = setup();
    expect(api.state.checked).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.readOnly).toBe(false);
    expect(api.switchAttributes['aria-checked']).toBe(false);
    expect(api.switchAttributes.role).toBe('switch');
    expect(api.switchAttributes.tabIndex).toBe(0);
  });

  it('honours defaultChecked in uncontrolled mode', () => {
    const { api } = setup({ defaultChecked: true });
    expect(api.state.checked).toBe(true);
  });

  it('toggle() flips checked and fires onCheckedChange', () => {
    const onChange = vi.fn();
    const { api } = setup({ onCheckedChange: onChange });
    act(() => api.actions.toggle());
    expect(api.state.checked).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('setChecked() sets arbitrary value in uncontrolled mode', () => {
    const onChange = vi.fn();
    const { api } = setup({ onCheckedChange: onChange });
    act(() => api.actions.setChecked(true));
    expect(api.state.checked).toBe(true);
    act(() => api.actions.setChecked(false));
    expect(api.state.checked).toBe(false);
  });

  it('setChecked is a no-op in controlled mode', () => {
    const onChange = vi.fn();
    const { api } = setup({ checked: false, onCheckedChange: onChange });
    act(() => api.actions.setChecked(true));
    expect(api.state.checked).toBe(false); // controlled value unchanged
  });

  it('toggle in controlled mode fires onChange without mutating internal state', () => {
    const onChange = vi.fn();
    const { api } = setup({ checked: false, onCheckedChange: onChange });
    act(() => api.actions.toggle());
    expect(onChange).toHaveBeenCalledWith(true);
    // Controlled: internal state is not touched, exposed checked stays false.
    expect(api.state.checked).toBe(false);
  });

  it('falls back to role="switch" when the semantic role resolves to generic', () => {
    // Passing role="generic" through mixinProps makes useSemanticMixin omit
    // attributes.role, exercising the || 'switch' fallback.
    const { api } = setup({ role: 'generic' } as any);
    expect(api.switchAttributes.role).toBe('switch');
  });

  it('disabled blocks toggle', () => {
    const onChange = vi.fn();
    const { api } = setup({ disabled: true, onCheckedChange: onChange });
    act(() => api.actions.toggle());
    expect(onChange).not.toHaveBeenCalled();
    expect(api.state.checked).toBe(false);
    expect(api.switchAttributes.tabIndex).toBe(-1);
  });

  it('readOnly blocks toggle and click handler preventDefaults', () => {
    const onChange = vi.fn();
    const { api } = setup({ readOnly: true, onCheckedChange: onChange });
    act(() => api.actions.toggle());
    expect(onChange).not.toHaveBeenCalled();
    const prevent = vi.fn();
    act(() => api.handlers.onClick({ preventDefault: prevent } as any));
    expect(prevent).toHaveBeenCalled();
  });

  it('Space and Enter keyboard handlers toggle', () => {
    const onChange = vi.fn();
    const { api } = setup({ onCheckedChange: onChange });
    const kd = (key: string) =>
      api.handlers.onKeyDown({ key, preventDefault: vi.fn() });
    act(() => kd(' '));
    act(() => kd('Enter'));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('focus/blur actions touch the DOM element', () => {
    const { api, getByTestId } = setup();
    const el = getByTestId('sw') as HTMLButtonElement;
    el.focus();
    expect(document.activeElement).toBe(el);
    act(() => api.actions.focus());
    act(() => api.actions.blur());
    expect(document.activeElement).not.toBe(el);
  });

  it('mouse enter/leave handlers delegate to the pressable mixin without error', () => {
    const { api } = setup();
    expect(() => {
      act(() => api.handlers.onMouseEnter({} as any));
      act(() => api.handlers.onMouseLeave({} as any));
    }).not.toThrow();
  });

  it('exposes formAttributes (name/value/type)', () => {
    const { api } = setup({ name: 'notify', value: 'yes' });
    expect(api.formAttributes).toEqual({ name: 'notify', value: 'yes', type: 'checkbox' });
  });
});

describe('Switch component integration', () => {
  it('toggles on click and reflects aria-checked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onChange} aria-label="s" />);
    const sw = screen.getByRole('switch');
    await user.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(true);
    await user.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('keyboard Space on focused switch toggles', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onChange} aria-label="s" />);
    const sw = screen.getByRole('switch');
    sw.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalled();
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch disabled onCheckedChange={onChange} aria-label="s" />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
