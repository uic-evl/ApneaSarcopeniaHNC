import moment from "moment";

// components
import DataPoint from "@features/lineChart/components/DataPoint";
import Tooltip from "@features/lineChart/components/Tooltip";

// constants
import {
  DEFAULT_CHART_COLOR,
  TYPES,
} from "@features/lineChart/config/constants";

export default function Lines({
  linePath,
  dataset,
  color,
  xAxisProperty,
  yAxisProperty,
  yScale,
  xScale,
  onHover,
  currentHoveringItem,
  tooltipLabelKey,
  tooltipValueKey,
  sizes,
  bgGradient,
  strokeWidth,
  hideDataPoints,
  showDataRectangle,
  margin,
  type,
}) {
  return (
    <g transform={`translate(0,0)`}>
      {bgGradient && (
        <defs>
          <linearGradient id="stages-gradient" x1="0%" y1="0%" x2="0" y2="100%">
            {bgGradient.map(({ offset, color }) => (
              <stop
                key={`${offset}-${color}`}
                offset={offset}
                stopColor={color}
                stopOpacity="1"
              ></stop>
            ))}
          </linearGradient>
        </defs>
      )}
      {type === TYPES.bar ? (
        dataset.map((item) => {
          let height = sizes.group.height - yScale(item[yAxisProperty]);

          return (
            <rect
              key={`${item[xAxisProperty]}${item[yAxisProperty]}`}
              x={xScale(item[xAxisProperty])}
              y={yScale(item[yAxisProperty])}
              height={height}
              width={xScale.bandwidth()}
              fill={color}
              onMouseOver={() => {
                onHover({
                  x: xScale(item[xAxisProperty]) + xScale.bandwidth() / 2,
                  y: yScale(item[yAxisProperty]),
                  value: item?.[tooltipValueKey],
                  label: item?.[tooltipLabelKey],
                });
              }}
            ></rect>
          );
        })
      ) : (
        <path
          d={linePath}
          stroke={
            bgGradient
              ? 'url("#stages-gradient")'
              : color || DEFAULT_CHART_COLOR
          }
          fill="none"
          strokeWidth={strokeWidth || 2}
        />
      )}
      {!hideDataPoints &&
        dataset.map((item, index) => (
          <DataPoint
            key={`${item[xAxisProperty]}${item[yAxisProperty]}`}
            index={index}
            item={item}
            y={yScale(item[yAxisProperty])}
            x={xScale(item[xAxisProperty])}
            bandWidth={xScale.bandwidth()}
            sizes={sizes}
            color={color}
            onHover={(position) =>
              onHover({
                ...position,
                value: item?.[tooltipValueKey],
                label: item?.[tooltipLabelKey],
              })
            }
            focusedItem={currentHoveringItem}
            xAxisProperty={xAxisProperty}
            yAxisProperty={yAxisProperty}
          />
        ))}
      {showDataRectangle &&
        dataset.map((item, index) => {
          const previousItem = dataset?.[index - 1];

          if (!previousItem) return null;

          const x = xScale(item[xAxisProperty]);
          const previousX = xScale(previousItem[xAxisProperty]);

          const width = x - previousX;

          const startTime = moment(previousItem[xAxisProperty], "h:mm");
          const endTime = moment(item[xAxisProperty], "h:mm");

          const durationInMilliseconds = endTime.diff(startTime);

          const durationInMinutes = moment
            .duration(durationInMilliseconds)
            .asMinutes();

          return (
            <rect
              key={`${item[xAxisProperty]}${item[yAxisProperty]}`}
              index={index}
              item={item}
              y={margin.top}
              x={xScale(previousItem[xAxisProperty])}
              width={width}
              fill="red"
              fillOpacity={0}
              height={sizes.group.height}
              onMouseOver={() =>
                onHover({
                  x: x - width / 2,
                  y: margin.top,
                  value: `${startTime.format("h:mm")} - ${endTime.format(
                    "h:mm"
                  )}`,
                  label: `${item.type} ${durationInMinutes} min`,
                })
              }
            />
          );
        })}
      <Tooltip data={currentHoveringItem} />
    </g>
  );
}
