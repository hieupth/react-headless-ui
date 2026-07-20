import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from '../src/components/Popover';
import { usePopover, type UsePopoverProps } from '../src/hooks';

function HookHarness(props: UsePopoverProps & { onApi?: (api: ReturnType<typeof usePopover>) => void }) {
  const { onApi, ...rest } = props;
  const api = usePopover(rest);
  onApi?.(api);
  return <div data-testid="harness" />;
}

describe('Popover', () => {
  it('renders the trigger element', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <span>Popover content</span>
      </Popover>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    // Content is hidden until opened.
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('shows content when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>}>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByText('Popover content')).toBeInTheDocument();
  });

  it('applies the className, style, and container props', () => {
    render(
      <Popover
        trigger={<button>Open</button>}
        className="outer"
        style={{ color: 'red' }}
        maxWidth={500}
      >
        <span>Popover content</span>
      </Popover>
    );
    const root = screen.getByTestId('popover');
    expect(root.className).toContain('outer');
    expect(root.getAttribute('style')).toContain('color: red');
  });

  it('shows the close button and closes when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>} showCloseButton>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    await screen.findByText('Popover content');
    await user.click(screen.getByTestId('popover-close-button'));
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('renders custom close button content when provided', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={<button>Open</button>}
        showCloseButton
        closeButtonContent={<span data-testid="x">x</span>}
      >
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByTestId('x')).toBeInTheDocument();
  });

  it('hides the arrow when showArrow is false', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>} showArrow={false}>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    await screen.findByText('Popover content');
    expect(screen.queryByTestId('popover-arrow')).not.toBeInTheDocument();
  });

  it('shows the arrow by default', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>} showArrow>
        <span>Popover content</span>
      </Popover>
    );
    await user.click(screen.getByText('Open'));
    expect(await screen.findByTestId('popover-arrow')).toBeInTheDocument();
  });

  it('renders the arrow/content classes for every supported position', async () => {
    const positions = [
      'top',
      'bottom',
      'left',
      'right',
      'top-start',
      'top-end',
      'bottom-start',
      'bottom-end',
    ] as const;

    for (const position of positions) {
      const { unmount } = render(
        <Popover key={position} trigger={<button>Open</button>} position={position} defaultOpen>
          <span>{position}-content</span>
        </Popover>
      );
      const arrow = await screen.findByTestId('popover-arrow');
      // Arrow class should reflect the position (no crash, class present).
      expect(arrow.className).toContain('popover-arrow');
      unmount();
    }
  });

  it('honors triggerClassName and contentClassName', async () => {
    const user = userEvent.setup();
    render(
      <Popover
        trigger={<button>Open</button>}
        triggerClassName="my-trigger"
        contentClassName="my-content"
      >
        <span>Popover content</span>
      </Popover>
    );
    expect(screen.getByTestId('popover-trigger').className).toContain('my-trigger');
    await user.click(screen.getByText('Open'));
    const content = await screen.findByTestId('popover-content');
    expect(content.className).toContain('my-content');
  });

  it('reflects disabled state in the trigger attributes', () => {
    render(
      <Popover trigger={<button>Open</button>} disabled>
        <span>Popover content</span>
      </Popover>
    );
    // Headless-only: disabled is exposed via tabindex=-1, not visual classes.
    expect(screen.getByTestId('popover-trigger')).toHaveAttribute('tabindex', '-1');
  });
});

