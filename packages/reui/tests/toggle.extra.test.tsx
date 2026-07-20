import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Toggle,
  ToggleIcon,
  FormatToggle,
  ViewModeToggle,
} from '../src/components/Toggle';

describe('Toggle component variants and icons', () => {
  it('applies variant, size, and pressed classes', () => {
    render(<Toggle aria-label="t" variant="outline" size="lg" defaultPressed className="custom-cls" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('toggle-outline');
    expect(btn.className).toContain('toggle-lg');
    expect(btn.className).toContain('toggle-pressed');
    expect(btn.className).toContain('custom-cls');
  });

  it('applies ghost variant and sm size when unpressed', () => {
    render(<Toggle aria-label="t" variant="ghost" size="sm" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('toggle-ghost');
    expect(btn.className).toContain('toggle-sm');
    expect(btn.className).toContain('toggle-unpressed');
  });

  it('toggles the disabled class', () => {
    render(<Toggle aria-label="t" disabled />);
    expect(screen.getByRole('button').className).toContain('toggle-disabled');
  });

  it('renders pressedChildren when pressed and unpressedChildren when not', async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="t" pressedChildren="ON" unpressedChildren="OFF" />);
    expect(screen.getByText('OFF')).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  it('falls back to children when neither pressed nor unpressed children given (pressed branch)', () => {
    render(<Toggle aria-label="t" defaultPressed>Fallback</Toggle>);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('renders pressedIcon when pressed', () => {
    render(
      <Toggle aria-label="t" defaultPressed pressedIcon={<span data-testid="pi">P</span>} unpressedIcon={<span data-testid="ui">U</span>} />
    );
    expect(screen.getByTestId('pi')).toBeInTheDocument();
    expect(screen.queryByTestId('ui')).not.toBeInTheDocument();
  });

  it('renders unpressedIcon when not pressed', () => {
    render(
      <Toggle aria-label="t" pressedIcon={<span data-testid="pi">P</span>} unpressedIcon={<span data-testid="ui">U</span>} />
    );
    expect(screen.getByTestId('ui')).toBeInTheDocument();
    expect(screen.queryByTestId('pi')).not.toBeInTheDocument();
  });

  it('renders no icon span when neither pressedIcon nor unpressedIcon given', () => {
    render(<Toggle aria-label="t">Content</Toggle>);
    expect(screen.getByRole('button').querySelector('.toggle-icon')).toBeNull();
  });

  it('renders nothing when no content or icon supplied', () => {
    render(<Toggle aria-label="t" />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    // no toggle-content / toggle-icon spans
    expect(btn.querySelector('.toggle-content')).toBeNull();
    expect(btn.querySelector('.toggle-icon')).toBeNull();
  });

  it('wraps icon in an aria-hidden span', () => {
    render(<Toggle aria-label="t" pressedIcon={<span>X</span>} defaultPressed />);
    const iconSpan = screen.getByRole('button').querySelector('.toggle-icon');
    expect(iconSpan).not.toBeNull();
    expect(iconSpan?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('ToggleIcon', () => {
  it('renders an icon-only toggle when both icons provided', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <ToggleIcon
        aria-label="icon-toggle"
        pressedIcon={<span data-testid="pi">P</span>}
        unpressedIcon={<span data-testid="ui">U</span>}
        onPressedChange={onPressedChange}
      />
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('toggle-icon-only');
    expect(screen.getByTestId('ui')).toBeInTheDocument();
    await user.click(btn);
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
  });

  it('returns null and warns when icons are missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ToggleIcon aria-label="t" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      'ToggleIcon requires both pressedIcon and unpressedIcon props'
    );
    warn.mockRestore();
  });

  it('returns null when only one icon provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ToggleIcon aria-label="t" pressedIcon={<span>P</span>} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('FormatToggle', () => {
  it.each(['bold', 'italic', 'underline', 'strikethrough'] as const)(
    'renders format %s with toggle-format class',
    (format) => {
      render(<FormatToggle aria-label={`f-${format}`} format={format} />);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('toggle-format');
      // unpressed icon path is rendered
      expect(btn.querySelector('svg path')).not.toBeNull();
    }
  );

  it('toggles when clicked and fires onPressedChange', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<FormatToggle aria-label="b" format="bold" onPressedChange={onPressedChange} />);
    await user.click(screen.getByRole('button'));
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
  });
});

describe('ViewModeToggle', () => {
  it('renders on/off modes with labels and icons', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <ViewModeToggle
        aria-label="vm"
        modes={{
          on: { icon: <span data-testid="on-i">ONI</span>, label: 'List' },
          off: { icon: <span data-testid="off-i">OFFI</span>, label: 'Grid' },
        }}
        onPressedChange={onPressedChange}
      />
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('toggle-view-mode');
    // unpressed (off) state shows off label + off icon
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByTestId('off-i')).toBeInTheDocument();

    await user.click(btn);
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByTestId('on-i')).toBeInTheDocument();
  });
});
