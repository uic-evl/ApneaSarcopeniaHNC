import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { filterDates, dayInMs } from "@src/utils";

export default function StepsChartVis(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 4;
  const rightMargin = 4;
  const topMargin = 4;
  const bottomMargin = 14;

  const colorScale = useMemo(() => {
    const scale1 = d3
      .scaleLinear()
      .domain([0.5 * props.stepsGoal, props.stepsGoal])
      .range(["white", "blue"]);

    const scale2 = d3
      .scaleLinear()
      .domain([props.stepsGoal, 1.5 * props.stepsGoal])
      .range(["white", "green"]);
    return (v) => (v < props.stepsGoal ? scale1(v) : scale2(v));
  }, [props.stepsGoal]);

  useEffect(() => {
    if (
      props.stepsData === null ||
      svg === undefined ||
      props.dateRange === undefined
    ) {
      return;
    }

    let data = filterDates(
      props.stepsData,
      props.dateRange.start,
      props.dateRange.stop
    );

    const viewWidth = width - leftMargin - rightMargin;
    const viewHeight = height - topMargin - bottomMargin;
    const [dateMin, dateMax] = [props.dateRange.start, props.dateRange.stop]; //d3.extent(data.map(d => d.date));
    const barWidth = viewWidth / (1 + (dateMax - dateMin) / dayInMs); //Math.min(70, viewWidth / (data.length));
    const xCorrection = 0; //Math.max(0, (viewWidth - data.length * barWidth) / 2);

    const [vMin, vMax] = d3.extent(data.map((d) => d.number));

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(vMax, 1.1 * props.stepsGoal)])
      .range([2, height - topMargin - bottomMargin]);

    const xScale = d3
      .scaleLinear()
      .domain([dateMin, dateMax])
      .range([xCorrection + leftMargin, width - rightMargin - barWidth]);

    const makeItem = (d, idx) => {
      const h = yScale(d.number);
      const entry = {
        timestamp: d.dateTime,
        steps: d.number,
        height: h,
        x: xScale(d.date),
        y: height - bottomMargin - h,
        color: colorScale(d.number),
      };
      return entry;
    };

    svg.selectAll(".legends").remove();

    // Define gradients
    const defs = svg.append("defs").attr("class", "legends");

    const gradient1 = defs
      .append("linearGradient")
      .attr("id", "gradient1")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");
    gradient1.append("stop").attr("offset", "0%").attr("stop-color", "white");
    gradient1.append("stop").attr("offset", "100%").attr("stop-color", "blue");

    const gradient2 = defs
      .append("linearGradient")
      .attr("id", "gradient2")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");
    gradient2.append("stop").attr("offset", "0%").attr("stop-color", "white");
    gradient2.append("stop").attr("offset", "100%").attr("stop-color", "green");

    // Draw legend rectangles
    svg
      .append("rect")
      .attr("class", "legends")
      .attr("x", viewWidth - 130)
      .attr("y", 0)
      .attr("width", 50)
      .attr("height", 10)
      .style("fill", "url(#gradient1)");

    svg
      .append("rect")
      .attr("class", "legends")
      .attr("x", viewWidth - 80)
      .attr("y", 0)
      .attr("width", 50)
      .attr("height", 10)
      .style("fill", "url(#gradient2)");

    // Add labels
    svg
      .append("text")
      .attr("class", "legends")
      .attr("x", viewWidth - 145)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`${0.5 * props.stepsGoal}`);

    svg
      .append("text")
      .attr("class", "legends")
      .attr("x", viewWidth - 80)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`${props.stepsGoal}`);

    svg
      .append("text")
      .attr("class", "legends")
      .attr("x", viewWidth - 10)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`${1.5 * props.stepsGoal}`);

    const items = data.map(makeItem);
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
      .transition(1000)
      .attr("x", (d) => d.x)
      .attr("height", (d) => d.height)
      .attr("opacity", 0.8)
      .attr("fill", (d) => d.color);

    svg.select(".goalLine").remove();
    const yval = height - bottomMargin - yScale(props.stepsGoal);
    svg
      .append("path")
      .attr("class", ".goalLine")
      .attr(
        "d",
        d3.line()([
          [xScale(dateMin), yval],
          [xScale(dateMax), yval],
        ])
      )
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("opacity", 0.8)
      .attr("stroke-width", 3);

    svg.select(".goalText").remove();
    svg
      .append("text")
      .attr("class", "goalText")
      .attr("x", width / 2 + 50)
      .attr("y", yval - 2)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text(`Step Goal: ${props.stepsGoal}`);

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
      .text((d) => formatTime(new Date(d.timestamp)));
    timeLabels.exit().remove();

    const annotationSize = Math.min(18, barWidth / 3);
    const valueLabels = svg
      .selectAll(".valueLabel")
      .data(items, (d) => d.timestamp);
    function getAnnotationY(d) {
      let tempY = d.y + annotationSize;
      if (tempY > height - 2 * bottomMargin - annotationSize) {
        tempY = d.y - 1 - annotationSize / 2;
      }
      return tempY;
    }
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
      .text((d) => d.steps);
    valueLabels.exit().remove();
  }, [svg, props.stepsData, props.dateRange, colorScale]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "99%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
