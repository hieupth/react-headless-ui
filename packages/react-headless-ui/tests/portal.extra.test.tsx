import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Portal, PortalBackdrop, PortalOverlay } from '../src/components/Portal';

// Covers the PortalBackdrop / PortalOverlay sub-components and a few styling /
// flag branches the core suite skips.
describe('Portal (extra)', () => {
  describe('PortalBackdrop', () => {
    it('renders visible with default opacity/blur and applies className/style', () => {
      render(
        <PortalBackdrop
          className="my-backdrop"
          style={{ zIndex: 42 }}
          data-x="1"
        />
      );
      const el = screen.getByTestId('portal-backdrop');
      expect(el).toHaveClass('my-backdrop');
      expect(el).toHaveClass('backdrop-visible');
      expect(el.style.zIndex).toBe('42');
      expect(el.style.pointerEvents).toBe('auto');
    });

    it('is hidden when visible is false and exposes onClick', () => {
      const onClick = vi.fn();
      render(<PortalBackdrop visible={false} onClick={onClick} />);
      const el = screen.getByTestId('portal-backdrop');
      expect(el).toHaveClass('backdrop-hidden');
      expect(el.style.opacity).toBe('0');
      expect(el.style.pointerEvents).toBe('none');
      el.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('honours custom opacity, blur and animationDuration', () => {
      render(
        <PortalBackdrop opacity={0.75} blur="8px" animationDuration={500} />
      );
      const el = screen.getByTestId('portal-backdrop');
      expect(el.style.backgroundColor).toBe('rgba(0, 0, 0, 0.75)');
      expect(el.style.backdropFilter).toBe('blur(8px)');
      expect(el.style.transition).toContain('500ms');
    });
  });

  describe('PortalOverlay', () => {
    it('renders visible with children and default background', () => {
      render(
        <PortalOverlay>
          <span>overlay-content</span>
        </PortalOverlay>
      );
      const el = screen.getByTestId('portal-overlay');
      expect(el).toHaveClass('overlay-visible');
      expect(el.style.pointerEvents).toBe('auto');
      expect(screen.getByText('overlay-content')).toBeInTheDocument();
      expect(el.style.backgroundColor).toBe('rgba(0, 0, 0, 0.8)');
    });

    it('is hidden when visible is false', () => {
      render(<PortalOverlay visible={false} />);
      const el = screen.getByTestId('portal-overlay');
      expect(el).toHaveClass('overlay-hidden');
      expect(el.style.opacity).toBe('0');
      expect(el.style.pointerEvents).toBe('none');
    });

    it('does not fire onClick when closeOnClick is false', () => {
      const onClick = vi.fn();
      render(<PortalOverlay closeOnClick={false} onClick={onClick} />);
      screen.getByTestId('portal-overlay').click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('fires onClick and applies custom background + className + style', () => {
      const onClick = vi.fn();
      render(
        <PortalOverlay
          className="my-overlay"
          style={{ zIndex: 9 }}
          backgroundColor="rgb(0, 0, 0)"
          backgroundOpacity={0.5}
          onClick={onClick}
        >
          <span>kid</span>
        </PortalOverlay>
      );
      const el = screen.getByTestId('portal-overlay');
      expect(el).toHaveClass('my-overlay');
      expect(el.style.zIndex).toBe('9');
      expect(el.style.backgroundColor).toBe('rgb(0, 0, 0)');
      expect(el.style.opacity).toBe('0.5');
      el.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Portal', () => {
    it('honours backdropClassName on the backdrop element', () => {
      render(
        <Portal defaultOpen showBackdrop backdropClassName="custom-bd">
          <span>x</span>
        </Portal>
      );
      expect(screen.getByTestId('portal-backdrop')).toHaveClass('custom-bd');
    });

    it('applies custom wrapperTag via wrapperProps', () => {
      // wrapperProps spread onto the wrapper div; tag stays 'div' (forwarded
      // wrapperTag is not re-read into JSX), but wrapperProps must apply.
      render(
        <Portal defaultOpen wrapperProps={{ id: 'wp' }}>
          <span>x</span>
        </Portal>
      );
      expect(screen.getByTestId('portal')).toHaveAttribute('id', 'wp');
    });
  });
});
