import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAlertDialog } from '../src/hooks';

/**
 * Render a real dialog using the hook so the ref DOM tree is exercised by
 * the focus/escape/overlay/keydown effects. The Probe attaches contentProps
 * to a container holding confirm + cancel buttons so focus-management code
 * (querySelector for [data-alert-dialog-confirm], first focusable, etc.) has
 * real elements to operate on.
 */
function DialogFromHook({
  open,
  onOpenChange,
  title = 'Title',
  description,
  variant,
  showCancel = true,
  cancelText,
  confirmText,
  onConfirm,
  onCancel,
  modal,
  closeOnEscape,
  initialFocus,
}: any) {
  const hook = useAlertDialog({
    open,
    onOpenChange,
    title,
    description,
    variant,
    showCancel,
    cancelText,
    confirmText,
    onConfirm,
    onCancel,
    modal,
    closeOnEscape,
    initialFocus,
  } as any);

  return (
    <div {...hook.overlayProps}>
      <div {...hook.contentProps}>
        <h2 {...hook.titleProps}>{title}</h2>
        {description && <p {...hook.descriptionProps}>{description}</p>}
        {showCancel && (
          <button {...hook.cancelButtonProps}>{cancelText ?? 'Cancel'}</button>
        )}
        <button {...hook.confirmButtonProps}>{confirmText ?? 'Confirm'}</button>
        <div data-testid="custom-target" tabIndex={0}>custom</div>
      </div>
    </div>
  );
}

