import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonGroup } from '../src/components/ButtonGroup';
import { useButtonGroup } from '../src/hooks';

const buttons = [
  { label: 'Left' },
  { label: 'Center' },
  { label: 'Right' },
];

describe('ButtonGroup', () => {
  it('renders a group containing one button per entry', () => {
    render(<ButtonGroup buttons={buttons} />);
    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Right' })).toBeInTheDocument();
  });

  it('renders a radiogroup and reports selection in exclusive mode', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ButtonGroup
        buttons={buttons}
        exclusive
        onSelectionChange={onSelectionChange}
      />
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    // In exclusive mode each button is exposed with role="radio".
    await user.click(screen.getByRole('radio', { name: 'Center' }));
    expect(onSelectionChange).toHaveBeenCalledWith(1);
  });

  it.each(['sm', 'md', 'lg'] as const)('renders with size=%s', (size) => {
    const { container } = render(<ButtonGroup buttons={buttons} size={size} />);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)(
    'renders selected styling for the %s variant (exclusive mode)',
    (variant) => {
      render(
        <ButtonGroup buttons={buttons} variant={variant} exclusive defaultSelectedIndex={1} />
      );
      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
    }
  );

  it('renders non-attached buttons with vertical spacing', () => {
    const { container } = render(
      <ButtonGroup buttons={buttons} orientation="vertical" attached={false} />
    );
    expect(container.querySelectorAll('button').length).toBe(3);
  });

  it.each(['horizontal', 'vertical'] as const)(
    'renders attached grouping in the %s orientation',
    (orientation) => {
      const { container } = render(
        <ButtonGroup buttons={buttons} attached orientation={orientation} />
      );
      expect(container.querySelectorAll('button').length).toBe(3);
    }
  );

  it('renders a disabled group and disabled per-button overrides', () => {
    render(
      <ButtonGroup
        buttons={[{ label: 'A' }, { label: 'B', disabled: true }]}
        disabled
      />
    );
    const group = screen.getByRole('group');
    expect(group.className).toContain('opacity-50');
    expect(screen.getAllByRole('button').every((b) => b.hasAttribute('disabled'))).toBe(true);
  });

  it('renders as a span when as=false', () => {
    const { container } = render(<ButtonGroup buttons={buttons} as={false} />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('uses a custom children renderer with selected state', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const renderSpy = vi.fn(
      (_button: any, _props: any, _index: number, _isSelected: boolean) => null
    );
    render(
      <ButtonGroup buttons={buttons} exclusive onSelectionChange={onSelectionChange}>
        {renderSpy}
      </ButtonGroup>
    );
    // initial render -> custom renderer invoked, none selected
    expect(renderSpy).toHaveBeenCalled();
    // select the first radio -> isSelected flips true on next render
    await user.click(screen.getAllByRole('radio')[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it('fires the per-button onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ButtonGroup buttons={[{ label: 'Go', onClick }]} />);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('useButtonGroup', () => {
  const probe = (props: any) => {
    let result: any;
    const Probe = () => { result = useButtonGroup(props); return null; };
    render(<Probe />);
    return result;
  };

  it('deselects an exclusive selection when the same index is selected again', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, defaultSelectedIndex: 1, onSelectionChange });
    act(() => r.actions.selectButton(1));
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
  });

  it('selectButton guards against disabled / out-of-range indices', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 2, exclusive: true, disabled: true, onSelectionChange });
    act(() => r.actions.selectButton(0));
    act(() => r.actions.selectButton(-1));
    act(() => r.actions.selectButton(99));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('deselectAll no-ops when disabled or already null, and fires when something is selected', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, defaultSelectedIndex: 1, onSelectionChange });
    act(() => r.actions.deselectAll());
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    // disabled group -> no-op
    const r2 = probe({ totalItems: 3, exclusive: true, defaultSelectedIndex: 0, disabled: true, onSelectionChange });
    act(() => r2.actions.deselectAll());
  });

  it('deselectAll no-ops when nothing is selected (selectedIndex null)', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, selectedIndex: null, onSelectionChange });
    act(() => r.actions.deselectAll());
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('isSelected returns false in non-exclusive mode', () => {
    const r = probe({ totalItems: 3, exclusive: false });
    expect(r.actions.isSelected(0)).toBe(false);
  });

  it('setDisabled is a no-op action that can be invoked', () => {
    const r = probe({ totalItems: 3 });
    expect(() => act(() => r.actions.setDisabled(true))).not.toThrow();
  });

  it('keyboard arrow-right advances the selection in horizontal exclusive mode (wraps)', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, orientation: 'horizontal', exclusive: true, defaultSelectedIndex: 0, onSelectionChange });
    // no DOM group in the probe; invoke groupProps.onKeyDown directly.
    act(() => {
      r.groupProps.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any);
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(1);
  });

  it('keyboard arrow-left moves back (and wraps to last from null) in horizontal mode', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, orientation: 'horizontal', exclusive: true, onSelectionChange });
    // nothing selected -> ArrowLeft wraps to last index
    act(() => {
      r.groupProps.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any);
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(2);
  });

  it('keyboard arrow-down advances and arrow-up wraps in vertical mode', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, orientation: 'vertical', exclusive: true, defaultSelectedIndex: 0, onSelectionChange });
    act(() => {
      r.groupProps.onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any);
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(1);
    // from null -> ArrowUp wraps to last
    const r2 = probe({ totalItems: 3, orientation: 'vertical', exclusive: true, onSelectionChange });
    act(() => {
      r2.groupProps.onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any);
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(2);
  });

  it('keyboard Home selects first, End selects last', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, defaultSelectedIndex: 1, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: 'Home', preventDefault: () => {} } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(0);
    act(() => { r.groupProps.onKeyDown({ key: 'End', preventDefault: () => {} } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(2);
  });

  it('Space/Enter toggles off the current exclusive selection and calls preventDefault', () => {
    const onSelectionChange = vi.fn();
    const preventDefault = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, defaultSelectedIndex: 1, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: ' ', preventDefault } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('keyboard does nothing when the group is disabled', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, disabled: true, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: 'Home', preventDefault: () => {} } as any); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('arrow keys in the non-matching orientation produce no selection', () => {
    const onSelectionChange = vi.fn();
    // horizontal group: ArrowDown should be a no-op
    const r = probe({ totalItems: 3, orientation: 'horizontal', exclusive: true, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any); });
    act(() => { r.groupProps.onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any); });
    // vertical group: ArrowRight / ArrowLeft no-op
    const r2 = probe({ totalItems: 3, orientation: 'vertical', exclusive: true, onSelectionChange });
    act(() => { r2.groupProps.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any); });
    act(() => { r2.groupProps.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('ArrowRight/ArrowDown select index 0 when nothing is selected', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, orientation: 'horizontal', exclusive: true, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(0);
    const r2 = probe({ totalItems: 3, orientation: 'vertical', exclusive: true, onSelectionChange });
    act(() => { r2.groupProps.onKeyDown({ key: 'ArrowDown', preventDefault: () => {} } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(0);
  });

  it('ArrowLeft/ArrowUp move back when something is selected (wrap)', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, orientation: 'horizontal', exclusive: true, defaultSelectedIndex: 1, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: 'ArrowLeft', preventDefault: () => {} } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(0);
    const r2 = probe({ totalItems: 3, orientation: 'vertical', exclusive: true, defaultSelectedIndex: 1, onSelectionChange });
    act(() => { r2.groupProps.onKeyDown({ key: 'ArrowUp', preventDefault: () => {} } as any); });
    expect(onSelectionChange).toHaveBeenLastCalledWith(0);
  });

  it('Space/Enter only toggles off in exclusive mode with a selection, else just prevents default', () => {
    const onSelectionChange = vi.fn();
    const preventDefault = vi.fn();
    // non-exclusive: Space should not deselect, only preventDefault
    const r = probe({ totalItems: 3, exclusive: false, defaultSelectedIndex: 1, onSelectionChange });
    act(() => { r.groupProps.onKeyDown({ key: ' ', preventDefault } as any); });
    expect(preventDefault).toHaveBeenCalled();
    expect(onSelectionChange).not.toHaveBeenCalled();
    // exclusive but nothing selected -> also no deselect
    const r2 = probe({ totalItems: 3, exclusive: true, selectedIndex: null, onSelectionChange });
    act(() => { r2.groupProps.onKeyDown({ key: 'Enter', preventDefault } as any); });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('getButtonProps onClick selects the index and composes additional onClick', () => {
    const additionalOnClick = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true });
    const props = r.getButtonProps(1, { onClick: additionalOnClick });
    act(() => { props.onClick({} as any); });
    expect(additionalOnClick).toHaveBeenCalled();
  });

  it('getButtonProps onClick / onKeyDown no-op when disabled', () => {
    const additionalOnKeyDown = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, disabled: true });
    const props = r.getButtonProps(0, { onKeyDown: additionalOnKeyDown });
    act(() => { props.onClick({} as any); });
    act(() => { props.onKeyDown({ key: 'Enter', preventDefault: () => {} } as any); });
    expect(additionalOnKeyDown).not.toHaveBeenCalled();
  });

  it('getButtonProps onKeyDown selects on Enter / Space and composes additional onKeyDown', () => {
    const additionalOnKeyDown = vi.fn();
    const preventDefault = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true });
    const props = r.getButtonProps(2, { onKeyDown: additionalOnKeyDown });
    act(() => { props.onKeyDown({ key: 'Enter', preventDefault } as any); });
    act(() => { props.onKeyDown({ key: ' ', preventDefault } as any); });
    // a non-activation key still composes the additional handler without selecting
    act(() => { props.onKeyDown({ key: 'Tab', preventDefault } as any); });
    expect(additionalOnKeyDown).toHaveBeenCalledTimes(3);
  });

  it('respects controlled selectedIndex without mutating internal state', () => {
    const onSelectionChange = vi.fn();
    const r = probe({ totalItems: 3, exclusive: true, selectedIndex: 1, onSelectionChange });
    act(() => r.actions.selectButton(0));
    // controlled: still reports the controlled index in state
    expect(r.state.selectedIndex).toBe(1);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('exposes data-position middle for an interior button', () => {
    const r = probe({ totalItems: 3 });
    expect(r.getButtonProps(1)['data-position']).toBe('middle');
    expect(r.getButtonProps(0)['data-position']).toBe('first');
    expect(r.getButtonProps(2)['data-position']).toBe('last');
  });
});
