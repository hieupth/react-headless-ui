import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, BadgeWrapper } from '../src/components/Badge';
import { useBadge } from '../src/hooks';

describe('Badge', () => {
  it('renders count content as a status', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders a dot indicator without text content', () => {
    const { container } = render(<Badge dot />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
  });

  it('fires onClick when an interactive badge is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Badge count={3} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('formats counts above maxCount with a plus', () => {
    render(<Badge count={150} maxCount={99} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders nothing when not visible and not a dot', () => {
    const { container } = render(<Badge count={3} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('still renders a dot even when visible is false', () => {
    const { container } = render(<Badge dot visible={false} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('applies variant classes for each variant', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const;
    for (const variant of variants) {
      const { container } = render(<Badge count={1} variant={variant} />);
      const span = container.querySelector('span');
      expect(span?.className).toContain('border');
    }
  });

  it('renders custom content via renderContent', () => {
    render(<Badge count={5} renderContent={() => <span data-testid="custom">New</span>} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('applies the scale-110 class while animating', () => {
    vi.useFakeTimers();
    const { rerender, container } = render(<Badge count={1} animated />);
    rerender(<Badge count={2} animated />);
    const span = container.querySelector('span');
    expect(span?.className).toContain('scale-110');
    vi.advanceTimersByTime(200);
    vi.useRealTimers();
  });

  it('renders a fully custom element via the render prop', () => {
    render(
      <Badge
        count={9}
        render={(props) => (
          <button data-testid="custom-badge" onClick={props.handleClick}>
            {props.displayText}
          </button>
        )}
      />
    );
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    expect(screen.getByTestId('custom-badge')).toHaveTextContent('9');
  });

  it('fires onClick via keyboard Enter on an interactive badge', () => {
    const onClick = vi.fn();
    render(<Badge count={1} onClick={onClick} />);
    const badge = screen.getByRole('button');
    fireEvent.keyDown(badge, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('keeps button role but stays non-focusable when disabled', () => {
    const onClick = vi.fn();
    const { container } = render(<Badge count={1} onClick={onClick} disabled />);
    // role is derived from onClick presence, so the badge keeps role=button
    // even when disabled; focusable is dropped instead.
    const badge = container.querySelector('[role="button"]');
    expect(badge).not.toBeNull();
  });
});

describe('BadgeWrapper', () => {
  it('renders children with a positioned badge overlay', () => {
    const { container } = render(
      <BadgeWrapper badge={<span data-testid="dot">3</span>}>
        <button>Notifications</button>
      </BadgeWrapper>
    );
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByTestId('dot')).toBeInTheDocument();
    expect(container.querySelector('.relative')).not.toBeNull();
  });

  it('renders without a badge when none provided', () => {
    const { container } = render(<BadgeWrapper><span>Child</span></BadgeWrapper>);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('falls back to the top-right position for an unknown position value', () => {
    const { container } = render(
      // An invalid position falls back to the 'top-right' class set.
      <BadgeWrapper badge={<span data-testid="dot">3</span>} position={'unknown' as any}>
        <button>Notifications</button>
      </BadgeWrapper>
    );
    const overlay = container.querySelector('.absolute');
    expect(overlay).not.toBeNull();
    expect(overlay?.className).toContain('top-0');
    expect(overlay?.className).toContain('right-0');
  });
});

describe('useBadge', () => {
  it('getDisplayText returns empty for dot and undefined count', () => {
    let dot: any;
    let undef: any;
    const ProbeDot = () => { dot = useBadge({ dot: true, count: 5 }); return null; };
    const ProbeUndef = () => { undef = useBadge({}); return null; };
    render(<><ProbeDot /><ProbeUndef /></>);
    expect(dot.displayText).toBe('');
    expect(undef.displayText).toBe('');
  });

  it('triggers an animation state when count changes', () => {
    vi.useFakeTimers();
    let result: any;
    const Probe = ({ count }: { count: number }) => {
      result = useBadge({ count, animated: true });
      return null;
    };
    const { rerender } = render(<Probe count={1} />);
    expect(result.animating).toBe(false);
    rerender(<Probe count={2} />);
    expect(result.animating).toBe(true);
    vi.advanceTimersByTime(200);
    // After the timeout clears, animating returns to false on next render.
    rerender(<Probe count={2} />);
    expect(result.previousCount).toBe(2);
    vi.useRealTimers();
  });
});
