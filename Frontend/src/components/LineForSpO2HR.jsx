import { useEffect, useRef, useMemo } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { dayInMs } from "../utils";
import { filterDates } from "../utils";

const colorMap = {
  rem: "#b3cde3",
  light: "#8c96c6",
  deep: "#88419d",
  wake: "#fdbe85",
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
  minuteData,
  hrSpo2Var,
  timeDomain,
}) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const leftMargin = 40;
  const rightMargin = 10;
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
      hrData === undefined || //hrData === null || hrData.length < 1 ||
      spo2Data === undefined || //spo2Data === null || spo2Data.length < 1 ||
      minuteData === undefined ||
      timeDomain === undefined
    ) {
      console.log("something is undefined");
      svg?.select(".x-axis-minute").remove();
      svg?.select(".y-axis-minute").remove();
      svg?.selectAll(".line-minute").remove();
      svg?.selectAll(".avg-line").remove();
      svg?.selectAll(".avg-label").remove();
      svg?.selectAll(".line-point").remove();
      svg?.selectAll(".sleep-rect").remove();

      return;
    }

    // console.log("got the data");
    // console.log(minuteData);
    const viewWidth = width - leftMargin - rightMargin;
    const viewHeight = height - topMargin - bottomMargin;

    const [valMin, valMax] = hrSpo2Var === "HR" ? [30, 150] : [70, 100];
    // console.log("time min", timeMin, "time max", timeMax);
    // console.log(timeDomain);
    // console.log(valMax, valMin);

    const xScale = d3
      .scaleTime()
      .domain([timeToSeconds(timeDomain[0]), timeToSeconds(timeDomain[1])])
      .range([0, viewWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([valMin, valMax])
      .range([viewHeight, 0]);

    const axisBottom = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => {
        return secondsToTimeString(d);
      });
    const axisLeft = d3.axisLeft(yScale).ticks(5);

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

    // add background rectanlge based on sleep data level
    const filteredSleepData = sleepData[0].levels.data.filter(
      (d) =>
        timeToSeconds(d.time) >= timeToSeconds(timeDomain[0]) &&
        timeToSeconds(d.time) + d.seconds <= timeToSeconds(timeDomain[1])
    );

    // console.log(filteredSleepData);
    if (filteredSleepData.length === 0) return;

    const firstIndex = sleepData[0].levels.data.findIndex(
      (d) => d.time === filteredSleepData[0].time
    );

    const lastIndex = sleepData[0].levels.data.findIndex(
      (d) => d.time === filteredSleepData[filteredSleepData.length - 1].time
    );

    // add the first time from timeDomain and its level fro the sleep data
    filteredSleepData.push({
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
    filteredSleepData.push({
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

    svg.selectAll(".avg-line").remove();
    svg.selectAll(".avg-label").remove();
    // if hr data draw a line based on resting heart rate
    const avg = hrSpo2Var === "HR" ? hrData[0]?.number : spo2Data[0]?.value.avg;
    vis
      .append("line")
      .attr("class", "avg-line")
      .attr("x1", 0)
      .attr("x2", viewWidth)
      .attr("y1", yScale(avg))
      .attr("y2", yScale(avg))
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    vis
      .append("text")
      .attr("class", "avg-label")
      .attr("x", viewWidth - 80)
      .attr("y", yScale(avg) - 5)
      .text(`Avg ${hrSpo2Var} ${avg}`)
      .attr("fill", "red")
      .attr("font-size", "12px");

    svg.selectAll(".line-minute").remove();
    svg.selectAll(".line-point").remove();

    // Filter the data based on the time domain
    const filteredData = minuteData.filter(
      (d) =>
        timeToSeconds(d.time) >= timeToSeconds(timeDomain[0]) &&
        timeToSeconds(d.time) <= timeToSeconds(timeDomain[1])
    );

    // Create the line path
    vis
      .append("path")
      .datum(filteredData)
      .attr("class", "line-minute")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(timeToSeconds(d.time)))
          .y((d) => yScale(d.value))
      );
  }, [svg, sleepData, dateRange, detailsDate, hrData, spo2Data, minuteData]);

  return (
    <div
      className={"d3-component"}
      style={{ height: "90%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
