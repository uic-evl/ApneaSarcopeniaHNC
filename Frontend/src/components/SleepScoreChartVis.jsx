import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import moment from "moment";
import { dayInMs, divideIntoMonths } from "../utils";
import { sleepScoreColorScale, filterDates } from "../utils";

export default function SleepScoreChartVis(props) {
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

    //temp

    const data = filterDates(
      props.sleepData,
      props.dateRange.start,
      props.dateRange.stop,
      "date"
    );
    if (data.length < 1) return;

    // console.log(data);

    const viewWidth = width - leftMargin - rightMargin;

    const [vMin, vMax] = d3.extent(data.map((d) => d.number));
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
        : (width - leftMargin - rightMargin) /
          (1 + (dateMax - dateMin) / dayInMs); //Math.min(70, viewWidth / (data.length));
    const xCorrection = 0; //Math.max(0, (viewWidth - data.length * barWidth) / 2);

    const yScale = d3
      .scaleLinear()
      .domain([0, vMax])
      .range([2, height - topMargin - bottomMargin]);

    // console.log(dateMin, dateMax);
    const xScale = d3
      .scaleLinear()
      .domain([dateMin, dateMax])
      .range([xCorrection + leftMargin, width - rightMargin - barWidth]);

    const makeItem = (d, idx) => {
      const h = yScale(d.number);
      const entry = {
        timestamp: d.dateOfSleep,
        sleepScore: d.number,
        height: h,
        x: xScale(d.date),
        y: height - bottomMargin - h,
        color: sleepScoreColorScale(d.number),
        dateString: d.dateOfSLeep,
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
          const sum = monthlyData.reduce((acc, d) => acc + d.number, 0);
          const avg = sum / monthlyData.length;

          results.push({
            timestamp: i,
            sleepScore: avg,
            height: yScale(avg),
            x: xScale(i),
            y: height - bottomMargin - yScale(avg),
            color: sleepScoreColorScale(avg),
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
    const bars = svg.selectAll(".bars").data(items, (d) => d.date);
    bars
      .enter()
      .append("rect")
      .attr("class", "bars")
      .merge(bars)
      .attr("width", barWidth)
      .attr("y", (d) => d.y)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("rx", barWidth / 3)
      .attr("ry", barWidth / 3)
      .attr("opacity", 0.8)
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
          : formatTime(new Date(d.timestamp))
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
      .text((d) => Math.round(d.sleepScore));
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
