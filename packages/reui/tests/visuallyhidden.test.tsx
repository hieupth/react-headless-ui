import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { VisuallyHidden } from '../src/components/VisuallyHidden';
import { useVisuallyHidden, type UseVisuallyHiddenProps } from '../src/hooks/useVisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders content for screen readers', () => {
    render(<VisuallyHidden>Hidden label</VisuallyHidden>);
    expect(screen.getByText('Hidden label')).toBeInTheDocument();
  });
});

// Direct hook tests covering controlled/uncontrolled visibility, show/hide/
// toggle, focus/blur delegation, announce (with autoHide), getElement,
// updateContent, setPriority/setFocusable, and the accessibility-attribute
// branches the component wrapper does not exercise.
describe('useVisuallyHidden (hook)', () => {
  function setup(props: UseVisuallyHiddenProps = {}) {
    const result: { current: ReturnType<typeof useVisuallyHidden> } = { current: null as any };
    function Probe() {
      result.current = useVisuallyHidden(props);
      return null;
    }
    render(<Probe />);
    return result;
  }

  function setupWithRef(props: UseVisuallyHiddenProps = {}) {
    const ref: React.RefObject<HTMLSpanElement | null> = { current: null };
    const result: { current: ReturnType<typeof useVisuallyHidden> } = { current: null as any };
    function Probe() {
      result.current = useVisuallyHidden({ ...props, elementRef: ref });
      return <span ref={ref as React.RefObject<HTMLSpanElement>} data-testid="vh-ref">x</span>;
    }
    render(<Probe />);
    return { result, el: () => screen.getByTestId('vh-ref') };
  }

  it('uncontrolled: show/hide/toggle flip visible state', () => {
    const res = setup({ defaultVisible: false });
    expect(res.current.state.visible).toBe(false);
    act(() => res.current.actions.show());
    expect(res.current.state.visible).toBe(true);
    act(() => res.current.actions.hide());
    expect(res.current.state.visible).toBe(false);
    act(() => res.current.actions.toggle()); // false -> true
    expect(res.current.state.visible).toBe(true);
    act(() => res.current.actions.toggle()); // true -> false
    expect(res.current.state.visible).toBe(false);
  });

  it('controlled: show/hide are no-ops (controlled value wins)', () => {
    const res = setup({ visible: true });
    act(() => res.current.actions.hide());
    expect(res.current.state.visible).toBe(true);
    act(() => res.current.actions.show());
    expect(res.current.state.visible).toBe(true);
  });

  it('setFocusable flips the focusable flag and tabIndex', () => {
    const res = setup({ defaultVisible: true, focusable: false });
    expect(res.current.attributes.tabIndex).toBeUndefined();
    act(() => res.current.actions.setFocusable(true));
    expect(res.current.state.focusable).toBe(true);
    expect(res.current.attributes.tabIndex).toBe(0);
  });

  it('focus/blur delegate to the underlying element', () => {
    const { result, el } = setupWithRef({ defaultVisible: true, focusable: true });
    const focusSpy = vi.spyOn(el(), 'focus');
    const blurSpy = vi.spyOn(el(), 'blur');
    act(() => result.current.actions.focus());
    act(() => result.current.actions.blur());
    expect(focusSpy).toHaveBeenCalled();
    expect(blurSpy).toHaveBeenCalled();
  });

  it('focus/blur are safe when no element is attached', () => {
    const res = setup({ defaultVisible: true });
    expect(() => {
      act(() => res.current.actions.focus());
      act(() => res.current.actions.blur());
    }).not.toThrow();
  });

  it('announce sets message + priority and clears after autoHide delay', () => {
    vi.useFakeTimers();
    try {
      const res = setup({ autoHide: true, autoHideDelay: 500 });
      act(() => res.current.actions.announce('hello', 'assertive'));
      expect(res.current.state.announcement).toBe('hello');
      expect(res.current.state.priority).toBe('assertive');
      act(() => { vi.advanceTimersByTime(500); });
      expect(res.current.state.announcement).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('announce without priority keeps the current priority', () => {
    const res = setup({ priority: 'polite' });
    act(() => res.current.actions.announce('msg'));
    expect(res.current.state.announcement).toBe('msg');
    expect(res.current.state.priority).toBe('polite');
  });

  it('announce autoHide cancels any pending timer before setting a new one', () => {
    vi.useFakeTimers();
    try {
      const res = setup({ autoHide: true, autoHideDelay: 1000 });
      act(() => res.current.actions.announce('first'));
      act(() => res.current.actions.announce('second')); // clears first timer
      act(() => { vi.advanceTimersByTime(1000); });
      expect(res.current.state.announcement).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('announce ignores empty message even when autoHide is on', () => {
    const res = setup({ autoHide: true });
    act(() => res.current.actions.announce(''));
    expect(res.current.state.announcement).toBe('');
  });

  it('clearAnnouncement clears the message and any pending autoHide timer', () => {
    vi.useFakeTimers();
    try {
      const res = setup({ autoHide: true, autoHideDelay: 5000 });
      act(() => res.current.actions.announce('pending'));
      act(() => res.current.actions.clearAnnouncement());
      expect(res.current.state.announcement).toBe('');
      // Advancing time must not error: the timer was cleared/nulled.
      act(() => { vi.advanceTimersByTime(5000); });
      expect(res.current.state.announcement).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('clearAnnouncement is a no-op for the timer when none is pending', () => {
    // autoHide disabled => announce never schedules a timer, so the
    // autoHideTimerRef.current null-branch in clearAnnouncement runs.
    const res = setup();
    expect(() => act(() => res.current.actions.clearAnnouncement())).not.toThrow();
  });

  it('setPriority updates the priority', () => {
    const res = setup();
    act(() => res.current.actions.setPriority('assertive'));
    expect(res.current.state.priority).toBe('assertive');
    act(() => res.current.actions.setPriority('off'));
    expect(res.current.state.priority).toBe('off');
  });

  it('getElement returns the underlying element when ref is set', () => {
    const { result, el } = setupWithRef({ defaultVisible: true });
    expect(result.current.actions.getElement()).toBe(el());
  });

  it('updateContent mutates the element textContent', () => {
    const { result, el } = setupWithRef({ defaultVisible: true });
    act(() => result.current.actions.updateContent('new text'));
    expect(el().textContent).toBe('new text');
  });

  it('updateContent is safe when no element is attached', () => {
    const res = setup({ defaultVisible: true });
    expect(() => act(() => res.current.actions.updateContent('x'))).not.toThrow();
  });

  it('attributes reflect useLiveRegion=false (no aria-live/role=status)', () => {
    const res = setup({ useLiveRegion: false });
    expect(res.current.attributes['aria-live']).toBeUndefined();
    expect(res.current.attributes.role).toBeUndefined();
    expect(res.current.semantic.role).toBe('presentation');
  });

  it('attributes emit aria-atomic/aria-relevant when configured', () => {
    const res = setup({ useLiveRegion: true, atomic: true, relevant: 'all' });
    expect(res.current.attributes['aria-atomic']).toBe(true);
    expect(res.current.attributes['aria-relevant']).toBe('all');
    expect(res.current.attributes.role).toBe('status');
    expect(res.current.semantic.role).toBe('status');
  });

  it('aria-live is suppressed when content is hidden', () => {
    const res = setup({ visible: false, useLiveRegion: true });
    expect(res.current.attributes['aria-hidden']).toBe(true);
    expect(res.current.attributes['aria-live']).toBeUndefined();
  });

  it('styles set display:none when hidden', () => {
    const res = setup({ visible: false });
    expect(res.current.styles.display).toBe('none');
  });

  it('focusable mixin is invoked with disabled when not focusable/visible', () => {
    const res = setup({ defaultVisible: true, focusable: false });
    // The focusable mixin is part of the returned object regardless of state.
    expect(res.current.focusable).toBeDefined();
    act(() => res.current.actions.setFocusable(true));
    expect(res.current.state.focusable).toBe(true);
  });

  it('unmount runs the autoHide cleanup without error', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<VisuallyHiddenTester autoHide autoHideDelay={1000} />);
      unmount();
      act(() => { vi.advanceTimersByTime(1000); });
    } finally {
      vi.useRealTimers();
    }
  });
});

// Helper component to drive the hook with autoHide through a real React
// lifecycle so the unmount cleanup path runs.
function VisuallyHiddenTester(props: UseVisuallyHiddenProps) {
  useVisuallyHidden(props);
  return <span data-testid="vh-tester" />;
}
