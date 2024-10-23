import * as d3 from "d3";
import tw from "tailwind-styled-components";
import { useEffect, useMemo, useRef, useState } from "react";

// config
import { LINE_DEFAULT_OPTIONS } from "@features/scatterplotChart/config/constants";

// utils
import { applyDefaults } from "@features/scatterplotChart/utils";

// components
import XAxis from "@features/scatterplotChart/components/XAxis";
import YAxis from "@features/scatterplotChart/components/YAxis";

export default function ScatterplotChart({ dataset, options, className }) {
  const {
    width,
    height,
    xAxisProperty,
    yAxisProperty,
    labelsCount,
    colors,
    xMin,
    xMax,
    yMin,
    yMax,
    padding,
  } = applyDefaults(options);

  const [currentHoveringItem, setCurrentHoveringItem] = useState(null);

  const sizes = useMemo(() => {
    return {
      canvas: { width, height },
      group: { width: width - padding * 2, height: height - padding * 2 },
    };
  }, [width, height, padding]);

  const svgViewBox = useMemo(() => {
    return [0, 0, sizes.canvas.width, sizes.canvas.height].join(" ");
  }, [sizes.canvas.height, sizes.canvas.width]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([sizes.group.height, padding]);
  }, [padding, sizes.group.height, yMax, yMin]);

  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([padding, sizes.group.width]);
  }, [padding, sizes.group.width, xMax, xMin]);

  const allShapes = dataset.map((d, i) => {
    let color = "#cb1dd1";

    if (colors[i]) {
      color = colors[i];
    }

    return (
      <circle
        key={i}
        r={5}
        cx={xScale(d?.[xAxisProperty])}
        cy={yScale(d?.[yAxisProperty])}
        opacity={1}
        stroke={color}
        fill={color}
        fillOpacity={0.2}
        strokeWidth={1}
      />
    );
  });

  return (
    <Wrapper className={className}>
      <svg viewBox={svgViewBox}>
        <line
          x1={sizes.canvas.width*.5}
          y1={0}
          x2={sizes.canvas.width*.5}
          y2={sizes.canvas.height}
          fill="transparent"
          stroke="#C0C0C0"
        />
        <line
          x1={0}
          y1={sizes.canvas.height*.5}
          x2={sizes.canvas.width}
          y2={sizes.canvas.height*.5}
          fill="transparent"
          stroke="#C0C0C0"
        />
        <YAxis
          yScale={yScale}
          labelsCount={labelsCount}
          width={sizes.canvas.width}
        />
        <XAxis
          xScale={xScale}
          labelsCount={labelsCount}
          height={sizes.canvas.height}
        />
        {allShapes}
      </svg>
    </Wrapper>
  );
}

const Wrapper = tw.div`
  relative
`;
