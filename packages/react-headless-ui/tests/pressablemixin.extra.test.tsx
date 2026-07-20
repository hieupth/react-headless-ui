import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, cleanup } from '@testing-library/react';
import { usePressableMixin, type PressableMixinProps } from '../src/mixins/PressableMixin';

type Result = ReturnType<typeof usePressableMixin>;

/**
 * Harness: the mixin runs inside React's render lifecycle. The latest returned
 * value is stored in a ref that updates on every render, so tests always read
 * fresh state after `act()` flushes re-renders. The returned handlers are also
 * bound to a real <div> so user-event-style interactions work, but we mostly
 * drive handlers directly.
 */
function mount(props: PressableMixinProps) {
  const live = { current: null as Result | null };
  function Probe() {
    live.current = usePressableMixin(props);
    return (
      <div
        data-testid="target"
        onMouseDown={live.current.handleMouseDown}
        onMouseUp={live.current.handleMouseUp}
        onMouseEnter={live.current.handleMouseEnter}
        onMouseLeave={live.current.handleMouseLeave}
        onTouchStart={live.current.handleTouchStart}
        onTouchEnd={live.current.handleTouchEnd}
        onClick={live.current.handleClick}
        onKeyDown={live.current.handleKeyDown}
      />
    );
  }
  const utils = render(<Probe />);
  const get = () => live.current!;
  return { get, ...utils };
}

function mouseEvent(partial: Partial<React.MouseEvent> = {}): React.MouseEvent {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    buttons: 0,
    ...partial,
  } as unknown as React.MouseEvent;
}

function touchEvent(partial: Partial<React.TouchEvent> = {}): React.TouchEvent {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...partial,
  } as unknown as React.TouchEvent;
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

/** Invoke a handler inside act() so React flushes state updates. */
function run(fn: () => void) {
  act(() => fn());
}

