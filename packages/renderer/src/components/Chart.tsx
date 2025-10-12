/**
 * Chart renderer component.
 * Provides visual representation for chart components using SVG.
 */

import React, { forwardRef, useMemo } from 'react';
import { useChart } from '@react-ui-forge/core';
import type { UseChartProps, ChartDataset, ChartDataPoint } from '@react-ui-forge/core';

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
  /** Custom renderer for tooltip */
  tooltipRenderer?: (point: ChartDataPoint, dataset: ChartDataset) => React.ReactNode;
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
  ({
    className = '',
    style,
    pointRenderer,
    lineRenderer,
    barRenderer,
    tooltipRenderer,
    ...props
  }, ref) => {
    const {
      state,
      handlers,
      attributes,
      dimensions,
      scales,
      colors
    } = useChart(props);

    const { type, datasets, dataPoints, selectedPoint, hoveredPoint, animationProgress } = state;
    const { width, height, totalWidth, totalHeight } = dimensions;

    // Generate chart data with scales applied
    const chartData = useMemo(() => {
      return datasets.map((dataset, datasetIndex) => ({
        dataset,
        points: dataset.data.map((point) => {
          const xValue = typeof point.x === 'number' ? point.x : 0;
          const yValue = typeof point.y === 'number' ? point.y : 0;

          return {
            ...point,
            x: scales.x.scale * xValue + scales.x.offset + (dimensions.margin?.left || 0) + (props.padding || 0),
            y: scales.y.scale * yValue + scales.y.offset + (dimensions.margin?.top || 0) + (props.padding || 0),
            originalX: xValue,
            originalY: yValue
          };
        })
      }));
    }, [datasets, scales, dimensions, props.padding, props.margin]);

    // Render chart point
    const renderPoint = (point: ChartDataPoint, dataset: ChartDataset, datasetIndex: number) => {
      const x = scales.x.scale * (typeof point.x === 'number' ? point.x : 0) + scales.x.offset;
      const y = scales.y.scale * (typeof point.y === 'number' ? point.y : 0) + scales.y.offset;
      const radius = 4;
      const color = point.color || colors[datasetIndex % colors.length] || '#000000';

      const isSelected = selectedPoint?.point === point && selectedPoint?.dataset === dataset;
      const isHovered = hoveredPoint?.point === point && hoveredPoint?.dataset === dataset;

      if (pointRenderer) {
        return pointRenderer(point, x, y, radius);
      }

      return (
        <circle
          key={`${datasetIndex}-${point.x}-${point.y}`}
          cx={x}
          cy={y}
          r={radius}
          fill={color}
          stroke={isSelected ? '#1f2937' : isHovered ? '#6b7280' : 'none'}
          strokeWidth={isSelected ? 2 : isHovered ? 1 : 0}
          className={`chart-point cursor-pointer transition-all duration-150 ${isSelected ? 'chart-point-selected' : ''} ${isHovered ? 'chart-point-hovered' : ''}`}
          {...attributes}
        />
      );
    };

    // Render chart line
    const renderLine = (dataset: ChartDataset, datasetIndex: number) => {
      const points = chartData[datasetIndex]?.points || [];
      if (points.length < 2) return null;

      const color = dataset.color || colors[datasetIndex % colors.length] || '#000000';
      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

      if (lineRenderer) {
        return lineRenderer(points, color);
      }

      return (
        <g key={`line-${datasetIndex}`}>
          {/* Fill area under line */}
          {dataset.fill && (
            <path
              d={`${pathData} L ${points[points.length - 1].x} ${dimensions.height + (dimensions.margin?.top || 0) + (props.padding || 0)} L ${points[0].x} ${dimensions.height + (dimensions.margin?.top || 0) + (props.padding || 0)} Z`}
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
          {/* Points */}
          {points.map((point, pointIndex) => renderPoint(point, dataset, datasetIndex))}
        </g>
      );
    };

    // Render chart bar
    const renderBar = (dataset: ChartDataset, datasetIndex: number) => {
      const points = chartData[datasetIndex]?.points || [];
      const color = dataset.color || colors[datasetIndex % colors.length] || '#000000';
      const barWidth = width / points.length * 0.8;
      const barSpacing = width / points.length * 0.2;

      if (barRenderer) {
        return points.map((point, pointIndex) =>
          barRenderer({
            x: point.x - barWidth / 2,
            y: point.y,
            width: barWidth,
            height: dimensions.height - point.y + (dimensions.margin?.top || 0) + (props.padding || 0)
          }, color)
        );
      }

      return (
        <g key={`bars-${datasetIndex}`}>
          {points.map((point, pointIndex) => {
            const barHeight = dimensions.height - point.y + (dimensions.margin?.top || 0) + (props.padding || 0);
            const isSelected = selectedPoint?.point === point && selectedPoint?.dataset === dataset;
            const isHovered = hoveredPoint?.point === point && hoveredPoint?.dataset === dataset;

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
                className={`chart-bar cursor-pointer transition-all duration-150 ${isSelected ? 'chart-bar-selected' : ''} ${isHovered ? 'chart-bar-hovered' : ''}`}
                {...attributes}
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

        case 'pie':
          // Simple pie chart implementation
          const total = dataPoints.reduce((sum, p) => sum + (typeof p.y === 'number' ? p.y : 0), 0);
          let currentAngle = -90; // Start from top

          return (
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              {dataPoints.map((point, index) => {
                const value = typeof point.y === 'number' ? point.y : 0;
                const percentage = total > 0 ? (value / total) * 100 : 0;
                const angle = (percentage / 100) * 360;
                const color = point.color || colors[index % colors.length] || '#000000';

                const x1 = Math.cos((currentAngle * Math.PI) / 180) * 100;
                const y1 = Math.sin((currentAngle * Math.PI) / 180) * 100;
                const x2 = Math.cos(((currentAngle + angle) * Math.PI) / 180) * 100;
                const y2 = Math.sin(((currentAngle + angle) * Math.PI) / 180) * 100;

                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

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
                      className="chart-pie-slice cursor-pointer"
                      {...attributes}
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

        default:
          return null;
      }
    };

    // Render axes
    const renderAxes = () => {
      const { x: xRange, y: yRange } = state.ranges;
      const margin = props.margin || { top: 20, right: 20, bottom: 40, left: 40 };
      const padding = props.padding || 20;

      return (
        <g className="chart-axes">
          {/* Y-axis */}
          <line
            x1={margin.left + padding}
            y1={margin.top + padding}
            x2={margin.left + padding}
            y2={height + margin.top + padding}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {/* Y-axis ticks */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = yRange.min + (yRange.max - yRange.min) * (i / 4);
            const scaledY = scales.y.scale * y + scales.y.offset + margin.top + padding;

            return (
              <g key={`y-tick-${i}`}>
                <line
                  x1={margin.left + padding - 5}
                  y1={scaledY}
                  x2={margin.left + padding}
                  y2={scaledY}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={margin.left + padding - 10}
                  y={scaledY}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize={12}
                  fill="#6b7280"
                >
                  {y.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* X-axis */}
          <line
            x1={margin.left + padding}
            y1={height + margin.top + padding}
            x2={width + margin.left + padding}
            y2={height + margin.top + padding}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {/* X-axis ticks */}
          {Array.from({ length: 5 }, (_, i) => {
            const x = xRange.min + (xRange.max - xRange.min) * (i / 4);
            const scaledX = scales.x.scale * x + scales.x.offset + margin.left + padding;

            return (
              <g key={`x-tick-${i}`}>
                <line
                  x1={scaledX}
                  y1={height + margin.top + padding}
                  x2={scaledX}
                  y2={height + margin.top + padding + 5}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={scaledX}
                  y={height + margin.top + padding + 20}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#6b7280"
                >
                  {x.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>
      );
    };

    return (
      <div
        className={`chart-container ${className}`}
        style={{ width: totalWidth, height: totalHeight, ...style }}
        data-testid="chart"
      >
        <svg
          ref={ref}
          width={totalWidth}
          height={totalHeight}
          {...attributes}
          className="chart-svg"
        >
          {/* Background */}
          <rect
            width={totalWidth}
            height={totalHeight}
            fill={props.backgroundColor || '#ffffff'}
            stroke={props.borderColor || '#e5e7eb'}
            strokeWidth={props.borderWidth || 1}
          />

          {/* Render chart content */}
          {renderChart()}

          {/* Render axes */}
          {renderAxes()}

          {/* Render tooltip */}
          {props.showTooltips && hoveredPoint && tooltipRenderer && (
            <g className="chart-tooltip">
              {tooltipRenderer(hoveredPoint.point, hoveredPoint.dataset)}
            </g>
          )}
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
      className={`chart-point cursor-pointer transition-all duration-150 ${selected ? 'chart-point-selected' : ''} ${hovered ? 'chart-point-hovered' : ''} ${className}`}
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
      className={`chart-bar cursor-pointer transition-all duration-150 ${selected ? 'chart-bar-selected' : ''} ${hovered ? 'chart-bar-hovered' : ''} ${className}`}
      {...(onClick ? { onClick } : {})}
      style={style}
    />
  );
};

Chart.displayName = 'Chart';

export default Chart;