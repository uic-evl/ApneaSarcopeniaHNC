import { useMemo } from "react";

export default function XAxisLabel(props) {
  const { index, value, bandWidth, sizes, x } = props;

  return (
    <g transform={`translate(${x},0)`}>
      <text
        transform="translate(0,0)"
        fill="#323864"
        x={bandWidth / 2}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "Segoe UI, Tahoma, Verdana, sans-serif",
          fontSize: "11px",
          width: "19px",
          color: "#636363",
          lineHeight: "14px",
          fill: "#636363",
        }}
      >
        {value}
      </text>
    </g>
  );
}
