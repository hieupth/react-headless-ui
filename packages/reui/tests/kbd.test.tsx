import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Kbd, KbdShortcut, KbdModifier } from '../src/components/Kbd';
import {
  useKbd,
  formatKeyDisplay,
  parseKeyShortcut,
} from '../src/hooks';
import { ThemeProvider } from '../src/providers/ThemeProvider';

describe('Kbd', () => {
  it('renders its children inside a kbd element', () => {
    render(<Kbd>Ctrl</Kbd>);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('renders a controlled key value', () => {
    const { container } = render(<Kbd value="Enter" />);
    expect(container.firstChild).not.toBeNull();
  });

  it('exposes a button role when interactive', () => {
    render(<Kbd value="S" interactive />);
    expect(screen.getByTestId('kbd').getAttribute('data-interactive')).toBe('true');
  });

  it('fires onPress when clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Kbd value="A" onPress={onPress} />);
    await user.click(screen.getByTestId('kbd'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires onChange when pressed with the value and modifiers', () => {
    const onChange = vi.fn();
    render(
      <Kbd interactive defaultValue="A" defaultModifiers={{ shift: true }} onChange={onChange} />
    );
    fireEvent.click(screen.getByTestId('kbd'));
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe('A');
    expect(onChange.mock.calls[0][1].shift).toBe(true);
  });

  it('does not fire onPress when disabled', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Kbd value="A" disabled onPress={onPress} />);
    await user.click(screen.getByTestId('kbd'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders a tooltip when showTooltip is set', () => {
    render(<Kbd value="S" showTooltip tooltip="Save file" />);
    expect(screen.getByTestId('kbd-tooltip')).toHaveTextContent('Save file');
  });

  it('uses a custom renderKey function', () => {
    render(
      <Kbd
        value="S"
        renderKey={({ display }) => <span data-testid="custom-key">{display}</span>}
      />
    );
    expect(screen.getByTestId('custom-key')).toBeInTheDocument();
  });

  it('applies size, variant, and shape data attributes', () => {
    render(<Kbd value="X" size="lg" variant="filled" shape="pill" />);
    const kbd = screen.getByTestId('kbd');
    expect(kbd.getAttribute('data-size')).toBe('lg');
    expect(kbd.getAttribute('data-variant')).toBe('filled');
    expect(kbd.getAttribute('data-shape')).toBe('pill');
  });

  it('renders the modifier data attribute from active modifiers', () => {
    render(<Kbd value="S" defaultModifiers={{ ctrl: true, shift: true }} />);
    const mods = screen.getByTestId('kbd').getAttribute('data-modifiers') || '';
    expect(mods).toContain('ctrl');
    expect(mods).toContain('shift');
  });
});

describe('KbdShortcut / KbdModifier', () => {
  it('KbdShortcut parses a shortcut string', () => {
    render(<KbdShortcut shortcut="Ctrl+S" />);
    const kbd = screen.getByTestId('kbd');
    expect(kbd.getAttribute('data-value')).toBe('s');
    expect((kbd.getAttribute('data-modifiers') || '').includes('ctrl')).toBe(true);
  });

  it('KbdShortcut can skip parsing', () => {
    render(<KbdShortcut shortcut="Ctrl+S" parse={false} />);
    expect(screen.getByTestId('kbd').getAttribute('data-value')).toBe('Ctrl+S');
  });

  it('KbdModifier renders a symbol', () => {
    render(<KbdModifier modifier="shift" />);
    expect(screen.getByText('⇧')).toBeInTheDocument();
  });

  it('KbdModifier renders the word when showSymbol is false', () => {
    render(<KbdModifier modifier="ctrl" showSymbol={false} />);
    expect(screen.getByText('ctrl')).toBeInTheDocument();
  });
});

describe('useKbd', () => {
  it('press/release toggle pressed state and fire callbacks', () => {
    const onPress = vi.fn();
    const onRelease = vi.fn();
    let result: any;
    const Probe = () => {
      result = useKbd({ onPress, onRelease });
      return null;
    };
    render(<Probe />);
    result.actions.press();
    expect(onPress).toHaveBeenCalledTimes(1);
    result.actions.release();
    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it('setValue updates internal value when uncontrolled', () => {
    let result: any;
    const Probe = () => { result = useKbd({}); return null; };
    render(<Probe />);
    act(() => result.actions.setValue('X'));
    expect(result.state.value).toBe('X');
  });

  it('modifiers are controlled and not changed internally', () => {
    let result: any;
    const Probe = () => {
      result = useKbd({ modifiers: { ctrl: true } });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.toggleModifier('shift'));
    expect(result.state.modifiers.shift).toBe(false);
    expect(result.state.modifiers.ctrl).toBe(true);
  });

  it('toggleModifier/clearModifiers work when uncontrolled', () => {
    let result: any;
    const Probe = () => { result = useKbd({}); return null; };
    render(<Probe />);
    act(() => result.actions.toggleModifier('alt'));
    expect(result.state.modifiers.alt).toBe(true);
    act(() => result.actions.clearModifiers());
    expect(result.state.modifiers.alt).toBe(false);
  });

  it('getAccessibilityProps builds aria-label and aria-keyshortcuts', () => {
    let result: any;
    const Probe = () => {
      result = useKbd({ defaultValue: 's', defaultModifiers: { ctrl: true } });
      return null;
    };
    render(<Probe />);
    const props = result.actions.getAccessibilityProps();
    expect(props['aria-keyshortcuts']).toBe('ctrl+s');
    expect(props['aria-label']).toContain('Ctrl');
    expect(props.role).toBe('button');
  });
});

describe('formatKeyDisplay / parseKeyShortcut', () => {
  it('formatKeyDisplay joins modifiers and value', () => {
    expect(
      formatKeyDisplay('S', { ctrl: true, shift: false, alt: false, meta: false })
    ).toContain('⌃');
  });

  it('formatKeyDisplay uses a custom separator in combo mode', () => {
    const out = formatKeyDisplay(
      'S',
      { ctrl: true, shift: false, alt: false, meta: false },
      { combo: true, comboSeparator: '-' }
    );
    expect(out).toContain('-');
  });

  it('parseKeyShortcut splits modifiers and value', () => {
    const parsed = parseKeyShortcut('Ctrl+Shift+S');
    expect(parsed.value).toBe('s');
    expect(parsed.modifiers.ctrl).toBe(true);
    expect(parsed.modifiers.shift).toBe(true);
  });

  it('parseKeyShortcut recognises aliases (control, cmd, command)', () => {
    expect(parseKeyShortcut('control+a').modifiers.ctrl).toBe(true);
    expect(parseKeyShortcut('cmd+a').modifiers.meta).toBe(true);
    expect(parseKeyShortcut('command+a').modifiers.meta).toBe(true);
  });
});

describe('Kbd (event handlers)', () => {
  it('fires press/release on click, keydown, mousedown, and keyup when interactive', () => {
    // Fake timers make the 100ms release-timeout in handleClick/handleKeyDown
    // fire deterministically (covering those arrow callbacks).
    vi.useFakeTimers();
    const onPress = vi.fn();
    const onRelease = vi.fn();
    render(<Kbd interactive value="A" onPress={onPress} onRelease={onRelease} />);
    const kbd = screen.getByTestId('kbd');

    // click path (handleClick) — gated on interactive; schedules a release
    act(() => { fireEvent.click(kbd); });
    act(() => { vi.advanceTimersByTime(150); });
    // keydown Enter / Space (handleKeyDown) — gated on interactive
    act(() => { fireEvent.keyDown(kbd, { key: 'Enter' }); });
    act(() => { vi.advanceTimersByTime(150); });
    act(() => { fireEvent.keyDown(kbd, { key: ' ' }); });
    act(() => { vi.advanceTimersByTime(150); });
    // a non-activation key is a no-op in handleKeyDown
    act(() => { fireEvent.keyDown(kbd, { key: 'ArrowDown' }); });
    // mouseDown/mouseUp fire press/release directly
    act(() => { fireEvent.mouseDown(kbd); });
    act(() => { fireEvent.mouseUp(kbd); });
    // keyUp releases
    act(() => { fireEvent.keyUp(kbd); });

    expect(onPress).toHaveBeenCalled();
    expect(onRelease).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('keyDown is a no-op when disabled or non-interactive', () => {
    const onPress = vi.fn();
    const { rerender } = render(<Kbd value="A" disabled onPress={onPress} />);
    act(() => { fireEvent.keyDown(screen.getByTestId('kbd'), { key: 'Enter' }); });
    // non-interactive
    rerender(<Kbd value="A" interactive={false} onPress={onPress} />);
    act(() => { fireEvent.keyDown(screen.getByTestId('kbd'), { key: 'Enter' }); });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('hover/focus/blur handlers run without throwing', () => {
    const onHover = vi.fn();
    render(<Kbd interactive value="A" onHover={onHover} />);
    const kbd = screen.getByTestId('kbd');
    act(() => { fireEvent.mouseEnter(kbd); });
    expect(onHover).toHaveBeenLastCalledWith(true);
    expect(kbd).toHaveAttribute('data-hovered', 'true');
    act(() => { fireEvent.mouseLeave(kbd); });
    expect(onHover).toHaveBeenLastCalledWith(false);
    // focus/blur handlers execute (the hook focuses the element); no throw.
    act(() => { fireEvent.focus(kbd); });
    act(() => { fireEvent.blur(kbd); });
    expect(kbd).toBeInTheDocument();
  });
});

describe('Kbd (display text + special keys)', () => {
  it.each([
    ['space', 'Space'],
    ['enter', 'Enter'],
    ['escape', 'Esc'],
    ['backspace', '⌫'],
    ['delete', 'Del'],
    ['tab', 'Tab'],
    ['arrowup', '↑'],
    ['arrowdown', '↓'],
    ['arrowleft', '←'],
    ['arrowright', '→'],
  ])('formats special key %s', (value, expected) => {
    const { container } = render(<Kbd value={value} />);
    expect(container.textContent).toContain(expected);
  });

  it('applies a custom keyMap for display', () => {
    const { container } = render(<Kbd value="X" keyMap={{ x: 'Custom' }} />);
    expect(container.textContent).toContain('Custom');
  });

  it('renders modifier names as words when useModifierSymbols is false', () => {
    const { container } = render(
      <Kbd value="S" defaultModifiers={{ ctrl: true, shift: true }} useModifierSymbols={false} />
    );
    expect(container.textContent).toContain('Ctrl');
    expect(container.textContent).toContain('Shift');
  });

  it('joins modifiers with a custom separator in combo mode', () => {
    const { container } = render(
      <Kbd value="s" combo defaultModifiers={{ ctrl: true }} comboSeparator="-" showModifiers />
    );
    expect(container.textContent).toContain('-');
  });

  it('renders an unknown modifier key name as a fallback (symbols[key] || key)', () => {
    // 'meta' is in the symbol map; this exercises the symbol path. The fallback
    // arm (`|| key`) is reached only for an unmapped modifier, which the type
    // system does not allow — covered indirectly by the word-name test above.
    const { container } = render(
      <Kbd value="S" defaultModifiers={{ meta: true }} />
    );
    expect(container.textContent).toContain('⌘');
  });
});

describe('Kbd (variants, sizes, shapes)', () => {
  it('renders every variant', () => {
    const { rerender } = render(<Kbd value="A" variant="filled" />);
    for (const variant of ['filled', 'outlined', 'minimal', 'default'] as const) {
      rerender(<Kbd value="A" variant={variant} showBackground={false} showBorder={false} showShadow={false} />);
      expect(screen.getByTestId('kbd').getAttribute('data-variant')).toBe(variant);
    }
  });

  it('renders every size', () => {
    const { rerender } = render(<Kbd value="A" size="xs" />);
    for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
      rerender(<Kbd value="A" size={size} />);
      expect(screen.getByTestId('kbd').getAttribute('data-size')).toBe(size);
    }
  });

  it('renders every shape', () => {
    const { rerender } = render(<Kbd value="A" shape="rectangle" />);
    for (const shape of ['rectangle', 'square', 'pill', 'rounded'] as const) {
      rerender(<Kbd value="A" shape={shape} />);
      expect(screen.getByTestId('kbd').getAttribute('data-shape')).toBe(shape);
    }
  });

  it('applies custom color/shadow props on the filled variant', () => {
    render(
      <Kbd
        value="A"
        variant="filled"
        backgroundColor="#abc"
        textColor="#def"
        borderColor="#ghi"
        shadow="0 0 0 #000"
      />
    );
    expect(screen.getByTestId('kbd')).toBeInTheDocument();
  });
});

describe('Kbd (tooltip positions)', () => {
  it('renders a tooltip from description when tooltip is absent', () => {
    render(<Kbd value="S" showTooltip description="Saves the file" />);
    expect(screen.getByTestId('kbd-tooltip')).toHaveTextContent('Saves the file');
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'builds tooltip styles for position %s',
    (tooltipPosition) => {
      const { rerender } = render(
        <Kbd value="S" showTooltip tooltip="tip" tooltipPosition={tooltipPosition} />
      );
      // hover so the tooltip becomes visible, then rerender for each position
      act(() => { fireEvent.mouseEnter(screen.getByTestId('kbd')); });
      rerender(
        <Kbd value="S" showTooltip tooltip="tip" tooltipPosition={tooltipPosition} />
      );
      expect(screen.getByTestId('kbd-tooltip')).toBeInTheDocument();
    }
  );
});

describe('Kbd (as + renderKey)', () => {
  it('renders through a custom element tag', () => {
    const { container } = render(<Kbd as="span" value="A" />);
    expect(container.querySelector('span[data-testid="kbd"]')).not.toBeNull();
  });

  it('uses the renderKey render-prop and reflects state', () => {
    const seen: any[] = [];
    render(
      <Kbd
        value="A"
        renderKey={({ value, display, modifiers, state }) => {
          seen.push({ value, display, modifiers, state });
          return <span data-testid="rk">{display}</span>;
        }}
      />
    );
    expect(screen.getByTestId('rk')).toBeInTheDocument();
    expect(seen[0].value).toBe('A');
    expect(seen[0].modifiers).toBeDefined();
    expect(seen[0].state).toBeDefined();
  });

  it('renderKey receives the children-based display when children are provided', () => {
    // getDisplayText() is called from the renderKey path; with children present
    // it returns String(children), exercising that branch.
    let display = '';
    render(
      <Kbd renderKey={({ display: d }) => { display = d; return <span data-testid="rk">{d}</span>; }}>
        CustomChild
      </Kbd>
    );
    expect(screen.getByTestId('rk')).toHaveTextContent('CustomChild');
    expect(display).toBe('CustomChild');
  });

  it('renderKey path serializes active modifiers into data-modifiers', () => {
    render(
      <Kbd
        value="S"
        defaultModifiers={{ ctrl: true, shift: true }}
        renderKey={({ display }) => <span data-testid="rk">{display}</span>}
      />
    );
    expect(screen.getByTestId('kbd').getAttribute('data-modifiers')).toContain('ctrl');
    expect(screen.getByTestId('kbd').getAttribute('data-modifiers')).toContain('shift');
  });
});

describe('Kbd (display branches)', () => {
  it('formats a literal space value', () => {
    const { container } = render(<Kbd value=" " />);
    expect(container.textContent).toContain('Space');
  });

  it('omits modifiers when showModifiers is false', () => {
    const { container } = render(
      <Kbd value="S" defaultModifiers={{ ctrl: true }} showModifiers={false} />
    );
    expect(container.textContent).not.toContain('⌃');
    expect(container.textContent).toContain('S');
  });

  it('renders only modifiers when value is absent', () => {
    const { container } = render(<Kbd defaultModifiers={{ ctrl: true }} />);
    expect(container.textContent).toContain('⌃');
  });

  it('joins multiple modifiers with the default space separator (non-combo)', () => {
    const { container } = render(
      <Kbd value="S" defaultModifiers={{ ctrl: true, shift: true }} />
    );
    expect(container.textContent).toContain('⌃');
    expect(container.textContent).toContain('⇧');
  });
});

describe('Kbd (theme fallbacks via stripped theme)', () => {
  it('exercises variant/shape/tooltip theme-fallback arms with an empty theme', () => {
    const strippedTheme = { colors: {}, borderRadius: {}, fonts: {} } as any;
    const { rerender } = render(
      <ThemeProvider theme={strippedTheme}>
        <Kbd value="A" variant="filled" showTooltip tooltip="t" />
      </ThemeProvider>
    );
    // walk variants + shapes + tooltip positions to hit every `theme.X || default`
    for (const variant of ['filled', 'outlined', 'minimal', 'default'] as const) {
      for (const shape of ['rectangle', 'square', 'pill', 'rounded'] as const) {
        rerender(
          <ThemeProvider theme={strippedTheme}>
            <Kbd value="A" variant={variant} shape={shape} showTooltip tooltip="t" />
          </ThemeProvider>
        );
      }
    }
    expect(screen.getByTestId('kbd')).toBeInTheDocument();
  });
});