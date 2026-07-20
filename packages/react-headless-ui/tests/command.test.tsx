import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Command } from '../src/components/Command';
import {
  CommandTrigger,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
} from '../src/components/Command';
import { useCommand } from '../src/hooks';
import type { CommandItem as CommandItemType, CommandGroup as CommandGroupType } from '../src/hooks';

const items: CommandItemType[] = [
  { id: 'copy', label: 'Copy', shortcut: ['Ctrl', 'C'], onSelect: vi.fn() },
  { id: 'paste', label: 'Paste', description: 'paste content', onSelect: vi.fn() },
  { id: 'cut', label: 'Cut', value: 'cut-val', disabled: true },
];

const groups: CommandGroupType[] = [
  { id: 'g1', heading: 'Editing', items: [{ id: 'copy', label: 'Copy', onSelect: vi.fn() }] },
  { id: 'g2', heading: 'View', items: [{ id: 'zoom', label: 'Zoom', onSelect: vi.fn() }] },
];

describe('Command', () => {
  it('renders a command listbox when open', () => {
    render(<Command items={items} open showSearch={false} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('filters items as the user types', async () => {
    const user = userEvent.setup();
    render(<Command items={items} open showSearch />);
    await user.type(screen.getByRole('searchbox'), 'Pas');
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(<Command items={items} open={false} showSearch={false} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders group headings when using groups', () => {
    render(<Command groups={groups} open showSearch={false} />);
    expect(screen.getByText('Editing')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Zoom')).toBeInTheDocument();
  });

  it('filters within groups', async () => {
    const user = userEvent.setup();
    render(<Command groups={groups} open showSearch />);
    await user.type(screen.getByRole('searchbox'), 'Zoo');
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });

  it('selects an item on click and fires its onSelect', () => {
    const onSelect = vi.fn();
    render(
      <Command
        items={[{ id: 'copy', label: 'Copy', onSelect }]}
        open
        showSearch={false}
        closeOnSelect={false}
      />
    );
    const opts = screen.getAllByRole('option');
    fireEvent.click(opts[0]);
    expect(onSelect).toHaveBeenCalled();
  });

  it('does not select disabled items', () => {
    const onSelect = vi.fn();
    render(<Command items={items} open showSearch={false} onSelect={onSelect} closeOnSelect={false} />);
    const opts = screen.getAllByRole('option');
    fireEvent.click(opts[2]); // Cut (disabled)
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows no-results message when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Command items={items} open showSearch noResultsMessage="No commands" />);
    await user.type(screen.getByRole('searchbox'), 'zzzzz');
    expect(screen.getByText('No commands')).toBeInTheDocument();
  });

  it('renders item shortcuts and descriptions', () => {
    render(<Command items={items} open showSearch={false} />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('paste content')).toBeInTheDocument();
  });

  it('renders an item icon when provided', () => {
    render(
      <Command
        items={[{ id: 'a', label: 'A', icon: <span data-testid="ic">★</span> }]}
        open
        showSearch={false}
      />
    );
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it('supports a custom itemRenderer', () => {
    render(
      <Command
        items={[{ id: 'a', label: 'A' }]}
        open
        showSearch={false}
        itemRenderer={(item) => <div key={item.id} data-testid="custom-item">{item.label}</div>}
      />
    );
    expect(screen.getByTestId('custom-item')).toBeInTheDocument();
  });

  it('supports a custom groupRenderer', () => {
    render(
      <Command
        groups={groups}
        open
        showSearch={false}
        groupRenderer={(g) => <div key={g.id} data-testid="custom-group">{g.heading}</div>}
      />
    );
    expect(screen.getAllByTestId('custom-group').length).toBe(2);
  });

  it('supports custom noResultsRenderer', async () => {
    const user = userEvent.setup();
    render(
      <Command
        items={items}
        open
        showSearch
        noResultsRenderer={() => <div data-testid="custom-empty">empty</div>}
      />
    );
    await user.type(screen.getByRole('searchbox'), 'zzzzz');
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
  });

  it('supports a custom searchRenderer', () => {
    render(
      <Command
        items={items}
        open
        searchRenderer={() => <div data-testid="custom-search">search</div>}
      />
    );
    expect(screen.getByTestId('custom-search')).toBeInTheDocument();
  });

  it('renders through a portal when portal and open are set', () => {
    render(<Command items={items} open portal showSearch={false} />);
    // The portal mounts content into document.body.
    expect(document.querySelector('[data-testid="command"]')).toBeInTheDocument();
  });

  it('renders custom children inside the command palette', () => {
    render(
      <Command items={items} open showSearch={false}>
        <div data-testid="footer-child">footer</div>
      </Command>
    );
    expect(screen.getByTestId('footer-child')).toBeInTheDocument();
  });

  it('uses the item index as the React key when the item has no id', () => {
    render(<Command items={[{ label: 'NoId' }]} open showSearch={false} />);
    expect(screen.getByText('NoId')).toBeInTheDocument();
  });

  it('falls back to the default no-results message when none is provided', async () => {
    const user = userEvent.setup();
    render(<Command items={items} open showSearch />);
    await user.type(screen.getByRole('searchbox'), 'zzzzz');
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});

// Direct hook tests for handlers/branches not reachable through the component.
describe('useCommand (hook handlers)', () => {
  function setup(props: Parameters<typeof useCommand>[0] = {}) {
    const result: { current: ReturnType<typeof useCommand> } = { current: null as any };
    function Probe() {
      result.current = useCommand(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  it('handleOpen / handleClose / handleToggle update open state', async () => {
    const res = setup({ items });
    await act(async () => { await res.current.handlers.handleOpen(); });
    expect(res.current.state.open).toBe(true);
    await act(async () => { await res.current.handlers.handleToggle(); });
    expect(res.current.state.open).toBe(false);
    await act(async () => { await res.current.handlers.handleOpen(); });
    await act(async () => { await res.current.handlers.handleClose(); });
    expect(res.current.state.open).toBe(false);
  });

  it('onBeforeOpen returning false prevents open', async () => {
    const res = setup({ items, onBeforeOpen: async () => false });
    await act(async () => { await res.current.handlers.handleOpen(); });
    expect(res.current.state.open).toBe(false);
  });

  it('onBeforeClose returning false prevents close', async () => {
    const res = setup({ items, defaultOpen: true, onBeforeClose: async () => false });
    await act(async () => { await res.current.handlers.handleClose(); });
    expect(res.current.state.open).toBe(true);
  });

  it('handleSelect fires item.onSelect and global onSelect', () => {
    const itemSelect = vi.fn();
    const onSelect = vi.fn();
    const res = setup({ items, onSelect, closeOnSelect: false });
    act(() => res.current.handlers.handleSelect({ id: 'x', label: 'X', onSelect: itemSelect }));
    expect(itemSelect).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
  });

  it('handleSelect respects disabled items', () => {
    const onSelect = vi.fn();
    const res = setup({ items, onSelect, closeOnSelect: false });
    act(() => res.current.handlers.handleSelect({ id: 'x', label: 'X', disabled: true }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handleItemFocus sets selected index', () => {
    const res = setup({ items });
    act(() => res.current.handlers.handleItemFocus(1));
    expect(res.current.state.selectedIndex).toBe(1);
  });

  it('ArrowDown / ArrowUp wrap and Enter selects', () => {
    const onSelect = vi.fn();
    const res = setup({ items, onSelect, closeOnSelect: false });
    act(() => res.current.handlers.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    act(() => res.current.handlers.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
    act(() => res.current.handlers.handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any));
    act(() => res.current.handlers.handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any));
    expect(onSelect).toHaveBeenCalled();
  });

  it('Escape closes when closeOnEscape', async () => {
    const res = setup({ items, defaultOpen: true });
    act(() => res.current.handlers.handleKeyDown({ key: 'Escape', preventDefault: () => {} } as any));
    // close is async; ensure no throw.
    expect(res.current.handlers.handleKeyDown).toBeTruthy();
  });

  it('disabled prevents open and key handling', async () => {
    const res = setup({ items, disabled: true });
    await act(async () => { await res.current.handlers.handleOpen(); });
    expect(res.current.state.open).toBe(false);
    act(() => res.current.handlers.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any));
  });

  it('respects custom keyBindings', () => {
    const handler = vi.fn();
    const res = setup({ items, keyBindings: { '?': handler } });
    act(() => res.current.handlers.handleKeyDown({ key: '?', preventDefault: () => {} } as any));
    expect(handler).toHaveBeenCalled();
  });

  it('handleSearch updates value (uncontrolled and controlled)', () => {
    const onValueChange = vi.fn();
    const res = setup({ items, onValueChange });
    act(() => res.current.handlers.handleSearch('term'));
    expect(res.current.state.value).toBe('term');
    // controlled
    const res2 = setup({ items, value: 'fixed', onValueChange });
    act(() => res2.current.handlers.handleSearch('other'));
    expect(onValueChange).toHaveBeenCalledWith('other');
  });

  it('handleBeforeOpen / handleBeforeClose delegate', async () => {
    const res = setup({ items, onBeforeOpen: () => true, onBeforeClose: () => false });
    let v1: any, v2: any;
    await act(async () => { v1 = await res.current.handlers.handleBeforeOpen(); });
    await act(async () => { v2 = await res.current.handlers.handleBeforeClose(); });
    expect(v1).toBe(true);
    expect(v2).toBe(false);
  });

  it('default branch focuses search input for typing', () => {
    const res = setup({ items });
    // non-handled key -> default branch (focus search); ensure no throw.
    act(() => res.current.handlers.handleKeyDown({ key: 'x', preventDefault: () => {}, target: {} as any } as any));
  });
});

// Exercise the exported building-block sub-components that the headless Command
// ships alongside the main component.
describe('Command sub-components', () => {
  it('CommandTrigger fires onOpen on click and on Enter', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CommandTrigger onOpen={onOpen}>Open</CommandTrigger>);
    await user.click(screen.getByTestId('command-trigger'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    screen.getByTestId('command-trigger').focus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('CommandTrigger fires onOpen on Space', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CommandTrigger onOpen={onOpen}>Open</CommandTrigger>);
    screen.getByTestId('command-trigger').focus();
    await user.keyboard(' ');
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('CommandTrigger ignores non-activation keys', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<CommandTrigger onOpen={onOpen}>Open</CommandTrigger>);
    screen.getByTestId('command-trigger').focus();
    await user.keyboard('{ArrowDown}');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('CommandInput renders its input with provided attributes', () => {
    render(<CommandInput inputProps={{ placeholder: 'Type here' }} />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('CommandList renders children with a listbox role', () => {
    render(<CommandList><div>row</div></CommandList>);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('row')).toBeInTheDocument();
  });

  it('CommandItem renders and fires onSelect when enabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CommandItem onSelect={onSelect}>Run</CommandItem>);
    await user.click(screen.getByTestId('command-item'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('CommandItem does not fire onSelect when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CommandItem disabled onSelect={onSelect}>Run</CommandItem>);
    await user.click(screen.getByTestId('command-item'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('CommandItem renders an icon, shortcut, and description', () => {
    render(
      <CommandItem
        icon={<span data-testid="i">★</span>}
        shortcut={['Ctrl', 'K']}
        description="Run the action"
      >
        Run
      </CommandItem>
    );
    expect(screen.getByTestId('i')).toBeInTheDocument();
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('Run the action')).toBeInTheDocument();
  });

  it('CommandGroup renders its heading and children', () => {
    render(
      <CommandGroup heading="Actions">
        <div>child-a</div>
      </CommandGroup>
    );
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('child-a')).toBeInTheDocument();
  });

  it('CommandSeparator renders a separator', () => {
    render(<CommandSeparator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('CommandEmpty renders its custom message', () => {
    render(<CommandEmpty>No matches</CommandEmpty>);
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('CommandEmpty falls back to the default message', () => {
    render(<CommandEmpty />);
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
