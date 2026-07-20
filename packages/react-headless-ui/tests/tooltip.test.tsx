import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, renderHook, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { Tooltip, SimpleTooltip, RichTooltip } from '../src/components/Tooltip';
import { useTooltip, type TooltipPosition } from '../src/hooks/useTooltip';

// NOTE: Tooltip clones its single child element and injects trigger handlers.
// Content renders into a portal on document.body when open. Smoke test asserts
// the trigger renders; hovering reveals the content.

describe('Tooltip', () => {
  it('renders the trigger child element', () => {
    render(
      <Tooltip content="Helpful tip" position="top">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful tip" delayShow={0} delayHide={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    await user.hover(screen.getByRole('button', { name: 'Hover me' }));
    expect(await screen.findByText('Helpful tip')).toBeInTheDocument();
  });
});

describe('Tooltip renderer paths', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens on click trigger and toggles closed on next click', () => {
    render(
      <Tooltip content="Click tip" trigger="click" delayShow={0} delayHide={0}>
        <button>Click me</button>
      </Tooltip>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(screen.getByText('Click tip')).toBeInTheDocument();
    // toggle closed
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(screen.queryByText('Click tip')).not.toBeInTheDocument();
  });

  it('opens on focus trigger and closes on blur', () => {
    render(
      <Tooltip content="Focus tip" trigger="focus" delayShow={0} delayHide={0}>
        <button>Focus me</button>
      </Tooltip>
    );
    fireEvent.focus(screen.getByRole('button', { name: 'Focus me' }));
    expect(screen.getByText('Focus tip')).toBeInTheDocument();
    fireEvent.blur(screen.getByRole('button', { name: 'Focus me' }));
    expect(screen.queryByText('Focus tip')).not.toBeInTheDocument();
  });

  it('renders the default arrow when arrow is enabled', () => {
    render(
      <Tooltip content="Arrow tip" trigger="click" arrow delayShow={0} delayHide={0}>
        <button>Arw</button>
      </Tooltip>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Arw' }));
    // default arrow is a div with border-gray-900 class
    expect(document.querySelector('.border-gray-900')).toBeInTheDocument();
  });

  it('uses custom renderArrow and renderContent when provided', () => {
    render(
      <Tooltip
        content="orig"
        trigger="click"
        arrow
        delayShow={0}
        delayHide={0}
        renderContent={() => <span data-testid="custom-content">custom</span>}
        renderArrow={() => <span data-testid="custom-arrow">arrow</span>}
      >
        <button>X</button>
      </Tooltip>
    );
    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByTestId('custom-arrow')).toBeInTheDocument();
  });

  it('applies the `showing` opacity-0 class while open with a pending delayShow', () => {
    // Controlled open=true + hover trigger + delayShow>0: hovering calls show(),
    // which sets showing=true for the delay window. Because open is controlled the
    // content mounts immediately, so it shows the showing (opacity-0) class.
    render(
      <Tooltip content="Delayed" open trigger="hover" delayShow={500} delayHide={0}>
        <button>D</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'D' }));
    expect(screen.getByText('Delayed').closest('.absolute')?.className).toContain('opacity-0');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // after delay elapses, showing=false, hiding=false -> opacity-100
    expect(screen.getByText('Delayed').closest('.absolute')?.className).toContain('opacity-100');
  });

  it('applies the `hiding` opacity-0 class during the delayHide window', () => {
    render(
      <Tooltip content="Hide me" trigger="click" delayShow={0} delayHide={500}>
        <button>H</button>
      </Tooltip>
    );
    fireEvent.click(screen.getByRole('button', { name: 'H' }));
    expect(screen.getByText('Hide me').closest('.absolute')?.className).toContain('opacity-100');
    // trigger hide
    fireEvent.click(screen.getByRole('button', { name: 'H' }));
    // hiding phase: still mounted with opacity-0
    expect(screen.getByText('Hide me').closest('.absolute')?.className).toContain('opacity-0');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText('Hide me')).not.toBeInTheDocument();
  });

  it('forwards the consumer ref callback to the trigger element', () => {
    let captured: HTMLElement | null = null;
    render(
      <Tooltip content="ref" trigger="click" delayShow={0} delayHide={0} ref={(n) => { captured = n; }}>
        <button>R</button>
      </Tooltip>
    );
    expect(captured).toBeInstanceOf(HTMLButtonElement);
  });

  it('forwards a ref object to the trigger element', () => {
    const refHolder: { current: HTMLElement | null } = { current: null };
    render(
      <Tooltip content="refobj" trigger="click" delayShow={0} delayHide={0} ref={refHolder}>
        <button>RO</button>
      </Tooltip>
    );
    expect(refHolder.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('invokes custom render prop instead of default render', () => {
    const seen: boolean[] = [];
    const renderFn = (props: any) => {
      seen.push(props.open);
      return (
        <div data-testid="custom-render" ref={props.triggerRef as any} {...props.triggerAttributes} onClick={props.handleTriggerClick}>
          custom
        </div>
      );
    };
    render(
      <Tooltip content="c" trigger="click" delayShow={0} delayHide={0} render={renderFn}>
        <button>ignored</button>
      </Tooltip>
    );
    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    // click to exercise the open=true branch in the custom render
    fireEvent.click(screen.getByTestId('custom-render'));
    expect(seen).toContain(true);
  });

  it('keeps an interactive tooltip open when hovering into the tooltip body', () => {
    render(
      <Tooltip content="Interactive" trigger="hover" interactive delayShow={0} delayHide={0}>
        <button>I</button>
      </Tooltip>
    );
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'I' }));
    expect(screen.getByText('Interactive')).toBeInTheDocument();
    // hovering the tooltip body keeps it open
    fireEvent.mouseEnter(screen.getByText('Interactive'));
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'I' }));
    expect(screen.getByText('Interactive')).toBeInTheDocument();
    // leaving the tooltip body hides it
    fireEvent.mouseLeave(screen.getByText('Interactive'));
    expect(screen.queryByText('Interactive')).not.toBeInTheDocument();
  });
});

