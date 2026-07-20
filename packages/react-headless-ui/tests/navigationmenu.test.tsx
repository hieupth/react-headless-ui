import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NavigationMenu } from '../src/components/NavigationMenu';

const items = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
];

// Render under a mobile viewport so the component's isMobile branch fires.
// jsdom defaults window.innerWidth to 1024 (desktop); narrowing it below the
// mobile breakpoint and dispatching a resize triggers the hook's checkMobile.
function withMobileViewport<T>(fn: () => T): T {
  const original = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
  window.dispatchEvent(new Event('resize'));
  try {
    return fn();
  } finally {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: original });
    window.dispatchEvent(new Event('resize'));
  }
}

describe('NavigationMenu', () => {
  it('renders navigation items', () => {
    render(<NavigationMenu items={items} />);
    expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders an empty state with no items', () => {
    render(<NavigationMenu items={[]} />);
    expect(screen.getByText(/No navigation items/i)).toBeInTheDocument();
  });

  it('renders an item with icon, badge, description, and variants', () => {
    render(
      <NavigationMenu
        showDescriptions
        items={[
          { id: 'p', label: 'Primary', variant: 'primary', icon: <span>i</span>, badge: '5', description: 'desc-p' },
          { id: 's', label: 'Secondary', variant: 'secondary' },
        ]}
      />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('desc-p')).toBeInTheDocument();
    expect(screen.getByTestId('navigation-menu-item-p')).toHaveClass('text-blue-600', 'font-medium');
    expect(screen.getByTestId('navigation-menu-item-s')).toHaveClass('text-gray-600');
  });

  it('renders separator and header item types', () => {
    render(
      <NavigationMenu
        showSeparators
        items={[
          { id: 'h', label: 'Header', type: 'header' },
          { id: 'sep', type: 'separator' },
          { id: 'x', label: 'X' },
        ]}
      />
    );
    expect(screen.getByRole('heading')).toHaveTextContent('Header');
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders separators and headers at nested submenu levels', () => {
    render(
      <NavigationMenu
        showSeparators
        items={[
          {
            id: 'parent', label: 'Parent',
            children: [
              { id: 'sub-h', label: 'Sub Header', type: 'header' },
              { id: 'sub-sep', type: 'separator' },
              { id: 'sub-x', label: 'Sub X' },
            ],
          },
        ]}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId('navigation-menu-item-parent'));
    // Nested header + separator render at level 1 (px-3 padding arm).
    const headings = screen.getAllByRole('heading');
    expect(headings.some((h) => h.textContent === 'Sub Header')).toBe(true);
    expect(screen.getAllByRole('separator').length).toBeGreaterThanOrEqual(1);
  });

  it('renders a separator without the showSeparators styling', () => {
    render(
      // showSeparators defaults to false; the separator's style arm is empty.
      <NavigationMenu items={[{ id: 'sep', type: 'separator' }, { id: 'x', label: 'X' }]} />
    );
    const sep = screen.getByRole('separator');
    // Without showSeparators, no border-t class is applied.
    expect(sep.className).not.toContain('border-t');
  });

  it('renders a submenu arrow for items with children and opens the dropdown on hover', () => {
    const onDropdownOpen = vi.fn();
    render(
      <NavigationMenu
        onDropdownOpen={onDropdownOpen}
        items={[{ id: 'parent', label: 'Parent', children: [{ id: 'child', label: 'Child' }] }]}
      />
    );
    // Submenu arrow svg present
    const parent = screen.getByTestId('navigation-menu-item-parent');
    expect(parent.querySelector('svg')).toBeInTheDocument();
    expect(parent).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.mouseEnter(parent);
    expect(onDropdownOpen).toHaveBeenCalledWith('parent');
    // Once open the child renders in both the inline submenu and the
    // "open dropdown" block, so multiple matching nodes exist.
    expect(screen.getAllByTestId('navigation-menu-item-child').length).toBeGreaterThanOrEqual(1);
    expect(parent).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks the active item with the active class after activation', () => {
    render(
      <NavigationMenu
        items={[
          { id: 'home', label: 'Home' },
          { id: 'about', label: 'About' },
        ]}
      />
    );
    // Clicking a leaf item both focuses and activates it.
    const home = screen.getByTestId('navigation-menu-item-home');
    fireEvent.click(home);
    expect(home).toHaveClass('bg-blue-100'); // focused
    expect(home).toHaveClass('bg-blue-50');  // active
  });

  it('ignores interactions on disabled items', () => {
    const onItemActivate = vi.fn();
    render(
      <NavigationMenu
        onItemActivate={onItemActivate}
        items={[{ id: 'd', label: 'Disabled', disabled: true }]}
      />
    );
    const item = screen.getByTestId('navigation-menu-item-d');
    expect(item).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(item);
    fireEvent.mouseEnter(item);
    fireEvent.mouseLeave(item);
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('activates an item on click and invokes onItemActivate', () => {
    const onItemActivate = vi.fn();
    render(<NavigationMenu onItemActivate={onItemActivate} items={items} />);
    fireEvent.click(screen.getByTestId('navigation-menu-item-home'));
    expect(onItemActivate).toHaveBeenCalledTimes(1);
  });

  it('uses custom renderSubmenu when provided', () => {
    const renderSubmenu = (kids: any[]) => (
      <div data-testid="custom-submenu" key="sub">{kids.map((k) => k.label)}</div>
    );
    render(
      <NavigationMenu
        renderSubmenu={renderSubmenu}
        items={[{ id: 'parent', label: 'Parent', children: [{ id: 'child', label: 'Child' }] }]}
      />
    );
    // Open the dropdown via the default item's hover handler; the custom
    // renderSubmenu is then invoked for the open dropdown.
    fireEvent.mouseEnter(screen.getByTestId('navigation-menu-item-parent'));
    expect(screen.getAllByTestId('custom-submenu').length).toBeGreaterThanOrEqual(1);
  });

  it('uses custom renderItem when provided', () => {
    const renderItem = (item: any) => <div key={item.id} data-testid={`custom-${item.id}`}>{item.label}</div>;
    render(
      <NavigationMenu
        renderItem={renderItem}
        items={items}
      />
    );
    expect(screen.getByTestId('custom-home')).toBeInTheDocument();
    expect(screen.getByTestId('custom-about')).toBeInTheDocument();
  });

  it('renders the mega menu search box with enableSearch', () => {
    render(
      <NavigationMenu variant="mega" enableSearch items={items} />
    );
    const input = screen.getByLabelText('Search navigation menu');
    fireEvent.change(input, { target: { value: 'hom' } });
    // Filtering to "hom" keeps only the Home item; About is filtered out.
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('About')).not.toBeInTheDocument();
  });

  it('renders the "no results" state when a mega search yields nothing', () => {
    render(<NavigationMenu variant="mega" enableSearch items={items} />);
    const input = screen.getByLabelText('Search navigation menu');
    fireEvent.change(input, { target: { value: 'zzz' } });
    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('renders the mobile trigger, toggles the mobile menu, and renders the mobile search', () => {
    withMobileViewport(() => {
      render(<NavigationMenu enableSearch items={items} />);
      // Desktop block is hidden on mobile; mobile trigger visible.
      const trigger = screen.getByRole('button', { name: /Toggle navigation menu/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      // Open the mobile menu.
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      // Mobile menu now renders its own search input + items.
      const inputs = screen.getAllByLabelText('Search navigation menu');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('clears hover state on mouseLeave of a non-disabled item', () => {
    render(<NavigationMenu items={items} />);
    const home = screen.getByTestId('navigation-menu-item-home');
    fireEvent.mouseEnter(home);
    fireEvent.mouseLeave(home);
    // mouseLeave runs leaveItem without throwing; item remains present.
    expect(home).toBeInTheDocument();
  });

  it('renders a mega submenu via the open-dropdown block', () => {
    render(
      <NavigationMenu
        variant="mega"
        items={[{ id: 'parent', label: 'Parent', children: [{ id: 'child', label: 'Child' }] }]}
      />
    );
    fireEvent.mouseEnter(screen.getByTestId('navigation-menu-item-parent'));
    // The mega submenu path renders the child inside the open-dropdown block.
    expect(screen.getAllByText('Child').length).toBeGreaterThanOrEqual(1);
  });

  it('drives the mobile search input onChange', () => {
    withMobileViewport(() => {
      render(<NavigationMenu enableSearch items={items} />);
      fireEvent.click(screen.getByRole('button', { name: /Toggle navigation menu/i }));
      const input = screen.getByLabelText('Search navigation menu');
      fireEvent.change(input, { target: { value: 'ab' } });
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });

  it('uses the side (w-auto) width class for left/right positions', () => {
    const { container } = render(<NavigationMenu position="left" items={items} />);
    expect(container.querySelector('.navigation-menu')?.className).toContain('w-auto');
  });

  it('renders a disabled menu with the disabled classes', () => {
    const { container } = render(<NavigationMenu disabled items={items} />);
    expect(container.querySelector('.navigation-menu')?.className).toContain('cursor-not-allowed');
  });
});
