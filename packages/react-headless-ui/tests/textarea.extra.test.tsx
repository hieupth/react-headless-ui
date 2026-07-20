import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Textarea,
  AutoResizeTextarea,
  LimitedTextarea,
  ControlledTextarea,
} from '../src/components/Textarea';

describe('Textarea extras', () => {
  it('renders a label and focuses the textarea on label click', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Notes" id="notes" aria-label="Notes" />);
    const textarea = screen.getByRole('textbox');
    await user.click(screen.getByText('Notes'));
    expect(textarea).toHaveFocus();
  });

  it('shows a required indicator when required', () => {
    render(<Textarea label="Bio" required aria-label="Bio" id="bio" />);
    expect(screen.getByText(/Bio/)).toBeInTheDocument();
    expect(document.querySelector('.textarea-required-indicator')).toBeInTheDocument();
  });

  it('renders helper text and describes the textarea by it', () => {
    render(<Textarea helperText="Add details" aria-label="H" id="h" />);
    expect(screen.getByText('Add details')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby');
  });

  it('renders an error message with alert role and prefers it over helper text', () => {
    render(<Textarea error="Bad input" helperText="hint" aria-label="E" id="e" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Bad input');
    // helper text should not render when error present
    expect(screen.queryByText('hint')).not.toBeInTheDocument();
  });

  it('marks the textarea aria-invalid when error present', () => {
    render(<Textarea error="oops" aria-label="X" id="x" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows character count without max length', () => {
    render(<Textarea showCharCount defaultValue="hello" aria-label="C" id="c" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows character count with max length format', () => {
    render(<Textarea showCharCount maxLength={10} defaultValue="hi" aria-label="M" id="m" />);
    expect(screen.getByText('2/10')).toBeInTheDocument();
  });

  it('renders char count when only maxLength is set (no showCharCount)', () => {
    render(<Textarea maxLength={10} defaultValue="ab" aria-label="L" id="l" />);
    expect(screen.getByText('2/10')).toBeInTheDocument();
  });

  it('uses a custom char count formatter', () => {
    const formatter = (current: number, max?: number) => `len=${current}/${max ?? '?'}`;
    render(
      <Textarea showCharCount maxLength={8} defaultValue="abc" charCountFormatter={formatter} aria-label="F" id="f" />
    );
    expect(screen.getByText('len=3/8')).toBeInTheDocument();
  });

  it('reflects controlled value and fires onChange with the new value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledTextarea value="init" onChange={onChange} aria-label="Ctrl" id="ctrl" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('init');
    await user.type(textarea, 'X');
    expect(onChange).toHaveBeenCalled();
  });

  it('enforces maxLength in uncontrolled mode by ignoring overflow', async () => {
    const user = userEvent.setup();
    render(<Textarea maxLength={3} defaultValue="ab" aria-label="Max" id="max" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(textarea, 'c');
    expect(textarea.value).toBe('abc');
    await user.type(textarea, 'd');
    // value should remain at max length (hook truncates/rejects overflow)
    expect(textarea.value.length).toBeLessThanOrEqual(3);
  });

  it('applies disabled and readOnly attributes', () => {
    render(<Textarea disabled readOnly defaultValue="x" aria-label="D" id="d" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('readonly');
  });

  it('AutoResizeTextarea and LimitedTextarea render', () => {
    const { rerender } = render(<AutoResizeTextarea aria-label="A" id="a" defaultValue="z" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    rerender(<LimitedTextarea maxLength={5} defaultValue="hi" aria-label="A" id="a" />);
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('applies a custom className to the wrapper', () => {
    const { container } = render(<Textarea className="my-extra" aria-label="W" id="w" />);
    expect(container.querySelector('.textarea-wrapper.my-extra')).toBeInTheDocument();
  });
});
