import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { filterDates, dayInMs, divideIntoMonths } from "@src/utils";

function makeScale(targetMinutes) {
  return d3.scaleLinear().domain([0, targetMinutes]).range(["white", "green"]);
}

const activityColorScales = {
  totalActivity: makeScale(120),
  minutesFairlyActive: makeScale(60),
  minutesLightlyActive: makeScale(45),
  minutesVeryActive: makeScale(15),
  activityCalories: makeScale(1000),
};
export default function ActivityChartVis(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 4;
  const rightMargin = 4;
  const topMargin = 4;
  const bottomMargin = 14;

  const activityLevels = [
    "minutesFairlyActive",
    "minutesLightlyActive",
    "minutesVeryActive",
  ];

  const formattedData = useMemo(() => {
    if (props.activityData === null) {
      return;
    }
    const timeDict = {};
    for (let key of Object.keys(props.activityData)) {
      let vals = props.activityData[key];
      if (vals === undefined) {
        console.log("missing", key, "from activity");
        continue;
      }
      for (const val of vals) {
        const date = val.date;
        const entry = timeDict[date] ? timeDict[date] : {};
        entry[key] = val;
        timeDict[date] = entry;
      }
    }
    let data = [];
    for (const [key, val] of Object.entries(timeDict)) {
      const ref = val.minutesFairlyActive;
      const entry = {
        date: ref.date,
        dateTime: ref.dateTime,
        formattedDate: ref.formattedDate,
      };
      let totalActivity = 0;
      for (const [key2, val2] of Object.entries(val)) {
        entry[key2] = val2.number;
        if (activityLevels.indexOf(key2) >= 0) totalActivity += val2.number;
      }
      entry["totalActivity"] = totalActivity;
      data.push(entry);
    }
    return data;
  }, [props.activityData]);

  useEffect(() => {
    // console.log(props.plotVar);
    if (
      formattedData === undefined ||
      formattedData === null ||
      svg === undefined ||
      props.dateRange === undefined
    ) {
      return;
    }
    const plotVar = props.plotVar ? props.plotVar : "totalActivity";
    let data = formattedData.map((d) => {
      return { number: d[plotVar], ...d };
    });

    data = filterDates(
      data,
      props.dateRange.start,
      props.dateRange.stop,
      "date"
    );
    if (data.length < 1) return;

    const viewWidth = width - leftMargin - rightMargin;
    const viewHeight = height - topMargin - bottomMargin;
    const [dateMin, dateMax] =
      props.datePicker === "quarter"
        ? [0, 5]
        : props.datePicker === "year"
        ? [0, 12]
        : [props.dateRange.start, props.dateRange.stop]; //d3.extent(data.map(d => d.date));
    const barWidth =
      props.datePicker === "quarter"
        ? (width - leftMargin - rightMargin) / (1.5 * 5)
        : props.datePicker === "year"
        ? (width - leftMargin - rightMargin) / (1.5 * 12)
        : viewWidth / (1 + (dateMax - dateMin) / dayInMs); //Math.min(70, viewWidth / (data.length));
    const xCorrection = 0; //Math.max(0, (viewWidth - data.length * barWidth) / 2);

    const [vMin, vMax] = d3.extent(
      data.map((d) =>
        plotVar == "activityCalories" ? d.activityCalories : d.totalActivity
      )
    );

    const yScale = d3
      .scaleLinear()
      .domain([0, vMax])
      .range([2, height - topMargin - bottomMargin]);

    const xScale = d3
      .scaleLinear()
      .domain([dateMin, dateMax])
      .range([xCorrection + leftMargin, width - rightMargin - barWidth]);

    const colorScale = makeScale(vMax);

    svg.selectAll(".legends").remove();

    const colorDomains = colorScale.domain();

    // Define the gradient
    const gradient = svg
      .append("defs")
      .attr("class", "legends")
      .append("linearGradient")
      .attr("id", "color-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    // Set gradient stops
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(colorDomains[0])); // White

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(colorDomains[1])); // Green

    // Draw the rectangle using the gradient
    svg
      .append("rect")
      .attr("class", "legends")
      .attr("x", viewWidth - rightMargin - 120)
      .attr("y", 0)
      .attr("width", 100)
      .attr("height", 10)
      .style("fill", "url(#color-gradient)");

    // Add labels for the legend
    svg
      .append("text")
      .attr("class", "legends")
      .attr("x", viewWidth - rightMargin - 130)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .text("0");

    svg
      .append("text")
      .attr("class", "legends")
      .attr("x", viewWidth - rightMargin - 18)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text(colorDomains[1]);

    const makeItem = (d, idx) => {
      const h = yScale(d.number);
      const entry = {
        timestamp: d.date,
        activity: d.number,
        height: h,
        x: xScale(d.date),
        y: height - bottomMargin - h,
        color: colorScale(d.number),
        dateString: d.dateTime,
      };
      return entry;
    };

    const getMonthlyData = (data, numMonths) => {
      const results = [];

      // Divide the date range into single months
      const months = divideIntoMonths(
        props.dateRange.start,
        props.dateRange.stop
      );

      // Process each month
      months.forEach(({ start, stop, month }, i) => {
        const monthlyData = data.filter(
          (d) => d.date >= start && d.date <= stop
        );

        if (monthlyData.length > 0) {
          const totalSteps = monthlyData.reduce((acc, d) => acc + d.number, 0);
          const avg = totalSteps / monthlyData.length;

          results.push({
            timestamp: i,
            activity: avg,
            x: xScale(i),
            y: height - bottomMargin - yScale(avg),
            height: yScale(avg),
            color: colorScale(avg),
            month,
          });
        }
      });

      return results;
    };

    const items =
      props.datePicker === "quarter"
        ? getMonthlyData(data, 3)
        : props.datePicker === "year"
        ? getMonthlyData(data, 12)
        : data.map(makeItem);

    // console.log(items);
    const bars = svg.selectAll(".bars").data(items, (d) => d.timestamp);
    bars
      .enter()
      .append("rect")
      .attr("class", "bars")
      .merge(bars)
      .attr("width", barWidth)
      .attr("y", (d) => d.y)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("rx", barWidth / 3)
      .attr("ry", barWidth / 3)
      .attr("opacity", 0.7)
      .transition(100)
      .attr("x", (d) => d.x)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.color);

    bars.exit().remove();

    const formatTime = d3.timeFormat("%m/%d");
    const timeLabels = svg
      .selectAll(".timeLabel")
      .data(items, (d) => d.timestamp);
    timeLabels
      .enter()
      .append("text")
      .attr("class", "timeLabel")
      .merge(timeLabels)
      .attr("x", (d) => d.x + barWidth / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("y", height - bottomMargin / 2)
      .attr("font-size", 8)
      .text((d) =>
        props.datePicker === "quarter" || props.datePicker === "year"
          ? d.month
          : formatTime(new Date(d.dateString))
      );
    timeLabels.exit().remove();

    const annotationSize = Math.min(18, barWidth / 3);
    function getAnnotationY(d) {
      let tempY = d.y + annotationSize;
      if (tempY > height - 2 * bottomMargin - annotationSize) {
        tempY = d.y - 1 - annotationSize / 2;
      }
      return tempY;
    }
    const valueLabels = svg
      .selectAll(".valueLabel")
      .data(items, (d) => d.timestamp);
    valueLabels
      .enter()
      .append("text")
      .attr("class", "valueLabel")
      .merge(valueLabels)
      .transition(100)
      .attr("x", (d) => d.x + barWidth / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("y", getAnnotationY)
      .attr("font-size", annotationSize)
      .text((d) => Math.round(d.activity));
    valueLabels.exit().remove();
  }, [svg, formattedData, props.dateRange, props.plotVar, props.datePicker]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "90%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
