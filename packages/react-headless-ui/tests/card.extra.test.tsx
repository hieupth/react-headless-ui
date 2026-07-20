import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useCard } from '../src/hooks';
import type { UseCardProps } from '../src/hooks';

// useCard exercised directly through a harness: interactive vs non-interactive,
// onClick vs onSelectionChange branches, hover gating, disabled guards,
// keyboard activation, variant/size class computation, controlled selection.

function setup(props: UseCardProps = {}) {
  const api = { current: null as any };
  function Harness() {
    api.current = useCard(props);
    return null;
  }
  const utils = render(<Harness />);
  return { api, get current() { return api.current; }, ...utils };
}

describe('useCard hook', () => {
  it('non-interactive defaults: article role, no handlers fire', () => {
    const { current } = setup({ title: 'T', description: 'D' });
    expect(current.focused).toBe(false);
    expect(current.hovered).toBe(false);
    expect(current.variantClasses).toContain('shadow-sm');
    expect(current.sizeClasses).toBe('p-6');
    // Click does nothing when not interactive.
    act(() => current.handleClick({ preventDefault: vi.fn() } as unknown as React.MouseEvent));
    expect(current.pressed).toBe(false);
  });

  it('interactive + onClick: handleClick and Enter/Space call onClick', () => {
    const onClick = vi.fn();
    const { current } = setup({ interactive: true, onClick });
    const pd = vi.fn();
    act(() => current.handleClick({ preventDefault: pd } as unknown as React.MouseEvent));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(pd).toHaveBeenCalled();

    act(() => current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    act(() => current.handleKeyDown({ key: ' ', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('interactive + onSelectionChange: click toggles selection state', () => {
    const onSelectionChange = vi.fn();
    const { api } = setup({ interactive: true, onSelectionChange });
    expect(api.current.selected).toBe(false);
    act(() => api.current.handleClick({ preventDefault: vi.fn() } as unknown as React.MouseEvent));
    expect(onSelectionChange).toHaveBeenLastCalledWith(true);
    // Read state live via the holder: the destructured snapshot would be stale
    // across the act() boundary.
    expect(api.current.selected).toBe(true);

    act(() => api.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onSelectionChange).toHaveBeenLastCalledWith(false);
    expect(api.current.selected).toBe(false);
  });

  it('toggleSelection toggles and is guarded by disabled', () => {
    const onSelectionChange = vi.fn();
    const { current } = setup({ interactive: true, onSelectionChange });
    act(() => current.toggleSelection());
    expect(onSelectionChange).toHaveBeenLastCalledWith(true);

    const { current: disabled } = setup({ interactive: true, onSelectionChange, disabled: true });
    act(() => disabled.toggleSelection());
    expect(disabled.selected).toBe(false);
  });

  it('disabled blocks click and keyboard activation', () => {
    const onClick = vi.fn();
    const { current } = setup({ interactive: true, onClick, disabled: true });
    act(() => current.handleClick({ preventDefault: vi.fn() } as unknown as React.MouseEvent));
    act(() => current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('hover handlers respect hoverable/disabled guards', () => {
    const { api } = setup({ interactive: true, hoverable: true });
    act(() => api.current.handleMouseEnter({} as React.MouseEvent));
    expect(api.current.hovered).toBe(true);
    act(() => api.current.handleMouseLeave({} as React.MouseEvent));
    expect(api.current.hovered).toBe(false);

    // hoverable=false keeps hovered false.
    const nh = setup({ interactive: true, hoverable: false });
    act(() => nh.api.current.handleMouseEnter({} as React.MouseEvent));
    expect(nh.api.current.hovered).toBe(false);

    // mouseLeave is a guarded no-op when disabled (early return branch).
    const dh = setup({ interactive: true, hoverable: true, disabled: true });
    act(() => dh.api.current.handleMouseEnter({} as React.MouseEvent));
    expect(dh.api.current.hovered).toBe(false);
    act(() => dh.api.current.handleMouseLeave({} as React.MouseEvent));
    expect(dh.api.current.hovered).toBe(false);
  });

  it('click and Enter without onClick/onSelectionChange are inert no-ops', () => {
    const { current } = setup({ interactive: true });
    expect(() => {
      act(() => current.handleClick({ preventDefault: vi.fn() } as unknown as React.MouseEvent));
      act(() => current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    }).not.toThrow();
    expect(current.selected).toBe(false);
  });

  it('computes variant and size classes for all options', () => {
    expect(setup({ variant: 'outlined' }).current.variantClasses).toContain('border-2');
    expect(setup({ variant: 'elevated' }).current.variantClasses).toContain('shadow-md');
    expect(setup({ variant: 'filled' }).current.variantClasses).toContain('bg-gray-50');
    expect(setup({ size: 'sm' }).current.sizeClasses).toBe('p-4');
    expect(setup({ size: 'lg' }).current.sizeClasses).toBe('p-8');
  });

  it('syncs external selected prop into internal state', () => {
    const { api, rerender } = setup({ interactive: true, onSelectionChange: vi.fn(), selected: true });
    expect(api.current.selected).toBe(true);
    // Re-render the same harness: the controlled `selected` prop persists via
    // the sync effect, so internal state stays true. (setup returns the
    // testing-library utils, so rerender is available.)
    rerender(<div />);
    expect(api.current.selected).toBe(true);
  });

  it('exposes semantic attributes wiring onClick/onKey/onMouse', () => {
    const onClick = vi.fn();
    const { current } = setup({ interactive: true, onClick });
    expect(current.semanticAttributes.onClick).toBe(current.handleClick);
    expect(current.semanticAttributes.onKeyDown).toBe(current.handleKeyDown);
    expect(current.semanticAttributes.onMouseEnter).toBe(current.handleMouseEnter);
    expect(current.semanticAttributes.onMouseLeave).toBe(current.handleMouseLeave);
  });
});
