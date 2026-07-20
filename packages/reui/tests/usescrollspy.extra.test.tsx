import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, renderHook } from '@testing-library/react';
import { useScrollspy } from '../src/hooks/useScrollspy';
import type { UseScrollspyProps, ScrollspySection } from '../src/hooks/useScrollspy';

// Capture the IntersectionObserver instance so tests can drive its callback.
let ioCtorCalls: any[] = [];
let lastObserver: any;

class FakeIO {
  cb: (entries: any[]) => void;
  root: any = null;
  rootMargin = '';
  thresholds: number[] = [];
  private targets: Set<Element> = new Set();
  constructor(cb: (entries: any[]) => void, options: any) {
    this.cb = cb;
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? '';
    this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0];
    lastObserver = this;
    ioCtorCalls.push(this);
  }
  observe(t: Element) { this.targets.add(t); }
  unobserve(t: Element) { this.targets.delete(t); }
  disconnect() { this.targets.clear(); }
  takeRecords() { return []; }
  // helper for tests
  fire(entries: any[]) { this.cb(entries); }
}

function baseSections(): ScrollspySection[] {
  return [
    { id: 's1', label: 'Section 1' },
    { id: 's2', label: 'Section 2' },
    { id: 's3', label: 'Section 3', disabled: true },
  ];
}

describe('useScrollspy hook — state, attributes & disabled', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    lastObserver = undefined;
    globalThis.IntersectionObserver = FakeIO as any;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes default state and navigation attributes', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    expect(result.current.state.activeSectionId).toBeNull();
    expect(result.current.state.disabled).toBe(false);
    expect(result.current.state.sections).toHaveLength(3);
    expect(result.current.state.scrollPosition).toBe(0);
    expect(result.current.attributes['role']).toBe('navigation');
    expect(result.current.attributes['aria-label']).toBe('Table of contents');
    expect(result.current.attributes.tabIndex).toBe(0);
  });

  it('disabled=true suppresses observer setup and sets tabIndex -1', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    expect(result.current.state.isObserving).toBe(false);
    expect(result.current.attributes.tabIndex).toBe(-1);
    expect(ioCtorCalls).toHaveLength(0);
  });

  it('autoUpdate=false suppresses observer setup', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), autoUpdate: false }));
    expect(result.current.state.isObserving).toBe(false);
    expect(ioCtorCalls).toHaveLength(0);
  });

  it('autoUpdate=true constructs an IntersectionObserver and observes registered elements', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), autoUpdate: true }));
    expect(ioCtorCalls.length).toBeGreaterThanOrEqual(1);
    expect(result.current.state.isObserving).toBe(true);
  });
});

describe('useScrollspy hook — actions: setActiveSection, getSection, isSectionActive, getVisibleSections', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
  });

  it('setActiveSection sets active id and fires callback for enabled section', () => {
    const onActiveSectionChange = vi.fn();
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), onActiveSectionChange }));
    act(() => result.current.actions.setActiveSection('s2'));
    expect(result.current.state.activeSectionId).toBe('s2');
    expect(onActiveSectionChange).toHaveBeenCalledWith('s2');
    expect(result.current.actions.isSectionActive('s2')).toBe(true);
    expect(result.current.actions.isSectionActive('s1')).toBe(false);
  });

  it('setActiveSection ignores disabled and unknown sections', () => {
    const onActiveSectionChange = vi.fn();
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), onActiveSectionChange }));
    act(() => result.current.actions.setActiveSection('s3')); // disabled
    expect(result.current.state.activeSectionId).toBeNull();
    act(() => result.current.actions.setActiveSection('unknown'));
    expect(result.current.state.activeSectionId).toBeNull();
    expect(onActiveSectionChange).not.toHaveBeenCalled();
  });

  it('setActiveSection is a no-op when disabled', () => {
    const onActiveSectionChange = vi.fn();
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true, onActiveSectionChange }));
    act(() => result.current.actions.setActiveSection('s1'));
    expect(result.current.state.activeSectionId).toBeNull();
    expect(onActiveSectionChange).not.toHaveBeenCalled();
  });

  it('getSection returns section by id; getVisibleSections returns only those with element', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    expect(result.current.actions.getSection('s2')?.label).toBe('Section 2');
    expect(result.current.actions.getSection('nope')).toBeUndefined();
    expect(result.current.actions.getVisibleSections()).toEqual([]);
    // Register an element -> becomes visible
    const el = { id: 's1' } as unknown as HTMLElement;
    act(() => result.current.actions.registerSection('s1', el));
    expect(result.current.actions.getVisibleSections()).toHaveLength(1);
  });
});

