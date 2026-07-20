import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb } from '../src/components/Breadcrumb';
import { useBreadcrumb } from '../src/hooks/useBreadcrumb';

const items = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'docs', label: 'Docs', href: '/docs' },
  { id: 'current', label: 'Current Page' },
];

describe('Breadcrumb', () => {
  it('renders a navigation with each item label', () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('marks the last item as the current page', () => {
    render(<Breadcrumb items={items} />);
    // aria-current lives on the item wrapper (the <a>/<span> Tag), not on the
    // inner label span that getByText returns, so walk up to that ancestor.
    const currentItem = screen.getByText('Current Page').closest('[aria-current]');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  it('navigates when an item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ id: 'a', label: 'Click me', onClick }]} />);
    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('useBreadcrumb hook', () => {
  const baseItems = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
  ];

  it('prepends a home item when showHome is true', () => {
    const { result } = renderHook(() => useBreadcrumb({ items: baseItems, showHome: true }));
    expect(result.current.state.items[0].label).toBe('Home');
  });

  it('collapses long trails and exposes hidden items', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ id: String(i), label: `L${i}` }));
    const { result } = renderHook(() => useBreadcrumb({ items: many, maxItems: 4 }));
    expect(result.current.state.isCollapsed).toBe(true);
    expect(result.current.state.hiddenItems.length).toBeGreaterThan(0);
    expect(result.current.state.visibleItems.length).toBeLessThan(many.length);
  });

  it('navigate respects disabled breadcrumb and out-of-range indices', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useBreadcrumb({ items: [{ id: 'a', label: 'A', disabled: true, onClick }, ...baseItems.slice(1)] })
    );
    // disabled item: onClick not called
    act(() => result.current.actions.navigate(0));
    expect(onClick).not.toHaveBeenCalled();
    // out of range: no-op
    expect(() => act(() => result.current.actions.navigate(-1))).not.toThrow();
    expect(() => act(() => result.current.actions.navigate(99))).not.toThrow();
  });

  it('navigate is a no-op when the whole breadcrumb is disabled', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useBreadcrumb({ items: [{ id: 'a', label: 'A', onClick }], disabled: true })
    );
    act(() => result.current.actions.navigate(0));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('navigatePrevious / navigateNext / navigateHome are bounded', () => {
    const onClicks = [vi.fn(), vi.fn(), vi.fn()];
    const its = baseItems.map((it, i) => ({ ...it, onClick: onClicks[i] }));
    const { result } = renderHook(() => useBreadcrumb({ items: its }));
    // current is the last item (index 2): navigateNext is a no-op
    act(() => result.current.actions.navigateNext());
    expect(onClicks[2]).not.toHaveBeenCalled();
    // navigatePrevious goes to index 1
    act(() => result.current.actions.navigatePrevious());
    expect(onClicks[1]).toHaveBeenCalledTimes(1);
    // navigateHome goes to index 0
    act(() => result.current.actions.navigateHome());
    expect(onClicks[0]).toHaveBeenCalledTimes(1);
  });

  it('navigate sets window.location.href when an item has an href', () => {
    const setter = vi.fn();
    // Capture the href assignment without triggering a real navigation.
    const desc = Object.getOwnPropertyDescriptor(window, 'location') as PropertyDescriptor;
    Object.defineProperty(window, 'location', {
      configurable: true,
      get: () => ({ set href(v: string) { setter(v); } } as any),
    });
    try {
      const { result } = renderHook(() =>
        useBreadcrumb({ items: [{ id: 'a', label: 'A', href: '/x' }] })
      );
      act(() => result.current.actions.navigate(0));
      expect(setter).toHaveBeenCalledWith('/x');
    } finally {
      Object.defineProperty(window, 'location', desc);
    }
  });

  it('keyboard handler dispatches arrow/Home/End navigation', () => {
    const onClicks = [vi.fn(), vi.fn(), vi.fn()];
    const its = baseItems.map((it, i) => ({ ...it, onClick: onClicks[i] }));
    const { result } = renderHook(() => useBreadcrumb({ items: its }));
    const kh = result.current.props.onKeyDown as (e: React.KeyboardEvent) => void;
    const mk = (key: string) => ({ key, preventDefault: vi.fn() } as any);
    // current = index 2; ArrowLeft -> index 1
    act(() => kh(mk('ArrowLeft')));
    expect(onClicks[1]).toHaveBeenCalledTimes(1);
    // Home -> index 0
    act(() => kh(mk('Home')));
    expect(onClicks[0]).toHaveBeenCalledTimes(1);
    // End -> last index 2
    act(() => kh(mk('End')));
    expect(onClicks[2]).toHaveBeenCalledTimes(1);
    // ArrowRight from index 2 is a no-op (already last)
    onClicks[2].mockClear();
    act(() => kh(mk('ArrowRight')));
    expect(onClicks[2]).not.toHaveBeenCalled();
  });

  it('navigateNext advances when the current item is not last', () => {
    const onClicks = [vi.fn(), vi.fn(), vi.fn()];
    const its = baseItems.map((it, i) => ({ ...it, onClick: onClicks[i], current: i === 0 }));
    const { result } = renderHook(() => useBreadcrumb({ items: its }));
    // current = index 0; navigateNext -> index 1
    act(() => result.current.actions.navigateNext());
    expect(onClicks[1]).toHaveBeenCalledTimes(1);
  });

  it('honours an explicit homeItem label and explicit current marker', () => {
    const { result } = renderHook(() =>
      useBreadcrumb({
        items: [{ id: 'a', label: 'A', current: true }, { id: 'b', label: 'B' }],
        showHome: true,
        homeItem: { href: '/start' },
      })
    );
    // homeItem has no label -> falls back to 'Home'
    expect(result.current.state.items[0].label).toBe('Home');
    // explicit current on item 'a' (now index 1) is preserved
    expect(result.current.state.items[1].current).toBe(true);
  });

  it('falls back to length-1 activeIndex for an empty item list', () => {
    const { result } = renderHook(() => useBreadcrumb({ items: [] }));
    expect(result.current.state.activeIndex).toBe(-1);
    // navigatePrevious is a no-op when activeIndex <= 0
    expect(() => act(() => result.current.actions.navigatePrevious())).not.toThrow();
  });
});
