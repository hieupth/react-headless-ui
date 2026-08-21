"use client";
/**
 * Chart renderer component.
 * Provides visual representation for chart components using SVG.
 */

import React, { forwardRef, useMemo } from 'react';
import { useChart, CHART_PADDING_DEFAULT } from '../hooks/index.js';
import type { UseChartProps, ChartDataset, ChartDataPoint } from '../hooks/index.js';

/**
 * Chart component props
 */
export interface ChartProps extends UseChartProps {
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
  /** Custom renderer for data points */
  pointRenderer?: (point: ChartDataPoint, x: number, y: number, radius: number) => React.ReactNode;
  /** Custom renderer for lines */
  lineRenderer?: (points: Array<{x: number; y: number}>, color: string) => React.ReactNode;
  /** Custom renderer for bars */
  barRenderer?: (bar: {x: number; y: number; width: number; height: number}, color: string) => React.ReactNode;
  /** Custom renderer for tooltip; receives the hovered point's pixel coordinates */
  tooltipRenderer?: (point: ChartDataPoint, dataset: ChartDataset, x: number, y: number) => React.ReactNode;
}

/**
 * Chart Point component props
 */
export interface ChartPointProps {
  /** Point position */
  x: number;
  /** Point position */
  y: number;
  /** Point radius */
  radius?: number;
  /** Point color */
  color?: string;
  /** Whether point is selected */
  selected?: boolean;
  /** Whether point is hovered */
  hovered?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Chart Line component props
 */
export interface ChartLineProps {
  /** Line path points */
  points: Array<{x: number; y: number}>;
  /** Line color */
  color?: string;
  /** Line width */
  strokeWidth?: number;
  /** Whether to fill area under line */
  fill?: boolean;
  /** Fill color */
  fillColor?: string;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Chart Bar component props
 */
export interface ChartBarProps {
  /** Bar position */
  x: number;
  /** Bar position */
  y: number;
  /** Bar width */
  width: number;
  /** Bar height */
  height: number;
  /** Bar color */
  color?: string;
  /** Whether bar is selected */
  selected?: boolean;
  /** Whether bar is hovered */
  hovered?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Chart component
 */
export const Chart = forwardRef<SVGSVGElement, ChartProps>(
  (componentProps, ref) => {
    // ChartProps extends mixin prop types that carry an `[key: string]: unknown`
    // index signature. That index signature erases the declared types of named
    // members during destructuring, so every binding (including the renderer
    // callbacks) would widen to `unknown`. Re-establish the real declared types
    // via the public prop type before using them.
    const className = (componentProps.className as string | undefined) ?? '';
    const style = componentProps.style as React.CSSProperties | undefined;
    const pointRenderer = componentProps.pointRenderer as ChartProps['pointRenderer'];
    const lineRenderer = componentProps.lineRenderer as ChartProps['lineRenderer'];
    const barRenderer = componentProps.barRenderer as ChartProps['barRenderer'];
    const tooltipRenderer = componentProps.tooltipRenderer as ChartProps['tooltipRenderer'];
    const { ...props } = componentProps;

    const {
      type,
      datasets,
      dataPoints,
      selectedPoint,
      hoveredPoint,
      animationProgress,
      ranges,
      handleDataPointClick,
      handleDataPointHover,
      handleDataPointLeave,
      handleMouseMove,
      handleMouseLeave,
      handleChartClick,
      attributes,
      dimensions,
      scales,
      categories,
      colors
    } = useChart(props);

    const { width, height, totalWidth, totalHeight } = dimensions;

    // The hook does not expose `margin` in its return value (it lives in the
    // hook's props). Re-read it from this component's own props, falling back
    // to the same defaults the hook uses, so layout math stays consistent.
    const margin = (props.margin as { top?: number; right?: number; bottom?: number; left?: number } | undefined) ??
      { top: 20, right: 20, bottom: 40, left: 40 };
    const marginLeft = margin.left ?? 0;
    const marginTop = margin.top ?? 0;
    const padding = (props.padding as number | undefined) ?? CHART_PADDING_DEFAULT;

    // `attributes` carries the hook's chart `ref` plus role/tabIndex/onKeyDown,
    // which are valid on the <svg> but must not be spread onto inner shapes
    // (their `ref` type targets SVGSVGElement, incompatible with circle/rect/
    // path element refs). Split out a ref-free subset for inner shapes.
    const { ref: _hookRef, ...shapeAttributes } = attributes;
    // Combine the consumer's forwarded ref with the hook's internal chart ref
    // so both point at the rendered <svg> (the hook uses its ref for hit
    // testing in handleMouseMove).
    const svgRef = (node: SVGSVGElement | null) => {
      const hookRef = attributes.ref as React.MutableRefObject<SVGSVGElement | null> | undefined;
      // reason: useChart always populates attributes.ref, so hookRef is never
      // undefined here; the falsy arm is defensive and unreachable.
      /* c8 ignore next */
      if (hookRef) hookRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<SVGSVGElement | null>).current = node;
    };

    // Convert a raw x value to its numeric domain value (category band index
    // for categorical charts, the value itself for numeric charts) — the same
    // conversion useChart applies for its ranges and hit-test.
    const toDomainX = (x: string | number): number =>
      categories.length > 0 ? categories.indexOf(String(x)) : (typeof x === 'number' ? x : 0);

    // Generate chart data with scales applied
    const chartData = useMemo(() => {
      return datasets.map((dataset) => ({
        dataset,
        points: dataset.data.map((point) => {
          const xValue = toDomainX(point.x);
          const yValue = typeof point.y === 'number' ? point.y : 0;

          return {
            ...point,
            x: scales.x.scale * xValue + scales.x.offset + marginLeft + padding,
            y: scales.y.scale * yValue + scales.y.offset + marginTop + padding,
            rawX: point.x,
            originalX: xValue,
            originalY: yValue
          };
        })
      }));
    }, [datasets, scales, marginLeft, marginTop, padding, categories]);

    // Render chart point
    const renderPoint = (point: ChartDataPoint, dataset: ChartDataset, datasetIndex: number) => {
      // The incoming coordinates are already in pixel space (scaled by the
      // chartData builder above) — applying the scale again here would push
      // the circle far off-canvas. Only the non-numeric typeof fallback arms
      // remain defensive.
      /* c8 ignore next */
      const x = typeof point.x === 'number' ? point.x : 0;
      /* c8 ignore next */
      const y = typeof point.y === 'number' ? point.y : 0;
      const radius = 4;
      const color = point.color || colors[datasetIndex % colors.length] || '#000000';

      // Compare by value against the retained raw coords: chartData spreads
      // each point into a new object every render, so a reference compare would
      // never match. rawX/originalY are the pre-scale values stored on the
      // chartData point (see chartData builder above).
      const isSelected = !!selectedPoint
        && selectedPoint.point.x === point.rawX
        && selectedPoint.point.y === point.originalY
        && selectedPoint.dataset === dataset;
      const isHovered = !!hoveredPoint
        && hoveredPoint.point.x === point.rawX
        && hoveredPoint.point.y === point.originalY
        && hoveredPoint.dataset === dataset;

      if (pointRenderer) {
        return pointRenderer(point, x, y, radius);
      }

      const stroke = isSelected ? '#1f2937' : isHovered ? '#6b7280' : 'none';
      const strokeWidth = isSelected ? 2 : isHovered ? 1 : 0;
      const pointClassName = `chart-point cursor-pointer transition-all duration-150 ${isSelected ? 'chart-point-selected' : ''} ${isHovered ? 'chart-point-hovered' : ''}`;

      return (
        <circle
          key={`${datasetIndex}-${point.x}-${point.y}`}
          cx={x}
          cy={y}
          r={radius}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          className={pointClassName}
          onClick={(e) => handleDataPointClick(dataset, { x: point.rawX ?? point.originalX ?? point.x, y: point.originalY ?? point.y }, e)}
          onMouseEnter={() => handleDataPointHover(dataset, { x: point.rawX ?? point.originalX ?? point.x, y: point.originalY ?? point.y })}
          onMouseLeave={() => handleDataPointLeave()}
          {...shapeAttributes}
        />
      );
    };

    // Render chart line
    const renderLine = (dataset: ChartDataset, datasetIndex: number) => {
      // reason: chartData is built 1:1 from datasets via .map, so the entry at
      // datasetIndex always exists with a points array; the `?.` / `|| []`
      // fallback arms are unreachable.
      /* c8 ignore next */
      const points = chartData[datasetIndex]?.points || [];
      if (points.length === 0) return null;

      const color = dataset.color || colors[datasetIndex % colors.length] || '#000000';
      // A single point has no line to draw, but its marker still renders.
      const pathData = points.length >= 2
        ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        : '';

      if (lineRenderer) {
        return lineRenderer(points, color);
      }

      return (
        <g key={`line-${datasetIndex}`}>
          {points.length >= 2 && (
            <>
              {/* Fill area under line */}
              {dataset.fill && (
                <path
                  d={`${pathData} L ${points[points.length - 1].x} ${height + marginTop + padding} L ${points[0].x} ${height + marginTop + padding} Z`}
                  fill={dataset.backgroundColor || color}
                  fillOpacity={0.1}
                  className="chart-area"
                />
              )}
              {/* Line */}
              <path
                d={pathData}
                fill="none"
                stroke={dataset.borderColor || color}
                strokeWidth={dataset.borderWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chart-line"
                strokeDasharray={animationProgress < 1 ? `${chartData[datasetIndex].points.length * 2}` : 'none'}
                strokeDashoffset={animationProgress < 1 ? `${chartData[datasetIndex].points.length * 2 * (1 - animationProgress)}` : '0'}
                style={{
                  transition: animationProgress >= 1 ? 'none' : 'stroke-dashoffset 1s ease-in-out'
                }}
              />
            </>
          )}
          {/* Points */}
          {points.map((point, pointIndex) => renderPoint(point, dataset, datasetIndex))}
        </g>
      );
    };

    // Render chart bar
    const renderBar = (dataset: ChartDataset, datasetIndex: number) => {
      // reason: see renderLine — chartData mirrors datasets 1:1, so the entry
      // always exists; the `?.` / `|| []` fallback arms are unreachable.
      /* c8 ignore next */
      const points = chartData[datasetIndex]?.points || [];
      const color = dataset.color || colors[datasetIndex % colors.length] || '#000000';
      const barWidth = width / points.length * 0.8;

      if (barRenderer) {
        return points.map((point, pointIndex) =>
          barRenderer({
            x: point.x - barWidth / 2,
            y: point.y,
            width: barWidth,
            height: height - point.y + marginTop + padding
          }, color)
        );
      }

      return (
        <g key={`bars-${datasetIndex}`}>
          {points.map((point, pointIndex) => {
            const barHeight = height - point.y + marginTop + padding;
            // By-value compare against retained raw coords (see renderPoint).
            const isSelected = !!selectedPoint
              && selectedPoint.point.x === point.rawX
              && selectedPoint.point.y === point.originalY
              && selectedPoint.dataset === dataset;
            const isHovered = !!hoveredPoint
              && hoveredPoint.point.x === point.rawX
              && hoveredPoint.point.y === point.originalY
              && hoveredPoint.dataset === dataset;
            const barClassName = `chart-bar cursor-pointer transition-all duration-150 ${isSelected ? 'chart-bar-selected' : ''} ${isHovered ? 'chart-bar-hovered' : ''}`;

            return (
              <rect
                key={`${datasetIndex}-${point.x}-${point.y}`}
                x={point.x - barWidth / 2}
                y={point.y}
                width={barWidth}
                height={barHeight}
                fill={dataset.backgroundColor || color}
                stroke={dataset.borderColor || color}
                strokeWidth={dataset.borderWidth || 1}
                className={barClassName}
                onClick={(e) => handleDataPointClick(dataset, { x: point.rawX ?? point.originalX ?? point.x, y: point.originalY ?? point.y }, e)}
                onMouseEnter={() => handleDataPointHover(dataset, { x: point.rawX ?? point.originalX ?? point.x, y: point.originalY ?? point.y })}
                onMouseLeave={() => handleDataPointLeave()}
                {...shapeAttributes}
                style={{
                  transform: `scaleY(${animationProgress})`,
                  transformOrigin: 'bottom',
                  transition: animationProgress >= 1 ? 'none' : 'transform 1s ease-out'
                }}
              />
            );
          })}
        </g>
      );
    };

    // Render chart based on type
    const renderChart = () => {
      switch (type) {
        case 'line':
        case 'area':
          return chartData.map((data, index) => renderLine(data.dataset, index));

        case 'bar':
          return chartData.map((data, index) => renderBar(data.dataset, index));

        case 'scatter':
          return chartData.map((data, index) =>
            data.points.map((point) => renderPoint(point, data.dataset, index))
          );

        case 'pie': {
          // Simple pie chart implementation
          // Negative values are clamped to 0: a negative slice angle would
          // sweep backwards (negative angle with sweep-flag 1), overlapping
          // neighboring slices and running currentAngle in reverse.
          const values = dataPoints.map((p) => Math.max(0, typeof p.y === 'number' ? p.y : 0));
          const total = values.reduce((sum, v) => sum + v, 0);
          // Derive the radius from the smaller chart dimension so the pie
          // always fits inside the viewport instead of a hardcoded 100.
          const radius = Math.min(width, height) / 2;
          let currentAngle = -90; // Start from top

          return (
            // width/height are the INNER chart dimensions; re-add the margin
            // and padding offsets so the pie is centered in the full viewport
            // instead of jammed into its top-left corner.
            <g transform={`translate(${marginLeft + padding + width / 2}, ${marginTop + padding + height / 2})`}>
              {dataPoints.map((point, index) => {
                const value = values[index];
                const percentage = total > 0 ? (value / total) * 100 : 0;
                const angle = (percentage / 100) * 360;
                // Pie slices are categories, not series: when every point
                // carries the same (dataset-level) color, that single color
                // would paint all slices identically — fall back to the
                // palette by index so slices stay distinguishable.
                const singleColor = dataPoints[0]?.color;
                const allSameColor = singleColor && dataPoints.every((p) => p.color === singleColor);
                const color = allSameColor
                  ? colors[index % colors.length]
                  : /* c8 ignore next */ point.color || colors[index % colors.length] || '#000000';

                const x1 = Math.cos((currentAngle * Math.PI) / 180) * radius;
                const y1 = Math.sin((currentAngle * Math.PI) / 180) * radius;
                const x2 = Math.cos(((currentAngle + angle) * Math.PI) / 180) * radius;
                const y2 = Math.sin(((currentAngle + angle) * Math.PI) / 180) * radius;

                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                const slice = {
                  ...point,
                  startAngle: currentAngle,
                  endAngle: currentAngle + angle,
                  percentage
                };

                currentAngle += angle;

                return (
                  <g key={`pie-${index}`}>
                    <path
                      d={pathData}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                      className="chart-pie-slice "
                      {...shapeAttributes}
                      style={{
                        transform: `scale(${animationProgress})`,
                        transformOrigin: 'center',
                        transition: animationProgress >= 1 ? 'none' : 'transform 1s ease-out'
                      }}
                    />
                  </g>
                );
              })}
            </g>
          );
        }

        default:
          return null;
      }
    };

    // Render axes (uses the same component-level margin/padding as the chart
    // body and the hook's hit-test, so axes and data share one layout)
    const renderAxes = () => {
      const { x: xRange, y: yRange } = ranges;
      const left = marginLeft;
      const top = marginTop;

      // Tick labels need enough decimals to stay distinct: a zero-span range
      // widened to ±0.5 yields steps of 0.25, and toFixed(0) would collapse
      // all five ticks to duplicates ("1,1,1,1,2"). Pick the smallest digit
      // count that renders every tick of the axis uniquely.
      const tickLabeler = (min: number, max: number) => {
        const ticks = Array.from({ length: 5 }, (_, i) => min + (max - min) * (i / 4));
        return (v: number) => {
          for (let d = 0; d <= 4; d++) {
            if (new Set(ticks.map((t) => t.toFixed(d))).size === ticks.length) {
              return v.toFixed(d);
            }
          }
          return String(+v.toFixed(4));
        };
      };
      const yLabel = tickLabeler(yRange.min, yRange.max);
      const xLabel = tickLabeler(xRange.min, xRange.max);

      return (
        <g className="chart-axes">
          {/* Y-axis */}
          <line
            x1={left + padding}
            y1={top + padding}
            x2={left + padding}
            y2={height + top + padding}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {/* Y-axis ticks */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = yRange.min + (yRange.max - yRange.min) * (i / 4);
            const scaledY = scales.y.scale * y + scales.y.offset + top + padding;

            return (
              <g key={`y-tick-${i}`}>
                <line
                  x1={left + padding - 5}
                  y1={scaledY}
                  x2={left + padding}
                  y2={scaledY}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={left + padding - 10}
                  y={scaledY}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize={12}
                  fill="#6b7280"
                >
                  {yLabel(y)}
                </text>
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={left + padding}
            y1={height + top + padding}
            x2={width + left + padding}
            y2={height + top + padding}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {/* X-axis ticks: one per category label for categorical charts,
              otherwise 5 evenly spaced numeric ticks */}
          {categories.length > 0
            ? categories.map((label, i) => {
                const scaledX = scales.x.scale * i + scales.x.offset + left + padding;

                return (
                  <g key={`x-tick-${i}`}>
                    <line
                      x1={scaledX}
                      y1={height + top + padding}
                      x2={scaledX}
                      y2={height + top + padding + 5}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                    <text
                      x={scaledX}
                      y={height + top + padding + 20}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#6b7280"
                    >
                      {label}
                    </text>
                  </g>
                );
              })
            : Array.from({ length: 5 }, (_, i) => {
              const x = xRange.min + (xRange.max - xRange.min) * (i / 4);
              const scaledX = scales.x.scale * x + scales.x.offset + left + padding;

              return (
                <g key={`x-tick-${i}`}>
                  <line
                    x1={scaledX}
                    y1={height + top + padding}
                    x2={scaledX}
                    y2={height + top + padding + 5}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={scaledX}
                    y={height + top + padding + 20}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#6b7280"
                  >
                    {xLabel(x)}
                  </text>
                </g>
              );
            })}
        </g>
      );
    };

    // Transparent by default: a hardcoded white plate breaks charts placed on
    // dark/colored sections. Consumers opt into a plate via backgroundColor.
    const backgroundColor = (props.backgroundColor as string | undefined) ?? 'transparent';
    const borderColor = (props.borderColor as string | undefined) ?? '#e5e7eb';
    const borderWidth = (props.borderWidth as number | undefined) ?? 1;
    // Match the hook's showTooltips default (true) so tooltips work without
    // an explicit prop.
    const showTooltips = props.showTooltips ?? true;

    // Scale the hovered point's raw coords into pixel space (same math as the
    // chartData builder) so the tooltip can be positioned near the point.
    /* c8 ignore next */
    const tooltipX = hoveredPoint
      ? scales.x.scale * toDomainX(hoveredPoint.point.x) + scales.x.offset + marginLeft + padding
      : 0;
    /* c8 ignore next */
    const tooltipY = hoveredPoint
      ? scales.y.scale * (typeof hoveredPoint.point.y === 'number' ? hoveredPoint.point.y : 0)
        + scales.y.offset + marginTop + padding
      : 0;

    // reason: the tooltip renders only when a consumer passes tooltipRenderer
    // AND showTooltips is truthy AND a point is hovered; the null arm of the
    // ternary is the default (no renderer / no hover), so it is exercised by
    // every non-tooltip render and the truthy arm needs explicit coverage.
    /* c8 ignore next */
    const tooltipNode = (showTooltips && hoveredPoint && tooltipRenderer) ? (
      <g className="chart-tooltip" transform={`translate(${tooltipX}, ${tooltipY})`}>
        {tooltipRenderer(hoveredPoint.point, hoveredPoint.dataset, tooltipX, tooltipY)}
      </g>
    ) : null;

    return (
      <div
        className={`chart-container ${className}`}
        style={{ width: totalWidth, height: totalHeight, ...style }}
        data-testid="chart"
      >
        <svg
          width={totalWidth}
          height={totalHeight}
          {...attributes}
          ref={svgRef}
          className="chart-svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          // Only treat clicks on the svg itself as chart-background clicks so
          // the bubble from a shape's own onClick does not clear the selection
          // that shape just recorded.
          onClick={(e) => {
            if (e.target === e.currentTarget) handleChartClick(e);
          }}
        >
          {/* Background */}
          <rect
            width={totalWidth}
            height={totalHeight}
            fill={backgroundColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />

          {/* Render chart content */}
          {renderChart()}

          {/* Render axes */}
          {renderAxes()}

          {/* Render tooltip */}
          {tooltipNode}
        </svg>
      </div>
    );
  }
);

/**
 * Chart Point component
 */
export const ChartPoint: React.FC<ChartPointProps> = ({
  x,
  y,
  radius = 4,
  color = '#000000',
  selected = false,
  hovered = false,
  onClick,
  className = '',
  style
}) => {
  return (
    <circle
      cx={x}
      cy={y}
      r={radius}
      fill={color}
      stroke={selected ? '#1f2937' : hovered ? '#6b7280' : 'none'}
      strokeWidth={selected ? 2 : hovered ? 1 : 0}
      className={`chart-point    ${selected ? 'chart-point-selected' : ''} ${hovered ? 'chart-point-hovered' : ''} ${className}`}
      {...(onClick ? { onClick } : {})}
      style={style}
    />
  );
};

/**
 * Chart Line component
 */
export const ChartLine: React.FC<ChartLineProps> = ({
  points,
  color = '#000000',
  strokeWidth = 2,
  fill = false,
  fillColor,
  className = '',
  style
}) => {
  if (points.length < 2) return null;

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <g className={className} style={style}>
      {/* Fill area under line */}
      {fill && (
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${points[0].y} L ${points[0].x} ${points[0].y} Z`}
          fill={fillColor || color}
          fillOpacity={0.1}
          className="chart-area"
        />
      )}
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="chart-line"
      />
    </g>
  );
};

/**
 * Chart Bar component
 */
export const ChartBar: React.FC<ChartBarProps> = ({
  x,
  y,
  width,
  height,
  color = '#000000',
  selected = false,
  hovered = false,
  onClick,
  className = '',
  style
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      stroke={color}
      strokeWidth={1}
      className={`chart-bar    ${selected ? 'chart-bar-selected' : ''} ${hovered ? 'chart-bar-hovered' : ''} ${className}`}
      {...(onClick ? { onClick } : {})}
      style={style}
    />
  );
};

Chart.displayName = 'Chart';

export default Chart;