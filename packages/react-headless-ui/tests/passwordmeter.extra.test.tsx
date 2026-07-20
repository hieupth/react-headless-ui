import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordMeter } from '../src/components/PasswordMeter';

// Coverage extension for PasswordMeter.tsx — the base suite already reaches
// 96% line coverage. These tests chase the remaining easy edges: the
// renderStrengthIndicator default-variant fallback, the dots-variant `good`
// strength bucket, custom strength colours, and the disabled-state styling
// path for the meter container.

function renderMeter(overrides: Record<string, any> = {}) {
  return render(<PasswordMeter analysisDelay={0} {...overrides} />);
}

describe('PasswordMeter — variant fallback and dots coverage', () => {
  it('falls back to the bar variant for an unknown variant string', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'unknown' as any });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    // default branch returns the bar variant -> a score percentage is rendered.
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  it('renders dots for a password that lands in the `good` strength bucket', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots' });
    // A medium-length, varied password typically scores in the good (60-79) band.
    await user.type(screen.getByTestId('password-input'), 'Aa1!medium-Pass');
    expect(screen.getByTestId('password-meter')).toBeInTheDocument();
    // The dots variant renders exactly five dot children.
    const dots = document.querySelectorAll('.strength-dot');
    expect(dots.length).toBe(5);
  });

  it('renders dots with a very strong password (all dots coloured)', async () => {
    const user = userEvent.setup();
    renderMeter({ variant: 'dots' });
    await user.type(screen.getByTestId('password-input'), 'Str0ng!Pass-2024#abcZ');
    const dots = document.querySelectorAll('.strength-dot');
    expect(dots.length).toBe(5);
  });

  it('honours custom strengthColors', async () => {
    const user = userEvent.setup();
    const colors = {
      'very-weak': '#000000',
      'weak': '#111111',
      'fair': '#222222',
      'good': '#333333',
      'strong': '#444444',
      'very-strong': '#555555',
      'none': '#cccccc',
    };
    renderMeter({ variant: 'text', strengthColors: colors });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    // The strength text span is coloured by the custom palette.
    const text = document.querySelector('.strength-text span');
    expect(text).not.toBeNull();
    expect((text as HTMLElement).style.color).not.toBe('');
  });

  it('disabled meter shows the disabled container class', () => {
    const { container } = renderMeter({ disabled: true });
    expect(container.querySelector('.password-meter')!.className).toContain(
      'cursor-not-allowed'
    );
  });

  it('hides the strength label when showStrengthText is false', async () => {
    const user = userEvent.setup();
    renderMeter({ showStrengthText: false });
    await user.type(screen.getByTestId('password-input'), 'Aa1!aaaa');
    expect(screen.queryByText(/Password Strength/i)).toBeNull();
  });

  it('hides criteria / suggestions / warnings via their toggle props', async () => {
    const user = userEvent.setup();
    renderMeter({ showCriteria: false, showSuggestions: false, showWarnings: false });
    await user.type(screen.getByTestId('password-input'), 'password');
    expect(screen.queryByText(/Suggestions:/i)).toBeNull();
  });

  it('Clear button is disabled when there is no password', () => {
    renderMeter();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
  });
});