describe('useAlertDialog (extra coverage)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('warns to console when onConfirm rejects but keeps the dialog open', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockRejectedValue(new Error('boom'));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText('Confirm'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    // finally resets confirming; dialog stays open (no onOpenChange(false)).
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('cancel() is a no-op while confirming', async () => {
    const onOpenChange = vi.fn();
    let resolveConfirm: () => void = () => {};
    const onConfirm = () => new Promise<void>((r) => { resolveConfirm = r; });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText('Confirm'));
    // Now confirming. Clicking cancel should not close.
    await user.click(screen.getByText('Cancel'));
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => { resolveConfirm(); });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('close() is a no-op while confirming', async () => {
    const onOpenChange = vi.fn();
    let resolveConfirm: () => void = () => {};
    const onConfirm = () => new Promise<void>((r) => { resolveConfirm = r; });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText('Confirm'));
    // Escape via content keydown (closeOnEscape default true) should be ignored while confirming.
    fireEvent.keyDown(screen.getByText('T').parentElement!, { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => { resolveConfirm(); });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('Escape via contentProps closes the dialog (closeOnEscape default)', async () => {
    const onOpenChange = vi.fn();
    render(<DialogFromHook open title="T" onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByText('T').parentElement!, { key: 'Escape' });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('Escape via overlayProps closes the dialog', async () => {
    const onOpenChange = vi.fn();
    const { container } = render(<DialogFromHook open title="T" onOpenChange={onOpenChange} />);
    fireEvent.keyDown(container.firstElementChild!, { key: 'Escape' });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('closeOnEscape=false prevents Escape from closing', () => {
    const onOpenChange = vi.fn();
    render(<DialogFromHook open title="T" onOpenChange={onOpenChange} closeOnEscape={false} />);
    fireEvent.keyDown(screen.getByText('T').parentElement!, { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('cancel button Enter key triggers the action and closes', async () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(<DialogFromHook open title="T" onOpenChange={onOpenChange} onCancel={onCancel} />);
    fireEvent.keyDown(screen.getByText('Cancel'), { key: 'Enter' });
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('confirm button Space key triggers the action and closes', async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DialogFromHook
        open
        title="T2"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        confirmText="Go"
      />
    );
    fireEvent.keyDown(screen.getByText('Go'), { key: ' ' });
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('overlay click is prevented (no close) but does not throw when modal=false', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} modal={false} />
    );
    const overlay = container.firstElementChild!;
    // Simulate clicking the overlay directly.
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(clickEvent, 'target', { value: overlay });
    Object.defineProperty(clickEvent, 'currentTarget', { value: overlay });
    fireEvent(overlay, clickEvent);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('initialFocus as a selector focuses the matching element', () => {
    render(
      <DialogFromHook
        open
        title="T"
        onOpenChange={() => {}}
        initialFocus="[data-testid='custom-target']"
      />
    );
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(document.activeElement).toBe(screen.getByTestId('custom-target'));
  });

  it('initialFocus as an HTMLElement focuses that element', () => {
    let external: HTMLElement | null = null;
    const Wrapper = () => (
      <>
        <button data-testid="external" ref={(n) => { external = n; }}>External</button>
        <DialogFromHook
          open
          title="T"
          onOpenChange={() => {}}
          initialFocus={external ?? undefined}
        />
      </>
    );
    const { rerender } = render(<Wrapper />);
    // Re-render once the ref is populated so initialFocus is a real element.
    rerender(<Wrapper />);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(external).not.toBeNull();
    expect(document.activeElement).toBe(external);
  });

  it('default initial focus falls back to the confirm button', () => {
    render(<DialogFromHook open title="T" onOpenChange={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    const confirm = screen.getByText('Confirm');
    expect(document.activeElement).toBe(confirm);
  });

  it('focus restoration returns focus to the previously active element on close', () => {
    const opener = document.createElement('button');
    opener.textContent = 'opener';
    document.body.appendChild(opener);
    opener.focus();
    expect(document.activeElement).toBe(opener);

    const { rerender } = render(
      <DialogFromHook open title="T" onOpenChange={() => {}} />
    );
    act(() => {
      vi.advanceTimersByTime(60);
    });
    // Closing the dialog should restore focus to the opener.
    rerender(<DialogFromHook open={false} title="T" onOpenChange={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(document.activeElement).toBe(opener);
    document.body.removeChild(opener);
  });

  it('renders warning variant on content and confirm button', () => {
    render(<DialogFromHook open title="T" onOpenChange={() => {}} variant="warning" />);
    const content = screen.getByText('T').parentElement!;
    expect(content.getAttribute('data-variant')).toBe('warning');
    expect(screen.getByText('Confirm').getAttribute('data-variant')).toBe('warning');
  });

  it('titleProps and descriptionProps expose stable ids', () => {
    let captured: any;
    const Probe = () => {
      captured = useAlertDialog({ open: true, onOpenChange: () => {}, title: 'T', description: 'd' });
      return null;
    };
    render(<Probe />);
    expect(captured.titleProps.id).toBe('alert-dialog-title');
    expect(captured.descriptionProps.id).toBe('alert-dialog-description');
    expect(captured.contentProps['aria-labelledby']).toBe('alert-dialog-title');
    expect(captured.contentProps['aria-describedby']).toBe('alert-dialog-description');
  });

  it('setConfirming action toggles the confirming state', () => {
    let captured: any;
    const Probe = () => {
      captured = useAlertDialog({ open: true, onOpenChange: () => {}, title: 'T' });
      return null;
    };
    render(<Probe />);
    act(() => captured.actions.setConfirming(true));
    expect(captured.state.confirming).toBe(true);
    expect(captured.confirmButtonProps.disabled).toBe(true);
    expect(captured.confirmButtonProps['data-loading']).toBe(true);
  });

  it('description omitted drops aria-describedby', () => {
    let captured: any;
    const Probe = () => {
      captured = useAlertDialog({ open: true, onOpenChange: () => {}, title: 'T' });
      return null;
    };
    render(<Probe />);
    expect(captured.contentProps['aria-describedby']).toBeUndefined();
    expect(captured.semanticAttributes['aria-label']).toContain('default alert dialog: T');
  });

  it('default initial focus falls back to the first focusable element when no confirm button exists', () => {
    // Render a dialog body that has NO [data-alert-dialog-confirm] element so the
    // focus effect exercises its first-focusable-element fallback.
    const NoConfirmDialog = () => {
      const hook = useAlertDialog({ open: true, onOpenChange: () => {}, title: 'T' });
      return (
        <div {...hook.overlayProps}>
          <div {...hook.contentProps}>
            <h2 {...hook.titleProps}>T</h2>
            <button data-testid="only-focusable">Only</button>
          </div>
        </div>
      );
    };
    render(<NoConfirmDialog />);
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(document.activeElement).toBe(screen.getByTestId('only-focusable'));
  });

  it('overlay click (target === currentTarget, modal) calls preventDefault', () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} />
    );
    const overlay = container.firstElementChild!;
    // Forge a click whose target and currentTarget are both the overlay; the
    // default modal=true branch should call preventDefault and never close.
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefault = vi.spyOn(clickEvent, 'preventDefault');
    Object.defineProperty(clickEvent, 'target', { value: overlay });
    Object.defineProperty(clickEvent, 'currentTarget', { value: overlay });
    fireEvent(overlay, clickEvent);
    expect(preventDefault).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('a non-matching initialFocus selector falls back to the default focus target', () => {
    render(
      <DialogFromHook
        open
        title="T"
        onOpenChange={() => {}}
        initialFocus="[data-testid='does-not-exist']"
      />
    );
    act(() => {
      vi.advanceTimersByTime(60);
    });
    // The selector matched nothing, so focus fell back to the confirm button.
    expect(document.activeElement).toBe(screen.getByText('Confirm'));
  });

  it('confirm() and cancel() are no-ops when already confirming (direct action call)', async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    let captured: any;
    const Probe = () => {
      captured = useAlertDialog({
        open: true,
        onOpenChange,
        onConfirm,
        onCancel,
        title: 'T',
      });
      return null;
    };
    render(<Probe />);
    // Enter confirming state, then call confirm/cancel directly; both must bail.
    act(() => captured.actions.setConfirming(true));
    await act(async () => {
      await captured.actions.confirm();
      captured.actions.cancel();
    });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('cancel button Space key and confirm button Enter key both trigger their action', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} onConfirm={onConfirm} />
    );
    fireEvent.keyDown(screen.getByText('Cancel'), { key: ' ' });
    fireEvent.keyDown(screen.getByText('Confirm'), { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    // close() schedules onOpenChange(false) via a 150ms timer; flush it.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('non-activation keys on the cancel/confirm buttons are a no-op', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DialogFromHook open title="T" onOpenChange={onOpenChange} onConfirm={onConfirm} />
    );
    // An unrelated key (Tab) on either button must not trigger confirm/cancel.
    fireEvent.keyDown(screen.getByText('Cancel'), { key: 'Tab' });
    fireEvent.keyDown(screen.getByText('Confirm'), { key: 'Tab' });
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
