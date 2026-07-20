import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useKbd,
  formatKeyDisplay,
  parseKeyShortcut,
} from '../src/hooks/useKbd';
import { Kbd, KbdShortcut, KbdModifier } from '../src/components/Kbd';

function setup(props: any = {}) {
  const api: any = {};
  const ref = { current: null as HTMLElement | null };
  function Harness() {
    const r = useKbd({ defaultValue: 'S', keyRef: ref, ...props });
    api.state = r.state;
    api.actions = r.actions;
    api.attributes = r.attributes;
    api.classes = r.classes;
    return <span ref={ref as any} data-testid="k" tabIndex={0} />;
  }
  const utils = render(<Harness />);
  return { api, ref, ...utils };
}

describe('useKbd hook - state', () => {
  it('defaults: not pressed/hovered/focused, interactive, value from defaultValue', () => {
    const { api } = setup();
    expect(api.state.pressed).toBe(false);
    expect(api.state.hovered).toBe(false);
    expect(api.state.focused).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.value).toBe('S');
    expect(api.state.interactive ?? true).toBeTruthy();
    expect(api.classes.interactive).toBe('kbd-interactive');
  });

  it('controlled value overrides defaultValue', () => {
    const { api } = setup({ defaultValue: 'A', value: 'B' });
    expect(api.state.value).toBe('B');
  });

  it('defaultModifiers seed modifier state', () => {
    const { api } = setup({ defaultValue: 'X', defaultModifiers: { ctrl: true, shift: true } });
    expect(api.state.modifiers).toMatchObject({ ctrl: true, shift: true, alt: false, meta: false });
  });

  it('controlled modifiers override internal state', () => {
    const { api } = setup({
      defaultValue: 'X',
      defaultModifiers: { ctrl: true },
      modifiers: { alt: true },
    });
    expect(api.state.modifiers.alt).toBe(true);
    expect(api.state.modifiers.ctrl).toBe(false); // controlled wins, merged over defaults
  });
});

describe('useKbd hook - actions', () => {
  it('press/release fires onPress/onRelease and sets pressed when animateOnPress', () => {
    const onPress = vi.fn();
    const onRelease = vi.fn();
    const { api } = setup({ onPress, onRelease });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(true);
    expect(onPress).toHaveBeenCalled();
    act(() => api.actions.release());
    expect(api.state.pressed).toBe(false);
    expect(onRelease).toHaveBeenCalled();
  });

  it('press is no-op when disabled or non-interactive', () => {
    const onPress = vi.fn();
    const dis = setup({ disabled: true, onPress });
    act(() => dis.api.actions.press());
    expect(onPress).not.toHaveBeenCalled();
    expect(dis.api.state.pressed).toBe(false);
    const non = setup({ interactive: false, onPress });
    act(() => non.api.actions.press());
    expect(onPress).not.toHaveBeenCalled();
  });

  it('press does not set pressed when animateOnPress=false', () => {
    const { api } = setup({ animateOnPress: false });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(false);
  });

  it('press fires onChange with value + modifiers', () => {
    const onChange = vi.fn();
    const { api } = setup({
      defaultValue: 'C',
      defaultModifiers: { shift: true },
      onChange,
    });
    act(() => api.actions.press());
    expect(onChange).toHaveBeenCalledWith('C', expect.objectContaining({ shift: true }));
  });

  it('hover/unhover set hovered and call onHover', () => {
    const onHover = vi.fn();
    const { api } = setup({ onHover });
    act(() => api.actions.hover());
    expect(api.state.hovered).toBe(true);
    expect(api.state.highlighted).toBe(true);
    expect(onHover).toHaveBeenLastCalledWith(true);
    act(() => api.actions.unhover());
    expect(api.state.hovered).toBe(false);
    expect(onHover).toHaveBeenLastCalledWith(false);
  });

  it('hover no-op when disabled/non-interactive', () => {
    const onHover = vi.fn();
    const dis = setup({ disabled: true, onHover });
    act(() => dis.api.actions.hover());
    expect(onHover).not.toHaveBeenCalled();
  });

  it('focus/blur call element focus/blur', () => {
    const { api, getByTestId } = setup();
    const el = getByTestId('k');
    act(() => api.actions.focus());
    expect(document.activeElement).toBe(el);
    act(() => api.actions.blur());
    expect(document.activeElement).not.toBe(el);
    // disabled focus is no-op
    const dis = setup({ disabled: true });
    act(() => dis.api.actions.focus());
  });

  it('setModifiers, toggleModifier, clearModifiers in uncontrolled mode', () => {
    const { api } = setup({ defaultValue: 'K' });
    act(() => api.actions.setModifiers({ ctrl: true }));
    expect(api.state.modifiers.ctrl).toBe(true);
    act(() => api.actions.toggleModifier('shift'));
    expect(api.state.modifiers.shift).toBe(true);
    act(() => api.actions.toggleModifier('shift'));
    expect(api.state.modifiers.shift).toBe(false);
    act(() => api.actions.clearModifiers());
    expect(api.state.modifiers).toMatchObject({ ctrl: false, shift: false, alt: false, meta: false });
  });

  it('modifiers setters are no-op when controlled', () => {
    const { api } = setup({ defaultValue: 'K', modifiers: { ctrl: false } });
    act(() => api.actions.setModifiers({ ctrl: true }));
    act(() => api.actions.toggleModifier('shift'));
    act(() => api.actions.clearModifiers());
    expect(api.state.modifiers.ctrl).toBe(false);
    expect(api.state.modifiers.shift).toBe(false);
  });

  it('setValue updates internal value only when uncontrolled', () => {
    const { api } = setup({ defaultValue: 'A' });
    act(() => api.actions.setValue('Z'));
    expect(api.state.value).toBe('Z');
    const controlled = setup({ value: 'Q' });
    act(() => controlled.api.actions.setValue('Y'));
    expect(controlled.api.state.value).toBe('Q');
  });

  it('getElement returns the ref node', () => {
    const { api, getByTestId } = setup();
    expect(api.actions.getElement()).toBe(getByTestId('k'));
  });
});

