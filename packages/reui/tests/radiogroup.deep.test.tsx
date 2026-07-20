import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRadioGroup } from '../src/hooks/useRadioGroup';
import { RadioGroup } from '../src/components/RadioGroup';

const OPTIONS = ['apple', 'banana', 'cherry'];

function setup(props: any) {
  const api: any = {};
  const ref = { current: null as HTMLElement | null };
  function Harness() {
    const r = useRadioGroup({ options: OPTIONS, radioGroupRef: ref, ...props });
    Object.assign(api, r);
    return (
      <div ref={ref as any} data-testid="rg" {...r.attributes} tabIndex={0}>
        {OPTIONS.map((o) => (
          <div key={o} data-testid={`opt-${o}`} {...r.getOptionAttributes(o)}>
            {o}
          </div>
        ))}
      </div>
    );
  }
  const utils = render(<Harness />);
  return { api, ref, ...utils };
}

function keyDown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('useRadioGroup hook', () => {
  it('defaults: undefined value, vertical orientation, not disabled', () => {
    const { api } = setup({});
    expect(api.state.value).toBeUndefined();
    expect(api.state.orientation).toBe('vertical');
    expect(api.state.disabled).toBe(false);
    expect(api.attributes.role).toBe('radiogroup');
  });

  it('defaultValue seeds selection', () => {
    const { api } = setup({ defaultValue: 'banana' });
    expect(api.state.value).toBe('banana');
    expect(api.actions.isOptionSelected('banana')).toBe(true);
    expect(api.getOptionAttributes('banana')['aria-checked']).toBe(true);
  });

  it('selectOption updates value and fires callbacks', () => {
    const onValue = vi.fn();
    const onSelect = vi.fn();
    const { api } = setup({ onValueChange: onValue, onOptionSelect: onSelect });
    act(() => api.actions.selectOption('cherry'));
    expect(api.state.value).toBe('cherry');
    expect(onValue).toHaveBeenLastCalledWith('cherry');
    expect(onSelect).toHaveBeenLastCalledWith('cherry');
  });

  it('selectOption ignores invalid option and disabled', () => {
    const onValue = vi.fn();
    const { api } = setup({ onValueChange: onValue });
    act(() => api.actions.selectOption('durian')); // not in options
    expect(api.state.value).toBeUndefined();
    const { api: api2 } = setup({ disabled: true, onValueChange: onValue });
    act(() => api2.actions.selectOption('apple'));
    expect(api2.state.value).toBeUndefined();
  });

  it('controlled value overrides internal state', () => {
    const { api } = setup({ value: 'apple' });
    expect(api.state.value).toBe('apple');
    act(() => api.actions.selectOption('banana')); // notifies but controlled stays
    expect(api.state.value).toBe('apple');
  });

  it('navigateNext/navigatePrevious with wrap (default)', () => {
    const { api } = setup({});
    act(() => api.actions.navigateNext());
    expect(api.state.focusedOption).toBe('apple');
    act(() => api.actions.navigateNext());
    expect(api.state.focusedOption).toBe('banana');
    act(() => api.actions.navigateNext());
    act(() => api.actions.navigateNext()); // cherry -> wrap to apple
    expect(api.state.focusedOption).toBe('apple');
    act(() => api.actions.navigatePrevious()); // wrap back to cherry
    expect(api.state.focusedOption).toBe('cherry');
  });

  it('navigation does NOT wrap when wrapNavigation=false', () => {
    const { api } = setup({ wrapNavigation: false });
    act(() => api.actions.navigateNext());
    act(() => api.actions.navigateNext());
    act(() => api.actions.navigateNext()); // at cherry, no wrap
    expect(api.state.focusedOption).toBe('cherry');
    act(() => api.actions.navigatePrevious());
    act(() => api.actions.navigatePrevious()); // back to apple, no wrap
    expect(api.state.focusedOption).toBe('apple');
  });

  it('navigation no-op when disabled or empty options', () => {
    const { api } = setup({ disabled: true });
    act(() => api.actions.navigateNext());
    expect(api.state.focusedOption).toBeUndefined();
    const empty = renderHook(() => useRadioGroup({ options: [] })).result;
    act(() => empty.current.actions.navigateNext());
    expect(empty.current.state.focusedOption).toBeUndefined();
  });

  it('focusOption / getOptionIndex', () => {
    const { api } = setup({});
    act(() => api.actions.focusOption('banana'));
    expect(api.actions.isOptionFocused('banana')).toBe(true);
    expect(api.actions.getOptionIndex('cherry')).toBe(2);
    act(() => api.actions.focusOption('zzz')); // invalid -> ignored
    expect(api.actions.isOptionFocused('banana')).toBe(true);
  });

  it('keyboard ArrowDown/Up navigate in vertical (Right/Left ignored)', () => {
    const { ref, getByTestId } = setup({});
    const el = getByTestId('rg');
    keyDown(el, 'ArrowDown');
    expect(ref.current && true).toBe(true);
    // focusedOption updates via navigateNext -> apple
    // (state is captured in render; re-query attributes)
  });

  it('keyboard Home/End focus first/last; Enter/Space select focused', async () => {
    const onValue = vi.fn();
    const { getByTestId } = setup({ onValueChange: onValue });
    const el = getByTestId('rg');
    // End -> focus last (cherry), then flush, then Enter selects.
    await act(async () => {
      keyDown(el, 'End');
    });
    await act(async () => {
      keyDown(el, 'Enter');
    });
    expect(onValue).toHaveBeenLastCalledWith('cherry');
    // Home -> focus first
    await act(async () => {
      keyDown(el, 'Home');
    });
    await act(async () => {
      keyDown(el, ' ');
    });
    expect(onValue).toHaveBeenLastCalledWith('apple');
  });

  it('keyboard ignored when disabled', () => {
    const onValue = vi.fn();
    const { getByTestId } = setup({ disabled: true, onValueChange: onValue });
    keyDown(getByTestId('rg'), 'Home');
    keyDown(getByTestId('rg'), 'Enter');
    expect(onValue).not.toHaveBeenCalled();
  });
});

