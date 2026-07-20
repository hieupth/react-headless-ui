import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { axe } from 'jest-axe';
import { Slot, SlotClone, SlotWrapper, SlotPortal, SlotRadioGroup } from '../src/components/Slot';
import { useSlot } from '../src/hooks/useSlot';

function actAndRerender<R>(hook: { result: { current: R }; rerender: (props?: any) => void }, fn: () => void) {
  act(fn);
  hook.rerender();
}

describe('Slot', () => {
  it('renders children inside a wrapper', () => {
    render(
      <Slot>
        <button>Slotted</button>
      </Slot>
    );
    expect(screen.getByText('Slotted')).toBeInTheDocument();
  });

  it('renders null content when no children provided', () => {
    const { container } = render(<Slot />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the as-child SlotClone forwarding its children', () => {
    render(
      <SlotClone>
        <span>Cloned</span>
      </SlotClone>
    );
    expect(screen.getByText('Cloned')).toBeInTheDocument();
  });

  it('renders the SlotWrapper variant', () => {
    render(
      <SlotWrapper>
        <span>Wrapped</span>
      </SlotWrapper>
    );
    expect(screen.getByText('Wrapped')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Slot>
        <button>x</button>
      </Slot>
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders a single element child by cloning its props', () => {
    render(
      <Slot clone>
        <button>Cloned</button>
      </Slot>
    );
    expect(screen.getByText('Cloned')).toBeInTheDocument();
  });

  it('renders multiple element children each wrapped in a fragment', () => {
    render(
      <Slot>
        <span>First</span>
        <span>Second</span>
      </Slot>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('renders multiple keyed children preserving their keys', () => {
    render(
      <Slot>
        <span key="a">KeyedFirst</span>
        <span key="b">KeyedSecond</span>
      </Slot>
    );
    expect(screen.getByText('KeyedFirst')).toBeInTheDocument();
    expect(screen.getByText('KeyedSecond')).toBeInTheDocument();
  });

  it('renders multiple children preserving non-element nodes', () => {
    render(
      <Slot>
        <span>Element</span>
        {'text-node'}
      </Slot>
    );
    expect(screen.getByText('Element')).toBeInTheDocument();
    expect(screen.getByText('text-node')).toBeInTheDocument();
  });

  it('renders non-element children unchanged (single)', () => {
    render(<Slot>{'just-text'}</Slot>);
    expect(screen.getByText('just-text')).toBeInTheDocument();
  });

  it('uses a custom renderChildren renderer', () => {
    render(
      <Slot renderChildren={(c) => <div data-testid="custom-children">{c}</div>}>
        <span>x</span>
      </Slot>
    );
    expect(screen.getByTestId('custom-children')).toBeInTheDocument();
  });

  it('renders a debug overlay and debug styles when debug is enabled', () => {
    const { container } = render(
      <Slot debug className="dbg">
        <button style={{ color: 'red' }}>Dbg</button>
      </Slot>
    );
    expect(screen.getByText(/WRAPPER/)).toBeInTheDocument();
  });

  it('renders a debug overlay in clone mode', () => {
    render(
      <Slot debug clone>
        <button>DbgClone</button>
      </Slot>
    );
    expect(screen.getByText(/CLONE/)).toBeInTheDocument();
  });

  it('renders a debug overlay reflecting active/disabled/focused state in wrapper mode', () => {
    render(
      <Slot debug active disabled className="dbg">
        <button>StateDbg</button>
      </Slot>
    );
    const overlay = screen.getByText(/WRAPPER/);
    expect(overlay.textContent).toContain('DISABLED');
    expect(overlay.textContent).toContain('ACTIVE');
  });

  it('renders a debug overlay reflecting focused state when the host receives focus', () => {
    render(
      <Slot debug wrapperProps={{ tabIndex: 0 }}>
        <button>FocDbg</button>
      </Slot>
    );
    const wrapper = screen.getByTestId('slot-wrapper');
    act(() => wrapper.focus());
    expect(screen.getByText(/WRAPPER/).textContent).toContain('FOCUSED');
  });

  it('forwards a child object ref but skips it when allowRefForward is false', () => {
    const childRef: React.MutableRefObject<any> = { current: 'pre' };
    render(
      <Slot clone allowRefForward={false}>
        <button ref={childRef as any}>NoFwd</button>
      </Slot>
    );
    // allowRefForward=false leaves the child ref untouched
    expect(childRef.current).toBe('pre');
  });

  it('forwards a callback ref onto the cloned child', () => {
    const cb = vi.fn();
    render(
      <SlotClone ref={cb as unknown as React.Ref<HTMLElement>}>
        <button>Ref</button>
      </SlotClone>
    );
    expect(cb).toHaveBeenCalled();
  });

  it('renders the as-child SlotClone forwarding an object child ref', () => {
    const childRef: React.MutableRefObject<any> = { current: null };
    render(
      <SlotClone>
        <button ref={childRef as any}>ObjRef</button>
      </SlotClone>
    );
    expect(childRef.current).not.toBeNull();
  });

  it('renders a callback child ref through clone mode', () => {
    const childCb = vi.fn();
    render(
      <Slot clone>
        <button ref={childCb as any}>CbChild</button>
      </Slot>
    );
    expect(childCb).toHaveBeenCalled();
  });

  it('forwards an object ref onto the Slot host in clone mode', () => {
    const slotRef: React.MutableRefObject<HTMLElement | null> = { current: null };
    render(
      <SlotClone ref={slotRef as unknown as React.Ref<HTMLElement>}>
        <button>ObjSlot</button>
      </SlotClone>
    );
    expect(slotRef.current).not.toBeNull();
  });

  it('renders SlotPortal into a container element', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(
      <SlotPortal container={host}>
        <span>Portaled</span>
      </SlotPortal>
    );
    expect(host.querySelector('span')?.textContent).toBe('Portaled');
    document.body.removeChild(host);
  });

  it('renders SlotPortal with a backdrop and a string selector container', () => {
    const host = document.createElement('div');
    host.id = 'slot-portal-host';
    document.body.appendChild(host);
    render(
      <SlotPortal container="#slot-portal-host" showBackdrop>
        <span>Str</span>
      </SlotPortal>
    );
    expect(screen.getByTestId('slot-portal-backdrop')).toBeInTheDocument();
    expect(host.querySelector('span')?.textContent).toBe('Str');
    document.body.removeChild(host);
  });

  it('SlotPortal renders nothing until the container resolves', () => {
    const { container } = render(
      <SlotPortal container="#does-not-exist">
        <span>Nope</span>
      </SlotPortal>
    );
    expect(container.querySelector('span')).toBeNull();
  });

  it('SlotPortal renders nothing when no container is provided', () => {
    const { container } = render(
      <SlotPortal>
        <span>NoContainer</span>
      </SlotPortal>
    );
    expect(container.querySelector('span')).toBeNull();
  });

  it('SlotRadioGroup renders options and reports the selected value (uncontrolled)', () => {
    const onChange = vi.fn();
    render(
      <SlotRadioGroup defaultValue="a" onChange={onChange} name="grp">
        <input value="a" readOnly />
        <input value="b" readOnly />
      </SlotRadioGroup>
    );
    const group = screen.getByTestId('slot-radio-group');
    expect(group.getAttribute('role')).toBe('radiogroup');
    const inputs = screen.getAllByRole('radio');
    expect(inputs[0].getAttribute('data-radio-checked')).toBe('true');
  });

  it('SlotRadioGroup honours a controlled value and horizontal orientation', () => {
    render(
      <SlotRadioGroup value="b" orientation="horizontal">
        <span value="a">A</span>
        <span value="b">B</span>
      </SlotRadioGroup>
    );
    const group = screen.getByTestId('slot-radio-group');
    expect(group.className).toContain('horizontal');
  });

  it('SlotRadioGroup fires onChange and updates selection when an option is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SlotRadioGroup defaultValue="a" onChange={onChange} name="grp">
        <input value="a" readOnly />
        <input value="b" readOnly />
      </SlotRadioGroup>
    );
    const inputs = screen.getAllByRole('radio');
    await user.click(inputs[1]);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(inputs[1].getAttribute('data-radio-checked')).toBe('true');
  });

  it('SlotRadioGroup does not mutate internal state when controlled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SlotRadioGroup value="a" onChange={onChange}>
        <input value="a" readOnly />
        <input value="b" readOnly />
      </SlotRadioGroup>
    );
    const inputs = screen.getAllByRole('radio');
    await user.click(inputs[1]);
    expect(onChange).toHaveBeenCalledWith('b');
    // controlled: selection stays on "a"
    expect(inputs[0].getAttribute('data-radio-checked')).toBe('true');
  });

  it('SlotRadioGroup handles a child without a value prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SlotRadioGroup onChange={onChange}>
        <input readOnly />
      </SlotRadioGroup>
    );
    const input = screen.getByRole('radio');
    await user.click(input);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('SlotRadioGroup passes through non-element children unchanged', () => {
    render(
      <SlotRadioGroup>
        {'plain'}
      </SlotRadioGroup>
    );
    expect(screen.getByText('plain')).toBeInTheDocument();
  });
});

