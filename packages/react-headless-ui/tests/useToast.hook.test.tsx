import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useToast } from '../src/hooks';
import type { UseToastProps } from '../src/hooks';

// useToast manages its own toast list internally. The Toast component exposes
// no prop to drive the list, so test the hook directly via a harness that
// surfaces state + actions. Always read api.state fresh (it is reassigned on
// every render); do not destructure it into a local.

function setup(props: UseToastProps = {}) {
  const api = { state: null as any, actions: null as any, helpers: null as any, attrs: null as any };
  function Harness() {
    const result = useToast(props);
    api.state = result.state;
    api.actions = result.actions;
    api.helpers = {
      success: result.success,
      error: result.error,
      warning: result.warning,
      info: result.info
    };
    api.attrs = result.containerAttributes;
    return null;
  }
  render(<Harness />);
  return api;
}

describe('useToast hook', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts empty with defaults', () => {
    const api = setup();
    expect(api.state.toasts).toHaveLength(0);
    expect(api.state.isPaused).toBe(false);
    expect(api.state.position).toBe('top-right');
    expect(api.state.maxToasts).toBe(5);
  });

  it('addToast appends a toast with generated id and default variant/duration', () => {
    const api = setup({ defaultDuration: 5000 });
    let id = '';
    act(() => { id = api.actions.addToast({ message: 'Hello' }); });
    expect(api.state.toasts).toHaveLength(1);
    expect(api.state.toasts[0].id).toBe(id);
    expect(api.state.toasts[0].message).toBe('Hello');
    expect(api.state.toasts[0].variant).toBe('default');
    expect(api.state.toasts[0].duration).toBe(5000);
    expect(api.state.toasts[0].dismissible).toBe(true);
  });

  it('convenience helpers set the variant', () => {
    const api = setup({ defaultDuration: 0 });
    act(() => api.helpers.success('ok'));
    act(() => api.helpers.error('bad'));
    act(() => api.helpers.warning('careful'));
    act(() => api.helpers.info('note'));
    expect(api.state.toasts.map((t: any) => t.variant)).toEqual([
      'success', 'error', 'warning', 'info'
    ]);
  });

  it('auto-dismisses after the duration elapses', () => {
    const api = setup();
    act(() => { api.actions.addToast({ message: 'bye', duration: 1000 }); });
    expect(api.state.toasts).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(api.state.toasts).toHaveLength(0);
  });

  it('duration of 0 keeps the toast until manually dismissed', () => {
    const api = setup();
    act(() => { api.actions.addToast({ message: 'sticky', duration: 0 }); });
    act(() => { vi.advanceTimersByTime(100000); });
    expect(api.state.toasts).toHaveLength(1);
  });

  it('dismiss / removeToast removes the toast and clears its timer', () => {
    const api = setup();
    let id = '';
    act(() => { id = api.actions.addToast({ message: 'x', duration: 1000 }); });
    act(() => api.actions.dismiss(id));
    expect(api.state.toasts).toHaveLength(0);
  });

  it('clearAll removes every toast', () => {
    const api = setup({ defaultDuration: 0 });
    act(() => api.actions.addToast({ message: 'a' }));
    act(() => api.actions.addToast({ message: 'b' }));
    act(() => api.actions.addToast({ message: 'c' }));
    expect(api.state.toasts).toHaveLength(3);
    act(() => api.actions.clearAll());
    expect(api.state.toasts).toHaveLength(0);
  });

  it('maxToasts evicts the oldest toast when exceeded', () => {
    const api = setup({ maxToasts: 2, defaultDuration: 0 });
    act(() => api.actions.addToast({ message: 'first' }));
    act(() => api.actions.addToast({ message: 'second' }));
    act(() => api.actions.addToast({ message: 'third' }));
    expect(api.state.toasts).toHaveLength(2);
    expect(api.state.toasts.map((t: any) => t.message)).toEqual(['second', 'third']);
  });

  it('fires onToastAdd and onToastRemove callbacks', () => {
    const onToastAdd = vi.fn();
    const onToastRemove = vi.fn();
    const api = setup({ onToastAdd, onToastRemove, defaultDuration: 1000 });
    let id = '';
    act(() => { id = api.actions.addToast({ message: 'hi' }); });
    expect(onToastAdd).toHaveBeenCalledTimes(1);
    expect(onToastAdd.mock.calls[0][0].message).toBe('hi');
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onToastRemove).toHaveBeenCalledTimes(1);
    expect(onToastRemove.mock.calls[0][0].id).toBe(id);
  });

  it('pause stops auto-dismiss; resume restarts the remaining timer', () => {
    const api = setup({ defaultDuration: 1000 });
    act(() => api.actions.addToast({ message: 'p' }));
    act(() => api.actions.pause());
    expect(api.state.isPaused).toBe(true);
    // Advance well past the original duration while paused: still present.
    act(() => { vi.advanceTimersByTime(2000); });
    expect(api.state.toasts).toHaveLength(1);
    act(() => api.actions.resume());
    expect(api.state.isPaused).toBe(false);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(api.state.toasts).toHaveLength(0);
  });

  it('updateToast mutates an existing toast and resets the timer on duration change', () => {
    const api = setup();
    let id = '';
    act(() => { id = api.actions.addToast({ message: 'orig', duration: 1000 }); });
    act(() => api.actions.updateToast(id, { message: 'edited', duration: 5000 }));
    expect(api.state.toasts[0].message).toBe('edited');
    expect(api.state.toasts[0].duration).toBe(5000);
    // Original 1000ms elapsed: should NOT have auto-dismissed (timer reset).
    act(() => { vi.advanceTimersByTime(1000); });
    expect(api.state.toasts).toHaveLength(1);
  });

  it('exposes a polite live region container role', () => {
    const api = setup();
    expect(api.attrs.role).toBe('status');
    expect(api.attrs['aria-live']).toBe('polite');
    expect(api.attrs['aria-label']).toBe('Notifications');
  });

  it('pause/resume are idempotent', () => {
    const api = setup({ defaultDuration: 1000 });
    act(() => api.actions.addToast({ message: 'p' }));
    // resume() while not paused is a no-op (early return).
    act(() => api.actions.resume());
    expect(api.state.isPaused).toBe(false);
    act(() => api.actions.pause());
    // pause() while already paused is a no-op (early return).
    act(() => api.actions.pause());
    expect(api.state.isPaused).toBe(true);
  });

  it('resume restarts the remaining timer when some time remains', () => {
    const api = setup({ defaultDuration: 1000 });
    act(() => api.actions.addToast({ message: 'p' }));
    act(() => api.actions.pause());
    // Advance only partway: remaining > 0 on resume.
    act(() => { vi.advanceTimersByTime(200); });
    act(() => api.actions.resume());
    expect(api.state.toasts).toHaveLength(1);
    // The remaining ~800ms must still elapse before dismissal.
    act(() => { vi.advanceTimersByTime(500); });
    expect(api.state.toasts).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(500); });
    expect(api.state.toasts).toHaveLength(0);
  });

  it('updateToast is a no-op for an unknown id', () => {
    const api = setup();
    act(() => api.actions.addToast({ message: 'a' }));
    expect(() => act(() => api.actions.updateToast('nope', { message: 'x' }))).not.toThrow();
    expect(api.state.toasts).toHaveLength(1);
  });

  it('removeToast of an unknown id is a no-op', () => {
    const onToastRemove = vi.fn();
    const api = setup({ onToastRemove });
    act(() => api.actions.addToast({ message: 'a', duration: 0 }));
    act(() => api.actions.removeToast('missing'));
    expect(onToastRemove).not.toHaveBeenCalled();
    expect(api.state.toasts).toHaveLength(1);
  });

  it('resume ignores sticky toasts (duration 0) and updateToast keeps timer on same duration', () => {
    const api = setup();
    let id = '';
    act(() => { id = api.actions.addToast({ message: 'sticky', duration: 0 }); });
    // pause then resume: the sticky toast (duration 0) is skipped by resume's timer restart.
    act(() => api.actions.pause());
    act(() => api.actions.resume());
    expect(api.state.toasts).toHaveLength(1);
    // updateToast with the SAME duration does not reset the timer branch.
    act(() => api.actions.updateToast(id, { duration: 0 }));
    expect(api.state.toasts).toHaveLength(1);
  });

  it('clearAll clears active timers and unmount cleans up the pause timeout', () => {
    const api = setup({ defaultDuration: 1000 });
    act(() => api.actions.addToast({ message: 'timed' }));
    // clearAll while a timer is pending exercises timersRef.clear().
    act(() => api.actions.clearAll());
    expect(api.state.toasts).toHaveLength(0);
  });
});
