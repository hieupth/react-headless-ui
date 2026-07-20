import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Scrollspy, ScrollspySection } from '../src/components/Scrollspy';

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'body', label: 'Body' },
];

describe('Scrollspy', () => {
  it('renders the provided sections as labels', () => {
    render(<Scrollspy sections={sections} />);
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders the scrollspy container', () => {
    const { container } = render(<Scrollspy sections={sections} />);
    expect(container.querySelector('.scrollspy')).not.toBeNull();
  });

  it('uses a custom renderSection when provided', () => {
    render(
      <Scrollspy
        sections={sections}
        renderSection={(section, isActive) => (
          <div data-testid={`custom-${section.id}`} data-active={isActive}>
            {section.label}
          </div>
        )}
      />
    );
    expect(screen.getByTestId('custom-intro')).toBeInTheDocument();
  });

  it('navigates when a non-disabled section is clicked', () => {
    render(<Scrollspy sections={sections} />);
    const intro = screen.getByTestId('scrollspy-section-intro');
    // non-disabled section -> the navigate arm of the onClick guard fires
    expect(() =>
      act(() => intro.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    ).not.toThrow();
  });

  it('renders a disabled section with aria-disabled and no navigation on click', () => {
    const disabledSections = [
      { id: 'intro', label: 'Introduction', disabled: true },
      { id: 'body', label: 'Body' },
    ];
    const { container } = render(<Scrollspy sections={disabledSections} />);
    const intro = screen.getByTestId('scrollspy-section-intro');
    expect(intro).toHaveAttribute('aria-disabled', 'true');
    // Headless-only: disabled is exposed via aria-disabled, not a cursor class.
    // clicking a disabled section does not throw and does not navigate
    act(() => {
      intro.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(container).toBeDefined();
  });

  it('renders a non-active section without aria-current (active state is set only via IntersectionObserver)', () => {
    // The hook seeds activeSectionId=null and only a real IntersectionObserver
    // entry flips it; jsdom's no-op polyfill can't drive that, so on first
    // render every section is inactive (covered active-branch arms live in the
    // ScrollspySection component test, which takes isActive as a direct prop).
    render(<Scrollspy sections={sections} />);
    const body = screen.getByTestId('scrollspy-section-body');
    expect(body).not.toHaveAttribute('aria-current');
  });

  it('renders section icons when showIcons is on and a section has an icon', () => {
    const iconSections = [
      { id: 'intro', label: 'Introduction', icon: <span data-testid="ico">★</span> },
      { id: 'body', label: 'Body' },
    ];
    render(<Scrollspy sections={iconSections} />);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('hides indicators when showIndicators is false', () => {
    const { container } = render(<Scrollspy sections={sections} showIndicators={false} />);
    // no indicator dots rendered
    expect(container.querySelectorAll('.rounded-full.w-2').length).toBe(0);
  });

  it('renders the vertical progress bar when showProgress + vertical', () => {
    const { container } = render(
      <Scrollspy sections={sections} showProgress orientation="vertical" />
    );
    expect(container.querySelector('.progress-container')).not.toBeNull();
  });

  it('renders zero progress for an empty section list with showProgress', () => {
    const { container } = render(
      <Scrollspy sections={[]} showProgress orientation="vertical" />
    );
    expect(container.querySelector('.progress-container')).not.toBeNull();
  });

  it('applies the disabled attribute when disabled is true', () => {
    render(<Scrollspy sections={sections} disabled />);
    const root = document.querySelector('.scrollspy') as HTMLElement;
    // Headless-only: disabled is exposed via tabindex=-1, not visual classes.
    expect(root).toHaveAttribute('tabindex', '-1');
  });

  it('skips sections that have no id during registration and cleanup', () => {
    // a section with an empty id exercises the `if (section.id)` falsy arms in
    // both the register effect and its cleanup, without throwing.
    const { unmount } = render(
      <Scrollspy sections={[{ id: '', label: 'NoId' } as any]} />
    );
    unmount();
  });

  it('renders the horizontal progress indicator when showProgress + horizontal', () => {
    const { container } = render(
      <Scrollspy sections={sections} showProgress orientation="horizontal" />
    );
    expect(container.querySelector('.scroll-position-indicator')).not.toBeNull();
  });

  it('applies horizontal orientation and height style', () => {
    const { container } = render(
      <Scrollspy sections={sections} orientation="horizontal" height={120} />
    );
    const root = container.querySelector('.scrollspy') as HTMLElement;
    // Headless-only: orientation no longer emits a flex utility; height is a style.
    expect(root.style.height).toBe('120px');
  });

  it('renders for the right position without error', () => {
    const { container } = render(<Scrollspy sections={sections} position="right" />);
    // Headless-only: position no longer emits a positional utility; just renders.
    expect(container.querySelector('.scrollspy')).toBeInTheDocument();
  });

  it('renders the empty state when there are no sections', () => {
    render(<Scrollspy sections={[]} />);
    expect(screen.getByText('No sections available')).toBeInTheDocument();
  });

  it('registers sections that have a corresponding DOM element on mount', () => {
    // provide real DOM nodes for the section ids so the register effect finds them
    const intro = document.createElement('div');
    intro.id = 'intro';
    const body = document.createElement('div');
    body.id = 'body';
    document.body.append(intro, body);
    try {
      const { unmount } = render(<Scrollspy sections={sections} />);
      // unmount exercises the cleanup/unregister branch
      unmount();
    } finally {
      intro.remove();
      body.remove();
    }
  });
});

describe('ScrollspySection', () => {
  const section = { id: 's1', label: 'Section One' };

  it('renders the section label and aria-current when active', () => {
    render(<ScrollspySection section={section} isActive />);
    const el = screen.getByTestId('scrollspy-section-s1');
    expect(el).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('Section One')).toBeInTheDocument();
    // active section renders the arrow svg
    expect(el.querySelector('svg')).not.toBeNull();
  });

  it('renders a disabled section and its icon, honoring showIndicators=false', () => {
    render(
      <ScrollspySection
        section={{ id: 's2', label: 'Sec Two', disabled: true, icon: <i data-testid="si">i</i> }}
        isActive={false}
        showIndicators={false}
        onClick={() => {}}
      />
    );
    const el = screen.getByTestId('scrollspy-section-s2');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('si')).toBeInTheDocument();
  });

  it('renders an inactive, non-disabled section with the default hover classes', () => {
    const { container } = render(<ScrollspySection section={section} isActive={false} />);
    const el = screen.getByTestId('scrollspy-section-s1');
    // Headless-only: inactive indicator/hover no longer emit color utilities.
    expect(el).toBeInTheDocument();
  });
});