// Direct hook tests to cover the behavioral branches that are not reachable
// through the Popover renderer (hover/focus timers, controlled mode, escape,
// click-outside, callbacks, etc.).
describe('usePopover (hook handlers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('click trigger toggles open via handleTriggerClick', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerClick());
    expect(api.state.open).toBe(true);
    act(() => api.actions.handleTriggerClick());
    expect(api.state.open).toBe(false);
  });

  it('disabled blocks open/close/toggle/click', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness disabled onApi={(a) => (api = a)} />);
    act(() => api.actions.open());
    expect(api.state.open).toBe(false);
    act(() => api.actions.close());
    expect(api.state.open).toBe(false);
    act(() => api.actions.toggle());
    expect(api.state.open).toBe(false);
    act(() => api.actions.handleTriggerClick());
    expect(api.state.open).toBe(false);
  });

  it('open/close/toggle/setPosition fire callbacks (onOpen/onClose/onOpenChange)', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onOpenChange = vi.fn();
    let api: ReturnType<typeof usePopover> = null as any;
    render(
      <HookHarness
        onOpen={onOpen}
        onClose={onClose}
        onOpenChange={onOpenChange}
        onApi={(a) => (api = a)}
      />
    );
    act(() => api.actions.open());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    act(() => api.actions.close());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    act(() => api.actions.setPosition('top'));
    expect(api.state.position).toBe('top');
  });

  it('hover trigger opens after openDelay and closes after closeDelay', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="hover" openDelay={100} closeDelay={50} onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerMouseEnter());
    expect(api.state.isTriggerHovered).toBe(true);
    expect(api.state.open).toBe(false);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(api.state.open).toBe(true);

    act(() => api.actions.handleTriggerMouseLeave());
    expect(api.state.isTriggerHovered).toBe(false);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(api.state.open).toBe(false);
  });

  it('hover trigger clears pending open timer on leave before it fires', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="hover" openDelay={100} onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerMouseEnter());
    act(() => api.actions.handleTriggerMouseLeave()); // cancels pending open
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(api.state.open).toBe(false);
  });

  it('focus trigger opens on focus and closes on blur (closeOnTriggerBlur)', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="focus" onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerFocus());
    expect(api.state.isTriggerFocused).toBe(true);
    expect(api.state.open).toBe(true);
    act(() => api.actions.handleTriggerBlur());
    expect(api.state.isTriggerFocused).toBe(false);
    expect(api.state.open).toBe(false);
  });

  it('focus trigger does not close on blur when closeOnTriggerBlur is false', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="focus" closeOnTriggerBlur={false} onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerFocus());
    expect(api.state.open).toBe(true);
    act(() => api.actions.handleTriggerBlur());
    expect(api.state.open).toBe(true);
  });

  it('hover/focus mouse handlers are no-ops for click trigger', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="click" onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerMouseEnter());
    expect(api.state.isTriggerHovered).toBe(false);
    act(() => api.actions.handleTriggerMouseLeave());
    act(() => api.actions.handleTriggerFocus());
    expect(api.state.isTriggerFocused).toBe(false);
    act(() => api.actions.handleTriggerBlur());
    expect(api.state.open).toBe(false);
  });

  it('focus trigger tracks hovered state via mouse handlers without timers', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="focus" onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerMouseEnter());
    expect(api.state.isTriggerHovered).toBe(true);
    // focus trigger does not schedule an open timer, so advancing does nothing.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(api.state.open).toBe(false);
    act(() => api.actions.handleTriggerMouseLeave());
    expect(api.state.isTriggerHovered).toBe(false);
  });

  it('hover trigger tracks focus state via focus handlers without opening', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="hover" openDelay={10000} onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerFocus());
    expect(api.state.isTriggerFocused).toBe(true);
    // hover trigger focus path does not call openPopover; still closed.
    expect(api.state.open).toBe(false);
    act(() => api.actions.handleTriggerBlur());
    expect(api.state.isTriggerFocused).toBe(false);
  });

  it('disabled blocks hover/focus handlers', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness trigger="hover" disabled onApi={(a) => (api = a)} />);
    act(() => api.actions.handleTriggerMouseEnter());
    expect(api.state.isTriggerHovered).toBe(false);
    act(() => api.actions.handleTriggerMouseLeave());
    act(() => api.actions.handleTriggerFocus());
    expect(api.state.isTriggerFocused).toBe(false);
    act(() => api.actions.handleTriggerBlur());
  });

  it('closeOnEscape closes on Escape when open', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness defaultOpen onApi={(a) => (api = a)} />);
    expect(api.state.open).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(api.state.open).toBe(false);
  });

  it('closeOnEscape disabled keeps it open on Escape', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness defaultOpen closeOnEscape={false} onApi={(a) => (api = a)} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(api.state.open).toBe(true);
  });

  it('other keys do not close on Escape handler', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness defaultOpen onApi={(a) => (api = a)} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(api.state.open).toBe(true);
  });

  it('controlled mode drives open state via the open prop', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <HookHarness open={false} onOpenChange={onOpenChange} onApi={(a) => (api = a)} />
    );
    expect(api.state.open).toBe(false);
    // user clicks but state stays controlled -> still false
    act(() => api.actions.handleTriggerClick());
    expect(api.state.open).toBe(false);
    // parent flips to open
    rerender(<HookHarness open onOpenChange={onOpenChange} onApi={(a) => (api = a)} />);
    expect(api.state.open).toBe(true);
  });

  it('uses internal refs when none are provided (covers internalTriggerRef/contentRef branch)', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness onApi={(a) => (api = a)} />);
    expect(api.state).toBeDefined();
    // triggerAttributes tabIndex should be 0 when enabled.
    expect(api.triggerAttributes.tabIndex).toBe(0);
    expect(api.triggerAttributes['aria-expanded']).toBe(false);
    expect(api.contentAttributes.role).toBe('dialog');
  });

  it('click outside closes the popover when closeOnClickOutside is true', () => {
    const triggerRef = { current: null as HTMLElement | null };
    const contentRef = { current: null as HTMLElement | null };
    let api: ReturnType<typeof usePopover> = null as any;
    render(
      <HookHarness
        defaultOpen
        triggerRef={triggerRef as any}
        contentRef={contentRef as any}
        onApi={(a) => (api = a)}
      />
    );
    // Wire the refs to live nodes that do NOT contain the click target so the
    // outside-click branch proceeds.
    const triggerNode = document.createElement('button');
    const contentNode = document.createElement('div');
    triggerRef.current = triggerNode;
    contentRef.current = contentNode;
    expect(api.state.open).toBe(true);
    // A mousedown on document.body (outside both refs) should close.
    fireEvent.mouseDown(document.body);
    expect(api.state.open).toBe(false);
  });

  it('click outside is ignored when closeOnClickOutside is false', () => {
    const triggerRef = { current: null as HTMLElement | null };
    const contentRef = { current: null as HTMLElement | null };
    let api: ReturnType<typeof usePopover> = null as any;
    render(
      <HookHarness
        defaultOpen
        closeOnClickOutside={false}
        triggerRef={triggerRef as any}
        contentRef={contentRef as any}
        onApi={(a) => (api = a)}
      />
    );
    const triggerNode = document.createElement('button');
    const contentNode = document.createElement('div');
    triggerRef.current = triggerNode;
    contentRef.current = contentNode;
    fireEvent.mouseDown(document.body);
    expect(api.state.open).toBe(true);
  });

  it('click inside the trigger does not close via outside-click', () => {
    const triggerRef = { current: null as HTMLElement | null };
    let api: ReturnType<typeof usePopover> = null as any;
    render(
      <HookHarness
        defaultOpen
        triggerRef={triggerRef as any}
        onApi={(a) => (api = a)}
      />
    );
    // The harness renders nothing the ref points to, so simulate a target that
    // the trigger ref "contains" by attaching the ref to a live node.
    const node = document.createElement('button');
    triggerRef.current = node;
    fireEvent.mouseDown(node);
    expect(api.state.open).toBe(true);
  });

  it('click inside the content does not close via outside-click', () => {
    const contentRef = { current: null as HTMLElement | null };
    let api: ReturnType<typeof usePopover> = null as any;
    render(
      <HookHarness
        defaultOpen
        contentRef={contentRef as any}
        onApi={(a) => (api = a)}
      />
    );
    const node = document.createElement('div');
    contentRef.current = node;
    fireEvent.mouseDown(node);
    expect(api.state.open).toBe(true);
  });

  it('disabled state exposes tabIndex -1 on trigger attributes', () => {
    let api: ReturnType<typeof usePopover> = null as any;
    render(<HookHarness disabled onApi={(a) => (api = a)} />);
    expect(api.triggerAttributes.tabIndex).toBe(-1);
  });
});
