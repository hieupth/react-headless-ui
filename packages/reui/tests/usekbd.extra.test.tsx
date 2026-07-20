import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useKbd, formatKeyDisplay, parseKeyShortcut } from '../src/hooks';
import type { UseKbdProps } from '../src/hooks';

// Headless-hook harness following the useportal.hook.test.tsx canonical pattern.
function setup(props: UseKbdProps, renderInputs = true) {
  const api = { state: null as any, actions: null as any, attributes: null as any, classes: null as any, ref: null as HTMLElement | null };
  function Harness() {
    const result = useKbd({ keyRef: { current: null } as any, ...props });
    api.state = result.state;
    api.actions = result.actions;
    api.attributes = result.attributes;
    api.classes = result.classes;
    return renderInputs ? (
      <div>
        <span ref={(el) => { (api as any).ref = el; (props as any).keyRef && ((props as any).keyRef.current = el); }} tabIndex={0} />
      </div>
    ) : null;
  }
  render(<Harness />);
  return api;
}

describe('useKbd hook', () => {
  it('exposes default state and classes', () => {
    const api = setup({});
    expect(api.state.pressed).toBe(false);
    expect(api.state.hovered).toBe(false);
    expect(api.state.focused).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.value).toBe('');
    expect(api.state.showModifiers).toBe(true);
    expect(api.state.showShortcuts).toBe(true);
    expect(api.state.highlighted).toBe(false);
    expect(api.state.modifiers).toEqual({ ctrl: false, shift: false, alt: false, meta: false });
    expect(api.classes.base).toBe('kbd');
    expect(api.classes.interactive).toBe('kbd-interactive');
    expect(api.classes.pressed).toBe('');
  });

  it('renders as static (non-interactive) with kbd role', () => {
    const api = setup({ interactive: false });
    expect(api.attributes.role).toBe('kbd');
    expect(api.attributes.tabIndex).toBeUndefined();
    expect(api.classes.interactive).toBe('kbd-static');
  });

  it('interactive default role is button with tabIndex 0', () => {
    const api = setup({ defaultValue: 'Enter' });
    expect(api.attributes.role).toBe('button');
    expect(api.attributes.tabIndex).toBe(0);
    expect(api.attributes['aria-keyshortcuts']).toBe('enter');
    expect(api.attributes['aria-label']).toBe('Enter');
  });

  it('disabled omits tabIndex but keeps role button', () => {
    const api = setup({ disabled: true });
    expect(api.attributes.role).toBe('button');
    expect(api.attributes.tabIndex).toBeUndefined();
    expect(api.classes.disabled).toBe('kbd-disabled');
  });

  it('uses label for aria-label when provided; falls back to description; else generates', () => {
    expect(setup({ label: 'Save File' }).attributes['aria-label']).toBe('Save File');
    expect(setup({ description: 'Copy action' }).attributes['aria-label']).toBe('Copy action');
    expect(setup({ defaultValue: 'X', modifiers: { ctrl: true } }).attributes['aria-label']).toBe('Ctrl X');
  });

  it('capitalizes generated label part when capitalize=true', () => {
    const a = setup({ defaultValue: 'a', capitalize: true });
    expect(a.attributes['aria-label']).toBe('A');
  });

  it('aria-keyshortcuts joins modifier keys + lowercased value', () => {
    const a = setup({ defaultValue: 'K', modifiers: { ctrl: true, shift: true } });
    expect(a.attributes['aria-keyshortcuts']).toBe('ctrl+shift+k');
  });

  it('omits aria-keyshortcuts when showShortcuts is false', () => {
    const a = setup({ defaultValue: 'K', showShortcuts: false });
    expect(a.attributes['aria-keyshortshortcuts']).toBeUndefined();
    expect(a.attributes['aria-keyshortcuts']).toBeUndefined();
  });

  it('press/release toggle pressed state, fire callbacks, and set aria-pressed', () => {
    const onPress = vi.fn();
    const onRelease = vi.fn();
    const onChange = vi.fn();
    const api = setup({ onPress, onRelease, onChange });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(true);
    expect(api.classes.pressed).toBe('kbd-pressed');
    expect(api.attributes['aria-pressed']).toBe(true);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => api.actions.release());
    expect(api.state.pressed).toBe(false);
    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it('press is a no-op when disabled or non-interactive (no animate, no callbacks)', () => {
    const onPress = vi.fn();
    const onChange = vi.fn();
    const api = setup({ disabled: true, onPress, onChange });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(false);
    expect(onPress).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    const onPress2 = vi.fn();
    const api2 = setup({ interactive: false, onPress: onPress2 });
    act(() => api2.actions.press());
    expect(onPress2).not.toHaveBeenCalled();
  });

  it('press does not set pressed state when animateOnPress is false', () => {
    const api = setup({ animateOnPress: false, onPress: () => {} });
    act(() => api.actions.press());
    expect(api.state.pressed).toBe(false);
  });

  it('hover/unhover toggle hovered + highlighted and fire onHover', () => {
    const onHover = vi.fn();
    const api = setup({ onHover, highlightOnHover: true });
    act(() => api.actions.hover());
    expect(api.state.hovered).toBe(true);
    expect(api.state.highlighted).toBe(true);
    expect(api.classes.hovered).toBe('kbd-hovered');
    expect(api.classes.highlighted).toBe('kbd-highlighted');
    expect(onHover).toHaveBeenCalledWith(true);

    act(() => api.actions.unhover());
    expect(api.state.hovered).toBe(false);
    expect(api.state.highlighted).toBe(false);
    expect(onHover).toHaveBeenCalledWith(false);
  });

  it('hover is a no-op when disabled/non-interactive', () => {
    const onHover = vi.fn();
    const api = setup({ disabled: true, onHover });
    act(() => api.actions.hover());
    expect(api.state.hovered).toBe(false);
    expect(onHover).not.toHaveBeenCalled();
  });

  it('highlighted stays false when highlightOnHover is false', () => {
    const api = setup({ highlightOnHover: false });
    act(() => api.actions.hover());
    expect(api.state.hovered).toBe(true);
    expect(api.state.highlighted).toBe(false);
  });

  it('setValue updates uncontrolled value only', () => {
    const api = setup({});
    act(() => api.actions.setValue('F1'));
    expect(api.state.value).toBe('F1');
  });

  it('setValue is a no-op when value is controlled', () => {
    const api = setup({ value: 'Ctrl' });
    act(() => api.actions.setValue('Shift'));
    expect(api.state.value).toBe('Ctrl');
  });

  it('setModifiers/toggleModifier/clearModifiers mutate uncontrolled modifiers', () => {
    const api = setup({});
    act(() => api.actions.setModifiers({ ctrl: true }));
    expect(api.state.modifiers.ctrl).toBe(true);

    act(() => api.actions.toggleModifier('shift'));
    expect(api.state.modifiers.shift).toBe(true);
    act(() => api.actions.toggleModifier('shift'));
    expect(api.state.modifiers.shift).toBe(false);

    act(() => api.actions.clearModifiers());
    expect(api.state.modifiers).toEqual({ ctrl: false, shift: false, alt: false, meta: false });
  });

  it('modifiers are controlled: setModifiers/toggleModifier/clearModifiers are no-ops', () => {
    const api = setup({ modifiers: { ctrl: true } });
    act(() => api.actions.setModifiers({ shift: true }));
    act(() => api.actions.toggleModifier('alt'));
    act(() => api.actions.clearModifiers());
    expect(api.state.modifiers.ctrl).toBe(true);
    expect(api.state.modifiers.shift).toBe(false);
    expect(api.state.modifiers.alt).toBe(false);
  });

  it('defaultModifiers seed initial uncontrolled modifiers', () => {
    const api = setup({ defaultModifiers: { meta: true } });
    expect(api.state.modifiers.meta).toBe(true);
    expect(api.state.modifiers.ctrl).toBe(false);
  });

  it('focus/blur/getElement operate on the bound ref', () => {
    const api = setup({});
    // No element bound to the keyRef (we passed a separate ref); getElement returns null.
    expect(api.actions.getElement()).toBeNull();
    expect(() => act(() => api.actions.focus())).not.toThrow();
    expect(() => act(() => api.actions.blur())).not.toThrow();
  });

  it('focus is a no-op when disabled/non-interactive', () => {
    const api = setup({ disabled: true });
    expect(() => act(() => api.actions.focus())).not.toThrow();
  });

  it('unhover is a no-op when disabled/non-interactive', () => {
    const onHover = vi.fn();
    const api = setup({ disabled: true, onHover });
    act(() => api.actions.unhover());
    expect(api.state.hovered).toBe(false);
    expect(onHover).not.toHaveBeenCalled();
  });

  it('uses the internal ref when no keyRef is provided', () => {
    // No keyRef passed -> elementRef falls back to the hook's internal ref.
    const api = { actions: null as any };
    function Harness() {
      const result = useKbd({});
      (api as any).actions = result.actions;
      return null;
    }
    render(<Harness />);
    // internal ref is never attached to a DOM node -> getElement returns null
    expect(api.actions.getElement()).toBeNull();
  });

  it('getAccessibilityProps reflects live pressed state', () => {
    const api = setup({});
    act(() => api.actions.press());
    const props = api.actions.getAccessibilityProps();
    expect(props['aria-pressed']).toBe(true);
  });

  it('focus/blur track focused state and the kbd-focused class', () => {
    const api = setup({});
    expect(api.state.focused).toBe(false);
    expect(api.classes.focused).toBe('');
    act(() => api.actions.focus());
    expect(api.state.focused).toBe(true);
    expect(api.classes.focused).toBe('kbd-focused');
    act(() => api.actions.blur());
    expect(api.state.focused).toBe(false);
    expect(api.classes.focused).toBe('');
  });
});

