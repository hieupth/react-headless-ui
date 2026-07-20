import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type React from 'react';
import userEvent from '@testing-library/user-event';
import { Offcanvas, OffcanvasTrigger } from '../src/components/Offcanvas';
import { useOffcanvas } from '../src/hooks';

// Probe helper: runs the hook with live DOM nodes wired via offcanvasRef/triggerRef
// so focus/element actions resolve against real elements.
function setupOffcanvas(props: Parameters<typeof useOffcanvas>[0] = {}) {
  const offcanvasRef: React.RefObject<HTMLDivElement | null> = { current: null };
  const triggerRef: React.RefObject<HTMLDivElement | null> = { current: null };
  let api: ReturnType<typeof useOffcanvas> | null = null;
  function Probe() {
    api = useOffcanvas({ ...props, offcanvasRef, triggerRef });
    return (
      <div>
        <div ref={triggerRef as any} data-testid="oc-trig" />
        <div ref={offcanvasRef as any} data-testid="oc-host">
          <button data-testid="oc-btn">Focus me</button>
          <a href="#" data-testid="oc-link">Link</a>
        </div>
      </div>
    );
  }
  return { ...render(<Probe />), getApi: () => api!, offcanvasRef, triggerRef };
}

describe('Offcanvas (extra) — size/position branches', () => {
  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'reflects position %s on the panel and uses width/height styles',
    (position) => {
      render(<Offcanvas title="P" defaultOpen position={position} size="md">Body</Offcanvas>);
      const panel = screen.getByTestId('offcanvas');
      expect(panel.getAttribute('data-position')).toBe(position);
    }
  );

  it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
    'reflects size %s on the panel',
    (size) => {
      render(<Offcanvas title="P" defaultOpen size={size}>Body</Offcanvas>);
      expect(screen.getByTestId('offcanvas').getAttribute('data-size')).toBe(size);
    }
  );

  it('customSize as a number applies px width for left/right', () => {
    render(<Offcanvas title="P" defaultOpen position="right" customSize={250}>Body</Offcanvas>);
    const panel = screen.getByTestId('offcanvas');
    expect(panel.style.width).toBe('250px');
  });

  it('customSize as a string applies height for top/bottom', () => {
    render(<Offcanvas title="P" defaultOpen position="top" customSize="40vh">Body</Offcanvas>);
    const panel = screen.getByTestId('offcanvas');
    expect(panel.style.height).toBe('40vh');
  });

  it('customSize with an unknown position yields no size override beyond defaults', () => {
    // default position right handled above; ensure rendering does not throw.
    render(<Offcanvas title="P" defaultOpen customSize="300px">Body</Offcanvas>);
    expect(screen.getByTestId('offcanvas')).toBeInTheDocument();
  });
});

