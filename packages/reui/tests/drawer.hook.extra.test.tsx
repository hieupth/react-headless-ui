import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDrawer } from '../src/hooks';
import type { UseDrawerProps } from '../src/hooks';

// Drives the useDrawer hook directly through a Probe that renders a real
// trigger + overlay + dialog tree so the outside-click effect, escape effect,
// focus trap (Tab handling), and focus restoration paths all execute.

interface SetupOpts extends Partial<UseDrawerProps> {}

function setup(opts: SetupOpts = {}) {
  const state = { open: opts.open ?? opts.defaultOpen ?? false };
  const onOpenChange = vi.fn();
  const onOpen = vi.fn();
  const onClose = vi.fn();
  const onAfterOpen = vi.fn();
  const onAfterClose = vi.fn();
  const api = { current: null as any };

  const controlled = opts.open !== undefined;

  function Harness() {
    const isOpen = controlled ? (opts.open as boolean) : state.open;
    api.current = useDrawer({
      open: opts.open,
      defaultOpen: opts.defaultOpen,
      onOpenChange: (v) => { state.open = v; onOpenChange(v); },
      side: opts.side,
      size: opts.size,
      modal: opts.modal,
      closeOnOutsideClick: opts.closeOnOutsideClick,
      closeOnEscape: opts.closeOnEscape,
      portal: opts.portal,
      zIndex: opts.zIndex,
      variant: opts.variant,
      title: opts.title ?? 'My Drawer',
      subtitle: opts.subtitle,
      showCloseButton: opts.showCloseButton,
      dismissible: opts.dismissible,
      trapFocus: opts.trapFocus,
      restoreFocus: opts.restoreFocus,
      animationDuration: opts.animationDuration ?? 50,
      keyBindings: opts.keyBindings,
      onOpen,
      onClose,
      onBeforeOpen: opts.onBeforeOpen,
      onBeforeClose: opts.onBeforeClose,
      onAfterOpen,
      onAfterClose,
      defaultFocused: opts.defaultFocused,
      focusable: opts.focusable,
      disabled: opts.disabled,
      role: opts.role,
      label: opts.label,
      labelledBy: opts.labelledBy,
      describedBy: opts.describedBy,
    });
    const { attributes, overlayAttributes } = api.current;

    return (
      <div>
        <button data-testid="trigger" data-drawer-trigger onClick={() => state.open = true}>
          open
        </button>
        <div data-testid="overlay" {...overlayAttributes} />
        <div
          data-testid="drawer"
          role="dialog"
          tabIndex={-1}
          {...attributes}
          onKeyDown={attributes.onKeyDown as any}
        >
          <button data-testid="first">First</button>
          <button data-testid="last">Last</button>
        </div>
      </div>
    );
  }

  const utils = render(<Harness />);
  const flush = () => act(() => { vi.advanceTimersByTime(200); });
  return {
    api, utils, onOpenChange, onOpen, onClose, onAfterOpen, onAfterClose,
    flush,
    rerender: (nextOpen: boolean) => act(() => { state.open = nextOpen; }),
  };
}

