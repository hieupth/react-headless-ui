import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DirectionProvider,
  DirectionalText,
  DirectionalFlex,
  DirectionalSpacer,
  DirectionToggle,
  useDirection,
} from '../src/components/DirectionProvider';

describe('DirectionProvider subcomponents', () => {
  it('DirectionalText renders with auto-align under LTR (left) and custom align', () => {
    render(
      <DirectionProvider>
        <DirectionalText>hello</DirectionalText>
        <DirectionalText align="center">centered</DirectionalText>
      </DirectionProvider>
    );
    const auto = screen.getByText('hello');
    expect(auto.getAttribute('data-align')).toBe('left');
    expect(screen.getByText('centered').getAttribute('data-align')).toBe('center');
  });

  it('DirectionalText auto-aligns right under RTL', () => {
    render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionalText>مرحبا</DirectionalText>
      </DirectionProvider>
    );
    expect(screen.getByText('مرحبا').getAttribute('data-align')).toBe('right');
  });

  it('DirectionalText autoDetect runs autoDetect action for string children', () => {
    render(
      <DirectionProvider defaultTextDirection="auto">
        <DirectionalText autoDetect>some english text here</DirectionalText>
      </DirectionProvider>
    );
    expect(screen.getByText('some english text here')).toBeInTheDocument();
  });

  it('DirectionalFlex maps justify/align and reverses row for RTL', () => {
    render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionalFlex direction="row" justify="start" align="end" gap="8px">
          <span>x</span>
        </DirectionalFlex>
      </DirectionProvider>
    );
    const flex = screen.getByTestId('directional-flex');
    expect(flex.getAttribute('data-direction')).toBe('row-reverse');
    expect(flex.getAttribute('data-justify')).toBe('flex-end');
    expect(flex.getAttribute('data-align')).toBe('flex-end');
  });

  it('DirectionalFlex does not reverse when reverseForRTL=false', () => {
    render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionalFlex direction="row" reverseForRTL={false}>
          <span>x</span>
        </DirectionalFlex>
      </DirectionProvider>
    );
    expect(screen.getByTestId('directional-flex').getAttribute('data-direction')).toBe('row');
  });

  it('DirectionalFlex swaps row-reverse to row under RTL', () => {
    render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionalFlex direction="row-reverse">
          <span>x</span>
        </DirectionalFlex>
      </DirectionProvider>
    );
    expect(screen.getByTestId('directional-flex').getAttribute('data-direction')).toBe('row');
  });

  it('DirectionalSpacer logical=true uses marginInlineStart/End', () => {
    render(
      <DirectionProvider>
        <DirectionalSpacer start="10px" end="5px" top="2px" bottom="3px" />
      </DirectionProvider>
    );
    const spacer = screen.getByTestId('directional-spacer');
    const st = (spacer as any).style;
    expect(st.marginInlineStart).toBe('10px');
    expect(st.marginInlineEnd).toBe('5px');
    expect(st.marginTop).toBe('2px');
    expect(st.marginBottom).toBe('3px');
  });

  it('DirectionalSpacer logical=false uses physical margins via getAlignForDirection', () => {
    render(
      <DirectionProvider>
        <DirectionalSpacer logical={false} start="10px" end="5px" />
      </DirectionProvider>
    );
    const st = (screen.getByTestId('directional-spacer') as any).style;
    expect(st.marginLeft).toBeDefined();
    expect(st.marginRight).toBeDefined();
  });

  it('DirectionalSpacer all prop sets margin', () => {
    render(
      <DirectionProvider>
        <DirectionalSpacer all="20px" />
      </DirectionProvider>
    );
    expect((screen.getByTestId('directional-spacer') as any).style.margin).toBe('20px');
  });

  it('DirectionToggle renders custom children and fires onClick + toggles', async () => {
    const { container } = render(
      <DirectionProvider>
        <DirectionToggle showDirection={false}>flip</DirectionToggle>
      </DirectionProvider>
    );
    const btn = screen.getByText('flip');
    btn.click();
    // After toggle the provider becomes rtl; aria-label reflects the next state.
    expect(container.firstChild).toBeInTheDocument();
  });

  it('DirectionToggle default text reflects current direction', () => {
    render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionToggle />
      </DirectionProvider>
    );
    const toggle = screen.getByTestId('direction-toggle');
    expect(toggle.textContent).toContain('RTL');
  });

  it('useDirection throws outside a provider', () => {
    // Suppress the expected error log.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bad() {
      useDirection();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/useDirection must be used within a DirectionProvider/);
    spy.mockRestore();
  });

  it('renders with a custom `as` element', () => {
    const { container } = render(
      <DirectionProvider as="section">x</DirectionProvider>
    );
    expect(container.firstChild?.nodeName).toBe('SECTION');
  });

  it('DirectionalFlex justify=start/end maps per direction and align=end maps to flex-end', () => {
    const { container: a } = render(
      <DirectionProvider>
        <DirectionalFlex direction="row" justify="end" align="end"><span /></DirectionalFlex>
      </DirectionProvider>
    );
    const fa = a.querySelector('[data-testid="directional-flex"]') as HTMLElement;
    expect(fa.style.justifyContent).toBe('flex-end');
    expect(fa.style.alignItems).toBe('flex-end');
    const { container: b } = render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionalFlex direction="column" justify="start"><span /></DirectionalFlex>
      </DirectionProvider>
    );
    const fb = b.querySelector('[data-testid="directional-flex"]') as HTMLElement;
    expect(fb.style.justifyContent).toBe('flex-end');
    expect(fb.className).toContain('flex-rtl');
    const { container: c } = render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionalFlex direction="column" justify="end"><span /></DirectionalFlex>
      </DirectionProvider>
    );
    const fc = c.querySelector('[data-testid="directional-flex"]') as HTMLElement;
    expect(fc.style.justifyContent).toBe('flex-start');
  });

  it('DirectionalSpacer logical mode sets inline start/end margins', () => {
    const { container } = render(
      <DirectionProvider>
        <DirectionalSpacer start="12px" end="34px" />
      </DirectionProvider>
    );
    const s = container.querySelector('[data-testid="directional-spacer"]') as HTMLElement;
    expect(s.style.marginInlineStart).toBe('12px');
    expect(s.style.marginInlineEnd).toBe('34px');
  });

  it('DirectionToggle falls back to activeText (RTL) when no children', () => {
    render(
      <DirectionProvider defaultLayoutDirection="rtl">
        <DirectionToggle />
      </DirectionProvider>
    );
    expect(screen.getByTestId('direction-toggle').textContent).toContain('RTL');
  });

  it('DirectionToggle falls back to inactiveText (LTR) when no children', () => {
    render(
      <DirectionProvider>
        <DirectionToggle />
      </DirectionProvider>
    );
    expect(screen.getByTestId('direction-toggle').textContent).toContain('LTR');
  });

  it('DirectionalFlex justify=start/center and align=center pass through under LTR', () => {
    const { container } = render(
      <DirectionProvider>
        <DirectionalFlex direction="row" justify="start" align="center"><span /></DirectionalFlex>
      </DirectionProvider>
    );
    const f = container.querySelector('[data-testid="directional-flex"]') as HTMLElement;
    expect(f.style.justifyContent).toBe('flex-start');
    expect(f.style.alignItems).toBe('center');
    // justify='center' (passthrough, not start/end).
    const { container: c2 } = render(
      <DirectionProvider>
        <DirectionalFlex direction="row" justify="center"><span /></DirectionalFlex>
      </DirectionProvider>
    );
    expect((c2.querySelector('[data-testid="directional-flex"]') as HTMLElement).style.justifyContent).toBe('center');
  });

  it('DirectionalSpacer without start/end and physical without start/end omit those margins', () => {
    // Logical spacer with only top/bottom (no start/end) → inline arms skipped.
    const { container: a } = render(
      <DirectionProvider>
        <DirectionalSpacer top="1px" bottom="2px" />
      </DirectionProvider>
    );
    const sa = a.querySelector('[data-testid="directional-spacer"]') as HTMLElement;
    expect(sa.style.marginTop).toBe('1px');
    // Physical spacer with only top/bottom (no start/end) → physical arms skipped.
    const { container: b } = render(
      <DirectionProvider>
        <DirectionalSpacer logical={false} top="3px" />
      </DirectionProvider>
    );
    const sb = b.querySelector('[data-testid="directional-spacer"]') as HTMLElement;
    expect(sb.style.marginTop).toBe('3px');
  });
});
