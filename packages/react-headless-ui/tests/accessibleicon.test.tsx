import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AccessibleIcon } from '../src/components/AccessibleIcon';
import { useAccessibleIcon } from '../src/hooks';

describe('AccessibleIcon', () => {
  it('renders an icon container exposing the label to assistive tech', () => {
    render(<AccessibleIcon icon="home" label="Home" />);
    expect(screen.getByTestId('accessible-icon-container')).toBeInTheDocument();
    // The wrapper exposes the label via aria-label for assistive tech.
    expect(screen.getByTestId('accessible-icon')).toHaveAttribute('aria-label', 'Home');
  });

  it('marks the icon as aria-hidden when decorative', () => {
    render(<AccessibleIcon icon="star" label="Star" decorative />);
    // The inner icon wrapper forwards aria-hidden via attributes from the hook.
    expect(screen.getByTestId('accessible-icon')).toHaveAttribute('aria-hidden', 'true');
  });
});

// Probe that binds the rendered element to the SAME ref the hook uses for its
// keydown listener, so keyboard events reach the hook's handler.
function Probe(props: Parameters<typeof useAccessibleIcon>[0]) {
  const iconRef = React.createRef<HTMLElement>();
  useAccessibleIcon({ ...props, iconRef });
  return <span ref={iconRef as any} data-testid="icon" tabIndex={0}>icon</span>;
}

describe('useAccessibleIcon keyboard handler', () => {
  it('returns early when not interactive (no onClick fired)', () => {
    const onClick = vi.fn();
    render(<Probe onClick={onClick} />);
    fireEvent.keyDown(screen.getByTestId('icon'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('Enter on an interactive icon without onClick is a no-op (guard branch)', () => {
    render(<Probe interactive />);
    expect(() => fireEvent.keyDown(screen.getByTestId('icon'), { key: 'Enter' })).not.toThrow();
  });
});
