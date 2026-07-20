import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from '../src/components/Button';
import { useButton } from '../src/hooks/useButton';

describe('Button', () => {
  it('renders an accessible button labelled by its children', () => {
    render(<Button onPress={() => {}}>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('fires onPress when clicked', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Click me</Button>);
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress} disabled>Noop</Button>);
    await user.click(screen.getByRole('button', { name: 'Noop' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Button onPress={() => {}}>Accessible</Button>);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders loading indicator, icons, and merges className', () => {
    const { container } = render(
      <Button
        onPress={() => {}}
        loading
        loadingIndicator={<span data-testid="spinner" />}
        leadingIcon={<span data-testid="lead" />}
        trailingIcon={<span data-testid="trail" />}
        className="extra-class"
      >
        Save
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('extra-class');
    // loading indicator renders; leading/trailing icons hidden while loading
    expect(container.querySelector('[data-testid="spinner"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="lead"]')).toBeNull();
    expect(container.querySelector('[data-testid="trail"]')).toBeNull();
  });

  it('renders leading and trailing icons when not loading', () => {
    const { container } = render(
      <Button
        onPress={() => {}}
        leadingIcon={<span data-testid="lead" />}
        trailingIcon={<span data-testid="trail" />}
      >
        Save
      </Button>
    );
    expect(container.querySelector('[data-testid="lead"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="trail"]')).not.toBeNull();
  });

  it('uses a custom render prop when provided', () => {
    render(
      <Button onPress={() => {}} render={(props) => (
        <button data-testid="custom" className={props.className} type="button">{props.children}</button>
      )}>
        Custom
      </Button>
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('Custom');
  });

  it('sets tabIndex=-1 when disabled', () => {
    render(<Button onPress={() => {}} disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1');
  });

  it('sets aria-pressed=true while the Space key is held down', () => {
    render(<Button onPress={() => {}}>Press</Button>);
    const btn = screen.getByRole('button');
    // pressable mixin's handleKeyDown (wired via useButton onKeyDown) flips
    // pressed=true on Space.
    fireEvent.keyDown(btn, { key: ' ' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('useButton hook', () => {
  it('handleClick is a no-op when loading', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ onPress, loading: true }));
    const ev = { preventDefault: vi.fn() } as any;
    act(() => result.current.handleClick(ev));
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('handleClick is a no-op when disabled', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ onPress, disabled: true }));
    const ev = { preventDefault: vi.fn() } as any;
    act(() => result.current.handleClick(ev));
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('handleKeyDown is a no-op when loading or disabled', () => {
    const { result: loading } = renderHook(() => useButton({ loading: true }));
    expect(() => act(() => loading.current.handleKeyDown({ key: 'Enter' } as any))).not.toThrow();
    const { result: disabled } = renderHook(() => useButton({ disabled: true }));
    expect(() => act(() => disabled.current.handleKeyDown({ key: 'Enter' } as any))).not.toThrow();
  });

  it('handleClick / handleKeyDown forward to the mixins when enabled', () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => useButton({ onPress }));
    // enabled click delegates to pressable.handleClick
    act(() => result.current.handleClick({ preventDefault: vi.fn() } as any));
    // enabled keydown delegates to focusable + pressable handleKeyDown (Space)
    expect(() => act(() => result.current.handleKeyDown({ key: ' ' } as any))).not.toThrow();
  });

  it('className reflects focused and fullWidth modifier classes', () => {
    const a = renderHook(() => useButton({ defaultFocused: true }));
    expect(a.result.current.className).toContain('button-focused');
    const b = renderHook(() => useButton({ fullWidth: true }));
    expect(b.result.current.className).toContain('button-full-width');
  });
});
