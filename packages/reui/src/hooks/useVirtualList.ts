/**
 * useVirtualList hook.
 *
 * Thin wrapper around @tanstack/react-virtual's `useVirtualizer` (vertical,
 * single lane) so that DataGrid / Combobox / Command can share one rendering
 * strategy without duplicating the wiring. The hook does NOT decide how rows
 * are positioned — that is component-specific (table rows need spacer rows,
 * div lists use absolute positioning). It only owns the virtualizer instance
 * and exposes the values each renderer needs.
 *
 * Set `enabled` to false (the default for small lists) to bypass virtualization
 * entirely: the hook then reports all indices as visible so callers can render
 * every item directly. This keeps small-list behavior and existing tests
 * unchanged; virtualization only engages above the caller's threshold.
 */

import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';

/**
 * Props for {@link useVirtualList}.
 */
export interface UseVirtualListProps {
  /** Total number of items in the (already-filtered/paginated) list. */
  count: number;
  /**
   * Returns the scrollable element. May return null before mount; the
   * underlying virtualizer tolerates this and recomputes when it resolves.
   */
  getScrollElement: () => HTMLElement | null;
  /** Estimated row height in pixels. */
  estimateSize: number;
  /** Extra rows rendered above/below the visible window. */
  overscan?: number;
  /** When false (default), the list renders every item — no virtualization. */
  enabled?: boolean;
}

/**
 * Result of {@link useVirtualList}.
 */
export interface UseVirtualListResult {
  /** Virtual items to render, or a synthetic all-indices list when disabled. */
  virtualItems: VirtualItem[];
  /** Total scrollable height of the list, in pixels. */
  totalSize: number;
  /**
   * Scroll a given index into view. No-op when virtualization is disabled
   * (the browser's native scroll handles an unvirtualized list).
   */
  scrollToIndex: (index: number) => void;
}

/**
 * Vertical, single-lane virtualizer shared by the data-heavy list renderers.
 */
export function useVirtualList({
  count,
  getScrollElement,
  estimateSize,
  overscan = 4,
  enabled = false,
}: UseVirtualListProps): UseVirtualListResult {
  const virtualizer = useVirtualizer({
    count,
    getScrollElement,
    estimateSize: () => estimateSize,
    overscan,
    enabled,
  });

  // NOTE: do NOT memoize over `virtualizer`. The instance identity is stable
  // across the re-renders it triggers itself (via its internal subscription),
  // so a useMemo keyed on it would keep returning stale getVirtualItems()
  // results after the first measure. Reading the values fresh every render is
  // correct — the virtualizer already memoizes its internal computation.
  if (!enabled) {
    // When disabled, every index is "visible" so callers render the full
    // list directly without special-casing the virtualized layout.
    const virtualItems: VirtualItem[] = Array.from({ length: count }, (_, index) => ({
      index,
      start: index * estimateSize,
      end: index * estimateSize + estimateSize,
      size: estimateSize,
      lane: 0,
      key: index,
    }));
    return { virtualItems, totalSize: count * estimateSize, scrollToIndex: () => {} };
  }

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index);
  };

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex,
  };
}