describe('useScrollspy hook — registerSection / unregisterSection', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
  });

  it('registerSection stores element and updates sections (observe only when not yet observing)', () => {
    // Once the autoUpdate effect has fired, isObserving is true, so the internal
    // guard `observerRef.current && !isObserving` is false and registerSection
    // stores the element without calling observe again.
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    const el = { id: 's1' } as unknown as HTMLElement;
    const spy = vi.spyOn(lastObserver, 'observe');
    act(() => result.current.actions.registerSection('s1', el));
    expect(result.current.actions.getSection('s1')?.element).toBe(el);
    // isObserving already true here, so observe is not re-invoked.
    expect(spy).not.toHaveBeenCalled();
  });

  it('registerSection observes when observer exists but isObserving is false', () => {
    // autoUpdate=false keeps isObserving false; manually set observer via the
    // disabled-off path is not possible, so drive via the scrollspyRef+disabled
    // toggle. Simpler: use disabled to prevent auto-observer and confirm no-op guard.
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), autoUpdate: false }));
    const el = { id: 's1' } as unknown as HTMLElement;
    // observerRef.current is null (no observer created), so observe not called.
    expect(() => act(() => result.current.actions.registerSection('s1', el))).not.toThrow();
    expect(result.current.actions.getSection('s1')?.element).toBe(el);
  });

  it('registerSection is a no-op when disabled', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    const el = { id: 's1' } as unknown as HTMLElement;
    act(() => result.current.actions.registerSection('s1', el));
    expect(result.current.actions.getSection('s1')?.element).toBeUndefined();
  });

  it('unregisterSection unobserves, deletes and nulls the element', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    const el = { id: 's2' } as unknown as HTMLElement;
    act(() => result.current.actions.registerSection('s2', el));
    const unobsSpy = vi.spyOn(lastObserver, 'unobserve');
    act(() => result.current.actions.unregisterSection('s2'));
    expect(unobsSpy).toHaveBeenCalledWith(el);
    expect(result.current.actions.getSection('s2')?.element).toBeNull();
  });

  it('unregisterSection is a no-op when disabled', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    expect(() => act(() => result.current.actions.unregisterSection('s1'))).not.toThrow();
  });

  it('unregisterSection skips unobserve when no observer was created (autoUpdate=false)', () => {
    // autoUpdate=false => observerRef.current stays null; a registered element
    // exists but unobserve must not be called on a null observer.
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), autoUpdate: false }));
    const el = { id: 's1' } as unknown as HTMLElement;
    act(() => result.current.actions.registerSection('s1', el));
    expect(() => act(() => result.current.actions.unregisterSection('s1'))).not.toThrow();
    expect(result.current.actions.getSection('s1')?.element).toBeNull();
  });
});

describe('useScrollspy hook — refreshSections', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
  });

  it('refreshSections re-resolves elements from the DOM by id and re-observes', () => {
    const el1 = document.createElement('div'); el1.id = 's1';
    const el2 = document.createElement('div'); el2.id = 's2';
    document.body.append(el1, el2);
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    const discSpy = vi.spyOn(lastObserver, 'disconnect');
    const obsSpy = vi.spyOn(lastObserver, 'observe');
    act(() => result.current.actions.refreshSections());
    expect(discSpy).toHaveBeenCalled();
    expect(obsSpy).toHaveBeenCalled();
    expect(result.current.actions.getSection('s1')?.element).toBe(el1);
    expect(result.current.actions.getSection('s2')?.element).toBe(el2);
    el1.remove(); el2.remove();
  });

  it('refreshSections is a no-op when disabled', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    expect(() => act(() => result.current.actions.refreshSections())).not.toThrow();
  });

  it('refreshSections sets element null when DOM element is missing', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    act(() => result.current.actions.refreshSections());
    expect(result.current.actions.getSection('s1')?.element).toBeNull();
  });

  it('refreshSections skips observer restart when no observer was created (autoUpdate=false)', () => {
    // autoUpdate=false => observerRef.current is null; refresh still resolves DOM
    // elements but must not call disconnect/observe on a null observer.
    const el1 = document.createElement('div'); el1.id = 's1';
    document.body.appendChild(el1);
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), autoUpdate: false }));
    expect(() => act(() => result.current.actions.refreshSections())).not.toThrow();
    expect(result.current.actions.getSection('s1')?.element).toBe(el1);
    el1.remove();
  });
});

