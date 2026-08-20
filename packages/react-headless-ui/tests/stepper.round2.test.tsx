import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from '../src/components/Stepper';

// Round-2 audit fix: dots-variant step buttons collapsed to the single
// digit's ~7px width. The default button now ships a minimal hit area.

const steps = [
  { key: 'account', title: 'Account' },
  { key: 'profile', title: 'Profile' },
  { key: 'confirm', title: 'Confirm' }
];

describe('Stepper round-2 fixes', () => {
  it('gives dots-variant step buttons a minimal hit area', () => {
    render(<Stepper steps={steps} variant="dots" />);
    steps.forEach((step, index) => {
      expect(
        screen.getByRole('button', { name: `Go to step ${index + 1}: ${step.title}` })
      ).toHaveStyle({ minWidth: '24px', minHeight: '24px' });
    });
  });
});
