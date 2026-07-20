import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { Accordion } from '../src/components/Accordion';
import { useAccordion } from '../src/hooks';
import type { AccordionItem } from '../src/hooks';

function Controlled({ items, initial = [], ...rest }: { items: AccordionItem[]; initial?: string[]; [k: string]: any }) {
  const [open, setOpen] = useState<string[]>(initial);
  return <Accordion items={items} openItems={open} onOpenChange={setOpen} {...rest} />;
}

const items: AccordionItem[] = [
  { id: 'a', trigger: 'Section A', content: 'Content A' },
  { id: 'b', trigger: 'Section B', content: 'Content B' },
  { id: 'c', trigger: 'Section C', content: 'Content C' },
];

const withDisabled: AccordionItem[] = [
  { id: 'a', trigger: 'A', content: 'CA' },
  { id: 'b', trigger: 'B', content: 'CB', disabled: true },
  { id: 'c', trigger: 'C', content: 'CC' },
];

describe('useAccordion', () => {
  it('renders a trigger for each item', () => {
    render(<Accordion items={items} />);
    expect(screen.getByRole('button', { name: /Section A/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Section B/ })).toBeInTheDocument();
  });

  it('single mode: opening one closes others (controlled)', async () => {
    const user = userEvent.setup();
    render(<Controlled items={items} initial={['a']} />);
    await user.click(screen.getByRole('button', { name: /Section B/ }));
    expect(screen.getByRole('button', { name: /Section B/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Section A/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('single mode: clicking the open item closes it', async () => {
    const user = userEvent.setup();
    render(<Controlled items={items} initial={['a']} />);
    await user.click(screen.getByRole('button', { name: /Section A/ }));
    expect(screen.getByRole('button', { name: /Section A/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapsible mode: multiple items stay open together (controlled)', async () => {
    const user = userEvent.setup();
    render(<Controlled items={items} initial={['a']} collapsible />);
    await user.click(screen.getByRole('button', { name: /Section B/ }));
    expect(screen.getByRole('button', { name: /Section A/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Section B/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('disabled item cannot be toggled and carries aria-disabled', async () => {
    const user = userEvent.setup();
    const onItemToggle = vi.fn();
    render(<Accordion items={withDisabled} onItemToggle={onItemToggle} />);
    const b = screen.getByRole('button', { name: /B/ });
    expect(b).toHaveAttribute('aria-disabled', 'true');
    await user.click(b);
    expect(onItemToggle).not.toHaveBeenCalled();
  });

  it('keyboard Enter toggles the focused item', () => {
    render(<Controlled items={items} />);
    const a = screen.getByRole('button', { name: /Section A/ });
    fireEvent.keyDown(a, { key: 'Enter' });
    expect(a).toHaveAttribute('aria-expanded', 'true');
  });

  it('keyboard Space toggles the focused item', () => {
    render(<Controlled items={items} />);
    const a = screen.getByRole('button', { name: /Section A/ });
    fireEvent.keyDown(a, { key: ' ' });
    expect(a).toHaveAttribute('aria-expanded', 'true');
  });

  it('keyboard ArrowDown/ArrowUp/Home/End navigate focus state (skip disabled)', () => {
    function Probe() {
      const acc = useAccordion({ items: withDisabled });
      return (
        <>
          <button
            onKeyDown={(e) => acc.handleKeyDown(e, 'a')}
            data-testid="trigger-a"
          >A</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.keyDown(screen.getByTestId('trigger-a'), { key: 'ArrowDown' });
    // b disabled -> skip -> c focused
    expect(screen.getByTestId('focused').textContent).toBe('c');
    // From c, Home -> a
    fireEvent.keyDown(screen.getByTestId('trigger-a'), { key: 'Home' });
    expect(screen.getByTestId('focused').textContent).toBe('a');
    // End -> last enabled (c)
    fireEvent.keyDown(screen.getByTestId('trigger-a'), { key: 'End' });
    expect(screen.getByTestId('focused').textContent).toBe('c');
  });

  it('horizontal orientation uses ArrowRight/ArrowLeft for focus', () => {
    function Probe() {
      const acc = useAccordion({ items, orientation: 'horizontal' });
      return (
        <>
          <button onKeyDown={(e) => acc.handleKeyDown(e, 'a')} data-testid="trigger-a">A</button>
          <span data-testid="focused">{acc.focusedItemId ?? ''}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.keyDown(screen.getByTestId('trigger-a'), { key: 'ArrowRight' });
    expect(screen.getByTestId('focused').textContent).toBe('b');
  });

  it('disabled accordion container disables every item trigger', () => {
    render(<Accordion items={items} disabled />);
    expect(screen.getByRole('button', { name: /Section A/ }).getAttribute('tabindex')).toBe('-1');
    expect(screen.getByRole('button', { name: /Section A/ })).toHaveAttribute('aria-disabled', 'true');
  });

  // ---- Hook-level ----
  it('openItem/closeItem/openAll/closeAll (collapsible) drive state', () => {
    function Probe() {
      const acc = useAccordion({ items, collapsible: true });
      return (
        <>
          <button onClick={() => acc.openItem('a')} data-testid="open-a">openA</button>
          <button onClick={() => acc.openItem('b')} data-testid="open-b">openB</button>
          <button onClick={() => acc.closeItem('a')} data-testid="close-a">closeA</button>
          <button onClick={acc.openAll} data-testid="open-all">openAll</button>
          <button onClick={acc.closeAll} data-testid="close-all">closeAll</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open-a'));
    expect(screen.getByTestId('open').textContent).toBe('a');
    fireEvent.click(screen.getByTestId('open-b'));
    expect(screen.getByTestId('open').textContent).toBe('a,b');
    fireEvent.click(screen.getByTestId('close-a'));
    expect(screen.getByTestId('open').textContent).toBe('b');
    fireEvent.click(screen.getByTestId('open-all'));
    expect(screen.getByTestId('open').textContent).toContain('a');
    expect(screen.getByTestId('open').textContent).toContain('c');
    fireEvent.click(screen.getByTestId('close-all'));
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('openAll is a no-op when not collapsible', () => {
    function Probe() {
      const acc = useAccordion({ items, collapsible: false });
      return (
        <>
          <button onClick={acc.openAll} data-testid="open-all">openAll</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open-all'));
    expect(screen.getByTestId('open').textContent).toBe('');
  });

  it('single (non-collapsible) openItem replaces the previous', () => {
    function Probe() {
      const acc = useAccordion({ items, collapsible: false });
      return (
        <>
          <button onClick={() => acc.openItem('a')} data-testid="open-a">openA</button>
          <button onClick={() => acc.openItem('b')} data-testid="open-b">openB</button>
          <span data-testid="open">{acc.openItems.join(',')}</span>
        </>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByTestId('open-a'));
    fireEvent.click(screen.getByTestId('open-b'));
    expect(screen.getByTestId('open').textContent).toBe('b');
  });

  it('fires onOpenChange and onItemToggle', () => {
    const onOpenChange = vi.fn();
    const onItemToggle = vi.fn();
    render(<Accordion items={items} onOpenChange={onOpenChange} onItemToggle={onItemToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /Section A/ }));
    expect(onOpenChange).toHaveBeenCalledWith(['a']);
    expect(onItemToggle).toHaveBeenCalledWith('a', true);
  });
});
