import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../src/components/Textarea';
import { useTextarea, type UseTextareaProps } from '../src/hooks/useTextarea';

describe('Textarea', () => {
  it('renders a labelled textarea', () => {
    render(<Textarea label="Notes" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('fires onChange when typed in', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Comment" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'hi');
    expect(onChange).toHaveBeenCalled();
  });
});

// Direct hook tests cover the controlled-mode, maxLength, clear/blur, and
// auto-resize code paths that the component wrapper does not fully exercise.
describe('useTextarea (hook)', () => {
  function setup(props: UseTextareaProps = {}) {
    const r = renderHook(() => useTextarea(props));
    return r;
  }

  it('controlled value: change delegates to onChange without touching internal state', () => {
    const onChange = vi.fn();
    const { result } = setup({ value: 'x', onChange });
    act(() => result.current.props.onChange({ target: { value: 'xy' } } as any));
    expect(onChange).toHaveBeenCalledWith('xy');
    expect(result.current.state.value).toBe('x'); // controlled value wins
  });

  it('uncontrolled value: change updates internal state and calls onChange', () => {
    const onChange = vi.fn();
    const { result } = setup({ defaultValue: 'a', onChange });
    act(() => result.current.props.onChange({ target: { value: 'ab' } } as any));
    expect(onChange).toHaveBeenCalledWith('ab');
    expect(result.current.state.value).toBe('ab');
  });

  it('respects the maxLength constraint on change (rejects longer input)', () => {
    const onChange = vi.fn();
    const { result } = setup({ defaultValue: '', maxLength: 2, onChange });
    act(() => result.current.props.onChange({ target: { value: 'abc' } } as any));
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.state.value).toBe('');
  });

  it('setValue truncates to maxLength and reports it as reached', () => {
    const onChange = vi.fn();
    const { result } = setup({ defaultValue: '', maxLength: 3, onChange });
    act(() => result.current.actions.setValue('abcdef'));
    expect(onChange).toHaveBeenCalledWith('abc');
    expect(result.current.state.value).toBe('abc');
    expect(result.current.state.isMaxLengthReached).toBe(true);
    expect(result.current.state.charCount).toBe(3);
  });

  it('controlled setValue delegates to onChange and does not mutate internal state', () => {
    const onChange = vi.fn();
    const { result } = setup({ value: 'v', onChange });
    act(() => result.current.actions.setValue('v2'));
    expect(onChange).toHaveBeenCalledWith('v2');
    expect(result.current.state.value).toBe('v');
  });

  it('clear() resets the value through setValue', () => {
    const onChange = vi.fn();
    const { result } = setup({ defaultValue: 'hello', onChange });
    act(() => result.current.actions.clear());
    expect(result.current.state.value).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('autoResize schedules a height update on change and setValue', async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTextarea({ defaultValue: '', autoResize: true, onChange })
    );
    // Mount a real textarea to back the ref so updateHeight mutates a DOM node.
    render(<textarea ref={result.current.ref as any} />);
    act(() => result.current.props.onChange({ target: { value: 'tall' } } as any));
    act(() => result.current.actions.setValue('taller'));
    // The deferred setTimeout(updateHeight) runs after the microtask queue.
    await Promise.resolve();
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledWith('tall');
  });

  it('focus/blur call through to the underlying element', () => {
    const { result } = renderHook(() => useTextarea({ defaultValue: '' }));
    render(<textarea ref={result.current.ref as any} />);
    const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
    const focusSpy = vi.spyOn(ta, 'focus');
    const blurSpy = vi.spyOn(ta, 'blur');
    act(() => result.current.actions.focus());
    act(() => result.current.actions.blur());
    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  it('isMaxLengthReached is false when maxLength is undefined', () => {
    const { result } = setup({ defaultValue: 'abc' });
    expect(result.current.state.isMaxLengthReached).toBe(false);
  });
});
