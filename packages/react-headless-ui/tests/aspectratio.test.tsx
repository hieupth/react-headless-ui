import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AspectRatio } from '../src/components/AspectRatio';
import { useAspectRatio } from '../src/hooks';

describe('AspectRatio', () => {
  it('renders its children inside the aspect ratio container', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img src="/test.jpg" alt="test" />
      </AspectRatio>
    );
    expect(container.querySelector('.aspect-ratio-container')).toBeInTheDocument();
    expect(screen.getByAltText('test')).toBeInTheDocument();
  });

  it('computes padding-bottom from the ratio', () => {
    let result: any;
    const Probe = () => {
      result = useAspectRatio({ ratio: 4 / 3 });
      return null;
    };
    render(<Probe />);
    // paddingBottom = (1/ratio)*100 = 75
    expect(result.props.style.paddingBottom).toBe(`${(1 / (4 / 3)) * 100}%`);
  });

  it('applies the disabled class when disabled', () => {
    const { container } = render(<AspectRatio disabled>Content</AspectRatio>);
    expect(container.querySelector('.aspect-ratio-disabled')).not.toBeNull();
  });

  it('marks the container as mounted on the client', () => {
    const { container } = render(<AspectRatio>Content</AspectRatio>);
    expect(container.querySelector('.aspect-ratio-mounted')).not.toBeNull();
  });

  it('renders the inner content container with absolute positioning', () => {
    const { container } = render(<AspectRatio>Inner</AspectRatio>);
    const content = container.querySelector('.aspect-ratio-content') as HTMLElement;
    expect(content).not.toBeNull();
    expect(content.style.position).toBe('absolute');
  });

  it('uses the default 16/9 ratio when none is provided', () => {
    let result: any;
    const Probe = () => { result = useAspectRatio({}); return null; };
    render(<Probe />);
    expect(result.state.ratio).toBeCloseTo(16 / 9, 5);
  });

  it('exposes recalculate action without throwing', () => {
    let result: any;
    const Probe = () => { result = useAspectRatio({ ratio: 1 }); return null; };
    render(<Probe />);
    expect(typeof result.actions.recalculate).toBe('function');
    act(() => {
      expect(() => result.actions.recalculate()).not.toThrow();
    });
  });
});