describe('useKbd hook - getAccessibilityProps', () => {
  it('uses explicit label when provided', () => {
    const { api } = setup({ defaultValue: 'X', label: 'Save shortcut' });
    expect(api.attributes['aria-label']).toBe('Save shortcut');
  });

  it('uses description as label fallback', () => {
    const { api } = setup({ defaultValue: 'X', description: 'Saves the doc' });
    expect(api.attributes['aria-label']).toBe('Saves the doc');
  });

  it('generates label from modifiers + value', () => {
    const { api } = setup({
      defaultValue: 's',
      defaultModifiers: { ctrl: true, shift: true },
    });
    expect(api.attributes['aria-label']).toBe('Ctrl Shift s');
  });

  it('capitalizes value when capitalize=true', () => {
    const { api } = setup({
      defaultValue: 's',
      capitalize: true,
      defaultModifiers: { ctrl: true },
    });
    expect(api.attributes['aria-label']).toContain('S');
  });

  it('aria-keyshortcuts built from modifiers + value', () => {
    const { api } = setup({
      defaultValue: 'S',
      defaultModifiers: { ctrl: true, shift: true },
    });
    expect(api.attributes['aria-keyshortcuts']).toBe('ctrl+shift+s');
  });

  it('aria-pressed set only when interactive + pressed', () => {
    const { api } = setup({});
    expect(api.attributes['aria-pressed']).toBeUndefined();
    act(() => api.actions.press());
    expect(api.attributes['aria-pressed']).toBe(true);
  });

  it('role is button for interactive, kbd for non-interactive', () => {
    expect(setup().api.attributes.role).toBe('button');
    expect(setup({ interactive: false }).api.attributes.role).toBe('kbd');
  });

  it('tabIndex is 0 for interactive+enabled, absent when disabled', () => {
    expect(setup().api.attributes.tabIndex).toBe(0);
    expect(setup({ disabled: true }).api.attributes.tabIndex).toBeUndefined();
  });
});

describe('formatKeyDisplay', () => {
  it('joins modifiers + value with symbols by default', () => {
    expect(
      formatKeyDisplay('S', { ctrl: true, shift: false, alt: true, meta: false })
    ).toBe('⌃ ⌥ S');
  });

  it('respects combo separator and capitalize', () => {
    expect(
      formatKeyDisplay('s', { ctrl: true, shift: false, alt: false, meta: false }, {
        combo: true,
        capitalize: true,
      })
    ).toBe('⌃+S');
  });

  it('useSymbols=false renders modifier names', () => {
    expect(
      formatKeyDisplay('K', { ctrl: true, alt: false, shift: false, meta: false }, {
        useSymbols: false,
      })
    ).toBe('ctrl K');
  });

  it('showModifiers=false omits modifiers', () => {
    expect(
      formatKeyDisplay('K', { ctrl: true, shift: false, alt: false, meta: false }, {
        showModifiers: false,
      })
    ).toBe('K');
  });

  it('empty value yields modifiers only', () => {
    expect(formatKeyDisplay('', { ctrl: true, shift: false, alt: false, meta: false })).toBe('⌃');
  });
});

describe('parseKeyShortcut', () => {
  it('parses ctrl+shift+s', () => {
    const r = parseKeyShortcut('Ctrl+Shift+S');
    expect(r.value).toBe('s');
    expect(r.modifiers).toMatchObject({ ctrl: true, shift: true, alt: false, meta: false });
  });

  it('recognizes aliases: control, cmd, command', () => {
    expect(parseKeyShortcut('control+c').modifiers.ctrl).toBe(true);
    expect(parseKeyShortcut('cmd+c').modifiers.meta).toBe(true);
    expect(parseKeyShortcut('command+c').modifiers.meta).toBe(true);
    expect(parseKeyShortcut('alt+c').modifiers.alt).toBe(true);
  });

  it('value lowercased; no modifiers yields plain value', () => {
    expect(parseKeyShortcut('Enter')).toEqual({
      value: 'enter',
      modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    });
  });
});

describe('Kbd component integration', () => {
  it('renders children inside a kbd element', () => {
    render(<Kbd>Ctrl</Kbd>);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('interactive kbd press on click', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Kbd interactive defaultValue="K" onPress={onPress} aria-label="press me" />);
    const el = screen.getByText('K');
    await user.click(el);
    expect(onPress).toHaveBeenCalled();
  });

  it('KbdShortcut parses and displays a combo', () => {
    const { container } = render(<KbdShortcut shortcut="Ctrl+S" />);
    expect(container.textContent).toMatch(/⌃/);
    // value is lowercased by parseKeyShortcut.
    expect(container.textContent).toContain('s');
  });

  it('KbdModifier renders a single modifier symbol', () => {
    const { container } = render(<KbdModifier modifier="shift" />);
    expect(container.textContent).toContain('⇧');
  });
});
