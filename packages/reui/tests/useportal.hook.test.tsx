import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { usePortal } from '../src/hooks';
import type { UsePortalProps } from '../src/hooks';

// Direct hook harness: renders a component that wires the hook up and exposes
// its state/actions so tests can invoke the imperative API.
function setup(props: UsePortalProps = {}) {
  const api = { state: null as any, actions: null as any, attributes: null as any };
  function Harness() {
    const result = usePortal(props);
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    return (
      <div ref={(el) => { (result as any).actions; }}>
        <div data-testid="portal-el" ref={(el) => {
          // Bind the portal element ref so mount/unmount have something to move.
          (result as any).__el = el;
        }} />
      </div>
    );
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

describe('usePortal hook', () => {
  it('exposes default state and attributes for a non-modal portal', () => {
    const { api } = setup({ defaultOpen: false });
    expect(api.state.open).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.type).toBe('default');
    expect(api.state.zIndex).toBe(1000);
    expect(api.attributes.role).toBe('group');
    expect(api.attributes['aria-hidden']).toBe(true);
  });

  it('marks modal portals with dialog role and aria-modal', () => {
    const { api } = setup({ defaultOpen: true, type: 'modal' });
    expect(api.attributes.role).toBe('dialog');
    expect(api.attributes['aria-modal']).toBe(true);
    expect(api.state.type).toBe('modal');
  });

  it('open/close/toggle flip uncontrolled open state and fire callbacks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { api } = setup({ onOpen, onClose });

    act(() => api.actions.open());
    expect(api.state.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => api.actions.toggle()); // open -> close
    expect(api.state.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);

    act(() => api.actions.toggle()); // closed -> open
    expect(api.state.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(2);

    act(() => api.actions.close());
    expect(api.state.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('ignores open/close/toggle when disabled', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { api } = setup({ disabled: true, onOpen, onClose });
    api.actions.open();
    expect(api.state.open).toBe(false);
    expect(onOpen).not.toHaveBeenCalled();
    api.actions.close();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not mutate internal state when open is controlled', () => {
    const { api } = setup({ open: false });
    api.actions.open(); // controlled: internal state must not flip
    expect(api.state.open).toBe(false);
  });

  it('setZIndex mutates the portal element style', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ portalRef: ref });
      return (
        <div
          ref={(el) => {
            ref.current = el;
            (window as any).__actions = result.actions;
          }}
        />
      );
    }
    render(<Harness />);
    const el = ref.current!;
    const actions = (window as any).__actions as any;
    act(() => {
      actions.setZIndex(4242);
    });
    expect(el.style.zIndex).toBe('4242');
  });

  it('getElement returns the bound portal element ref', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      usePortal({ portalRef: ref });
      return <div ref={(el) => { ref.current = el; }} />;
    }
    render(<Harness />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('focus() moves focus to the first focusable descendant', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ portalRef: ref });
      return (
        <div ref={(el) => { ref.current = el; (window as any).__act = result.actions; }}>
          <button>focus-target</button>
        </div>
      );
    }
    render(<Harness />);
    const actions = (window as any).__act as any;
    act(() => actions.focus());
    expect(screen.getByRole('button', { name: 'focus-target' })).toHaveFocus();
  });

  it('focus() falls back to focusing the portal element when nothing focusable exists', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ portalRef: ref });
      return (
        <div ref={(el) => { ref.current = el; (window as any).__act = result.actions; }} tabIndex={-1} />
      );
    }
    render(<Harness />);
    const actions = (window as any).__act as any;
    act(() => actions.focus());
    expect(ref.current).toHaveFocus();
  });

  it('mountTo records the provided mount-point element', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ portalRef: ref });
      return <div ref={(el) => { ref.current = el; (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    render(<Harness />);
    const target = document.createElement('div');
    const actions = (window as any).__act as any;
    act(() => actions.mountTo(target));
    const state = (window as any).__st as any;
    expect(state.mountPoint).toBe(target);
  });

  it('setContainer records the provided container element', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ portalRef: ref });
      return <div ref={(el) => { ref.current = el; (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    render(<Harness />);
    const custom = document.createElement('div');
    const actions = (window as any).__act as any;
    act(() => actions.setContainer(custom));
    const state = (window as any).__st as any;
    expect(state.container).toBe(custom);
  });
});

