import moment from "moment";

// constants
import { LINE_DEFAULT_OPTIONS } from "@features/lineChart/config/constants";

export const applyDefaults = (options = {}) => {
  const {
    margin = LINE_DEFAULT_OPTIONS.margin,
    width = LINE_DEFAULT_OPTIONS.canvas.width,
    height = LINE_DEFAULT_OPTIONS.canvas.height,
    xAxisProperty = LINE_DEFAULT_OPTIONS.xAxisProperty,
    yAxisProperty = LINE_DEFAULT_OPTIONS.yAxisProperty,
    padding = LINE_DEFAULT_OPTIONS.padding,
    yLabelsCount = LINE_DEFAULT_OPTIONS.yLabelsCount,
    xLabelsCount = null,
    tooltipLabelKey,
    tooltipValueKey,
    yLabelsPosition = LINE_DEFAULT_OPTIONS.yLabelsPosition,
    groups,
    colors,
    customYMin,
    customYMax,
    dateFormat,
    dateOrder,
  } = options || {};

  const {
    left = LINE_DEFAULT_OPTIONS.margin.left,
    right = LINE_DEFAULT_OPTIONS.margin.right,
    top = LINE_DEFAULT_OPTIONS.margin.top,
    bottom = LINE_DEFAULT_OPTIONS.margin.bottom,
  } = margin || {};

  return {
    margin: {
      left,
      right,
      top,
      bottom,
    },
    width,
    height,
    xAxisProperty,
    yAxisProperty,
    padding,
    yLabelsCount,
    xLabelsCount,
    tooltipLabelKey,
    tooltipValueKey,
    yLabelsPosition,
    groups,
    colors,
    customYMin,
    customYMax,
    dateFormat,
    dateOrder,
  };
};

export const combineAndSortUnique = (
  combinedData,
  property,
  dateFormat = null,
  order = "ascending"
) => {
  const uniqueDataMap = new Map();

  combinedData.forEach((item) => {
    if (!uniqueDataMap.has(item?.[property])) {
      uniqueDataMap.set(item?.[property], item);
    }
  });

  const uniqueDataArray = Array.from(uniqueDataMap.values());

  uniqueDataArray.sort((a, b) => {
    let comparison = 0;

    if (dateFormat) {
      const dateA = moment(a?.[property], dateFormat);
      const dateB = moment(b?.[property], dateFormat);

      if (dateA.isValid() && dateB.isValid()) {
        comparison = dateA - dateB;
      }
    }

    if (comparison === 0) {
      const timeA = a?.[property].split(":").map(Number);
      const timeB = b?.[property].split(":").map(Number);

      if (timeA[0] === timeB[0]) {
        comparison = timeA[1] - timeB[1];
      } else {
        comparison = timeA[0] - timeB[0];
      }
    }

    return order === "ascending" ? comparison : -comparison;
  });

  return uniqueDataArray;
};
