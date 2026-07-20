import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useField } from '../src/hooks/useField';
import { Field } from '../src/components/Field';

function setup(props: any = {}) {
  const api: any = {};
  function Harness() {
    const r = useField(props);
    api.state = r.state;
    api.handlers = r.handlers;
    api.attributes = r.attributes;
    return <input data-testid="f" {...r.attributes} />;
  }
  const utils = render(<Harness />);
  return { api, ...utils };
}

describe('useField hook - core', () => {
  it('defaults to empty, unfocused, enabled', () => {
    const { api } = setup();
    expect(api.state.value).toBe('');
    expect(api.state.focused).toBe(false);
    expect(api.state.disabled).toBe(false);
    expect(api.state.filled).toBe(false);
    expect(api.state.invalid).toBe(false);
  });

  it('defaultValue seeds uncontrolled value', () => {
    const { api } = setup({ defaultValue: 'hello' });
    expect(api.state.value).toBe('hello');
    expect(api.state.filled).toBe(true);
  });

  it('controlled value wins over internal state', () => {
    const { api } = setup({ value: 'controlled' });
    expect(api.state.value).toBe('controlled');
  });

  it('handleChange updates value in uncontrolled mode and fires onChange', () => {
    const onChange = vi.fn();
    const { api } = setup({ onChange });
    act(() => api.handlers.handleChange('new'));
    expect(api.state.value).toBe('new');
    expect(onChange).toHaveBeenLastCalledWith('new');
  });

  it('handleChange no-op when disabled or readOnly', () => {
    const dis = setup({ disabled: true, onChange: vi.fn() });
    act(() => dis.api.handlers.handleChange('x'));
    expect(dis.api.state.value).toBe('');
    const ro = setup({ readOnly: true, onChange: vi.fn() });
    act(() => ro.api.handlers.handleChange('x'));
    expect(ro.api.state.value).toBe('');
  });

  it('controlled handleChange does not mutate internal value but still notifies', () => {
    const onChange = vi.fn();
    const { api } = setup({ value: 'fixed', onChange });
    act(() => api.handlers.handleChange('other'));
    expect(api.state.value).toBe('fixed');
    expect(onChange).toHaveBeenLastCalledWith('other');
  });
});

describe('useField hook - validation', () => {
  it('required rejects empty', () => {
    const { api } = setup({ required: true });
    expect(api.handlers.handleValidate()).toBe(false);
  });

  it('required accepts non-empty', () => {
    const { api } = setup({ required: true, defaultValue: 'x' });
    expect(api.handlers.handleValidate()).toBe(true);
  });

  it('pattern validation', () => {
    // Empty string is tested against the pattern (no empty-skip).
    const empty = setup({ pattern: '^[0-9]+$' });
    expect(empty.api.handlers.handleValidate()).toBe(false);
    const digits = setup({ pattern: '^[0-9]+$', defaultValue: 'abc' });
    expect(digits.api.handlers.handleValidate()).toBe(false);
    const ok = setup({ pattern: '^[0-9]+$', defaultValue: '123' });
    expect(ok.api.handlers.handleValidate()).toBe(true);
  });

  it('minLength / maxLength', () => {
    const short = setup({ minLength: 3, defaultValue: 'ab' });
    expect(short.api.handlers.handleValidate()).toBe(false);
    const long = setup({ maxLength: 3, defaultValue: 'abcd' });
    expect(long.api.handlers.handleValidate()).toBe(false);
    const ok = setup({ minLength: 2, maxLength: 4, defaultValue: 'abc' });
    expect(ok.api.handlers.handleValidate()).toBe(true);
  });

  it('email type validation', () => {
    const bad = setup({ type: 'email', defaultValue: 'no-at' });
    expect(bad.api.handlers.handleValidate()).toBe(false);
    const good = setup({ type: 'email', defaultValue: 'a@b.com' });
    expect(good.api.handlers.handleValidate()).toBe(true);
  });

  it('url type validation', () => {
    const bad = setup({ type: 'url', defaultValue: 'not a url' });
    expect(bad.api.handlers.handleValidate()).toBe(false);
    const good = setup({ type: 'url', defaultValue: 'https://x.com' });
    expect(good.api.handlers.handleValidate()).toBe(true);
  });

  it('number type with min/max', () => {
    const nan = setup({ type: 'number', defaultValue: 'abc' });
    expect(nan.api.handlers.handleValidate()).toBe(false);
    const low = setup({ type: 'number', min: 10, defaultValue: '5' });
    expect(low.api.handlers.handleValidate()).toBe(false);
    const high = setup({ type: 'number', max: 100, defaultValue: '150' });
    expect(high.api.handlers.handleValidate()).toBe(false);
    const ok = setup({ type: 'number', min: 10, max: 100, defaultValue: '50' });
    expect(ok.api.handlers.handleValidate()).toBe(true);
  });

  it('handleValidate fires onValidate callback with result', () => {
    const onValidate = vi.fn();
    const { api } = setup({ required: true, defaultValue: '', onValidate });
    const result = api.handlers.handleValidate();
    expect(result).toBe(false);
    expect(onValidate).toHaveBeenCalledWith('', false);
  });
});

