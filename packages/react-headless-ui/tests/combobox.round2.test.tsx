import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, act, renderHook, cleanup } from '@testing-library/react';
import React from 'react';
import { Combobox } from '../src/components/Combobox';
import { useCombobox } from '../src/hooks';
import type { ComboboxOption } from '../src/hooks';

const options: ComboboxOption[] = [
  { id: 'a', label: 'Apple', value: 'a' },
  { id: 'b', label: 'Banana', value: 'b' },
];

describe('Combobox input click opens the listbox (round 2)', () => {
  it('clicking the input opens the listbox, same as typing', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');

    act(() => { fireEvent.click(input); });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
  });

  it('clicking the input again keeps the dropdown open', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    act(() => { fireEvent.click(input); });
    act(() => { fireEvent.click(input); });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('hook inputAttributes expose the open-on-click behavior', () => {
    const { result } = renderHook(() => useCombobox({ options }));
    const attrs = result.current.inputAttributes as React.InputHTMLAttributes<HTMLInputElement> & {
      onClick?: React.MouseEventHandler<HTMLInputElement>;
    };
    expect(typeof attrs.onClick).toBe('function');

    act(() => { attrs.onClick?.({} as React.MouseEvent<HTMLInputElement>); });
    expect(result.current.open).toBe(true);
  });

  afterEach(cleanup);
});
