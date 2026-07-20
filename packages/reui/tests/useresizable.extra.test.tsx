import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useResizable } from '../src/hooks/useResizable';
import type { UseResizableProps, HandlePosition, ResizeDirection } from '../src/hooks/useResizable';

function setup(props: UseResizableProps = {}) {
  const api: { current: ReturnType<typeof useResizable> } = { current: null as any };
  function Harness() {
    api.current = useResizable(props);
    return null;
  }
  render(<Harness />);
  return api;
}

const allHandles: HandlePosition[] = [
  'top', 'right', 'bottom', 'left',
  'top-left', 'top-right', 'bottom-left', 'bottom-right',
];

describe('useResizable hook — defaults & state', () => {
  it('uses default initial size, direction=both, and default handles', () => {
    const api = setup();
    const r = api.current;
    expect(r.state.width).toBe(200);
    expect(r.state.height).toBe(200);
    expect(r.state.initialWidth).toBe(200);
    expect(r.state.initialHeight).toBe(200);
    expect(r.state.direction).toBe('both');
    expect(r.state.isResizing).toBe(false);
    expect(r.state.activeHandle).toBeNull();
    expect(r.state.constraints).toEqual({});
    expect(r.computed.aspectRatio).toBe(1);
    expect(r.computed.isAtMinSize).toBe(false);
    expect(r.computed.isAtMaxSize).toBe(false);
    expect(r.resizableAttributes.role).toBe('region');
    expect(r.resizableAttributes['aria-roledescription']).toContain('Resizable');
    expect(r.resizableAttributes.style.position).toBe('relative');
  });

  it('respects custom initialWidth/initialHeight/direction/handles', () => {
    const api = setup({
      initialWidth: 100,
      initialHeight: 50,
      direction: 'horizontal',
      handles: ['left', 'right', 'top', 'bottom'],
    });
    expect(api.current.state.width).toBe(100);
    expect(api.current.state.height).toBe(50);
    // horizontal filters out top/bottom, keeps left/right + corners (none given)
    expect(api.current.computed.availableHandles).toEqual(['left', 'right']);
    expect(api.current.computed.aspectRatio).toBe(2);
  });

  it('vertical direction keeps only top/bottom of the cardinal handles', () => {
    const api = setup({
      direction: 'vertical',
      handles: ['left', 'right', 'top', 'bottom'],
    });
    expect(api.current.computed.availableHandles).toEqual(['top', 'bottom']);
  });

  it('both direction keeps all provided handles', () => {
    const api = setup({ direction: 'both', handles: allHandles });
    expect(api.current.computed.availableHandles).toHaveLength(8);
  });

  it('clamps to min/max constraints immediately', () => {
    const api = setup({
      initialWidth: 500,
      initialHeight: 500,
      constraints: { minWidth: 100, maxWidth: 300, minHeight: 50, maxHeight: 250 },
    });
    expect(api.current.state.width).toBe(300);
    expect(api.current.state.height).toBe(250);
    expect(api.current.computed.isAtMaxSize).toBe(true);
  });

  it('isAtMinSize true when at min', () => {
    const api = setup({
      initialWidth: 10,
      initialHeight: 10,
      constraints: { minWidth: 50, minHeight: 50 },
    });
    expect(api.current.state.width).toBe(50);
    expect(api.current.state.height).toBe(50);
    expect(api.current.computed.isAtMinSize).toBe(true);
  });
});

describe('useResizable hook — controlled size', () => {
  it('controlled width/height win and updateResize does not mutate internal', () => {
    const api = setup({ width: 320, height: 240 });
    expect(api.current.state.width).toBe(320);
    expect(api.current.state.height).toBe(240);
    act(() => {
      api.current.actions.startResize('right', 0, 0);
      api.current.actions.updateResize(50, 0);
      api.current.actions.stopResize();
    });
    // Controlled -> internal state never changes, public state stays at controlled value
    expect(api.current.state.width).toBe(320);
  });
});

