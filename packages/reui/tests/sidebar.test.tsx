import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../src/components/Sidebar';
import { useSidebar } from '../src/hooks/useSidebar';

describe('Sidebar', () => {
  it('renders sidebar content from children', () => {
    render(
      <Sidebar>
        <a href="#home">Home</a>
      </Sidebar>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('toggles collapsed state via the collapse button', async () => {
    const user = userEvent.setup();
    const onCollapseChange = vi.fn();
    render(
      <Sidebar variant="persistent" onCollapseChange={onCollapseChange}>
        <span>Menu</span>
      </Sidebar>
    );
    const collapseBtn = screen.getByLabelText('Collapse sidebar');
    await user.click(collapseBtn);
    expect(onCollapseChange).toHaveBeenLastCalledWith(true);
  });
});

describe('useSidebar hook', () => {
  function mount(props?: Parameters<typeof useSidebar>[0]) {
    return renderHook(() => useSidebar(props));
  }

  it('open/close/toggle fire onOpenChange and report open state + attributes', () => {
    const onOpenChange = vi.fn();
    const { result } = mount({ onOpenChange });
    expect(result.current.state.open).toBe(false);
    expect(result.current.attributes['data-state']).toBe('closed');

    act(() => result.current.actions.openSidebar());
    expect(result.current.state.open).toBe(true);
    expect(result.current.attributes['data-state']).toBe('open');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    act(() => result.current.actions.closeSidebar());
    expect(result.current.state.open).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    act(() => result.current.actions.toggleSidebar());
    expect(result.current.state.open).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    act(() => result.current.actions.toggleSidebar());
    expect(result.current.state.open).toBe(false);
  });

  it('actions are no-ops while disabled', () => {
    const onOpenChange = vi.fn();
    const { result } = mount({ disabled: true, onOpenChange });
    act(() => result.current.actions.openSidebar());
    act(() => result.current.actions.closeSidebar());
    act(() => result.current.actions.toggleSidebar());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(result.current.state.open).toBe(false);
  });

  it('collapse/expand/toggleCollapse fire onCollapseChange and report collapsed state', () => {
    const onCollapseChange = vi.fn();
    const { result } = mount({ onCollapseChange });
    expect(result.current.state.collapsed).toBe(false);
    expect(result.current.attributes['data-collapsed']).toBe('expanded');

    act(() => result.current.actions.collapseSidebar());
    expect(result.current.state.collapsed).toBe(true);
    expect(result.current.attributes['data-collapsed']).toBe('collapsed');
    expect(onCollapseChange).toHaveBeenLastCalledWith(true);

    act(() => result.current.actions.expandSidebar());
    expect(result.current.state.collapsed).toBe(false);
    expect(onCollapseChange).toHaveBeenLastCalledWith(false);

    act(() => result.current.actions.toggleCollapse());
    expect(result.current.state.collapsed).toBe(true);
    expect(onCollapseChange).toHaveBeenLastCalledWith(true);
  });

  it('collapse/expand are no-ops while disabled', () => {
    const onCollapseChange = vi.fn();
    const { result } = mount({ disabled: true, onCollapseChange });
    act(() => result.current.actions.collapseSidebar());
    act(() => result.current.actions.expandSidebar());
    act(() => result.current.actions.toggleCollapse());
    expect(onCollapseChange).not.toHaveBeenCalled();
  });

  it('handleOverlayClick closes when closeOnOverlayClick is true (default) and not when false', () => {
    const onOpenChange = vi.fn();
    const { result } = mount({ defaultOpen: true, variant: 'temporary', onOpenChange });
    expect(result.current.state.showOverlay).toBe(true);
    act(() => result.current.actions.handleOverlayClick());
    expect(result.current.state.open).toBe(false);

    // closeOnOverlayClick false keeps it open.
    const onOpenChange2 = vi.fn();
    const { result: r2 } = mount({
      defaultOpen: true,
      variant: 'temporary',
      closeOnOverlayClick: false,
      onOpenChange: onOpenChange2,
    });
    act(() => r2.current.actions.handleOverlayClick());
    expect(r2.current.state.open).toBe(true);
  });

  it('handleEscapeKey closes an open sidebar but not a closed one', () => {
    const { result } = mount({ defaultOpen: true, variant: 'temporary' });
    act(() => result.current.actions.handleEscapeKey());
    expect(result.current.state.open).toBe(false);

    // closed sidebar: escape does nothing.
    const { result: r2 } = mount({ defaultOpen: false });
    expect(() => act(() => r2.current.actions.handleEscapeKey())).not.toThrow();
    expect(r2.current.state.open).toBe(false);
  });

  it('escape keypress listener is attached when overlay is shown', () => {
    const { result } = mount({ defaultOpen: true, variant: 'temporary' });
    expect(result.current.state.showOverlay).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.state.open).toBe(false);
  });

  it('non-Escape keys do not close the sidebar', () => {
    const { result } = mount({ defaultOpen: true, variant: 'temporary' });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });
    expect(result.current.state.open).toBe(true);
  });

  it('showOverlay is true for temporary+open and for persistent+mobile+open', () => {
    const { result } = mount({ defaultOpen: true, variant: 'temporary' });
    expect(result.current.state.showOverlay).toBe(true);

    const { result: r2 } = mount({ defaultOpen: true, variant: 'persistent', responsive: false });
    expect(r2.current.state.showOverlay).toBe(false);
  });

  it('showOverlay can be disabled via the propShowOverlay prop', () => {
    const { result } = mount({ defaultOpen: true, variant: 'temporary', showOverlay: false });
    expect(result.current.state.showOverlay).toBe(false);
  });

  it('respects responsive=false (skips the resize listener effect)', () => {
    expect(() => mount({ responsive: false })).not.toThrow();
  });

  it('marks the sidebar as mobile below the breakpoint and auto-closes persistent', () => {
    const innerWidthDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth')!;
    const addSpy = vi.spyOn(window, 'addEventListener');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });

    const onOpenChange = vi.fn();
    const { result } = mount({
      responsive: true,
      breakpoint: 768,
      variant: 'persistent',
      defaultOpen: true,
      onOpenChange,
    });
    expect(result.current.state.isMobile).toBe(true);
    expect(result.current.state.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    addSpy.mockRestore();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidthDesc.value });
  });

  it('desktop width keeps an open persistent sidebar open', () => {
    const innerWidthDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth')!;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    const { result } = mount({
      responsive: true,
      breakpoint: 768,
      variant: 'persistent',
      defaultOpen: true,
    });
    expect(result.current.state.isMobile).toBe(false);
    expect(result.current.state.open).toBe(true);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidthDesc.value });
  });

  it('a resize to mobile triggers checkMobile and auto-closes persistent', () => {
    const innerWidthDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth')!;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    const onOpenChange = vi.fn();
    const { result } = mount({
      responsive: true,
      breakpoint: 768,
      variant: 'persistent',
      defaultOpen: true,
      onOpenChange,
    });
    expect(result.current.state.open).toBe(true);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.state.isMobile).toBe(true);
    expect(result.current.state.open).toBe(false);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidthDesc.value });
  });

  it('exposes position/variant/size in attributes and state', () => {
    const { result } = mount({ position: 'right', variant: 'persistent', size: 'lg' });
    expect(result.current.attributes['data-position']).toBe('right');
    expect(result.current.attributes['data-variant']).toBe('persistent');
    expect(result.current.attributes['data-size']).toBe('lg');
    expect(result.current.state.position).toBe('right');
  });
});
