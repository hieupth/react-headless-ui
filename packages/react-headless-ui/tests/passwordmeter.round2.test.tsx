import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PasswordMeter } from '../src/components/PasswordMeter';

// Round-2 audit fix: visibility toggle icon intrinsic size.

describe('PasswordMeter round-2 fixes', () => {
  it('gives the visibility toggle svg width/height', () => {
    const { container } = render(<PasswordMeter showVisibilityToggle />);
    const svg = container
      ?.querySelector('button.visibility-toggle')
      ?.querySelector('svg');
    expect(svg).not.toBeUndefined();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});
