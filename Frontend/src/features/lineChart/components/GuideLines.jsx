export default function GuideLines({
  line,
  yScale,
  yAxisLabelsWidth,
  sizes,
  margin,
}) {
  const max = yScale(line.max);
  const min = yScale(line.min);

  return (
    <g>
      {max && min && (
        <g>
          <line
            x1={yAxisLabelsWidth}
            y1={max}
            y2={max}
            x2={sizes.canvas.width - margin.right}
            stroke={line.color}
            strokeWidth={1}
            strokeDasharray="5,5"
          />
          <line
            x1={yAxisLabelsWidth}
            y1={min}
            y2={min}
            x2={sizes.canvas.width - margin.right}
            stroke={line.color}
            strokeWidth={1}
            strokeDasharray="5,5"
          />
          <rect
            x={yAxisLabelsWidth}
            y={max}
            width={sizes.canvas.width - yAxisLabelsWidth - margin.right}
            height={min - max}
            fill={line.color}
            fillOpacity={0.2}
          />
        </g>
      )}
    </g>
  );
}