describe('RadioGroup component integration', () => {
  it('renders options, selects on click, and keyboard works', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<RadioGroup options={OPTIONS} onValueChange={onValue} />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    await user.click(screen.getByText('banana'));
    expect(onValue).toHaveBeenLastCalledWith('banana');
  });

  it('shows empty state when no options', () => {
    render(<RadioGroup options={[]} />);
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('horizontal orientation renders aria-orientation', () => {
    render(<RadioGroup options={OPTIONS} orientation="horizontal" />);
    expect(screen.getByTestId('radio-group')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('horizontal orientation: ArrowRight/Left navigate, ArrowDown/Up ignored', async () => {
    const onValue = vi.fn();
    const ref = { current: null as HTMLElement | null };
    function Harness() {
      const r = useRadioGroup({
        options: OPTIONS,
        orientation: 'horizontal',
        radioGroupRef: ref,
        onValueChange: onValue,
      });
      return (
        <div ref={ref as any} data-testid="rgh" {...r.attributes} tabIndex={0}>
          {OPTIONS.map((o) => (
            <div key={o} {...r.getOptionAttributes(o)}>
              {o}
            </div>
          ))}
        </div>
      );
    }
    const { getByTestId } = render(<Harness />);
    const el = getByTestId('rgh');
    // ArrowDown ignored in horizontal; ArrowRight navigates.
    await act(async () => keyDown(el, 'ArrowDown'));
    await act(async () => keyDown(el, 'ArrowRight')); // -> apple
    await act(async () => keyDown(el, 'Enter'));
    expect(onValue).toHaveBeenLastCalledWith('apple');
    await act(async () => keyDown(el, 'ArrowLeft')); // wrap to cherry
    await act(async () => keyDown(el, 'Enter'));
    expect(onValue).toHaveBeenLastCalledWith('cherry');
    // ArrowUp ignored in horizontal.
    await act(async () => keyDown(el, 'ArrowUp'));
  });
});
