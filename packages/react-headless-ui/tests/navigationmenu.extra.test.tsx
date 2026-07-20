import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationMenu } from '../src/components/NavigationMenu';
import type { NavigationMenuItem } from '../src/hooks/useNavigationMenu';

const originalWidth = window.innerWidth;

afterEach(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalWidth });
});

const items: NavigationMenuItem[] = [
  {
    id: 'products', label: 'Products',
    icon: <span>P</span>, badge: 3, description: 'Our products', variant: 'primary',
    children: [
      { id: 'p1', label: 'Product A' },
      { id: 'p2', label: 'Product B', variant: 'secondary' },
    ],
  },
  { id: 'sep1', label: '', type: 'separator' },
  { id: 'hdr', label: 'Section Header', type: 'header' },
  { id: 'home', label: 'Home' },
  { id: 'disabled', label: 'Disabled', disabled: true },
];

describe('NavigationMenu (extra) — renderer branches', () => {
  it('renders items with icon, badge, description, separator and header types', () => {
    render(<NavigationMenu items={items} showDescriptions />);
    expect(screen.getByTestId('navigation-menu-item-products')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();       // icon
    expect(screen.getByText('3')).toBeInTheDocument();       // badge
    expect(screen.getByText('Our products')).toBeInTheDocument(); // description
    expect(screen.getAllByRole('separator').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Section Header' })).toBeInTheDocument();
  });

  it('applies variant classes (primary/secondary) to items', () => {
    const { container } = render(<NavigationMenu items={items} />);
    const products = screen.getByTestId('navigation-menu-item-products');
    expect(products.className).toContain('text-blue-600');
  });

  it('disabled item does not activate on click', async () => {
    const user = userEvent.setup();
    const onItemActivate = vi.fn();
    render(<NavigationMenu items={items} onItemActivate={onItemActivate} />);
    await user.click(screen.getByTestId('navigation-menu-item-disabled'));
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('disabled navbar (state.disabled) renders opacity class', () => {
    render(<NavigationMenu items={items} disabled />);
    expect(screen.getByTestId('navigation-menu').className).toContain('opacity-50');
  });

  it('clicking a parent item opens its dropdown', async () => {
    render(<NavigationMenu items={items} />);
    await userEvent.click(screen.getByTestId('navigation-menu-item-products'));
    expect(screen.getAllByText('Product A').length).toBeGreaterThan(0);
  });

  it('hovering a parent item opens its dropdown', () => {
    render(<NavigationMenu items={items} />);
    fireEvent.mouseEnter(screen.getByTestId('navigation-menu-item-products'));
    expect(screen.getAllByText('Product A').length).toBeGreaterThan(0);
    fireEvent.mouseLeave(screen.getByTestId('navigation-menu-item-products'));
  });

  it('renders the submenu arrow for items with children', () => {
    render(<NavigationMenu items={items} />);
    expect(screen.getByTestId('navigation-menu-item-products')).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.getByTestId('navigation-menu-item-home')).not.toHaveAttribute('aria-haspopup');
  });

  it('vertical and dropdown variants render without error', () => {
    const { rerender } = render(<NavigationMenu items={items} variant="vertical" />);
    expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
    rerender(<NavigationMenu items={items} variant="dropdown" />);
    expect(screen.getByTestId('navigation-menu')).toBeInTheDocument();
  });

  it('position top applies full width class', () => {
    render(<NavigationMenu items={items} position="top" />);
    expect(screen.getByTestId('navigation-menu').className).toContain('w-full');
  });

  it('position left does not apply full width', () => {
    render(<NavigationMenu items={items} position="left" />);
    expect(screen.getByTestId('navigation-menu').className).toContain('w-auto');
  });

  it('applies height prop and custom className', () => {
    render(<NavigationMenu items={items} height={200} className="my-nav" />);
    expect(screen.getByTestId('navigation-menu').style.height).toBe('200px');
    expect(screen.getByTestId('navigation-menu').className).toContain('my-nav');
  });

  it('uses custom renderItem', () => {
    render(
      <NavigationMenu
        items={items}
        renderItem={(item) => (
          <div key={item.id} data-testid={`ci-${item.id}`}>CI:{item.label || item.type}</div>
        )}
      />
    );
    expect(screen.getByTestId('ci-home')).toBeInTheDocument();
  });

  it('uses custom renderSubmenu when a dropdown opens', async () => {
    render(
      <NavigationMenu
        items={items}
        renderSubmenu={(submenuItems) => (
          <div key="sub" data-testid="custom-submenu">{submenuItems.map((i) => i.id).join(',')}</div>
        )}
      />
    );
    await userEvent.click(screen.getByTestId('navigation-menu-item-products'));
    expect(screen.getAllByTestId('custom-submenu').length).toBeGreaterThan(0);
  });

  it('showIcons=false hides item icons', () => {
    render(<NavigationMenu items={items} showIcons={false} />);
    expect(screen.queryByText('P')).not.toBeInTheDocument();
  });

  it('showBadges=false hides badges', () => {
    render(<NavigationMenu items={items} showBadges={false} />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('mega variant with enableSearch renders a search input', () => {
    render(<NavigationMenu items={items} variant="mega" enableSearch />);
    expect(screen.getByLabelText('Search navigation menu')).toBeInTheDocument();
  });

  it('mega variant renders a dropdown submenu using the mega submenu branch', async () => {
    render(<NavigationMenu items={items} variant="mega" />);
    await userEvent.click(screen.getByTestId('navigation-menu-item-products'));
    // mega submenu branch renders role=menu with the grid classes
    expect(screen.getAllByText('Product A').length).toBeGreaterThan(0);
  });

  it('filtering with no results renders the no-results empty state', async () => {
    render(<NavigationMenu items={items} variant="mega" enableSearch />);
    const input = screen.getByLabelText('Search navigation menu');
    await userEvent.type(input, 'zzzznotfound');
    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('search input narrows the rendered items', async () => {
    render(<NavigationMenu items={items} variant="mega" enableSearch />);
    const input = screen.getByLabelText('Search navigation menu');
    await userEvent.type(input, 'home');
    expect(screen.getByTestId('navigation-menu-item-home')).toBeInTheDocument();
    expect(screen.queryByTestId('navigation-menu-item-products')).not.toBeInTheDocument();
  });
});

describe('NavigationMenu (extra) — mobile rendering', () => {
  it('renders a mobile trigger and toggles the mobile menu', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const user = userEvent.setup();
    render(<NavigationMenu items={items} />);
    const trigger = screen.getByLabelText('Toggle navigation menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // mobile menu now renders items
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
  });

  it('mobile menu with enableSearch renders a search input', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const user = userEvent.setup();
    render(<NavigationMenu items={items} enableSearch />);
    await user.click(screen.getByLabelText('Toggle navigation menu'));
    expect(screen.getAllByLabelText('Search navigation menu').length).toBeGreaterThan(0);
  });

  it('typing into the mobile search input narrows mobile items', async () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    const user = userEvent.setup();
    render(<NavigationMenu items={items} enableSearch />);
    await user.click(screen.getByLabelText('Toggle navigation menu'));
    const mobileSearch = screen.getAllByLabelText('Search navigation menu')[0];
    await user.type(mobileSearch, 'home');
    expect(screen.getByTestId('navigation-menu-item-home')).toBeInTheDocument();
  });
});
