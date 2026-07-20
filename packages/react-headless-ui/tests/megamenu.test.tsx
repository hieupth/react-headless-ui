import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createRef } from 'react';
import { MegaMenu } from '../src/components/MegaMenu';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import type { MegaMenuItem } from '../src/hooks/useMegaMenu';

const panelA = <div>Panel A content</div>;

const items: MegaMenuItem[] = [
  { id: 'a', label: 'Item A', panel: panelA, icon: <span>I</span>, description: 'desc', onClick: () => {} },
  { id: 'b', label: 'Item B' },
  { id: 'c', label: 'Item C', disabled: true },
  {
    id: 'parent', label: 'Parent', children: [
      { id: 'child1', label: 'Child 1' },
    ],
  },
];

describe('MegaMenu component', () => {
  it('renders a nav with items', () => {
    render(<MegaMenu items={items} />);
    expect(screen.getByTestId('mega-menu')).toBeInTheDocument();
    expect(screen.getByText('Item A')).toBeInTheDocument();
  });

  it('renders vertical orientation', () => {
    const { container } = render(<MegaMenu items={items} orientation="vertical" />);
    expect(container.querySelector('.mega-menu-vertical')).not.toBeNull();
  });

  it('applies disabled class when disabled', () => {
    const { container } = render(<MegaMenu items={items} disabled />);
    expect(container.querySelector('.mega-menu-disabled')).not.toBeNull();
  });

  it('renders trigger icon, arrow, and description for a panel item', () => {
    const { container } = render(<MegaMenu items={items} />);
    expect(container.querySelector('.mega-menu-trigger-icon')).not.toBeNull();
    expect(container.querySelector('.mega-menu-trigger-arrow')?.textContent).toBe('▼');
    expect(container.querySelector('.mega-menu-trigger-description')?.textContent).toBe('desc');
  });

  it('renders a right-pointing arrow in vertical orientation', () => {
    const { container } = render(
      <MegaMenu items={[{ id: 'a', label: 'A', panel: panelA }]} orientation="vertical" />
    );
    expect(container.querySelector('.mega-menu-trigger-arrow')?.textContent).toBe('▶');
  });

  it('hides arrows when showPanelArrows=false', () => {
    const { container } = render(
      <MegaMenu items={[{ id: 'a', label: 'A', panel: panelA }]} showPanelArrows={false} />
    );
    expect(container.querySelector('.mega-menu-trigger-arrow')).toBeNull();
  });

  it('renders panel wrapper for items with a panel', () => {
    const { container } = render(<MegaMenu items={[{ id: 'a', label: 'A', panel: panelA }]} />);
    expect(container.querySelector('.mega-menu-panel-wrapper')).not.toBeNull();
    expect(container.querySelector('.mega-menu-panel-content')?.textContent).toContain('Panel A');
  });

  it('renders nested children', () => {
    const { container } = render(<MegaMenu items={items} />);
    expect(container.querySelector('.mega-menu-children')).not.toBeNull();
    expect(container.textContent).toContain('Child 1');
  });

  it('renders custom trigger and panel via render props', () => {
    const { container } = render(
      <MegaMenu
        items={[{ id: 'a', label: 'A', panel: panelA }]}
        renderTrigger={(item) => <div className="custom-trigger">{item.label}</div>}
        renderPanel={(item) => <div className="custom-panel">{item.id}-panel</div>}
      />
    );
    expect(container.querySelector('.custom-trigger')?.textContent).toBe('A');
    expect(container.querySelector('.custom-panel')?.textContent).toBe('a-panel');
  });

  it('calls handleItemClick on click and toggles the panel open class', () => {
    const onClick = vi.fn();
    const localItems: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA, onClick }];
    const { container } = render(<MegaMenu items={localItems} />);
    const trigger = container.querySelector('.mega-menu-trigger-wrapper')!;
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalled();
    // Panel-open class appears on the item after opening.
    expect(container.querySelector('.mega-menu-item-open')).not.toBeNull();
  });

  it('opens the panel on Enter keydown (preventDefault + handleItemClick)', () => {
    const onClick = vi.fn();
    const localItems: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA, onClick }];
    const { container } = render(<MegaMenu items={localItems} />);
    const trigger = container.querySelector('.mega-menu-trigger-wrapper')!;
    fireEvent.keyDown(trigger, { key: 'Enter', preventDefault: () => {} });
    expect(onClick).toHaveBeenCalled();
    expect(container.querySelector('.mega-menu-item-open')).not.toBeNull();
  });

  it('opens the panel on Space keydown', () => {
    const onClick = vi.fn();
    const localItems: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA, onClick }];
    const { container } = render(<MegaMenu items={localItems} />);
    const trigger = container.querySelector('.mega-menu-trigger-wrapper')!;
    fireEvent.keyDown(trigger, { key: ' ', preventDefault: () => {} });
    expect(onClick).toHaveBeenCalled();
  });

  it('ignores other keys in the trigger keydown handler', () => {
    const onClick = vi.fn();
    const localItems: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA, onClick }];
    const { container } = render(<MegaMenu items={localItems} />);
    const trigger = container.querySelector('.mega-menu-trigger-wrapper')!;
    fireEvent.keyDown(trigger, { key: 'ArrowRight', preventDefault: () => {} });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls handleItemHover on mouseEnter (hover activation opens after delay)', () => {
    const onPanelOpen = vi.fn();
    const localItems: MegaMenuItem[] = [{ id: 'a', label: 'A', panel: panelA }];
    const { container } = render(
      <MegaMenu
        items={localItems}
        config={{ hoverActivation: true, openDelay: 0, closeDelay: 0 }}
        onPanelOpen={onPanelOpen}
      />
    );
    const trigger = container.querySelector('.mega-menu-trigger-wrapper')!;
    fireEvent.mouseEnter(trigger);
    // openDelay=0 schedules a 0ms timer; flush it.
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect(container.querySelector('.mega-menu-item-open')).not.toBeNull();
        resolve();
      }, 10)
    );
  });

  it('forwards a function ref to the nav element', () => {
    const refCb = vi.fn();
    render(<MegaMenu items={items} ref={refCb} />);
    expect(refCb).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards an object ref to the nav element', () => {
    const ref = createRef<HTMLElement>();
    render(<MegaMenu items={items} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('exercises panel position variants', () => {
    const { container } = render(
      <MegaMenu items={[{ id: 'a', label: 'A', panel: panelA }]} panelPosition="top" />
    );
    expect(container.querySelector('.mega-menu-panel-top')).not.toBeNull();
  });

  it('renders all theme CSS fallbacks under a minimal (partial) theme', () => {
    // A shallow-merged partial theme replaces whole sections with EMPTY
    // objects, so every sub-key is undefined and every `theme.X || 'fallback'`
    // arm in the <style> fires.
    const { container } = render(
      <ThemeProvider theme={{ colors: {} as any, shadows: {} as any, spacing: {} as any, fontSizes: {} as any, fontWeights: {} as any, borderRadius: {} as any }}>
        <MegaMenu items={[{ id: 'a', label: 'A', panel: panelA }]} />
      </ThemeProvider>
    );
    expect(container.querySelector('style')).not.toBeNull();
    expect(screen.getByTestId('mega-menu')).toBeInTheDocument();
  });
});