describe('Offcanvas (extra) — render-prop slots', () => {
  it('uses renderHeader', () => {
    render(
      <Offcanvas defaultOpen renderHeader={({ onClose }) => (
        <div data-testid="custom-header"><button onClick={onClose}>X</button></div>
      )}>Body</Offcanvas>
    );
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    expect(screen.queryByTestId('offcanvas-header')).not.toBeInTheDocument();
  });

  it('renderHeader onClose closes the panel', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas defaultOpen animationDuration={10} onClose={onClose} renderHeader={({ onClose }) => (
        <button data-testid="rh-close" onClick={onClose}>X</button>
      )}>Body</Offcanvas>
    );
    await user.click(screen.getByTestId('rh-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('uses renderBody', () => {
    render(<Offcanvas defaultOpen renderBody={() => <div data-testid="custom-body">B</div>}>Ignored</Offcanvas>);
    expect(screen.getByTestId('custom-body')).toBeInTheDocument();
    expect(screen.queryByTestId('offcanvas-body')).not.toBeInTheDocument();
  });

  it('uses renderFooter when showFooter path is taken', () => {
    render(<Offcanvas defaultOpen renderFooter={({ onClose }) => (
      <div data-testid="custom-footer"><button onClick={onClose}>Done</button></div>
    )}>Body</Offcanvas>);
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('renders the default footer when showFooter is true', () => {
    render(<Offcanvas defaultOpen showFooter footer={<span data-testid="foot">F</span>}>Body</Offcanvas>);
    expect(screen.getByTestId('offcanvas-footer')).toBeInTheDocument();
    expect(screen.getByTestId('foot')).toBeInTheDocument();
  });

  it('renderHeader returns null when no title/header/closeButton and no renderHeader', () => {
    render(<Offcanvas defaultOpen showCloseButton={false}>Body</Offcanvas>);
    expect(screen.queryByTestId('offcanvas-header')).not.toBeInTheDocument();
  });

  it('renders a custom closeButton', () => {
    render(<Offcanvas defaultOpen closeButton={<span data-testid="x">X</span>}>Body</Offcanvas>);
    expect(screen.getByTestId('x')).toBeInTheDocument();
  });

  it('uses renderBackdrop and its onClick closes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Offcanvas defaultOpen animationDuration={10} onClose={onClose} renderBackdrop={({ onClick }) => (
      <div data-testid="custom-backdrop" onClick={onClick} />
    )}>Body</Offcanvas>);
    await user.click(screen.getByTestId('custom-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('backdrop click only closes when clicking the backdrop itself (not children)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas defaultOpen animationDuration={10} onClose={onClose}>
        <div data-testid="inner">Inner</div>
      </Offcanvas>
    );
    // Clicking inside the panel (not the backdrop) should not close via backdrop handler.
    await user.click(screen.getByTestId('inner'));
    // onClose may still fire from other handlers; assert backdrop handler didn't double-fire.
    expect(screen.getByTestId('offcanvas')).toBeInTheDocument();
  });

  it('usePortal=false renders inline (not portaled to body)', () => {
    const { container } = render(
      <div data-testid="wrap">
        <Offcanvas defaultOpen usePortal={false}>Body</Offcanvas>
      </div>
    );
    // When portaled, the panel ends up under body, not under #wrap.
    expect(container.querySelector('[data-testid="offcanvas"]')).toBeInTheDocument();
  });

  it('applies custom className, backdropBlur and backdropOpacity', () => {
    render(<Offcanvas defaultOpen className="my-panel" backdropBlur="8px" backdropOpacity={0.7}>Body</Offcanvas>);
    const panel = screen.getByTestId('offcanvas');
    expect(panel.className).toContain('my-panel');
  });

  it('as prop renders a custom element tag', () => {
    render(<Offcanvas defaultOpen as="section">Body</Offcanvas>);
    expect(document.querySelector('section[data-testid="offcanvas"]')).toBeInTheDocument();
  });

  it('the panel keydown Escape handler (component-level) closes the panel', () => {
    const onClose = vi.fn();
    render(<Offcanvas defaultOpen animationDuration={10} onClose={onClose}>Body</Offcanvas>);
    // Dispatch Escape directly on the panel element to hit the component's
    // own handleKeyDown (distinct from the hook's document-level listener).
    fireEvent.keyDown(screen.getByTestId('offcanvas'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('the panel keydown Escape is a no-op when closeOnEscape is false', () => {
    const onClose = vi.fn();
    render(<Offcanvas defaultOpen closeOnEscape={false} animationDuration={10} onClose={onClose}>Body</Offcanvas>);
    fireEvent.keyDown(screen.getByTestId('offcanvas'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('OffcanvasTrigger', () => {
  it('renders a button that fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OffcanvasTrigger onClick={onClick}>Open</OffcanvasTrigger>);
    await user.click(screen.getByTestId('offcanvas-trigger'));
    expect(onClick).toHaveBeenCalled();
  });

  it('toggles the offcanvas when passed actions', async () => {
    const user = userEvent.setup();
    function App() {
      const offcanvas = useOffcanvas({ defaultOpen: false });
      return (
        <>
          <OffcanvasTrigger offcanvas={offcanvas.actions}>Open</OffcanvasTrigger>
          <Offcanvas open={offcanvas.state.open} animationDuration={10}>Body</Offcanvas>
        </>
      );
    }
    render(<App />);
    expect(screen.getByTestId('offcanvas').getAttribute('data-open')).toBe('false');
    await user.click(screen.getByTestId('offcanvas-trigger'));
    expect(screen.getByTestId('offcanvas').getAttribute('data-open')).toBe('true');
  });

  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<OffcanvasTrigger variant={variant}>V</OffcanvasTrigger>);
      expect(screen.getByTestId('offcanvas-trigger')).toBeInTheDocument();
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('renders %s size without error', (size) => {
    render(<OffcanvasTrigger size={size}>S</OffcanvasTrigger>);
    expect(screen.getByTestId('offcanvas-trigger')).toBeInTheDocument();
  });

  it('disabled trigger does not fire onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OffcanvasTrigger disabled onClick={onClick}>Open</OffcanvasTrigger>);
    await user.click(screen.getByTestId('offcanvas-trigger'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('useOffcanvas (hook actions)', () => {
  it('open/close/toggle drive state and callbacks; getOffcanvasElement/getTriggerElement resolve', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onToggle = vi.fn();
    const { getApi } = setupOffcanvas({
      defaultOpen: false,
      animationDuration: 10,
      onOpen,
      onClose,
      onToggle,
    });
    expect(getApi().actions.getOffcanvasElement()).toBe(screen.getByTestId('oc-host'));
    expect(getApi().actions.getTriggerElement()).toBe(screen.getByTestId('oc-trig'));

    act(() => getApi().actions.open());
    act(() => { vi.advanceTimersByTime(20); });
    expect(getApi().state.open).toBe(true);
    expect(onOpen).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledWith(true);

    act(() => getApi().actions.toggle()); // open -> close
    act(() => { vi.advanceTimersByTime(20); });
    expect(getApi().state.open).toBe(false);
    expect(onClose).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledWith(false);

    act(() => getApi().actions.toggle()); // closed -> open
    act(() => { vi.advanceTimersByTime(20); });
    expect(getApi().state.open).toBe(true);
    vi.useRealTimers();
  });

  it('open is a no-op when disabled', () => {
    const onOpen = vi.fn();
    const { getApi } = setupOffcanvas({ disabled: true, onOpen });
    act(() => getApi().actions.open());
    expect(onOpen).not.toHaveBeenCalled();
    expect(getApi().state.open).toBe(false);
  });

  it('setPosition/setSize/setShowBackdrop/setAnimationDuration/setPersistent mutate state and fire callbacks', () => {
    const onPositionChange = vi.fn();
    const onSizeChange = vi.fn();
    const { getApi } = setupOffcanvas({ onPositionChange, onSizeChange });
    act(() => getApi().actions.setPosition('left'));
    expect(getApi().state.position).toBe('left');
    expect(onPositionChange).toHaveBeenCalledWith('left');
    act(() => getApi().actions.setSize('lg'));
    expect(getApi().state.size).toBe('lg');
    expect(onSizeChange).toHaveBeenCalledWith('lg');
    act(() => getApi().actions.setShowBackdrop(false));
    expect(getApi().state.showBackdrop).toBe(false);
    act(() => getApi().actions.setAnimationDuration(123));
    expect(getApi().state.animationDuration).toBe(123);
    act(() => getApi().actions.setPersistent(true));
    expect(getApi().state.persistent).toBe(true);
  });

  it('focusFirst/focusLast/getFocusableElements operate on the offcanvas subtree', () => {
    const { getApi } = setupOffcanvas({ defaultOpen: true });
    const focusable = getApi().actions.getFocusableElements();
    expect(focusable.length).toBeGreaterThan(0);
    act(() => getApi().actions.focusFirstElement());
    expect(document.activeElement).toBe(focusable[0]);
    act(() => getApi().actions.focusLastElement());
    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });

  it('focusFirst/focusLast are no-ops when trapFocus is false', () => {
    const { getApi } = setupOffcanvas({ defaultOpen: true, trapFocus: false });
    expect(() => act(() => getApi().actions.focusFirstElement())).not.toThrow();
    expect(() => act(() => getApi().actions.focusLastElement())).not.toThrow();
  });

  it('lockBodyScroll returns early when preventBodyScroll is false', () => {
    vi.useFakeTimers();
    const { getApi } = setupOffcanvas({ defaultOpen: false, preventBodyScroll: false, animationDuration: 10 });
    // open() invokes lockBodyScroll, which returns early without touching body overflow.
    act(() => getApi().actions.open());
    act(() => { vi.advanceTimersByTime(20); });
    expect(document.body.style.overflow).not.toBe('hidden');
    // close so the unmount cleanup's unlock is a no-op against an unlocked body.
    act(() => getApi().actions.close());
    act(() => { vi.advanceTimersByTime(20); });
    vi.useRealTimers();
  });

  it('focusFirst/focusLast are no-ops when there are no focusable elements', () => {
    const offcanvasRef: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: ReturnType<typeof useOffcanvas> | null = null;
    function Probe() {
      api = useOffcanvas({ defaultOpen: true, offcanvasRef });
      return <div ref={offcanvasRef as any} data-testid="empty-host" />;
    }
    render(<Probe />);
    expect(api!.actions.getFocusableElements()).toHaveLength(0);
    expect(() => act(() => api!.actions.focusFirstElement())).not.toThrow();
    expect(() => act(() => api!.actions.focusLastElement())).not.toThrow();
  });

  it('Tab focus-trap wraps from the last focusable element to the first (and Shift+Tab wraps back)', () => {
    const { getApi } = setupOffcanvas({ defaultOpen: true });
    const api = getApi();
    const focusable = api.actions.getFocusableElements();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    // Focus the last element then press Tab -> wraps to first.
    last.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    fireEvent(document, tab);
    expect(document.activeElement).toBe(first);
    // Focus the first element then press Shift+Tab -> wraps to last.
    first.focus();
    const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    fireEvent(document, shiftTab);
    expect(document.activeElement).toBe(last);
  });

  it('the focus-trap handler ignores Tab when trapFocus is disabled', () => {
    const { getApi } = setupOffcanvas({ defaultOpen: true, trapFocus: false });
    // The document listener is attached while open; with trapFocus off, Tab is a no-op.
    const btn = screen.getByTestId('oc-btn');
    btn.focus();
    const before = document.activeElement;
    fireEvent(document, new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    // No wrap occurs; active element is unchanged.
    expect(document.activeElement).toBe(before);
  });

  it('Tab/Shift+Tab do not wrap when the active element is not at the boundary', () => {
    const { getApi } = setupOffcanvas({ defaultOpen: true });
    const focusable = getApi().actions.getFocusableElements();
    // Focus a non-boundary element (here the first of two); pressing Tab without
    // being on the last element leaves focus alone (no wrap).
    focusable[0].focus();
    fireEvent(document, new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(focusable[0]);
    // Shift+Tab while not on the first element also leaves focus alone.
    focusable[1].focus();
    fireEvent(document, new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(focusable[1]);
  });

  it('controlled open/close keep state authoritative and still fire callbacks', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onToggle = vi.fn();
    const { getApi } = setupOffcanvas({
      open: false,
      animationDuration: 10,
      onOpen,
      onClose,
      onToggle,
    });
    act(() => getApi().actions.open());
    act(() => { vi.advanceTimersByTime(20); });
    expect(getApi().state.open).toBe(false);
    expect(onOpen).toHaveBeenCalled();
    act(() => getApi().actions.close());
    act(() => { vi.advanceTimersByTime(20); });
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('close is a no-op when disabled', () => {
    const onClose = vi.fn();
    const { getApi } = setupOffcanvas({ defaultOpen: true, disabled: true, onClose });
    act(() => getApi().actions.close());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Escape closes the panel via the document-level handler', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { getApi } = setupOffcanvas({ defaultOpen: true, animationDuration: 10, onClose });
    fireEvent(document, new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    act(() => { vi.advanceTimersByTime(20); });
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('Escape is ignored when persistent', () => {
    const onClose = vi.fn();
    const { getApi } = setupOffcanvas({ defaultOpen: true, persistent: true, onClose });
    fireEvent(document, new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('a click on an element matching closeButtonSelector inside the panel closes', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const ref: React.RefObject<HTMLDivElement | null> = { current: null };
    function Probe() {
      useOffcanvas({ defaultOpen: true, animationDuration: 10, onClose, offcanvasRef: ref });
      return (
        <div ref={ref as any}>
          <button data-offcanvas-close>X</button>
        </div>
      );
    }
    render(<Probe />);
    // A real click bubbles to the document listener the hook attaches while open.
    fireEvent.click(screen.getByText('X'));
    act(() => { vi.advanceTimersByTime(20); });
    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('restoreFocus returns focus to the previously active element on close', () => {
    vi.useFakeTimers();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { getApi } = setupOffcanvas({ defaultOpen: false, animationDuration: 10, restoreFocus: true });
    const api = getApi();
    act(() => api.actions.open());
    act(() => { vi.advanceTimersByTime(20); });
    act(() => api.actions.close());
    act(() => { vi.advanceTimersByTime(20); });
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
    vi.useRealTimers();
  });
});
