import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useAlert } from '../src/hooks';
import type { UseAlertReturns } from '../src/hooks/useAlert';

type ProbeRef = { current: UseAlertReturns | null };

const Probe = ({ rref, props }: { rref: ProbeRef; props: any }) => {
  rref.current = useAlert(props);
  return null;
};

const renderProbe = (ref: ProbeRef, props: any) =>
  render(<Probe rref={ref} props={props} />);

describe('useAlert (extra coverage)', () => {
  it('maps success severity -> success variant', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, severity: 'success' });
    expect(ref.current!.computedVariant).toBe('success');
    expect(ref.current!.computedSeverity).toBe('success');
  });

  it('maps warning severity -> warning variant', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, severity: 'warning' });
    expect(ref.current!.computedVariant).toBe('warning');
  });

  it('maps destructive variant -> error severity (and info default)', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, variant: 'destructive' });
    expect(ref.current!.computedSeverity).toBe('error');

    const ref2: ProbeRef = { current: null };
    renderProbe(ref2, { open: true });
    expect(ref2.current!.computedVariant).toBe('default');
    expect(ref2.current!.computedSeverity).toBe('info');
  });

  it('focuses the first focusable element when focusStrategy is "first" and open', () => {
    const ref: ProbeRef = { current: null };
    const Probe = () => {
      ref.current = useAlert({ open: true, focusStrategy: 'first' });
      return (
        <div ref={ref.current!.alertRef}>
          <button>One</button>
          <button>Two</button>
        </div>
      );
    };
    render(<Probe />);
    // The first focusable element should have received focus.
    const buttons = document.querySelectorAll('button');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('does not crash when focusStrategy is "first" but no focusables exist', () => {
    const ref: ProbeRef = { current: null };
    const Probe = () => {
      ref.current = useAlert({ open: true, focusStrategy: 'first' });
      return <div ref={ref.current!.alertRef}>no focusables</div>;
    };
    expect(() => render(<Probe />)).not.toThrow();
  });

  it('skips first-focus when disabled even if focusStrategy is "first"', () => {
    const ref: ProbeRef = { current: null };
    const Probe = () => {
      ref.current = useAlert({ open: true, focusStrategy: 'first', disabled: true });
      return (
        <div ref={ref.current!.alertRef}>
          <button>One</button>
        </div>
      );
    };
    render(<Probe />);
    expect(document.activeElement).not.toBe(document.querySelector('button'));
  });

  it('dismiss() is a no-op while already dismissing', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, dismissible: true, onDismiss, onOpenChange: () => {} });
    act(() => ref.current!.dismiss());
    expect(onDismiss).toHaveBeenCalledTimes(1);
    // Call again before the 150ms timeout elapses -> guarded by `dismissing`.
    act(() => ref.current!.dismiss());
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('dismiss() is a no-op when disabled', () => {
    const onDismiss = vi.fn();
    const onOpenChange = vi.fn();
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, disabled: true, onDismiss, onOpenChange });
    act(() => ref.current!.dismiss());
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('show() is a no-op when disabled', () => {
    const onOpenChange = vi.fn();
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: false, disabled: true, onOpenChange });
    act(() => ref.current!.show());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('dismiss() triggers onOpenChange(false) after the animation delay', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, onOpenChange });
    act(() => ref.current!.dismiss());
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    vi.useRealTimers();
  });

  it('Enter key dismisses a dismissible alert (preventDefault)', () => {
    const onDismiss = vi.fn();
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, dismissible: true, onDismiss, onOpenChange: () => {} });
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn(), configurable: true });
    act(() => {
      ref.current!.handleKeyDown(event as any);
    });
    expect((event.preventDefault as any)).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('handleKeyDown does not dismiss when not dismissible', () => {
    const onDismiss = vi.fn();
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, dismissible: false, onDismiss });
    act(() => {
      ref.current!.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('semanticAttributes expose data-state, data-variant, data-severity and aria-live', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, variant: 'warning' });
    const attrs = ref.current!.semanticAttributes;
    expect(attrs['data-state']).toBe('open');
    expect(attrs['data-variant']).toBe('warning');
    expect(attrs['data-severity']).toBe('warning');
    expect(attrs['aria-live']).toBe('polite');
    expect(attrs['aria-atomic']).toBe('true');
  });

  it('aria-live is assertive for error severity and data-state is closed when closed', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: false, severity: 'error' });
    const attrs = ref.current!.semanticAttributes;
    expect(attrs['aria-live']).toBe('assertive');
    expect(attrs['data-state']).toBe('closed');
  });

  it('autoDismiss schedules dismiss and cleans up the timer on unmount/close', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const autoRef: ProbeRef = { current: null };
    const { unmount } = renderProbe(autoRef, {
      open: true,
      autoDismiss: 1000,
      onDismiss,
      onOpenChange: () => {},
    });
    // Unmount before timer fires -> cleanup should run without invoking onDismiss.
    unmount();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('uses describedBy derived from description when no describedBy is supplied', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, description: 'a message' });
    const attrs = ref.current!.semanticAttributes;
    expect(attrs['aria-describedby']).toBe('alert-description');
  });

  it('uses explicit describedBy when supplied', () => {
    const ref: ProbeRef = { current: null };
    renderProbe(ref, { open: true, describedBy: 'my-desc' });
    expect(ref.current!.semanticAttributes['aria-describedby']).toBe('my-desc');
  });
});
