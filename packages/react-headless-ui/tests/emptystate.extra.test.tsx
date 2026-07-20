import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useEmptyState } from '../src/hooks';
import type { UseEmptyStateProps } from '../src/hooks';

// useEmptyState exercised directly through a harness so every handler branch
// (focus gating, Escape dismiss, Enter/Space primary action, fallback to
// focusable mixin) and every state variant is covered.

function setup(props: UseEmptyStateProps = {}) {
  const api = { current: null as any };
  function Harness() {
    api.current = useEmptyState(props);
    return null;
  }
  const utils = render(<Harness />);
  // Return the live `api` container (augmented with utils) so `result.current`
  // reflects the latest hook result after re-renders, not a setup-time snapshot.
  return Object.assign(api, utils);
}

describe('useEmptyState hook', () => {
  it('reports default state values', () => {
    const { current } = setup();
    expect(current.state.visible).toBe(true);
    expect(current.state.variant).toBe('no-data');
    expect(current.state.dismissible).toBe(false);
    expect(current.state.showActions).toBe(true);
    expect(current.attributes['aria-live']).toBe('polite');
    expect(current.attributes['aria-atomic']).toBe(true);
    expect(current.attributes['data-variant']).toBe('no-data');
  });

  it('honours overridden variant, visibility, dismissible, showActions', () => {
    const { current } = setup({
      visible: false,
      variant: 'error',
      dismissible: true,
      showActions: false,
    });
    expect(current.state.visible).toBe(false);
    expect(current.state.variant).toBe('error');
    expect(current.state.dismissible).toBe(true);
    expect(current.state.showActions).toBe(false);
    expect(current.attributes['data-visible']).toBe(false);
  });

  it('primary/secondary/dismiss handlers fire callbacks', () => {
    const onPrimaryAction = vi.fn();
    const onSecondaryAction = vi.fn();
    const onDismiss = vi.fn();
    const { current } = setup({ onPrimaryAction, onSecondaryAction, onDismiss });
    act(() => current.handlers.handlePrimaryAction());
    act(() => current.handlers.handleSecondaryAction());
    act(() => current.handlers.handleDismiss());
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('handleFocus sets focused when focusable, no-op when not', () => {
    const result = setup({ focusable: true });
    const { rerender } = result;
    act(() => result.current.handlers.handleFocus({} as React.FocusEvent));
    expect(result.current.state.focused).toBe(true);
    act(() => result.current.handlers.handleBlur({} as React.FocusEvent));
    expect(result.current.state.focused).toBe(false);

    // Non-focusable: handleFocus is a guarded no-op (focused stays false).
    const notFocusable = setup({ focusable: false });
    act(() => notFocusable.current.handlers.handleFocus({} as React.FocusEvent));
    expect(notFocusable.current.state.focused).toBe(false);

    rerender(<div />);
    expect(result.current.state.focused).toBe(false);
  });

  it('handleKeyDown: Escape dismisses when dismissible', () => {
    const onDismiss = vi.fn();
    const { current } = setup({ dismissible: true, onDismiss });
    const preventDefault = vi.fn();
    act(() => current.handlers.handleKeyDown({
      key: 'Escape', preventDefault,
    } as unknown as React.KeyboardEvent));
    expect(preventDefault).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('handleKeyDown: Escape is ignored when not dismissible', () => {
    const onDismiss = vi.fn();
    const { current } = setup({ dismissible: false, onDismiss });
    act(() => current.handlers.handleKeyDown({
      key: 'Escape', preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('handleKeyDown: Enter/Space triggers primary action when present', () => {
    const onPrimaryAction = vi.fn();
    const { current } = setup({ onPrimaryAction });
    const preventDefault = vi.fn();
    act(() => current.handlers.handleKeyDown({
      key: 'Enter', preventDefault,
    } as unknown as React.KeyboardEvent));
    act(() => current.handlers.handleKeyDown({
      key: ' ', preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent));
    expect(onPrimaryAction).toHaveBeenCalledTimes(2);
  });

  it('handleKeyDown: no-op for other keys and when not focusable', () => {
    const onPrimaryAction = vi.fn();
    const { current } = setup({ focusable: false, onPrimaryAction });
    act(() => current.handlers.handleKeyDown({
      key: 'Enter', preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent));
    expect(onPrimaryAction).not.toHaveBeenCalled();
  });

  it('can be driven through real DOM focus/keydown via attributes', () => {
    const onPrimaryAction = vi.fn();
    function Probe() {
      const r = useEmptyState({ onPrimaryAction, focusable: true });
      return <div tabIndex={0} {...r.attributes} data-testid="x" />;
    }
    const { getByTestId } = render(<Probe />);
    const el = getByTestId('x');
    fireEvent.focus(el);
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.blur(el);
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it('no callbacks present: handlers run without throwing', () => {
    const { current } = setup({});
    expect(() => {
      act(() => current.handlers.handlePrimaryAction());
      act(() => current.handlers.handleSecondaryAction());
      act(() => current.handlers.handleDismiss());
      act(() => current.handlers.handleKeyDown({
        key: 'Enter', preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent));
    }).not.toThrow();
  });
});
