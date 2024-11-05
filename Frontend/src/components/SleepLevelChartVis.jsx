import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { dayInMs } from "../utils";
import { filterDates } from "../utils";

const quarterLabels = ["1st Month", "2nd Month", "3rd Month"];

const colorMap = {
  rem: "#b3cde3",
  light: "#8c96c6",
  deep: "#88419d",
  wake: "#fdbe85",
};
const orderedSleepLevels = ["deep", "light", "rem", "wake"];
export default function SleepLevelChartVis(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 4;
  const rightMargin = 4;
  const topMargin = 4;
  const bottomMargin = 14;

  useEffect(() => {
    if (
      props.sleepData === null ||
      svg === undefined ||
      props.dateRange === undefined
    ) {
      return;
    }
    const data = filterDates(
      props.sleepData,
      props.dateRange.start,
      props.dateRange.stop,
      "date"
    );

    if (data.length < 1) return;

    // console.log("level data");
    // console.log(data);

    const viewWidth = width - leftMargin - rightMargin;
    const [vMin, vMax] = d3.extent(data.map((d) => d.timeInBed));
    const [dateMin, dateMax] =
      props.datePicker === "quarter"
        ? [0, 2]
        : [props.dateRange.start, props.dateRange.stop]; //d3.extent(data.map(d => d.date));
    const barWidth =
      props.datePicker === "quarter"
        ? (width - leftMargin - rightMargin) / (1.5 * 3)
        : (width - leftMargin - rightMargin) /
          (1 + (dateMax - dateMin) / dayInMs); //Math.min(70, viewWidth / (data.length));
    const xCorrection = 0; //Math.max(0, (viewWidth - data.length * barWidth) / 2);

    const yScale = d3
      .scaleLinear()
      .domain([0, vMax])
      .range([2, height - topMargin - bottomMargin]);

    const xScale = d3
      .scaleLinear()
      .domain([dateMin, dateMax])
      .range([xCorrection + leftMargin, width - rightMargin - barWidth]);

    const items = [];
    if (props.datePicker !== "quarter") {
      for (const day of data) {
        if (!day.isMainSleep) {
          continue;
        }
        //   console.log(day);
        const subEntry = {
          date: day.date,
          x: xScale(day.date),
          dateString: day.dateOfSleep,
        };
        let currY = height - bottomMargin;
        for (const level of orderedSleepLevels) {
          const entry = Object.assign(
            {
              level: level,
              color: colorMap[level] ? colorMap[level] : "black",
            },
            subEntry
          );
          const minutes = day.levels.summary[level]?.minutes;
          const h = yScale(minutes);
          entry.height = h;
          currY = currY - h;
          entry.y = currY;
          entry.minutes = minutes;
          items.push(entry);
        }
      }
    } else {
      const divideIntoMonths = (start, stop) =>
        Array.from({ length: 3 }, (_, i) => ({
          start: start + i * ((stop - start) / 3),
          stop: i === 2 ? stop : start + (i + 1) * ((stop - start) / 3),
        }));

      const quarters = divideIntoMonths(
        props.dateRange.start,
        props.dateRange.stop
      );

      quarters.forEach(({ start, stop }, i) => {
        // Filter data for the current month
        const monthlyData = data.filter(
          (day) => day.date >= start && day.date < stop && day.isMainSleep
        );

        // Initialize a structure to hold totals and counts for averaging
        const sleepTotals = {};
        const sleepCounts = {};

        // Aggregate sleep data
        monthlyData.forEach((day) => {
          for (const level of orderedSleepLevels) {
            const minutes = day.levels.summary[level]?.minutes || 0;
            sleepTotals[level] = (sleepTotals[level] || 0) + minutes;
            sleepCounts[level] = (sleepCounts[level] || 0) + 1;
          }
        });

        let currY = height - bottomMargin;
        // Calculate averages and create entries
        for (const level of orderedSleepLevels) {
          const averageMinutes =
            sleepCounts[level] > 0
              ? sleepTotals[level] / sleepCounts[level]
              : 0;

          const entry = {
            date: i,
            level: level,
            minutes: averageMinutes,
            x: xScale(i),
            color: colorMap[level] || "black",
          };

          const h = yScale(averageMinutes);
          entry.height = h;
          currY = currY - h;
          entry.y = currY;

          items.push(entry);
        }
      });
    }

    console.log(items);
    const bars = svg
      .selectAll(".sleepBars")
      .data(items, (d) => d.date + d.level);
    bars
      .enter()
      .append("rect")
      .attr("class", "sleepBars")
      .merge(bars)
      .attr("width", barWidth)
      .attr("y", (d) => d.y)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("rx", barWidth / 6)
      .attr("ry", barWidth / 6)
      .attr("opacity", 0.8)
      .transition(100)
      .attr("x", (d) => d.x)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.color);

    bars.exit().remove();

    const formatTime = d3.timeFormat("%m/%d");
    const timeLabels = svg.selectAll(".sleepTimeLabel").data(
      items.filter((d) => d.level === "deep"),
      (d) => d.date + d.level
    );
    timeLabels
      .enter()
      .append("text")
      .attr("class", "sleepTimeLabel")
      .merge(timeLabels)
      .attr("x", (d) => d.x + barWidth / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("y", height - bottomMargin / 2)
      .attr("font-size", 8)
      .text((d) =>
        props.datePicker === "quarter"
          ? quarterLabels[d.date]
          : formatTime(new Date(d.dateString))
      );
    timeLabels.exit().remove();

    const annotationSize = Math.min(18, barWidth / 3);
    function getAnnotationY(d) {
      let tempY = d.y + d.height / 2;
      return tempY;
    }

    const valueLabels = svg
      .selectAll(".valueLabel")
      .data(items, (d) => d.date + d.level);
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
      .attr("font-size", (d) => Math.min(d.height, annotationSize))
      .text((d) => (d.height > 8 ? Math.round(d.minutes) : ""));
    valueLabels.exit().remove();

    svg.selectAll("text").raise();
  }, [svg, props.sleepData, props.dateRange, props.datePicker]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "90%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
