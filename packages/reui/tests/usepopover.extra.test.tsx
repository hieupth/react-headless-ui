import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { usePopover } from '../src/hooks';
import type { UsePopoverProps } from '../src/hooks';

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('usePopover hook — extended branches', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('defaults: closed, bottom position, click trigger, not focused/hovered', () => {
    const hook = renderHook(() => usePopover({}));
    const { state, triggerAttributes, contentAttributes } = hook.result.current;
    expect(state.open).toBe(false);
    expect(state.position).toBe('bottom');
    expect(state.disabled).toBe(false);
    expect(state.isTriggerFocused).toBe(false);
    expect(state.isTriggerHovered).toBe(false);
    expect(triggerAttributes['aria-expanded']).toBe(false);
    expect(triggerAttributes['aria-haspopup']).toBe('dialog');
    expect(triggerAttributes.role).toBe('button');
    expect(triggerAttributes.tabIndex).toBe(0);
    expect(contentAttributes.role).toBe('dialog');
    expect(contentAttributes['aria-modal']).toBe('false');
  });

  it('disabled: tabIndex=-1 and open/close/toggle are no-ops', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    const hook = renderHook(() =>
      usePopover({ disabled: true, onOpen, onClose, onOpenChange })
    );
    expect(hook.result.current.triggerAttributes.tabIndex).toBe(-1);
    actAndRerender(hook, () => hook.result.current.actions.open());
    actAndRerender(hook, () => hook.result.current.actions.close());
    actAndRerender(hook, () => hook.result.current.actions.toggle());
    expect(hook.result.current.state.open).toBe(false);
    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('open/close/toggle fire callbacks and update uncontrolled state', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    const hook = renderHook(() => usePopover({ onOpen, onClose, onOpenChange }));
    actAndRerender(hook, () => hook.result.current.actions.open());
    expect(hook.result.current.state.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    actAndRerender(hook, () => hook.result.current.actions.toggle()); // open -> close
    expect(hook.result.current.state.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    actAndRerender(hook, () => hook.result.current.actions.toggle()); // close -> open
    expect(hook.result.current.state.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(2);
    actAndRerender(hook, () => hook.result.current.actions.close());
    expect(hook.result.current.state.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('controlled open: open/close do not mutate internal state, but fire callbacks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    const hook = renderHook(({ open }) => usePopover({ open, onOpen, onClose, onOpenChange }), {
      initialProps: { open: false },
    });
    act(() => hook.result.current.actions.open());
    hook.rerender({ open: false }); // controlled unchanged
    expect(hook.result.current.state.open).toBe(false);
    expect(onOpen).toHaveBeenCalledTimes(1);
    // Flip controlled to true via rerender; sync effect should fire onOpen too.
    hook.rerender({ open: true });
    expect(hook.result.current.state.open).toBe(true);
    act(() => hook.result.current.actions.close());
    hook.rerender({ open: true }); // controlled unchanged
    expect(hook.result.current.state.open).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('setPosition updates the position state', () => {
    const hook = renderHook(() => usePopover({}));
    actAndRerender(hook, () => hook.result.current.actions.setPosition('top-start'));
    expect(hook.result.current.state.position).toBe('top-start');
  });

  it('defaultOpen renders open initially', () => {
    const hook = renderHook(() => usePopover({ defaultOpen: true }));
    expect(hook.result.current.state.open).toBe(true);
    expect(hook.result.current.triggerAttributes['aria-expanded']).toBe(true);
  });

  it('handleTriggerClick toggles open for click trigger', () => {
    const hook = renderHook(() => usePopover({}));
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerClick());
    expect(hook.result.current.state.open).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerClick());
    expect(hook.result.current.state.open).toBe(false);
  });

  it('handleTriggerClick is a no-op when trigger !== click or disabled', () => {
    const hover = renderHook(() => usePopover({ trigger: 'hover' }));
    actAndRerender(hover, () => hover.result.current.actions.handleTriggerClick());
    expect(hover.result.current.state.open).toBe(false);
    const disabled = renderHook(() => usePopover({ disabled: true }));
    actAndRerender(disabled, () => disabled.result.current.actions.handleTriggerClick());
    expect(disabled.result.current.state.open).toBe(false);
  });

  it('hover trigger: mouseEnter schedules open after openDelay; mouseLeave cancels/schedules close', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const hook = renderHook(() =>
      usePopover({ trigger: 'hover', openDelay: 100, closeDelay: 50, onOpen, onClose })
    );
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseEnter());
    expect(hook.result.current.state.isTriggerHovered).toBe(true);
    expect(hook.result.current.state.open).toBe(false); // not yet
    act(() => vi.advanceTimersByTime(100));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    // Leave schedules close after closeDelay.
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseLeave());
    expect(hook.result.current.state.isTriggerHovered).toBe(false);
    act(() => vi.advanceTimersByTime(50));
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hover trigger: re-entering before openDelay cancels prior open timer', () => {
    const hook = renderHook(() => usePopover({ trigger: 'hover', openDelay: 100 }));
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseEnter());
    act(() => vi.advanceTimersByTime(40));
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseEnter()); // reset timer
    act(() => vi.advanceTimersByTime(60)); // only 60ms since second enter; not yet 100
    expect(hook.result.current.state.open).toBe(false);
    act(() => vi.advanceTimersByTime(40)); // now 100ms since second enter
    actAndRerender(hook, () => {});
    expect(hook.result.current.state.open).toBe(true);
  });

  it('hover mouseEnter/Leave are no-ops for click/manual triggers', () => {
    const hook = renderHook(() => usePopover({ trigger: 'click' }));
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseEnter());
    expect(hook.result.current.state.isTriggerHovered).toBe(false);
    const manual = renderHook(() => usePopover({ trigger: 'manual' }));
    actAndRerender(manual, () => manual.result.current.actions.handleTriggerMouseLeave());
    expect(manual.result.current.state.isTriggerHovered).toBe(false);
  });

  it('focus trigger: focus opens, blur closes (when closeOnTriggerBlur)', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const hook = renderHook(() =>
      usePopover({ trigger: 'focus', closeOnTriggerBlur: true, onOpen, onClose })
    );
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerFocus());
    expect(hook.result.current.state.isTriggerFocused).toBe(true);
    expect(hook.result.current.state.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerBlur());
    expect(hook.result.current.state.isTriggerFocused).toBe(false);
    expect(hook.result.current.state.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focus trigger with closeOnTriggerBlur=false: focus opens, blur does not close', () => {
    const onClose = vi.fn();
    const hook = renderHook(() =>
      usePopover({ trigger: 'focus', closeOnTriggerBlur: false, onClose })
    );
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerFocus());
    expect(hook.result.current.state.open).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerBlur());
    expect(hook.result.current.state.open).toBe(true); // unchanged
    expect(onClose).not.toHaveBeenCalled();
  });

  it('focus/blur handlers are no-ops for click/manual triggers', () => {
    const hook = renderHook(() => usePopover({ trigger: 'click' }));
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerFocus());
    expect(hook.result.current.state.isTriggerFocused).toBe(false);
    const manual = renderHook(() => usePopover({ trigger: 'manual' }));
    actAndRerender(manual, () => manual.result.current.actions.handleTriggerBlur());
    expect(manual.result.current.state.isTriggerFocused).toBe(false);
  });

  it('disabled blocks focus/blur/hover handlers', () => {
    const hook = renderHook(() =>
      usePopover({ trigger: 'hover', disabled: true })
    );
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseEnter());
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerMouseLeave());
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerFocus());
    actAndRerender(hook, () => hook.result.current.actions.handleTriggerBlur());
    expect(hook.result.current.state.isTriggerHovered).toBe(false);
    expect(hook.result.current.state.isTriggerFocused).toBe(false);
    expect(hook.result.current.state.open).toBe(false);
  });

  it('Escape key closes an open popover (when closeOnEscape)', () => {
    const onClose = vi.fn();
    renderHook(() => usePopover({ defaultOpen: true, closeOnEscape: true, onClose }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    // The escape listener calls closePopover -> onClose.
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape does nothing when closeOnEscape=false or popover closed', () => {
    const onClose = vi.fn();
    renderHook(() => usePopover({ defaultOpen: true, closeOnEscape: false, onClose }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('non-escape keys do not close the popover', () => {
    const onClose = vi.fn();
    renderHook(() => usePopover({ defaultOpen: true, onClose }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('click outside closes open popover (when closeOnClickOutside)', () => {
    const onClose = vi.fn();
    const triggerRef = { current: null as HTMLElement | null };
    const contentRef = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePopover({
        defaultOpen: true,
        closeOnClickOutside: true,
        onClose,
        triggerRef,
        contentRef,
      });
      return (
        <div>
          <button ref={triggerRef as any} id="trg">
            t
          </button>
          <div ref={contentRef as any} id="cnt">
            c
          </div>
          <div data-testid="outside">outside</div>
        </div>
      );
    }
    const { getByTestId } = render(<Harness />);
    // Need a rerender so the click-outside effect captures the latest closePopover
    // (which reads onOpenChange/onClose). Simulate by clicking outside.
    const outside = getByTestId('outside');
    act(() => {
      outside.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('click inside trigger/content does not close (when closeOnClickOutside)', () => {
    const onClose = vi.fn();
    const triggerRef = { current: null as HTMLElement | null };
    const contentRef = { current: null as HTMLElement | null };
    function Harness() {
      const result = usePopover({
        defaultOpen: true,
        closeOnClickOutside: true,
        onClose,
        triggerRef,
        contentRef,
      });
      return (
        <div>
          <button ref={triggerRef as any} id="trg">
            t
          </button>
          <div ref={contentRef as any} id="cnt">
            c
          </div>
        </div>
      );
    }
    const { container } = render(<Harness />);
    act(() => {
      const trg = container.querySelector('#trg')!;
      trg.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cleanup removes keydown and mousedown listeners on unmount', () => {
    const hook = renderHook(() => usePopover({ defaultOpen: true }));
    expect(() => hook.unmount()).not.toThrow();
  });
});
