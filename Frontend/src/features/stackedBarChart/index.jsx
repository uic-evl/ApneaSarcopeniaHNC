import * as d3 from "d3";
import tw from "tailwind-styled-components";
import { useEffect, useMemo, useRef, useState } from "react";

// config
import { LINE_DEFAULT_OPTIONS } from "@features/stackedBarChart/config/constants";

// utils
import { applyDefaults } from "@features/stackedBarChart/utils";

// components
import XAxis from "@features/stackedBarChart/components/XAxis";
import YAxis from "@features/stackedBarChart/components/YAxis";
import Tooltip from "@features/stackedBarChart/components/Tooltip";

export default function StackedBarChart({
  dataset,
  options,
  className,
  onItemSelect,
}) {
  const {
    margin,
    width,
    height,
    xAxisProperty,
    yAxisProperty,
    padding,
    barWidth,
    yLabelsCount,
    xLabelsCount,
    yAxisShadowProperty,
    tooltipLabelKey,
    tooltipValueKey,
    groups,
    colors,
  } = applyDefaults(options);

  const yAxisLabelsRef = useRef();

  const [yAxisLabelsWidth, setYAxisLabelsWidth] = useState(0);
  const [currentHoveringItem, setCurrentHoveringItem] = useState(null);

  useEffect(() => {
    if (yAxisLabelsRef.current) {
      const { width } = yAxisLabelsRef.current.getBoundingClientRect();
      setYAxisLabelsWidth(
        width +
          LINE_DEFAULT_OPTIONS.yLabelPadding.left +
          LINE_DEFAULT_OPTIONS.yLabelPadding.right
      );
    }
  }, []);

  const sizes = useMemo(() => {
    return {
      canvas: { width, height },
      group: {
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      },
    };
  }, [width, height, margin]);

  const svgViewBox = useMemo(() => {
    return [0, 0, sizes.canvas.width, sizes.canvas.height].join(" ");
  }, [sizes.canvas.height, sizes.canvas.width]);

  const yScale = useMemo(() => {
    const [yMin, yMax] = d3.extent(dataset, (d) =>
      Object.keys(d).reduce((accumulator, key) => {
        if (key !== xAxisProperty) {
          const value = d[key];
          return value + accumulator;
        }

        return 0;
      }, 0)
    );

    return d3
      .scaleLinear()
      .domain([0, yMax])
      .range([sizes.canvas.height - 23 - margin.bottom, margin.top]);
  }, [dataset, margin.bottom, margin.top, sizes.canvas.height, xAxisProperty]);

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(dataset.map((d) => d[xAxisProperty]))
      .range([
        yAxisLabelsWidth + margin.left,
        sizes.canvas.width - margin.right,
      ]);
  }, [
    dataset,
    margin.left,
    margin.right,
    sizes.canvas.width,
    xAxisProperty,
    yAxisLabelsWidth,
  ]);

  const stackSeries = d3.stack().keys(groups).order(d3.stackOrderNone);
  const series = stackSeries(dataset);

  const yAxisLabels = yScale.ticks(yLabelsCount);

  const colorScale = useMemo(() => {
    if (colors) {
      return d3.scaleOrdinal().domain(groups).range(colors);
    }

    return d3
      .scaleOrdinal(d3.schemeCategory10) // Use a default color scheme
      .domain(groups);
  }, [colors, groups]);

  const rectangles = series.map((subgroup, i) => {
    return (
      <g key={i}>
        {subgroup.map((group, j) => {
          return (
            <rect
              key={j}
              x={xScale(group.data[xAxisProperty])}
              y={yScale(group[1])}
              height={yScale(group[0]) - yScale(group[1])}
              width={xScale.bandwidth()}
              fill={colorScale(subgroup.key)}
              opacity={0.9}
              onMouseOver={() => setCurrentHoveringItem(group.data)}
              onClick={() => onItemSelect(group.data)}
            ></rect>
          );
        })}
      </g>
    );
  });

  return (
    <Wrapper className={className}>
      <svg viewBox={svgViewBox}>
        <YAxis
          margin={margin}
          yAxisLabelsRef={yAxisLabelsRef}
          yAxisLabels={yAxisLabels}
          yAxisLabelsWidth={yAxisLabelsWidth}
          yScale={yScale}
          sizes={sizes}
        />
        <XAxis
          sizes={sizes}
          dataset={dataset}
          xAxisProperty={xAxisProperty}
          yAxisProperty={yAxisProperty}
          xScale={xScale}
          xLabelsCount={xLabelsCount}
        />
        <g>{rectangles}</g>
        <Tooltip
          value={currentHoveringItem}
          sizes={sizes}
          xScale={xScale}
          xAxisProperty={xAxisProperty}
          bandwidth={xScale.bandwidth()}
        />
      </svg>
    </Wrapper>
  );
}

const Wrapper = tw.div`
  relative
`;
