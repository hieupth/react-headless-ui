/**
 * Chart hook following Flutter patterns.
 * Provides composable behavior for chart components.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSemanticMixin } from '../mixins/SemanticMixin';
import { useFocusableMixin } from '../mixins/FocusableMixin';
import type { SemanticProps } from '../contracts/SemanticContract';
import type { FocusableProps } from '../contracts/ComponentContract';

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
  /** X-axis value */
  x: string | number;
  /** Y-axis value */
  y: number;
  /** Optional label */
  label?: string;
  /** Optional color */
  color?: string;
  /** Pre-scale numeric x, augmented on flattened render points (Chart.tsx) */
  originalX?: number;
  /** Pre-scale numeric y, augmented on flattened render points (Chart.tsx) */
  originalY?: number;
  /** Source dataset index, augmented on flattened points by useChart */
  datasetIndex?: number;
}

/**
 * Chart dataset interface
 */
export interface ChartDataset {
  /** Dataset label */
  label: string;
  /** Dataset data points */
  data: ChartDataPoint[];
  /** Dataset color */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Fill area under line */
  fill?: boolean;
}

/**
 * Chart axis configuration
 */
export interface ChartAxis {
  /** Axis label */
  label?: string;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Grid line color */
  gridColor?: string;
  /** Tick color */
  tickColor?: string;
  /** Font size for labels */
  fontSize?: number;
  /** Font color */
  fontColor?: string;
}

/**
 * Chart legend configuration
 */
export interface ChartLegend {
  /** Whether to show legend */
  show?: boolean;
  /** Legend position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Legend background color */
  backgroundColor?: string;
  /** Legend text color */
  textColor?: string;
  /** Font size */
  fontSize?: number;
}

/**
 * Props for useChart hook
 */
export interface UseChartProps extends
  SemanticProps,
  FocusableProps {
  /** Chart type */
  type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  /** Chart datasets */
  datasets?: ChartDataset[];
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
  /** X-axis configuration */
  xAxis?: ChartAxis;
  /** Y-axis configuration */
  yAxis?: ChartAxis;
  /** Legend configuration */
  legend?: ChartLegend;
  /** Whether to show tooltips */
  showTooltips?: boolean;
  /** Whether to animate chart */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether chart is responsive */
  responsive?: boolean;
  /** Background color */
  backgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Padding around chart */
  padding?: number;
  /** Margin around chart */
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Data point click handler */
  onDataPointClick?: (dataset: ChartDataset, point: ChartDataPoint) => void;
  /** Dataset click handler */
  onDatasetClick?: (dataset: ChartDataset) => void;
  /** Chart click handler */
  onChartClick?: (event: any) => void;
  /** Mouse move handler */
  onMouseMove?: (event: any) => void;
  /** Mouse leave handler */
  onMouseLeave?: () => void;
  /** Custom colors */
  colors?: string[];
  /** Custom theme */
  theme?: 'light' | 'dark';
}

/**
 * Chart component state
 */
export interface ChartState {
  /** Chart type */
  type: string;
  /** Chart datasets */
  datasets: ChartDataset[];
  /** Computed data points */
  dataPoints: ChartDataPoint[];
  /** Min and max values */
  ranges: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  /** Selected data point */
  selectedPoint?: { dataset: ChartDataset; point: ChartDataPoint };
  /** Hovered data point */
  hoveredPoint?: { dataset: ChartDataset; point: ChartDataPoint };
  /** Whether component is disabled */
  disabled: boolean;
  /** Whether component is focused */
  focused: boolean;
  /** Whether component is loading */
  loading: boolean;
  /** Animation progress */
  animationProgress: number;
  /** Whether component is animating */
  animating: boolean;
}

/**
 * Chart handlers
 */
