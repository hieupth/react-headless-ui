import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, useTheme, type Theme } from '../src/providers/ThemeProvider';

function ThemeReader({ onTheme }: { onTheme: (t: Theme) => void }) {
  const theme = useTheme();
  onTheme(theme);
  return null;
}

describe('ThemeProvider', () => {
  it('provides a default theme to descendants', () => {
    let captured: Theme | undefined;
    render(
      <ThemeProvider>
        <ThemeReader onTheme={(t) => (captured = t)} />
      </ThemeProvider>
    );
    expect(captured).toBeDefined();
    expect(typeof captured?.colors.primary).toBe('string');
    expect(captured?.spacing).toBeDefined();
  });

  it('overrides top-level theme keys (shallow merge)', () => {
    const customSpacing = { xs: '10px', sm: '20px', md: '30px', lg: '40px', xl: '50px' };
    let captured: Theme | undefined;
    render(
      <ThemeProvider theme={{ spacing: customSpacing } as Partial<Theme>}>
        <ThemeReader onTheme={(t) => (captured = t)} />
      </ThemeProvider>
    );
    expect(captured?.spacing.xs).toBe('10px');
    // other top-level keys are untouched by the shallow merge
    expect(typeof captured?.colors.primary).toBe('string');
  });

  it('useTheme returns the default theme when rendered without a provider', () => {
    let captured: Theme | undefined;
    // Render the reader directly (no ThemeProvider ancestor).
    render(<ThemeReader onTheme={(t) => (captured = t)} />);
    expect(captured).toBeDefined();
    expect(typeof captured?.colors.primary).toBe('string');
    expect(captured?.spacing).toBeDefined();
  });
});
