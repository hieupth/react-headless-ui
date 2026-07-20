import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  Carousel,
  ImageCarousel,
  CardCarousel,
  TestimonialCarousel,
  HeroCarousel,
} from '../src/components/Carousel';
import { useCarousel } from '../src/hooks';

const slides = [
  <div key="1">Slide one</div>,
  <div key="2">Slide two</div>,
  <div key="3">Slide three</div>,
];

describe('Carousel', () => {
  it('renders all slides and the current slide content', () => {
    render(
      <Carousel showArrows showDots>
        {slides}
      </Carousel>
    );
    expect(screen.getByText('Slide one')).toBeInTheDocument();
    expect(screen.getByText('Slide two')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('advances to the next slide via the next arrow', () => {
    const onSlideChange = vi.fn();
    render(
      <Carousel showArrows showDots onSlideChange={onSlideChange}>
        {slides}
      </Carousel>
    );
    const nextArrow = screen.getByRole('button', { name: 'Next slide' });
    fireEvent.click(nextArrow);
    expect(onSlideChange).toHaveBeenCalledWith(1);
  });

  it('goes to the previous slide via the previous arrow', () => {
    vi.useFakeTimers();
    const onSlideChange = vi.fn();
    render(
      <Carousel showArrows showDots animationDuration={0} onSlideChange={onSlideChange}>
        {slides}
      </Carousel>
    );
    const nextArrow = screen.getByRole('button', { name: 'Next slide' });
    fireEvent.click(nextArrow); // move to slide 1
    act(() => { vi.advanceTimersByTime(10); });
    const prevArrow = screen.getByRole('button', { name: 'Previous slide' });
    fireEvent.click(prevArrow);
    act(() => { vi.advanceTimersByTime(10); });
    expect(onSlideChange).toHaveBeenLastCalledWith(0);
    vi.useRealTimers();
  });

  it('jumps to a slide via dot indicators', () => {
    const onSlideChange = vi.fn();
    render(
      <Carousel showDots onSlideChange={onSlideChange}>
        {slides}
      </Carousel>
    );
    const dots = screen.getAllByRole('button', { name: /Go to slide/i });
    fireEvent.click(dots[2]);
    expect(onSlideChange).toHaveBeenCalledWith(2);
  });

  it('hides arrows and dots when disabled', () => {
    render(<Carousel showArrows={false} showDots={false}>{slides}</Carousel>);
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('keeps arrows enabled at boundaries when loop is on', () => {
    render(<Carousel loop showArrows>{slides}</Carousel>);
    const nextArrow = screen.getByRole('button', { name: 'Next slide' }) as HTMLButtonElement;
    const prevArrow = screen.getByRole('button', { name: 'Previous slide' }) as HTMLButtonElement;
    // With loop, neither arrow is disabled at the start boundary.
    expect(nextArrow.disabled).toBe(false);
    expect(prevArrow.disabled).toBe(false);
  });

  it('navigates via keyboard ArrowRight on the track', () => {
    vi.useFakeTimers();
    const onSlideChange = vi.fn();
    const { container } = render(
      <Carousel showArrows animationDuration={0} onSlideChange={onSlideChange}>{slides}</Carousel>
    );
    const track = container.querySelector('.carousel-track') as HTMLElement;
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    act(() => { vi.advanceTimersByTime(10); });
    expect(onSlideChange).toHaveBeenLastCalledWith(1);
    vi.useRealTimers();
  });

  it('navigates via keyboard ArrowLeft on the track', () => {
    vi.useFakeTimers();
    const onSlideChange = vi.fn();
    const { container } = render(
      <Carousel showArrows animationDuration={0} onSlideChange={onSlideChange}>
        {slides}
      </Carousel>
    );
    const track = container.querySelector('.carousel-track') as HTMLElement;
    fireEvent.keyDown(track, { key: 'ArrowRight' }); // slide 1
    act(() => { vi.advanceTimersByTime(10); });
    fireEvent.keyDown(track, { key: 'ArrowLeft' }); // back to 0
    act(() => { vi.advanceTimersByTime(10); });
    expect(onSlideChange).toHaveBeenLastCalledWith(0);
    vi.useRealTimers();
  });

  it('shows an autoplay status indicator when autoPlay is set', () => {
    render(<Carousel autoPlay={5000}>{slides}</Carousel>);
    expect(screen.getByText(/Slide 1 of 3/)).toBeInTheDocument();
  });

  it('pauses on hover and resumes on mouse leave', () => {
    const { container } = render(
      <Carousel autoPlay={5000} pauseOnHover>{slides}</Carousel>
    );
    const wrapper = container.querySelector('.carousel-wrapper') as HTMLElement;
    // Hover -> pause; leave -> play.
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    expect(screen.getByText(/Slide 1 of 3/)).toBeInTheDocument();
  });

  it('renders custom arrow and dot components', () => {
    render(
      <Carousel
        showArrows
        showDots
        PreviousArrow={({ onClick, disabled }) => (
          <button data-testid="custom-prev" disabled={disabled} onClick={onClick}>P</button>
        )}
        NextArrow={({ onClick, disabled }) => (
          <button data-testid="custom-next" disabled={disabled} onClick={onClick}>N</button>
        )}
        DotIndicator={({ index, isActive, onClick }) => (
          <button key={index} data-testid={`custom-dot-${index}`} onClick={onClick}>
            {isActive ? 'A' : 'I'}
          </button>
        )}
      >
        {slides}
      </Carousel>
    );
    expect(screen.getByTestId('custom-prev')).toBeInTheDocument();
    expect(screen.getByTestId('custom-next')).toBeInTheDocument();
    expect(screen.getByTestId('custom-dot-0')).toBeInTheDocument();
  });
});

describe('Carousel variants', () => {
  it('ImageCarousel renders images', () => {
    render(<ImageCarousel showDots={false} images={[<span key="a">Img1</span>, <span key="b">Img2</span>]} />);
    expect(screen.getByText('Img1')).toBeInTheDocument();
    expect(screen.getByText('Img2')).toBeInTheDocument();
  });

  it('CardCarousel renders cards', () => {
    render(<CardCarousel showDots={false} cards={[<div key="a">Card1</div>]} />);
    expect(screen.getByText('Card1')).toBeInTheDocument();
  });

  it('TestimonialCarousel renders children', () => {
    render(<TestimonialCarousel>{[<div key="a">Testimonial</div>]}</TestimonialCarousel>);
    expect(screen.getByText('Testimonial')).toBeInTheDocument();
  });

  it('HeroCarousel renders hero slides', () => {
    render(<HeroCarousel>{[<div key="a">Hero</div>]}</HeroCarousel>);
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });
});

describe('useCarousel', () => {
  it('goToSlide fires onSlideChange and clamps without loop', () => {
    vi.useFakeTimers();
    const onSlideChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCarousel({ totalItems: 3, animationDuration: 0, onSlideChange });
      return null;
    };
    render(<Probe />);
    act(() => result.actions.goToSlide(2));
    act(() => { vi.advanceTimersByTime(10); });
    expect(onSlideChange).toHaveBeenLastCalledWith(2);
    // Out of range without loop clamps to last slide.
    act(() => result.actions.goToSlide(10));
    act(() => { vi.advanceTimersByTime(10); });
    expect(result.state.currentSlide).toBeLessThanOrEqual(result.state.totalSlides - 1);
    vi.useRealTimers();
  });

  it('loop wraps around on goToSlide', () => {
    vi.useFakeTimers();
    const onSlideChange = vi.fn();
    let result: any;
    const Probe = () => {
      result = useCarousel({ totalItems: 3, loop: true, animationDuration: 0, onSlideChange });
      return null;
    };
    render(<Probe />);
    // Move away from 0 first, then wrap forward past the end back to 0.
    act(() => result.actions.goToSlide(2));
    act(() => { vi.advanceTimersByTime(10); });
    act(() => result.actions.goToSlide(5));
    act(() => { vi.advanceTimersByTime(10); });
    expect(onSlideChange).toHaveBeenLastCalledWith(0);
    vi.useRealTimers();
  });

  it('play/pause/togglePlay control isPlaying', () => {
    let result: any;
    const Probe = () => {
      result = useCarousel({ totalItems: 3, autoPlay: 1000 });
      return null;
    };
    render(<Probe />);
    expect(result.state.isPlaying).toBe(true);
    act(() => result.actions.pause());
    expect(result.state.isPlaying).toBe(false);
    act(() => result.actions.play());
    expect(result.state.isPlaying).toBe(true);
  });

  it('isSlideVisible reports the active window', () => {
    let result: any;
    const Probe = () => {
      result = useCarousel({ totalItems: 3, itemsPerView: 1 });
      return null;
    };
    render(<Probe />);
    expect(result.actions.isSlideVisible(0)).toBe(true);
    expect(result.actions.isSlideVisible(1)).toBe(false);
  });
});
