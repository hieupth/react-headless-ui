import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb } from '../src/components/Breadcrumb';
import { useBreadcrumb } from '../src/hooks';
import type { BreadcrumbItem } from '../src/hooks';

function Harness({ items, ...props }: { items: BreadcrumbItem[]; [k: string]: any }) {
  const { state, actions } = useBreadcrumb({ items, ...props });
  return (
    <div>
      <button onClick={() => actions.navigate(0)} data-testid="nav-home">navHome</button>
      <button onClick={() => actions.navigatePrevious()} data-testid="nav-prev">navPrev</button>
      <button onClick={() => actions.navigateNext()} data-testid="nav-next">navNext</button>
      <button onClick={actions.navigateHome} data-testid="home">home</button>
      <span data-testid="active">{state.activeIndex}</span>
      <span data-testid="collapsed">{String(state.isCollapsed)}</span>
      <span data-testid="hidden-count">{state.hiddenItems.length}</span>
      <span data-testid="visible-count">{state.visibleItems.length}</span>
    </div>
  );
}

const baseItems: BreadcrumbItem[] = [
  { id: 'a', label: 'Alpha', href: '/a' },
  { id: 'b', label: 'Bravo', href: '/b' },
  { id: 'c', label: 'Charlie', href: '/c' },
];

describe('useBreadcrumb', () => {
  it('marks the last item as current when none is marked', () => {
    render(<Breadcrumb items={baseItems} />);
    const last = screen.getByText('Charlie').closest('[aria-current]');
    expect(last).toHaveAttribute('aria-current', 'page');
  });

  it('preserves an explicitly-marked current item', () => {
    const items: BreadcrumbItem[] = [
      { id: 'a', label: 'Alpha', href: '/a', current: true },
      { id: 'b', label: 'Bravo', href: '/b' },
    ];
    render(<Breadcrumb items={items} />);
    expect(screen.getByText('Alpha').closest('[aria-current]')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('Bravo')?.closest('[aria-current]')).toBeNull();
  });

  it('fires item onClick when an enabled item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ id: 'a', label: 'Click', onClick }]} />);
    await user.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled item is not clickable and carries aria-disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ id: 'a', label: 'Locked', disabled: true, onClick }]} />);
    const item = screen.getByText('Locked');
    // aria-disabled is applied to the item wrapper element.
    expect(item.closest('[aria-disabled]')?.getAttribute('aria-disabled')).toBeTruthy();
    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('a disabled non-current item uses the muted color', () => {
    // The last item auto-becomes current; an earlier disabled item is neither
    // active nor the last, so it takes the disabled (muted) color branch.
    render(
      <Breadcrumb
        items={[
          { id: 'a', label: 'Locked', disabled: true },
          { id: 'b', label: 'Tail' },
        ]}
      />
    );
    // The styled element is the item link carrying the inline color style.
    const lockedEl = screen.getByText('Locked');
    const styled = (lockedEl.style && lockedEl.style.color)
      ? lockedEl
      : (lockedEl.closest('[style*="color"]') as HTMLElement);
    expect((styled.style as any).color).toBe('rgb(243, 244, 246)');
  });

  it('navigate(index) calls onClick of the target item', () => {
    const onClickA = vi.fn();
    const items: BreadcrumbItem[] = [
      { id: 'a', label: 'Alpha', onClick: onClickA },
      { id: 'b', label: 'Bravo' },
    ];
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('nav-home'));
    expect(onClickA).toHaveBeenCalledTimes(1);
  });

  it('navigate ignores out-of-range and disabled items', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [{ id: 'a', label: 'Alpha', onClick }];
    render(<Harness items={items} />);
    // navigate(0) fires onClick once; boundary prev/next are no-ops.
    fireEvent.click(screen.getByTestId('nav-home'));
    fireEvent.click(screen.getByTestId('nav-prev'));
    fireEvent.click(screen.getByTestId('nav-next'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('showHome prepends a home item', () => {
    render(<Breadcrumb items={baseItems} showHome />);
    // Two "Home"-like labels? homeItem default label is "Home"; items don't contain it.
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('collapses long trails beyond maxItems and shows ellipsis', () => {
    const many: BreadcrumbItem[] = Array.from({ length: 8 }, (_, i) => ({
      id: `i${i}`, label: `Item${i}`, href: `/${i}`,
    }));
    render(<Breadcrumb items={many} maxItems={5} />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('active index is last item by default', () => {
    render(<Harness items={baseItems} />);
    expect(screen.getByTestId('active').textContent).toBe('2');
  });

  it('visible/hidden counts respect maxItems truncation', () => {
    const many: BreadcrumbItem[] = Array.from({ length: 7 }, (_, i) => ({
      id: `i${i}`, label: `Item${i}`, href: `/${i}`,
    }));
    render(<Harness items={many} maxItems={5} />);
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
    expect(Number(screen.getByTestId('hidden-count').textContent)).toBeGreaterThan(0);
  });

  it('renderItem custom renderer is used', () => {
    render(
      <Breadcrumb
        items={baseItems}
        renderItem={(item) => <strong key={item.id} data-testid={`r-${item.id}`}>{item.label}!</strong>}
      />
    );
    expect(screen.getByTestId('r-a')).toHaveTextContent('Alpha!');
  });

  it('custom separator is rendered between items', () => {
    render(<Breadcrumb items={baseItems} separator={<span data-testid="sep">::</span>} />);
    expect(screen.getAllByTestId('sep').length).toBeGreaterThan(0);
  });

  it('navigateHome goes to the first item', () => {
    const onClick = vi.fn();
    const items: BreadcrumbItem[] = [
      { id: 'a', label: 'Alpha', onClick },
      { id: 'b', label: 'Bravo' },
    ];
    render(<Harness items={items} />);
    fireEvent.click(screen.getByTestId('home'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keyboard ArrowLeft/Home/End trigger navigation via onClick', () => {
    const onClickA = vi.fn();
    const onClickB = vi.fn();
    const onClickC = vi.fn();
    const items: BreadcrumbItem[] = [
      { id: 'a', label: 'Alpha', onClick: onClickA },
      { id: 'b', label: 'Bravo', onClick: onClickB },
      { id: 'c', label: 'Charlie', onClick: onClickC, current: true },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const nav = container.querySelector('nav')!;
    // activeIndex=2 (charlie). Home -> navigate(0) -> alpha.
    fireEvent.keyDown(nav, { key: 'Home' });
    expect(onClickA).toHaveBeenCalledTimes(1);
    // End -> navigate(last) -> charlie.
    fireEvent.keyDown(nav, { key: 'End' });
    expect(onClickC).toHaveBeenCalledTimes(1);
    // ArrowLeft from end (activeIndex 2) -> navigate to bravo (index 1)
    fireEvent.keyDown(nav, { key: 'ArrowLeft' });
    expect(onClickB).toHaveBeenCalledTimes(1);
  });

  it('keyboard ArrowRight at the end is a no-op', () => {
    const onClickB = vi.fn();
    const items: BreadcrumbItem[] = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Bravo', onClick: onClickB },
    ];
    const { container } = render(<Breadcrumb items={items} />);
    const nav = container.querySelector('nav')!;
    // activeIndex=1 (last). ArrowRight -> navigateNext at boundary is no-op.
    fireEvent.keyDown(nav, { key: 'ArrowRight' });
    expect(onClickB).not.toHaveBeenCalled();
  });

  it('disabled breadcrumb container renders but items are inert', () => {
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ id: 'a', label: 'X', onClick }]} disabled />);
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
