import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useAspectRatio } from '../src/hooks';

const Probe = (props: any) => {
  // eslint-disable-next-line react/no-danger
  const result = useAspectRatio(props);
  return (
    <div
      data-testid="container"
      ref={result.containerRef as any}
      style={{ width: 200, height: 100 }}
    >
      <span data-testid="payload">{JSON.stringify(result.state.dimensions)}</span>
      <HiddenResult result={result} />
    </div>
  );
};

const HiddenResult = ({ result }: any) => {
  (globalThis as any).__result = result;
  return null;
};

const getResult = () => (globalThis as any).__result;

describe('useAspectRatio (extra coverage)', () => {
  it('uses the default label when none is supplied', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({}); return null; };
    render(<P />);
    expect(ref.current.props['aria-label']).toBe('Content with aspect ratio 1.7777777777777777:1');
  });

  it('uses an explicit label when supplied', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({ label: 'Hero image' }); return null; };
    render(<P />);
    expect(ref.current.props['aria-label']).toBe('Hero image');
  });

  it('applies relative positioning style with paddingBottom from the ratio', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({ ratio: 4 / 3 }); return null; };
    render(<P />);
    expect(ref.current.props.style.position).toBe('relative');
    expect(ref.current.props.style.width).toBe('100%');
    expect(ref.current.props.style.paddingBottom).toBe(`${(1 / (4 / 3)) * 100}%`);
  });

  it('marks the component as a client after mount', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({}); return null; };
    render(<P />);
    expect(ref.current.state.isClient).toBe(true);
  });

  it('disabled state short-circuits dimension calculation (dimensions stay zero)', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({ disabled: true }); return null; };
    render(<P />);
    expect(ref.current.state.disabled).toBe(true);
    expect(ref.current.state.dimensions).toEqual({ width: 0, height: 0 });
  });

  it('recalculate() is a no-op when the container ref is not attached', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({ ratio: 2 }); return null; };
    render(<P />);
    // containerRef.current is null because Probe never attached it.
    expect(() => {
      act(() => ref.current.actions.recalculate());
    }).not.toThrow();
    expect(ref.current.state.dimensions).toEqual({ width: 0, height: 0 });
  });

  it('recalculate() updates dimensions when the container is mounted with a width', () => {
    render(<Probe ratio={2} />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;
    // jsdom returns 0 for offsetWidth by default; stub it to exercise the happy path.
    Object.defineProperty(container, 'offsetWidth', { configurable: true, value: 300 });
    const before = getResult();
    act(() => {
      before.actions.recalculate();
    });
    // Read the fresh result after the state update.
    const after = getResult();
    expect(after.state.dimensions.width).toBe(300);
    expect(after.state.dimensions.height).toBe(150);
  });

  it('disabled toggle re-runs the effect without observing the container', () => {
    const { rerender } = render(<Probe disabled ratio={1} />);
    const before = getResult();
    expect(before.state.dimensions).toEqual({ width: 0, height: 0 });
    // Re-enable: effect re-runs and tries to calculate (offsetWidth is 0 in jsdom).
    rerender(<Probe disabled={false} ratio={1} />);
    const after = getResult();
    expect(after.state.disabled).toBe(false);
  });

  it('responds to window resize events', () => {
    render(<Probe ratio={4 / 3} />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;
    Object.defineProperty(container, 'offsetWidth', { configurable: true, value: 400 });
    act(() => {
      fireEvent(window, new Event('resize'));
    });
    const result = getResult();
    expect(result.state.dimensions.width).toBe(400);
    expect(result.state.dimensions.height).toBeCloseTo(300, 5);
  });

  it('ResizeObserver callback triggers recalculation', () => {
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();
    let roCb: (() => void) | null = null;
    const RealRO = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(cb: any) { roCb = cb; }
      observe = observeSpy;
      unobserve() {}
      disconnect = disconnectSpy;
    } as any;
    try {
      render(<Probe ratio={1} />);
      expect(observeSpy).toHaveBeenCalled();
      const container = document.querySelector('[data-testid="container"]') as HTMLElement;
      Object.defineProperty(container, 'offsetWidth', { configurable: true, value: 250 });
      act(() => {
        roCb!();
      });
      const result = getResult();
      expect(result.state.dimensions.width).toBe(250);
    } finally {
      globalThis.ResizeObserver = RealRO;
    }
  });

  it('disconnects the ResizeObserver and removes the resize listener on unmount', () => {
    const disconnectSpy = vi.fn();
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const RealRO = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect = disconnectSpy;
    } as any;
    try {
      const { unmount } = render(<Probe ratio={1} />);
      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    } finally {
      globalThis.ResizeObserver = RealRO;
      removeSpy.mockRestore();
    }
  });

  it('forwards extra semantic props (role) into the composed props', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAspectRatio({ role: 'figure' }); return null; };
    render(<P />);
    expect(ref.current.props.role).toBe('figure');
  });
});
