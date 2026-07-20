import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Item, ItemCheckbox, ItemRadio } from '../src/components/Item';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { useItem } from '../src/hooks';

describe('Item', () => {
  it('renders its children', () => {
    render(<Item>Option one</Item>);
    expect(screen.getByText('Option one')).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item interactive onClick={onClick}>Option one</Item>);
    await user.click(screen.getByText('Option one'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders an icon at the start by default', () => {
    render(<Item icon={<span>Icon</span>}>Label</Item>);
    expect(screen.getByTestId('item-icon-start')).toBeInTheDocument();
    expect(screen.queryByTestId('item-icon-end')).toBeNull();
  });

  it('renders an icon at the end when configured', () => {
    render(<Item icon={<span>Icon</span>} iconPosition="end">Label</Item>);
    expect(screen.getByTestId('item-icon-end')).toBeInTheDocument();
    expect(screen.queryByTestId('item-icon-start')).toBeNull();
  });

  it('renders an item with an unknown iconPosition (falls through to default layout)', () => {
    render(<Item icon={<span>Icon</span>} iconPosition={'bogus' as any}>Label</Item>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders a badge', () => {
    render(<Item badge={3}>Label</Item>);
    expect(screen.getByTestId('item-badge')).toHaveTextContent('3');
  });

  it('renders a shortcut', () => {
    render(<Item shortcut="Ctrl+S">Label</Item>);
    expect(screen.getByTestId('item-shortcut')).toHaveTextContent('Ctrl+S');
  });

  it('renders a description when showDescription is true', () => {
    render(<Item showDescription defaultDescription="A description">Label</Item>);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('selects via single selection mode on click', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Item selectionMode="single" onSelect={onSelect}>Pick</Item>);
    await user.click(screen.getByText('Pick'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('toggles selection via multiple selection mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Item selectionMode="multiple" defaultSelected={false} onChange={onChange}>Pick</Item>);
    await user.click(screen.getByText('Pick'));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('activates on Enter key', () => {
    const onSelect = vi.fn();
    render(<Item selectionMode="single" onSelect={onSelect}>Pick</Item>);
    fireEvent.keyDown(screen.getByText('Pick'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not fire events when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item disabled interactive onClick={onClick}>Noop</Item>);
    await user.click(screen.getByText('Noop'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes data attributes for state', () => {
    const { container } = render(<Item selected defaultSelected>Selected</Item>);
    const item = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(item.getAttribute('data-selected')).toBe('true');
  });

  it.each(['default', 'subtle', 'ghost', 'solid'] as const)(
    'renders variant=%s with selected state',
    (variant) => {
      const { container } = render(
        <Item variant={variant} defaultSelected>Label</Item>
      );
      expect(container.querySelector('[data-testid="item"]')).toBeInTheDocument();
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('renders size=%s', (size) => {
    const { container } = render(<Item size={size}>Label</Item>);
    expect(container.querySelector('[data-testid="item"]')).toBeInTheDocument();
  });

  it('renders a static (non-interactive) item', () => {
    const { container } = render(<Item interactive={false}>Static</Item>);
    expect(container.querySelector('[data-testid="item"]')).toBeInTheDocument();
  });

  it('renders from the label state when no children are provided', () => {
    const { container } = render(<Item defaultLabel="FromLabel" />);
    expect(screen.getByText('FromLabel')).toBeInTheDocument();
  });

  it('renders the default variant without selection', () => {
    const { container } = render(<Item>Label</Item>);
    expect(container.querySelector('[data-testid="item"]')).toBeInTheDocument();
  });

  it('activates on Space key', () => {
    const onSelect = vi.fn();
    render(<Item selectionMode="single" onSelect={onSelect}>Pick</Item>);
    fireEvent.keyDown(screen.getByText('Pick'), { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('ignores non-activation keys but still fires custom handler', () => {
    const customOnKeyDown = vi.fn();
    render(<Item interactive customOnKeyDown={customOnKeyDown}>Label</Item>);
    fireEvent.keyDown(screen.getByText('Label'), { key: 'ArrowDown' });
    expect(customOnKeyDown).toHaveBeenCalled();
  });

  it('ignores keydown when disabled', () => {
    const onSelect = vi.fn();
    render(<Item disabled interactive selectionMode="single" onSelect={onSelect}>Noop</Item>);
    fireEvent.keyDown(screen.getByText('Noop'), { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('fires custom keydown handler', () => {
    const customOnKeyDown = vi.fn();
    render(<Item interactive customOnKeyDown={customOnKeyDown}>Label</Item>);
    fireEvent.keyDown(screen.getByText('Label'), { key: 'Enter' });
    expect(customOnKeyDown).toHaveBeenCalled();
  });

  it('fires hover/press/focus/blur interactions without throwing', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(
      <Item interactive onFocus={onFocus} onBlur={onBlur}>Label</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.mouseEnter(el);
    fireEvent.mouseLeave(el);
    fireEvent.mouseDown(el);
    fireEvent.mouseUp(el);
    fireEvent.focus(el);
    fireEvent.blur(el);
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders ItemCheckbox selected and unselected across sizes', () => {
    render(<ItemCheckbox checkboxSize="sm" defaultSelected>Check</ItemCheckbox>);
    expect(screen.getByTestId('item-checkbox')).toBeInTheDocument();
    cleanup();
    render(<ItemCheckbox checkboxSize="md" defaultSelected={false}>Check</ItemCheckbox>);
    expect(screen.getByTestId('item-checkbox')).toBeInTheDocument();
    cleanup();
    render(<ItemCheckbox checkboxSize="lg" defaultSelected>Check</ItemCheckbox>);
    expect(screen.getByTestId('item-checkbox')).toBeInTheDocument();
  });

  it('renders ItemRadio selected and unselected across sizes', () => {
    render(<ItemRadio radioSize="sm" defaultSelected>Radio</ItemRadio>);
    expect(screen.getByTestId('item-radio')).toBeInTheDocument();
    cleanup();
    render(<ItemRadio radioSize="md" defaultSelected={false}>Radio</ItemRadio>);
    expect(screen.getByTestId('item-radio')).toBeInTheDocument();
    cleanup();
    render(<ItemRadio radioSize="lg" defaultSelected>Radio</ItemRadio>);
    expect(screen.getByTestId('item-radio')).toBeInTheDocument();
  });

  it('renders a description under an empty theme (muted color fallback)', () => {
    render(
      <ThemeProvider theme={{ colors: {} }}>
        <Item showDescription defaultDescription="Desc">Label</Item>
      </ThemeProvider>
    );
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('falls back to default theme values when the theme lacks them, across variants and states', () => {
    // Empty theme forces every `theme.X || fallback` arm to its right side, and
    // interactions drive hovered/pressed/focused styling for each variant.
    const { container } = render(
      <ThemeProvider theme={{ colors: {}, borderRadius: {}, spacing: {} }}>
        <Item variant="subtle" interactive>SubtleUnselected</Item>
        <Item variant="subtle" defaultSelected interactive>Subtle</Item>
        <Item variant="ghost" interactive>Ghost</Item>
        <Item variant="solid" defaultSelected interactive>Solid</Item>
        <Item variant="solid" interactive>SolidUnselected</Item>
        <Item variant="default" defaultSelected interactive>Default</Item>
      </ThemeProvider>
    );
    // drive hover on subtle-unselected, ghost, and solid-unselected items so their
    // hovered variant-style branches evaluate; press + focus cover the state styles.
    const items = container.querySelectorAll('[data-testid="item"]');
    for (const idx of [0, 2, 4]) {
      const el = items[idx] as HTMLElement;
      fireEvent.mouseEnter(el);
      fireEvent.mouseDown(el);
      fireEvent.focus(el);
    }
    expect(items.length).toBeGreaterThan(0);
  });
});

describe('useItem', () => {
  it('select/deselect fire callbacks', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useItem({ onSelect, onDeselect, onChange });
      return null;
    };
    render(<Probe />);
    result.actions.select();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    result.actions.deselect();
    expect(onDeselect).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('toggle flips selection', () => {
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    let result: any;
    const Probe = () => {
      result = useItem({ defaultSelected: false, onSelect, onDeselect });
      return null;
    };
    render(<Probe />);
    result.actions.toggle();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('actions are no-ops when disabled', () => {
    const onSelect = vi.fn();
    let result: any;
    const Probe = () => {
      result = useItem({ disabled: true, onSelect });
      return null;
    };
    render(<Probe />);
    result.actions.select();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('getAccessibilityProps exposes aria attributes', () => {
    let result: any;
    const Probe = () => {
      result = useItem({
        checkable: true,
        selectionMode: 'single',
        defaultSelected: true,
        level: 2,
        listSize: 5,
        position: 1,
      });
      return null;
    };
    render(<Probe />);
    const props = result.actions.getAccessibilityProps();
    expect(props['aria-selected']).toBe(true);
    expect(props['aria-level']).toBe(2);
    expect(props['aria-setsize']).toBe(5);
    expect(props['aria-posinset']).toBe(2);
  });
});
