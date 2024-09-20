import * as d3 from "d3";
import { useMemo } from "react";

const TICK_LENGTH = 10;

export default function YAxis({ yScale, labelsCount, width }) {
  const range = yScale.range();

  const ticks = useMemo(() => {
    return yScale.ticks(labelsCount).map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  return (
    <g transform={`translate(${ 7},0)`}>
      {ticks.map(({ value, yOffset }) => (
        <g
          key={value}
          transform={`translate(0, ${yOffset})`}
          shapeRendering={"crispEdges"}
        >
          <text
            key={value}
            style={{
              fontSize: "10px",
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
