import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useCountdown } from '../src/hooks';
import type { UseCountdownProps, UseCountdownReturns } from '../src/hooks';

// Fixed "now" so Date.now()-based math is deterministic under fake timers.
const NOW = Date.UTC(2026, 0, 1, 0, 0, 0);

let result: UseCountdownReturns | undefined;
const Probe = (props: UseCountdownProps) => {
  result = useCountdown(props);
  return null;
};

describe('useCountdown', () => {
  beforeEach(() => {
    result = undefined;
    vi.useFakeTimers({ now: NOW });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('splits the remaining distance into days/hours/minutes/seconds', () => {
    const target = NOW + 3 * 86400_000 + 2 * 3600_000 + 5 * 60_000 + 10_000; // 3d 2h 5m 10s
    render(<Probe targetDate={target} />);
    expect(result!.days).toBe(3);
    expect(result!.hours).toBe(2);
    expect(result!.minutes).toBe(5);
    expect(result!.seconds).toBe(10);
    expect(result!.isComplete).toBe(false);
    expect(result!.isRunning).toBe(true);
  });

  it('counts down one second per tick', () => {
    const target = NOW + 10_000; // 10s
    render(<Probe targetDate={target} />);
    expect(result!.seconds).toBe(10);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result!.seconds).toBe(9);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result!.seconds).toBe(8);
  });

  it('completes and stops when the target is in the past', () => {
    render(<Probe targetDate={NOW - 1000} />);
    expect(result!.isComplete).toBe(true);
    expect(result!.seconds).toBe(0);
    expect(result!.totalMs).toBe(0);
    expect(result!.isRunning).toBe(false);
  });

  it('pauses updates and resumes synced to the current time', () => {
    const target = NOW + 10_000;
    render(<Probe targetDate={target} />);
    expect(result!.seconds).toBe(10);

    act(() => { result!.pause(); });
    expect(result!.isPaused).toBe(true);
    // While paused the interval is cleared, so the displayed value is frozen...
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result!.seconds).toBe(10);
    // ...but real (mocked) time has moved on, so resuming jumps to "now".
    act(() => { result!.resume(); });
    expect(result!.seconds).toBe(7);
  });

  it('reset recomputes remaining from the current time and clears pause', () => {
    const target = NOW + 10_000;
    render(<Probe targetDate={target} />);
    act(() => { vi.advanceTimersByTime(3000); }); // 7s left
    expect(result!.seconds).toBe(7);
    act(() => { result!.pause(); });
    act(() => { vi.advanceTimersByTime(2000); }); // now = NOW+5000, 5s left
    act(() => { result!.reset(); });
    expect(result!.seconds).toBe(5);
    expect(result!.isPaused).toBe(false);
    expect(result!.isRunning).toBe(true);
  });

  it('fires onTick each tick and onComplete exactly once at zero', () => {
    const onTick = vi.fn();
    const onComplete = vi.fn();
    render(<Probe targetDate={NOW + 500} interval={1000} onTick={onTick} onComplete={onComplete} />);
    // One immediate tick fires on mount.
    expect(onTick).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(1000); }); // target passed -> zero
    expect(onComplete).toHaveBeenCalledTimes(1);
    // No further complete fires after the countdown stops.
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('accepts Date, number, and string targets equivalently', () => {
    const offset = 86400_000 + 3600_000; // 1d 1h
    const { rerender } = render(<Probe targetDate={NOW + offset} />);
    expect(result!.days).toBe(1);
    expect(result!.hours).toBe(1);

    rerender(<Probe targetDate={new Date(NOW + offset)} />);
    expect(result!.days).toBe(1);
    expect(result!.hours).toBe(1);

    rerender(<Probe targetDate={new Date(NOW + offset).toISOString()} />);
    expect(result!.days).toBe(1);
    expect(result!.hours).toBe(1);
  });
});
