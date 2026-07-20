import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Resizable } from '../src/components/Resizable';

// Covers: custom renderHandle, handleSize/handleColor styling, handlesVisible,
// animationDuration, minVisualSize, controlled size, the bottom-left corner
// handle, the vertical aspect-ratio path, and the dev-only size display.
const getHandle = (pos: string) => screen.getByTestId(`resize-handle-${pos}`);

describe('Resizable (extra)', () => {
  it('applies handleSize/handleColor/handlesVisible classes', () => {
    render(
      <Resizable
        handles={['right']}
        handleSize="sm"
        handleColor="primary"
        handlesVisible
        initialWidth={100}
        initialHeight={100}
      >
        <span>x</span>
      </Resizable>
    );
    const el = screen.getByTestId('resizable');
    expect(el).toHaveClass('resizable-sm');
    expect(el).toHaveClass('resizable-primary');
    expect(el).toHaveClass('resizable-handles-visible');
    // Headless: the handle element no longer carries resize-handle-sm/primary
    // classes; assert the handle still renders for the configured side.
    expect(getHandle('right')).toBeInTheDocument();
  });

  it('applies handleSize lg and handleColor secondary', () => {
    render(
      <Resizable
        handles={['right']}
        handleSize="lg"
        handleColor="secondary"
        initialWidth={100}
        initialHeight={100}
      >
        <span>x</span>
      </Resizable>
    );
    // Headless: the handle's resize-handle-lg/secondary classes are removed;
    // the container still reflects size/color.
    expect(getHandle('right')).toBeInTheDocument();
    expect(screen.getByTestId('resizable')).toHaveClass('resizable-lg');
    expect(screen.getByTestId('resizable')).toHaveClass('resizable-secondary');
  });

  it('marks the container disabled', () => {
    render(
      <Resizable disabled handles={['right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    expect(screen.getByTestId('resizable')).toHaveClass('resizable-disabled');
    // Headless: the handle's resize-handle-disabled class is removed; the handle
    // still renders.
    expect(getHandle('right')).toBeInTheDocument();
  });

  it('uses a custom renderHandle', () => {
    render(
      <Resizable
        handles={['right']}
        initialWidth={100}
        initialHeight={100}
        renderHandle={(handle, isActive, attributes) => (
          <button {...attributes} data-testid={`custom-${handle}`} data-active={isActive}>
            drag
          </button>
        )}
      >
        <span>x</span>
      </Resizable>
    );
    expect(screen.getByTestId('custom-right')).toBeInTheDocument();
  });

  it('includes animationDuration in the container transition', () => {
    render(
      <Resizable
        handles={['right']}
        animationDuration={300}
        initialWidth={100}
        initialHeight={100}
      >
        <span>x</span>
      </Resizable>
    );
    expect(screen.getByTestId('resizable').style.transition).toContain('300ms');
  });

  it('applies minVisualSize to minWidth/minHeight', () => {
    render(
      <Resizable handles={['right']} minVisualSize={75} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const el = screen.getByTestId('resizable');
    expect(el.style.minWidth).toBe('75px');
    expect(el.style.minHeight).toBe('75px');
  });

  it('reflects controlled width/height without internal mutation', () => {
    render(
      <Resizable
        handles={['right']}
        width={120}
        height={80}
        initialWidth={100}
        initialHeight={100}
      >
        <span>x</span>
      </Resizable>
    );
    const el = screen.getByTestId('resizable');
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('80px');
    // keyboard resize should not change controlled size
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    });
    expect(el.style.width).toBe('120px');
  });

  it('renders corner-handle DOM for the bottom-left handle and shrinks width on ArrowRight', () => {
    render(
      <Resizable
        handles={['bottom-left']}
        initialWidth={100}
        initialHeight={100}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('bottom-left');
    // Headless: the corner-handle's resize-handle-corner dot class is removed;
    // the corner handle still renders (a composite handle named bottom-left).
    expect(handle).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    });
    // bottom-left: newWidth = startWidth - deltaX = 100 - 10 = 90
    expect(screen.getByTestId('resizable')).toHaveStyle({ width: '90px' });
  });

  it('maintains aspect ratio via the vertical-direction path', () => {
    render(
      <Resizable
        handles={['bottom']}
        direction="vertical"
        initialWidth={100}
        initialHeight={50}
        constraints={{ maintainAspectRatio: true, aspectRatio: 2 }}
      >
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('bottom');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowDown', shiftKey: true });
    });
    // vertical: newHeight = 50 + 10 = 60; newWidth = newHeight * aspectRatio = 120
    expect(screen.getByTestId('resizable')).toHaveStyle({ height: '60px', width: '120px' });
  });

  it('renders the resizing overlay and sr-only text during an active resize', () => {
    render(
      <Resizable handles={['right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    // A pointer-initiated resize stays active (until mouseup), so the overlay
    // is observable. (The keyboard path auto-completes start/update/stop in a
    // single tick, so isResizing is never committed true for keyboard.)
    act(() => {
      fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    });
    expect(screen.getByText('Resizing...')).toBeInTheDocument();
    expect(screen.getByText(/Resizing to 100 by 100 pixels/)).toBeInTheDocument();
  });

  it('renders the stop hint after a resize ends', () => {
    render(
      <Resizable handles={['right']} initialWidth={100} initialHeight={100}>
        <span>x</span>
      </Resizable>
    );
    const handle = getHandle('right');
    act(() => {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    });
    expect(screen.getByText(/Resize stopped at 101 by 100 pixels/)).toBeInTheDocument();
  });

  it('renders the development-only size display when NODE_ENV is development', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      render(
        <Resizable handles={['right']} initialWidth={123} initialHeight={45}>
          <span>x</span>
        </Resizable>
      );
      expect(screen.getByText('123 × 45')).toBeInTheDocument();
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
