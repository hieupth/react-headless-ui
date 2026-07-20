import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sidebar,
  SidebarItem,
  SidebarGroup,
  SidebarDivider,
} from '../src/components/Sidebar';

// sidebar.test.tsx + sidebar.deep.test.tsx cover the hook and the core
// Sidebar (collapse toggle, header/footer, trigger element). These tests
// cover the companion subcomponents (SidebarItem/Group/Divider) and the
// renderer branches they miss: position/size variants, overlay content,
// custom trigger cloning, and disabled/active item states.

describe('SidebarItem', () => {
  it('renders children and applies the inactive classes by default', () => {
    const { container } = render(<SidebarItem>Home</SidebarItem>);
    const item = container.querySelector('[data-testid="sidebar-item"]') as HTMLElement;
    expect(item).not.toBeNull();
    expect(item.className).toContain('cursor-pointer');
    expect(item.className).not.toContain('opacity-50');
    expect(item.getAttribute('aria-disabled')).toBe('false');
  });

  it('applies the active classes when active', () => {
    const { container } = render(<SidebarItem active>Dashboard</SidebarItem>);
    const item = container.querySelector('[data-testid="sidebar-item"]') as HTMLElement;
    expect(item.className).toContain('bg-blue-100');
    expect(item.className).toContain('font-medium');
  });

  it('renders the leading icon when provided', () => {
    render(<SidebarItem icon={<span data-testid="ico">I</span>}>With icon</SidebarItem>);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SidebarItem onClick={onClick}>Click me</SidebarItem>);
    await user.click(screen.getByTestId('sidebar-item'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick and marks aria-disabled when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarItem disabled onClick={onClick}>
        No click
      </SidebarItem>
    );
    const item = screen.getByTestId('sidebar-item');
    expect(item.className).toContain('opacity-50');
    expect(item.className).toContain('cursor-not-allowed');
    expect(item.getAttribute('aria-disabled')).toBe('true');
    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards className and style overrides', () => {
    const { container } = render(
      <SidebarItem className="extra" style={{ color: 'rgb(255, 0, 0)' }}>
        Styled
      </SidebarItem>
    );
    const item = container.querySelector('[data-testid="sidebar-item"]') as HTMLElement;
    expect(item.className).toContain('extra');
    expect(item.style.color).toBe('rgb(255, 0, 0)');
  });
});

describe('SidebarGroup', () => {
  it('renders a label when provided', () => {
    const { container } = render(
      <SidebarGroup label="Section">
        <SidebarItem>A</SidebarItem>
      </SidebarGroup>
    );
    expect(container.querySelector('[data-testid="sidebar-group"]')).not.toBeNull();
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('omits the label container when no label is given', () => {
    const { container } = render(
      <SidebarGroup>
        <SidebarItem>A</SidebarItem>
      </SidebarGroup>
    );
    expect(container.querySelector('.sidebar-group-label')).toBeNull();
    expect(container.querySelector('[data-testid="sidebar-group"]')).not.toBeNull();
  });

  it('renders multiple children inside the items container', () => {
    render(
      <SidebarGroup label="Nav">
        <SidebarItem>One</SidebarItem>
        <SidebarItem>Two</SidebarItem>
      </SidebarGroup>
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('forwards className and style overrides', () => {
    const { container } = render(
      <SidebarGroup className="grp" style={{ padding: '2px' }}>
        <span>x</span>
      </SidebarGroup>
    );
    const grp = container.querySelector('[data-testid="sidebar-group"]') as HTMLElement;
    expect(grp.className).toContain('grp');
    expect(grp.style.padding).toBe('2px');
  });
});

describe('SidebarDivider', () => {
  it('renders a separator with horizontal orientation', () => {
    const { container } = render(<SidebarDivider />);
    const sep = container.querySelector('[data-testid="sidebar-divider"]') as HTMLElement;
    expect(sep).not.toBeNull();
    expect(sep.getAttribute('role')).toBe('separator');
    expect(sep.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('forwards className and style overrides', () => {
    const { container } = render(<SidebarDivider className="div" style={{ margin: '4px' }} />);
    const sep = container.querySelector('[data-testid="sidebar-divider"]') as HTMLElement;
    expect(sep.className).toContain('div');
    expect(sep.style.margin).toBe('4px');
  });
});

describe('Sidebar renderer (extra branches)', () => {
  it('clones a custom element trigger with toggle + aria props', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar variant="temporary" trigger={<button>Open</button>}>
        <span>Body</span>
      </Sidebar>
    );
    const trigger = screen.getByText('Open').closest('button')!;
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-label', 'Close sidebar');
  });

  it('renders a default trigger button with the hamburger icon when trigger is truthy non-element', () => {
    // When `trigger` is not a valid element, the renderer falls back to its
    // built-in button. Pass a string to hit that branch.
    render(
      <Sidebar variant="temporary" trigger={'show'}>
        <span>Body</span>
      </Sidebar>
    );
    const btn = screen.getByLabelText('Open sidebar');
    expect(btn.tagName).toBe('BUTTON');
  });

  it('renders the overlay content for a temporary sidebar when open', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar
        variant="temporary"
        trigger={<button>Menu</button>}
        overlay={<span data-testid="ovl">OverlayContent</span>}
      >
        <span>Body</span>
      </Sidebar>
    );
    await user.click(screen.getByText('Menu'));
    expect(screen.getByTestId('ovl')).toBeInTheDocument();
  });

  it('places the sidebar on the right and exposes the data-position attribute', () => {
    render(
      <Sidebar position="right">
        <span>x</span>
      </Sidebar>
    );
    const aside = screen.getByTestId('sidebar');
    expect(aside).toHaveAttribute('data-position', 'right');
  });

  it('exposes size variants via the data-size attribute', () => {
    const { rerender } = render(
      <Sidebar size="sm">
        <span>x</span>
      </Sidebar>
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-size', 'sm');
    rerender(<Sidebar size="lg"><span>x</span></Sidebar>);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-size', 'lg');
    rerender(<Sidebar size="xl"><span>x</span></Sidebar>);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-size', 'xl');
  });

  it('temporary variant does not render the collapse toggle button', () => {
    render(
      <Sidebar variant="temporary">
        <span>x</span>
      </Sidebar>
    );
    expect(screen.queryByLabelText('Collapse sidebar')).toBeNull();
    expect(screen.queryByLabelText('Expand sidebar')).toBeNull();
  });

  it('applies custom className and style on the aside element', () => {
    render(
      <Sidebar className="side-custom" style={{ color: 'rgb(0, 0, 1)' }}>
        <span>x</span>
      </Sidebar>
    );
    const aside = screen.getByTestId('sidebar');
    expect(aside.className).toContain('side-custom');
    expect(aside.style.color).toBe('rgb(0, 0, 1)');
  });

  it('disabled trigger button cannot open the sidebar', async () => {
    render(
      <Sidebar variant="temporary" disabled trigger={'menu'}>
        <span>x</span>
      </Sidebar>
    );
    const btn = screen.getByLabelText('Open sidebar');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    // disabled buttons do not fire the click handler -> stays closed
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'closed');
  });
});