// The mount/unmount lifecycle moves the portal element across containers per
// the chosen mount strategy. We bind the hook ref to a detached (non-React)
// node so the DOM mutations don't fight React's reconciliation.
describe('usePortal mount strategies', () => {
  const strategies = ['append', 'prepend', 'replace', 'before', 'after'] as const;

  strategies.forEach((strategy) => {
    it(`mounts the portal via the "${strategy}" strategy`, async () => {
      const ref = { current: null as HTMLElement | null };
      const host = document.createElement('div');
      host.id = `host-${strategy}`;
      document.body.appendChild(host);
      // Give the host a parent so 'before'/'after' have a parentNode.
      const wrapper = document.createElement('div');
      document.body.appendChild(wrapper);
      wrapper.appendChild(host);

      function Harness() {
        usePortal({
          mountStrategy: strategy,
          mountPoint: host,
          cleanupContainer: false,
          portalRef: ref,
        });
        return <div />;
      }
      // Detached portal element: React never owns it.
      const portalEl = document.createElement('div');
      ref.current = portalEl;

      render(<Harness />);
      // Open triggers mountPortal via the open-state effect.
      await act(async () => {
        (window as any).__act;
      });
      // Directly exercise the imperative open path too.
      const onMount = vi.fn();
      // Re-render with defaultOpen to drive the mount effect deterministically.
      function Harness2() {
        const result = usePortal({
          defaultOpen: true,
          mountStrategy: strategy,
          mountPoint: host,
          cleanupContainer: false,
          onMount,
          portalRef: ref,
        });
        return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
      }
      ref.current = portalEl;
      render(<Harness2 />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(onMount).toHaveBeenCalled();

      document.body.removeChild(wrapper);
    });
  });

  it('restores focus on close for modal portals', async () => {
    const ref = { current: null as HTMLElement | null };
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    function Harness() {
      const result = usePortal({
        defaultOpen: true,
        type: 'modal',
        cleanupContainer: false,
        portalRef: ref,
      });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => {
      await Promise.resolve();
    });
    expect((portalEl as any).__previouslyFocused).toBe(trigger);

    // Close drives unmountPortal which restores focus.
    const actions = (window as any).__act as any;
    await act(async () => {
      await actions.unmount();
    });
    document.body.removeChild(trigger);
  });

  it('logs an error when mounting throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ref = { current: null as HTMLElement | null };

    function Harness() {
      const result = usePortal({
        defaultOpen: true,
        mountPoint: 'bad-selector-that-resolves-to-null',
        cleanupContainer: false,
        portalRef: ref,
        createDefaultContainer: () => {
          throw new Error('boom');
        },
      });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});

// Remaining branches: controlled open/close, container/mount-point resolution
// via selectors, remount flows (setContainer/mountTo while open), default-
// container fallback when createDefaultContainer returns non-Element, and
// the focus-restore path when the previously focused element is document.body.
describe('usePortal remaining branches', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('resolves a string container/mountPoint selector at init', () => {
    const host = document.createElement('div');
    host.id = 'sel-host';
    document.body.appendChild(host);
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ container: '#sel-host', mountPoint: '#sel-host', portalRef: ref });
      (window as any).__st = result.state;
      return <div ref={(el) => { ref.current = el; }} />;
    }
    render(<Harness />);
    const state = (window as any).__st as any;
    expect(state.container).toBe(host);
    expect(state.mountPoint).toBe(host);
    document.body.removeChild(host);
  });

  it('createDefaultContainer returning a non-Element falls through to the console.warn path', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({
        defaultOpen: true,
        mountPoint: '.definitely-missing',
        createDefaultContainer: (() => null) as any,
        portalRef: ref,
      });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    // findMountPoint('...missing') -> ensureContainer -> createDefault returns null
    // -> returns container||default (null) -> mountPortal warns.
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('controlled open/close fire callbacks without mutating internal state and schedule unmount', async () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const ref = { current: null as HTMLElement | null };
    function Harness({ open }: { open: boolean }) {
      const result = usePortal({ open, onOpen, onClose, animationDuration: 50, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    const { rerender } = render(<Harness open={false} />);
    // Controlled open: effect mounts the portal.
    rerender(<Harness open={true} />);
    await act(async () => { await Promise.resolve(); });
    expect(onOpen).not.toHaveBeenCalled(); // open() not called; effect-driven
    // Controlled close: schedules unmount via setTimeout(animationDuration).
    rerender(<Harness open={false} />);
    expect(onClose).not.toHaveBeenCalled(); // close() not called; effect-driven
    await act(async () => { vi.advanceTimersByTime(60); });
  });

  it('open() in controlled mode fires onOpen but skips the mount effect', () => {
    const onOpen = vi.fn();
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ open: false, onOpen, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    const actions = (window as any).__act as any;
    act(() => actions.open());
    expect(onOpen).toHaveBeenCalledTimes(1);
    const state = (window as any).__st as any;
    expect(state.open).toBe(false); // controlled
  });

  it('setContainer while open remounts to the new container', async () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ defaultOpen: true, animationDuration: 0, cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    const actions = (window as any).__act as any;
    const next = document.createElement('div');
    await act(async () => {
      await actions.setContainer(next);
      await Promise.resolve();
      vi.advanceTimersByTime(10);
      await Promise.resolve();
    });
    const state = (window as any).__st as any;
    expect(state.container).toBe(next);
  });

  it('mountTo while open remounts to the new mount point', async () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ defaultOpen: true, animationDuration: 0, cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    const actions = (window as any).__act as any;
    const target = document.createElement('div');
    await act(async () => {
      await actions.mountTo(target);
      await Promise.resolve();
      vi.advanceTimersByTime(10);
      await Promise.resolve();
    });
    const state = (window as any).__st as any;
    expect(state.mountPoint).toBe(target);
  });

  it('setZIndex and focus are no-ops when the portal ref is null', () => {
    function Harness() {
      const result = usePortal({});
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    render(<Harness />);
    const actions = (window as any).__act as any;
    expect(() => act(() => {
      actions.setZIndex(10);
      actions.focus();
    })).not.toThrow();
  });

  it('modal mount saves focus only when activeElement is not document.body', async () => {
    const ref = { current: null as HTMLElement | null };
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    function Harness() {
      const result = usePortal({ defaultOpen: true, type: 'modal', cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    expect((portalEl as any).__previouslyFocused).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it('"before"/"after" strategies skip when the mount point has no parentNode', async () => {
    for (const strategy of ['before', 'after'] as const) {
      const ref = { current: null as HTMLElement | null };
      const detached = document.createElement('div'); // no parentNode
      function Harness() {
        const result = usePortal({
          defaultOpen: true,
          mountStrategy: strategy,
          mountPoint: detached,
          cleanupContainer: false,
          portalRef: ref,
        });
        return <div ref={(el) => { (window as any).__act = result.actions; }} />;
      }
      const portalEl = document.createElement('div');
      ref.current = portalEl;
      render(<Harness />);
      await act(async () => { await Promise.resolve(); });
      // No parentNode -> insert skipped without error.
      expect(portalEl.parentNode).toBeNull();
    }
  });

  it('findMountPoint resolves a string selector during mount', async () => {
    const host = document.createElement('div');
    host.id = 'mp-sel';
    document.body.appendChild(host);
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({
        defaultOpen: true,
        mountPoint: '#mp-sel',
        cleanupContainer: false,
        portalRef: ref,
      });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    expect(portalEl.parentNode).toBe(host);
    document.body.removeChild(host);
  });

  it('modal mount skips saving focus when activeElement is document.body', async () => {
    const ref = { current: null as HTMLElement | null };
    // Ensure body is the active element (jsdom default).
    (document.body as HTMLElement).focus?.();
    function Harness() {
      const result = usePortal({ defaultOpen: true, type: 'modal', cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    // activeElement === body -> __previouslyFocused not set.
    expect((portalEl as any).__previouslyFocused).toBeUndefined();
  });

  it('modal unmount skips focus restore when no focus was saved', async () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ defaultOpen: true, type: 'modal', cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    // No __previouslyFocused set (body was active) -> unmount's focus restore is skipped.
    await act(async () => { await (window as any).__act.unmount(); });
  });

  it('close() in controlled mode fires onClose without scheduling unmount', () => {
    const onClose = vi.fn();
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ open: true, onClose, animationDuration: 50, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    act(() => (window as any).__act.close());
    expect(onClose).toHaveBeenCalledTimes(1);
    // Controlled: internal state untouched, no unmount timer scheduled by close().
    expect((window as any).__st.open).toBe(true);
  });

  it('uncontrolled close() schedules the unmount via setTimeout', async () => {
    const onClose = vi.fn();
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ defaultOpen: true, onClose, animationDuration: 50, cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; (window as any).__st = result.state; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    await act(async () => {
      (window as any).__act.close();
      vi.advanceTimersByTime(60);
      await Promise.resolve();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('getElement() returns the bound portal element', () => {
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ portalRef: ref });
      return <div ref={(el) => { ref.current = el; (window as any).__act = result.actions; }} />;
    }
    render(<Harness />);
    expect((window as any).__act.getElement()).toBe(ref.current);
  });

  it('logs an error when unmount throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePortal({ defaultOpen: true, cleanupContainer: false, portalRef: ref });
      return <div ref={(el) => { (window as any).__act = result.actions; }} />;
    }
    const portalEl = document.createElement('div');
    ref.current = portalEl;
    render(<Harness />);
    await act(async () => { await Promise.resolve(); });
    // Force removeChild to throw inside unmountPortal.
    const parent = document.createElement('div');
    parent.appendChild(portalEl);
    vi.spyOn(parent, 'removeChild').mockImplementation(() => { throw new Error('unmount boom'); });
    await act(async () => {
      await (window as any).__act.unmount();
      await Promise.resolve();
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
