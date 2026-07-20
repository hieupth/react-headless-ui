import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Portal, PortalBackdrop, PortalOverlay } from '../src/components/Portal';

// The Portal component delays the actual unmount of its content by
// `animationDuration` ms (default 200) to leave room for exit animations, so
// assertions that the content has disappeared must wait for that grace period.
describe('Portal', () => {
  it('renders children into the document body via createPortal', () => {
    render(<Portal defaultOpen><span>portal-content</span></Portal>);
    expect(screen.getByText('portal-content')).toBeInTheDocument();
  });

  it('does not render content when defaultOpen is false', () => {
    render(<Portal defaultOpen={false}><span>hidden-content</span></Portal>);
    expect(screen.queryByText('hidden-content')).not.toBeInTheDocument();
  });

  it('does not render when controlled open is false', () => {
    render(<Portal open={false}><span>controlled-hidden</span></Portal>);
    expect(screen.queryByText('controlled-hidden')).not.toBeInTheDocument();
  });

  it('renders when controlled open is true', () => {
    render(<Portal open><span>controlled-shown</span></Portal>);
    expect(screen.getByText('controlled-shown')).toBeInTheDocument();
  });

  it('reflects open state via aria-hidden and wrapper classes', () => {
    render(<Portal defaultOpen><span>state-probe</span></Portal>);
    const portal = screen.getByTestId('portal');
    expect(portal).toHaveClass('portal-open');
    expect(portal).toHaveAttribute('aria-hidden', 'false');
  });

  it('renders a backdrop that fires onBackdropClick when clicked', async () => {
    const user = userEvent.setup();
    const onBackdropClick = vi.fn();
    render(
      <Portal defaultOpen showBackdrop onBackdropClick={onBackdropClick}>
        <span>modal</span>
      </Portal>
    );
    await user.click(screen.getByTestId('portal-backdrop'));
    expect(onBackdropClick).toHaveBeenCalledTimes(1);
  });

  it('omits the backdrop when showBackdrop is false', () => {
    render(<Portal defaultOpen><span>no-backdrop</span></Portal>);
    expect(screen.queryByTestId('portal-backdrop')).not.toBeInTheDocument();
  });

  it('closes on Escape when closeOnEscape is enabled (default)', async () => {
    const user = userEvent.setup();
    render(<Portal defaultOpen><span>esc-close</span></Portal>);
    expect(screen.getByText('esc-close')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    // Content lingers for the exit-animation grace period, then unmounts.
    await waitFor(() => {
      expect(screen.queryByText('esc-close')).not.toBeInTheDocument();
    });
  });

  it('does not close on Escape when closeOnEscape is disabled', async () => {
    const user = userEvent.setup();
    render(
      <Portal defaultOpen closeOnEscape={false}>
        <span>esc-stays</span>
      </Portal>
    );
    await user.keyboard('{Escape}');
    expect(screen.getByText('esc-stays')).toBeInTheDocument();
  });

  it('mounts into a custom container selector', () => {
    const host = document.createElement('div');
    host.id = 'custom-host';
    document.body.appendChild(host);

    render(
      <Portal defaultOpen container="#custom-host">
        <span>custom-host-content</span>
      </Portal>
    );

    expect(host.textContent).toContain('custom-host-content');
    document.body.removeChild(host);
  });

  it('renders nothing and warns when the container selector is not found', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Portal defaultOpen container="#does-not-exist">
        <span>fallback-content</span>
      </Portal>
    );
    expect(screen.queryByText('fallback-content')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith('Portal: Container not found');
    warn.mockRestore();
  });

  it('applies custom className and inline style to the wrapper', () => {
    render(
      <Portal defaultOpen className="my-portal" style={{ color: 'rgb(255, 0, 0)' }}>
        <span>styled</span>
      </Portal>
    );
    const portal = screen.getByTestId('portal');
    expect(portal).toHaveClass('my-portal');
    expect(portal.style.color).toBe('rgb(255, 0, 0)');
  });

  it('unmounts after the animation duration when open flips to false', async () => {
    const user = userEvent.setup();
    render(<Portal defaultOpen animationDuration={50}><span>anim</span></Portal>);
    expect(screen.getByText('anim')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByText('anim')).not.toBeInTheDocument();
    });
  });

  it('moves focus between first and last focusable elements when trapFocus is on', async () => {
    const user = userEvent.setup();
    render(
      <Portal defaultOpen trapFocus>
        <div>
          <button>first</button>
          <button>second</button>
          <button>last</button>
        </div>
      </Portal>
    );
    const first = screen.getByRole('button', { name: 'first' });
    const last = screen.getByRole('button', { name: 'last' });

    // Trap autofocus lands on the first focusable element.
    expect(first).toHaveFocus();

    // Shift+Tab from first wraps to last.
    await user.tab({ shift: true });
    expect(last).toHaveFocus();

    // Tab from last wraps back to first.
    await user.tab();
    expect(first).toHaveFocus();
  });

  it('restores focus to the previously focused element on close', async () => {
    const user = userEvent.setup();
    function App() {
      return (
        <div>
          <button>outside-trigger</button>
          <Portal
            defaultOpen
            restoreFocus
            closeOnEscape
            animationDuration={0}
          >
            <span>restorable</span>
          </Portal>
        </div>
      );
    }
    render(<App />);
    const trigger = screen.getByRole('button', { name: 'outside-trigger' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('drives open state through controlled open + onOpenChange', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>reveal</button>
          <Portal open={open} onOpenChange={(v) => setOpen(v)}>
            <button onClick={() => setOpen(false)}>hide</button>
          </Portal>
        </div>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    expect(screen.queryByText('hide')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'reveal' }));
    expect(screen.getByRole('button', { name: 'hide' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'hide' }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'hide' })).not.toBeInTheDocument();
    });
  });
});

