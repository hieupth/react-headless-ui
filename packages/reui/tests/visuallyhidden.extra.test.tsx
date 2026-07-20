import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import {
  VisuallyHidden,
  VisuallyHiddenFocusable,
  VisuallyHiddenLiveRegion,
  VisuallyHiddenSkipLink,
  VisuallyHiddenAnnouncer,
} from '../src/components/VisuallyHidden';

describe('VisuallyHidden (extra)', () => {
  it('renders with a custom `as` element and forwards ref', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <VisuallyHidden ref={ref as any} as="div">
        hello
      </VisuallyHidden>
    );
    const el = screen.getByTestId('visually-hidden');
    expect(el.tagName).toBe('DIV');
    expect(ref.current).not.toBeNull();
  });

  it('applies a custom className and style overrides', () => {
    render(
      <VisuallyHidden className="extra" style={{ margin: 5 }}>
        x
      </VisuallyHidden>
    );
    const el = screen.getByTestId('visually-hidden');
    expect(el.className).toContain('extra');
    expect((el.style as any).margin).toBe('5px');
  });

  it('autoAnnounces string children after a delay', () => {
    vi.useFakeTimers();
    render(
      <VisuallyHidden autoAnnounce announceDelay={50}>
        saved
      </VisuallyHidden>
    );
    // data-announcing flips once the announce action runs
    expect(screen.getByTestId('visually-hidden').getAttribute('data-announcing')).toBe('false');
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(screen.getByTestId('visually-hidden').getAttribute('data-announcing')).toBe('true');
    vi.useRealTimers();
  });

  it('does not autoAnnounce non-string children', () => {
    vi.useFakeTimers();
    render(
      <VisuallyHidden autoAnnounce announceDelay={10}>
        <span data-testid="child">node</span>
      </VisuallyHidden>
    );
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByTestId('visually-hidden').getAttribute('data-announcing')).toBe('false');
    vi.useRealTimers();
  });

  it('VisuallyHiddenFocusable renders focusable content with focusable data flag true', () => {
    render(<VisuallyHiddenFocusable>focus me</VisuallyHiddenFocusable>);
    const el = screen.getByTestId('visually-hidden');
    expect(el.getAttribute('data-focusable')).toBe('true');
  });

  it('VisuallyHiddenLiveRegion announces the message and clears when clearAfterAnnounce is set', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <VisuallyHiddenLiveRegion message="hi" clearAfterAnnounce clearDelay={100} />
    );
    act(() => {
      vi.advanceTimersByTime(150);
    });
    // After clearing, the announcement should be reset.
    expect(screen.getByTestId('visually-hidden').getAttribute('data-announcing')).toBe('false');
    rerender(<VisuallyHiddenLiveRegion message="hi" />);
    vi.useRealTimers();
  });

  it('VisuallyHiddenLiveRegion renders the message without clearing it', () => {
    vi.useFakeTimers();
    render(<VisuallyHiddenLiveRegion message="persist" politeness="assertive" />);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    // Message is rendered as children; no clearAfterAnnounce timer clears it.
    expect(screen.getByTestId('visually-hidden')).toHaveTextContent('persist');
    vi.useRealTimers();
  });

  it('VisuallyHiddenSkipLink focuses and scrolls the target on click', () => {
    // create a target element to focus
    const main = document.createElement('main');
    main.id = 'main';
    main.tabIndex = -1;
    document.body.appendChild(main);
    const focusSpy = vi.spyOn(main, 'focus');
    const scrollSpy = vi.fn();
    main.scrollIntoView = scrollSpy;

    const onClick = vi.fn();
    render(<VisuallyHiddenSkipLink onClick={onClick} />);
    const link = screen.getByTestId('visually-hidden-skip-link');
    fireEvent.click(link);
    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    document.body.removeChild(main);
  });

  it('VisuallyHiddenSkipLink does not throw when the target is missing', () => {
    const onClick = vi.fn();
    render(<VisuallyHiddenSkipLink target="#missing" onClick={onClick} />);
    expect(() => fireEvent.click(screen.getByTestId('visually-hidden-skip-link'))).not.toThrow();
    expect(onClick).toHaveBeenCalled();
  });

  it('VisuallyHiddenSkipLink onFocus/Blur toggle the top position', () => {
    render(<VisuallyHiddenSkipLink />);
    const link = screen.getByTestId('visually-hidden-skip-link') as HTMLAnchorElement;
    fireEvent.focus(link);
    expect(link.style.top).toBe('6px');
    fireEvent.blur(link);
    expect(link.style.top).toBe('-40px');
  });

  it('VisuallyHiddenSkipLink uses custom text, target, className and style', () => {
    render(
      <VisuallyHiddenSkipLink
        text="Skip"
        target="#content"
        className="custom-skip"
        style={{ left: '10px' }}
      />
    );
    const link = screen.getByTestId('visually-hidden-skip-link');
    expect(link).toHaveTextContent('Skip');
    expect(link.getAttribute('href')).toBe('#content');
    expect(link.className).toContain('custom-skip');
    expect((link.style as any).left).toBe('10px');
  });

  it('VisuallyHiddenAnnouncer announces when announce+message are provided', () => {
    const onAnnounce = vi.fn();
    render(
      <VisuallyHiddenAnnouncer announce message="done" priority="assertive" onAnnounce={onAnnounce} />
    );
    expect(onAnnounce).toHaveBeenCalledWith('done', 'assertive');
    expect(screen.getByTestId('visually-hidden-announcer')).toHaveTextContent('done');
  });

  it('VisuallyHiddenAnnouncer does nothing without a message', () => {
    const onAnnounce = vi.fn();
    render(<VisuallyHiddenAnnouncer announce onAnnounce={onAnnounce} />);
    expect(onAnnounce).not.toHaveBeenCalled();
  });

  it('VisuallyHiddenAnnouncer does nothing when announce is false', () => {
    const onAnnounce = vi.fn();
    render(<VisuallyHiddenAnnouncer message="x" onAnnounce={onAnnounce} />);
    expect(onAnnounce).not.toHaveBeenCalled();
  });

  it('VisuallyHiddenAnnouncer uses polite priority by default', () => {
    const onAnnounce = vi.fn();
    render(<VisuallyHiddenAnnouncer announce message="hi" onAnnounce={onAnnounce} />);
    expect(onAnnounce).toHaveBeenCalledWith('hi', 'polite');
  });

  it('renders the hidden class when defaultVisible is false', () => {
    render(<VisuallyHidden defaultVisible={false}>off</VisuallyHidden>);
    const el = screen.getByTestId('visually-hidden');
    expect(el.className).toContain('visually-hidden-hidden');
    expect(el.className).not.toContain('visually-hidden-visible');
    expect(el.getAttribute('data-visible')).toBe('false');
  });

  it('autoAnnounce with liveRegionType="off" announces with undefined priority', () => {
    vi.useFakeTimers();
    // liveRegionType="off" hits the priority=undefined arm of the ternary
    // in the component's autoAnnounce effect.
    render(
      <VisuallyHidden autoAnnounce announceDelay={10} liveRegionType="off">
        msg
      </VisuallyHidden>
    );
    act(() => {
      vi.advanceTimersByTime(20);
    });
    // The announce action ran (priority undefined): data-announcing flips true.
    expect(screen.getByTestId('visually-hidden').getAttribute('data-announcing')).toBe('true');
    vi.useRealTimers();
  });
});
