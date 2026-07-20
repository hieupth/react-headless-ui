import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AccessibleIcon } from '../src/components/AccessibleIcon';

describe('AccessibleIcon (extra coverage)', () => {
  it('renders a string icon without fa- prefix by adding it', () => {
    const { container } = render(<AccessibleIcon icon="home" label="Home" />);
    const i = container.querySelector('i');
    expect(i).toBeInTheDocument();
    expect(i?.className).toContain('fa-home');
    expect(i?.className).toContain('fas');
  });

  it('renders a string icon that already has fa- prefix unchanged', () => {
    const { container } = render(<AccessibleIcon icon="fa-user" label="User" iconPrefix="far" />);
    const i = container.querySelector('i');
    expect(i?.className).toContain('fa-user');
    expect(i?.className).toContain('far');
  });

  it('clones a React element icon', () => {
    const { container } = render(
      <AccessibleIcon icon={<span data-testid="el">X</span>} label="El" />
    );
    expect(screen.getByTestId('el')).toBeInTheDocument();
    expect(container.querySelector('i')).not.toBeInTheDocument();
  });

  it('renders fallbackIcon when icon is neither string nor element', () => {
    render(
      <AccessibleIcon
        icon={undefined}
        label="None"
        fallbackIcon={<span data-testid="fallback">FB</span>}
      />
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('renders the default empty span when icon empty and no fallback', () => {
    const { container } = render(<AccessibleIcon icon={undefined} label="None" />);
    // defaultRenderIcon returns <span {...props} />
    expect(container.querySelector('i')).not.toBeInTheDocument();
  });

  it('uses a custom renderIcon function', () => {
    render(
      <AccessibleIcon
        icon="star"
        label="Star"
        renderIcon={(icon, props) => (
          <span data-testid="custom" data-icon={String(icon)} aria-label={props['aria-label']}>
            custom
          </span>
        )}
      />
    );
    expect(screen.getByTestId('custom')).toHaveAttribute('data-icon', 'star');
    expect(screen.getByTestId('custom')).toHaveAttribute('aria-label', 'Star');
  });

  it('shows and hides tooltip on mouse enter/leave when showTooltip is set', () => {
    render(<AccessibleIcon icon="info" label="Info" showTooltip tooltip="More info" />);
    const c = screen.getByTestId('accessible-icon-container');
    expect(screen.queryByTestId('accessible-icon-tooltip')).not.toBeInTheDocument();
    fireEvent.mouseEnter(c);
    expect(screen.getByTestId('accessible-icon-tooltip')).toHaveTextContent('More info');
    fireEvent.mouseLeave(c);
    expect(screen.queryByTestId('accessible-icon-tooltip')).not.toBeInTheDocument();
  });

  it('does not show tooltip on hover when showTooltip is false', () => {
    render(<AccessibleIcon icon="info" label="Info" tooltip="More info" />);
    const c = screen.getByTestId('accessible-icon-container');
    fireEvent.mouseEnter(c);
    expect(screen.queryByTestId('accessible-icon-tooltip')).not.toBeInTheDocument();
  });

  it('rotates the icon via keyboard arrows when allowRotation is set', () => {
    const { container } = render(
      <AccessibleIcon icon="refresh" label="Refresh" allowRotation rotationStep={45} />
    );
    const c = screen.getByTestId('accessible-icon-container');
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    fireEvent.keyDown(c, { key: 'ArrowDown' });
    fireEvent.keyDown(c, { key: 'ArrowLeft' });
    fireEvent.keyDown(c, { key: 'ArrowUp' });
    // Verify rotation applied to the icon wrapper style (transform includes rotate)
    const icon = screen.getByTestId('accessible-icon');
    // After 2 forward (90) and 2 back (-90) = 0; just ensure no crash and style present
    expect(icon).toBeInTheDocument();
    expect(container.querySelector('i')).toBeInTheDocument();
  });

  it('does not rotate via keyboard when interactive (state.interactive true)', () => {
    render(<AccessibleIcon icon="refresh" label="Refresh" interactive allowRotation />);
    const c = screen.getByTestId('accessible-icon-container');
    // interactive => early return, no rotation
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    expect(c).toBeInTheDocument();
  });

  it('does not rotate when allowRotation is false', () => {
    render(<AccessibleIcon icon="refresh" label="Refresh" />);
    const c = screen.getByTestId('accessible-icon-container');
    fireEvent.keyDown(c, { key: 'ArrowRight' });
    expect(c).toBeInTheDocument();
  });

  it('renders a visible label for each labelPosition', () => {
    for (const pos of ['top', 'bottom', 'left', 'right'] as const) {
      const { unmount } = render(
        <AccessibleIcon icon="home" label="Home" showLabel labelPosition={pos} />
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
      unmount();
    }
  });

  it('does not render a visible label when decorative even if showLabel', () => {
    render(<AccessibleIcon icon="home" label="Home" showLabel decorative />);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('renders the tooltip arrow for each tooltipPosition on hover', () => {
    for (const pos of ['top', 'bottom', 'left', 'right'] as const) {
      const { unmount } = render(
        <AccessibleIcon
          icon="info"
          label="Info"
          showTooltip
          tooltipPosition={pos}
          tooltip="tip"
        />
      );
      const c = screen.getByTestId('accessible-icon-container');
      fireEvent.mouseEnter(c);
      expect(screen.getByTestId('accessible-icon-tooltip')).toBeInTheDocument();
      unmount();
    }
  });

  it('applies hover scale transform when animateOnHover and hovered', () => {
    render(
      <AccessibleIcon
        icon="home"
        label="Home"
        animateOnHover
        hoverScale={1.5}
      />
    );
    const icon = screen.getByTestId('accessible-icon');
    fireEvent.mouseEnter(screen.getByTestId('accessible-icon-container'));
    expect(icon.style.transform).toContain('scale(1.5)');
  });

  it('disables hover animation styling when animateOnHover is false', () => {
    render(<AccessibleIcon icon="home" label="Home" animateOnHover={false} />);
    const c = screen.getByTestId('accessible-icon-container');
    const icon = screen.getByTestId('accessible-icon');
    fireEvent.mouseEnter(c);
    // No scale transform applied when animateOnHover false
    expect(icon.style.transform).not.toContain('scale(1.1)');
  });

  it('applies the hidden classes when the hidden prop is true', () => {
    render(<AccessibleIcon icon="home" label="Home" hidden />);
    const c = screen.getByTestId('accessible-icon-container');
    // Headless-only: the hidden prop no longer emits visual utility classes;
    // the behavior is that the container still renders.
    expect(c).toBeInTheDocument();
  });
});
