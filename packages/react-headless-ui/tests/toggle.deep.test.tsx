import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useToggle } from '../src/hooks/useToggle';
import { Toggle } from '../src/components/Toggle';

describe('useToggle hook', () => {
  it('defaults to unpressed when uncontrolled', () => {
    const { result } = renderHook(() => useToggle({}));
    expect(result.current.state.pressed).toBe(false);
    expect(result.current.state.disabled).toBe(false);
    expect(result.current.props['aria-pressed']).toBe(false);
    expect(result.current.props['data-state']).toBe('off');
  });

  it('honours defaultPressed in uncontrolled mode', () => {
    const { result } = renderHook(() => useToggle({ defaultPressed: true }));
    expect(result.current.state.pressed).toBe(true);
    expect(result.current.props['data-state']).toBe('on');
  });

  it('toggle() flips pressed state and fires onPressedChange', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() => useToggle({ onPressedChange: onChanged }));
    act(() => result.current.actions.toggle());
    expect(result.current.state.pressed).toBe(true);
    expect(onChanged).toHaveBeenLastCalledWith(true);
    act(() => result.current.actions.toggle());
    expect(result.current.state.pressed).toBe(false);
    expect(onChanged).toHaveBeenLastCalledWith(false);
  });

  it('press() only fires when not already pressed; release() only when pressed', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() => useToggle({ onPressedChange: onChanged }));
    act(() => result.current.actions.press());
    expect(onChanged).toHaveBeenLastCalledWith(true);
    act(() => result.current.actions.press()); // already pressed -> no-op
    expect(onChanged).toHaveBeenCalledTimes(1);
    act(() => result.current.actions.release());
    expect(onChanged).toHaveBeenLastCalledWith(false);
    act(() => result.current.actions.release()); // already released -> no-op
    expect(onChanged).toHaveBeenCalledTimes(2);
  });

  it('does nothing when disabled', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() => useToggle({ disabled: true, onPressedChange: onChanged }));
    act(() => result.current.actions.toggle());
    act(() => result.current.actions.press());
    act(() => result.current.actions.release());
    expect(onChanged).not.toHaveBeenCalled();
    expect(result.current.state.pressed).toBe(false);
    expect(result.current.props['aria-disabled']).toBe(true);
    expect(result.current.props['data-disabled']).toBe(true);
  });

  it('controlled mode never updates internal state, only notifies', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ pressed: false, onPressedChange: onChanged })
    );
    act(() => result.current.actions.toggle());
    // Controlled value stays false; parent owns the truth.
    expect(result.current.state.pressed).toBe(false);
    expect(onChanged).toHaveBeenLastCalledWith(true);
  });

  it('Enter and Space keydown toggle via composed props', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ onPressedChange: onChanged })
    );
    const fakeEvent = (key: string) =>
      ({ key, preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    act(() => result.current.props.onKeyDown(fakeEvent('Enter')));
    act(() => result.current.props.onKeyDown(fakeEvent(' ')));
    expect(onChanged).toHaveBeenCalledTimes(2);
  });

  it('keydown is a no-op when disabled', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ disabled: true, onPressedChange: onChanged })
    );
    const fakeEvent = (key: string) =>
      ({ key, preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
    act(() => result.current.props.onKeyDown(fakeEvent('Enter')));
    act(() => result.current.props.onKeyDown(fakeEvent(' ')));
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('onClick composed prop toggles', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ onPressedChange: onChanged })
    );
    act(() => result.current.props.onClick());
    expect(onChanged).toHaveBeenLastCalledWith(true);
  });

  it('controlled press/release notify without mutating internal state', () => {
    const onChanged = vi.fn();
    const { result } = renderHook(() =>
      useToggle({ pressed: false, onPressedChange: onChanged })
    );
    act(() => result.current.actions.press());
    expect(onChanged).toHaveBeenLastCalledWith(true);
    expect(result.current.state.pressed).toBe(false); // still controlled false
    // re-render controlled as pressed true, then release
    const { result: r2 } = renderHook(() =>
      useToggle({ pressed: true, onPressedChange: onChanged })
    );
    act(() => r2.current.actions.release());
    expect(onChanged).toHaveBeenLastCalledWith(false);
    expect(r2.current.state.pressed).toBe(true);
  });
});

describe('Toggle component integration', () => {
  it('toggles on click and reflects pressed children', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(
      <Toggle onPressedChange={onChanged} pressedChildren="On" unpressedChildren="Off">
        Fallback
      </Toggle>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Off')).toBeInTheDocument();
    await user.click(btn);
    expect(onChanged).toHaveBeenLastCalledWith(true);
  });

  it('keyboard Space toggles and Enter toggles', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<Toggle aria-label="t" onPressedChange={onChanged} />);
    const btn = screen.getByRole('button');
    btn.focus();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');
    expect(onChanged).toHaveBeenCalledTimes(2);
  });

  it('disabled toggle is not interactive', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<Toggle disabled aria-label="t" onPressedChange={onChanged} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onChanged).not.toHaveBeenCalled();
  });
});