describe('SimpleTooltip', () => {
  it('renders and shows content on hover', () => {
    vi.useFakeTimers();
    render(
      <SimpleTooltip content="simple">
        <button>S</button>
      </SimpleTooltip>
    );
    expect(screen.getByRole('button', { name: 'S' })).toBeInTheDocument();
    // SimpleTooltip uses delayShow=300; advance fake timers via hover
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'S' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('simple')).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('RichTooltip', () => {
  it('renders all content sections (title, description, actions)', () => {
    render(
      <RichTooltip title="T" description="D" actions={<button>A</button>} trigger="click" delayShow={0} delayHide={0}>
        <button>R</button>
      </RichTooltip>
    );
    fireEvent.click(screen.getByRole('button', { name: 'R' }));
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  });

  it('renders with only a title (description and actions omitted)', () => {
    render(
      <RichTooltip title="Only title" trigger="click" delayShow={0} delayHide={0}>
        <button>OT</button>
      </RichTooltip>
    );
    fireEvent.click(screen.getByRole('button', { name: 'OT' }));
    expect(screen.getByText('Only title')).toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
  });
});

// Mounts the hook with live refs so calculatePosition runs against real DOM rects.
function renderTooltipWithRefs(props: Parameters<typeof useTooltip>[0] & { position?: TooltipPosition }) {
  let api: ReturnType<typeof useTooltip> | null = null;
  function Probe() {
    api = useTooltip(props);
    return (
      <>
        <button ref={api!.triggerRef as any} data-testid="trigger">
          t
        </button>
        <div ref={api!.tooltipRef as any} data-testid="tip">
          body
        </div>
      </>
    );
  }
  return { ...render(<Probe />), getApi: () => api! };
}

describe('useTooltip positioning', () => {
  beforeEach(() => {
    // jsdom returns zero rects; give the trigger a real-ish rect so positioning math runs.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.getAttribute('data-testid') === 'trigger') {
        return { left: 100, right: 200, top: 50, bottom: 80, width: 100, height: 30, x: 100, y: 50, toJSON: () => ({}) } as DOMRect;
      }
      return { left: 0, right: 50, top: 0, bottom: 20, width: 50, height: 20, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    });
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    'top', 'bottom', 'left', 'right',
    'top-start', 'top-end', 'bottom-start', 'bottom-end',
    'left-start', 'left-end', 'right-start', 'right-end',
  ] as TooltipPosition[])('computes a position for %s', (position) => {
    const { getApi } = renderTooltipWithRefs({ content: 'c', position, open: true });
    act(() => getApi().show());
    const pos = getApi().calculatePosition();
    expect(pos.position).toBeDefined();
  });

  it('skips the flip path entirely when flip is disabled', () => {
    const { getApi } = renderTooltipWithRefs({ content: 'c', position: 'top', flip: false, open: true });
    act(() => getApi().show());
    const pos = getApi().calculatePosition();
    expect(pos.position).toBe('top');
  });

  it('returns a zero position when refs are not mounted', () => {
    const { result } = renderHook(() => useTooltip({ content: 'c', position: 'top' }));
    expect(result.current.calculatePosition()).toEqual({ x: 0, y: 0, position: 'top' });
  });
});