describe('useField hook - events', () => {
  it('handleInput parses event target value and forwards', () => {
    const onInput = vi.fn();
    const { api } = setup({ onInput });
    act(() =>
      api.handlers.handleInput({
        target: { value: 'typed' },
      } as any)
    );
    expect(api.state.value).toBe('typed');
    expect(onInput).toHaveBeenLastCalledWith('typed');
  });

  it('handleFocus/handleBlur track focused and validate on blur', () => {
    const onValidate = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { api } = setup({
      defaultValue: 'x',
      onValidate,
      onFocus,
      onBlur,
    });
    act(() => api.handlers.handleFocus({} as any));
    expect(api.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    act(() => api.handlers.handleBlur({} as any));
    expect(api.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();
    expect(onValidate).toHaveBeenCalledWith('x', true);
  });

  it('handleFocus is a no-op when disabled or readOnly', () => {
    const onFocus = vi.fn();
    const dis = setup({ disabled: true, onFocus });
    act(() => dis.api.handlers.handleFocus({} as any));
    expect(dis.api.state.focused).toBe(false);
    expect(onFocus).not.toHaveBeenCalled();

    const ro = setup({ readOnly: true, onFocus });
    act(() => ro.api.handlers.handleFocus({} as any));
    expect(ro.api.state.focused).toBe(false);
    expect(onFocus).not.toHaveBeenCalled();
  });

  it('Escape key clears value when not required', () => {
    const { api } = setup({ defaultValue: 'data' });
    act(() =>
      api.handlers.handleKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
      } as any)
    );
    expect(api.state.value).toBe('');
  });

  it('Escape does NOT clear when required', () => {
    const { api } = setup({ required: true, defaultValue: 'data' });
    act(() =>
      api.handlers.handleKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
      } as any)
    );
    expect(api.state.value).toBe('data');
  });

  it('handleClear clears value when not required/disabled/readOnly', () => {
    const { api } = setup({ defaultValue: 'data' });
    act(() => api.handlers.handleClear());
    expect(api.state.value).toBe('');
    const req = setup({ required: true, defaultValue: 'data' });
    act(() => req.api.handlers.handleClear());
    expect(req.api.state.value).toBe('data');
    const dis = setup({ disabled: true, defaultValue: 'data' });
    act(() => dis.api.handlers.handleClear());
    expect(dis.api.state.value).toBe('data');
  });

  it('keyDown no-op when disabled/readonly', () => {
    const dis = setup({ disabled: true, defaultValue: 'data' });
    act(() =>
      dis.api.handlers.handleKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
      } as any)
    );
    expect(dis.api.state.value).toBe('data');
  });

  it('invalid flag derived from invalid prop or error message', () => {
    expect(setup({ invalid: true }).api.state.invalid).toBe(true);
    expect(setup({ error: 'bad' }).api.state.invalid).toBe(true);
    expect(setup({}).api.state.invalid).toBe(false);
  });
});

describe('Field component integration', () => {
  it('renders a labelled input and accepts typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Field label="Username" placeholder="user" onChange={onChange} defaultValue="" />
    );
    const input = screen.getByPlaceholderText('user');
    await user.type(input, 'ab');
    expect(onChange).toHaveBeenCalled();
  });

  it('clearable button clears the value', async () => {
    const user = userEvent.setup();
    render(<Field defaultValue="hello" clearable label="L" />);
    const clear = await screen.findByRole('button', { name: /clear input/i });
    await user.click(clear);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('disabled input cannot be changed', () => {
    render(<Field defaultValue="locked" disabled label="L" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
