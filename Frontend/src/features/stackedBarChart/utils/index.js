import { LINE_DEFAULT_OPTIONS } from "@features/stackedBarChart/config/constants";

export const applyDefaults = (options = {}) => {
  const {
    margin = LINE_DEFAULT_OPTIONS.margin,
    width = LINE_DEFAULT_OPTIONS.canvas.width,
    height = LINE_DEFAULT_OPTIONS.canvas.height,
    xAxisProperty = LINE_DEFAULT_OPTIONS.xAxisProperty,
    padding = LINE_DEFAULT_OPTIONS.padding,
    yLabelsCount = LINE_DEFAULT_OPTIONS.yLabelsCount,
    xLabelsCount = 10,
    groups = [],
    colors = null,
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
    padding,
    yLabelsCount,
    xLabelsCount,
    groups,
    colors,
  };
};
