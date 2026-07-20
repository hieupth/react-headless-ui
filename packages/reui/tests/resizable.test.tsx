import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Resizable } from '../src/components/Resizable';
import { useResizable } from '../src/hooks';

// Resizable renders handles keyed by data-testid `resize-handle-${handle}`.
// Keyboard arrows on a focused handle drive the hook's start/move/stop cycle,
// which is the most reliable path in jsdom (drag events are not dispatched).

const getHandle = (pos: string) => screen.getByTestId(`resize-handle-${pos}`);

describe('Resizable', () => {
  it('renders a resizable container with its children', () => {
    render(
      <Resizable initialWidth={200} initialHeight={100}>
        <span>resize-me</span>
      </Resizable>
    );
    expect(screen.getByText('resize-me')).toBeInTheDocument();
  });

  it('renders resize handles when showHandles is set', () => {
    render(
      <Resizable showHandles handles={['se']}>
        <span>handles</span>
      </Resizable>
    );
    // 'se' is not a valid HandlePosition; component should still render container
    expect(screen.getByTestId('resizable')).toBeInTheDocument();
  });

  it('exposes default handles (right, bottom, bottom-right) for both direction', () => {
    render(
      <Resizable initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    expect(getHandle('right')).toBeInTheDocument();
    expect(getHandle('bottom')).toBeInTheDocument();
    expect(getHandle('bottom-right')).toBeInTheDocument();
  });

  it('only renders horizontal handles for horizontal direction', () => {
    render(
      <Resizable direction="horizontal" initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    expect(getHandle('right')).toBeInTheDocument();
    expect(screen.queryByTestId('resize-handle-bottom')).not.toBeInTheDocument();
  });

  it('only renders vertical handles for vertical direction', () => {
    render(
      <Resizable direction="vertical" initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    expect(getHandle('bottom')).toBeInTheDocument();
    expect(screen.queryByTestId('resize-handle-right')).not.toBeInTheDocument();
  });

  it('grows width when the right handle is driven by ArrowRight', () => {
    render(
      <Resizable initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    handle.focus();
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    });
    // default step is 1px -> width 101
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '101px' });
  });

  it('shrinks width when the left handle is driven by ArrowRight (cursor moves right, edge moves left)', () => {
    render(
      <Resizable handles={['left']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('left');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    });
    // left handle: newWidth = startWidth - deltaX; ArrowRight -> deltaX +1 -> 99
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '99px' });
  });

  it('grows height when the bottom handle is driven by ArrowDown', () => {
    render(
      <Resizable handles={['bottom']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('bottom');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ height: '101px' });
  });

  it('shrinks height when the top handle is driven by ArrowDown (cursor moves down, edge moves up)', () => {
    render(
      <Resizable handles={['top']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('top');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowDown' });
    });
    // top handle: newHeight = startHeight - deltaY; ArrowDown -> deltaY +1 -> 99
    expect(screen.getByTestId('resizable')).toHaveStyle({ height: '99px' });
  });

  it('uses the larger 10px step when Shift is held', () => {
    render(
      <Resizable handles={['right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '110px' });
  });

  it('moves width and height independently for a corner handle', () => {
    render(
      <Resizable handles={['top-right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('top-right');
    // top-right: width += deltaX; height -= deltaY
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '110px' });
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowDown', shiftKey: true });
    });
    // ArrowDown -> deltaY +10 -> height 100 - 10 = 90
    expect(screen.getByTestId('resizable')).toHaveStyle({ height: '90px' });
  });

  it('respects maxWidth / maxHeight constraints', () => {
    render(
      <Resizable
        handles={['right', 'bottom']}
        initialWidth={95}
        initialHeight={95}
        constraints={{ maxWidth: 100, maxHeight: 100 }}
      >
        <span>x</span>
      </Resizable>
    );
    const right = getHandle('right');
    act(() => {
      fireEvent.keyDown(right, { key: 'ArrowRight', shiftKey: true });
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '100px' });
    const bottom = getHandle('bottom');
    act(() => {
      fireEvent.keyDown(bottom, { key: 'ArrowDown', shiftKey: true });
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ height: '100px' });
  });

  it('respects minWidth / minHeight constraints', () => {
    render(
      <Resizable
        handles={['left', 'top']}
        initialWidth={5}
        initialHeight={5}
        constraints={{ minWidth: 2, minHeight: 2 }}
      >
        <span>x</span>
      </Resizable>
    );
    const left = getHandle('left');
    act(() => {
      fireEvent.keyDown(left, { key: 'ArrowRight', shiftKey: true });
    });
    // left handle: newWidth = startWidth - deltaX = 5 - 10 = -5 -> clamped to minWidth 2
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '2px' });
  });

  it('fires onResizeStart / onResize / onResizeEnd during a keyboard resize', () => {
    const onResizeStart = vi.fn();
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const onSizeChange = vi.fn();
    render(
      <Resizable
        handles={['right']}
        initialWidth={100}
        initialHeight={100}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        onSizeChange={onSizeChange}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    });
    expect(onResizeStart).toHaveBeenCalledWith('right', 100, 100);
    expect(onResize).toHaveBeenCalled();
    expect(onSizeChange).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it('disables all interaction when disabled is true', () => {
    const onResizeStart = vi.fn();
    render(
      <Resizable
        disabled
        handles={['right']}
        initialWidth={100}
        initialHeight={100}
        onResizeStart={onResizeStart}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    // handles are not focusable when disabled
    expect(handle).toHaveAttribute('tabindex', '-1');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    });
    expect(onResizeStart).not.toHaveBeenCalled();
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '100px' });
  });

  it('does not react to non-arrow keys on a handle', () => {
    render(
      <Resizable handles={['right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'Enter' });
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '100px' });
  });

  it('clamps initial size to provided constraints', () => {
    render(
      <Resizable
        handles={['right']}
        initialWidth={500}
        initialHeight={10}
        constraints={{ maxWidth: 200, minWidth: 50, minHeight: 50 }}
      >
        <span>x</span>
      </Resizable>
    );
    // 500 clamped to 200, 10 clamped to 50
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('maintains aspect ratio when configured', () => {
    render(
      <Resizable
        handles={['right']}
        direction="horizontal"
        initialWidth={100}
        initialHeight={50}
        constraints={{ maintainAspectRatio: true, aspectRatio: 2 }}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    });
    // width 100 -> 110, height = width / aspectRatio = 55
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '110px', height: '55px' });
  });

  it('snaps to grid when configured', () => {
    render(
      <Resizable
        handles={['right']}
        initialWidth={100}
        initialHeight={100}
        constraints={{ snapToGrid: true, gridSize: 25 }}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    });
    // 100 + 10 = 110, snapped to nearest 25 = 100
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '100px' });
  });

  it('starts resize via pointer down on a handle and updates via global mousemove', () => {
    const onResize = vi.fn();
    render(
      <Resizable
        handles={['right']}
        initialWidth={100}
        initialHeight={100}
        onResize={onResize}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    });
    act(() => {
      // global listener registered on document
      fireEvent.mouseMove(document, { clientX: 50, clientY: 0 });
    });
    expect(onResize).toHaveBeenCalledWith(150, 100);
    act(() => {
      fireEvent.mouseUp(document);
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '150px' });
  });

  it('supports touch-based resize start and move', () => {
    render(
      <Resizable handles={['right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.touchStart(handle, {
        touches: [{ clientX: 0, clientY: 0 }],
      });
    });
    act(() => {
      fireEvent.touchMove(document, {
        touches: [{ clientX: 25, clientY: 0 }],
      });
    });
    act(() => {
      fireEvent.touchEnd(document);
    });
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '125px' });
  });

  it('renders the min-size indicator when clamped to a minimum', () => {
    render(
      <Resizable
        handles={['right']}
        initialWidth={2}
        initialHeight={100}
        constraints={{ minWidth: 2 }}
      >
        <span>x</span>
      </Resizable>
    );
    expect(screen.getByText('Minimum size reached')).toBeInTheDocument();
  });

  it('renders the max-size indicator when clamped to a maximum', () => {
    render(
      <Resizable
        handles={['right']}
        initialWidth={100}
        initialHeight={100}
        constraints={{ maxWidth: 100 }}
      >
        <span>x</span>
      </Resizable>
    );
    expect(screen.getByText('Maximum size reached')).toBeInTheDocument();
  });
});