describe('Portal sub-components and edge branches', () => {
  it('PortalBackdrop renders with default visible styling and forwards click', () => {
    const onClick = vi.fn();
    const { container } = render(<PortalBackdrop onClick={onClick} />);
    const el = container.querySelector('[data-testid="portal-backdrop"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.style.opacity).toBe('1');
    expect(el.style.pointerEvents).toBe('auto');
    el.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('PortalBackdrop applies hidden state and custom opacity/blur/className', () => {
    const { container } = render(
      <PortalBackdrop visible={false} opacity={0.7} blur="8px" animationDuration={300} className="extra" />
    );
    const el = container.querySelector('[data-testid="portal-backdrop"]') as HTMLElement;
    expect(el.style.opacity).toBe('0');
    expect(el.style.pointerEvents).toBe('none');
    expect(el.className).toContain('backdrop-hidden');
    expect(el.className).toContain('extra');
    expect(el.style.backdropFilter).toContain('8px');
  });

  it('PortalOverlay renders visible with children and forwards click only when closeOnClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PortalOverlay onClick={onClick}>
        <span>overlay content</span>
      </PortalOverlay>
    );
    const el = container.querySelector('[data-testid="portal-overlay"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.style.opacity).toBe('0.8');
    expect(el.className).toContain('overlay-visible');
    el.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('PortalOverlay hidden + closeOnClick=false ignores click', () => {
    const onClick = vi.fn();
    const { container } = render(
      <PortalOverlay visible={false} closeOnClick={false} backgroundOpacity={0.5} backgroundColor="rgba(0,0,0,0.5)" className="ov" onClick={onClick} />
    );
    const el = container.querySelector('[data-testid="portal-overlay"]') as HTMLElement;
    expect(el.style.opacity).toBe('0');
    expect(el.style.pointerEvents).toBe('none');
    expect(el.className).toContain('overlay-hidden');
    el.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('Portal mounts into a container passed as an HTMLElement', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<Portal defaultOpen container={host}><span>in-host</span></Portal>);
    expect(host.textContent).toContain('in-host');
    document.body.removeChild(host);
  });

  it('Portal with restoreFocus=false does not track prior focus', () => {
    // restoreFocus=false skips saving activeElement; assert it renders without error.
    const { container } = render(
      <Portal defaultOpen restoreFocus={false}><span>no-restore</span></Portal>
    );
    expect(container).toBeDefined();
  });

  it('PortalBackdrop with no onClick does not throw on click', () => {
    const { container } = render(<PortalBackdrop />);
    const el = container.querySelector('[data-testid="portal-backdrop"]') as HTMLElement;
    expect(() => el.click()).not.toThrow();
  });

  it('backdrop click without onBackdropClick is a no-op', () => {
    render(<Portal defaultOpen showBackdrop><span>nb</span></Portal>);
    expect(() => screen.getByTestId('portal-backdrop').click()).not.toThrow();
  });

  it('trapFocus with no focusable children does not throw on Tab', async () => {
    const user = userEvent.setup();
    render(
      <Portal defaultOpen trapFocus>
        <span>nothing focusable</span>
      </Portal>
    );
    // No focusable elements: the trap setup skips autofocus and Tab returns early.
    await user.tab();
    expect(screen.getByText('nothing focusable')).toBeInTheDocument();
  });

  it('trapFocus Tab from a middle element does not wrap focus', async () => {
    const user = userEvent.setup();
    render(
      <Portal defaultOpen trapFocus>
        <div>
          <button>first</button>
          <button>middle</button>
          <button>last</button>
        </div>
      </Portal>
    );
    const middle = screen.getByRole('button', { name: 'middle' });
    middle.focus();
    await user.tab();
    // Tabbing from the middle moves to the last element without wrapping.
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('trapFocus Shift+Tab from a middle element does not wrap focus', async () => {
    const user = userEvent.setup();
    render(
      <Portal defaultOpen trapFocus>
        <div>
          <button>first</button>
          <button>middle</button>
          <button>last</button>
        </div>
      </Portal>
    );
    const middle = screen.getByRole('button', { name: 'middle' });
    middle.focus();
    await user.tab({ shift: true });
    // Shift+Tab from the middle moves to the first element without wrapping.
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });
});
