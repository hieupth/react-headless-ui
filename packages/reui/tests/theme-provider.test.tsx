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

  it('overrides a full section without touching other sections', () => {
    const customSpacing = { xs: '10px', sm: '20px', md: '30px', lg: '40px', xl: '50px' };
    let captured: Theme | undefined;
    render(
      <ThemeProvider theme={{ spacing: customSpacing } as Partial<Theme>}>
        <ThemeReader onTheme={(t) => (captured = t)} />
      </ThemeProvider>
    );
    expect(captured?.spacing.xs).toBe('10px');
    // other top-level keys are untouched
    expect(typeof captured?.colors.primary).toBe('string');
  });

  it('deep-merges a partial section so sibling keys stay defined', () => {
    let captured: Theme | undefined;
    render(
      <ThemeProvider theme={{ colors: { primary: '#f00' } } as Partial<Theme>}>
        <ThemeReader onTheme={(t) => (captured = t)} />
      </ThemeProvider>
    );
    // the override wins
    expect(captured?.colors.primary).toBe('#f00');
    // sibling palette keys must NOT be bricked by the shallow-replace bug
    expect(captured?.colors.background).toBe('#ffffff');
    expect(captured?.colors.foreground).toBe('#000000');
    expect(captured?.colors.border).toBeDefined();
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
