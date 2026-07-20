import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '../src/components/Toolbar';
import type { ToolbarItem } from '../src/hooks';

const icon = <svg data-testid="ico" />;

describe('Toolbar rendering variations', () => {
  it('renders vertical orientation data attribute', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        orientation="vertical"
        showLabels
      />
    );
    expect(screen.getByTestId('toolbar').getAttribute('data-orientation')).toBe('vertical');
  });

  it('renders sm and lg sizes', () => {
    const { rerender } = render(
      <Toolbar defaultItems={[{ id: 'b', label: 'B', type: 'button' }]} size="sm" showLabels />
    );
    expect(screen.getByTestId('toolbar').getAttribute('data-size')).toBe('sm');
    rerender(
      <Toolbar defaultItems={[{ id: 'b', label: 'B', type: 'button' }]} size="lg" showLabels />
    );
    expect(screen.getByTestId('toolbar').getAttribute('data-size')).toBe('lg');
  });

  it('applies borderless styling when showBorder is false', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        showBorder={false}
        showLabels
      />
    );
    const tb = screen.getByTestId('toolbar');
    expect(tb.className).toContain('toolbar-borderless');
    // border: 'none' -> borderStyle none, and box-shadow none when borderless
    expect((tb.style as any).borderStyle).toBe('none');
    expect((tb.style as any).boxShadow).toBe('none');
  });

  it('uses custom backgroundColor and borderColor', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        backgroundColor="#fff000"
        borderColor="#000fff"
        showLabels
      />
    );
    const tb = screen.getByTestId('toolbar');
    expect((tb.style as any).backgroundColor).toBe('rgb(255, 240, 0)');
    expect((tb.style as any).border).toContain('rgb(0, 15, 255)');
  });

  it('renders as a custom element tag via the "as" prop', () => {
    render(
      <Toolbar
        as="nav"
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        showLabels
      />
    );
    expect(document.querySelector('nav.toolbar')).not.toBeNull();
  });

  it('merges custom style prop', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        style={{ margin: 11 }}
        showLabels
      />
    );
    expect((screen.getByTestId('toolbar').style as any).margin).toBe('11px');
  });

  it('hides labels when showLabels is false but still renders icons', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button', icon }]}
        showLabels={false}
      />
    );
    const btn = screen.getByTestId('toolbar-button');
    expect(btn.querySelector('[data-testid="ico"]')).not.toBeNull();
    expect(btn.textContent).not.toContain('B');
  });

  it('renders an icon span for items with icons', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button', icon }]}
        showLabels
      />
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });
});

describe('Toolbar item variants and states', () => {
  it('applies primary and secondary variant styles to buttons', () => {
    render(
      <Toolbar
        defaultItems={[
          { id: 'p', label: 'P', type: 'button', variant: 'primary' },
          { id: 's', label: 'S', type: 'button', variant: 'secondary' },
        ]}
        showLabels
      />
    );
    const buttons = screen.getAllByTestId('toolbar-button');
    expect(buttons[0].getAttribute('data-variant')).toBe('primary');
    expect(buttons[1].getAttribute('data-variant')).toBe('secondary');
    // primary variant uses the theme primary color for background
    expect((buttons[0].style as any).backgroundColor).toMatch(/rgb|#/);
  });

  it('marks an item active after activation', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        showLabels
      />
    );
    const btn = screen.getByTestId('toolbar-button');
    expect(btn.getAttribute('data-active')).toBe('false');
    await user.click(btn);
    expect(btn.getAttribute('data-active')).toBe('true');
  });

  it('renders a disabled item with disabled attribute and styling', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'b', label: 'B', type: 'button', disabled: true }]}
        showLabels
      />
    );
    const btn = screen.getByTestId('toolbar-button') as HTMLButtonElement;
    expect(btn).toBeDisabled();
    expect(btn.getAttribute('data-disabled')).toBe('true');
    expect((btn.style as any).opacity).toBe('0.5');
    expect((btn.style as any).cursor).toBe('not-allowed');
  });

  it('renders a group-typed item as a button (default branch)', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 'g', label: 'G', type: 'group' as any }]}
        showLabels
      />
    );
    expect(screen.getByTestId('toolbar-button').getAttribute('data-item-id')).toBe('g');
  });
});

describe('Toolbar separators and spacers in different orientations', () => {
  it('vertical separator uses full width', () => {
    render(
      <Toolbar
        orientation="vertical"
        defaultItems={[{ id: 's', label: '', type: 'separator' }]}
      />
    );
    const sep = screen.getByTestId('toolbar-separator');
    expect((sep.style as any).width).toBe('100%');
    expect((sep.style as any).height).toBe('1px');
  });

  it('horizontal separator uses full height', () => {
    render(
      <Toolbar
        defaultItems={[{ id: 's', label: '', type: 'separator' }]}
      />
    );
    const sep = screen.getByTestId('toolbar-separator');
    expect((sep.style as any).width).toBe('1px');
    expect((sep.style as any).height).toBe('100%');
  });

  it('spacer uses flex:1', () => {
    render(<Toolbar defaultItems={[{ id: 'sp', label: '', type: 'spacer' }]} />);
    // jsdom normalizes flex:1 -> '1 1 0%'
    expect((screen.getByTestId('toolbar-spacer').style as any).flex).toContain('1');
  });
});

