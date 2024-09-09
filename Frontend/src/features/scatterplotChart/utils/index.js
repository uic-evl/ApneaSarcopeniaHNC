import { LINE_DEFAULT_OPTIONS } from "@features/scatterplotChart/config/constants";

export const applyDefaults = (options = {}) => {
  const {
    width = LINE_DEFAULT_OPTIONS.canvas.width,
    height = LINE_DEFAULT_OPTIONS.canvas.height,
    xAxisProperty = LINE_DEFAULT_OPTIONS.xAxisProperty,
    yAxisProperty = LINE_DEFAULT_OPTIONS.yAxisProperty,
    labelsCount = LINE_DEFAULT_OPTIONS.labelsCount,
    colors = null,
    xMin,
    xMax,
    yMin,
    yMax,
    padding = 0,
  } = options || {};

  return {
    width,
    height,
    xAxisProperty,
    yAxisProperty,
    labelsCount,
    colors,
    xMin,
    xMax,
    yMin,
    yMax,
    padding,
  };
};
