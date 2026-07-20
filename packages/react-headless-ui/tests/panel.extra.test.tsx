import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Panel, PanelCard, PanelGroup } from '../src/components/Panel';

// Coverage extension for Panel.tsx — exercises handlers, variants, sizes,
// state styling, dividers, custom styling props, and the `as` polymorphism
// that the base panel.test.tsx does not reach.

describe('Panel — interaction handlers', () => {
  it('click on an interactive expandable panel toggles and fires onClick', () => {
    const onClick = vi.fn();
    const onToggle = vi.fn();
    render(
      <Panel expandable interactive onClick={onClick} onToggle={onToggle}>
        Body
      </Panel>
    );
    // Click the panel element (the root div carries onClick via handleClick).
    // When not expanded, toggle routes to expand() which fires onToggle(true).
    fireEvent.click(screen.getByTestId('panel'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('Enter and Space keys toggle the panel and fire onClick', () => {
    const onClick = vi.fn();
    const onToggle = vi.fn();
    render(
      <Panel expandable interactive onClick={onClick} onToggle={onToggle}>
        Body
      </Panel>
    );
    const panel = screen.getByTestId('panel');
    fireEvent.keyDown(panel, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true);
    fireEvent.keyDown(panel, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('disabled panel ignores click and keyboard handlers', () => {
    const onClick = vi.fn();
    const onToggle = vi.fn();
    render(
      <Panel disabled collapsible interactive onClick={onClick} onToggle={onToggle}>
        Body
      </Panel>
    );
    const panel = screen.getByTestId('panel');
    fireEvent.click(panel);
    fireEvent.keyDown(panel, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('hover/focus/blur fire onHover/onFocus/onBlur when interactive', () => {
    const onHover = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <Panel interactive onHover={onHover} onFocus={onFocus} onBlur={onBlur}>
        Body
      </Panel>
    );
    const panel = screen.getByTestId('panel');
    fireEvent.mouseEnter(panel);
    fireEvent.mouseLeave(panel);
    fireEvent.focus(panel);
    fireEvent.blur(panel);
    expect(onHover).toHaveBeenNthCalledWith(1, true);
    expect(onHover).toHaveBeenNthCalledWith(2, false);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('disabled panel does not fire hover/focus/blur callbacks', () => {
    const onHover = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <Panel disabled interactive onHover={onHover} onFocus={onFocus} onBlur={onBlur}>
        Body
      </Panel>
    );
    const panel = screen.getByTestId('panel');
    fireEvent.mouseEnter(panel);
    fireEvent.focus(panel);
    fireEvent.blur(panel);
    expect(onHover).not.toHaveBeenCalled();
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it('click on a non-collapsible, non-expandable panel still fires onClick', () => {
    const onClick = vi.fn();
    const onToggle = vi.fn();
    render(
      <Panel interactive onClick={onClick} onToggle={onToggle}>
        Body
      </Panel>
    );
    fireEvent.click(screen.getByTestId('panel'));
    expect(onClick).toHaveBeenCalledTimes(1);
    // toggle only fires for collapsible/expandable
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe('Panel — variants and sizes', () => {
  it('renders all variants with distinct data-variant', () => {
    const variants = ['default', 'bordered', 'elevated', 'outlined', 'ghost'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Panel variant={variant}>Body</Panel>);
      expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe(variant);
      unmount();
    }
  });

  it('renders all sizes with distinct data-size', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Panel size={size}>Body</Panel>);
      expect(screen.getByTestId('panel').getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('applies a custom padding override', () => {
    render(<Panel padding="40px">Body</Panel>);
    const panel = screen.getByTestId('panel');
    expect((panel.style as any).padding).toBe('40px');
  });
});

describe('Panel — selected / highlighted state styling', () => {
  it('selected panel applies selected styling and is reflected on the dataset', () => {
    render(<Panel selected>Body</Panel>);
    const panel = screen.getByTestId('panel');
    expect(panel.getAttribute('data-selected')).toBe('true');
    // selected path sets a primary-tinted background + border + text colour.
    expect(panel.style.backgroundColor).toBeTruthy();
    expect(panel.style.borderColor).toBeTruthy();
    expect(panel.style.color).toBeTruthy();
  });

  // Note: `highlighted` is internal hook state with no public prop on <Panel>,
  // so the stateStyles.highlighted boxShadow branch (Panel.tsx ~L240) cannot be
  // driven through the component's public API and is intentionally left
  // uncovered here.
});

describe('Panel — divider and custom styling props', () => {
  it('showDivider=false collapses header/footer spacing', () => {
    render(
      <Panel title="T" footer="F" showDivider={false}>
        Body
      </Panel>
    );
    const header = screen.getByTestId('panel-header');
    const footer = screen.getByTestId('panel-footer');
    // With showDivider off the header/footer lose their margin/padding/border.
    expect(header.style.marginBottom).toBe('0px');
    expect(header.style.paddingBottom).toBe('0px');
    expect(header.style.borderBottomStyle).toBe('none');
    expect(footer.style.marginTop).toBe('0px');
    expect(footer.style.paddingTop).toBe('0px');
    expect(footer.style.borderTopStyle).toBe('none');
  });

  it('custom color / radius / shadow / text props are applied', () => {
    render(
      <Panel
        backgroundColor="#ff0000"
        borderColor="#00ff00"
        textColor="#0000ff"
        borderRadius="12px"
        shadow="0px 0px 0px #000"
        title="T"
      >
        Body
      </Panel>
    );
    const panel = screen.getByTestId('panel');
    // jsdom normalises hex colours to rgb() on read-back.
    expect(panel.style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(panel.style.borderRadius).toBe('12px');
    expect(panel.style.color).toBe('rgb(0, 0, 255)');
  });

  it('animateHeight=false disables the height transition', () => {
    render(<Panel animateHeight={false}>Body</Panel>);
    const panel = screen.getByTestId('panel');
    // When animateHeight is false the transition falls back to a fast default.
    expect(panel.style.transition).toContain('150ms');
  });

  it('animationDuration is honoured when animating', () => {
    render(<Panel animateHeight animationDuration={350}>Body</Panel>);
    const panel = screen.getByTestId('panel');
    expect(panel.style.transition).toContain('350ms');
  });
});

describe('Panel — polymorphic `as` and footer-less header', () => {
  it('renders as a section element via the `as` prop', () => {
    const { container } = render(<Panel as="section">Body</Panel>);
    expect(container.querySelector('section[data-testid="panel"]')).not.toBeNull();
  });

  it('header with only icon (no title) still renders the header region', () => {
    render(<Panel icon={<span data-testid="ico">i</span>}>Body</Panel>);
    expect(screen.getByTestId('panel-header')).toBeInTheDocument();
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('renderHeader returning null yields no header region', () => {
    render(
      <Panel title="ignored" renderHeader={() => null}>
        Body
      </Panel>
    );
    expect(screen.queryByTestId('panel-header')).toBeNull();
  });

  it('collapseIcon renders once the panel is expanded', async () => {
    const user = userEvent.setup();
    render(
      <Panel
        expandable
        expandIcon={<span data-testid="exp">+</span>}
        collapseIcon={<span data-testid="col">-</span>}
      >
        Body
      </Panel>
    );
    expect(screen.getByTestId('exp')).toBeInTheDocument();
    await user.click(screen.getByTestId('panel-toggle'));
    expect(screen.getByTestId('col')).toBeInTheDocument();
  });
});

describe('PanelCard / PanelGroup — extra coverage', () => {
  it('PanelGroup renders horizontally with a custom gap', () => {
    render(
      <PanelGroup direction="horizontal" gap="32px">
        <Panel>One</Panel>
      </PanelGroup>
    );
    const group = screen.getByTestId('panel-group');
    expect(group.getAttribute('data-direction')).toBe('horizontal');
    expect(group.style.gap).toBe('32px');
    expect(group.style.flexDirection).toBe('row');
  });

  it('PanelGroup passes through custom className and style', () => {
    render(
      <PanelGroup className="my-group" style={{ padding: '4px' }}>
        <Panel>One</Panel>
      </PanelGroup>
    );
    const group = screen.getByTestId('panel-group');
    expect(group.className).toContain('my-group');
    expect(group.style.padding).toBe('4px');
  });

  it('PanelCard forwards children and renders the body', () => {
    render(<PanelCard>Card body</PanelCard>);
    expect(screen.getByText('Card body')).toBeInTheDocument();
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('elevated');
  });

  // Regression: DOM focus/hover must drive state (the panel-focused /
  // panel-hovered classes appear). Before the fix, handlers fired the consumer
  // callbacks but never called actions.focus()/hover(), so state stayed false.
  it('focus/hover drive the panel-focused / panel-hovered classes', () => {
    render(<Panel interactive>Body</Panel>);
    const panel = screen.getByTestId('panel');
    fireEvent.focus(panel);
    expect(panel.className).toContain('panel-focused');
    fireEvent.mouseEnter(panel);
    expect(panel.className).toContain('panel-hovered');
    fireEvent.blur(panel);
    expect(panel.className).not.toContain('panel-focused');
  });
});
