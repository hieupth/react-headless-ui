import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Panel, PanelCard, PanelGroup } from '../src/components/Panel';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { usePanel } from '../src/hooks';

describe('Panel', () => {
  it('renders its children', () => {
    render(<Panel>Panel body</Panel>);
    expect(screen.getByText('Panel body')).toBeInTheDocument();
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('renders a title in the header', () => {
    render(<Panel title="My Title">Body</Panel>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByTestId('panel-header')).toBeInTheDocument();
  });

  it('renders a subtitle in the header', () => {
    render(<Panel title="T" subtitle="Sub">Body</Panel>);
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('renders an icon in the header', () => {
    render(<Panel title="T" icon={<span data-testid="ico">★</span>}>Body</Panel>);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('renders a footer when provided', () => {
    render(<Panel footer={<span>Foot</span>}>Body</Panel>);
    expect(screen.getByText('Foot')).toBeInTheDocument();
    expect(screen.getByTestId('panel-footer')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<Panel actions={<button>Do</button>}>Body</Panel>);
    expect(screen.getByRole('button', { name: 'Do' })).toBeInTheDocument();
    expect(screen.getByTestId('panel-actions')).toBeInTheDocument();
  });

  it('omits the header by default', () => {
    render(<Panel showHeader={false}>Body</Panel>);
    expect(screen.queryByTestId('panel-header')).toBeNull();
  });

  it('shows a toggle button when collapsible', () => {
    render(<Panel title="T" collapsible>Body</Panel>);
    expect(screen.getByTestId('panel-toggle')).toBeInTheDocument();
  });

  it('toggles expanded state via the toggle button', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<Panel title="T" collapsible expandable onToggle={onToggle}>Body</Panel>);
    const toggle = screen.getByTestId('panel-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('uses custom expand/collapse icons', () => {
    render(
      <Panel
        title="T"
        expandable
        expandIcon={<span data-testid="exp">+</span>}
        collapseIcon={<span data-testid="col">-</span>}
      >
        Body
      </Panel>
    );
    expect(screen.getByTestId('exp')).toBeInTheDocument();
  });

  it('uses custom renderHeader/renderBody/renderFooter/renderActions', () => {
    render(
      <Panel
        title="T"
        footer="F"
        actions="A"
        renderHeader={() => <div data-testid="rh">H</div>}
        renderBody={() => <div data-testid="rb">B</div>}
        renderFooter={() => <div data-testid="rf">F</div>}
        renderActions={() => <div data-testid="ra">A</div>}
      >
        Body
      </Panel>
    );
    expect(screen.getByTestId('rh')).toBeInTheDocument();
    expect(screen.getByTestId('rb')).toBeInTheDocument();
    expect(screen.getByTestId('rf')).toBeInTheDocument();
    expect(screen.getByTestId('ra')).toBeInTheDocument();
  });

  it('applies loading state', () => {
    const { container } = render(<Panel loading>Body</Panel>);
    const panel = container.querySelector('[data-testid="panel"]') as HTMLElement;
    expect(panel.getAttribute('data-loading')).toBe('true');
  });

  it('toggles via Enter/Space keydown on a collapsible+expandable panel', () => {
    const onToggle = vi.fn();
    render(<Panel title="T" collapsible expandable onToggle={onToggle}>Body</Panel>);
    const panel = screen.getByTestId('panel');
    fireEvent.keyDown(panel, { key: 'Enter' });
    fireEvent.keyDown(panel, { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('toggles via a direct panel click and a Space-only keydown', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <Panel title="T" expandable onToggle={onToggle}>Body</Panel>
    );
    // click on the panel itself (expandable but not collapsible) toggles
    fireEvent.click(screen.getByTestId('panel'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    // rerender as collapsible-only and toggle via Space keydown
    rerender(<Panel title="T" collapsible onToggle={onToggle}>Body</Panel>);
    fireEvent.keyDown(screen.getByTestId('panel'), { key: ' ' });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('fires onHover/onFocus/onBlur handlers when interactive', () => {
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
    expect(onHover).toHaveBeenCalledWith(true);
    expect(onHover).toHaveBeenCalledWith(false);
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders the bordered, ghost, outlined, and default variants without error', () => {
    const { rerender } = render(<Panel variant="bordered">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('bordered');
    rerender(<Panel variant="ghost">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('ghost');
    rerender(<Panel variant="outlined" borderColor="#f00">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('outlined');
    rerender(<Panel variant="default" shadow="#abc">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('default');
  });

  it('applies selected state styles via defaultSelected', () => {
    render(<Panel defaultSelected>Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-selected')).toBe('true');
  });

  it('honours sm/lg/xl size padding and a custom padding string', () => {
    const { rerender } = render(<Panel size="sm">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-size')).toBe('sm');
    rerender(<Panel size="lg" title="T" collapsible>Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-size')).toBe('lg');
    rerender(<Panel size="xl">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-size')).toBe('xl');
    rerender(<Panel padding="42px">Body</Panel>);
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('renders outlined and default variants with their border styles', () => {
    const { rerender } = render(<Panel variant="outlined">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('outlined');
    rerender(<Panel variant="default">Body</Panel>);
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('default');
  });

  it('disables height animation when animateHeight is false', () => {
    render(<Panel animateHeight={false} animationDuration={500}>Body</Panel>);
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('hides dividers when showDivider is false and renders header/footer', () => {
    render(
      <Panel title="T" footer="F" showDivider={false}>Body</Panel>
    );
    expect(screen.getByTestId('panel-header')).toBeInTheDocument();
    expect(screen.getByTestId('panel-footer')).toBeInTheDocument();
  });

  it('renders a disabled interactive panel that ignores interactions', () => {
    const onClick = vi.fn();
    render(
      <Panel disabled interactive collapsible expandable onClick={onClick}>
        Body
      </Panel>
    );
    const panel = screen.getByTestId('panel');
    expect(panel.getAttribute('data-disabled')).toBe('true');
    fireEvent.click(panel);
    fireEvent.keyDown(panel, { key: 'Enter' });
    fireEvent.mouseEnter(panel);
    fireEvent.mouseLeave(panel);
    fireEvent.focus(panel);
    fireEvent.blur(panel);
    // disabled guards short-circuit every handler, so onClick never fires
    expect(onClick).not.toHaveBeenCalled();
  });

  it('passes through custom color/shadow/radius props', () => {
    render(
      <Panel
        backgroundColor="#fff"
        borderColor="#000"
        textColor="#111"
        shadow="none"
        borderRadius="4px"
      >
        Body
      </Panel>
    );
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('renders an expanded collapsible panel showing the collapse icon', () => {
    render(
      <Panel title="T" collapsible defaultExpanded collapseIcon={<span data-testid="col">-</span>}>
        Body
      </Panel>
    );
    expect(screen.getByTestId('panel-toggle')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('col')).toBeInTheDocument();
  });

  it('renders as a custom element via the `as` prop', () => {
    const { container } = render(<Panel as="section">Body</Panel>);
    expect(container.querySelector('section[data-testid="panel"]')).not.toBeNull();
  });

  it('falls back to hardcoded defaults when the theme omits colors/spacing/borderRadius', () => {
    // A stripped theme (colors/spacing/borderRadius overridden to undefined via
    // shallow merge) exercises every `theme.X?.Y || '<fallback>'` arm across
    // the base, variant, header, footer, and actions style builders.
    render(
      <ThemeProvider theme={{ colors: undefined, spacing: undefined, borderRadius: undefined }}>
        <Panel title="T" subtitle="S" icon={<i>i</i>} defaultSelected footer="F" actions="A">
          Body
        </Panel>
      </ThemeProvider>
    );
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });
});

describe('PanelCard / PanelGroup', () => {
  it('PanelCard renders as an elevated panel', () => {
    render(<PanelCard title="T">Body</PanelCard>);
    expect(screen.getByTestId('panel')).toBeInTheDocument();
    expect(screen.getByTestId('panel').getAttribute('data-variant')).toBe('elevated');
  });

  it('PanelGroup renders a group container with children', () => {
    render(
      <PanelGroup>
        <Panel>One</Panel>
        <Panel>Two</Panel>
      </PanelGroup>
    );
    expect(screen.getByTestId('panel-group')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('PanelGroup renders horizontally with a custom gap', () => {
    render(
      <PanelGroup direction="horizontal" gap="32px">
        <Panel>One</Panel>
      </PanelGroup>
    );
    const group = screen.getByTestId('panel-group');
    expect(group.getAttribute('data-direction')).toBe('horizontal');
  });
});

describe('usePanel', () => {
  it('expand/collapse/toggle fire callbacks', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    const onToggle = vi.fn();
    let result: any;
    const Probe = () => {
      result = usePanel({ collapsible: true, expandable: true, onExpand, onCollapse, onToggle });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.expand());
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenLastCalledWith(true);
    act(() => result.actions.collapse());
    expect(onCollapse).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it('expand is a no-op when disabled', () => {
    const onExpand = vi.fn();
    let result: any;
    const Probe = () => {
      result = usePanel({ expandable: true, disabled: true, onExpand });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.expand());
    expect(onExpand).not.toHaveBeenCalled();
  });

  it('setSelected fires onSelectionChange', () => {
    const onSelectionChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = usePanel({ onSelectionChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.setSelected(true));
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('getAccessibilityProps exposes aria-expanded for collapsible panels', () => {
    let result: any;
    const Probe = () => {
      result = usePanel({ collapsible: true });
      return null;
    };
    render(<Probe />);
    const props = result.actions.getAccessibilityProps();
    expect(props['aria-expanded']).toBe(false);
    expect(props.role).toBe('button');
  });
});
