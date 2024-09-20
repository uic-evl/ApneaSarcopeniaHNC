import { useMemo } from "react";
import * as d3 from "d3";

// tick length
const TICK_LENGTH = 10;

export default function XAxis({ xScale, labelsCount, height }) {
  const range = xScale.range();

  const ticks = useMemo(() => {
    const width = range[1] - range[0];

    return xScale.ticks(labelsCount).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [xScale]);

  return (
    <g transform={`translate(0,${height*.9})`}>
      {ticks.map(({ value, xOffset }) => (
        <g
          key={value}
          transform={`translate(${xOffset}, 0)`}
          shapeRendering={"crispEdges"}
        >
          <text
            key={value}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(16px)",
              fill: "#797979",
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </g>
  );
}
