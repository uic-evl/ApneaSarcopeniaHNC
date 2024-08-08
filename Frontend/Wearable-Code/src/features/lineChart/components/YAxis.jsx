// components
import YAxisLabel from "@features/lineChart/components/YAxisLabel";
import Line from "@features/lineChart/components/Line";

export default function YAxis({
  margin,
  yAxisLabelsRef,
  yAxisLabels,
  yAxisLabelsWidth,
  sizes,
  yScale,
  yLabelsPosition,
}) {
  return (
    <>
      <g
        transform={`translate(${
          yLabelsPosition === "right"
            ? sizes.canvas.width - yAxisLabelsWidth
            : 0
        },0)`}
        ref={yAxisLabelsRef}
      >
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
      <g transform={`translate(0,0)`}>
        {yAxisLabels.map((value, index) => (
          <Line
            key={value}
            index={index}
            value={value}
            labelWidth={yAxisLabelsWidth}
            sizes={sizes}
            margin={margin}
            yScale={yScale}
            yLabelsPosition={yLabelsPosition}
          />
        ))}
      </g>
    </>
  );
}
