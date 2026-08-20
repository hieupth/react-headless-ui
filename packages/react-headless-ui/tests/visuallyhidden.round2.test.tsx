import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisuallyHidden } from '../src/components/VisuallyHidden';

// Round-2 audit fix: the focusable variant never became visible on focus —
// the reveal was gated on unreachable hook state. The component now tracks
// DOM focus itself (onFocus/onBlur state toggling, no global CSS) and swaps
// the inline sr-only recipe for visible box styles while focused.

describe('VisuallyHidden round-2 fixes', () => {
  it('applies the sr-only inline recipe while unfocused', () => {
    render(<VisuallyHidden focusable>Skip to main content</VisuallyHidden>);
    const el = screen.getByTestId('visually-hidden');
    expect(el).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    });
    expect(el).not.toHaveClass('visually-hidden-focused');
  });

  it('becomes visible while focused and returns to sr-only on blur', () => {
    render(
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to main content
      </VisuallyHidden>
    );
    const el = screen.getByTestId('visually-hidden');

    fireEvent.focus(el);
    expect(el).toHaveClass('visually-hidden-focused');
    expect(el).toHaveStyle({
      position: 'static',
      width: 'auto',
      height: 'auto',
      overflow: 'visible',
      clip: 'auto'
    });

    fireEvent.blur(el);
    expect(el).not.toHaveClass('visually-hidden-focused');
    expect(el).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    });
  });

  it('invokes the consumer onFocus/onBlur props on focus toggling', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <VisuallyHidden focusable onFocus={onFocus} onBlur={onBlur}>
        Hidden helper
      </VisuallyHidden>
    );
    const el = screen.getByTestId('visually-hidden');
    fireEvent.focus(el);
    fireEvent.blur(el);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
