import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from '../src/components/RadioGroup';

describe('RadioGroup', () => {
  it('renders one radio option per provided option value', () => {
    render(<RadioGroup options={['apple', 'banana']} />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('banana')).toBeInTheDocument();
  });

  it('selects an option on click and fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<RadioGroup options={['apple', 'banana']} onValueChange={onValueChange} />);
    await user.click(screen.getByText('banana'));
    expect(onValueChange).toHaveBeenLastCalledWith('banana');
  });

  it('derives options and labels from compound <RadioGroup.Item> children', () => {
    render(
      <RadioGroup defaultValue="banana">
        <RadioGroup.Item value="apple">Apple</RadioGroup.Item>
        <RadioGroup.Item value="banana">Banana</RadioGroup.Item>
      </RadioGroup>
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('passes through consumer aria-label onto the group', () => {
    render(<RadioGroup options={['a']} aria-label="Fruits" title="Pick one" />);
    const group = screen.getByTestId('radio-group');
    expect(group).toHaveAttribute('aria-label', 'Fruits');
    expect(group).toHaveAttribute('title', 'Pick one');
  });

  it('renders horizontal layout, descriptions, and a disabled group', () => {
    render(
      <RadioGroup
        options={['a', 'b']}
        optionLabels={{ a: 'Alpha', b: 'Beta' }}
        optionDescriptions={{ a: 'First letter', b: 'Second letter' }}
        orientation="horizontal"
        disabled
      />
    );
    const group = screen.getByTestId('radio-group');
    expect(group.className).toContain('flex');
    expect(group.className).toContain('cursor-not-allowed');
    expect(screen.getByText('First letter')).toBeInTheDocument();
    // disabled option shows not-allowed cursor
    expect(screen.getByTestId('radio-option-a').className).toContain('cursor-not-allowed');
  });

  it('marks the selected option and a custom renderOption', () => {
    const renderOption = vi.fn(
      (_value: string, _index: number, isSelected: boolean, _isFocused: boolean) =>
        <div data-testid="custom-opt">sel={String(isSelected)}</div>
    );
    render(
      <RadioGroup options={['a', 'b']} defaultValue="a" renderOption={renderOption} />
    );
    expect(renderOption).toHaveBeenCalled();
    expect(screen.getAllByTestId('custom-opt').length).toBe(2);
  });

  it('renders the empty state when there are no options', () => {
    render(<RadioGroup options={[]} />);
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('RadioGroup.Item marker component renders nothing on its own', () => {
    const { container } = render(<RadioGroup.Item value="x">X</RadioGroup.Item>);
    expect(container.firstChild).toBeNull();
  });

  it('renders the disabled description in gray', () => {
    render(
      <RadioGroup
        options={['a']}
        optionDescriptions={{ a: 'desc' }}
        disabled
      />
    );
    const desc = screen.getByText('desc');
    expect(desc.className).toContain('text-gray-400');
  });
});