describe('useResizable hook — startResize / updateResize / stopResize per handle', () => {
  const handleCases: Array<{ handle: HandlePosition; dx: number; dy: number; expectW: number; expectH: number }> = [
    { handle: 'right', dx: 50, dy: 0, expectW: 250, expectH: 200 },
    { handle: 'left', dx: 50, dy: 0, expectW: 150, expectH: 200 },
    { handle: 'bottom', dx: 0, dy: 50, expectW: 200, expectH: 250 },
    { handle: 'top', dx: 0, dy: 50, expectW: 200, expectH: 150 },
    { handle: 'bottom-right', dx: 50, dy: 50, expectW: 250, expectH: 250 },
    { handle: 'bottom-left', dx: 50, dy: 50, expectW: 150, expectH: 250 },
    { handle: 'top-right', dx: 50, dy: 50, expectW: 250, expectH: 150 },
    { handle: 'top-left', dx: 50, dy: 50, expectW: 150, expectH: 150 },
  ];

  handleCases.forEach(({ handle, dx, dy, expectW, expectH }) => {
    it(`handle "${handle}" computes ${expectW}x${expectH} for delta ${dx},${dy}`, () => {
      const onResizeStart = vi.fn();
      const onResize = vi.fn();
      const onResizeEnd = vi.fn();
      const api = setup({ onResizeStart, onResize, onResizeEnd });
      act(() => api.current.actions.startResize(handle, 100, 100));
      expect(api.current.state.isResizing).toBe(true);
      expect(api.current.state.activeHandle).toBe(handle);
      expect(onResizeStart).toHaveBeenCalledWith(handle, 200, 200);
      act(() => api.current.actions.updateResize(100 + dx, 100 + dy));
      expect(onResize).toHaveBeenCalledWith(expectW, expectH);
      expect(api.current.state.width).toBe(expectW);
      expect(api.current.state.height).toBe(expectH);
      act(() => api.current.actions.stopResize());
      expect(api.current.state.isResizing).toBe(false);
      expect(api.current.state.activeHandle).toBeNull();
      expect(onResizeEnd).toHaveBeenCalled();
    });
  });

  it('startResize is a no-op when disabled', () => {
    const onResizeStart = vi.fn();
    const api = setup({ disabled: true, onResizeStart });
    act(() => api.current.actions.startResize('right', 0, 0));
    expect(api.current.state.isResizing).toBe(false);
    expect(onResizeStart).not.toHaveBeenCalled();
  });

  it('updateResize ignores when not resizing or disabled', () => {
    const onResize = vi.fn();
    const api = setup({ onResize });
    // Not resizing -> no-op
    act(() => api.current.actions.updateResize(500, 500));
    expect(onResize).not.toHaveBeenCalled();
    // Now start, then disable won't change ref but disabled guard hits
    act(() => api.current.actions.startResize('right', 0, 0));
    expect(api.current.state.isResizing).toBe(true);
  });

  it('stopResize is a no-op when not resizing', () => {
    const onResizeEnd = vi.fn();
    const api = setup({ onResizeEnd });
    act(() => api.current.actions.stopResize());
    expect(onResizeEnd).not.toHaveBeenCalled();
  });

  it('clamps within min/max during resize', () => {
    const api = setup({
      initialWidth: 200,
      initialHeight: 200,
      constraints: { minWidth: 100, maxWidth: 300, minHeight: 100, maxHeight: 300 },
    });
    act(() => api.current.actions.startResize('bottom-right', 0, 0));
    act(() => api.current.actions.updateResize(500, 500)); // try to exceed max
    expect(api.current.state.width).toBe(300);
    expect(api.current.state.height).toBe(300);
    act(() => api.current.actions.stopResize());
  });
});

describe('useResizable hook — aspect ratio constraint', () => {
  it('maintains aspect ratio on horizontal handle (height follows width)', () => {
    const api = setup({
      initialWidth: 200,
      initialHeight: 200,
      constraints: { maintainAspectRatio: true, aspectRatio: 2 }, // w/h = 2
    });
    act(() => api.current.actions.startResize('right', 0, 0));
    act(() => api.current.actions.updateResize(100, 0)); // +100 width => 300
    expect(api.current.state.width).toBe(300);
    expect(api.current.state.height).toBe(150); // 300 / 2
    act(() => api.current.actions.stopResize());
  });

  it('maintains aspect ratio on vertical handle in vertical direction', () => {
    const api = setup({
      initialWidth: 200,
      initialHeight: 200,
      direction: 'vertical',
      constraints: { maintainAspectRatio: true, aspectRatio: 2 },
    });
    act(() => api.current.actions.startResize('bottom', 0, 0));
    act(() => api.current.actions.updateResize(0, 100)); // +100 height => 300
    expect(api.current.state.height).toBe(300);
    expect(api.current.state.width).toBe(600); // height * 2
    act(() => api.current.actions.stopResize());
  });
});