export interface ChartHandlers {
  /** Handle data point click */
  handleDataPointClick: (dataset: ChartDataset, point: ChartDataPoint, event: React.MouseEvent) => void;
  /** Handle dataset click */
  handleDatasetClick: (dataset: ChartDataset, event: React.MouseEvent) => void;
  /** Handle chart click */
  handleChartClick: (event: React.MouseEvent) => void;
  /** Handle mouse move */
  handleMouseMove: (event: React.MouseEvent) => void;
  /** Handle mouse leave */
  handleMouseLeave: () => void;
  /** Handle data point hover */
  handleDataPointHover: (dataset: ChartDataset, point: ChartDataPoint) => void;
  /** Handle data point leave */
  handleDataPointLeave: () => void;
  /** Handle key down */
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Composable chart hook using Flutter-style mixins
 * @param props - Chart configuration
 * @returns Chart state, handlers, and computed properties
 */
export function useChart(props: UseChartProps = {}) {
  const {
    type = 'line',
    datasets: propDatasets = [],
    width = 400,
    height = 300,
    xAxis,
    yAxis,
    legend,
    showTooltips = true,
    animated = true,
    animationDuration = 1000,
    responsive = true,
    backgroundColor = '#ffffff',
    borderColor = '#e5e7eb',
    borderWidth = 1,
    padding = 20,
    margin = { top: 20, right: 20, bottom: 40, left: 40 },
    onDataPointClick,
    onDatasetClick,
    onChartClick,
    onMouseMove,
    onMouseLeave,
    colors: propColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
    theme = 'light',
    defaultFocused = false,
    focusable = true,
    focusStrategy = 'auto',
    role = 'img',
    label,
    labelledBy,
    describedBy,
    disabled = false,
    ...semanticProps
  } = props;

  // State management
  const [selectedPoint, setSelectedPoint] = useState<{dataset: ChartDataset; point: ChartDataPoint} | undefined>();
  const [hoveredPoint, setHoveredPoint] = useState<{dataset: ChartDataset; point: ChartDataPoint} | undefined>();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  const chartRef = useRef<SVGSVGElement>(null);

  // Compose mixins for chart behavior
  const focusableMixin = useFocusableMixin({
    defaultFocused,
    focusable: focusable && !disabled,
    focusStrategy
  });

  const semantic = useSemanticMixin({
    role,
    label: label || 'Chart',
    labelledBy,
    describedBy,
    ...semanticProps
  });

  // Flatten all data points
  const allDataPoints = useMemo(() => {
    const points: ChartDataPoint[] = [];
    propDatasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((point) => {
        points.push({
          ...point,
          color: point.color || propColors[datasetIndex % propColors.length] || '#000000',
          datasetIndex
        });
      });
    });
    return points;
  }, [propDatasets, propColors]);

  // Calculate data ranges
  const ranges = useMemo(() => {
    if (allDataPoints.length === 0) {
      return {
        x: { min: 0, max: 100 },
        y: { min: 0, max: 100 }
      };
    }

    const yValues = allDataPoints.map(p => typeof p.y === 'number' ? p.y : 0);
    const xValues = allDataPoints.map(p => typeof p.x === 'number' ? p.x : 0);

    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    return {
      x: {
        min: xAxis?.min ?? Math.floor(xMin - (xMax - xMin) * 0.1),
        max: xAxis?.max ?? Math.ceil(xMax + (xMax - xMin) * 0.1)
      },
      y: {
        min: yAxis?.min ?? Math.floor(yMin - (yMax - yMin) * 0.1),
        max: yAxis?.max ?? Math.ceil(yMax + (yMax - yMin) * 0.1)
      }
    };
  }, [allDataPoints, xAxis, yAxis]);

  // Animation
  useEffect(() => {
    if (animated && !animating) {
      setAnimating(true);
      setAnimationProgress(0);

      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        setAnimationProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [animated, animationDuration, propDatasets]);

  // Compose chart state
  const state = useMemo(() => ({
    type,
    datasets: propDatasets,
    dataPoints: allDataPoints,
    ranges,
    selectedPoint,
    hoveredPoint,
    disabled,
    focused: focusableMixin.focused,
    loading: false,
    animationProgress,
    animating
  }), [type, propDatasets, allDataPoints, ranges, selectedPoint, hoveredPoint, disabled, focusableMixin.focused, animationProgress, animating]);

  // Event handlers
  const handleDataPointClick = useCallback((
    dataset: ChartDataset,
    point: ChartDataPoint,
    event: React.MouseEvent
  ) => {
    if (disabled) return;

    setSelectedPoint({ dataset, point });
    onDataPointClick?.(dataset, point);
  }, [disabled, onDataPointClick]);

  const handleDatasetClick = useCallback((
    dataset: ChartDataset,
    event: React.MouseEvent
  ) => {
    if (disabled) return;

    onDatasetClick?.(dataset);
  }, [disabled, onDatasetClick]);

  const handleChartClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    setSelectedPoint(undefined);
    onChartClick?.(event);
  }, [disabled, onChartClick]);

  // handleMouseMove is defined below the `scales`/`chartDimensions` useMemo so
  // the scaled-coordinate hit-test has those values initialized when the
  // callback factory runs.

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(undefined);
    onMouseLeave?.();
  }, [onMouseLeave]);

  const handleDataPointHover = useCallback((
    dataset: ChartDataset,
    point: ChartDataPoint
  ) => {
    if (disabled) return;
    setHoveredPoint({ dataset, point });
  }, [disabled]);

  const handleDataPointLeave = useCallback(() => {
    setHoveredPoint(undefined);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!focusable || disabled) return;

    // Basic keyboard navigation for chart
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Activate selected point
        if (selectedPoint) {
          handleDataPointClick(selectedPoint.dataset, selectedPoint.point, event as any);
        }
        break;

      case 'Escape':
        // Clear selection
        setSelectedPoint(undefined);
        break;

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        // Navigate through data points (simplified)
        event.preventDefault();
        if (allDataPoints.length > 0) {
          // Match by value key (x/y/datasetIndex) instead of reference: the
          // selectedPoint.point is the original data point, while allDataPoints
          // holds spread copies augmented with color/datasetIndex, so a raw
          // reference compare would always return -1 and break arrow nav.
          const selectedDatasetIndex = selectedPoint
            ? propDatasets.indexOf(selectedPoint.dataset) : -1;
          const currentIndex = selectedPoint
            ? allDataPoints.findIndex(p =>
                p.datasetIndex === selectedDatasetIndex &&
                p.x === selectedPoint.point.x &&
                p.y === selectedPoint.point.y)
            : -1;
          let nextIndex = currentIndex;

          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            nextIndex = currentIndex < allDataPoints.length - 1 ? currentIndex + 1 : 0;
          } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : allDataPoints.length - 1;
          }

          // nextIndex is always a valid in-range index (the wrap arithmetic
          // above clamps it to 0..length-1, and the outer length>0 guard holds),
          // and the flattened point always carries a valid datasetIndex whose
          // original x/y exists in dataset.data — so the defensive bounds/dataset/
          // find-fallback guards are not needed here.
          const point = allDataPoints[nextIndex];
          const dataset = propDatasets[point.datasetIndex || 0];
          // Store the original data point (not the flattened copy) so the
          // selection matches what handleDataPointClick would record.
          const original = dataset.data.find(p => p.x === point.x && p.y === point.y);
          setSelectedPoint({ dataset, point: original! });
        }
        break;

      default:
        // Delegate to focusable mixin for standard navigation
        focusableMixin.handleKeyDown(event);
        break;
    }
  }, [focusable, disabled, selectedPoint, allDataPoints, propDatasets, handleDataPointClick, focusableMixin.handleKeyDown]);

  // Generate chart dimensions
  const chartDimensions = useMemo(() => {
    const marginTop = margin.top ?? 20;
    const marginRight = margin.right ?? 20;
    const marginBottom = margin.bottom ?? 40;
    const marginLeft = margin.left ?? 40;
    const chartWidth = width - marginLeft - marginRight - padding * 2;
    const chartHeight = height - marginTop - marginBottom - padding * 2;

    return {
      width: Math.max(0, chartWidth),
      height: Math.max(0, chartHeight),
      totalWidth: width,
      totalHeight: height
    };
  }, [width, height, margin, padding]);

  // Generate scales
  const scales = useMemo(() => {
    const { width: chartWidth, height: chartHeight } = chartDimensions;
    const { x: xRange, y: yRange } = ranges;

    return {
      x: {
        scale: chartWidth / (xRange.max - xRange.min),
        offset: -xRange.min * (chartWidth / (xRange.max - xRange.min))
      },
      y: {
        scale: -chartHeight / (yRange.max - yRange.min),
        offset: yRange.max * (chartHeight / (yRange.max - yRange.min))
      }
    };
  }, [chartDimensions, ranges]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    onMouseMove?.(event);

    // Hit-test against every data point. The scaled pixel position of each
    // point matches the coordinates Chart.tsx paints (scale + offset + margin
    // + padding), and event coords are converted to the same SVG-local space
    // via getBoundingClientRect. The nearest point by Euclidean distance wins.
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect || allDataPoints.length === 0) return;

    const mousePx = event.clientX - rect.left;
    const mousePy = event.clientY - rect.top;
    const marginLeft = margin.left ?? 40;
    const marginTop = margin.top ?? 20;

    let bestDataset: ChartDataset | undefined;
    let bestPoint: ChartDataPoint | undefined;
    let bestDist = Infinity;

    for (const dataset of propDatasets) {
      for (const point of dataset.data) {
        const xValue = typeof point.x === 'number' ? point.x : 0;
        const yValue = typeof point.y === 'number' ? point.y : 0;
        const px = scales.x.scale * xValue + scales.x.offset + marginLeft + padding;
        const py = scales.y.scale * yValue + scales.y.offset + marginTop + padding;
        const dx = px - mousePx;
        const dy = py - mousePy;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestDataset = dataset;
          bestPoint = point;
        }
      }
    }

    if (bestDataset && bestPoint) {
      setHoveredPoint({ dataset: bestDataset, point: bestPoint });
    }
  }, [disabled, onMouseMove, allDataPoints, propDatasets, scales, margin, padding]);

  // Generate semantic attributes
  const semanticAttributes = useMemo(() => ({
    ...semantic,
    'aria-label': label || 'Chart visualization',
    'aria-roledescription': 'chart',
    'data-chart-type': type,
    'data-animated': animated,
    'data-theme': theme,
    tabIndex: focusable ? 0 : -1,
    onKeyDown: handleKeyDown,
    role: role,
    ref: chartRef
  }), [semantic, label, type, animated, theme, focusable, handleKeyDown, role]);

  // Handlers object (memoized so the outer return can be referentially stable).
  const handlers = useMemo(() => ({
    handleDataPointClick,
    handleDatasetClick,
    handleChartClick,
    handleMouseMove,
    handleMouseLeave,
    handleDataPointHover,
    handleDataPointLeave,
    handleKeyDown
  }), [handleDataPointClick, handleDatasetClick, handleChartClick, handleMouseMove, handleMouseLeave, handleDataPointHover, handleDataPointLeave, handleKeyDown]);

  return useMemo(() => ({
    ...state,
    ...handlers,
    attributes: semanticAttributes,
    dimensions: chartDimensions,
    scales,
    colors: propColors
  }), [state, handlers, semanticAttributes, chartDimensions, scales, propColors]);
}