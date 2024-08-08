export const LINE_DEFAULT_OPTIONS = {
  margin: {
    top: 10,
    left: 10,
    right: 0,
    bottom: 0,
  },
  canvas: {
    width: 500,
    height: 500,
  },
  padding: 0,
  yLabelsCount: 5,
  yLabelPadding: {
    top: 0,
    left: 10,
    right: 10,
    bottom: 0,
  },
  xAxisProperty: "name",
  yAxisProperty: "value",
  yLabelsPosition: "left",
};

export const DEFAULT_CHART_COLOR = "#0e97f5";

export const TYPES = {
  bar: "bar",
  stacked: "stacked",
  line: "line",
};

export const DATE_ORDERS = Object.freeze({
  ascending: "ascending",
  descending: "descending",
});
