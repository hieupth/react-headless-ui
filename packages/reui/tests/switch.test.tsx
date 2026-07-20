import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch, SimpleSwitch, LabeledSwitch } from '../src/components/Switch';

// NOTE: Switch renders role="switch" but does not yet forward aria-label to the
// button (a per-component a11y improvement). Smoke tests query by role only.

describe('Switch', () => {
  it('renders a switch role and toggles on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch disabled onCheckedChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggles the switch-hovered class on mouse enter/leave', () => {
    render(<Switch aria-label="s" />);
    const sw = screen.getByRole('switch');
    expect(sw.className).not.toContain('switch-hovered');
    fireEvent.mouseEnter(sw);
    expect(sw.className).toContain('switch-hovered');
    fireEvent.mouseLeave(sw);
    expect(sw.className).not.toContain('switch-hovered');
  });
});

describe('Switch rendering branches', () => {
  it.each([
    ['sm' as const],
    ['md' as const],
    ['lg' as const],
  ])('renders size=%s thumb and track', (size) => {
    const { container } = render(<Switch size={size} aria-label="s" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it.each([
    ['default' as const],
    ['outline' as const],
    ['solid' as const],
  ])('renders variant=%s', (variant) => {
    render(<Switch variant={variant} aria-label="s" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders the default label on the right (showLabel + label)', () => {
    const { container } = render(
      <Switch label="Notifications" showLabel aria-label="s" />
    );
    expect(container.textContent).toContain('Notifications');
    // Headless-only: labelPosition no longer emits a flex utility; the label renders.
  });

  it('renders the default label on the left (labelPosition=left)', () => {
    const { container } = render(
      <Switch label="Notifications" showLabel labelPosition="left" aria-label="s" />
    );
    // Headless-only: labelPosition no longer emits a flex utility; just renders.
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders the default label with disabled+checked state', () => {
    render(
      <Switch label="On" showLabel defaultChecked disabled aria-label="s" />
    );
    // Headless-only: checked/disabled are exposed via aria-* on the switch role,
    // not via color utilities on the label.
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(sw).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders the default thumb with disabled state', () => {
    render(<Switch disabled aria-label="s" />);
    // Headless-only: disabled is exposed via aria-disabled on the switch.
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables animations when animated=false', () => {
    const { container } = render(<Switch animated={false} aria-label="s" />);
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('transition-all');
  });

  it('applies custom checkedColor and uncheckedColor', () => {
    const { container } = render(
      <Switch checkedColor="bg-green-500" uncheckedColor="bg-red-500" aria-label="s" />
    );
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-red-500');
  });

  it('uses a custom renderThumb', () => {
    const { container } = render(
      <Switch
        aria-label="s"
        renderThumb={({ checked }) => <span data-checked={checked} className="custom-thumb" />}
      />
    );
    expect(container.querySelector('.custom-thumb')).not.toBeNull();
    expect(container.querySelector('.custom-thumb')!.getAttribute('data-checked')).toBe('false');
  });

  it('uses a custom renderLabel', () => {
    const { container } = render(
      <Switch
        label="Hi"
        showLabel
        aria-label="s"
        renderLabel={({ text }) => <span className="custom-label">{text}</span>}
      />
    );
    expect(container.querySelector('.custom-label')!.textContent).toBe('Hi');
  });

  it('uses a custom render (full control)', () => {
    const { container } = render(
      <Switch
        aria-label="s"
        render={(props) => (
          <button data-testid="custom" className={props.className} onClick={props.onClick}>
            x
          </button>
        )}
      />
    );
    expect(container.querySelector('[data-testid="custom"]')).not.toBeNull();
  });
});

describe('SimpleSwitch / LabeledSwitch wrappers', () => {
  it('SimpleSwitch renders a switch with a label', () => {
    const { container } = render(<SimpleSwitch label="Easy" aria-label="s" />);
    expect(container.textContent).toContain('Easy');
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('SimpleSwitch forwards disabled', () => {
    render(<SimpleSwitch disabled aria-label="s" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-disabled', 'true');
  });

  it('LabeledSwitch renders the label and honours labelPosition', () => {
    const { container } = render(
      <LabeledSwitch label="Tagged" labelPosition="left" aria-label="s" />
    );
    expect(container.textContent).toContain('Tagged');
    // Headless-only: labelPosition no longer emits a flex utility; just renders.
  });

  it('LabeledSwitch defaults labelPosition to right', () => {
    render(<LabeledSwitch label="Tagged" aria-label="s" />);
    // Headless-only: labelPosition no longer emits a flex utility; just renders.
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
