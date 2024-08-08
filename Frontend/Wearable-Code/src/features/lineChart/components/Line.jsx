import { useMemo } from "react";

export default function Line({
  labelWidth,
  sizes,
  index,
  margin,
  yScale,
  value,
  yLabelsPosition,
}) {
  const y = yScale(value);

  return (
    <g>
      <line
        x1={yLabelsPosition === "left" ? labelWidth : margin.left}
        y1={y}
        x2={
          sizes.canvas.width -
          (yLabelsPosition === "left" ? margin.right : labelWidth)
        }
        y2={y}
        fill="transparent"
        stroke="#C0C0C0"
      />
    </g>
  );
}
