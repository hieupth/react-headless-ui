import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, useTheme, type Theme } from '../src/providers/ThemeProvider';

const DEFAULT_COLORS: Theme['colors'] = {
  background: '#ffffff',
  foreground: '#000000',
  primary: '#3b82f6',
  secondary: '#6b7280',
  muted: '#f3f4f6',
  border: '#e5e7eb',
  destructive: '#ef4444',
  text: '#111827',
  white: '#ffffff',
  mutedForeground: '#6b7280',
  error: '#ef4444',
  gray: '#6b7280',
  gray50: '#f9fafb',
  gray200: '#e5e7eb',
  gray600: '#4b5563',
  primary100: '#dbeafe',
  primary500: '#3b82f6',
  primary700: '#1d4ed8',
};

function ThemeReader({ onTheme }: { onTheme: (t: Theme) => void }) {
  const theme = useTheme();
  onTheme(theme);
  return null;
}

function Captured<T>({ pick, onCapture }: { pick: (t: Theme) => T; onCapture: (v: T) => void }) {
  const theme = useTheme();
  onCapture(pick(theme));
  return null;
}

describe('ThemeProvider (extra coverage)', () => {
  it('uses the default theme verbatim when no theme prop is provided', () => {
    let captured: Theme | undefined;
    render(
      <ThemeProvider>
        <ThemeReader onTheme={(t) => (captured = t)} />
      </ThemeProvider>,
    );
    expect(captured).toBeDefined();
    expect(captured?.colors).toEqual(DEFAULT_COLORS);
    expect(captured?.borderRadius.sm).toBe('0.125rem');
    expect(captured?.spacing.xl).toBe('2rem');
    expect(captured?.fontSizes.md).toBe('1rem');
    expect(captured?.fontWeights.bold).toBe('700');
  });

  it('deep-merges a partial top-level section, keeping sibling keys default', () => {
    // mergeTheme deep-merges each section (documented): a partial colors
    // override merges key-by-key rather than replacing the whole section.
    const customColors = {
      primary: '#ff0000',
      secondary: '#00ff00',
    };
    let captured: Theme['colors'] | undefined;
    render(
      <ThemeProvider theme={{ colors: customColors } as any}>
        <Captured pick={(t) => t.colors} onCapture={(v) => (captured = v)} />
      </ThemeProvider>,
    );
    expect(captured?.primary).toBe('#ff0000');
    expect(captured?.secondary).toBe('#00ff00');
    // Untouched sibling keys keep their default values.
    expect(captured?.background).toBe(DEFAULT_COLORS.background);
    expect(captured?.foreground).toBe(DEFAULT_COLORS.foreground);
  });

  it('merges multiple top-level overrides while leaving others default', () => {
    const customBorder: Theme['borderRadius'] = { sm: '1px', md: '2px', lg: '3px' };
    const customWeights: Theme['fontWeights'] = {
      normal: '300',
      medium: '400',
      semibold: '500',
      bold: '600',
    };
    let border: Theme['borderRadius'] | undefined;
    let weights: Theme['fontWeights'] | undefined;
    let primary: string | undefined;
    render(
      <ThemeProvider theme={{ borderRadius: customBorder, fontWeights: customWeights }}>
        <Captured pick={(t) => t.borderRadius} onCapture={(v) => (border = v)} />
        <Captured pick={(t) => t.fontWeights} onCapture={(v) => (weights = v)} />
        <Captured pick={(t) => t.colors.primary} onCapture={(v) => (primary = v)} />
      </ThemeProvider>,
    );
    expect(border).toEqual(customBorder);
    expect(weights).toEqual(customWeights);
    // Untouched section keeps default.
    expect(primary).toBe(DEFAULT_COLORS.primary);
  });

  it('supports nested providers where the inner provider overrides the outer', () => {
    let inner: string | undefined;
    let outer: string | undefined;
    render(
      <ThemeProvider theme={{ colors: { ...DEFAULT_COLORS, primary: '#outer' } }}>
        <Captured pick={(t) => t.colors.primary} onCapture={(v) => (outer = v)} />
        <ThemeProvider theme={{ colors: { ...DEFAULT_COLORS, primary: '#inner' } }}>
          <Captured pick={(t) => t.colors.primary} onCapture={(v) => (inner = v)} />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(outer).toBe('#outer');
    expect(inner).toBe('#inner');
  });

  it('falls back to default theme when useTheme is called outside any provider', () => {
    let captured: Theme | undefined;
    render(<ThemeReader onTheme={(t) => (captured = t)} />);
    // Outside a provider, createContext(defaultTheme) supplies the default.
    expect(captured?.colors).toEqual(DEFAULT_COLORS);
    expect(captured?.colors.background).toBe('#ffffff');
  });

  it('nested provider with no theme prop falls back to the default theme', () => {
    let inner: string | undefined;
    let outer: string | undefined;
    render(
      <ThemeProvider theme={{ colors: { ...DEFAULT_COLORS, primary: '#outer' } }}>
        <Captured pick={(t) => t.colors.primary} onCapture={(v) => (outer = v)} />
        <ThemeProvider>
          <Captured pick={(t) => t.colors.primary} onCapture={(v) => (inner = v)} />
        </ThemeProvider>
      </ThemeProvider>,
    );
    expect(outer).toBe('#outer');
    expect(inner).toBe(DEFAULT_COLORS.primary);
  });
});
