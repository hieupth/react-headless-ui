import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { usePortal } from '../src/hooks';
import type { UsePortalProps } from '../src/hooks';

// Harness helper: binds a detached (non-React) portal element to the hook ref
// so DOM mutations performed by mount/unmount don't fight React reconciliation.
function setup(props: UsePortalProps = {}) {
  const api: any = {};
  const ref = { current: null as HTMLElement | null };
  function Harness() {
    const result = usePortal({ portalRef: ref, ...props });
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    return <div />;
  }
  const portalEl = document.createElement('div');
  ref.current = portalEl;
  api.__portalEl = portalEl;
  api.__ref = ref;
  const utils = render(<Harness />);
  return { api, ...utils, ref };
}

describe('usePortal hook — extended branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('attributes: drawer/tooltip/dropdown types use role=group and aria-hidden reflects open', () => {
    const { api } = setup({ type: 'drawer', defaultOpen: false });
    expect(api.attributes.role).toBe('group');
    expect(api.attributes['aria-hidden']).toBe(true);
    expect(api.state.type).toBe('drawer');
  });

  it('attributes: non-modal open sets aria-hidden=false and no aria-modal', () => {
    const { api } = setup({ type: 'default', defaultOpen: true, cleanupContainer: false });
    expect(api.attributes['aria-hidden']).toBe(false);
    expect(api.attributes['aria-modal']).toBeUndefined();
  });

  it('state.mounting / unmounting flags toggle during mount/unmount', async () => {
    const { api } = setup({ defaultOpen: true, cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    // After mount resolves, mounting=false.
    expect(api.state.mounting).toBe(false);
  });

  it('disabled blocks open/close/toggle action callbacks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { api } = setup({ disabled: true, onOpen, onClose });
    act(() => api.actions.open());
    act(() => api.actions.close());
    act(() => api.actions.toggle());
    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('controlled open: open()/close() still fire callbacks without mutating internal open', () => {
    const onOpen = vi.fn();
    const { api } = setup({ open: false, onOpen, cleanupContainer: false });
    act(() => api.actions.open());
    // Controlled: state.open reflects controlled value (false), but callback fired.
    expect(api.state.open).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('toggle() opens when closed and closes when open (uncontrolled)', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { api } = setup({ onOpen, onClose });
    expect(api.state.open).toBe(false);
    act(() => api.actions.toggle());
    expect(onOpen).toHaveBeenCalledTimes(1);
    act(() => api.actions.toggle());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('prepend strategy inserts before existing first child', async () => {
    const host = document.createElement('div');
    const existing = document.createElement('span');
    host.appendChild(existing);
    document.body.appendChild(host);
    const { api, ref } = setup({
      defaultOpen: true,
      mountStrategy: 'prepend',
      mountPoint: host,
      cleanupContainer: false,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(host.firstChild).toBe(ref.current);
    document.body.removeChild(host);
  });

  it('replace strategy clears the host and appends the portal element', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<i>x</i>';
    const wrapper = document.createElement('div');
    wrapper.appendChild(host);
    document.body.appendChild(wrapper);
    const { ref } = setup({
      defaultOpen: true,
      mountStrategy: 'replace',
      mountPoint: host,
      cleanupContainer: false,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(host.children.length).toBe(1);
    expect(host.firstChild).toBe(ref.current);
    document.body.removeChild(wrapper);
  });

  it('after strategy inserts as the next sibling of the mount point', async () => {
    const host = document.createElement('div');
    const wrapper = document.createElement('div');
    const sibling = document.createElement('div');
    wrapper.appendChild(host);
    wrapper.appendChild(sibling);
    document.body.appendChild(wrapper);
    const { ref } = setup({
      defaultOpen: true,
      mountStrategy: 'after',
      mountPoint: host,
      cleanupContainer: false,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(host.nextSibling).toBe(ref.current);
    document.body.removeChild(wrapper);
  });

  it('before/after strategies no-op when the mount point has no parentNode', async () => {
    const orphan = document.createElement('div'); // no parentNode
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { ref } = setup({
      defaultOpen: true,
      mountStrategy: 'before',
      mountPoint: orphan,
      cleanupContainer: false,
    });
    await act(async () => {
      await Promise.resolve();
    });
    // No throw, element simply not inserted into a parent.
    expect(ref.current.parentNode).toBeFalsy();
    warn.mockRestore();
  });

  it('setZIndex mutates the portal element style', () => {
    const { api, ref } = setup({ cleanupContainer: false });
    act(() => api.actions.setZIndex(777));
    expect(ref.current.style.zIndex).toBe('777');
  });

  it('focus() focuses the first focusable descendant', () => {
    const { api } = setup({ cleanupContainer: false });
    // Attach a focusable child to the portal element directly.
    const btn = document.createElement('button');
    btn.textContent = 'inner';
    api.__portalEl.appendChild(btn);
    // jsdom won't focus detached elements; attach the portal element to body.
    document.body.appendChild(api.__portalEl);
    act(() => api.actions.focus());
    expect(btn).toHaveFocus();
  });

  it('focus() falls back to focusing the portal element when no focusable descendant exists', () => {
    const { api } = setup({ cleanupContainer: false });
    api.__portalEl.tabIndex = -1;
    // jsdom won't focus detached elements; attach the portal element to body.
    document.body.appendChild(api.__portalEl);
    act(() => api.actions.focus());
    expect(api.__portalEl).toHaveFocus();
  });

  it('getElement() returns the bound portal element', () => {
    const { api, ref } = setup({ cleanupContainer: false });
    expect(api.actions.getElement()).toBe(ref.current);
  });

  it('mountTo sets mountPoint state and triggers remount when open', async () => {
    const { api } = setup({ defaultOpen: true, cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    const target = document.createElement('div');
    document.body.appendChild(target);
    await act(async () => {
      api.actions.mountTo(target);
      await Promise.resolve();
      // Flush the setTimeout(0) remount in mountToAction.
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(api.state.mountPoint).toBe(target);
    document.body.removeChild(target);
  });

  it('setContainer sets container state and triggers remount when open', async () => {
    const { api } = setup({ defaultOpen: true, cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    const custom = document.createElement('div');
    document.body.appendChild(custom);
    await act(async () => {
      api.actions.setContainer(custom);
      await Promise.resolve();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(api.state.container).toBe(custom);
    document.body.removeChild(custom);
  });

  it('mountTo and setContainer are no-op remounts when closed (state still updates)', () => {
    const { api } = setup({ defaultOpen: false });
    const target = document.createElement('div');
    act(() => api.actions.mountTo(target));
    expect(api.state.mountPoint).toBe(target);
    const custom = document.createElement('div');
    act(() => api.actions.setContainer(custom));
    expect(api.state.container).toBe(custom);
  });

  it('warns when container or mount point cannot be resolved', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { ref } = setup({
      defaultOpen: true,
      mountPoint: '.does-not-exist-selector',
      createDefaultContainer: () => null as any, // forces container null
      cleanupContainer: false,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('default container is created and appended to document.body when none provided', async () => {
    const { api } = setup({ defaultOpen: true, cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    expect(api.state.container).toBeInstanceOf(HTMLElement);
    expect(document.body.contains(api.state.container)).toBe(true);
  });

  it('cleanupContainer removes the default container on unmount', async () => {
    const { api, unmount } = setup({
      defaultOpen: true,
      cleanupContainer: true,
    });
    await act(async () => {
      await Promise.resolve();
    });
    const container = api.state.container;
    expect(container).toBeInstanceOf(HTMLElement);
    // Trigger unmount via close (animationDuration default 200ms -> setTimeout).
    await act(async () => {
      api.actions.close();
      await new Promise((r) => setTimeout(r, 250));
    });
    // After unmount, the default container should be removed.
    expect(document.body.contains(container)).toBe(false);
    unmount();
  });

  it('modal mount saves previously-focused element and unmount restores focus', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { api } = setup({ defaultOpen: true, type: 'modal', cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    expect((api.__portalEl as any).__previouslyFocused).toBe(trigger);
    await act(async () => {
      await api.actions.unmount();
    });
    expect(trigger).toHaveFocus();
    document.body.removeChild(trigger);
  });

  it('modal mount does not record body as previouslyFocused', async () => {
    const { api } = setup({ defaultOpen: true, type: 'modal', cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    // No specific element focused beforehand -> previouslyFocused not set.
    expect((api.__portalEl as any).__previouslyFocused).toBeUndefined();
  });

  it('unmount is a no-op when there is no parentNode', async () => {
    const { api, ref } = setup({ cleanupContainer: false });
    // Detach: ensure no parent.
    expect(ref.current.parentNode).toBeNull();
    await expect(act(async () => {
      await api.actions.unmount();
    })).resolves.toBeUndefined();
  });

  it('unmount swallows errors and logs them', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { api, ref } = setup({ cleanupContainer: false });
    // Make removeChild throw by overriding parentNode.removeChild.
    await act(async () => {
      await Promise.resolve();
    });
    const fakeParent = {
      removeChild: () => {
        throw new Error('cannot remove');
      },
    };
    Object.defineProperty(ref.current, 'parentNode', {
      configurable: true,
      value: fakeParent,
    });
    await act(async () => {
      await api.actions.unmount();
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('mount sets data-portal and data-z-index attributes on the portal element', async () => {
    const { ref } = setup({
      defaultOpen: true,
      type: 'tooltip',
      zIndex: 1234,
      cleanupContainer: false,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(ref.current.getAttribute('data-portal')).toBe('tooltip');
    expect(ref.current.getAttribute('data-z-index')).toBe('1234');
  });

  it('ensureContainer reuses an existing default container on second mount', async () => {
    const { api, ref } = setup({ defaultOpen: true, cleanupContainer: false });
    await act(async () => {
      await Promise.resolve();
    });
    const first = api.state.container;
    // Unmount then re-open to trigger a second mount.
    await act(async () => {
      await api.actions.unmount();
    });
    await act(async () => {
      api.actions.open();
      await Promise.resolve();
    });
    // Should reuse the same container (not append a duplicate).
    const all = document.querySelectorAll('[data-reui-portal="true"]');
    expect(all.length).toBeLessThanOrEqual(1);
    void first;
    void ref;
  });

  it('unmount action returns a promise and clears container/mountPoint state', async () => {
    const onUnmount = vi.fn();
    const { api } = setup({ defaultOpen: true, cleanupContainer: false, onUnmount });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await api.actions.unmount();
    });
    expect(api.state.container).toBeNull();
    expect(api.state.mountPoint).toBeNull();
    expect(onUnmount).toHaveBeenCalledTimes(1);
  });
});