describe('Toolbar custom renderItem', () => {
  it('renders every item through the custom renderer and reports active state', async () => {
    const user = userEvent.setup();
    const items: ToolbarItem[] = [
      { id: 'a', label: 'A', type: 'button' },
      { id: 'b', label: 'B', type: 'button' },
    ];
    render(
      <Toolbar
        defaultItems={items}
        renderItem={({ item, isActive, onClick }) => (
          <button key={item.id} onClick={onClick} data-testid={`r-${item.id}`} data-active={isActive}>
            {item.label}
          </button>
        )}
      />
    );
    const a = screen.getByTestId('r-a');
    expect(a.getAttribute('data-active')).toBe('false');
    await user.click(a);
    expect(a.getAttribute('data-active')).toBe('true');
  });
});

describe('Toolbar keyboard navigation (vertical arrows)', () => {
  it('ArrowDown/ArrowUp navigate between items and Home/End jump', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        defaultItems={[
          { id: 'a', label: 'A', type: 'button' },
          { id: 'b', label: 'B', type: 'button' },
          { id: 'c', label: 'C', type: 'button' },
        ]}
        orientation="vertical"
        showLabels
        onItemActivate={onItemActivate}
      />
    );
    const tb = screen.getByTestId('toolbar');
    fireEvent.keyDown(tb, { key: 'ArrowDown' });
    fireEvent.keyDown(tb, { key: 'ArrowUp' });
    fireEvent.keyDown(tb, { key: 'Home' });
    fireEvent.keyDown(tb, { key: 'End' });
    // Every navigation key activates an item
    expect(onItemActivate.mock.calls.length).toBeGreaterThanOrEqual(4);
    // End jumps to last enabled button
    expect(onItemActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'c' }));
  });

  it('ArrowRight on a horizontal toolbar activates next', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        defaultItems={[
          { id: 'a', label: 'A', type: 'button' },
          { id: 'b', label: 'B', type: 'button' },
        ]}
        showLabels
        onItemActivate={onItemActivate}
      />
    );
    fireEvent.keyDown(screen.getByTestId('toolbar'), { key: 'ArrowRight' });
    expect(onItemActivate).toHaveBeenCalled();
  });

  it('Home/End find first/last enabled button skipping disabled', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        defaultItems={[
          { id: 'a', label: 'A', type: 'button', disabled: true },
          { id: 'b', label: 'B', type: 'button' },
          { id: 'c', label: 'C', type: 'button' },
        ]}
        showLabels
        onItemActivate={onItemActivate}
      />
    );
    const tb = screen.getByTestId('toolbar');
    fireEvent.keyDown(tb, { key: 'Home' });
    expect(onItemActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'b' }));
    fireEvent.keyDown(tb, { key: 'End' });
    expect(onItemActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'c' }));
  });

  it('ignores keyboard navigation when toolbar is disabled', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        disabled
        defaultItems={[{ id: 'a', label: 'A', type: 'button' }]}
        showLabels
        onItemActivate={onItemActivate}
      />
    );
    fireEvent.keyDown(screen.getByTestId('toolbar'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByTestId('toolbar'), { key: 'Home' });
    expect(onItemActivate).not.toHaveBeenCalled();
  });

  it('Home/End are no-ops when no enabled button exists', () => {
    const onItemActivate = vi.fn();
    render(
      <Toolbar
        defaultItems={[
          { id: 'a', label: 'A', type: 'button', disabled: true },
          { id: 's', label: '', type: 'separator' },
        ]}
        showLabels
        onItemActivate={onItemActivate}
      />
    );
    const tb = screen.getByTestId('toolbar');
    fireEvent.keyDown(tb, { key: 'Home' });
    fireEvent.keyDown(tb, { key: 'End' });
    expect(onItemActivate).not.toHaveBeenCalled();
  });
});

describe('Toolbar sticky and collapsed states', () => {
  it('sticky toolbar uses sticky positioning', () => {
    render(
      <Toolbar
        sticky
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        showLabels
      />
    );
    const tb = screen.getByTestId('toolbar');
    expect((tb.style as any).position).toBe('sticky');
    expect((tb.style as any).zIndex).toBe('100');
    expect(tb.className).toContain('toolbar-sticky');
  });

  it('defaultCollapsed reflects in data-collapsed attribute', () => {
    render(
      <Toolbar
        defaultCollapsed
        defaultItems={[{ id: 'b', label: 'B', type: 'button' }]}
        showLabels
      />
    );
    expect(screen.getByTestId('toolbar').getAttribute('data-collapsed')).toBe('true');
  });
});
