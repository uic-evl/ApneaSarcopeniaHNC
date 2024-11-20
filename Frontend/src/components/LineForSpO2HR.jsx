import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { dayInMs } from "../utils";
import { filterDates } from "../utils";

const variables = ["hr", "spo2"];
// const colorMap = {
//   rem: "#b3cde3",
//   light: "#8c96c6",
//   deep: "#88419d",
//   wake: "#fdbe85",
// };

const colorMap = {
  rem: "#b3cde3",
  light: "#8c96c6",
  deep: "#88419d",
  wake: "#ff4500",
};
const orderedSleepLevels = ["deep", "light", "rem", "wake"];

// Convert "HH:MM:SS" to total seconds from midnight
const timeToSeconds = (timeStr) => {
  if (timeStr === undefined) {
    return 0;
  }
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const secondsToTimeString = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function LineForSpO2HR({
  sleepData,
  dateRange,
  hrData,
  spo2Data,
  detailsDate,
  spo2MinuteData,
  hrMinuteData,
  timeDomain,
}) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 40;
  const rightMargin = 40;
  const topMargin = 10;
  const bottomMargin = 30;

  //   console.log("time domain", timeDomain);
  // console.log(minuteData);

  useEffect(() => {
    if (
      sleepData === null ||
      sleepData === undefined ||
      svg === undefined ||
      dateRange === undefined ||
      detailsDate === undefined ||
      hrData === undefined ||
      spo2Data === undefined ||
      spo2MinuteData === undefined ||
      hrMinuteData === undefined ||
      timeDomain === undefined
    ) {
      const undefinedVariables = [];

      if (sleepData === null || sleepData === undefined)
        undefinedVariables.push("sleepData");
      if (svg === undefined) undefinedVariables.push("svg");
      if (dateRange === undefined) undefinedVariables.push("dateRange");
      if (detailsDate === undefined) undefinedVariables.push("detailsDate");
      if (hrData === undefined) undefinedVariables.push("hrData");
      if (spo2Data === undefined) undefinedVariables.push("spo2Data");
      if (spo2MinuteData === undefined)
        undefinedVariables.push("spo2MinuteData");
      if (hrMinuteData === undefined) undefinedVariables.push("hrMinuteData");
      if (timeDomain === undefined) undefinedVariables.push("timeDomain");

      console.log(
        "The following variables are undefined or null:",
        undefinedVariables.join(", ")
      );

      svg?.select(".x-axis-minute").remove();
      svg?.select(".y-axis-minute").remove();
      svg?.select(".y-axis-right").remove();
      svg?.selectAll(".line-minute").remove();
      svg?.selectAll(".avg-line").remove();
      svg?.selectAll(".avg-label").remove();
      svg?.selectAll(".line-point").remove();
      svg?.selectAll(".sleep-rect").remove();
      svg?.selectAll(".axis-label").remove();
      svg?.selectAll("lineGradients").remove();
      svg?.selectAll(".wake-rect").remove();

      return;
    }

    // console.log("got the data");
    // console.log(minuteData);
    const viewWidth = width - leftMargin - rightMargin;
    const viewHeight = height - topMargin - bottomMargin;

    const spoDomain = [70, 100];
    const hrDomain = [30, 160];
    // console.log("time min", timeMin, "time max", timeMax);
    // console.log(timeDomain);
    // console.log(valMax, valMin);

    const xScale = d3
      .scaleTime()
      .domain([timeToSeconds(timeDomain[0]), timeToSeconds(timeDomain[1])])
      .range([0, viewWidth]);

    const spoScale = d3.scaleLinear().domain(spoDomain).range([viewHeight, 0]);
    const hrScale = d3.scaleLinear().domain(hrDomain).range([viewHeight, 0]);

    const axisBottom = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => {
        return secondsToTimeString(d);
      });
    const axisLeft = d3.axisLeft(spoScale).ticks(5);

    const axisRight = d3.axisRight(hrScale).ticks(5);

    svg.selectAll(".line-for-spo2-hr").remove();
    const vis = svg
      .append("g")
      .attr("class", "line-for-spo2-hr")
      .attr("transform", `translate(${leftMargin},${topMargin})`);

    svg.select(".x-axis-minute").remove();
    vis
      .append("g")
      .attr("class", "x-axis-minute")
      .attr("transform", "translate(0," + viewHeight + ")")
      .call(axisBottom);

    svg.select(".y-axis-minute").remove();
    vis.append("g").attr("class", "y-axis-minute").call(axisLeft);

    svg.select(".y-axis-right").remove();
    vis
      .append("g")
      .attr("class", "y-axis-right")
      .attr("transform", `translate(${viewWidth},0)`)
      .call(axisRight);

    // console.log(sleepData);
    // add background rectanlge based on sleep data level
    const filteredSleepData = sleepData[0]?.levels.data.filter(
      (d) =>
        timeToSeconds(d.time) >= timeToSeconds(timeDomain[0]) &&
        timeToSeconds(d.time) + d.seconds <= timeToSeconds(timeDomain[1])
    );

    const filteredAwakeSleepData = sleepData[0]?.levels.shortData
      .filter(
        (d) =>
          timeToSeconds(new Date(d.dateTime).toTimeString().split(" ")[0]) >=
            timeToSeconds(timeDomain[0]) &&
          timeToSeconds(new Date(d.dateTime).toTimeString().split(" ")[0]) +
            d.seconds <=
            timeToSeconds(timeDomain[1])
      )
      .map((d) => {
        const timeString = new Date(d.dateTime).toTimeString().split(" ")[0];
        const timestamp = timeToSeconds(timeString);
        return {
          time: timeString,
          seconds: d.seconds,
          timestamp: timestamp,
          level: "wake",
        };
      });

    // console.log(filteredAwakeSleepData);

    // console.log(filteredSleepData);
    if (filteredSleepData === undefined || filteredSleepData?.length === 0)
      return;

    const firstIndex = sleepData[0]?.levels.data.findIndex(
      (d) => d.time === filteredSleepData[0].time
    );

    const lastIndex = sleepData[0]?.levels.data.findIndex(
      (d) => d.time === filteredSleepData[filteredSleepData.length - 1].time
    );

    // add the first time from timeDomain and its level fro the sleep data
    filteredSleepData?.push({
      time: timeDomain[0],
      level: sleepData[0].levels.data[firstIndex - 1]?.level,
      seconds:
        timeToSeconds(sleepData[0].levels.data[firstIndex].time) -
        timeToSeconds(timeDomain[0]),
    });
    // console.log(lastIndex);
    // console.log(sleepData[0].levels.data[lastIndex + 1]);
    // console.log(timeDomain[1]);

    // add the last time from timeDomain and its level fro the sleep data
    filteredSleepData?.push({
      time: sleepData[0].levels.data[lastIndex + 1]?.time,
      level: sleepData[0].levels.data[lastIndex + 1]?.level,
      seconds:
        timeToSeconds(timeDomain[1]) -
        timeToSeconds(sleepData[0].levels.data[lastIndex + 1]?.time),
    });

    // console.log(filteredSleepData);

    svg.selectAll(".sleep-rect").remove();

    const bars = vis.selectAll(".sleep-rect").data(filteredSleepData);

    bars
      .enter()
      .append("rect")
      .attr("class", "sleep-rect")
      .attr("x", (d) => xScale(timeToSeconds(d.time)))
      .attr("y", 0)
      .attr("width", (d) => {
        // Calculate width by finding the end time and subtracting the start time
        return (
          xScale(timeToSeconds(d.time) + d.seconds) -
          xScale(timeToSeconds(d.time))
        );
      })
      .attr("height", viewHeight)
      .attr("fill", (d) => colorMap[d.level])
      .attr("opacity", 0.3)
      //title
      .append("title")
      .text(
        (d) => `Level: ${d.level}
        Start: ${d.time}
        End: ${secondsToTimeString(timeToSeconds(d.time) + d.seconds)}`
      );

    bars.exit().remove();

    svg.selectAll(".wake-rect").remove();

    const wakeBars = vis.selectAll(".wake-rect").data(filteredAwakeSleepData);

    wakeBars
      .enter()
      .append("rect")
      .attr("class", "wake-rect")
      .attr("x", (d) => xScale(timeToSeconds(d.time)))
      .attr("y", 2.5)
      .attr("width", (d) => {
        // Calculate width by finding the end time and subtracting the start time
        return (
          xScale(timeToSeconds(d.time) + d.seconds) -
          xScale(timeToSeconds(d.time))
        );
      })
      .attr("height", viewHeight - 5)
      .attr("fill", "grey") //(d) => colorMap[d.level])
      .attr("opacity", 0.8)
      //title
      .append("title")
      .text(
        (d) => `Level: Briefly Awake
        Start: ${d.time}
        End: ${secondsToTimeString(timeToSeconds(d.time) + d.seconds)}`
      );

    wakeBars.exit().remove();

    svg.selectAll(".avg-line").remove();
    svg.selectAll(".avg-label").remove();
    // if hr data draw a line based on resting heart rate
    const avg = [hrData[0]?.number, spo2Data[0]?.value.avg];

    vis
      .selectAll("avg-line")
      .data(avg)
      .enter()
      .append("line")
      .attr("class", "avg-line")
      .attr("x1", 0)
      .attr("x2", viewWidth)
      .attr("y1", (d, i) => (i === 0 ? hrScale(d) : spoScale(d)))
      .attr("y2", (d, i) => (i === 0 ? hrScale(d) : spoScale(d)))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    vis
      .selectAll("avg-label")
      .data(avg)
      .enter()
      .append("text")
      .attr("class", "avg-label")
      .attr("x", viewWidth - 100)
      .attr("y", (d, i) => (i === 0 ? hrScale(d) - 5 : spoScale(d) - 5))
      .text((d, i) => `${i === 0 ? "AVG HR" : "AVG SpO2"}: ${d}`)
      .attr("fill", "black")
      .attr("font-size", "12px");

    svg.selectAll(".line-minute").remove();
    svg.selectAll(".axis-label").remove();

    //add a text near axisleft
    vis
      .append("text")
      .attr("class", "axis-label")
      .attr("x", 0)
      .attr("y", 0)
      .text("SpO2");
    vis
      .append("text")
      .attr("class", "axis-label")
      .attr("x", viewWidth - 20)
      .attr("y", 0)
      .text("HR");

    // Filter the data based on the time domain
    const spoFilteredData = spo2MinuteData.filter(
      (d) =>
        timeToSeconds(d.time) >= timeToSeconds(timeDomain[0]) &&
        timeToSeconds(d.time) <= timeToSeconds(timeDomain[1])
    );
    // console.log(spoFilteredData);

    svg.selectAll("lineGradients").remove();
    // Create the gradient with dynamic offset
    const colorId = `gradient-${Math.random().toString(36).substring(2, 15)}`;
    const gradient = vis
      .append("defs")
      .attr("class", "lineGradients")
      .append("linearGradient")
      .attr("id", colorId)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("x2", viewWidth);

    // Map each data point to a gradient stop
    gradient
      .selectAll("stop")
      .data(spoFilteredData)
      .join("stop")
      .attr("offset", (d) => xScale(timeToSeconds(d.time)) / viewWidth) // Directly use normalized offset from 0 to 1
      .attr("stop-color", (d) => (d.value < 91 ? "red" : "blue"));

    // Create the line path
    vis
      .append("path")
      .datum(spoFilteredData)
      .attr("class", "line-minute")
      .attr("fill", "none")
      .attr("stroke", `url(#${colorId})`)
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(timeToSeconds(d.time)))
          .y((d) => spoScale(d.value))
      );

    // Filter the data based on the time domain
    const hrFilteredData = hrMinuteData.filter(
      (d) =>
        timeToSeconds(d.time) >= timeToSeconds(timeDomain[0]) &&
        timeToSeconds(d.time) <= timeToSeconds(timeDomain[1])
    );

    // Create the line path
    vis
      .append("path")
      .datum(hrFilteredData)
      .attr("class", "line-minute")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(timeToSeconds(d.time)))
          .y((d) => hrScale(d.value))
      );
  }, [
    svg,
    sleepData,
    dateRange,
    detailsDate,
    hrData,
    spo2Data,
    spo2MinuteData,
    hrMinuteData,
  ]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "90%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