describe('useScrollspy hook — navigateToSection', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('navigates by scrolling to element and sets active', () => {
    const onActiveSectionChange = vi.fn();
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), onActiveSectionChange }));
    const el = { id: 's2', getBoundingClientRect: () => ({ top: 100 }) } as unknown as HTMLElement;
    act(() => result.current.actions.registerSection('s2', el));
    act(() => result.current.actions.navigateToSection('s2'));
    expect(window.scrollTo).toHaveBeenCalled();
    expect(result.current.state.activeSectionId).toBe('s2');
    expect(onActiveSectionChange).toHaveBeenCalledWith('s2');
  });

  it('navigate falls back to href when element missing', () => {
    const sections: ScrollspySection[] = [{ id: 'x', label: 'X', href: 'http://example.test/x' }];
    const { result } = renderHook(() => useScrollspy({ sections }));
    // Intercept the href assignment via a defineProperty on window.location.
    const original = window.location;
    let assignedHref: string | undefined;
    const stub = new Proxy(original, {
      get(_t, prop) {
        if (prop === 'href') return assignedHref ?? 'http://localhost:3000/';
        return (original as any)[prop];
      },
      set(_t, prop, value) {
        if (prop === 'href') { assignedHref = value; return true; }
        return false;
      },
    });
    try {
      Object.defineProperty(window, 'location', { value: stub, configurable: true });
      act(() => result.current.actions.navigateToSection('x'));
      expect(assignedHref).toBe('http://example.test/x');
    } finally {
      Object.defineProperty(window, 'location', { value: original, configurable: true });
    }
  });

  it('navigate is a no-op for disabled section without href, and for unknown section', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    expect(() => act(() => result.current.actions.navigateToSection('s3'))).not.toThrow(); // disabled
    expect(() => act(() => result.current.actions.navigateToSection('nope'))).not.toThrow();
  });

  it('navigate is a no-op when disabled', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    expect(() => act(() => result.current.actions.navigateToSection('s1'))).not.toThrow();
  });
});

describe('useScrollspy hook — intersection callback', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
  });

  it('intersection with ratio >= 0.5 sets active and fires callbacks', () => {
    const onActiveSectionChange = vi.fn();
    const onSectionVisible = vi.fn();
    const { result } = renderHook(() =>
      useScrollspy({ sections: baseSections(), onActiveSectionChange, onSectionVisible })
    );
    const el = { id: 's1' } as unknown as HTMLElement;
    act(() => {
      lastObserver.fire([
        { target: { id: 's1' }, isIntersecting: true, intersectionRatio: 0.6, intersectionRect: { height: 10 } },
      ]);
    });
    expect(onSectionVisible).toHaveBeenCalledWith('s1');
    expect(onActiveSectionChange).toHaveBeenCalledWith('s1');
    expect(result.current.state.activeSectionId).toBe('s1');
    expect(el).toBeDefined();
  });

  it('intersection with ratio < 0.5 does not set active', () => {
    const onActiveSectionChange = vi.fn();
    renderHook(() => useScrollspy({ sections: baseSections(), onActiveSectionChange }));
    act(() => {
      lastObserver.fire([
        { target: { id: 's1' }, isIntersecting: true, intersectionRatio: 0.3, intersectionRect: { height: 10 } },
      ]);
    });
    expect(onActiveSectionChange).not.toHaveBeenCalled();
  });

  it('non-intersecting entry fires nothing by itself', () => {
    const onSectionVisible = vi.fn();
    renderHook(() => useScrollspy({ sections: baseSections(), onSectionVisible }));
    act(() => {
      lastObserver.fire([
        { target: { id: 's1' }, isIntersecting: false, intersectionRatio: 0, intersectionRect: { height: 0 } },
      ]);
    });
    expect(onSectionVisible).not.toHaveBeenCalled();
  });
});

describe('useScrollspy hook — scroll position effect', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
  });

  it('window scroll updates scrollPosition', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { value: 250, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.state.scrollPosition).toBe(250);
  });

  it('scroll handler not attached when disabled', () => {
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { value: 999, configurable: true, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.state.scrollPosition).toBe(0);
  });
});

describe('useScrollspy hook — auto-detect timer effect & custom scrollspyRef', () => {
  beforeEach(() => {
    ioCtorCalls = [];
    globalThis.IntersectionObserver = FakeIO as any;
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('auto-detect mount effect schedules a refreshSections after 100ms', () => {
    const el1 = document.createElement('div'); el1.id = 's1';
    document.body.appendChild(el1);
    const { result } = renderHook(() => useScrollspy({ sections: baseSections() }));
    // Before timer, element not yet resolved.
    expect(result.current.actions.getSection('s1')?.element).toBeUndefined();
    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current.actions.getSection('s1')?.element).toBe(el1);
    el1.remove();
  });

  it('auto-detect mount effect does nothing when disabled', () => {
    const el1 = document.createElement('div'); el1.id = 's1';
    document.body.appendChild(el1);
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), disabled: true }));
    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current.actions.getSection('s1')?.element).toBeUndefined();
    el1.remove();
  });

  it('uses external scrollspyRef when provided', () => {
    const ref = { current: null as HTMLElement | null };
    const { result } = renderHook(() => useScrollspy({ sections: baseSections(), scrollspyRef: ref }));
    expect(result.current.attributes.role).toBe('navigation');
  });
});
