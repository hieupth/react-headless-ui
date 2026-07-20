import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, renderHook, cleanup } from '@testing-library/react';
import {
  useFocusableMixin,
  type FocusableMixinProps,
} from '../src/mixins/FocusableMixin';
import type { KeyboardNavigation, NavigationKey } from '../src/contracts';

type Result = ReturnType<typeof useFocusableMixin>;

/**
 * Harness: the mixin's focusRef is attached to a real <button> so that
 * programmatic focus()/blur() touch the DOM. The latest hook result is kept in
 * a ref that updates every render, so tests read fresh state after `act()`.
 */
function mount(props: FocusableMixinProps) {
  const live = { current: null as Result | null };
  function Probe() {
    const mixin = useFocusableMixin(props);
    live.current = mixin;
    return (
      <button
        ref={mixin.focusRef as React.RefObject<HTMLButtonElement>}
        data-testid="target"
        tabIndex={mixin.tabIndex}
        onKeyDown={mixin.handleKeyDown}
        onKeyUp={mixin.handleKeyUp}
      />
    );
  }
  const utils = render(<Probe />);
  const get = () => live.current!;
  return { get, ...utils };
}

function run(fn: () => void) {
  act(() => fn());
}

function keyEvent(key: string, partial: Partial<React.KeyboardEvent> = {}): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    nativeEvent: { key } as unknown as KeyboardEvent,
    ...partial,
  } as unknown as React.KeyboardEvent;
}

function focusEvent(): FocusEvent {
  return { type: 'focus' } as unknown as FocusEvent;
}

