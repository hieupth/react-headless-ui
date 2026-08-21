import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Carousel } from '../src/components/Carousel';
import { useCarousel, DEFAULT_CAROUSEL_ARIA_LABELS } from '../src/hooks';

// carouselAriaLabels: every screen-reader announcement of the carousel can be
// localized; omitted fields fall back to the built-in English defaults, so
// consumers that pass nothing get the exact pre-existing English strings.

const slides = [
  <div key="1">Slide one</div>,
  <div key="2">Slide two</div>,
  <div key="3">Slide three</div>,
];

describe('Carousel aria-label defaults', () => {
  it('exports English defaults that match the shipped strings', () => {
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.region(6, 1)).toBe('6 items. Current item 1 of 6.');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.slide(2, 6)).toBe('Slide 2 of 6');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.goToSlide(3)).toBe('Go to slide 3');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.previousSlide).toBe('Previous slide');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.nextSlide).toBe('Next slide');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.navigation).toBe('Carousel navigation');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.status(true, 2, 3)).toBe('Playing • Slide 2 of 3');
    expect(DEFAULT_CAROUSEL_ARIA_LABELS.status(false, 1, 3)).toBe('Paused • Slide 1 of 3');
  });

  it('renders the English labels when no override is passed', () => {
    render(<Carousel showArrows showDots>{slides}</Carousel>);
    expect(screen.getByRole('region', { name: '3 items. Current item 1 of 3.' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Carousel navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Slide 1 of 3' })).toBeInTheDocument();
  });

  it('hook prop bags carry the English labels by default', () => {
    let api: any;
    function Harness() {
      api = useCarousel({ totalItems: 4, itemsPerView: 2 });
      return null;
    }
    render(<Harness />);
    expect(api.semanticAttributes['aria-label']).toBe('4 items. Current item 1 of 4.');
    expect(api.getSlideProps(1)['aria-label']).toBe('Slide 2 of 4');
    expect(api.getDotProps(0)['aria-label']).toBe('Go to slide 1');
    expect(api.arrowProps.previous['aria-label']).toBe('Previous slide');
    expect(api.arrowProps.next['aria-label']).toBe('Next slide');
  });
});

describe('Carousel aria-label localization', () => {
  it('applies a full override set to every announcement surface', () => {
    render(
      <Carousel
        showArrows
        showDots
        autoPlay={5000}
        carouselAriaLabels={{
          region: (total, current) => `全${total}アイテム。現在 ${current} / ${total}。`,
          slide: (n, total) => `スライド${n}／${total}`,
          goToSlide: (n) => `スライド${n}へ移動`,
          previousSlide: '前のスライド',
          nextSlide: '次のスライド',
          navigation: 'カルーセルナビゲーション',
          status: (playing, n, total) => `${playing ? '再生中' : '一時停止中'} • スライド${n}／${total}`,
        }}
      >
        {slides}
      </Carousel>
    );
    expect(screen.getByRole('region', { name: '全3アイテム。現在 1 / 3。' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'カルーセルナビゲーション' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '前のスライド' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '次のスライド' })).toBeInTheDocument();
    // Each slide announces the localized template. Only the visible slide is
    // exposed to role queries (the others are aria-hidden), so assert the
    // hidden ones at the DOM level.
    expect(screen.getByRole('group', { name: 'スライド1／3' })).toBeInTheDocument();
    const slideEls = document.querySelectorAll('.carousel-slide');
    expect(slideEls).toHaveLength(3);
    expect(slideEls[1]).toHaveAttribute('aria-label', 'スライド2／3');
    expect(slideEls[2]).toHaveAttribute('aria-label', 'スライド3／3');
    const group = screen.getByRole('group', { name: 'カルーセルナビゲーション' });
    for (const name of ['スライド1へ移動', 'スライド2へ移動', 'スライド3へ移動']) {
      expect(within(group).getByRole('button', { name })).toBeInTheDocument();
    }
    // Auto-play status uses the localized template (playing by default).
    expect(screen.getByText('再生中 • スライド1／3')).toBeInTheDocument();
  });

  it('partial override keeps the omitted labels English', () => {
    render(
      <Carousel showArrows showDots carouselAriaLabels={{ previousSlide: '戻る', nextSlide: '進む' }}>
        {slides}
      </Carousel>
    );
    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '進む' })).toBeInTheDocument();
    // Omitted fields fall back to the defaults.
    expect(screen.getByRole('region', { name: '3 items. Current item 1 of 3.' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Carousel navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument();
  });
});