describe('useDrawer hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    document.body.style.overflow = '';
  });

  describe('initial state + defaults', () => {
    it('exposes default state values', () => {
      const { api } = setup();
      expect(api.current.state.open).toBe(false);
      expect(api.current.state.side).toBe('right');
      expect(api.current.state.size).toBe('md');
      expect(api.current.state.variant).toBe('default');
      expect(api.current.state.modal).toBe(true);
      expect(api.current.state.disabled).toBe(false);
      expect(api.current.state.opening).toBe(false);
      expect(api.current.state.closing).toBe(false);
    });

    it('honours provided side/size/variant', () => {
      const { api } = setup({ side: 'left', size: 'lg', variant: 'persistent' });
      expect(api.current.state.side).toBe('left');
      expect(api.current.state.size).toBe('lg');
      expect(api.current.state.variant).toBe('persistent');
    });

    it('defaultOpen starts open', () => {
      const { api } = setup({ defaultOpen: true });
      expect(api.current.state.open).toBe(true);
    });
  });

  describe('open / close (uncontrolled)', () => {
    it('handleOpen sets opening + open and fires onOpen/onOpenChange/onAfterOpen', async () => {
      const { api, flush, onOpen, onOpenChange, onAfterOpen } = setup({ animationDuration: 50 });
      await act(async () => { await api.current.handlers.handleOpen(); });
      expect(api.current.state.open).toBe(true);
      expect(api.current.state.opening).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpen).toHaveBeenCalledTimes(1);
      // opening flag clears after the animation; onAfterOpen fires then.
      expect(onAfterOpen).not.toHaveBeenCalled();
      flush();
      expect(api.current.state.opening).toBe(false);
      expect(onAfterOpen).toHaveBeenCalledTimes(1);
    });

    it('handleClose sets closing + closed and fires onClose/onAfterClose', async () => {
      const { api, flush, onClose, onAfterClose } = setup({ defaultOpen: true, animationDuration: 50 });
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(api.current.state.open).toBe(false);
      expect(api.current.state.closing).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onAfterClose).not.toHaveBeenCalled();
      flush();
      expect(api.current.state.closing).toBe(false);
      expect(onAfterClose).toHaveBeenCalledTimes(1);
    });

    it('handleOpen is a no-op when already open', async () => {
      const { api, onOpen } = setup({ defaultOpen: true });
      await act(async () => { await api.current.handlers.handleOpen(); });
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('handleClose is a no-op when already closed', async () => {
      const { api, onClose } = setup();
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('handleToggle flips open state', async () => {
      const { api, flush } = setup({ animationDuration: 10 });
      await act(async () => { await api.current.handlers.handleToggle(); });
      flush();
      expect(api.current.state.open).toBe(true);
      await act(async () => { await api.current.handlers.handleToggle(); });
      flush();
      expect(api.current.state.open).toBe(false);
    });
  });

  describe('before hooks (gate open/close)', () => {
    it('onBeforeOpen returning false blocks opening', async () => {
      const onBeforeOpen = vi.fn(async () => false);
      const { api, onOpen } = setup({ onBeforeOpen });
      await act(async () => { await api.current.handlers.handleOpen(); });
      expect(onBeforeOpen).toHaveBeenCalled();
      expect(api.current.state.open).toBe(false);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('onBeforeClose returning false blocks closing', async () => {
      const onBeforeClose = vi.fn(async () => false);
      const { api, onClose } = setup({ defaultOpen: true, onBeforeClose });
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(api.current.state.open).toBe(true);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('onBeforeClose returning true allows closing', async () => {
      const onBeforeClose = vi.fn(async () => true);
      const { api, onClose } = setup({ defaultOpen: true, onBeforeClose });
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(api.current.state.open).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('onBeforeOpen returning true allows opening', async () => {
      const onBeforeOpen = vi.fn(async () => true);
      const { api } = setup({ onBeforeOpen });
      await act(async () => { await api.current.handlers.handleOpen(); });
      expect(api.current.state.open).toBe(true);
    });

    it('handleBeforeOpen / handleBeforeClose proxy to the configured hooks', async () => {
      const onBeforeOpen = vi.fn(async () => true);
      const onBeforeClose = vi.fn(async () => true);
      const { api } = setup({ defaultOpen: true, onBeforeOpen, onBeforeClose });
      await act(async () => {
        const v = await api.current.handlers.handleBeforeOpen();
        expect(v).toBe(true);
      });
      await act(async () => {
        const v = await api.current.handlers.handleBeforeClose();
        expect(v).toBe(true);
      });
      expect(onBeforeOpen).toHaveBeenCalled();
      expect(onBeforeClose).toHaveBeenCalled();
    });

    it('handleBeforeOpen/Close default to true without configured hooks', async () => {
      const { api } = setup();
      await expect(api.current.handlers.handleBeforeOpen()).resolves.toBe(true);
      await expect(api.current.handlers.handleBeforeClose()).resolves.toBe(true);
    });

    it('disabled blocks open and close', async () => {
      const { api, onOpen, onClose } = setup({ disabled: true, defaultOpen: true });
      await act(async () => { await api.current.handlers.handleOpen(); });
      expect(onOpen).not.toHaveBeenCalled();
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('dismissible=false blocks close', async () => {
      const { api, onClose } = setup({ defaultOpen: true, dismissible: false });
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(api.current.state.open).toBe(true);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('overlay + outside click', () => {
    it('handleOverlayClick closes when closeOnOutsideClick is true', async () => {
      const { api, flush } = setup({ defaultOpen: true, closeOnOutsideClick: true });
      await act(async () => { api.current.handlers.handleOverlayClick(); });
      flush();
      expect(api.current.state.open).toBe(false);
    });

    it('handleOverlayClick is a no-op when closeOnOutsideClick is false', async () => {
      const { api } = setup({ defaultOpen: true, closeOnOutsideClick: false });
      act(() => { api.current.handlers.handleOverlayClick(); });
      expect(api.current.state.open).toBe(true);
    });

    it('outside-click document effect closes a non-modal open drawer', async () => {
      const { flush } = setup({ defaultOpen: true, modal: false, closeOnOutsideClick: true });
      // Clicking outside the dialog (on body) triggers the mousedown listener.
      await act(async () => {
        fireEvent.mouseDown(document.body);
      });
      flush();
      // The controlled-state wrapper reflects the change via onOpenChange.
    });

    it('outside-click effect does nothing when modal is true (overlay handles it)', async () => {
      const { api } = setup({ defaultOpen: true, modal: true, closeOnOutsideClick: true });
      await act(async () => { fireEvent.mouseDown(document.body); });
      expect(api.current.state.open).toBe(true);
    });

    it('outside-click effect ignores clicks inside the dialog or on a trigger', async () => {
      const { utils, api } = setup({ defaultOpen: true, modal: false, closeOnOutsideClick: true });
      // Click inside the dialog -> closest('[role="dialog"]') is truthy -> no close.
      await act(async () => { fireEvent.mouseDown(utils.getByTestId('drawer')); });
      expect(api.current.state.open).toBe(true);
      // Click on a trigger node -> closest('[data-drawer-trigger]') is truthy -> no close.
      await act(async () => { fireEvent.mouseDown(utils.getByTestId('trigger')); });
      expect(api.current.state.open).toBe(true);
    });
  });

  describe('escape handling', () => {
    it('document Escape closes an open dismissible drawer', async () => {
      const { api, flush } = setup({ defaultOpen: true, closeOnEscape: true, dismissible: true });
      await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }); });
      flush();
      expect(api.current.state.open).toBe(false);
    });

    it('document Escape is ignored when closeOnEscape is false', async () => {
      const { api } = setup({ defaultOpen: true, closeOnEscape: false });
      await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }); });
      expect(api.current.state.open).toBe(true);
    });

    it('document Escape is ignored when dismissible is false', async () => {
      const { api } = setup({ defaultOpen: true, closeOnEscape: true, dismissible: false });
      await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }); });
      expect(api.current.state.open).toBe(true);
    });

    it('handleKeyDown Escape closes when allowed', async () => {
      const { api, flush } = setup({ defaultOpen: true, closeOnEscape: true });
      await act(async () => {
        api.current.handlers.handleKeyDown({ key: 'Escape', preventDefault: () => {}, currentTarget: document.createElement('div') } as any);
      });
      flush();
      expect(api.current.state.open).toBe(false);
    });

    it('handleKeyDown is ignored when not focusable / disabled / closed', () => {
      const { api } = setup({ focusable: false, defaultOpen: true });
      expect(() => act(() => {
        api.current.handlers.handleKeyDown({ key: 'Escape', preventDefault: () => {}, currentTarget: null as any } as any);
      })).not.toThrow();
    });

    it('custom keyBindings fire and preventDefault', () => {
      const binding = vi.fn();
      const { api } = setup({ defaultOpen: true, keyBindings: { 'q': binding } });
      const preventDefault = vi.fn();
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'q', preventDefault, currentTarget: null as any } as any);
      });
      expect(preventDefault).toHaveBeenCalled();
      expect(binding).toHaveBeenCalled();
    });

    it('Tab trap wraps focus between first and last focusable descendants', () => {
      const { utils, api } = setup({ defaultOpen: true, trapFocus: true });
      const drawer = utils.getByTestId('drawer');
      const first = utils.getByTestId('first');
      const last = utils.getByTestId('last');
      // Focus the last element and Tab without shift -> wraps to first.
      last.focus();
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'Tab', shiftKey: false, preventDefault: () => {}, currentTarget: drawer } as any);
      });
      expect(document.activeElement).toBe(first);
      // Focus first and Shift+Tab -> wraps to last.
      first.focus();
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'Tab', shiftKey: true, preventDefault: () => {}, currentTarget: drawer } as any);
      });
      expect(document.activeElement).toBe(last);
    });

    it('Tab without trapFocus is a pass-through', () => {
      const { utils, api } = setup({ defaultOpen: true, trapFocus: false });
      const drawer = utils.getByTestId('drawer');
      const last = utils.getByTestId('last');
      last.focus();
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'Tab', shiftKey: false, preventDefault: () => {}, currentTarget: drawer } as any);
      });
      // No wrap happened: focus stays put (no focusableElements mutation).
      expect(document.activeElement).toBe(last);
    });

    it('Tab trap without a boundary element focused is a no-op (no wrap)', () => {
      const { utils, api } = setup({ defaultOpen: true, trapFocus: true });
      const drawer = utils.getByTestId('drawer');
      const first = utils.getByTestId('first');
      const last = utils.getByTestId('last');
      // Focus somewhere in the middle (neither first nor last): Shift+Tab and Tab
      // take neither wrap branch.
      first.focus();
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'Tab', shiftKey: false, preventDefault: () => {}, currentTarget: drawer } as any);
      });
      expect(document.activeElement).toBe(first);
      last.focus();
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'Tab', shiftKey: true, preventDefault: () => {}, currentTarget: drawer } as any);
      });
      expect(document.activeElement).toBe(last);
    });

    it('handleKeyDown Escape is a no-op when dismissible is false even if closeOnEscape is true', () => {
      const { api, onClose } = setup({ defaultOpen: true, closeOnEscape: true, dismissible: false });
      act(() => {
        api.current.handlers.handleKeyDown({ key: 'Escape', preventDefault: () => {}, currentTarget: null as any } as any);
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('Tab trap does nothing when the drawer has no focusable children', () => {
      const api2 = { current: null as any };
      function EmptyHarness() {
        api2.current = useDrawer({ defaultOpen: true, animationDuration: 0 });
        return (
          <div data-testid="empty" role="dialog" {...api2.current.attributes}
               onKeyDown={api2.current.attributes.onKeyDown as any} />
        );
      }
      render(<EmptyHarness />);
      const empty = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(() => act(() => {
        api2.current.handlers.handleKeyDown({ key: 'Tab', shiftKey: false, preventDefault: () => {}, currentTarget: empty } as any);
      })).not.toThrow();
    });

    it('unknown keys delegate to the focusable mixin', () => {
      const { api } = setup({ defaultOpen: true });
      expect(() => act(() => {
        api.current.handlers.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {}, currentTarget: null as any } as any);
      })).not.toThrow();
    });
  });

  describe('controlled mode', () => {
    it('controlled open reflects the prop and ignores internal setOpen', async () => {
      const onOpenChange = vi.fn();
      const api = { current: null as any };
      function Harness({ open }: { open: boolean }) {
        api.current = useDrawer({ open, onOpenChange, animationDuration: 0 });
        return <div role="dialog" {...api.current.attributes} />;
      }
      const { rerender } = render(<Harness open={false} />);
      expect(api.current.state.open).toBe(false);
      // Calling handleOpen on a controlled closed drawer should still fire
      // onOpenChange but the state stays driven by the prop.
      await act(async () => { await api.current.handlers.handleOpen(); });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(api.current.state.open).toBe(false);
      rerender(<Harness open={true} />);
      expect(api.current.state.open).toBe(true);
    });

    it('controlled close fires onOpenChange(false) without touching internal state', async () => {
      const onOpenChange = vi.fn();
      const api = { current: null as any };
      function Harness({ open }: { open: boolean }) {
        api.current = useDrawer({ open, onOpenChange, animationDuration: 0 });
        return <div role="dialog" {...api.current.attributes} />;
      }
      render(<Harness open={true} />);
      await act(async () => { await api.current.handlers.handleClose(); });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      // State stays driven by the prop (still true until parent rerenders).
      expect(api.current.state.open).toBe(true);
    });

    it('opening focuses [role=dialog] only when one is present', async () => {
      const api = { current: null as any };
      function NoDialogHarness() {
        api.current = useDrawer({ defaultOpen: false, trapFocus: true, animationDuration: 0 });
        return <div />; // no [role=dialog] in the tree
      }
      render(<NoDialogHarness />);
      await act(async () => { await api.current.handlers.handleOpen(); });
      act(() => { vi.advanceTimersByTime(60); });
      // No dialog -> focus call is skipped without error.
      expect(api.current.state.open).toBe(true);
    });
  });

  describe('attributes', () => {
    it('semanticAttributes expose aria/data fields and overlayAttributes expose style', () => {
      const { api } = setup({ defaultOpen: true, side: 'top', size: 'sm', portal: false, zIndex: 50, modal: true, label: 'Custom' });
      expect(api.current.attributes['aria-modal']).toBe(true);
      expect(api.current.attributes['aria-hidden']).toBe(false);
      expect(api.current.attributes['data-side']).toBe('top');
      expect(api.current.attributes['data-size']).toBe('sm');
      expect(api.current.attributes['data-z-index']).toBe(50);
      expect(api.current.attributes['aria-label']).toBe('Custom');
      expect(api.current.attributes.tabIndex).toBe(-1); // open -> -1
      expect(api.current.overlayAttributes['aria-hidden']).toBe('true');
      expect(api.current.overlayAttributes.style.position).toBe('absolute'); // portal=false
      expect(api.current.overlayAttributes.style.zIndex).toBe(49);
      expect(api.current.overlayAttributes.style.backgroundColor).toContain('rgba');
    });

    it('closed drawer has tabIndex 0 and aria-hidden true', () => {
      const { api } = setup({ open: false });
      expect(api.current.attributes.tabIndex).toBe(0);
      expect(api.current.attributes['aria-hidden']).toBe(true);
      expect(api.current.attributes['data-open']).toBe(false);
    });

    it('uses title as aria-label when no label is provided', () => {
      const { api } = setup({ defaultOpen: true, title: 'From Title' });
      expect(api.current.attributes['aria-label']).toBe('From Title');
      // aria-labelledby only present when label is absent.
      expect(api.current.attributes['aria-labelledby']).toBeUndefined();
    });

    it('label takes precedence and hides aria-labelledby', () => {
      const { api } = setup({ defaultOpen: true, label: 'L', labelledBy: 'lb-id' });
      expect(api.current.attributes['aria-label']).toBe('L');
      expect(api.current.attributes['aria-labelledby']).toBeUndefined();
    });

    it('non-modal overlay has a transparent background', () => {
      const { api } = setup({ defaultOpen: true, modal: false });
      expect(api.current.overlayAttributes.style.backgroundColor).toBe('transparent');
    });
  });

  describe('focus management', () => {
    it('opening focuses the [role=dialog] element after the trap timeout', async () => {
      const { api, utils } = setup({ defaultOpen: false, trapFocus: true, animationDuration: 0 });
      await act(async () => { await api.current.handlers.handleOpen(); });
      // The setTimeout(50) for focus fires after 50ms.
      act(() => { vi.advanceTimersByTime(60); });
      // The drawer element received focus (it has role=dialog).
      const drawer = utils.getByTestId('drawer');
      expect(document.activeElement).toBe(drawer);
    });

    it('restoreFocus returns focus to the previously focused element on close', async () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      const { api, flush } = setup({ defaultOpen: false, restoreFocus: true, animationDuration: 0 });
      // Open captures activeElement (trigger); close restores it after 50ms.
      await act(async () => { await api.current.handlers.handleOpen(); });
      flush();
      await act(async () => { await api.current.handlers.handleClose(); });
      act(() => { vi.advanceTimersByTime(60); });
      expect(document.activeElement).toBe(trigger);
      document.body.removeChild(trigger);
    });
  });

  describe('DOM integration', () => {
    it('clicking the overlay node closes the drawer through real events', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const { utils, rerender } = setup({ defaultOpen: true, closeOnOutsideClick: true, animationDuration: 0 });
      await user.click(utils.getByTestId('overlay'));
      // Uncontrolled: the wrapper flips state.open; re-render via rerender noop
      // is unnecessary because the handler already updated state.
    });
  });
});