describe('usePressableMixin', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('exposes initial state with defaults', () => {
    const { get } = mount({});
    const r = get();
    expect(r.pressed).toBe(false);
    expect(r.disabled).toBe(false);
    expect(r.longPressed).toBe(false);
    expect(r.pressCount).toBe(0);
    expect(typeof r.press).toBe('function');
    expect(typeof r.reset).toBe('function');
  });

  it('reflects defaultPressed initial value and disabled flag', () => {
    const { get } = mount({ defaultPressed: true, disabled: true });
    expect(get().pressed).toBe(true);
    expect(get().disabled).toBe(true);
  });

  it('sets disabled when pressable is false', () => {
    const { get } = mount({ pressable: false });
    expect(get().disabled).toBe(true);
  });

  it('mouse down/up drives pressed state and start/end handlers', () => {
    const onPressStart = vi.fn();
    const onPressEnd = vi.fn();
    const { get } = mount({ onPressStart, onPressEnd });

    run(() => get().handleMouseDown(mouseEvent()));
    expect(get().pressed).toBe(true);
    expect(onPressStart).toHaveBeenCalledTimes(1);

    run(() => get().handleMouseUp(mouseEvent()));
    expect(get().pressed).toBe(false);
    expect(onPressEnd).toHaveBeenCalledTimes(1);
  });

  it('calls preventDefault on mouse down when preventDefault is set', () => {
    const { get } = mount({ preventDefault: true });
    const ev = mouseEvent();
    run(() => get().handleMouseDown(ev));
    expect(ev.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does nothing on mouse down when disabled', () => {
    const onPressStart = vi.fn();
    const { get } = mount({ disabled: true, onPressStart });
    run(() => get().handleMouseDown(mouseEvent()));
    expect(get().pressed).toBe(false);
    expect(onPressStart).not.toHaveBeenCalled();
  });

  it('does nothing on mouse down when pressable is false', () => {
    const onPressStart = vi.fn();
    const { get } = mount({ pressable: false, onPressStart });
    run(() => get().handleMouseDown(mouseEvent()));
    expect(onPressStart).not.toHaveBeenCalled();
  });

  it('mouse enter re-presses only when button is held and already pressing', () => {
    const { get } = mount({});
    run(() => get().handleMouseDown(mouseEvent()));
    run(() => get().handleMouseLeave(mouseEvent()));
    expect(get().pressed).toBe(false);
    run(() => get().handleMouseEnter(mouseEvent({ buttons: 1 })));
    expect(get().pressed).toBe(true);
  });

  it('mouse enter does nothing when button not held', () => {
    const { get } = mount({});
    run(() => get().handleMouseDown(mouseEvent()));
    run(() => get().handleMouseLeave(mouseEvent()));
    run(() => get().handleMouseEnter(mouseEvent({ buttons: 0 })));
    expect(get().pressed).toBe(false);
  });

  it('mouse leave releases the press', () => {
    const { get } = mount({});
    run(() => get().handleMouseDown(mouseEvent()));
    run(() => get().handleMouseLeave(mouseEvent()));
    expect(get().pressed).toBe(false);
  });

  it('mouse leave does nothing when not pressed', () => {
    const { get } = mount({});
    // leaving without prior press -> no state change, no throw
    run(() => get().handleMouseLeave(mouseEvent()));
    expect(get().pressed).toBe(false);
  });

  it('touch start/end drive pressed state and call preventDefault when configured', () => {
    const { get } = mount({ preventDefault: true });
    const tEv = touchEvent();
    run(() => get().handleTouchStart(tEv));
    expect(tEv.preventDefault).toHaveBeenCalledTimes(1);
    expect(get().pressed).toBe(true);

    run(() => get().handleTouchEnd(touchEvent()));
    expect(get().pressed).toBe(false);
  });

  it('touch start does not call preventDefault when not configured', () => {
    const { get } = mount({});
    const tEv = touchEvent();
    run(() => get().handleTouchStart(tEv));
    expect(tEv.preventDefault).not.toHaveBeenCalled();
    expect(get().pressed).toBe(true);
  });

  it('click increments pressCount and fires onPress', () => {
    const onPress = vi.fn();
    const { get } = mount({ onPress });
    run(() => get().handleClick(mouseEvent()));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(get().pressCount).toBe(1);
    run(() => get().handleClick(mouseEvent()));
    expect(onPress).toHaveBeenCalledTimes(2);
    expect(get().pressCount).toBe(2);
  });

  it('click calls preventDefault when configured', () => {
    const { get } = mount({ preventDefault: true });
    const ev = mouseEvent();
    run(() => get().handleClick(ev));
    expect(ev.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('click does nothing when disabled or not pressable', () => {
    const onPress = vi.fn();
    const { get: getDisabled } = mount({ onPress, disabled: true });
    run(() => getDisabled().handleClick(mouseEvent()));
    expect(onPress).not.toHaveBeenCalled();

    const { get: getNotPressable } = mount({ onPress, pressable: false });
    run(() => getNotPressable().handleClick(mouseEvent()));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('key down Enter/Space start a press and preventDefault when configured', () => {
    const onPressStart = vi.fn();
    const { get } = mount({ onPressStart, preventDefault: true });

    const enter = keyEvent('Enter');
    run(() => get().handleKeyDown(enter));
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(enter.preventDefault).toHaveBeenCalledTimes(1);

    const space = keyEvent(' ');
    run(() => get().handleKeyDown(space));
    expect(onPressStart).toHaveBeenCalledTimes(2);
    expect(space.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('key down Enter/Space start a press without preventDefault when not configured', () => {
    const onPressStart = vi.fn();
    const { get } = mount({ onPressStart });
    const enter = keyEvent('Enter');
    run(() => get().handleKeyDown(enter));
    expect(onPressStart).toHaveBeenCalledTimes(1);
    expect(enter.preventDefault).not.toHaveBeenCalled();
  });

  it('key down ignores non-activation keys', () => {
    const onPressStart = vi.fn();
    const { get } = mount({ onPressStart });
    run(() => get().handleKeyDown(keyEvent('Tab')));
    expect(onPressStart).not.toHaveBeenCalled();
  });

  it('key down does nothing when disabled', () => {
    const onPressStart = vi.fn();
    const { get } = mount({ disabled: true, onPressStart });
    run(() => get().handleKeyDown(keyEvent('Enter')));
    expect(onPressStart).not.toHaveBeenCalled();
  });

  it('fires long press after the configured duration', () => {
    const onLongPress = vi.fn();
    const { get } = mount({ onLongPress, longPressDuration: 500 });
    run(() => get().handleMouseDown(mouseEvent()));
    expect(get().longPressed).toBe(false);
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(get().longPressed).toBe(true);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('does not schedule long press when duration is 0', () => {
    const onLongPress = vi.fn();
    const { get } = mount({ onLongPress, longPressDuration: 0 });
    run(() => get().handleMouseDown(mouseEvent()));
    act(() => vi.advanceTimersByTime(1000));
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('clears long-press timer on press end', () => {
    const onLongPress = vi.fn();
    const { get } = mount({ onLongPress, longPressDuration: 500 });
    run(() => get().handleMouseDown(mouseEvent()));
    run(() => get().handleMouseUp(mouseEvent()));
    act(() => vi.advanceTimersByTime(1000));
    expect(onLongPress).not.toHaveBeenCalled();
    expect(get().longPressed).toBe(false);
  });

  it('reset() clears pressed state and resets pressCount', () => {
    const onPress = vi.fn();
    const { get } = mount({ onPress });
    run(() => get().press());
    run(() => get().press());
    expect(get().pressCount).toBe(2);
    run(() => get().reset());
    expect(get().pressCount).toBe(0);
  });

  it('press() increments count and fires onPress, respecting disabled', () => {
    const onPress = vi.fn();
    const { get } = mount({ onPress });
    run(() => get().press());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(get().pressCount).toBe(1);

    const { get: getDisabled } = mount({ onPress, disabled: true });
    run(() => getDisabled().press());
    expect(get().pressCount).toBe(1);
  });

  it('press() respects pressable=false', () => {
    const onPress = vi.fn();
    const { get } = mount({ onPress, pressable: false });
    run(() => get().press());
    expect(onPress).not.toHaveBeenCalled();
    expect(get().pressCount).toBe(0);
  });

  it('onPress can be an async function', async () => {
    let resolved = false;
    const { get } = mount({
      onPress: async () => {
        await Promise.resolve();
        resolved = true;
      },
    });
    await act(async () => {
      await get().press();
    });
    expect(resolved).toBe(true);
  });
});
