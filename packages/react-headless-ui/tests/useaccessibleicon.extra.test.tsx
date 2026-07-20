import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { useAccessibleIcon } from '../src/hooks';

// Probe wrapper that exposes the latest hook API and renders a focusable element
// bound to the hook's internal ref so we can drive keyboard events.
function Probe({
  onApi,
  iconRef,
  ...props
}: Parameters<typeof useAccessibleIcon>[0] & { onApi?: (api: ReturnType<typeof useAccessibleIcon>) => void }) {
  const api = useAccessibleIcon({ iconRef, ...props });
  onApi?.(api);
  // Bind the rendered element to the SAME ref the hook uses for keyboard/focus.
  const ref = iconRef || api.focusable.ref;
  return (
    <span
      ref={ref as any}
      data-testid="icon"
      tabIndex={0}
      style={api.styles}
      {...api.attributes}
    >
      icon
    </span>
  );
}

describe('useAccessibleIcon', () => {
  it('initializes state from props and exposes defaults', () => {
    let api: any;
    render(<Probe icon="home" label="Home" size={24} color="#f00" rotation={45} variant="outline" onApi={(a) => (api = a)} />);
    expect(api.state.icon).toBe('home');
    expect(api.state.label).toBe('Home');
    expect(api.state.size).toBe(24);
    expect(api.state.color).toBe('#f00');
    expect(api.state.rotation).toBe(45);
    expect(api.state.variant).toBe('outline');
    expect(api.state.decorative).toBe(false);
    expect(api.state.hidden).toBe(false);
    expect(api.styles.fontSize).toBe('24px');
    expect(api.styles.color).toBe('#f00');
    expect(api.styles.transform).toBe('rotate(45deg)');
  });

  it('actions mutate state via setters', () => {
    let api: any;
    render(<Probe onApi={(a) => (api = a)} />);
    act(() => api.actions.setIcon('star'));
    act(() => api.actions.setLabel('Star'));
    act(() => api.actions.setSize(32));
    act(() => api.actions.setColor('#0f0'));
    act(() => api.actions.setRotation(90));
    act(() => api.actions.setVariant('duotone'));
    act(() => api.actions.setDecorative(true));
    act(() => api.actions.setHidden(true));
    expect(api.state.icon).toBe('star');
    expect(api.state.label).toBe('Star');
    expect(api.state.size).toBe(32);
    expect(api.state.color).toBe('#0f0');
    expect(api.state.rotation).toBe(90);
    expect(api.state.variant).toBe('duotone');
    expect(api.state.decorative).toBe(true);
    expect(api.state.hidden).toBe(true);
  });

  it('toggleDecorative and toggleHidden flip booleans', () => {
    let api: any;
    render(<Probe onApi={(a) => (api = a)} />);
    act(() => api.actions.toggleDecorative());
    expect(api.state.decorative).toBe(true);
    act(() => api.actions.toggleDecorative());
    expect(api.state.decorative).toBe(false);
    act(() => api.actions.toggleHidden());
    expect(api.state.hidden).toBe(true);
    act(() => api.actions.toggleHidden());
    expect(api.state.hidden).toBe(false);
  });

  it('rotate accumulates degrees onto existing rotation', () => {
    let api: any;
    render(<Probe rotation={10} onApi={(a) => (api = a)} />);
    act(() => api.actions.rotate(15));
    expect(api.state.rotation).toBe(25);
    expect(api.styles.transform).toBe('rotate(25deg)');
  });

  it('getAccessibilityProps: aria-hidden when decorative', () => {
    let api: any;
    render(<Probe label="X" decorative onApi={(a) => (api = a)} />);
    expect(api.actions.getAccessibilityProps()).toMatchObject({ 'aria-hidden': true });
  });

  it('getAccessibilityProps: aria-hidden when hidden', () => {
    let api: any;
    render(<Probe label="X" hidden onApi={(a) => (api = a)} />);
    expect(api.actions.getAccessibilityProps()).toMatchObject({ 'aria-hidden': true });
    expect(api.styles.opacity).toBe(0);
  });

  it('getAccessibilityProps: aria-label + role=img when label present and not decorative/hidden', () => {
    let api: any;
    render(<Probe label="Save" onApi={(a) => (api = a)} />);
    expect(api.actions.getAccessibilityProps()).toMatchObject({ 'aria-label': 'Save', role: 'img' });
    expect(api.actions.getAccessibilityProps()['aria-hidden']).toBeUndefined();
  });

  it('getAccessibilityProps: empty when no label and not decorative/hidden', () => {
    let api: any;
    render(<Probe onApi={(a) => (api = a)} />);
    expect(api.actions.getAccessibilityProps()).toEqual({});
  });

  it('getAccessibilityProps: tabIndex=0 when interactive', () => {
    let api: any;
    render(<Probe label="X" interactive onApi={(a) => (api = a)} />);
    expect(api.actions.getAccessibilityProps()['tabIndex']).toBe(0);
  });

  it('keyboard Enter/Space triggers onClick only when interactive', () => {
    const onClick = vi.fn();
    let api: any;
    const iconRef = React.createRef<HTMLElement>();
    render(<Probe interactive onClick={onClick} iconRef={iconRef} onApi={(a) => (api = a)} />);
    const el = screen.getByTestId('icon');
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.keyDown(el, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('keyboard handler is inert when not interactive', () => {
    const onClick = vi.fn();
    render(<Probe onClick={onClick} />);
    fireEvent.keyDown(screen.getByTestId('icon'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('focus action calls focus on the element ref', () => {
    let api: any;
    const iconRef = React.createRef<HTMLElement>();
    render(<Probe interactive iconRef={iconRef} onApi={(a) => (api = a)} />);
    const el = screen.getByTestId('icon');
    const focusSpy = vi.spyOn(el, 'focus');
    act(() => api.actions.focus());
    expect(focusSpy).toHaveBeenCalled();
  });

  it('animated=false disables transition', () => {
    let api: any;
    render(<Probe animated={false} animationDuration={500} onApi={(a) => (api = a)} />);
    expect(api.styles.transition).toBe('none');
  });

  it('animated=true builds transition string with provided duration', () => {
    let api: any;
    render(<Probe animationDuration={350} onApi={(a) => (api = a)} />);
    expect(api.styles.transition).toContain('350ms');
  });

  it('exposes focusable / pressable / semantic mixins', () => {
    let api: any;
    render(<Probe interactive label="L" onApi={(a) => (api = a)} />);
    expect(api.focusable).toBeDefined();
    expect(api.pressable).toBeDefined();
    expect(api.semantic).toBeDefined();
    // semantic role is 'presentation' when decorative else 'img'
    expect(api.semantic.role).toBe('img');
  });

  it('semantic role becomes presentation when decorative', () => {
    let api: any;
    render(<Probe decorative onApi={(a) => (api = a)} />);
    expect(api.semantic.role).toBe('presentation');
  });
});
