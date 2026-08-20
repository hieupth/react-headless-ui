import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { Checkbox } from '../src/components/Checkbox';
import { RadioGroup } from '../src/components/RadioGroup';

describe('Keyboard reachability (round 2)', () => {
  it('Checkbox inputs are tabbable (tabindex 0) without prior focus', () => {
    render(
      <>
        <Checkbox>First</Checkbox>
        <Checkbox defaultChecked>Second</Checkbox>
      </>
    );
    // FocusableMixin's default 'auto' strategy must keep elements in the tab
    // order — tabindex -1 until focused made them permanently unreachable.
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box).toHaveAttribute('tabindex', '0');
    }
  });

  it('RadioGroup exposes a roving-tabindex entry point on the selected option', () => {
    render(<RadioGroup options={['a', 'b', 'c']} defaultValue="b" />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const selected = radios.find(r => r.getAttribute('aria-checked') === 'true');
    expect(selected).toHaveAttribute('tabindex', '0');
    for (const radio of radios) {
      if (radio !== selected) {
        expect(radio).toHaveAttribute('tabindex', '-1');
      }
    }
  });

  it('RadioGroup falls back to the first option when nothing is selected', () => {
    render(<RadioGroup options={['a', 'b']} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
  });

  afterEach(cleanup);
});
