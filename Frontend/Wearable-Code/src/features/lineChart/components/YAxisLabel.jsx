import { useMemo } from "react";

export default function YAxisLabel(props) {
  const { index, value, labelWidth, yScale } = props;

  return (
    <g transform={`translate(0,${yScale(value)})`}>
      <text
        fill="#323864"
        x={labelWidth / 2}
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
