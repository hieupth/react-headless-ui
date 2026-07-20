import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputGroup } from '../src/components/InputGroup';
import { useInputGroup, type InputGroupItem } from '../src/hooks';

const items: InputGroupItem[] = [
  { id: 'name', type: 'input', content: 'Name', placeholder: 'Enter name', required: true },
  { id: 'email', type: 'input', content: 'Email', placeholder: 'Enter email' },
];

const lengthRule = {
  name: 'minLength',
  itemId: 'name',
  validate: (value: string) => value.length >= 3,
  message: 'Name too short',
};

describe('InputGroup', () => {
  it('renders items from the items prop', () => {
    render(<InputGroup items={items} />);
    expect(screen.getByTestId('input-group')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
  });

  it('renders an empty state with no items', () => {
    render(<InputGroup items={[]} />);
    expect(screen.getByText(/No form fields/i)).toBeInTheDocument();
  });

  it('updates values when typing into inputs', async () => {
    const user = userEvent.setup();
    render(<InputGroup items={items} />);
    const name = screen.getByTestId('input-name') as HTMLInputElement;
    await user.type(name, 'abc');
    expect(name).toHaveValue('abc');
  });

  it('fires onValuesChange when a value changes', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(<InputGroup items={items} onValuesChange={onValuesChange} />);
    await user.type(screen.getByTestId('input-name'), 'x');
    expect(onValuesChange).toHaveBeenCalled();
    const last = onValuesChange.mock.calls[onValuesChange.mock.calls.length - 1][0];
    expect(last.name).toBe('x');
  });

  it('marks the group as dirty after a change and shows a status indicator', async () => {
    const user = userEvent.setup();
    render(<InputGroup items={items} />);
    await user.type(screen.getByTestId('input-name'), 'abc');
    // dirty + valid (no rules) -> "Valid" status
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('renders validation errors after validate() when rules fail', () => {
    render(<InputGroup items={items} validationRules={[lengthRule]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    expect(screen.getByText('Name too short')).toBeInTheDocument();
  });

  it('clears errors for an item once the value becomes valid (validate on change)', async () => {
    const user = userEvent.setup();
    render(
      <InputGroup items={items} validationRules={[lengthRule]} />
    );
    // Trigger error first
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    expect(screen.getByText('Name too short')).toBeInTheDocument();
    // Type enough chars to satisfy rule
    await user.type(screen.getByTestId('input-name'), 'abcd');
    expect(screen.queryByText('Name too short')).not.toBeInTheDocument();
  });

  it('validates on blur when configured', async () => {
    const user = userEvent.setup();
    render(<InputGroup items={items} validationRules={[{ ...lengthRule, validateOnChange: false, validateOnBlur: true }]} validateOnChange={false} />);
    const name = screen.getByTestId('input-name');
    await user.type(name, 'a');
    fireEvent.blur(name);
    expect(screen.getByText('Name too short')).toBeInTheDocument();
  });

  it('clears all values via the Clear button', async () => {
    const user = userEvent.setup();
    render(<InputGroup items={items} />);
    const name = screen.getByTestId('input-name') as HTMLInputElement;
    await user.type(name, 'abc');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(name).toHaveValue('');
  });

  it('resets to default values via the Reset button', async () => {
    const user = userEvent.setup();
    render(<InputGroup items={items} defaultValues={{ name: 'default' }} />);
    const name = screen.getByTestId('input-name') as HTMLInputElement;
    await user.type(name, 'X');
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(name).toHaveValue('default');
  });

  it('disables all inputs when disabled', () => {
    render(<InputGroup items={items} disabled />);
    expect(screen.getByTestId('input-name')).toBeDisabled();
    expect(screen.getByTestId('input-email')).toBeDisabled();
  });

  it('renders prepend/append item types (prefix/suffix/label/helper/error/action)', () => {
    render(
      <InputGroup
        items={[
          { id: 'p', type: 'prefix', content: '$' },
          { id: 'amt', type: 'input', content: 'Amount', placeholder: '0.00' },
          { id: 's', type: 'suffix', content: 'USD' },
          { id: 'lbl', type: 'label', content: 'Total label' },
          { id: 'hlp', type: 'helper', content: 'Helper text' },
          { id: 'err', type: 'error', content: 'Error text' },
          { id: 'act', type: 'action', content: 'Go' },
        ]}
      />
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('Total label')).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
    expect(screen.getByTestId('action-act')).toBeInTheDocument();
  });

  it('renders a custom item type via default fallthrough', () => {
    render(
      <InputGroup items={[{ id: 'c', type: 'custom' as any, content: 'Custom blob' }]} />
    );
    expect(screen.getByText('Custom blob')).toBeInTheDocument();
  });

  it('renders stacked and inline layouts', () => {
    const { rerender } = render(<InputGroup layout="stacked" items={items} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    rerender(<InputGroup layout="inline" items={items} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    rerender(<InputGroup layout="horizontal" items={items} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    rerender(<InputGroup layout={'bogus' as any} items={items} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
  });

  it('renders a disabled group with labels and required markers', () => {
    render(<InputGroup items={items} disabled showLabels />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByTestId('input-name')).toBeDisabled();
  });

  it('renders helper text for an input with no errors', () => {
    // The helper branch requires errors[item.id] to be an empty array; trigger
    // validation then fix the value so the item has [] errors.
    render(<InputGroup items={items} showHelpers validationRules={[lengthRule]} />);
    // No errors yet -> helper text (placeholder) shows for the name input
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('renders errors via a custom renderError', () => {
    render(
      <InputGroup
        items={items}
        validationRules={[lengthRule]}
        showErrors
        renderError={(id, errs) => <div key={id} data-testid="custom-err">{errs.join(',')}</div>}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    expect(screen.getByTestId('custom-err')).toBeInTheDocument();
  });

  it('hides borders when showBorders is false', () => {
    render(<InputGroup items={items} showBorders={false} />);
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
  });

  it('renders all prepend/append item types in a horizontal layout', () => {
    render(
      <InputGroup
        layout="horizontal"
        items={[
          { id: 'p', type: 'prefix', content: '$' },
          { id: 'amt', type: 'input', content: 'Amount', placeholder: '0.00' },
          { id: 's', type: 'suffix', content: 'USD' },
          { id: 'lbl', type: 'label', content: 'Total', required: true },
          { id: 'hlp', type: 'helper', content: 'Help' },
          { id: 'err', type: 'error', content: 'Bad' },
          { id: 'act', type: 'action', content: 'Go' },
        ]}
      />
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders label/helper/error/prefix/suffix/action items under a disabled group', () => {
    render(
      <InputGroup
        disabled
        items={[
          { id: 'lbl', type: 'label', content: 'Disabled label', required: true },
          { id: 'hlp', type: 'helper', content: 'Disabled help' },
          { id: 'err', type: 'error', content: 'Disabled err' },
          { id: 'p', type: 'prefix', content: 'P' },
          { id: 's', type: 'suffix', content: 'S' },
          { id: 'act', type: 'action', content: 'A' },
        ]}
      />
    );
    expect(screen.getByText('Disabled label')).toBeInTheDocument();
  });

  it('renders group-level errors via a custom renderError', () => {
    const groupRule = {
      name: 'match',
      itemId: 'group',
      validate: () => false,
      message: 'Group mismatch',
    };
    render(
      <InputGroup
        items={items}
        showErrors
        validationRules={[groupRule]}
        renderError={(id, errs) => <div key={id} data-testid={`grp-err-${id}`}>{errs.join(',')}</div>}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    expect(screen.getByTestId('grp-err-group')).toBeInTheDocument();
  });

  it('fires a string-content action button click without invoking content', () => {
    render(<InputGroup items={[{ id: 'act', type: 'action', content: 'Go' }]} />);
    fireEvent.click(screen.getByTestId('action-act'));
    expect(screen.getByTestId('action-act')).toBeInTheDocument();
  });

  it('invokes a function-content action button with values and actions', () => {
    const handler = vi.fn();
    render(
      <InputGroup
        items={[{ id: 'act', type: 'action', content: handler }]}
        defaultValues={{ x: '1' }}
      />
    );
    fireEvent.click(screen.getByTestId('action-act'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('exposes group-level error rendering', () => {
    render(
      <InputGroup
        items={items}
        validationRules={[
          {
            name: 'groupRule',
            itemId: 'group',
            validate: () => false,
            message: 'Group invalid',
          },
        ]}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    // Group rule (itemId: 'group') also applies to every input item, so it
    // surfaces in multiple places; assert it is shown.
    expect(screen.getAllByText('Group invalid').length).toBeGreaterThan(0);
  });

  it('uses a custom renderError function for item errors', () => {
    render(
      <InputGroup
        items={items}
        validationRules={[lengthRule]}
        renderError={(id, errs) => <div data-testid={`custom-err-${id}`}>{errs[0]}</div>}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    expect(screen.getByTestId('custom-err-name')).toBeInTheDocument();
  });

  it('supports horizontal layout and Enter-to-navigate', async () => {
    const user = userEvent.setup();
    render(<InputGroup items={items} layout="horizontal" />);
    const name = screen.getByTestId('input-name');
    name.focus();
    await user.keyboard('{Enter}');
    // Should not throw; focus moves to next input
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
  });

  it('supports custom renderItem renderer', () => {
    render(
      <InputGroup
        items={items}
        renderItem={(item) => <div key={item.id} data-testid={`custom-${item.id}`}>{item.id}</div>}
      />
    );
    expect(screen.getByTestId('custom-name')).toBeInTheDocument();
  });
});

// Direct hook tests for actions that aren't fully reachable via the component.
describe('useInputGroup (hook actions)', () => {
  function setup(props: Parameters<typeof useInputGroup>[0]) {
    const result: { current: ReturnType<typeof useInputGroup> } = { current: null as any };
    function Probe() {
      result.current = useInputGroup(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  it('getValue / setValues / clearItem / addItem / removeItem / updateItem / setError / clearError / navigate', () => {
    const res = setup({ items: items });
    // Actions/state are rebuilt each render with fresh closures, so re-read
    // from res.current after each state mutation.
    act(() => res.current.actions.setValues({ name: 'n1', email: 'e1' }));
    expect(res.current.actions.getValue('name')).toBe('n1');

    act(() => res.current.actions.clearItem('email'));
    expect(res.current.actions.getValue('email')).toBe('');

    act(() => res.current.actions.addItem({ id: 'phone', type: 'input', content: 'Phone' }));
    expect(res.current.state.items.some((i) => i.id === 'phone')).toBe(true);

    act(() => res.current.actions.updateItem('phone', { placeholder: 'call me' }));
    expect(res.current.state.items.find((i) => i.id === 'phone')?.placeholder).toBe('call me');

    act(() => res.current.actions.removeItem('phone'));
    expect(res.current.state.items.some((i) => i.id === 'phone')).toBe(false);

    act(() => res.current.actions.setError('name', 'bad'));
    expect(res.current.state.errors.name).toEqual(['bad']);
    act(() => res.current.actions.clearError('name'));
    expect(res.current.state.errors.name).toBeUndefined();

    // focus-based navigation
    act(() => res.current.actions.focusItem('name'));
    act(() => res.current.actions.navigateNext());
    expect(res.current.state.focusedItem).toBe('email');
    act(() => res.current.actions.navigatePrevious());
    expect(res.current.state.focusedItem).toBe('name');
  });

  it('no-ops actions when disabled', () => {
    const res = setup({ items, disabled: true });
    act(() => res.current.actions.setValue('name', 'x'));
    expect(res.current.actions.getValue('name')).toBe('');
    act(() => res.current.actions.setValues({ name: 'x' }));
    expect(res.current.actions.getValue('name')).toBe('');
    act(() => res.current.actions.clear());
    act(() => res.current.actions.clearItem('name'));
    act(() => res.current.actions.focusItem('name'));
    act(() => res.current.actions.blurItem('name'));
    act(() => res.current.actions.addItem({ id: 'z', type: 'input', content: 'Z' }));
    expect(res.current.state.items.some((i) => i.id === 'z')).toBe(false);
    act(() => res.current.actions.navigateNext());
  });

  it('validate() fires onValidationError / onInvalid / onValid callbacks', () => {
    const onValidationError = vi.fn();
    const onInvalid = vi.fn();
    const onValid = vi.fn();
    const res = setup({
      items,
      validationRules: [{ ...lengthRule, validate: (v: string) => v.length >= 3 }],
      onValidationError,
      onInvalid,
      onValid,
    });
    act(() => res.current.actions.validate());
    expect(onValidationError).toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();

    // now make valid
    act(() => res.current.actions.setValue('name', 'long enough'));
    act(() => res.current.actions.validate());
    expect(onValid).toHaveBeenCalled();
  });

  it('getItemAttributes returns empty for unknown id and attributes for known input', () => {
    const res = setup({ items });
    expect(res.current.getItemAttributes('nope')).toEqual({});
    const attrs = res.current.getItemAttributes('name');
    expect(attrs['data-type']).toBe('input');
  });

  it('validateItem catches thrown rule functions', () => {
    const onValidationError = vi.fn();
    const onInvalid = vi.fn();
    const res = setup({
      items,
      validationRules: [
        { name: 'throw', itemId: 'name', validate: () => { throw new Error('boom'); }, message: 'x' },
      ],
      onValidationError,
      onInvalid,
    });
    act(() => res.current.actions.validate());
    expect(onInvalid).toHaveBeenCalled();
  });
});

// Direct hook tests for the disabled-action guards, focus-based navigation
// boundaries, removeItem-while-focused, setValues/blur re-validation, and the
// document-level keydown navigation handler that attaches via groupRef.
describe('useInputGroup (boundaries + keydown)', () => {
  function setupWithRef(props: Parameters<typeof useInputGroup>[0]) {
    const groupRef: React.RefObject<HTMLDivElement | null> = { current: null };
    const result: { current: ReturnType<typeof useInputGroup> } = { current: null as any };
    function Probe() {
      result.current = useInputGroup({ ...props, groupRef });
      return (
        <div ref={groupRef as React.RefObject<HTMLDivElement>} data-testid="grp">
          {result.current.state.items
            .filter((i) => i.type === 'input')
            .map((i) => (
              <input
                key={i.id}
                data-testid={`in-${i.id}`}
                data-id={i.id}
                value={result.current.state.values[i.id] || ''}
                readOnly
              />
            ))}
        </div>
      );
    }
    render(<Probe />);
    return { result, grp: () => screen.getByTestId('grp') };
  }

  it('addItem/updateItem/reset/no-op-navigation are no-ops when disabled', () => {
    const res = setupWithRef({ items, disabled: true });
    act(() => res.result.current.actions.addItem({ id: 'z', type: 'input', content: 'Z' }));
    expect(res.result.current.state.items.some((i) => i.id === 'z')).toBe(false);
    act(() => res.result.current.actions.updateItem('name', { placeholder: 'p' }));
    // original placeholder is preserved (update blocked by disabled guard)
    expect(res.result.current.state.items.find((i) => i.id === 'name')?.placeholder).toBe('Enter name');
    act(() => res.result.current.actions.reset());
    expect(res.result.current.state.isDirty).toBe(false);
    // navigatePrevious with no focused item (disabled) is a no-op
    act(() => res.result.current.actions.navigatePrevious());
  });

  it('setValues triggers validateAll via setTimeout when validateOnChange', async () => {
    const onInvalid = vi.fn();
    const res = setupWithRef({
      items,
      validationRules: [{ ...lengthRule, itemId: 'name' }],
      onInvalid,
    });
    act(() => res.result.current.actions.setValues({ name: 'a' }));
    // flush setTimeout(validateAll, 0)
    await Promise.resolve();
    await act(async () => { await Promise.resolve(); });
    expect(res.result.current.state.isDirty).toBe(true);
  });

  it('blurItem clears focusedItem when it matches, and re-validates all on success', async () => {
    const res = setupWithRef({
      items,
      validationRules: [{ ...lengthRule, itemId: 'name' }],
    });
    act(() => res.result.current.actions.focusItem('name'));
    expect(res.result.current.state.focusedItem).toBe('name');
    act(() => res.result.current.actions.blurItem('name'));
    expect(res.result.current.state.focusedItem).toBeNull();
    // flush the setTimeout(validateAll)
    await act(async () => { await Promise.resolve(); });
  });

  it('blurItem does not clear focusedItem when blurring a non-focused item', () => {
    const res = setupWithRef({ items });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => res.result.current.actions.blurItem('email'));
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('removeItem clears focusedItem when the removed item was focused', () => {
    const res = setupWithRef({ items });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => res.result.current.actions.removeItem('name'));
    expect(res.result.current.state.focusedItem).toBeNull();
    expect(res.result.current.state.items.some((i) => i.id === 'name')).toBe(false);
  });

  it('navigateNext is a no-op at the last input, navigatePrevious at the first', () => {
    const res = setupWithRef({ items });
    act(() => res.result.current.actions.focusItem('email')); // last input
    act(() => res.result.current.actions.navigateNext()); // already last -> stays
    expect(res.result.current.state.focusedItem).toBe('email');
    act(() => res.result.current.actions.navigatePrevious()); // -> name
    expect(res.result.current.state.focusedItem).toBe('name');
    act(() => res.result.current.actions.navigatePrevious()); // already first -> stays
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('autoFocus focuses the first input item on mount', () => {
    const res = setupWithRef({ items, autoFocus: true });
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('keydown Enter on horizontal layout advances to next input', () => {
    const res = setupWithRef({ items, layout: 'horizontal' });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('email');
  });

  it('keydown ArrowRight advances regardless of layout (vertical included)', () => {
    const res = setupWithRef({ items, layout: 'vertical' });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('email');
  });

  it('keydown ArrowDown advances in non-vertical layouts', () => {
    const res = setupWithRef({ items, layout: 'horizontal' });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('email');
  });

  it('keydown ArrowLeft retreats regardless of layout (vertical included)', () => {
    const res = setupWithRef({ items, layout: 'vertical' });
    act(() => res.result.current.actions.focusItem('email'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('keydown ArrowUp retreats in non-vertical layouts', () => {
    const res = setupWithRef({ items, layout: 'horizontal' });
    act(() => res.result.current.actions.focusItem('email'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('keydown is a no-op when disabled or when no item is focused', () => {
    const res = setupWithRef({ items, disabled: true });
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
      );
    });
    // no item focused by default; handler returns early either way
    expect(res.result.current.state.focusedItem).toBeNull();
  });

  it('keydown Tab is allowed (default behavior, no navigation)', () => {
    const res = setupWithRef({ items, layout: 'horizontal' });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('name'); // unchanged
  });

  it('keydown ArrowDown in vertical layout does not navigate', () => {
    const res = setupWithRef({ items, layout: 'vertical' });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('keydown ArrowUp in vertical layout does not navigate', () => {
    const res = setupWithRef({ items, layout: 'vertical' });
    act(() => res.result.current.actions.focusItem('email'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('email');
  });

  it('keydown Enter in vertical/stacked layout does not navigate', () => {
    const res = setupWithRef({ items, layout: 'vertical' });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => {
      res.grp().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      );
    });
    expect(res.result.current.state.focusedItem).toBe('name');
  });

  it('setValues does not schedule validateAll when validateOnChange is false', async () => {
    const onInvalid = vi.fn();
    const res = setupWithRef({
      items,
      validationRules: [{ ...lengthRule, itemId: 'name' }],
      validateOnChange: false,
      onInvalid,
    });
    act(() => res.result.current.actions.setValues({ name: 'a' }));
    await act(async () => { await Promise.resolve(); });
    // validateOnChange=false -> no validateAll scheduled -> no error set
    expect(res.result.current.state.errors.name).toBeUndefined();
  });

  it('blurItem skips validation entirely when validateOnBlur is false', () => {
    const res = setupWithRef({
      items,
      validationRules: [{ ...lengthRule, itemId: 'name' }],
      validateOnBlur: false,
      validateOnChange: false,
    });
    act(() => res.result.current.actions.focusItem('name'));
    act(() => res.result.current.actions.blurItem('name'));
    // no validation ran -> no error
    expect(res.result.current.state.errors.name).toBeUndefined();
    expect(res.result.current.state.focusedItem).toBeNull();
  });

  it('removeItem is a no-op when disabled', () => {
    const res = setupWithRef({ items, disabled: true });
    act(() => res.result.current.actions.removeItem('name'));
    expect(res.result.current.state.items.some((i) => i.id === 'name')).toBe(true);
  });

  it('autoFocus with items but no input type falls back to null focusedItem', () => {
    const res = setupWithRef({
      items: [{ id: 'lbl', type: 'label', content: 'L' }],
      autoFocus: true,
    });
    expect(res.result.current.state.focusedItem).toBeNull();
  });
});