describe('formatKeyDisplay', () => {
  it('joins modifier symbols + value with space by default', () => {
    expect(formatKeyDisplay('C', { ctrl: true, shift: false, alt: false, meta: true })).toBe('⌃ ⌘ C');
  });

  it('joins with comboSeparator when combo=true', () => {
    expect(formatKeyDisplay('C', { ctrl: true, shift: false, alt: false, meta: false }, { combo: true, comboSeparator: '+' })).toBe('⌃+C');
  });

  it('hides modifiers when showModifiers=false', () => {
    expect(formatKeyDisplay('C', { ctrl: true, shift: false, alt: false, meta: false }, { showModifiers: false })).toBe('C');
  });

  it('uses textual modifier names when useSymbols=false', () => {
    expect(formatKeyDisplay('C', { ctrl: true, shift: false, alt: false, meta: false }, { useSymbols: false })).toBe('ctrl C');
  });

  it('capitalizes modifier names when useSymbols=false and capitalize=true', () => {
    expect(formatKeyDisplay('c', { ctrl: true, shift: false, alt: false, meta: false }, { useSymbols: false, capitalize: true })).toBe('CTRL C');
  });

  it('capitalizes the value when capitalize=true', () => {
    expect(formatKeyDisplay('c', { ctrl: false, shift: false, alt: false, meta: false }, { capitalize: true })).toBe('C');
  });

  it('returns empty string when no modifiers and no value', () => {
    expect(formatKeyDisplay('', { ctrl: false, shift: false, alt: false, meta: false })).toBe('');
  });

  it('falls back to the raw modifier key when symbol is missing', () => {
    expect(formatKeyDisplay('C', { unknown: true } as any)).toBe('unknown C');
  });
});

