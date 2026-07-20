import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter } from '../src/components/Drawer';

// Drawer portals into document.body when open. The hook defers some state via
// setTimeout (focus + opening/clearing flags), so waitFor where needed.

describe('Drawer (deep)', () => {
  it('renders nothing when closed by default', () => {
    const { container } = render(<Drawer>Items</Drawer>);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Items')).not.toBeInTheDocument();
  });

  it('opens with defaultOpen (uncontrolled) and exposes its content', () => {
    render(<Drawer defaultOpen title="Cart">Items</Drawer>);
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
  });

  it('reflects the controlled open prop', () => {
    const { rerender } = render(<Drawer open={false} title="Cart">Items</Drawer>);
    expect(screen.queryByText('Items')).not.toBeInTheDocument();
    rerender(<Drawer open title="Cart">Items</Drawer>);
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('renders into a portal on document.body when portal is enabled', () => {
    const { container } = render(<Drawer open portal title="Cart">Items</Drawer>);
    // With portal=true the component root renders null into the host tree and
    // the panel is portaled into document.body.
    expect(container.firstChild).toBeNull();
    expect(document.body.querySelector('[data-testid="drawer"]')).toBeTruthy();
  });

  it('closes via the close button and calls onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    render(
      <Drawer open title="Cart" showCloseButton onOpenChange={onOpenChange} onClose={onClose}>
        Items
      </Drawer>
    );
    await user.click(screen.getByRole('button', { name: /close drawer/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape via the document keydown listener', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Drawer open title="Cart" onOpenChange={onOpenChange}>Items</Drawer>);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('does not close on Escape when closeOnEscape is false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Drawer open title="Cart" closeOnEscape={false} onOpenChange={onOpenChange}>Items</Drawer>);
    await user.keyboard('{Escape}');
    // Give the async handler a beat; it must not have fired.
    await waitFor(() => expect(onOpenChange).not.toHaveBeenCalled());
  });

  it('closes on overlay click when closeOnOutsideClick is enabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open portal title="Cart" closeOnOutsideClick onOpenChange={onOpenChange}>
        Items
      </Drawer>
    );
    const overlay = document.body.querySelector('[data-testid="drawer-overlay"]') as HTMLElement;
    expect(overlay).toBeTruthy();
    await user.click(overlay);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('does not close on overlay click when dismissible is false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open title="Cart" dismissible={false} onOpenChange={onOpenChange}>
        Items
      </Drawer>
    );
    const overlay = document.body.querySelector('[data-testid="drawer-overlay"]') as HTMLElement;
    await user.click(overlay);
    await waitFor(() => expect(onOpenChange).not.toHaveBeenCalled());
  });

  it('honours the chosen side via data-side on the panel', () => {
    render(<Drawer open side="left" title="Cart">Items</Drawer>);
    const panel = document.body.querySelector('[data-testid="drawer"]') as HTMLElement;
    expect(panel.getAttribute('data-side')).toBe('left');
  });

  it('does not render an overlay when modal is false', () => {
    render(<Drawer open modal={false} title="Cart">Items</Drawer>);
    expect(document.body.querySelector('[data-testid="drawer-overlay"]')).toBeNull();
    // But the panel still renders.
    expect(screen.getByText('Items')).toBeInTheDocument();
  });

  it('fires onAfterClose after the close animation completes', async () => {
    const user = userEvent.setup();
    const onAfterClose = vi.fn();
    render(
      <Drawer
        open
        title="Cart"
        showCloseButton
        animationDuration={50}
        onOpenChange={() => {}}
        onAfterClose={onAfterClose}
      >
        Items
      </Drawer>
    );
    await user.click(screen.getByRole('button', { name: /close drawer/i }));
    await waitFor(() => expect(onAfterClose).toHaveBeenCalledTimes(1));
  });

  it('uses the top/bottom side branches (data-side reflects the chosen side)', () => {
    render(<Drawer open side="top" title="Cart">Items</Drawer>);
    const panel = document.body.querySelector('[data-testid="drawer"]') as HTMLElement;
    expect(panel).toBeTruthy();
    // Headless: the h-full/max-h-96 layout classes are removed; the chosen side
    // is still exposed via the data-side attribute.
    expect(panel.getAttribute('data-side')).toBe('top');
  });

  it('renders a custom overlay via overlayRenderer', () => {
    render(
      <Drawer
        open
        modal
        title="Cart"
        overlayRenderer={(props) => <div data-testid="custom-overlay" {...props}>ov</div>}
      >
        Items
      </Drawer>
    );
    expect(screen.getByTestId('custom-overlay')).toBeInTheDocument();
    // The default overlay is not rendered when a custom renderer is supplied.
    expect(document.body.querySelector('[data-testid="drawer-overlay"]')).toBeNull();
  });

  it('renders a custom header via headerRenderer', () => {
    render(
      <Drawer
        open
        title="Cart"
        headerRenderer={(props) => <div data-testid="custom-header">{props.title}</div>}
      >
        Items
      </Drawer>
    );
    expect(screen.getByTestId('custom-header').textContent).toBe('Cart');
  });

  it('renders the subtitle paragraph when provided', () => {
    render(<Drawer open title="Cart" subtitle="Optional note">Items</Drawer>);
    expect(screen.getByText('Optional note')).toBeInTheDocument();
  });

  it('renders a custom footer via footerRenderer', () => {
    render(
      <Drawer
        open
        title="Cart"
        footerRenderer={(props) => (
          <div data-testid="custom-footer">
            <button onClick={props.onClose}>done</button>
          </div>
        )}
      >
        Items
      </Drawer>
    );
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });
});

describe('Drawer sub-components', () => {
  it('DrawerTrigger fires onOpen on click', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <DrawerTrigger onOpen={onOpen}>
        <span>open</span>
      </DrawerTrigger>
    );
    await user.click(screen.getByText('open'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('DrawerTrigger fires onOpen on Enter and Space keys', () => {
    const onOpen = vi.fn();
    render(
      <DrawerTrigger onOpen={onOpen}>
        <span>open</span>
      </DrawerTrigger>
    );
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('DrawerTrigger ignores other keys', () => {
    const onOpen = vi.fn();
    render(
      <DrawerTrigger onOpen={onOpen}>
        <span>open</span>
      </DrawerTrigger>
    );
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('DrawerContent renders children with default className', () => {
    render(<DrawerContent>body</DrawerContent>);
    const el = screen.getByTestId('drawer-content-area');
    expect(el.textContent).toBe('body');
    expect(el.className).toContain('drawer-content');
  });

  it('DrawerHeader renders children', () => {
    render(<DrawerHeader>head</DrawerHeader>);
    expect(screen.getByTestId('drawer-header').textContent).toBe('head');
  });

  it('DrawerFooter renders children', () => {
    render(<DrawerFooter>foot</DrawerFooter>);
    expect(screen.getByTestId('drawer-footer').textContent).toBe('foot');
  });
});
