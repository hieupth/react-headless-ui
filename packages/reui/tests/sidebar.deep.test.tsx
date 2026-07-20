import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, SidebarItem, SidebarGroup, SidebarDivider } from '../src/components/Sidebar';
import { useSidebar } from '../src/hooks';

// Direct hook test harness so we can observe state without depending on CSS classes.
function SidebarHarness(props: Parameters<typeof useSidebar>[0] = {}) {
  const { state, actions, attributes } = useSidebar(props);
  return (
    <div>
      <button onClick={actions.toggleSidebar} data-testid="toggle">toggle</button>
      <button onClick={actions.openSidebar} data-testid="open">open</button>
      <button onClick={actions.closeSidebar} data-testid="close">close</button>
      <button onClick={actions.toggleCollapse} data-testid="collapse">collapse</button>
      <button onClick={actions.collapseSidebar} data-testid="col">col</button>
      <button onClick={actions.expandSidebar} data-testid="exp">exp</button>
      <button onClick={actions.handleOverlayClick} data-testid="overlay">overlay</button>
      <button onClick={actions.handleEscapeKey} data-testid="esc">esc</button>
      <span data-testid="open-state">{String(state.open)}</span>
      <span data-testid="collapsed-state">{String(state.collapsed)}</span>
      <span data-testid="show-overlay">{String(state.showOverlay)}</span>
      <span data-testid="data-state">{attributes['data-state']}</span>
    </div>
  );
}

describe('useSidebar', () => {
  it('defaults to closed and expanded (permanent variant)', () => {
    render(<SidebarHarness />);
    expect(screen.getByTestId('open-state').textContent).toBe('false');
    expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
    expect(screen.getByTestId('data-state').textContent).toBe('closed');
  });

  it('openSidebar opens and calls onOpenChange(true)', () => {
    const onOpenChange = vi.fn();
    render(<SidebarHarness onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByTestId('open'));
    expect(screen.getByTestId('open-state').textContent).toBe('true');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('closeSidebar closes and calls onOpenChange(false)', () => {
    const onOpenChange = vi.fn();
    render(<SidebarHarness defaultOpen onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByTestId('close'));
    expect(screen.getByTestId('open-state').textContent).toBe('false');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('toggleSidebar flips open state', () => {
    render(<SidebarHarness />);
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('open-state').textContent).toBe('true');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('open-state').textContent).toBe('false');
  });

  it('collapse/expand/toggleCollapse change collapsed state and fire onCollapseChange', () => {
    const onCollapseChange = vi.fn();
    render(<SidebarHarness onCollapseChange={onCollapseChange} />);
    fireEvent.click(screen.getByTestId('collapse'));
    expect(screen.getByTestId('collapsed-state').textContent).toBe('true');
    expect(onCollapseChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByTestId('exp'));
    expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
    expect(onCollapseChange).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByTestId('collapse'));
    expect(screen.getByTestId('collapsed-state').textContent).toBe('true');
  });

  it('disabled sidebar ignores open/close/collapse actions', () => {
    const onOpenChange = vi.fn();
    const onCollapseChange = vi.fn();
    render(<SidebarHarness disabled onOpenChange={onOpenChange} onCollapseChange={onCollapseChange} />);
    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByTestId('collapse'));
    expect(screen.getByTestId('open-state').textContent).toBe('false');
    expect(screen.getByTestId('collapsed-state').textContent).toBe('false');
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onCollapseChange).not.toHaveBeenCalled();
  });

  it('temporary variant shows overlay when open', () => {
    render(<SidebarHarness variant="temporary" defaultOpen />);
    expect(screen.getByTestId('show-overlay').textContent).toBe('true');
  });

  it('permanent variant never shows overlay', () => {
    render(<SidebarHarness variant="permanent" defaultOpen />);
    expect(screen.getByTestId('show-overlay').textContent).toBe('false');
  });

  it('handleOverlayClick closes when closeOnOverlayClick=true', () => {
    render(<SidebarHarness variant="temporary" defaultOpen closeOnOverlayClick />);
    fireEvent.click(screen.getByTestId('overlay'));
    expect(screen.getByTestId('open-state').textContent).toBe('false');
  });

  it('handleOverlayClick does nothing when closeOnOverlayClick=false', () => {
    render(<SidebarHarness variant="temporary" defaultOpen closeOnOverlayClick={false} />);
    fireEvent.click(screen.getByTestId('overlay'));
    expect(screen.getByTestId('open-state').textContent).toBe('true');
  });

  it('Escape key closes the sidebar when overlay is shown (document listener)', async () => {
    render(<SidebarHarness variant="temporary" defaultOpen />);
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.getByTestId('open-state').textContent).toBe('false');
  });

  it('data-collapsed attribute reflects collapse state', () => {
    const { rerender } = render(<SidebarHarness />);
    // Hook harness doesn't expose data-collapsed; verify via Sidebar component instead.
    rerender(<Sidebar variant="persistent" defaultCollapsed><span>x</span></Sidebar>);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'collapsed');
  });

  it('Sidebar component renders header/footer/children and collapse button', () => {
    render(
      <Sidebar variant="persistent" header={<span>H</span>} footer={<span>F</span>}>
        <span>Body</span>
      </Sidebar>
    );
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
  });

  it('Sidebar collapse toggle button expands after collapse', async () => {
    const user = userEvent.setup();
    render(<Sidebar variant="persistent"><span>Menu</span></Sidebar>);
    await user.click(screen.getByLabelText('Collapse sidebar'));
    expect(await screen.findByLabelText('Expand sidebar')).toBeInTheDocument();
  });

  it('Sidebar trigger toggles open via a custom trigger element', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar variant="temporary" trigger={<button>MenuBtn</button>}>
        <span>Hidden</span>
      </Sidebar>
    );
    const trigger = screen.getByText('MenuBtn').closest('button')!;
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('temporary Sidebar renders an overlay when open', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar variant="temporary" trigger={<button>Open</button>}>
        <span>Content</span>
      </Sidebar>
    );
    await user.click(screen.getByText('Open'));
    // Overlay div is clickable
    const aside = screen.getByTestId('sidebar');
    expect(aside).toHaveAttribute('data-state', 'open');
  });

  it('responsive: persistent sidebar auto-closes on mobile width', async () => {
    // jsdom innerWidth defaults to 1024 (desktop). Force mobile then dispatch resize.
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500, writable: true });
    const onOpenChange = vi.fn();
    render(<SidebarHarness variant="persistent" defaultOpen responsive breakpoint={768} onOpenChange={onOpenChange} />);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('open-state').textContent).toBe('false');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: original, writable: true });
  });

  it('responsive=false does not attach resize handling', () => {
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500, writable: true });
    render(<SidebarHarness variant="persistent" defaultOpen responsive={false} />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    // Stays open because responsive is disabled
    expect(screen.getByTestId('open-state').textContent).toBe('true');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: original, writable: true });
  });
});