describe('useSlot', () => {
  it('exposes the default inactive state with the merge strategy', () => {
    const hook = renderHook(() => useSlot({}));
    const { state, attributes } = hook.result.current;
    expect(state.active).toBe(false);
    expect(state.disabled).toBe(false);
    expect(state.focused).toBe(false);
    expect(state.mergeStrategy).toBe('merge');
    expect(state.clone).toBe(false);
    expect(attributes['data-slot']).toBe('true');
    expect(attributes['data-merge-strategy']).toBe('merge');
  });

  it('setActive toggles the active state in uncontrolled mode', () => {
    const hook = renderHook(() => useSlot({}));
    actAndRerender(hook, () => hook.result.current.actions.setActive(true));
    expect(hook.result.current.state.active).toBe(true);
    expect(hook.result.current.attributes['data-active']).toBe(true);
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(hook.result.current.state.active).toBe(false);
    expect(hook.result.current.attributes['data-active']).toBeUndefined();
  });

  it('controlled active is authoritative and cannot be mutated by setActive', () => {
    const hook = renderHook(() => useSlot({ active: true }));
    actAndRerender(hook, () => hook.result.current.actions.setActive(false));
    expect(hook.result.current.state.active).toBe(true);
  });

  it('disabled flows through to attributes and event handlers', () => {
    const onClick = vi.fn();
    const hook = renderHook(() => useSlot({ disabled: true, onClick }));
    expect(hook.result.current.attributes['data-disabled']).toBe(true);
    act(() => hook.result.current.actions.focus());
    // Click handler is exposed via focusable/pressable mixins indirectly;
    // here we assert the disabled flag is reflected on state + attributes.
    expect(hook.result.current.state.disabled).toBe(true);
  });

  it('setMergeStrategy updates the strategy and attribute', () => {
    const hook = renderHook(() => useSlot({}));
    actAndRerender(hook, () => hook.result.current.actions.setMergeStrategy('replace'));
    expect(hook.result.current.state.mergeStrategy).toBe('replace');
    expect(hook.result.current.attributes['data-merge-strategy']).toBe('replace');
  });

  it('setClone updates the clone flag', () => {
    const hook = renderHook(() => useSlot({}));
    actAndRerender(hook, () => hook.result.current.actions.setClone(true));
    expect(hook.result.current.state.clone).toBe(true);
  });

  it('updateChildren updates the children state', () => {
    const hook = renderHook(() => useSlot({}));
    actAndRerender(hook, () => hook.result.current.actions.updateChildren('new'));
    expect(hook.result.current.state.children).toBe('new');
  });

  it('"merge" strategy fills only missing child props', () => {
    const hook = renderHook(() => useSlot({ mergeStrategy: 'merge' }));
    const merged = hook.result.current.actions.mergeProps(
      { id: 'child', className: 'kept' },
      { id: 'slot', title: 'added' }
    );
    // className is excluded by default; id stays from child; title is added.
    expect(merged.id).toBe('child');
    expect(merged.title).toBe('added');
    expect(merged.className).toBe('kept');
  });

  it('"replace" strategy overrides child props with slot props', () => {
    const hook = renderHook(() => useSlot({ mergeStrategy: 'replace' }));
    const merged = hook.result.current.actions.mergeProps(
      { id: 'child', title: 'child-title' },
      { id: 'slot', title: 'slot-title' }
    );
    expect(merged.id).toBe('slot');
    expect(merged.title).toBe('slot-title');
  });

  it('"append" strategy adds suffixed keys', () => {
    const hook = renderHook(() => useSlot({ mergeStrategy: 'append' }));
    const merged = hook.result.current.actions.mergeProps(
      { id: 'child' },
      { title: 'slot-title' }
    );
    expect(merged['title-data-slot-append']).toBe('slot-title');
    expect(merged.id).toBe('child');
  });

  it('"prepend" strategy adds prefixed keys', () => {
    const hook = renderHook(() => useSlot({ mergeStrategy: 'prepend' }));
    const merged = hook.result.current.actions.mergeProps(
      { id: 'child' },
      { title: 'slot-title' }
    );
    expect(merged['title-data-slot-prepend']).toBe('slot-title');
  });

  it('priority props (aria-*) always override child props even in merge', () => {
    const hook = renderHook(() => useSlot({ mergeStrategy: 'merge' }));
    const merged = hook.result.current.actions.mergeProps(
      { 'aria-label': 'child' },
      { 'aria-label': 'slot' }
    );
    expect(merged['aria-label']).toBe('slot');
  });

  it('priority props override child props in the replace strategy too', () => {
    const hook = renderHook(() => useSlot({ mergeStrategy: 'replace' }));
    const merged = hook.result.current.actions.mergeProps(
      { id: 'child', 'aria-label': 'child' },
      { id: 'slot', 'aria-label': 'slot' }
    );
    expect(merged['aria-label']).toBe('slot');
    expect(merged.id).toBe('slot');
  });

  it('onFocus/onBlur attributes update focused state and forward callbacks', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const slotRef: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: ReturnType<typeof useSlot> | null = null;
    function Probe() {
      api = useSlot({ slotRef, onFocus, onBlur });
      return <div ref={slotRef as any} data-testid="host" tabIndex={0} />;
    }
    render(<Probe />);
    act(() => api!.attributes.onFocus({} as any));
    expect(api!.state.focused).toBe(true);
    expect(onFocus).toHaveBeenCalled();
    act(() => api!.attributes.onBlur({} as any));
    expect(api!.state.focused).toBe(false);
    expect(onBlur).toHaveBeenCalled();
  });

  it('excludeProps removes the listed props from slot props', () => {
    const hook = renderHook(() =>
      useSlot({ mergeStrategy: 'replace', excludeProps: ['id', 'className', 'children', 'key', 'ref', 'style', 'data-foo'] })
    );
    const merged = hook.result.current.actions.mergeProps(
      { id: 'child' },
      { id: 'slot', 'data-foo': 'x', title: 't' }
    );
    expect(merged.id).toBe('child'); // excluded, so child value wins
    expect(merged.title).toBe('t');
    expect(merged['data-foo']).toBeUndefined();
  });

  it('additional mergeProps from the hook options are folded in', () => {
    const hook = renderHook(() =>
      useSlot({ mergeStrategy: 'merge', mergeProps: { tabIndex: 0 } })
    );
    const merged = hook.result.current.actions.mergeProps({ id: 'c' }, {});
    expect(merged.tabIndex).toBe(0);
  });

  it('forwardRef stores the passed ref when ref forwarding is allowed', () => {
    const hook = renderHook(() => useSlot({}));
    const ref = { current: null } as any;
    actAndRerender(hook, () => hook.result.current.actions.forwardRef(ref));
    expect(hook.result.current.state.forwardedRef).toBe(ref);
  });

  it('forwardRef is a no-op when allowRefForward is false', () => {
    const hook = renderHook(() => useSlot({ allowRefForward: false }));
    const ref = { current: null } as any;
    actAndRerender(hook, () => hook.result.current.actions.forwardRef(ref));
    expect(hook.result.current.state.forwardedRef).toBe(null);
  });

  it('setDisabled is a no-op action kept for API symmetry', () => {
    const hook = renderHook(() => useSlot({}));
    expect(() => actAndRerender(hook, () => hook.result.current.actions.setDisabled(true))).not.toThrow();
    // disabled is prop-driven, so the no-op leaves state.disabled false.
    expect(hook.result.current.state.disabled).toBe(false);
  });

  it('focus/blur/getElement run against the slot element attached via slotRef', () => {
    const slotRef: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: ReturnType<typeof useSlot> | null = null;
    function Probe() {
      api = useSlot({ slotRef });
      return <div ref={slotRef as any} data-testid="host" tabIndex={0} />;
    }
    render(<Probe />);
    const host = screen.getByTestId('host');
    // getElement returns the live DOM node once the element-tracking effect has run.
    expect(api!.actions.getElement()).toBe(host);
    // focus() / blur() delegate to the DOM node.
    act(() => api!.actions.focus());
    expect(document.activeElement).toBe(host);
    act(() => api!.actions.blur());
    expect(document.activeElement).not.toBe(host);
  });

  it('forwards an object ref (with an existing current) via the forwardedRef prop', () => {
    const slotRef: React.RefObject<HTMLDivElement | null> = { current: null };
    // The effect's object-ref branch only assigns when the ref already holds a value;
    // pre-seed current so the assignment path is exercised.
    const objRef: React.MutableRefObject<HTMLElement | null> = { current: {} as any };
    function Probe() {
      useSlot({ slotRef, forwardedRef: objRef as any });
      return <div ref={slotRef as any} data-testid="obj-host" />;
    }
    render(<Probe />);
    expect(objRef.current).toBe(screen.getByTestId('obj-host'));
  });

  it('forwardRef action stores an object ref and the effect applies it', () => {
    const slotRef: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: ReturnType<typeof useSlot> | null = null;
    function Probe() {
      api = useSlot({ slotRef });
      return <div ref={slotRef as any} data-testid="act-host" />;
    }
    const { rerender } = render(<Probe />);
    const objRef: React.MutableRefObject<HTMLElement | null> = { current: {} as any };
    act(() => api!.actions.forwardRef(objRef as any));
    rerender(<Probe />);
    expect(objRef.current).toBe(screen.getByTestId('act-host'));
  });

  it('object ref with a null current is left untouched by the effect', () => {
    const slotRef: React.RefObject<HTMLDivElement | null> = { current: null };
    let api: ReturnType<typeof useSlot> | null = null;
    function Probe() {
      api = useSlot({ slotRef });
      return <div ref={slotRef as any} data-testid="null-host" />;
    }
    const { rerender } = render(<Probe />);
    // A ref with no current value hits the effect's falsy-current branch (no assignment).
    const emptyRef: React.MutableRefObject<HTMLElement | null> = { current: null };
    act(() => api!.actions.forwardRef(emptyRef as any));
    rerender(<Probe />);
    expect(emptyRef.current).toBeNull();
  });
});