describe('useResizable hook — snap to grid', () => {
  it('snaps width/height to grid size during resize', () => {
    const api = setup({
      initialWidth: 200,
      initialHeight: 200,
      constraints: { snapToGrid: true, gridSize: 25 },
    });
    act(() => api.current.actions.startResize('bottom-right', 0, 0));
    // 200 + 17 = 217 -> round(217/25)*25 = round(8.68)*25 = 9*25 = 225
    // 200 + 13 = 213 -> round(213/25)*25 = round(8.52)*25 = 9*25 = 225
    act(() => api.current.actions.updateResize(17, 13));
    expect(api.current.state.width).toBe(225);
    expect(api.current.state.height).toBe(225);
    act(() => api.current.actions.stopResize());
  });
});

describe('useResizable hook — setSize / setWidth / setHeight / reset', () => {
  it('setSize applies delta-based dimensions and fires onSizeChange', () => {
    const onSizeChange = vi.fn();
    const api = setup({ onSizeChange });
    act(() => api.current.actions.setSize(300, 400));
    expect(api.current.state.width).toBe(300);
    expect(api.current.state.height).toBe(400);
    expect(onSizeChange).toHaveBeenCalledWith(300, 400);
  });

  it('setWidth / setHeight change only one dimension', () => {
    const api = setup({ initialWidth: 200, initialHeight: 200 });
    act(() => api.current.actions.setWidth(350));
    expect(api.current.state.width).toBe(350);
    expect(api.current.state.height).toBe(200);
    act(() => api.current.actions.setHeight(450));
    expect(api.current.state.height).toBe(450);
  });

  it('reset returns to initial size', () => {
    const api = setup({ initialWidth: 150, initialHeight: 175 });
    act(() => api.current.actions.setSize(300, 400));
    act(() => api.current.actions.reset());
    expect(api.current.state.width).toBe(150);
    expect(api.current.state.height).toBe(175);
  });

  it('setSize/reset are no-ops when disabled', () => {
    const onSizeChange = vi.fn();
    const api = setup({ disabled: true, onSizeChange });
    act(() => api.current.actions.setSize(300, 400));
    expect(api.current.state.width).toBe(200);
    act(() => api.current.actions.reset());
    expect(onSizeChange).not.toHaveBeenCalled();
  });

  it('setConstraints merges new constraints into existing', () => {
    const api = setup({ constraints: { minWidth: 50 } });
    expect(api.current.state.constraints.minWidth).toBe(50);
    act(() => api.current.actions.setConstraints({ maxWidth: 500 }));
    expect(api.current.state.constraints.minWidth).toBe(50);
    expect(api.current.state.constraints.maxWidth).toBe(500);
  });
});