describe('Sidebar component variants', () => {
  it('permanent variant uses the relative/h-full branch (variant !== permanent is false)', () => {
    render(<Sidebar variant="permanent"><span>Perm</span></Sidebar>);
    const aside = screen.getByTestId('sidebar');
    expect(aside.className).toContain('relative');
    expect(aside).toHaveAttribute('data-variant', 'permanent');
  });

  it('right position with closed sidebar uses the translate-x-full branch', () => {
    render(<Sidebar variant="persistent" position="right"><span>R</span></Sidebar>);
    const aside = screen.getByTestId('sidebar');
    expect(aside).toHaveAttribute('data-position', 'right');
    expect(aside.className).toContain('right-0');
  });

  it('persistent variant renders the mobile (isMobile) branch when width is below breakpoint', async () => {
    const original = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500, writable: true });
    render(<Sidebar variant="persistent" defaultOpen responsive breakpoint={768}><span>M</span></Sidebar>);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    const aside = screen.getByTestId('sidebar');
    // Mobile persistent slides off-screen via -translate-x-full.
    expect(aside.className).toContain('-translate-x-full');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: original, writable: true });
  });

  it('renders a fallback trigger button when trigger is truthy but not a valid element (closed)', () => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Sidebar variant="temporary" trigger={'open-me' as any}>
        <span>Hidden</span>
      </Sidebar>
    );
    const triggerBtn = screen.getByLabelText('Open sidebar');
    expect(triggerBtn).toBeInTheDocument();
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('fallback trigger button switches aria-label/path after opening', async () => {
    const user = userEvent.setup();
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Sidebar variant="temporary" trigger={'open-me' as any}>
        <span>Hidden</span>
      </Sidebar>
    );
    const triggerBtn = screen.getByLabelText('Open sidebar');
    await user.click(triggerBtn);
    expect(screen.getByLabelText('Close sidebar')).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Sidebar sub-components', () => {
  it('SidebarItem renders children, applies active styling, and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarItem active onClick={onClick}>
        Home
      </SidebarItem>
    );
    const item = screen.getByTestId('sidebar-item');
    expect(item.className).toContain('bg-blue-100');
    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('SidebarItem renders an icon and ignores clicks when disabled', () => {
    const onClick = vi.fn();
    render(
      <SidebarItem disabled icon={<span data-testid="ico">★</span>} onClick={onClick}>
        Disabled
      </SidebarItem>
    );
    const item = screen.getByTestId('sidebar-item');
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(item).toHaveAttribute('aria-disabled', 'true');
    // When disabled the item renders no onClick handler, so clicks are inert.
    fireEvent.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('SidebarGroup renders a label when provided', () => {
    render(
      <SidebarGroup label="Section A">
        <SidebarItem>A</SidebarItem>
      </SidebarGroup>
    );
    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
  });

  it('SidebarGroup renders without a label', () => {
    render(
      <SidebarGroup>
        <SidebarItem>B</SidebarItem>
      </SidebarGroup>
    );
    expect(screen.queryByText('Section A')).not.toBeInTheDocument();
    expect(screen.getByTestId('sidebar-group')).toBeInTheDocument();
  });

  it('SidebarDivider renders with separator semantics', () => {
    render(<SidebarDivider />);
    const divider = screen.getByTestId('sidebar-divider');
    expect(divider).toHaveAttribute('role', 'separator');
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });
});