describe('useFocusableMixin', () => {
  afterEach(() => cleanup());

  it('exposes initial state with defaults', () => {
    const { get } = mount({});
    const r = get();
    expect(r.focused).toBe(false);
    expect(r.disabled).toBe(false);
    expect(r.tabIndex).toBe(-1);
    expect(r.focusRef).toBeDefined();
    expect(typeof r.focus).toBe('function');
    expect(typeof r.blur).toBe('function');
    expect(typeof r.toggleFocus).toBe('function');
  });

  it('reflects defaultFocused', () => {
    const { get } = mount({ defaultFocused: true, focusStrategy: 'manual' });
    expect(get().focused).toBe(true);
  });

  it('disabled is true and tabIndex -1 when focusable is false', () => {
    const { get } = mount({ focusable: false });
    expect(get().disabled).toBe(true);
    expect(get().tabIndex).toBe(-1);
  });

  it('manual strategy yields tabIndex 0 regardless of focus', () => {
    const { get: blurred } = mount({ focusStrategy: 'manual' });
    expect(blurred().tabIndex).toBe(0);
    const { get: focused } = mount({ focusStrategy: 'manual', defaultFocused: true });
    expect(focused().tabIndex).toBe(0);
  });

  it('first strategy yields tabIndex 0 when focused, -1 when not', () => {
    const { get: notFocused } = mount({ focusStrategy: 'first' });
    expect(notFocused().tabIndex).toBe(-1);
    const { get: focused } = mount({ focusStrategy: 'first', defaultFocused: true });
    expect(focused().tabIndex).toBe(0);
  });

  it('programmatic strategy yields tabIndex 0 when focused, -1 when not', () => {
    const { get: notFocused } = mount({ focusStrategy: 'programmatic' });
    expect(notFocused().tabIndex).toBe(-1);
    const { get: focused } = mount({ focusStrategy: 'programmatic', defaultFocused: true });
    expect(focused().tabIndex).toBe(0);
  });

  it('auto strategy yields tabIndex 0 when focused, -1 when not', () => {
    const { get: notFocused } = mount({ focusStrategy: 'auto' });
    expect(notFocused().tabIndex).toBe(-1);
    const { get: focused } = mount({ focusStrategy: 'auto', defaultFocused: true });
    expect(focused().tabIndex).toBe(0);
  });

  it('handleFocus sets focused and calls onFocus', () => {
    const onFocus = vi.fn();
    const { get } = mount({ onFocus });
    run(() => get().handleFocus(focusEvent()));
    expect(get().focused).toBe(true);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('handleFocus does nothing when not focusable', () => {
    const onFocus = vi.fn();
    const { get } = mount({ focusable: false, onFocus });
    run(() => get().handleFocus(focusEvent()));
    expect(get().focused).toBe(false);
    expect(onFocus).not.toHaveBeenCalled();
  });

  it('handleBlur clears focused and calls onBlur', () => {
    const onBlur = vi.fn();
    const { get } = mount({ onBlur });
    run(() => get().handleFocus(focusEvent()));
    expect(get().focused).toBe(true);
    run(() => get().handleBlur(focusEvent()));
    expect(get().focused).toBe(false);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('focus() focuses the ref element when focusable', () => {
    const { get } = mount({});
    const el = get().focusRef.current!;
    const focusSpy = vi.spyOn(el, 'focus');
    run(() => get().focus());
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('focus() is a no-op when focusable is false', () => {
    const { get } = mount({ focusable: false });
    const el = get().focusRef.current!;
    const focusSpy = vi.spyOn(el, 'focus');
    run(() => get().focus());
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('blur() blurs the ref element', () => {
    const { get } = mount({});
    const el = get().focusRef.current!;
    const blurSpy = vi.spyOn(el, 'blur');
    run(() => get().blur());
    expect(blurSpy).toHaveBeenCalledTimes(1);
  });

  it('toggleFocus() focuses when not focused, blurs when focused', () => {
    const { get } = mount({ defaultFocused: false });
    const el = get().focusRef.current!;
    const focusSpy = vi.spyOn(el, 'focus');
    const blurSpy = vi.spyOn(el, 'blur');
    // not focused -> focus
    run(() => get().toggleFocus());
    expect(focusSpy).toHaveBeenCalledTimes(1);

    // mark focused then toggle -> blur
    run(() => get().handleFocus(focusEvent()));
    run(() => get().toggleFocus());
    expect(blurSpy).toHaveBeenCalledTimes(1);
  });

  it('handleKeyDown invokes keyboard.onKeyDown for navigation keys', () => {
    const onKeyDown = vi.fn();
    const keyboard: KeyboardNavigation = {
      focusable: true,
      navigationKeys: ['ArrowDown', 'Enter'] as NavigationKey[],
      onKeyDown,
    };
    const { get } = mount({ keyboard });
    const ev = keyEvent('ArrowDown');
    run(() => get().handleKeyDown(ev));
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    // The mixin forwards the native event to the consumer handler.
    expect(onKeyDown.mock.calls[0][0]).toBe(ev.nativeEvent);
  });

  it('handleKeyDown ignores keys not in navigationKeys', () => {
    const onKeyDown = vi.fn();
    const keyboard: KeyboardNavigation = {
      focusable: true,
      navigationKeys: ['ArrowUp'] as NavigationKey[],
      onKeyDown,
    };
    const { get } = mount({ keyboard });
    run(() => get().handleKeyDown(keyEvent('ArrowDown')));
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('handleKeyDown is a no-op when keyboard has no navigation keys', () => {
    const onKeyDown = vi.fn();
    const keyboard: KeyboardNavigation = {
      focusable: true,
      navigationKeys: [],
      onKeyDown,
    };
    const { get } = mount({ keyboard });
    run(() => get().handleKeyDown(keyEvent('Enter')));
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('handleKeyDown is a no-op when keyboard is undefined', () => {
    const { get } = mount({});
    expect(() => run(() => get().handleKeyDown(keyEvent('Enter')))).not.toThrow();
  });

  it('handleKeyUp invokes keyboard.onKeyUp for navigation keys', () => {
    const onKeyUp = vi.fn();
    const keyboard: KeyboardNavigation = {
      focusable: true,
      navigationKeys: ['Tab'] as NavigationKey[],
      onKeyUp,
    };
    const { get } = mount({ keyboard });
    run(() => get().handleKeyUp(keyEvent('Tab')));
    expect(onKeyUp).toHaveBeenCalledTimes(1);
  });

  it('handleKeyUp is a no-op for non-navigation keys', () => {
    const onKeyUp = vi.fn();
    const keyboard: KeyboardNavigation = {
      focusable: true,
      navigationKeys: ['Home'] as NavigationKey[],
      onKeyUp,
    };
    const { get } = mount({ keyboard });
    run(() => get().handleKeyUp(keyEvent('End')));
    expect(onKeyUp).not.toHaveBeenCalled();
  });

  it('handleKeyUp is a no-op when keyboard has no navigation keys', () => {
    const onKeyUp = vi.fn();
    const keyboard: KeyboardNavigation = {
      focusable: true,
      navigationKeys: [],
      onKeyUp,
    };
    const { get } = mount({ keyboard });
    expect(() => run(() => get().handleKeyUp(keyEvent('Enter')))).not.toThrow();
    expect(onKeyUp).not.toHaveBeenCalled();
  });

  it('blur() is a no-op when no element is bound to the ref', () => {
    // renderHook so focusRef.current is never attached to a DOM node.
    const { result } = renderHook(() => useFocusableMixin({}));
    expect(result.current.focusRef.current).toBeNull();
    expect(() => run(() => result.current.blur())).not.toThrow();
  });

  it('auto strategy autofocuses when defaultFocused is true (via setTimeout)', () => {
    vi.useFakeTimers();
    try {
      const { get } = mount({ defaultFocused: true, focusStrategy: 'auto' });
      const el = get().focusRef.current!;
      const focusSpy = vi.spyOn(el, 'focus');
      expect(focusSpy).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(focusSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('auto strategy does not autofocus when defaultFocused is false', () => {
    vi.useFakeTimers();
    try {
      const { get } = mount({ defaultFocused: false, focusStrategy: 'auto' });
      const el = get().focusRef.current!;
      const focusSpy = vi.spyOn(el, 'focus');
      act(() => vi.advanceTimersByTime(10));
      expect(focusSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('manual strategy with defaultFocused does not trigger autofocus effect', () => {
    vi.useFakeTimers();
    try {
      const { get } = mount({ defaultFocused: true, focusStrategy: 'manual' });
      const el = get().focusRef.current!;
      const focusSpy = vi.spyOn(el, 'focus');
      act(() => vi.advanceTimersByTime(10));
      expect(focusSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('programmatic strategy does not trigger autofocus effect', () => {
    vi.useFakeTimers();
    try {
      const { get } = mount({ defaultFocused: true, focusStrategy: 'programmatic' });
      const el = get().focusRef.current!;
      const focusSpy = vi.spyOn(el, 'focus');
      act(() => vi.advanceTimersByTime(10));
      expect(focusSpy).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('accepts and ignores unknown pass-through props', () => {
    const { get } = mount({ random: 'value', 'data-x': 1 } as FocusableMixinProps);
    expect(get().focused).toBe(false);
  });
});
