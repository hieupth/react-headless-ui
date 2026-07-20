import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useAvatar } from '../src/hooks';

const Probe = (props: any) => {
  const result = useAvatar(props);
  (globalThis as any).__result = result;
  return (
    <div {...result.semanticAttributes} ref={result.avatarRef as any} data-testid="avatar">
      {props.children}
    </div>
  );
};

const getResult = () => (globalThis as any).__result;

describe('useAvatar (extra coverage)', () => {
  it('exposes the correct size classes for every size', () => {
    const expected: Record<string, string> = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
      xl: 'w-12 h-12 text-lg',
      '2xl': 'w-16 h-16 text-xl',
    };
    for (const size of Object.keys(expected)) {
      const ref: any = { current: null };
      const P = () => { ref.current = useAvatar({ size: size as any }); return null; };
      const { unmount } = render(<P />);
      expect(ref.current.sizeClasses).toBe(expected[size]);
      expect(ref.current.getSizeClasses()).toBe(expected[size]);
      unmount();
    }
  });

  it('defaults size to md', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({}); return null; };
    render(<P />);
    expect(ref.current.sizeClasses).toBe('w-8 h-8 text-sm');
  });

  it('fallbackText uses the explicit fallback prop when provided', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({ fallback: 'AB', alt: 'John Doe' }); return null; };
    render(<P />);
    expect(ref.current.fallbackText).toBe('AB');
    expect(ref.current.getFallbackText()).toBe('AB');
  });

  it('fallbackText derives initials from label when alt is absent', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({ label: 'Jane Smith' }); return null; };
    render(<P />);
    expect(ref.current.fallbackText).toBe('JS');
  });

  it('fallbackText returns ? only when no alt/label/fallback at all', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({}); return null; };
    render(<P />);
    expect(ref.current.fallbackText).toBe('?');
  });

  it('fallbackText for a single-word alt returns first two chars uppercased', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({ alt: 'admin' }); return null; };
    render(<P />);
    // single word branch -> slice(0,2) uppercased
    expect(ref.current.fallbackText).toBe('AD');
  });

  it('handleClick is a no-op when not clickable', () => {
    const onClick = vi.fn();
    const ref: any = { current: null };
    const P = () => {
      ref.current = useAvatar({ onClick });
      return null;
    };
    render(<P />);
    const event: any = { preventDefault: vi.fn() };
    act(() => ref.current.handleClick(event));
    expect(onClick).not.toHaveBeenCalled();
    // preventDefault should not have been called either (early return).
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('handleClick is a no-op when disabled, even if clickable', () => {
    const onClick = vi.fn();
    const ref: any = { current: null };
    const P = () => {
      ref.current = useAvatar({ clickable: true, disabled: true, onClick });
      return null;
    };
    render(<P />);
    const event: any = { preventDefault: vi.fn() };
    act(() => ref.current.handleClick(event));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handleClick fires onClick and prevents default when clickable + enabled', () => {
    const onClick = vi.fn();
    render(<Probe clickable onClick={onClick} fallback="X" alt="X" />);
    const result = getResult();
    const event: any = { preventDefault: vi.fn() };
    act(() => result.handleClick(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space key fires onClick for a clickable avatar', () => {
    const onClick = vi.fn();
    render(<Probe clickable onClick={onClick} fallback="X" alt="X" />);
    const result = getResult();
    const event: any = { key: ' ', preventDefault: vi.fn() };
    act(() => result.handleKeyDown(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter key does nothing when disabled (clickable)', () => {
    const onClick = vi.fn();
    const ref: any = { current: null };
    const P = () => {
      ref.current = useAvatar({ clickable: true, disabled: true, onClick });
      return null;
    };
    render(<P />);
    const event: any = { key: 'Enter', preventDefault: vi.fn() };
    act(() => ref.current.handleKeyDown(event));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('non-Enter/Space key does not trigger onClick', () => {
    const onClick = vi.fn();
    const ref: any = { current: null };
    const P = () => {
      ref.current = useAvatar({ clickable: true, onClick });
      return null;
    };
    render(<P />);
    const event: any = { key: 'ArrowDown', preventDefault: vi.fn() };
    act(() => ref.current.handleKeyDown(event));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('handleImageLoad resets error and sets loaded state, calls onImageLoad', () => {
    const onImageLoad = vi.fn();
    const ref: any = { current: null };
    const P = () => {
      ref.current = useAvatar({ src: '/img.png', onImageLoad });
      return null;
    };
    render(<P />);
    expect(ref.current.loading).toBe(true);
    const nativeEvent = new Event('load');
    const synthetic: any = { nativeEvent };
    act(() => ref.current.handleImageLoad(synthetic));
    expect(ref.current.loading).toBe(false);
    expect(ref.current.hasError).toBe(false);
    expect(ref.current.loaded).toBe(true);
    expect(onImageLoad).toHaveBeenCalledWith(nativeEvent);
  });

  it('handleImageError sets error and clears loading/loaded, calls onImageError', () => {
    const onImageError = vi.fn();
    const ref: any = { current: null };
    const P = () => {
      ref.current = useAvatar({ src: '/img.png', onImageError });
      return null;
    };
    render(<P />);
    const nativeEvent = new Event('error');
    const synthetic: any = { nativeEvent };
    act(() => ref.current.handleImageError(synthetic));
    expect(ref.current.loading).toBe(false);
    expect(ref.current.hasError).toBe(true);
    expect(ref.current.loaded).toBe(false);
    expect(onImageError).toHaveBeenCalledWith(nativeEvent);
  });

  it('src change to undefined resets state to error without loading', () => {
    const { rerender } = render(<Probe src="/a.png" alt="A" />);
    let result = getResult();
    expect(result.loading).toBe(true);

    rerender(<Probe src={undefined} alt="A" />);
    result = getResult();
    expect(result.loading).toBe(false);
    expect(result.hasError).toBe(true);
    expect(result.loaded).toBe(false);
  });

  it('src change from undefined to a value re-enters loading', () => {
    const { rerender } = render(<Probe alt="A" />);
    let result = getResult();
    expect(result.hasError).toBe(true);

    rerender(<Probe src="/b.png" alt="A" />);
    result = getResult();
    expect(result.loading).toBe(true);
    expect(result.hasError).toBe(false);
    expect(result.loaded).toBe(false);
  });

  it('with no src, initial loading is false and hasError is true', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({ alt: 'A' }); return null; };
    render(<P />);
    expect(ref.current.loading).toBe(false);
    expect(ref.current.hasError).toBe(true);
  });

  it('semanticAttributes reflect data-size, data-clickable, role, and tabIndex for clickable avatars', () => {
    render(<Probe clickable size="lg" alt="Bob" fallback="B" />);
    const result = getResult();
    const attrs = result.semanticAttributes;
    expect(attrs['data-size']).toBe('lg');
    expect(attrs['data-clickable']).toBe(true);
    expect(attrs.role).toBe('button');
    expect(attrs.tabIndex).toBe(0);
    expect(typeof attrs.onClick).toBe('function');
    expect(typeof attrs.onKeyDown).toBe('function');
  });

  it('non-clickable avatar uses img role and no tabIndex', () => {
    render(<Probe alt="Bob" fallback="B" />);
    const result = getResult();
    const attrs = result.semanticAttributes;
    expect(attrs.role).toBe('img');
    expect(attrs.tabIndex).toBeUndefined();
  });

  it('semanticAttributes aria-label falls back to alt when no label provided', () => {
    render(<Probe alt="Alice" fallback="A" />);
    const result = getResult();
    expect(result.semanticAttributes['aria-label']).toBe('Alice');
  });

  it('defaultFocused prop does not throw and focused state is exposed', () => {
    const ref: any = { current: null };
    const P = () => { ref.current = useAvatar({ defaultFocused: true, clickable: true }); return null; };
    expect(() => render(<P />)).not.toThrow();
    expect(typeof ref.current.focused).toBe('boolean');
  });
});
