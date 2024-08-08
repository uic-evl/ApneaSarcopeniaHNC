import { useMemo } from "react";

// components
import XAxisLabel from "@features/stackedBarChart/components/XAxisLabel";

// utils
import { filterByCount } from "@src/utils";

export default function XAxis({
  sizes,
  dataset,
  xAxisProperty,
  yAxisProperty,
  xScale,
  xLabelsCount,
}) {
  const labels = useMemo(() => {
    let data = dataset;

    if (xLabelsCount) {
      data = filterByCount(dataset, xLabelsCount);
    }

    return data;
  }, [xLabelsCount, dataset]);

  return (
    <g transform={`translate(0,${sizes.canvas.height - 10})`}>
      {labels.map((item, index) => (
        <XAxisLabel
          key={`${item[xAxisProperty]}${item[yAxisProperty]}`}
          value={item[xAxisProperty]}
          x={xScale(item[xAxisProperty])}
          index={index}
          bandWidth={xScale.bandwidth()}
          sizes={sizes}
        />
      ))}
    </g>
  );
}