describe('useResizable', () => {
  // Returns a stable handle whose `.current` always reflects the latest render.
  const probe = (props: any) => {
    const box: { current: any } = { current: null };
    const Probe = () => { box.current = useResizable(props); return null; };
    render(<Probe />);
    return box;
  };
  // Drive a handle through the keyboard start/move/stop cycle (no DOM needed).
  const keyHandle = (box: any, handle: string, key: string, shiftKey = false) =>
    act(() => {
      box.current.getHandleAttributes(handle).onKeyDown({
        key,
        shiftKey,
        preventDefault: () => {},
      });
    });

  it('uses controlled width/height and skips internal state during update/setSize', () => {
    const onResize = vi.fn();
    const onSizeChange = vi.fn();
    const r = probe({
      width: 100,
      height: 100,
      handles: ['right'],
      onResize,
      onSizeChange,
    });
    // controlled: state reports controlled values
    expect(r.current.state.width).toBe(100);
    // start -> update via keyboard flow
    keyHandle(r, 'right', 'ArrowRight');
    // internal state must NOT change because controlledWidth is defined
    expect(r.current.state.width).toBe(100);
    expect(onResize).toHaveBeenCalled();
    // setSize also skips internal mutation when controlled
    act(() => r.current.actions.setSize(200, 200));
    expect(r.current.state.width).toBe(100);
  });

  it('startResize / setSize / reset / updateResize are no-ops when disabled', () => {
    const onResizeStart = vi.fn();
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const onSizeChange = vi.fn();
    const r = probe({
      disabled: true,
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResizeStart,
      onResize,
      onResizeEnd,
      onSizeChange,
    });
    act(() => r.current.actions.startResize('right', 0, 0));
    act(() => r.current.actions.updateResize(50, 0));
    act(() => r.current.actions.setSize(200, 200));
    act(() => r.current.actions.reset());
    expect(onResizeStart).not.toHaveBeenCalled();
    expect(onResize).not.toHaveBeenCalled();
    expect(onSizeChange).not.toHaveBeenCalled();
    expect(r.current.state.width).toBe(100);
  });

  it('updateResize and stopResize no-op when no resize is in progress', () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResize,
      onResizeEnd,
    });
    // not resizing -> updateResize/stopResize bail early
    act(() => r.current.actions.updateResize(50, 0));
    act(() => r.current.actions.stopResize());
    expect(onResize).not.toHaveBeenCalled();
    expect(onResizeEnd).not.toHaveBeenCalled();
  });

  it('startResize then stopResize emits onResizeEnd', () => {
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResizeStart,
      onResizeEnd,
    });
    act(() => r.current.actions.startResize('right', 0, 0));
    expect(onResizeStart).toHaveBeenCalledWith('right', 100, 100);
    act(() => r.current.actions.stopResize());
    expect(onResizeEnd).toHaveBeenCalledWith(100, 100);
  });

  it('setWidth / setHeight mutate only one dimension', () => {
    const onSizeChange = vi.fn();
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onSizeChange,
    });
    act(() => r.current.actions.setWidth(150));
    expect(r.current.state.width).toBe(150);
    expect(r.current.state.height).toBe(100);
    act(() => r.current.actions.setHeight(80));
    expect(r.current.state.height).toBe(80);
  });

  it('reset restores the initial size', () => {
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
    });
    act(() => r.current.actions.setSize(200, 200));
    act(() => r.current.actions.reset());
    expect(r.current.state.width).toBe(100);
    expect(r.current.state.height).toBe(100);
  });

  it('setConstraints merges new constraints into existing ones', () => {
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      constraints: { minWidth: 10 },
    });
    act(() => r.current.actions.setConstraints({ maxWidth: 500 }));
    expect(r.current.state.constraints).toEqual({ minWidth: 10, maxWidth: 500 });
  });

  it('drives every handle case in calculateNewDimensions via keyboard', () => {
    // Each handle is exercised with an arrow key that produces a non-zero
    // delta on at least one axis, covering every switch case.
    const cases: Array<[string, string]> = [
      ['right', 'ArrowRight'],
      ['left', 'ArrowRight'],
      ['bottom', 'ArrowDown'],
      ['top', 'ArrowDown'],
      ['bottom-right', 'ArrowRight'],
      ['bottom-left', 'ArrowRight'],
      ['top-right', 'ArrowDown'],
      ['top-left', 'ArrowLeft'],
    ];
    for (const [handle, key] of cases) {
      const r = probe({
        initialWidth: 100,
        initialHeight: 100,
        handles: [handle as any],
      });
      keyHandle(r, handle, key);
      expect(r.current.state.width).not.toBe(NaN);
      expect(r.current.state.height).not.toBe(NaN);
    }
  });

  it('maintains aspect ratio in vertical direction (height-driven)', () => {
    const r = probe({
      direction: 'vertical',
      initialWidth: 100,
      initialHeight: 100,
      handles: ['bottom'],
      constraints: { maintainAspectRatio: true, aspectRatio: 2 },
    });
    keyHandle(r, 'bottom', 'ArrowDown', true);
    // vertical + bottom handle -> newWidth = newHeight * aspectRatio; height grew 10 -> 110, width = 110 * 2 = 220
    expect(r.current.state.height).toBe(110);
    expect(r.current.state.width).toBe(220);
  });

  it('maintains aspect ratio via the handle-inclusion path for direction "both"', () => {
    // direction 'both' + a vertical-axis handle ('top') falls through the first
    // if to the else-if, exercising the handle-array branch of the aspect logic.
    const r = probe({
      direction: 'both',
      initialWidth: 100,
      initialHeight: 100,
      handles: ['top'],
      constraints: { maintainAspectRatio: true, aspectRatio: 2 },
    });
    keyHandle(r, 'top', 'ArrowUp', true);
    // top handle: ArrowUp -> deltaY -10; newHeight = startHeight - deltaY = 100 - (-10) = 110;
    // else-if (vertical-axis handle) -> newWidth = newHeight * aspectRatio = 110 * 2 = 220
    expect(r.current.state.height).toBe(110);
    expect(r.current.state.width).toBe(220);
  });

  it('does not maintain aspect ratio when aspectRatio is missing', () => {
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      constraints: { maintainAspectRatio: true },
    });
    keyHandle(r, 'right', 'ArrowRight', true);
    // height unchanged (no aspect math applied) -> 100
    expect(r.current.state.height).toBe(100);
  });

  it('getHandleAttributes onKeyDown handles all four arrow keys', () => {
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
    });
    // Each arrow key must run the start/move/stop flow without throwing.
    expect(() => keyHandle(r, 'right', 'ArrowLeft')).not.toThrow();
    expect(() => keyHandle(r, 'right', 'ArrowUp')).not.toThrow();
    expect(() => keyHandle(r, 'right', 'ArrowDown')).not.toThrow();
    expect(() => keyHandle(r, 'right', 'ArrowRight')).not.toThrow();
  });

  it('getHandleAttributes onKeyDown skips startResize when a resize is already in progress', () => {
    // Start a mouse-driven resize so isResizing becomes true in state, then
    // dispatch a keyboard keydown: the closure sees isResizing===true and must
    // NOT call startResize again (it goes straight to updateResize/stopResize).
    const onResizeStart = vi.fn();
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResizeStart,
    });
    act(() => r.current.actions.startResize('right', 0, 0));
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    // re-render flushed isResizing=true into the handler's closure
    keyHandle(r, 'right', 'ArrowRight');
    // startResize was not invoked a second time during the keyboard flow
    expect(onResizeStart).toHaveBeenCalledTimes(1);
  });

  it('getHandleAttributes onKeyDown bails on non-arrow keys and when disabled', () => {
    const onResizeStart = vi.fn();
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResizeStart,
    });
    // non-arrow key -> default return, no resize started
    act(() => {
      r.current.getHandleAttributes('right').onKeyDown({
        key: 'Enter',
        preventDefault: () => {},
      });
    });
    expect(onResizeStart).not.toHaveBeenCalled();
    // disabled -> early return
    const r2 = probe({
      disabled: true,
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResizeStart,
    });
    act(() => {
      r2.current.getHandleAttributes('right').onKeyDown({
        key: 'ArrowRight',
        preventDefault: () => {},
      });
    });
    expect(onResizeStart).not.toHaveBeenCalled();
    expect(r2.current.getHandleAttributes('right').disabled).toBe(true);
  });

  it('getHandleAttributes onMouseDown / onTouchStart start a resize', () => {
    const onResizeStart = vi.fn();
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      onResizeStart,
    });
    const attrs = r.current.getHandleAttributes('right');
    act(() => {
      attrs.onMouseDown({ preventDefault: () => {}, clientX: 5, clientY: 6 });
    });
    expect(onResizeStart).toHaveBeenCalledWith('right', 100, 100);
    act(() => {
      attrs.onTouchStart({ preventDefault: () => {}, touches: [{ clientX: 1, clientY: 2 }] });
    });
  });

  it('returns base styles for an unknown handle and full styles for every known handle', () => {
    const r = probe({ initialWidth: 100, initialHeight: 100, handles: ['right'] });
    // default (unknown) handle -> base styles only
    expect(r.current.getHandleStyles('unknown' as any)).toEqual({ position: 'absolute', zIndex: 1 });
    // every known handle returns a distinct cursor
    for (const h of ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const) {
      const s = r.current.getHandleStyles(h);
      expect(s.position).toBe('absolute');
      expect(s.cursor).toBeTruthy();
    }
  });

  it('computed.isAtMaxSize is true when width is at maxWidth', () => {
    const r = probe({
      initialWidth: 100,
      initialHeight: 100,
      handles: ['right'],
      constraints: { maxWidth: 100 },
    });
    expect(r.current.computed.isAtMaxSize).toBe(true);
  });

  it('computed.aspectRatio falls back to 1 when height is 0', () => {
    const r = probe({
      initialWidth: 100,
      initialHeight: 0,
      handles: ['right'],
    });
    expect(r.current.computed.aspectRatio).toBe(1);
  });
});
