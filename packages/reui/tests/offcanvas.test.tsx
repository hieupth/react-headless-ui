import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Offcanvas, OffcanvasTrigger } from '../src/components/Offcanvas';
import { useOffcanvas } from '../src/hooks';
import { ThemeProvider } from '../src/providers/ThemeProvider';

describe('Offcanvas', () => {
  it('renders nothing visible when closed', () => {
    render(<Offcanvas title="Drawer">Body</Offcanvas>);
    expect(screen.queryByTestId('offcanvas')).toBeInTheDocument();
    expect(screen.queryByTestId('offcanvas')?.getAttribute('data-open')).toBe('false');
  });

  it('opens on defaultOpen and closes via the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen onClose={onClose}>
        Body
      </Offcanvas>
    );
    expect(screen.getByText('Body')).toBeInTheDocument();
    await user.click(screen.getByTestId('offcanvas-close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('uses a custom close button when provided', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen onClose={onClose} closeButton={<span>X</span>}>
        Body
      </Offcanvas>
    );
    await user.click(screen.getByText('X'));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape when closeOnEscape is set', () => {
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen closeOnEscape onClose={onClose}>
        Body
      </Offcanvas>
    );
    const panel = screen.getByTestId('offcanvas');
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen closeOnEscape={false} onClose={onClose}>
        Body
      </Offcanvas>
    );
    const panel = screen.getByTestId('offcanvas');
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when the backdrop is clicked directly', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen onClose={onClose}>
        Body
      </Offcanvas>
    );
    await user.click(screen.getByTestId('offcanvas-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close when a click bubbles from outside the backdrop target', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen onClose={onClose}>
        Body
      </Offcanvas>
    );
    // Clicking body content (a child) bubbles to the backdrop handler, but
    // event.target !== event.currentTarget so it must not close.
    await user.click(screen.getByText('Body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when a backdrop click originates from a child element', () => {
    const onClose = vi.fn();
    render(
      <Offcanvas title="Drawer" defaultOpen onClose={onClose}>
        Body
      </Offcanvas>
    );
    const backdrop = screen.getByTestId('offcanvas-backdrop');
    // Inject a child into the backdrop so a click on it has target !== currentTarget,
    // exercising the guard's false arm (must not close).
    const child = document.createElement('div');
    child.dataset.testid = 'backdrop-child';
    backdrop.appendChild(child);
    child.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders a header from the header prop even without a title', () => {
    render(
      <Offcanvas defaultOpen header={<span>CustomHeader</span>}>
        Body
      </Offcanvas>
    );
    expect(screen.getByText('CustomHeader')).toBeInTheDocument();
  });

  it('renders no header when showHeader is false', () => {
    render(
      <Offcanvas defaultOpen title="Hidden" showHeader={false}>
        Body
      </Offcanvas>
    );
    expect(screen.queryByTestId('offcanvas-header')).toBeNull();
  });

  it('uses a custom renderHeader renderer', () => {
    render(
      <Offcanvas
        defaultOpen
        renderHeader={() => <div data-testid="custom-header">H</div>}
      >
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  it('uses a custom renderBody renderer', () => {
    render(
      <Offcanvas defaultOpen renderBody={() => <div data-testid="custom-body">B</div>} />
    );
    expect(screen.getByTestId('custom-body')).toBeInTheDocument();
  });

  it('renders a footer when showFooter is true', () => {
    render(
      <Offcanvas defaultOpen showFooter footer={<span>FooterContent</span>}>
        Body
      </Offcanvas>
    );
    expect(screen.getByText('FooterContent')).toBeInTheDocument();
  });

  it('uses a custom renderFooter renderer', () => {
    render(
      <Offcanvas
        defaultOpen
        renderFooter={() => <div data-testid="custom-footer">F</div>}
      />
    );
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('uses a custom renderBackdrop renderer', () => {
    render(
      <Offcanvas
        defaultOpen
        renderBackdrop={() => <div data-testid="custom-backdrop">Backdrop</div>}
      >
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('custom-backdrop')).toBeInTheDocument();
  });

  it('hides the backdrop when showBackdrop is false', () => {
    render(
      <Offcanvas defaultOpen showBackdrop={false}>
        Body
      </Offcanvas>
    );
    expect(screen.queryByTestId('offcanvas-backdrop')).toBeNull();
  });

  it('renders inline without a portal when usePortal is false', () => {
    const { container } = render(
      <Offcanvas defaultOpen usePortal={false}>
        Body
      </Offcanvas>
    );
    expect(container.querySelector('[data-testid="offcanvas"]')).not.toBeNull();
  });

  it('renders into a custom portal container when provided', () => {
    const custom = document.createElement('div');
    document.body.appendChild(custom);
    render(
      <Offcanvas defaultOpen portalContainer={custom}>
        Body
      </Offcanvas>
    );
    expect(custom.querySelector('[data-testid="offcanvas"]')).not.toBeNull();
    document.body.removeChild(custom);
  });

  it.each([
    ['top', 'height'],
    ['bottom', 'height'],
    ['left', 'width'],
    ['right', 'width'],
  ] as const)('applies %s size styles from customSize as a number', (_pos, dim) => {
    render(
      <Offcanvas defaultOpen position={_pos} customSize={300}>
        Body
      </Offcanvas>
    );
    const panel = screen.getByTestId('offcanvas');
    expect(panel.getAttribute('data-position')).toBe(_pos);
  });

  it('uses an empty size object for an unknown position with customSize', () => {
    render(
      <Offcanvas defaultOpen position={'center' as any} customSize={300}>
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('offcanvas').getAttribute('data-position')).toBe('center');
  });

  it('applies customSize as a string', () => {
    render(
      <Offcanvas defaultOpen position="right" customSize="50vw">
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('offcanvas').getAttribute('data-position')).toBe('right');
  });

  it.each(['top', 'bottom', 'left', 'right'] as const)('renders position=%s using default size styles', (pos) => {
    render(
      <Offcanvas defaultOpen position={pos} size="md">
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('offcanvas').getAttribute('data-position')).toBe(pos);
  });

  it('falls back to the size map for an unknown position with default sizing', () => {
    render(
      <Offcanvas defaultOpen position={'center' as any} size="md">
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('offcanvas')).toBeInTheDocument();
  });

  it('renders no header content when title/header/close are all absent', () => {
    render(
      <Offcanvas defaultOpen showCloseButton={false}>
        Body
      </Offcanvas>
    );
    expect(screen.queryByTestId('offcanvas-header')).toBeNull();
  });

  it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)('renders size=%s panel', (size) => {
    render(
      <Offcanvas defaultOpen size={size}>
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('offcanvas').getAttribute('data-size')).toBe(size);
  });

  it('falls back to md size styles for an unknown size', () => {
    render(
      <Offcanvas defaultOpen size={'unknown' as any}>
        Body
      </Offcanvas>
    );
    expect(screen.getByTestId('offcanvas')).toBeInTheDocument();
  });

  it('renders without a portal when closed (returns content directly)', () => {
    const { container } = render(<Offcanvas title="Drawer">Body</Offcanvas>);
    expect(container.querySelector('[data-testid="offcanvas"]')).not.toBeNull();
  });

  it('falls back to default colors/spacing/borderRadius when the theme lacks them', () => {
    // Empty theme values force every `theme.X || fallback` arm to its right side.
    render(
      <ThemeProvider theme={{ colors: {}, borderRadius: {}, spacing: {} }}>
        <Offcanvas defaultOpen title="T" showFooter footer={<span>F</span>}>
          Body
        </Offcanvas>
      </ThemeProvider>
    );
    expect(screen.getByTestId('offcanvas-header')).toBeInTheDocument();
    expect(screen.getByTestId('offcanvas-footer')).toBeInTheDocument();
  });
});

describe('OffcanvasTrigger', () => {
  function Harness({ variant, size, disabled, withOffcanvas }: {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    withOffcanvas?: boolean;
  }) {
    const offcanvas = useOffcanvas({ defaultOpen: false });
    return (
      <>
        <OffcanvasTrigger
          variant={variant}
          size={size}
          disabled={disabled}
          offcanvas={withOffcanvas ? offcanvas.actions : undefined}
          onClick={() => {}}
        >
          Open
        </OffcanvasTrigger>
        <Offcanvas defaultOpen={offcanvas.state.open} onClose={offcanvas.actions.close}>
          Body
        </Offcanvas>
      </>
    );
  }

  it('renders a primary trigger and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OffcanvasTrigger onClick={onClick}>Open</OffcanvasTrigger>);
    await user.click(screen.getByTestId('offcanvas-trigger'));
    expect(onClick).toHaveBeenCalled();
  });

  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)('renders variant=%s', (variant) => {
    render(<Harness variant={variant} />);
    expect(screen.getByTestId('offcanvas-trigger')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size=%s', (size) => {
    render(<Harness size={size} />);
    expect(screen.getByTestId('offcanvas-trigger')).toBeInTheDocument();
  });

  it('renders disabled without firing the offcanvas toggle', async () => {
    const user = userEvent.setup();
    render(<Harness disabled withOffcanvas />);
    // disabled buttons do not dispatch click events to handlers
    expect(screen.getByTestId('offcanvas-trigger')).toHaveAttribute('disabled');
  });

  it('toggles the wired offcanvas actions when the trigger is clicked', async () => {
    const user = userEvent.setup();
    const toggle = vi.fn();
    render(<OffcanvasTrigger offcanvas={{ toggle } as any}>Open</OffcanvasTrigger>);
    await user.click(screen.getByTestId('offcanvas-trigger'));
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('falls back to default colors/borderRadius for every variant when theme lacks them', () => {
    render(
      <ThemeProvider theme={{ colors: {}, borderRadius: {} }}>
        <>
          <OffcanvasTrigger variant="primary">P</OffcanvasTrigger>
          <OffcanvasTrigger variant="secondary">S</OffcanvasTrigger>
          <OffcanvasTrigger variant="outline">O</OffcanvasTrigger>
          <OffcanvasTrigger variant="ghost">G</OffcanvasTrigger>
        </>
      </ThemeProvider>
    );
    expect(screen.getAllByTestId('offcanvas-trigger')).toHaveLength(4);
  });
});
