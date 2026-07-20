import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useCollapsible } from '../src/hooks';
import type { UseCollapsibleProps } from '../src/hooks';

// useCollapsible exercised directly through a harness: controlled vs
// uncontrolled open, disabled gating, all actions, keyboard handling, and
// generated trigger/content props.

function setup(props: UseCollapsibleProps = {}) {
  const api = { current: null as any };
  function Harness() {
    api.current = useCollapsible(props);
    return null;
  }
  render(<Harness />);
  return api;
}

describe('useCollapsible hook', () => {
  it('defaults to closed and reports state', () => {
    const { current } = setup();
    expect(current.state.open).toBe(false);
    expect(current.state.disabled).toBe(false);
    expect(current.state.animated).toBe(true);
    expect(current.triggerProps['aria-expanded']).toBe(false);
    expect(current.triggerProps['data-state']).toBe('closed');
    expect(current.contentProps['aria-hidden']).toBe(true);
    expect(current.contentProps.style.height).toBe('0px');
  });

  it('honours defaultOpen', () => {
    const { current } = setup({ defaultOpen: true });
    expect(current.state.open).toBe(true);
    expect(current.triggerProps['aria-expanded']).toBe(true);
    expect(current.contentProps['aria-hidden']).toBe(false);
    expect(current.contentProps.style.height).toBe('auto');
  });

  it('uncontrolled: open/close/toggle change state and fire onOpenChange', () => {
    const onOpenChange = vi.fn();
    const api = setup({ onOpenChange });
    act(() => api.current.actions.open());
    expect(api.current.state.open).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    // open() again when already open is a no-op (no extra callback).
    act(() => api.current.actions.open());
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    act(() => api.current.actions.close());
    expect(api.current.state.open).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    // close() when already closed is a no-op.
    act(() => api.current.actions.close());
    expect(onOpenChange).toHaveBeenCalledTimes(2);

    act(() => api.current.actions.toggle());
    expect(api.current.state.open).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('disabled blocks all actions', () => {
    const onOpenChange = vi.fn();
    const { current } = setup({ disabled: true, onOpenChange });
    act(() => current.actions.toggle());
    act(() => current.actions.open());
    act(() => current.actions.close());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(current.state.open).toBe(false);
  });

  it('controlled mode: actions only emit onOpenChange, do not mutate internal state', () => {
    const onOpenChange = vi.fn();
    const { current } = setup({ open: false, onOpenChange });
    act(() => current.actions.open());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Controlled value stays as provided (false).
    expect(current.state.open).toBe(false);

    act(() => current.actions.toggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('controlled mode: closeCollapsible emits onOpenChange(false) when open', () => {
    const onOpenChange = vi.fn();
    const { current } = setup({ open: true, onOpenChange });
    act(() => current.actions.close());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    // Controlled value stays true (internal state untouched).
    expect(current.state.open).toBe(true);
  });

  it('triggerProps onKeyDown toggles on Enter/Space', () => {
    const api = setup();
    const preventDefault = vi.fn();
    act(() => {
      api.current.triggerProps.onKeyDown({ key: 'Enter', preventDefault } as unknown as React.KeyboardEvent);
    });
    expect(preventDefault).toHaveBeenCalled();
    expect(api.current.state.open).toBe(true);

    act(() => {
      api.current.triggerProps.onKeyDown({ key: ' ', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    });
    expect(api.current.state.open).toBe(false);
  });

  it('triggerProps onKeyDown no-op when disabled', () => {
    const { current } = setup({ disabled: true });
    const preventDefault = vi.fn();
    act(() => {
      current.triggerProps.onKeyDown({ key: 'Enter', preventDefault } as unknown as React.KeyboardEvent);
    });
    expect(current.state.open).toBe(false);
  });

  it('animated=false produces no transition', () => {
    const { current } = setup({ animated: false, defaultOpen: true });
    expect(current.contentProps.style.transition).toBe('none');
    expect(current.state.animated).toBe(false);
  });

  it('exclusive toggle path: clicking same button toggles off in controlled', () => {
    // Collapsible is not exclusive, but verify onOpenChange gets called once
    // for each distinct toggle direction.
    const onOpenChange = vi.fn();
    const api = setup({ defaultOpen: false, onOpenChange });
    act(() => api.current.actions.toggle());
    act(() => api.current.actions.toggle());
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });
});
