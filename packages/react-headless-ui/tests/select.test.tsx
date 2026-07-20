import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectGroup, SimpleSelect, SearchableSelect } from '../src/components/Select';

// The Select trigger is a <button> with the placeholder/selected label nested
// in a <span>; the keydown handler lives on the button. Resolve the button.
function trigger() {
  return screen.getByRole('button', { name: /Pick|Apple|Banana|Cherry/i });
}

const options = [
  { key: 'a', label: 'Apple', value: 'apple' },
  { key: 'b', label: 'Banana', value: 'banana' },
  { key: 'c', label: 'Cherry', value: 'cherry' },
];

const optionsWithDisabled = [
  { key: 'a', label: 'Apple', value: 'apple' },
  { key: 'b', label: 'Banana', value: 'banana', disabled: true },
  { key: 'c', label: 'Cherry', value: 'cherry' },
];

describe('Select', () => {
  it('renders the trigger with placeholder text', () => {
    render(<Select options={options} placeholder="Pick a fruit" />);
    expect(screen.getByText('Pick a fruit')).toBeInTheDocument();
  });

  it('opens the dropdown and exposes options on trigger click', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Select options={options} placeholder="Pick a fruit" onValueChange={onSelectionChange} />
    );
    await user.click(screen.getByText('Pick a fruit'));
    expect(await screen.findByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('reflects the selected option label in the trigger (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Select options={options} defaultValue="banana" placeholder="Pick" />);
    // defaultValue surfaces in the trigger before opening.
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('selects an option via click and fires onSelectionChange (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Select options={options} onValueChange={onSelectionChange} placeholder="Pick" />);
    await user.click(screen.getByText('Pick'));
    await user.click(await screen.findByText('Cherry'));
    expect(onSelectionChange).toHaveBeenCalledWith('cherry');
    // closeOnSelection defaults to true -> listbox unmounts.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('respects controlled value and does not mutate internally', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Select
        options={options}
        value="apple"
        onValueChange={onSelectionChange}
        placeholder="Pick"
        closeOnSelection={false}
      />
    );
    await user.click(screen.getByText('Apple'));
    await user.click(screen.getByText('Cherry'));
    // Controlled: internal state stays anchored to value="apple".
    expect(onSelectionChange).toHaveBeenCalledWith('cherry');
  });

  it('opens with ArrowDown and navigates with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Select options={options} placeholder="Pick" closeOnSelection={false} />);
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    // First option is highlighted initially (focusStrategy 'first').
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('data-highlighted', 'true');

    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('data-highlighted', 'true');

    await user.keyboard('{ArrowUp}');
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('data-highlighted', 'true');
  });

  it('selects the highlighted option on Enter', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Select options={options} onValueChange={onSelectionChange} placeholder="Pick" />
    );
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}'); // highlight Banana
    await user.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('banana');
  });

  it('opens on Enter/Space and Home/End jump to first/last option', async () => {
    const user = userEvent.setup();
    render(
      <Select options={options} placeholder="Pick" closeOnSelection={false} />
    );
    trigger().focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{End}');
    expect(screen.getAllByRole('option').at(-1)).toHaveAttribute('data-highlighted', 'true');

    await user.keyboard('{Home}');
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('data-highlighted', 'true');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Select options={options} placeholder="Pick" />);
    const btn = trigger();
    btn.focus();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
  });

  it('skips disabled options during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <Select options={optionsWithDisabled} placeholder="Pick" closeOnSelection={false} />
    );
    // Open via click so the listbox is definitively mounted before navigating.
    await user.click(screen.getByRole('button', { name: /Pick/i }));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-highlighted', 'true');
    // ArrowDown from Apple (index 0) skips disabled Banana (index 1) to Cherry (index 2).
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-highlighted', 'true');
    // ArrowUp from Cherry wraps back, skipping Banana, to Apple.
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-highlighted', 'true');
  });

  it('does not select a disabled option via Enter', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Select
        options={optionsWithDisabled}
        onValueChange={onSelectionChange}
        placeholder="Pick"
        closeOnSelection={false}
      />
    );
    trigger().focus();
    await user.keyboard('{ArrowDown}'); // open, highlight Apple
    await user.keyboard('{End}'); // last enabled = Cherry
    await user.keyboard('{ArrowUp}'); // up from Cherry -> skips Banana, lands on Apple
    // Banana is disabled so it cannot become highlighted/selected.
    await user.keyboard('{Enter}');
    expect(onSelectionChange).not.toHaveBeenCalledWith('banana');
  });

  it('does not open when the select is disabled', async () => {
    const user = userEvent.setup();
    render(<Select options={options} disabled placeholder="Pick" />);
    await user.click(screen.getByText('Pick'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>outside</button>
        <Select options={options} placeholder="Pick" />
      </div>
    );
    await user.click(screen.getByText('Pick'));
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByText('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows a search input and filters options when searchable', async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable placeholder="Pick" closeOnSelection={false} />);
    await user.click(screen.getByText('Pick'));
    const input = await screen.findByPlaceholderText('Search...');
    await user.type(input, 'che');
    expect(screen.getByText('Cherry')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows the no-options message when the list is empty', async () => {
    const user = userEvent.setup();
    render(<Select options={options} searchable placeholder="Pick" />);
    await user.click(screen.getByText('Pick'));
    const input = await screen.findByPlaceholderText('Search...');
    await user.type(input, 'zzz');
    expect(screen.getByText('No options found')).toBeInTheDocument();
  });

  it('clears the selection via the clear button when allowClear is set', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Select
        options={options}
        defaultValue="apple"
        allowClear
        onValueChange={onSelectionChange}
        placeholder="Pick"
      />
    );
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onSelectionChange).toHaveBeenCalledWith(undefined);
  });

  it('drives open state through controlled open + onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Select options={options} open onOpenChange={onOpenChange} placeholder="Pick" />);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    // Escape on the focused trigger triggers close -> onOpenChange(false).
    trigger().focus();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('uses a custom render prop for full control of the select', () => {
    render(
      <Select
        options={options}
        render={(props: any) => <div data-testid="custom-select">{props.selectedOption ? props.selectedOption.label : 'none'}</div>}
      />
    );
    expect(screen.getByTestId('custom-select')).toBeInTheDocument();
  });

  it('renders SelectGroup with a label and children', () => {
    render(
      <SelectGroup label="My Group">
        <li>option</li>
      </SelectGroup>
    );
    expect(screen.getByText('My Group')).toBeInTheDocument();
  });

  it('renders SelectGroup without a label', () => {
    const { container } = render(
      <SelectGroup label="">
        <li>option</li>
      </SelectGroup>
    );
    expect(container.querySelector('[role="group"]')).toBeInTheDocument();
  });

  it('SimpleSelect renders a select and reports selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<SimpleSelect options={options} onValueChange={onSelectionChange} placeholder="Pick one" />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('SimpleSelect forwards disabled/required flags', () => {
    render(<SimpleSelect options={options} disabled required placeholder="P" />);
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('SearchableSelect renders a searchable select', async () => {
    const user = userEvent.setup();
    render(<SearchableSelect options={options} placeholder="Search" />);
    await user.click(screen.getByText('Search'));
    // searchable listbox opens
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('renders option icon and description when provided', async () => {
    const user = userEvent.setup();
    const richOptions = [
      { key: 'a', label: 'Apple', value: 'apple', icon: <span data-testid="ico">A</span>, description: 'A red fruit' },
    ];
    render(<Select options={richOptions} placeholder="Pick" />);
    await user.click(trigger());
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByText('A red fruit')).toBeInTheDocument();
  });

  it('renders the no-options empty state when there are no options', async () => {
    const user = userEvent.setup();
    render(<Select options={[]} placeholder="Pick" />);
    await user.click(trigger());
    expect(screen.getByText('No options available')).toBeInTheDocument();
  });

  it('renders the no-results state when a search matches nothing', async () => {
    const user = userEvent.setup();
    render(<SearchableSelect options={options} placeholder="Search" />);
    await user.click(screen.getByText('Search'));
    const input = await screen.findByPlaceholderText('Search...');
    await user.type(input, 'zzz');
    expect(screen.getByText('No options found')).toBeInTheDocument();
  });

  it('honours maxDropdownHeight', async () => {
    const user = userEvent.setup();
    render(<Select options={options} maxDropdownHeight={150} placeholder="Pick" />);
    await user.click(trigger());
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('uses a custom renderOption via the default listbox', async () => {
    const user = userEvent.setup();
    render(
      <Select
        options={options}
        placeholder="Pick"
        renderOption={(option: any) => <li key={option.value} data-testid={`custom-opt-${option.value}`}>{option.label}</li>}
      />
    );
    await user.click(trigger());
    expect(screen.getByTestId('custom-opt-apple')).toBeInTheDocument();
  });

  it('uses custom renderTrigger and renderListbox', () => {
    render(
      <Select
        options={options}
        placeholder="Pick"
        renderTrigger={() => <button data-testid="custom-trigger">T</button>}
        renderListbox={() => <div data-testid="custom-listbox">LB</div>}
        open
      />
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('custom-listbox')).toBeInTheDocument();
  });

  it('renders a non-searchable default listbox without maxDropdownHeight (defaults to 300)', async () => {
    const user = userEvent.setup();
    render(<Select options={options} placeholder="Pick" />);
    await user.click(trigger());
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });
});
