import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from '../src/components/Drawer';

describe('Drawer renderer branches', () => {
  it('renders title + subtitle and close button when open', () => {
    render(
      <Drawer open title="My Drawer" subtitle="Sub" showCloseButton>
        Items
      </Drawer>
    );
    expect(screen.getByText('My Drawer')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close drawer/i })).toBeInTheDocument();
  });

  it('hides header when title/subtitle/showCloseButton are all absent', () => {
    render(<Drawer open>Items</Drawer>);
    expect(screen.queryByRole('button', { name: /close drawer/i })).not.toBeInTheDocument();
  });

  it('uses a custom headerRenderer', () => {
    render(
      <Drawer
        open
        title="T"
        headerRenderer={({ title, onClose }) => (
          <div>
            <span data-testid="h-title">{title}</span>
            <button onClick={onClose}>x</button>
          </div>
        )}
      >
        Items
      </Drawer>
    );
    expect(screen.getByTestId('h-title').textContent).toBe('T');
  });

  it('renders a custom footerRenderer', () => {
    render(
      <Drawer
        open
        footerRenderer={({ onClose }) => (
          <button data-testid="foot-close" onClick={onClose}>done</button>
        )}
      >
        Items
      </Drawer>
    );
    expect(screen.getByTestId('foot-close')).toBeInTheDocument();
  });

  it('renders overlay when modal (default) and uses custom overlayRenderer', () => {
    render(
      <Drawer
        open
        modal
        overlayRenderer={() => <div data-testid="my-overlay" />}
      >
        Items
      </Drawer>
    );
    expect(screen.getByTestId('my-overlay')).toBeInTheDocument();
  });

  it('omits overlay when modal=false', () => {
    render(<Drawer open modal={false}>Items</Drawer>);
    expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();
  });

  it('portal mode renders into body when open', () => {
    render(<Drawer open portal>Items</Drawer>);
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('portal mode renders nothing when closed', () => {
    const { container } = render(<Drawer portal>Items</Drawer>);
    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('DrawerTrigger fires onOpen on click and on Enter/Space', () => {
    const onOpen = vi.fn();
    render(
      <DrawerTrigger onOpen={onOpen}>
        <span>open</span>
      </DrawerTrigger>
    );
    const trigger = screen.getByText('open');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(onOpen).toHaveBeenCalledTimes(3);
  });

  it('DrawerContent/Header/Footer render children with test ids', () => {
    render(
      <DrawerContent>
        <DrawerHeader>
          <DrawerFooter>
            <span>x</span>
          </DrawerFooter>
        </DrawerHeader>
      </DrawerContent>
    );
    expect(screen.getByTestId('drawer-content-area')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-header')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-footer')).toBeInTheDocument();
  });

  it('renders sides and sizes (data-side/data-size reflect the choices)', () => {
    const { rerender } = render(<Drawer open side="left" size="sm">X</Drawer>);
    let drawer = screen.getByTestId('drawer');
    // Headless: the w-full/max-h-96 layout classes are removed; side and size
    // are still exposed via data-side / data-size attributes.
    expect(drawer.getAttribute('data-side')).toBe('left');
    expect(drawer.getAttribute('data-size')).toBe('sm');
    rerender(<Drawer open side="top" size="full">X</Drawer>);
    drawer = screen.getByTestId('drawer');
    expect(drawer.getAttribute('data-side')).toBe('top');
    expect(drawer.getAttribute('data-size')).toBe('full');
  });
});
