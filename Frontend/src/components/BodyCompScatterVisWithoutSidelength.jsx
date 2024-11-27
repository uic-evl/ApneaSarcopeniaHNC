import { useEffect, useRef, useCallback } from "react";
import useSVGCanvas from "./useSVGCanvas";
import * as d3 from "d3";
import { filterDates } from "@src/utils";
import moment from "moment";

export default function BodyCompScatterVisWithoutSidelength(props) {
  const d3Container = useRef(null);
  const [svg, height, width, tTip] = useSVGCanvas(d3Container);

  const bottomTitleSize = 20;
  const sectionTitleSize = 20;
  const leftMargin = 4;
  const rightMargin = 4;
  const topMargin = sectionTitleSize;
  const bottomMargin = sectionTitleSize + bottomTitleSize;

  //default x scale, unless they go out-of-bounds
  const defaultLmiExtents = [10, 30];
  //default y scale, unless they go out-of-bounds
  const defaultFmiExtents = [1, 15];
  useEffect(() => {
    if (
      props.bodyCompData === null ||
      svg === undefined ||
      props.dateRange === undefined
    ) {
      return;
    }
    //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7542899/
    const lmiThreshold =
      props.gender === null
        ? 15.25
        : props.gender.toLowerCase() === "male"
        ? 16.7
        : 13.8;

    //https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2929934/
    const fmiThreshold =
      props.gender === null
        ? 8.1
        : props.gender.toLowerCase() === "male"
        ? 6.6
        : 9.5;

    const useFilter = props.useFilter ? props.useFilter : true;

    const lmiExtents = d3.extent(props.bodyCompData.map((d) => d.lmi));
    const fmiExtents = d3.extent(props.bodyCompData.map((d) => d.fmi));

    const viewHeight = height - topMargin - bottomMargin;
    const viewWidth = width - leftMargin - rightMargin;

    const xScale = d3
      .scaleLinear()
      .domain([
        Math.min(lmiExtents[0], defaultLmiExtents[0]),
        Math.max(lmiExtents[1], defaultLmiExtents[1]),
      ])
      .range([leftMargin, width - rightMargin]);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(fmiExtents[0], defaultFmiExtents[0]),
        Math.max(fmiExtents[1], defaultFmiExtents[1]),
      ])
      .range([height - bottomMargin, topMargin]);

    const badZoneWidth = xScale(lmiThreshold) - leftMargin;
    const badZoneHeight = yScale(fmiThreshold) - topMargin;

    const data = useFilter
      ? filterDates(
          props.bodyCompData,
          props.dateRange.start,
          props.dateRange.stop
        )
      : props.bodyCompData.map((d) => d);
    data.sort((a, b) => a.date - b.date);

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(data.map((d) => d.date)))
      .range(["pink", "black"]);

    var plotData = [];
    const windowSize = 3;
    data.forEach((d, i) => {
      const window = data.slice(
        Math.max(0, i - windowSize),
        Math.min(data.length - 1, i + windowSize)
      );
      const entry = {};
      for (const obj of window) {
        for (const [key, value] of Object.entries(obj)) {
          if (key === "formattedDate") {
            continue;
          }
          const currVal = entry[key] ? entry[key] : 0;
          entry[key] = currVal + value / window.length;
        }
      }
      plotData.push(entry);
    });

    plotData = plotData.filter(
      (d, i) => i === 0 || i === data.length - 1 || i % 7 === 0
    );
    const pathPoints = [];
    plotData.forEach((d) => {
      pathPoints.push([xScale(d.lmi), yScale(d.fmi)]);
    });

    const threshPoints = [
      // Horizontal line for FMI threshold
      [
        [leftMargin * 6.5, yScale(fmiThreshold)], // Start at the left margin
        [xScale.range()[1] / 1.01, yScale(fmiThreshold)], // End at the right edge of the chart
      ],
      // Vertical line for LMI threshold
      [
        [xScale(lmiThreshold), yScale.range()[0] / 1.03], // Start at the bottom of the chart
        [xScale(lmiThreshold), topMargin], // End at the top margin
      ],
    ];

    // console.log(threshPoints);

    svg.selectAll(".thresholdLine").remove();
    const threshLines = svg.selectAll(".thresholdLine").data(threshPoints);
    threshLines
      .enter()
      .append("path")
      .attr("class", "thresholdLine")
      .attr("d", d3.line())
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("strokeWidth", 10)
      .attr("stroke-dasharray", 4);

    // Add text for the thresholds
    const threshText = ["FMI (kg/m^2)", "LMI (kg/m^2)"];

    svg.selectAll(".threshText").remove();

    // Position for FMI text (on the left, rotated above the threshold line)
    svg
      .append("text")
      .attr("class", "threshText")
      .attr("x", badZoneHeight / 1.2) // Slightly offset to the left of the threshold line
      .attr("y", yScale(fmiThreshold) + 10) // Slightly above the threshold line
      .attr("font-size", 0.5 * sectionTitleSize)
      .text(threshText[0])
      .attr("text-anchor", "end") // Text anchor set to "end" for right-aligned text
      .attr(
        "transform",
        "rotate(-90, " +
          (leftMargin - 10) +
          ", " +
          (yScale(fmiThreshold) - 10) +
          ")"
      ); // Rotate around the text position

    // Position for LMI text (on the bottom, centered under the threshold line)
    svg
      .append("text")
      .attr("class", "threshText")
      .attr("x", xScale(lmiThreshold) - 5) // Position at the threshold line
      .attr("y", height / 1.13) // Adjust for the middle bottom of the chart
      .attr("font-size", 0.5 * sectionTitleSize)
      .text(threshText[1])
      .attr("text-anchor", "middle"); // Text anchor set to "middle" for centering the text

    // Add x-axis values for min and max LMI (numeric values)
    const xValues = [
      lmiThreshold - (xScale.domain()[1] - xScale.domain()[0]) / 4,
      lmiThreshold,
      lmiThreshold + (xScale.domain()[1] - xScale.domain()[0]) / 4,
    ].map((value) => ({ value }));

    svg.selectAll(".xAxisValue").remove();
    const xAxisValues = svg.selectAll(".xAxisValue").data(xValues);
    xAxisValues
      .enter()
      .append("text")
      .attr("class", "xAxisValue")
      .merge(xAxisValues)
      .attr("x", (d, i) => xScale(d.value) - i * 5)
      .attr("y", yScale(yScale.domain()[0]) + bottomMargin / 4)
      .attr("font-size", 0.5 * sectionTitleSize)
      .attr("text-anchor", "middle")
      .text((d) => d.value.toFixed(1)); // Only show the numeric value, formatted

    // Add y-axis values for min and max FMI (numeric values)
    const yValues = [
      fmiThreshold - (yScale.domain()[1] - yScale.domain()[0]) / 4,
      fmiThreshold,
      fmiThreshold + (yScale.domain()[1] - yScale.domain()[0]) / 4,
    ].map((value) => ({ value }));

    svg.selectAll(".yAxisValue").remove();
    const yAxisValues = svg.selectAll(".yAxisValue").data(yValues);
    yAxisValues
      .enter()
      .append("text")
      .attr("class", "yAxisValue")
      .merge(yAxisValues)
      .attr("x", xScale(xScale.domain()[0]) + leftMargin * 6) // Position near the y-axis line
      .attr("y", (d) => yScale(d.value) + 2) // Position based on FMI scale
      .attr("font-size", 0.5 * sectionTitleSize)
      .attr("text-anchor", "middle")
      .text((d) => d.value.toFixed(1)); // Only show the numeric value, formatted

    //make sarcopenia range red

    const pos = [];
    const increment = 0.5;
    var currpos = 0;
    while (currpos <= 1) {
      pos.push(currpos);
      currpos += increment;
    }

    //coloring the bad zones
    // svg.selectAll(".colorFill").remove();

    // svg
    //   .selectAll(".colorFill")
    //   .data(pos)
    //   .enter()
    //   .append("rect")
    //   .attr("class", "colorFill")
    //   .attr("x", leftMargin)
    //   .attr("y", topMargin)
    //   .attr("width", badZoneWidth)
    //   .attr("height", height - topMargin - bottomMargin)
    //   .attr("fill", "red")
    //   .attr("opacity", (g) => 0.1 * (1 - g ** 4));

    //draw a ling for the trajectory
    const dotSize = Math.max(4, Math.min(8, width / (10 * data.length)));
    svg.selectAll(".linePath").remove();
    svg
      .append("path")
      .attr("class", "linePath")
      .attr("d", d3.line()(pathPoints))
      .attr("fill", "none")
      .attr("stroke", "teal")
      .attr("stroke-width", dotSize / 4);

    //draw bmi for timepoints
    const points = svg.selectAll(".points").data(plotData, (d, i) => i);
    points
      .enter()
      .append("circle")
      .attr("class", "points")
      .merge(points)

      .attr("cx", (d) => xScale(d.lmi))
      .attr("cy", (d) => yScale(d.fmi))
      .attr("r", dotSize)
      .attr("fill", (d) => colorScale(d.date))
      .append("title")
      .text((d) => {
        // console.log(d);
        return `Date: ${moment(d.date).format("YYYY-MM-DD")}
        LMI: ${d.lmi.toFixed(2)}
        FMI: ${d.fmi.toFixed(2)}
        BMI: ${d.bmi.toFixed(2)}`;
      })
      .transition(100);
    points.exit().remove();
    points.raise();

    const annotationText = [
      {
        x: leftMargin + badZoneWidth / 2,
        y: topMargin + bottomMargin / 6,
        text: "Sarcopenic Obese",
        size: 0.7 * sectionTitleSize,
        length: badZoneWidth / 2,
      },
      {
        x: leftMargin + badZoneWidth / 2,
        y: yScale(fmiThreshold) + badZoneHeight * 0.9,
        text: "Low Lean Mass",
        size: 0.7 * sectionTitleSize,
        length: badZoneWidth / 4,
      },
      {
        x: xScale(lmiThreshold) + badZoneWidth / 2.5,
        y: yScale(fmiThreshold) + badZoneHeight * 0.9,
        text: "High Lean Mass",
        size: 0.7 * sectionTitleSize,
        length: badZoneWidth / 4,
      },
      {
        x: xScale(lmiThreshold) + badZoneWidth / 2.5,
        y: topMargin + bottomMargin / 6,
        text: "Obesity",
        size: 0.7 * sectionTitleSize,
        length: badZoneWidth / 6,
      },
      {
        x: width / 2,
        y: height - 5,
        text: "Lean Mass Index vs Fat Mass Index",
        size: 0.6 * bottomTitleSize,
        length: "",
      },
    ];
    const annotations = svg.selectAll(".anno").data(annotationText);
    annotations
      .enter()
      .append("text")
      .attr("class", "anno")
      .merge(annotations)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("font-size", (d) => d.size)
      .attr("text-anchor", "middle")
      .attr("textLength", (d) => d.length)
      .attr("lengthAdjust", "spacingAndGlyphs")
      .text((d) => d.text);
  }, [svg, props.bodyCompData, props.dateRange, props.useFilter, props.gender]);
  return (
    <div
      className={"d3-component"}
      style={{ height: "98%", width: "99%" }}
      ref={d3Container}
    ></div>
  );
}
