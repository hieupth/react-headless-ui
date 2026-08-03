"use client";
/**
 * Countdown headless hook following Flutter patterns.
 * Provides behavior-only countdown to a target date/time.
 *
 * The hook is client-oriented: remaining time is derived from `Date.now()` on
 * each render and updated on an interval. Under Next.js static export the
 * initial server render happens at build time while the client render happens
 * at load time, so the two can differ. Consumers displaying a live countdown
 * should render it behind `next/dynamic` with `ssr: false` (or guard on a
 * mounted flag) to avoid a hydration mismatch — exactly like the template's
 * jQuery countdown, which is client-only.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/** Target may be a Date, a epoch-ms number, or a parseable date string. */
export type CountdownTarget = Date | number | string;

export interface UseCountdownProps {
  /** The instant to count down to. */
  targetDate: CountdownTarget;
  /** Tick interval in milliseconds. @default 1000 */
  interval?: number;
  /** Start ticking immediately on mount. @default true */
  autoStart?: boolean;
  /** Fired on every tick with the latest remaining time. */
  onTick?: (remaining: CountdownRemaining) => void;
  /** Fired once when the countdown reaches zero. */
  onComplete?: () => void;
}

export interface CountdownRemaining {
  /** Whole days remaining. */
  days: number;
  /** Hours remaining (0–23, after days are subtracted). */
  hours: number;
  /** Minutes remaining (0–59). */
  minutes: number;
  /** Seconds remaining (0–59). */
  seconds: number;
  /** Total milliseconds remaining (>= 0). */
  totalMs: number;
  /** Total whole seconds remaining (>= 0). */
  totalSeconds: number;
}

export interface UseCountdownReturns extends CountdownRemaining {
  /** True once the target is reached (remaining is zero). */
  isComplete: boolean;
  /** True while the countdown is actively ticking. */
  isRunning: boolean;
  /** True while ticking is paused. */
  isPaused: boolean;
  /** Start (or restart) the countdown. */
  start: () => void;
  /** Pause ticking without resetting the remaining time. */
  pause: () => void;
  /** Resume ticking after a pause. */
  resume: () => void;
  /** Stop and recompute remaining from the current target. */
  reset: () => void;
}

/** Normalize any accepted target into an epoch-ms timestamp. */
function normalizeTarget(target: CountdownTarget): number {
  if (target instanceof Date) return target.getTime();
  if (typeof target === 'number') return target; // assume epoch ms
  return new Date(target).getTime();
}

/** Split a target timestamp's distance from `now` into the remaining units. */
function computeRemaining(targetTs: number, now: number = Date.now()): CountdownRemaining {
  let diff = targetTs - now;
  if (diff < 0) diff = 0;
  const totalMs = diff;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalMs, totalSeconds };
}

/**
 * Headless countdown hook. Returns a flat bag of remaining units plus running
 * state and control actions. Re-renders each tick via `setInterval`; the
 * interval is torn down on pause/complete/unmount.
 */
export function useCountdown(props: UseCountdownProps): UseCountdownReturns {
  const { targetDate, interval = 1000, autoStart = true, onTick, onComplete } = props;

  const targetTs = useMemo(() => normalizeTarget(targetDate), [targetDate]);

  const [remaining, setRemaining] = useState<CountdownRemaining>(() => computeRemaining(targetTs));
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);

  // Keep the latest callbacks without forcing the ticking effect to re-subscribe.
  const onTickRef = useRef(onTick);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Recompute when the target itself changes (e.g. countdown to a new date).
  useEffect(() => {
    setRemaining(computeRemaining(targetTs));
  }, [targetTs]);

  // Ticking effect: subscribes only while running and not paused.
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const runTick = () => {
      const next = computeRemaining(targetTs);
      setRemaining(next);
      onTickRef.current?.(next);
      if (next.totalMs <= 0) {
        setIsRunning(false);
        onCompleteRef.current?.();
      }
    };

    runTick(); // sync immediately, then on the interval
    const id = setInterval(runTick, interval);
    return () => clearInterval(id);
  }, [isRunning, isPaused, targetTs, interval]);

  const start = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    setIsPaused(false);
    setIsRunning(autoStart);
    setRemaining(computeRemaining(targetTs));
  }, [autoStart, targetTs]);

  return {
    ...remaining,
    isComplete: remaining.totalMs <= 0,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
  };
}
