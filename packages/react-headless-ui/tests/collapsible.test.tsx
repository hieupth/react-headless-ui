import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../src/components/Collapsible';
import { useCollapsible } from '../src/hooks';

describe('Collapsible', () => {
  it('renders a trigger and content', () => {
    render(
      <Collapsible trigger="Toggle">
        <span>Hidden body</span>
      </Collapsible>
    );
    expect(screen.getByText('Toggle')).toBeInTheDocument();
  });

  it('calls onOpenChange when the trigger is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Collapsible trigger="Toggle" onOpenChange={onOpenChange}>
        Body
      </Collapsible>
    );
    await user.click(screen.getByText('Toggle'));
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('expands content when defaultOpen is true', () => {
    render(
      <Collapsible trigger="Toggle" defaultOpen>
        <span>Shown</span>
      </Collapsible>
    );
    const trigger = screen.getByText('Toggle');
    expect(trigger.closest('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('is collapsed by default', () => {
    render(
      <Collapsible trigger="Toggle">
        <span>Hidden</span>
      </Collapsible>
    );
    const trigger = screen.getByText('Toggle').closest('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens via keyboard Enter on the trigger', () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible trigger="Toggle" onOpenChange={onOpenChange}>
        Body
      </Collapsible>
    );
    const trigger = screen.getByText('Toggle').closest('button') as HTMLElement;
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Collapsible trigger="Toggle" disabled onOpenChange={onOpenChange}>
        Body
      </Collapsible>
    );
    await user.click(screen.getByText('Toggle'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('respects controlled open state', () => {
    const { rerender } = render(
      <Collapsible trigger="Toggle" open={false}>
        Body
      </Collapsible>
    );
    let trigger = screen.getByText('Toggle').closest('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <Collapsible trigger="Toggle" open>
        Body
      </Collapsible>
    );
    trigger = screen.getByText('Toggle').closest('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses custom TriggerComponent and ContentComponent', () => {
    render(
      <Collapsible
        trigger="Toggle"
        defaultOpen
        TriggerComponent={({ isOpen, children }) => (
          <button data-testid="custom-trigger">{children} {isOpen ? '↑' : '↓'}</button>
        )}
        ContentComponent={({ isOpen, children }) => (
          <div data-testid="custom-content">{children}</div>
        )}
      >
        Body
      </Collapsible>
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('flips aria-expanded with controlled open state', () => {
    const { rerender } = render(
      <Collapsible trigger="Toggle" open>Body</Collapsible>
    );
    expect(screen.getByText('Toggle').closest('button')).toHaveAttribute('aria-expanded', 'true');
    rerender(<Collapsible trigger="Toggle" open={false}>Body</Collapsible>);
    expect(screen.getByText('Toggle').closest('button')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('CollapsibleTrigger / CollapsibleContent', () => {
  it('render with isOpen state', () => {
    render(
      <div>
        <CollapsibleTrigger isOpen={false}>Toggle</CollapsibleTrigger>
        <CollapsibleContent isOpen={false}>Body</CollapsibleContent>
      </div>
    );
    expect(screen.getByText('Toggle').closest('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('render the open trigger and animated content (isOpen + animated)', () => {
    const { container } = render(
      <div>
        <CollapsibleTrigger isOpen={true}>Toggle</CollapsibleTrigger>
        <CollapsibleContent isOpen={true} animated={true}>Body</CollapsibleContent>
      </div>
    );
    const trigger = screen.getByText('Toggle').closest('button')!;
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.className).toContain('collapsible-trigger-open');
    const content = container.querySelector('.collapsible-content')!;
    expect(content.className).toContain('collapsible-animated');
    expect(content.getAttribute('style')).toContain('height: auto');
  });

  it('render non-animated closed content', () => {
    const { container } = render(<CollapsibleContent isOpen={false} animated={false}>Body</CollapsibleContent>);
    const content = container.querySelector('.collapsible-content')!;
    expect(content.className).toContain('collapsible-not-animated');
    expect(content.getAttribute('style') || '').toContain('transition: none');
  });
});

describe('Collapsible animated=false', () => {
  it('marks the default content as not-animated when animated={false}', () => {
    const { container } = render(
      <Collapsible trigger="Toggle" defaultOpen animated={false}>
        <span>Body</span>
      </Collapsible>
    );
    const content = container.querySelector('.collapsible-content')!;
    expect(content.className).toContain('collapsible-not-animated');
  });
});

describe('useCollapsible', () => {
  it('open invokes onOpenChange with true', () => {
    const onOpenChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCollapsible({ onOpenChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.open());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('close invokes onOpenChange with false', () => {
    const onOpenChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCollapsible({ defaultOpen: true, onOpenChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.close());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('toggle flips the open state', () => {
    const onOpenChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCollapsible({ onOpenChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.toggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it('actions are no-ops when disabled', () => {
    const onOpenChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCollapsible({ disabled: true, onOpenChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.toggle());
    act(() => result.actions.open());
    act(() => result.actions.close());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('open() is a no-op when already open', () => {
    const onOpenChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCollapsible({ defaultOpen: true, onOpenChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.open());
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('Collapsible standalone sub-components', () => {
  it('CollapsibleTrigger fires onClick and reflects open state', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <CollapsibleTrigger isOpen={false} onClick={onClick}>
        Toggle
      </CollapsibleTrigger>
    );
    await user.click(screen.getByRole('button', { name: /Toggle/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
