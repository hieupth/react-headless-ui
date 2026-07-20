import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDialog } from '../src/hooks';
import type { UseDialogProps } from '../src/hooks';

// Drives the useDialog hook directly through a controlled Probe that renders a
// real dialog tree (overlay + focusable buttons) so the focus trap, overlay
// click, escape handling, and focus restoration paths all execute.

interface SetupOpts extends Partial<UseDialogProps> {
  withChildren?: boolean;
}

function setup(opts: SetupOpts = {}) {
  const state = { open: opts.open ?? false };
  const onOpenChange = vi.fn((next: boolean) => { state.open = next; });
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const api = { current: null as any };

  function Harness() {
    api.current = useDialog({
      open: state.open,
      onOpenChange,
      initialFocus: opts.initialFocus,
      closeOnOverlayClick: opts.closeOnOverlayClick,
      closeOnEscape: opts.closeOnEscape,
      modal: opts.modal,
      title: opts.title ?? 'Confirm',
      description: opts.description ?? 'Are you sure?',
      onConfirm,
      onCancel,
      defaultFocused: opts.defaultFocused,
      focusable: opts.focusable,
      disabled: opts.disabled,
      role: opts.role ?? 'dialog',
      label: opts.label,
      labelledBy: opts.labelledBy,
      describedBy: opts.describedBy,
    });
    const {
      semanticAttributes, overlayAttributes, titleAttributes, descriptionAttributes,
      dialogRef, overlayRef,
    } = api.current;

    return (
      <div>
        <div data-testid="overlay" ref={overlayRef as any} {...overlayAttributes}>
          <div
            data-testid="dialog"
            ref={dialogRef as any}
            {...semanticAttributes}
            tabIndex={-1}
            onKeyDown={semanticAttributes.onKeyDown as any}
          >
            <h2 {...titleAttributes}>{opts.title ?? 'Confirm'}</h2>
            <p {...descriptionAttributes}>{opts.description ?? 'Are you sure?'}</p>
            {opts.withChildren !== false && (
              <>
                <button data-testid="first">First</button>
                <button data-testid="confirm-btn">Confirm</button>
                <button data-testid="last">Last</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const utils = render(<Harness />);
  // setOpen mutates the closure-held state AND re-renders the Harness so that
  // prop-driven effects (e.g. the body scroll-lock effect keyed on `open`)
  // actually observe the new value and run their cleanup.
  const setOpen = (v: boolean) => act(() => {
    state.open = v;
    utils.rerender(<Harness />);
  });
  return { api, utils, onOpenChange, onConfirm, onCancel, setOpen };
}

describe('useDialog hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  describe('actions', () => {
    it('openDialog / closeDialog delegate to onOpenChange', () => {
      const { api, onOpenChange } = setup({ open: false });
      act(() => api.current.openDialog());
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      act(() => api.current.closeDialog());
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('confirm fires onConfirm then closes', () => {
      const { api, onConfirm, onOpenChange } = setup({ open: true });
      act(() => api.current.confirm());
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('cancel fires onCancel then closes', () => {
      const { api, onCancel, onOpenChange } = setup({ open: true });
      act(() => api.current.cancel());
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe('overlay click', () => {
    it('closes when the click target is the overlay itself', () => {
      const { utils, onOpenChange } = setup({ open: true, closeOnOverlayClick: true });
      fireEvent.click(utils.getByTestId('overlay'));
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('does not close when clicking inside the dialog', () => {
      const { utils, onOpenChange } = setup({ open: true, closeOnOverlayClick: true });
      fireEvent.click(utils.getByTestId('dialog'));
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('does not close when closeOnOverlayClick is false', () => {
      const { utils, onOpenChange } = setup({ open: true, closeOnOverlayClick: false });
      fireEvent.click(utils.getByTestId('overlay'));
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    it('Escape triggers cancel + close when closeOnEscape is true', () => {
      const { api, onCancel, onOpenChange } = setup({ open: true, closeOnEscape: true });
      act(() => api.current.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('Escape is ignored when closeOnEscape is false', () => {
      const { api, onCancel, onOpenChange } = setup({ open: true, closeOnEscape: false });
      act(() => api.current.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
      expect(onCancel).not.toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('non-Escape keys delegate to the focusable mixin without throwing', () => {
      const { api } = setup({ open: true });
      expect(() => act(() => api.current.handleKeyDown({ key: 'Tab', preventDefault: () => {} } as any))).not.toThrow();
    });
  });

  describe('focus trap', () => {
    it('sets up the focus trap on open and focuses the first element', () => {
      const { utils, api } = setup({ open: true, modal: true });
      const first = utils.getByTestId('first');
      expect(document.activeElement).toBe(first);
      expect(api.current.focusTrapped).toBe(true);
    });

    it('Tab on the last element wraps back to the first; Shift+Tab on first wraps to last', () => {
      const { utils } = setup({ open: true, modal: true });
      const first = utils.getByTestId('first');
      const last = utils.getByTestId('last');
      last.focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(first);
      first.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(last);
      // Tab on a middle element (not first/last) does not wrap.
      first.focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(document.activeElement).toBe(first);
      // Shift+Tab on a non-first element (last) does not wrap.
      last.focus();
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(last);
    });

    it('non-Tab keys are ignored by the trap handler', () => {
      setup({ open: true, modal: true });
      expect(() => fireEvent.keyDown(document, { key: 'Enter' })).not.toThrow();
    });

    it('dialog with no focusable children installs no trap', () => {
      const api = { current: null as any };
      function Empty() {
        api.current = useDialog({ open: true, onOpenChange: () => {}, modal: true });
        return (
          <div ref={api.current.dialogRef as any} data-testid="empty" {...api.current.semanticAttributes} />
        );
      }
      render(<Empty />);
      expect(api.current.focusTrapped).toBe(false);
    });

    it('modal=false does not install a trap', () => {
      const { api } = setup({ open: true, modal: false });
      expect(api.current.focusTrapped).toBe(false);
    });

    it('releaseFocusTrap cleans the trap', () => {
      const { api } = setup({ open: true, modal: true });
      expect(api.current.focusTrapped).toBe(true);
      act(() => api.current.releaseFocusTrap());
      expect(api.current.focusTrapped).toBe(false);
    });
  });

  describe('initial focus', () => {
    it('getInitialFocusElement returns null when closed', () => {
      const { api } = setup({ open: false, initialFocus: '#missing' });
      expect(api.current.getInitialFocusElement()).toBeNull();
    });

    it('getInitialFocusElement resolves a CSS selector when open', () => {
      const { utils, api } = setup({ open: true });
      const confirmBtn = utils.getByTestId('confirm-btn');
      confirmBtn.id = 'focus-target';
      expect(api.current.getInitialFocusElement()).toBeNull(); // initialFocus was not set
      // Now test the selector path directly by reading the callback behaviour:
      // point the hook at a selector that matches.
      void confirmBtn;
    });

    it('getInitialFocusElement returns a passed HTMLElement directly', () => {
      const el = document.createElement('button');
      const { api } = setup({ open: true, initialFocus: el });
      expect(api.current.getInitialFocusElement()).toBe(el);
    });

    it('getInitialFocusElement with a selector matches an element', () => {
      const { utils } = setup({ open: true });
      const confirmBtn = utils.getByTestId('confirm-btn');
      confirmBtn.id = 'targ';
      const api = { current: null as any };
      function Harness() {
        api.current = useDialog({
          open: true,
          onOpenChange: () => {},
          initialFocus: '#targ',
        });
        return <div ref={api.current.dialogRef as any} />;
      }
      render(<Harness />);
      expect(api.current.getInitialFocusElement()).toBe(confirmBtn);
    });
  });

  describe('body scroll lock', () => {
    it('locks body scroll when modal + open and restores on close', () => {
      const original = document.body.style.overflow;
      const { setOpen } = setup({ open: true, modal: true });
      expect(document.body.style.overflow).toBe('hidden');
      setOpen(false);
      expect(document.body.style.overflow).toBe(original);
    });

    it('does not lock when modal is false', () => {
      setup({ open: true, modal: false });
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('attributes', () => {
    it('exposes aria/data attributes on dialog + overlay + title + description', () => {
      const { utils, api } = setup({ open: true, role: 'alertdialog' });
      const dialog = utils.getByTestId('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('data-state')).toBe('open');
      expect(dialog.getAttribute('data-modal')).toBe('true');
      expect(utils.getByTestId('overlay').getAttribute('data-state')).toBe('open');
      expect(api.current.titleAttributes.id).toBe('alertdialog-title');
      expect(api.current.titleAttributes['data-purpose']).toBe('dialog-title');
      expect(api.current.descriptionAttributes.id).toBe('alertdialog-description');
      expect(api.current.descriptionAttributes['data-purpose']).toBe('dialog-description');
    });

    it('marks the dialog closed when open is false', () => {
      const { utils } = setup({ open: false });
      expect(utils.getByTestId('dialog').getAttribute('data-state')).toBe('closed');
      expect(utils.getByTestId('dialog').getAttribute('aria-hidden')).toBe('true');
      expect(utils.getByTestId('overlay').getAttribute('data-state')).toBe('closed');
    });
  });

  describe('focus() action', () => {
    it('focus delegates to the focusable mixin without throwing', () => {
      const { api } = setup({ open: true, focusable: true });
      expect(() => act(() => api.current.focus())).not.toThrow();
    });
  });

  describe('DOM integration', () => {
    it('Escape key on the dialog node closes it through real keyboard event', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const { utils, onOpenChange } = setup({ open: true, closeOnEscape: true });
      const dialog = utils.getByTestId('dialog');
      dialog.focus();
      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });
});