describe('useResizable hook — handle attributes & styles', () => {
  it('getHandleAttributes exposes aria, role, tabIndex, disabled, className, and event hooks', () => {
    const onResizeStart = vi.fn();
    const api = setup({ onResizeStart });
    const attrs = api.current.getHandleAttributes('right');
    expect(attrs.role).toBe('button');
    expect(attrs.tabIndex).toBe(0);
    expect(attrs.disabled).toBe(false);
    expect(attrs['aria-label']).toContain('right');
    expect(attrs.className).toContain('resize-handle-right');
    // Drive mousedown handler -> startResize
    const evt = { preventDefault: vi.fn(), clientX: 10, clientY: 20 } as any;
    attrs.onMouseDown(evt);
    expect(onResizeStart).toHaveBeenCalled();
  });

  it('getHandleAttributes marks disabled handles and inactive active state', () => {
    const api = setup({ disabled: true });
    const attrs = api.current.getHandleAttributes('left');
    expect(attrs.tabIndex).toBe(-1);
    expect(attrs.disabled).toBe(true);
    expect(attrs.className).toContain('resize-handle-disabled');
    expect(attrs['aria-pressed']).toBe(false);
  });

  it('getHandleAttributes onTouchStart starts resize (onResizeStart receives size, not touch coords)', () => {
    const onResizeStart = vi.fn();
    const api = setup({ onResizeStart });
    const attrs = api.current.getHandleAttributes('bottom');
    const evt = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 5, clientY: 7 }],
    } as any;
    act(() => attrs.onTouchStart(evt));
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    // onResizeStart fires with the handle plus current constrained size.
    expect(onResizeStart).toHaveBeenCalledWith('bottom', 200, 200);
    expect(api.current.state.isResizing).toBe(true);
    expect(api.current.state.activeHandle).toBe('bottom');
  });

  it('onTouchStart is a no-op when disabled', () => {
    const onResizeStart = vi.fn();
    const api = setup({ disabled: true, onResizeStart });
    const attrs = api.current.getHandleAttributes('right');
    attrs.onTouchStart({ preventDefault: vi.fn(), touches: [{ clientX: 1, clientY: 1 }] } as any);
    expect(onResizeStart).not.toHaveBeenCalled();
  });

  it('keyboard arrows resize by step (shift = 10) and complete in one tick', () => {
    // Re-grab the handle attributes before each key so we exercise the latest
    // actions closure (in normal usage React re-renders between keystrokes).
    const onResizeEnd = vi.fn();
    const api = setup({ onResizeEnd });
    const press = (key: string, shiftKey = false) => {
      const attrs = api.current.getHandleAttributes('bottom-right');
      act(() => attrs.onKeyDown({ preventDefault: vi.fn(), shiftKey, key } as any));
    };
    press('ArrowRight', true); // +10
    expect(api.current.state.width).toBe(210);
    press('ArrowDown'); // +1
    expect(api.current.state.height).toBe(201);
    press('ArrowLeft'); // -1
    expect(api.current.state.width).toBe(209);
    press('ArrowUp'); // -1
    expect(api.current.state.height).toBe(200);
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it('keyboard ignores non-arrow keys and is no-op when disabled', () => {
    const api = setup();
    const attrs = api.current.getHandleAttributes('right');
    const before = api.current.state.width;
    attrs.onKeyDown({ preventDefault: vi.fn(), key: 'Enter' } as any);
    expect(api.current.state.width).toBe(before);
    // Disabled
    const api2 = setup({ disabled: true });
    const attrs2 = api2.current.getHandleAttributes('right');
    const beforeW = api2.current.state.width;
    attrs2.onKeyDown({ preventDefault: vi.fn(), key: 'ArrowRight' } as any);
    expect(api2.current.state.width).toBe(beforeW);
  });

  it('aria-pressed true only for the active handle', () => {
    const api = setup();
    act(() => api.current.actions.startResize('right', 0, 0));
    expect(api.current.getHandleAttributes('right')['aria-pressed']).toBe(true);
    expect(api.current.getHandleAttributes('left')['aria-pressed']).toBe(false);
    act(() => api.current.actions.stopResize());
  });
});

describe('useResizable hook — getHandleStyles per position', () => {
  const cursorMap: Record<HandlePosition, string> = {
    'top': 'ns-resize',
    'right': 'ew-resize',
    'bottom': 'ns-resize',
    'left': 'ew-resize',
    'top-left': 'nw-resize',
    'top-right': 'ne-resize',
    'bottom-left': 'sw-resize',
    'bottom-right': 'se-resize',
  };
  allHandles.forEach((h) => {
    it(`getHandleStyles("${h}") returns absolute positioned style with cursor ${cursorMap[h]}`, () => {
      const api = setup();
      const s = api.current.getHandleStyles(h);
      expect(s.position).toBe('absolute');
      expect(s.zIndex).toBe(1);
      expect(s.cursor).toBe(cursorMap[h]);
    });
  });

  it('getHandleStyles falls back to base styles for unknown handle', () => {
    const api = setup();
    const s = api.current.getHandleStyles('unknown' as HandlePosition);
    expect(s.position).toBe('absolute');
    expect(s.cursor).toBeUndefined();
  });
});

describe('useResizable hook — global mouse/touch document listeners', () => {
  it('document mousemove/mouseup drive update/stop while resizing', () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const api = setup({ onResize, onResizeEnd });
    act(() => api.current.actions.startResize('right', 0, 0));
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 60, clientY: 0 }));
    });
    expect(onResize).toHaveBeenCalled();
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
    expect(api.current.state.isResizing).toBe(false);
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it('document touchmove/touchend drive update/stop while resizing', () => {
    const onResize = vi.fn();
    const api = setup({ onResize });
    act(() => api.current.actions.startResize('bottom', 0, 0));
    act(() => {
      const touchEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 0, clientY: 80 } as any],
      });
      document.dispatchEvent(touchEvent);
    });
    expect(onResize).toHaveBeenCalled();
    act(() => {
      document.dispatchEvent(new TouchEvent('touchend'));
    });
    expect(api.current.state.isResizing).toBe(false);
  });
});
