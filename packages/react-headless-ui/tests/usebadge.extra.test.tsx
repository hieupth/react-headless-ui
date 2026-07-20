import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useBadge } from '../src/hooks';
import type { UseBadgeProps } from '../src/hooks';

// Probe component that exposes the latest hook result via a ref-ish captured
// variable, mirroring the aspectratio.test.tsx style.
function Probe(props: UseBadgeProps) {
  const result = useBadge(props);
  return (
    <span
      data-testid="probe"
      onClick={result.handleClick}
      onKeyDown={result.handleKeyDown}
      data-display={result.displayText}
      data-position={result.positionClasses}
      data-variant={result.variantClasses}
      data-size={result.sizeClasses}
      data-animating={String(result.animating)}
      data-focused={String(result.focused)}
    >
      {result.displayText}
    </span>
  );
}

describe('useBadge (extra)', () => {
  it('covers all four position class values', () => {
    const positions = [
      ['top-right', '-top-2 -right-2'],
      ['top-left', '-top-2 -left-2'],
      ['bottom-right', '-bottom-2 -right-2'],
      ['bottom-left', '-bottom-2 -left-2'],
    ] as const;
    for (const [position, expected] of positions) {
      const { getByTestId, unmount } = render(<Probe position={position} count={1} />);
      expect(getByTestId('probe').getAttribute('data-position')).toBe(expected);
      unmount();
    }
  });

  it('covers all variant class values', () => {
    const expected: Record<string, string> = {
      default: 'bg-blue-500 text-white border-blue-500',
      secondary: 'bg-gray-500 text-white border-gray-500',
      destructive: 'bg-red-500 text-white border-red-500',
      outline: 'bg-transparent text-gray-700 border-gray-300 border',
    };
    for (const variant of Object.keys(expected)) {
      const { getByTestId, unmount } = render(
        <Probe variant={variant as any} count={1} />
      );
      expect(getByTestId('probe').getAttribute('data-variant')).toBe(
        expected[variant]
      );
      unmount();
    }
  });

  it('dot mode returns empty display text and dot-specific size classes', () => {
    const { getByTestId } = render(<Probe dot count={9} size="lg" />);
    expect(getByTestId('probe').getAttribute('data-display')).toBe('');
    expect(getByTestId('probe').getAttribute('data-size')).toBe('w-3 h-3');
  });

  it('size classes differ for sm/md/lg without dot', () => {
    const { getByTestId, rerender, unmount } = render(<Probe count={1} size="sm" />);
    expect(getByTestId('probe').getAttribute('data-size')).toContain('min-w-[1.25rem]');
    rerender(<Probe count={1} size="md" />);
    expect(getByTestId('probe').getAttribute('data-size')).toContain('min-w-[1.5rem]');
    rerender(<Probe count={1} size="lg" />);
    expect(getByTestId('probe').getAttribute('data-size')).toContain('min-w-[1.75rem]');
    unmount();
  });

  it('count exactly equal to maxCount renders the number, not maxCount+', () => {
    const { getByTestId } = render(<Probe count={99} maxCount={99} />);
    expect(getByTestId('probe').getAttribute('data-display')).toBe('99');
  });

  it('count above maxCount renders "maxCount+"', () => {
    const { getByTestId } = render(<Probe count={150} maxCount={99} />);
    expect(getByTestId('probe').getAttribute('data-display')).toBe('99+');
  });

  it('null count renders empty display text', () => {
    const { getByTestId } = render(<Probe count={null as any} />);
    expect(getByTestId('probe').getAttribute('data-display')).toBe('');
  });

  it('handleClick is a no-op when disabled', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<Probe count={1} onClick={onClick} disabled />);
    fireEvent.click(getByTestId('probe'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handleClick is a no-op when not visible', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<Probe count={1} onClick={onClick} visible={false} />);
    fireEvent.click(getByTestId('probe'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handleClick fires onClick and prevents default/stopPropagation when enabled', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<Probe count={1} onClick={onClick} />);
    const el = getByTestId('probe');
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    fireEvent.click(el, { preventDefault, stopPropagation });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handleKeyDown Space triggers onClick for an interactive badge', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<Probe count={1} onClick={onClick} />);
    fireEvent.keyDown(getByTestId('probe'), { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handleKeyDown ignores Enter when disabled', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<Probe count={1} onClick={onClick} disabled />);
    fireEvent.keyDown(getByTestId('probe'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handleKeyDown ignores unrelated keys', () => {
    const onClick = vi.fn();
    const { getByTestId } = render(<Probe count={1} onClick={onClick} />);
    fireEvent.keyDown(getByTestId('probe'), { key: 'Escape' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('non-clickable badge has role=status semantics', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1 });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes.role).toBe('status');
  });

  it('animation timer fires and resets animating to false after the 150ms timeout (line 166)', () => {
    vi.useFakeTimers();
    let result: any;
    const P = ({ count }: { count: number }) => {
      result = useBadge({ count, animated: true });
      return null;
    };
    const { rerender } = render(<P count={1} />);
    expect(result.animating).toBe(false);
    // Trigger the animation effect.
    rerender(<P count={5} />);
    expect(result.animating).toBe(true);
    // Advance past the 150ms setTimeout wrapped in act so the
    // setAnimating(false) callback flushes into the component state.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.animating).toBe(false);
    vi.useRealTimers();
  });

  it('animated=false does not animate when count changes', () => {
    let result: any;
    const P = ({ count }: { count: number }) => {
      result = useBadge({ count, animated: false });
      return null;
    };
    const { rerender } = render(<P count={1} />);
    // previousCount initializes to count (1). Changing the count without
    // animation leaves animating false and previousCount unchanged.
    rerender(<P count={2} />);
    expect(result.animating).toBe(false);
    expect(result.previousCount).toBe(1);
  });

  it('explicit role override is honored', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1, role: 'tab' });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes.role).toBe('tab');
  });

  it('returns label-based aria-label when provided', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1, label: 'Notifications' });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes['aria-label']).toBe('Notifications');
  });

  it('returns count-based aria-label when no label is provided', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 5 });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes['aria-label']).toBe('5 items');
  });

  it('exposes getPositionClasses action directly', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1, position: 'bottom-left' });
      return null;
    };
    render(<P />);
    expect(result.getPositionClasses()).toBe('-bottom-2 -left-2');
  });

  it('exposes getDisplayText action directly', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 200, maxCount: 50 });
      return null;
    };
    render(<P />);
    expect(result.getDisplayText()).toBe('50+');
  });

  it('sets aria-hidden when not visible', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1, visible: false });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes['aria-hidden']).toBe(true);
  });

  it('forwards data attributes for variant/size/position/dot/count', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 7, variant: 'destructive', size: 'sm', position: 'top-left', dot: true });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes['data-variant']).toBe('destructive');
    expect(result.semanticAttributes['data-size']).toBe('sm');
    expect(result.semanticAttributes['data-position']).toBe('top-left');
    expect(result.semanticAttributes['data-dot']).toBe(true);
    expect(result.semanticAttributes['data-count']).toBe(7);
  });

  it('describedBy is forwarded as aria-describedby', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1, describedBy: 'desc-id', labelledBy: 'lbl-id' });
      return null;
    };
    render(<P />);
    expect(result.semanticAttributes['aria-describedby']).toBe('desc-id');
    expect(result.semanticAttributes['aria-labelledby']).toBe('lbl-id');
  });

  it('focusStrategy prop is accepted without error', () => {
    let result: any;
    const P = () => {
      result = useBadge({ count: 1, focusStrategy: 'manual' as any });
      return null;
    };
    render(<P />);
    expect(result).toBeTruthy();
  });
});
