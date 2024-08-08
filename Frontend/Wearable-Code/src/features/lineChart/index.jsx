import * as d3 from "d3";
import tw from "tailwind-styled-components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// config
import {
  LINE_DEFAULT_OPTIONS,
  TYPES,
} from "@features/lineChart/config/constants";

// utils
import { applyDefaults, combineAndSortUnique } from "@features/lineChart/utils";

// components
import Lines from "@features/lineChart/components/Lines";
import XAxis from "@features/lineChart/components/XAxis";
import YAxis from "@features/lineChart/components/YAxis";
import GuideLines from "@features/lineChart/components/GuideLines";
import StackedTooltip from "@features/lineChart/components/StackedTooltip";

export default function LineChart({
  datasets,
  multiLine = false,
  options,
  guideLine = null,
  className,
  onItemSelect = () => {},
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
    yLabelsPosition,
    groups,
    colors,
    customYMin,
    customYMax,
    dateFormat,
    dateOrder,
  } = applyDefaults(options);

  const yAxisLabelsRef = useRef();

  const [yAxisLabelsWidth, setYAxisLabelsWidth] = useState(0);
  const [currentHoveringItem, setCurrentHoveringItem] = useState(null);
  const [currentStackedHoveringItem, setCurrentStackedHoveringItem] =
    useState(null);

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

  const combinedDatasets = useMemo(() => {
    let res = [];

    datasets.forEach(({ data, type }) => {
      if (type === TYPES.stacked) {
        res = [
          ...res,
          ...data.map((item) => {
            const yValue = Object.keys(item).reduce((accumulator, key) => {
              if (key !== xAxisProperty) {
                const value = item[key];
                return value + accumulator;
              }

              return 0;
            }, 0);

            return {
              [xAxisProperty]: item[xAxisProperty],
              [yAxisProperty]: yValue,
            };
          }),
        ];

        return;
      }

      res = [...res, ...data];
    });

    return res;
  }, [datasets]);

  const longestDataset = useMemo(() => {
    let longest = datasets[0];

    datasets.forEach((dataset) => {
      if (dataset.length > longest.length) {
        longest = dataset;
      }
    });

    return longest;
  }, [datasets]);

  const [yMin, yMax] = d3.extent(combinedDatasets, (d) => {
    const value = d[yAxisProperty];
    if (Number(value) == NaN) return value;
    return Number(value);
  });

  const yScale = useMemo(() => {
    let min = yMin;
    let max = yMax;

    if (customYMin !== undefined) {
      min = customYMin;
    }

    if (customYMax !== undefined) {
      max = customYMax;
    }

    if (guideLine) {
      if (guideLine?.max > max) {
        max = guideLine.max;
      }

      if (guideLine?.min < min) {
        min = guideLine.min;
      }
    }

    return d3
      .scaleLinear()
      .domain([min, max])
      .range([sizes.group.height, margin.top]);
  }, [
    combinedDatasets,
    margin.bottom,
    margin.top,
    sizes.canvas.height,
    yAxisProperty,
  ]);

  const xScale = useMemo(() => {
    let rangeMin = yAxisLabelsWidth + margin.left;
    let rangeMax = sizes.canvas.width - margin.right;

    if (yLabelsPosition === "right") {
      rangeMin = margin.left;
      rangeMax = sizes.canvas.width - margin.right - yAxisLabelsWidth;
    }

    return d3
      .scaleBand()
      .domain(
        combineAndSortUnique(
          combinedDatasets,
          xAxisProperty,
          dateFormat,
          dateOrder
        ).map((d) => d[xAxisProperty])
      )
      .range([rangeMin, rangeMax]);
  }, [
    combinedDatasets,
    margin.left,
    margin.right,
    sizes.canvas.width,
    xAxisProperty,
    yAxisLabelsWidth,
    yLabelsPosition,
  ]);

  const lineBuilder = useCallback(
    (curve = null) =>
      d3
        .line()
        .x((d) => xScale(d[xAxisProperty]) + xScale.bandwidth() / 2)
        .y((d) => yScale(d[yAxisProperty]))
        .curve(curve ? d3.curveCardinal.tension(curve) : d3.curveCardinal),
    [xAxisProperty, xScale, yAxisProperty, yScale]
  );

  const nonStackedDatasets = useMemo(
    () =>
      datasets.filter(({ type }) => {
        if (type === TYPES.stacked) return false;

        return true;
      }),

    [datasets]
  );
  const linePaths = useMemo(() => {
    return nonStackedDatasets.map(({ data, curve }) =>
      lineBuilder(curve)(data)
    );
  }, [datasets, lineBuilder]);

  const yAxisLabels = yScale.ticks(yLabelsCount);

  const colorScale = useMemo(() => {
    if (groups === undefined) {
      return null;
    }

    if (colors) {
      return d3.scaleOrdinal().domain(groups).range(colors);
    }

    return d3.scaleOrdinal(d3.schemeCategory10).domain(groups);
  }, [colors, groups]);

  const stackedDataset = useMemo(() => {
    let stackedDataset = null;

    datasets.forEach((dataset) => {
      const { type } = dataset;

      if (type === TYPES.stacked) {
        stackedDataset = dataset;
      }
    });

    return stackedDataset;
  }, [datasets]);

  const series = useMemo(() => {
    if (stackedDataset !== null && groups?.length) {
      const dataset = stackedDataset?.data;
      const stackSeries = d3.stack().keys(groups).order(d3.stackOrderNone);

      return stackSeries(dataset);
    }

    return null;
  }, [datasets, groups]);

  const handleHoverOnItem = (item) => {
    setCurrentStackedHoveringItem(null);
    setCurrentHoveringItem(item);
  };

  const rectangles = useMemo(() => {
    if (!series || !stackedDataset) return null;

    const accumulatedStackedDataset = stackedDataset.data.map((item) => {
      const yValue = Object.keys(item).reduce((accumulator, key) => {
        if (key !== xAxisProperty) {
          const value = item[key];
          return value + accumulator;
        }

        return 0;
      }, 0);

      return {
        [xAxisProperty]: item[xAxisProperty],
        [yAxisProperty]: yValue,
      };
    });

    const [min, max] = d3.extent(accumulatedStackedDataset, (d) => {
      const value = d[yAxisProperty];
      if (Number(value) == NaN) return value;
      return Number(value);
    });

    const unitValue = yMax / max;

    return series.map((subgroup, i) => {
      return (
        <g key={i}>
          {subgroup.map((group, j) => {
            const y = yScale(group[1] * unitValue);

            const height =
              yScale(group[0] * unitValue) - yScale(group[1] * unitValue);

            return (
              <rect
                key={j}
                x={xScale(group.data[xAxisProperty])}
                y={y}
                height={height}
                width={xScale.bandwidth()}
                fill={colorScale(subgroup.key)}
                opacity={0.9}
                onMouseOver={() => {
                  setCurrentStackedHoveringItem(group.data);
                  setCurrentHoveringItem(null);
                }}
                onClick={() => onItemSelect(group.data)}
              ></rect>
            );
          })}
        </g>
      );
    });
  }, [series, stackedDataset, yAxisLabelsWidth]);

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
          yLabelsPosition={yLabelsPosition}
        />
        <XAxis
          sizes={sizes}
          dataset={longestDataset.data}
          xAxisProperty={xAxisProperty}
          yAxisProperty={yAxisProperty}
          xScale={xScale}
          xLabelsCount={xLabelsCount}
        />
        {guideLine !== null && (
          <GuideLines
            line={guideLine}
            yScale={yScale}
            yAxisLabelsWidth={yAxisLabelsWidth}
            sizes={sizes}
            margin={margin}
          />
        )}
        <g className="rectangles">{rectangles}</g>
        {linePaths.map((linePath, index) => {
          const {
            data,
            color,
            title,
            bgGradient,
            strokeWidth,
            hideDataPoints,
            showDataRectangle,
            type,
          } = nonStackedDatasets[index];

          return (
            <Lines
              key={title}
              linePath={linePath}
              dataset={data}
              color={color}
              xAxisProperty={xAxisProperty}
              yAxisProperty={yAxisProperty}
              yScale={yScale}
              xScale={xScale}
              onHover={handleHoverOnItem}
              currentHoveringItem={currentHoveringItem}
              tooltipLabelKey={tooltipLabelKey}
              tooltipValueKey={tooltipValueKey}
              sizes={sizes}
              bgGradient={bgGradient}
              strokeWidth={strokeWidth}
              hideDataPoints={hideDataPoints}
              showDataRectangle={showDataRectangle}
              margin={margin}
              type={type}
            />
          );
        })}
        <StackedTooltip
          value={currentStackedHoveringItem}
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
