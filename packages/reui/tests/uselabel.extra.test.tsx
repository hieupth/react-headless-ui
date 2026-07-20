import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useLabel } from '../src/hooks';
import type { UseLabelProps } from '../src/hooks';

// Headless-hook harness following the useportal.hook.test.tsx canonical pattern:
// render a component that wires the hook up and exposes its state/actions so
// tests can invoke the imperative API via closures.
function setup(props: UseLabelProps) {
  const api = { state: null as any, actions: null as any, propsObj: null as any, extra: null as any };
  function Harness() {
    const result = useLabel(props) as any;
    api.state = result.state;
    api.actions = result.actions;
    api.propsObj = result.props;
    api.extra = result.requiredIndicator;
    return null;
  }
  render(<Harness />);
  return api;
}

describe('useLabel hook', () => {
  it('exposes default state with disabled/required/error false and requiredPosition end', () => {
    const api = setup({ htmlFor: 'field-1' });
    expect(api.state.disabled).toBe(false);
    expect(api.state.required).toBe(false);
    expect(api.state.error).toBe(false);
    expect(api.state.requiredPosition).toBe('end');
  });

  it('reflects disabled/required/error/requiredPosition from props', () => {
    const api = setup({ htmlFor: 'f', disabled: true, required: true, error: true, requiredPosition: 'start' });
    expect(api.state.disabled).toBe(true);
    expect(api.state.required).toBe(true);
    expect(api.state.error).toBe(true);
    expect(api.state.requiredPosition).toBe('start');
  });

  it('exposes the default requiredIndicator "*" and a custom override', () => {
    expect(setup({ htmlFor: 'f' }).extra).toBe('*');
    expect(setup({ htmlFor: 'f', requiredIndicator: ' REQ' }).extra).toBe(' REQ');
  });

  it('builds aria-* and data-* attributes on the composed props bag', () => {
    const api = setup({ htmlFor: 'email', required: true, error: true, disabled: true });
    const p = api.propsObj;
    expect(p.htmlFor).toBe('email');
    expect(p.disabled).toBe(true);
    expect(p['aria-required']).toBe(true);
    expect(p['aria-disabled']).toBe(true);
    expect(p['aria-invalid']).toBe(true);
    expect(p['data-required']).toBe(true);
    expect(p['data-disabled']).toBe(true);
    expect(p['data-error']).toBe(true);
    expect(p['data-required-position']).toBe('end');
    expect(typeof p.onClick).toBe('function');
  });

  it('omits aria/data attributes when flags are false (undefined values)', () => {
    const p = setup({ htmlFor: 'f' }).propsObj;
    expect(p['aria-required']).toBeUndefined();
    expect(p['aria-disabled']).toBeUndefined();
    expect(p['aria-invalid']).toBeUndefined();
    expect(p['data-required']).toBeUndefined();
    expect(p['data-disabled']).toBeUndefined();
    expect(p['data-error']).toBeUndefined();
  });

  it('focusControl focuses the element matching htmlFor', () => {
    const input = document.createElement('input');
    input.id = 'target-input';
    document.body.appendChild(input);
    const api = setup({ htmlFor: 'target-input' });
    act(() => api.actions.focusControl());
    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  it('focusControl is a no-op when disabled', () => {
    const input = document.createElement('input');
    input.id = 'target-input-2';
    document.body.appendChild(input);
    const api = setup({ htmlFor: 'target-input-2', disabled: true });
    act(() => api.actions.focusControl());
    expect(document.activeElement).not.toBe(input);
    document.body.removeChild(input);
  });

  it('focusControl is a no-op when htmlFor is missing', () => {
    const api = setup({});
    expect(() => act(() => api.actions.focusControl())).not.toThrow();
  });

  it('focusControl is a no-op when the matching element does not exist', () => {
    const api = setup({ htmlFor: 'does-not-exist' });
    expect(() => act(() => api.actions.focusControl())).not.toThrow();
  });

  it('handleClick delegates to focusControl when enabled', () => {
    const input = document.createElement('input');
    input.id = 'click-target';
    document.body.appendChild(input);
    const api = setup({ htmlFor: 'click-target' });
    act(() => api.actions.handleClick());
    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  it('handleClick is a no-op when disabled', () => {
    const input = document.createElement('input');
    input.id = 'click-target-disabled';
    document.body.appendChild(input);
    const api = setup({ htmlFor: 'click-target-disabled', disabled: true });
    act(() => api.actions.handleClick());
    expect(document.activeElement).not.toBe(input);
    document.body.removeChild(input);
  });

  it('composed onClick handler focuses the control when invoked', () => {
    const input = document.createElement('input');
    input.id = 'compose-target';
    document.body.appendChild(input);
    const api = setup({ htmlFor: 'compose-target' });
    act(() => (api.propsObj.onClick as () => void)());
    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  it('does not throw when rendered with no props at all', () => {
    expect(() => setup({} as UseLabelProps)).not.toThrow();
  });
});
