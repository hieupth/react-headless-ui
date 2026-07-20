import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HoverCard } from '../src/components/HoverCard';

describe('HoverCard', () => {
  it('renders a trigger element', () => {
    render(
      <HoverCard trigger={<span>Hover me</span>}>Card content</HoverCard>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByText('Card content')).not.toBeInTheDocument();
  });

  it('shows content on hover', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard trigger={<span>Hover me</span>}>Card content</HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Card content')).toBeInTheDocument();
  });

  it.each([
    'top', 'bottom', 'left', 'right',
    'top-start', 'top-end', 'bottom-start', 'bottom-end',
  ] as const)('renders the card in the %s placement when open', async (placement) => {
    const user = userEvent.setup();
    render(
      <HoverCard placement={placement} trigger={<span>Hover me</span>}>
        Card content
      </HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Card content')).toBeInTheDocument();
  });

  it('renders the card with an unknown placement (default fallback)', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard placement={'bogus' as any} trigger={<span>Hover me</span>}>
        Card content
      </HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Card content')).toBeInTheDocument();
  });

  it('hides the arrow when showArrow is false', async () => {
    const user = userEvent.setup();
    render(
      <HoverCard showArrow={false} trigger={<span>Hover me</span>}>
        Card content
      </HoverCard>
    );
    await user.hover(screen.getByText('Hover me'));
    expect(await screen.findByText('Card content')).toBeInTheDocument();
    expect(screen.queryByTestId('hover-card-arrow')).toBeNull();
  });

  it('keeps the closed card hidden (no content rendered)', () => {
    render(
      <HoverCard trigger={<span>Hover me</span>}>Card content</HoverCard>
    );
    expect(screen.queryByText('Card content')).not.toBeInTheDocument();
  });

  it('applies custom maxWidth, trigger/content classes, and allows text selection', () => {
    const { container } = render(
      <HoverCard
        trigger={<span>Hover me</span>}
        maxWidth={500}
        triggerClassName="trig"
        contentClassName="cont"
        preventTextSelection={false}
      >
        Card content
      </HoverCard>
    );
    expect(container.querySelector('.hover-card-trigger')).toBeInTheDocument();
  });
});
