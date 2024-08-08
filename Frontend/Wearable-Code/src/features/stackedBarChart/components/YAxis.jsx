// components
import YAxisLabel from "@features/stackedBarChart/components/YAxisLabel";

export default function YAxis({
  margin,
  yAxisLabelsRef,
  yAxisLabels,
  yAxisLabelsWidth,
  sizes,
  yScale,
}) {
  return (
    <>
      <g transform={`translate(0,0)`} ref={yAxisLabelsRef}>
        {[...yAxisLabels].reverse().map((value, index) => {
          return (
            <YAxisLabel
              key={value}
              index={index}
              value={value}
              labelWidth={yAxisLabelsWidth}
              yScale={yScale}
            />
          );
        })}
      </g>
    </>
  );
}
