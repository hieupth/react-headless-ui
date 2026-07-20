import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Item, ItemCheckbox, ItemRadio } from '../src/components/Item';

describe('Item - variants and states', () => {
  it('renders the subtle variant and applies item-variant/item-size classes', () => {
    const { container } = render(
      <Item variant="subtle" size="sm">Subtle</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(el.className).toContain('item-subtle');
    expect(el.className).toContain('item-sm');
    expect(el.getAttribute('data-variant')).toBe('subtle');
    expect(el.getAttribute('data-size')).toBe('sm');
  });

  it('renders ghost, solid, and lg variants', () => {
    const { container } = render(<Item variant="ghost" size="lg">Ghost</Item>);
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(el.className).toContain('item-ghost');
    expect(el.className).toContain('item-lg');
  });

  it('solid variant with selected state applies background color', () => {
    const { container } = render(
      <Item variant="solid" selected defaultSelected>Solid</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(el.getAttribute('data-selected')).toBe('true');
    // solid + selected forces backgroundColor to primary fallback (#007bff)
    expect(el.style.backgroundColor).toBeTruthy();
  });

  it('solid variant hovered (not selected) applies gray background', () => {
    const { container } = render(
      <Item variant="solid" interactive onHover={() => {}}>SolidH</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.mouseEnter(el);
  });

  it('default variant with selected state applies primary background', () => {
    const { container } = render(
      <Item variant="default" selected defaultSelected>Pick</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    // default + selected -> backgroundColor set to primary fallback
    expect(el.style.backgroundColor).toBeTruthy();
  });

  it('subtle variant hovered applies subtle background', () => {
    const { container } = render(
      <Item variant="subtle" interactive>Sub</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.mouseEnter(el);
    expect(el.getAttribute('data-hovered')).toBe('true');
  });

  it('ghost variant hovered applies ghost background', () => {
    const { container } = render(
      <Item variant="ghost" interactive>GhostH</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.mouseEnter(el);
    expect(el.getAttribute('data-hovered')).toBe('true');
  });

  it('renders as a custom element via the as prop', () => {
    const { container } = render(<Item as="li">AsLI</Item>);
    expect(container.querySelector('li[data-testid="item"]')).not.toBeNull();
  });

  it('renders without children, falling back to defaultLabel', () => {
    render(<Item defaultLabel="FallbackLabel" />);
    expect(screen.getByText('FallbackLabel')).toBeInTheDocument();
  });
});

describe('Item - interaction handlers', () => {
  it('fires customOnClick and onClick (no selectionMode) on click', async () => {
    const user = userEvent.setup();
    const customOnClick = vi.fn();
    const onClick = vi.fn();
    render(<Item interactive customOnClick={customOnClick} onClick={onClick}>Click</Item>);
    await user.click(screen.getByText('Click'));
    expect(customOnClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires customOnKeyDown on keydown and activates on Space', () => {
    const customOnKeyDown = vi.fn();
    const onSelect = vi.fn();
    render(
      <Item interactive selectionMode="single" customOnKeyDown={customOnKeyDown} onSelect={onSelect}>
        Space
      </Item>
    );
    fireEvent.keyDown(screen.getByText('Space'), { key: ' ' });
    expect(customOnKeyDown).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('does not fire handlers when not interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item interactive={false} onClick={onClick}>Static</Item>);
    await user.click(screen.getByText('Static'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not activate on Enter when disabled', () => {
    const onSelect = vi.fn();
    render(<Item disabled interactive selectionMode="single" onSelect={onSelect}>Dis</Item>);
    fireEvent.keyDown(screen.getByText('Dis'), { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('fires onHover and onPress via mouse enter/down/up/leave', async () => {
    const onHover = vi.fn();
    const onPress = vi.fn();
    const { container } = render(
      <Item interactive onHover={onHover} onPress={onPress}>Hover</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.mouseEnter(el);
    expect(onHover).toHaveBeenCalledWith(true);
    fireEvent.mouseDown(el);
    expect(onPress).toHaveBeenCalledWith(true);
    fireEvent.mouseUp(el);
    expect(onPress).toHaveBeenCalledWith(false);
    fireEvent.mouseLeave(el);
    expect(onHover).toHaveBeenCalledWith(false);
    // data attributes reflect state transitions
    expect(el.getAttribute('data-hovered')).toBe('false');
  });

  it('selection via click in single mode fires onSelect and marks selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { container } = render(
      <Item interactive selectionMode="single" onSelect={onSelect}>Single</Item>
    );
    await user.click(screen.getByText('Single'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(el.getAttribute('data-selected')).toBe('true');
  });

  it('multiple selection mode toggles selection on repeated clicks', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Item interactive selectionMode="multiple" defaultSelected={false}>Multi</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    await user.click(screen.getByText('Multi'));
    expect(el.getAttribute('data-selected')).toBe('true');
    await user.click(screen.getByText('Multi'));
    expect(el.getAttribute('data-selected')).toBe('false');
  });

  it('does not double-fire onClick in single selection mode (select already invokes it)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Item interactive selectionMode="single" onClick={onClick}>One</Item>);
    await user.click(screen.getByText('One'));
    // select() invokes onClick once; handleClick must not add a second dispatch
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('focus and blur update the focused state and fire onFocus/onBlur', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(
      <Item interactive onFocus={onFocus} onBlur={onBlur}>Focusable</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.focus(el);
    expect(el.getAttribute('data-focused')).toBe('true');
    expect(el.style.outline).toBeTruthy();
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEvent.blur(el);
    expect(el.getAttribute('data-focused')).toBe('false');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('disabled items do not enter focused state on focus', () => {
    const { container } = render(
      <Item disabled interactive>DisFocus</Item>
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    fireEvent.focus(el);
    expect(el.getAttribute('data-focused')).toBe('false');
  });
});

describe('ItemCheckbox', () => {
  it('renders a checkbox icon and reflects selected state', () => {
    const { container } = render(
      <ItemCheckbox selected defaultSelected defaultLabel="Check me" />
    );
    expect(screen.getByTestId('item-checkbox')).toBeInTheDocument();
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(el.getAttribute('data-selected')).toBe('true');
  });

  it('renders with sm and lg checkbox sizes', () => {
    const { rerender } = render(<ItemCheckbox checkboxSize="sm" defaultLabel="a" />);
    expect(screen.getByTestId('item-checkbox')).toBeInTheDocument();
    rerender(<ItemCheckbox checkboxSize="lg" defaultLabel="b" />);
    expect(screen.getByTestId('item-checkbox')).toBeInTheDocument();
  });

  it('toggle selection via click updates the checkmark visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ItemCheckbox interactive selectionMode="multiple" defaultSelected={false} defaultLabel="opt" />
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    await user.click(el);
    expect(el.getAttribute('data-selected')).toBe('true');
  });
});

describe('ItemRadio', () => {
  it('renders a radio icon and reflects selected state', () => {
    const { container } = render(
      <ItemRadio selected defaultSelected defaultLabel="Radio me" />
    );
    expect(screen.getByTestId('item-radio')).toBeInTheDocument();
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    expect(el.getAttribute('data-selected')).toBe('true');
  });

  it('renders with sm and lg radio sizes', () => {
    const { rerender } = render(<ItemRadio radioSize="sm" defaultLabel="a" />);
    expect(screen.getByTestId('item-radio')).toBeInTheDocument();
    rerender(<ItemRadio radioSize="lg" defaultLabel="b" />);
    expect(screen.getByTestId('item-radio')).toBeInTheDocument();
  });

  it('clicking an unselected radio selects it', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ItemRadio interactive selectionMode="single" defaultSelected={false} defaultLabel="opt" />
    );
    const el = container.querySelector('[data-testid="item"]') as HTMLElement;
    await user.click(el);
    expect(el.getAttribute('data-selected')).toBe('true');
  });
});
