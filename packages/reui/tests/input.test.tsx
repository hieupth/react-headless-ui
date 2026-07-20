import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../src/components/Input';
import { useInput, type UseInputProps } from '../src/hooks/useInput';

describe('Input', () => {
  it('renders a textbox', () => {
    render(<Input label="Username" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('fires onInput when typed into', async () => {
    const onInput = vi.fn();
    render(<Input onInput={onInput} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, 'x');
    expect(onInput).toHaveBeenCalled();
    // blur exercises the component's onBlur native-event wrapper.
    await user.click(document.body);
  });

  it('fires onChange when typed into', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('uses a custom render prop', () => {
    render(
      <Input
        label="Name"
        render={(props) => (
          <div data-testid="custom">
            <input
              ref={props.ref as React.RefObject<HTMLInputElement>}
              className={props.className}
              onChange={props.handleChange}
              value={props.value}
            />
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.getByTestId('custom').querySelector('input')).toBeInTheDocument();
  });

  it('renders all adornment + footer slots (required, leading, trailing, error, count)', () => {
    const { container } = render(
      <Input
        label="Email"
        required
        leadingElement={<span data-testid="lead">L</span>}
        trailingElement={<span data-testid="trail">T</span>}
        error="bad"
        showCharacterCount
        maxLength={20}
        defaultValue="abc"
        className="extra"
      />
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(container.querySelector('.input-required-indicator')).not.toBeNull();
    expect(screen.getByTestId('lead')).toBeInTheDocument();
    expect(screen.getByTestId('trail')).toBeInTheDocument();
    // error renders with role=alert; helper suppressed when error present.
    expect(screen.getByRole('alert')).toHaveTextContent('bad');
    expect(container.querySelector('.input-helper-text')).toBeNull();
    // character count + maxLength suffix.
    expect(container.querySelector('.input-character-count')).toHaveTextContent('3/20');
  });

  it('renders helper text and count without maxLength', () => {
    const { container } = render(
      <Input helperText="hint" showCharacterCount defaultValue="hello" />
    );
    expect(container.querySelector('.input-helper-text')).toHaveTextContent('hint');
    // No error → helper shows; count shows current length without a max suffix.
    expect(container.querySelector('.input-character-count')).toHaveTextContent('5');
    expect(container.querySelector('.input-character-count')?.textContent).not.toContain('/');
  });
});

// Direct hook tests cover validation (native + custom rules), controlled vs
// uncontrolled sync, the full action surface (setValue/clear/focus/blur/
// validate/reset), and the readOnly/className branches the component wrapper
// does not exercise.
describe('useInput (hook)', () => {
  function setup(props: UseInputProps = {}, mountInput = true) {
    const result: { current: ReturnType<typeof useInput> } = { current: null as any };
    function Probe() {
      result.current = useInput(props);
      return mountInput ? (
        <input
          ref={result.current.ref as React.RefObject<HTMLInputElement>}
          value={result.current.value}
          onChange={result.current.handleChange}
          onBlur={result.current.handleBlur as any}
          required={props.required}
        />
      ) : null;
    }
    render(<Probe />);
    return result;
  }

  it('validate returns true early when no input ref is attached', () => {
    const res = setup({}, false); // no <input> mounted -> ref stays null
    expect(res.current.validate()).toBe(true);
  });

  it('custom validation rule with string result sets that message as error', () => {
    const onValidate = vi.fn();
    const res = setup({
      defaultValue: 'x',
      validation: [{ validate: () => 'too short', message: 'fallback' }],
      onValidate,
    });
    act(() => res.current.handleChange({ target: { value: 'x' } } as any));
    expect(res.current.error).toBe('too short');
    expect(res.current.valid).toBe(false);
    expect(onValidate).toHaveBeenCalled();
  });

  it('custom validation rule returning false uses rule.message', () => {
    const res = setup({
      defaultValue: 'bad',
      validation: [{ validate: (v) => v !== 'bad', message: 'no bad values' }],
    });
    act(() => res.current.handleChange({ target: { value: 'bad' } as any }));
    expect(res.current.error).toBe('no bad values');
  });

  it('valid input clears the error and reports valid', () => {
    const res = setup({
      defaultValue: '',
      validation: [{ validate: (v) => v.length >= 2, message: 'min 2' }],
    });
    // seed an error first
    act(() => res.current.handleChange({ target: { value: 'a' } } as any));
    expect(res.current.valid).toBe(false);
    // now a valid value clears it
    act(() => res.current.handleChange({ target: { value: 'abc' } } as any));
    expect(res.current.error).toBeUndefined();
    expect(res.current.valid).toBe(true);
  });

  it('readOnly blocks change handling and the validate-on-change path', () => {
    const onChange = vi.fn();
    const res = setup({ defaultValue: 'x', readOnly: true, onChange });
    act(() => res.current.handleChange({ target: { value: 'y' } } as any));
    expect(onChange).not.toHaveBeenCalled();
    expect(res.current.value).toBe('x');
    expect(res.current.readOnly).toBe(true);
  });

  it('validateOnChange=false skips per-change validation', () => {
    const res = setup({
      defaultValue: '',
      validation: [{ validate: () => false, message: 'err', validateOnChange: false }],
    });
    act(() => res.current.handleChange({ target: { value: 'a' } } as any));
    // No validation ran on change -> no error yet
    expect(res.current.error).toBeUndefined();
  });

  it('handleBlur marks touched, invokes onBlur, and validates', () => {
    const onBlur = vi.fn();
    const res = setup({
      defaultValue: '',
      onBlur,
      validation: [{ validate: (v) => v.length >= 2, message: 'too short' }],
    });
    act(() => res.current.handleBlur({} as any));
    expect(res.current.touched).toBe(true);
    expect(onBlur).toHaveBeenCalled();
    expect(res.current.error).toBe('too short');
  });

  it('setValue programmatically updates uncontrolled state + onChange', () => {
    const onChange = vi.fn();
    const res = setup({ defaultValue: '', onChange });
    act(() => res.current.setValue('hello'));
    expect(res.current.value).toBe('hello');
    expect(res.current.dirty).toBe(true);
    expect(onChange).toHaveBeenCalledWith('hello');
    expect(res.current.characterCount).toBe(5);
  });

  it('controlled setValue delegates to onChange without mutating internal state', () => {
    const onChange = vi.fn();
    const res = setup({ value: 'c', onChange });
    act(() => res.current.setValue('d'));
    expect(onChange).toHaveBeenCalledWith('d');
    expect(res.current.value).toBe('c'); // controlled wins
  });

  it('controlled handleChange fires onChange and marks dirty without touching internal state', () => {
    const onChange = vi.fn();
    const res = setup({ value: 'c', onChange });
    act(() => res.current.handleChange({ target: { value: 'd' } } as any));
    expect(onChange).toHaveBeenCalledWith('d');
    expect(res.current.value).toBe('c'); // controlled value still wins
    expect(res.current.dirty).toBe(true); // but dirty flag still flips
  });

  it('clear empties the value', () => {
    const res = setup({ defaultValue: 'abc' });
    act(() => res.current.clear());
    expect(res.current.value).toBe('');
  });

  it('focus/blur delegate to the focusable mixin (no-op without its focusRef wired)', () => {
    const res = setup({ defaultValue: '' });
    // useInput.focus() forwards to focusableMixin.focus(), which targets the
    // mixin's own focusRef (not the rendered input). Calling the actions
    // exercises the focus/blur function bodies without throwing.
    expect(() => {
      act(() => res.current.focus());
      act(() => res.current.blur());
    }).not.toThrow();
  });

  it('validate() runs validation against the current value', () => {
    const res = setup({
      defaultValue: 'ok',
      validation: [{ validate: (v) => v === 'ok', message: 'must be ok' }],
    });
    expect(res.current.validate()).toBe(true);
  });

  it('reset restores defaultValue and clears flags', () => {
    const res = setup({ defaultValue: 'orig' });
    act(() => res.current.setValue('changed'));
    expect(res.current.dirty).toBe(true);
    act(() => res.current.reset());
    expect(res.current.value).toBe('orig');
    expect(res.current.dirty).toBe(false);
    expect(res.current.touched).toBe(false);
    expect(res.current.error).toBeUndefined();
  });

  it('handleInput delegates to onInput', () => {
    const onInput = vi.fn();
    const res = setup({ onInput });
    const ev = { target: { value: 'z' } } as any;
    act(() => res.current.handleInput(ev));
    expect(onInput).toHaveBeenCalledWith(ev);
  });

  it('handleKeyDown/handleKeyUp delegate to the focusable mixin', () => {
    const res = setup({ defaultValue: '' });
    expect(() => {
      act(() => res.current.handleKeyDown({ key: 'Tab', preventDefault: () => {} } as any));
      act(() => res.current.handleKeyUp({ key: 'Tab', preventDefault: () => {} } as any));
    }).not.toThrow();
  });

  it('className reflects readonly/required branches', () => {
    const res = setup({ defaultValue: '', required: true, readOnly: true });
    const cls = res.current.className;
    expect(cls).toContain('input-required');
    expect(cls).toContain('input-readonly');
    expect(cls).toContain('input-disabled'); // readOnly => disabled flag set
  });

  it('className reflects invalid/dirty/touched branches after interaction', () => {
    const res = setup({
      defaultValue: '',
      validation: [{ validate: (v) => v.length >= 5, message: 'min 5' }],
    });
    // Make it dirty via setValue, then validate-on-blur to set invalid/touched.
    act(() => res.current.setValue('ab'));
    act(() => res.current.handleBlur({} as any));
    const cls = res.current.className;
    expect(cls).toContain('input-invalid');
    expect(cls).toContain('input-dirty');
    expect(cls).toContain('input-touched');
  });

  it('semanticAttributes carries type/value and aria-* flags', () => {
    const res = setup({ defaultValue: 'a', type: 'email', required: true });
    expect(res.current.semanticAttributes.type).toBe('email');
    expect(res.current.semanticAttributes.value).toBe('a');
    expect(res.current.semanticAttributes['aria-required']).toBe(true);
    expect(res.current.semanticAttributes['data-dirty']).toBe(false);
  });

  it('validity falls back to a synthesized ValidityState when no input is mounted', () => {
    const res = setup({}, false);
    expect(res.current.validity.valid).toBe(true);
    expect(res.current.validity.valueMissing).toBe(false);
  });

  it('native constraint failure (required + empty) surfaces as an error', () => {
    const result: { current: ReturnType<typeof useInput> } = { current: null as any };
    function Probe() {
      result.current = useInput({ defaultValue: '', required: true });
      return (
        <input
          ref={result.current.ref as React.RefObject<HTMLInputElement>}
          value={result.current.value}
          onChange={result.current.handleChange}
          required
        />
      );
    }
    render(<Probe />);
    // An empty required input is natively invalid; validate() runs checkValidity.
    act(() => result.current.validate());
    expect(result.current.valid).toBe(false);
    expect(typeof result.current.error).toBe('string');
  });
});