describe('parseKeyShortcut', () => {
  it('parses ctrl+key', () => {
    expect(parseKeyShortcut('ctrl+a')).toEqual({ value: 'a', modifiers: { ctrl: true, shift: false, alt: false, meta: false } });
  });

  it('recognizes "control" alias for ctrl', () => {
    expect(parseKeyShortcut('control+b').modifiers.ctrl).toBe(true);
  });

  it('recognizes shift, alt', () => {
    const m = parseKeyShortcut('shift+alt+x').modifiers;
    expect(m.shift).toBe(true);
    expect(m.alt).toBe(true);
  });

  it('recognizes meta/cmd/command aliases', () => {
    expect(parseKeyShortcut('cmd+y').modifiers.meta).toBe(true);
    expect(parseKeyShortcut('command+y').modifiers.meta).toBe(true);
    expect(parseKeyShortcut('meta+y').modifiers.meta).toBe(true);
  });

  it('treats unknown tokens as the value', () => {
    expect(parseKeyShortcut('ctrl+enter')).toEqual({ value: 'enter', modifiers: { ctrl: true, shift: false, alt: false, meta: false } });
  });

  it('is case-insensitive and trims whitespace', () => {
    const { value, modifiers } = parseKeyShortcut('  CTRL + Shift + K  ');
    expect(value).toBe('k');
    expect(modifiers.ctrl).toBe(true);
    expect(modifiers.shift).toBe(true);
  });

  it('returns empty value when only modifiers provided', () => {
    expect(parseKeyShortcut('ctrl+shift').value).toBe('');
  });
});
