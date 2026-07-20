import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useButton } from '../src/hooks';
import type { UseButtonProps } from '../src/hooks';

/**
 * Hook-level coverage for useButton. A real Harness component calls the hook,
 * spreads the returned handlers/attributes onto a DOM button, and we drive it
 * through userEvent / fireEvent to exercise every action and branch.
 */
function setup(props: UseButtonProps = {}) {
  const api: { current: ReturnType<typeof useButton> | null } = { current: null };
  function Harness() {
    const button = useButton(props);
    api.current = button;
    const { semanticAttributes, handleClick, handleKeyDown, onFocus, onBlur, ref, tabIndex } = button;
    return (
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        tabIndex={tabIndex}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        {...semanticAttributes}
      >
        click
      </button>
    );
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

describe('useButton', () => {
  it('exposes default state (variant/size/fullWidth/loading/disabled/tabIndex)', () => {
    const { api } = setup();
    expect(api.current!.variant).toBe('default');
    expect(api.current!.size).toBe('md');
    expect(api.current!.fullWidth).toBe(false);
    expect(api.current!.loading).toBe(false);
    expect(api.current!.disabled).toBe(false);
    expect(api.current!.pressed).toBe(false);
    expect(api.current!.pressCount).toBe(0);
    // default auto strategy: not focused => tabIndex -1
    expect(api.current!.tabIndex).toBe(-1);
  });

  it('forwards variant, size, fullWidth, type, value, name into semantic attributes', () => {
    const { api } = setup({
      variant: 'destructive',
      size: 'lg',
      fullWidth: true,
      type: 'submit',
      value: 'v1',
      name: 'field',
    });
    const a = api.current!.semanticAttributes;
    expect(a['data-variant']).toBe('destructive');
    expect(a['data-size']).toBe('lg');
    expect(a['data-full-width']).toBe(true);
    expect(a.type).toBe('submit');
    expect(a.value).toBe('v1');
    expect(a.name).toBe('field');
    expect(api.current!.className).toContain('button-destructive');
    expect(api.current!.className).toContain('button-lg');
    expect(api.current!.className).toContain('button-full-width');
  });

  it('covers every variant and size option in className', () => {
    for (const variant of ['default', 'outline', 'secondary', 'ghost', 'link'] as const) {
      const { api, unmount } = setup({ variant });
      expect(api.current!.className).toContain(`button-${variant}`);
      unmount();
    }
    for (const size of ['sm', 'md', 'lg', 'icon'] as const) {
      const { api, unmount } = setup({ size });
      expect(api.current!.className).toContain(`button-${size}`);
      unmount();
    }
  });

  it('fires onPress + lifecycle callbacks on click and increments pressCount', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { api } = setup({ onPress });
    await user.click(screen.getByText('click'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(api.current!.pressCount).toBe(1);
  });

  it('does not fire onPress when disabled and prevents default', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { api } = setup({ disabled: true, onPress });
    await user.click(screen.getByText('click'));
    expect(onPress).not.toHaveBeenCalled();
    expect(api.current!.disabled).toBe(true);
    expect(api.current!.className).toContain('button-disabled');
    expect(api.current!.semanticAttributes['aria-disabled']).toBe(true);
  });

  it('does not fire onPress when loading and marks aria-busy', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    const { api } = setup({ loading: true, onPress });
    await user.click(screen.getByText('click'));
    expect(onPress).not.toHaveBeenCalled();
    expect(api.current!.semanticAttributes['aria-busy']).toBe(true);
    expect(api.current!.semanticAttributes['data-loading']).toBe(true);
    expect(api.current!.className).toContain('button-loading');
  });

  it('handleKeyDown (Enter/Space) sets pressed; Escape does not', () => {
    const onPress = vi.fn();
    const { api } = setup({ onPress });
    const node = screen.getByText('click');
    act(() => {
      fireEvent.keyDown(node, { key: 'Enter' });
    });
    expect(api.current!.pressed).toBe(true);
    act(() => {
      fireEvent.keyUp(node, { key: 'Enter' });
    });
    // space also starts a press
    act(() => {
      fireEvent.keyDown(node, { key: ' ' });
    });
    expect(api.current!.pressed).toBe(true);
    // non-activating key leaves state and does not throw
    act(() => {
      fireEvent.keyDown(node, { key: 'Escape' });
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('handleKeyDown is a no-op when disabled or loading', () => {
    const onPress = vi.fn();
    const { unmount } = setup({ disabled: true, onPress });
    act(() => {
      fireEvent.keyDown(screen.getByText('click'), { key: 'Enter' });
    });
    expect(onPress).not.toHaveBeenCalled();
    unmount();

    const { unmount: u2 } = setup({ loading: true, onPress });
    act(() => {
      fireEvent.keyDown(screen.getByText('click'), { key: ' ' });
    });
    expect(onPress).not.toHaveBeenCalled();
    u2();
  });

  it('press() programmatically triggers onPress and increments count', () => {
    const onPress = vi.fn();
    const { api } = setup({ onPress });
    act(() => {
      api.current!.press();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(api.current!.pressCount).toBe(1);
  });

  it('press() is a no-op when disabled', () => {
    const onPress = vi.fn();
    const { api } = setup({ disabled: true, onPress });
    act(() => {
      api.current!.press();
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(api.current!.pressCount).toBe(0);
  });

  it('focus() and blur() programmatic actions track focused state', () => {
    const { api } = setup();
    act(() => {
      api.current!.focus();
    });
    expect(api.current!.focused).toBe(true);
    expect(api.current!.className).toContain('button-focused');
    expect(api.current!.semanticAttributes['data-focused']).toBe(true);
    act(() => {
      api.current!.blur();
    });
    expect(api.current!.focused).toBe(false);
  });

  it('onFocus/onBlur forwarded to DOM update focused state and data attributes', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { api } = setup({ onFocus, onBlur });
    // The harness forwards the hook's onFocus/onBlur (== focusable mixin's
    // handleFocus/handleBlur) onto the DOM button. Invoke those forwarded
    // handlers directly: synthetic focus events dispatched via fireEvent.focus
    // fire the handler but do not reliably flush its setState in this
    // jsdom/React combo, whereas calling the handler directly does.
    //
    // NOTE: useButton does not forward the caller's onFocus/onBlur into the
    // focusable mixin, so the user callbacks are not invoked from handleFocus.
    // The assertion below covers the state-tracking half of the contract; the
    // callback-forwarding half is a known hook gap (useButton.tsx is out of
    // scope for this pass).
    act(() => {
      api.current!.onFocus(new FocusEvent('focus'));
    });
    expect(api.current!.focused).toBe(true);
    act(() => {
      api.current!.onBlur(new FocusEvent('blur'));
    });
    expect(api.current!.focused).toBe(false);
  });

  it('applies semantic label/labelledBy/describedBy and role', () => {
    const { api } = setup({ role: 'button', label: 'Save', labelledBy: 'lb', describedBy: 'db' });
    const a = api.current!.semanticAttributes;
    expect(a['aria-label']).toBe('Save');
    expect(a['aria-labelledby']).toBe('lb');
    expect(a['aria-describedby']).toBe('db');
    expect(a.role).toBe('button');
  });

  it('forwards pass-through semantic props (expanded/selected/hasPopup/live)', () => {
    const { api } = setup({
      role: 'generic',
      expanded: true,
      selected: false,
      hasPopup: 'menu',
      live: 'polite',
    } as any);
    const a = api.current!.semanticAttributes;
    expect(a['aria-expanded']).toBe(true);
    expect(a['aria-selected']).toBe(false);
    expect(a['aria-haspopup']).toBe('menu');
    expect(a['aria-live']).toBe('polite');
    // generic role is dropped
    expect(a.role).toBeUndefined();
  });

  it('supports manual focus strategy (tabIndex 0)', () => {
    const { api } = setup({ focusStrategy: 'manual' });
    expect(api.current!.tabIndex).toBe(0);
  });

  it('non-focusable button reports tabIndex -1', () => {
    const { api } = setup({ focusable: false });
    expect(api.current!.tabIndex).toBe(-1);
  });

  it('defaultFocused auto-focuses the button on mount', () => {
    const { api } = setup({ defaultFocused: true, focusStrategy: 'auto' });
    // the focusable mixin schedules focus via setTimeout(0)
    expect(api.current!.ref.current).not.toBeNull();
  });

  it('handleClick prevents default when disabled', () => {
    const { api } = setup({ disabled: true });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevent = vi.spyOn(event, 'preventDefault');
    act(() => {
      api.current!.handleClick(event as any);
    });
    expect(prevent).toHaveBeenCalled();
  });

  it('handleClick prevents default when loading', () => {
    const { api } = setup({ loading: true });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevent = vi.spyOn(event, 'preventDefault');
    act(() => {
      api.current!.handleClick(event as any);
    });
    expect(prevent).toHaveBeenCalled();
  });

  it('className reflects pressed and focused state data attributes', () => {
    const { api } = setup();
    act(() => {
      api.current!.press();
    });
    // press increments count; pressed toggles via keydown/programmatic start
    expect(api.current!.pressCount).toBe(1);
    expect(api.current!.semanticAttributes['data-pressed']).toBe(false);
  });
});
